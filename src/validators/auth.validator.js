const { failIfAny } = require('./common');

// Tang 1: ten dang nhap va mat khau phai la chuoi khong rong.
function validateLogin(body = {}) {
  const problems = [];
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  if (!username || username.length > 40) problems.push({ field: 'username', issue: 'bắt buộc, tối đa 40 ký tự' });
  if (typeof body.password !== 'string' || body.password.length === 0 || body.password.length > 200) {
    problems.push({ field: 'password', issue: 'bắt buộc' });
  }
  failIfAny(problems);
  return { username, password: body.password };
}

module.exports = { validateLogin };
