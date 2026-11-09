import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../icons/CategoryIcon.jsx'
import './ui.css'

const TABS = [
  { to: '/', label: 'Cocina', icon: 'pot', match: (p) => p === '/' },
  { to: '/listas', label: 'Listas', icon: 'fridge', match: (p) => p.startsWith('/listas') || p.startsWith('/historial') },
  { to: '/recetas', label: 'Recetas', icon: 'book', match: (p) => p.startsWith('/recetas') },
  { to: '/ajustes', label: 'Ajustes', icon: 'radio', match: (p) => p.startsWith('/ajustes') },
]

/** Barra de pestañas fija abajo, con los objetos de la cocina como iconos. */
export default function TabBar() {
  const { pathname } = useLocation()
  return (
    <nav className="tabbar" aria-label="Secciones">
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
