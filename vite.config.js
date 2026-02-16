import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://qkicsbackend.matchb.online",
        changeOrigin: true,
        secure: false,
      },
      "/media": {
        target: "https://qkicsbackend.matchb.online",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "https://qkicsbackend.matchb.online",
        ws: true,                 // 🔥 THIS IS THE KEY
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
