import { callAnthropic } from './anthropic.js'
import { callOpenAI } from './openai.js'
import { callGemini } from './gemini.js'
import { buildDraft } from './draft.js'
import { AiError } from './errors.js'

const CALLS = { anthropic: callAnthropic, openai: callOpenAI, gemini: callGemini }

const TIMEOUT_MS = 90_000
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
  timeoutMs = TIMEOUT_MS,
  retryDelayMs = RETRY_DELAY_MS,
}) {
  if (!apiKey?.trim()) throw new AiError('no-key')
  if (!call) throw new AiError('bad-request', `proveedor desconocido: ${provider}`)
  const args = { apiKey: apiKey.trim(), model, image }
  let text
  try {
    text = await attempt(call, args, signal, timeoutMs)
  } catch (error) {
    // Los fallos del servidor (p. ej. «modelo saturado») suelen pasar solos: un reintento tras una pausa.
    if (error?.code !== 'server' || signal?.aborted) throw error
    await sleep(retryDelayMs)
    text = await attempt(call, args, signal, timeoutMs)
  }
  let extracted
  try {
    extracted = JSON.parse(stripFences(text))
  } catch {
    throw new AiError('invalid', `empieza así: «${String(text).trim().slice(0, 60)}»`)
  }
  return buildDraft(extracted, { makeId })
}
