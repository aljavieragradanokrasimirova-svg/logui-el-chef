import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import HomeScreen from '../screens/HomeScreen.jsx'
import ListsScreen from '../screens/ListsScreen.jsx'
import RecipesScreen from '../screens/RecipesScreen.jsx'
import SettingsScreen from '../screens/SettingsScreen.jsx'
import { TABS } from './viewTransitions.js'
import { haptic } from './haptics.js'
import { prefersReducedMotion } from '../components/motion/useFlip.js'

const SCREENS = [HomeScreen, ListsScreen, RecipesScreen, SettingsScreen]

/** Posición del carrusel (0 = Cocina … 3 = Ajustes, con decimales mientras se arrastra) para la barra de pestañas. */
export function setTabPosition(pos, { live = false } = {}) {
  const root = document.documentElement
  root.style.setProperty('--tab-pos', String(pos))
  root.classList.toggle('is-paging', live)
}

/**
 * Las cuatro pestañas una al lado de otra, como las páginas del escritorio del móvil: se pasan con el dedo
 * usando el desplazamiento nativo del navegador (sigue al dedo, inercia y encaje en cada página), así que va
 * tan fluido como el propio sistema. Cada página tiene su propio scroll vertical.
 * La ruta (#/listas…) se actualiza al encajar; tocar una pestaña desliza hasta ella.
 */
export default function TabPager() {
  const ref = useRef(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const index = Math.max(0, TABS.indexOf(pathname))
  const pathRef = useRef(pathname)
  pathRef.current = pathname

  // Al montar (o al girar la pantalla): directamente en la página de la ruta, sin animación
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const place = () => {
      el.scrollTo({ left: Math.max(0, TABS.indexOf(pathRef.current)) * el.clientWidth, behavior: 'instant' })
      setTabPosition(Math.max(0, TABS.indexOf(pathRef.current)))
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  // La ruta cambió por una pestaña tocada: deslizar hasta su página (si el dedo no la ha traído ya)
  useEffect(() => {
    const el = ref.current
    if (!el || !el.clientWidth) return
    const current = Math.round(el.scrollLeft / el.clientWidth)
    if (current === index) return
    el.scrollTo({ left: index * el.clientWidth, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
  }, [index])

  // Mientras se desliza: la barra de pestañas sigue al dedo. Al encajar: se actualiza la ruta.
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let frame = 0
    let settleTimer = 0
    const settle = () => {
      const page = Math.round(el.scrollLeft / el.clientWidth)
      setTabPosition(page)
      const target = TABS[page]
      if (target && target !== pathRef.current) {
        haptic('tick')
        navigate(target)
      }
    }
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          setTabPosition(el.scrollLeft / el.clientWidth, { live: true })
        })
      }
      // `scrollend` no existe en todos los navegadores: respaldo con un temporizador
      clearTimeout(settleTimer)
      settleTimer = setTimeout(settle, 140)
    }
    const onScrollEnd = () => {
      clearTimeout(settleTimer)
      settle()
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('scrollend', onScrollEnd)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settleTimer)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('scrollend', onScrollEnd)
    }
  }, [navigate])

  return (
    <div className="pager" ref={ref}>
      {SCREENS.map((Screen, i) => (
        <section key={TABS[i]} className="pager__page" inert={i !== index} aria-hidden={i !== index}>
          <Screen />
        </section>
      ))}
    </div>
  )
}
