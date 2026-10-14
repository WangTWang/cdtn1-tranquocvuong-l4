// Tien ich thoi gian theo gio Viet Nam (UTC+7, khong co gio mua he).
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const pad = (n) => String(n).padStart(2, '0');

// Doi Date sang "dong ho Viet Nam" (doc bang getUTC*).
const toVnClock = (date) => new Date(date.getTime() + VN_OFFSET_MS);

function isSundayVn(date) {
  return toVnClock(date).getUTCDay() === 0;
}

function isSameVnDay(a, b) {
  return toVnClock(a).toISOString().slice(0, 10) === toVnClock(b).toISOString().slice(0, 10);
}

// [00:00, 24:00) cua ngay Viet Nam chua thoi diem date, tra ve moc UTC.
function vnDayRange(date) {
  const vn = toVnClock(date);
  const startVn = Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate());
  const start = new Date(startVn - VN_OFFSET_MS);
  return [start, new Date(start.getTime() + 24 * 60 * 60 * 1000)];
}

// 2026-10-07T09:00:00+07:00
function toVnIso(date) {
  if (!date) return null;
  const v = toVnClock(date);
  return `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}T`
    + `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}:${pad(v.getUTCSeconds())}+07:00`;
}

const formatVnTime = (date) => { const v = toVnClock(date); return `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}`; };
const formatVnDate = (date) => { const v = toVnClock(date); return `${pad(v.getUTCDate())}/${pad(v.getUTCMonth() + 1)}/${v.getUTCFullYear()}`; };

module.exports = { isSundayVn, isSameVnDay, vnDayRange, toVnIso, formatVnTime, formatVnDate };
