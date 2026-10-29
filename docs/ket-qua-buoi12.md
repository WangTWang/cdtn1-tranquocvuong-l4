# Kết quả kiểm chứng buổi 12 – trước khi nộp Bài tập 2

Chạy ngày 30/10/2026 00:49 trên máy cá nhân (Windows, Git Bash, Node v24.22.1, PostgreSQL 16). Dữ liệu mẫu nạp bằng `npm run db:reset`. Mật khẩu được thay bằng `<DEMO_PASSWORD>`.

## 1. API chạy bình thường
```
$ curl http://localhost:3097/health
{"status":"ok","db":"ok"}
$ curl -X POST .../api/auth/login (tram, đúng mật khẩu) → HTTP 200
$ curl -X POST .../api/auth/login (tram, sai mật khẩu)
{"error":{"code":"INVALID_CREDENTIALS","message":"Tên đăng nhập hoặc mật khẩu không đúng","details":[]}}
```

Log của API (mỗi dòng một sự kiện JSON, có `requestId`; không có mật khẩu, token, số điện thoại):
```
{"time":"2026-10-30T00:49:45+07:00","level":"INFO","msg":"API chạy tại http://localhost:3097 (kiểm tra: /health)","port":3097}
{"time":"2026-10-30T00:49:45+07:00","level":"INFO","msg":"request","requestId":"48ffc3e8","method":"POST","path":"/api/auth/login","status":200,"ms":48}
{"time":"2026-10-30T00:49:45+07:00","level":"INFO","msg":"request","requestId":"65f5ee70","method":"POST","path":"/api/auth/login","status":401,"ms":41}
```

## 2. Mất kết nối CSDL (API trỏ tới cổng CSDL không tồn tại: `DB_PORT=1`)
```
$ curl http://localhost:3096/health
{"status":"loi","db":"khong ket noi duoc"} [HTTP 503]
$ curl -i -X POST .../api/auth/login
HTTP/1.1 503 Service Unavailable
X-Request-Id: 570c9c29
{"error":{"code":"SERVICE_UNAVAILABLE","message":"Hệ thống tạm thời không truy cập được dữ liệu. Vui lòng thử lại sau ít phút. Mã tra cứu: 570c9c29","details":[{"requestId":"570c9c29"}]}}
```

Tìm dòng log theo mã tra cứu `570c9c29` mà người dùng nhận được:
```
$ grep '"requestId":"570c9c29"' log-api
{"time":"2026-10-30T00:49:47+07:00","level":"ERROR","msg":"khong truy cap duoc CSDL","requestId":"570c9c29","method":"POST","path":"/api/auth/login","err":{"name":"DataAccessError","code":"DB_UNAVAILABLE","message":"Không truy cập được cơ sở dữ liệu","stack":"…","cause":{"name":"AggregateError","code":"ECONNREFUSED","message":""}}}
{"time":"2026-10-30T00:49:47+07:00","level":"INFO","msg":"request","requestId":"570c9c29","method":"POST","path":"/api/auth/login","status":503,"ms":9}
```

Kết luận: người dùng nhận 503 kèm mã tra cứu, không thấy chi tiết kỹ thuật; kỹ sư dùng mã đó tìm được đúng dòng ERROR kèm nguyên nhân (TD-17).

## 3. Unit test (`npm test`)
```
PASS tests/data/normalize.test.js
PASS tests/services/technician.service.test.js
PASS tests/contracts/ticket.contract.test.js
PASS tests/services/appointment.service.test.js
PASS tests/validators/validators.test.js
PASS tests/services/assignment.service.test.js
PASS tests/errors/xu-ly-loi.test.js
PASS tests/routes/permissions.test.js
PASS tests/services/auth.service.test.js
Test Suites: 9 passed, 9 total
Tests:       56 passed, 56 total
```

## 4. Test đồng thời trên PostgreSQL (`npm run test:db`)
```
  √ TC-40 (NFR3): hai quản lý phân công CÙNG một phiếu cho hai kỹ thuật viên khác nhau cùng lúc – đúng 1 lệnh thành công (88 ms)
  √ TC-41 (NFR3): 5 lệnh phân công đồng thời cho một phiếu – vẫn đúng 1 thành công (45 ms)
  √ TC-42 (RB-02): hai lịch hẹn CHỒNG LẤN đặt cùng lúc cho một kỹ thuật viên – đúng 1 lệnh thành công (14 ms)
  √ TC-43 (RB-02, biên): hai lịch hẹn nối tiếp nhau (14:45 kết thúc, 14:45 bắt đầu) đặt cùng lúc – cả hai thành công (14 ms)
Tests:       4 passed, 4 total
```
