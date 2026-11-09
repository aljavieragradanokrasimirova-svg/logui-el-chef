import { describe, it, expect } from 'vitest'
import {
  toQuantity,
  createList,
  renameList,
  archiveList,
  reuseList,
  addItem,
  updateItem,
  removeItem,
  toggleItem,
  listProgress,
  isComplete,
  groupByCategory,
} from './lists.js'

const T1 = '2026-11-09T10:00:00.000Z'
const T2 = '2026-11-09T11:00:00.000Z'
const T3 = '2026-11-09T12:00:00.000Z'

function idMaker(prefix = 'id') {
  let n = 0
  return () => `${prefix}${++n}`
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const v of Object.values(value)) deepFreeze(v)
  }
  return value
}

function item(id, overrides = {}) {
  return {
    id,
    name: id,
    quantity: null,
    unit: 'ud',
    categoryId: 'otros',
    checked: false,
    checkedAt: null,
    ...overrides,
  }
}

function list(items = [], overrides = {}) {
  return deepFreeze({ id: 'L', name: 'Súper', createdAt: T1, archivedAt: null, items, ...overrides })
}

const archived = () => list([item('a')], { archivedAt: T2 })

describe('toQuantity', () => {
  it.each([
    [null, null],
    [undefined, null],
    ['', null],
    ['   ', null],
    [0, null],
    [-2, null],
    [NaN, null],
    [Infinity, null],
    ['abc', null],
    ['2kg', null],
    [{}, null],
    [3, 3],
    ['3', 3],
    [' 2 ', 2],
    ['1,5', 1.5],
    ['0.25', 0.25],
    [1.236, 1.24],
    ['0,333', 0.33],
  ])('toQuantity(%j) → %j', (input, expected) => {
    expect(toQuantity(input)).toBe(expected)
  })
})

describe('createList', () => {
  it('crea una lista vacía con id y fecha inyectados', () => {
    expect(createList('  Compra   del sábado ', { makeId: () => 'x1', now: T1 })).toEqual({
      id: 'x1',
      name: 'Compra del sábado',
      createdAt: T1,
      archivedAt: null,
      items: [],
    })
  })

  it('usa "Nueva lista" si el nombre está vacío', () => {
    expect(createList('   ', { makeId: () => 'x', now: T1 }).name).toBe('Nueva lista')
    expect(createList(undefined, { makeId: () => 'x', now: T1 }).name).toBe('Nueva lista')
  })
})

describe('renameList', () => {
  it('cambia el nombre limpio sin tocar el resto', () => {
    const l = list([item('a')])
    const r = renameList(l, '  Fiesta  ')
    expect(r).toEqual({ ...l, name: 'Fiesta' })
    expect(l.name).toBe('Súper')
  })

  it('no acepta nombres vacíos', () => {
    expect(() => renameList(list(), '  ')).toThrow('El nombre no puede estar vacío')
  })

  it('no edita listas archivadas', () => {
    expect(() => renameList(archived(), 'Otra')).toThrow('La lista está archivada')
  })
})

describe('archiveList', () => {
  it('guarda la fecha de archivo', () => {
    const l = list([item('a')])
    expect(archiveList(l, { now: T2 })).toEqual({ ...l, archivedAt: T2 })
  })

  it('no archiva dos veces', () => {
    expect(() => archiveList(archived(), { now: T3 })).toThrow('La lista está archivada')
  })
})

describe('reuseList', () => {
  it('crea una lista nueva con copias sin marcar', () => {
    const l = list(
      [
        item('a', { name: 'Leche', quantity: 2, unit: 'l', categoryId: 'lacteos', checked: true, checkedAt: T2 }),
        item('b', { name: 'Pan', categoryId: 'panaderia' }),
      ],
      { archivedAt: T2 },
    )
    expect(reuseList(l, { makeId: idMaker('n'), now: T3 })).toEqual({
      id: 'n1',
      name: 'Súper',
      createdAt: T3,
      archivedAt: null,
      items: [
        { id: 'n2', name: 'Leche', quantity: 2, unit: 'l', categoryId: 'lacteos', checked: false, checkedAt: null },
        { id: 'n3', name: 'Pan', quantity: null, unit: 'ud', categoryId: 'panaderia', checked: false, checkedAt: null },
      ],
    })
  })
})

describe('addItem', () => {
  it('añade al final con valores normalizados', () => {
    const l = list([item('a')])
    const r = addItem(l, { name: '  Tomates  cherry ', quantity: '0,5', unit: 'kg', categoryId: 'frutas' }, { makeId: () => 'b' })
    expect(r.items).toEqual([
      item('a'),
      { id: 'b', name: 'Tomates cherry', quantity: 0.5, unit: 'kg', categoryId: 'frutas', checked: false, checkedAt: null },
    ])
    expect(l.items).toHaveLength(1)
  })

  it('usa unidad y categoría por defecto si faltan o no son válidas', () => {
    const r1 = addItem(list(), { name: 'Cosa' }, { makeId: () => 'b' })
    expect(r1.items[0]).toMatchObject({ quantity: null, unit: 'ud', categoryId: 'otros' })
    const r2 = addItem(list(), { name: 'Cosa', unit: 'docena', categoryId: 'juguetes' }, { makeId: () => 'b' })
    expect(r2.items[0]).toMatchObject({ unit: 'ud', categoryId: 'otros' })
  })

  it('no acepta nombres vacíos', () => {
    expect(() => addItem(list(), { name: '  ' }, { makeId: () => 'b' })).toThrow('El nombre no puede estar vacío')
  })

  it('no añade a listas archivadas', () => {
    expect(() => addItem(archived(), { name: 'Pan' }, { makeId: () => 'b' })).toThrow('La lista está archivada')
  })
})

