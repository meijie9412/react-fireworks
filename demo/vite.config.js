import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// 本地联调：引擎指向同目录的 fireworks-core 源码
const LOCAL_CORE = resolve(__dirname, '../../fireworks-core/src/engine.js')

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: [{ find: /^@meijie\/fireworks-core$/, replacement: LOCAL_CORE }]
  },
  server: { port: 5193, host: '127.0.0.1' }
})
