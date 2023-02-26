import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3001,
  },
  preview: {
    port: 3001,
  },
  plugins: [svelte()],
  build: {
    outDir: "../src",
  },
  optimizeDeps: { include: ["@carbon/charts"] },
});
