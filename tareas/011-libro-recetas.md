# Tarea 011 — Pantalla "Recetas" (libro)

Rama: `tarea/011-libro-recetas`

## Objetivo

La pantalla que lista las recetas como un libro de tarjetas con filtro por etiqueta (`SPEC.md`, pantalla 4).
El detalle y la edición de recetas los hace Claude en otra rama: aquí solo se enlaza a sus rutas.

## Archivos

- **Crear:** `src/screens/RecipesScreen.jsx`, `src/components/recipes/RecipeCard.jsx`,
  `src/components/recipes/recipes.css` (solo clases que empiecen por `recipe-card` o `recipes-`).
- **No toques** ningún otro archivo (las rutas las añade Claude en `App.jsx`).

## Piezas disponibles (no las modifiques)

- `useStore()` de `src/store/StoreProvider.jsx` → `{ state }`. `state.recipes`: array de
  `{ id, name, iconId, tags: string[], servings, ingredients: [...], steps: [...] }`.
- `allTags(recipes)` y `filterByTag(recipes, tag)` de `src/domain/recipes.js`.
- Componentes (export default salvo que se indique):
  - `src/components/ui/ScreenHeader.jsx` (`title`, `backTo`, hijos = acciones a la derecha)
  - `src/components/ui/Chip.jsx` (`active`, `color`, resto de props a un `<span>`)
  - `src/components/icons/CategoryIcon.jsx` → **export con nombre** `Icon` (`icon`, `size`): los iconos de
    receta son `pot`, `pan`, `salad`, `cake`, `soup`, `pasta`.
  - `src/components/icons/UiIcon.jsx` (`name`: `plus`…).
- Clases CSS existentes: `.screen`, `.empty`, `.btn`, `.btn--primary`, `.card`, `.chip`, `.chip--active`.
- Rutas (las crea Claude): `/recetas` (esta), `/recetas/nueva`, `/recetas/:recipeId`.

## `RecipeCard`

Props `{ recipe }`. Tarjeta enlazada (`<Link to={'/recetas/' + recipe.id}>`, toda la tarjeta tocable):
- a la izquierda, el icono (`<Icon icon={recipe.iconId} size={56} />`) sobre un círculo `--c-butter-soft`
  con contorno;
- a la derecha, el nombre (`--font-title`, `--fs-l`), una línea pequeña
  `"4 raciones · 5 ingredientes"` (singular: `"1 ración · 1 ingrediente"`), y las etiquetas como chips pequeños.
Estilo: como `.card` (contorno, sombra dura, radio de tarjeta) y que se hunda al pulsar como los botones.

## Pantalla `RecipesScreen`

- `ScreenHeader` título "Recetas", `backTo="/"`, y como acción un enlace redondo a `/recetas/nueva`
  con `UiIcon name="plus"` y `aria-label="Nueva receta"` (clases `btn btn--round btn--small btn--primary`).
- Fila de filtros con scroll horizontal si no caben: un chip "Todas" y un chip por etiqueta (`allTags`).
  Los chips son **botones** (`<button type="button">` con `aria-pressed`) con la clase `chip`
  (y `chip--active` en el seleccionado), mínimo 40px de alto. Tocar el activo de nuevo vuelve a "Todas".
  Si no hay etiquetas, no se muestra la fila.
- Recetas filtradas (`filterByTag`), ordenadas por nombre con `localeCompare(…, 'es')`, en `RecipeCard`.
- Sin recetas: `.empty` con `<Icon icon="pot" size={72} />`, el texto "Tu libro de recetas está vacío."
  y un enlace-botón primario "Crear receta" a `/recetas/nueva`.
- Con filtro y sin resultados: `.empty` con "No hay recetas con esa etiqueta."
- La etiqueta elegida se guarda en el estado del componente (no hace falta persistirla).

## Reglas

- Textos en español. Colores, radios y sombras solo con variables de `src/styles/tokens.css`.
- Objetivos táctiles de 48px mínimo (los chips, 40px). Sin dependencias nuevas.

## Comprobación

```
npm test
npm run build
```

Ambos deben pasar. Claude revisará el resultado en el navegador.
