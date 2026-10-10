import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const port = process.env.PORT ? parseInt(process.env.PORT) : 5173
const catalogTarget = process.env.services__catalog_api__http__0 || 
                      process.env.services__catalog_api__https__0 || 
                      'http://localhost:5222'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port,
    host: true,
    proxy: {
      '/api': {
        target: catalogTarget,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
