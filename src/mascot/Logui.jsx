import './logui.css'

/**
 * Logui, el beagle cocinero (diseño original). SVG en línea, contorno cacao, sin texto.
 *
 * mood:
 *  - 'idle'      reposo: respira, parpadea y mueve la cola
 *  - 'wave'      saludo: levanta la pata y saluda
 *  - 'celebrate' celebración: brazos arriba, ojos felices y confeti
 *  - 'think'     pensativo: pata en la barbilla, mira arriba, bocadillo de pensamiento
 *
 * Las animaciones están en logui.css y se apagan con «reducir animaciones» (la postura se mantiene).
 * Se puede anidar dentro de otro <svg> pasando x / y / width / height.
 */
export const MOODS = ['idle', 'wave', 'celebrate', 'think']

const f = (token) => ({ fill: `var(--c-${token})` })
const NONE = { fill: 'none' }
const FLAT = { stroke: 'none' }

export default function Logui({ mood = 'idle', size = 120, title, className = '', ...props }) {
  const m = MOODS.includes(mood) ? mood : 'idle'
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true }
  const happy = m === 'celebrate'
  const thinking = m === 'think'

  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      className={`logui logui--${m} ${className}`.trim()}
      {...a11y}
      {...props}
    >
      {/* Cola */}
      <g className="logui__tail">
        <path style={f('caramel')} d="M80 116c12-4 18-16 16-28-1-4 4-5 5-1 3 15-5 29-17 34Z" />
        <circle style={f('white')} cx="99" cy="85" r="4.5" />
      </g>

      {/* Cuerpo */}
      <g className="logui__body">
        <path style={f('caramel')} d="M34 136c-4-24 6-42 26-42s30 18 26 42Z" />
        <path style={{ ...f('white'), ...FLAT }} d="M47 135c-2-17 4-29 13-29s15 12 13 29Z" />
        {/* Manto oscuro de beagle tricolor sobre los hombros */}
        <path style={f('cocoa')} d="M37 113c3-11 11-18 23-18s20 7 23 18c-7-5-15-7-23-7s-16 2-23 7Z" />
        <ellipse style={f('white')} cx="46" cy="135" rx="10" ry="5" />
        <ellipse style={f('white')} cx="74" cy="135" rx="10" ry="5" />
      </g>

      {/* Cabeza */}
      <g className="logui__head">
        <path style={f('cocoa-soft')} d="M30 46c-12 6-14 30-6 42 4 6 12 4 13-4 1-12 1-26-1-36Z" />
        <path style={f('cocoa-soft')} d="M90 46c12 6 14 30 6 42-4 6-12 4-13-4-1-12-1-26 1-36Z" />
        <ellipse style={f('caramel')} cx="60" cy="64" rx="32" ry="30" />
        <path
          style={{ ...f('white'), ...FLAT }}
          d="M56 38c0 12-2 20-8 28-8 6-8 20 2 24 6 3 14 3 20 0 10-4 10-18 2-24-6-8-8-16-8-28Z"
        />
        <ellipse style={{ fill: 'var(--c-tomato)', opacity: 0.4, ...FLAT }} cx="39" cy="75" rx="5" ry="3" />
        <ellipse style={{ fill: 'var(--c-tomato)', opacity: 0.4, ...FLAT }} cx="81" cy="75" rx="5" ry="3" />

        {happy ? (
          <path style={NONE} d="M41 64q5-6 10 0M69 64q5-6 10 0" />
        ) : (
          <g className="logui__eyes">
            <circle style={{ ...f('cocoa'), ...FLAT }} cx={thinking ? 48 : 46} cy={thinking ? 59 : 62} r="4.5" />
            <circle style={{ ...f('cocoa'), ...FLAT }} cx={thinking ? 76 : 74} cy={thinking ? 59 : 62} r="4.5" />
            <circle style={{ ...f('white'), ...FLAT }} cx={thinking ? 49.5 : 47.5} cy={thinking ? 57.5 : 60.5} r="1.5" />
            <circle style={{ ...f('white'), ...FLAT }} cx={thinking ? 77.5 : 75.5} cy={thinking ? 57.5 : 60.5} r="1.5" />
          </g>
        )}

        <path style={f('cocoa')} d="M54 72c0-4 12-4 12 0s-4 7-6 7-6-3-6-7Z" />
        {happy || m === 'wave' ? (
          <>
            <path style={f('cocoa')} d="M52 82c0 10 16 10 16 0Z" />
            <path style={{ ...f('tomato'), strokeWidth: 2 }} d="M56 86c0 4 8 4 8 0" />
          </>
        ) : thinking ? (
          <path style={NONE} d="M55 84h9" />
        ) : (
          <path style={NONE} d="M60 79v3m-7 0c3 4 7 3 7 0 0 3 4 4 7 0" />
        )}

        {/* Gorro de chef */}
        <path style={f('white')} d="M36 32c-10-6-6-22 6-19 2-10 16-13 20-5 6-8 22-4 20 6 10-2 14 12 4 18Z" />
        <rect style={f('white')} x="38" y="30" width="44" height="12" rx="4" />
      </g>

      {/* Pata izquierda (saluda / piensa / celebra) */}
      <g className="logui__arm logui__arm--left">
        <path style={f('caramel')} d="M40 104c-8 6-10 16-6 22 3 4 9 2 10-3 1-7 2-13 2-17Z" />
        <circle style={f('white')} cx="37" cy="125" r="6" />
      </g>

      {/* Pata derecha con la cuchara de madera */}
      <g className="logui__arm logui__arm--right">
        <path style={f('butter')} d="m81 126 3 2 16-34-3-2Z" />
        <ellipse style={f('butter')} cx="101" cy="88" rx="6" ry="9" transform="rotate(25 101 88)" />
        <path style={f('caramel')} d="M80 104c8 6 10 16 6 22-3 4-9 2-10-3-1-7-2-13-2-17Z" />
        <circle style={f('white')} cx="83" cy="125" r="6" />
      </g>

      {thinking && (
        <g className="logui__bubble">
          <circle style={f('white')} cx="94" cy="30" r="3" />
          <circle style={f('white')} cx="101" cy="19" r="4.5" />
          <ellipse style={f('white')} cx="108" cy="2" rx="17" ry="11" />
          <circle style={{ ...f('cocoa'), ...FLAT }} cx="101" cy="2" r="2" />
          <circle style={{ ...f('cocoa'), ...FLAT }} cx="108" cy="2" r="2" />
          <circle style={{ ...f('cocoa'), ...FLAT }} cx="115" cy="2" r="2" />
        </g>
      )}

      {happy && (
        <g className="logui__confetti">
          <rect style={f('tomato')} x="10" y="22" width="7" height="4" rx="1" transform="rotate(-25 13 24)" />
          <rect style={f('mint')} x="102" y="40" width="7" height="4" rx="1" transform="rotate(30 105 42)" />
          <circle style={f('butter')} cx="18" cy="52" r="3" />
          <circle style={f('tomato')} cx="106" cy="20" r="3" />
          <rect style={f('butter')} x="96" y="62" width="6" height="4" rx="1" transform="rotate(-40 99 64)" />
          <circle style={f('mint')} cx="8" cy="80" r="2.5" />
        </g>
      )}
    </svg>
  )
}
