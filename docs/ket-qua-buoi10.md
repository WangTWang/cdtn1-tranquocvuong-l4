# Kết quả buổi 10 – luồng chính chạy end-to-end cục bộ

Chạy ngày 24/10/2026 10:03 trên máy cá nhân (Node v24.18.0, PostgreSQL 16). Dữ liệu mẫu Mekong Mobile nạp bằng `npm run db:reset` (migration 001, 002 + seed 001–003: 6 trung tâm, 38 kỹ thuật viên, 381 khách hàng, 154 phiếu). Token và mật khẩu được thay bằng `<...>`.

Luồng chính (UC1 → UC2 → UC3 → UC6 → UC5): quản lý đăng nhập → xem phiếu chờ phân công → xem gợi ý → phân công → tiếp nhận đặt lịch hẹn → kỹ thuật viên xem phiếu của mình.

## 1. Gọi API theo luồng chính

### E0 – Đăng nhập quản lý (tram)
```
$ curl -X POST -H Content-Type: application/json -d {"username":"tram","password":"<DEMO_PASSWORD>"} http://localhost:3000/api/auth/login
{"data":{"token":"<TOKEN>","user":{"employeeId":1,"fullName":"Trần Thị Trâm","role":"QUAN_LY","centerId":1}}}
[HTTP 200]
```

### E0 – Sai mật khẩu → 401
```
$ curl -X POST -H Content-Type: application/json -d {"username":"tram","password":"sai-mat-khau"} http://localhost:3000/api/auth/login
{"error":{"code":"INVALID_CREDENTIALS","message":"Tên đăng nhập hoặc mật khẩu không đúng","details":[]}}
[HTTP 401]
```

### E1 – Phiếu chờ phân công của trung tâm Quận 10, trang 1 (sắp theo hạn cam kết, total = tổng số phiếu)
```
$ curl -H Authorization: Bearer <TOKEN_QUAN_LY> http://localhost:3000/api/tickets?status=MOI&pageSize=5
{"data":{"items":[{"ticketId":1,"ticketCode":"BH-000118/2026","customerName":"Trần Văn Bình","customerPhone":"0912345678","deviceName":"Mekong Tab 8","category":"PIN","priority":"TRUNG_BINH","status":"MOI","receivedAt":"2026-10-05T14:30:00+07:00","dueDate":"2026-10-08T14:30:00+07:00","technician":null,"isOverdue":true},{"ticketId":2,"ticketCode":"BH-000120/2026","customerName":"Lê Thị Mai","customerPhone":"0987654321","deviceName":"Mekong M3","category":null,"priority":"THAP","status":"MOI","receivedAt":"2026-10-05T10:00:00+07:00","dueDate":"2026-10-10T10:00:00+07:00","technician":null,"isOverdue":true},{"ticketId":127,"ticketCode":"BH-000226/2026","customerName":"Phạm Anh Oanh","customerPhone":"0377840879","deviceName":"Mekong A12 64GB","category":"MAN_HINH","priority":"CAO","status":"MOI","receivedAt":"2026-10-21T17:03:50+07:00","dueDate":"2026-10-22T17:03:50+07:00","technician":null,"isOverdue":true},{"ticketId":125,"ticketCode":"BH-000224/2026","customerName":"Phạm Minh Linh","customerPhone":"0331208113","deviceName":"Mekong Note 11 128GB","category":"MAN_HINH","priority":"CAO","status":"MOI","receivedAt":"2026-10-21T19:25:50+07:00","dueDate":"2026-10-22T19:25:50+07:00","technician":null,"isOverdue":true},{"ticketId":141,"ticketCode":"BH-000240/2026","customerName":"Dương Gia Mai","customerPhone":"0889451333","deviceName":"Mekong A32 128GB","category":"NUOC_VAO","priority":"CAO","status":"MOI","receivedAt":"2026-10-22T11:55:50+07:00","dueDate":"2026-10-23T11:55:50+07:00","technician":null,"isOverdue":true}],"page":1,"pageSize":5,"total":21}}
[HTTP 200]
```

### E2 – Gợi ý kỹ thuật viên cho phiếu 1 (nhóm PIN, tay nghề ≥ 3)
```
$ curl -H Authorization: Bearer <TOKEN_QUAN_LY> http://localhost:3000/api/tickets/1/technician-suggestions
{"data":{"ticketId":1,"ticketCode":"BH-000118/2026","category":"PIN","suggestions":[{"technicianId":102,"fullName":"Bùi Hữu Tài","level":"TRUNG_CAP","proficiency":4,"openTicketCount":1},{"technicianId":1,"fullName":"Lê Văn Dũng","level":"CAO_CAP","proficiency":3,"openTicketCount":2},{"technicianId":101,"fullName":"Phan Hoàng Trí","level":"CAO_CAP","proficiency":5,"openTicketCount":3}]}}
[HTTP 200]
```

