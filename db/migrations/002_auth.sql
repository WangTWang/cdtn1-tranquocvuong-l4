-- Buoi 10 (Sprint 2): them tai khoan dang nhap cho nhan vien (TD-09).
-- Mat khau luu dang bam scrypt (xem src/utils/password.js), KHONG luu mat khau goc.
ALTER TABLE employee ADD COLUMN IF NOT EXISTS username      VARCHAR(40);
ALTER TABLE employee ADD COLUMN IF NOT EXISTS password_hash VARCHAR(200);
CREATE UNIQUE INDEX IF NOT EXISTS uq_employee_username ON employee (username);
