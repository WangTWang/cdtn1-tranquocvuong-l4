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

// Dieu kien loc: q khop mot phan ma phieu hoac ten khach (khong phan biet hoa thuong, khong phan biet dau - ham
// khong_dau o migration 003), priority dung bang.
// Ky tu % va _ cua nguoi dung duoc thoat de tim dung chu, khong thanh ky tu dai dien cua LIKE.
const FILTER = `($3::text IS NULL OR tk.ticket_code ILIKE $3 ESCAPE '\\' OR khong_dau(c.full_name) LIKE khong_dau($3) ESCAPE '\\')
               AND ($4::text IS NULL OR tk.priority = $4)`;
const likePattern = (q) => (q ? `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%` : null);

// Phieu cua trung tam theo trang thai (va bo loc), sap theo han cam ket tang dan (FR1).
// Tra kem: total (khop bo loc), totalAll (cung trang thai, KHONG loc) de giao dien phan biet
// "chua co du lieu" voi "bo loc khong ra ket qua", va overdue (so phieu qua han trong ket qua loc).
async function listByCenterAndStatus(centerId, status, { limit, offset, q = null, priority = null }, db = pool) {
  const params = [centerId, status, likePattern(q), priority];
  const { rows } = await db.query(
    `${SELECT_VIEW} WHERE tk.center_id = $1 AND tk.status = $2 AND ${FILTER}
      ORDER BY tk.due_date ASC, tk.ticket_id ASC LIMIT $5 OFFSET $6`,
    [...params, limit, offset]);
  const counts = await db.query(
    `SELECT COUNT(*) FILTER (WHERE ${FILTER})::int AS total,
            COUNT(*)::int AS total_all,
            COUNT(*) FILTER (WHERE ${FILTER} AND tk.due_date < now())::int AS overdue
       FROM ticket tk JOIN customer c ON c.customer_id = tk.customer_id
      WHERE tk.center_id = $1 AND tk.status = $2`, params);
  const n = counts.rows[0];
  return { items: rows.map(map), total: n.total, totalAll: n.total_all, overdue: n.overdue };
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
