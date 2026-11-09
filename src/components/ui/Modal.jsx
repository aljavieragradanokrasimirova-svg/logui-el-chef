import { useEffect, useRef } from 'react'
import './ui.css'

/**
 * Ventana modal sobre <dialog> nativo (foco atrapado y tecla Escape gratis).
 * Se muestra mientras `open` sea true; `onClose` se llama con Escape o al tocar fuera.
 */
export default function Modal({ open, onClose, title, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault()
        onClose?.()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose?.()
      }}
    >
      {open && (
        <div className="modal__body">
          {title && <h2 className="modal__title">{title}</h2>}
          {children}
        </div>
      )}
    </dialog>
  )
}

/** Pie de modal con botones alineados. */
export function ModalActions({ children }) {
  return <div className="modal__actions">{children}</div>
}
