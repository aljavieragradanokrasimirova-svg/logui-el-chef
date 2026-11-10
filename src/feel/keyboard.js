/**
 * Con el teclado del móvil abierto, el campo que recibe el foco se coloca a la vista (sobre todo dentro de
 * los paneles inferiores, que el teclado tapa en algunos navegadores).
 */
export function keepFocusedFieldVisible() {
  if (typeof document === 'undefined') return
  const isField = (el) => el?.matches?.('input:not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select')
  document.addEventListener('focusin', (e) => {
    if (!isField(e.target)) return
    // Se espera a que el teclado termine de abrirse y la ventana cambie de tamaño
    setTimeout(() => {
      if (document.activeElement !== e.target) return
      const rect = e.target.getBoundingClientRect()
      const visible = window.visualViewport?.height ?? window.innerHeight
      if (rect.top < 60 || rect.bottom > visible - 16) e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 320)
  })
}
