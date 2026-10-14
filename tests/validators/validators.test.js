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
