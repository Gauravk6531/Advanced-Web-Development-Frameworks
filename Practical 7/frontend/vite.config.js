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
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/tasks': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/register': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/me': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
