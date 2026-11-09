/* Service worker de Logui (plantilla). El build rellena la lista de archivos y la versión y lo publica como sw.js.
 *
 * - install: guarda en caché todos los archivos de la app (rutas relativas a la ubicación de sw.js).
 * - activate: borra las cachés de versiones anteriores y toma el control.
 * - fetch: páginas → red primero y, sin conexión, la página guardada; resto de archivos propios → caché primero.
 *   (ignoreVary: algunos servidores mandan «Vary: Origin» y los <script type="module"> llevan cabecera Origin;
 *   sin él la copia guardada no coincidiría y sin conexión la app no arrancaría).
 * Los datos del usuario viven en localStorage, así que la app funciona completa sin conexión.
 */
const PRECACHE = __PRECACHE__
const VERSION = __VERSION__
const CACHE = `logui-${VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('logui-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('./', copy))
          return response
        })
        .catch(() => caches.match('./', { ignoreSearch: true, ignoreVary: true })),
    )
    return
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true, ignoreVary: true }).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})
