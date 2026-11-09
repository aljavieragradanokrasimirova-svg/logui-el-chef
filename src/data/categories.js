/** Categorías fijas, en orden de pasillo. El color se usa como fondo de su sección; `short` es el nombre para baldosas. */
export const CATEGORIES = [
  { id: 'frutas', label: 'Frutas y verduras', short: 'Fruta', color: '#9BD58F', icon: 'apple' },
  { id: 'carne', label: 'Carne y pescado', short: 'Carne', color: '#F29B85', icon: 'fish' },
  { id: 'lacteos', label: 'Lácteos y huevos', short: 'Lácteos', color: '#A9D8F2', icon: 'milk' },
  { id: 'panaderia', label: 'Panadería', short: 'Pan', color: '#EDBD7A', icon: 'bread' },
  { id: 'despensa', label: 'Despensa', short: 'Despensa', color: '#D9BC98', icon: 'jar' },
  { id: 'congelados', label: 'Congelados', short: 'Congelados', color: '#C4E6F7', icon: 'snow' },
  { id: 'bebidas', label: 'Bebidas', short: 'Bebidas', color: '#F5B8C4', icon: 'bottle' },
  { id: 'limpieza', label: 'Limpieza e higiene', short: 'Limpieza', color: '#C9BDEB', icon: 'bubbles' },
  { id: 'otros', label: 'Otros', short: 'Otros', color: '#E2DCD2', icon: 'basket' },
]

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id)
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))
export const DEFAULT_CATEGORY = 'otros'
