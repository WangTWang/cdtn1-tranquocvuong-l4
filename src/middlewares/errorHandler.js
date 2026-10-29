const AppError = require('../errors/AppError');
const { DataAccessError } = require('../errors/DataAccessError');
const { logger: defaultLogger } = require('../utils/logger');

// Bang dich ma loi nghiep vu -> ma HTTP (theo docs/api-contract.md muc 1).
// Day la noi DUY NHAT biet anh xa loi -> HTTP; service chi nem ma loi.
const HTTP_STATUS = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  INVALID_CREDENTIALS: 401,
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
  TICKET_ALREADY_ASSIGNED: 409,
  TICKET_CANCELLED: 409,
  TICKET_NOT_ASSIGNABLE: 409,
  TICKET_NOT_CATEGORIZED: 409,
  TICKET_NOT_REASSIGNABLE: 409,
  TECHNICIAN_NOT_ELIGIBLE: 400,
  SAME_TECHNICIAN: 400,
};

// Ghi log DUNG MOT LAN o day: loi nghiep vu -> khong ghi ERROR (la nghiep vu binh thuong, dong log "request"
// da co ma trang thai); loi he thong -> ERROR kem requestId va ngan xep. Nguoi dung chi thay ma tra cuu.
function createErrorHandler({ logger = defaultLogger } = {}) {
  // eslint-disable-next-line no-unused-vars
  return function errorHandler(err, req, res, next) {
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
    const requestId = req.requestId || '-';
    const unavailable = err instanceof DataAccessError;
    logger.error(unavailable ? 'khong truy cap duoc CSDL' : 'loi he thong', {
      requestId, method: req.method, path: req.path, err,
    });
    return res.status(unavailable ? 503 : 500).json({
      error: {
        code: unavailable ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR',
        message: `${unavailable ? 'Hệ thống tạm thời không truy cập được dữ liệu' : 'Hệ thống đang gặp sự cố'}. Vui lòng thử lại sau ít phút. Mã tra cứu: ${requestId}`,
        details: [{ requestId }],
      },
    });
  };
}

module.exports = createErrorHandler();
module.exports.createErrorHandler = createErrorHandler;
