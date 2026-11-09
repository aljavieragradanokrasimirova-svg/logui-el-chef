# Tarea 002 — Dominio de listas

Rama: `tarea/002-dominio-listas`

## Objetivo

Lógica pura de listas y productos (capa 1 de `SPEC.md`). Sin React, sin `localStorage`, sin `Date.now()` ni
`Math.random()`: la fecha (`now`, cadena ISO) y el generador de ids (`makeId`, función sin argumentos que
devuelve un id nuevo) llegan siempre como parámetros, para que todo sea determinista y testeable.

## Archivos

- **Crear:** `src/domain/lists.js`
- **No tocar:** `src/domain/lists.test.js` (test de aceptación, ya escrito). Ningún otro archivo.
- Puedes importar de `src/data/categories.js`, `src/data/units.js` y `src/domain/normalize.js`.

## Reglas generales

- **Inmutabilidad:** ninguna función modifica sus argumentos. Devuelven objetos nuevos
  (el test pasa listas congeladas en profundidad).
- **Listas archivadas** (`archivedAt !== null`): `renameList`, `archiveList`, `addItem`, `updateItem`,
  `removeItem` y `toggleItem` lanzan `Error` con el mensaje exacto `'La lista está archivada'`.
- Un `itemId` que no existe en la lista: la función devuelve la **misma** lista (`===`), sin lanzar.
- Nombres: se recortan los espacios (`trim`) y los espacios internos repetidos se dejan en uno.

## API (todas exportadas con nombre)

### `toQuantity(value) → number | null`
Convierte la entrada de un formulario en cantidad.
- `null`, `undefined`, `''` o solo espacios → `null`.
- Número o cadena numérica (admite coma decimal: `'1,5'` → `1.5`) **mayor que 0** → redondeado a 2 decimales.
- Cualquier otra cosa (`0`, negativos, `NaN`, `Infinity`, `'abc'`, `'2kg'`) → `null`.

### `createList(name, { makeId, now }) → List`
`{ id: makeId(), name, createdAt: now, archivedAt: null, items: [] }`.
Si el nombre queda vacío tras recortar → `'Nueva lista'`.

### `renameList(list, name) → List`
Si el nombre queda vacío tras recortar → lanza `Error('El nombre no puede estar vacío')`.

### `archiveList(list, { now }) → List`
Pone `archivedAt: now`.

### `reuseList(list, { makeId, now }) → List`
"Usar de nuevo" desde el historial. Lista nueva: id nuevo, mismo nombre, `createdAt: now`, `archivedAt: null`,
y una copia de cada producto con **id nuevo**, `checked: false` y `checkedAt: null` (mismo orden, mismos
`name`, `quantity`, `unit`, `categoryId`). Funciona con listas archivadas o no.
Llama a `makeId` primero para la lista y después una vez por producto, en orden.

### `addItem(list, input, { makeId }) → List`
`input = { name, quantity?, unit?, categoryId? }`. Añade al **final** de `items`:
`{ id: makeId(), name, quantity: toQuantity(quantity), unit, categoryId, checked: false, checkedAt: null }`.
- Nombre vacío tras recortar → lanza `Error('El nombre no puede estar vacío')`.
- `unit` que no esté en `UNIT_IDS` (o ausente) → `DEFAULT_UNIT`.
- `categoryId` que no esté en `CATEGORY_IDS` (o ausente) → `DEFAULT_CATEGORY`.

### `updateItem(list, itemId, changes) → List`
Solo se aplican las claves `name`, `quantity`, `unit` y `categoryId` presentes en `changes`; el resto se ignora
(no se puede cambiar `id`, `checked` ni `checkedAt` por aquí). Mismas normalizaciones que `addItem`
(nombre vacío → lanza; cantidad con `toQuantity`; unidad/categoría inválidas → valor por defecto).
El producto conserva su posición.

### `removeItem(list, itemId) → List`

### `toggleItem(list, itemId, { now }) → List`
Pendiente → `checked: true, checkedAt: now`. Comprado → `checked: false, checkedAt: null`.

### `listProgress(list) → { checked, total }`

### `isComplete(list) → boolean`
`true` solo si hay al menos un producto y todos están comprados.

### `groupByCategory(items) → [{ categoryId, items }]`
- Grupos en el orden de `CATEGORIES`; se omiten las categorías sin productos.
- Un `categoryId` desconocido cuenta como `DEFAULT_CATEGORY`.
- Dentro de cada grupo: primero los **pendientes** en su orden original, después los **comprados**
  ordenados por `checkedAt` ascendente (el último marcado queda abajo). Empates: orden original.
- No modifica los productos (son los mismos objetos).

## Comprobación

```
npm test
```

Debe pasar `src/domain/lists.test.js` sin modificarlo, y el resto de tests.
