const { pool } = require('../config/db');

async function findById(ticketId, db = pool) {
  const { rows } = await db.query(
    `SELECT tk.ticket_id, tk.ticket_code, tk.center_id, tk.status, tk.technician_id, e.full_name AS technician_name
       FROM ticket tk
       LEFT JOIN technician t ON t.technician_id = tk.technician_id
       LEFT JOIN employee e ON e.employee_id = t.employee_id
      WHERE tk.ticket_id = $1`, [ticketId]);
  const r = rows[0];
  return r ? {
    ticketId: Number(r.ticket_id),
    ticketCode: r.ticket_code,
    centerId: Number(r.center_id),
    status: r.status,
    technicianId: r.technician_id === null ? null : Number(r.technician_id),
    technicianName: r.technician_name,
  } : null;
}

module.exports = { findById };
