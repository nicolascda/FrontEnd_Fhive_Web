import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const backendTarget = 'http://127.0.0.1:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/usuarios": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/equipes": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
