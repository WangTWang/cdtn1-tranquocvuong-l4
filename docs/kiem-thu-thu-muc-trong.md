# Phép thử "thư mục trống" – buổi 10

Ngày 24/10/2026 10:03, máy cá nhân (Windows, Git Bash, Node v24.18.0). Clone repo từ GitHub sang thư mục tạm mới, làm đúng từng bước ở mục 3 của README. CSDL dùng tên riêng `cdtn1_thu_muc_trong` để không đụng CSDL đang dùng.

| Bước | Lệnh | Kết quả |
|---|---|---|
| 0 | `git clone https://github.com/WangTWang/cdtn1-tranquocvuong-l4.git` | Đạt – thư mục mới, không có node_modules, .env, web/dist |
| 1 | `npm install --no-audit --no-fund` | Đạt – cài thư viện API |
| 2 | `npm run web:install -- --no-audit --no-fund` | Đạt – cài thư viện giao diện |
| 3 | `cp .env.example .env` | Đạt – tạo .env từ mẫu |
| 3b | điền `DB_PASSWORD`, `JWT_SECRET` trong `.env` | Đạt – DB_NAME=cdtn1_thu_muc_trong, PORT=3099 |
| 4 | `npm run db:create` | Đạt – tạo CSDL |
| 5 | `npm run db:migrate` | Đạt – tạo bảng |
| 6 | `npm run db:seed` | Đạt – nạp dữ liệu mẫu |
| 6b | `npm run db:seed` | Đạt – chạy lại không lỗi, không nhân đôi |
| 7 | `npm test` | Đạt – Tests:       49 passed, 49 total |
| 8 | `npm run web:build` | Đạt – build giao diện |
| 9 | `npm start` | Đạt – /health trả {"status":"ok"}, trang /login trả HTTP 200, đăng nhập tram trả HTTP 200 |

**Kết luận:** làm đúng mục 3 của README trên thư mục mới clone, hệ thống dựng và chạy được, không cần bước nào ngoài README.
