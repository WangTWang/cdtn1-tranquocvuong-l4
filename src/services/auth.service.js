// Dang nhap (TD-09): kiem ten dang nhap + mat khau, cap JWT mang employeeId, role, centerId.
const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const { verifyPassword } = require('../utils/password');

// Mot thong bao chung cho ca "sai ten" va "sai mat khau" de khong lo tai khoan nao ton tai.
const BAD_LOGIN = 'Tên đăng nhập hoặc mật khẩu không đúng';

function createAuthService({ employeeRepo, jwtSecret = () => process.env.JWT_SECRET, expiresIn = '8h' }) {
  async function login({ username, password }) {
    const e = await employeeRepo.findByUsername(username);
    // Van chay verifyPassword khi khong co tai khoan? Khong can: thong bao da chung.
    if (!e || !e.passwordHash || !verifyPassword(password, e.passwordHash)) {
      throw new AppError('INVALID_CREDENTIALS', BAD_LOGIN);
    }
    const token = jwt.sign({ employeeId: e.employeeId, role: e.role, centerId: e.centerId }, jwtSecret(), { expiresIn });
    return { token, user: { employeeId: e.employeeId, fullName: e.fullName, role: e.role, centerId: e.centerId } };
  }
  return { login };
}

module.exports = { createAuthService };
