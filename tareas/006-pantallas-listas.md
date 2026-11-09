# Tarea 006 — Pantallas "Mis listas" e "Historial"

Rama: `tarea/006-pantallas-listas`

## Objetivo

Construir las dos pantallas que muestran listas como tarjetas (`SPEC.md`, pantallas 2 y 6), usando los
componentes y el store que ya existen. El detalle de una lista (`src/screens/ListDetailScreen.jsx`) ya está
hecho: úsalo como referencia de estilo y de uso del store.

## Archivos

- **Sustituir** (ahora son provisionales): `src/screens/ListsScreen.jsx`, `src/screens/HistoryScreen.jsx`
- **Crear:** `src/components/lists/ListCard.jsx`
- **Puedes añadir** estilos al final de `src/components/lists/lists.css` (solo clases nuevas que empiecen por
  `list-card` o `lists-`).
- **No toques** ningún otro archivo.

## Piezas disponibles (no las modifiques)

- `useStore()` de `src/store/StoreProvider.jsx` → `{ state, actions }`.
  - `state.lists`: todas las listas (activas y archivadas). Archivada ⇔ `archivedAt !== null`.
  - `actions.createList(name) → id`, `actions.reuseList(listId) → id`, `actions.deleteList(listId)`.
- `listProgress(list) → { checked, total }` de `src/domain/lists.js`.
- `formatDate(iso)` de `src/domain/format.js` ("9 nov").
- Componentes (rutas): `src/components/ui/` → `ScreenHeader.jsx`, `Card.jsx`, `Button.jsx`, `ProgressBar.jsx`,
  `Modal.jsx` (export default `Modal` y export `ModalActions`); `src/components/lists/RenameModal.jsx`;
  `src/components/icons/UiIcon.jsx` y `src/components/icons/CategoryIcon.jsx` (export default).
- Uso: `ScreenHeader` (`title`, `backTo`, hijos = acciones a la derecha), `Card`, `Button`
  (`variant="primary"`, `size="small"`, `round`), `ProgressBar` (`value`, `max`, `label`), `Modal` + `ModalActions`,
  `RenameModal` (`open`, `name`, `title`, `saveLabel`, `placeholder`, `onClose`, `onSave(name)`),
  `UiIcon` (`name`: `plus`, `trash`, `reuse`, `archive`…), `CategoryIcon` (`categoryId`, `size`).
- Rutas: `/listas`, `/listas/:listId`, `/historial`, `/` (usa `Link` / `useNavigate` de `react-router-dom`).
- Clases CSS existentes: `.screen` (contenedor de pantalla), `.empty` (estado vacío), `.btn`, `.field`.

## `ListCard`

Props: `{ list, to, children }`. Una tarjeta enlazada (`<Link to={to}>`, toda la tarjeta es tocable) con:
- nombre de la lista (título, `--font-title`),
- `ProgressBar` con `listProgress(list)`,
- texto pequeño: `"3 de 7 comprados · 9 nov"` (fecha = `createdAt`; en archivadas, `archivedAt`).
  Lista sin productos: `"Sin productos · 9 nov"`.
- `children` se pinta debajo, **fuera** del enlace (para botones como "Usar de nuevo").
Estilo como `.card` (contorno, sombra dura, radio de tarjeta) y que se hunda al pulsar como los botones.

## "Mis listas" (`/listas`)

- `ScreenHeader` con título "Mis listas", `backTo="/"`.
- Botón principal "Nueva lista" (con `UiIcon name="plus"`): abre `RenameModal` con título "Nueva lista",
  `saveLabel="Crear"` y `placeholder="Compra del sábado"`. Al guardar: `createList(name)` y navegar a `/listas/<id>`.
- Listas **no archivadas**, de la más reciente a la más antigua por `createdAt`, cada una con `ListCard`
  (`to=/listas/<id>`).
- Sin listas activas: estado vacío (`.empty`) con un `CategoryIcon categoryId="otros" size={72}`, el texto
  "Todavía no tienes listas." y el mismo botón de crear.
- Enlace al historial al final: "Ver historial (N)" con N = número de archivadas (solo si N > 0).

## "Historial" (`/historial`)

- `ScreenHeader` con título "Historial", `backTo="/"`.
- Listas **archivadas**, de la más reciente a la más antigua por `archivedAt`, con `ListCard` (`to=/listas/<id>`).
- Dentro de cada tarjeta (como `children`), dos botones pequeños:
  - "Usar de nuevo" (`UiIcon name="reuse"`): `reuseList(id)` y navegar a `/listas/<nuevoId>`.
  - Borrar (botón redondo con `UiIcon name="trash"` y `aria-label="Borrar <nombre>"`): abre un `Modal`
    "¿Borrar la lista?" con Cancelar / Borrar; Borrar llama a `deleteList(id)`.
- Sin archivadas: `.empty` con el texto "Aquí aparecerán las listas que archives."

## Reglas

- Textos en español. Colores, radios y sombras solo con variables de `src/styles/tokens.css`.
- Objetivos táctiles de 48px mínimo. Sin dependencias nuevas.
- No uses `localStorage` directamente: todo pasa por `useStore()`.

## Comprobación

```
npm test
npm run build
```

Ambos deben pasar. (No hay tests de componentes: Claude revisará el resultado en el navegador.)
