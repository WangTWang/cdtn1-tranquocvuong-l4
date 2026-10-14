# Ghi chú thay đổi thiết kế so với Bài tập 1

**Luồng:** L4 – Phân công kỹ thuật viên và lịch hẹn · **Cập nhật:** Sprint 1 (buổi 8)

## 1. Phản hồi Bài tập 1 của giảng viên

| Ngày | Góp ý của giảng viên | Đã xử lý thế nào |
|---|---|---|
| (điền khi nhận phản hồi ở buổi 8) | | |

## 2. Thay đổi và bổ sung khi hiện thực

| # | Thay đổi | Lý do | Ảnh hưởng tới tài liệu BT1 |
|---|---|---|---|
| 1 | Thêm CRUD kỹ thuật viên `/api/technicians` (GET, POST, PUT, DELETE) | Cần quản lý dữ liệu kỹ thuật viên và tay nghề để có đầu vào cho gợi ý / phân công (FR2, QT-08); BT2 yêu cầu CRUD cho ≥ 2 thực thể | Bổ sung, không đổi FR/US; chỉ vai trò QUAN_LY được dùng |
| 2 | Thêm xem / đổi lịch / hủy lịch hẹn: `GET /api/tickets/:ticketId/appointments`, `GET`, `PUT`, `DELETE /api/appointments/:id` | Đủ CRUD cho lịch hẹn; đổi lịch kiểm lại RB-02, RB-03; hủy = xóa mềm theo QT-13 | E6 giữ nguyên như API contract |
| 3 | Đường dẫn gốc vẫn là `/api`; lỗi trả về `{ error: { code, message, details } }`; dữ liệu thành công bọc trong `{ data: ... }` | Thống nhất một định dạng phản hồi cho mọi endpoint | Bổ sung vào quy ước chung của API contract |
| 4 | Xác thực bằng JWT (header `Authorization: Bearer`), vai trò và trung tâm lấy từ token | API contract ghi "cơ chế đăng nhập hoàn thiện ở BT2"; chưa có màn hình đăng nhập nên dùng `npm run token` để tạo token thử | Không đổi |
| 5 | Migration `db/migrations/001_init.sql` chép nguyên DDL ở `db/schema.sql`; thêm bảng kỹ thuật `schema_migrations` | Chạy migration lần hai không lỗi (tiêu chí C5) | ERD không đổi |
| 6 | Trùng lịch (RB-02) kiểm trong lớp service: đọc lịch hẹn của kỹ thuật viên trong ngày rồi so sánh, sau khi khóa dòng kỹ thuật viên (`SELECT … FOR UPDATE`) trong cùng transaction | Giữ quy tắc nghiệp vụ ở lớp service, không giấu trong câu SQL; khóa để hai lịch đặt cùng lúc không lọt qua | Không đổi |
| 7 | Lịch hẹn bắt đầu đúng lúc lịch khác kết thúc được coi là KHÔNG trùng | Làm rõ giá trị biên của RB-02 | Bổ sung giải thích cho RB-02 |
