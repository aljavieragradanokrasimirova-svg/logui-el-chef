/**
 * Proveedores de IA disponibles (ahora solo Gemini, que tiene nivel gratuito). La estructura admite más: cada proveedor
 * necesita su llamada en `readRecipe.js` (ver `gemini.js`). Los ids de modelo son los de la API del proveedor.
 */
export const PROVIDERS = [
  {
    id: 'gemini',
    label: 'Gemini (Google)',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyPlaceholder: 'AIza…',
    free: true,
    note: 'Tiene nivel gratuito, con límites de uso. En ese nivel Google puede usar lo que envías para mejorar sus productos.',
    models: [
      { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash · recomendado' },
      { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite · el más rápido' },
    ],
  },
]

export const PROVIDER_BY_ID = Object.fromEntries(PROVIDERS.map((p) => [p.id, p]))
export const DEFAULT_PROVIDER = 'gemini'
