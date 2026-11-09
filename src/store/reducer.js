import {
  createList,
  renameList,
  archiveList,
  reuseList,
  addItem,
  updateItem,
  removeItem,
  toggleItem,
} from '../domain/lists.js'
import { rememberProduct } from '../domain/products.js'
import { emptyState, sanitizeState } from './storage.js'

/**
 * Reducer puro del estado de la app.
 *
 * Cada acción trae su `meta = { now, seed }` (lo pone `createActions`). Los ids nuevos salen de `seed`
 * de forma determinista: el primero es `seed` y los siguientes `seed-2`, `seed-3`… Así el reducer es puro
 * (StrictMode puede ejecutarlo dos veces) y quien despacha conoce de antemano el id de lo que crea.
 *
 * Las operaciones no permitidas (lista archivada, nombre vacío, ids inexistentes) dejan el estado igual.
 */

export function idsFrom(seed) {
  let n = 0
  return () => (++n === 1 ? seed : `${seed}-${n}`)
}

function updateList(state, listId, change) {
  const index = state.lists.findIndex((l) => l.id === listId)
  if (index === -1) return state
  const current = state.lists[index]
  const next = change(current)
  if (next === current) return state
  const lists = state.lists.slice()
  lists[index] = next
  return { ...state, lists }
}

function remember(state, product, now) {
  const productMemory = rememberProduct(state.productMemory, product, { now })
  return productMemory === state.productMemory ? state : { ...state, productMemory }
}

function findItem(state, listId, itemId) {
  return state.lists.find((l) => l.id === listId)?.items.find((i) => i.id === itemId)
}

function apply(state, action) {
  const { now, seed } = action.meta ?? {}
  switch (action.type) {
    case 'list/create': {
      const list = createList(action.name, { makeId: idsFrom(seed), now })
      return { ...state, lists: [...state.lists, list] }
    }
    case 'list/rename':
      return updateList(state, action.listId, (l) => renameList(l, action.name))
    case 'list/delete': {
      const lists = state.lists.filter((l) => l.id !== action.listId)
      return lists.length === state.lists.length ? state : { ...state, lists }
    }
    case 'list/archive':
      return updateList(state, action.listId, (l) => archiveList(l, { now }))
    case 'list/reuse': {
      const source = state.lists.find((l) => l.id === action.listId)
      if (!source) return state
      return { ...state, lists: [...state.lists, reuseList(source, { makeId: idsFrom(seed), now })] }
    }
    case 'item/add': {
      const next = updateList(state, action.listId, (l) => addItem(l, action.item, { makeId: idsFrom(seed) }))
      if (next === state) return state
      const added = next.lists.find((l) => l.id === action.listId).items.at(-1)
      return remember(next, added, now)
    }
    case 'item/update': {
      const next = updateList(state, action.listId, (l) => updateItem(l, action.itemId, action.changes))
      if (next === state) return state
      return remember(next, findItem(next, action.listId, action.itemId), now)
    }
    case 'item/remove':
      return updateList(state, action.listId, (l) => removeItem(l, action.itemId))
    case 'item/toggle':
      return updateList(state, action.listId, (l) => toggleItem(l, action.itemId, { now }))
    case 'settings/update':
      return { ...state, settings: { ...state.settings, ...action.changes } }
    case 'state/replace':
      return sanitizeState(action.state)
    case 'state/reset':
      return emptyState()
    default:
      return state
  }
}

export function reducer(state, action) {
  try {
    return apply(state, action)
  } catch {
    // El dominio lanza ante operaciones no válidas; la interfaz ya debería impedirlas.
    return state
  }
}

/**
 * Funciones de acción listas para la interfaz. Las que crean algo devuelven su id.
 * `clock` y `random` se inyectan en los tests.
 */
export function createActions(dispatch, { clock = () => new Date().toISOString(), random = () => crypto.randomUUID() } = {}) {
  const send = (action) => {
    const meta = { now: clock(), seed: random() }
    dispatch({ ...action, meta })
    return meta.seed
  }
  return {
    createList: (name) => send({ type: 'list/create', name }),
    renameList: (listId, name) => void send({ type: 'list/rename', listId, name }),
    deleteList: (listId) => void send({ type: 'list/delete', listId }),
    archiveList: (listId) => void send({ type: 'list/archive', listId }),
    reuseList: (listId) => send({ type: 'list/reuse', listId }),
    addItem: (listId, item) => send({ type: 'item/add', listId, item }),
    updateItem: (listId, itemId, changes) => void send({ type: 'item/update', listId, itemId, changes }),
    removeItem: (listId, itemId) => void send({ type: 'item/remove', listId, itemId }),
    toggleItem: (listId, itemId) => void send({ type: 'item/toggle', listId, itemId }),
    updateSettings: (changes) => void send({ type: 'settings/update', changes }),
    replaceState: (state) => void send({ type: 'state/replace', state }),
    resetState: () => void send({ type: 'state/reset' }),
  }
}
