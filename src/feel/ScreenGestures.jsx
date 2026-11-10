import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TABS, runTransition } from './viewTransitions.js'
import { EDGE_PX } from './useSwipeRow.js'
import { haptic } from './haptics.js'
import { prefersReducedMotion } from '../components/motion/useFlip.js'

const LOCK_PX = 12
const BACK_PX = 80
const TAB_PX = 70
const FLICK_SPEED = 0.5 // px/ms

/** Zonas donde el gesto de pantalla no debe empezar: filas deslizables, campos, ventanas… */
const IGNORE = '.item__slide, input, textarea, select, dialog, [data-no-swipe], .toast'

/**
 * Gestos de pantalla con el dedo (solo táctil):
 * - en una pantalla de detalle, deslizar desde el borde izquierdo vuelve atrás (como en iOS);
 * - en las pantallas principales, deslizar a los lados cambia de pestaña.
 * La pantalla sigue un poco al dedo para que se note el gesto.
 */
export default function ScreenGestures() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    let g = null
    const screen = () => document.querySelector('main.screen')

    const move = (dx) => {
      const el = screen()
      if (!el || prefersReducedMotion()) return
      el.style.transition = 'none'
      el.style.transform = `translateX(${dx}px)`
    }
    const release = () => {
      const el = screen()
      if (!el) return
      el.style.transition = 'transform 260ms cubic-bezier(.34, 1.56, .64, 1)'
      el.style.transform = ''
      setTimeout(() => {
        el.style.transition = ''
      }, 280)
    }

    const onStart = (e) => {
      if (e.touches.length !== 1 || document.querySelector('dialog[open]')) return
      const t = e.touches[0]
      const isTab = TABS.includes(pathname)
      const fromEdge = t.clientX < EDGE_PX
      if (!isTab && !fromEdge) return
      if (!fromEdge && e.target.closest?.(IGNORE)) return
      g = { x: t.clientX, y: t.clientY, t: e.timeStamp, dx: 0, mode: isTab ? 'tab' : 'back', locked: false }
    }

    const onMove = (e) => {
      if (!g) return
      const t = e.touches[0]
      const dx = t.clientX - g.x
      const dy = t.clientY - g.y
      if (!g.locked) {
        if (Math.abs(dy) > LOCK_PX && Math.abs(dy) > Math.abs(dx)) {
          g = null // es scroll
          return
        }
        if (Math.abs(dx) < LOCK_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return
        if (g.mode === 'back' && dx < 0) {
          g = null
          return
        }
        g.locked = true
      }
      g.dx = dx
      g.last = { x: t.clientX, t: e.timeStamp }
      move(g.mode === 'back' ? Math.max(0, dx) * 0.6 : dx * 0.25)
    }

    const onEnd = (e) => {
      const done = g
      g = null
      if (!done?.locked) return
      release()
      const speed = Math.abs(done.dx) / Math.max(1, e.timeStamp - done.t)
      if (done.mode === 'back') {
        if (done.dx < BACK_PX && !(done.dx > 40 && speed > FLICK_SPEED)) return
        const back = document.querySelector('.hero__back')?.getAttribute('href')
        if (!back?.startsWith('#/')) return
        haptic('tick')
        runTransition('back', () => navigate(back.slice(1)))
        return
      }
      if (Math.abs(done.dx) < TAB_PX && !(Math.abs(done.dx) > 40 && speed > FLICK_SPEED)) return
      const index = TABS.indexOf(pathname)
      const next = index + (done.dx < 0 ? 1 : -1)
      if (next < 0 || next >= TABS.length) return
      haptic('tick')
      runTransition(done.dx < 0 ? 'tab-right' : 'tab-left', () => navigate(TABS[next]))
    }

    const onCancel = () => {
      if (g?.locked) release()
      g = null
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd)
    document.addEventListener('touchcancel', onCancel)
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onCancel)
    }
  }, [pathname, navigate])

  return null
}
