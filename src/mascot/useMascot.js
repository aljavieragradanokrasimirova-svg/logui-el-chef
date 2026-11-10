import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Humor de Logui en una pantalla: `base` es su estado normal y `react(mood, line, ms)` lo cambia un rato
 * (con un bocadillo opcional) antes de volver a `base`.
 * Si `idleLine` se da, tras `idleMs` sin tocar la pantalla se pone pensativo y lo dice.
 */
export function useMascot(base, { idleLine, idleMs = 30000 } = {}) {
  const [reaction, setReaction] = useState(null) // { mood, line, id }
  const timer = useRef(null)
  const serial = useRef(0)

  const react = useCallback((mood, line = '', ms = 2200) => {
    clearTimeout(timer.current)
    serial.current += 1
    setReaction({ mood, line, id: serial.current })
    timer.current = setTimeout(() => setReaction(null), ms)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  // Inactividad: cualquier toque o tecla reinicia la cuenta
  const idleRef = useRef(idleLine)
  idleRef.current = idleLine
  const enabled = Boolean(idleLine)
  useEffect(() => {
    if (!enabled) return undefined
    let idle
    const arm = () => {
      clearTimeout(idle)
      idle = setTimeout(() => {
        if (typeof idleRef.current === 'function') react('think', idleRef.current(), 4500)
      }, idleMs)
    }
    arm()
    const events = ['pointerdown', 'keydown', 'scroll']
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }))
    return () => {
      clearTimeout(idle)
      events.forEach((e) => window.removeEventListener(e, arm))
    }
  }, [enabled, idleMs, react])

  return {
    mood: reaction?.mood ?? base,
    bubble: reaction?.line ? { text: reaction.line, id: reaction.id } : null,
    react,
  }
}
