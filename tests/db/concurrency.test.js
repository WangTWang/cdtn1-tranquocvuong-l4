// Test NFR3 tren PostgreSQL THAT (chay bang: npm run test:db). Khong nam trong `npm test` vi can CSDL.
// Moi test tu tao phieu rieng (ma TEST-...) va don dep sau khi chay, khong dung phieu mau.
require('dotenv').config({ quiet: true });
const { pool, withTransaction } = require('../../src/config/db');
const ticketRepo = require('../../src/repositories/ticket.repository');
const technicianRepo = require('../../src/repositories/technician.repository');
const appointmentRepo = require('../../src/repositories/appointment.repository');
const logRepo = require('../../src/repositories/log.repository');
const { createAssignmentService } = require('../../src/services/assignment.service');
const { createAppointmentService } = require('../../src/services/appointment.service');

const assignment = createAssignmentService({ ticketRepo, technicianRepo, logRepo, withTransaction });
const appointments = createAppointmentService({ ticketRepo, appointmentRepo, technicianRepo, withTransaction });
const QUAN_LY = { employeeId: 1, role: 'QUAN_LY', centerId: 1 };
const TIEP_NHAN = { employeeId: 2, role: 'TIEP_NHAN', centerId: 1 };
const created = [];

async function newTicket(status = 'MOI', technicianId = null) {
  const code = `TEST-${Date.now()}-${created.length}`;
  const { rows } = await pool.query(
    `INSERT INTO ticket (ticket_code, customer_id, device_id, center_id, category_id, technician_id, priority, status, due_date)
     VALUES ($1, 1, 1, 1, 1, $2, 'CAO', $3, now() + interval '1 day') RETURNING ticket_id`, [code, technicianId, status]);
  created.push(Number(rows[0].ticket_id));
  return Number(rows[0].ticket_id);
}

afterAll(async () => {
  for (const id of created) {
    await pool.query('DELETE FROM appointment WHERE ticket_id = $1', [id]);
    await pool.query('DELETE FROM ticket_assignment_log WHERE ticket_id = $1', [id]);
    await pool.query('DELETE FROM ticket_status_log WHERE ticket_id = $1', [id]);
    await pool.query('DELETE FROM ticket WHERE ticket_id = $1', [id]);
  }
  await pool.end();
});

test('TC-40 (NFR3): hai quản lý phân công CÙNG một phiếu cho hai kỹ thuật viên khác nhau cùng lúc – đúng 1 lệnh thành công', async () => {
  const ticketId = await newTicket();
  const results = await Promise.allSettled([
    assignment.assignTicket(ticketId, 1, QUAN_LY),
    assignment.assignTicket(ticketId, 2, QUAN_LY),
  ]);
  const won = results.filter((r) => r.status === 'fulfilled');
  const lost = results.filter((r) => r.status === 'rejected');
  expect(won).toHaveLength(1);
  expect(lost).toHaveLength(1);
  expect(lost[0].reason.code).toBe('TICKET_ALREADY_ASSIGNED');
  // Phiếu có đúng MỘT kỹ thuật viên và đúng MỘT dòng lịch sử mỗi loại.
  const t = await ticketRepo.findById(ticketId);
  expect(t.status).toBe('DA_PHAN_CONG');
  expect(t.technicianId).toBe(won[0].value.technician.technicianId);
  const logs = await pool.query('SELECT COUNT(*)::int AS n FROM ticket_assignment_log WHERE ticket_id = $1', [ticketId]);
  const statuses = await pool.query('SELECT COUNT(*)::int AS n FROM ticket_status_log WHERE ticket_id = $1', [ticketId]);
  expect(logs.rows[0].n).toBe(1);
  expect(statuses.rows[0].n).toBe(1);
});

test('TC-41 (NFR3): 5 lệnh phân công đồng thời cho một phiếu – vẫn đúng 1 thành công', async () => {
  const ticketId = await newTicket();
  const results = await Promise.allSettled([1, 2, 3, 1, 2].map((techId) => assignment.assignTicket(ticketId, techId, QUAN_LY)));
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
});

test('TC-42 (RB-02): hai lịch hẹn CHỒNG LẤN đặt cùng lúc cho một kỹ thuật viên – đúng 1 lệnh thành công', async () => {
  const a = await newTicket('DA_PHAN_CONG', 3);
  const b = await newTicket('DA_PHAN_CONG', 3);
  const day = '2030-03-12';                                    // thứ Ba, tương lai xa nên không bị coi là quá khứ
  const slot = (start, end) => ({ type: 'GIAO', startAt: new Date(`${day}T${start}+07:00`), endAt: new Date(`${day}T${end}+07:00`), note: null });
  const results = await Promise.allSettled([
    appointments.createAppointment(a, slot('14:00:00', '14:45:00'), TIEP_NHAN),
    appointments.createAppointment(b, slot('14:30:00', '15:00:00'), TIEP_NHAN),
  ]);
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  expect(results.find((r) => r.status === 'rejected').reason.code).toBe('APPOINTMENT_CONFLICT');
});

test('TC-43 (RB-02, biên): hai lịch hẹn nối tiếp nhau (14:45 kết thúc, 14:45 bắt đầu) đặt cùng lúc – cả hai thành công', async () => {
  const a = await newTicket('DA_PHAN_CONG', 3);
  const b = await newTicket('DA_PHAN_CONG', 3);
  const day = '2030-03-13';
  const slot = (start, end) => ({ type: 'NHAN', startAt: new Date(`${day}T${start}+07:00`), endAt: new Date(`${day}T${end}+07:00`), note: null });
  const results = await Promise.allSettled([
    appointments.createAppointment(a, slot('14:00:00', '14:45:00'), TIEP_NHAN),
    appointments.createAppointment(b, slot('14:45:00', '15:30:00'), TIEP_NHAN),
  ]);
  expect(results.map((r) => r.status)).toEqual(['fulfilled', 'fulfilled']);
});
