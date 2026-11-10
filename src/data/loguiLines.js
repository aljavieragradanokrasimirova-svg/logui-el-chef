/** Frases de Logui para avisos, celebraciones y estados vacíos (tarea 032). */
export const LINES = {
  itemAdded: [
    '¡Marchando un producto más, jefe!',
    'Añadido a la lista, chef.',
    '¡Otro ingrediente a la cesta!',
    'Apuntado queda, compi.',
    'Eso ya está en la lista.',
    '¡Buen añadido, chef!',
    'A la lista y sin prisa.',
    'Ingrediente nuevo en el carro.',
  ],
  itemChecked: [
    '¡Tachado! Uno menos, jefe.',
    'Comprado y a la bolsa.',
    '¡Ese ya cae en la cesta!',
    'Hecho, chef. Siguiente.',
    'Marcado como comprado.',
    'Un producto menos en la lista.',
    '¡Vamos bien, jefe!',
    'Al carro que va.',
  ],
  itemDeleted: [
    'Fuera de la lista, compi.',
    'Borrado, pero puedes deshacer.',
    '¡Adiós, ingrediente!',
    'Ya no está en la lista.',
    'Quitado con cuidado, chef.',
    'Se fue, jefe. Deshaz si acaso.',
    'Ese producto ya no está.',
    'Borrado sin dramas.',
  ],
  listDone: [
    '¡Lista completa, chef!',
    '¡Todo comprado, jefe!',
    'Misión cumplida, compi.',
    '¡Cesta llena y lista!',
    'Lo logramos, chef.',
    '¡A cocinar se ha dicho!',
    'Lista terminada. ¡Olé!',
    '¡Compra finiquitada!',
  ],
  listArchived: [
    'Lista guardada en el historial.',
    'Archivada, chef.',
    'Al historial que va.',
    'Guardada para otra vez.',
    'Queda a buen recaudo.',
    'Lista a salvo, jefe.',
    'Historial actualizado.',
    '¡Guardado sin perder nada!',
  ],
  listDeleted: [
    'Lista borrada. ¿Deshacemos?',
    'Adiós, lista entera.',
    'Borrada, jefe. Hay deshacer.',
    'Fuera la lista, compi.',
    'Lista eliminada del tirón.',
    'Se fue toda la lista.',
    'Lista fuera, chef.',
    'Borrada sin dejar migas.',
  ],
  emptyList: [
    'Esta lista está vacía, jefe.',
    'Sin productos todavía.',
    '¡Añade algo, chef!',
    'Vacío como mi plato.',
    'Aquí no hay nada aún.',
    'Falta llenar la cesta.',
    'Lista en blanco, compi.',
    '¡Vamos a llenarla!',
  ],
  emptyLists: [
    'No hay ninguna lista aún.',
    'Todo vacío por aquí, jefe.',
    'Crea tu primera lista, chef.',
    'Sin listas a la vista.',
    'Aquí no hay nada que ver.',
    'Empieza una lista, compi.',
    'Ni una lista, ni migas.',
    'Aún no hay listas.',
  ],
  emptyRecipes: [
    'No hay recetas todavía.',
    'Recetario vacío, chef.',
    'Crea tu primera receta.',
    'Sin recetas por ahora.',
    'Aquí huele a receta nueva.',
    'Aún no hay nada que cocinar.',
    'Falta llenar el recetario.',
    'Guardemos una receta, jefe.',
  ],
  recipeSaved: [
    '¡Receta guardada, chef!',
    '¡Esto huele a éxito, chef!',
    'Guardada para repetir.',
    '¡Otra receta al recetario!',
    'Receta a salvo, jefe.',
    'Apuntada en el recetario.',
    '¡Buen menú, compi!',
    'Receta guardada con cariño.',
  ],
  idle: [
    '¿Seguimos, jefe?',
    'Aquí espero, chef.',
    '¿Un descansito, compi?',
    'Cuando quieras seguimos.',
    'Logui no se mueve de aquí.',
    '¿Se te ha olvidado algo?',
    'Sigo atento a la lista.',
    'Sin prisa, chef.',
  ],
}

export function pickLine(kind, { random = Math.random, avoid } = {}) {
  const lines = LINES[kind]
  if (!Array.isArray(lines) || lines.length === 0) return ''
  const index = Math.floor(random() * lines.length)
  const line = lines[index]
  if (line === avoid && lines.length > 1) {
    return lines[(index + 1) % lines.length]
  }
  return line
}
