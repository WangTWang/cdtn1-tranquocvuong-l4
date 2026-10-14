const AppError = require('../errors/AppError');

// Bang dich ma loi nghiep vu -> ma HTTP (theo docs/api-contract.md muc 1).
const HTTP_STATUS = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TICKET_NOT_FOUND: 404,
  TECHNICIAN_NOT_FOUND: 404,
  EMPLOYEE_NOT_FOUND: 404,
  APPOINTMENT_NOT_FOUND: 404,
  NOT_FOUND: 404,
  TICKET_NOT_ASSIGNED: 409,
  APPOINTMENT_CONFLICT: 409,
  APPOINTMENT_CANCELLED: 409,
  TECHNICIAN_EXISTS: 409,
};

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(HTTP_STATUS[err.code] || 400).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }
  // JSON gui len sai cu phap
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Body không phải JSON hợp lệ', details: [] },
    });
  }
  // Loi he thong: GHI LOG day du, tra thong bao chung, khong lo chi tiet ky thuat.
  console.error('[LOI HE THONG]', req.method, req.originalUrl, err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Lỗi hệ thống, vui lòng thử lại sau', details: [] },
  });
}

module.exports = errorHandler;
