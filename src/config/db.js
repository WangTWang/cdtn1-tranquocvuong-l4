// Ket noi PostgreSQL dung chung cho lop repository.
// Lop du lieu DICH loi ket noi cua pg thanh DataAccessError (buoi 11: dich loi ky thuat o ranh gioi).
require('dotenv').config({ quiet: true });
const { Pool } = require('pg');
const { toDataError } = require('../errors/DataAccessError');
const { logger } = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000,       // CSDL treo thi bao loi sau 5 giay, khong treo ca API
});
// Ket noi nhan roi bi CSDL dong (vd khoi dong lai PostgreSQL): ghi log, khong lam sap tien trinh.
pool.on('error', (err) => logger.warn('ket noi CSDL nhan roi bi dong', { err }));

const rawQuery = pool.query.bind(pool);
pool.query = async (...args) => {
  try {
    return await rawQuery(...args);
  } catch (err) {
    throw toDataError(err);
  }
};

/**
 * Chay fn(client) trong MOT transaction: loi thi ROLLBACK toan bo (NFR3).
 * Neu chinh lenh ROLLBACK cung loi (vd mat ket noi), van nem lai LOI GOC - khong de loi rollback che mat (BUG-006).
 * @param {{connect: Function}} source pool (hoac pool gia khi test)
 */
function createWithTransaction(source) {
  return async function withTransaction(fn) {
    let client;
    try {
      client = await source.connect();
    } catch (err) {
      throw toDataError(err);
    }
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        logger.warn('ROLLBACK that bai, giu loi goc', { err: rollbackErr });
      }
      throw toDataError(err);
    } finally {
      client.release();
    }
  };
}

const withTransaction = createWithTransaction(pool);

module.exports = { pool, withTransaction, createWithTransaction };
