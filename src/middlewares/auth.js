// Xac thuc JWT muc co ban: lay vai tro va trung tam cua nguoi goi tu token,
// KHONG nhan tu body (docs/api-contract.md muc 1).
const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');

function authenticate(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return next(new AppError('UNAUTHORIZED', 'Chưa đăng nhập: thiếu header Authorization: Bearer <token>'));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { employeeId: payload.employeeId, role: payload.role, centerId: payload.centerId };
    return next();
  } catch {
    return next(new AppError('UNAUTHORIZED', 'Token không hợp lệ hoặc đã hết hạn'));
  }
}

// Chi cho phep cac vai tro duoc liet ke.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('FORBIDDEN', `Chức năng này chỉ dành cho vai trò: ${roles.join(', ')}`));
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
