// Lop nghiep vu cho ky thuat vien. Nhan va tra du lieu thuan, KHONG biet HTTP.
const AppError = require('../errors/AppError');

function createTechnicianService({ technicianRepo, employeeRepo, withTransaction }) {
  // QT-14: chi thao tac du lieu cua trung tam nguoi goi.
  function ensureSameCenter(technician, caller) {
    if (technician.centerId !== caller.centerId) {
      throw new AppError('FORBIDDEN', 'Kỹ thuật viên thuộc trung tâm khác, bạn không có quyền xem hoặc sửa');
    }
  }

  async function getTechnician(technicianId, caller) {
    const technician = await technicianRepo.findById(technicianId);
    if (!technician) {
      throw new AppError('TECHNICIAN_NOT_FOUND', `Không tìm thấy kỹ thuật viên có mã ${technicianId}`);
    }
    ensureSameCenter(technician, caller);
    return { ...technician, skills: await technicianRepo.findSkills(technicianId) };
  }

  async function listTechnicians(caller, { includeInactive = false } = {}) {
    return technicianRepo.listByCenter(caller.centerId, includeInactive);
  }

  async function createTechnician(input, caller) {
    const employee = await employeeRepo.findById(input.employeeId);
    if (!employee) {
      throw new AppError('EMPLOYEE_NOT_FOUND', `Không tìm thấy nhân viên có mã ${input.employeeId}`);
    }
    if (employee.role !== 'KY_THUAT_VIEN') {
      throw new AppError('VALIDATION_ERROR', `Nhân viên ${employee.fullName} không có vai trò kỹ thuật viên`,
        [{ field: 'employeeId', issue: 'nhân viên phải có vai trò KY_THUAT_VIEN' }]);
    }
    if (employee.centerId !== caller.centerId) {
      throw new AppError('FORBIDDEN', 'Chỉ được tạo hồ sơ cho kỹ thuật viên thuộc trung tâm của bạn');
    }
    if (await technicianRepo.findByEmployeeId(input.employeeId)) {
      throw new AppError('TECHNICIAN_EXISTS', `Nhân viên ${employee.fullName} đã có hồ sơ kỹ thuật viên`);
    }
    const technicianId = await withTransaction(async (db) => {
      // Trung tam lam viec lay theo ho so nhan vien, khong nhan tu body (QT-08, QT-14).
      const id = await technicianRepo.create({ employeeId: employee.employeeId, centerId: employee.centerId, level: input.level }, db);
      await technicianRepo.replaceSkills(id, input.skills, db);
      return id;
    });
    return getTechnician(technicianId, caller);
  }

  async function updateTechnician(technicianId, changes, caller) {
    await getTechnician(technicianId, caller);
    await withTransaction(async (db) => {
      await technicianRepo.update(technicianId, changes, db);
      if (changes.skills) await technicianRepo.replaceSkills(technicianId, changes.skills, db);
    });
    return getTechnician(technicianId, caller);
  }

  // QT-13: khong xoa vat ly, chi danh dau ngung lam viec.
  async function deactivateTechnician(technicianId, caller) {
    await getTechnician(technicianId, caller);
    await withTransaction((db) => technicianRepo.update(technicianId, { isActive: false }, db));
    return getTechnician(technicianId, caller);
  }

  return { getTechnician, listTechnicians, createTechnician, updateTechnician, deactivateTechnician };
}

module.exports = { createTechnicianService };
