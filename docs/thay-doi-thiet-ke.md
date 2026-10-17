# Nhật ký thay đổi thiết kế

**Luồng:** L4 – Phân công kỹ thuật viên và lịch hẹn · **Sinh viên:** Trần Quốc Vương – 2374802010577

Mỗi thay đổi có mã TD-xx và đủ bốn dòng: phản hồi / nguồn — quyết định — lý do — ảnh hưởng.
File được nối tiếp ở BT2, BT3 (tiêu chí 3 của rubric: Nhất quán & Tích lũy).

## 1. Sau phản hồi Bài tập 1 (buổi 8, ngày 17/10/2026)

Điểm BT1: 9.5/10 (Đầy đủ 9.75 · Kỹ thuật 9.25 · Nhất quán 9.5 · Trình bày 9.25).

### TD-01 NFR2 chưa có con số đo được
- **Phản hồi của GV:** NFR2 nên có con số đo được, ví dụ "100% yêu cầu xem phiếu trung tâm khác bị từ chối (403) trong bộ test phân quyền".
- **Quyết định:** SỬA.
- **Lý do:** Yêu cầu phi chức năng phải kiểm chứng được; phát biểu cũ chỉ mô tả hành vi, không có ngưỡng để test đạt hay không đạt.
- **Ảnh hưởng:** Viết lại NFR2 trong `docs/srs.md` mục 4 (100% yêu cầu sang trung tâm khác bị từ chối 403; 100% phản hồi cho vai trò không phải quản lý có số điện thoại dạng che); sửa câu lập luận NFR2 trong `docs/design.md` mục 1.4. Bộ test phân quyền hiện có TC-07, TC-11 (QT-14); test che số điện thoại bổ sung khi làm danh sách phiếu (E1) ở Sprint 2.

### TD-02 Báo cáo mới trích DDL của 3 bảng
- **Phản hồi của GV:** Mục 4.2 mới trích DDL của 3 bảng; nên đưa đủ 6 bảng cốt lõi (thêm technician, technician_skill, ticket_status_log).
- **Quyết định:** SỬA.
- **Lý do:** Người chấm phải thấy đủ khóa chính, khóa ngoại và CHECK của cả 6 bảng mà không cần mở repo.
- **Ảnh hưởng:** Thiết kế dữ liệu không đổi — `db/schema.sql` và `db/migrations/001_init.sql` đã đủ 6 bảng. Báo cáo PDF của BT2 sẽ trích đủ DDL 6 bảng cốt lõi.

### TD-03 Dòng cam kết ở phụ lục AI thiếu MSSV
- **Phản hồi của GV:** Dòng cam kết ở phụ lục AI nên ghi thêm MSSV.
- **Quyết định:** SỬA.
- **Lý do:** Xác định rõ người chịu trách nhiệm về nội dung nộp.
- **Ảnh hưởng:** `docs/ai-disclosure.md` mục III ghi "Trần Quốc Vương – MSSV 2374802010577"; phụ lục AI của các báo cáo sau ghi tương tự.

### Gợi ý của GV cho BT2 (ghi nhận, làm theo)
- Test 2 lệnh phân công đồng thời (NFR3): làm cùng endpoint phân công E3 ở Sprint 2.
- Test lịch hẹn chạm biên RB-02: đã có TC-02 (bắt đầu đúng lúc lịch cũ kết thúc → hợp lệ) và TC-03 (trễ 1 phút → trùng).

## 2. Thay đổi khi hiện thực Sprint 1 (buổi 8)

### TD-04 Thêm CRUD kỹ thuật viên
- **Nguồn:** Hiện thực module cốt lõi (BT2 yêu cầu CRUD cho ≥ 2 thực thể).
- **Quyết định:** BỔ SUNG `/api/technicians` (GET, POST, PUT, DELETE), chỉ vai trò QUAN_LY.
- **Lý do:** Cần quản lý kỹ thuật viên và tay nghề làm đầu vào cho gợi ý / phân công (FR2, QT-08).
- **Ảnh hưởng:** Thêm endpoint ngoài API contract; FR, US, UC không đổi.

### TD-05 Thêm xem / đổi lịch / hủy lịch hẹn
- **Nguồn:** Hiện thực module cốt lõi.
- **Quyết định:** BỔ SUNG `GET /api/tickets/:ticketId/appointments`, `GET`, `PUT`, `DELETE /api/appointments/:id`.
- **Lý do:** Đủ CRUD cho lịch hẹn; đổi lịch kiểm lại RB-02, RB-03; hủy là xóa mềm theo QT-13.
- **Ảnh hưởng:** E6 giữ nguyên như API contract.

### TD-06 Định dạng phản hồi và xác thực
- **Nguồn:** API contract ghi "cơ chế đăng nhập hoàn thiện ở BT2".
- **Quyết định:** Dữ liệu thành công bọc trong `{ data }`, lỗi theo `{ error: { code, message, details } }`; xác thực JWT (`Authorization: Bearer`), vai trò và trung tâm lấy từ token; tạo token thử bằng `npm run token`.
- **Lý do:** Một định dạng phản hồi thống nhất; chưa có màn hình đăng nhập.
- **Ảnh hưởng:** `src/middlewares/auth.js`, `src/middlewares/errorHandler.js`.

### TD-07 Migration có bảng theo dõi
- **Nguồn:** Tiêu chí C5 "chạy lại lần hai không lỗi, không nhân đôi dữ liệu".
- **Quyết định:** `db/migrations/001_init.sql` chép nguyên DDL BT1; thêm bảng kỹ thuật `schema_migrations`; seed dùng `ON CONFLICT DO NOTHING`.
- **Lý do:** Chạy `npm run db:migrate` và `npm run db:seed` lần hai không lỗi, không nhân đôi.
- **Ảnh hưởng:** ERD không đổi.

### TD-08 Kiểm trùng lịch (RB-02) ở lớp service
- **Nguồn:** Hiện thực E6.
- **Quyết định:** Đọc lịch hẹn của kỹ thuật viên trong ngày rồi so sánh trong service, sau khi khóa dòng kỹ thuật viên (`SELECT … FOR UPDATE`) trong cùng transaction. Lịch bắt đầu đúng lúc lịch khác kết thúc KHÔNG bị coi là trùng.
- **Lý do:** Giữ quy tắc nghiệp vụ ở lớp service, không giấu trong câu SQL; khóa để hai lịch đặt cùng lúc không lọt qua.
- **Ảnh hưởng:** Làm rõ giá trị biên của RB-02 trong `docs/srs.md`.
