/**
 * Proveedores de IA disponibles. Para añadir otro modelo basta con añadirlo a la lista de su proveedor;
 * los ids son los del API del proveedor.
 */
export const PROVIDERS = [
  {
    id: 'gemini',
    label: 'Gemini (Google)',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyPlaceholder: 'AIza…',
    note: 'Tiene nivel gratuito, con límites de uso. En ese nivel Google puede usar lo que envías para mejorar sus productos.',
    models: [
      { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash · recomendado' },
      { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite · el más rápido' },
    ],
  },
  {
    id: 'anthropic',
    label: 'Claude (Anthropic)',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyPlaceholder: 'sk-ant-…',
    note: 'De pago: unos céntimos por foto, según el modelo.',
    models: [
      { id: 'claude-opus-5-5', label: 'Opus 5.5 · el más preciso' },
      { id: 'claude-sonnet-5-5', label: 'Sonnet 5.5 · más barato' },
    ],
  },
  {
    id: 'openai',
    label: 'GPT (OpenAI)',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-…',
    note: 'De pago: unos céntimos por foto, según el modelo.',
    models: [
      { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol · equilibrado' },
      { id: 'gpt-6.1-terra', label: 'GPT-6.1 Terra · más barato' },
      { id: 'gpt-6-astra', label: 'GPT-6 Astra · el más potente' },
    ],
  },
]

export const PROVIDER_BY_ID = Object.fromEntries(PROVIDERS.map((p) => [p.id, p]))
export const DEFAULT_PROVIDER = 'gemini'
