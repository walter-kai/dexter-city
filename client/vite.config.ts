import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
    sourcemap: true,
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@/hooks', replacement: path.resolve(__dirname, './src/hooks') },
      { find: '@/models', replacement: path.resolve(__dirname, './src/models') },
      { find: '@/models', replacement: path.resolve(__dirname, '../../models') },
      { find: '@/pages', replacement: path.resolve(__dirname, './src/pages') },
      { find: '@/styles', replacement: path.resolve(__dirname, './src/styles') },
      { find: '@/utils', replacement: path.resolve(__dirname, './src/utils') },
      { find: '@/contexts', replacement: path.resolve(__dirname, './src/contexts') }
    ],
  },
});