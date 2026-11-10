import { describe, it, expect, vi } from 'vitest'
import { AiError, fromHttp } from './errors.js'
import { buildDraft } from './draft.js'
import { RECIPE_SCHEMA } from './schema.js'
import { readRecipeFromImage } from './readRecipe.js'
import { testConnection } from './testConnection.js'
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

describe('readRecipeFromImage', () => {
  it('une llamada, análisis y borrador', async () => {
    const call = vi.fn().mockResolvedValue('```json\n' + JSON.stringify(extracted()) + '\n```')
    const { draft, warnings } = await readRecipeFromImage({ provider: 'gemini', model: 'm', apiKey: ' sk-x ', image, call, makeId: ids() })
    expect(draft.name).toBe('Tortilla de patatas')
    expect(warnings).toHaveLength(1)
    expect(call).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 'sk-x', model: 'm', image }))
  })

  it('exige clave y entiende solo JSON', async () => {
    await expect(readRecipeFromImage({ provider: 'gemini', apiKey: '  ', image })).rejects.toMatchObject({ code: 'no-key' })
    await expect(readRecipeFromImage({ provider: 'gemini', apiKey: 'k', image, call: async () => 'hola' })).rejects.toMatchObject({ code: 'invalid' })
    await expect(readRecipeFromImage({ provider: 'otro', apiKey: 'k', image })).rejects.toMatchObject({ code: 'bad-request' })
  })
})

describe('config de la IA', () => {
  it('guarda aparte del estado de la app y recupera lo guardado', () => {
    const storage = memoryStorage()
    const config = defaultAiConfig()
    config.provider = 'gemini'
    config.keys.gemini = 'AIza-abc'
    config.models.gemini = 'gemini-3.5-flash-lite'
    expect(saveAiConfig(config, storage)).toBe(true)
    expect(AI_STORAGE_KEY).not.toBe('logui:v1')
    const loaded = loadAiConfig(storage)
    expect(loaded.provider).toBe('gemini')
    expect(activeSelection(loaded)).toEqual({ provider: 'gemini', model: 'gemini-3.5-flash-lite', apiKey: 'AIza-abc' })
  })

  it('ignora datos dañados o desconocidos', () => {
    expect(loadAiConfig(memoryStorage({ [AI_STORAGE_KEY]: '{roto' }))).toEqual(defaultAiConfig())
    const odd = JSON.stringify({ provider: 'x', models: { gemini: 'modelo-raro' }, keys: { gemini: 5 } })
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

  it('si un modelo se cuelga prueba con el siguiente', async () => {
    const call = vi.fn(({ model, signal }) =>
      model === 'colgado'
        ? new Promise((_, reject) => signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))))
        : Promise.resolve(ok),
    )
    const { draft } = await readRecipeFromImage({ provider: 'gemini', apiKey: 'k', model: 'colgado', fallbackModels: ['colgado', 'bueno'], image, call, timeoutMs: 30, retryDelayMs: 1, makeId: ids() })
    expect(draft.name).toBe('Tortilla de patatas')
    expect(call.mock.calls.map(([args]) => args.model)).toEqual(['colgado', 'bueno'])
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

describe('testConnection', () => {
  it('dice si funciona y cuánto tarda', async () => {
    const result = await testConnection({ provider: 'gemini', model: 'm', apiKey: 'k', image, call: async () => '{}' })
    expect(result.ok).toBe(true)
    expect(result.ms).toBeGreaterThanOrEqual(0)
  })

  it('devuelve el motivo si falla, el tiempo agotado y la falta de clave', async () => {
    const fail = await testConnection({ provider: 'gemini', model: 'm', apiKey: 'k', image, call: async () => { throw new AiError('server', 'HTTP 503') } })
    expect(fail).toMatchObject({ ok: false })
    expect(fail.message).toMatch(/HTTP 503/)
    const hang = ({ signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('abort'))))
    expect((await testConnection({ provider: 'gemini', model: 'm', apiKey: 'k', image, call: hang, timeoutMs: 20 })).message).toMatch(/tarda demasiado/)
    expect((await testConnection({ provider: 'gemini', model: 'm', apiKey: '', image })).ok).toBe(false)
  })
})
