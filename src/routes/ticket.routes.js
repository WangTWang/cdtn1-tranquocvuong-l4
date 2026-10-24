// Lop trinh bay: chi dich HTTP <-> nghiep vu. Khong SQL, khong quy tac nghiep vu.
const { Router } = require('express');
const { requireRole } = require('../middlewares/auth');
const { idParam } = require('../validators/params');
const { validateListQuery, validateAssign, validateReassign } = require('../validators/ticket.validator');
const AppError = require('../errors/AppError');

// /api/tickets  (E1 danh sach, E2 goi y, E3/E4 phan cong, xem mot phieu)
function ticketRoutes(assignmentService) {
  const r = Router();

  // E1. QUAN_LY xem MOI va DA_PHAN_CONG; TIEP_NHAN chi xem DA_PHAN_CONG de dat lich hen (TD-11).
  r.get('/', requireRole('QUAN_LY', 'TIEP_NHAN'), async (req, res) => {
    const query = validateListQuery(req.query);
    if (req.user.role === 'TIEP_NHAN' && query.status !== 'DA_PHAN_CONG') {
      throw new AppError('FORBIDDEN', 'Nhân viên tiếp nhận chỉ xem được phiếu ĐÃ PHÂN CÔNG');
    }
    res.json({ data: await assignmentService.listTickets(req.user, query) });
  });

  r.get('/:ticketId', async (req, res) => {
    res.json({ data: await assignmentService.getTicket(idParam(req.params.ticketId, 'ticketId'), req.user) });
  });

  r.get('/:ticketId/technician-suggestions', requireRole('QUAN_LY'), async (req, res) => {
    res.json({ data: await assignmentService.getSuggestions(idParam(req.params.ticketId, 'ticketId'), req.user) });
  });

  r.post('/:ticketId/assignment', requireRole('QUAN_LY'), async (req, res) => {
    const ticketId = idParam(req.params.ticketId, 'ticketId');
    const { technicianId } = validateAssign(req.body);
    res.status(201).json({ data: await assignmentService.assignTicket(ticketId, technicianId, req.user) });
  });

  r.put('/:ticketId/assignment', requireRole('QUAN_LY'), async (req, res) => {
    const ticketId = idParam(req.params.ticketId, 'ticketId');
    res.json({ data: await assignmentService.reassignTicket(ticketId, validateReassign(req.body), req.user) });
  });

  return r;
}

// E5: /api/technicians/me/tickets - mount TRUOC router ky thuat vien (router do chi cho QUAN_LY).
function myTicketsRoutes(assignmentService) {
  const r = Router();
  r.get('/tickets', requireRole('KY_THUAT_VIEN'), async (req, res) => {
    res.json({ data: await assignmentService.listMyTickets(req.user) });
  });
  return r;
}

module.exports = { ticketRoutes, myTicketsRoutes };
