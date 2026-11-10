# Tarea 032 — Frases de Logui

Rama: `tarea/032-frases-logui`

## Objetivo

Logui (el beagle cocinero de la app) va a «hablar» en avisos, estados vacíos y celebraciones. Esta tarea es
solo el texto y una función para elegir una frase. Nada de interfaz.

## Archivos

- **Crear:** `src/data/loguiLines.js`
- **No tocar:** `src/data/loguiLines.test.js` (test de aceptación, ya escrito). Ningún otro archivo.

## API

### `LINES` (export) — objeto `{ [tipo]: string[] }`

Tipos obligatorios y cuándo se usan:

| Tipo | Momento |
|---|---|
| `itemAdded` | se acaba de añadir un producto a la lista |
| `itemChecked` | se marca un producto como comprado |
| `itemDeleted` | se borra un producto (sale junto a un botón «Deshacer») |
| `listDone` | se marca el último producto: lista completa |
| `listArchived` | la lista se guarda en el historial |
| `listDeleted` | se borra una lista entera (sale junto a «Deshacer») |
| `emptyList` | una lista sin productos |
| `emptyLists` | no hay ninguna lista |
| `emptyRecipes` | no hay ninguna receta |
| `recipeSaved` | se guarda una receta |
| `idle` | el usuario lleva rato sin tocar nada en una lista |

Reglas del texto:
- Español de España, tono simpático y con humor de cocina (Logui es un perro cocinero, le llaman «chef»;
  se puede dirigir al usuario como «jefe», «chef», «compi»…). Nada ofensivo ni de doble sentido.
- **Entre 6 y 12 frases** por tipo, sin repetir ninguna en todo el archivo.
- Cada frase: como máximo **48 caracteres**, sin emojis, sin comillas, sin saltos de línea, sin espacios al principio o al final.
- Empiezan con mayúscula (o con `¡`/`¿` seguido de mayúscula).

### `pickLine(kind, { random = Math.random, avoid } = {}) → string`

- Devuelve una frase de `LINES[kind]` usando `random()` (número en `[0, 1)`): índice `Math.floor(random() * n)`.
- Si la frase elegida es igual a `avoid` y hay más de una, devuelve la siguiente de la lista (dando la vuelta al final).
- Tipo desconocido → `''`.

## Criterios de aceptación

- `npm test` pasa, incluido `src/data/loguiLines.test.js`.
- Solo se crea `src/data/loguiLines.js`.
