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
      entry: resolve(__dirname, 'src/index.jsx'),
      formats: [format],
      fileName: () => `index.${ext}`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@meijie/vue-fireworks/engine'
      ],
      output: { exports: 'named' }
    }
  }
})
