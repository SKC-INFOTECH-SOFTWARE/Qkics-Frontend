import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://192.168.0.114:1000",
        changeOrigin: true,
        secure: false,
      },
      "/media": {
        target: "http://192.168.0.114:1000",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://192.168.0.114:1000",
        ws: true,                 // 🔥 THIS IS THE KEY
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
