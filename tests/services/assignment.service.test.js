const { createAssignmentService, rankSuggestions } = require('../../src/services/assignment.service');
const { fakeAssignmentDeps } = require('../helpers/fakes');

const QUAN_LY = { employeeId: 1, role: 'QUAN_LY', centerId: 1 };
const NOW = new Date('2026-10-20T03:00:00Z');

const moiTicket = (over = {}) => ({
  ticketId: 1, ticketCode: 'BH-000118/2026', centerId: 1, status: 'MOI', categoryId: 1, categoryName: 'MAN_HINH',
  technicianId: null, technicianName: null, customerName: 'Trần Văn Bình', customerPhone: '0912345678',
  deviceName: 'Mekong Tab 8', priority: 'CAO', receivedAt: new Date('2026-10-19T01:00:00Z'), dueDate: new Date('2026-10-21T01:00:00Z'), ...over,
});
const tech = (id, name, over = {}) => ({ technicianId: id, employeeId: id + 10, fullName: name, centerId: 1, isActive: true, level: 'TRUNG_CAP', ...over });
const skill = (proficiency) => [{ categoryId: 1, categoryName: 'MAN_HINH', proficiency }];

function build(over = {}) {
  const deps = fakeAssignmentDeps({
    ticket: moiTicket(),
    technicians: { 1: tech(1, 'Lê Văn Dũng'), 2: tech(2, 'Phạm Minh Khôi'), 3: tech(3, 'Võ Thanh Tùng', { centerId: 2 }) },
    skills: { 1: skill(5), 2: skill(3), 3: skill(5) },
    ...over,
  });
  return { ...deps, service: createAssignmentService({ ...deps, clock: () => NOW }) };
}

describe('QT-08 – xếp hạng gợi ý kỹ thuật viên', () => {
  test('TC-15: loại tay nghề dưới 3 hoặc chưa có kỹ năng; xếp ít phiếu đang giữ trước, bằng nhau thì tay nghề cao trước', () => {
    const ranked = rankSuggestions([
      { technicianId: 1, fullName: 'An', proficiency: 5, openTicketCount: 3 },
      { technicianId: 2, fullName: 'Bình', proficiency: 2, openTicketCount: 0 },     // dưới ngưỡng
      { technicianId: 3, fullName: 'Chi', proficiency: null, openTicketCount: 0 },   // chưa có kỹ năng
      { technicianId: 4, fullName: 'Dũng', proficiency: 3, openTicketCount: 3 },     // bằng An về số phiếu, thấp hơn về tay nghề
      { technicianId: 5, fullName: 'Em', proficiency: 4, openTicketCount: 1 },
    ]);
    expect(ranked.map((r) => r.technicianId)).toEqual([5, 1, 4]);
  });
});

