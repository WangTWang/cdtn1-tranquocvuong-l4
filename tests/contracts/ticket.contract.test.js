const { toTicketView, maskPhone } = require('../../src/contracts/ticket.contract');

const row = {
  ticketId: 3, ticketCode: 'BH-000123/2026', customerName: 'Nguyễn Thị Hoa', customerPhone: '0901234567',
  deviceName: 'Mekong M5', categoryName: 'MAN_HINH', priority: 'CAO', status: 'DA_PHAN_CONG',
  receivedAt: new Date('2026-10-05T01:15:00Z'), dueDate: new Date('2026-10-06T01:15:00Z'), technicianId: 2, technicianName: 'Phạm Minh Khôi',
};
const NOW = new Date('2026-10-05T10:00:00Z');

describe('Hợp đồng dữ liệu phiếu (ranh giới service → trình bày)', () => {
  test('TC-26: đúng và đủ các trường của hợp đồng; thời gian là ISO 8601 có múi giờ +07:00', () => {
    const v = toTicketView(row, { role: 'QUAN_LY', now: NOW });
    expect(Object.keys(v).sort()).toEqual([
      'category', 'customerName', 'customerPhone', 'deviceName', 'dueDate', 'isOverdue',
      'priority', 'receivedAt', 'status', 'technician', 'ticketCode', 'ticketId']);
    expect(v.receivedAt).toBe('2026-10-05T08:15:00+07:00');
    expect(v.dueDate).toBe('2026-10-06T08:15:00+07:00');
  });

  test('TC-27: ý nghĩa của null – chưa phân công thì technician = null, chưa phân loại thì category = null', () => {
    const v = toTicketView({ ...row, technicianId: null, technicianName: null, categoryName: null, status: 'MOI' }, { role: 'QUAN_LY', now: NOW });
    expect(v.technician).toBeNull();
    expect(v.category).toBeNull();
  });

  test('TC-28: QT-15 – chỉ quản lý thấy số điện thoại đầy đủ; vai trò khác luôn là dạng che', () => {
    expect(toTicketView(row, { role: 'QUAN_LY', now: NOW }).customerPhone).toBe('0901234567');
    for (const role of ['TIEP_NHAN', 'KY_THUAT_VIEN']) {
      const phone = toTicketView(row, { role, now: NOW }).customerPhone;
      expect(phone).toBe('090****567');
      expect(phone).not.toMatch(/\d{7,}/);
    }
    expect(maskPhone(null)).toBe('***');
  });

  test('TC-29: isOverdue – chỉ true khi quá hạn và phiếu chưa đóng', () => {
    const late = new Date('2026-10-07T00:00:00Z');
    expect(toTicketView(row, { role: 'QUAN_LY', now: late }).isOverdue).toBe(true);
    expect(toTicketView({ ...row, status: 'HOAN_TAT' }, { role: 'QUAN_LY', now: late }).isOverdue).toBe(false);
    expect(toTicketView(row, { role: 'QUAN_LY', now: NOW }).isOverdue).toBe(false);
  });
});
