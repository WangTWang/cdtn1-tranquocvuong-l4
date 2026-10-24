// Tao ung dung Express (tach khoi index.js de co the kiem thu ma khong mo cong).
const fs = require('fs');
const path = require('path');
const express = require('express');
const { authenticate } = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth.routes');
const technicianRoutes = require('./routes/technician.routes');
const { ticketRoutes, myTicketsRoutes } = require('./routes/ticket.routes');
const { ticketAppointmentRoutes, appointmentRoutes } = require('./routes/appointment.routes');

const WEB_DIST = path.join(__dirname, '..', 'web', 'dist');

function createApp({ authService, technicianService, appointmentService, assignmentService }, { webDir = WEB_DIST } = {}) {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  // Dang nhap phai nam TRUOC authenticate (chua co token luc dang nhap).
  app.use('/api/auth', authRoutes(authService));

  app.use('/api', authenticate);
  app.use('/api/technicians/me', myTicketsRoutes(assignmentService)); // phai truoc router /api/technicians
  app.use('/api/technicians', technicianRoutes(technicianService));
  app.use('/api/tickets/:ticketId/appointments', ticketAppointmentRoutes(appointmentService));
  app.use('/api/tickets', ticketRoutes(assignmentService));
  app.use('/api/appointments', appointmentRoutes(appointmentService));

  app.use('/api', (req, res) => res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Không có đường dẫn ${req.method} ${req.originalUrl}`, details: [] },
  }));

  // Giao dien React da build (web/dist) chay cung cong voi API nen khong gap loi CORS.
  if (fs.existsSync(path.join(webDir, 'index.html'))) {
    app.use(express.static(webDir));
    // Express 5 khong nhan app.get('*'): dung middleware, chi nhan GET khong phai /api.
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      return res.sendFile(path.join(webDir, 'index.html'));
    });
  }

  app.use((req, res) => res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Không có đường dẫn ${req.method} ${req.originalUrl}`, details: [] },
  }));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
