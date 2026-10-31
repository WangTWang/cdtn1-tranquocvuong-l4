# Phân công kỹ thuật viên và lịch hẹn – Smart CRM Mekong Mobile

**Sinh viên:** Trần Quốc Vương - 2374802010577 - Track SE  
**Học phần:** Chuyên đề Tốt nghiệp 1, HK1 2026-2027  
**Luồng nghiệp vụ:** L4 – Phân công kỹ thuật viên và lịch hẹn

## 1. Mục tiêu
Hệ thống giúp quản lý trung tâm bảo hành của Mekong Mobile phân công phiếu bảo hành cho kỹ thuật viên theo tay nghề, trung tâm và khối lượng công việc hiện tại, thay cho việc phân công thủ công theo trí nhớ. Kỹ thuật viên xem được phiếu của mình theo hạn cam kết; nhân viên tiếp nhận đặt lịch hẹn giao – nhận máy không trùng lịch.

## 2. Yêu cầu môi trường
- Node.js 20 LTS trở lên (ghi trong `.nvmrc`; đã chạy thử trên Node 20, 22, 24), npm 10 trở lên
- PostgreSQL 16 (đang chạy, biết mật khẩu user `postgres`)
- Trình duyệt Chrome / Edge bản mới (giao diện React)
- Biến môi trường: xem `.env.example` (`DB_*`, `JWT_SECRET`, `DEMO_PASSWORD`, `PORT`, `LOG_LEVEL`)
- Phiên bản thư viện được khóa bằng `package-lock.json` (API) và `web/package-lock.json` (giao diện); bước 1 và 2 dùng `npm ci` nên cài đúng bản đã khóa

## 3. Hướng dẫn chạy
Chạy lần lượt từng lệnh trong thư mục gốc của repo (Git Bash):

1. Cài thư viện API đúng phiên bản đã khóa: `npm ci`
2. Cài thư viện giao diện đúng phiên bản đã khóa: `npm run web:install` (chạy `npm ci --prefix web`)
3. Tạo file cấu hình: `cp .env.example .env` rồi mở `.env`, điền `DB_PASSWORD` (mật khẩu PostgreSQL) và đổi `JWT_SECRET` thành chuỗi bí mật riêng
4. Tạo cơ sở dữ liệu trống (tên lấy từ `DB_NAME` trong `.env`): `npm run db:create`
5. Tạo bảng: `npm run db:migrate`
6. Nạp dữ liệu mẫu Mekong Mobile và tài khoản: `npm run db:seed`
7. Chạy kiểm thử: `npm test` (không cần PostgreSQL) và `npm run test:db` (test đồng thời, cần PostgreSQL)
8. Build giao diện: `npm run web:build`
9. Chạy: `npm start` → mở http://localhost:3000 (giao diện) · http://localhost:3000/health (kiểm tra API)

**Dữ liệu mẫu:** 6 trung tâm, 38 kỹ thuật viên, 381 khách hàng, 154 phiếu. Khách hàng lấy từ `data/mau/customers_raw.csv` (dữ liệu mẫu Mekong Mobile trong repo mẫu của giảng viên), đã chuẩn hóa số điện thoại và loại trùng; xem `data/README.md`. Thời điểm tiếp nhận tính lùi từ lúc nạp nên danh sách luôn có phiếu sắp hạn và quá hạn.

Bước 5 và 6 chạy lại lần hai không lỗi và không nhân đôi dữ liệu (migration đã chạy được ghi trong bảng `schema_migrations`; seed dùng `ON CONFLICT DO NOTHING`).
Muốn đưa dữ liệu mẫu về như ban đầu (ví dụ sau khi đã bấm thử phân công): `npm run db:reset -- --yes` – lệnh này **xóa toàn bộ dữ liệu** của CSDL `cdtn1_l4` rồi migrate + seed lại, và từ chối chạy nếu tên CSDL không bắt đầu bằng `cdtn1`.

**Log và xử lý lỗi:** API ghi log JSON ra màn hình (mỗi dòng một sự kiện: thời điểm, mức, mô tả, `requestId`), mức lấy từ `LOG_LEVEL`; mật khẩu, token, số điện thoại không bao giờ ghi vào log. Mỗi phản hồi có header `X-Request-Id`. Lỗi hệ thống trả 500, mất kết nối CSDL trả 503, kèm câu "Mã tra cứu: <requestId>" để đối chiếu với log. `/health` trả `{"status":"ok","db":"ok"}` khi API và CSDL đều trả lời được.

