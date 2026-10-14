// Loi nghiep vu: da luong truoc, tra thong bao ro rang cho nguoi dung.
// Service chi nem ma loi (code), KHONG biet ma HTTP; errorHandler dich sang HTTP.
class AppError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

module.exports = AppError;
