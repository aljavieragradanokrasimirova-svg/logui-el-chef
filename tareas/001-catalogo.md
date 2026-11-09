# Tarea 001 — Catálogo de productos

Rama: `tarea/001-catalogo`

## Objetivo

Crear el catálogo fijo de productos comunes del supermercado. Se usará para las sugerencias del campo
"añadir producto" (ver `SPEC.md`, "Sugerencias"): al elegir un producto del catálogo se rellenan su
categoría y su unidad.

## Archivos

- **Crear:** `src/data/catalog.js`
- **No tocar:** `src/data/catalog.test.js` (ya escrito; es el test de aceptación). Ningún otro archivo.

## Contrato

```js
// src/data/catalog.js
import { ... } from './categories.js'  // opcional
import { ... } from './units.js'       // opcional

/** Productos comunes, agrupados por categoría en orden de pasillo. */
export const CATALOG = Object.freeze([
  Object.freeze({ name: 'Plátanos', categoryId: 'frutas', unit: 'kg' }),
  // ...
])
```

Cada producto es un objeto con **exactamente** tres claves:

| Clave | Tipo | Regla |
|---|---|---|
| `name` | string | En español, como se escribiría en una lista de la compra. |
| `categoryId` | string | Un `id` de `src/data/categories.js`. |
| `unit` | string | Un `id` de `src/data/units.js`: la unidad con la que se suele comprar. |

## Criterios de aceptación

1. `CATALOG` tiene **entre 90 y 120** productos.
2. Cada producto tiene solo `name`, `categoryId` y `unit`; categoría y unidad válidas.
3. Nombres: sin espacios al principio/final ni dobles, empiezan por mayúscula, máximo 30 caracteres,
   con tildes correctas (`Plátanos`, `Limón`, `Atún en lata`, `Jabón de manos`).
4. **Sin duplicados** al comparar con `normalizeName` (de `src/domain/normalize.js`).
5. Cobertura mínima por categoría: `frutas` ≥ 18, `carne` ≥ 10, `lacteos` ≥ 10, `panaderia` ≥ 5,
   `despensa` ≥ 18, `congelados` ≥ 5, `bebidas` ≥ 8, `limpieza` ≥ 10, `otros` ≥ 2.
6. El array y cada objeto están congelados (`Object.freeze`).
7. El array está ordenado por categoría en el orden de `CATEGORIES` (dentro de cada categoría, el orden es libre).
8. Deben existir exactamente estas entradas (nombre, categoría, unidad):

   | name | categoryId | unit |
   |---|---|---|
   | Plátanos | frutas | kg |
   | Tomates | frutas | kg |
   | Limones | frutas | ud |
   | Pechuga de pollo | carne | bandeja |
   | Leche | lacteos | l |
   | Huevos | lacteos | ud |
   | Yogures naturales | lacteos | paquete |
   | Pan de molde | panaderia | paquete |
   | Arroz | despensa | kg |
   | Aceite de oliva | despensa | l |
   | Atún en lata | despensa | paquete |
   | Guisantes congelados | congelados | paquete |
   | Agua | bebidas | l |
   | Lejía | limpieza | l |
   | Papel higiénico | limpieza | paquete |

## Criterios de unidad (para el resto)

- Fruta y verdura a granel: `kg`; lo que se compra por piezas (lechuga, aguacate, piña…): `ud`.
- Carne y pescado envasado: `bandeja`; a peso en mostrador: `kg`.
- Líquidos: `l`. Conservas y frascos: `bote` (salvo latas en pack: `paquete`).
- Pasta, legumbre seca, harina, azúcar: `kg` o `paquete`. Especias y salsas: `bote`.

## Comprobación

```
npm test
```

Debe pasar `src/data/catalog.test.js` sin modificarlo, y el resto de tests existentes.
