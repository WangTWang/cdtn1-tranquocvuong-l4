const { failIfAny, parsePositiveInt } = require('./common');

// Trang thai phieu duoc phep liet ke qua E1 (xem TD-11).
const LISTABLE = ['MOI', 'DA_PHAN_CONG'];
const PRIORITIES = ['CAO', 'TRUNG_BINH', 'THAP'];

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
  // Bo loc tuy chon: q (ma phieu hoac ten khach, 1-50 ky tu), priority.
  let q = null;
  if (query.q !== undefined) {
    q = String(query.q).normalize('NFC').trim();   // NFC: chu co dau go tu ban phim khac nhau van so khop duoc
    if (q.length > 50) problems.push({ field: 'q', issue: 'tối đa 50 ký tự' });
    if (q === '') q = null;
  }
  let priority = null;
  if (query.priority !== undefined && query.priority !== '') {
    if (!PRIORITIES.includes(query.priority)) problems.push({ field: 'priority', issue: `phải là ${PRIORITIES.join(', ')}` });
    priority = query.priority;
  }
  failIfAny(problems);
  return { status: query.status, page, pageSize, q, priority };
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
