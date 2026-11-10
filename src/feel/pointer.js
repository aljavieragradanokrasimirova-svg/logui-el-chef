/** Sigue recibiendo los movimientos del dedo aunque salga del elemento. Si el puntero ya no existe, no pasa nada. */
export function capturePointer(e) {
  try {
    e.currentTarget.setPointerCapture?.(e.pointerId)
  } catch {
    // NotFoundError: el puntero ya se levantó
  }
}
