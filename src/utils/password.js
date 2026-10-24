// Bam mat khau bang scrypt co san cua Node (khong can them thu vien).
// Dinh dang luu: scrypt$<salt hex>$<hash hex>
const crypto = require('crypto');

function hashPassword(plain) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, 32);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

// So sanh theo thoi gian khong doi de khong lo do dai phan khop.
function verifyPassword(plain, stored) {
  if (typeof plain !== 'string' || typeof stored !== 'string') return false;
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(plain, Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

module.exports = { hashPassword, verifyPassword };
