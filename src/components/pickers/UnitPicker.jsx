import { useId, useState } from 'react'
import { UNITS } from '../../data/units.js'
import './pickers.css'

const QUICK = ['ud', 'g', 'kg', 'l']

/**
 * Unidad con botones rápidos (ud, g, kg, l) y «más» para el resto (sustituye al <select> nativo).
 */
export default function UnitPicker({ value, onChange, label = 'Unidad' }) {
  const name = useId()
  const [expanded, setExpanded] = useState(!QUICK.includes(value))
  const shown = expanded ? UNITS : UNITS.filter((u) => QUICK.includes(u.id))
  return (
    <fieldset className="picker">
      <legend className="picker__label">{label}</legend>
      <div className="units">
        {shown.map((u) => {
          const on = u.id === value
          return (
            <label key={u.id} className={`unit${on ? ' unit--on' : ''}`} title={u.label}>
              <input type="radio" name={name} value={u.id} checked={on} onChange={() => onChange(u.id)} className="sr-only" />
              {u.short}
            </label>
          )
        })}
        {!expanded && (
          <button type="button" className="unit unit--more" onClick={() => setExpanded(true)}>
            más…
          </button>
        )}
      </div>
    </fieldset>
  )
}
