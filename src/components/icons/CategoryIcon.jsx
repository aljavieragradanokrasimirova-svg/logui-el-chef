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
  // ---- Recetas ----
  pot: (
    <>
      <path style={NONE} d="M9 25H4M39 25h5" />
      <path style={fill('tomato')} d="M9 20h30v14a8 8 0 0 1-8 8H17a8 8 0 0 1-8-8Z" />
      <path style={fill('butter')} d="M6 20c0-6 8-9 18-9s18 3 18 9Z" />
      <circle style={fill('cocoa')} cx="24" cy="9" r="2.5" />
      <path style={NONE} d="M15 30v5" />
    </>
  ),
  pan: (
    <>
      <path style={fill('cocoa')} d="m31 19 10-10 3 3-10 10Z" />
      <circle style={fill('cocoa-soft')} cx="20" cy="27" r="15" />
      <path style={fill('white')} d="M11 26c0-5 5-8 9-7 5-2 10 2 9 7 0 5-5 8-10 7-5 1-8-2-8-7Z" />
      <circle style={fill('butter')} cx="20" cy="26" r="3.5" />
    </>
  ),
  salad: (
    <>
      <path style={fill('mint')} d="M9 24c0-6 5-10 10-8 2-5 9-5 11 0 5-2 10 2 9 8Z" />
      <circle style={fill('tomato')} cx="30" cy="19" r="3.5" />
      <path style={fill('white')} d="M5 24h38c0 10-8 17-19 17S5 34 5 24Z" />
    </>
  ),
  cake: (
    <>
      <path style={fill('butter')} d="M24 3c4 4 4 8 0 8s-4-4 0-8Z" />
      <rect style={fill('tomato')} x="21.5" y="11" width="5" height="10" rx="1.5" />
      <rect style={fill('butter-soft')} x="7" y="21" width="34" height="20" rx="4" />
      <path style={fill('white')} d="M7 25a4 4 0 0 1 4-4h26a4 4 0 0 1 4 4v3c-3 3-6 3-8 0-3 3-6 3-9 0-3 3-6 3-9 0-2 3-5 3-8 0Z" />
    </>
  ),
  soup: (
    <>
      <path style={NONE} d="M16 15c-3-3 3-5 0-9M24 15c-3-3 3-5 0-9M32 15c-3-3 3-5 0-9" />
      <path style={fill('tomato')} d="M5 21h38c0 11-8 18-19 18S5 32 5 21Z" />
      <path style={NONE} d="M17 43h14" />
    </>
  ),
  pasta: (
    <>
      <ellipse style={fill('white')} cx="24" cy="36" rx="21" ry="8" />
      <path style={fill('butter')} d="M8 35c0-18 32-18 32 0Z" />
      <path style={NONE} d="M13 33c2-7 7-7 8 0m2 0c2-9 9-9 11 0" />
      <path style={fill('tomato')} d="M14 21c3-7 17-7 20 0-4 4-16 4-20 0Z" />
      <path style={fill('mint')} d="M26 15c2-4 7-4 9-1-2 3-6 4-9 1Z" />
    </>
  ),
  // ---- Pestañas ----
  fridge: (
    <>
      <rect style={fill('white')} x="11" y="4" width="26" height="40" rx="6" />
      <path style={NONE} d="M11 18h26" />
      <path style={NONE} d="M31 9v5M31 23v9" />
      <circle style={fill('tomato')} cx="18" cy="11" r="2.5" />
      <rect style={fill('butter')} x="16" y="24" width="10" height="12" rx="1.5" />
    </>
  ),
  book: (
    <>
      <path style={fill('tomato')} d="M10 7a3 3 0 0 1 3-3h24v36H13a3 3 0 0 0-3 3Z" />
      <path style={fill('white')} d="M10 43a3 3 0 0 1 3-3h24v4H13a3 3 0 0 1-3-1Z" />
      <rect style={fill('white')} x="17" y="12" width="14" height="9" rx="2" />
      <path style={fill('butter')} d="M30 4v14l3-3 3 3V4Z" />
    </>
  ),
  radio: (
    <>
      <path style={NONE} d="m32 16 8-11" />
      <circle style={fill('tomato')} cx="40" cy="5" r="2.5" />
      <rect style={fill('butter')} x="5" y="16" width="38" height="26" rx="7" />
      <circle style={fill('white')} cx="17" cy="29" r="7" />
      <rect style={fill('white')} x="28" y="22" width="11" height="6" rx="3" />
      <circle style={fill('tomato')} cx="31" cy="35" r="2.5" />
      <circle style={fill('tomato')} cx="37" cy="35" r="2.5" />
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
export function Icon({ icon, size = 32, title, style, className = '', ...props }) {
  const shape = ICONS[icon] ?? ICONS.basket
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true }
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={`art ${className}`.trim()} style={{ ...SVG_STYLE, ...style }} {...a11y} {...props}>
      {shape}
    </svg>
  )
}

/** Icono de una categoría por su id. Categorías desconocidas usan la de por defecto. */
export default function CategoryIcon({ categoryId, ...props }) {
  const category = CATEGORY_BY_ID[categoryId] ?? CATEGORY_BY_ID[DEFAULT_CATEGORY]
  return <Icon icon={category.icon} {...props} />
}
