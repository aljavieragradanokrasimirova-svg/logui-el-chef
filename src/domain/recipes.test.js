import { describe, it, expect } from 'vitest'
import {
  ICON_IDS_RECIPE,
  DEFAULT_RECIPE_ICON,
  normalizeRecipe,
  scaleQuantity,
  scaleIngredients,
  addIngredientsToList,
  allTags,
  filterByTag,
} from './recipes.js'

const T1 = '2026-11-09T10:00:00.000Z'

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

const ing = (id, name, quantity, unit = 'ud', categoryId = 'otros') => ({ id, name, quantity, unit, categoryId })
const item = (id, name, quantity, unit = 'ud', extra = {}) => ({
  id,
  name,
  quantity,
  unit,
  categoryId: 'otros',
  checked: false,
  checkedAt: null,
  ...extra,
})
const list = (items, extra = {}) => deepFreeze({ id: 'L', name: 'Súper', createdAt: T1, archivedAt: null, items, ...extra })

describe('constantes', () => {
  it('iconos de receta', () => {
    expect(ICON_IDS_RECIPE).toEqual(['pot', 'pan', 'salad', 'cake', 'soup', 'pasta'])
    expect(DEFAULT_RECIPE_ICON).toBe('pot')
  })
})

describe('normalizeRecipe', () => {
  it('construye una receta completa y limpia', () => {
    const input = deepFreeze({
      name: '  Tortilla   de patatas ',
      iconId: 'pan',
      tags: [' Cena ', 'rápida', 'cena', '', 'RÁPIDA'],
      servings: '4',
      ingredients: [
        { name: ' Huevos ', quantity: '6', unit: 'ud', categoryId: 'lacteos' },
        { name: '   ', quantity: 1 },
        { id: 'keep', name: 'Patatas', quantity: '0,75', unit: 'kg', categoryId: 'frutas' },
        { name: 'Sal', quantity: '', unit: 'pizca', categoryId: 'nada' },
      ],
      steps: ['  Pelar  las patatas ', '', '  ', 'Cuajar'],
    })
    expect(normalizeRecipe(input, { makeId: idMaker('r') })).toEqual({
      id: 'r1',
      name: 'Tortilla de patatas',
      iconId: 'pan',
      tags: ['cena', 'rápida'],
      servings: 4,
      ingredients: [
        ing('r2', 'Huevos', 6, 'ud', 'lacteos'),
        ing('keep', 'Patatas', 0.75, 'kg', 'frutas'),
        ing('r3', 'Sal', null, 'ud', 'otros'),
      ],
      steps: ['Pelar las patatas', 'Cuajar'],
    })
  })

  it('conserva el id de la receta y rellena lo que falta', () => {
    expect(normalizeRecipe({ id: 'R9', name: 'Ensalada' }, { makeId: idMaker() })).toEqual({
      id: 'R9',
      name: 'Ensalada',
      iconId: 'pot',
      tags: [],
      servings: 2,
      ingredients: [],
      steps: [],
    })
  })

  it.each([
    [0, 2],
    [-3, 2],
    ['abc', 2],
    [2.6, 3],
    [0.2, 2],
    ['8', 8],
    [null, 2],
  ])('raciones %j → %j', (servings, expected) => {
    expect(normalizeRecipe({ name: 'X', servings }, { makeId: idMaker() }).servings).toBe(expected)
  })

  it('icono desconocido → pot', () => {
    expect(normalizeRecipe({ name: 'X', iconId: 'cohete' }, { makeId: idMaker() }).iconId).toBe('pot')
  })

  it('el nombre es obligatorio', () => {
    expect(() => normalizeRecipe({ name: '  ' }, { makeId: idMaker() })).toThrow('El nombre no puede estar vacío')
  })
})

describe('scaleQuantity', () => {
  it.each([
    [null, 'g', 2, null],
    [200, 'g', 1.5, 300],
    [0.75, 'kg', 2 / 3, 0.5],
    [1, 'l', 1 / 3, 0.33],
    [3, 'ud', 0.5, 2],
    [3, 'ud', 1 / 3, 1],
    [4, 'ud', 0.25, 1],
    [1, 'ud', 0.1, 1],
    [6, 'ud', 2, 12],
  ])('%j %s × %j → %j', (q, unit, factor, expected) => {
    expect(scaleQuantity(q, unit, factor)).toBe(expected)
  })
})

