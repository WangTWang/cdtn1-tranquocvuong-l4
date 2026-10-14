const { failIfAny, parsePositiveInt } = require('./common');

// Kiem tham so duong dan dang so nguyen duong (ticketId, technicianId, appointmentId).
function idParam(value, field) {
  const problems = [];
  const id = parsePositiveInt(value, field, problems);
  failIfAny(problems);
  return id;
}

module.exports = { idParam };
