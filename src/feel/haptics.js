/**
 * Vibraciones cortas para dar respuesta física a los toques (solo móviles que lo permiten: Android;
 * iOS no tiene `navigator.vibrate` y simplemente no hace nada).
 * Se activa o desactiva desde Ajustes con `setHapticsEnabled`.
 */
const PATTERNS = {
  tick: 6, // cruzar un umbral al deslizar, pulsar − / +
  tap: 10, // marcar, añadir
  undo: [8, 30, 8],
  remove: 18,
  success: [12, 50, 12, 50, 30], // lista completa
}

let enabled = true

export function setHapticsEnabled(value) {
  enabled = value !== false
}

export function haptic(kind = 'tap') {
  if (!enabled || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(PATTERNS[kind] ?? PATTERNS.tap)
  } catch {
    // Algunos navegadores lo bloquean hasta que hay interacción: no importa.
  }
}
