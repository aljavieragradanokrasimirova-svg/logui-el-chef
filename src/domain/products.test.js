import { describe, it, expect } from 'vitest'
import { MEMORY_LIMIT, rememberProduct, forgetProduct, suggestProducts, recentProducts } from './products.js'

const T1 = '2026-11-01T10:00:00.000Z'
const T2 = '2026-11-02T10:00:00.000Z'
const T3 = '2026-11-03T10:00:00.000Z'
const T4 = '2026-11-04T10:00:00.000Z'

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const v of Object.values(value)) deepFreeze(v)
  }
  return value
}

const entry = (name, lastUsed, categoryId = 'otros', unit = 'ud') => ({ name, categoryId, unit, lastUsed })

describe('rememberProduct', () => {
  it('guarda con clave normalizada y nombre limpio', () => {
    const memory = deepFreeze({})
    const r = rememberProduct(memory, { name: '  Plátano   macho ', categoryId: 'frutas', unit: 'kg' }, { now: T1 })
    expect(r).toEqual({ 'platano macho': entry('Plátano macho', T1, 'frutas', 'kg') })
    expect(memory).toEqual({})
  })

  it('el último uso sustituye la entrada anterior', () => {
    const memory = deepFreeze({ leche: entry('Leche', T1, 'lacteos', 'l') })
    const r = rememberProduct(memory, { name: 'LECHE', categoryId: 'lacteos', unit: 'paquete' }, { now: T2 })
    expect(r).toEqual({ leche: entry('LECHE', T2, 'lacteos', 'paquete') })
  })

  it('corrige categoría y unidad no válidas', () => {
    const r = rememberProduct({}, { name: 'Cosa', categoryId: 'nada', unit: 'saco' }, { now: T1 })
    expect(r.cosa).toEqual(entry('Cosa', T1, 'otros', 'ud'))
  })

  it('ignora nombres vacíos', () => {
    const memory = deepFreeze({})
    expect(rememberProduct(memory, { name: '   ' }, { now: T1 })).toBe(memory)
  })

  it('no supera el límite y borra lo más antiguo', () => {
    const memory = deepFreeze({ a: entry('A', T2), b: entry('B', T1), c: entry('C', T3) })
    const r = rememberProduct(memory, { name: 'D' }, { now: T4, limit: 3 })
    expect(Object.keys(r).sort()).toEqual(['a', 'c', 'd'])
  })

  it('la recién guardada se conserva aunque su fecha sea antigua', () => {
    const memory = deepFreeze({ a: entry('A', T3), b: entry('B', T4) })
    const r = rememberProduct(memory, { name: 'C' }, { now: T1, limit: 2 })
    expect(Object.keys(r).sort()).toEqual(['b', 'c'])
  })

  it('el límite por defecto es 500', () => {
    expect(MEMORY_LIMIT).toBe(500)
  })
})

describe('forgetProduct', () => {
  it('quita por nombre normalizado', () => {
    const memory = deepFreeze({ leche: entry('Leche', T1), pan: entry('Pan', T1) })
    expect(forgetProduct(memory, ' LÉCHE ')).toEqual({ pan: entry('Pan', T1) })
  })

  it('devuelve la misma memoria si no existe', () => {
    const memory = deepFreeze({ pan: entry('Pan', T1) })
    expect(forgetProduct(memory, 'Leche')).toBe(memory)
  })
})

describe('suggestProducts', () => {
  const catalog = deepFreeze([
    { name: 'Leche', categoryId: 'lacteos', unit: 'l' },
    { name: 'Lechuga', categoryId: 'frutas', unit: 'ud' },
    { name: 'Lejía', categoryId: 'limpieza', unit: 'l' },
    { name: 'Cebolla', categoryId: 'frutas', unit: 'kg' },
    { name: 'Leche condensada', categoryId: 'lacteos', unit: 'bote' },
    { name: 'Café con leche', categoryId: 'bebidas', unit: 'l' },
    { name: 'Lentejas', categoryId: 'despensa', unit: 'kg' },
  ])

  const names = (suggestions) => suggestions.map((s) => s.name)

  it('vacío si la búsqueda está vacía', () => {
    expect(suggestProducts('   ', { catalog })).toEqual([])
    expect(suggestProducts('', { catalog })).toEqual([])
  })

  it('prefijo antes que inclusión; catálogo en orden alfabético', () => {
    expect(names(suggestProducts('le', { catalog }))).toEqual([
      'Leche',
      'Leche condensada',
      'Lechuga',
      'Lejía',
      'Lentejas',
      'Café con leche',
    ])
  })

  it('ignora tildes y mayúsculas, e incluye datos y origen', () => {
    expect(suggestProducts('LEJIA', { catalog })).toEqual([
      { name: 'Lejía', categoryId: 'limpieza', unit: 'l', source: 'catalog' },
    ])
  })

  it('como mucho limit sugerencias (6 por defecto)', () => {
    expect(suggestProducts('e', { catalog })).toHaveLength(6)
    expect(suggestProducts('le', { catalog, limit: 2 })).toHaveLength(2)
  })

  it('la memoria va primero, por uso reciente, y tapa al catálogo', () => {
    const memory = deepFreeze({
      'leche sin lactosa': entry('Leche sin lactosa', T1, 'lacteos', 'l'),
      leche: entry('Leche', T3, 'lacteos', 'paquete'),
      'pan de leche': entry('Pan de leche', T2, 'panaderia', 'paquete'),
    })
    const r = suggestProducts('lech', { memory, catalog })
    expect(r).toEqual([
      { name: 'Leche', categoryId: 'lacteos', unit: 'paquete', source: 'memory' },
      { name: 'Leche sin lactosa', categoryId: 'lacteos', unit: 'l', source: 'memory' },
      { name: 'Leche condensada', categoryId: 'lacteos', unit: 'bote', source: 'catalog' },
      { name: 'Lechuga', categoryId: 'frutas', unit: 'ud', source: 'catalog' },
      { name: 'Pan de leche', categoryId: 'panaderia', unit: 'paquete', source: 'memory' },
      { name: 'Café con leche', categoryId: 'bebidas', unit: 'l', source: 'catalog' },
    ])
  })

  it('descarta los nombres excluidos', () => {
    const memory = deepFreeze({ lechuga: entry('Lechuga', T1, 'frutas', 'ud') })
    expect(names(suggestProducts('lech', { memory, catalog, exclude: ['LECHE', ' lechuga'] }))).toEqual([
      'Leche condensada',
      'Café con leche',
    ])
  })

  it('usa el catálogo real por defecto', () => {
    const r = suggestProducts('platan')
    expect(r[0]).toEqual({ name: 'Plátanos', categoryId: 'frutas', unit: 'kg', source: 'catalog' })
  })
})

describe('recentProducts', () => {
  const memory = {
    leche: { name: 'Leche', categoryId: 'lacteos', unit: 'l', lastUsed: '2026-01-03' },
    pan: { name: 'Pan', categoryId: 'panaderia', unit: 'ud', lastUsed: '2026-01-05' },
    huevos: { name: 'Huevos', categoryId: 'lacteos', unit: 'ud', lastUsed: '2026-01-01' },
  }

  it('lo más reciente primero, sin lo que ya está en la lista', () => {
    expect(recentProducts(memory, { exclude: ['  PAN '] }).map((p) => p.name)).toEqual(['Leche', 'Huevos'])
    expect(recentProducts(memory, { limit: 1 })).toEqual([{ name: 'Pan', categoryId: 'panaderia', unit: 'ud', source: 'memory' }])
    expect(recentProducts()).toEqual([])
  })
})
