-- Du lieu mau cho luong L4 (sinh tay, co dinh ID de chay lai KHONG nhan doi:
-- moi INSERT dung ON CONFLICT DO NOTHING).
-- 2 trung tam, 7 nhan vien, 4 ky thuat vien, 6 nhom su co, 4 phieu, 1 lich hen.

INSERT INTO service_center (center_id, center_name) VALUES
  (1, 'Trung tâm bảo hành Quận 10'),
  (2, 'Trung tâm bảo hành Cần Thơ')
ON CONFLICT DO NOTHING;

INSERT INTO issue_category (category_id, category_name) VALUES
  (1, 'MAN_HINH'), (2, 'PIN'), (3, 'SAC'), (4, 'PHAN_MEM'), (5, 'NUOC_VAO'), (6, 'KHAC')
ON CONFLICT DO NOTHING;

INSERT INTO employee (employee_id, full_name, role, center_id) VALUES
  (1, 'Trần Thị Trâm',   'QUAN_LY',       1),
  (2, 'Nguyễn Thị Lan',  'TIEP_NHAN',     1),
  (3, 'Lê Văn Dũng',     'KY_THUAT_VIEN', 1),
  (4, 'Phạm Minh Khôi',  'KY_THUAT_VIEN', 1),
  (5, 'Võ Thanh Tùng',   'KY_THUAT_VIEN', 1),
  (6, 'Huỳnh Văn Phát',  'KY_THUAT_VIEN', 1),
  (7, 'Đỗ Thị Hạnh',     'QUAN_LY',       2)
ON CONFLICT DO NOTHING;

-- Nhan vien 6 chua co ho so ky thuat vien: dung de thu POST /api/technicians
INSERT INTO technician (technician_id, employee_id, center_id, level, is_active) VALUES
  (1, 3, 1, 'CAO_CAP',   true),
  (2, 4, 1, 'TRUNG_CAP', true),
  (3, 5, 1, 'TRUNG_CAP', true)
ON CONFLICT DO NOTHING;

INSERT INTO technician_skill (technician_id, category_id, proficiency) VALUES
  (1, 1, 5), (1, 2, 3),
  (2, 1, 4), (2, 4, 4),
  (3, 1, 3), (3, 3, 5)
ON CONFLICT DO NOTHING;

INSERT INTO customer (customer_id, full_name, phone) VALUES
  (1, 'Nguyễn Thị Hoa', '0901234567'),
  (2, 'Trần Văn Bình',  '0912345678'),
  (3, 'Lê Thị Mai',     '0987654321')
ON CONFLICT DO NOTHING;

INSERT INTO device (device_id, customer_id, serial_no, model_name) VALUES
  (1, 1, '356938035643809', 'Mekong M5'),
  (2, 2, '352099001761481', 'Mekong Tab 8'),
  (3, 3, '358240051111110', 'Mekong M3')
ON CONFLICT DO NOTHING;

-- Phieu 1, 2: MOI (chua co ky thuat vien) · Phieu 3: DA_PHAN_CONG cho Pham Minh Khoi
-- Phieu 4: thuoc trung tam Can Tho (dung de thu QT-14)
INSERT INTO ticket (ticket_id, ticket_code, customer_id, device_id, center_id, category_id,
                    technician_id, priority, status, received_at, due_date) VALUES
  (1, 'BH-000118/2026', 2, 2, 1, 2, NULL, 'TRUNG_BINH', 'MOI',
      '2026-10-05 14:30+07', '2026-10-08 14:30+07'),
  (2, 'BH-000120/2026', 3, 3, 1, NULL, NULL, 'THAP', 'MOI',
      '2026-10-05 10:00+07', '2026-10-10 10:00+07'),
  (3, 'BH-000123/2026', 1, 1, 1, 1, 2, 'CAO', 'DA_PHAN_CONG',
      '2026-10-05 08:15+07', '2026-10-06 08:15+07'),
  (4, 'BH-000125/2026', 1, 1, 2, 1, NULL, 'CAO', 'MOI',
      '2026-10-06 09:00+07', '2026-10-07 09:00+07')
ON CONFLICT DO NOTHING;

INSERT INTO ticket_status_log (log_id, ticket_id, from_status, to_status, changed_at, changed_by) VALUES
  (1, 3, 'MOI', 'DA_PHAN_CONG', '2026-10-05 09:00+07', 1)
ON CONFLICT DO NOTHING;

INSERT INTO ticket_assignment_log (assignment_id, ticket_id, from_technician_id, to_technician_id,
                                   reason, changed_by, changed_at) VALUES
  (1, 3, NULL, 2, NULL, 1, '2026-10-05 09:00+07')
ON CONFLICT DO NOTHING;

-- Lich hen co san cua Pham Minh Khoi: 01/12/2026 (thu Ba) 09:00-09:45
INSERT INTO appointment (appointment_id, ticket_id, technician_id, type, start_at, end_at, note, created_by) VALUES
  (1, 3, 2, 'GIAO', '2026-12-01 09:00+07', '2026-12-01 09:45+07', 'Khách hẹn lấy máy buổi sáng', 2)
ON CONFLICT DO NOTHING;

-- Dua cac sequence ve sau ID lon nhat de INSERT tu API khong dung khoa chinh.
SELECT setval(pg_get_serial_sequence('service_center', 'center_id'), (SELECT MAX(center_id) FROM service_center));
SELECT setval(pg_get_serial_sequence('issue_category', 'category_id'), (SELECT MAX(category_id) FROM issue_category));
SELECT setval(pg_get_serial_sequence('employee', 'employee_id'), (SELECT MAX(employee_id) FROM employee));
SELECT setval(pg_get_serial_sequence('technician', 'technician_id'), (SELECT MAX(technician_id) FROM technician));
SELECT setval(pg_get_serial_sequence('customer', 'customer_id'), (SELECT MAX(customer_id) FROM customer));
SELECT setval(pg_get_serial_sequence('device', 'device_id'), (SELECT MAX(device_id) FROM device));
SELECT setval(pg_get_serial_sequence('ticket', 'ticket_id'), (SELECT MAX(ticket_id) FROM ticket));
SELECT setval(pg_get_serial_sequence('ticket_status_log', 'log_id'), (SELECT MAX(log_id) FROM ticket_status_log));
SELECT setval(pg_get_serial_sequence('ticket_assignment_log', 'assignment_id'), (SELECT MAX(assignment_id) FROM ticket_assignment_log));
SELECT setval(pg_get_serial_sequence('appointment', 'appointment_id'), (SELECT MAX(appointment_id) FROM appointment));