### E2 – Phiếu 2 chưa có nhóm sự cố → 409
```
$ curl -H Authorization: Bearer <TOKEN_QUAN_LY> http://localhost:3000/api/tickets/2/technician-suggestions
{"error":{"code":"TICKET_NOT_CATEGORIZED","message":"Phiếu BH-000120/2026 chưa có nhóm sự cố nên chưa gợi ý được kỹ thuật viên","details":[]}}
[HTTP 409]
```

### E3 – Phân công phiếu 1 cho kỹ thuật viên 1 → 201
```
$ curl -X POST -H Content-Type: application/json -H Authorization: Bearer <TOKEN_QUAN_LY> -d {"technicianId":1} http://localhost:3000/api/tickets/1/assignment
{"data":{"ticketId":1,"ticketCode":"BH-000118/2026","status":"DA_PHAN_CONG","technician":{"technicianId":1,"fullName":"Lê Văn Dũng"},"assignedAt":"2026-10-24T10:03:14+07:00"}}
[HTTP 201]
```

### E3 – Phân công lại phiếu 1 → 409 (RB-01)
```
$ curl -X POST -H Content-Type: application/json -H Authorization: Bearer <TOKEN_QUAN_LY> -d {"technicianId":2} http://localhost:3000/api/tickets/1/assignment
{"error":{"code":"TICKET_ALREADY_ASSIGNED","message":"Phiếu BH-000118/2026 đã được phân công cho Lê Văn Dũng","details":[]}}
[HTTP 409]
```

### E4 – Đổi kỹ thuật viên thiếu lý do → 400
```
$ curl -X PUT -H Content-Type: application/json -H Authorization: Bearer <TOKEN_QUAN_LY> -d {"technicianId":3} http://localhost:3000/api/tickets/3/assignment
{"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ ở các trường: reason","details":[{"field":"reason","issue":"bắt buộc, từ 5 đến 255 ký tự"}]}}
[HTTP 400]
```

