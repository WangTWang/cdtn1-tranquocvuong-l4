const { normalizePhone, normalizeName, dedupeByPhone } = require('../../scripts/lib/normalize');

describe('Chuẩn hóa dữ liệu khách hàng mẫu (customers_raw.csv)', () => {
  test('TC-44: số điện thoại – bỏ khoảng trắng, dấu chấm, gạch; +84 và 84 đổi thành 0 (QT-02)', () => {
    expect(normalizePhone('0394 482 400')).toBe('0394482400');
    expect(normalizePhone('0901.234.567')).toBe('0901234567');
    expect(normalizePhone('+84843800227')).toBe('0843800227');
    expect(normalizePhone('84899246446')).toBe('0899246446');
  });

  test('TC-45: giá trị biên và dữ liệu hỏng bị loại (trả null), không đoán', () => {
    expect(normalizePhone('090123456')).toBeNull();      // 9 số
    expect(normalizePhone('09012345678')).toBeNull();    // 11 số
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('khong-co')).toBeNull();
    expect(normalizePhone(undefined)).toBeNull();
    expect(normalizeName('  hoàng   tuấn lâm ')).toBe('Hoàng Tuấn Lâm');
    expect(normalizeName('   ')).toBeNull();
  });

  test('TC-46: khách trùng số điện thoại chỉ giữ bản ghi tạo gần nhất', () => {
    const kept = dedupeByPhone([
      { phone: '0901234567', name: 'A', createdAt: '2024-01-01' },
      { phone: '0901234567', name: 'B', createdAt: '2025-06-01' },
      { phone: '0912345678', name: 'C', createdAt: '2024-03-01' },
    ]);
    expect(kept.map((k) => k.name).sort()).toEqual(['B', 'C']);
  });
});
