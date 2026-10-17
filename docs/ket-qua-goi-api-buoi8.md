# Kết quả gọi thử API – buổi 8

Chạy ngày 17/10/2026 08:21 trên máy cá nhân (Node v24.18.0, PostgreSQL 16), dữ liệu từ `npm run db:seed`.

### Kiểm tra server
```
$ curl http://localhost:3000/health
{"status":"ok"}
[HTTP 200]
```

### Danh sách kỹ thuật viên (QUAN_LY) – CRUD đọc
```
$ curl -H Authorization: Bearer <TOKEN_QUAN_LY> http://localhost:3000/api/technicians
{"data":[{"technicianId":1,"employeeId":3,"fullName":"Lê Văn Dũng","centerId":1,"centerName":"Trung tâm bảo hành Quận 10","level":"CAO_CAP","isActive":true},{"technicianId":2,"employeeId":4,"fullName":"Phạm Minh Khôi","centerId":1,"centerName":"Trung tâm bảo hành Quận 10","level":"TRUNG_CAP","isActive":true},{"technicianId":3,"employeeId":5,"fullName":"Võ Thanh Tùng","centerId":1,"centerName":"Trung tâm bảo hành Quận 10","level":"TRUNG_CAP","isActive":true}]}
[HTTP 200]
```

### Gọi không có token → 401
```
$ curl http://localhost:3000/api/technicians
{"error":{"code":"UNAUTHORIZED","message":"Chưa đăng nhập: thiếu header Authorization: Bearer <token>","details":[]}}
[HTTP 401]
```

### Tạo kỹ thuật viên sai dữ liệu → 400 kèm tên trường
```
$ curl -X POST -H Content-Type: application/json -H Authorization: Bearer <TOKEN_QUAN_LY> -d {"level":"GIOI"} http://localhost:3000/api/technicians
{"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ ở các trường: employeeId, level","details":[{"field":"employeeId","issue":"phải là số nguyên dương"},{"field":"level","issue":"phải là SO_CAP, TRUNG_CAP, CAO_CAP"}]}}
[HTTP 400]
```

### Đặt lịch hẹn trùng lịch 09:00–09:45 (RB-02) → 409
```
$ curl -X POST -H Content-Type: application/json -H Authorization: Bearer <TOKEN_TIEP_NHAN> -d {"type":"GIAO","startAt":"2026-12-01T09:30:00+07:00","endAt":"2026-12-01T10:00:00+07:00"} http://localhost:3000/api/tickets/3/appointments
{"error":{"code":"APPOINTMENT_CONFLICT","message":"Kỹ thuật viên Phạm Minh Khôi đã có lịch hẹn 09:00–09:45 ngày 01/12/2026","details":[{"conflictAppointmentId":1,"nextFreeSlotStartAt":"2026-12-01T09:45:00+07:00"}]}}
[HTTP 409]
```

### Danh sách lịch hẹn của phiếu 3
```
$ curl -H Authorization: Bearer <TOKEN_TIEP_NHAN> http://localhost:3000/api/tickets/3/appointments
{"data":[{"appointmentId":1,"ticketId":3,"ticketCode":"BH-000123/2026","technician":{"technicianId":2,"fullName":"Phạm Minh Khôi"},"type":"GIAO","startAt":"2026-12-01T09:00:00+07:00","endAt":"2026-12-01T09:45:00+07:00","note":"Khách hẹn lấy máy buổi sáng","createdBy":"Nguyễn Thị Lan","cancelledAt":null}]}
[HTTP 200]
```

### Unit test (npm test)
```
PASS tests/services/appointment.service.test.js
  Đặt lịch hẹn – luồng đúng
    √ TC-01: phiếu đã có kỹ thuật viên, khung giờ trống thì tạo được lịch hẹn và lưu đúng kỹ thuật viên của phiếu (4 ms)
  Đặt lịch hẹn – giá trị biên
    √ TC-02: lịch bắt đầu ĐÚNG LÚC lịch cũ kết thúc (09:45) là hợp lệ, không bị coi là trùng (RB-02) (1 ms)
    √ TC-03: lịch kết thúc trễ hơn lịch cũ bắt đầu MỘT phút (09:01) thì bị từ chối và gợi ý giờ trống 09:45 (RB-02) (1 ms)
    √ TC-04: 23:30 thứ Bảy hợp lệ nhưng 00:00 Chủ nhật bị từ chối (RB-03) (1 ms)
  Đặt lịch hẹn – dữ liệu sai
    √ TC-05: kết thúc không sau bắt đầu và thời điểm ở quá khứ thì bị từ chối, nêu đủ các trường sai (RB-03)
    √ TC-06: phiếu chưa có kỹ thuật viên thì không cho đặt lịch (UC6 ngoại lệ 1a) (1 ms)
    √ TC-07: phiếu thuộc trung tâm khác bị từ chối (QT-14)
  Đổi lịch và hủy lịch hẹn
    √ TC-08: đổi lịch không bị tính trùng với chính nó; hủy thì đánh dấu cancelledAt, không xóa (QT-13) (1 ms)

PASS tests/validators/validators.test.js
  √ TC-12: thiếu type, startAt sai định dạng, thiếu endAt thì báo đủ ba trường sai (1 ms)
  √ TC-13: thời gian không có múi giờ bị từ chối; có múi giờ thì được chấp nhận (3 ms)
  √ TC-14: tay nghề ngoài khoảng 1–5 và level sai bị từ chối

PASS tests/services/technician.service.test.js
  √ TC-09: tạo kỹ thuật viên – trung tâm lấy theo hồ sơ nhân viên; tạo lần hai bị từ chối (1 ms)
  √ TC-10: nhân viên không có vai trò kỹ thuật viên thì không tạo được hồ sơ kỹ thuật viên (1 ms)
  √ TC-11: xóa kỹ thuật viên chỉ đánh dấu ngừng làm việc (QT-13); quản lý trung tâm khác không xem được (QT-14)

Test Suites: 3 passed, 3 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        4.486 s
Ran all test suites.
```
