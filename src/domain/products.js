import { normalizeName } from './normalize.js'
import { CATALOG } from '../data/catalog.js'
import { CATEGORY_IDS, DEFAULT_CATEGORY } from '../data/categories.js'
import { UNIT_IDS, DEFAULT_UNIT } from '../data/units.js'

export const MEMORY_LIMIT = 500

const cleanName = (name) => String(name ?? '').trim().replace(/\s+/g, ' ')

const compareLastUsedAsc = (a, b) => {
  const ta = a.lastUsed ?? ''
  const tb = b.lastUsed ?? ''
  if (ta < tb) return -1
  if (ta > tb) return 1
  return 0
}

const compareLastUsedDesc = (a, b) => compareLastUsedAsc(b, a)

export function rememberProduct(memory, product, { now, limit = MEMORY_LIMIT } = {}) {
  const key = normalizeName(product?.name)
  if (!key) return memory

  const name = cleanName(product.name)
  const categoryId = CATEGORY_IDS.includes(product.categoryId)
    ? product.categoryId
    : DEFAULT_CATEGORY
  const unit = UNIT_IDS.includes(product.unit) ? product.unit : DEFAULT_UNIT

  const next = {
    ...memory,
    [key]: { name, categoryId, unit, lastUsed: now },
  }

  const keys = Object.keys(next)
  if (keys.length > limit) {
    const removable = keys
      .filter((k) => k !== key)
      .map((k) => ({ key: k, lastUsed: next[k].lastUsed }))
      .sort(compareLastUsedAsc)

    let overflow = keys.length - limit
    for (const { key: k } of removable) {
      if (overflow <= 0) break
      delete next[k]
      overflow -= 1
    }
  }

  return next
}

export function forgetProduct(memory, name) {
  const key = normalizeName(name)
  if (!Object.prototype.hasOwnProperty.call(memory, key)) return memory

  const next = { ...memory }
  delete next[key]
  return next
}

export function suggestProducts(
  query,
  { memory = {}, catalog = CATALOG, exclude = [], limit = 6 } = {}
) {
  const q = normalizeName(query)
  if (!q) return []

  const excluded = new Set(exclude.map(normalizeName))

  const memoryCandidates = Object.keys(memory)
    .filter((key) => key && !excluded.has(key))
    .map((key) => ({
      key,
      name: memory[key].name,
      categoryId: memory[key].categoryId,
      unit: memory[key].unit,
      lastUsed: memory[key].lastUsed,
      source: 'memory',
    }))
    .sort(compareLastUsedDesc)

  const memoryKeys = new Set(Object.keys(memory))
  const catalogCandidates = catalog
    .filter((item) => {
      const key = normalizeName(item.name)
      return !memoryKeys.has(key) && !excluded.has(key)
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
    .map((item) => ({
      key: normalizeName(item.name),
      name: item.name,
      categoryId: item.categoryId,
      unit: item.unit,
      source: 'catalog',
    }))

  const starts = (c) => c.key.startsWith(q)
  const contains = (c) => c.key.includes(q)

  const ordered = [
    ...memoryCandidates.filter(starts),
    ...catalogCandidates.filter(starts),
    ...memoryCandidates.filter((c) => contains(c) && !starts(c)),
    ...catalogCandidates.filter((c) => contains(c) && !starts(c)),
  ]

  return ordered.slice(0, limit).map(({ name, categoryId, unit, source }) => ({
    name,
    categoryId,
    unit,
    source,
  }))
}
