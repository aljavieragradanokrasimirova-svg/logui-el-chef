import { useRef, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { manualPrompt, parseManualReply } from '../../ai/manual.js'
import { AiError } from '../../ai/errors.js'
import { useAppNavigate } from '../../feel/viewTransitions.js'

/**
 * Importar sin claves: el usuario copia las instrucciones, usa su propia app de IA con la foto,
 * copia la respuesta y la pega aquí. Logui la convierte en receta y abre el formulario para revisarla.
 */
export default function ManualImportSheet({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Con tu propia app de IA" variant="sheet">
      {open && <ManualBody onClose={onClose} />}
    </Modal>
  )
}

function ManualBody({ onClose }) {
  const navigate = useAppNavigate()
  const promptRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [reply, setReply] = useState('')
  const [error, setError] = useState('')

  async function copy() {
    try {
      await navigator.clipboard.writeText(manualPrompt())
      setCopied(true)
    } catch {
      // sin permiso de portapapeles: se deja el texto seleccionado para copiarlo a mano
      promptRef.current?.select()
      setCopied(false)
      setError('No pude copiar solo: el texto está seleccionado, cópialo tú.')
    }
  }

  function create(e) {
    e.preventDefault()
    setError('')
    try {
      const { draft, warnings } = parseManualReply(reply)
      onClose()
      navigate('/recetas/nueva', { state: { draft, warnings } })
    } catch (err) {
      setError(
        err instanceof AiError && err.code === 'invalid'
          ? 'No encuentro la receta en lo que pegaste. Pídele a la IA que responda solo con el bloque JSON y vuelve a copiarlo.'
          : err instanceof AiError
            ? err.message
            : 'No se pudo leer lo que pegaste.',
      )
    }
  }

  return (
    <form className="manual" onSubmit={create}>
      <ol className="manual__steps">
        <li>
          <strong>Copia las instrucciones.</strong>
          <Button size="small" onClick={copy}>{copied ? 'Copiadas ✓' : 'Copiar instrucciones'}</Button>
          <textarea ref={promptRef} className="manual__prompt" readOnly value={manualPrompt()} aria-label="Instrucciones" rows={3} />
        </li>
        <li>
          <strong>Abre tu app de IA</strong> (Claude, ChatGPT, Gemini…), adjunta la foto de la receta y pega las instrucciones.
        </li>
        <li>
          <strong>Copia su respuesta y pégala aquí:</strong>
          <textarea
            className="field manual__reply"
            aria-label="Respuesta de la IA"
            placeholder="Pega aquí lo que te contestó"
            rows={5}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
        </li>
      </ol>
      {error && <p className="manual__error" role="alert">{error}</p>}
      <Button type="submit" variant="primary" disabled={!reply.trim()}>Crear receta</Button>
    </form>
  )
}
