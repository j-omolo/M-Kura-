import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@mui/icons-material', '@mui/x-date-pickers']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'router-vendor': ['react-router-dom']
        }
      }
    }
  },
  esbuild: {
    jsxInject: `import React from 'react'`
  }
})
