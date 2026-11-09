import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { precacheList, shortHash, renderServiceWorker } from './src/pwa/precache.js'

/** Lista los archivos de una carpeta (recursivo), con rutas relativas a ella. */
function listFiles(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    return entry.isDirectory() ? listFiles(full, base) : [relative(base, full)]
  })
}

/**
 * Genera dist/sw.js en el build a partir de src/pwa/sw-template.js, con la lista de todo lo que hay que
 * precachear (bundle + public/) y una versión que cambia cuando cambia algún archivo.
 */
function serviceWorker() {
  let publicDir = ''
  return {
    name: 'logui-service-worker',
    apply: 'build',
    configResolved(config) {
      publicDir = config.publicDir
    },
    generateBundle(_options, bundle) {
      const files = precacheList([...Object.keys(bundle), ...(publicDir ? listFiles(publicDir) : [])])
      const fingerprint = Object.values(bundle)
        .map((chunk) => `${chunk.fileName}:${chunk.type === 'chunk' ? chunk.code.length : chunk.source.length}`)
        .sort()
        .join('|')
      const template = readFileSync(new URL('./src/pwa/sw-template.js', import.meta.url), 'utf8')
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: renderServiceWorker(template, files, shortHash(template + fingerprint + files.join("|"))),
      })
    },
  }
}

export default defineConfig({
  // Rutas relativas: la app funciona servida desde cualquier carpeta (p. ej. GitHub Pages).
  base: './',
  plugins: [react(), serviceWorker()],
  test: { environment: 'node' },
})
