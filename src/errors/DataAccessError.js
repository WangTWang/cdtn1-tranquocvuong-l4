// Loi truy cap du lieu: CSDL mat ket noi / khong san sang. Lop du lieu (config/db.js) dich loi ky thuat cua
// thu vien pg thanh loi nay; middleware loi tra 503 kem ma tra cuu. Khong ghi log o lop du lieu.
class DataAccessError extends Error {
  constructor(cause) {
    super('Không truy cập được cơ sở dữ liệu', { cause });
    this.name = 'DataAccessError';
    this.code = 'DB_UNAVAILABLE';
  }
}

// Ma loi pg / Node nghia la "khong noi chuyen duoc voi CSDL" (khong phai loi du lieu).
const CONNECTION_CODES = new Set(['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', '57P01', '57P02', '57P03', '53300']);

function isConnectionError(err) {
  if (!err) return false;
  if (CONNECTION_CODES.has(err.code) || (typeof err.code === 'string' && err.code.startsWith('08'))) return true;
  // Loi he dieu hanh khi MO ket noi (vd ENOENT: khong co socket CSDL) cung la "khong ket noi duoc" (BUG-007).
  if (err.syscall === 'connect' || /^connect [A-Z]+/.test(err.message || '')) return true;
  return /Connection terminated|timeout exceeded when trying to connect/i.test(err.message || '');
}

function toDataError(err) {
  return isConnectionError(err) ? new DataAccessError(err) : err;
}

module.exports = { DataAccessError, isConnectionError, toDataError };
