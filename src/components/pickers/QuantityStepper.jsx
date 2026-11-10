import { useEffect, useId, useState } from 'react'
import { stepQuantity } from '../../domain/quantity.js'
import { toQuantity } from '../../domain/lists.js'
import { useAutoRepeat } from '../../feel/useAutoRepeat.js'
import { haptic } from '../../feel/haptics.js'
import './pickers.css'

const toText = (q) => (q == null ? '' : String(q).replace('.', ','))

/**
 * Cantidad con botones − / + (pasos según la unidad) y un campo para escribirla a mano.
 * `quantity` es número o null; `onChange` recibe número o null.
 */
export default function QuantityStepper({ quantity, unit, onChange, label = 'Cantidad' }) {
  const labelId = useId()
  const [text, setText] = useState(toText(quantity))
  useEffect(() => setText(toText(quantity)), [quantity])

  const step = (dir) => {
    const next = stepQuantity(quantity, unit, dir)
    if (next === quantity) return
    haptic('tick')
    onChange(next)
  }
  // Mantener pulsado repite y acelera: para pasar de 100 g a 1 kg sin 18 toques.
  const less = useAutoRepeat(() => step(-1), { disabled: quantity == null })
  const more = useAutoRepeat(() => step(1))

  return (
    <div className="picker">
      <span className="picker__label" id={labelId}>{label}</span>
      <div className="stepper" role="group" aria-labelledby={labelId}>
        <button type="button" className="stepper__btn" aria-label="Menos" {...less} disabled={quantity == null}>
          −
        </button>
        <input
          className="stepper__value"
          inputMode="decimal"
          aria-label={label}
          placeholder="—"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onChange(toQuantity(text))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onChange(toQuantity(text))
            }
          }}
        />
        <button type="button" className="stepper__btn" aria-label="Más" {...more}>
          +
        </button>
      </div>
    </div>
  )
}
