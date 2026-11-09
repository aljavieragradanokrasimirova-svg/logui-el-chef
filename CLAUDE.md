# Logui el chef — notas para Claude

Proyecto personal (React + Vite, JavaScript, Windows). Lee `SPEC.md`, `DESIGN.md` y `AGENTS.md`.

Reparto del trabajo:
- **Claude:** arquitectura, sistema de diseño, ilustraciones SVG, componentes base y revisión de diffs.
- **OpenCode + DeepSeek (`opencode/deepseek-v4.1-flash-free`):** tareas repetitivas o bien acotadas, descritas en `tareas/NNN-*.md`
  con criterios de aceptación y, cuando sea posible, tests escritos de antemano.

Flujo: una rama por tarea (`tarea/NNN-nombre`), OpenCode implementa, Claude revisa el diff y ejecuta `npm test` y `npm run build`, y se hace merge a `master`.

Publicación: cada push a `master` en GitHub (`aljavieragradanokrasimirova-svg/logui-el-chef`) ejecuta los tests y
despliega en https://aljavieragradanokrasimirova-svg.github.io/logui-el-chef/ (`.github/workflows/deploy.yml`).
Los commits usan el correo noreply de GitHub (configurado en el `.git/config` del proyecto), no el del instituto.
