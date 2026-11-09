import { Link } from 'react-router-dom'
import ProgressBar from '../ui/ProgressBar.jsx'
import { listProgress } from '../../domain/lists.js'
import { formatDate } from '../../domain/format.js'
import './lists.css'

/**
 * Tarjeta enlazada con el nombre, el progreso y la fecha de una lista.
 * `children` se pinta debajo, fuera del enlace, para acciones como "Usar de nuevo".
 */
export default function ListCard({ list, to, children }) {
  const { checked, total } = listProgress(list)
  const date = formatDate(list.archivedAt ?? list.createdAt)
  const summary = total === 0 ? `Sin productos · ${date}` : `${checked} de ${total} comprados · ${date}`

  return (
    <div className="list-card">
      <Link to={to} className="list-card__link">
        <h2 className="list-card__name">{list.name}</h2>
        <ProgressBar value={checked} max={total} label="Productos comprados" />
        <span className="list-card__meta">{summary}</span>
      </Link>
      {children && <div className="list-card__actions">{children}</div>}
    </div>
  )
}
