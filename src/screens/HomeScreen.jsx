import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import { useStore } from '../store/StoreProvider.jsx'

/** Inicio provisional (la cocina ilustrada llega en la capa 3). */
export default function HomeScreen() {
  const { state } = useStore()
  const active = state.lists.filter((l) => l.archivedAt === null).length
  const archived = state.lists.length - active
  return (
    <main className="screen">
      <header>
        <h1>Logui el chef</h1>
        <p style={{ margin: 'var(--sp-1) 0 0', color: 'var(--c-cocoa-soft)' }}>Tu cocina de listas de la compra</p>
      </header>
      <Card tone="butter" style={{ display: 'grid', gap: 'var(--sp-3)' }}>
        <Link to="/listas" className="btn btn--primary">Mis listas ({active})</Link>
        <Link to="/historial" className="btn">Historial ({archived})</Link>
      </Card>
    </main>
  )
}
