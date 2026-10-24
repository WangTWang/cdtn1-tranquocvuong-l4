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

## 3. Thay đổi khi hiện thực Sprint 2 (buổi 10)

### TD-09 Thêm tài khoản đăng nhập cho nhân viên
- **Nguồn:** Buổi 10 yêu cầu frontend có xác thực đăng nhập; API contract BT1 ghi "cơ chế đăng nhập hoàn thiện ở BT2".
- **Quyết định:** BỔ SUNG cột `employee.username` (duy nhất) và `employee.password_hash` bằng migration mới `db/migrations/002_auth.sql`; thêm `POST /api/auth/login` trả JWT. Mật khẩu băm bằng scrypt có sẵn của Node, không lưu mật khẩu gốc.
- **Lý do:** Không sửa `001_init.sql` vì máy đã chạy file đó (bảng `schema_migrations` sẽ bỏ qua). Dùng scrypt thay vì bcrypt để không phải biên dịch thư viện native trên Windows. Sai tên và sai mật khẩu trả cùng một thông báo để không lộ tài khoản nào tồn tại.
- **Ảnh hưởng:** 6 bảng cốt lõi không đổi; bảng phụ trợ `employee` thêm 2 cột – đã cập nhật ô ghi chú bảng phụ trợ trong `docs/erd.drawio` / `erd.png`, `docs/design.md` mục 2 và cuối `db/schema.sql`; seed `002_accounts.sql` gán tên đăng nhập cho 7 nhân viên mẫu, mật khẩu mẫu lấy từ `DEMO_PASSWORD` trong `.env`. `npm run token` vẫn dùng được để thử API bằng curl.

### TD-10 Định dạng danh sách trả về
- **Nguồn:** API contract BT1 ghi E1, E5 trả `items`, `page` ở cấp ngoài cùng, trong khi TD-06 đã chốt mọi phản hồi thành công bọc trong `{ data }`.
- **Quyết định:** Thống nhất một kiểu: `{ "data": { "items": [...], "page", "pageSize", "total" } }`. E2 trả `{ "data": { ticketId, ticketCode, category, suggestions } }`.
- **Lý do:** Frontend chỉ có MỘT chỗ đọc phản hồi (`web/src/api/client.js`), không phải rẽ nhánh theo từng endpoint.
- **Ảnh hưởng:** Cập nhật `docs/api-contract.md` mục 6.

### TD-11 Mở rộng E1 và thêm xem một phiếu
- **Nguồn:** Wireframe 3 (đặt lịch hẹn) cần nhân viên tiếp nhận chọn được phiếu đã phân công; Wireframe 2 cần thông tin một phiếu.
- **Quyết định:** E1 nhận `status=MOI` (chỉ QUAN_LY) hoặc `status=DA_PHAN_CONG` (QUAN_LY và TIEP_NHAN). Thêm `GET /api/tickets/{ticketId}` cho mọi vai trò cùng trung tâm.
- **Lý do:** Không có hai endpoint này thì màn hình đặt lịch và màn hình phân công không hiện được thông tin phiếu.
- **Ảnh hưởng:** Số điện thoại vẫn che theo QT-15 với vai trò không phải quản lý; QT-14 kiểm ở service.

### TD-12 Gợi ý kỹ thuật viên dùng cả khi đổi người
- **Nguồn:** Màn hình đổi kỹ thuật viên (UC4) cần danh sách người đủ điều kiện QT-08.
- **Quyết định:** E2 nhận thêm phiếu ĐÃ PHÂN CÔNG và bỏ người đang giữ phiếu ra khỏi danh sách; phiếu ở trạng thái khác vẫn trả 409 `TICKET_NOT_ASSIGNABLE`.
- **Lý do:** Dùng lại đúng một quy tắc lọc và xếp hạng (`rankSuggestions`) cho cả phân công và đổi người.
- **Ảnh hưởng:** Thêm test TC-21b.

