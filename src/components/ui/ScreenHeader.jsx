import { Link } from 'react-router-dom'
import UiIcon from '../icons/UiIcon.jsx'
import Logui from '../../mascot/Logui.jsx'
import './ui.css'

/**
 * Cabecera de pantalla (estilo «juego de cocina»): franja tomate con borde ondulado, título en blanco,
 * botón de volver (si hay `backTo`), acciones a la derecha y, opcionalmente, Logui asomando (`mascot` = su humor).
 * `bubble` ({ text, id }): lo que dice Logui en un bocadillo. `onMascotTap`: Logui se puede tocar.
 * `children` se pinta bajo el título: chapitas de resumen, barra de progreso…
 */
export default function ScreenHeader({ title, backTo, backLabel = 'Volver', actions, mascot, bubble, onMascotTap, children }) {
  const logui = mascot && <Logui mood={mascot} size={74} />
  return (
    <header className={`hero${mascot ? ' hero--mascot' : ''}`}>
      <div className="hero__top">
        {backTo && (
          <Link to={backTo} className="btn btn--round btn--small hero__back" aria-label={backLabel}>
            <UiIcon name="back" />
          </Link>
        )}
        <h1 className="hero__title">{title}</h1>
        {actions && <div className="hero__actions">{actions}</div>}
      </div>
      {children && <div className="hero__body">{children}</div>}
      {mascot &&
        (onMascotTap ? (
          <button type="button" className="hero__logui hero__logui--button" onClick={onMascotTap} aria-label="Logui">
            {logui}
          </button>
        ) : (
          <span className="hero__logui">{logui}</span>
        ))}
      {bubble && (
        <p key={bubble.id} className="hero__bubble" role="status">
          {bubble.text}
        </p>
      )}
      <svg className="hero__wave" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 16V8c25-10 25 6 50 0s25-10 50 0 25 6 50 0 25-10 50 0 25 6 50 0 25-10 50 0 25 6 50 0 25-10 50 0v8Z" />
      </svg>
    </header>
  )
}
