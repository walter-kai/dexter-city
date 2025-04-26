import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {

  },
  esbuild: {
    sourcemap: true, // Ensure esbuild generates source maps
  },
  resolve: {
    alias: {
      '@': '/src', // Optional: Add an alias for cleaner imports
    },
  },
});