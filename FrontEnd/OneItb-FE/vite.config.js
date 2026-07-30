import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss()
  ].filter(Boolean),
  server: {
    proxy: {
      '/graphql': {
        target: 'https://localhost:44397',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/api': {
        target: 'https://localhost:44397',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'https://localhost:44397',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    __DEV__: 'true'
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js'
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pdfjs-dist')) {
            return 'pdfjs';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
}))

