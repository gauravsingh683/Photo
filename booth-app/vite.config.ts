import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/hardware': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/whatsapp': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/upload': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/view': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
})
