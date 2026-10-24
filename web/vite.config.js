import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Chay dev: `npm run web:dev` (cong 5173, goi tiep /api sang API o cong 3000).
// Chay that: `npm run web:build` roi `npm start` - Express phuc vu luon web/dist o cung cong 3000.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000' } },
});
