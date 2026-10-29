// Logger dung chung: moi dong mot su kien JSON ra stdout (docker compose logs doc duoc).
// Ba thu moi dong log co: thoi diem (+07:00), muc, mo ta; ngu canh (requestId, ma doi tuong) truyen qua ctx.
// KHONG ghi du lieu nhay cam: cac khoa trong REDACT bi thay bang "[da che]" o moi tang (buoi 11, QT-15).
const { toVnIso } = require('./time');

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };
const REDACT = /^(password|password_?hash|token|authorization|jwt_?secret|db_?password|phone|customer_?phone|so_?dien_?thoai|detail)$/i;

function redact(value, depth = 0) {
  if (value === null || typeof value !== 'object' || depth > 4) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = REDACT.test(k) ? '[da che]' : redact(v, depth + 1);
  return out;
}

// Loi -> chi lay ten, ma, thong diep, ngan xep. Khong ghi nguyen doi tuong loi cua pg
// (truong `detail` cua loi trung khoa chua gia tri that, vd so dien thoai - xem BUG-005).
function serializeError(err) {
  if (!err) return undefined;
  return {
    name: err.name,
    code: err.code,
    message: err.message,
    stack: err.stack,
    cause: err.cause ? { name: err.cause.name, code: err.cause.code, message: err.cause.message } : undefined,
  };
}

function createLogger({ level = process.env.LOG_LEVEL || 'info', write = (line) => process.stdout.write(`${line}\n`), now = () => new Date() } = {}) {
  const min = LEVELS[level] ?? LEVELS.info;
  function log(lvl, msg, ctx = {}) {
    if (LEVELS[lvl] < min) return;
    const { err, ...rest } = ctx;
    write(JSON.stringify({ time: toVnIso(now()), level: lvl.toUpperCase(), msg, ...redact(rest), ...(err ? { err: serializeError(err) } : {}) }));
  }
  return {
    debug: (msg, ctx) => log('debug', msg, ctx),
    info: (msg, ctx) => log('info', msg, ctx),
    warn: (msg, ctx) => log('warn', msg, ctx),
    error: (msg, ctx) => log('error', msg, ctx),
  };
}

const logger = createLogger();
module.exports = { logger, createLogger, redact, serializeError };
