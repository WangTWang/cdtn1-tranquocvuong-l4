// HOP DONG DU LIEU cua mot phieu di tu lop nghiep vu ra lop trinh bay (docs/api-contract.md).
// Hinh dang (moi truong deu luon co mat, tru khi ghi "hoac null"):
//   ticketId      : so nguyen duong
//   ticketCode    : chuoi dang BH-000123/2026
//   customerName  : chuoi
//   customerPhone : chuoi 10 so voi QUAN_LY; dang che 090****567 voi vai tro khac (QT-15)
//   deviceName    : chuoi (ten dong may)
//   category      : MAN_HINH | PIN | SAC | PHAN_MEM | NUOC_VAO | KHAC, hoac null neu chua phan loai
//   priority      : CAO | TRUNG_BINH | THAP
//   status        : MOI | DA_PHAN_CONG | DANG_XU_LY | CHO_LINH_KIEN | HOAN_TAT | DA_DONG | DA_HUY
//   receivedAt, dueDate : ISO 8601 co mui gio +07:00
//   technician    : { technicianId, fullName } hoac null neu chua phan cong
//   isOverdue     : boolean - qua han cam ket va phieu chua dong (Y NGHIA: dueDate < bay gio)
// Y nghia dac biet: technician = null nghia la CHUA PHAN CONG (khong phai loi).
// Lop trinh bay KHONG bao gio doc cot cua bang; moi thay doi ten cot chi sua o ham nay.
const { toVnIso } = require('../utils/time');

const FINISHED = ['HOAN_TAT', 'DA_DONG', 'DA_HUY'];

// QT-15: giu 3 so dau va 3 so cuoi, che phan giua.
function maskPhone(phone) {
  if (typeof phone !== 'string' || phone.length < 7) return '***';
  return `${phone.slice(0, 3)}${'*'.repeat(phone.length - 6)}${phone.slice(-3)}`;
}

/**
 * Doi mot dong du lieu tu repository thanh doi tuong cua hop dong.
 * @param {object} row  dong tu ticket.repository (da noi bang customer, device, category, technician)
 * @param {{role: string, now: Date}} viewer  vai tro nguoi xem (quyet dinh che so dien thoai) va thoi diem hien tai
 * @returns {object} doi tuong dung hinh dang nhu mo ta o dau file
 */
function toTicketView(row, { role, now }) {
  return {
    ticketId: row.ticketId,
    ticketCode: row.ticketCode,
    customerName: row.customerName,
    customerPhone: role === 'QUAN_LY' ? row.customerPhone : maskPhone(row.customerPhone),
    deviceName: row.deviceName,
    category: row.categoryName ?? null,
    priority: row.priority,
    status: row.status,
    receivedAt: toVnIso(row.receivedAt),
    dueDate: toVnIso(row.dueDate),
    technician: row.technicianId == null ? null : { technicianId: row.technicianId, fullName: row.technicianName },
    isOverdue: !FINISHED.includes(row.status) && row.dueDate < now,
  };
}

module.exports = { toTicketView, maskPhone };
