import * as React from 'react'
import type { FireworksOptions } from '@meijie/fireworks-core'

// Framework-agnostic types are owned by @meijie/fireworks-core.
export type {
  FireworksShape,
  FireworksOrigin,
  FireworksPreset,
  ColorMode,
  FireworksOptions
} from '@meijie/fireworks-core'

/** ref 暴露的命令式方法 */
export interface FireworksHandle {
  /** 手动触发一轮，可临时覆盖配置 */
  fire(overrides?: FireworksOptions): void
  /** 立即停止并清空 */
  stop(): void
}

/** 组件 props */
export interface ReactFireworksProps extends FireworksOptions {
  /** 受控触发：置 true 触发一轮，播放结束由 onShowChange(false) 通知复位 */
  show?: boolean
  /** 开始播放时触发 */
  onStart?: () => void
  /** 播放结束时触发 */
  onEnd?: () => void
  /** 播放结束时请求把 show 置回 false（对齐 Vue 的 update:show） */
  onShowChange?: (show: boolean) => void
  className?: string
  style?: React.CSSProperties
}

declare const ReactFireworks: React.ForwardRefExoticComponent<
  ReactFireworksProps & React.RefAttributes<FireworksHandle>
>

export default ReactFireworks
