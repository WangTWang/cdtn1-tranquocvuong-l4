const { failIfAny, parsePositiveInt } = require('./common');

const LEVELS = ['SO_CAP', 'TRUNG_CAP', 'CAO_CAP'];

function parseSkills(skills, problems) {
  if (skills === undefined) return undefined;
  if (!Array.isArray(skills)) {
    problems.push({ field: 'skills', issue: 'phải là mảng [{ categoryId, proficiency }]' });
    return undefined;
  }
  return skills.map((s, i) => {
    const categoryId = parsePositiveInt(s && s.categoryId, `skills[${i}].categoryId`, problems);
    const p = Number(s && s.proficiency);
    if (!Number.isInteger(p) || p < 1 || p > 5) {
      problems.push({ field: `skills[${i}].proficiency`, issue: 'phải là số nguyên từ 1 đến 5' });
    }
    return { categoryId, proficiency: p };
  });
}

function validateCreateTechnician(body = {}) {
  const problems = [];
  const employeeId = parsePositiveInt(body.employeeId, 'employeeId', problems);
  if (!LEVELS.includes(body.level)) {
    problems.push({ field: 'level', issue: `phải là ${LEVELS.join(', ')}` });
  }
  const skills = parseSkills(body.skills, problems);
  failIfAny(problems);
  return { employeeId, level: body.level, skills: skills || [] };
}

function validateUpdateTechnician(body = {}) {
  const problems = [];
  const out = {};
  if (body.level !== undefined) {
    if (!LEVELS.includes(body.level)) problems.push({ field: 'level', issue: `phải là ${LEVELS.join(', ')}` });
    out.level = body.level;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') problems.push({ field: 'isActive', issue: 'phải là true hoặc false' });
    out.isActive = body.isActive;
  }
  const skills = parseSkills(body.skills, problems);
  if (skills !== undefined) out.skills = skills;
  if (Object.keys(out).length === 0 && problems.length === 0) {
    problems.push({ field: 'body', issue: 'cần ít nhất một trường: level, isActive, skills' });
  }
  failIfAny(problems);
  return out;
}

module.exports = { validateCreateTechnician, validateUpdateTechnician, LEVELS };
