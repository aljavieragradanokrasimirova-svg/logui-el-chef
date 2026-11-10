import { useEffect, useRef } from 'react'
import UiIcon from '../icons/UiIcon.jsx'
import { prefersReducedMotion } from '../motion/useFlip.js'
import { useSwipeRow } from '../../feel/useSwipeRow.js'
import { formatQuantity } from '../../domain/format.js'
import './lists.css'

/**
 * Fila de producto. Tocarla marca/desmarca; el lápiz abre la edición.
 * Deslizar a la derecha marca/desmarca y a la izquierda borra (`onDelete`).
 * `readOnly` (listas archivadas): sin interacción.
 */
export default function ItemRow({ item, readOnly = false, onToggle, onEdit, onDelete }) {
  const quantity = formatQuantity(item.quantity, item.unit)
  const { rowRef, slideRef, handlers } = useSwipeRow({ onRight: onToggle, onLeft: onDelete, disabled: readOnly })
  useCheckBurst(rowRef, item.checked)
  const classes = ['item', item.checked && 'item--checked', readOnly && 'item--readonly'].filter(Boolean).join(' ')

  return (
    <li className={classes} data-flip-id={item.id} ref={rowRef}>
      {!readOnly && (
        <div className="item__under" aria-hidden="true">
          <span className="item__under-side item__under-side--right">
            <UiIcon name={item.checked ? 'reuse' : 'check'} size={22} strokeWidth={3} />
            {item.checked ? 'Pendiente' : 'Comprado'}
          </span>
          <span className="item__under-side item__under-side--left">
            Borrar
            <UiIcon name="trash" size={22} />
          </span>
        </div>
      )}
      <div className="item__slide" ref={slideRef} {...handlers}>
        <button
          type="button"
          className="item__main"
          role="checkbox"
          aria-checked={item.checked}
          disabled={readOnly}
          onClick={onToggle}
        >
          <span className="item__check" aria-hidden="true">
            <UiIcon name="check" size={20} strokeWidth={3.5} />
          </span>
          <span className="item__name">
            <span className="item__strike">{item.name}</span>
          </span>
          {quantity && <span className="item__qty">{quantity}</span>}
        </button>
        {!readOnly && (
          <button type="button" className="item__edit" onClick={onEdit} aria-label={`Editar ${item.name}`}>
            <UiIcon name="pencil" size={20} />
          </button>
        )}
      </div>
    </li>
  )
}

/** Al marcar (no al cargar la pantalla): la casilla salta y la fila se tiñe de menta un instante. */
function useCheckBurst(rowRef, checked) {
  const previous = useRef(checked)
  useEffect(() => {
    const row = rowRef.current
    if (!row || previous.current === checked) return
    previous.current = checked
    if (!checked || !row.animate || prefersReducedMotion()) return
    row.querySelector('.item__check')?.animate(
      [{ transform: 'scale(.6) rotate(-12deg)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
      { duration: 360, easing: 'cubic-bezier(.34, 1.56, .64, 1)' },
    )
    const slide = row.querySelector('.item__slide')
    if (!slide) return
    const wash = getComputedStyle(row).getPropertyValue('--c-wash').trim()
    slide.animate([{ backgroundColor: wash }, { backgroundColor: getComputedStyle(slide).backgroundColor }], {
      duration: 600,
      easing: 'ease-out',
    })
  }, [rowRef, checked])
}
