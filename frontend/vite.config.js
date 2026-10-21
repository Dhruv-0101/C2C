import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

const useHttps = process.env.VITE_HTTPS === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(useHttps ? [basicSsl()] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    ...(useHttps ? { https: true } : {}),
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_PROXY_TARGET || (process.env.DOCKER_ENV === 'false' ? 'http://localhost:5000' : 'http://brandflow-backend:5000'),
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
