import { describe, it, expect } from 'vitest'
import { reducer, createActions, idsFrom } from './reducer.js'
import { emptyState } from './storage.js'

const T1 = '2026-11-09T10:00:00.000Z'

/** Ejecuta acciones con reloj y semillas fijos: s1, s2, s3… */
function run(actionsFn, initial = emptyState()) {
  let state = initial
  let n = 0
  const actions = createActions((a) => { state = reducer(state, a) }, { clock: () => T1, random: () => `s${++n}` })
  const results = actionsFn(actions, () => state)
  return { state, results }
}

describe('idsFrom', () => {
  it('genera seed, seed-2, seed-3…', () => {
    const make = idsFrom('x')
    expect([make(), make(), make()]).toEqual(['x', 'x-2', 'x-3'])
  })
})

describe('reducer', () => {
  it('crea una lista y devuelve su id', () => {
    const { state, results } = run((a) => a.createList('Súper'))
    expect(results).toBe('s1')
    expect(state.lists).toEqual([{ id: 's1', name: 'Súper', createdAt: T1, archivedAt: null, items: [] }])
  })

  it('añadir un producto lo recuerda para sugerencias', () => {
    const { state } = run((a) => {
      const id = a.createList('Súper')
      a.addItem(id, { name: 'Leche', quantity: 2, unit: 'l', categoryId: 'lacteos' })
    })
    expect(state.lists[0].items).toEqual([
      { id: 's2', name: 'Leche', quantity: 2, unit: 'l', categoryId: 'lacteos', checked: false, checkedAt: null },
    ])
    expect(state.productMemory).toEqual({ leche: { name: 'Leche', categoryId: 'lacteos', unit: 'l', lastUsed: T1 } })
  })

  it('editar un producto actualiza la memoria', () => {
    const { state } = run((a) => {
      const id = a.createList('Súper')
      const itemId = a.addItem(id, { name: 'Leche', unit: 'l', categoryId: 'lacteos' })
      a.updateItem(id, itemId, { unit: 'paquete' })
    })
    expect(state.productMemory.leche.unit).toBe('paquete')
  })

  it('marcar, archivar y reutilizar', () => {
    const { state, results } = run((a) => {
      const id = a.createList('Súper')
      const itemId = a.addItem(id, { name: 'Pan' })
      a.toggleItem(id, itemId)
      a.archiveList(id)
      return a.reuseList(id)
    })
    expect(state.lists).toHaveLength(2)
    expect(state.lists[0]).toMatchObject({ archivedAt: T1, items: [{ checked: true, checkedAt: T1 }] })
    expect(state.lists[1]).toMatchObject({ id: results, archivedAt: null, items: [{ id: `${results}-2`, name: 'Pan', checked: false }] })
  })

  it('las operaciones no válidas dejan el estado igual', () => {
    const { state } = run((a, get) => {
      const id = a.createList('Súper')
      a.archiveList(id)
      const before = get()
      a.addItem(id, { name: 'Pan' })
      a.renameList(id, 'Otra')
      a.addItem('no-existe', { name: 'Pan' })
      a.toggleItem(id, 'no-existe')
      a.renameList('no-existe', 'X')
      a.deleteList('no-existe')
      expect(get()).toBe(before)
    })
    expect(state.lists).toHaveLength(1)
  })

  it('un nombre vacío no rompe nada', () => {
    const { state } = run((a) => {
      const id = a.createList('Súper')
      a.addItem(id, { name: '   ' })
      a.renameList(id, '')
    })
    expect(state.lists[0]).toMatchObject({ name: 'Súper', items: [] })
  })

  it('borra listas, cambia ajustes, reemplaza y reinicia', () => {
    const { state: s1 } = run((a) => {
      const id = a.createList('Súper')
      a.deleteList(id)
      a.updateSettings({ reduceMotion: true })
    })
    expect(s1.lists).toEqual([])
    expect(s1.settings.reduceMotion).toBe(true)

    const imported = { ...emptyState(), lists: [{ id: 'L', name: 'Importada', createdAt: T1, archivedAt: null, items: [] }] }
    const { state: s2 } = run((a) => a.replaceState(imported))
    expect(s2.lists[0].name).toBe('Importada')

    const { state: s3 } = run((a) => a.resetState(), s2)
    expect(s3).toEqual(emptyState())
  })

  it('ignora acciones desconocidas', () => {
    const s = emptyState()
    expect(reducer(s, { type: 'nada' })).toBe(s)
  })
})

describe('recetas', () => {
  const tortilla = {
    name: 'Tortilla',
    servings: 4,
    tags: ['cena'],
    ingredients: [
      { name: 'Huevos', quantity: 6, unit: 'ud', categoryId: 'lacteos' },
      { name: 'Patatas', quantity: 0.75, unit: 'kg', categoryId: 'frutas' },
    ],
    steps: ['Batir'],
  }

  it('guarda una receta nueva, recuerda sus ingredientes y devuelve su id', () => {
    const { state, results } = run((a) => a.saveRecipe(tortilla))
    expect(results).toBe('s1')
    expect(state.recipes).toHaveLength(1)
    expect(state.recipes[0]).toMatchObject({ id: 's1', name: 'Tortilla', servings: 4 })
    expect(state.recipes[0].ingredients.map((i) => i.id)).toEqual(['s1-2', 's1-3'])
    expect(Object.keys(state.productMemory).sort()).toEqual(['huevos', 'patatas'])
  })

  it('guardar con id existente sustituye la receta', () => {
    const { state } = run((a) => {
      const id = a.saveRecipe(tortilla)
      a.saveRecipe({ ...tortilla, id, name: 'Tortilla de patatas' })
    })
    expect(state.recipes).toHaveLength(1)
    expect(state.recipes[0].name).toBe('Tortilla de patatas')
  })

  it('borra recetas', () => {
    const { state } = run((a) => a.deleteRecipe(a.saveRecipe(tortilla)))
    expect(state.recipes).toEqual([])
  })

  it('añade a una lista escalando y fusionando', () => {
    const { state } = run((a) => {
      const listId = a.createList('Súper')
      a.addItem(listId, { name: 'Huevos', quantity: 2, unit: 'ud', categoryId: 'lacteos' })
      const recipeId = a.saveRecipe(tortilla)
      a.addRecipeToList(recipeId, listId, 2)
    })
    expect(state.lists[0].items.map((i) => [i.name, i.quantity, i.unit])).toEqual([
      ['Huevos', 5, 'ud'],
      ['Patatas', 0.38, 'kg'],
    ])
  })

  it('no hace nada con receta o lista inexistentes, o lista archivada', () => {
    const { state } = run((a, get) => {
      const listId = a.createList('Súper')
      const recipeId = a.saveRecipe(tortilla)
      a.archiveList(listId)
      const before = get()
      a.addRecipeToList('nada', listId, 2)
      a.addRecipeToList(recipeId, 'nada', 2)
      a.addRecipeToList(recipeId, listId, 2)
      expect(get()).toBe(before)
    })
    expect(state.lists[0].items).toEqual([])
  })
})
