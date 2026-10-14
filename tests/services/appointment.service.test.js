// Unit test lop nghiep vu lich hen: RB-02 (khong trung lich), RB-03 (thoi gian hop le), UC6 ngoai le 1a.
const { createAppointmentService } = require('../../src/services/appointment.service');
const AppError = require('../../src/errors/AppError');
const { vn, fakeAppointmentDeps } = require('../helpers/fakes');

const NOW = vn('2026-10-14T08:00:00'); // thu Tu
const receptionist = { employeeId: 2, role: 'TIEP_NHAN', centerId: 1 };
const assignedTicket = {
  ticketId: 3, ticketCode: 'BH-000123/2026', centerId: 1, status: 'DA_PHAN_CONG',
  technicianId: 2, technicianName: 'Phạm Minh Khôi',
};
// Lich co san cua Pham Minh Khoi: thu Bay 17/10/2026 09:00-09:45
const existing = {
  appointmentId: 1, ticketId: 3, technicianId: 2, type: 'GIAO',
  startAt: vn('2026-10-17T09:00:00'), endAt: vn('2026-10-17T09:45:00'), note: null, cancelledAt: null,
};

function build(options) {
  const deps = fakeAppointmentDeps(options);
  return { deps, service: createAppointmentService({ ...deps, clock: () => NOW }) };
}

async function expectAppError(promise, code) {
  await expect(promise).rejects.toBeInstanceOf(AppError);
  await expect(promise).rejects.toMatchObject({ code });
}

describe('Đặt lịch hẹn – luồng đúng', () => {
  test('TC-01: phiếu đã có kỹ thuật viên, khung giờ trống thì tạo được lịch hẹn và lưu đúng kỹ thuật viên của phiếu', async () => {
    const { service, deps } = build({ ticket: assignedTicket, appointments: [existing] });
    const result = await service.createAppointment(3, {
      type: 'NHAN', startAt: vn('2026-10-17T10:00:00'), endAt: vn('2026-10-17T10:30:00'), note: 'Nhận máy',
    }, receptionist);

    expect(result.technician).toEqual({ technicianId: 2, fullName: 'Phạm Minh Khôi' });
    expect(result.startAt).toBe('2026-10-17T10:00:00+07:00');
    expect(deps.appointmentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: 3, technicianId: 2, createdBy: 2 }), { fake: 'db' });
    expect(deps.technicianRepo.lockById).toHaveBeenCalledWith(2, { fake: 'db' }); // chong trung khi dat dong thoi
  });
});

describe('Đặt lịch hẹn – giá trị biên', () => {
  test('TC-02: lịch bắt đầu ĐÚNG LÚC lịch cũ kết thúc (09:45) là hợp lệ, không bị coi là trùng (RB-02)', async () => {
    const { service } = build({ ticket: assignedTicket, appointments: [existing] });
    const result = await service.createAppointment(3, {
      type: 'NHAN', startAt: vn('2026-10-17T09:45:00'), endAt: vn('2026-10-17T10:15:00'), note: null,
    }, receptionist);
    expect(result.startAt).toBe('2026-10-17T09:45:00+07:00');
  });

  test('TC-03: lịch kết thúc trễ hơn lịch cũ bắt đầu MỘT phút (09:01) thì bị từ chối và gợi ý giờ trống 09:45 (RB-02)', async () => {
    const { service } = build({ ticket: assignedTicket, appointments: [existing] });
    const promise = service.createAppointment(3, {
      type: 'GIAO', startAt: vn('2026-10-17T08:31:00'), endAt: vn('2026-10-17T09:01:00'), note: null,
    }, receptionist);
    await expectAppError(promise, 'APPOINTMENT_CONFLICT');
    await expect(promise).rejects.toMatchObject({
      details: [{ conflictAppointmentId: 1, nextFreeSlotStartAt: '2026-10-17T09:45:00+07:00' }],
    });
  });

  test('TC-04: 23:30 thứ Bảy hợp lệ nhưng 00:00 Chủ nhật bị từ chối (RB-03)', async () => {
    const { service } = build({ ticket: assignedTicket });
    await expect(service.createAppointment(3, {
      type: 'GIAO', startAt: vn('2026-10-17T23:30:00'), endAt: vn('2026-10-17T23:59:00'), note: null,
    }, receptionist)).resolves.toBeDefined();
    await expectAppError(service.createAppointment(3, {
      type: 'GIAO', startAt: vn('2026-10-18T00:00:00'), endAt: vn('2026-10-18T00:30:00'), note: null,
    }, receptionist), 'VALIDATION_ERROR');
  });
});

describe('Đặt lịch hẹn – dữ liệu sai', () => {
  test('TC-05: kết thúc không sau bắt đầu và thời điểm ở quá khứ thì bị từ chối, nêu đủ các trường sai (RB-03)', async () => {
    const { service, deps } = build({ ticket: assignedTicket });
    const promise = service.createAppointment(3, {
      type: 'GIAO', startAt: vn('2026-10-13T10:00:00'), endAt: vn('2026-10-13T09:00:00'), note: null,
    }, receptionist);
    await expectAppError(promise, 'VALIDATION_ERROR');
    await expect(promise).rejects.toMatchObject({
      details: expect.arrayContaining([expect.objectContaining({ field: 'endAt' }), expect.objectContaining({ field: 'startAt' })]),
    });
    expect(deps.appointmentRepo.create).not.toHaveBeenCalled();
  });

  test('TC-06: phiếu chưa có kỹ thuật viên thì không cho đặt lịch (UC6 ngoại lệ 1a)', async () => {
    const { service } = build({ ticket: { ...assignedTicket, status: 'MOI', technicianId: null, technicianName: null } });
    await expectAppError(service.createAppointment(3, {
      type: 'GIAO', startAt: vn('2026-10-17T10:00:00'), endAt: vn('2026-10-17T10:30:00'), note: null,
    }, receptionist), 'TICKET_NOT_ASSIGNED');
  });

  test('TC-07: phiếu thuộc trung tâm khác bị từ chối (QT-14)', async () => {
    const { service } = build({ ticket: { ...assignedTicket, centerId: 2 } });
    await expectAppError(service.createAppointment(3, {
      type: 'GIAO', startAt: vn('2026-10-17T10:00:00'), endAt: vn('2026-10-17T10:30:00'), note: null,
    }, receptionist), 'FORBIDDEN');
  });
});

describe('Đổi lịch và hủy lịch hẹn', () => {
  test('TC-08: đổi lịch không bị tính trùng với chính nó; hủy thì đánh dấu cancelledAt, không xóa (QT-13)', async () => {
    const { service, deps } = build({ ticket: assignedTicket, appointments: [existing] });
    const moved = await service.rescheduleAppointment(1, {
      type: 'GIAO', startAt: vn('2026-10-17T09:15:00'), endAt: vn('2026-10-17T10:00:00'), note: null,
    }, receptionist);
    expect(moved.startAt).toBe('2026-10-17T09:15:00+07:00');

    const cancelled = await service.cancelAppointment(1, receptionist);
    expect(cancelled.cancelledAt).toBe('2026-10-14T08:00:00+07:00');
    expect(deps.store).toHaveLength(1);
    await expectAppError(service.cancelAppointment(1, receptionist), 'APPOINTMENT_CANCELLED');
  });
});
