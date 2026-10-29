// Bo test phan quyen NFR2: dung ung dung Express that voi service gia, goi qua HTTP that.
// Khong can PostgreSQL. Kiem tra ca thu tu mount route (/api/technicians/me phai truoc /api/technicians).
const jwt = require('jsonwebtoken');
const { createApp } = require('../../src/app');

process.env.JWT_SECRET = 'khoa-thu-nghiem';
const token = (role, centerId = 1, employeeId = 1) => jwt.sign({ employeeId, role, centerId }, process.env.JWT_SECRET);

const ok = (data) => jest.fn(async () => data);
const services = {
  authService: { login: ok({ token: 'x', user: {} }) },
  technicianService: { listTechnicians: ok([]), getTechnician: ok({}), createTechnician: ok({}), updateTechnician: ok({}), deactivateTechnician: ok({}) },
  appointmentService: { createAppointment: ok({}), getAppointment: ok({}), listAppointmentsByTicket: ok([]), rescheduleAppointment: ok({}), cancelAppointment: ok({}) },
  assignmentService: {
    listTickets: ok({ items: [], page: 1, pageSize: 20, total: 0 }), getTicket: ok({}), getSuggestions: ok({}),
    assignTicket: ok({}), reassignTicket: ok({}), listMyTickets: ok({ items: [], total: 0 }),
  },
};

let server; let base;
beforeAll(async () => {
  server = createApp(services, { webDir: '/khong-co' }).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => new Promise((resolve) => server.close(resolve)));

const call = (method, path, role, body) => fetch(base + path, {
  method,
  headers: { 'Content-Type': 'application/json', ...(role ? { Authorization: `Bearer ${token(role)}` } : {}) },
  body: body ? JSON.stringify(body) : undefined,
});

describe('Phân quyền theo vai trò (NFR2)', () => {
  test.each([
    ['GET', '/api/tickets?status=MOI', 'KY_THUAT_VIEN', null],
    ['GET', '/api/tickets?status=MOI', 'TIEP_NHAN', null],
    ['GET', '/api/tickets/1/technician-suggestions', 'TIEP_NHAN', null],
    ['POST', '/api/tickets/1/assignment', 'TIEP_NHAN', { technicianId: 1 }],
    ['PUT', '/api/tickets/1/assignment', 'KY_THUAT_VIEN', { technicianId: 1, reason: 'Nghỉ phép' }],
    ['GET', '/api/technicians', 'TIEP_NHAN', null],
    ['GET', '/api/technicians/me/tickets', 'QUAN_LY', null],
  ])('TC-36: %s %s bằng vai trò %s bị từ chối 403', async (method, path, role, body) => {
    const res = await call(method, path, role, body);
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('FORBIDDEN');
  });

  test('TC-37: không có token thì 401, riêng đăng nhập thì không cần token', async () => {
    expect((await call('GET', '/api/tickets?status=MOI')).status).toBe(401);
    expect((await call('POST', '/api/auth/login', null, { username: 'tram', password: 'x' })).status).toBe(200);
    expect((await call('POST', '/api/auth/login', null, {})).status).toBe(400);
  });

  test('TC-38: đúng vai trò thì qua – kể cả /api/technicians/me/tickets (không bị router kỹ thuật viên chặn)', async () => {
    expect((await call('GET', '/api/tickets?status=MOI', 'QUAN_LY')).status).toBe(200);
    expect((await call('GET', '/api/tickets?status=DA_PHAN_CONG', 'TIEP_NHAN')).status).toBe(200);
    expect((await call('GET', '/api/technicians/me/tickets', 'KY_THUAT_VIEN')).status).toBe(200);
    expect((await call('POST', '/api/tickets/1/assignment', 'QUAN_LY', { technicianId: 2 })).status).toBe(201);
    expect(services.assignmentService.assignTicket).toHaveBeenCalledWith(1, 2, expect.objectContaining({ role: 'QUAN_LY', centerId: 1 }));
  });

  test('TC-53: mọi phản hồi có header X-Request-Id; /health báo 503 khi CSDL không trả lời', async () => {
    const res = await call('GET', '/api/tickets?status=MOI', 'QUAN_LY');
    expect(res.headers.get('x-request-id')).toMatch(/^[0-9a-f]{8}$/);
    const down = createApp({ ...services, checkDb: async () => { throw new Error('ECONNREFUSED'); } }, { webDir: '/khong-co' }).listen(0);
    const r = await fetch(`http://127.0.0.1:${down.address().port}/health`);
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ status: 'loi', db: 'khong ket noi duoc' });
    await new Promise((resolve) => down.close(resolve));
    const ok = await fetch(`${base}/health`);
    expect(await ok.json()).toEqual({ status: 'ok', db: 'ok' });
  });

  test('TC-39: dữ liệu sai bị chặn ở tầng 1 với 400 trước khi vào service', async () => {
    const before = services.assignmentService.assignTicket.mock.calls.length;
    const res = await call('POST', '/api/tickets/1/assignment', 'QUAN_LY', { technicianId: 'abc' });
    expect(res.status).toBe(400);
    expect((await res.json()).error.details[0].field).toBe('technicianId');
    expect(services.assignmentService.assignTicket.mock.calls.length).toBe(before);
  });
});
