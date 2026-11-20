import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

const format = process.env.FORMAT === 'cjs' ? 'cjs' : 'es'
const ext = format === 'cjs' ? 'cjs' : 'js'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: format === 'es',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.jsx'),
        engine: resolve(__dirname, 'src/engine.js')
      },
      formats: [format],
      fileName: (fmt, entryName) => `${entryName}.${ext}`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@meijie/fireworks-core'
      ],
      output: { exports: 'named' }
    }
  }
})
