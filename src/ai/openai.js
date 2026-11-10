import { RECIPE_SCHEMA, SYSTEM_PROMPT, USER_PROMPT } from './schema.js'
import { AiError, fromHttp } from './errors.js'

const ENDPOINT = 'https://api.openai.com/v1/responses'

/**
 * Lee la imagen con GPT (API Responses, salida estructurada estricta) y devuelve el texto JSON de la respuesta.
 * `fetchImpl` se puede inyectar en los tests.
 */
export async function callOpenAI({ apiKey, model, image, signal, fetchImpl = (...args) => fetch(...args) }) {
  let response
  try {
    response = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal,
      body: JSON.stringify({
        model,
        instructions: SYSTEM_PROMPT,
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: USER_PROMPT },
              { type: 'input_image', image_url: `data:${image.mediaType};base64,${image.base64}`, detail: 'high' },
            ],
          },
        ],
        text: { format: { type: 'json_schema', name: 'receta', schema: RECIPE_SCHEMA, strict: true } },
        max_output_tokens: 16000,
        store: false, // no guardar la foto ni la respuesta en el historial del proveedor
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
      // cuerpo no JSON: nos quedamos solo con el código de estado
    }
    throw fromHttp(response.status, body?.error?.message, body?.error?.code ?? body?.error?.type)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new AiError('invalid')
  }

  const parts = (data.output ?? []).filter((item) => item.type === 'message').flatMap((item) => item.content ?? [])
  if (parts.some((part) => part.type === 'refusal')) throw new AiError('refusal')
  if (data.status === 'incomplete') throw new AiError('truncated')
  const text = parts
    .filter((part) => part.type === 'output_text')
    .map((part) => part.text)
    .join('')
  if (!text.trim()) throw new AiError('invalid')
  return text
}
