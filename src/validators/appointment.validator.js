const { failIfAny, parseIsoDate } = require('./common');

const TYPES = ['GIAO', 'NHAN'];

function checkNote(note, problems) {
  if (note !== undefined && note !== null && (typeof note !== 'string' || note.length > 255)) {
    problems.push({ field: 'note', issue: 'tối đa 255 ký tự' });
  }
}

// E6: kiem dinh dang. Quy tac nghiep vu (RB-02, RB-03) nam o service.
function validateCreateAppointment(body = {}) {
  const problems = [];
  if (!TYPES.includes(body.type)) problems.push({ field: 'type', issue: 'phải là GIAO hoặc NHAN' });
  const startAt = parseIsoDate(body.startAt, 'startAt', problems);
  const endAt = parseIsoDate(body.endAt, 'endAt', problems);
  checkNote(body.note, problems);
  failIfAny(problems);
  return { type: body.type, startAt, endAt, note: body.note ?? null };
}

// Doi lich: gui lai day du type, startAt, endAt (va note neu co).
const validateUpdateAppointment = validateCreateAppointment;

module.exports = { validateCreateAppointment, validateUpdateAppointment };
