// Cau hinh rieng cho test can PostgreSQL that (npm run test:db). `npm test` KHONG chay cac test nay.
module.exports = { testEnvironment: 'node', testMatch: ['**/tests/db/**/*.test.js'], setupFiles: ['<rootDir>/tests/setup-env.js'] };
