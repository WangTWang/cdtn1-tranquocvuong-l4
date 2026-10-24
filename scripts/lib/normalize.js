// Chuan hoa du lieu khach hang tho truoc khi nap (dung cho bo sinh seed tu customers_raw.csv).

// QT-02: bo khoang trang, dau cham, gach; +84 / 84 dau so -> 0; hop le khi con dung 10 so bat dau bang 0.
// Tra ve null neu khong chuan hoa duoc (bo qua ban ghi, khong doan).
function normalizePhone(raw) {
  if (typeof raw !== 'string') return null;
  let s = raw.replace(/[\s.\-]/g, '');
  if (s.startsWith('+84')) s = `0${s.slice(3)}`;
  else if (/^84\d{9}$/.test(s)) s = `0${s.slice(2)}`;
  return /^0\d{9}$/.test(s) ? s : null;
}

// Bo khoang trang thua, viet hoa chu cai dau moi tu: "  hoàng tuấn lâm " -> "Hoàng Tuấn Lâm".
function normalizeName(raw) {
  if (typeof raw !== 'string') return null;
  const words = raw.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  return words.map((w) => w.charAt(0).toLocaleUpperCase('vi') + w.slice(1).toLocaleLowerCase('vi')).join(' ');
}

// Loai trung theo so dien thoai: giu ban ghi tao gan nhat (ngay_tao lon nhat).
function dedupeByPhone(records) {
  const byPhone = new Map();
  for (const r of records) {
    const old = byPhone.get(r.phone);
    if (!old || r.createdAt > old.createdAt) byPhone.set(r.phone, r);
  }
  return [...byPhone.values()];
}

module.exports = { normalizePhone, normalizeName, dedupeByPhone };
