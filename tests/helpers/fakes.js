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
