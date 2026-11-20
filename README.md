# @meijie/react-fireworks

[![npm version](https://img.shields.io/npm/v/@meijie/react-fireworks.svg)](https://www.npmjs.com/package/@meijie/react-fireworks)
[![license](https://img.shields.io/npm/l/@meijie/react-fireworks.svg)](./LICENSE)

A canvas-based fireworks component for **React 16.8+** (hooks). Configurable particles, colors, shapes, burst position, trails, glow, multi-burst sequences, looping, and realistic launch physics.

The particle engine is shared with [`@meijie/vue-fireworks`](https://www.npmjs.com/package/@meijie/vue-fireworks) — this package is a thin React wrapper, so bug fixes and engine improvements apply to both.

## Installation

```bash
npm i @meijie/react-fireworks
```

`react` (>=16.8) is a peer dependency. The engine is pulled in via `@meijie/vue-fireworks` as a runtime dependency — Vue itself is **not** required.

## Quick start

### Controlled with `show`

```jsx
import { useState } from 'react'
import ReactFireworks from '@meijie/react-fireworks'

function App () {
  const [show, setShow] = useState(false)

  return (
    <>
      <ReactFireworks
        show={show}
        onShowChange={setShow}
        shape="star"
        glow
        trail
      />
      <button onClick={() => setShow(true)}>Launch</button>
    </>
  )
}
```

Playback automatically calls `onShowChange(false)` when finished, so the component can be triggered again. This mirrors Vue's `v-model:show` / `update:show`.

### Imperative with `ref`

```jsx
import { useRef } from 'react'
import ReactFireworks from '@meijie/react-fireworks'

function App () {
  const fw = useRef(null)

  return (
    <>
      <ReactFireworks ref={fw} count={120} />
      <button onClick={() => fw.current.fire({ origin: { x: 300, y: 200 } })}>
        Launch at position
      </button>
      <button onClick={() => fw.current.stop()}>Stop</button>
    </>
  )
}
```

## Props

All props are optional.

| Prop | Type | Default | Description |
|---|---|---|---|
| `show` | boolean | `false` | Controlled trigger. Set to `true` to launch. Reset via `onShowChange(false)`. |
| `count` | number | `60` | Number of particles per burst |
| `colors` | string[] | `['#FF8201','#2DA6E0','#FF262B']` | Particle color pool (one picked at random per particle) |
| `shape` | `'rect' \| 'circle' \| 'star'` | `'rect'` | Particle shape |
| `origin` | `'center' \| {x,y}` | `'center'` | Burst origin (CSS pixels inside canvas) |
| `followMouse` | boolean | `false` | Burst at mouse position; takes precedence over `origin` |
| `bursts` | number | `1` | Number of consecutive bursts per trigger (`1` = single, max `50`) |
| `burstInterval` | number | `280` | Interval between adjacent bursts, in ms |
| `loop` | boolean | `false` | Keep launching until `stop()` or `show=false` |
| `launch` | boolean | `false` | Show the launch phase (rocket rises, then bursts) |
| `launchDuration` | number | `1200` | Rocket ascent time, in ms |
| `launchFrom` | `'below' \| 'center' \| {x,y}` | `'below'` | Launch origin |
| `gravity` | number | `0.12` | Gravity acceleration |
| `friction` | number | `0.985` | Air drag |
| `spread` | number | `5` | Max initial explosion speed |
| `size` | number | `4` | Particle size in px |
| `duration` | number | `90` | Max particle lifetime in frames |
| `trail` | boolean | `false` | Motion trail |
| `glow` | boolean | `false` | Glow effect |
| `fps` | number | `60` | Render frame rate |
| `className` | string | — | Class on the wrapper element |
| `style` | CSSProperties | — | Inline style on the wrapper (merged with defaults) |

Any other props (e.g. `data-*`, `aria-*`) are forwarded to the wrapper `<div>`.

## Events

| Callback | Description |
|---|---|
| `onStart` | Fired when playback starts |
| `onEnd` | Fired when playback ends |
| `onShowChange(show)` | Fired with `false` when playback ends, to reset controlled `show` |

## Ref API

| Method | Description |
|---|---|
| `fire(overrides?)` | Trigger a round, optionally with temporary config overrides |
| `stop()` | Stop immediately and clear all particles / timers |

Calling `ref.fire({ origin })` with an explicit origin forces a **single** burst (multi-burst and looping are ignored), so "click here, burst here" stays deterministic.

## Using the engine directly

The engine has no React or Vue dependency and can be used standalone:

```js
import { FireworksEngine } from '@meijie/react-fireworks/engine'

const engine = new FireworksEngine(canvasEl, { count: 80, glow: true })
engine.onEnd = () => console.log('done')
engine.fire()
// engine.setOptions({ shape: 'star' }); engine.stop(); engine.destroy()
```

## Development

```bash
npm install
npm test        # Vitest unit tests
npm run build   # build dist/ (ESM + CJS + type declarations)
npm run dev     # interactive demo at http://127.0.0.1:5193
```

## License

MIT
