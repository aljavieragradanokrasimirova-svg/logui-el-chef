/** Errores de la lectura con IA, con un mensaje listo para enseñar al usuario. */
const MESSAGES = {
  'no-key': 'Falta tu clave de API. Pégala en Ajustes.',
  auth: 'La clave no es válida o no tiene permiso. Revísala en Ajustes.',
  quota: 'Has llegado al límite de uso de tu cuenta, o no queda saldo. Espera un poco o revisa tu cuenta en el proveedor.',
  rate: 'Demasiadas peticiones seguidas. Espera un minuto y vuelve a intentarlo.',
  network: 'No hay conexión con el servicio. Comprueba internet e inténtalo de nuevo.',
  server: 'El servicio de IA está fallando ahora mismo. Inténtalo en unos minutos.',
  timeout: 'La IA tarda demasiado en contestar. Inténtalo otra vez o prueba con otro modelo en Ajustes.',
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

const QUOTA = /credit|billing|quota|insufficient|balance|spend limit|resource_exhausted/i
const BAD_KEY = /api key not valid|invalid api key|incorrect api key|api_key_invalid/i

/** Convierte un error HTTP de cualquiera de los proveedores en un AiError. */
export function fromHttp(status, message = '', code = '') {
  const text = `${code} ${message}`
  // El motivo que da el proveedor, para enseñarlo: sin él no se puede saber por qué falla.
  const detail = String(message).replace(/\s+/g, ' ').trim().slice(0, 140)
  const why = (extra = '') => [extra, detail].filter(Boolean).join(': ')
  if (status === 401 || status === 403 || BAD_KEY.test(text)) return new AiError('auth')
  if (status === 402 || QUOTA.test(text)) return new AiError('quota', why())
  if (status === 429) return new AiError('rate', why())
  if (status === 413) return new AiError('too-big')
  if (status >= 500) return new AiError('server', why(`HTTP ${status}`))
  if (status === 400 && /too large|too big|image.*(size|exceed)/i.test(text)) return new AiError('too-big')
  return new AiError('bad-request', why(`HTTP ${status}`))
}
