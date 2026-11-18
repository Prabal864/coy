import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/feed': 'http://localhost:3001',
      '/swipe': 'http://localhost:3001',
      '/matches': 'http://localhost:3001',
      '/reset': 'http://localhost:3001',
    },
  },
})
