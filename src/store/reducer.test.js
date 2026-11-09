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
