import { UNIT_BY_ID } from '../data/units.js'

const numberFormat = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
const dateFormatThisYear = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })

/** "1,5 kg", "2 ud", "500 g". Sin cantidad devuelve ''. */
export function formatQuantity(quantity, unit) {
  if (quantity == null) return ''
  const short = UNIT_BY_ID[unit]?.short ?? unit
  return `${numberFormat.format(quantity)} ${short}`
}

/** "9 nov" si es de este año (respecto a `now`), "9 nov 2025" si no. Fecha no válida → ''. */
export function formatDate(iso, now = new Date().toISOString()) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const sameYear = date.getFullYear() === new Date(now).getFullYear()
  return (sameYear ? dateFormatThisYear : dateFormat).format(date).replace('.', '')
}
