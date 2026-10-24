const { pool } = require('../config/db');

const map = (r) => r && ({ employeeId: Number(r.employee_id), fullName: r.full_name, role: r.role, centerId: Number(r.center_id) });

async function findById(employeeId, db = pool) {
  const { rows } = await db.query(
    'SELECT employee_id, full_name, role, center_id FROM employee WHERE employee_id = $1', [employeeId]);
  return map(rows[0]) || null;
}

// Dung cho dang nhap: tra them passwordHash (chi service dang nhap duoc dung).
async function findByUsername(username, db = pool) {
  const { rows } = await db.query(
    `SELECT employee_id, full_name, role, center_id, password_hash
       FROM employee WHERE username = $1`, [username]);
  const r = rows[0];
  return r ? { ...map(r), passwordHash: r.password_hash } : null;
}

async function setPasswordHashIfEmpty(employeeId, passwordHash, db = pool) {
  await db.query(
    'UPDATE employee SET password_hash = $2 WHERE employee_id = $1 AND password_hash IS NULL',
    [employeeId, passwordHash]);
}

async function listWithoutPassword(db = pool) {
  const { rows } = await db.query(
    'SELECT employee_id FROM employee WHERE username IS NOT NULL AND password_hash IS NULL');
  return rows.map((r) => Number(r.employee_id));
}

module.exports = { findById, findByUsername, setPasswordHashIfEmpty, listWithoutPassword };
