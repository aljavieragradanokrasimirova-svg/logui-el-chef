import CategoryPicker from './CategoryPicker.jsx'
import QuantityStepper from './QuantityStepper.jsx'
import UnitPicker from './UnitPicker.jsx'
import './pickers.css'

/**
 * Pasillo + cantidad + unidad de un producto o ingrediente.
 * `value = { categoryId, quantity, unit }`; `onChange(cambios)` recibe solo lo que cambia.
 */
export default function ItemFields({ value, onChange }) {
  return (
    <div className="item-fields">
      <CategoryPicker value={value.categoryId} onChange={(categoryId) => onChange({ categoryId })} />
      <div className="item-fields__row">
        <QuantityStepper quantity={value.quantity} unit={value.unit} onChange={(quantity) => onChange({ quantity })} />
        <UnitPicker value={value.unit} onChange={(unit) => onChange({ unit })} />
      </div>
    </div>
  )
}
