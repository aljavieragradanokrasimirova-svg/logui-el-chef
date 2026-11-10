import { callAnthropic } from './anthropic.js'
import { callOpenAI } from './openai.js'
import { callGemini } from './gemini.js'
import { buildDraft } from './draft.js'
import { AiError } from './errors.js'

const CALLS = { anthropic: callAnthropic, openai: callOpenAI, gemini: callGemini }

const TIMEOUT_MS = 45_000
const RETRY_DELAY_MS = 2_000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Una llamada con tiempo máximo: si se pasa, AiError('timeout'). Respeta la cancelación del usuario (`signal`). */
async function attempt(call, args, signal, timeoutMs) {
  const controller = new AbortController()
  const cancel = () => controller.abort()
  if (signal?.aborted) cancel()
  signal?.addEventListener('abort', cancel)
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)
  try {
    return await call({ ...args, signal: controller.signal })
  } catch (error) {
    if (timedOut) throw new AiError('timeout')
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', cancel)
  }
}

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
  fallbackModels = [],
  timeoutMs = TIMEOUT_MS,
  retryDelayMs = RETRY_DELAY_MS,
}) {
  if (!apiKey?.trim()) throw new AiError('no-key')
  if (!call) throw new AiError('bad-request', `proveedor desconocido: ${provider}`)
  // Si el servidor falla o un modelo se cuelga, se prueba con los otros modelos del proveedor, con una pausa.
  // Con un solo modelo disponible se reintenta ese una vez.
  const models = [model, ...fallbackModels.filter((m) => m !== model)]
  if (models.length === 1) models.push(model)
  let text
  for (let i = 0; i < models.length; i++) {
    try {
      text = await attempt(call, { apiKey: apiKey.trim(), model: models[i], image }, signal, timeoutMs)
      break
    } catch (error) {
      if (!['server', 'timeout'].includes(error?.code) || signal?.aborted) throw error
      if (i === models.length - 1) {
        // Se agotaron todos: se dice cuáles se probaron para poder diagnosticarlo.
        error.message += ` [probado: ${[...new Set(models)].join(', ')}]`
        throw error
      }
      await sleep(retryDelayMs)
    }
  }
  let extracted
  try {
    extracted = JSON.parse(stripFences(text))
  } catch {
    throw new AiError('invalid', `empieza así: «${String(text).trim().slice(0, 60)}»`)
  }
  return buildDraft(extracted, { makeId })
}
