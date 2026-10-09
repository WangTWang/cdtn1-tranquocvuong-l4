# Hợp đồng API (API contract)
## Hệ thống Smart CRM – Mekong Mobile · Luồng L4: Phân công kỹ thuật viên và lịch hẹn

**Sinh viên:** Trần Quốc Vương – 2374802010577 – Track SE  
**Tài liệu liên quan:** `docs/srs.md` (mã FR, US, UC và quy tắc QT/RB dùng trong tài liệu này lấy từ đó)

---

## 1. Quy ước chung

- **Đường dẫn gốc:** `/api`
- **Định dạng:** request và response đều là JSON (`Content-Type: application/json`), mã hóa UTF-8.
- **Thời gian:** chuỗi ISO 8601 có múi giờ, ví dụ `2026-10-05T09:00:00+07:00`.
- **Người gọi:** mọi endpoint yêu cầu đã đăng nhập. Vai trò (`QUAN_LY`, `KY_THUAT_VIEN`, `TIEP_NHAN`) và trung tâm của người gọi được lấy từ phiên đăng nhập, không gửi trong body. Cơ chế đăng nhập hoàn thiện ở BT2.
- **Phạm vi dữ liệu:** người gọi chỉ thấy dữ liệu của trung tâm mình (QT-14).
- **Số điện thoại khách:** trả về đầy đủ cho vai trò `QUAN_LY`, dạng che `090****567` cho các vai trò khác (QT-15).
- **Giá trị hợp lệ:**
  - `status`: `MOI`, `DA_PHAN_CONG`, `DANG_XU_LY`, `CHO_LINH_KIEN`, `HOAN_TAT`, `DA_DONG`, `DA_HUY`
  - `priority`: `CAO`, `TRUNG_BINH`, `THAP`
  - `category`: `MAN_HINH`, `PIN`, `SAC`, `PHAN_MEM`, `NUOC_VAO`, `KHAC`
  - `type` của lịch hẹn: `GIAO`, `NHAN`

**Cấu trúc lỗi dùng chung:**

```json
{
  "error": {
    "code": "TICKET_ALREADY_ASSIGNED",
    "message": "Phiếu đã được phân công cho Phạm Minh Khôi",
    "details": []
  }
}
```

**Mã trạng thái HTTP dùng chung:**

| Mã | Ý nghĩa |
|---|---|
| 200 | Thành công, trả dữ liệu |
| 201 | Tạo mới thành công |
| 400 | Dữ liệu gửi lên sai hoặc thiếu |
| 401 | Chưa đăng nhập |
| 403 | Không đủ quyền, hoặc dữ liệu thuộc trung tâm khác |
| 404 | Không tìm thấy phiếu hoặc kỹ thuật viên |
| 409 | Xung đột trạng thái (phiếu đã phân công, lịch hẹn trùng) |
| 500 | Lỗi hệ thống |

---

## 2. Danh sách endpoint

| # | Phương thức | Đường dẫn | Mục đích | Vai trò | User Story | FR |
|---|---|---|---|---|---|---|
| E1 | GET | `/api/tickets?status=MOI` | Xem danh sách phiếu chờ phân công | QUAN_LY | US1 | FR1 |
| E2 | GET | `/api/tickets/{ticketId}/technician-suggestions` | Xem gợi ý kỹ thuật viên phù hợp | QUAN_LY | US2 | FR2 |
| E3 | POST | `/api/tickets/{ticketId}/assignment` | Phân công kỹ thuật viên cho phiếu | QUAN_LY | US3 | FR3, FR4 |
| E4 | PUT | `/api/tickets/{ticketId}/assignment` | Đổi kỹ thuật viên kèm lý do | QUAN_LY | US4 | FR5 |
| E5 | GET | `/api/technicians/me/tickets` | Kỹ thuật viên xem phiếu được gán | KY_THUAT_VIEN | US5 | FR6 |
| E6 | POST | `/api/tickets/{ticketId}/appointments` | Đặt lịch hẹn giao – nhận máy | TIEP_NHAN | US6 | FR7, FR8 |

E1, E2, E3 phục vụ các story MUST. E4, E5, E6 phục vụ các story SHOULD. Story COULD (US7) chưa có endpoint ở phiên bản này.

---

## 3. Chi tiết từng endpoint

### E1 – GET `/api/tickets?status=MOI`

Trả danh sách phiếu ở trạng thái MỚI của trung tâm người gọi, sắp theo hạn cam kết tăng dần.

**Tham số query:**