**Kiểm tra hệ thống đã chạy đúng** (sau bước 9):
1. `curl http://localhost:3000/health` → `{"status":"ok","db":"ok"}`.
2. Mở http://localhost:3000, đăng nhập `tram` → thấy "Phiếu chờ phân công" với dòng "21 phiếu chờ phân công · … phiếu đã quá hạn cam kết".
3. Gõ `pham` vào ô tìm kiếm, bấm Lọc → chỉ còn phiếu của khách họ Phạm; gõ `zzz` → thông báo "Không có phiếu … khớp bộ lọc" kèm nút Xóa bộ lọc.
4. Bấm "Phân công" ở phiếu BH-000118/2026 → chọn kỹ thuật viên → bấm "Phân công" → khung xanh "Đã phân công…".

**Sơ đồ kiến trúc đã hiện thực:** `docs/architecture-thuc-te.png` (nguồn `docs/architecture-thuc-te.dot`); sơ đồ dự kiến ở BT1: `docs/architecture.png`.

Khi sửa giao diện: chạy `npm start` ở một cửa sổ và `npm run web:dev` ở cửa sổ khác, mở http://localhost:5173 (tự tải lại khi sửa mã, `/api` được chuyển sang cổng 3000).

**Tài khoản mẫu** (mật khẩu chung là giá trị `DEMO_PASSWORD` trong `.env`):

| Tên đăng nhập | Họ tên | Vai trò | Dùng để thử |
|---|---|---|---|
| `tram` | Trần Thị Trâm | QUAN_LY – Quận 10 | Danh sách phiếu, gợi ý, phân công, đổi kỹ thuật viên |
| `lan` | Nguyễn Thị Lan | TIEP_NHAN – Quận 10 | Đặt lịch hẹn, thấy số điện thoại dạng che |
| `dung`, `khoi`, `tung` | Lê Văn Dũng, Phạm Minh Khôi, Võ Thanh Tùng | KY_THUAT_VIEN – Quận 10 | Phiếu của tôi |
| `phat` | Huỳnh Văn Phát | KY_THUAT_VIEN, chưa có hồ sơ kỹ thuật viên | Thử báo lỗi 403 |
| `hanh` | Đỗ Thị Hạnh | QUAN_LY – Cần Thơ | Thử QT-14 (không thấy phiếu Quận 10) |
| `ql_ag`, `ql_dt`, `ql_vl`, `ql_kg` · `tn_ct`, `tn_ag`, `tn_dt`, `tn_vl`, `tn_kg` | (sinh từ dữ liệu mẫu) | QUAN_LY / TIEP_NHAN các trung tâm An Giang, Đồng Tháp, Vĩnh Long, Kiên Giang, Cần Thơ | Thử dữ liệu từng trung tâm |

**Gọi API bằng curl** (lấy token bằng đăng nhập, hoặc `npm run token -- <mã nhân viên>`):

```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"tram","password":"<DEMO_PASSWORD>"}' http://localhost:3000/api/auth/login
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/api/tickets?status=MOI"
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/tickets/1/technician-suggestions
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d '{"technicianId":1}' http://localhost:3000/api/tickets/1/assignment
```

**Màn hình (theo wireframe BT1, `docs/design.md` mục 3):**

| Màn hình | Đường dẫn | Vai trò | Wireframe · Endpoint |
|---|---|---|---|
| Đăng nhập | `/login` | mọi vai trò | E0 |
| Danh sách phiếu (chờ phân công / đã phân công) | `/tickets` | QUAN_LY | Wireframe 1 · E1 |
| Phân công / đổi kỹ thuật viên | `/tickets/:id/assign` | QUAN_LY | Wireframe 2 · E2, E3, E4 |
| Chọn phiếu và đặt lịch hẹn | `/appointments`, `/tickets/:id/appointment` | TIEP_NHAN | Wireframe 3 · E1, E6 |
| Phiếu của tôi | `/my-tickets` | KY_THUAT_VIEN | E5 |

Mỗi màn hình được bọc bằng component `DataState` (`web/src/components/DataState.jsx`), đủ ba trạng thái: đang tải (khung xương), rỗng (câu giải thích + gợi ý), lỗi (chuyện gì · làm gì tiếp + nút Thử lại). Token lưu trong `sessionStorage`, hết hạn hoặc sai thì tự về trang đăng nhập.

**Endpoint đã có:**

