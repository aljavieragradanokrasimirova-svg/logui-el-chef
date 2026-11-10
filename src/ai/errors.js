/** Errores de la lectura con IA, con un mensaje listo para enseñar al usuario. */
const MESSAGES = {
  'no-key': 'Falta tu clave de API. Pégala en Ajustes.',
  auth: 'La clave no es válida o no tiene permiso. Revísala en Ajustes.',
  quota: 'Tu cuenta no tiene saldo o ha llegado a su límite de gasto. Revisa la facturación del proveedor.',
  rate: 'Demasiadas peticiones seguidas. Espera un minuto y vuelve a intentarlo.',
  network: 'No hay conexión con el servicio. Comprueba internet e inténtalo de nuevo.',
  server: 'El servicio de IA está fallando ahora mismo. Inténtalo en unos minutos.',
  'too-big': 'La foto es demasiado grande. Prueba con otra o recórtala.',
  refusal: 'La IA no ha querido analizar esta imagen. Prueba con otra foto.',
  truncated: 'La receta es demasiado larga para leerla de una vez. Prueba con una foto con menos texto.',
  invalid: 'No se pudo entender la respuesta de la IA. Inténtalo otra vez.',
  'not-recipe': 'No parece que en la foto haya una receta. Prueba con otra más clara.',
  'bad-request': 'El servicio rechazó la petición.',
}

export class AiError extends Error {
  constructor(code, detail = '') {
    const base = MESSAGES[code] ?? 'Algo ha fallado al leer la receta.'
    super(detail ? `${base} (${detail})` : base)
    this.name = 'AiError'
    this.code = code
  }
}

const QUOTA = /credit|billing|quota|insufficient|balance|spend limit/i

/** Convierte un error HTTP de cualquiera de los proveedores en un AiError. */
export function fromHttp(status, message = '', code = '') {
  const text = `${code} ${message}`
  if (status === 401 || status === 403) return new AiError('auth')
  if (status === 402 || QUOTA.test(text)) return new AiError('quota')
  if (status === 429) return new AiError('rate')
  if (status === 413) return new AiError('too-big')
  if (status >= 500) return new AiError('server')
  if (status === 400 && /too large|too big|image.*(size|exceed)/i.test(text)) return new AiError('too-big')
  return new AiError('bad-request', String(message).slice(0, 160))
}