| Tham số | Bắt buộc | Kiểu | Giá trị hợp lệ | Ghi chú |
|---|---|---|---|---|
| status | Có | chuỗi | `MOI` | Phiên bản này chỉ hỗ trợ lọc phiếu chờ phân công |
| page | Không | số nguyên | ≥ 1, mặc định 1 | |
| pageSize | Không | số nguyên | 1–100, mặc định 20 | |

**Response 200:**

```json
{
  "items": [
    {
      "ticketId": 123,
      "ticketCode": "BH-000123/2026",
      "customerName": "Nguyễn Thị Hoa",
      "customerPhone": "0901234567",
      "deviceName": "Điện thoại Mekong M5",
      "category": "MAN_HINH",
      "priority": "CAO",
      "status": "MOI",
      "receivedAt": "2026-10-05T08:15:00+07:00",
      "dueDate": "2026-10-06T08:15:00+07:00"
    },
    {
      "ticketId": 118,
      "ticketCode": "BH-000118/2026",
      "customerName": "Trần Văn Bình",
      "customerPhone": "0912345678",
      "deviceName": "Máy tính bảng Mekong Tab 8",
      "category": "PIN",
      "priority": "TRUNG_BINH",
      "status": "MOI",
      "receivedAt": "2026-10-03T14:30:00+07:00",
      "dueDate": "2026-10-07T14:30:00+07:00"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 2
}
```

Khi không có phiếu nào: `{"items": [], "page": 1, "pageSize": 20, "total": 0}` (vẫn là 200).

| Mã | Khi nào |
|---|---|
| 200 | Trả danh sách, kể cả danh sách rỗng |
| 400 | `status` thiếu hoặc khác `MOI`; `page`, `pageSize` ngoài dải |
| 401 | Chưa đăng nhập |
| 403 | Người gọi không phải quản lý trung tâm |

---

### E2 – GET `/api/tickets/{ticketId}/technician-suggestions`

Trả danh sách kỹ thuật viên cùng trung tâm, đang làm việc, tay nghề với nhóm sự cố của phiếu ≥ 3; sắp theo số phiếu đang giữ tăng dần, rồi tay nghề giảm dần (QT-08).

**Tham số đường dẫn:** `ticketId` – số nguyên dương, bắt buộc.

**Response 200:**

```json
{
  "ticketId": 123,
  "ticketCode": "BH-000123/2026",
  "category": "MAN_HINH",
  "suggestions": [
    {
      "technicianId": 17,
      "fullName": "Lê Văn Dũng",
      "level": "CAO_CAP",
      "proficiency": 5,
      "openTicketCount": 3
    },
    {
      "technicianId": 22,
      "fullName": "Phạm Minh Khôi",
      "level": "TRUNG_CAP",
      "proficiency": 4,
      "openTicketCount": 6
    }
  ]
}
```

Khi không có kỹ thuật viên phù hợp: `"suggestions": []` (vẫn là 200), giao diện hiện "Không có kỹ thuật viên phù hợp tại trung tâm".

| Mã | Khi nào | `error.code` |
|---|---|---|
| 200 | Trả danh sách gợi ý, kể cả rỗng | |
| 400 | `ticketId` không phải số nguyên dương | `VALIDATION_ERROR` |
| 401 | Chưa đăng nhập | |
| 403 | Phiếu thuộc trung tâm khác, hoặc người gọi không phải quản lý | `FORBIDDEN` |
| 404 | Không tìm thấy phiếu | `TICKET_NOT_FOUND` |
| 409 | Phiếu chưa có nhóm sự cố, hoặc không ở trạng thái MỚI | `TICKET_NOT_CATEGORIZED`, `TICKET_NOT_ASSIGNABLE` |

---

### E3 – POST `/api/tickets/{ticketId}/assignment`

Gán kỹ thuật viên cho phiếu đang ở trạng thái MỚI. Chạy trong một transaction: lưu kỹ thuật viên, chuyển MỚI → ĐÃ PHÂN CÔNG, ghi lịch sử (QT-06, QT-07, NFR3).

**Request:**

```json
{
  "technicianId": 17
}
```

**Response 201:**

```json
{
  "ticketId": 123,
  "ticketCode": "BH-000123/2026",
  "status": "DA_PHAN_CONG",
  "technician": {
    "technicianId": 17,
    "fullName": "Lê Văn Dũng"
  },
  "assignedBy": "Trần Thị Trâm",
  "assignedAt": "2026-10-05T09:02:11+07:00"
}
```

**Response 409 (ví dụ phiếu vừa được quản lý khác phân công):**

