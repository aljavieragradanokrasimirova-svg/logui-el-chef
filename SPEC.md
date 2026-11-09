# Logui el chef — Especificación

Web personal de listas de la compra, pensada para el móvil dentro del supermercado.
Un solo usuario, sin cuentas. Todo en español. Datos en el navegador (localStorage).
Estética: cocina de dibujos animados, colorida y juguetona. Mascota original: Logui, un beagle cocinero.

## Pantallas

1. **Inicio (cocina ilustrada).** Escena SVG con cuatro objetos tocables:
   - Nevera → Mis listas
   - Libro de recetas → Recetas
   - Despensa / cajón → Historial (listas archivadas)
   - Radio → Ajustes
   Logui aparece en la escena y reacciona (saluda al entrar).
2. **Mis listas.** Tarjetas con nombre, progreso (comprados / total) y fecha. Crear, renombrar, borrar, archivar.
3. **Detalle de lista.** Productos agrupados por categoría (orden fijo de pasillo), cada grupo con icono y color.
   - Campo de añadir con sugerencias (catálogo + productos usados antes); al elegir una sugerencia se rellena categoría y unidad.
   - Cantidad (número opcional) + unidad (lista fija).
   - Tocar un producto lo marca como comprado: animación, se tacha y baja al final de su categoría.
   - Al completar todos: Logui celebra y ofrece archivar.
4. **Recetas.** Libro con tarjetas (icono, nombre, etiquetas). Filtro por etiqueta.
5. **Detalle / edición de receta.** Nombre, icono, etiquetas, raciones, ingredientes (nombre, cantidad, unidad, categoría), pasos.
   - Cambiar raciones recalcula las cantidades mostradas.
   - "Añadir a una lista": elige lista y raciones; vuelca ingredientes.
6. **Historial.** Listas archivadas. "Usar de nuevo" crea una lista nueva con los mismos productos, sin marcar.
7. **Ajustes.** Exportar / importar copia de seguridad (JSON), borrar todos los datos (con confirmación), reducir animaciones.

## Reglas de negocio

- **Fusión de ingredientes:** al volcar una receta a una lista, si existe un producto con el mismo nombre normalizado
  (minúsculas, sin tildes, sin espacios sobrantes) **y la misma unidad**, se suman las cantidades. Si la unidad difiere
  o alguna cantidad es nula, se añade como línea separada. Un producto ya comprado que recibe más cantidad vuelve a "pendiente".
- **Escalado de recetas:** cantidad × (raciones elegidas / raciones base), redondeado a 2 decimales;
  para la unidad `ud` se redondea hacia arriba al entero.
- **Archivar:** la lista pasa al historial con su fecha (`archivedAt`). No se puede editar archivada.
- **Sugerencias:** coincidencia por prefijo y luego por inclusión, sobre nombre normalizado. Máximo 6. Prioridad:
  productos usados recientemente > catálogo.

## Datos fijos

- Categorías (orden de pasillo): ver `src/data/categories.js`.
- Unidades: ver `src/data/units.js`. No se convierten entre sí (kg y g no se suman).

## Modelo de datos (localStorage, clave `logui:v1`)

```js
{
  version: 1,
  lists: [{ id, name, createdAt, archivedAt: null | string, items: [Item] }],
  recipes: [{ id, name, iconId, tags: [string], servings, ingredients: [Ingredient], steps: [string] }],
  productMemory: { [normalizedName]: { name, categoryId, unit, lastUsed } },
  settings: { reduceMotion: false }
}
Item       = { id, name, quantity: number | null, unit, categoryId, checked: false, checkedAt: null | string }
Ingredient = { id, name, quantity: number | null, unit, categoryId }
```

## Plan por capas

1. Listas, productos y categorías (dominio + pantallas de listas).
2. Recetas.
3. Pantalla de inicio ilustrada.
4. Logui y animaciones.
5. Instalable (PWA) y sin conexión.
