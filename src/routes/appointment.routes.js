const { Router } = require('express');
const { requireRole } = require('../middlewares/auth');
const { idParam } = require('../validators/params');
const { validateCreateAppointment, validateUpdateAppointment } = require('../validators/appointment.validator');

// /api/tickets/:ticketId/appointments  (E6 va danh sach lich hen cua phieu)
function ticketAppointmentRoutes(appointmentService) {
  const r = Router({ mergeParams: true });

  r.post('/', requireRole('TIEP_NHAN'), async (req, res) => {
    const ticketId = idParam(req.params.ticketId, 'ticketId');
    const input = validateCreateAppointment(req.body);
    res.status(201).json({ data: await appointmentService.createAppointment(ticketId, input, req.user) });
  });

  r.get('/', async (req, res) => {
    const ticketId = idParam(req.params.ticketId, 'ticketId');
    res.json({ data: await appointmentService.listAppointmentsByTicket(ticketId, req.user) });
  });

  return r;
}

// /api/appointments/:appointmentId  (xem, doi lich, huy)
function appointmentRoutes(appointmentService) {
  const r = Router();

  r.get('/:appointmentId', async (req, res) => {
    const id = idParam(req.params.appointmentId, 'appointmentId');
    res.json({ data: await appointmentService.getAppointment(id, req.user) });
  });

  r.put('/:appointmentId', requireRole('TIEP_NHAN', 'QUAN_LY'), async (req, res) => {
    const id = idParam(req.params.appointmentId, 'appointmentId');
    const input = validateUpdateAppointment(req.body);
    res.json({ data: await appointmentService.rescheduleAppointment(id, input, req.user) });
  });

  r.delete('/:appointmentId', requireRole('TIEP_NHAN', 'QUAN_LY'), async (req, res) => {
    const id = idParam(req.params.appointmentId, 'appointmentId');
    res.json({ data: await appointmentService.cancelAppointment(id, req.user) });
  });

  return r;
}

module.exports = { ticketAppointmentRoutes, appointmentRoutes };
