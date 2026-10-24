const jwt = require('jsonwebtoken');
const { createAuthService } = require('../../src/services/auth.service');
const { hashPassword, verifyPassword } = require('../../src/utils/password');

const SECRET = 'khoa-thu-nghiem';
const employeeRepo = {
  findByUsername: jest.fn(async (u) => (u === 'tram'
    ? { employeeId: 1, fullName: 'Trần Thị Trâm', role: 'QUAN_LY', centerId: 1, passwordHash: hashPassword('mat-khau-dung') }
    : null)),
};
const service = createAuthService({ employeeRepo, jwtSecret: () => SECRET });

describe('Đăng nhập (TD-09)', () => {
  test('TC-30: đúng tên và mật khẩu thì cấp token mang employeeId, role, centerId', async () => {
    const res = await service.login({ username: 'tram', password: 'mat-khau-dung' });
    expect(res.user).toEqual({ employeeId: 1, fullName: 'Trần Thị Trâm', role: 'QUAN_LY', centerId: 1 });
    expect(jwt.verify(res.token, SECRET)).toMatchObject({ employeeId: 1, role: 'QUAN_LY', centerId: 1 });
    expect(JSON.stringify(res)).not.toContain('scrypt');          // không lộ hash
  });

  test('TC-31: sai mật khẩu và tên không tồn tại cho CÙNG một thông báo, không lộ tài khoản nào có thật', async () => {
    const wrongPass = await service.login({ username: 'tram', password: 'sai' }).catch((e) => e);
    const noUser = await service.login({ username: 'khong-co', password: 'x' }).catch((e) => e);
    expect(wrongPass).toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(noUser).toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(noUser.message).toBe(wrongPass.message);
  });

  test('TC-32: băm mật khẩu – hai lần băm cùng mật khẩu cho chuỗi khác nhau nhưng đều xác minh đúng; chuỗi hỏng bị từ chối', () => {
    const a = hashPassword('abc12345');
    const b = hashPassword('abc12345');
    expect(a).not.toBe(b);
    expect(verifyPassword('abc12345', a)).toBe(true);
    expect(verifyPassword('abc12346', a)).toBe(false);
    expect(verifyPassword('abc12345', 'khong-phai-hash')).toBe(false);
    expect(verifyPassword('abc12345', null)).toBe(false);
  });
});
