# Tarea 014 — Logui en los estados vacíos

Rama: `tarea/014-logui-estados-vacios`

## Objetivo

Que Logui (la mascota, `src/mascot/Logui.jsx`) acompañe los estados vacíos de tres pantallas, en postura
pensativa, con una pequeña entrada animada.

## Archivos

- **Modificar solo:** `src/screens/ListsScreen.jsx`, `src/screens/HistoryScreen.jsx`, `src/screens/RecipesScreen.jsx`
  y `src/styles/global.css` (solo para añadir la animación indicada abajo, al final del archivo).
- **No toques** `src/mascot/` ni ningún otro archivo.

## Logui

`import Logui from '../mascot/Logui.jsx'` — export default. Props: `mood` (`'idle' | 'wave' | 'celebrate' | 'think'`)
y `size` (ancho en px). Es decorativo (no necesita `title` aquí).

## Cambios

1. `ListsScreen` (sin listas activas): sustituir `<CategoryIcon categoryId="otros" size={72} />` por
   `<Logui mood="think" size={110} />`. Quitar el import de `CategoryIcon` si deja de usarse.
2. `HistoryScreen` (sin archivadas): añadir `<Logui mood="idle" size={110} />` antes del párrafo.
3. `RecipesScreen`:
   - Libro vacío: sustituir `<Icon icon="pot" size={72} />` por `<Logui mood="think" size={110} />`
     (mantén el import de `Icon` solo si se sigue usando en el archivo).
   - Sin resultados para la etiqueta: añadir `<Logui mood="think" size={90} />` antes del párrafo.
4. Entrada animada: en `src/styles/global.css`, al final, añade
   ```css
   .empty > .logui { animation: empty-pop var(--dur-med) var(--ease-bounce); }
   @keyframes empty-pop { from { transform: scale(.85) translateY(8px); opacity: 0; } }
   ```
   (con «reducir animaciones», `--dur-med` vale 0 y no se ve la animación; no hace falta nada más).

## Reglas

- No cambies textos, lógica ni estilos existentes; solo lo indicado.
- Sin dependencias nuevas.

## Comprobación

```
npm test
npm run build
```

Ambos deben pasar.
