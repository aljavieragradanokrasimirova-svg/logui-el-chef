import { RECIPE_SCHEMA, SYSTEM_PROMPT, USER_PROMPT } from './schema.js'
import { AiError, fromHttp } from './errors.js'

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

/**
 * Lee la imagen con Gemini (ruta clásica generateContent) y devuelve el texto JSON de la respuesta.
 * Se usa esta ruta y no la nueva «Interactions» porque esa exige la cabecera `Api-Revision`, que Google no
 * permite en peticiones desde el navegador (comprobado: la comprobación previa CORS devuelve 403).
 * `fetchImpl` se puede inyectar en los tests.
 */
export async function callGemini({ apiKey, model, image, signal, fetchImpl = (...args) => fetch(...args) }) {
  let response
  try {
    response = await fetchImpl(`${BASE}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: 'user',
            parts: [{ text: USER_PROMPT }, { inlineData: { mimeType: image.mediaType, data: image.base64 } }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseJsonSchema: RECIPE_SCHEMA,
          maxOutputTokens: 16000,
        },
      }),
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new AiError('network')
  }

  if (!response.ok) {
    let body = {}
    try {
      body = await response.json()
    } catch {
      // cuerpo no JSON: nos quedamos con el código de estado
    }
    // Google a veces envuelve el error en una lista: [{ error: {...} }]
    const error = (Array.isArray(body) ? body[0] : body)?.error
    throw fromHttp(response.status, error?.message, error?.status)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new AiError('invalid')
  }

  if (data.promptFeedback?.blockReason) throw new AiError('refusal')
  const candidate = data.candidates?.[0]
  if (candidate?.finishReason === 'MAX_TOKENS') throw new AiError('truncated')
  const text = (candidate?.content?.parts ?? [])
    .filter((part) => typeof part.text === 'string' && !part.thought)
    .map((part) => part.text)
    .join('')
  if (!text.trim()) throw new AiError(candidate && candidate.finishReason !== 'STOP' ? 'refusal' : 'invalid')
  return text
}
