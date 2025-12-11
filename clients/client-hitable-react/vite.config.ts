import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";

export default defineConfig({
  envDir: "env",
  server: {
    port: 3004,
  },
  plugins: [
    react(),
    Pages({
      importMode: "async",
    }),
  ],
  resolve: {
    // declaring alias
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
