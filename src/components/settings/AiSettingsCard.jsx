import { useId, useState } from 'react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import { PROVIDERS, PROVIDER_BY_ID } from '../../ai/providers.js'
import { loadAiConfig, saveAiConfig } from '../../ai/config.js'
import { testConnection } from '../../ai/testConnection.js'
import { makeTestImage } from '../../ai/image.js'
import '../pickers/pickers.css'
import './settings.css'

const mask = (key) => (key.length > 8 ? `${key.slice(0, 4)}…${key.slice(-4)}` : '••••')

/**
 * Ajustes de «leer recetas desde una foto»: modelo de Gemini y clave de API.
 * Todo se guarda solo en este dispositivo y fuera de las copias de seguridad.
 */
export default function AiSettingsCard() {
  const [config, setConfig] = useState(() => loadAiConfig())
  const [keyText, setKeyText] = useState('')
  const [saved, setSaved] = useState('')
  const [test, setTest] = useState(null) // null | { running } | { ok, ms, message }
  const providerName = useId()
  const modelName = useId()

  const provider = PROVIDER_BY_ID[config.provider]
  const savedKey = config.keys[provider.id]

  function update(next) {
    setConfig(next)
    setSaved(saveAiConfig(next) ? '' : 'Tu navegador no deja guardar la clave.')
  }

  function saveKey(e) {
    e.preventDefault()
    const key = keyText.trim()
    if (!key) return
    update({ ...config, keys: { ...config.keys, [provider.id]: key } })
    setKeyText('')
    setSaved('Clave guardada.')
  }

  async function runTest() {
    setTest({ running: true })
    const result = await testConnection({
      provider: provider.id,
      model: config.models[provider.id],
      apiKey: savedKey,
      image: makeTestImage(),
    })
    setTest(result)
  }

  async function pasteKey() {
    try {
      setKeyText((await navigator.clipboard.readText()).trim())
      setSaved('')
    } catch {
      setSaved('El navegador no deja pegar con el botón: mantén pulsado el campo y elige «Pegar».')
    }
  }

  function removeKey() {
    update({ ...config, keys: { ...config.keys, [provider.id]: '' } })
    setSaved('Clave quitada.')
  }

  return (
    <Card className="settings-card">
      <h2>Recetas desde una foto</h2>
      <p>
        Haz una foto a una receta y la IA la copia con sus ingredientes y pasos. Necesitas una <strong>clave de API</strong>{' '}
        de tu cuenta (no vale la suscripción de chat). Sin clave también puedes usar tu propia app de IA copiando y pegando.
      </p>

      {PROVIDERS.length > 1 && (
      <fieldset className="picker">
        <legend className="picker__label">Proveedor</legend>
        <div className="units">
          {PROVIDERS.map((p) => (
            <label key={p.id} className={`unit${p.id === provider.id ? ' unit--on' : ''}`}>
              <input
                type="radio"
                name={providerName}
                className="sr-only"
                checked={p.id === provider.id}
                onChange={() => update({ ...config, provider: p.id })}
              />
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>
      )}

      <fieldset className="picker">
        <legend className="picker__label">Modelo</legend>
        <div className="units">
          {provider.models.map((m) => (
            <label key={m.id} className={`unit${m.id === config.models[provider.id] ? ' unit--on' : ''}`}>
              <input
                type="radio"
                name={modelName}
                className="sr-only"
                checked={m.id === config.models[provider.id]}
                onChange={() => update({ ...config, models: { ...config.models, [provider.id]: m.id } })}
              />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      {savedKey ? (
        <div className="settings-key">
          <p className="settings-key__saved">
            Clave guardada: <code>{mask(savedKey)}</code>
          </p>
          <div className="settings-key__buttons">
            <Button size="small" variant="primary" onClick={runTest} disabled={test?.running}>
              {test?.running ? 'Probando…' : 'Probar conexión'}
            </Button>
            <Button size="small" onClick={removeKey}>Quitar clave</Button>
          </div>
          {test && !test.running && (
            <p className={test.ok ? 'settings-status' : 'settings-error'} role="status">
              {test.ok ? `✓ Funciona (${(test.ms / 1000).toFixed(1)} s con ${config.models[provider.id]})` : `✗ ${test.message}`}
            </p>
          )}
        </div>
      ) : (
        <form className="settings-key" onSubmit={saveKey}>
          <ol className="settings-steps">
            <li>
              <a className="btn btn--primary btn--small" href={provider.keyUrl} target="_blank" rel="noreferrer">
                {provider.free ? 'Conseguir mi clave gratis' : 'Conseguir mi clave'}
              </a>
              <span>Se abre {new URL(provider.keyUrl).hostname} en otra pestaña: inicia sesión y pulsa «Crear clave».</span>
            </li>
            <li>Copia la clave que te da.</li>
            <li>Vuelve aquí y pégala:</li>
          </ol>
          <label className="label">
            Clave de API de {provider.label}
            <input
              className="field"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder={provider.keyPlaceholder}
              value={keyText}
              onChange={(e) => setKeyText(e.target.value)}
            />
          </label>
          <div className="settings-key__buttons">
            <Button size="small" onClick={pasteKey}>Pegar</Button>
            <Button type="submit" variant="primary" size="small" disabled={!keyText.trim()}>Guardar clave</Button>
          </div>
        </form>
      )}

      <p className="settings-install-hint">{provider.note}</p>
      <p className="settings-install-hint">
        La clave se queda solo en este dispositivo y no entra en las copias de seguridad. Cada foto se envía al proveedor
        elegido para leerla.
      </p>
      {saved && <p className="settings-status" role="status">{saved}</p>}
    </Card>
  )
}
