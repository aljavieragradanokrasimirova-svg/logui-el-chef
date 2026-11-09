import { useState } from 'react'
import Modal, { ModalActions } from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import UiIcon from '../icons/UiIcon.jsx'
import ItemFields from '../pickers/ItemFields.jsx'

/** Edición de un producto (nombre, pasillo, cantidad, unidad) y borrado, en un panel inferior. */
export default function EditItemModal({ item, onSave, onDelete, onClose }) {
  return (
    <Modal open={Boolean(item)} onClose={onClose} title="Editar producto" variant="sheet">
      {item && <EditItemForm key={item.id} item={item} onSave={onSave} onDelete={onDelete} onClose={onClose} />}
    </Modal>
  )
}

function EditItemForm({ item, onSave, onDelete, onClose }) {
  const [name, setName] = useState(item.name)
  const [fields, setFields] = useState({ categoryId: item.categoryId, quantity: item.quantity, unit: item.unit })

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name, ...fields })
  }

  return (
    <form onSubmit={submit} className="add-sheet">
      <input
        className="field field--big"
        aria-label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="off"
      />
      <ItemFields value={fields} onChange={(changes) => setFields((f) => ({ ...f, ...changes }))} />
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
