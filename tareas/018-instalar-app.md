# Tarea 018 — Botón "Instalar la app" en Ajustes

Rama: `tarea/018-instalar-app`

## Objetivo

La app será una PWA instalable (capa 5; el manifest y el service worker los hace Claude en otra rama).
Esta tarea añade en Ajustes una tarjeta para instalarla cuando el navegador lo permita.

## Archivos

- **Crear:** `src/pwa/useInstallPrompt.js`
- **Modificar:** `src/screens/SettingsScreen.jsx` y `src/components/settings/settings.css`
  (solo clases nuevas que empiecen por `settings-`).
- **No toques** ningún otro archivo (en `src/pwa/` habrá otros archivos de Claude: no los crees ni los edites).

## `useInstallPrompt()` (export con nombre)

Hook de React que devuelve `{ canInstall, installed, install }`:

- Al montar, escucha en `window`:
  - `beforeinstallprompt`: llama a `event.preventDefault()`, guarda el evento y pone `canInstall = true`.
  - `appinstalled`: pone `installed = true`, `canInstall = false` y olvida el evento guardado.
  Quita ambos listeners al desmontar.
- `installed` empieza en `true` si la app ya se abre instalada:
  `window.matchMedia?.('(display-mode: standalone)').matches === true` o `window.navigator.standalone === true`.
- `install()` (async): si no hay evento guardado, no hace nada y devuelve `null`. Si lo hay, llama a
  `event.prompt()`, espera `event.userChoice` y devuelve su `outcome` (`'accepted'` | `'dismissed'`).
  Tras usarlo, olvida el evento y pone `canInstall = false` (el navegador no deja reutilizarlo).
- Sin dependencias; JavaScript con hooks (`useState`, `useEffect`, `useRef`, `useCallback`).

## Tarjeta en `SettingsScreen`

Nueva `Card` con `h2` "Instalar", colocada **la primera** (antes de "Animaciones", y después del aviso de
guardado si aparece):

- Si `installed`: texto "Logui ya está instalada en este dispositivo."
- Si no y `canInstall`: texto "Añádela a tu pantalla de inicio para abrirla como una app, también sin conexión."
  y un `Button` `variant="primary"` "Instalar la app" que llama a `install()`. Si el resultado es `'accepted'`,
  mostrar "¡Instalada!" con `role="status"`.
- Si no y no `canInstall`: texto pequeño (`--fs-s`, `--c-cocoa-soft`):
  "Para instalarla, usa la opción «Añadir a pantalla de inicio» o «Instalar» del menú de tu navegador."

## Reglas

- Textos en español. Colores y tamaños solo con variables de `src/styles/tokens.css`.
- No cambies el resto de la pantalla.

## Comprobación

```
npm test
npm run build
```

Ambos deben pasar. Claude lo probará en el navegador simulando el evento `beforeinstallprompt`.
