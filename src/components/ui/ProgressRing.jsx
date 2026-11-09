import UiIcon from '../icons/UiIcon.jsx'
import './ui.css'

/**
 * Esfera de progreso: anillo que se llena con `value` de `max` y el número en el centro.
 * Completa → verde menta con una ✓. Sin elementos → anillo vacío con «—».
 */
export default function ProgressRing({ value, max, size = 64, label = 'Progreso' }) {
  const r = 22
  const c = 2 * Math.PI * r
  const ratio = max > 0 ? Math.min(1, value / max) : 0
  const done = max > 0 && value >= max
  return (
    <span
      className={`ring${done ? ' ring--done' : ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={max > 0 ? `${label}: ${value} de ${max}` : `${label}: vacía`}
    >
      <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true">
        <circle className="ring__track" cx="28" cy="28" r={r} />
        {ratio > 0 && (
          <circle
            className="ring__fill"
            cx="28"
            cy="28"
            r={r}
            strokeDasharray={`${c * ratio} ${c}`}
            transform="rotate(-90 28 28)"
          />
        )}
        <circle className="ring__edge" cx="28" cy="28" r="27" />
      </svg>
      <span className="ring__text" aria-hidden="true">
        {done ? <UiIcon name="check" size={size * 0.4} strokeWidth={3.5} /> : max > 0 ? `${value}/${max}` : '—'}
      </span>
    </span>
  )
}
