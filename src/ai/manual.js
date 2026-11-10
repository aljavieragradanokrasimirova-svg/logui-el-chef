import { RECIPE_SCHEMA, SYSTEM_PROMPT } from './schema.js'
import { buildDraft } from './draft.js'
import { AiError } from './errors.js'

/**
 * Modo manual: sin claves ni llamadas. El usuario copia unas instrucciones, se las pasa con la foto a la app de IA
 * que ya tenga (Claude, ChatGPT, Gemini…), copia su respuesta y la pega en Logui.
 */
export function manualPrompt() {
  return `${SYSTEM_PROMPT}

Te paso la foto de una receta. Responde ÚNICAMENTE con un bloque de código JSON (sin explicaciones antes ni después) que cumpla exactamente este esquema JSON:

${JSON.stringify(RECIPE_SCHEMA)}`
}

/**
 * Saca el JSON de lo que el usuario pega: acepta el bloque entre ``` ```, el JSON suelto o con texto alrededor
 * (los chats suelen añadir una frase). Devuelve el objeto, o null si no encuentra ninguno.
 */
export function extractJson(text) {
  const raw = String(text ?? '').trim()
  const candidates = []
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) candidates.push(fence[1])
  candidates.push(raw)
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start !== -1 && end > start) candidates.push(raw.slice(start, end + 1))
  for (const candidate of candidates) {
    try {
      const value = JSON.parse(candidate.trim())
      if (value && typeof value === 'object' && !Array.isArray(value)) return value
    } catch {
      // probamos con el siguiente candidato
    }
  }
  return null
}

/** Convierte la respuesta pegada en `{ draft, warnings }` (o lanza AiError). */
export function parseManualReply(text, { makeId = () => crypto.randomUUID() } = {}) {
  const extracted = extractJson(text)
  if (!extracted) throw new AiError('invalid')
  return buildDraft(extracted, { makeId })
}
