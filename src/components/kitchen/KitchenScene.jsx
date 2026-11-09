import './kitchen.css'

/**
 * Cocina ilustrada del inicio (SVG en línea, contorno cacao, sin texto dentro).
 * Cuatro objetos tocables enlazan a las secciones; `children` se pinta en el hueco central
 * (ahí vivirá Logui).
 *
 * Los enlaces son <a href="#/…"> de SVG: con HashRouter navegan sin JavaScript y son enfocables con teclado.
 */
const f = (token) => ({ fill: `var(--c-${token})` })
const NONE = { fill: 'none' }

export default function KitchenScene({ counts, children }) {
  const { lists = 0, recipes = 0, archived = 0 } = counts ?? {}
  return (
    <svg className="kitchen" viewBox="0 0 400 440" role="group" aria-label="Cocina">
      {/* Pared y suelo */}
      <rect style={{ ...f('cream'), stroke: 'none' }} x="0" y="0" width="400" height="400" />
      <rect style={{ ...f('cream-deep'), stroke: 'none' }} x="0" y="400" width="400" height="40" />
      <path style={NONE} d="M0 400h400" />

      {/* Reloj */}
      <circle style={f('white')} cx="172" cy="72" r="26" />
      <path style={NONE} d="M172 72V56m0 16h11" />
      <circle style={{ ...f('cocoa'), stroke: 'none' }} cx="172" cy="72" r="3" />

      {/* Ventana */}
      <rect style={f('butter-soft')} x="240" y="40" width="132" height="110" rx="14" />
      <circle style={f('butter')} cx="345" cy="72" r="15" />
      <path style={NONE} d="M306 40v110M240 95h132" />
      <rect style={f('white')} x="232" y="150" width="148" height="10" rx="4" />

      {/* Salpicadero */}
      <rect style={{ ...f('butter-soft'), strokeWidth: 0 }} x="222" y="252" width="168" height="72" />

      {/* Alfombra donde se pone Logui */}
      <ellipse style={f('butter')} cx="172" cy="420" rx="40" ry="10" />

      {/* Nevera → Mis listas */}
      <a href="#/listas" className="kitchen__spot" aria-label={`Nevera: mis listas (${lists})`}>
        <rect style={f('cocoa')} x="28" y="398" width="14" height="8" rx="2" />
        <rect style={f('cocoa')} x="100" y="398" width="14" height="8" rx="2" />
        <rect style={f('white')} x="16" y="110" width="110" height="290" rx="18" />
        <path style={NONE} d="M16 200h110" />
        <rect style={f('cream-deep')} x="104" y="138" width="9" height="42" rx="4.5" />
        <rect style={f('cream-deep')} x="104" y="220" width="9" height="72" rx="4.5" />
        <circle style={f('tomato')} cx="40" cy="140" r="7" />
        <circle style={f('mint')} cx="66" cy="154" r="6" />
        <g transform="rotate(-5 60 265)">
          <rect style={f('white')} x="34" y="232" width="54" height="70" rx="4" />
          <path style={{ ...NONE, stroke: 'var(--c-cocoa-soft)', strokeWidth: 2.5 }} d="M42 250h38M42 264h38M42 278h26" />
          <circle style={f('butter')} cx="61" cy="232" r="7" />
        </g>
      </a>

      {/* Libro de recetas → Recetas */}
      <a href="#/recetas" className="kitchen__spot" aria-label={`Libro de recetas (${recipes})`}>
        <rect style={f('mint')} x="288" y="266" width="16" height="56" rx="4" />
        <g transform="rotate(-7 258 322)">
          <rect style={f('tomato')} x="232" y="250" width="50" height="72" rx="6" />
          <path style={NONE} d="M240 252v68" />
          <rect style={f('white')} x="246" y="266" width="28" height="18" rx="3" />
          <path style={f('butter')} d="M266 250v20l4-4 4 4v-20Z" />
        </g>
      </a>

      {/* Radio → Ajustes */}
      <a href="#/ajustes" className="kitchen__spot" aria-label="Radio: ajustes">
        <path style={NONE} d="M372 278 388 244" />
        <circle style={f('tomato')} cx="388" cy="243" r="4" />
        <path style={NONE} d="M322 278c0-12 50-12 50 0" />
        <rect style={f('butter')} x="312" y="276" width="74" height="46" rx="12" />
        <circle style={f('white')} cx="334" cy="299" r="12" />
        <path style={{ ...NONE, strokeWidth: 2 }} d="M327 295h14M326 299h16M327 303h14" />
        <rect style={f('white')} x="352" y="287" width="26" height="10" rx="5" />
        <circle style={f('tomato')} cx="358" cy="310" r="4" />
        <circle style={f('tomato')} cx="372" cy="310" r="4" />
      </a>

      {/* Encimera */}
      <rect style={f('cream-deep')} x="214" y="322" width="184" height="16" rx="6" />

      {/* Muebles y cajones → Historial */}
      <a href="#/historial" className="kitchen__spot" aria-label={`Cajón: historial (${archived})`}>
        <rect style={f('mint')} x="222" y="338" width="168" height="62" />
        <rect style={f('white')} x="230" y="345" width="72" height="20" rx="6" />
        <path style={NONE} d="M254 355h24" />
        <rect style={f('white')} x="230" y="371" width="72" height="22" rx="6" />
        <path style={NONE} d="M254 382h24" />
        <rect style={f('white')} x="310" y="345" width="72" height="48" rx="6" />
        <circle style={{ ...f('cocoa'), stroke: 'none' }} cx="322" cy="369" r="4" />
      </a>

      {children}
    </svg>
  )
}
