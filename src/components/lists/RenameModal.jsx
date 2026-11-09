import { useState } from 'react'
import Modal, { ModalActions } from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'

/**
 * Pide un nombre (crear o renombrar una lista). `onSave(name)` solo se llama con un nombre no vacío.
 */
export default function RenameModal({ open, name = '', onClose, onSave, title = 'Cambiar nombre', saveLabel = 'Guardar', placeholder }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {open && <NameForm initial={name} onClose={onClose} onSave={onSave} saveLabel={saveLabel} placeholder={placeholder} />}
    </Modal>
  )
}

function NameForm({ initial, onClose, onSave, saveLabel, placeholder }) {
  const [name, setName] = useState(initial)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onSave(name)
      }}
      style={{ display: 'grid', gap: 'var(--sp-4)' }}
    >
      <input
        className="field"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Nombre de la lista"
        placeholder={placeholder}
        autoComplete="off"
        autoFocus
      />
      <ModalActions>
        <Button size="small" onClick={onClose}>Cancelar</Button>
        <Button size="small" variant="primary" type="submit" disabled={!name.trim()}>{saveLabel}</Button>
      </ModalActions>
    </form>
  )
}
