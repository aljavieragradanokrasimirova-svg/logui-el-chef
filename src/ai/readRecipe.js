import { callAnthropic } from './anthropic.js'
import { callOpenAI } from './openai.js'
import { buildDraft } from './draft.js'
import { AiError } from './errors.js'

const CALLS = { anthropic: callAnthropic, openai: callOpenAI }

/** Quita las vallas ```json … ``` por si el modelo las añade aunque se le pida JSON puro. */
function stripFences(text) {
  const match = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return match ? match[1] : text.trim()
}

/**
 * Lee una receta de una imagen con el proveedor elegido. Devuelve `{ draft, warnings }`.
 * `image` = { base64, mediaType }. `call` y `makeId` se pueden inyectar en los tests.
 */
export async function readRecipeFromImage({
  provider,
  model,
  apiKey,
  image,
  signal,
  call = CALLS[provider],
  makeId = () => crypto.randomUUID(),
}) {
  if (!apiKey?.trim()) throw new AiError('no-key')
  if (!call) throw new AiError('bad-request', `proveedor desconocido: ${provider}`)
  const text = await call({ apiKey: apiKey.trim(), model, image, signal })
  let extracted
  try {
    extracted = JSON.parse(stripFences(text))
  } catch {
    throw new AiError('invalid')
  }
  return buildDraft(extracted, { makeId })
}
