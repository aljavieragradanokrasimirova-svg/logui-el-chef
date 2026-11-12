import { useLayoutEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TABS as TAB_PATHS, tabIndex } from '../../feel/viewTransitions.js'
import { setTabPosition } from '../../feel/TabPager.jsx'
import { Icon } from '../icons/CategoryIcon.jsx'
import './ui.css'

const TABS = [
  { to: '/', label: 'Cocina', icon: 'pot', match: (p) => p === '/' },
  { to: '/listas', label: 'Listas', icon: 'fridge', match: (p) => p.startsWith('/listas') || p.startsWith('/historial') },
  { to: '/recetas', label: 'Recetas', icon: 'book', match: (p) => p.startsWith('/recetas') },
  { to: '/ajustes', label: 'Ajustes', icon: 'radio', match: (p) => p.startsWith('/ajustes') },
]

/**
 * Barra de pestañas fija abajo, con los objetos de la cocina como iconos.
 * La pastilla que marca la pestaña activa se mueve con `--tab-pos`, que el carrusel actualiza mientras se
 * desliza el dedo (así la barra acompaña al gesto).
 */
export default function TabBar() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    // Fuera del carrusel (pantallas de detalle) la posición sale de la ruta
    if (!TAB_PATHS.includes(pathname)) setTabPosition(Math.max(0, tabIndex(pathname)))
  }, [pathname])
  return (
    <nav className="tabbar" aria-label="Secciones">
      <span className="tabbar__pill" aria-hidden="true" />
      {TABS.map((tab) => {
        const active = tab.match(pathname)
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`tabbar__tab${active ? ' tabbar__tab--on' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon icon={tab.icon} size={30} />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
