const { failIfAny, parsePositiveInt } = require('./common');

// Trang thai phieu duoc phep liet ke qua E1 (xem TD-11).
const LISTABLE = ['MOI', 'DA_PHAN_CONG'];

function validateListQuery(query = {}) {
  const problems = [];
  if (!LISTABLE.includes(query.status)) problems.push({ field: 'status', issue: `phải là ${LISTABLE.join(' hoặc ')}` });
  let page = 1;
  let pageSize = 20;
  if (query.page !== undefined) page = parsePositiveInt(query.page, 'page', problems) ?? 1;
  if (query.pageSize !== undefined) {
    const n = parsePositiveInt(query.pageSize, 'pageSize', problems);
    if (n !== null && n > 100) problems.push({ field: 'pageSize', issue: 'tối đa 100' });
    pageSize = n ?? 20;
  }
  failIfAny(problems);
  return { status: query.status, page, pageSize };
}

function validateAssign(body = {}) {
  const problems = [];
  const technicianId = parsePositiveInt(body.technicianId, 'technicianId', problems);
  failIfAny(problems);
  return { technicianId };
}

// QT-07: doi ky thuat vien bat buoc co ly do >= 5 ky tu, toi da 255 (khop CHECK trong ticket_assignment_log).
function validateReassign(body = {}) {
  const problems = [];
  const technicianId = parsePositiveInt(body.technicianId, 'technicianId', problems);
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if (reason.length < 5 || reason.length > 255) problems.push({ field: 'reason', issue: 'bắt buộc, từ 5 đến 255 ký tự' });
  failIfAny(problems);
  return { technicianId, reason };
}

module.exports = { validateListQuery, validateAssign, validateReassign };
