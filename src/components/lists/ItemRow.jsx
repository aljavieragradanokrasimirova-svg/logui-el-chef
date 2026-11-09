import UiIcon from '../icons/UiIcon.jsx'
import { formatQuantity } from '../../domain/format.js'
import './lists.css'

/**
 * Fila de producto. Tocarla marca/desmarca; el lápiz abre la edición.
 * `readOnly` (listas archivadas): sin interacción.
 */
export default function ItemRow({ item, readOnly = false, onToggle, onEdit }) {
  const quantity = formatQuantity(item.quantity, item.unit)
  const classes = ['item', item.checked && 'item--checked', readOnly && 'item--readonly'].filter(Boolean).join(' ')
  return (
    <li className={classes} data-flip-id={item.id}>
      <button
        type="button"
        className="item__main"
        role="checkbox"
        aria-checked={item.checked}
        disabled={readOnly}
        onClick={onToggle}
      >
        <span className="item__check" aria-hidden="true">
          {item.checked && <UiIcon name="check" size={20} strokeWidth={3.5} />}
        </span>
        <span className="item__name">{item.name}</span>
        {quantity && <span className="item__qty">{quantity}</span>}
      </button>
      {!readOnly && (
        <button type="button" className="item__edit" onClick={onEdit} aria-label={`Editar ${item.name}`}>
          <UiIcon name="pencil" size={20} />
        </button>
      )}
    </li>
  )
}
