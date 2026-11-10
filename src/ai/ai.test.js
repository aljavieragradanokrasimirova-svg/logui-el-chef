import { describe, it, expect, vi } from 'vitest'
import { AiError, fromHttp } from './errors.js'
import { buildDraft } from './draft.js'
import { RECIPE_SCHEMA } from './schema.js'
import { callAnthropic } from './anthropic.js'
import { callOpenAI } from './openai.js'
import { readRecipeFromImage } from './readRecipe.js'
import { AI_STORAGE_KEY, defaultAiConfig, loadAiConfig, saveAiConfig, activeSelection } from './config.js'

const image = { base64: 'AAAA', mediaType: 'image/jpeg' }
const ids = () => {
  let n = 0
  return () => `id${++n}`
}

const extracted = (overrides = {}) => ({
  is_recipe: true,
  name: '  Tortilla de patatas ',
  icon: 'pan',
  servings: 4,
  tags: ['Cena', 'rápida'],
  ingredients: [
    { name: 'Huevos', quantity: 6, unit: 'ud', category: 'lacteos' },
    { name: 'Patatas', quantity: 0.75, unit: 'kg', category: 'frutas' },
    { name: 'Sal (una pizca)', quantity: 0, unit: 'ud', category: 'despensa' },
  ],
  steps: ['Pelar y freír las patatas.', 'Batir los huevos y cuajar.'],
  warnings: ['El aceite no se lee bien.'],
  ...overrides,
})

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return { data, getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)) }
}

describe('RECIPE_SCHEMA', () => {
  it('es estricta: todo requerido y sin campos extra', () => {
    const check = (schema) => {
      if (schema.type === 'object') {
        expect(schema.additionalProperties).toBe(false)
        expect([...schema.required].sort()).toEqual(Object.keys(schema.properties).sort())
        Object.values(schema.properties).forEach(check)
      }
      if (schema.type === 'array') check(schema.items)
    }
    check(RECIPE_SCHEMA)
  })
})

describe('fromHttp', () => {
  it.each([
    [401, '', '', 'auth'],
    [403, '', '', 'auth'],
    [429, 'Too many requests', '', 'rate'],
    [429, 'You exceeded your current quota', 'insufficient_quota', 'quota'],
    [400, 'Your credit balance is too low', '', 'quota'],
    [402, '', '', 'quota'],
    [413, '', '', 'too-big'],
    [500, '', '', 'server'],
    [529, '', '', 'server'],
    [400, 'Image exceeds 5 MB maximum', '', 'too-big'],
    [400, 'cosa rara', '', 'bad-request'],
  ])('%i %s %s → %s', (status, message, code, expected) => {
    expect(fromHttp(status, message, code).code).toBe(expected)
  })
})

describe('buildDraft', () => {
  it('convierte la extracción en un borrador válido con avisos', () => {
    const { draft, warnings } = buildDraft(extracted(), { makeId: ids() })
    expect(draft).toMatchObject({ name: 'Tortilla de patatas', iconId: 'pan', servings: 4, tags: ['cena', 'rápida'] })
    expect(draft.ingredients.map((i) => [i.name, i.quantity, i.unit, i.categoryId])).toEqual([
      ['Huevos', 6, 'ud', 'lacteos'],
      ['Patatas', 0.75, 'kg', 'frutas'],
      ['Sal (una pizca)', null, 'ud', 'despensa'],
    ])
    expect(draft.steps).toHaveLength(2)
    expect(warnings).toEqual(['El aceite no se lee bien.'])
  })

  it('avisa si faltan las raciones y pone 2', () => {
    const { draft, warnings } = buildDraft(extracted({ servings: 0, warnings: [] }), { makeId: ids() })
    expect(draft.servings).toBe(2)
    expect(warnings[0]).toMatch(/raciones/)
  })

  it('repara valores fuera de lo permitido y nombres vacíos', () => {
    const { draft } = buildDraft(
      extracted({ name: '', icon: 'cohete', ingredients: [{ name: 'Algo', quantity: -3, unit: 'taza', category: 'nada' }, { name: '  ', quantity: 1, unit: 'ud', category: 'otros' }] }),
      { makeId: ids() },
    )
    expect(draft.name).toBe('Receta sin nombre')
    expect(draft.iconId).toBe('pot')
    expect(draft.ingredients).toHaveLength(1)
    expect(draft.ingredients[0]).toMatchObject({ quantity: null, unit: 'ud', categoryId: 'otros' })
  })

  it('rechaza lo que no es una receta', () => {
    expect(() => buildDraft(extracted({ is_recipe: false }), { makeId: ids() })).toThrow(AiError)
    expect(() => buildDraft(extracted({ ingredients: [], steps: [] }), { makeId: ids() })).toThrow(/receta/)
    expect(() => buildDraft(null, { makeId: ids() })).toThrow(AiError)
  })

  it('limita los avisos', () => {
    const many = Array.from({ length: 20 }, (_, i) => `aviso ${i}`)
    expect(buildDraft(extracted({ warnings: many }), { makeId: ids() }).warnings).toHaveLength(8)
  })
})

