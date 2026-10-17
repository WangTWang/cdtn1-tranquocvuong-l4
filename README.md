# Phân công kỹ thuật viên và lịch hẹn – Smart CRM Mekong Mobile

**Sinh viên:** Trần Quốc Vương - 2374802010577 - Track SE  
**Học phần:** Chuyên đề Tốt nghiệp 1, HK1 2026-2027  
**Luồng nghiệp vụ:** L4 – Phân công kỹ thuật viên và lịch hẹn

## 1. Mục tiêu
Hệ thống giúp quản lý trung tâm bảo hành của Mekong Mobile phân công phiếu bảo hành cho kỹ thuật viên theo tay nghề, trung tâm và khối lượng công việc hiện tại, thay cho việc phân công thủ công theo trí nhớ. Kỹ thuật viên xem được phiếu của mình theo hạn cam kết; nhân viên tiếp nhận đặt lịch hẹn giao – nhận máy không trùng lịch.

## 2. Yêu cầu môi trường
- Node.js 20 LTS trở lên (đang dùng v24)
- PostgreSQL 16 (đang chạy, biết mật khẩu user `postgres`)
- Biến môi trường: xem `.env.example`

## 3. Hướng dẫn chạy
Chạy lần lượt từng lệnh trong thư mục gốc của repo (Git Bash):

1. Cài thư viện: `npm install`
2. Tạo file cấu hình: `cp .env.example .env` rồi mở `.env`, điền `DB_PASSWORD` (mật khẩu PostgreSQL) và `JWT_SECRET` (chuỗi bất kỳ)
3. Tạo cơ sở dữ liệu trống: `psql -U postgres -c "CREATE DATABASE cdtn1_l4"`
4. Tạo bảng: `npm run db:migrate`
5. Nạp dữ liệu mẫu: `npm run db:seed`
6. Chạy kiểm thử: `npm test`
7. Chạy API: `npm start` → mở http://localhost:3000/health

Bước 4 và 5 chạy lại lần hai không lỗi và không nhân đôi dữ liệu (migration đã chạy được ghi trong bảng `schema_migrations`; seed dùng `ON CONFLICT DO NOTHING`).

**Lấy token để gọi API** (mở cửa sổ Git Bash thứ hai, API vẫn chạy ở cửa sổ đầu):

```bash
npm run token -- 1   # Trần Thị Trâm – QUAN_LY, trung tâm Quận 10
npm run token -- 2   # Nguyễn Thị Lan – TIEP_NHAN, trung tâm Quận 10
npm run token -- 7   # Đỗ Thị Hạnh – QUAN_LY, trung tâm Cần Thơ (thử QT-14)
```

**Ví dụ gọi API** (thay `<TOKEN>` bằng chuỗi vừa in ra):

```bash
# Danh sách kỹ thuật viên của trung tâm (quản lý)
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/technicians
# Đặt lịch hẹn cho phiếu 3 (tiếp nhận) – trùng lịch 09:00-09:45 sẽ bị từ chối 409
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" \
  -d '{"type":"NHAN","startAt":"2026-12-01T10:00:00+07:00","endAt":"2026-12-01T10:30:00+07:00"}' \
  http://localhost:3000/api/tickets/3/appointments
```

**Endpoint đã có (Sprint 1):**

