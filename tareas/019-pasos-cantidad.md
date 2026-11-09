# Tarea 019 — Pasos del botón − / + de cantidad

Rama: `tarea/019-pasos-cantidad`

## Objetivo

La nueva interfaz (opción B) sustituye el campo de cantidad por un control con botones − y +.
Esta tarea es la lógica pura: dada una cantidad y su unidad, cuál es la siguiente al pulsar + o −.

## Archivos

- **Crear:** `src/domain/quantity.js`
- **No tocar:** `src/domain/quantity.test.js` (test de aceptación, ya escrito). Ningún otro archivo.

## API

### `stepQuantity(quantity, unit, direction) → number | null`

- `quantity`: número > 0 o `null` (sin cantidad).
- `unit`: id de `src/data/units.js`. Una unidad desconocida se trata como `'ud'`.
- `direction`: `1` (botón +) o `-1` (botón −).

**Paso según la unidad**

| Unidad | Paso | Valor al pulsar + sin cantidad |
|---|---|---|
| `ud`, `paquete`, `bote`, `bandeja` | 1 | 1 |
| `kg`, `l` | 0,25 | 1 |
| `g`, `ml` | 50 si el valor es menor que 500; 100 a partir de 500 (ver abajo) | 100 |

**Reglas**

1. Sin cantidad (`null`): `+` devuelve el valor inicial de la tabla; `−` devuelve `null`.
2. **Subir** (`+1`): el siguiente múltiplo del paso **estrictamente mayor** que la cantidad.
   Para `g`/`ml` el paso es 50 si la cantidad es `< 500` y 100 si es `>= 500`.
   Ejemplos: `0.33 kg → 0.5`, `1 kg → 1.25`, `480 g → 500`, `500 g → 600`, `520 g → 600`, `2 ud → 3`, `1.5 ud → 2`.
3. **Bajar** (`−1`): el anterior múltiplo del paso **estrictamente menor** que la cantidad.
   Para `g`/`ml` el paso es 50 si la cantidad es `<= 500` y 100 si es `> 500`.
   Ejemplos: `0.33 kg → 0.25`, `600 g → 500`, `550 g → 500`, `500 g → 450`, `2 ud → 1`, `1.5 ud → 1`.
4. Si al bajar el resultado es `<= 0`, devuelve `null` (se quita la cantidad). Ej.: `1 ud → null`, `0.25 kg → null`, `50 g → null`, `0.1 kg → null`.
5. Resultado redondeado a 2 decimales (`Math.round(x * 100) / 100`). Cuidado con los decimales en coma flotante:
   `0.75` con paso `0.25` debe dar `1` al subir y `0.5` al bajar (compara con una pequeña tolerancia, p. ej. `1e-9`).

## Comprobación

```
npm test
```

Debe pasar `src/domain/quantity.test.js` sin modificarlo, y el resto de tests.
