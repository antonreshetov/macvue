import { onBeforeUnmount } from 'vue'

// NSStepper-style press-and-hold: one step immediately, a pause, then
// accelerating repeats. The curve constants are unverified until a
// frame-by-frame capture of the native control — single tuning point here.
const INITIAL_DELAY_MS = 500
const REPEAT_INTERVAL_MS = 100
const MIN_INTERVAL_MS = 30
const ACCELERATION = 0.9

/**
 * `fire` performs one step and returns whether the value changed;
 * a `false` (hit a bound without wrapping) stops the repeat.
 */
export function useAutoRepeat(fire: () => boolean) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let interval = REPEAT_INTERVAL_MS

  function tick() {
    if (!fire()) {
      cancel()
      return
    }
    interval = Math.max(MIN_INTERVAL_MS, interval * ACCELERATION)
    timer = setTimeout(tick, interval)
  }

  function start() {
    cancel()
    if (!fire())
      return
    interval = REPEAT_INTERVAL_MS
    timer = setTimeout(tick, INITIAL_DELAY_MS)
    // Losing the window mid-press must not leave the repeat running.
    window.addEventListener('blur', cancel)
  }

  function cancel() {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    window.removeEventListener('blur', cancel)
  }

  onBeforeUnmount(cancel)

  return { start, cancel }
}
