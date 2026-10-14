// Chi doc/ghi bang appointment. Viec "co trung lich khong" do service quyet dinh.
const { pool } = require('../config/db');

const SELECT = `
  SELECT a.appointment_id, a.ticket_id, tk.ticket_code, tk.center_id, a.technician_id,
         te.full_name AS technician_name, a.type, a.start_at, a.end_at, a.note,
         ce.full_name AS created_by_name, a.created_at, a.cancelled_at
    FROM appointment a
    JOIN ticket tk ON tk.ticket_id = a.ticket_id
    JOIN technician t ON t.technician_id = a.technician_id
    JOIN employee te ON te.employee_id = t.employee_id
    JOIN employee ce ON ce.employee_id = a.created_by`;

const map = (r) => r && ({
  appointmentId: Number(r.appointment_id),
  ticketId: Number(r.ticket_id),
  ticketCode: r.ticket_code,
  centerId: Number(r.center_id),
  technicianId: Number(r.technician_id),
  technicianName: r.technician_name,
  type: r.type,
  startAt: r.start_at,
  endAt: r.end_at,
  note: r.note,
  createdBy: r.created_by_name,
  cancelledAt: r.cancelled_at,
});

async function findById(appointmentId, db = pool) {
  const { rows } = await db.query(`${SELECT} WHERE a.appointment_id = $1`, [appointmentId]);
  return map(rows[0]) || null;
}

async function listByTicket(ticketId, db = pool) {
  const { rows } = await db.query(`${SELECT} WHERE a.ticket_id = $1 ORDER BY a.start_at`, [ticketId]);
  return rows.map(map);
}

// Lich hen CHUA HUY cua ky thuat vien bat dau trong khoang [from, to).
async function listActiveByTechnicianBetween(technicianId, from, to, db = pool) {
  const { rows } = await db.query(
    `${SELECT} WHERE a.technician_id = $1 AND a.cancelled_at IS NULL
        AND a.start_at >= $2 AND a.start_at < $3 ORDER BY a.start_at`,
    [technicianId, from, to]);
  return rows.map(map);
}

async function create(data, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO appointment (ticket_id, technician_id, type, start_at, end_at, note, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING appointment_id`,
    [data.ticketId, data.technicianId, data.type, data.startAt, data.endAt, data.note, data.createdBy]);
  return Number(rows[0].appointment_id);
}

async function update(appointmentId, data, db = pool) {
  await db.query(
    'UPDATE appointment SET type = $2, start_at = $3, end_at = $4, note = $5 WHERE appointment_id = $1',
    [appointmentId, data.type, data.startAt, data.endAt, data.note]);
}

// QT-13: khong xoa vat ly, chi danh dau huy.
async function cancel(appointmentId, at, db = pool) {
  await db.query('UPDATE appointment SET cancelled_at = $2 WHERE appointment_id = $1', [appointmentId, at]);
}

module.exports = { findById, listByTicket, listActiveByTechnicianBetween, create, update, cancel };
