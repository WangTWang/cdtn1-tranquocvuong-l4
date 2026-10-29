require('dotenv').config({ quiet: true });
const { createApp } = require('./app');
const services = require('./container');
const { logger } = require('./utils/logger');

if (!process.env.JWT_SECRET) {
  logger.error('thieu JWT_SECRET trong .env (xem .env.example), dung khoi dong');
  process.exit(1);
}

const port = Number(process.env.PORT || 3000);
createApp(services).listen(port, () => {
  logger.info(`API chạy tại http://localhost:${port} (kiểm tra: /health)`, { port });
});
