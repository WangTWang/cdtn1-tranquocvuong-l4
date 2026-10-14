require('dotenv').config({ quiet: true });
const { createApp } = require('./app');
const services = require('./container');

if (!process.env.JWT_SECRET) {
  console.error('Thiếu JWT_SECRET trong file .env (xem .env.example)');
  process.exit(1);
}

const port = Number(process.env.PORT || 3000);
createApp(services).listen(port, () => {
  console.log(`API chạy tại http://localhost:${port} (kiểm tra: /health)`);
});
