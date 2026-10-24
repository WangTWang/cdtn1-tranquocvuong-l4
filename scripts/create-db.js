// Tao CSDL ten DB_NAME (trong .env) neu chua co - thay cho lenh psql, chay duoc ca khi may khong co psql trong PATH.
// Dung: npm run db:create
require('dotenv').config({ quiet: true });
const { Client } = require('pg');

async function main() {
  const name = process.env.DB_NAME;
  if (!name || !/^[a-z0-9_]+$/.test(name)) throw new Error('DB_NAME trong .env chỉ gồm chữ thường, số, dấu gạch dưới (ví dụ cdtn1_l4)');
  // Ket noi vao CSDL quan tri "postgres" de tao CSDL moi.
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });
  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
    if (rowCount) console.log(`- CSDL ${name} đã có, bỏ qua.`);
    else {
      await client.query(`CREATE DATABASE ${name}`);
      console.log(`+ Đã tạo CSDL ${name}.`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => { console.error(`Không tạo được CSDL: ${err.message}`); process.exitCode = 1; });
