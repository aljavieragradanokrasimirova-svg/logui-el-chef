import { useCallback, useEffect, useLayoutEffect } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { prefersReducedMotion } from '../components/motion/useFlip.js'

/**
 * Transiciones entre pantallas con la View Transitions API del navegador (CSS en styles/feel.css):
 * entrar más adentro (lista → detalle) entra desde la derecha; volver, desde la izquierda; entre pestañas, fundido.
 * La barra de pestañas no se mueve. Sin soporte (o con «reducir animaciones») se navega sin animación.
 */

export const TABS = ['/', '/listas', '/recetas', '/ajustes']

export const tabIndex = (path) => {
  if (path === '/') return 0
  const index = TABS.findIndex((tab, i) => i > 0 && (path === tab || path.startsWith(`${tab}/`)))
  if (index !== -1) return index
  return path.startsWith('/historial') ? 1 : -1
}
const depth = (path) => path.split('/').filter(Boolean).length
const isTabRoot = (path) => TABS.includes(path)

/** 'forward' | 'back' | 'tab-left' | 'tab-right' | 'fade' según de dónde a dónde se va. */
export function transitionKind(from, to) {
  if (from === to) return 'fade'
  if (isTabRoot(from) && isTabRoot(to)) return tabIndex(to) > tabIndex(from) ? 'tab-right' : 'tab-left'
  const fromTab = tabIndex(from)
  const toTab = tabIndex(to)
  if (fromTab !== toTab && fromTab !== -1 && toTab !== -1 && (isTabRoot(to) || isTabRoot(from))) {
    return toTab > fromTab ? 'tab-right' : 'tab-left'
  }
  if (depth(to) > depth(from) || to.startsWith(`${from}/`)) return 'forward'
  if (depth(to) < depth(from)) return 'back'
  return 'fade'
}

const supported = () => typeof document !== 'undefined' && typeof document.startViewTransition === 'function'

/** Ejecuta `update` (que cambia de pantalla) dentro de una transición. */
export function runTransition(kind, update) {
  if (!supported() || prefersReducedMotion()) {
    update()
    return
  }
  const root = document.documentElement
  root.dataset.vt = kind
  try {
    const transition = document.startViewTransition(() => flushSync(update))
    transition.finished.finally(() => {
      delete root.dataset.vt
    })
  } catch {
    delete root.dataset.vt
    update()
  }
}

/** Como `useNavigate`, pero con transición. Acepta un número (-1) para volver atrás. */
export function useAppNavigate() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return useCallback(
    (to, options) => {
      if (typeof to === 'number') {
        runTransition('back', () => navigate(to))
        return
      }
      const target = String(to).split('?')[0]
      runTransition(transitionKind(pathname, target), () => navigate(to, options))
    },
    [navigate, pathname],
  )
}

/**
 * Se monta una vez dentro del router: hace que todos los enlaces internos (`<Link>`) usen la transición
 * y que cada pantalla nueva empiece arriba del todo.
 */
export function ViewTransitions() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (!supported() || prefersReducedMotion()) return
      const link = e.target.closest?.('a[href^="#/"]')
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return
      const to = link.getAttribute('href').slice(1)
      const current = window.location.hash.slice(1) || '/'
      // Entre pestañas se encarga el carrusel (desliza hasta la página): no hay transición
      if (TABS.includes(current) && TABS.includes(to)) return
      // El <Link> de React Router ve `defaultPrevented` y no navega: lo hacemos nosotros dentro de la transición
      e.preventDefault()
      if (to === current) return
      runTransition(transitionKind(current, to), () => navigate(to))
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [navigate])

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
