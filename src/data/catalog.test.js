import { describe, it, expect } from 'vitest'
import { CATALOG } from './catalog.js'
import { CATEGORY_IDS } from './categories.js'
import { UNIT_IDS } from './units.js'
import { normalizeName } from '../domain/normalize.js'

const countBy = (categoryId) => CATALOG.filter((p) => p.categoryId === categoryId).length

describe('CATALOG', () => {
  it('tiene entre 90 y 120 productos', () => {
    expect(Array.isArray(CATALOG)).toBe(true)
    expect(CATALOG.length).toBeGreaterThanOrEqual(90)
    expect(CATALOG.length).toBeLessThanOrEqual(120)
  })

  it('cada producto tiene solo name, categoryId y unit válidos', () => {
    for (const p of CATALOG) {
      expect(Object.keys(p).sort(), JSON.stringify(p)).toEqual(['categoryId', 'name', 'unit'])
      expect(CATEGORY_IDS, p.name).toContain(p.categoryId)
      expect(UNIT_IDS, p.name).toContain(p.unit)
    }
  })

  it('los nombres están limpios y empiezan por mayúscula', () => {
    for (const p of CATALOG) {
      expect(typeof p.name).toBe('string')
      expect(p.name, p.name).toBe(p.name.trim())
      expect(p.name, p.name).not.toMatch(/\s{2,}/)
      expect(p.name.length, p.name).toBeGreaterThan(0)
      expect(p.name.length, p.name).toBeLessThanOrEqual(30)
      expect(p.name[0], p.name).toBe(p.name[0].toLocaleUpperCase('es'))
    }
  })

  it('no hay nombres duplicados (normalizados)', () => {
    const seen = new Map()
    for (const p of CATALOG) {
      const key = normalizeName(p.name)
      expect(seen.has(key), `"${p.name}" repite "${seen.get(key)}"`).toBe(false)
      seen.set(key, p.name)
    }
  })

  it('cubre todas las categorías con un mínimo de productos', () => {
    const minimums = {
      frutas: 18,
      carne: 10,
      lacteos: 10,
      panaderia: 5,
      despensa: 18,
      congelados: 5,
      bebidas: 8,
      limpieza: 10,
      otros: 2,
    }
    expect(Object.keys(minimums).sort()).toEqual([...CATEGORY_IDS].sort())
    for (const [id, min] of Object.entries(minimums)) {
      expect(countBy(id), id).toBeGreaterThanOrEqual(min)
    }
  })

  it('está ordenado por categoría en orden de pasillo', () => {
    const indexes = CATALOG.map((p) => CATEGORY_IDS.indexOf(p.categoryId))
    const sorted = [...indexes].sort((a, b) => a - b)
    expect(indexes).toEqual(sorted)
  })

  it('está congelado (array y productos)', () => {
    expect(Object.isFrozen(CATALOG)).toBe(true)
    for (const p of CATALOG) expect(Object.isFrozen(p), p.name).toBe(true)
  })

  it.each([
    ['Plátanos', 'frutas', 'kg'],
    ['Tomates', 'frutas', 'kg'],
    ['Limones', 'frutas', 'ud'],
    ['Pechuga de pollo', 'carne', 'bandeja'],
    ['Leche', 'lacteos', 'l'],
    ['Huevos', 'lacteos', 'ud'],
    ['Yogures naturales', 'lacteos', 'paquete'],
    ['Pan de molde', 'panaderia', 'paquete'],
    ['Arroz', 'despensa', 'kg'],
    ['Aceite de oliva', 'despensa', 'l'],
    ['Atún en lata', 'despensa', 'paquete'],
    ['Guisantes congelados', 'congelados', 'paquete'],
    ['Agua', 'bebidas', 'l'],
    ['Lejía', 'limpieza', 'l'],
    ['Papel higiénico', 'limpieza', 'paquete'],
  ])('incluye "%s" en %s con unidad %s', (name, categoryId, unit) => {
    expect(CATALOG).toContainEqual({ name, categoryId, unit })
  })
})
