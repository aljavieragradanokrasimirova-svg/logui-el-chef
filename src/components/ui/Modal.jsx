import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../motion/useFlip.js'
import { capturePointer } from '../../feel/pointer.js'
import './ui.css'

const EXIT_MS = 200
const DRAG_CLOSE_PX = 110
const DRAG_CLOSE_SPEED = 0.6 // px/ms: un tirón rápido también cierra

/**
 * Ventana modal sobre <dialog> nativo (foco atrapado y tecla Escape gratis).
 * Se muestra mientras `open` sea true; `onClose` se llama con Escape, al tocar fuera o (en los paneles)
 * al arrastrarlos hacia abajo. Al cerrarse sale con una animación antes de desaparecer.
 *
 * variant:
 *  - 'center' (por defecto): ventana centrada para confirmaciones cortas.
 *  - 'sheet': panel que sube desde abajo, a todo el ancho (formularios en el móvil).
 */
export default function Modal({ open, onClose, title, children, variant = 'center', className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(open) // sigue pintado mientras sale
  const [closing, setClosing] = useState(false)
  const dragged = useRef(false) // cerrado arrastrando: ya ha salido de la pantalla
  // Mientras sale se sigue enseñando el último contenido (quien lo usa suele vaciarlo al cerrar)
  const lastContent = useRef({ title, children })
  if (open) lastContent.current = { title, children }
  const content = open ? { title, children } : lastContent.current

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open) {
      setShown(true)
      setClosing(false)
      dragged.current = false
      dialog.style.transform = ''
      if (!dialog.open) dialog.showModal()
      return
    }
    if (!dialog.open) return
    const finish = () => {
      dialog.close()
      dialog.style.transform = ''
      dialog.style.removeProperty('--drag')
      setClosing(false)
      setShown(false)
    }
    if (dragged.current || prefersReducedMotion()) {
      finish()
      return
    }
    setClosing(true)
    const timer = setTimeout(finish, EXIT_MS)
    return () => clearTimeout(timer)
  }, [open])

  const sheet = variant === 'sheet'
  const drag = useSheetDrag(ref, sheet, () => {
    dragged.current = true
    onClose?.()
  })

  const classes = ['modal', sheet && 'modal--sheet', closing && 'modal--closing', className].filter(Boolean).join(' ')

  return (
    <dialog
      ref={ref}
      className={classes}
      aria-label={content.title}
      onCancel={(e) => {
        e.preventDefault()
        onClose?.()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose?.()
      }}
    >
      {(open || shown) && (
        <div className="modal__body">
          {sheet ? (
            <div className="modal__grab" {...drag}>
              <span className="modal__handle" aria-hidden="true" />
              {content.title && <ModalHead title={content.title} onClose={onClose} />}
            </div>
          ) : (
            content.title && <ModalHead title={content.title} />
          )}
          {content.children}
        </div>
      )}
    </dialog>
  )
}

function ModalHead({ title, onClose }) {
  return (
    <div className="modal__head">
      <h2 className="modal__title">{title}</h2>
      {onClose && (
        <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      )}
    </div>
  )
}

/**
 * Arrastrar el panel por su cabecera: sigue al dedo hacia abajo y, si se suelta lejos o con un tirón,
 * sale de la pantalla y se cierra; si no, vuelve a su sitio con un rebote.
 */
function useSheetDrag(ref, enabled, close) {
  const start = useRef(null)
  if (!enabled) return {}

  const end = (e) => {
    const s = start.current
    const dialog = ref.current
    start.current = null
    if (!s || !dialog) return
    const elapsed = Math.max(1, e.timeStamp - s.prev.t)
    const speed = (e.clientY - s.prev.y) / elapsed
    const out = s.dy > DRAG_CLOSE_PX || (s.dy > 30 && speed > DRAG_CLOSE_SPEED)
    dialog.classList.remove('modal--dragging')
    if (out) {
      dialog.style.transition = `transform ${EXIT_MS}ms ease-in`
      dialog.style.transform = 'translateY(105%)'
      setTimeout(() => {
        dialog.style.transition = ''
        close()
      }, EXIT_MS)
    } else {
      dialog.style.transition = 'transform 280ms cubic-bezier(.34, 1.56, .64, 1)'
      dialog.style.transform = ''
      dialog.style.removeProperty('--drag')
      setTimeout(() => (dialog.style.transition = ''), 300)
    }
  }

  return {
    onPointerDown: (e) => {
      if (e.button > 0 || e.target.closest('button')) return
      capturePointer(e)
      const point = { y: e.clientY, t: e.timeStamp }
      start.current = { y: e.clientY, dy: 0, last: point, prev: point }
      ref.current?.classList.add('modal--dragging')
    },
    onPointerMove: (e) => {
      const s = start.current
      const dialog = ref.current
      if (!s || !dialog) return
      // Para medir la velocidad al soltar se guarda el punto de hace un instante
      if (e.timeStamp - s.last.t > 16) s.prev = s.last
      s.last = { y: e.clientY, t: e.timeStamp }
      s.dy = Math.max(0, e.clientY - s.y) // hacia arriba no se mueve
      dialog.style.transform = `translateY(${s.dy}px)`
      dialog.style.setProperty('--drag', Math.min(s.dy / dialog.offsetHeight, 1).toFixed(3))
    },
    onPointerUp: end,
    onPointerCancel: end,
  }
}

/** Pie de modal con botones alineados. */
export function ModalActions({ children }) {
  return <div className="modal__actions">{children}</div>
}
