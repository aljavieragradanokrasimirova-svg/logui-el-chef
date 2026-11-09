import { describe, it, expect } from 'vitest'
import {
  STORAGE_KEY,
  CORRUPT_KEY,
  emptyState,
  sanitizeState,
  loadState,
  saveState,
  exportBackup,
  parseBackup,
} from './storage.js'

const T1 = '2026-11-09T10:00:00.000Z'

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  }
}

const validState = () => ({
  version: 1,
  lists: [
    {
      id: 'L1',
      name: 'Súper',
      createdAt: T1,
      archivedAt: null,
      items: [
        { id: 'i1', name: 'Leche', quantity: 2, unit: 'l', categoryId: 'lacteos', checked: true, checkedAt: T1 },
        { id: 'i2', name: 'Pan', quantity: null, unit: 'ud', categoryId: 'panaderia', checked: false, checkedAt: null },
      ],
    },
  ],
  recipes: [
    {
      id: 'R1',
      name: 'Tortilla',
      iconId: 'pan',
      tags: ['cena'],
      servings: 4,
      ingredients: [{ id: 'g1', name: 'Huevos', quantity: 6, unit: 'ud', categoryId: 'lacteos' }],
      steps: ['Batir', 'Cuajar'],
    },
  ],
  productMemory: { leche: { name: 'Leche', categoryId: 'lacteos', unit: 'l', lastUsed: T1 } },
  settings: { reduceMotion: true },
})

describe('sanitizeState', () => {
  it('deja intacto un estado válido', () => {
    expect(sanitizeState(validState())).toEqual(validState())
  })

  it('rellena lo que falta', () => {
    expect(sanitizeState({ version: 1 })).toEqual(emptyState())
  })

  it('repara productos y descarta lo irrecuperable', () => {
    const raw = validState()
    raw.lists[0].items = [
      { id: 'a', name: ' Uvas ', quantity: -1, unit: 'saco', categoryId: 'x', checked: 'sí', checkedAt: T1 },
      { id: 'b', name: '' },
      { name: 'Sin id' },
      { id: 'a', name: 'Repetido' },
      null,
    ]
    raw.lists.push({ id: 'L1', name: 'Repetida', items: [] }, 'basura')
    const state = sanitizeState(raw)
    expect(state.lists).toHaveLength(1)
    expect(state.lists[0].items).toEqual([
      { id: 'a', name: 'Uvas', quantity: null, unit: 'ud', categoryId: 'otros', checked: false, checkedAt: null },
    ])
  })

  it('rechaza lo que no es un estado de Logui', () => {
    expect(() => sanitizeState(null)).toThrow('No es una copia de seguridad de Logui')
    expect(() => sanitizeState([])).toThrow('No es una copia de seguridad de Logui')
    expect(() => sanitizeState({ lists: [] })).toThrow('No es una copia de seguridad de Logui')
    expect(() => sanitizeState({ version: 2 })).toThrow('La copia es de una versión más nueva de Logui')
  })
})

describe('loadState y saveState', () => {
  it('sin datos devuelve el estado vacío', () => {
    expect(loadState(memoryStorage())).toEqual(emptyState())
    expect(loadState(null)).toEqual(emptyState())
  })

  it('guarda y vuelve a cargar', () => {
    const storage = memoryStorage()
    expect(saveState(validState(), storage)).toBe(true)
    expect(loadState(storage)).toEqual(validState())
  })

  it('aparta los datos dañados en vez de perderlos', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{roto' })
    expect(loadState(storage)).toEqual(emptyState())
    expect(storage.data.get(CORRUPT_KEY)).toBe('{roto')
  })

  it('no rompe si el navegador falla al leer o escribir', () => {
    const broken = {
      getItem() { throw new Error('denegado') },
      setItem() { throw new Error('QuotaExceededError') },
    }
    expect(loadState(broken)).toEqual(emptyState())
    expect(saveState(validState(), broken)).toBe(false)
  })
})

describe('copia de seguridad', () => {
  it('exporta e importa sin perder nada', () => {
    expect(parseBackup(exportBackup(validState()))).toEqual(validState())
  })

  it('da un mensaje claro si el archivo no vale', () => {
    expect(() => parseBackup('hola')).toThrow('El archivo no es una copia de seguridad de Logui')
    expect(() => parseBackup('{"foo":1}')).toThrow('El archivo no es una copia de seguridad de Logui')
    expect(() => parseBackup('{"version":7}')).toThrow('La copia es de una versión más nueva de Logui')
  })
})
