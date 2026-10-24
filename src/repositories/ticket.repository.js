// Chi doc/ghi bang ticket (va cac bang noi de hien thi). KHONG chua quy tac nghiep vu.
const { pool } = require('../config/db');

const SELECT_VIEW = `
  SELECT tk.ticket_id, tk.ticket_code, tk.center_id, tk.status, tk.priority, tk.received_at, tk.due_date,
         tk.category_id, ic.category_name, tk.technician_id, te.full_name AS technician_name,
         c.full_name AS customer_name, c.phone AS customer_phone, d.model_name AS device_name
    FROM ticket tk
    JOIN customer c ON c.customer_id = tk.customer_id
    JOIN device d ON d.device_id = tk.device_id
    LEFT JOIN issue_category ic ON ic.category_id = tk.category_id
    LEFT JOIN technician t ON t.technician_id = tk.technician_id
    LEFT JOIN employee te ON te.employee_id = t.employee_id`;

const map = (r) => r && ({
  ticketId: Number(r.ticket_id),
  ticketCode: r.ticket_code,
  centerId: Number(r.center_id),
  status: r.status,
  priority: r.priority,
  receivedAt: r.received_at,
  dueDate: r.due_date,
  categoryId: r.category_id === null ? null : Number(r.category_id),
  categoryName: r.category_name,
  technicianId: r.technician_id === null ? null : Number(r.technician_id),
  technicianName: r.technician_name,
  customerName: r.customer_name,
  customerPhone: r.customer_phone,
  deviceName: r.device_name,
});

async function findById(ticketId, db = pool) {
  const { rows } = await db.query(`${SELECT_VIEW} WHERE tk.ticket_id = $1`, [ticketId]);
  return map(rows[0]) || null;
}

// Khoa dong phieu cho den het transaction: hai lenh phan cong cung luc se xep hang (NFR3).
// Tra ve ban doc SAU khi da co khoa, nen trang thai doc duoc la trang thai moi nhat.
async function findByIdForUpdate(ticketId, db) {
  await db.query('SELECT ticket_id FROM ticket WHERE ticket_id = $1 FOR UPDATE', [ticketId]);
  return findById(ticketId, db);
}

// Phieu cua trung tam theo trang thai, sap theo han cam ket tang dan (FR1).
async function listByCenterAndStatus(centerId, status, { limit, offset }, db = pool) {
  const { rows } = await db.query(
    `${SELECT_VIEW} WHERE tk.center_id = $1 AND tk.status = $2
      ORDER BY tk.due_date ASC, tk.ticket_id ASC LIMIT $3 OFFSET $4`,
    [centerId, status, limit, offset]);
  const total = await db.query(
    'SELECT COUNT(*)::int AS n FROM ticket WHERE center_id = $1 AND status = $2', [centerId, status]);
  return { items: rows.map(map), total: total.rows[0].n };
}

// Phieu dang gan cho mot ky thuat vien (E5).
async function listByTechnician(technicianId, statuses, db = pool) {
  const { rows } = await db.query(
    `${SELECT_VIEW} WHERE tk.technician_id = $1 AND tk.status = ANY($2::text[])
      ORDER BY tk.due_date ASC, tk.ticket_id ASC`, [technicianId, statuses]);
  return rows.map(map);
}

// UPDATE co dieu kien trang thai: 0 dong nghia la co nguoi khac vua doi phieu (tuyen phong thu thu hai).
async function assign(ticketId, technicianId, db) {
  const r = await db.query(
    `UPDATE ticket SET technician_id = $2, status = 'DA_PHAN_CONG'
      WHERE ticket_id = $1 AND status = 'MOI'`, [ticketId, technicianId]);
  return r.rowCount === 1;
}

async function reassign(ticketId, technicianId, db) {
  const r = await db.query(
    `UPDATE ticket SET technician_id = $2
      WHERE ticket_id = $1 AND status = 'DA_PHAN_CONG'`, [ticketId, technicianId]);
  return r.rowCount === 1;
}

module.exports = { findById, findByIdForUpdate, listByCenterAndStatus, listByTechnician, assign, reassign };
