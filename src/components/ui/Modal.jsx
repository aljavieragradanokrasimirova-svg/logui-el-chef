import { useEffect, useRef } from 'react'
import './ui.css'

/**
 * Ventana modal sobre <dialog> nativo (foco atrapado y tecla Escape gratis).
 * Se muestra mientras `open` sea true; `onClose` se llama con Escape o al tocar fuera.
 *
 * variant:
 *  - 'center' (por defecto): ventana centrada para confirmaciones cortas.
 *  - 'sheet': panel que sube desde abajo, a todo el ancho (formularios en el móvil).
 */
export default function Modal({ open, onClose, title, children, variant = 'center', className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const classes = ['modal', variant === 'sheet' && 'modal--sheet', className].filter(Boolean).join(' ')

  return (
    <dialog
      ref={ref}
      className={classes}
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
          {variant === 'sheet' && <span className="modal__handle" aria-hidden="true" />}
          {title && (
            <div className="modal__head">
              <h2 className="modal__title">{title}</h2>
              {variant === 'sheet' && (
                <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
                  ×
                </button>
              )}
            </div>
          )}
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
