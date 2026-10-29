// Chay cac file db/migrations/*.sql theo thu tu ten file.
// File nao da chay thi ghi vao bang schema_migrations va BO QUA o lan sau (chay lai khong loi).
const errmsg = require('./lib/errmsg');
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function main() {
  const dir = path.join(__dirname, '..', 'db', 'migrations');
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const { rowCount } = await pool.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
    if (rowCount) { console.log(`- Bỏ qua ${file} (đã chạy)`); continue; }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(fs.readFileSync(path.join(dir, file), 'utf8'));
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`+ Đã chạy ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${file} lỗi: ${err.message}`);
    } finally {
      client.release();
    }
  }
}

main()
  .then(() => console.log('Migration xong.'))
  .catch((err) => { console.error(errmsg(err)); process.exitCode = 1; })
  .finally(() => pool.end());
