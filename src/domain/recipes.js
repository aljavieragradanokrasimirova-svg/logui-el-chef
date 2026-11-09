import { CATEGORY_IDS, DEFAULT_CATEGORY } from '../data/categories.js'
import { UNIT_IDS, DEFAULT_UNIT } from '../data/units.js'
import { normalizeName } from './normalize.js'
import { toQuantity } from './lists.js'

export const ICON_IDS_RECIPE = ['pot', 'pan', 'salad', 'cake', 'soup', 'pasta']
export const DEFAULT_RECIPE_ICON = 'pot'

function cleanText(text) {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function round2(value) {
  return Math.round(value * 100) / 100
}

function validIcon(iconId) {
  return ICON_IDS_RECIPE.includes(iconId) ? iconId : DEFAULT_RECIPE_ICON
}

function validUnit(unit) {
  return UNIT_IDS.includes(unit) ? unit : DEFAULT_UNIT
}

function validCategory(categoryId) {
  return CATEGORY_IDS.includes(categoryId) ? categoryId : DEFAULT_CATEGORY
}

function normalizeServings(value) {
  let servings = value
  if (typeof servings === 'string') {
    const cleaned = servings.trim()
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return 2
    servings = Number(cleaned)
  }
  if (typeof servings !== 'number' || !Number.isFinite(servings)) return 2
  const rounded = Math.round(servings)
  return rounded >= 1 ? rounded : 2
}

function validId(id) {
  return typeof id === 'string' && id !== ''
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []
  const seen = new Set()
  const result = []
  for (const tag of tags) {
    const cleaned = cleanText(tag).toLowerCase()
    if (cleaned === '' || seen.has(cleaned)) continue
    seen.add(cleaned)
    result.push(cleaned)
  }
  return result
}

function normalizeIngredient(input, makeId) {
  const name = cleanText(input.name)
  if (name === '') return null
  return {
    id: validId(input.id) ? input.id : makeId(),
    name,
    quantity: toQuantity(input.quantity),
    unit: validUnit(input.unit),
    categoryId: validCategory(input.categoryId),
  }
}

export function normalizeRecipe(input, { makeId }) {
  const name = cleanText(input.name)
  if (name === '') {
    throw new Error('El nombre no puede estar vacío')
  }

  const id = validId(input.id) ? input.id : makeId()

  const ingredients = []
  if (Array.isArray(input.ingredients)) {
    for (const raw of input.ingredients) {
      const ingredient = normalizeIngredient(raw, makeId)
      if (ingredient !== null) ingredients.push(ingredient)
    }
  }

  const steps = []
  if (Array.isArray(input.steps)) {
    for (const step of input.steps) {
      const cleaned = cleanText(step)
      if (cleaned !== '') steps.push(cleaned)
    }
  }

  return {
    id,
    name,
    iconId: validIcon(input.iconId),
    tags: normalizeTags(input.tags),
    servings: normalizeServings(input.servings),
    ingredients,
    steps,
  }
}

export function scaleQuantity(quantity, unit, factor) {
  if (quantity === null || quantity === undefined) return null
  const scaled = round2(quantity * factor)
  return unit === 'ud' ? Math.ceil(scaled) : scaled
}

export function scaleIngredients(recipe, servings) {
  const validServings = Number.isInteger(servings) && servings >= 1
  const factor = validServings ? servings / recipe.servings : 1
  return recipe.ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: scaleQuantity(ingredient.quantity, ingredient.unit, factor),
  }))
}

export function addIngredientsToList(list, ingredients, { makeId }) {
  if (list.archivedAt !== null) {
    throw new Error('La lista está archivada')
  }
  if (ingredients.length === 0) {
    return list
  }

  const items = list.items.slice()

  for (const ingredient of ingredients) {
    const normalized = normalizeName(ingredient.name)
    const index = items.findIndex(
      (item) =>
        normalizeName(item.name) === normalized &&
        item.unit === ingredient.unit &&
        item.quantity !== null &&
        item.quantity !== undefined &&
        ingredient.quantity !== null &&
        ingredient.quantity !== undefined,
    )

    if (index !== -1) {
      const current = items[index]
      items[index] = {
        ...current,
        quantity: round2(current.quantity + ingredient.quantity),
        checked: false,
        checkedAt: null,
      }
    } else {
      items.push({
        id: makeId(),
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        categoryId: ingredient.categoryId,
        checked: false,
        checkedAt: null,
      })
    }
  }

  return { ...list, items }
}

export function allTags(recipes) {
  const tags = new Set()
  for (const recipe of recipes) {
    if (!Array.isArray(recipe.tags)) continue
    for (const tag of recipe.tags) tags.add(tag)
  }
  return [...tags].sort((a, b) => a.localeCompare(b, 'es'))
}

export function filterByTag(recipes, tag) {
  const wanted = cleanText(tag).toLowerCase()
  if (wanted === '') return recipes
  return recipes.filter(
    (recipe) =>
      Array.isArray(recipe.tags) && recipe.tags.some((t) => cleanText(t).toLowerCase() === wanted),
  )
}