describe('updateItem', () => {
  const l = () => list([item('a'), item('b', { name: 'Arroz', quantity: 1, unit: 'kg', categoryId: 'despensa' }), item('c')])

  it('aplica solo los cambios permitidos y conserva la posición', () => {
    const r = updateItem(l(), 'b', { name: ' Arroz bomba ', quantity: '2', id: 'zzz', checked: true, extra: 1 })
    expect(r.items.map((i) => i.id)).toEqual(['a', 'b', 'c'])
    expect(r.items[1]).toEqual({ id: 'b', name: 'Arroz bomba', quantity: 2, unit: 'kg', categoryId: 'despensa', checked: false, checkedAt: null })
  })

  it('normaliza cantidad, unidad y categoría', () => {
    const r = updateItem(l(), 'b', { quantity: '', unit: 'saco', categoryId: 'nada' })
    expect(r.items[1]).toMatchObject({ quantity: null, unit: 'ud', categoryId: 'otros', name: 'Arroz' })
  })

  it('no acepta nombres vacíos', () => {
    expect(() => updateItem(l(), 'b', { name: '' })).toThrow('El nombre no puede estar vacío')
  })

  it('devuelve la misma lista si el producto no existe', () => {
    const original = l()
    expect(updateItem(original, 'nope', { name: 'X' })).toBe(original)
  })

  it('no edita listas archivadas', () => {
    expect(() => updateItem(archived(), 'a', { name: 'X' })).toThrow('La lista está archivada')
  })
})

describe('removeItem', () => {
  it('quita el producto', () => {
    expect(removeItem(list([item('a'), item('b')]), 'a').items).toEqual([item('b')])
  })

  it('devuelve la misma lista si el producto no existe', () => {
    const original = list([item('a')])
    expect(removeItem(original, 'nope')).toBe(original)
  })

  it('no edita listas archivadas', () => {
    expect(() => removeItem(archived(), 'a')).toThrow('La lista está archivada')
  })
})

describe('toggleItem', () => {
  it('marca y desmarca con fecha', () => {
    const l = list([item('a'), item('b')])
    const marked = toggleItem(l, 'a', { now: T2 })
    expect(marked.items[0]).toEqual(item('a', { checked: true, checkedAt: T2 }))
    expect(marked.items[1]).toBe(l.items[1])
    const unmarked = toggleItem(deepFreeze(marked), 'a', { now: T3 })
    expect(unmarked.items[0]).toEqual(item('a'))
  })

  it('devuelve la misma lista si el producto no existe', () => {
    const original = list([item('a')])
    expect(toggleItem(original, 'nope', { now: T2 })).toBe(original)
  })

  it('no edita listas archivadas', () => {
    expect(() => toggleItem(archived(), 'a', { now: T3 })).toThrow('La lista está archivada')
  })
})

describe('listProgress e isComplete', () => {
  it('cuenta comprados y total', () => {
    const l = list([item('a', { checked: true, checkedAt: T1 }), item('b'), item('c')])
    expect(listProgress(l)).toEqual({ checked: 1, total: 3 })
    expect(isComplete(l)).toBe(false)
  })

  it('una lista vacía no está completa', () => {
    expect(listProgress(list())).toEqual({ checked: 0, total: 0 })
    expect(isComplete(list())).toBe(false)
  })

  it('completa cuando todo está comprado', () => {
    expect(isComplete(list([item('a', { checked: true, checkedAt: T1 })]))).toBe(true)
  })
})

describe('groupByCategory', () => {
  it('agrupa en orden de pasillo y omite categorías vacías', () => {
    const items = deepFreeze([
      item('limpia', { categoryId: 'limpieza' }),
      item('manzana', { categoryId: 'frutas' }),
      item('rara', { categoryId: 'inventada' }),
      item('leche', { categoryId: 'lacteos' }),
      item('pera', { categoryId: 'frutas' }),
    ])
    const groups = groupByCategory(items)
    expect(groups.map((g) => g.categoryId)).toEqual(['frutas', 'lacteos', 'limpieza', 'otros'])
    expect(groups[0].items.map((i) => i.id)).toEqual(['manzana', 'pera'])
    expect(groups[3].items.map((i) => i.id)).toEqual(['rara'])
    expect(groups[0].items[0]).toBe(items[1])
  })

  it('pendientes primero en orden original; comprados al final por checkedAt', () => {
    const items = deepFreeze([
      item('a', { categoryId: 'frutas', checked: true, checkedAt: T3 }),
      item('b', { categoryId: 'frutas' }),
      item('c', { categoryId: 'frutas', checked: true, checkedAt: T1 }),
      item('d', { categoryId: 'frutas' }),
      item('e', { categoryId: 'frutas', checked: true, checkedAt: T1 }),
      item('f', { categoryId: 'frutas', checked: true, checkedAt: T2 }),
    ])
    expect(groupByCategory(items)[0].items.map((i) => i.id)).toEqual(['b', 'd', 'c', 'e', 'f', 'a'])
  })

  it('sin productos devuelve un array vacío', () => {
    expect(groupByCategory([])).toEqual([])
  })
})
