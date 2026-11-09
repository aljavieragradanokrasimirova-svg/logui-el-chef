import { CATEGORIES, CATEGORY_IDS, DEFAULT_CATEGORY } from '../data/categories.js'
import { UNIT_IDS, DEFAULT_UNIT } from '../data/units.js'

function cleanName(name) {
  return String(name ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function ensureEditable(list) {
  if (list.archivedAt !== null) {
    throw new Error('La lista está archivada')
  }
}

/** Redondea a 2 decimales; lo que queda en 0 no es una cantidad. */
function roundQuantity(value) {
  const rounded = Math.round(value * 100) / 100
  return rounded > 0 ? rounded : null
}

function validUnit(unit) {
  return UNIT_IDS.includes(unit) ? unit : DEFAULT_UNIT
}

function validCategory(categoryId) {
  return CATEGORY_IDS.includes(categoryId) ? categoryId : DEFAULT_CATEGORY
}

export function toQuantity(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return null
    return roundQuantity(value)
  }
  if (typeof value === 'string') {
    const cleaned = value.trim().replace(',', '.')
    // Solo dígitos con decimales opcionales: Number() aceptaría '0x10' o '1e2'.
    if (!/^(\d+\.?\d*|\.\d+)$/.test(cleaned)) return null
    const parsed = Number(cleaned)
    if (!Number.isFinite(parsed) || parsed <= 0) return null
    return roundQuantity(parsed)
  }
  return null
}

export function createList(name, { makeId, now }) {
  const cleaned = cleanName(name)
  return {
    id: makeId(),
    name: cleaned === '' ? 'Nueva lista' : cleaned,
    createdAt: now,
    archivedAt: null,
    items: [],
  }
}

export function renameList(list, name) {
  ensureEditable(list)
  const cleaned = cleanName(name)
  if (cleaned === '') {
    throw new Error('El nombre no puede estar vacío')
  }
  return { ...list, name: cleaned }
}

export function archiveList(list, { now }) {
  ensureEditable(list)
  return { ...list, archivedAt: now }
}

export function reuseList(list, { makeId, now }) {
  const id = makeId()
  const items = list.items.map((item) => ({
    id: makeId(),
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    categoryId: item.categoryId,
    checked: false,
    checkedAt: null,
  }))
  return {
    id,
    name: list.name,
    createdAt: now,
    archivedAt: null,
    items,
  }
}

export function addItem(list, input, { makeId }) {
  ensureEditable(list)
  const name = cleanName(input.name)
  if (name === '') {
    throw new Error('El nombre no puede estar vacío')
  }
  const item = {
    id: makeId(),
    name,
    quantity: toQuantity(input.quantity),
    unit: validUnit(input.unit),
    categoryId: validCategory(input.categoryId),
    checked: false,
    checkedAt: null,
  }
  return { ...list, items: [...list.items, item] }
}

export function updateItem(list, itemId, changes) {
  ensureEditable(list)
  const index = list.items.findIndex((item) => item.id === itemId)
  if (index === -1) return list

  const current = list.items[index]
  const updated = { ...current }

  if ('name' in changes) {
    const name = cleanName(changes.name)
    if (name === '') {
      throw new Error('El nombre no puede estar vacío')
    }
    updated.name = name
  }
  if ('quantity' in changes) {
    updated.quantity = toQuantity(changes.quantity)
  }
  if ('unit' in changes) {
    updated.unit = validUnit(changes.unit)
  }
  if ('categoryId' in changes) {
    updated.categoryId = validCategory(changes.categoryId)
  }

  const items = list.items.slice()
  items[index] = updated
  return { ...list, items }
}

export function removeItem(list, itemId) {
  ensureEditable(list)
  if (!list.items.some((item) => item.id === itemId)) return list
  return { ...list, items: list.items.filter((item) => item.id !== itemId) }
}

export function toggleItem(list, itemId, { now }) {
  ensureEditable(list)
  const index = list.items.findIndex((item) => item.id === itemId)
  if (index === -1) return list

  const current = list.items[index]
  const updated = current.checked
    ? { ...current, checked: false, checkedAt: null }
    : { ...current, checked: true, checkedAt: now }

  const items = list.items.slice()
  items[index] = updated
  return { ...list, items }
}

export function listProgress(list) {
  const total = list.items.length
  const checked = list.items.filter((item) => item.checked).length
  return { checked, total }
}

export function isComplete(list) {
  const { checked, total } = listProgress(list)
  return total > 0 && checked === total
}

export function groupByCategory(items) {
  const buckets = new Map()

  items.forEach((item, index) => {
    const categoryId = CATEGORY_IDS.includes(item.categoryId) ? item.categoryId : DEFAULT_CATEGORY
    if (!buckets.has(categoryId)) buckets.set(categoryId, [])
    buckets.get(categoryId).push({ item, index })
  })

  const groups = []
  for (const { id } of CATEGORIES) {
    const bucket = buckets.get(id)
    if (!bucket || bucket.length === 0) continue

    const pending = bucket.filter((entry) => !entry.item.checked)
    const checked = bucket
      .filter((entry) => entry.item.checked)
      .sort((a, b) => {
        const dateA = a.item.checkedAt ?? ''
        const dateB = b.item.checkedAt ?? ''
        if (dateA < dateB) return -1
        if (dateA > dateB) return 1
        return a.index - b.index
      })

    groups.push({
      categoryId: id,
      items: [...pending, ...checked].map((entry) => entry.item),
    })
  }

  return groups
}
