# Phân công kỹ thuật viên và lịch hẹn – Smart CRM Mekong Mobile

**Sinh viên:** Trần Quốc Vương - 2374802010577 - Track SE  
**Học phần:** Chuyên đề Tốt nghiệp 1, HK1 2026-2027  
**Luồng nghiệp vụ:** L4 – Phân công kỹ thuật viên và lịch hẹn

## 1. Mục tiêu
Hệ thống giúp quản lý trung tâm bảo hành của Mekong Mobile phân công phiếu bảo hành cho kỹ thuật viên theo tay nghề, trung tâm và khối lượng công việc hiện tại, thay cho việc phân công thủ công theo trí nhớ. Kỹ thuật viên xem được phiếu của mình theo hạn cam kết; nhân viên tiếp nhận đặt lịch hẹn giao – nhận máy không trùng lịch.

## 2. Yêu cầu môi trường
- Node.js 20 LTS trở lên (đang dùng v24.18.0)
- PostgreSQL 16
- Biến môi trường: xem `.env.example`

## 3. Hướng dẫn chạy
Hiện mới có smoke test (hoàn thiện ở BT2):

1. `npm install`
2. `npm run dev` → mở http://localhost:3000/health

## 4. Cấu trúc thư mục
- `docs/` – tài liệu: SRS (`srs.md`), Use Case Diagram (`usecase.drawio`), API contract (`api-contract.md`), khai báo sử dụng AI (`ai-disclosure.md`)
- `src/` – mã nguồn
- `tests/` – kiểm thử (BT3)
- `data/` – dữ liệu mẫu nhỏ

## 5. Kiểm thử
(hoàn thiện ở BT3)

## 6. Trạng thái hiện tại
- [x] Khởi tạo repo, cấu trúc thư mục, smoke test `/health` (buổi 2)
- [x] SRS rút gọn và Use Case Diagram (buổi 3–4)
- [x] API contract, 8 User Story, file Use Case draw.io (buổi 4)
- [ ] Kiến trúc, ERD, wireframe (buổi 5–6)
- [ ] Module phân công kỹ thuật viên (buổi 8–10)
- [ ] Module lịch hẹn (buổi 10–12)
