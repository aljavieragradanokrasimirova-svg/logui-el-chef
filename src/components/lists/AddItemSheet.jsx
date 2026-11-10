import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import CategoryIcon from '../icons/CategoryIcon.jsx'
import ItemFields from '../pickers/ItemFields.jsx'
import { suggestProducts, recentProducts } from '../../domain/products.js'
import { haptic } from '../../feel/haptics.js'
import { normalizeName } from '../../domain/normalize.js'
import { DEFAULT_CATEGORY } from '../../data/categories.js'
import { DEFAULT_UNIT } from '../../data/units.js'
import './lists.css'

const EMPTY = { categoryId: DEFAULT_CATEGORY, quantity: null, unit: DEFAULT_UNIT }

/**
 * Panel inferior para añadir productos: nombre con sugerencias (memoria + catálogo), pasillo en baldosas,
 * cantidad − / + y unidad. Tras añadir se queda abierto y limpio para seguir añadiendo.
 * `onClose(n)` recibe cuántos productos se añadieron mientras estuvo abierto.
 */
export default function AddItemSheet({ open, onClose, memory, exclude, onAdd }) {
  // Al cerrar se dice cuántos se añadieron (Logui lo comenta)
  const count = useRef(0)
  useEffect(() => {
    if (open) count.current = 0
  }, [open])
  const add = (item) => {
    count.current += 1
    onAdd(item)
  }
  const close = () => onClose?.(count.current)
  return (
    <Modal open={open} onClose={close} title="Añadir producto" variant="sheet">
      {open && <AddItemBody memory={memory} exclude={exclude} onAdd={add} onClose={close} />}
    </Modal>
  )
}

function AddItemBody({ memory, exclude, onAdd, onClose }) {
  const [name, setName] = useState('')
  const [fields, setFields] = useState(EMPTY)
  const [touched, setTouched] = useState(false) // el usuario tocó pasillo/unidad: no autocompletar encima
  const [picked, setPicked] = useState(false)
  const [added, setAdded] = useState([]) // lo añadido desde que se abrió el panel
  const nameRef = useRef(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  // Sin escribir nada se ofrece lo último que se compró; al escribir, sugerencias por nombre.
  const empty = !name.trim()
  const suggestions = useMemo(() => {
    if (picked) return []
    return empty ? recentProducts(memory, { exclude, limit: 6 }) : suggestProducts(name, { memory, exclude, limit: 5 })
  }, [name, empty, memory, exclude, picked])

  function pick(s) {
    setName(s.name)
    setFields((f) => ({ ...f, categoryId: s.categoryId, unit: s.unit }))
    setPicked(true)
    setTouched(false)
  }

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) {
      nameRef.current?.focus()
      return
    }
    // Nombre exacto de una sugerencia sin elegirla: usar su pasillo y unidad si no se han tocado.
    const exact = !picked && !touched && suggestions.find((s) => normalizeName(s.name) === normalizeName(name))
    const item = exact ? { ...fields, name, categoryId: exact.categoryId, unit: exact.unit } : { ...fields, name }
    onAdd(item)
    haptic('tap')
    setAdded((list) => [...list, name.trim()])
    setName('')
    setFields(EMPTY)
    setTouched(false)
    setPicked(false)
    nameRef.current?.focus()
  }

  return (
    <form className="add-sheet" onSubmit={submit}>
      <div className="add-sheet__name">
        <input
          ref={nameRef}
          className="field field--big"
          placeholder="¿Qué hace falta?"
          aria-label="Nombre del producto"
          autoComplete="off"
          enterKeyHint="done"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setPicked(false)
          }}
        />
        {suggestions.length > 0 && empty && <p className="add-sheet__hint">Lo de siempre</p>}
        {suggestions.length > 0 && (
          <ul className="add-sheet__suggestions" aria-label={empty ? 'Comprados hace poco' : 'Sugerencias'}>
            {suggestions.map((s) => (
              <li key={`${s.source}-${s.name}`}>
                <button type="button" className="suggestion" onClick={() => pick(s)}>
                  <CategoryIcon categoryId={s.categoryId} size={24} />
                  <span>{s.name}</span>
                  {s.source === 'memory' && !empty && <span className="suggestion__tag">reciente</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="add-sheet__status" role="status">
        {added.length > 0 && (
          <span key={added.length} className="add-sheet__added">
            <span className="add-sheet__count">{added.length}</span>
            {added.length === 1 ? 'añadido' : 'añadidos'} · último: {added.at(-1)}
          </span>
        )}
      </p>

      <ItemFields
        value={fields}
        onChange={(changes) => {
          setFields((f) => ({ ...f, ...changes }))
          if ('categoryId' in changes || 'unit' in changes) setTouched(true)
        }}
      />


      <div className="add-sheet__actions">
        <Button onClick={onClose}>Hecho</Button>
        <Button type="submit" variant="primary">Añadir a la lista</Button>
      </div>
    </form>
  )
}
