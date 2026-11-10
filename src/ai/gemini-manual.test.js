import { describe, it, expect, vi } from 'vitest'
import { callGemini } from './gemini.js'
import { manualPrompt, extractJson, parseManualReply } from './manual.js'
import { fromHttp } from './errors.js'
import { RECIPE_SCHEMA } from './schema.js'

const image = { base64: 'AAAA', mediaType: 'image/jpeg' }
const ok = (data) => async () => ({ ok: true, status: 200, json: async () => data })
const reply = (parts, extra = {}) => ({ candidates: [{ finishReason: 'STOP', content: { parts }, ...extra }] })

const recipe = {
  is_recipe: true,
  name: 'Gazpacho',
  icon: 'soup',
  servings: 4,
  tags: ['verano'],
  ingredients: [{ name: 'Tomates', quantity: 1, unit: 'kg', category: 'frutas' }],
  steps: ['Triturar todo.'],
  warnings: [],
}

describe('callGemini', () => {
  it('envía la petición por la ruta clásica y devuelve el texto', async () => {
    const fetchImpl = vi.fn(ok(reply([{ text: '{"a":' }, { text: '1}' }])))
    const text = await callGemini({ apiKey: 'AIza-test', model: 'gemini-3.8-flash', image, fetchImpl })
    expect(text).toBe('{"a":1}')
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent')
    // Solo cabeceras que Google permite desde el navegador (sin Api-Revision)
    expect(Object.keys(init.headers).sort()).toEqual(['Content-Type', 'x-goog-api-key'])
    expect(init.headers['x-goog-api-key']).toBe('AIza-test')
    const body = JSON.parse(init.body)
    expect(body.contents[0].parts[1]).toEqual({ inlineData: { mimeType: 'image/jpeg', data: 'AAAA' } })
    expect(body.generationConfig).toMatchObject({ responseMimeType: 'application/json', responseJsonSchema: RECIPE_SCHEMA })
    expect(body.systemInstruction.parts[0].text).toMatch(/receta/)
  })

  it('ignora los pensamientos del modelo', async () => {
    const text = await callGemini({ apiKey: 'k', model: 'm', image, fetchImpl: ok(reply([{ text: 'pienso…', thought: true }, { text: '{}' }])) })
    expect(text).toBe('{}')
  })

  it.each([
    [{ promptFeedback: { blockReason: 'SAFETY' } }, 'refusal'],
    [reply([{ text: '{' }], { finishReason: 'MAX_TOKENS' }), 'truncated'],
    [reply([], { finishReason: 'SAFETY' }), 'refusal'],
    [reply([]), 'invalid'],
  ])('respuesta %j → %s', async (data, code) => {
    await expect(callGemini({ apiKey: 'k', model: 'm', image, fetchImpl: ok(data) })).rejects.toMatchObject({ code })
  })

  it('traduce los errores, también cuando Google los envuelve en una lista', async () => {
    const http = (status, body) => async () => ({ ok: false, status, json: async () => body })
    const run = (fetchImpl) => callGemini({ apiKey: 'k', model: 'm', image, fetchImpl })
    const bad = [{ error: { code: 400, message: 'API key not valid. Please pass a valid API key.', status: 'INVALID_ARGUMENT' } }]
    await expect(run(http(400, bad))).rejects.toMatchObject({ code: 'auth' })
    await expect(run(http(429, { error: { message: 'You exceeded your current quota', status: 'RESOURCE_EXHAUSTED' } }))).rejects.toMatchObject({ code: 'quota' })
    await expect(run(http(503, { error: { message: 'overloaded' } }))).rejects.toMatchObject({ code: 'server' })
    await expect(run(async () => { throw new TypeError('Failed to fetch') })).rejects.toMatchObject({ code: 'network' })
  })
})

describe('fromHttp con claves de Google', () => {
  it('reconoce la clave inválida aunque venga como 400', () => {
    expect(fromHttp(400, 'API key not valid. Please pass a valid API key.').code).toBe('auth')
  })
})

describe('modo manual', () => {
  it('las instrucciones incluyen las reglas y el esquema', () => {
    const prompt = manualPrompt()
    expect(prompt).toMatch(/ÚNICAMENTE con un bloque de código JSON/)
    expect(prompt).toContain('"is_recipe"')
    expect(prompt).toContain('"ingredients"')
  })

  it('extrae el JSON de un bloque, suelto o rodeado de texto', () => {
    const json = JSON.stringify(recipe)
    expect(extractJson('```json\n' + json + '\n```')).toEqual(recipe)
    expect(extractJson(json)).toEqual(recipe)
    expect(extractJson('¡Claro! Aquí tienes la receta:\n' + json + '\nQue aproveche.')).toEqual(recipe)
    expect(extractJson('Aquí va:\n```\n' + json + '\n```\n¿Algo más?')).toEqual(recipe)
  })

  it('devuelve null si no hay JSON', () => {
    expect(extractJson('Lo siento, no puedo leer la imagen.')).toBeNull()
    expect(extractJson('')).toBeNull()
    expect(extractJson('[1,2,3]')).toBeNull()
    expect(extractJson('{roto')).toBeNull()
  })

  it('convierte la respuesta pegada en un borrador', () => {
    let n = 0
    const { draft } = parseManualReply('```json\n' + JSON.stringify(recipe) + '\n```', { makeId: () => `id${++n}` })
    expect(draft).toMatchObject({ name: 'Gazpacho', iconId: 'soup', servings: 4 })
    expect(draft.ingredients[0]).toMatchObject({ name: 'Tomates', quantity: 1, unit: 'kg', categoryId: 'frutas' })
  })

  it('avisa si lo pegado no se entiende o no es una receta', () => {
    expect(() => parseManualReply('hola')).toThrow(/entender/)
    expect(() => parseManualReply(JSON.stringify({ ...recipe, is_recipe: false }))).toThrow(/receta/)
  })
})
