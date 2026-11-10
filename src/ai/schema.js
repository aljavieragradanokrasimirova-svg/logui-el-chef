import { CATEGORY_IDS } from '../data/categories.js'
import { UNIT_IDS } from '../data/units.js'
import { ICON_IDS_RECIPE } from '../domain/recipes.js'

/**
 * Lo que se le pide a la IA: leer la foto de una receta y devolverla en un formato fijo.
 * Los valores permitidos (unidades, pasillos, iconos) salen de los datos de la app, así no se desincronizan.
 * Sin campos opcionales (nulos): «0» significa «no consta», que es lo que aceptan los dos proveedores en modo estricto.
 */
export const RECIPE_SCHEMA = {
  type: 'object',
  properties: {
    is_recipe: { type: 'boolean', description: 'true si la imagen contiene una receta de cocina legible.' },
    name: { type: 'string', description: 'Título de la receta, en español. Vacío si no consta.' },
    icon: { type: 'string', enum: ICON_IDS_RECIPE, description: 'El icono que mejor representa el plato.' },
    servings: { type: 'integer', description: 'Número de raciones. 0 si la receta no lo indica.' },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Entre 0 y 3 etiquetas cortas en minúsculas (cena, postre, rápida…), solo si se deducen de la receta.',
    },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nombre del ingrediente, en español, sin la cantidad.' },
          quantity: { type: 'number', description: 'Cantidad numérica (las fracciones, en decimales). 0 si no consta o no encaja en las unidades.' },
          unit: { type: 'string', enum: UNIT_IDS, description: 'Unidad de la lista. «ud» si son piezas o si no encaja ninguna.' },
          category: { type: 'string', enum: CATEGORY_IDS, description: 'Pasillo del supermercado donde se compra.' },
        },
        required: ['name', 'quantity', 'unit', 'category'],
        additionalProperties: false,
      },
    },
    steps: { type: 'array', items: { type: 'string' }, description: 'Pasos de la preparación, en orden, sin numerar.' },
    warnings: {
      type: 'array',
      items: { type: 'string' },
      description: 'Frases cortas en español sobre lo que el usuario debería revisar (texto borroso, rangos, cantidades que no encajan…).',
    },
  },
  required: ['is_recipe', 'name', 'icon', 'servings', 'tags', 'ingredients', 'steps', 'warnings'],
  additionalProperties: false,
}

export const SYSTEM_PROMPT = `Eres el ayudante de una app de listas de la compra y recetas. Recibes la foto o la captura de una receta (de un libro, una revista, una pantalla o escrita a mano) y la transcribes a un formato estructurado.

Reglas:
- Escribe todo en español; si la receta está en otro idioma, tradúcela.
- Transcribe fielmente: no inventes ingredientes, cantidades ni pasos que no aparezcan. Si algo no se lee bien, omítelo o déjalo sin cantidad y avísalo en «warnings».
- Cantidades: usa números (1/2 = 0.5). Si hay un rango (2-3), usa el valor menor y avísalo en «warnings».
- Unidades permitidas: ${UNIT_IDS.join(', ')}. Si el ingrediente se cuenta por piezas (huevos, dientes de ajo, cebollas) usa «ud». Si la medida no está en la lista (cucharada, taza, pizca, vaso, al gusto), pon cantidad 0, unidad «ud» y deja la medida en el nombre, por ejemplo «Azúcar (2 cucharadas)».
- Cada paso es una frase o dos, sin número delante. Si hay varias columnas o páginas, sigue el orden de lectura natural.
- Si la imagen no contiene una receta legible, devuelve is_recipe = false y las listas vacías.`

export const USER_PROMPT = 'Transcribe esta receta.'
