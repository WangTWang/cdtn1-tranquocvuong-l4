// Lop nghiep vu cho danh sach phieu, goi y, phan cong va doi ky thuat vien (UC1, UC2, UC3, UC4, UC5).
// Moi quy tac nghiep vu la MOT HAM RIENG, ten ham nhac lai quy tac.
const AppError = require('../errors/AppError');
const { toTicketView } = require('../contracts/ticket.contract');
const { toVnIso } = require('../utils/time');

const MIN_PROFICIENCY = 3;                       // QT-08
const MIN_REASON_LENGTH = 5;                     // QT-07
const MY_TICKET_STATUSES = ['DA_PHAN_CONG', 'DANG_XU_LY'];

// QT-08: cung trung tam (repository da loc), dang lam viec, tay nghe voi nhom su co >= 3.
// Xep so phieu dang giu tang dan, bang nhau thi tay nghe giam dan, roi theo ten de ket qua on dinh.
function rankSuggestions(candidates) {
  return candidates
    .filter((c) => c.proficiency !== null && c.proficiency >= MIN_PROFICIENCY)
    .sort((a, b) => a.openTicketCount - b.openTicketCount
      || b.proficiency - a.proficiency
      || a.fullName.localeCompare(b.fullName, 'vi'));
}

// QT-08 cho mot ky thuat vien cu the: tra ve null neu dat, hoac ly do khong dat.
function whyNotEligible(technician, ticket, proficiency) {
  if (technician.centerId !== ticket.centerId) return 'khác trung tâm với phiếu';
  if (!technician.isActive) return 'đã ngừng làm việc';
  if (proficiency === null || proficiency < MIN_PROFICIENCY) {
    return `tay nghề với nhóm ${ticket.categoryName} chưa đạt mức ${MIN_PROFICIENCY} trở lên`;
  }
  return null;
}

