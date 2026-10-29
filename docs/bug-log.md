# Bug Log – Luồng L4: Phân công kỹ thuật viên và lịch hẹn

**Sinh viên:** Trần Quốc Vương – 2374802010577 · Mỗi lỗi ghi đủ 7 dòng theo mẫu buổi 11, gỡ theo bốn bước: tái lập → khoanh vùng → sửa nguyên nhân → xác nhận bằng test. Link commit mở được trên GitHub.

| Mã | Mức độ | Tóm tắt | Ngày |
|---|---|---|---|
| BUG-001 | Minor | Màn hình phân công vẫn hiện trạng thái "Mới" sau khi phân công xong | 24/10/2026 |
| BUG-002 | Major | `npm run test:db` không chạy test đồng thời, báo PASS giả | 21/10/2026 |
| BUG-003 | Minor | 5 test phân quyền treo 5 giây rồi FAIL dù API trả đúng | 21/10/2026 |
| BUG-004 | Major | Hủy lịch hẹn thất bại nhưng màn hình không báo gì | 30/10/2026 |
| BUG-005 | Major | Log lỗi hệ thống có thể chứa số điện thoại khách | 30/10/2026 |
| BUG-006 | Major | Lỗi ROLLBACK che mất lỗi gốc của transaction | 30/10/2026 |
| BUG-007 | Minor | CSDL tắt nhưng API trả 500 thay vì 503 | 30/10/2026 |

---

