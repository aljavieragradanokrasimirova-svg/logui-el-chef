const MAX_SIDE = 1600
const QUALITY = 0.85

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * Prepara la foto para enviarla: la corrige de orientación, la reduce a 1600 px como máximo y la pasa a JPEG.
 * Una foto de móvil pasa de varios MB a unos 300 KB sin perder lo que hace falta para leer el texto.
 * Devuelve { base64, mediaType }.
 */
/** Decodifica la foto de la forma más compatible posible (los móviles viejos no aceptan todas las opciones). */
async function decode(file) {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // sin esa opción (navegadores antiguos): el navegador aplica la orientación por su cuenta
  }
  try {
    return await createImageBitmap(file)
  } catch {
    // último recurso: un <img> normal
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return { width: img.naturalWidth, height: img.naturalHeight, source: img }
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
}

const PREPARE_TIMEOUT_MS = 25_000

export async function prepareImage(file) {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('la foto tarda demasiado en prepararse')), PREPARE_TIMEOUT_MS))
  return Promise.race([prepare(file), timeout])
}

async function prepare(file) {
  const decoded = await decode(file)
  const bitmap = decoded.source ?? decoded
  const scale = Math.min(1, MAX_SIDE / Math.max(decoded.width, decoded.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(decoded.width * scale)
  canvas.height = Math.round(decoded.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff' // las capturas con transparencia (PNG) pasan a fondo blanco
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  decoded.close?.()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
  if (!blob) throw new Error('No se pudo preparar la imagen')
  return { base64: await blobToBase64(blob), mediaType: 'image/jpeg' }
}

/** Imagen de prueba (64×64, blanca con una letra) para «Probar conexión»: no hace falta ninguna foto. */
export function makeTestImage() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 64, 64)
  ctx.fillStyle = '#000'
  ctx.font = '40px sans-serif'
  ctx.fillText('A', 18, 46)
  return { base64: canvas.toDataURL('image/jpeg', 0.8).split(',')[1], mediaType: 'image/jpeg' }
}
