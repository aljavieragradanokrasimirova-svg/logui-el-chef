import { CALLS } from './readRecipe.js'
import { AiError } from './errors.js'

/**
 * Comprueba que la clave y el modelo funcionan con la MISMA petición que usa la app (esquema incluido), pero con una
 * imagen mínima. Devuelve { ok, ms, message }. `call` e `image` se pueden inyectar en los tests.
 */
export async function testConnection({ provider, model, apiKey, image, call = CALLS[provider], timeoutMs = 30_000 }) {
  const t0 = Date.now()
  const elapsed = () => Date.now() - t0
  if (!apiKey?.trim()) return { ok: false, ms: 0, message: new AiError('no-key').message }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    await call({ apiKey: apiKey.trim(), model, image, signal: controller.signal })
    return { ok: true, ms: elapsed(), message: '' }
  } catch (error) {
    const timedOut = controller.signal.aborted
    return { ok: false, ms: elapsed(), message: timedOut ? new AiError('timeout').message : (error?.message ?? 'Error desconocido') }
  } finally {
    clearTimeout(timer)
  }
}
