import { Link } from 'react-router-dom'
import ProgressRing from '../ui/ProgressRing.jsx'
import CategoryIcon from '../icons/CategoryIcon.jsx'
import UiIcon from '../icons/UiIcon.jsx'
import { listProgress, groupByCategory } from '../../domain/lists.js'
import { formatDate } from '../../domain/format.js'
import './lists.css'

const MAX_AISLES = 5

/**
 * Tarjeta de lista: esfera de progreso, nombre, los pasillos que incluye (sus dibujos) y la fecha.
 * `children` se pinta debajo, fuera del enlace, para acciones como «Usar de nuevo».
 */
export default function ListCard({ list, to, children }) {
  const { checked, total } = listProgress(list)
  const done = total > 0 && checked === total
  const aisles = groupByCategory(list.items).map((g) => g.categoryId)
  const archived = list.archivedAt !== null
  const date = archived ? `Archivada el ${formatDate(list.archivedAt)}` : formatDate(list.createdAt)

  return (
    <div className={`list-card${done ? ' list-card--done' : ''}`}>
      <Link to={to} className="list-card__link">
        <ProgressRing value={checked} max={total} size={60} label="Comprados" />
        <span className="list-card__body">
          <span className="list-card__name">{list.name}</span>
          {aisles.length > 0 ? (
            <span className="list-card__aisles" aria-label={`${aisles.length} pasillos`}>
              {aisles.slice(0, MAX_AISLES).map((id) => (
                <span key={id} className="list-card__aisle">
                  <CategoryIcon categoryId={id} size={22} />
                </span>
              ))}
              {aisles.length > MAX_AISLES && <span className="list-card__more">+{aisles.length - MAX_AISLES}</span>}
            </span>
          ) : (
            <span className="list-card__meta">Sin productos todavía</span>
          )}
          <span className="list-card__meta">
            {done && !archived ? '¡Todo comprado! · ' : ''}
            {date}
          </span>
        </span>
        <UiIcon name="back" size={22} style={{ transform: 'rotate(180deg)', color: 'var(--c-cocoa-soft)' }} />
      </Link>
      {children && <div className="list-card__actions">{children}</div>}
    </div>
  )
}
