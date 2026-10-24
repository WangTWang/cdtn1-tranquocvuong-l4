// LOP CLIENT DUY NHAT goi API. Component KHONG goi fetch truc tiep (buoi 9, muc 5).
// Hop dong: thanh cong -> { data }, loi -> { error: { code, message, details } } (docs/api-contract.md, TD-06).
import { clearSession, loadSession } from './session.js';

export class ApiError extends Error {
  constructor({ code, message, details = [], status = 0, network = false }) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = status;
    this.network = network;
  }
}

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

async function request(method, path, body) {
  const session = loadSession();
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError({ code: 'NETWORK', network: true, message: 'Không kết nối được tới hệ thống' });
  }
  let json = null;
  try { json = await res.json(); } catch { /* than phan hoi khong phai JSON */ }
  if (res.ok && json && 'data' in json) return json.data;
  const e = json && json.error ? json.error : { code: 'UNKNOWN', message: 'Hệ thống phản hồi không đúng định dạng' };
  // 401 tren trang khac trang dang nhap: phien het han -> xoa token, ve trang dang nhap.
  if (res.status === 401 && e.code !== 'INVALID_CREDENTIALS') {
    clearSession();
    onUnauthorized();
  }
  throw new ApiError({ code: e.code, message: e.message, details: e.details, status: res.status });
}

const qs = (params) => new URLSearchParams(params).toString();

export const api = {
  login: (username, password) => request('POST', '/api/auth/login', { username, password }),
  // E1: danh sach phieu theo trang thai
  listTickets: ({ status, page = 1, pageSize = 10 }) => request('GET', `/api/tickets?${qs({ status, page, pageSize })}`),
  getTicket: (ticketId) => request('GET', `/api/tickets/${ticketId}`),
  // E2: goi y ky thuat vien
  getSuggestions: (ticketId) => request('GET', `/api/tickets/${ticketId}/technician-suggestions`),
  // E3, E4
  assign: (ticketId, technicianId) => request('POST', `/api/tickets/${ticketId}/assignment`, { technicianId }),
  reassign: (ticketId, technicianId, reason) => request('PUT', `/api/tickets/${ticketId}/assignment`, { technicianId, reason }),
  // E5
  myTickets: () => request('GET', '/api/technicians/me/tickets'),
  // E6 va lich hen
  listAppointments: (ticketId) => request('GET', `/api/tickets/${ticketId}/appointments`),
  createAppointment: (ticketId, input) => request('POST', `/api/tickets/${ticketId}/appointments`, input),
  cancelAppointment: (appointmentId) => request('DELETE', `/api/appointments/${appointmentId}`),
};
