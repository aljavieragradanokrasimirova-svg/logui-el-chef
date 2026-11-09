import { CATEGORY_BY_ID, DEFAULT_CATEGORY } from '../../data/categories.js'

/**
 * Iconos de categoría: SVG en línea, contorno cacao, colores de la paleta y sin texto (DESIGN.md).
 * Todos se dibujan en una caja de 48×48; el contorno lo hereda cada forma del <svg>.
 */

const fill = (token) => ({ fill: `var(--c-${token})` })
const NONE = { fill: 'none' }

export const ICONS = {
  apple: (
    <>
      <path style={fill('tomato')} d="M24 15C17 10 8 14 9 25c1 10 8 17 15 14 7 3 14-4 15-14 1-11-8-15-15-10Z" />
      <path style={NONE} d="M24 15c0-4 1-7 3-9" />
      <path style={fill('mint')} d="M26 11c3-6 10-6 12-3-3 4-8 5-12 3Z" />
      <ellipse style={{ ...fill('white'), stroke: 'none' }} cx="16" cy="22" rx="2" ry="4" />
    </>
  ),
  fish: (
    <>
      <path style={fill('butter')} d="M36 24 44 16v16Z" />
      <path style={fill('butter')} d="M6 24c6-10 22-12 30 0-8 12-24 10-30 0Z" />
      <path style={NONE} d="M20 18c3 4 3 8 0 12" />
      <circle style={{ ...fill('cocoa'), stroke: 'none' }} cx="13" cy="22" r="2.2" />
    </>
  ),
  milk: (
    <>
      <path style={fill('white')} d="M14 17 18 9h12l4 8Z" />
      <rect style={fill('tomato')} x="21" y="4" width="6" height="5" rx="1.5" />
      <rect style={fill('white')} x="14" y="17" width="20" height="26" rx="3" />
      <rect style={fill('butter')} x="14" y="25" width="20" height="10" />
    </>
  ),
  bread: (
    <>
      <path style={fill('butter')} d="M8 27c0-14 32-14 32 0v11a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3Z" />
      <path style={NONE} d="m16 20 4 6m3-8 4 6m3-4 4 6" />
    </>
  ),
  jar: (
    <>
      <path style={fill('butter')} d="M12 16h24v20a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6Z" />
      <rect style={fill('tomato')} x="13" y="7" width="22" height="8" rx="2" />
      <rect style={fill('white')} x="17" y="24" width="14" height="10" rx="2" />
    </>
  ),
  snow: (
    <>
      <path style={NONE} d="M24 5v38M7.5 14.5l33 19M7.5 33.5l33-19" />
      <path style={NONE} d="m19 8 5 5 5-5M19 40l5-5 5 5" />
      <circle style={fill('white')} cx="24" cy="24" r="4.5" />
    </>
  ),
  bottle: (
    <>
      <path style={fill('mint')} d="M20 9h8v5c0 3 8 4 8 10v15a5 5 0 0 1-5 5H17a5 5 0 0 1-5-5V24c0-6 8-7 8-10Z" />
      <rect style={fill('white')} x="12" y="27" width="24" height="9" />
      <rect style={fill('tomato')} x="18" y="4" width="12" height="6" rx="2" />
    </>
  ),
  bubbles: (
    <>
      <circle style={fill('white')} cx="19" cy="28" r="12" />
      <circle style={fill('white')} cx="35" cy="15" r="7" />
      <circle style={fill('white')} cx="37" cy="36" r="5" />
      <path style={{ ...NONE, stroke: 'var(--c-cocoa-soft)', strokeWidth: 2.5 }} d="M12 26a8 8 0 0 1 5-6" />
    </>
  ),
  basket: (
    <>
      <path style={NONE} d="M14 22c0-14 20-14 20 0" />
      <path style={fill('butter')} d="M6 22h36l-4 18a3 3 0 0 1-3 2H13a3 3 0 0 1-3-2Z" />
      <path style={NONE} d="m18 27 1 10m5-10v10m6-10-1 10" />
    </>
  ),
}

export const ICON_IDS = Object.keys(ICONS)

const SVG_STYLE = {
  stroke: 'var(--c-cocoa)',
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  overflow: 'visible',
  flex: 'none',
}

/** Dibuja un icono por su id (`apple`, `fish`…). Decorativo salvo que se pase `title`. */
export function Icon({ icon, size = 32, title, style, ...props }) {
  const shape = ICONS[icon] ?? ICONS.basket
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true }
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ ...SVG_STYLE, ...style }} {...a11y} {...props}>
      {shape}
    </svg>
  )
}

/** Icono de una categoría por su id. Categorías desconocidas usan la de por defecto. */
export default function CategoryIcon({ categoryId, ...props }) {
  const category = CATEGORY_BY_ID[categoryId] ?? CATEGORY_BY_ID[DEFAULT_CATEGORY]
  return <Icon icon={category.icon} {...props} />
}
