import React, { useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import ReactFireworks from '../src/index.jsx'

function Demo () {
  const [show, setShow] = useState(false)
  const [config, setConfig] = useState({
    shape: 'star', count: 120, bursts: 1, burstInterval: 280,
    loop: false, launch: true, launchDuration: 1000, trail: true, glow: true
  })
  const fwRef = useRef(null)
  const [events, setEvents] = useState([])
  const [engineInfo, setEngineInfo] = useState('')

  const set = (key, val) => setConfig(c => ({ ...c, [key]: val }))

  const fireByShow = () => {
    setEvents(e => [...e, 'start(via show)'])
    setShow(false)
    setTimeout(() => setShow(true), 30)
  }

  const fireByRef = () => fwRef.current && fwRef.current.fire()

  // 暴露引擎内部状态供 Playwright 验证（仅 demo 用途）
  const inspect = () => {
    // 引擎未从薄壳直接暴露，用 canvas 尺寸 + 事件作为可观测信号
    const c = document.querySelector('canvas')
    setEngineInfo(c ? `canvas ${c.width}x${c.height}` : 'no canvas')
  }
  window.__demoInspect = inspect

  return (
    <>
      <ReactFireworks
        ref={fwRef}
        show={show}
        {...config}
        onStart={() => setEvents(e => [...e, 'start'])}
        onEnd={() => setEvents(e => [...e, 'end'])}
        onShowChange={(v) => { setShow(v); setEvents(e => [...e, `showChange(${v})`]) }}
      />
      <div className="panel">
        <h1>@meijie/react-fireworks</h1>
        <div className="row"><label>形状</label>
          <select value={config.shape} onChange={e => set('shape', e.target.value)}>
            <option value="rect">方块</option><option value="circle">圆形</option><option value="star">星形</option>
          </select>
        </div>
        <div className="row"><label>粒子数</label>
          <input type="range" min="20" max="200" value={config.count} onChange={e => set('count', +e.target.value)} />
          <span className="val">{config.count}</span>
        </div>
        <div className="row"><label>连发朵数</label>
          <input type="range" min="1" max="10" value={config.bursts} onChange={e => set('bursts', +e.target.value)} />
          <span className="val">{config.bursts}</span>
        </div>
        <div className="row"><label>发射过程</label>
          <input type="checkbox" checked={config.launch} onChange={e => set('launch', e.target.checked)} />
        </div>
        <div className="row"><label>拖尾</label>
          <input type="checkbox" checked={config.trail} onChange={e => set('trail', e.target.checked)} />
        </div>
        <div className="row"><label>发光</label>
          <input type="checkbox" checked={config.glow} onChange={e => set('glow', e.target.checked)} />
        </div>
        <button id="fire-show" onClick={fireByShow}>放烟花（show 触发）</button>
        <button id="fire-ref" onClick={fireByRef}>放烟花（ref.fire）</button>
        <div className="status" id="status">show={String(show)} · events: {events.slice(-6).join(', ')}</div>
        <div className="status" id="engine-info">{engineInfo}</div>
      </div>
    </>
  )
}

createRoot(document.getElementById('root')).render(<Demo />)