describe('callAnthropic', () => {
  const clientWith = (create) => async () => ({ messages: { create } })

  it('envía la imagen y el esquema y devuelve el texto', async () => {
    const create = vi.fn().mockResolvedValue({ stop_reason: 'end_turn', content: [{ type: 'thinking' }, { type: 'text', text: '{"a":1}' }] })
    const text = await callAnthropic({ apiKey: 'k', model: 'claude-opus-5-5', image, createClient: clientWith(create) })
    expect(text).toBe('{"a":1}')
    const [body] = create.mock.calls[0]
    expect(body.model).toBe('claude-opus-5-5')
    expect(body.output_config.format).toEqual({ type: 'json_schema', schema: RECIPE_SCHEMA })
    expect(body.messages[0].content[0]).toEqual({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'AAAA' } })
    expect(body).not.toHaveProperty('temperature')
  })

  it.each([
    [{ stop_reason: 'refusal', content: [] }, 'refusal'],
    [{ stop_reason: 'max_tokens', content: [{ type: 'text', text: '{' }] }, 'truncated'],
    [{ stop_reason: 'end_turn', content: [] }, 'invalid'],
  ])('respuesta %j → %s', async (response, code) => {
    await expect(callAnthropic({ apiKey: 'k', model: 'm', image, createClient: clientWith(async () => response) })).rejects.toMatchObject({ code })
  })

  it('traduce los errores del SDK', async () => {
    const fail = (error) => callAnthropic({ apiKey: 'k', model: 'm', image, createClient: clientWith(async () => { throw error }) })
    await expect(fail(Object.assign(new Error('x'), { status: 401 }))).rejects.toMatchObject({ code: 'auth' })
    await expect(fail(new Error('connection error'))).rejects.toMatchObject({ code: 'network' })
    const abort = Object.assign(new Error('abort'), { name: 'AbortError' })
    await expect(fail(abort)).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('callOpenAI', () => {
  const ok = (data) => async () => ({ ok: true, status: 200, json: async () => data })
  const message = (parts, extra = {}) => ({ status: 'completed', output: [{ type: 'reasoning' }, { type: 'message', content: parts }], ...extra })

  it('envía la petición documentada y devuelve el texto', async () => {
    const fetchImpl = vi.fn(ok(message([{ type: 'output_text', text: '{"a":1}' }])))
    const text = await callOpenAI({ apiKey: 'sk-test', model: 'gpt-6.1-sol', image, fetchImpl })
    expect(text).toBe('{"a":1}')
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.openai.com/v1/responses')
    expect(init.headers.Authorization).toBe('Bearer sk-test')
    const body = JSON.parse(init.body)
    expect(body.model).toBe('gpt-6.1-sol')
    expect(body.store).toBe(false)
    expect(body.text.format).toMatchObject({ type: 'json_schema', name: 'receta', strict: true })
    expect(body.input[0].content[1]).toMatchObject({ type: 'input_image', image_url: 'data:image/jpeg;base64,AAAA' })
  })

  it('detecta rechazos, cortes y respuestas vacías', async () => {
    const run = (data) => callOpenAI({ apiKey: 'k', model: 'm', image, fetchImpl: ok(data) })
    await expect(run(message([{ type: 'refusal', refusal: 'no' }]))).rejects.toMatchObject({ code: 'refusal' })
    await expect(run(message([{ type: 'output_text', text: '{' }], { status: 'incomplete' }))).rejects.toMatchObject({ code: 'truncated' })
    await expect(run(message([]))).rejects.toMatchObject({ code: 'invalid' })
  })

  it('traduce los errores HTTP y de red', async () => {
    const http = (status, error) => async () => ({ ok: false, status, json: async () => ({ error }) })
    const run = (fetchImpl) => callOpenAI({ apiKey: 'k', model: 'm', image, fetchImpl })
    await expect(run(http(401, { message: 'Incorrect API key' }))).rejects.toMatchObject({ code: 'auth' })
    await expect(run(http(429, { message: 'quota', code: 'insufficient_quota' }))).rejects.toMatchObject({ code: 'quota' })
    await expect(run(async () => { throw new TypeError('Failed to fetch') })).rejects.toMatchObject({ code: 'network' })
  })
})

describe('readRecipeFromImage', () => {
  it('une llamada, análisis y borrador', async () => {
    const call = vi.fn().mockResolvedValue('```json\n' + JSON.stringify(extracted()) + '\n```')
    const { draft, warnings } = await readRecipeFromImage({ provider: 'openai', model: 'm', apiKey: ' sk-x ', image, call, makeId: ids() })
    expect(draft.name).toBe('Tortilla de patatas')
    expect(warnings).toHaveLength(1)
    expect(call).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'sk-x', model: 'm', image }))
  })

  it('exige clave y entiende solo JSON', async () => {
    await expect(readRecipeFromImage({ provider: 'openai', apiKey: '  ', image })).rejects.toMatchObject({ code: 'no-key' })
    await expect(readRecipeFromImage({ provider: 'openai', apiKey: 'k', image, call: async () => 'hola' })).rejects.toMatchObject({ code: 'invalid' })
    await expect(readRecipeFromImage({ provider: 'otro', apiKey: 'k', image })).rejects.toMatchObject({ code: 'bad-request' })
  })
})

