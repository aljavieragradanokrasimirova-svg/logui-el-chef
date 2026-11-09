# Tarea 012 — Pantalla "Ajustes"

Rama: `tarea/012-ajustes`

## Objetivo

Pantalla de ajustes (`SPEC.md`, pantalla 7): reducir animaciones, exportar e importar la copia de seguridad
(JSON) y borrar todos los datos.

## Archivos

- **Crear:** `src/screens/SettingsScreen.jsx`, `src/components/settings/settings.css`
  (solo clases que empiecen por `settings-`).
- **Modificar** `src/App.jsx` solo para importar `SettingsScreen` y añadir la ruta
  `<Route path="/ajustes" element={<SettingsScreen />} />` junto a las demás.
- **No toques** ningún otro archivo.

## Piezas disponibles (no las modifiques)

- `useStore()` de `src/store/StoreProvider.jsx` → `{ state, actions, saveFailed }`.
  - `state.settings.reduceMotion` (boolean), `state.lists`, `state.recipes`.
  - `actions.updateSettings({ reduceMotion })`, `actions.replaceState(nuevoEstado)`, `actions.resetState()`.
  - `saveFailed`: `true` si el navegador no deja guardar.
- `exportBackup(state) → string` y `parseBackup(text) → estado` (lanza `Error` con un mensaje para el usuario)
  de `src/store/storage.js`.
- Componentes (export default salvo `ModalActions`): `ScreenHeader`, `Card`, `Button`, `Modal` y `ModalActions`
  en `src/components/ui/`; `UiIcon` en `src/components/icons/UiIcon.jsx`.
- Clases existentes: `.screen`, `.card`, `.btn`, `.sr-only`.

## Contenido de la pantalla

`ScreenHeader` con título "Ajustes" y `backTo="/"`. Debajo, tarjetas (`Card`) con un `h2` cada una:

1. **Aviso** (solo si `saveFailed`): tarjeta con fondo `--c-butter-soft` y el texto
   "Tu navegador no deja guardar los datos. Exporta una copia para no perderlos."
2. **Animaciones**: interruptor "Reducir animaciones" que refleja y cambia `state.settings.reduceMotion`.
   Hazlo con un `<button type="button" role="switch" aria-checked={…}>` con aspecto de interruptor
   (pista redondeada con contorno y una bola que se desplaza; verde menta `--c-mint` cuando está activo),
   de al menos 48px de alto incluyendo el texto. Texto de ayuda pequeño: "Quita los rebotes y movimientos."
3. **Copia de seguridad**: texto "Tienes N listas y M recetas." (singular correcto: "1 lista", "1 receta").
   - Botón "Exportar copia": descarga `exportBackup(state)` como archivo
     `logui-copia-AAAA-MM-DD.json` (fecha local de hoy) usando `Blob` + `URL.createObjectURL` + un `<a download>`
     temporal; libera la URL con `URL.revokeObjectURL` después.
   - Botón "Importar copia": abre un `<input type="file" accept="application/json,.json">` oculto (`sr-only`).
     Al elegir archivo: leerlo como texto (`file.text()`), `parseBackup`; si lanza, mostrar el mensaje del error
     en la tarjeta (con `role="alert"`). Si va bien, abrir un `Modal` "¿Reemplazar tus datos?" con el texto
     "Se sustituirán tus listas y recetas por las de la copia (N listas, M recetas)." y botones Cancelar /
     Reemplazar. Reemplazar → `actions.replaceState(estado)` y mostrar "Copia importada." (`role="status"`).
     Vacía el valor del input al terminar para poder elegir el mismo archivo otra vez.
4. **Borrar datos**: botón con texto en `--c-tomato-dark` "Borrar todos los datos" → `Modal`
   "¿Borrar todo?" con "Se borrarán todas tus listas, recetas y productos recordados. No se puede deshacer."
   y Cancelar / "Borrar todo" (primario) → `actions.resetState()` y mostrar "Datos borrados." (`role="status"`).

## Reglas

- Textos en español. Colores, radios y sombras solo con variables de `src/styles/tokens.css`.
- Objetivos táctiles de 48px mínimo. Sin dependencias nuevas.
- No uses `localStorage` directamente.

## Comprobación

```
npm test
npm run build
```

Ambos deben pasar. Claude revisará el resultado en el navegador.
