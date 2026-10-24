// Ghi lich su: chuyen trang thai (QT-06) va doi/gan ky thuat vien (QT-07). Chi INSERT.
const { pool } = require('../config/db');

async function addStatusLog({ ticketId, fromStatus, toStatus, changedBy, note = null }, db = pool) {
  await db.query(
    `INSERT INTO ticket_status_log (ticket_id, from_status, to_status, changed_by, note)
     VALUES ($1, $2, $3, $4, $5)`, [ticketId, fromStatus, toStatus, changedBy, note]);
}

async function addAssignmentLog({ ticketId, fromTechnicianId, toTechnicianId, reason, changedBy }, db = pool) {
  await db.query(
    `INSERT INTO ticket_assignment_log (ticket_id, from_technician_id, to_technician_id, reason, changed_by)
     VALUES ($1, $2, $3, $4, $5)`, [ticketId, fromTechnicianId, toTechnicianId, reason, changedBy]);
}

module.exports = { addStatusLog, addAssignmentLog };
