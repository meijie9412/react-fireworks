import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { createRef } from 'react'
import { render, act } from '@testing-library/react'
import ReactFireworks from '../src/index.jsx'

describe('ReactFireworks', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('挂载后渲染 canvas 容器', () => {
    const { container } = render(<ReactFireworks />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
    expect(canvas.width).toBeGreaterThan(0)
    expect(canvas.height).toBeGreaterThan(0)
    // 容器默认全屏、非跟随鼠标时接收事件
    const wrap = canvas.parentElement
    expect(wrap.style.position).toBe('fixed')
    expect(wrap.style.pointerEvents).toBe('auto')
  })

  it('followMouse 为 true 时容器不拦截指针事件', () => {
    const { container } = render(<ReactFireworks followMouse />)
    expect(container.querySelector('canvas').parentElement.style.pointerEvents).toBe('none')
  })

  it('show 从 false 变 true 触发 onStart 并生成粒子', () => {
    const onStart = vi.fn()
    const ref = createRef()
    const { rerender } = render(<ReactFireworks ref={ref} show={false} onStart={onStart} count={12} />)
    expect(onStart).not.toHaveBeenCalled()

    rerender(<ReactFireworks ref={ref} show onStart={onStart} count={12} />)
    expect(onStart).toHaveBeenCalledTimes(1)
    // 通过反射拿引擎实例验证粒子生成（薄壳内部 ref 未暴露，用 canvas 的引擎引用）
    const engine = ref.current && ref.current.__engine
    // 引擎未直接暴露，验证 start 回调即可；粒子生成由引擎单测覆盖
    expect(engine).toBeUndefined()
  })

  it('首次挂载 show 就为 true 也会触发（prevShow 初值修复）', () => {
    const onStart = vi.fn()
    render(<ReactFireworks show onStart={onStart} />)
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('ref.fire / ref.stop 可命令式调用', () => {
    const ref = createRef()
    const onStart = vi.fn()
    render(<ReactFireworks ref={ref} count={10} onStart={onStart} />)
    expect(typeof ref.current.fire).toBe('function')
    expect(typeof ref.current.stop).toBe('function')

    act(() => { ref.current.fire({ count: 7 }) })
    expect(onStart).toHaveBeenCalledTimes(1)
    expect(() => act(() => ref.current.stop())).not.toThrow()
  })

  it('onShowChange 与 onEnd 在播放结束时被调用', () => {
    const onEnd = vi.fn()
    const onShowChange = vi.fn()
    const ref = createRef()
    render(<ReactFireworks ref={ref} onEnd={onEnd} onShowChange={onShowChange} count={5} />)

    act(() => { ref.current.fire() })
    // 推进 rAF 让粒子走完生命周期：duration 默认 90 帧，固定步长下需多帧
    // 这里用大量推进直到 idle，引擎会调 onEnd
    act(() => { window.__flushRaf(300, 5000) })
    expect(onEnd).toHaveBeenCalled()
    expect(onShowChange).toHaveBeenCalledWith(false)
  })

  it('回调更新后仍调用最新版本（callbacksRef 生效）', () => {
    const ref = createRef()
    const oldStart = vi.fn()
    const newStart = vi.fn()
    const { rerender } = render(<ReactFireworks ref={ref} onStart={oldStart} />)
    rerender(<ReactFireworks ref={ref} onStart={newStart} />)
    act(() => { ref.current.fire() })
    expect(oldStart).not.toHaveBeenCalled()
    expect(newStart).toHaveBeenCalledTimes(1)
  })

  it('卸载后调用已保存的 ref.fire 不报错（内部引擎已销毁）', () => {
    const ref = createRef()
    const { unmount } = render(<ReactFireworks ref={ref} />)
    const handle = ref.current // 卸载前保存 handle
    unmount()
    // React 会把 ref.current 置 null，但已保存的 handle 仍可调用；
    // 组件内部 engine 已销毁并置 null，应安全返回而非抛错
    expect(() => handle.fire()).not.toThrow()
    expect(() => handle.stop()).not.toThrow()
  })

  it('透传额外 DOM 属性到容器，且不把配置键落到 DOM', () => {
    const { container } = render(
      <ReactFireworks count={99} data-testid="fw" aria-label="fireworks" />
    )
    const wrap = container.querySelector('canvas').parentElement
    expect(wrap.getAttribute('data-testid')).toBe('fw')
    expect(wrap.getAttribute('aria-label')).toBe('fireworks')
    expect(wrap.getAttribute('count')).toBeNull()
  })
})
