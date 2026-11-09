import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import KitchenScene from '../components/kitchen/KitchenScene.jsx'
import Logui from '../mascot/Logui.jsx'
import { useStore } from '../store/StoreProvider.jsx'

const WAVE_MS = 2200

/** Inicio: la cocina ilustrada con Logui, sus cuatro objetos tocables y accesos rápidos debajo. */
export default function HomeScreen() {
  const { state } = useStore()
  const lists = state.lists.filter((l) => l.archivedAt === null).length
  const archived = state.lists.length - lists
  const recipes = state.recipes.length

  // Logui saluda al entrar y cada vez que se le toca; luego vuelve a reposo.
  const [waves, setWaves] = useState(1)
  const [mood, setMood] = useState('wave')
  useEffect(() => {
    setMood('wave')
    const timer = setTimeout(() => setMood('idle'), WAVE_MS)
    return () => clearTimeout(timer)
  }, [waves])
  const greet = () => setWaves((n) => n + 1)

  return (
    <main className="screen">
      <header>
        <h1>Logui el chef</h1>
        <p style={{ margin: 'var(--sp-1) 0 0', color: 'var(--c-cocoa-soft)' }}>¿Qué cocinamos hoy?</p>
      </header>

      <KitchenScene counts={{ lists, recipes, archived }}>
        <g
          className="kitchen__logui"
          role="button"
          tabIndex={0}
          aria-label="Logui, saluda"
          onClick={greet}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              greet()
            }
          }}
        >
          <Logui mood={mood} x="110" y="278" width="122" height="142" />
        </g>
      </KitchenScene>

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
