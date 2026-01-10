import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/make-call': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/download-logs': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
