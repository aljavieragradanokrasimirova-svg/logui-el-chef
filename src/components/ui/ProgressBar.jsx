import './ui.css'

/** Barra de progreso con contorno: `value` de `max`. Se pone verde menta al completarse. */
export default function ProgressBar({ value, max, label = 'Progreso' }) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  const done = max > 0 && value >= max
  return (
    <div
      className={`progress${done ? ' progress--done' : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className={`progress__fill${ratio > 0 && ratio < 1 ? ' progress__fill--partial' : ''}`} style={{ width: `${ratio * 100}%` }} />
    </div>
  )
}
