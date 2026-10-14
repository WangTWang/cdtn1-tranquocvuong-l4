// Noi cac lop voi nhau: service dung repository that va ket noi PostgreSQL that.
// Unit test KHONG dung file nay ma tu truyen repository gia vao service.
const { withTransaction } = require('./config/db');
const technicianRepo = require('./repositories/technician.repository');
const employeeRepo = require('./repositories/employee.repository');
const ticketRepo = require('./repositories/ticket.repository');
const appointmentRepo = require('./repositories/appointment.repository');
const { createTechnicianService } = require('./services/technician.service');
const { createAppointmentService } = require('./services/appointment.service');

module.exports = {
  technicianService: createTechnicianService({ technicianRepo, employeeRepo, withTransaction }),
  appointmentService: createAppointmentService({ ticketRepo, appointmentRepo, technicianRepo, withTransaction }),
};
