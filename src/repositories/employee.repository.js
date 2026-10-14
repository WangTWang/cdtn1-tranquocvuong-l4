const { pool } = require('../config/db');

const map = (r) => r && ({ employeeId: Number(r.employee_id), fullName: r.full_name, role: r.role, centerId: Number(r.center_id) });

async function findById(employeeId, db = pool) {
  const { rows } = await db.query(
    'SELECT employee_id, full_name, role, center_id FROM employee WHERE employee_id = $1', [employeeId]);
  return map(rows[0]) || null;
}

module.exports = { findById };
