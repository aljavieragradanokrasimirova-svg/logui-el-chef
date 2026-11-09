import { CATEGORY_IDS, DEFAULT_CATEGORY } from '../data/categories.js'
import { UNIT_IDS, DEFAULT_UNIT } from '../data/units.js'

/**
 * Persistencia del estado en localStorage (clave `logui:v1`, modelo en SPEC.md).
 * Todo lo que entra desde fuera (localStorage o un archivo importado) pasa por `sanitizeState`,
 * así el resto de la app puede confiar en la forma de los datos.
 */

export const STORAGE_KEY = 'logui:v1'
export const CORRUPT_KEY = 'logui:v1:corrupto'
export const STATE_VERSION = 1

export function emptyState() {
  return {
    version: STATE_VERSION,
    lists: [],
    recipes: [],
    productMemory: {},
    settings: { reduceMotion: false },
  }
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const isText = (v) => typeof v === 'string' && v.trim() !== ''
const textOr = (v, fallback) => (isText(v) ? v : fallback)
const dateOrNull = (v) => (isText(v) && !Number.isNaN(Date.parse(v)) ? v : null)
const quantityOrNull = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null)
const unitOr = (v) => (UNIT_IDS.includes(v) ? v : DEFAULT_UNIT)
const categoryOr = (v) => (CATEGORY_IDS.includes(v) ? v : DEFAULT_CATEGORY)

/** Quita los elementos sin id válido y los ids repetidos (se queda el primero). */
function uniqueById(entries) {
  const seen = new Set()
  return entries.filter((e) => {
    if (!isText(e.id) || seen.has(e.id)) return false
    seen.add(e.id)
    return true
  })
}

function sanitizeItem(raw) {
  if (!isObject(raw) || !isText(raw.name)) return null
  const checked = raw.checked === true
  return {
    id: raw.id,
    name: raw.name.trim(),
    quantity: quantityOrNull(raw.quantity),
    unit: unitOr(raw.unit),
    categoryId: categoryOr(raw.categoryId),
    checked,
    checkedAt: checked ? dateOrNull(raw.checkedAt) : null,
  }
}

function sanitizeList(raw) {
  if (!isObject(raw)) return null
  const items = Array.isArray(raw.items) ? raw.items.map(sanitizeItem).filter(Boolean) : []
  return {
    id: raw.id,
    name: textOr(raw.name, 'Lista sin nombre').trim(),
    createdAt: dateOrNull(raw.createdAt) ?? new Date(0).toISOString(),
    archivedAt: dateOrNull(raw.archivedAt),
    items: uniqueById(items),
  }
}

function sanitizeIngredient(raw) {
  if (!isObject(raw) || !isText(raw.name)) return null
  return {
    id: raw.id,
    name: raw.name.trim(),
    quantity: quantityOrNull(raw.quantity),
    unit: unitOr(raw.unit),
    categoryId: categoryOr(raw.categoryId),
  }
}

function sanitizeRecipe(raw) {
  if (!isObject(raw) || !isText(raw.name)) return null
  const ingredients = Array.isArray(raw.ingredients) ? raw.ingredients.map(sanitizeIngredient).filter(Boolean) : []
  return {
    id: raw.id,
    name: raw.name.trim(),
    iconId: textOr(raw.iconId, 'pot'),
    tags: Array.isArray(raw.tags) ? raw.tags.filter(isText).map((t) => t.trim()) : [],
    servings: Number.isInteger(raw.servings) && raw.servings > 0 ? raw.servings : 2,
    ingredients: uniqueById(ingredients),
    steps: Array.isArray(raw.steps) ? raw.steps.filter(isText) : [],
  }
}

function sanitizeProductMemory(raw) {
  if (!isObject(raw)) return {}
  const memory = {}
  for (const [key, entry] of Object.entries(raw)) {
    if (!isText(key) || !isObject(entry) || !isText(entry.name)) continue
    memory[key] = {
      name: entry.name.trim(),
      categoryId: categoryOr(entry.categoryId),
      unit: unitOr(entry.unit),
      lastUsed: dateOrNull(entry.lastUsed) ?? new Date(0).toISOString(),
    }
  }
  return memory
}

/**
 * Devuelve un estado válido a partir de cualquier valor. Rellena lo que falta con valores por defecto
 * y descarta lo que no se puede reparar (productos sin nombre, ids repetidos…).
 * Lanza un Error si `raw` no parece un estado de Logui o es de una versión futura.
 */
export function sanitizeState(raw) {
  if (!isObject(raw)) throw new Error('No es una copia de seguridad de Logui')
  if (raw.version !== STATE_VERSION) {
    throw new Error(
      typeof raw.version === 'number' && raw.version > STATE_VERSION
        ? 'La copia es de una versión más nueva de Logui'
        : 'No es una copia de seguridad de Logui',
    )
  }
  const lists = Array.isArray(raw.lists) ? raw.lists.map(sanitizeList).filter(Boolean) : []
  const recipes = Array.isArray(raw.recipes) ? raw.recipes.map(sanitizeRecipe).filter(Boolean) : []
  return {
    version: STATE_VERSION,
    lists: uniqueById(lists),
    recipes: uniqueById(recipes),
    productMemory: sanitizeProductMemory(raw.productMemory),
    settings: { reduceMotion: isObject(raw.settings) && raw.settings.reduceMotion === true },
  }
}

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null // acceso bloqueado (modo privado estricto, cookies desactivadas…)
  }
}

/**
 * Lee el estado guardado. Si no hay nada devuelve un estado vacío.
 * Si lo guardado está dañado, lo aparta en `CORRUPT_KEY` (para no perderlo) y devuelve un estado vacío.
 */
export function loadState(storage = defaultStorage()) {
  if (!storage) return emptyState()
  let text
  try {
    text = storage.getItem(STORAGE_KEY)
  } catch {
    return emptyState()
  }
  if (text == null) return emptyState()
  try {
    return sanitizeState(JSON.parse(text))
  } catch {
    try {
      storage.setItem(CORRUPT_KEY, text)
    } catch {
      // sin espacio: no podemos hacer más
    }
    return emptyState()
  }
}

/** Guarda el estado. Devuelve `false` si el navegador no lo permite (sin acceso o sin espacio). */
export function saveState(state, storage = defaultStorage()) {
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/** Texto JSON legible para descargar como copia de seguridad. */
export function exportBackup(state) {
  return JSON.stringify(state, null, 2)
}

/** Lee el texto de una copia de seguridad. Lanza Error con un mensaje para el usuario si no es válida. */
export function parseBackup(text) {
  let raw
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('El archivo no es una copia de seguridad de Logui')
  }
  try {
    return sanitizeState(raw)
  } catch (error) {
    if (error.message === 'La copia es de una versión más nueva de Logui') throw error
    throw new Error('El archivo no es una copia de seguridad de Logui')
  }
}
