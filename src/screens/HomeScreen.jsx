import { Link } from 'react-router-dom'
import KitchenScene from '../components/kitchen/KitchenScene.jsx'
import { useStore } from '../store/StoreProvider.jsx'

/** Inicio: la cocina ilustrada con sus cuatro objetos tocables y accesos rápidos debajo. */
export default function HomeScreen() {
  const { state } = useStore()
  const lists = state.lists.filter((l) => l.archivedAt === null).length
  const archived = state.lists.length - lists
  const recipes = state.recipes.length

  return (
    <main className="screen">
      <header>
        <h1>Logui el chef</h1>
        <p style={{ margin: 'var(--sp-1) 0 0', color: 'var(--c-cocoa-soft)' }}>¿Qué cocinamos hoy?</p>
      </header>

      <KitchenScene counts={{ lists, recipes, archived }} />

      <nav className="kitchen-nav" aria-label="Secciones">
        <Link to="/listas" className="btn btn--primary">
          Mis listas <span className="kitchen-nav__count">{lists}</span>
        </Link>
        <Link to="/recetas" className="btn btn--accent">
          Recetas <span className="kitchen-nav__count">{recipes}</span>
        </Link>
        <Link to="/historial" className="btn">
          Historial <span className="kitchen-nav__count">{archived}</span>
        </Link>
        <Link to="/ajustes" className="btn">Ajustes</Link>
      </nav>
    </main>
  )
}
