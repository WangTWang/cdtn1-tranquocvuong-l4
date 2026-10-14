// Chi doc/ghi bang technician, technician_skill. KHONG chua quy tac nghiep vu.
const { pool } = require('../config/db');

const SELECT = `
  SELECT t.technician_id, t.employee_id, t.center_id, t.level, t.is_active,
         e.full_name, c.center_name
    FROM technician t
    JOIN employee e ON e.employee_id = t.employee_id
    JOIN service_center c ON c.center_id = t.center_id`;

const map = (r) => r && ({
  technicianId: Number(r.technician_id),
  employeeId: Number(r.employee_id),
  fullName: r.full_name,
  centerId: Number(r.center_id),
  centerName: r.center_name,
  level: r.level,
  isActive: r.is_active,
});

async function findById(technicianId, db = pool) {
  const { rows } = await db.query(`${SELECT} WHERE t.technician_id = $1`, [technicianId]);
  return map(rows[0]) || null;
}

async function findByEmployeeId(employeeId, db = pool) {
  const { rows } = await db.query(`${SELECT} WHERE t.employee_id = $1`, [employeeId]);
  return map(rows[0]) || null;
}

async function listByCenter(centerId, includeInactive = false, db = pool) {
  const { rows } = await db.query(
    `${SELECT} WHERE t.center_id = $1 AND ($2::boolean OR t.is_active) ORDER BY e.full_name`,
    [centerId, includeInactive]);
  return rows.map(map);
}

async function create({ employeeId, centerId, level }, db = pool) {
  const { rows } = await db.query(
    'INSERT INTO technician (employee_id, center_id, level) VALUES ($1, $2, $3) RETURNING technician_id',
    [employeeId, centerId, level]);
  return Number(rows[0].technician_id);
}

async function update(technicianId, { level, isActive }, db = pool) {
  await db.query(
    `UPDATE technician SET level = COALESCE($2, level), is_active = COALESCE($3, is_active)
      WHERE technician_id = $1`,
    [technicianId, level ?? null, isActive ?? null]);
}

async function findSkills(technicianId, db = pool) {
  const { rows } = await db.query(
    `SELECT s.category_id, c.category_name, s.proficiency
       FROM technician_skill s JOIN issue_category c ON c.category_id = s.category_id
      WHERE s.technician_id = $1 ORDER BY s.category_id`, [technicianId]);
  return rows.map((r) => ({ categoryId: r.category_id, categoryName: r.category_name, proficiency: r.proficiency }));
}

async function replaceSkills(technicianId, skills, db = pool) {
  await db.query('DELETE FROM technician_skill WHERE technician_id = $1', [technicianId]);
  for (const s of skills) {
    await db.query(
      'INSERT INTO technician_skill (technician_id, category_id, proficiency) VALUES ($1, $2, $3)',
      [technicianId, s.categoryId, s.proficiency]);
  }
}

// Khoa dong ky thuat vien trong transaction de hai lich hen dat cung luc
// cho cung mot ky thuat vien phai xep hang (chong trung lich - RB-02).
async function lockById(technicianId, db) {
  await db.query('SELECT technician_id FROM technician WHERE technician_id = $1 FOR UPDATE', [technicianId]);
}

module.exports = { findById, findByEmployeeId, listByCenter, create, update, findSkills, replaceSkills, lockById };
