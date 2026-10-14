// Lop trinh bay: chi dich HTTP <-> nghiep vu. Khong SQL, khong quy tac nghiep vu.
const { Router } = require('express');
const { requireRole } = require('../middlewares/auth');
const { idParam } = require('../validators/params');
const { validateCreateTechnician, validateUpdateTechnician } = require('../validators/technician.validator');

function technicianRoutes(technicianService) {
  const r = Router();
  r.use(requireRole('QUAN_LY'));

  r.get('/', async (req, res) => {
    const includeInactive = req.query.includeInactive === 'true';
    res.json({ data: await technicianService.listTechnicians(req.user, { includeInactive }) });
  });

  r.get('/:technicianId', async (req, res) => {
    const id = idParam(req.params.technicianId, 'technicianId');
    res.json({ data: await technicianService.getTechnician(id, req.user) });
  });

  r.post('/', async (req, res) => {
    const input = validateCreateTechnician(req.body);
    res.status(201).json({ data: await technicianService.createTechnician(input, req.user) });
  });

  r.put('/:technicianId', async (req, res) => {
    const id = idParam(req.params.technicianId, 'technicianId');
    const changes = validateUpdateTechnician(req.body);
    res.json({ data: await technicianService.updateTechnician(id, changes, req.user) });
  });

  r.delete('/:technicianId', async (req, res) => {
    const id = idParam(req.params.technicianId, 'technicianId');
    res.json({ data: await technicianService.deactivateTechnician(id, req.user) });
  });

  return r;
}

module.exports = technicianRoutes;
