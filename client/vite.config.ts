import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve('.', './src'),
    },
  },
  server: {
    watch: {
      // Don't watch Visual Studio's locked cache files
      // watching them crashes the dev server with EBUSY on Windows.
      ignored: ['**/.vs/**', '**/dist/**', '**/node_modules/**', '**/.git/**'],
    },
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
})