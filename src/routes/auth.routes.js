const { Router } = require('express');
const { validateLogin } = require('../validators/auth.validator');

// POST /api/auth/login - khong can token (duoc gan TRUOC middleware authenticate).
function authRoutes(authService) {
  const r = Router();
  r.post('/login', async (req, res) => {
    res.json({ data: await authService.login(validateLogin(req.body)) });
  });
  return r;
}

module.exports = authRoutes;