function createAssignmentService({ ticketRepo, technicianRepo, logRepo, withTransaction, clock = () => new Date() }) {
  // QT-14: chi thao tac phieu cua trung tam minh.
  function ensureSameCenter(ticket, caller) {
    if (ticket.centerId !== caller.centerId) throw new AppError('FORBIDDEN', 'Phiếu thuộc trung tâm khác (QT-14)');
  }

  function notFound(ticketId) {
    return new AppError('TICKET_NOT_FOUND', `Không tìm thấy phiếu có mã ${ticketId}`);
  }

  // UC1 / FR1: phieu cua trung tam theo trang thai, sap theo han cam ket.
  // total: so phieu khop bo loc · totalAll: so phieu cung trang thai khi KHONG loc · overdue: so phieu qua han
  // (moc so sanh cho con so tong). Giao dien dung totalAll de phan biet "chua co du lieu" va "bo loc khong ra ket qua".
  async function listTickets(caller, { status, page, pageSize, q = null, priority = null }) {
    const { items, total, totalAll, overdue } = await ticketRepo.listByCenterAndStatus(
      caller.centerId, status, { limit: pageSize, offset: (page - 1) * pageSize, q, priority });
    const now = clock();
    return {
      items: items.map((t) => toTicketView(t, { role: caller.role, now })),
      page, pageSize, total, totalAll, overdue, filter: { q, priority },
    };
  }

  async function getTicket(ticketId, caller) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw notFound(ticketId);
    ensureSameCenter(ticket, caller);
    return toTicketView(ticket, { role: caller.role, now: clock() });
  }

  // UC2 / FR2: goi y ky thuat vien cho phieu MOI.
  async function getSuggestions(ticketId, caller) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw notFound(ticketId);
    ensureSameCenter(ticket, caller);
    if (ticket.categoryId === null) {
      throw new AppError('TICKET_NOT_CATEGORIZED', `Phiếu ${ticket.ticketCode} chưa có nhóm sự cố nên chưa gợi ý được kỹ thuật viên`);
    }
    // MOI: de phan cong. DA_PHAN_CONG: de doi ky thuat vien (loai nguoi dang giu phieu) - TD-12.
    if (!['MOI', 'DA_PHAN_CONG'].includes(ticket.status)) {
      throw new AppError('TICKET_NOT_ASSIGNABLE', `Phiếu ${ticket.ticketCode} đang ở trạng thái ${ticket.status}, không gợi ý kỹ thuật viên được`);
    }
    const candidates = (await technicianRepo.listCandidates(ticket.centerId, ticket.categoryId))
      .filter((c) => c.technicianId !== ticket.technicianId);
    return {
      ticketId: ticket.ticketId,
      ticketCode: ticket.ticketCode,
      category: ticket.categoryName,
      suggestions: rankSuggestions(candidates),
    };
  }

  // Kiem tra ky thuat vien duoc chon (QT-08), dung chung cho phan cong va doi.
  async function loadEligibleTechnician(technicianId, ticket, db) {
    const technician = await technicianRepo.findById(technicianId, db);
    if (!technician) throw new AppError('TECHNICIAN_NOT_FOUND', `Không tìm thấy kỹ thuật viên có mã ${technicianId}`);
    const skill = (await technicianRepo.findSkills(technicianId, db)).find((s) => s.categoryId === ticket.categoryId);
    const reason = whyNotEligible(technician, ticket, skill ? skill.proficiency : null);
    if (reason) {
      throw new AppError('TECHNICIAN_NOT_ELIGIBLE', `Kỹ thuật viên ${technician.fullName} không đủ điều kiện: ${reason} (QT-08)`);
    }
    return technician;
  }

  // UC3 / FR3, FR4: phan cong. Trong MOT transaction: khoa phieu -> kiem lai trang thai -> ghi 3 noi.
  async function assignTicket(ticketId, technicianId, caller) {
    const result = await withTransaction(async (db) => {
      const ticket = await ticketRepo.findByIdForUpdate(ticketId, db);
      if (!ticket) throw notFound(ticketId);
      ensureSameCenter(ticket, caller);
      if (ticket.status === 'DA_HUY') {
        throw new AppError('TICKET_CANCELLED', `Phiếu ${ticket.ticketCode} đã hủy, không phân công được`);
      }
      // RB-01: chi phieu MOI duoc phan cong. Doc lai SAU khi giu khoa nen nguoi den sau thay phieu da doi.
      if (ticket.status !== 'MOI') {
        throw new AppError('TICKET_ALREADY_ASSIGNED',
          `Phiếu ${ticket.ticketCode} đã được phân công${ticket.technicianName ? ` cho ${ticket.technicianName}` : ''}`);
      }
      if (ticket.categoryId === null) {
        throw new AppError('TICKET_NOT_CATEGORIZED', `Phiếu ${ticket.ticketCode} chưa có nhóm sự cố nên chưa phân công được`);
      }
      const technician = await loadEligibleTechnician(technicianId, ticket, db);
      // Tuyen phong thu thu hai: neu UPDATE khong dong nao thi coi nhu phieu vua bi nguoi khac doi.
      if (!(await ticketRepo.assign(ticketId, technicianId, db))) {
        throw new AppError('TICKET_ALREADY_ASSIGNED', `Phiếu ${ticket.ticketCode} vừa được người khác phân công`);
      }
      const at = clock();
      await logRepo.addStatusLog({ ticketId, fromStatus: 'MOI', toStatus: 'DA_PHAN_CONG', changedBy: caller.employeeId }, db);
      await logRepo.addAssignmentLog({
        ticketId, fromTechnicianId: null, toTechnicianId: technicianId, reason: null, changedBy: caller.employeeId,
      }, db);
      return { ticket, technician, at };
    });
    return {
      ticketId,
      ticketCode: result.ticket.ticketCode,
      status: 'DA_PHAN_CONG',
      technician: { technicianId, fullName: result.technician.fullName },
      assignedAt: toVnIso(result.at),
    };
  }

  // UC4 / FR5: doi ky thuat vien cua phieu DA PHAN CONG, bat buoc co ly do (QT-07).
  async function reassignTicket(ticketId, { technicianId, reason }, caller) {
    const result = await withTransaction(async (db) => {
      const ticket = await ticketRepo.findByIdForUpdate(ticketId, db);
      if (!ticket) throw notFound(ticketId);
      ensureSameCenter(ticket, caller);
      if (ticket.status !== 'DA_PHAN_CONG') {
        throw new AppError('TICKET_NOT_REASSIGNABLE', `Phiếu ${ticket.ticketCode} không ở trạng thái ĐÃ PHÂN CÔNG nên không đổi được kỹ thuật viên`);
      }
      if (ticket.technicianId === technicianId) {
        throw new AppError('SAME_TECHNICIAN', `Kỹ thuật viên mới trùng với kỹ thuật viên hiện tại (${ticket.technicianName})`);
      }
      if (reason.length < MIN_REASON_LENGTH) {
        throw new AppError('VALIDATION_ERROR', 'Lý do đổi kỹ thuật viên cần ít nhất 5 ký tự',
          [{ field: 'reason', issue: 'tối thiểu 5 ký tự' }]);
      }
      const technician = await loadEligibleTechnician(technicianId, ticket, db);
      if (!(await ticketRepo.reassign(ticketId, technicianId, db))) {
        throw new AppError('TICKET_NOT_REASSIGNABLE', `Phiếu ${ticket.ticketCode} vừa đổi trạng thái, không đổi được kỹ thuật viên`);
      }
      await logRepo.addAssignmentLog({
        ticketId, fromTechnicianId: ticket.technicianId, toTechnicianId: technicianId, reason, changedBy: caller.employeeId,
      }, db);
      return { ticket, technician, at: clock() };
    });
    return {
      ticketId,
      ticketCode: result.ticket.ticketCode,
      status: 'DA_PHAN_CONG',
      previousTechnician: { technicianId: result.ticket.technicianId, fullName: result.ticket.technicianName },
      technician: { technicianId, fullName: result.technician.fullName },
      reason,
      changedAt: toVnIso(result.at),
    };
  }

  // E5 / FR6: phieu dang gan cho ky thuat vien dang dang nhap; so dien thoai luon o dang che (QT-15).
  async function listMyTickets(caller) {
    const technician = await technicianRepo.findByEmployeeId(caller.employeeId);
    if (!technician) throw new AppError('FORBIDDEN', 'Tài khoản này chưa có hồ sơ kỹ thuật viên');
    const items = await ticketRepo.listByTechnician(technician.technicianId, MY_TICKET_STATUSES);
    const now = clock();
    return { items: items.map((t) => toTicketView(t, { role: caller.role, now })), total: items.length };
  }

  return { listTickets, getTicket, getSuggestions, assignTicket, reassignTicket, listMyTickets };
}

module.exports = { createAssignmentService, rankSuggestions, whyNotEligible };