describe('scaleIngredients', () => {
  const recipe = deepFreeze({
    id: 'R',
    name: 'Tortilla',
    iconId: 'pan',
    tags: [],
    servings: 4,
    ingredients: [ing('a', 'Huevos', 6, 'ud'), ing('b', 'Patatas', 0.75, 'kg'), ing('c', 'Sal', null, 'ud')],
    steps: [],
  })

  it('escala por raciones', () => {
    expect(scaleIngredients(recipe, 2)).toEqual([
      ing('a', 'Huevos', 3, 'ud'),
      ing('b', 'Patatas', 0.38, 'kg'),
      ing('c', 'Sal', null, 'ud'),
    ])
    expect(scaleIngredients(recipe, 6).map((i) => i.quantity)).toEqual([9, 1.13, null])
  })

  it('raciones no válidas → las de la receta', () => {
    expect(scaleIngredients(recipe, 0)).toEqual(recipe.ingredients)
    expect(scaleIngredients(recipe, 'x')).toEqual(recipe.ingredients)
  })
})

describe('addIngredientsToList', () => {
  it('suma cantidades con mismo nombre normalizado y unidad', () => {
    const l = list([item('i1', 'Huevos', 2, 'ud'), item('i2', 'Leche', 1, 'l')])
    const r = addIngredientsToList(l, [ing('x', 'HUEVOS', 3, 'ud', 'lacteos')], { makeId: idMaker('n') })
    expect(r.items).toEqual([item('i1', 'Huevos', 5, 'ud'), item('i2', 'Leche', 1, 'l')])
  })

  it('unidad distinta o cantidad nula → línea separada', () => {
    const l = list([item('i1', 'Harina', 1, 'kg'), item('i2', 'Sal', null, 'ud')])
    const r = addIngredientsToList(
      l,
      [ing('x', 'Harina', 200, 'g', 'despensa'), ing('y', 'Sal', 1, 'ud', 'despensa'), ing('z', 'Harina', null, 'kg')],
      { makeId: idMaker('n') },
    )
    expect(r.items).toEqual([
      item('i1', 'Harina', 1, 'kg'),
      item('i2', 'Sal', null, 'ud'),
      { ...item('n1', 'Harina', 200, 'g'), categoryId: 'despensa' },
      { ...item('n2', 'Sal', 1, 'ud'), categoryId: 'despensa' },
      item('n3', 'Harina', null, 'kg'),
    ])
  })

  it('un producto comprado que recibe más vuelve a pendiente', () => {
    const l = list([item('i1', 'Tomates', 0.5, 'kg', { checked: true, checkedAt: T1 })])
    const r = addIngredientsToList(l, [ing('x', 'tomates', 0.25, 'kg')], { makeId: idMaker() })
    expect(r.items).toEqual([item('i1', 'Tomates', 0.75, 'kg')])
  })

  it('fusiona también ingredientes repetidos entre sí y redondea', () => {
    const r = addIngredientsToList(
      list([]),
      [ing('x', 'Ajo', 0.1, 'kg'), ing('y', 'Ajo', 0.2, 'kg')],
      { makeId: idMaker('n') },
    )
    expect(r.items).toEqual([item('n1', 'Ajo', 0.3, 'kg')])
  })

  it('se fusiona con la primera coincidencia válida', () => {
    const l = list([item('i1', 'Leche', null, 'l'), item('i2', 'Leche', 1, 'l'), item('i3', 'Leche', 2, 'l')])
    const r = addIngredientsToList(l, [ing('x', 'Leche', 1, 'l')], { makeId: idMaker() })
    expect(r.items.map((i) => i.quantity)).toEqual([null, 2, 2])
  })

  it('sin ingredientes devuelve la misma lista', () => {
    const l = list([item('i1', 'Pan', 1)])
    expect(addIngredientsToList(l, [], { makeId: idMaker() })).toBe(l)
  })

  it('no toca listas archivadas', () => {
    const l = list([], { archivedAt: T1 })
    expect(() => addIngredientsToList(l, [ing('x', 'Pan', 1)], { makeId: idMaker() })).toThrow('La lista está archivada')
  })
})

describe('etiquetas', () => {
  const recipes = deepFreeze([
    { id: 'a', name: 'A', tags: ['cena', 'rápida'] },
    { id: 'b', name: 'B', tags: ['postre'] },
    { id: 'c', name: 'C', tags: ['cena', 'árabe'] },
  ])

  it('allTags ordena y quita repetidas', () => {
    expect(allTags(recipes)).toEqual(['árabe', 'cena', 'postre', 'rápida'])
    expect(allTags([])).toEqual([])
  })

  it('filterByTag', () => {
    expect(filterByTag(recipes, 'cena').map((r) => r.id)).toEqual(['a', 'c'])
    expect(filterByTag(recipes, ' CENA ').map((r) => r.id)).toEqual(['a', 'c'])
    expect(filterByTag(recipes, '')).toEqual(recipes)
    expect(filterByTag(recipes, null)).toEqual(recipes)
    expect(filterByTag(recipes, 'nada')).toEqual([])
  })
})
