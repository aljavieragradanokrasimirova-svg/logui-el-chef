# Reglas para agentes de código (OpenCode)

Antes de nada lee `SPEC.md` y `DESIGN.md`. La tarea concreta está en `tareas/`.

- JavaScript (no TypeScript). React con componentes de función y hooks.
- Modifica **solo** los archivos que indique la tarea. No borres ni renombres archivos.
- **No añadas dependencias** ni cambies `package.json`.
- Textos visibles en **español**.
- La lógica pura va en `src/domain/` sin importar React, con tests de Vitest al lado (`*.test.js`).
- Colores, radios y sombras: **solo** con las variables de `src/styles/tokens.css`.
- Antes de terminar ejecuta `npm test` y asegúrate de que pasa.
- Termina con un resumen corto: archivos tocados y resultado de los tests.
