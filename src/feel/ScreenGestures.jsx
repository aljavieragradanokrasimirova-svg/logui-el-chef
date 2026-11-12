import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TABS, runTransition } from './viewTransitions.js'
import { EDGE_PX } from './useSwipeRow.js'
import { haptic } from './haptics.js'
import { prefersReducedMotion } from '../components/motion/useFlip.js'

const LOCK_PX = 12
const BACK_PX = 80
const FLICK_SPEED = 0.5 // px/ms


/**
 * En una pantalla de detalle, deslizar desde el borde izquierdo vuelve atrás (como en iOS), con la pantalla
 * siguiendo al dedo. (Cambiar de pestaña deslizando lo hace el carrusel, `TabPager`.)
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
      // Las pestañas se pasan con el carrusel (TabPager); aquí solo «volver» desde el borde en los detalles
      if (TABS.includes(pathname) || t.clientX >= EDGE_PX) return
      g = { x: t.clientX, y: t.clientY, t: e.timeStamp, dx: 0, mode: 'back', locked: false }
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
        if (dx < 0) {
          g = null
          return
        }
        g.locked = true
      }
      g.dx = dx
      g.last = { x: t.clientX, t: e.timeStamp }
      move(Math.max(0, dx) * 0.6)
    }

    const onEnd = (e) => {
      const done = g
      g = null
      if (!done?.locked) return
      const speed = Math.abs(done.dx) / Math.max(1, e.timeStamp - done.t)
      const back = document.querySelector('.hero__back')?.getAttribute('href')
      if ((done.dx < BACK_PX && !(done.dx > 40 && speed > FLICK_SPEED)) || !back?.startsWith('#/')) {
        release()
        return
      }
      // Se va atrás desde donde está la pantalla (sin volver a su sitio antes): sin saltos
      haptic('tick')
      runTransition('back', () => navigate(back.slice(1)))
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
