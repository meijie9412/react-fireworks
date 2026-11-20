import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// 本地联调：引擎指向同目录的 fireworks-core 源码，
// 发布后消费者会走 @meijie/fireworks-core 真实依赖。
const LOCAL_CORE = resolve(__dirname, '../fireworks-core/src/engine.js')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: /^@meijie\/fireworks-core$/, replacement: LOCAL_CORE }]
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js']
  }
})
