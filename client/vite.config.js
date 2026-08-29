import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In local dev, Vite runs on its own port and proxies /api calls to
// Express (server.js) so the browser can use relative fetch('/api/...')
// exactly as it will in production (single-service same-origin deploy).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
