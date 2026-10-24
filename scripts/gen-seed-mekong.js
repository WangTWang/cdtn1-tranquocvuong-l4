// Sinh db/seeds/003_mekong_mau.sql tu data/mau/customers_raw.csv (du lieu mau cua giang vien).
// Quy mo theo case study: 6 trung tam, 38 ky thuat vien. Hat giong co dinh -> chay lai ra cung file.
// Dung: npm run db:gen-seed
const fs = require('fs');
const path = require('path');
const { normalizePhone, normalizeName, dedupeByPhone } = require('./lib/normalize');

const ROOT = path.join(__dirname, '..');
const CSV = path.join(ROOT, 'data', 'mau', 'customers_raw.csv');
const OUT = path.join(ROOT, 'db', 'seeds', '003_mekong_mau.sql');
const TICKETS = 150;

// PRNG co hat giong (mulberry32) de du lieu sinh ra on dinh.
let seed = 20261024;
function rand() {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (a, b) => a + Math.floor(rand() * (b - a + 1));
const q = (s) => (s === null || s === undefined ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);

// CSV don gian co ho tro dau ngoac kep.
function parseCsv(text) {
  const rows = [];
  let row = []; let cell = ''; let inQ = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i += 1; } else if (c === '"') inQ = false; else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

// ---- Danh muc co dinh ----
const CENTERS = [
  [3, 'Trung tâm bảo hành An Giang'], [4, 'Trung tâm bảo hành Đồng Tháp'],
  [5, 'Trung tâm bảo hành Vĩnh Long'], [6, 'Trung tâm bảo hành Kiên Giang'],
];
const CENTER_CODE = { 1: 'q10', 2: 'ct', 3: 'ag', 4: 'dt', 5: 'vl', 6: 'kg' };
// So ky thuat vien moi them theo trung tam: tam 1 da co 3, tam 2 chua co -> tong 38.
const NEW_TECHS = { 1: 4, 2: 7, 3: 6, 4: 6, 5: 6, 6: 6 };
const CATEGORIES = [1, 2, 3, 4, 5, 6];                        // MAN_HINH, PIN, SAC, PHAN_MEM, NUOC_VAO, KHAC
const DEFAULT_PRIORITY = { 1: 'CAO', 2: 'TRUNG_BINH', 3: 'TRUNG_BINH', 4: 'THAP', 5: 'CAO', 6: 'TRUNG_BINH' };
const DUE_HOURS = { CAO: 24, TRUNG_BINH: 72, THAP: 120 };    // QT-04
const MODELS = ['Mekong A12 64GB', 'Mekong A32 128GB', 'Mekong S9 256GB', 'Mekong Note 11 128GB', 'Mekong Tab 10', 'Mekong M5', 'Mekong Tab 8'];
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Võ', 'Phan', 'Trương', 'Bùi', 'Đặng', 'Đỗ', 'Ngô', 'Hồ', 'Dương'];
const DEM = ['Văn', 'Thị', 'Minh', 'Thanh', 'Hoàng', 'Quốc', 'Ngọc', 'Hữu', 'Gia', 'Đức'];
const TEN = ['An', 'Bảo', 'Cường', 'Duy', 'Hải', 'Hiếu', 'Khang', 'Lâm', 'Long', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Tài', 'Thắng', 'Thịnh', 'Trí', 'Tuấn', 'Vinh', 'Hà', 'Linh', 'Trang', 'Yến'];
const LEVELS = ['SO_CAP', 'TRUNG_CAP', 'TRUNG_CAP', 'CAO_CAP'];

function main() {
  // 1. Khach hang: chuan hoa, loai ban ghi hong, loai trung.
  const raw = parseCsv(fs.readFileSync(CSV, 'utf8'));
  const taken = new Set(['0901234567', '0912345678', '0987654321']);   // so da co trong seed 001
  const cleaned = dedupeByPhone(raw
    .map((r) => ({ phone: normalizePhone(r.so_dien_thoai), name: normalizeName(r.ho_ten), createdAt: r.ngay_tao || '' }))
    .filter((r) => r.phone && r.name && !taken.has(r.phone)))
    .sort((a, b) => a.phone.localeCompare(b.phone));
  const customers = cleaned.map((c, i) => ({ id: 101 + i, ...c }));

  const L = [];
  L.push('-- SINH TU DONG boi scripts/gen-seed-mekong.js tu data/mau/customers_raw.csv - KHONG sua tay.');
  L.push(`-- Khach hang: ${raw.length} ban ghi tho -> ${customers.length} khach sau chuan hoa so dien thoai (QT-02) va loai trung.`);
  L.push('-- Quy mo case study: 6 trung tam, 38 ky thuat vien. ID bat dau tu 101 de khong dung du lieu seed 001.');
  L.push('-- Thoi diem phieu tinh LUI tu luc nap (now()) de danh sach luon co phieu sap han / qua han that.');
  L.push('-- Han cam ket = tiep nhan + 24/72/120 gio theo muc uu tien (QT-04, du lieu mau bo qua quy tac tru Chu nhat).');
  L.push('');
  L.push('INSERT INTO service_center (center_id, center_name) VALUES');
  L.push(`${CENTERS.map(([id, n]) => `  (${id}, ${q(n)})`).join(',\n')}\nON CONFLICT DO NOTHING;\n`);

  // 2. Nhan vien: moi trung tam moi co 1 quan ly + 1 tiep nhan; ky thuat vien theo NEW_TECHS.
  const employees = []; const technicians = []; const skills = [];
  let empId = 101; let techId = 101;
  const usedNames = new Set();
  const newName = () => { let n; do { n = `${pick(HO)} ${pick(DEM)} ${pick(TEN)}`; } while (usedNames.has(n)); usedNames.add(n); return n; };
  for (const c of [3, 4, 5, 6]) {
    employees.push({ id: empId++, name: newName(), role: 'QUAN_LY', center: c, username: `ql_${CENTER_CODE[c]}` });
    employees.push({ id: empId++, name: newName(), role: 'TIEP_NHAN', center: c, username: `tn_${CENTER_CODE[c]}` });
  }
  employees.push({ id: empId++, name: newName(), role: 'TIEP_NHAN', center: 2, username: 'tn_ct' });
  const techsByCenter = { 1: [1, 2, 3], 2: [], 3: [], 4: [], 5: [], 6: [] };
  const skillOf = { 1: { 1: 5, 2: 3 }, 2: { 1: 4, 4: 4 }, 3: { 1: 3, 3: 5 } };      // tu seed 001
  for (const [c, n] of Object.entries(NEW_TECHS)) {
    for (let i = 0; i < n; i += 1) {
      const e = { id: empId++, name: newName(), role: 'KY_THUAT_VIEN', center: Number(c), username: null };
      employees.push(e);
      const t = { id: techId++, employee: e.id, center: Number(c), level: pick(LEVELS) };
      technicians.push(t);
      techsByCenter[c].push(t.id);
      // 2-3 nhom su co, tay nghe 2-5; bao dam moi trung tam co nguoi >= 3 cho moi nhom (QT-08 co ung vien).
      skillOf[t.id] = {};
      const cats = [...CATEGORIES].sort(() => rand() - 0.5).slice(0, between(2, 3));
      for (const cat of cats) skillOf[t.id][cat] = between(2, 5);
    }
  }
  for (const c of [2, 3, 4, 5, 6]) {
    CATEGORIES.forEach((cat, i) => {
      const ids = techsByCenter[c];
      const has = ids.some((id) => (skillOf[id][cat] || 0) >= 3);
      if (!has) skillOf[ids[i % ids.length]][cat] = between(3, 5);
    });
  }
  L.push('INSERT INTO employee (employee_id, full_name, role, center_id, username) VALUES');
  L.push(`${employees.map((e) => `  (${e.id}, ${q(e.name)}, '${e.role}', ${e.center}, ${q(e.username)})`).join(',\n')}\nON CONFLICT DO NOTHING;\n`);
  L.push('INSERT INTO technician (technician_id, employee_id, center_id, level, is_active) VALUES');
  L.push(`${technicians.map((t) => `  (${t.id}, ${t.employee}, ${t.center}, '${t.level}', true)`).join(',\n')}\nON CONFLICT DO NOTHING;\n`);
  for (const t of technicians) for (const [cat, p] of Object.entries(skillOf[t.id])) skills.push(`  (${t.id}, ${cat}, ${p})`);
  L.push('INSERT INTO technician_skill (technician_id, category_id, proficiency) VALUES');
  L.push(`${skills.join(',\n')}\nON CONFLICT DO NOTHING;\n`);

  // 3. Khach hang va thiet bi (moi khach mot thiet bi).
  L.push('INSERT INTO customer (customer_id, full_name, phone) VALUES');
  L.push(`${customers.map((c) => `  (${c.id}, ${q(c.name)}, '${c.phone}')`).join(',\n')}\nON CONFLICT DO NOTHING;\n`);
  L.push('INSERT INTO device (device_id, customer_id, serial_no, model_name) VALUES');
  L.push(`${customers.map((c) => `  (${c.id}, ${c.id}, '35${String(7000000000000 + c.id * 7919).slice(0, 13)}', ${q(pick(MODELS))})`).join(',\n')}\nON CONFLICT DO NOTHING;\n`);

  // 4. Phieu: trung tam 1 nhieu phieu nhat (de demo), trang thai tron theo ty le.
  const managerOf = { 1: 1, 2: 7 };
  employees.filter((e) => e.role === 'QUAN_LY').forEach((e) => { managerOf[e.center] = e.id; });
  const tickets = []; const statusLogs = []; const assignLogs = [];
  const shuffled = [...customers].sort(() => rand() - 0.5);
  for (let i = 0; i < TICKETS; i += 1) {
    const id = 101 + i;
    const center = i < 45 ? 1 : pick([2, 3, 4, 5, 6]);
    const cat = rand() < 0.08 ? null : pick(CATEGORIES);                     // ~8% chua phan loai
    const priority = cat ? DEFAULT_PRIORITY[cat] : pick(['CAO', 'TRUNG_BINH', 'THAP']);
    const r = rand();
    let status = r < 0.40 ? 'MOI' : r < 0.65 ? 'DA_PHAN_CONG' : r < 0.78 ? 'DANG_XU_LY' : r < 0.90 ? 'HOAN_TAT' : 'DA_DONG';
    if (!cat && status !== 'MOI') status = 'MOI';
    const ageMin = status === 'MOI' ? between(10, 70 * 60) : between(6 * 60, 14 * 24 * 60);
    let tech = null;
    if (status !== 'MOI') {
      const ok = techsByCenter[center].filter((t) => (skillOf[t][cat] || 0) >= 3);           // QT-08
      tech = pick(ok);
    }
    const cust = shuffled[i % shuffled.length];
    tickets.push(`  (${id}, 'BH-${String(200 + i).padStart(6, '0')}/2026', ${cust.id}, ${cust.id}, ${center}, ${cat ?? 'NULL'}, ${tech ?? 'NULL'}, '${priority}', '${status}', now() - interval '${ageMin} minutes', now() - interval '${ageMin} minutes' + interval '${DUE_HOURS[priority]} hours')`);
    if (tech) {
      const at = `now() - interval '${Math.max(1, ageMin - 30)} minutes'`;
      statusLogs.push(`  (${id}, 'MOI', 'DA_PHAN_CONG', ${at}, ${managerOf[center]})`);
      assignLogs.push(`  (${id}, NULL, ${tech}, NULL, ${managerOf[center]}, ${at})`);
    }
  }
  L.push('INSERT INTO ticket (ticket_id, ticket_code, customer_id, device_id, center_id, category_id,');
  L.push('                    technician_id, priority, status, received_at, due_date) VALUES');
  L.push(`${tickets.join(',\n')}\nON CONFLICT DO NOTHING;\n`);
  // Lich su chi nap mot lan: chi chen khi phieu chua co dong lich su nao.
  L.push('INSERT INTO ticket_status_log (ticket_id, from_status, to_status, changed_at, changed_by)');
  L.push(`SELECT v.* FROM (VALUES\n${statusLogs.join(',\n')}\n) AS v(ticket_id, from_status, to_status, changed_at, changed_by)`);
  L.push('WHERE NOT EXISTS (SELECT 1 FROM ticket_status_log l WHERE l.ticket_id = v.ticket_id);\n');
  L.push('INSERT INTO ticket_assignment_log (ticket_id, from_technician_id, to_technician_id, reason, changed_by, changed_at)');
  L.push(`SELECT v.ticket_id, v.f::bigint, v.t, v.r::varchar, v.b, v.at FROM (VALUES\n${assignLogs.join(',\n')}\n) AS v(ticket_id, f, t, r, b, at)`);
  L.push('WHERE NOT EXISTS (SELECT 1 FROM ticket_assignment_log l WHERE l.ticket_id = v.ticket_id);\n');
  for (const [t, col] of [['service_center', 'center_id'], ['employee', 'employee_id'], ['technician', 'technician_id'],
    ['customer', 'customer_id'], ['device', 'device_id'], ['ticket', 'ticket_id'],
    ['ticket_status_log', 'log_id'], ['ticket_assignment_log', 'assignment_id']]) {
    L.push(`SELECT setval(pg_get_serial_sequence('${t}', '${col}'), (SELECT MAX(${col}) FROM ${t}));`);
  }
  fs.writeFileSync(OUT, `${L.join('\n')}\n`);
  console.log(`Đã sinh ${path.relative(ROOT, OUT)}: ${customers.length} khách, ${employees.length} nhân viên, ${technicians.length} kỹ thuật viên mới, ${TICKETS} phiếu.`);
}

main();
