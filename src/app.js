// Tao ung dung Express (tach khoi index.js de co the kiem thu ma khong mo cong).
const express = require('express');
const { authenticate } = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const technicianRoutes = require('./routes/technician.routes');
const { ticketAppointmentRoutes, appointmentRoutes } = require('./routes/appointment.routes');

function createApp({ technicianService, appointmentService }) {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api', authenticate);
  app.use('/api/technicians', technicianRoutes(technicianService));
  app.use('/api/tickets/:ticketId/appointments', ticketAppointmentRoutes(appointmentService));
  app.use('/api/appointments', appointmentRoutes(appointmentService));

  app.use((req, res) => res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Không có đường dẫn ${req.method} ${req.originalUrl}`, details: [] },
  }));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
