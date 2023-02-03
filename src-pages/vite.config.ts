import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3002,
  },
  plugins: [svelte()],
  optimizeDeps: { include: ['@carbon/charts'] },
  build : {
    outDir: '../docs'
  }
})
