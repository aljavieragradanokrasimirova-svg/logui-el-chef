import { useRef, useState } from 'react'
import ScreenHeader from '../components/ui/ScreenHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Modal, { ModalActions } from '../components/ui/Modal.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { exportBackup, parseBackup } from '../store/storage.js'
import { useInstallPrompt } from '../pwa/useInstallPrompt.js'
import AiSettingsCard from '../components/settings/AiSettingsCard.jsx'
import '../components/settings/settings.css'

const listCount = (n) => `${n} ${n === 1 ? 'lista' : 'listas'}`
const recipeCount = (n) => `${n} ${n === 1 ? 'receta' : 'recetas'}`

function backupFileName() {
  const today = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `logui-copia-${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}.json`
}

export default function SettingsScreen() {
  const { state, actions, saveFailed } = useStore()
  const fileInput = useRef(null)
  const [pending, setPending] = useState(null)
  const [dialog, setDialog] = useState(null) // 'replace' | 'delete' | null
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const { canInstall, installed, install } = useInstallPrompt()
  const [installStatus, setInstallStatus] = useState('')

  const reduceMotion = state.settings.reduceMotion

  const toggleMotion = () => {
    actions.updateSettings({ reduceMotion: !reduceMotion })
  }

  const handleInstall = async () => {
    const outcome = await install()
    if (outcome === 'accepted') setInstallStatus('¡Instalada!')
  }

  const handleExport = () => {
    const blob = new Blob([exportBackup(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName()
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const imported = parseBackup(await file.text())
      setError('')
      setStatus('')
      setPending(imported)
      setDialog('replace')
    } catch (err) {
      setError(err.message)
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const close = () => setDialog(null)

  return (
    <main className="screen">
      <ScreenHeader title="Ajustes" />

      {saveFailed && (
        <Card tone="butter" className="settings-notice">
          <p>Tu navegador no deja guardar los datos. Exporta una copia para no perderlos.</p>
        </Card>
      )}

      <Card className="settings-card">
        <h2>Instalar</h2>
        {installStatus ? (
          // Fuera de las otras ramas: install() pone canInstall a false antes de devolver el resultado.
          <p className="settings-install-status" role="status">
            {installStatus}
          </p>
        ) : installed ? (
          <p>Logui ya está instalada en este dispositivo.</p>
        ) : canInstall ? (
          <>
            <p>Añádela a tu pantalla de inicio para abrirla como una app, también sin conexión.</p>
            <Button variant="primary" className="settings-install" onClick={handleInstall}>
              Instalar la app
            </Button>
          </>
        ) : (
          <p className="settings-install-hint">
            Para instalarla, usa la opción «Añadir a pantalla de inicio» o «Instalar» del menú de tu
            navegador.
          </p>
        )}
      </Card>

      <Card className="settings-card">
        <h2>Animaciones</h2>
        <button
          type="button"
          role="switch"
          aria-checked={reduceMotion}
          className="settings-switch"
          onClick={toggleMotion}
        >
          <span className="settings-switch__text">
            <span className="settings-switch__label">Reducir animaciones</span>
            <span className="settings-switch__hint">Quita los rebotes y movimientos.</span>
          </span>
          <span className="settings-switch__track" aria-hidden="true">
            <span className="settings-switch__thumb" />
          </span>
        </button>
      </Card>

      <AiSettingsCard />

      <Card className="settings-card">
        <h2>Copia de seguridad</h2>
        <p>Tienes {listCount(state.lists.length)} y {recipeCount(state.recipes.length)}.</p>
        <div className="settings-actions">
          <Button onClick={handleExport}>Exportar copia</Button>
          <Button onClick={() => fileInput.current?.click()}>Importar copia</Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Importar copia de seguridad"
          onChange={handleFile}
        />
        {error && (
          <p className="settings-error" role="alert">
            {error}
          </p>
        )}
      </Card>

      <Card className="settings-card">
        <h2>Borrar datos</h2>
        <Button className="settings-danger" onClick={() => setDialog('delete')}>
          Borrar todos los datos
        </Button>
      </Card>

      {status && (
        <p className="settings-status" role="status">
          {status}
        </p>
      )}

      <Modal open={dialog === 'replace'} onClose={close} title="¿Reemplazar tus datos?">
        {pending && (
          <>
            <p style={{ margin: 0 }}>
              Se sustituirán tus listas y recetas por las de la copia (
              {listCount(pending.lists.length)}, {recipeCount(pending.recipes.length)}).
            </p>
            <ModalActions>
              <Button size="small" onClick={close}>
                Cancelar
              </Button>
              <Button
                size="small"
                variant="primary"
                onClick={() => {
                  actions.replaceState(pending)
                  setPending(null)
                  close()
                  setStatus('Copia importada.')
                }}
              >
                Reemplazar
              </Button>
            </ModalActions>
          </>
        )}
      </Modal>

      <Modal open={dialog === 'delete'} onClose={close} title="¿Borrar todo?">
        <p style={{ margin: 0 }}>
          Se borrarán todas tus listas, recetas y productos recordados. No se puede deshacer.
        </p>
        <ModalActions>
          <Button size="small" onClick={close}>
            Cancelar
          </Button>
          <Button
            size="small"
            variant="primary"
            onClick={() => {
              actions.resetState()
              close()
              setStatus('Datos borrados.')
            }}
          >
            Borrar todo
          </Button>
        </ModalActions>
      </Modal>
    </main>
  )
}