### TD-13 Hợp đồng dữ liệu phiếu ở ranh giới service → trình bày
- **Nguồn:** Buổi 9, phần 1 (phụ thuộc ngầm, hàm chuyển đổi ở ranh giới).
- **Quyết định:** Mọi phiếu trả ra ngoài đều đi qua `src/contracts/ticket.contract.js` (`toTicketView`); che số điện thoại (QT-15) chỉ làm ở hàm này. Test hợp đồng TC-26 → TC-29.
- **Lý do:** Đổi tên cột trong CSDL chỉ sửa một chỗ; không thể quên che số ở một màn hình nào đó.
- **Ảnh hưởng:** Lớp trình bày (routes, React) không đọc tên cột của bảng.

### TD-14 Giao diện React chạy chung cổng với API
- **Nguồn:** Buổi 10 – frontend ≥ 3 màn hình kết nối API thật.
- **Quyết định:** Frontend React + Vite trong thư mục `web/`, theo đúng 3 wireframe BT1 và thêm màn hình đăng nhập, màn hình "Phiếu của tôi". Sau `npm run web:build`, Express phục vụ luôn `web/dist` ở cổng 3000.
- **Lý do:** Chạy một lệnh `npm start` là dùng được, không gặp lỗi CORS giữa hai cổng.
- **Ảnh hưởng:** `src/app.js` thêm phần phục vụ file tĩnh; khi phát triển vẫn chạy được `npm run web:dev` (cổng 5173, chuyển tiếp `/api`).

### TD-15 Test đồng thời chạy riêng trên PostgreSQL thật
- **Nguồn:** Gợi ý của GV sau BT1 – test 2 lệnh phân công đồng thời (NFR3).
- **Quyết định:** Phân công khóa dòng phiếu (`SELECT … FOR UPDATE`) rồi đọc lại trạng thái trong cùng transaction, cộng thêm `UPDATE … WHERE status = 'MOI'`. Test TC-40 → TC-43 trong `tests/db/`, chạy bằng `npm run test:db`.
- **Lý do:** Test đồng thời phải chạy trên CSDL thật mới có ý nghĩa; tách riêng để `npm test` vẫn chạy được khi không có PostgreSQL.
- **Ảnh hưởng:** Thêm `jest.db.config.js`.

### TD-16 Dữ liệu mẫu theo quy mô case study
- **Nguồn:** Thông báo buổi 10 – luồng chính chạy end-to-end trên bộ dữ liệu mẫu Mekong Mobile; seed tự soạn ở buổi 8 chỉ có 2 trung tâm, 4 phiếu.
- **Quyết định:** BỔ SUNG `db/seeds/003_mekong_mau.sql`, sinh tự động bằng `scripts/gen-seed-mekong.js` từ `data/mau/customers_raw.csv` (dữ liệu mẫu Mekong Mobile trong repo mẫu của giảng viên): chuẩn hóa số điện thoại theo QT-02, loại bản ghi hỏng và khách trùng (402 → 378 khách). Quy mô theo case study: 6 trung tâm, 38 kỹ thuật viên, 150 phiếu mới; phiếu đã phân công luôn có kỹ thuật viên cùng trung tâm, tay nghề ≥ 3 (QT-08), kèm lịch sử trạng thái và lịch sử phân công.
- **Lý do:** Danh sách, phân trang, gợi ý kỹ thuật viên chỉ kiểm tra được thật khi có đủ dữ liệu. Giữ nguyên seed 001 (ID 1–7) để các ví dụ trong README và test không đổi. Thời điểm tiếp nhận tính lùi từ `now()` lúc nạp nên luôn có phiếu sắp hạn và quá hạn.
- **Ảnh hưởng:** Không đổi lược đồ. Thêm `npm run db:create` (tạo CSDL không cần lệnh psql), `npm run db:gen-seed`, test TC-44 → TC-46 cho hàm chuẩn hóa. Dữ liệu mẫu bỏ qua quy tắc "không tính Chủ nhật" khi tính hạn cam kết (việc tạo phiếu thuộc luồng L2).
