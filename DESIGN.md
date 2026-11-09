# Logui el chef — Sistema de diseño

Inspiración: juegos de cocina de dibujos animados. Diseño **original**: no usar personajes, logos ni gráficos de terceros.

## Principios
- **Contorno grueso de cacao** (3px) en tarjetas, botones e ilustraciones, como un dibujo animado.
- **Sombra dura desplazada** (sin difuminar) que da volumen de pegatina.
- **Formas muy redondeadas**, colores planos, nada de degradados realistas.
- **Botones que se hunden** al pulsar (bajan 3px y la sombra desaparece).
- Pensado para el pulgar: objetivos táctiles de 48px mínimo.

## Color (variables en `src/styles/tokens.css`)
| Token | Valor | Uso |
|---|---|---|
| `--c-tomato` | #E8513A | Acción principal, cabeceras |
| `--c-tomato-dark` | #B83A27 | Pulsado, bordes de acción |
| `--c-butter` | #F7D774 | Acentos, chips activos |
| `--c-butter-soft` | #FCEFB4 | Fondos de tarjeta destacada |
| `--c-cream` | #FFF8E7 | Fondo de la app |
| `--c-cream-deep` | #F6E7C8 | Fondos secundarios, tablas |
| `--c-cocoa` | #4A2E22 | Texto, contornos, sombras |
| `--c-cocoa-soft` | #7A5A48 | Texto secundario |
| `--c-mint` | #6CC4A1 | Éxito, comprado |
| `--c-white` | #FFFFFF | Superficies |

Cada categoría tiene su color propio (`src/data/categories.js`).

## Tipografía
- Títulos: **Baloo 2** 800 (redonda, gordita).
- Texto: **Nunito** 600 / 700.
- Escala: 32 / 24 / 20 / 17 (base) / 14.

## Formas
- Radios: 12 (chips), 20 (tarjetas, botones), 999 (píldoras).
- Contorno: `3px solid var(--c-cocoa)`.
- Sombra: `0 4px 0 var(--c-cocoa)`; pulsado: `0 1px 0` + `translateY(3px)`.

## Movimiento
- Rebote corto: 180–260 ms, `cubic-bezier(.34,1.56,.64,1)`.
- Respetar `prefers-reduced-motion` y el ajuste "reducir animaciones".

## Ilustración
- SVG en línea, contorno cacao 3px, colores de la paleta, sin texto dentro.
- Logui: beagle redondeado (tricolor marrón, blanco y negro), gorro de chef y cuchara de madera.
  Estados: reposo, saludo, celebración, pensativo.
