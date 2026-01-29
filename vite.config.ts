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
  },
})
