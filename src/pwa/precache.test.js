import { describe, it, expect } from 'vitest'
import { precacheList, shortHash, renderServiceWorker } from './precache.js'

describe('precacheList', () => {
  it('normaliza, ordena, quita repetidos y lo que sobra, y empieza por ./', () => {
    expect(
      precacheList([
        'index.html',
        'assets\\index-abc.js',
        './assets/index-abc.js',
        'assets/index-abc.js.map',
        'sw.js',
        'icon-192.png',
        '/manifest.webmanifest',
        '.vite/manifest.json',
        'assets/nunito-latin-600-normal-x1.woff2',
        'assets/nunito-latin-600-normal-x2.woff',
        'assets/nunito-cyrillic-600-normal-x3.woff2',
        'assets/baloo-2-devanagari-800-normal-x4.woff2',
      ]),
    ).toEqual(['./', 'assets/index-abc.js', 'assets/nunito-latin-600-normal-x1.woff2', 'icon-192.png', 'index.html', 'manifest.webmanifest'])
  })
})

describe('shortHash', () => {
  it('es estable y cambia con el contenido', () => {
    expect(shortHash('hola')).toBe(shortHash('hola'))
    expect(shortHash('hola')).not.toBe(shortHash('hola!'))
    expect(shortHash('')).toMatch(/^[0-9a-f]{8}$/)
  })
})

describe('renderServiceWorker', () => {
  it('sustituye la lista y la versión', () => {
    const out = renderServiceWorker('const A = __PRECACHE__; const V = __VERSION__', ['./', 'a.js'], 'abc')
    expect(out).toBe('const A = ["./","a.js"]; const V = "abc"')
  })

  it('exige los marcadores', () => {
    expect(() => renderServiceWorker('nada', [], 'v')).toThrow()
  })
})
