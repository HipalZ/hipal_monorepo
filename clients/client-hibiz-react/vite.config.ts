import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
import { VitePWA } from 'vite-plugin-pwa';

const ReactCompilerConfig = {
  compilationMode: 'annotation',
};

export default defineConfig({
  envDir: 'env',
  plugins: [
    react(),
    // babel({
    //   babelConfig: {
    //     presets: ['@babel/preset-env', '@babel/preset-react'],
    //     plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
    //   },
    // }),
    Pages({
      importMode: 'async',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'android-chrome-192x192.png', 'mstile-70x70.png'],
      manifest: {
        theme_color: '#9a5d22',
        background_color: '#f69435',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        name: 'HiBiz',
        short_name: 'HiBiz',
        description: 'digital menu application',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
