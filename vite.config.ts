import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    assetsInlineLimit: 4096, // Inline assets menores que 4kb
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        },
        assetFileNames: (assetInfo) => {
          // Manter nomes de assets mais previsíveis
          if (assetInfo.name && assetInfo.name.endsWith('.png')) {
            return 'assets/[name].[hash][extname]'
          }
          return 'assets/[name].[hash][extname]'
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
