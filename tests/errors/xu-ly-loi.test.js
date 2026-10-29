// Buoi 11: logging va xu ly loi xuyen lop.
const { createLogger, redact } = require('../../src/utils/logger');
const { createErrorHandler } = require('../../src/middlewares/errorHandler');
const { DataAccessError, isConnectionError, toDataError } = require('../../src/errors/DataAccessError');
const { createWithTransaction } = require('../../src/config/db');
const AppError = require('../../src/errors/AppError');

function fakeRes() {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

describe('Logger – không ghi dữ liệu nhạy cảm', () => {
  test('TC-47: che mật khẩu, token, số điện thoại ở mọi tầng; lỗi pg không mang theo trường detail (BUG-005)', () => {
    const lines = [];
    const log = createLogger({ level: 'debug', write: (l) => lines.push(JSON.parse(l)), now: () => new Date('2026-10-30T03:00:00Z') });
    const pgErr = Object.assign(new Error('duplicate key value violates unique constraint'), {
      code: '23505', detail: 'Key (phone)=(0901234567) already exists.',
    });
    log.error('tao khach that bai', { requestId: 'ab12cd34', body: { password: 'x', customer: { phone: '0901234567' } }, authorization: 'Bearer abc', err: pgErr });
    const line = lines[0];
    expect(line).toMatchObject({ time: '2026-10-30T10:00:00+07:00', level: 'ERROR', msg: 'tao khach that bai', requestId: 'ab12cd34' });
    expect(JSON.stringify(line)).not.toMatch(/0901234567|Bearer abc|"password":"x"/);
    expect(line.err).toMatchObject({ code: '23505', message: 'duplicate key value violates unique constraint' });
    expect(line.err.detail).toBeUndefined();
    expect(redact({ a: [{ so_dien_thoai: '0912345678' }] })).toEqual({ a: [{ so_dien_thoai: '[da che]' }] });
  });

  test('TC-48: mức log lấy từ cấu hình – mức warn bỏ qua info và debug', () => {
    const lines = [];
    const log = createLogger({ level: 'warn', write: (l) => lines.push(l) });
    log.debug('a'); log.info('b'); log.warn('c'); log.error('d');
    expect(lines.map((l) => JSON.parse(l).msg)).toEqual(['c', 'd']);
  });
});

describe('Middleware lỗi duy nhất', () => {
  const setup = () => {
    const lines = [];
    const handler = createErrorHandler({ logger: createLogger({ level: 'debug', write: (l) => lines.push(JSON.parse(l)) }) });
    return { lines, handler, req: { requestId: 'ab12cd34', method: 'POST', path: '/api/tickets/1/assignment' } };
  };

  test('TC-49: mất kết nối CSDL → 503 kèm mã tra cứu, ghi ĐÚNG MỘT dòng ERROR có requestId, không lộ chi tiết kỹ thuật', () => {
    const { lines, handler, req } = setup();
    const res = fakeRes();
    handler(new DataAccessError(Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), { code: 'ECONNREFUSED' })), req, res, () => {});
    expect(res.statusCode).toBe(503);
    expect(res.body.error.code).toBe('SERVICE_UNAVAILABLE');
    expect(res.body.error.message).toContain('Mã tra cứu: ab12cd34');
    expect(JSON.stringify(res.body)).not.toMatch(/ECONNREFUSED|5432|stack/);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ level: 'ERROR', requestId: 'ab12cd34' });
    expect(lines[0].err.cause.code).toBe('ECONNREFUSED');
  });

  test('TC-50: lỗi nghiệp vụ trả đúng mã HTTP và KHÔNG ghi log ERROR; lỗi lạ trả 500 kèm mã tra cứu', () => {
    const { lines, handler, req } = setup();
    const res = fakeRes();
    handler(new AppError('TICKET_ALREADY_ASSIGNED', 'Phiếu đã được phân công'), req, res, () => {});
    expect(res.statusCode).toBe(409);
    expect(lines).toHaveLength(0);
    const res2 = fakeRes();
    handler(new TypeError("Cannot read properties of null (reading 'trim')"), req, res2, () => {});
    expect(res2.statusCode).toBe(500);
    expect(res2.body.error.message).toContain('Mã tra cứu: ab12cd34');
    expect(res2.body.error.message).not.toContain('trim');
  });
});

describe('Lớp dữ liệu dịch lỗi kỹ thuật', () => {
  test('TC-51: nhận ra lỗi kết nối theo mã pg / Node; lỗi dữ liệu (vi phạm khóa) giữ nguyên', () => {
    expect(isConnectionError({ code: 'ECONNREFUSED' })).toBe(true);
    expect(isConnectionError({ code: '08006' })).toBe(true);
    expect(isConnectionError({ code: '57P01' })).toBe(true);
    expect(isConnectionError({ message: 'timeout exceeded when trying to connect' })).toBe(true);
    expect(isConnectionError({ code: 'ENOENT', syscall: 'connect', message: 'connect ENOENT /tmp/.s.PGSQL.5432' })).toBe(true);  // BUG-007
    expect(isConnectionError({ code: 'ENOENT', message: "ENOENT: no such file or directory, open 'a.sql'" })).toBe(false);
    const dup = { code: '23505', message: 'duplicate key' };
    expect(toDataError(dup)).toBe(dup);
    expect(toDataError({ code: 'ECONNRESET' })).toBeInstanceOf(DataAccessError);
  });

  test('TC-52: ROLLBACK lỗi (mất kết nối) không che mất LỖI GỐC của nghiệp vụ; kết nối luôn được trả lại (BUG-006)', async () => {
    const released = jest.fn();
    const client = {
      query: jest.fn(async (sql) => { if (sql === 'ROLLBACK') throw new Error('Connection terminated unexpectedly'); }),
      release: released,
    };
    const withTransaction = createWithTransaction({ connect: async () => client });
    const goc = new AppError('TICKET_ALREADY_ASSIGNED', 'Phiếu đã được phân công');
    await expect(withTransaction(async () => { throw goc; })).rejects.toBe(goc);
    expect(released).toHaveBeenCalledTimes(1);
    const noConnect = createWithTransaction({ connect: async () => { throw Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }); } });
    await expect(noConnect(async () => 1)).rejects.toBeInstanceOf(DataAccessError);
  });
});