describe('Phân công kỹ thuật viên (UC3)', () => {
  test('TC-16: luồng đúng – phiếu MỚI chuyển ĐÃ PHÂN CÔNG, ghi đủ lịch sử trạng thái và lịch sử phân công', async () => {
    const { service, state } = build();
    const res = await service.assignTicket(1, 1, QUAN_LY);
    expect(res).toMatchObject({ ticketCode: 'BH-000118/2026', status: 'DA_PHAN_CONG', technician: { technicianId: 1, fullName: 'Lê Văn Dũng' } });
    expect(state.statusLogs).toEqual([{ ticketId: 1, fromStatus: 'MOI', toStatus: 'DA_PHAN_CONG', changedBy: 1 }]);
    expect(state.assignmentLogs[0]).toMatchObject({ fromTechnicianId: null, toTechnicianId: 1, reason: null, changedBy: 1 });
  });

  test('TC-17: phiếu đã phân công rồi thì báo 409 kèm tên kỹ thuật viên và KHÔNG ghi gì thêm (RB-01)', async () => {
    const { service, state } = build({ ticket: moiTicket({ status: 'DA_PHAN_CONG', technicianId: 2, technicianName: 'Phạm Minh Khôi' }) });
    await expect(service.assignTicket(1, 1, QUAN_LY)).rejects.toMatchObject({
      code: 'TICKET_ALREADY_ASSIGNED', message: expect.stringContaining('Phạm Minh Khôi'),
    });
    expect(state.statusLogs).toHaveLength(0);
    expect(state.assignmentLogs).toHaveLength(0);
  });

  test('TC-18: giá trị biên tay nghề – đúng 3 được chọn, 2 bị từ chối (QT-08)', async () => {
    const ok = build();                                               // kỹ thuật viên 2 có tay nghề đúng 3
    await expect(ok.service.assignTicket(1, 2, QUAN_LY)).resolves.toMatchObject({ status: 'DA_PHAN_CONG' });
    const low = build({ skills: { 1: skill(5), 2: skill(2), 3: skill(5) } });
    await expect(low.service.assignTicket(1, 2, QUAN_LY)).rejects.toMatchObject({ code: 'TECHNICIAN_NOT_ELIGIBLE' });
    expect(low.state.statusLogs).toHaveLength(0);
  });

  test('TC-19: dữ liệu sai – kỹ thuật viên khác trung tâm, đã ngừng làm việc hoặc không tồn tại', async () => {
    const { service } = build({ technicians: { 1: tech(1, 'Lê Văn Dũng', { isActive: false }), 3: tech(3, 'Võ Thanh Tùng', { centerId: 2 }) } });
    await expect(service.assignTicket(1, 3, QUAN_LY)).rejects.toMatchObject({ code: 'TECHNICIAN_NOT_ELIGIBLE' });
    await expect(service.assignTicket(1, 1, QUAN_LY)).rejects.toMatchObject({ code: 'TECHNICIAN_NOT_ELIGIBLE' });
    await expect(service.assignTicket(1, 99, QUAN_LY)).rejects.toMatchObject({ code: 'TECHNICIAN_NOT_FOUND' });
  });

  test('TC-20: phiếu trung tâm khác bị từ chối 403 (QT-14); phiếu chưa phân loại và phiếu đã hủy bị 409', async () => {
    await expect(build({ ticket: moiTicket({ centerId: 2 }) }).service.assignTicket(1, 1, QUAN_LY)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(build({ ticket: moiTicket({ categoryId: null, categoryName: null }) }).service.assignTicket(1, 1, QUAN_LY))
      .rejects.toMatchObject({ code: 'TICKET_NOT_CATEGORIZED' });
    await expect(build({ ticket: moiTicket({ status: 'DA_HUY' }) }).service.assignTicket(1, 1, QUAN_LY)).rejects.toMatchObject({ code: 'TICKET_CANCELLED' });
    await expect(build().service.assignTicket(99, 1, QUAN_LY)).rejects.toMatchObject({ code: 'TICKET_NOT_FOUND' });
  });
});

describe('Gợi ý kỹ thuật viên (UC2)', () => {
  test('TC-21: trả danh sách đã lọc và xếp; phiếu chưa phân loại hoặc không còn MỚI thì báo 409', async () => {
    const candidates = [
      { technicianId: 1, fullName: 'Lê Văn Dũng', level: 'CAO_CAP', proficiency: 5, openTicketCount: 3 },
      { technicianId: 2, fullName: 'Phạm Minh Khôi', level: 'TRUNG_CAP', proficiency: 2, openTicketCount: 0 },
    ];
    const res = await build({ candidates }).service.getSuggestions(1, QUAN_LY);
    expect(res.category).toBe('MAN_HINH');
    expect(res.suggestions.map((s) => s.technicianId)).toEqual([1]);
    await expect(build({ ticket: moiTicket({ categoryId: null }) }).service.getSuggestions(1, QUAN_LY)).rejects.toMatchObject({ code: 'TICKET_NOT_CATEGORIZED' });
    await expect(build({ ticket: moiTicket({ status: 'DA_HUY' }) }).service.getSuggestions(1, QUAN_LY)).rejects.toMatchObject({ code: 'TICKET_NOT_ASSIGNABLE' });
  });

  test('TC-21b: phiếu đã phân công vẫn xem được gợi ý để đổi người, nhưng không gợi ý lại chính người đang giữ phiếu (TD-12)', async () => {
    const candidates = [
      { technicianId: 1, fullName: 'Lê Văn Dũng', level: 'CAO_CAP', proficiency: 5, openTicketCount: 3 },
      { technicianId: 2, fullName: 'Phạm Minh Khôi', level: 'TRUNG_CAP', proficiency: 4, openTicketCount: 1 },
    ];
    const ticket = moiTicket({ status: 'DA_PHAN_CONG', technicianId: 2, technicianName: 'Phạm Minh Khôi' });
    const res = await build({ ticket, candidates }).service.getSuggestions(1, QUAN_LY);
    expect(res.suggestions.map((s) => s.technicianId)).toEqual([1]);
  });
});

describe('Đổi kỹ thuật viên (UC4)', () => {
  const assigned = () => moiTicket({ status: 'DA_PHAN_CONG', technicianId: 2, technicianName: 'Phạm Minh Khôi' });

  test('TC-22: luồng đúng – ghi lịch sử có kỹ thuật viên cũ, mới và lý do; trạng thái phiếu không đổi (QT-07)', async () => {
    const { service, state } = build({ ticket: assigned() });
    const res = await service.reassignTicket(1, { technicianId: 1, reason: 'Khôi nghỉ phép từ 21/10' }, QUAN_LY);
    expect(res).toMatchObject({ status: 'DA_PHAN_CONG', previousTechnician: { technicianId: 2 }, technician: { technicianId: 1 } });
    expect(state.assignmentLogs[0]).toMatchObject({ fromTechnicianId: 2, toTechnicianId: 1, reason: 'Khôi nghỉ phép từ 21/10' });
    expect(state.statusLogs).toHaveLength(0);
  });

  test('TC-23: dữ liệu sai – phiếu còn MỚI, trùng kỹ thuật viên cũ, lý do dưới 5 ký tự', async () => {
    await expect(build().service.reassignTicket(1, { technicianId: 1, reason: 'Nghỉ phép dài ngày' }, QUAN_LY))
      .rejects.toMatchObject({ code: 'TICKET_NOT_REASSIGNABLE' });
    await expect(build({ ticket: assigned() }).service.reassignTicket(1, { technicianId: 2, reason: 'Nghỉ phép dài ngày' }, QUAN_LY))
      .rejects.toMatchObject({ code: 'SAME_TECHNICIAN' });
    await expect(build({ ticket: assigned() }).service.reassignTicket(1, { technicianId: 1, reason: 'Nghỉ' }, QUAN_LY))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

describe('Phiếu của tôi (E5) và danh sách (E1)', () => {
  const row = (over = {}) => moiTicket({ status: 'DA_PHAN_CONG', technicianId: 1, technicianName: 'Lê Văn Dũng', ...over });

  test('TC-24: kỹ thuật viên thấy số điện thoại dạng che; tài khoản chưa có hồ sơ kỹ thuật viên bị 403', async () => {
    const { service } = build({ list: [row()] });
    const res = await service.listMyTickets({ employeeId: 11, role: 'KY_THUAT_VIEN', centerId: 1 }); // employeeId 11 = kỹ thuật viên 1
    expect(res.total).toBe(1);
    expect(res.items[0].customerPhone).toBe('091****678');
    await expect(service.listMyTickets({ employeeId: 999, role: 'KY_THUAT_VIEN', centerId: 1 })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  test('TC-25: danh sách cho quản lý thấy số đầy đủ, cho tiếp nhận thì che (NFR2); isOverdue theo hạn cam kết', async () => {
    const { service } = build({ list: [row({ dueDate: new Date('2026-10-19T00:00:00Z') })] });
    const ql = await service.listTickets(QUAN_LY, { status: 'DA_PHAN_CONG', page: 1, pageSize: 20 });
    expect(ql.items[0].customerPhone).toBe('0912345678');
    expect(ql.items[0].isOverdue).toBe(true);
    const tn = await service.listTickets({ ...QUAN_LY, role: 'TIEP_NHAN' }, { status: 'DA_PHAN_CONG', page: 1, pageSize: 20 });
    expect(tn.items[0].customerPhone).toBe('091****678');
  });
});

describe('Danh sách có bộ lọc (TD-19)', () => {
  test('TC-55: chuyển bộ lọc xuống lớp dữ liệu; trả kèm totalAll và overdue để giao diện phân biệt "chưa có dữ liệu" với "bộ lọc không ra kết quả"', async () => {
    const { service, ticketRepo } = build();
    ticketRepo.listByCenterAndStatus.mockResolvedValueOnce({ items: [], total: 0, totalAll: 21, overdue: 0 });
    const res = await service.listTickets(QUAN_LY, { status: 'MOI', page: 2, pageSize: 10, q: 'zzz', priority: 'CAO' });
    expect(ticketRepo.listByCenterAndStatus).toHaveBeenCalledWith(1, 'MOI', { limit: 10, offset: 10, q: 'zzz', priority: 'CAO' });
    expect(res).toMatchObject({ items: [], total: 0, totalAll: 21, overdue: 0, filter: { q: 'zzz', priority: 'CAO' } });
  });
});

