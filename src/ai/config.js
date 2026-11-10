import { PROVIDERS, PROVIDER_BY_ID, DEFAULT_PROVIDER } from './providers.js'

/**
 * Configuración de la IA (proveedor, modelo y claves). Va en su propia clave de localStorage, SEPARADA del estado
 * de la app, para que las claves nunca entren en las copias de seguridad ni se exporten.
 */
export const AI_STORAGE_KEY = 'logui:ai'

export function defaultAiConfig() {
  return {
    provider: DEFAULT_PROVIDER,
    models: Object.fromEntries(PROVIDERS.map((p) => [p.id, p.models[0].id])),
    keys: Object.fromEntries(PROVIDERS.map((p) => [p.id, ''])),
  }
}

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/** Lee la configuración guardada; lo que falte o no sea válido se rellena con los valores por defecto. */
export function loadAiConfig(storage = defaultStorage()) {
  const config = defaultAiConfig()
  let raw
  try {
    raw = JSON.parse(storage?.getItem(AI_STORAGE_KEY) ?? 'null')
  } catch {
    return config
  }
  if (!raw || typeof raw !== 'object') return config
  if (PROVIDER_BY_ID[raw.provider]) config.provider = raw.provider
  for (const p of PROVIDERS) {
    const model = raw.models?.[p.id]
    if (p.models.some((m) => m.id === model)) config.models[p.id] = model
    const key = raw.keys?.[p.id]
    if (typeof key === 'string') config.keys[p.id] = key.trim()
  }
  return config
}

/** Guarda la configuración. Devuelve false si el navegador no lo permite. */
export function saveAiConfig(config, storage = defaultStorage()) {
  try {
    storage.setItem(AI_STORAGE_KEY, JSON.stringify(config))
    return true
  } catch {
    return false
  }
}

/** { provider, model, apiKey } del proveedor elegido (apiKey vacía si no hay clave). */
export function activeSelection(config) {
  return { provider: config.provider, model: config.models[config.provider], apiKey: config.keys[config.provider] }
}
