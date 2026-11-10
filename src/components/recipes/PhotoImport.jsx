import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Modal, { ModalActions } from '../ui/Modal.jsx'
import UiIcon from '../icons/UiIcon.jsx'
import Logui from '../../mascot/Logui.jsx'
import { loadAiConfig, activeSelection } from '../../ai/config.js'
import { PROVIDER_BY_ID } from '../../ai/providers.js'
import { prepareImage } from '../../ai/image.js'
import { readRecipeFromImage } from '../../ai/readRecipe.js'
import { AiError } from '../../ai/errors.js'
import ManualImportSheet from './ManualImportSheet.jsx'
import { useAppNavigate } from '../../feel/viewTransitions.js'

/**
 * Botón «Desde una foto»: elige o hace una foto, la IA la lee y se abre el formulario de receta ya relleno.
 * `round` = botón redondo solo con icono (cabecera); si no, botón normal con texto.
 */
export default function PhotoImport({ round = false }) {
  const navigate = useAppNavigate()
  const inputRef = useRef(null)
  const abortRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | nokey | reading | error | manual
  const [message, setMessage] = useState('')
  const [stage, setStage] = useState('prep') // prep | wait
  const [seconds, setSeconds] = useState(0)
  const [preview, setPreview] = useState(null) // la foto ya preparada, para enseñarla mientras se lee

  // Segundos transcurridos mientras se lee: así se ve si avanza o está parado.
  useEffect(() => {
    if (status !== 'reading') return undefined
    setSeconds(0)
    const timer = setInterval(() => setSeconds((n) => n + 1), 1000)
    return () => clearInterval(timer)
  }, [status])

  function start() {
    const { apiKey } = activeSelection(loadAiConfig())
    if (!apiKey) {
      setStatus('nokey')
      return
    }
    inputRef.current?.click()
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite elegir la misma foto otra vez
    if (!file) return
    if (navigator.onLine === false) {
      setMessage(new AiError('network').message)
      setStatus('error')
      return
    }
    const controller = new AbortController()
    abortRef.current = controller
    setStage('prep')
    setPreview(null)
    setStatus('reading')
    let image
    try {
      image = await prepareImage(file)
    } catch (error) {
      setMessage(`No se pudo preparar la foto (${error?.name ?? 'error'}: ${error?.message ?? 'desconocido'}). Prueba con otra o con una captura de pantalla.`)
      setStatus('error')
      abortRef.current = null
      return
    }
    setPreview(`data:${image.mediaType};base64,${image.base64}`)
    setStage('wait')
    try {
      const selection = activeSelection(loadAiConfig())
      const fallbackModels = PROVIDER_BY_ID[selection.provider].models.map((m) => m.id)
      const { draft, warnings } = await readRecipeFromImage({ ...selection, fallbackModels, image, signal: controller.signal })
      setStatus('idle')
      navigate('/recetas/nueva', { state: { draft, warnings } })
    } catch (error) {
      if (controller.signal.aborted || error?.name === 'AbortError') {
        setStatus('idle')
        return
      }
      setMessage(error instanceof AiError ? error.message : 'No se pudo abrir la foto. Prueba con otra.')
      setStatus('error')
    } finally {
      abortRef.current = null
    }
  }

  const cancel = () => {
    abortRef.current?.abort()
    setStatus('idle')
  }
  const close = () => setStatus('idle')

  return (
    <>
      {round ? (
        <Button round size="small" aria-label="Crear receta desde una foto" onClick={start}>
          <UiIcon name="camera" />
        </Button>
      ) : (
        <Button onClick={start}>
          <UiIcon name="camera" /> Desde una foto
        </Button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={onFile} />

      <Modal open={status === 'nokey'} onClose={close} title="Falta tu clave de IA">
        <p style={{ margin: 0 }}>
          Para que Logui lea la foto solo necesita una clave de API (Gemini tiene nivel gratuito), que se pega una vez en Ajustes. También puedes usar la app de IA que ya tengas, copiando y pegando.
        </p>
        <ModalActions>
          <Button size="small" onClick={() => setStatus('manual')}>Usar mi app de IA</Button>
          <Link to="/ajustes" className="btn btn--small btn--primary">Poner mi clave</Link>
        </ModalActions>
      </Modal>

      <Modal open={status === 'reading'} onClose={cancel} title="Leyendo la receta…">
        <ReadingProgress preview={preview} stage={stage} seconds={seconds} />
        <ModalActions>
          <Button size="small" onClick={cancel}>Cancelar</Button>
        </ModalActions>
      </Modal>

      <Modal open={status === 'error'} onClose={close} title="No se pudo leer la receta">
        <p style={{ margin: 0 }} role="alert">{message}</p>
        <ModalActions>
          <Button size="small" onClick={() => setStatus('manual')}>Usar mi app de IA</Button>
          <Button size="small" variant="primary" onClick={() => { close(); start() }}>Probar otra foto</Button>
        </ModalActions>
      </Modal>
      <ManualImportSheet open={status === 'manual'} onClose={close} />
    </>
  )
}

/** Qué se le cuenta al usuario mientras espera, según los segundos (la IA no informa de su avance). */
function stageText(stage, seconds) {
  if (stage === 'prep') return 'Preparando la foto…'
  if (seconds < 4) return 'Mirando la foto…'
  if (seconds < 9) return 'Apuntando los ingredientes…'
  if (seconds < 16) return 'Ordenando los pasos…'
  return 'Repasando los detalles…'
}

/**
 * Espera de la lectura: la foto con una línea que la recorre, una receta «en esqueleto» que se va
 * rellenando y una barra que avanza (estimada: rápida al principio y cada vez más lenta, sin llegar al final).
 */
function ReadingProgress({ preview, stage, seconds }) {
  const progress = stage === 'prep' ? 0.08 : 0.1 + 0.82 * (1 - Math.exp(-seconds / 9))
  const lines = stage === 'prep' ? 0 : seconds < 3 ? 1 : seconds < 8 ? 2 : 3
  return (
    <div className="reading">
      <div className="reading__stage">
        <div className="reading__photo">
          {preview ? <img src={preview} alt="" /> : <Logui mood="think" size={70} />}
          <span className="reading__scan" aria-hidden="true" />
        </div>
        <div className="reading__sheet" aria-hidden="true">
          <span className="skeleton skeleton--title" />
          {lines >= 1 && <span className="skeleton reading__line" style={{ width: '80%' }} />}
          {lines >= 2 && (
            <>
              <span className="skeleton reading__line" style={{ width: '65%' }} />
              <span className="skeleton reading__line" style={{ width: '72%' }} />
            </>
          )}
          {lines >= 3 && (
            <>
              <span className="skeleton reading__line reading__line--step" style={{ width: '92%' }} />
              <span className="skeleton reading__line reading__line--step" style={{ width: '58%' }} />
            </>
          )}
        </div>
      </div>
      <div className="reading__bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress.toFixed(3)})` }} />
      </div>
      <p className="reading__text" role="status">
        {stageText(stage, seconds)} <span className="reading__secs">{seconds} s</span>
      </p>
    </div>
  )
}
