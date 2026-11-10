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
export async function prepareImage(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff' // las capturas con transparencia (PNG) pasan a fondo blanco
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
  if (!blob) throw new Error('No se pudo preparar la imagen')
  return { base64: await blobToBase64(blob), mediaType: 'image/jpeg' }
}
