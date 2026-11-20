/**
 * ReactFireworks — React 薄壳
 * 引擎复用 @meijie/vue-fireworks/engine（纯 JS，不依赖 Vue 运行时），
 * 与 Vue2/Vue3 薄壳共用同一份核心逻辑。
 */
import {
  forwardRef, useEffect, useImperativeHandle, useRef
} from 'react'
import { FireworksEngine } from '@meijie/vue-fireworks/engine'

/** 需要同步给引擎的配置键（不含 show 与回调） */
const CONFIG_KEYS = [
  'count', 'colors', 'shape', 'gravity', 'friction', 'spread',
  'size', 'trail', 'glow', 'duration', 'origin', 'followMouse',
  'bursts', 'burstInterval', 'loop',
  'launch', 'launchDuration', 'launchFrom', 'fps'
]

function collectOptions (props) {
  const opts = {}
  for (const key of CONFIG_KEYS) {
    if (props[key] !== undefined) opts[key] = props[key]
  }
  return opts
}

/** 从 restProps 中剔除引擎配置键，避免落到 DOM 上产生未知属性警告 */
function pickDomProps (props) {
  const exclude = new Set([
    ...CONFIG_KEYS,
    'show', 'onStart', 'onEnd', 'onShowChange', 'className', 'style'
  ])
  const rest = {}
  for (const key of Object.keys(props)) {
    if (!exclude.has(key)) rest[key] = props[key]
  }
  return rest
}

/**
 * @typedef {Object} FireworksHandle
 * @property {(overrides?: object) => void} fire 触发一轮烟花，可带临时配置
 * @property {() => void} stop 立即停止并清空
 */

const ReactFireworks = forwardRef(function ReactFireworks (props, ref) {
  const {
    show = false,
    onStart,
    onEnd,
    onShowChange,
    className,
    style
  } = props

  const domProps = pickDomProps(props)

  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  // 用 ref 持有最新回调，避免回调变化导致引擎重建
  const callbacksRef = useRef({ onStart, onEnd, onShowChange })
  callbacksRef.current = { onStart, onEnd, onShowChange }

  // 用 ref 持有最新配置，供 fire() 使用，避免闭包捕获旧值
  const optionsRef = useRef(collectOptions(props))
  optionsRef.current = collectOptions(props)

  // 创建引擎（仅一次）
  useEffect(() => {
    const engine = new FireworksEngine(canvasRef.current, optionsRef.current)
    engineRef.current = engine

    engine.onEnd = () => {
      // 通知父级把 show 置回 false（对齐 Vue 的 update:show）
      if (callbacksRef.current.onShowChange) callbacksRef.current.onShowChange(false)
      if (callbacksRef.current.onEnd) callbacksRef.current.onEnd()
    }

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 配置变化 → setOptions（引擎内部会处理 followMouse 的解绑/重绑）
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    const patch = {}
    for (const key of CONFIG_KEYS) {
      if (props[key] !== undefined) patch[key] = props[key]
    }
    engine.setOptions(patch)
  }, CONFIG_KEYS.map(k => props[k])) // eslint-disable-line react-hooks/exhaustive-deps

  // show 变化 → 触发 / 停止
  // 初始为 false：若首次挂载 show 就为 true，下面 effect 会正确触发第一轮
  const prevShow = useRef(false)
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    if (show && !prevShow.current) {
      if (callbacksRef.current.onStart) callbacksRef.current.onStart()
      engine.fire()
    } else if (!show && prevShow.current) {
      engine.stop()
    }
    prevShow.current = show
  }, [show])

  // 暴露命令式方法
  useImperativeHandle(ref, () => ({
    fire (overrides) {
      const engine = engineRef.current
      if (!engine) return
      if (callbacksRef.current.onStart) callbacksRef.current.onStart()
      engine.fire(overrides)
    },
    stop () {
      const engine = engineRef.current
      if (engine) engine.stop()
    }
  }), [])

  // 容器样式：全屏覆盖，跟随鼠标时不拦截事件（对齐 Vue 版）
  const followMouse = props.followMouse
  const containerStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 11,
    pointerEvents: followMouse ? 'none' : 'auto',
    ...style
  }

  return (
    <div className={className} style={containerStyle} {...domProps}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
})

export default ReactFireworks
