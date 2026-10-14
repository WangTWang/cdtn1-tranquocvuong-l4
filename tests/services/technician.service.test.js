// Unit test lop nghiep vu ky thuat vien (CRUD + QT-13, QT-14).
const { createTechnicianService } = require('../../src/services/technician.service');

const manager = { employeeId: 1, role: 'QUAN_LY', centerId: 1 };

function build() {
  const employees = {
    6: { employeeId: 6, fullName: 'Huỳnh Văn Phát', role: 'KY_THUAT_VIEN', centerId: 1 },
    2: { employeeId: 2, fullName: 'Nguyễn Thị Lan', role: 'TIEP_NHAN', centerId: 1 },
  };
  const technicians = [];
  const technicianRepo = {
    findById: jest.fn(async (id) => technicians.find((t) => t.technicianId === id) || null),
    findByEmployeeId: jest.fn(async (eid) => technicians.find((t) => t.employeeId === eid) || null),
    listByCenter: jest.fn(async (c) => technicians.filter((t) => t.centerId === c)),
    create: jest.fn(async (d) => { const id = technicians.length + 1; technicians.push({ technicianId: id, isActive: true, fullName: employees[d.employeeId].fullName, ...d }); return id; }),
    update: jest.fn(async (id, ch) => { const t = technicians.find((x) => x.technicianId === id); if (ch.level) t.level = ch.level; if (ch.isActive !== undefined) t.isActive = ch.isActive; }),
    findSkills: jest.fn(async () => []),
    replaceSkills: jest.fn(async () => {}),
  };
  const employeeRepo = { findById: jest.fn(async (id) => employees[id] || null) };
  const withTransaction = jest.fn(async (fn) => fn({}));
  return { technicianRepo, service: createTechnicianService({ technicianRepo, employeeRepo, withTransaction }) };
}

test('TC-09: tạo kỹ thuật viên – trung tâm lấy theo hồ sơ nhân viên; tạo lần hai bị từ chối', async () => {
  const { service } = build();
  const t = await service.createTechnician({ employeeId: 6, level: 'SO_CAP', skills: [{ categoryId: 1, proficiency: 3 }] }, manager);
  expect(t).toMatchObject({ technicianId: 1, centerId: 1, level: 'SO_CAP', isActive: true });
  await expect(service.createTechnician({ employeeId: 6, level: 'SO_CAP', skills: [] }, manager))
    .rejects.toMatchObject({ code: 'TECHNICIAN_EXISTS' });
});

test('TC-10: nhân viên không có vai trò kỹ thuật viên thì không tạo được hồ sơ kỹ thuật viên', async () => {
  const { service } = build();
  await expect(service.createTechnician({ employeeId: 2, level: 'SO_CAP', skills: [] }, manager))
    .rejects.toMatchObject({ code: 'VALIDATION_ERROR', details: [{ field: 'employeeId' }] });
});

test('TC-11: xóa kỹ thuật viên chỉ đánh dấu ngừng làm việc (QT-13); quản lý trung tâm khác không xem được (QT-14)', async () => {
  const { service } = build();
  await service.createTechnician({ employeeId: 6, level: 'SO_CAP', skills: [] }, manager);
  const t = await service.deactivateTechnician(1, manager);
  expect(t.isActive).toBe(false);
  await expect(service.getTechnician(1, { ...manager, centerId: 2 })).rejects.toMatchObject({ code: 'FORBIDDEN' });
});
