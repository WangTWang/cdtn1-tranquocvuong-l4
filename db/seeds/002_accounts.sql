-- Ten dang nhap cho 7 nhan vien mau. Chay lai KHONG loi: chi gan khi chua co ten.
-- Mat khau do scripts/seed.js dat tu bien DEMO_PASSWORD trong .env (khong ghi vao file SQL).
UPDATE employee SET username = 'tram'  WHERE employee_id = 1 AND username IS NULL;
UPDATE employee SET username = 'lan'   WHERE employee_id = 2 AND username IS NULL;
UPDATE employee SET username = 'dung'  WHERE employee_id = 3 AND username IS NULL;
UPDATE employee SET username = 'khoi'  WHERE employee_id = 4 AND username IS NULL;
UPDATE employee SET username = 'tung'  WHERE employee_id = 5 AND username IS NULL;
UPDATE employee SET username = 'phat'  WHERE employee_id = 6 AND username IS NULL;
UPDATE employee SET username = 'hanh'  WHERE employee_id = 7 AND username IS NULL;
