// jsdom 不实现 canvas 2d context，这里提供最小 mock 供引擎构造与渲染使用
const noop = () => {}

function makeCtx () {
  return {
    canvas: null,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '#000',
    shadowBlur: 0,
    shadowColor: '',
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'butt',
    clearRect: noop,
    fillRect: noop,
    strokeRect: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    fill: noop,
    stroke: noop,
    arc: noop,
    save: noop,
    restore: noop,
    translate: noop,
    rotate: noop,
    scale: noop,
    setTransform: noop,
    drawImage: noop,
    createRadialGradient: () => ({ addColorStop: noop }),
    createLinearGradient: () => ({ addColorStop: noop })
  }
}

HTMLCanvasElement.prototype.getContext = function getContext (type) {
  if (type === '2d') {
    if (!this.__ctx) {
      this.__ctx = makeCtx()
      this.__ctx.canvas = this
    }
    return this.__ctx
  }
  return null
}

// jsdom 默认 clientWidth/Height 为 0，引擎会回退到 window 尺寸，这里给个确定值
Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get () { return 800 }
})
Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  get () { return 600 }
})

// 稳定的 rAF/cAF
let rafId = 0
const rafMap = new Map()
window.requestAnimationFrame = (cb) => {
  const id = ++rafId
  rafMap.set(id, cb)
  return id
}
window.cancelAnimationFrame = (id) => rafMap.delete(id)

window.__flushRaf = (times = 1, t = 0) => {
  for (let i = 0; i < times; i++) {
    const entries = [...rafMap.entries()]
    rafMap.clear()
    for (const [, cb] of entries) cb(t + i * 16.7)
  }
}
