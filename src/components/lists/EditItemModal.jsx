import { useState } from 'react'
import Modal, { ModalActions } from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import UiIcon from '../icons/UiIcon.jsx'
import { CATEGORIES } from '../../data/categories.js'
import { UNITS } from '../../data/units.js'

/** Edición de un producto (nombre, cantidad, unidad, categoría) y borrado. */
export default function EditItemModal({ item, onSave, onDelete, onClose }) {
  return (
    <Modal open={Boolean(item)} onClose={onClose} title="Editar producto">
      {item && <EditItemForm key={item.id} item={item} onSave={onSave} onDelete={onDelete} onClose={onClose} />}
    </Modal>
  )
}

function EditItemForm({ item, onSave, onDelete, onClose }) {
  const [name, setName] = useState(item.name)
  const [quantity, setQuantity] = useState(item.quantity == null ? '' : String(item.quantity).replace('.', ','))
  const [unit, setUnit] = useState(item.unit)
  const [categoryId, setCategoryId] = useState(item.categoryId)

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name, quantity, unit, categoryId })
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 'var(--sp-3)' }}>
      <label className="label">
        Nombre
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
        <label className="label">
          Cantidad
          <input className="field" inputMode="decimal" placeholder="—" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </label>
        <label className="label">
          Unidad
          <select className="field" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </label>
      </div>
      <label className="label">
        Categoría
        <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>
      <ModalActions>
        <Button variant="ghost" size="small" onClick={onDelete} style={{ marginRight: 'auto', color: 'var(--c-tomato-dark)' }}>
          <UiIcon name="trash" size={20} /> Quitar
        </Button>
        <Button size="small" onClick={onClose}>Cancelar</Button>
        <Button size="small" variant="primary" type="submit" disabled={!name.trim()}>Guardar</Button>
      </ModalActions>
    </form>
  )
}
