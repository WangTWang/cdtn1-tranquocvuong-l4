// Lop nghiep vu cho lich hen giao - nhan may (UC6, UC7).
// Moi quy tac nghiep vu la MOT HAM RIENG, ten ham nhac lai quy tac.
const AppError = require('../errors/AppError');
const { isSundayVn, isSameVnDay, vnDayRange, toVnIso, formatVnTime, formatVnDate } = require('../utils/time');

const CLOSED_STATUSES = ['DA_DONG', 'DA_HUY'];

// RB-03: ket thuc sau bat dau, trong cung ngay, khong o qua khu, khong roi vao Chu nhat.
function checkAppointmentTime(startAt, endAt, now) {
  const problems = [];
  if (endAt <= startAt) problems.push({ field: 'endAt', issue: 'phải sau thời điểm bắt đầu' });
  else if (!isSameVnDay(startAt, endAt)) problems.push({ field: 'endAt', issue: 'phải cùng ngày với thời điểm bắt đầu' });
  if (startAt < now) problems.push({ field: 'startAt', issue: 'không được ở quá khứ' });
  if (isSundayVn(startAt)) problems.push({ field: 'startAt', issue: 'chỉ đặt lịch từ thứ Hai đến thứ Bảy' });
  if (problems.length) {
    throw new AppError('VALIDATION_ERROR', `Thời gian lịch hẹn không hợp lệ: ${problems.map((p) => p.issue).join('; ')}`, problems);
  }
}

// RB-02: hai khoang [start, end) chong lan khi bat dau truoc khi cai kia ket thuc.
// Lich hen bat dau DUNG LUC lich khac ket thuc thi KHONG trung.
function isOverlapping(a, b) {
  return a.startAt < b.endAt && b.startAt < a.endAt;
}

// Khung gio trong gan nhat co cung do dai, bat dau sau lich bi trung.
function findNextFreeSlot(wanted, existing) {
  const duration = wanted.endAt - wanted.startAt;
  let start = wanted.startAt;
  const sorted = [...existing].sort((x, y) => x.startAt - y.startAt);
  for (const appt of sorted) {
    if (isOverlapping({ startAt: start, endAt: new Date(start.getTime() + duration) }, appt)) {
      start = appt.endAt;
    }
  }
  return start;
}

function toResponse(a) {
  return {
    appointmentId: a.appointmentId,
    ticketId: a.ticketId,
    ticketCode: a.ticketCode,
    technician: { technicianId: a.technicianId, fullName: a.technicianName },
    type: a.type,
    startAt: toVnIso(a.startAt),
    endAt: toVnIso(a.endAt),
    note: a.note,
    createdBy: a.createdBy,
    cancelledAt: toVnIso(a.cancelledAt),
  };
}

