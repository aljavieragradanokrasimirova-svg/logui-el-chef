import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Logui from '../../mascot/Logui.jsx'
import { haptic } from '../../feel/haptics.js'
import './toast.css'

const ToastContext = createContext(null)
const DURATION = 5000

/**
 * Avisos breves abajo de la pantalla, con Logui y, si hace falta, un botón de acción («Deshacer»).
 * Solo hay uno a la vez: uno nuevo sustituye al anterior (y la acción del anterior caduca).
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)
  const serial = useRef(0)

  const hide = useCallback(() => {
    clearTimeout(timer.current)
    setToast((t) => (t ? { ...t, leaving: true } : t))
  }, [])

  const show = useCallback(
    ({ message, detail = '', actionLabel, onAction, mood = 'idle', duration = DURATION }) => {
      clearTimeout(timer.current)
      serial.current += 1
      setToast({ id: serial.current, message, detail, actionLabel, onAction, mood, leaving: false })
      timer.current = setTimeout(hide, duration)
    },
    [hide],
  )

  useEffect(() => () => clearTimeout(timer.current), [])

  const value = useMemo(() => ({ show, hide }), [show, hide])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-zone" aria-live="polite">
        {toast && (
          <div
            key={toast.id}
            className={`toast${toast.leaving ? ' toast--leaving' : ''}`}
            role="status"
            onAnimationEnd={(e) => {
              if (toast.leaving && e.target === e.currentTarget) setToast((t) => (t?.id === toast.id ? null : t))
            }}
          >
            <Logui mood={toast.mood} size={38} className="toast__logui" />
            <span className="toast__text">
              <span className="toast__message">{toast.message}</span>
              {toast.detail && <span className="toast__detail">{toast.detail}</span>}
            </span>
            {toast.actionLabel && (
              <button
                type="button"
                className="toast__action"
                onClick={() => {
                  haptic('undo')
                  toast.onAction?.()
                  hide()
                }}
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

/** `{ show, hide }` para lanzar avisos. Sin proveedor no hace nada (tests y pantallas sueltas). */
export function useToast() {
  return useContext(ToastContext) ?? NO_TOAST
}
const NO_TOAST = { show: () => {}, hide: () => {} }
