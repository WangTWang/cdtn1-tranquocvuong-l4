// Gan ma yeu cau (requestId) cho moi request: tra ve header X-Request-Id, dung lam "ma tra cuu" khi loi he thong
// va ghi kem moi dong log de tim dung su co. Ghi mot dong log INFO khi request ket thuc (khong ghi body, khong ghi query).
const crypto = require('crypto');
const { logger: defaultLogger } = require('../utils/logger');

function requestId({ logger = defaultLogger } = {}) {
  return (req, res, next) => {
    req.requestId = crypto.randomUUID().slice(0, 8);
    res.set('X-Request-Id', req.requestId);
    const started = process.hrtime.bigint();
    // Doc duong dan tu originalUrl: router con da cat bot req.url khi su kien finish chay.
    const path = req.originalUrl.split('?')[0];
    res.on('finish', () => {
      if (!path.startsWith('/api')) return;
      logger.info('request', {
        requestId: req.requestId,
        method: req.method,
        path,
        status: res.statusCode,
        ms: Number((process.hrtime.bigint() - started) / 1000000n),
        employeeId: req.user ? req.user.employeeId : undefined,
      });
    });
    next();
  };
}

module.exports = requestId;