| Phương thức · Đường dẫn | Vai trò | Chức năng |
|---|---|---|
| `GET /api/technicians` | QUAN_LY | Danh sách kỹ thuật viên của trung tâm (`?includeInactive=true` để xem cả người đã ngừng) |
| `GET /api/technicians/:id` | QUAN_LY | Xem một kỹ thuật viên kèm tay nghề |
| `POST /api/technicians` | QUAN_LY | Tạo hồ sơ kỹ thuật viên `{ employeeId, level, skills }` |
| `PUT /api/technicians/:id` | QUAN_LY | Sửa `level`, `isActive`, `skills` |
| `DELETE /api/technicians/:id` | QUAN_LY | Ngừng làm việc (xóa mềm, QT-13) |
| `POST /api/tickets/:ticketId/appointments` | TIEP_NHAN | E6 – Đặt lịch hẹn (RB-02, RB-03) |
| `GET /api/tickets/:ticketId/appointments` | mọi vai trò | Lịch hẹn của một phiếu |
| `GET /api/appointments/:id` | mọi vai trò | Xem một lịch hẹn |
| `PUT /api/appointments/:id` | TIEP_NHAN, QUAN_LY | Đổi lịch (kiểm lại RB-02, RB-03) |
| `DELETE /api/appointments/:id` | TIEP_NHAN, QUAN_LY | Hủy lịch hẹn (xóa mềm, QT-13) |

## 4. Cấu trúc thư mục
Mỗi lớp trong sơ đồ kiến trúc (`docs/architecture.drawio`) là một thư mục trong `src/`:

- `src/routes/` – lớp trình bày: chỉ dịch HTTP ↔ nghiệp vụ
- `src/validators/` – tầng 1: kiểm định dạng dữ liệu vào
- `src/services/` – lớp nghiệp vụ: toàn bộ quy tắc QT/RB, không biết HTTP
- `src/repositories/` – lớp truy cập dữ liệu: chỉ đọc/ghi PostgreSQL
- `src/middlewares/` – xác thực JWT, phân quyền, dịch lỗi sang mã HTTP
- `src/config/db.js` – kết nối PostgreSQL, hàm chạy transaction
- `db/migrations/` – tạo bảng (đúng DDL đã nộp ở BT1, `db/schema.sql`); `db/seeds/` – dữ liệu mẫu
- `scripts/` – migrate, seed, tạo token thử
- `tests/` – unit test lớp service và validator (dùng repository giả, không cần CSDL)
- `docs/` – tài liệu BT1, `thay-doi-thiet-ke.md`, `ai-disclosure.md`

## 5. Kiểm thử
`npm test` – 14 unit test, không cần PostgreSQL:

| Loại | Test |
|---|---|
| Luồng đúng | TC-01 đặt lịch hẹn hợp lệ · TC-08 đổi lịch, hủy lịch · TC-09 tạo kỹ thuật viên |
| Giá trị biên | TC-02 bắt đầu đúng lúc lịch cũ kết thúc · TC-03 trễ 1 phút bị trùng · TC-04 23:30 thứ Bảy / 00:00 Chủ nhật |
| Dữ liệu sai | TC-05 thời gian sai, quá khứ · TC-06 phiếu chưa phân công · TC-07, TC-11 khác trung tâm · TC-10 sai vai trò · TC-12–TC-14 thiếu trường, sai định dạng |

## 6. Trạng thái hiện tại
- [x] Khởi tạo repo, cấu trúc thư mục, smoke test `/health` (buổi 2)
- [x] SRS rút gọn và Use Case Diagram (buổi 3–4)
- [x] API contract, 7 User Story, file Use Case draw.io (buổi 4)
- [x] Kiến trúc, ERD + DDL, wireframe – hoàn tất Bài tập 1 (buổi 5–6)
- [x] Sprint 1 (buổi 8): migration + seed, CRUD kỹ thuật viên và lịch hẹn, RB-02, RB-03, 14 unit test
- [x] Buổi 8: đọc phản hồi BT1 (9.5/10), ghi quyết định điều chỉnh vào `docs/thay-doi-thiet-ke.md` (TD-01 → TD-03); kết quả gọi thử API lưu ở `docs/ket-qua-goi-api-buoi8.md`
- [ ] Sprint 2: danh sách phiếu chờ phân công (E1), gợi ý kỹ thuật viên (E2), phân công / đổi kỹ thuật viên (E3, E4)
- [ ] Màn hình React gọi API (3 màn hình theo wireframe), tag `v0.2` (hạn cuối buổi 12)