```json
{
  "error": {
    "code": "TICKET_ALREADY_ASSIGNED",
    "message": "Phiếu BH-000123/2026 đã được phân công cho Phạm Minh Khôi",
    "details": []
  }
}
```

| Mã | Khi nào | `error.code` |
|---|---|---|
| 201 | Phân công thành công | |
| 400 | Thiếu `technicianId`, sai kiểu; kỹ thuật viên khác trung tâm, ngừng làm việc hoặc tay nghề < 3 | `VALIDATION_ERROR`, `TECHNICIAN_NOT_ELIGIBLE` |
| 401 | Chưa đăng nhập | |
| 403 | Phiếu thuộc trung tâm khác, hoặc người gọi không phải quản lý | `FORBIDDEN` |
| 404 | Không tìm thấy phiếu hoặc kỹ thuật viên | `TICKET_NOT_FOUND`, `TECHNICIAN_NOT_FOUND` |
| 409 | Phiếu không còn ở trạng thái MỚI (đã phân công hoặc đã hủy) | `TICKET_ALREADY_ASSIGNED`, `TICKET_CANCELLED` |

---

### E4 – PUT `/api/tickets/{ticketId}/assignment`

Đổi kỹ thuật viên của phiếu đang ở trạng thái ĐÃ PHÂN CÔNG. Trạng thái phiếu không đổi; hệ thống ghi lại kỹ thuật viên cũ, mới, lý do, người đổi và thời điểm (QT-07).

**Request:**

```json
{
  "technicianId": 22,
  "reason": "Kỹ thuật viên Lê Văn Dũng nghỉ phép từ ngày 06/10"
}
```

**Response 200:**

```json
{
  "ticketId": 123,
  "ticketCode": "BH-000123/2026",
  "status": "DA_PHAN_CONG",
  "previousTechnician": { "technicianId": 17, "fullName": "Lê Văn Dũng" },
  "technician": { "technicianId": 22, "fullName": "Phạm Minh Khôi" },
  "reason": "Kỹ thuật viên Lê Văn Dũng nghỉ phép từ ngày 06/10",
  "changedBy": "Trần Thị Trâm",
  "changedAt": "2026-10-05T15:40:00+07:00"
}
```

| Mã | Khi nào | `error.code` |
|---|---|---|
| 200 | Đổi kỹ thuật viên thành công | |
| 400 | Thiếu `reason` hoặc `technicianId`; kỹ thuật viên mới trùng kỹ thuật viên cũ; kỹ thuật viên mới không đủ điều kiện QT-08 | `VALIDATION_ERROR`, `SAME_TECHNICIAN`, `TECHNICIAN_NOT_ELIGIBLE` |
| 401 | Chưa đăng nhập | |
| 403 | Phiếu thuộc trung tâm khác, hoặc người gọi không phải quản lý | `FORBIDDEN` |
| 404 | Không tìm thấy phiếu hoặc kỹ thuật viên | `TICKET_NOT_FOUND`, `TECHNICIAN_NOT_FOUND` |
| 409 | Phiếu không ở trạng thái ĐÃ PHÂN CÔNG (RB-01) | `TICKET_NOT_REASSIGNABLE` |

---

### E5 – GET `/api/technicians/me/tickets`

Trả các phiếu đang gán cho kỹ thuật viên đang đăng nhập (trạng thái ĐÃ PHÂN CÔNG hoặc ĐANG XỬ LÝ), sắp theo hạn cam kết tăng dần. Số điện thoại khách hiển thị dạng che (QT-15).

**Response 200:**

```json
{
  "items": [
    {
      "ticketId": 123,
      "ticketCode": "BH-000123/2026",
      "customerName": "Nguyễn Thị Hoa",
      "customerPhone": "090****567",
      "deviceName": "Điện thoại Mekong M5",
      "category": "MAN_HINH",
      "priority": "CAO",
      "status": "DA_PHAN_CONG",
      "dueDate": "2026-10-06T08:15:00+07:00",
      "isOverdue": false
    }
  ],
  "total": 1
}
```

| Mã | Khi nào |
|---|---|
| 200 | Trả danh sách, kể cả rỗng |
| 401 | Chưa đăng nhập |
| 403 | Người gọi không phải kỹ thuật viên |

---

### E6 – POST `/api/tickets/{ticketId}/appointments`

Tạo lịch hẹn giao hoặc nhận máy cho phiếu đã có kỹ thuật viên. Từ chối nếu chồng lấn thời gian với lịch hẹn khác của cùng kỹ thuật viên (RB-02).

