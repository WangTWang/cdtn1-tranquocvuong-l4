// Nap du lieu mau db/seeds/*.sql. Moi file dung ON CONFLICT DO NOTHING / chi gan khi con trong nen chay lai KHONG nhan doi.
// Sau do dat mat khau demo (bien DEMO_PASSWORD trong .env) cho tai khoan chua co mat khau.
const errmsg = require('./lib/errmsg');
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');
const employeeRepo = require('../src/repositories/employee.repository');
const { hashPassword } = require('../src/utils/password');

const COUNT_TABLES = ['service_center', 'employee', 'technician', 'technician_skill', 'customer',
  'device', 'ticket', 'appointment'];

async function main() {
  const dir = path.join(__dirname, '..', 'db', 'seeds');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
    console.log(`+ Đã nạp ${file}`);
  }
  const pending = await employeeRepo.listWithoutPassword();
  if (pending.length > 0) {
    const demo = process.env.DEMO_PASSWORD;
    if (!demo) throw new Error('Thiếu DEMO_PASSWORD trong .env (xem .env.example) để đặt mật khẩu cho tài khoản mẫu');
    for (const id of pending) await employeeRepo.setPasswordHashIfEmpty(id, hashPassword(demo));
    console.log(`+ Đã đặt mật khẩu mẫu cho ${pending.length} tài khoản`);
  }
  for (const t of COUNT_TABLES) {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${t}`);
    console.log(`  ${t}: ${rows[0].n} dòng`);
  }
}

main()
  .then(() => console.log('Seed xong.'))
  .catch((err) => { console.error(`Seed lỗi: ${errmsg(err)}`); process.exitCode = 1; })
  .finally(() => pool.end());