### E1 – Tiếp nhận xem phiếu đã phân công (số điện thoại dạng che, QT-15)
```
$ curl -H Authorization: Bearer <TOKEN_TIEP_NHAN> http://localhost:3000/api/tickets?status=DA_PHAN_CONG
{"data":{"items":[{"ticketId":3,"ticketCode":"BH-000123/2026","customerName":"Nguyễn Thị Hoa","customerPhone":"090****567","deviceName":"Mekong M5","category":"MAN_HINH","priority":"CAO","status":"DA_PHAN_CONG","receivedAt":"2026-10-05T08:15:00+07:00","dueDate":"2026-10-06T08:15:00+07:00","technician":{"technicianId":2,"fullName":"Phạm Minh Khôi"},"isOverdue":true},{"ticketId":1,"ticketCode":"BH-000118/2026","customerName":"Trần Văn Bình","customerPhone":"091****678","deviceName":"Mekong Tab 8","category":"PIN","priority":"TRUNG_BINH","status":"DA_PHAN_CONG","receivedAt":"2026-10-05T14:30:00+07:00","dueDate":"2026-10-08T14:30:00+07:00","technician":{"technicianId":1,"fullName":"Lê Văn Dũng"},"isOverdue":true},{"ticketId":101,"ticketCode":"BH-000200/2026","customerName":"Trần Tuấn Cường","customerPhone":"034****238","deviceName":"Mekong S9 256GB","category":"MAN_HINH","priority":"CAO","status":"DA_PHAN_CONG","receivedAt":"2026-10-11T14:25:50+07:00","dueDate":"2026-10-12T14:25:50+07:00","technician":{"technicianId":3,"fullName":"Võ Thanh Tùng"},"isOverdue":true},{"ticketId":120,"ticketCode":"BH-000219/2026","customerName":"Phạm Minh An","customerPhone":"079****248","deviceName":"Mekong Tab 10","category":"NUOC_VAO","priority":"CAO","status":"DA_PHAN_CONG","receivedAt":"2026-10-12T09:43:50+07:00","dueDate":"2026-10-13T09:43:50+07:00","technician":{"technicianId":104,"fullName":"Bùi Minh Lâm"},"isOverdue":true},{"ticketId":103,"ticketCode":"BH-000202/2026","customerName":"Nguyễn Văn Yến","customerPhone":"076****911","deviceName":"Mekong S9 256GB","category":"SAC","priority":"TRUNG_BINH","status":"DA_PHAN_CONG","receivedAt":"2026-10-10T13:34:50+07:00","dueDate":"2026-10-13T13:34:50+07:00","technician":{"technicianId":3,"fullName":"Võ Thanh Tùng"},"isOverdue":true},{"ticketId":134,"ticketCode":"BH-000233/2026","customerName":"Võ Thanh Trung","customerPhone":"077****321","deviceName":"Mekong Tab 8","category":"PHAN_MEM","priority":"THAP","status":"DA_PHAN_CONG","receivedAt":"2026-10-10T17:42:50+07:00","dueDate":"2026-10-15T17:42:50+07:00","technician":{"technicianId":2,"fullName":"Phạm Minh Khôi"},"isOverdue":true},{"ticketId":104,"ticketCode":"BH-000203/2026","customerName":"Dương Kim Linh","customerPhone":"032****028","deviceName":"Mekong Tab 8","category":"NUOC_VAO","priority":"CAO","status":"DA_PHAN_CONG","receivedAt":"2026-10-15T03:56:50+07:00","dueDate":"2026-10-16T03:56:50+07:00","technician":{"technicianId":104,"fullName":"Bùi Minh Lâm"},"isOverdue":true},{"ticketId":140,"ticketCode":"BH-000239/2026","customerName":"Lê Bảo Tâm","customerPhone":"088****061","deviceName":"Mekong A32 128GB","category":"SAC","priority":"TRUNG_BINH","status":"DA_PHAN_CONG","receivedAt":"2026-10-15T03:53:50+07:00","dueDate":"2026-10-18T03:53:50+07:00","technician":{"technicianId":3,"fullName":"Võ Thanh Tùng"},"isOverdue":true},{"ticketId":110,"ticketCode":"BH-000209/2026","customerName":"Đặng Thị Thắng","customerPhone":"039****778","deviceName":"Mekong Tab 8","category":"SAC","priority":"TRUNG_BINH","status":"DA_PHAN_CONG","receivedAt":"2026-10-16T17:57:50+07:00","dueDate":"2026-10-19T17:57:50+07:00","technician":{"technicianId":3,"fullName":"Võ Thanh Tùng"},"isOverdue":true},{"ticketId":108,"ticketCode":"BH-000207/2026","customerName":"Phan Hữu An","customerPhone":"033****698","deviceName":"Mekong Note 11 128GB","category":"NUOC_VAO","priority":"CAO","status":"DA_PHAN_CONG","receivedAt":"2026-10-19T06:21:50+07:00","dueDate":"2026-10-20T06:21:50+07:00","technician":{"technicianId":104,"fullName":"Bùi Minh Lâm"},"isOverdue":true},{"ticketId":113,"ticketCode":"BH-000212/2026","customerName":"Hồ Minh Vy","customerPhone":"076****020","deviceName":"Mekong Tab 10","category":"PHAN_MEM","priority":"THAP","status":"DA_PHAN_CONG","receivedAt":"2026-10-15T06:39:50+07:00","dueDate":"2026-10-20T06:39:50+07:00","technician":{"technicianId":103,"fullName":"Huỳnh Hữu Long"},"isOverdue":true},{"ticketId":133,"ticketCode":"BH-000232/2026","customerName":"Lê Đức Vinh","customerPhone":"093****066","deviceName":"Mekong A32 128GB","category":"PIN","priority":"TRUNG_BINH","status":"DA_PHAN_CONG","receivedAt":"2026-10-17T15:54:50+07:00","dueDate":"2026-10-20T15:54:50+07:00","technician":{"technicianId":101,"fullName":"Phan Hoàng Trí"},"isOverdue":true},{"ticketId":142,"ticketCode":"BH-000241/2026","customerName":"Bùi Văn Hải","customerPhone":"035****648","deviceName":"Mekong M5","category":"PHAN_MEM","priority":"THAP","status":"DA_PHAN_CONG","receivedAt":"2026-10-18T14:41:50+07:00","dueDate":"2026-10-23T14:41:50+07:00","technician":{"technicianId":2,"fullName":"Phạm Minh Khôi"},"isOverdue":true},{"ticketId":117,"ticketCode":"BH-000216/2026","customerName":"Phạm Văn Dung","customerPhone":"079****740","deviceName":"Mekong Note 11 128GB","category":"PHAN_MEM","priority":"THAP","status":"DA_PHAN_CONG","receivedAt":"2026-10-19T13:56:50+07:00","dueDate":"2026-10-24T13:56:50+07:00","technician":{"technicianId":2,"fullName":"Phạm Minh Khôi"},"isOverdue":false}],"page":1,"pageSize":20,"total":14}}
[HTTP 200]
```

