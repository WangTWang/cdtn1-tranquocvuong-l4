// Unit test tang 1 (kiem dinh dang) – du lieu sai bi tu choi kem ten truong.
const { validateCreateAppointment } = require('../../src/validators/appointment.validator');
const { validateCreateTechnician } = require('../../src/validators/technician.validator');

test('TC-12: thiếu type, startAt sai định dạng, thiếu endAt thì báo đủ ba trường sai', () => {
  expect.assertions(2);
  try {
    validateCreateAppointment({ startAt: '07/10/2026 09:00' });
  } catch (e) {
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.details.map((d) => d.field)).toEqual(['type', 'startAt', 'endAt']);
  }
});

test('TC-13: thời gian không có múi giờ bị từ chối; có múi giờ thì được chấp nhận', () => {
  expect(() => validateCreateAppointment({ type: 'GIAO', startAt: '2026-10-17T09:00:00', endAt: '2026-10-17T09:30:00' }))
    .toThrow('startAt, endAt');
  expect(validateCreateAppointment({ type: 'GIAO', startAt: '2026-10-17T09:00:00+07:00', endAt: '2026-10-17T09:30:00+07:00' }).type)
    .toBe('GIAO');
});

test('TC-14: tay nghề ngoài khoảng 1–5 và level sai bị từ chối', () => {
  expect(() => validateCreateTechnician({ employeeId: 6, level: 'GIOI', skills: [{ categoryId: 1, proficiency: 6 }] }))
    .toThrow('level, skills[0].proficiency');
});

// ---- Sprint 2 ----
const { validateListQuery, validateAssign, validateReassign } = require('../../src/validators/ticket.validator');
const { validateLogin } = require('../../src/validators/auth.validator');

describe('Validator Sprint 2', () => {
  test('TC-33: danh sách phiếu – status bắt buộc đúng giá trị, page và pageSize có mặc định và giới hạn 1–100', () => {
    expect(validateListQuery({ status: 'MOI' })).toEqual({ status: 'MOI', page: 1, pageSize: 20, q: null, priority: null });
    expect(() => validateListQuery({ status: 'HOAN_TAT' })).toThrow(expect.objectContaining({ code: 'VALIDATION_ERROR' }));
    expect(validateListQuery({ status: 'MOI', pageSize: '100' }).pageSize).toBe(100);
    expect(() => validateListQuery({ status: 'MOI', pageSize: '101' })).toThrow(expect.objectContaining({ code: 'VALIDATION_ERROR' }));
    expect(() => validateListQuery({ status: 'MOI', page: '0' })).toThrow(expect.objectContaining({ code: 'VALIDATION_ERROR' }));
  });

  test('TC-34: phân công và đổi kỹ thuật viên – thiếu technicianId, lý do dưới 5 ký tự đều báo đúng tên trường', () => {
    expect(() => validateAssign({})).toThrow(expect.objectContaining({ details: [{ field: 'technicianId', issue: expect.any(String) }] }));
    expect(validateAssign({ technicianId: '7' })).toEqual({ technicianId: 7 });
    const err = (() => { try { validateReassign({ technicianId: 'x', reason: ' ab ' }); } catch (e) { return e; } return null; })();
    expect(err.details.map((d) => d.field)).toEqual(['technicianId', 'reason']);
    expect(validateReassign({ technicianId: 2, reason: '  Nghỉ phép  ' })).toEqual({ technicianId: 2, reason: 'Nghỉ phép' });
  });

  test('TC-35: đăng nhập – thiếu tên hoặc mật khẩu bị từ chối ở tầng 1', () => {
    expect(() => validateLogin({ username: '  ', password: '' })).toThrow(expect.objectContaining({ code: 'VALIDATION_ERROR' }));
    expect(validateLogin({ username: ' tram ', password: 'x' })).toEqual({ username: 'tram', password: 'x' });
  });
});

describe('Bộ lọc danh sách phiếu (TD-19)', () => {
  test('TC-54: q được cắt khoảng trắng, chuẩn hóa NFC, rỗng coi như không lọc; q quá 50 ký tự và priority sai bị từ chối', () => {
    expect(validateListQuery({ status: 'MOI', q: '  Phạm ', priority: 'CAO' })).toMatchObject({ q: 'Phạm', priority: 'CAO' });
    expect(validateListQuery({ status: 'MOI', q: 'Phạm' }).q).toBe('Phạm');            // dấu tổ hợp (NFD) -> NFC
    expect(validateListQuery({ status: 'MOI', q: '   ', priority: '' })).toMatchObject({ q: null, priority: null });
    expect(validateListQuery({ status: 'MOI', q: 'a'.repeat(50) }).q).toHaveLength(50);    // biên: đúng 50 ký tự
    const err = (() => { try { validateListQuery({ status: 'MOI', q: 'a'.repeat(51), priority: 'GAP' }); } catch (e) { return e; } return null; })();
    expect(err.details.map((d) => d.field)).toEqual(['q', 'priority']);
  });
});
