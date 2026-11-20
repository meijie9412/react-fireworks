// Engine re-export — the single source of truth is @meijie/fireworks-core.
// Runtime import goes through the package dependency, so all framework bindings
// share the exact same engine implementation.
export { FireworksEngine, PRESETS, default } from '@meijie/fireworks-core'
