import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ScreenHeader from '../components/ui/ScreenHeader.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import KitchenScene from '../components/kitchen/KitchenScene.jsx'
import { Icon } from '../components/icons/CategoryIcon.jsx'
import UiIcon from '../components/icons/UiIcon.jsx'
import Logui from '../mascot/Logui.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { listProgress } from '../domain/lists.js'

const WAVE_MS = 2200

/** Inicio: la cocina ilustrada con Logui (sus objetos llevan a cada sección) y acceso rápido a la última lista. */
export default function HomeScreen() {
  const { state } = useStore()
  const active = state.lists
    .filter((l) => l.archivedAt === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const archived = state.lists.length - active.length
  const recipes = state.recipes.length
  const current = active[0]

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
      <ScreenHeader title="Logui el chef">
        <p className="hero__subtitle">¿Qué cocinamos hoy?</p>
      </ScreenHeader>

      <KitchenScene counts={{ lists: active.length, recipes, archived }}>
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

      {current ? <ContinueCard list={current} /> : (
        <Link to="/listas" className="continue">
          <Icon icon="fridge" size={48} />
          <span className="continue__text">
            <span className="continue__kicker">Empieza por aquí</span>
            <span className="continue__name">Crea tu primera lista</span>
          </span>
          <UiIcon name="plus" />
        </Link>
      )}
    </main>
  )
}

/** Tarjeta para volver a la lista más reciente con su progreso. */
function ContinueCard({ list }) {
  const { checked, total } = listProgress(list)
  return (
    <Link to={`/listas/${list.id}`} className="continue">
      <Icon icon="fridge" size={48} />
      <span className="continue__text">
        <span className="continue__kicker">Seguir comprando</span>
        <span className="continue__name">{list.name}</span>
        {total > 0 && <ProgressBar value={checked} max={total} label="Productos comprados" />}
      </span>
      <span className="continue__count">{total === 0 ? 'vacía' : `${checked}/${total}`}</span>
    </Link>
  )
}