| Phương thức · Đường dẫn | Vai trò | Chức năng |
|---|---|---|
| `POST /api/auth/login` | không cần token | E0 – Đăng nhập, trả JWT |
| `GET /api/tickets?status=MOI\|DA_PHAN_CONG&q=&priority=` | QUAN_LY; TIEP_NHAN chỉ `DA_PHAN_CONG` | E1 – Danh sách phiếu theo hạn cam kết, phân trang, lọc theo mã phiếu / tên khách (không cần dấu) và mức ưu tiên; trả kèm số phiếu quá hạn |
| `GET /api/tickets/:ticketId` | mọi vai trò cùng trung tâm | Xem một phiếu |
| `GET /api/tickets/:ticketId/technician-suggestions` | QUAN_LY | E2 – Gợi ý kỹ thuật viên (QT-08) |
| `POST /api/tickets/:ticketId/assignment` | QUAN_LY | E3 – Phân công (transaction, NFR3) |
| `PUT /api/tickets/:ticketId/assignment` | QUAN_LY | E4 – Đổi kỹ thuật viên, bắt buộc lý do (QT-07) |
| `GET /api/technicians/me/tickets` | KY_THUAT_VIEN | E5 – Phiếu của tôi |
| `GET`, `POST`, `PUT`, `DELETE /api/technicians` | QUAN_LY | CRUD kỹ thuật viên (xóa mềm, QT-13) |
| `POST /api/tickets/:ticketId/appointments` | TIEP_NHAN | E6 – Đặt lịch hẹn (RB-02, RB-03) |
| `GET /api/tickets/:ticketId/appointments` | mọi vai trò | Lịch hẹn của một phiếu |
| `GET`, `PUT`, `DELETE /api/appointments/:id` | TIEP_NHAN, QUAN_LY (sửa, hủy) | Xem / đổi lịch / hủy lịch hẹn (xóa mềm) |

## 4. Cấu trúc thư mục
Mỗi lớp trong sơ đồ kiến trúc (`docs/architecture.drawio`) là một thư mục trong `src/`:

- `src/routes/` – lớp trình bày: chỉ dịch HTTP ↔ nghiệp vụ
- `src/validators/` – tầng 1: kiểm định dạng dữ liệu vào
- `src/services/` – lớp nghiệp vụ: toàn bộ quy tắc QT/RB, không biết HTTP
- `src/repositories/` – lớp truy cập dữ liệu: chỉ đọc/ghi PostgreSQL
- `src/contracts/` – hợp đồng dữ liệu ở ranh giới service → trình bày (`toTicketView`, che số điện thoại QT-15)
- `src/middlewares/` – gắn `requestId`, xác thực JWT, phân quyền, middleware lỗi duy nhất (dịch lỗi sang mã HTTP, ghi log một lần)
- `src/errors/`, `src/utils/logger.js` – loại lỗi của ứng dụng (`AppError`, `DataAccessError`), logger JSON
- `src/config/db.js` – kết nối PostgreSQL, hàm chạy transaction
- `db/migrations/` – tạo bảng (đúng DDL đã nộp ở BT1, `db/schema.sql`); `db/seeds/` – dữ liệu mẫu
- `scripts/` – tạo CSDL, migrate, seed, sinh seed từ dữ liệu mẫu, reset, tạo token thử
- `data/mau/` – dữ liệu mẫu Mekong Mobile (CSV thô) dùng sinh `db/seeds/003_mekong_mau.sql`
- `web/` – giao diện React (Vite): `src/api/client.js` là lớp duy nhất gọi API, `src/pages/` là các màn hình
- `tests/` – unit test (service, validator, hợp đồng, phân quyền; không cần CSDL); `tests/db/` – test đồng thời trên PostgreSQL thật
- `docs/` – tài liệu BT1, `thay-doi-thiet-ke.md`, `ai-disclosure.md`

## 5. Kiểm thử
`npm test` – 58 unit test, không cần PostgreSQL. `npm run test:db` – 5 test trên PostgreSQL thật (4 test đồng thời, 1 test bộ lọc).

