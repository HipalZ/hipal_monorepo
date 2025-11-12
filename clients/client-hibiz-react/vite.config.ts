import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  envDir: 'env',
  server: {
    port: 3001,
  },
  plugins: [
    react(),
    Pages({
      importMode: 'async',
    }),
    svgr(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
