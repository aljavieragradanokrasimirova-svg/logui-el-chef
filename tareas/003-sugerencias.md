# Tarea 003 — Sugerencias y memoria de productos

Rama: `tarea/003-sugerencias`

## Objetivo

Lógica pura del campo "añadir producto" (ver `SPEC.md`, "Sugerencias" y `productMemory`):
recordar los productos que el usuario añade y sugerir productos mientras escribe.

## Archivos

- **Crear:** `src/domain/products.js`
- **No tocar:** `src/domain/products.test.js` (test de aceptación, ya escrito). Ningún otro archivo.
- Importa `normalizeName` de `src/domain/normalize.js`, `CATALOG` de `src/data/catalog.js`,
  y los ids/valores por defecto de `src/data/categories.js` y `src/data/units.js`.

## Reglas generales

- Funciones puras: no modifican sus argumentos (el test los congela). Sin `Date.now()`: la fecha llega como `now`.
- `productMemory` es un objeto `{ [nombreNormalizado]: { name, categoryId, unit, lastUsed } }`.

## API (exportaciones con nombre)

### `MEMORY_LIMIT = 500`

### `rememberProduct(memory, product, { now, limit = MEMORY_LIMIT }) → memory`
`product = { name, categoryId, unit }`.
- Clave: `normalizeName(name)`. Si la clave queda vacía → devuelve la **misma** `memory` (`===`).
- Guarda `{ name, categoryId, unit, lastUsed: now }` con el nombre recortado y los espacios internos
  repetidos reducidos a uno. Si ya existía la clave, se sustituye (el último uso manda: nombre, categoría y unidad nuevos).
- `categoryId` o `unit` no válidos → `DEFAULT_CATEGORY` / `DEFAULT_UNIT`.
- Si tras guardar hay más de `limit` entradas, se eliminan las de `lastUsed` más antiguo hasta quedar en `limit`
  (la recién guardada nunca se elimina).

### `forgetProduct(memory, name) → memory`
Quita la entrada de `normalizeName(name)`. Si no existe devuelve la **misma** `memory`.

### `suggestProducts(query, { memory = {}, catalog = CATALOG, exclude = [], limit = 6 }) → Suggestion[]`
`Suggestion = { name, categoryId, unit, source: 'memory' | 'catalog' }`.

1. `q = normalizeName(query)`. Si `q` está vacío → `[]`.
2. Candidatos:
   - de la memoria (`source: 'memory'`), ordenados por `lastUsed` **descendente**;
   - del catálogo (`source: 'catalog'`), ordenados alfabéticamente por nombre con
     `a.name.localeCompare(b.name, 'es')`; se descartan los que tengan el mismo nombre normalizado
     que alguna entrada de la memoria (la memoria tiene la categoría y unidad que prefiere el usuario).
3. Se descartan los candidatos cuyo nombre normalizado esté en `exclude` (normalizando también `exclude`).
4. Coincidencias, en este orden de grupos:
   1. memoria cuyo nombre normalizado **empieza** por `q`;
   2. catálogo que **empieza** por `q`;
   3. memoria que **contiene** `q` (sin empezar por él);
   4. catálogo que **contiene** `q` (sin empezar por él).
   Dentro de cada grupo se mantiene el orden del punto 2.
5. Se devuelven como mucho `limit` sugerencias.

## Comprobación

```
npm test
```

Debe pasar `src/domain/products.test.js` sin modificarlo, y el resto de tests.