describe('config de la IA', () => {
  it('guarda aparte del estado de la app y recupera lo guardado', () => {
    const storage = memoryStorage()
    const config = defaultAiConfig()
    config.provider = 'openai'
    config.keys.openai = 'sk-abc'
    config.models.openai = 'gpt-6-astra'
    expect(saveAiConfig(config, storage)).toBe(true)
    expect(AI_STORAGE_KEY).not.toBe('logui:v1')
    const loaded = loadAiConfig(storage)
    expect(loaded.provider).toBe('openai')
    expect(activeSelection(loaded)).toEqual({ provider: 'openai', model: 'gpt-6-astra', apiKey: 'sk-abc' })
  })

  it('ignora datos dañados o desconocidos', () => {
    expect(loadAiConfig(memoryStorage({ [AI_STORAGE_KEY]: '{roto' }))).toEqual(defaultAiConfig())
    const odd = JSON.stringify({ provider: 'x', models: { anthropic: 'modelo-raro' }, keys: { anthropic: 5 } })
    expect(loadAiConfig(memoryStorage({ [AI_STORAGE_KEY]: odd }))).toEqual(defaultAiConfig())
    expect(loadAiConfig(null)).toEqual(defaultAiConfig())
  })
})

describe('tiempo máximo y reintento', () => {
  const ok = JSON.stringify(extracted())

  it('corta con un mensaje claro si la IA no contesta', async () => {
    const hang = ({ signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))))
    await expect(readRecipeFromImage({ provider: 'gemini', apiKey: 'k', image, call: hang, timeoutMs: 30 })).rejects.toMatchObject({ code: 'timeout' })
  })

  it('si un modelo está saturado prueba con el siguiente', async () => {
    const call = vi.fn().mockRejectedValueOnce(new AiError('server', 'HTTP 503')).mockResolvedValueOnce(ok)
    await readRecipeFromImage({ provider: 'gemini', apiKey: 'k', model: 'a', fallbackModels: ['a', 'b', 'c'], image, call, retryDelayMs: 1, makeId: ids() })
    expect(call.mock.calls.map(([args]) => args.model)).toEqual(['a', 'b'])
  })

  it('si fallan todos, el error dice cuáles se probaron', async () => {
    const call = vi.fn().mockRejectedValue(new AiError('server', 'HTTP 503'))
    await expect(
      readRecipeFromImage({ provider: 'gemini', apiKey: 'k', model: 'a', fallbackModels: ['a', 'b'], image, call, retryDelayMs: 1 }),
    ).rejects.toThrow(/[probado: a, b]/)
  })

  it('reintenta una vez si el servidor falla', async () => {
    const call = vi.fn().mockRejectedValueOnce(new AiError('server', 'HTTP 503: overloaded')).mockResolvedValueOnce(ok)
    const { draft } = await readRecipeFromImage({ provider: 'gemini', apiKey: 'k', image, call, retryDelayMs: 1, makeId: ids() })
    expect(draft.name).toBe('Tortilla de patatas')
    expect(call).toHaveBeenCalledTimes(2)
  })

  it('no reintenta más de una vez ni los errores del usuario', async () => {
    const server = vi.fn().mockRejectedValue(new AiError('server', 'HTTP 500'))
    await expect(readRecipeFromImage({ provider: 'gemini', apiKey: 'k', image, call: server, retryDelayMs: 1 })).rejects.toMatchObject({ code: 'server' })
    expect(server).toHaveBeenCalledTimes(2)
    const auth = vi.fn().mockRejectedValue(new AiError('auth'))
    await expect(readRecipeFromImage({ provider: 'gemini', apiKey: 'k', image, call: auth, retryDelayMs: 1 })).rejects.toMatchObject({ code: 'auth' })
    expect(auth).toHaveBeenCalledTimes(1)
  })

  it('los errores enseñan el motivo del proveedor', () => {
    expect(fromHttp(503, 'The model is overloaded. Please try again later.').message).toMatch(/HTTP 503: The model is overloaded/)
    expect(fromHttp(400, 'Unknown name "thinkingConfig"').message).toMatch(/HTTP 400: Unknown name/)
  })
})