**Request:**

```json
{
  "type": "GIAO",
  "startAt": "2026-10-07T09:00:00+07:00",
  "endAt": "2026-10-07T09:30:00+07:00",
  "note": "Khách hẹn lấy máy buổi sáng"
}
```

**Response 201:**

```json
{
  "appointmentId": 501,
  "ticketId": 123,
  "ticketCode": "BH-000123/2026",
  "technician": { "technicianId": 22, "fullName": "Phạm Minh Khôi" },
  "type": "GIAO",
  "startAt": "2026-10-07T09:00:00+07:00",
  "endAt": "2026-10-07T09:30:00+07:00",
  "note": "Khách hẹn lấy máy buổi sáng",
  "createdBy": "Nguyễn Thị Lan"
}
```

**Response 409 (trùng lịch):**

```json
{
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "Kỹ thuật viên Phạm Minh Khôi đã có lịch hẹn 09:00–09:45 ngày 07/10/2026",
    "details": [
      { "conflictAppointmentId": 498, "nextFreeSlotStartAt": "2026-10-07T09:45:00+07:00" }
    ]
  }
}
```

| Mã | Khi nào | `error.code` |
|---|---|---|
| 201 | Tạo lịch hẹn thành công | |
| 400 | Thiếu trường bắt buộc; `endAt` không sau `startAt`; thời điểm ở quá khứ; rơi vào Chủ nhật (RB-03) | `VALIDATION_ERROR` |
| 401 | Chưa đăng nhập | |
| 403 | Phiếu thuộc trung tâm khác, hoặc người gọi không phải nhân viên tiếp nhận | `FORBIDDEN` |
| 404 | Không tìm thấy phiếu | `TICKET_NOT_FOUND` |
| 409 | Phiếu chưa có kỹ thuật viên; lịch hẹn trùng | `TICKET_NOT_ASSIGNED`, `APPOINTMENT_CONFLICT` |

---

## 4. Bảng quy tắc validation từng trường

| Endpoint | Trường | Bắt buộc | Kiểu | Ràng buộc | Lỗi khi sai |
|---|---|---|---|---|---|
| E1 | `status` (query) | Có | chuỗi | Chỉ nhận `MOI` | 400 |
| E1 | `page` (query) | Không | số nguyên | ≥ 1 | 400 |
| E1 | `pageSize` (query) | Không | số nguyên | 1–100 | 400 |
| E2, E3, E4, E6 | `ticketId` (đường dẫn) | Có | số nguyên | > 0, phiếu tồn tại và thuộc trung tâm người gọi | 400, 404, 403 |
| E3, E4 | `technicianId` | Có | số nguyên | > 0; kỹ thuật viên tồn tại, đang làm việc, cùng trung tâm với phiếu, tay nghề với nhóm sự cố ≥ 3 (QT-08) | 400, 404 |
| E4 | `technicianId` | Có | số nguyên | Khác kỹ thuật viên hiện tại của phiếu | 400 |
| E4 | `reason` | Có | chuỗi | 5–255 ký tự, không chỉ gồm khoảng trắng (QT-07) | 400 |
| E6 | `type` | Có | chuỗi | `GIAO` hoặc `NHAN` | 400 |
| E6 | `startAt` | Có | thời gian ISO 8601 | Không ở quá khứ; không rơi vào Chủ nhật (RB-03) | 400 |
| E6 | `endAt` | Có | thời gian ISO 8601 | Sau `startAt`; cùng ngày với `startAt` (RB-03) | 400 |
| E6 | `note` | Không | chuỗi | Tối đa 255 ký tự | 400 |

---

## 5. Truy vết endpoint về User Story

| Endpoint | User Story | FR | Use Case | MoSCoW |
|---|---|---|---|---|
| E1 | US1 | FR1 | UC1 | MUST |
| E2 | US2 | FR2 | UC2 | MUST |
| E3 | US3 | FR3, FR4 | UC3 | MUST |
| E4 | US4 | FR5 | UC4 | SHOULD |
| E5 | US5 | FR6 | UC5 | SHOULD |
| E6 | US6 | FR7, FR8 | UC6, UC7 | SHOULD |

*Ghi chú: tên khách hàng, kỹ thuật viên và mã phiếu trong các ví dụ JSON là dữ liệu minh họa theo định dạng của case study (mã phiếu `BH-000123/2026`, nhóm sự cố, mức ưu tiên, bậc tay nghề), không phải dữ liệu thật.*
