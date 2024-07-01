import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import { join } from "node:path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  envDir: "env",

  plugins: [
    react(),
    Pages({
      importMode: "async", // This setting will dynamically import pages
    }),
    // babel({
    //   babelConfig: {
    //     presets: ['@babel/preset-env', '@babel/preset-react'],
    //     plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
    //   },
    // }),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
    //   manifest: {
    //     name: 'HiKitchen',
    //     short_name: 'HiKitchen',
    //     description: 'digital menu application',
    //     scope: '/',
    //     start_url: '/',
    //     icons: [
    //       {
    //         src: '/android-chrome-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: '/android-chrome-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //     ],
    //     theme_color: '#ffffff',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //   },
    // }),
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      "@": join(__dirname, "src"),
      styles: join(__dirname, "src/assets/styles"),
      "@@": join(__dirname, "public"),
    },
  },
  esbuild: {
    exclude: ["@hi/common"],
  },
});
