import { RECIPE_SCHEMA, SYSTEM_PROMPT, USER_PROMPT } from './schema.js'
import { AiError, fromHttp } from './errors.js'

/** El SDK se carga solo cuando se usa: no pesa en el arranque de la app. */
async function defaultCreateClient(apiKey) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  // dangerouslyAllowBrowser: la clave es del propio usuario y solo vive en su dispositivo (no hay servidor).
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 })
}

/**
 * Lee la imagen con Claude y devuelve el texto JSON de la respuesta (ajustado a RECIPE_SCHEMA).
 * `createClient` se puede inyectar en los tests.
 */
export async function callAnthropic({ apiKey, model, image, signal, createClient = defaultCreateClient }) {
  const client = await createClient(apiKey)
  let response
  try {
    response = await client.messages.create(
      {
        model,
        max_tokens: 16000,
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: RECIPE_SCHEMA } },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.base64 } },
              { type: 'text', text: USER_PROMPT },
            ],
          },
        ],
      },
      { signal },
    )
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'APIUserAbortError') throw error
    if (typeof error?.status === 'number') throw fromHttp(error.status, error.message)
    throw new AiError('network')
  }

  if (response.stop_reason === 'refusal') throw new AiError('refusal')
  if (response.stop_reason === 'max_tokens') throw new AiError('truncated')
  const text = (response.content ?? [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
  if (!text.trim()) throw new AiError('invalid')
  return text
}
