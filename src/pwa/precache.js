/**
 * Utilidades puras para generar el service worker en el build (las usa el plugin de vite.config.js).
 * Sin dependencias: corre en Node durante `vite build` y se prueba con Vitest.
 */

/** Archivos que no tiene sentido precachear. */
const SKIP = [
  /\.map$/,
  /(^|\/)sw\.js$/,
  /(^|\/)\.vite\//,
  /\.DS_Store$/,
  // Alfabetos de las fuentes que la app no usa (el navegador solo los pediría si hicieran falta)
  /-(cyrillic|cyrillic-ext|greek|greek-ext|vietnamese|devanagari)-\d+-normal-[^/]*\.woff2?$/,
  // .woff: los navegadores actuales usan .woff2
  /\.woff$/,
]

/**
 * Lista ordenada y sin repetidos de rutas relativas a precachear: todo lo que genera el build y lo que hay
 * en `public/`, más './' (la página de inicio). Usa '/' como separador aunque se construya en Windows.
 */
export function precacheList(files) {
  const clean = files
    .map((f) => f.replace(/\\/g, '/').replace(/^\.?\//, ''))
    .filter((f) => f && !SKIP.some((re) => re.test(f)))
  return ['./', ...[...new Set(clean)].sort()]
}

/** Hash corto y estable (FNV-1a de 32 bits) para versionar la caché según el contenido. */
export function shortHash(text) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

/**
 * Rellena la plantilla del service worker: sustituye `__PRECACHE__` por la lista (JSON)
 * y `__VERSION__` por la versión.
 */
export function renderServiceWorker(template, files, version) {
  if (!template.includes('__PRECACHE__') || !template.includes('__VERSION__')) {
    throw new Error('La plantilla del service worker no tiene __PRECACHE__ y __VERSION__')
  }
  return template.replaceAll('__PRECACHE__', JSON.stringify(files)).replaceAll('__VERSION__', JSON.stringify(version))
}
