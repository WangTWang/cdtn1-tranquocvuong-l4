// Dua CSDL ve trang thai ban dau: xoa toan bo bang roi migrate + seed lai.
// CHI dung cho CSDL hoc tap (ten bat dau bang "cdtn1"), va bat buoc them co --yes.
// Dung: npm run db:reset -- --yes
const errmsg = require('./lib/errmsg');
require('dotenv').config({ quiet: true });
const { execFileSync } = require('child_process');
const path = require('path');
const { pool } = require('../src/config/db');

async function main() {
  const name = process.env.DB_NAME || '';
  if (!process.argv.includes('--yes')) throw new Error('Lệnh này xóa toàn bộ dữ liệu. Thêm --yes để xác nhận: npm run db:reset -- --yes');
  if (!name.startsWith('cdtn1')) throw new Error(`Từ chối: DB_NAME=${name} không phải CSDL học tập (phải bắt đầu bằng "cdtn1")`);
  await pool.query('DROP SCHEMA public CASCADE');
  await pool.query('CREATE SCHEMA public');
  console.log(`Đã xóa sạch CSDL ${name}.`);
  await pool.end();
  for (const script of ['migrate.js', 'seed.js']) {
    execFileSync(process.execPath, [path.join(__dirname, script)], { stdio: 'inherit' });
  }
}

main().catch((err) => { console.error(errmsg(err)); process.exitCode = 1; });
