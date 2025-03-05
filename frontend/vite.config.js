// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Add the specific host to the allowed hosts
    allowedHosts: [
      '55db-2401-4900-7fb7-c614-e143-d47e-bf28-194f.ngrok-free.app'
    ]
  }
})