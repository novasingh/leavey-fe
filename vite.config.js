import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow connections from any host
    proxy: {
      '/api': [
        {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        {
          target: 'http://ec2-54-251-95-96.ap-southeast-1.compute.amazonaws.com',
          changeOrigin: true,
        },
        {
          target: 'https://ec2-54-251-95-96.ap-southeast-1.compute.amazonaws.com',
          changeOrigin: true,
        },
      ],
    },
    cors: true, // allow all origins
  },
})
