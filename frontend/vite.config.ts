import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Builds to the default ./dist so the frontend can be deployed as a standalone
  // static site (Vercel/Netlify). The API base is configured via VITE_API_BASE.
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8077',
        changeOrigin: true,
      },
    },
  },
})
