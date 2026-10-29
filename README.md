# Phân công kỹ thuật viên và lịch hẹn – Smart CRM Mekong Mobile

**Sinh viên:** Trần Quốc Vương - 2374802010577 - Track SE  
**Học phần:** Chuyên đề Tốt nghiệp 1, HK1 2026-2027  
**Luồng nghiệp vụ:** L4 – Phân công kỹ thuật viên và lịch hẹn

## 1. Mục tiêu
Hệ thống giúp quản lý trung tâm bảo hành của Mekong Mobile phân công phiếu bảo hành cho kỹ thuật viên theo tay nghề, trung tâm và khối lượng công việc hiện tại, thay cho việc phân công thủ công theo trí nhớ. Kỹ thuật viên xem được phiếu của mình theo hạn cam kết; nhân viên tiếp nhận đặt lịch hẹn giao – nhận máy không trùng lịch.

## 2. Yêu cầu môi trường
- Node.js 20 LTS trở lên (đang dùng v24), npm 10
- PostgreSQL 16 (đang chạy, biết mật khẩu user `postgres`)
- Trình duyệt Chrome / Edge bản mới (giao diện React)
- Biến môi trường: xem `.env.example` (`DB_*`, `JWT_SECRET`, `DEMO_PASSWORD`, `PORT`)

## 3. Hướng dẫn chạy
Chạy lần lượt từng lệnh trong thư mục gốc của repo (Git Bash):

1. Cài thư viện API: `npm install`
2. Cài thư viện giao diện: `npm run web:install`
3. Tạo file cấu hình: `cp .env.example .env` rồi mở `.env`, điền `DB_PASSWORD` (mật khẩu PostgreSQL) và `JWT_SECRET` (chuỗi bất kỳ)
4. Tạo cơ sở dữ liệu trống (tên lấy từ `DB_NAME` trong `.env`): `npm run db:create`
5. Tạo bảng: `npm run db:migrate`
6. Nạp dữ liệu mẫu Mekong Mobile và tài khoản: `npm run db:seed`
7. Chạy kiểm thử: `npm test` (không cần PostgreSQL) và `npm run test:db` (test đồng thời, cần PostgreSQL)
8. Build giao diện: `npm run web:build`
9. Chạy: `npm start` → mở http://localhost:3000 (giao diện) · http://localhost:3000/health (kiểm tra API)

**Dữ liệu mẫu:** 6 trung tâm, 38 kỹ thuật viên, 381 khách hàng, 154 phiếu. Khách hàng lấy từ `data/mau/customers_raw.csv` (dữ liệu mẫu Mekong Mobile trong repo mẫu của giảng viên), đã chuẩn hóa số điện thoại và loại trùng; xem `data/README.md`. Thời điểm tiếp nhận tính lùi từ lúc nạp nên danh sách luôn có phiếu sắp hạn và quá hạn.

Bước 5 và 6 chạy lại lần hai không lỗi và không nhân đôi dữ liệu (migration đã chạy được ghi trong bảng `schema_migrations`; seed dùng `ON CONFLICT DO NOTHING`).
Muốn đưa dữ liệu mẫu về như ban đầu (ví dụ sau khi đã bấm thử phân công): `npm run db:reset -- --yes` – lệnh này **xóa toàn bộ dữ liệu** của CSDL `cdtn1_l4` rồi migrate + seed lại, và từ chối chạy nếu tên CSDL không bắt đầu bằng `cdtn1`.

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
| `GET /api/tickets?status=MOI\|DA_PHAN_CONG` | QUAN_LY; TIEP_NHAN chỉ `DA_PHAN_CONG` | E1 – Danh sách phiếu theo hạn cam kết, phân trang |
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
- `src/middlewares/` – xác thực JWT, phân quyền, dịch lỗi sang mã HTTP
- `src/config/db.js` – kết nối PostgreSQL, hàm chạy transaction
- `db/migrations/` – tạo bảng (đúng DDL đã nộp ở BT1, `db/schema.sql`); `db/seeds/` – dữ liệu mẫu
- `scripts/` – tạo CSDL, migrate, seed, sinh seed từ dữ liệu mẫu, reset, tạo token thử
- `data/mau/` – dữ liệu mẫu Mekong Mobile (CSV thô) dùng sinh `db/seeds/003_mekong_mau.sql`
- `web/` – giao diện React (Vite): `src/api/client.js` là lớp duy nhất gọi API, `src/pages/` là các màn hình
- `tests/` – unit test (service, validator, hợp đồng, phân quyền; không cần CSDL); `tests/db/` – test đồng thời trên PostgreSQL thật
- `docs/` – tài liệu BT1, `thay-doi-thiet-ke.md`, `ai-disclosure.md`

## 5. Kiểm thử
`npm test` – 49 unit test, không cần PostgreSQL. `npm run test:db` – 4 test đồng thời trên PostgreSQL thật.

| Loại | Test |
|---|---|
| Luồng đúng | TC-01 đặt lịch hẹn · TC-08 đổi lịch, hủy lịch · TC-09 tạo kỹ thuật viên · TC-16 phân công · TC-22 đổi kỹ thuật viên · TC-30 đăng nhập · TC-38 đúng vai trò được qua |
| Giá trị biên | TC-02, TC-03 chạm biên RB-02 · TC-04 23:30 thứ Bảy / 00:00 Chủ nhật · TC-18 tay nghề đúng 3 / 2 (QT-08) · TC-33 pageSize 100 / 101 · TC-43 hai lịch nối tiếp đặt cùng lúc |
| Dữ liệu sai | TC-05, TC-06, TC-07, TC-10–TC-14 · TC-17 phiếu đã phân công · TC-19, TC-20 kỹ thuật viên / phiếu không hợp lệ · TC-23 lý do dưới 5 ký tự · TC-31 sai mật khẩu · TC-34, TC-35, TC-39 |
| Chuẩn hóa dữ liệu mẫu | TC-44 số điện thoại +84 / 84 / khoảng trắng · TC-45 giá trị biên 9 và 11 số, dữ liệu hỏng · TC-46 loại khách trùng |
| Hợp đồng dữ liệu (buổi 9) | TC-26 đủ trường, ISO 8601 · TC-27 ý nghĩa của null · TC-28 che số điện thoại · TC-29 isOverdue |
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
- [ ] Rà soát, sửa lỗi theo buổi 11; báo cáo BT2 kèm đủ DDL 6 bảng (TD-02); tag `v0.2` (hạn cuối buổi 12)
