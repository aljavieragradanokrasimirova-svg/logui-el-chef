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
import { normalizeRecipe, scaleIngredients, addIngredientsToList } from '../domain/recipes.js'
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

function rememberAll(state, products, now) {
  return products.reduce((s, p) => remember(s, p, now), state)
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
    case 'list/restore': {
      // Deshacer un borrado: vuelve a su sitio si no existe ya.
      if (!action.list?.id || state.lists.some((l) => l.id === action.list.id)) return state
      const lists = state.lists.slice()
      lists.splice(Math.min(Math.max(action.index ?? lists.length, 0), lists.length), 0, action.list)
      return { ...state, lists }
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
    case 'item/restore':
      return updateList(state, action.listId, (l) => {
        if (l.archivedAt !== null || !action.item?.id || l.items.some((i) => i.id === action.item.id)) return l
        const items = l.items.slice()
        items.splice(Math.min(Math.max(action.index ?? items.length, 0), items.length), 0, action.item)
        return { ...l, items }
      })
    case 'item/toggle':
      return updateList(state, action.listId, (l) => toggleItem(l, action.itemId, { now }))
    case 'recipe/save': {
      const recipe = normalizeRecipe(action.recipe, { makeId: idsFrom(seed) })
      const index = state.recipes.findIndex((r) => r.id === recipe.id)
      const recipes = state.recipes.slice()
      if (index === -1) recipes.push(recipe)
      else recipes[index] = recipe
      return rememberAll({ ...state, recipes }, recipe.ingredients, now)
    }
    case 'recipe/delete': {
      const recipes = state.recipes.filter((r) => r.id !== action.recipeId)
      return recipes.length === state.recipes.length ? state : { ...state, recipes }
    }
    case 'recipe/restore': {
      if (!action.recipe?.id || state.recipes.some((r) => r.id === action.recipe.id)) return state
      const recipes = state.recipes.slice()
      recipes.splice(Math.min(Math.max(action.index ?? recipes.length, 0), recipes.length), 0, action.recipe)
      return { ...state, recipes }
    }
    case 'recipe/addToList': {
      const recipe = state.recipes.find((r) => r.id === action.recipeId)
      if (!recipe) return state
      const ingredients = scaleIngredients(recipe, action.servings)
      const next = updateList(state, action.listId, (l) => addIngredientsToList(l, ingredients, { makeId: idsFrom(seed) }))
      return next === state ? state : rememberAll(next, ingredients, now)
    }
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
    /** Deshace `deleteList`: `list` y su posición `index` tal como estaban. */
    restoreList: (list, index) => void send({ type: 'list/restore', list, index }),
    archiveList: (listId) => void send({ type: 'list/archive', listId }),
    reuseList: (listId) => send({ type: 'list/reuse', listId }),
    addItem: (listId, item) => send({ type: 'item/add', listId, item }),
    updateItem: (listId, itemId, changes) => void send({ type: 'item/update', listId, itemId, changes }),
    removeItem: (listId, itemId) => void send({ type: 'item/remove', listId, itemId }),
    /** Deshace `removeItem`: `item` y su posición `index` tal como estaban. */
    restoreItem: (listId, item, index) => void send({ type: 'item/restore', listId, item, index }),
    toggleItem: (listId, itemId) => void send({ type: 'item/toggle', listId, itemId }),
    updateSettings: (changes) => void send({ type: 'settings/update', changes }),
    /** Crea o guarda una receta (conserva `recipe.id` si lo trae). Devuelve su id. */
    saveRecipe: (recipe) => {
      const seed = send({ type: 'recipe/save', recipe })
      return typeof recipe.id === 'string' && recipe.id !== '' ? recipe.id : seed
    },
    deleteRecipe: (recipeId) => void send({ type: 'recipe/delete', recipeId }),
    /** Deshace `deleteRecipe`. */
    restoreRecipe: (recipe, index) => void send({ type: 'recipe/restore', recipe, index }),
    addRecipeToList: (recipeId, listId, servings) => void send({ type: 'recipe/addToList', recipeId, listId, servings }),
    replaceState: (state) => void send({ type: 'state/replace', state }),
    resetState: () => void send({ type: 'state/reset' }),
  }
}