function createAppointmentService({ ticketRepo, appointmentRepo, technicianRepo, withTransaction, clock = () => new Date() }) {
  async function loadTicketForAppointment(ticketId, caller) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new AppError('TICKET_NOT_FOUND', `Không tìm thấy phiếu có mã ${ticketId}`);
    if (ticket.centerId !== caller.centerId) {
      throw new AppError('FORBIDDEN', 'Phiếu thuộc trung tâm khác (QT-14)');
    }
    // UC6 ngoai le 1a: phieu chua co ky thuat vien thi khong dat lich.
    if (ticket.technicianId === null) {
      throw new AppError('TICKET_NOT_ASSIGNED', `Phiếu ${ticket.ticketCode} chưa có kỹ thuật viên, cần phân công trước khi đặt lịch hẹn`);
    }
    if (CLOSED_STATUSES.includes(ticket.status)) {
      throw new AppError('TICKET_NOT_ASSIGNED', `Phiếu ${ticket.ticketCode} đang ở trạng thái ${ticket.status}, không đặt lịch hẹn được`);
    }
    return ticket;
  }

  // RB-02 trong transaction: khoa ky thuat vien, doc lich trong ngay, kiem chong lan.
  async function ensureNoConflict(db, ticket, wanted, excludeAppointmentId = null) {
    await technicianRepo.lockById(ticket.technicianId, db);
    const [dayStart, dayEnd] = vnDayRange(wanted.startAt);
    const sameDay = (await appointmentRepo.listActiveByTechnicianBetween(ticket.technicianId, dayStart, dayEnd, db))
      .filter((a) => a.appointmentId !== excludeAppointmentId);
    const conflict = sameDay.find((a) => isOverlapping(wanted, a));
    if (conflict) {
      const next = findNextFreeSlot(wanted, sameDay);
      throw new AppError('APPOINTMENT_CONFLICT',
        `Kỹ thuật viên ${ticket.technicianName} đã có lịch hẹn ${formatVnTime(conflict.startAt)}–${formatVnTime(conflict.endAt)} ngày ${formatVnDate(conflict.startAt)}`,
        [{ conflictAppointmentId: conflict.appointmentId, nextFreeSlotStartAt: toVnIso(next) }]);
    }
  }

  async function createAppointment(ticketId, input, caller) {
    const ticket = await loadTicketForAppointment(ticketId, caller);
    checkAppointmentTime(input.startAt, input.endAt, clock());
    const appointmentId = await withTransaction(async (db) => {
      await ensureNoConflict(db, ticket, input);
      return appointmentRepo.create({
        ticketId, technicianId: ticket.technicianId, type: input.type,
        startAt: input.startAt, endAt: input.endAt, note: input.note, createdBy: caller.employeeId,
      }, db);
    });
    return getAppointment(appointmentId, caller);
  }

  async function loadAppointment(appointmentId, caller) {
    const appt = await appointmentRepo.findById(appointmentId);
    if (!appt) throw new AppError('APPOINTMENT_NOT_FOUND', `Không tìm thấy lịch hẹn có mã ${appointmentId}`);
    if (appt.centerId !== caller.centerId) throw new AppError('FORBIDDEN', 'Lịch hẹn thuộc trung tâm khác (QT-14)');
    return appt;
  }

  async function getAppointment(appointmentId, caller) {
    return toResponse(await loadAppointment(appointmentId, caller));
  }

  async function listAppointmentsByTicket(ticketId, caller) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new AppError('TICKET_NOT_FOUND', `Không tìm thấy phiếu có mã ${ticketId}`);
    if (ticket.centerId !== caller.centerId) throw new AppError('FORBIDDEN', 'Phiếu thuộc trung tâm khác (QT-14)');
    return (await appointmentRepo.listByTicket(ticketId)).map(toResponse);
  }

  // Doi lich: kiem lai RB-03 va RB-02 (bo qua chinh lich hen nay).
  async function rescheduleAppointment(appointmentId, input, caller) {
    const appt = await loadAppointment(appointmentId, caller);
    if (appt.cancelledAt) throw new AppError('APPOINTMENT_CANCELLED', `Lịch hẹn ${appointmentId} đã hủy, không đổi được`);
    const ticket = await loadTicketForAppointment(appt.ticketId, caller);
    checkAppointmentTime(input.startAt, input.endAt, clock());
    await withTransaction(async (db) => {
      await ensureNoConflict(db, ticket, input, appointmentId);
      await appointmentRepo.update(appointmentId, input, db);
    });
    return getAppointment(appointmentId, caller);
  }

  // QT-13: huy = danh dau cancelled_at, giu lai lich su.
  async function cancelAppointment(appointmentId, caller) {
    const appt = await loadAppointment(appointmentId, caller);
    if (appt.cancelledAt) throw new AppError('APPOINTMENT_CANCELLED', `Lịch hẹn ${appointmentId} đã được hủy trước đó`);
    await withTransaction((db) => appointmentRepo.cancel(appointmentId, clock(), db));
    return getAppointment(appointmentId, caller);
  }

  return { createAppointment, getAppointment, listAppointmentsByTicket, rescheduleAppointment, cancelAppointment };
}

module.exports = { createAppointmentService, checkAppointmentTime, isOverlapping, findNextFreeSlot };
