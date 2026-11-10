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

Recetas desde una foto (`src/ai/`): el usuario pega su propia clave de API de Gemini en Ajustes; se guarda en
`localStorage` bajo `logui:ai`, separada del estado (`logui:v1`) para que NUNCA entre en las copias de seguridad.
Las llamadas salen directas del navegador (no hay servidor). El esquema, el prompt y la conversión a receta
(`schema.js`, `draft.js`) son comunes; cada proveedor solo implementa su llamada (`gemini.js`).
Proveedor: solo Gemini (tiene nivel gratuito; se quitaron Claude y GPT por ser de pago y no aportar). Va por `generateContent` y NO por la API
nueva «Interactions»: esa exige la cabecera `Api-Revision`, que Google bloquea en CORS (comprobado con un OPTIONS).
Además hay un modo manual sin claves (`manual.js`): se copian unas instrucciones, se usa la app de IA del móvil y se pega
la respuesta. Los modelos disponibles están en `providers.js`. Sin clave real no se puede probar de extremo a extremo: los tests
usan respuestas simuladas.
