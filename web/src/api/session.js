// Luu phien dang nhap trong sessionStorage (mat khi dong tab). Boc try/catch vi trinh duyet co the chan.
const KEY = 'mekong.session';

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try { sessionStorage.setItem(KEY, JSON.stringify(session)); } catch { /* khong luu duoc thi bo qua */ }
}

export function clearSession() {
  try { sessionStorage.removeItem(KEY); } catch { /* bo qua */ }
}
