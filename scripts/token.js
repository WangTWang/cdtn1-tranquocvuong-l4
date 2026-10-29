// Tao JWT de thu API khi chua co man hinh dang nhap.
// Dung: npm run token -- <employeeId>     (vd: 1 = quan ly, 2 = tiep nhan theo du lieu mau)
const errmsg = require('./lib/errmsg');
require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const { pool } = require('../src/config/db');
const employeeRepo = require('../src/repositories/employee.repository');

async function main() {
  const employeeId = Number(process.argv[2]);
  if (!employeeId) throw new Error('Cần mã nhân viên, ví dụ: npm run token -- 2');
  if (!process.env.JWT_SECRET) throw new Error('Thiếu JWT_SECRET trong .env');
  const e = await employeeRepo.findById(employeeId);
  if (!e) throw new Error(`Không có nhân viên mã ${employeeId}`);
  const token = jwt.sign({ employeeId: e.employeeId, role: e.role, centerId: e.centerId },
    process.env.JWT_SECRET, { expiresIn: '8h' });
  console.log(`${e.fullName} (${e.role}, trung tâm ${e.centerId}):\n${token}`);
}

main().catch((err) => { console.error(errmsg(err)); process.exitCode = 1; }).finally(() => pool.end());