### E6 – Tiếp nhận đặt lịch giao máy cho phiếu 1 → 201
```
$ curl -X POST -H Content-Type: application/json -H Authorization: Bearer <TOKEN_TIEP_NHAN> -d {"type":"GIAO","startAt":"2026-12-02T09:00:00+07:00","endAt":"2026-12-02T09:30:00+07:00","note":"Khách lấy máy buổi sáng"} http://localhost:3000/api/tickets/1/appointments
{"data":{"appointmentId":5,"ticketId":1,"ticketCode":"BH-000118/2026","technician":{"technicianId":1,"fullName":"Lê Văn Dũng"},"type":"GIAO","startAt":"2026-12-02T09:00:00+07:00","endAt":"2026-12-02T09:30:00+07:00","note":"Kh�ch l?y m�y bu?i s�ng","createdBy":"Nguyễn Thị Lan","cancelledAt":null}}
[HTTP 201]
```

### E5 – Kỹ thuật viên Lê Văn Dũng xem phiếu của mình
```
$ curl -H Authorization: Bearer <TOKEN_KY_THUAT_VIEN> http://localhost:3000/api/technicians/me/tickets
{"data":{"items":[{"ticketId":1,"ticketCode":"BH-000118/2026","customerName":"Trần Văn Bình","customerPhone":"091****678","deviceName":"Mekong Tab 8","category":"PIN","priority":"TRUNG_BINH","status":"DA_PHAN_CONG","receivedAt":"2026-10-05T14:30:00+07:00","dueDate":"2026-10-08T14:30:00+07:00","technician":{"technicianId":1,"fullName":"Lê Văn Dũng"},"isOverdue":true},{"ticketId":135,"ticketCode":"BH-000234/2026","customerName":"Hoàng Hoài Dung","customerPhone":"033****728","deviceName":"Mekong Tab 10","category":"MAN_HINH","priority":"CAO","status":"DANG_XU_LY","receivedAt":"2026-10-15T10:29:50+07:00","dueDate":"2026-10-16T10:29:50+07:00","technician":{"technicianId":1,"fullName":"Lê Văn Dũng"},"isOverdue":true},{"ticketId":129,"ticketCode":"BH-000228/2026","customerName":"Võ Quang Giang","customerPhone":"085****723","deviceName":"Mekong Tab 8","category":"MAN_HINH","priority":"CAO","status":"DANG_XU_LY","receivedAt":"2026-10-17T07:18:50+07:00","dueDate":"2026-10-18T07:18:50+07:00","technician":{"technicianId":1,"fullName":"Lê Văn Dũng"},"isOverdue":true}],"total":3}}
[HTTP 200]
```

### QT-14 – Quản lý Cần Thơ xem phiếu của Quận 10 → 403
```
$ curl -H Authorization: Bearer <TOKEN_QUAN_LY_CAN_THO> http://localhost:3000/api/tickets/1
{"error":{"code":"FORBIDDEN","message":"Phiếu thuộc trung tâm khác (QT-14)","details":[]}}
[HTTP 403]
```

### NFR2 – Tiếp nhận gọi phân công → 403
```
$ curl -X POST -H Content-Type: application/json -H Authorization: Bearer <TOKEN_TIEP_NHAN> -d {"technicianId":1} http://localhost:3000/api/tickets/2/assignment
{"error":{"code":"FORBIDDEN","message":"Chức năng này chỉ dành cho vai trò: QUAN_LY","details":[]}}
[HTTP 403]
```

### Giao diện React được phục vụ cùng cổng
```
$ curl -o /dev/null http://localhost:3000/tickets

[HTTP 200]
```

## 2. Unit test (`npm test`)
```
PASS tests/services/auth.service.test.js (6.311 s)
PASS tests/routes/permissions.test.js (9.173 s)

Test Suites: 8 passed, 8 total
Tests:       49 passed, 49 total
Snapshots:   0 total
Time:        13.771 s
Ran all test suites.
```

## 3. Test đồng thời trên PostgreSQL (`npm run test:db`)
```
PASS tests/db/concurrency.test.js
  √ TC-40 (NFR3): hai quản lý phân công CÙNG một phiếu cho hai kỹ thuật viên khác nhau cùng lúc – đúng 1 lệnh thành công (177 ms)
  √ TC-41 (NFR3): 5 lệnh phân công đồng thời cho một phiếu – vẫn đúng 1 thành công (83 ms)
  √ TC-42 (RB-02): hai lịch hẹn CHỒNG LẤN đặt cùng lúc cho một kỹ thuật viên – đúng 1 lệnh thành công (25 ms)
  √ TC-43 (RB-02, biên): hai lịch hẹn nối tiếp nhau (14:45 kết thúc, 14:45 bắt đầu) đặt cùng lúc – cả hai thành công (14 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.879 s
Ran all test suites.
```
