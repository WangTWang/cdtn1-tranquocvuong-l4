// Repository GIA trong bo nho: unit test lop service khong can PostgreSQL.
const vn = (s) => new Date(`${s}+07:00`);

function fakeAppointmentDeps({ ticket, appointments = [] } = {}) {
  const store = appointments.map((a) => ({ ...a }));
  let nextId = 100;
  const ticketRepo = { findById: jest.fn(async (id) => (ticket && ticket.ticketId === id ? { ...ticket } : null)) };
  const technicianRepo = { lockById: jest.fn(async () => {}) };
  const appointmentRepo = {
    findById: jest.fn(async (id) => {
      const a = store.find((x) => x.appointmentId === id);
      return a ? { ...a, ticketCode: ticket.ticketCode, centerId: ticket.centerId, technicianName: ticket.technicianName, createdBy: 'Nguyễn Thị Lan' } : null;
    }),
    listByTicket: jest.fn(async (ticketId) => store.filter((a) => a.ticketId === ticketId)),
    listActiveByTechnicianBetween: jest.fn(async (techId, from, to) =>
      store.filter((a) => a.technicianId === techId && !a.cancelledAt && a.startAt >= from && a.startAt < to)),
    create: jest.fn(async (data) => { const id = nextId++; store.push({ appointmentId: id, cancelledAt: null, ...data }); return id; }),
    update: jest.fn(async (id, data) => Object.assign(store.find((a) => a.appointmentId === id), data)),
    cancel: jest.fn(async (id, at) => { store.find((a) => a.appointmentId === id).cancelledAt = at; }),
  };
  const withTransaction = jest.fn(async (fn) => fn({ fake: 'db' }));
  return { ticketRepo, technicianRepo, appointmentRepo, withTransaction, store };
}

module.exports = { vn, fakeAppointmentDeps };

// ---- Sprint 2: phan cong / doi ky thuat vien ----
function fakeAssignmentDeps({ ticket, technicians = {}, skills = {}, candidates = [], list = [] } = {}) {
  const state = { ticket: ticket ? { ...ticket } : null, statusLogs: [], assignmentLogs: [] };
  const ticketRepo = {
    findById: jest.fn(async (id) => (state.ticket && state.ticket.ticketId === id ? { ...state.ticket } : null)),
    findByIdForUpdate: jest.fn(async (id) => (state.ticket && state.ticket.ticketId === id ? { ...state.ticket } : null)),
    listByCenterAndStatus: jest.fn(async () => ({ items: list, total: list.length })),
    listByTechnician: jest.fn(async () => list),
    assign: jest.fn(async (id, techId) => {
      Object.assign(state.ticket, { technicianId: techId, technicianName: technicians[techId].fullName, status: 'DA_PHAN_CONG' });
      return true;
    }),
    reassign: jest.fn(async (id, techId) => {
      Object.assign(state.ticket, { technicianId: techId, technicianName: technicians[techId].fullName });
      return true;
    }),
  };
  const technicianRepo = {
    findById: jest.fn(async (id) => (technicians[id] ? { ...technicians[id] } : null)),
    findSkills: jest.fn(async (id) => skills[id] || []),
    findByEmployeeId: jest.fn(async (employeeId) => Object.values(technicians).find((t) => t.employeeId === employeeId) || null),
    listCandidates: jest.fn(async () => candidates),
  };
  const logRepo = {
    addStatusLog: jest.fn(async (x) => { state.statusLogs.push(x); }),
    addAssignmentLog: jest.fn(async (x) => { state.assignmentLogs.push(x); }),
  };
  const withTransaction = jest.fn(async (fn) => fn({ fake: 'db' }));
  return { ticketRepo, technicianRepo, logRepo, withTransaction, state };
}

module.exports.fakeAssignmentDeps = fakeAssignmentDeps;
