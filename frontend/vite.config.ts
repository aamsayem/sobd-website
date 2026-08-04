import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  plugins: [tanstackStart(), react(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 4173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/media": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
  define: {
    "process.env": {},
  },
});
