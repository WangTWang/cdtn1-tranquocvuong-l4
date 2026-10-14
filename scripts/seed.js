// Nap du lieu mau db/seeds/*.sql. Moi file dung ON CONFLICT DO NOTHING nen chay lai KHONG nhan doi.
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

const COUNT_TABLES = ['service_center', 'employee', 'technician', 'technician_skill', 'customer',
  'device', 'ticket', 'appointment'];

async function main() {
  const dir = path.join(__dirname, '..', 'db', 'seeds');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
    console.log(`+ Đã nạp ${file}`);
  }
  for (const t of COUNT_TABLES) {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${t}`);
    console.log(`  ${t}: ${rows[0].n} dòng`);
  }
}

main()
  .then(() => console.log('Seed xong.'))
  .catch((err) => { console.error(`Seed lỗi: ${err.message}`); process.exitCode = 1; })
  .finally(() => pool.end());
