// Doi loi API thanh thong bao 3 phan cho nguoi dung: chuyen gi - vi sao - lam gi tiep (buoi 9, muc 2).
// KHONG bao gio hien chi tiet ky thuat.
const HINT = {
  NETWORK: 'Kiểm tra mạng và bảo đảm máy chủ đang chạy, rồi bấm Thử lại. Dữ liệu đã nhập vẫn được giữ.',
  INTERNAL_ERROR: 'Bấm Thử lại sau ít phút. Nếu vẫn lỗi, báo quản trị hệ thống kèm mã tra cứu ở trên.',
  TICKET_ALREADY_ASSIGNED: 'Quay lại danh sách để xem phiếu còn chờ, hoặc dùng "Đổi kỹ thuật viên" nếu cần.',
  TICKET_NOT_CATEGORIZED: 'Cần nhân viên tiếp nhận bổ sung nhóm sự cố cho phiếu trước khi phân công.',
  TECHNICIAN_NOT_ELIGIBLE: 'Chọn kỹ thuật viên trong danh sách gợi ý (cùng trung tâm, tay nghề từ 3 trở lên).',
  APPOINTMENT_CONFLICT: 'Chọn khung giờ khác, hoặc dùng giờ trống gần nhất bên dưới.',
  TICKET_NOT_ASSIGNED: 'Phiếu cần được quản lý phân công kỹ thuật viên trước khi đặt lịch.',
  FORBIDDEN: 'Bạn không có quyền với thao tác này. Liên hệ quản lý trung tâm nếu cần.',
  VALIDATION_ERROR: 'Sửa các ô được nêu rồi gửi lại.',
  INVALID_CREDENTIALS: 'Kiểm tra lại tên đăng nhập và mật khẩu.',
};

export function describeError(err) {
  if (err && err.network) return { what: 'Không kết nối được tới hệ thống.', why: '', hint: HINT.NETWORK };
  if (!err || !err.code || err.status >= 500) {
    // Server da ghi san "Ma tra cuu: <requestId>" trong message (buoi 11) - hien nguyen de nguoi dung bao lai.
    const what = err && err.status >= 500 && err.message ? err.message : 'Hệ thống đang gặp sự cố.';
    return { what, why: '', hint: HINT.INTERNAL_ERROR };
  }
  return { what: err.message, why: '', hint: HINT[err.code] || '' };
}

// Loi theo truong (VALIDATION_ERROR) -> { ten truong: cau mo ta } de hien ngay canh o nhap.
export function fieldErrors(err) {
  const out = {};
  if (err && err.code === 'VALIDATION_ERROR') for (const d of err.details || []) out[d.field] = d.issue;
  return out;
}
