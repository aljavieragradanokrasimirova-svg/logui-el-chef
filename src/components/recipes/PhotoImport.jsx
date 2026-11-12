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

      <Modal open={status === 'reading'} onClose={cancel} title="Leyendo la receta" className="reading-modal">
        <ReadingProgress preview={preview} stage={stage} seconds={seconds} onCancel={cancel} />
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

const STEPS = ['Preparar la foto', 'Leer los ingredientes', 'Ordenar los pasos']

/** Paso en curso (0-2) según la etapa y los segundos: la IA no informa de su avance, así que se estima. */
function currentStep(stage, seconds) {
  if (stage === 'prep') return 0
  return seconds < 7 ? 1 : 2
}

/**
 * Espera de la lectura: la foto como una polaroid con un brillo que la recorre, Logui asomado mirándola,
 * los tres pasos con su estado y una barra que avanza de forma continua (estimada: nunca llega al final sola).
 */
function ReadingProgress({ preview, stage, seconds, onCancel }) {
  const step = currentStep(stage, seconds)
  const progress = stage === 'prep' ? 0.06 : Math.min(0.94, 0.12 + 0.82 * (1 - Math.exp(-(seconds + 1) / 9)))
  const slow = stage === 'wait' && seconds >= 20
  return (
    <div className="reading">
      <div className="reading__scene">
        <div className="reading__polaroid">
          <div className="reading__photo">
            {preview ? <img src={preview} alt="" /> : <span className="reading__placeholder" aria-hidden="true" />}
            <span className="reading__shine" aria-hidden="true" />
          </div>
        </div>
        <Logui mood="think" size={78} className="reading__logui" />
      </div>

      <ol className="reading__steps">
        {STEPS.map((label, i) => {
          const state = i < step ? 'done' : i === step ? 'active' : 'todo'
          return (
            <li key={label} className={'reading__step reading__step--' + state}>
              <span className="reading__dot" aria-hidden="true">
                {state === 'done' && <UiIcon name="check" size={14} strokeWidth={4} />}
              </span>
              <span>{label}</span>
              <span className="sr-only">{state === 'done' ? ' (hecho)' : state === 'active' ? ' (en curso)' : ''}</span>
            </li>
          )
        })}
      </ol>

      <div className="reading__bar" aria-hidden="true">
        <span style={{ transform: 'scaleX(' + progress.toFixed(3) + ')' }} />
      </div>
      <p className="reading__meta" role="status">
        <span>{slow ? 'Está tardando más de lo normal, ya casi…' : 'Suele tardar entre 5 y 20 segundos'}</span>
        <span className="reading__secs">{seconds} s</span>
      </p>

      <button type="button" className="reading__cancel" onClick={onCancel}>
        Cancelar
      </button>
    </div>
  )
}
