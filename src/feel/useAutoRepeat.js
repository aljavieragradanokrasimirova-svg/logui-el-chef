import { useEffect, useRef } from 'react'

/** Pausas entre repeticiones al mantener pulsado: arranca despacio y acelera. */
export const REPEAT_DELAYS = [400, 160, 140, 120, 100, 85, 70, 60]

/**
 * Botón que repite su acción mientras se mantiene pulsado (− / + de cantidad).
 * Devuelve props para el <button>: con el dedo o el ratón actúa al bajar y luego repite;
 * con teclado (Enter/Espacio) actúa una vez por pulsación, como un botón normal.
 */
export function useAutoRepeat(action, { disabled = false } = {}) {
  const actionRef = useRef(action)
  actionRef.current = action
  const timer = useRef(null)
  const count = useRef(0)

  const stop = () => {
    clearTimeout(timer.current)
    timer.current = null
  }
  useEffect(() => stop, [])
  useEffect(() => {
    if (disabled) stop()
  }, [disabled])

  const tick = () => {
    const delay = REPEAT_DELAYS[Math.min(count.current, REPEAT_DELAYS.length - 1)]
    timer.current = setTimeout(() => {
      count.current += 1
      actionRef.current()
      tick()
    }, delay)
  }

  return {
    onPointerDown: (e) => {
      if (disabled || e.button > 0) return
      e.preventDefault() // sin foco ni selección: el teclado del móvil no se abre ni se cierra
      count.current = 0
      actionRef.current()
      stop()
      tick()
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onContextMenu: (e) => e.preventDefault(),
    // detail === 0: pulsación de teclado (el ratón y el dedo ya actuaron en onPointerDown)
    onClick: (e) => {
      if (e.detail === 0 && !disabled) actionRef.current()
    },
  }
}
