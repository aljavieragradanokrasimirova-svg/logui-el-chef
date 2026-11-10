import { useRef } from 'react'
import { haptic } from './haptics.js'
import { capturePointer } from './pointer.js'
import { prefersReducedMotion } from '../components/motion/useFlip.js'

/** Desde el borde izquierdo de la pantalla no se desliza la fila: ahí empieza el gesto de volver. */
export const EDGE_PX = 24
const LOCK_PX = 10
const SPRING = 'transform 300ms cubic-bezier(.34, 1.56, .64, 1)'

/**
 * Deslizar una fila a los lados (como en las apps de correo):
 * - a la derecha, pasado el umbral, `onRight` (marcar como comprado);
 * - a la izquierda, pasado el umbral, la fila sale de la pantalla, se pliega y llama a `onLeft` (borrar).
 * Mueve el elemento `slideRef` con el dedo; en `rowRef` pone `data-swipe="right|left"` y `data-armed`
 * para que el CSS enseñe el fondo correspondiente. El scroll vertical sigue funcionando (touch-action: pan-y).
 */
export function useSwipeRow({ onRight, onLeft, disabled = false }) {
  const rowRef = useRef(null)
  const slideRef = useRef(null)
  const gesture = useRef(null)
  const suppressClick = useRef(false)

  const set = (dx, { animate = false } = {}) => {
    const slide = slideRef.current
    if (!slide) return
    slide.style.transition = animate ? SPRING : 'none'
    slide.style.transform = dx ? `translateX(${dx}px)` : ''
  }

  const reset = () => {
    const row = rowRef.current
    if (row) {
      delete row.dataset.swipe
      delete row.dataset.armed
    }
  }

  const end = (cancelled) => {
    const g = gesture.current
    gesture.current = null
    if (!g?.locked) return
    const row = rowRef.current
    const slide = slideRef.current
    if (!cancelled && g.armed && g.dx < 0 && row && slide) {
      // Borrar: sale hacia la izquierda y la fila se pliega antes de quitarla del estado
      haptic('remove')
      if (prefersReducedMotion() || !row.animate) {
        onLeft?.()
        return
      }
      slide.style.transition = 'transform 180ms ease-in'
      slide.style.transform = `translateX(${-row.offsetWidth}px)`
      // Con temporizadores y no con `animation.finished`: así se borra aunque la animación no llegue a correr
      setTimeout(() => {
        row.animate([{ height: `${row.offsetHeight}px` }, { height: '0px' }], { duration: 160, easing: 'ease-in', fill: 'forwards' })
        setTimeout(() => onLeft?.(), 160)
      }, 170)
      return
    }
    if (!cancelled && g.armed && g.dx > 0) onRight?.()
    set(0, { animate: true })
    setTimeout(reset, 300)
  }

  const handlers = disabled
    ? {}
    : {
        onPointerDown: (e) => {
          if (e.button > 0 || e.clientX < EDGE_PX) return
          const width = rowRef.current?.offsetWidth ?? 320
          gesture.current = {
            x: e.clientX,
            y: e.clientY,
            dx: 0,
            locked: false,
            armed: false,
            id: e.pointerId,
            threshold: Math.min(110, width * 0.3),
          }
          suppressClick.current = false
        },
        onPointerMove: (e) => {
          const g = gesture.current
          if (!g || e.pointerId !== g.id) return
          const dx = e.clientX - g.x
          const dy = e.clientY - g.y
          if (!g.locked) {
            if (Math.abs(dy) > LOCK_PX && Math.abs(dy) > Math.abs(dx)) {
              gesture.current = null // es scroll vertical
              return
            }
            if (Math.abs(dx) < LOCK_PX || Math.abs(dx) < Math.abs(dy) * 1.3) return
            g.locked = true
            suppressClick.current = true
            capturePointer(e)
          }
          // Pasado el umbral se frena (resistencia), para que se note que ya «está»
          const over = Math.abs(dx) - g.threshold
          g.dx = over > 0 ? Math.sign(dx) * (g.threshold + over * 0.35) : dx
          const armed = Math.abs(dx) >= g.threshold
          if (armed !== g.armed) {
            g.armed = armed
            haptic('tick')
          }
          const row = rowRef.current
          if (row) {
            row.dataset.swipe = dx > 0 ? 'right' : 'left'
            if (armed) row.dataset.armed = ''
            else delete row.dataset.armed
          }
          set(g.dx)
        },
        onPointerUp: () => end(false),
        onPointerCancel: () => end(true),
        // Tras deslizar, el «click» que llega al soltar no debe marcar ni abrir la edición
        onClickCapture: (e) => {
          if (suppressClick.current) {
            e.preventDefault()
            e.stopPropagation()
            suppressClick.current = false
          }
        },
      }

  return { rowRef, slideRef, handlers }
}
