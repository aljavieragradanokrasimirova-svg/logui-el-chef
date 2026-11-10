import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/baloo-2/800.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/feel.css'
import App from './App.jsx'
import { keepFocusedFieldVisible } from './feel/keyboard.js'
import { StoreProvider } from './store/StoreProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)

keepFocusedFieldVisible()

// iOS solo aplica :active (el estado «pulsado») si hay algún escuchador de toques en la página.
document.addEventListener('touchstart', () => {}, { passive: true })

// Service worker solo en producción (en desarrollo interferiría con la recarga en caliente).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Sin service worker la app sigue funcionando, solo que no sin conexión.
    })
  })
}
