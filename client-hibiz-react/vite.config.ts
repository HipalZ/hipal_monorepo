import Pages from 'vite-plugin-pages';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // async makes the page to lazy load
    Pages({
      importMode: 'async',
    }),
    // vite plugin for PWA
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'android-chrome-192x192.png', 'mstile-70x70.png'],
      manifest: {
        "theme_color": "#9a5d22",
        "background_color": "#f69435",
        "display": "standalone",
        "scope": "/",
        "start_url": "/",
        "name": "HiBiz",
        "short_name": "HiBiz",
        "description": "digital menu application",
        icons: [
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
        ]
      }
    })
  ],
  resolve: {
    // declaring alias
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
