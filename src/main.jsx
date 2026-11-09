import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/baloo-2/800.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.jsx'
import { StoreProvider } from './store/StoreProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
