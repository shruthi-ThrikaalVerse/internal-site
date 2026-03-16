import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  // Use root base during development so local routes like /super-admin/ work,
  // and keep the production base for deployed site
  base: mode === 'development' ? '/' : '/internal-site/',
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api/projects': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/',
    }
  }
}));
