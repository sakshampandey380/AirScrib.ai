import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  cacheDir: ".vite-cache",
  optimizeDeps: {
    exclude: ["@mediapipe/tasks-vision"],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          mediapipe: ["@mediapipe/tasks-vision"],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
