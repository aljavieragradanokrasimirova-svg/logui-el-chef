import { Link } from 'react-router-dom'
import UiIcon from '../icons/UiIcon.jsx'
import './ui.css'

/**
 * Cabecera de pantalla: botón de volver (si hay `backTo`), título y acciones a la derecha.
 */
export default function ScreenHeader({ title, backTo, backLabel = 'Volver', children }) {
  return (
    <header className="screen-header">
      {backTo && (
        <Link to={backTo} className="btn btn--round btn--small screen-header__back" aria-label={backLabel}>
          <UiIcon name="back" />
        </Link>
      )}
      <h1 className="screen-header__title">{title}</h1>
      {children && <div className="screen-header__actions">{children}</div>}
    </header>
  )
}
