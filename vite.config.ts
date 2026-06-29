import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Разрешить доступ с любого хоста
    allowedHosts: [
      'ed445e214b3f.ngrok-free.app',
      'localhost',
      '127.0.0.1',
      '*',
    ],
    // Для работы с ngrok и другими туннелями
    hmr: {
      clientPort: 443, // Используйте порт 443 для HTTPS туннелей
    },
    proxy: {
      '/api/analytics': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/api/analytics-data': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/api/ga-summary': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/ga-summary/, '/ga-summary'),
      },
    },
  },
})
