# Tarea 007 — Dominio de recetas

Rama: `tarea/007-dominio-recetas`

## Objetivo

Lógica pura de recetas (capa 2 de `SPEC.md`): crear/normalizar recetas, escalar raciones, volcar ingredientes
a una lista con la regla de fusión, y etiquetas para filtrar.

## Archivos

- **Crear:** `src/domain/recipes.js`
- **No tocar:** `src/domain/recipes.test.js` (test de aceptación, ya escrito). Ningún otro archivo.
- Puedes importar de `src/domain/normalize.js`, `src/domain/lists.js` (`toQuantity`), `src/data/categories.js`
  y `src/data/units.js`.

## Reglas generales

- Funciones puras: no modifican sus argumentos (el test los congela). Sin `Date.now()` ni `Math.random()`:
  `makeId` (función que devuelve un id nuevo) y `now` llegan como parámetros.
- "Limpiar un texto" = `trim` y reducir los espacios internos repetidos a uno.
- Redondeo a 2 decimales: `Math.round(x * 100) / 100`.

## API (exportaciones con nombre)

### `ICON_IDS_RECIPE = ['pot', 'pan', 'salad', 'cake', 'soup', 'pasta']`
### `DEFAULT_RECIPE_ICON = 'pot'`

### `normalizeRecipe(input, { makeId }) → Recipe`
Construye una receta válida a partir de lo que llega del formulario (para crear o guardar una edición).
`input = { id?, name, iconId?, tags?, servings?, ingredients?, steps? }`.
- `id`: el de `input.id` si es una cadena no vacía; si no, `makeId()`.
- `name`: limpio; vacío → lanza `Error('El nombre no puede estar vacío')`.
- `iconId`: si no está en `ICON_IDS_RECIPE` → `DEFAULT_RECIPE_ICON`.
- `tags`: cada una limpia y en **minúsculas**; se quitan las vacías y las repetidas (se queda la primera aparición).
  Ausente → `[]`.
- `servings`: número entero ≥ 1 (acepta cadenas numéricas, `'4'` → `4`). Si no es válido → `2`.
  Decimales: se redondea (`2.6` → `3`); si redondea a 0 → `2`.
- `ingredients`: para cada uno `{ id, name, quantity, unit, categoryId }`:
  - `id`: el suyo si es cadena no vacía; si no, `makeId()`.
  - `name` limpio; los ingredientes con nombre vacío **se descartan** (no lanzan).
  - `quantity`: `toQuantity(quantity)`.
  - `unit` / `categoryId` no válidos → `DEFAULT_UNIT` / `DEFAULT_CATEGORY`.
  Ausente → `[]`.
- `steps`: cada paso limpio; se quitan los vacíos. Ausente → `[]`.
- Orden de llamadas a `makeId`: primero la receta (si hace falta), luego los ingredientes en orden.
  Los ingredientes descartados y los que ya traen id no llaman a `makeId`.

### `scaleQuantity(quantity, unit, factor) → number | null`
- `quantity` nulo → `null`.
- `quantity × factor` redondeado a 2 decimales; si `unit === 'ud'`, **hacia arriba al entero** (`Math.ceil`).
  Para `ud`, aplica `Math.ceil` sobre el valor ya redondeado a 2 decimales (así `3 × 1/3` da `1`, no `2`).

### `scaleIngredients(recipe, servings) → Ingredient[]`
Ingredientes con `quantity` escalada por `servings / recipe.servings`. Mismo orden, mismos ids y demás campos.
`servings` no válido (no entero ≥ 1) → se usan las raciones de la receta (factor 1).

### `addIngredientsToList(list, ingredients, { makeId }) → List`
Vuelca ingredientes (ya escalados) en una lista con la **regla de fusión** de `SPEC.md`:
- Lista archivada → lanza `Error('La lista está archivada')`.
- Para cada ingrediente, en orden, se busca el **primer** producto de la lista con el mismo
  `normalizeName(name)` **y** la misma `unit`, y con **ambas** cantidades no nulas.
  - Si existe: su `quantity` pasa a ser la suma (redondeada a 2 decimales). Si estaba comprado vuelve a
    pendiente (`checked: false`, `checkedAt: null`). Conserva su `id`, `name`, `categoryId` y posición.
  - Si no existe: se añade al final un producto nuevo
    `{ id: makeId(), name, quantity, unit, categoryId, checked: false, checkedAt: null }`.
- Los ingredientes se procesan uno a uno, así que dos ingredientes iguales de la misma receta también se fusionan
  entre sí.
- `ingredients` vacío → devuelve la **misma** lista (`===`).

### `allTags(recipes) → string[]`
Todas las etiquetas sin repetir, ordenadas con `localeCompare(…, 'es')`.

### `filterByTag(recipes, tag) → Recipe[]`
`tag` vacío/nulo → todas. Si no, las que incluyen esa etiqueta (comparando en minúsculas y limpia). Mismo orden.

## Comprobación

```
npm test
```

Debe pasar `src/domain/recipes.test.js` sin modificarlo, y el resto de tests.