| Loại | Test |
|---|---|
| Luồng đúng | TC-01 đặt lịch hẹn · TC-08 đổi lịch, hủy lịch · TC-09 tạo kỹ thuật viên · TC-16 phân công · TC-22 đổi kỹ thuật viên · TC-30 đăng nhập · TC-38 đúng vai trò được qua |
| Giá trị biên | TC-02, TC-03 chạm biên RB-02 · TC-04 23:30 thứ Bảy / 00:00 Chủ nhật · TC-18 tay nghề đúng 3 / 2 (QT-08) · TC-33 pageSize 100 / 101 · TC-43 hai lịch nối tiếp đặt cùng lúc |
| Dữ liệu sai | TC-05, TC-06, TC-07, TC-10–TC-14 · TC-17 phiếu đã phân công · TC-19, TC-20 kỹ thuật viên / phiếu không hợp lệ · TC-23 lý do dưới 5 ký tự · TC-31 sai mật khẩu · TC-34, TC-35, TC-39 |
| Chuẩn hóa dữ liệu mẫu | TC-44 số điện thoại +84 / 84 / khoảng trắng · TC-45 giá trị biên 9 và 11 số, dữ liệu hỏng · TC-46 loại khách trùng |
| Bộ lọc danh sách (TD-19) | TC-54 q, priority: biên 50 ký tự, NFC · TC-55 trả `totalAll`, `overdue` · TC-56 (`test:db`) tìm không dấu, `%` không thành ký tự đại diện |
| Hợp đồng dữ liệu (buổi 9) | TC-26 đủ trường, ISO 8601 · TC-27 ý nghĩa của null · TC-28 che số điện thoại · TC-29 isOverdue |
| Log và xử lý lỗi (buổi 11) | TC-47 che dữ liệu nhạy cảm trong log · TC-48 mức log · TC-49 mất CSDL → 503 + mã tra cứu, ghi đúng một dòng ERROR · TC-50 lỗi nghiệp vụ không ghi ERROR · TC-51 nhận ra lỗi kết nối · TC-52 ROLLBACK lỗi không che lỗi gốc · TC-53 header X-Request-Id, /health báo CSDL |
| Phân quyền (NFR2) | TC-07, TC-11, TC-20 khác trung tâm → 403 · TC-24, TC-25, TC-28 che số điện thoại · TC-36 sai vai trò → 403 · TC-37 không token → 401 |
| Đồng thời (NFR3, `test:db`) | TC-40 hai quản lý phân công cùng phiếu → đúng 1 thành công · TC-41 năm lệnh cùng lúc · TC-42 hai lịch chồng lấn cùng lúc → đúng 1 thành công |

## 6. Trạng thái hiện tại
- [x] Khởi tạo repo, cấu trúc thư mục, smoke test `/health` (buổi 2)
- [x] SRS rút gọn và Use Case Diagram (buổi 3–4)
- [x] API contract, 7 User Story, file Use Case draw.io (buổi 4)
- [x] Kiến trúc, ERD + DDL, wireframe – hoàn tất Bài tập 1 (buổi 5–6)
- [x] Sprint 1 (buổi 8): migration + seed, CRUD kỹ thuật viên và lịch hẹn, RB-02, RB-03, 14 unit test
- [x] Buổi 8: đọc phản hồi BT1 (9.5/10), ghi quyết định điều chỉnh vào `docs/thay-doi-thiet-ke.md` (TD-01 → TD-03); kết quả gọi thử API lưu ở `docs/ket-qua-goi-api-buoi8.md`
- [x] Buổi 10 (Sprint 2): đăng nhập (TD-09), E1–E5, hợp đồng dữ liệu `toTicketView` (TD-13), test phân quyền và test đồng thời
- [x] Buổi 10: giao diện React 5 màn hình theo 3 wireframe, đủ ba trạng thái đang tải / rỗng / lỗi
- [x] Buổi 10: luồng chính chạy end-to-end cục bộ qua API (đăng nhập → danh sách → gợi ý → phân công → đặt lịch → phiếu của tôi) – kết quả ở `docs/ket-qua-buoi10.md`
- [x] Ảnh chụp giao diện chạy toàn luồng trên máy cá nhân – `docs/anh-chup-buoi10.md` (ảnh trong `docs/img/`)
- [x] Sửa lỗi: màn hình phân công vẫn hiện trạng thái "Mới" sau khi phân công xong (tải lại phiếu sau khi lưu)
- [x] Dữ liệu mẫu Mekong Mobile theo quy mô case study: 6 trung tâm, 38 kỹ thuật viên, 381 khách hàng, 154 phiếu (TD-16)
- [x] Phép thử "thư mục trống": clone repo sang thư mục mới, chạy đúng mục 3 – kết quả ở `docs/kiem-thu-thu-muc-trong.md`
- [x] Buổi 11: khóa phiên bản (`npm ci`, `.nvmrc`), log JSON có `requestId` và che dữ liệu nhạy cảm, middleware lỗi duy nhất (500 / 503 kèm mã tra cứu), `docs/bug-log.md` (7 lỗi đã gỡ)
- [x] Bài tập 2: tag `v0.2`; báo cáo PDF kèm đủ DDL 6 bảng (TD-02)
- [x] Đối chiếu đề bài BT2 chính thức: bộ lọc danh sách, rỗng phân biệt "chưa có dữ liệu" / "bộ lọc không ra kết quả", tỉ lệ quá hạn, sơ đồ kiến trúc thực tế (TD-19)
- [ ] Docker (`Dockerfile`, `docker-compose.yml`) – làm ở BT3 (buổi 15)
