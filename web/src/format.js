// Nhan hien thi va dinh dang cho nguoi dung Viet Nam. Gia tri may doc (MAN_HINH...) chi nam trong API.
export const STATUS_LABEL = {
  MOI: 'Mới', DA_PHAN_CONG: 'Đã phân công', DANG_XU_LY: 'Đang xử lý', CHO_LINH_KIEN: 'Chờ linh kiện',
  HOAN_TAT: 'Hoàn tất', DA_DONG: 'Đã đóng', DA_HUY: 'Đã hủy',
};
export const PRIORITY_LABEL = { CAO: 'Cao', TRUNG_BINH: 'Trung bình', THAP: 'Thấp' };
export const CATEGORY_LABEL = {
  MAN_HINH: 'Màn hình', PIN: 'Pin', SAC: 'Sạc', PHAN_MEM: 'Phần mềm', NUOC_VAO: 'Nước vào', KHAC: 'Khác',
};
export const LEVEL_LABEL = { SO_CAP: 'Sơ cấp', TRUNG_CAP: 'Trung cấp', CAO_CAP: 'Cao cấp' };
export const TYPE_LABEL = { GIAO: 'Giao máy cho khách', NHAN: 'Nhận máy từ khách' };
export const ROLE_LABEL = { QUAN_LY: 'Quản lý trung tâm', TIEP_NHAN: 'Nhân viên tiếp nhận', KY_THUAT_VIEN: 'Kỹ thuật viên' };

export const label = (map, key) => (key == null ? '—' : map[key] ?? key);

// "2026-10-05T08:15:00+07:00" -> "05/10/2026 08:15". Server luon tra gio +07:00 nen cat chuoi, khong dung mui gio may.
export function formatDateTime(iso) {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : iso;
}

// "<input type=datetime-local>" cho ra "2026-12-01T09:30" (gio Viet Nam) -> ISO co mui gio gui len API.
export const localInputToIso = (value) => `${value}:00+07:00`;
// Nguoc lai: ISO +07:00 -> gia tri cho input datetime-local.
export const isoToLocalInput = (iso) => iso.slice(0, 16);
