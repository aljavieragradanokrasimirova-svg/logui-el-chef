import { useLayoutEffect, useRef } from 'react'

/** true si el usuario pidió menos movimiento (ajuste de la app o del sistema). */
export function prefersReducedMotion() {
  if (typeof document === 'undefined') return true
  if (document.documentElement.classList.contains('reduce-motion')) return true
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Animación FLIP de reordenación: tras cada render, los hijos directos de `ref` con `data-flip-id`
 * que hayan cambiado de sitio se deslizan desde su posición anterior a la nueva.
 * Las posiciones se miden respecto al contenedor, así que lo que pase fuera de él (avisos que aparecen,
 * scroll) no provoca movimientos.
 */
export function useFlip(ref, { duration = 320, easing = 'cubic-bezier(.34, 1.56, .64, 1)' } = {}) {
  const previous = useRef(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const base = root.getBoundingClientRect().top
    const current = new Map()
    for (const el of root.querySelectorAll(':scope > [data-flip-id]')) {
      current.set(el.dataset.flipId, { el, top: el.getBoundingClientRect().top - base })
    }

    if (previous.current && !prefersReducedMotion()) {
      for (const [id, { el, top }] of current) {
        const before = previous.current.get(id)
        if (before === undefined) continue
        const dy = before - top
        if (Math.abs(dy) < 1 || typeof el.animate !== 'function') continue
        el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], { duration, easing })
      }
    }

    previous.current = new Map([...current].map(([id, { top }]) => [id, top]))
  })
}
