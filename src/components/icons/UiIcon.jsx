/**
 * Iconos de interfaz (trazo, sin relleno) en una caja de 24×24. Toman el color del texto (`currentColor`).
 * Para dibujos con color usar `CategoryIcon`.
 */
const PATHS = {
  back: 'M15 5l-7 7 7 7',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6L6 18',
  more: 'M12 5.5h.01M12 12h.01M12 18.5h.01',
  pencil: 'M4 20l1-5L15.5 4.5a2.1 2.1 0 0 1 3 0l1 1a2.1 2.1 0 0 1 0 3L9 19l-5 1ZM13.5 6.5l4 4',
  trash: 'M4 7h16M10 7V4.5h4V7M6 7l1 13h10l1-13M10 11v5M14 11v5',
  archive: 'M3.5 4.5h17v4h-17ZM5 8.5v11h14v-11M10 12.5h4',
  camera: 'M3.5 8h3.2l1.8-2.6h7l1.8 2.6h3.2v11h-17ZM12 16.6a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z',
  reuse: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
}

export default function UiIcon({ name, size = 24, title, strokeWidth = 2.75, style, ...props }) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true }
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={name === 'more' ? strokeWidth * 1.6 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none', ...style }}
      {...a11y}
      {...props}
    >
      <path d={PATHS[name] ?? PATHS.plus} pathLength={1} />
    </svg>
  )
}
