import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
  // Allow Electron to load static assets via file:// protocol in production
  base: "./",
  server: {
    // Allow the Electron main process to connect to the dev server
    cors: true,
    proxy: {
      // Proxy /uploads/* to backend so images load from same origin (no CORS issues)
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});

