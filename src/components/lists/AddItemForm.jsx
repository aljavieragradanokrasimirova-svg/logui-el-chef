import { useId, useMemo, useRef, useState } from 'react'
import Button from '../ui/Button.jsx'
import UiIcon from '../icons/UiIcon.jsx'
import CategoryIcon from '../icons/CategoryIcon.jsx'
import { CATEGORIES, CATEGORY_BY_ID, DEFAULT_CATEGORY } from '../../data/categories.js'
import { UNITS, DEFAULT_UNIT } from '../../data/units.js'
import { suggestProducts } from '../../domain/products.js'
import { normalizeName } from '../../domain/normalize.js'
import './lists.css'

/**
 * Campo de "añadir producto" con sugerencias (memoria + catálogo).
 * Elegir una sugerencia rellena categoría y unidad. `exclude`: nombres ya pendientes en la lista.
 */
export default function AddItemForm({ memory, exclude, onAdd }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState(DEFAULT_UNIT)
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY)
  const [showDetails, setShowDetails] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [picked, setPicked] = useState(false)
  const nameRef = useRef(null)
  const listboxId = useId()

  const suggestions = useMemo(
    () => (picked ? [] : suggestProducts(name, { memory, exclude })),
    [name, memory, exclude, picked],
  )
  const showList = open && suggestions.length > 0

  function reset() {
    setName('')
    setQuantity('')
    setUnit(DEFAULT_UNIT)
    setCategoryId(DEFAULT_CATEGORY)
    setPicked(false)
    setActive(-1)
    setShowDetails(false)
  }

  function pick(s) {
    setName(s.name)
    setUnit(s.unit)
    setCategoryId(s.categoryId)
    setPicked(true)
    setOpen(false)
    setActive(-1)
    nameRef.current?.focus()
  }

  function submit(e) {
    e.preventDefault()
    if (showList && active >= 0) {
      pick(suggestions[active])
      return
    }
    if (!name.trim()) return
    // Si escribió un nombre exacto de las sugerencias sin elegirlo, usamos su categoría y unidad.
    const exact = !picked && suggestions.find((s) => normalizeName(s.name) === normalizeName(name))
    onAdd({
      name,
      quantity,
      unit: exact && unit === DEFAULT_UNIT ? exact.unit : unit,
      categoryId: exact && categoryId === DEFAULT_CATEGORY ? exact.categoryId : categoryId,
    })
    reset()
    nameRef.current?.focus()
  }

  function onKeyDown(e) {
    if (!showList) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const category = CATEGORY_BY_ID[categoryId]

  return (
    <form className="add-item" onSubmit={submit}>
      <div className="add-item__row">
        <div className="add-item__combo">
          <input
            ref={nameRef}
            className="field"
            placeholder="Añadir producto…"
            aria-label="Nombre del producto"
            autoComplete="off"
            enterKeyHint="done"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={showList && active >= 0 ? `${listboxId}-${active}` : undefined}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setPicked(false)
              setOpen(true)
              setActive(-1)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
          />
          {showList && (
            <ul className="suggestions" id={listboxId} role="listbox" aria-label="Sugerencias">
              {suggestions.map((s, i) => (
                <li
                  key={`${s.source}-${s.name}`}
                  id={`${listboxId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`suggestions__item${i === active ? ' suggestions__item--active' : ''}`}
                  // mousedown en vez de click: se dispara antes del blur del input
                  onMouseDown={(e) => {
                    e.preventDefault()
                    pick(s)
                  }}
                >
                  <CategoryIcon categoryId={s.categoryId} size={26} />
                  <span className="suggestions__name">{s.name}</span>
                  {s.source === 'memory' && <span className="suggestions__tag">reciente</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button type="submit" variant="primary" round aria-label="Añadir" disabled={!name.trim()}>
          <UiIcon name="plus" />
        </Button>
      </div>

      <button type="button" className="add-item__toggle" onClick={() => setShowDetails((v) => !v)} aria-expanded={showDetails}>
        <CategoryIcon categoryId={categoryId} size={20} />
        {category.label} · {quantity.trim() ? `${quantity} ` : ''}
        {UNITS.find((u) => u.id === unit).short}
        <span className="add-item__toggle-hint">{showDetails ? 'Ocultar' : 'Cambiar'}</span>
      </button>

      {showDetails && (
        <div className="add-item__details">
          <label className="label">
            Cantidad
            <input
              className="field"
              inputMode="decimal"
              placeholder="—"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <label className="label">
            Unidad
            <select className="field" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </label>
          <label className="label add-item__category">
            Categoría
            <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}
    </form>
  )
}