### BUG-001 · Minor
1. **Mã và mức độ:** BUG-001 · Minor – hiển thị sai, dữ liệu trong CSDL vẫn đúng.
2. **Phát hiện bởi:** Kiểm thử thủ công khi chụp ảnh minh chứng buổi 10 (ảnh `docs/img/buoi10-4-phan-cong-thanh-cong.png`).
3. **Triệu chứng:** Bấm "Phân công" thành công, khung xanh báo đã phân công, nhưng khung thông tin phiếu phía trên vẫn ghi "Mới" và không có kỹ thuật viên.
4. **Cách tái lập:** Đăng nhập `tram` → Phân công phiếu BH-000118/2026 → chọn kỹ thuật viên → bấm "Phân công" → nhìn khung thông tin phiếu (lặp lại 3/3 lần).
5. **Nguyên nhân:** `AssignPage` tải phiếu MỘT lần khi mở trang (`useAsync`) và không tải lại sau khi lưu; khung thông tin hiển thị bản đọc cũ trước khi phân công.
6. **Cách sửa:** Sau khi phân công / đổi người thành công, gọi `ticket.reload()` để đọc lại phiếu từ API (`web/src/pages/AssignPage.jsx`). Không sửa bằng cách tự gán chữ "Đã phân công" trên giao diện – dữ liệu hiển thị luôn lấy từ API.
7. **Commit và xác nhận:** [977c44b](https://github.com/WangTWang/cdtn1-tranquocvuong-l4/commit/977c44b) · chạy lại các bước ở dòng 4: khung thông tin hiện "Đã phân công" và tên kỹ thuật viên mới.

### BUG-002 · Major
1. **Mã và mức độ:** BUG-002 · Major – yêu cầu NFR3 (hai lệnh phân công đồng thời) tưởng đã kiểm mà thật ra chưa.
2. **Phát hiện bởi:** Đọc kết quả `npm run test:db`: báo "Tests: 45 passed" – đúng bằng số unit test, trong khi tệp `tests/db/` chỉ có 4 test.
3. **Triệu chứng:** Lệnh test đồng thời báo PASS nhưng không có test nào trong `tests/db/` được chạy; bảng `ticket` không có phiếu `TEST-…` nào được tạo.
4. **Cách tái lập:** `npm run test:db` với script cũ `jest --runInBand --testPathIgnorePatterns /node_modules/ tests/db` → in ra danh sách test của `tests/services/`, không có TC-40 → TC-43.
5. **Nguyên nhân:** Tùy chọn `--testPathIgnorePatterns` nhận NHIỀU giá trị nên nuốt luôn `tests/db` thành một mẫu BỎ QUA; jest chạy toàn bộ unit test và bỏ qua đúng thư mục cần chạy.
6. **Cách sửa:** Tách cấu hình riêng `jest.db.config.js` (`testMatch: tests/db/**`) và đổi script thành `jest --runInBand --config jest.db.config.js`; `npm test` vẫn bỏ qua `tests/db/` nhờ `testPathIgnorePatterns` trong `package.json`.
7. **Commit và xác nhận:** [76b970e](https://github.com/WangTWang/cdtn1-tranquocvuong-l4/commit/76b970e) · `npm run test:db` báo 4/4 PASS với tên TC-40 → TC-43. Kiểm thêm: bỏ khóa `FOR UPDATE` của kỹ thuật viên thì TC-42 FAIL – chứng tỏ test thật sự chạy và kiểm được NFR3.

### BUG-003 · Minor
1. **Mã và mức độ:** BUG-003 · Minor – lỗi trong mã test, không ảnh hưởng chức năng.
2. **Phát hiện bởi:** Chạy `npm test` sau khi viết `tests/routes/permissions.test.js`.
3. **Triệu chứng:** 5 trường hợp của TC-36 FAIL với "Exceeded timeout of 5000 ms … waiting for `done()`", cả bộ test chạy 27 giây thay vì 1 giây.
4. **Cách tái lập:** `npx jest tests/routes` với bảng `test.each` có dòng 3 phần tử (không có body) và hàm test 4 tham số.
5. **Nguyên nhân:** Khi số phần tử của một dòng ít hơn số tham số của hàm, Jest coi tham số thừa là callback `done` và chờ nó được gọi; hàm test không gọi nên treo đến hết thời gian chờ.
6. **Cách sửa:** Mọi dòng của `test.each` đủ 4 phần tử (body là `null` khi không gửi), để hàm luôn nhận đúng tham số.
7. **Commit và xác nhận:** [76b970e](https://github.com/WangTWang/cdtn1-tranquocvuong-l4/commit/76b970e) · `npm test` PASS toàn bộ trong khoảng 1–2 giây.

### BUG-004 · Major
1. **Mã và mức độ:** BUG-004 · Major – người dùng tưởng đã hủy lịch trong khi thao tác thất bại.
2. **Phát hiện bởi:** Rà mã theo buổi 11 ("năm kiểu xử lý lỗi sai" – nuốt lỗi), xác nhận bằng trình duyệt.
3. **Triệu chứng:** Bấm "Hủy lịch" khi API lỗi (mất kết nối CSDL, phiên hết hạn): nút trở lại bình thường, không có thông báo nào; lỗi chỉ hiện trong console của trình duyệt.
4. **Cách tái lập:** Đăng nhập `lan` → mở phiếu có lịch hẹn → tắt PostgreSQL → bấm "Hủy lịch".
5. **Nguyên nhân:** `CancelButton` dùng `try { … } finally { … }` không có `catch`: lỗi API thành promise bị từ chối không ai xử lý, giao diện không biết thao tác thất bại.
6. **Cách sửa:** Bắt lỗi trong `CancelButton`, hiện `ErrorBox` (chuyện gì · làm gì tiếp · mã tra cứu); chỉ tải lại danh sách khi hủy THÀNH CÔNG (`web/src/pages/AppointmentPage.jsx`).
7. **Commit và xác nhận:** [00e74a4](https://github.com/WangTWang/cdtn1-tranquocvuong-l4/commit/00e74a4) · chạy lại dòng 4: hiện khung đỏ "Hệ thống tạm thời không truy cập được dữ liệu… Mã tra cứu: …".

### BUG-005 · Major
1. **Mã và mức độ:** BUG-005 · Major (bảo mật) – vi phạm QT-15 và quy tắc "không ghi dữ liệu cá nhân vào log" của buổi 11.
2. **Phát hiện bởi:** Rà mã theo buổi 11 (thứ tuyệt đối không ghi vào log).
3. **Triệu chứng:** Middleware lỗi cũ in `console.error(…, err)` – nguyên đối tượng lỗi. Lỗi trùng khóa của PostgreSQL (mã 23505) có trường `detail` dạng `Key (phone)=(0901234567) already exists.` nên số điện thoại khách đi thẳng vào log.
4. **Cách tái lập:** Đưa một lỗi pg mã 23505 có `detail` chứa số điện thoại vào middleware lỗi cũ → dòng log chứa nguyên số (dữ liệu tái lập ở test TC-47).
5. **Nguyên nhân:** Không có logger chung; mỗi chỗ tự in đối tượng lỗi, không chọn trường, không che trường nhạy cảm.
6. **Cách sửa:** Thêm `src/utils/logger.js`: chỉ ghi `name, code, message, stack` của lỗi (không ghi `detail`), tự che mọi khóa mật khẩu / token / số điện thoại ở mọi tầng; middleware lỗi ghi log ĐÚNG MỘT LẦN kèm `requestId`.
7. **Commit và xác nhận:** [74bd731](https://github.com/WangTWang/cdtn1-tranquocvuong-l4/commit/74bd731) · test TC-47 (log không chứa `0901234567`, `Bearer …`, mật khẩu) và TC-49 PASS.

### BUG-006 · Major
1. **Mã và mức độ:** BUG-006 · Major – lỗi thật của nghiệp vụ bị che, người dùng nhận thông báo sai.
2. **Phát hiện bởi:** Rà `withTransaction` theo buổi 11 (lỗi đi qua các lớp), xác nhận bằng test.
3. **Triệu chứng:** Khi kết nối CSDL rớt giữa transaction, lệnh `ROLLBACK` cũng lỗi; lỗi của `ROLLBACK` được ném ra thay cho lỗi gốc (ví dụ "Phiếu đã được phân công" bị thay bằng lỗi hệ thống 500).
4. **Cách tái lập:** Test TC-52: client giả ném lỗi ở `ROLLBACK`, hàm nghiệp vụ ném `TICKET_ALREADY_ASSIGNED` → bản cũ ném lỗi "Connection terminated", không phải lỗi gốc.
5. **Nguyên nhân:** `catch (err) { await client.query('ROLLBACK'); throw err; }` – nếu `ROLLBACK` ném lỗi thì dòng `throw err` không bao giờ chạy.
6. **Cách sửa:** Bọc `ROLLBACK` trong `try/catch` riêng: lỗi rollback chỉ ghi WARN, luôn ném lại lỗi gốc; lỗi kết nối được dịch thành `DataAccessError` ở lớp dữ liệu (`src/config/db.js`).
7. **Commit và xác nhận:** [e6ea8c2](https://github.com/WangTWang/cdtn1-tranquocvuong-l4/commit/e6ea8c2) · TC-52 FAIL với mã cũ, PASS sau khi sửa; toàn bộ test PASS.

### BUG-007 · Minor
1. **Mã và mức độ:** BUG-007 · Minor – sai mã lỗi, người dùng vẫn được báo lỗi.
2. **Phát hiện bởi:** Kiểm thử thủ công sau khi thêm mã 503: tắt PostgreSQL khi API đang chạy rồi gọi `GET /api/tickets?status=MOI`.
3. **Triệu chứng:** API trả 500 `INTERNAL_ERROR` thay vì 503 `SERVICE_UNAVAILABLE`.
4. **Cách tái lập:** Kết nối CSDL qua socket cục bộ, tắt PostgreSQL, gọi lại API → log ghi `connect ENOENT /tmp/.s.PGSQL.5546`.
5. **Nguyên nhân:** Hàm `isConnectionError` chỉ nhận các mã ECONNREFUSED, 08xxx, 57Pxx…; lỗi hệ điều hành ENOENT khi MỞ kết nối (không có tệp socket) không nằm trong danh sách nên bị coi là lỗi lạ.
6. **Cách sửa:** Coi mọi lỗi phát sinh ở bước mở kết nối (`syscall === 'connect'`) là "không kết nối được CSDL" (`src/errors/DataAccessError.js`); lỗi ENOENT khi đọc tệp vẫn là lỗi khác.
7. **Commit và xác nhận:** [e6ea8c2](https://github.com/WangTWang/cdtn1-tranquocvuong-l4/commit/e6ea8c2) · TC-51 PASS; chạy lại dòng 4: 503 kèm mã tra cứu.
