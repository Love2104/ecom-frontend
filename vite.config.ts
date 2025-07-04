import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://ecom-backend-cc2o.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: true,
  },
});
