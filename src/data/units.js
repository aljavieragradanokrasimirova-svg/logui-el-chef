/** Unidades fijas. No se convierten entre sí. */
export const UNITS = [
  { id: 'ud', label: 'unidades', short: 'ud' },
  { id: 'kg', label: 'kilos', short: 'kg' },
  { id: 'g', label: 'gramos', short: 'g' },
  { id: 'l', label: 'litros', short: 'l' },
  { id: 'ml', label: 'mililitros', short: 'ml' },
  { id: 'paquete', label: 'paquetes', short: 'paq.' },
  { id: 'bote', label: 'botes', short: 'bote' },
  { id: 'bandeja', label: 'bandejas', short: 'band.' },
]

export const UNIT_IDS = UNITS.map((u) => u.id)
export const UNIT_BY_ID = Object.fromEntries(UNITS.map((u) => [u.id, u]))
export const DEFAULT_UNIT = 'ud'
