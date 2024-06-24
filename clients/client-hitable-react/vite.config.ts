import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';
import Pages from 'vite-plugin-pages';
import { VitePWA } from 'vite-plugin-pwa';

const ReactCompilerConfig = {
  compilationMode: 'annotation',
};

export default defineConfig({
  plugins: [
    react(),
    babel({
      babelConfig: {
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    Pages({
      importMode: 'async',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'android-chrome-192x192.png', 'mstile-70x70.png'],
      manifest: {
        "name": "HiTable",
        "short_name": "HiTable",
        "description": "digital menu application",
        "scope": "/",
        "start_url": "/",
        "icons": [
          {
            "src": "/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ],
        "theme_color": "#2C62F0",
        "background_color": "#ffffff",
        "display": "standalone"
      }
      ,
    }),
  ],
  resolve: {
    // declaring alias
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
