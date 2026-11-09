import { useId } from 'react'
import CategoryIcon from '../icons/CategoryIcon.jsx'
import { CATEGORIES } from '../../data/categories.js'
import './pickers.css'

/**
 * Baldosas para elegir el pasillo (sustituye al <select> nativo).
 * Grupo de radios accesible: flechas para moverse, espacio/clic para elegir.
 */
export default function CategoryPicker({ value, onChange, label = '¿En qué pasillo?' }) {
  const name = useId()
  return (
    <fieldset className="picker">
      <legend className="picker__label">{label}</legend>
      <div className="tiles">
        {CATEGORIES.map((c) => {
          const on = c.id === value
          return (
            <label key={c.id} className={`tile${on ? ' tile--on' : ''}`} style={{ '--tile-color': c.color }}>
              <input
                type="radio"
                name={name}
                value={c.id}
                checked={on}
                onChange={() => onChange(c.id)}
                className="sr-only"
              />
              <CategoryIcon categoryId={c.id} size={34} />
              <span className="tile__text">{c.short}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
