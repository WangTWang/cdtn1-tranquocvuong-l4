const AppError = require('../errors/AppError');

// Tang 1: kiem dinh dang. Gom TAT CA truong sai roi bao mot lan.
function failIfAny(problems) {
  if (problems.length > 0) {
    const fields = problems.map((p) => p.field).join(', ');
    throw new AppError('VALIDATION_ERROR', `Dữ liệu không hợp lệ ở các trường: ${fields}`, problems);
  }
}

function parsePositiveInt(value, field, problems) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    problems.push({ field, issue: 'phải là số nguyên dương' });
    return null;
  }
  return n;
}

// Thoi gian ISO 8601 BAT BUOC co mui gio (Z hoac +07:00) de khong hieu nham.
const ISO_WITH_TZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;
function parseIsoDate(value, field, problems) {
  if (typeof value !== 'string' || !ISO_WITH_TZ.test(value) || Number.isNaN(Date.parse(value))) {
    problems.push({ field, issue: 'phải là thời gian ISO 8601 có múi giờ, ví dụ 2026-10-07T09:00:00+07:00' });
    return null;
  }
  return new Date(value);
}

module.exports = { failIfAny, parsePositiveInt, parseIsoDate };
