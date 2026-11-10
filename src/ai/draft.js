import { normalizeRecipe } from '../domain/recipes.js'
import { AiError } from './errors.js'

const MAX_WARNINGS = 8

const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()

/**
 * Convierte lo que devuelve la IA en un borrador de receta válido (pasa por `normalizeRecipe`, que repara
 * unidades, pasillos y raciones) más la lista de avisos para que el usuario los revise.
 * Lanza AiError('not-recipe') si la imagen no era una receta.
 */
export function buildDraft(extracted, { makeId }) {
  const data = extracted && typeof extracted === 'object' ? extracted : {}
  const ingredients = Array.isArray(data.ingredients) ? data.ingredients : []
  const steps = Array.isArray(data.steps) ? data.steps : []
  if (data.is_recipe === false || (ingredients.length === 0 && steps.length === 0)) {
    throw new AiError('not-recipe')
  }

  const warnings = (Array.isArray(data.warnings) ? data.warnings : []).map(clean).filter(Boolean)
  const servings = Number(data.servings)
  if (!(servings >= 1)) warnings.push('La receta no indicaba las raciones: he puesto 2.')

  const draft = normalizeRecipe(
    {
      name: clean(data.name) || 'Receta sin nombre',
      iconId: data.icon,
      tags: data.tags,
      servings: servings >= 1 ? servings : undefined,
      ingredients: ingredients.map((i) => ({
        name: i?.name,
        quantity: i?.quantity,
        unit: i?.unit,
        categoryId: i?.category,
      })),
      steps,
    },
    { makeId },
  )
  return { draft, warnings: warnings.slice(0, MAX_WARNINGS) }
}
