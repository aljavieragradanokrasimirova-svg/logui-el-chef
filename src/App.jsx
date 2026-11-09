import Button from './components/ui/Button.jsx'
import Card from './components/ui/Card.jsx'
import Chip from './components/ui/Chip.jsx'
import CategoryIcon from './components/icons/CategoryIcon.jsx'
import { CATEGORIES } from './data/categories.js'

/** Pantalla provisional: muestra el sistema de diseño mientras se construyen las pantallas reales. */
export default function App() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: 'var(--sp-5) var(--sp-4)', display: 'grid', gap: 'var(--sp-5)' }}>
      <header>
        <h1>Logui el chef</h1>
        <p style={{ margin: 'var(--sp-1) 0 0', color: 'var(--c-cocoa-soft)' }}>Tu cocina de listas de la compra</p>
      </header>

      <Card tone="butter">
        <h3>Muestrario de diseño</h3>
        <p style={{ margin: 'var(--sp-2) 0 var(--sp-4)' }}>Botones, tarjetas y categorías con el estilo de la app.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
          <Button variant="primary">Nueva lista</Button>
          <Button variant="accent">Recetas</Button>
          <Button>Ajustes</Button>
        </div>
      </Card>

      <Card>
        <h3 style={{ marginBottom: 'var(--sp-3)' }}>Categorías</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} color={c.color}>
              <CategoryIcon categoryId={c.id} size={22} />
              {c.label}
            </Chip>
          ))}
        </div>
      </Card>
    </main>
  )
}
