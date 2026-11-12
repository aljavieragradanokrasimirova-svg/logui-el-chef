import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ListDetailScreen from './screens/ListDetailScreen.jsx'
import HistoryScreen from './screens/HistoryScreen.jsx'
import RecipeDetailScreen from './screens/RecipeDetailScreen.jsx'
import RecipeEditScreen from './screens/RecipeEditScreen.jsx'
import TabBar from './components/ui/TabBar.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import { ViewTransitions, TABS } from './feel/viewTransitions.js'
import TabPager from './feel/TabPager.jsx'
import ScreenGestures from './feel/ScreenGestures.jsx'

/**
 * Rutas de la app. HashRouter para que funcione en cualquier hosting estático (y como PWA) sin configurar
 * el servidor.
 * Las cuatro pestañas viven juntas en un carrusel (`TabPager`); el resto de pantallas van por rutas.
 */
export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
      <ViewTransitions />
      <ScreenGestures />
      <Screens />
      <TabBar />
      </ToastProvider>
    </HashRouter>
  )
}

function Screens() {
  const { pathname } = useLocation()
  if (TABS.includes(pathname)) return <TabPager />
  return (
    <Routes>
      <Route path="/listas/:listId" element={<ListDetailScreen />} />
      <Route path="/historial" element={<HistoryScreen />} />
      <Route path="/recetas/nueva" element={<RecipeEditScreen />} />
      <Route path="/recetas/:recipeId" element={<RecipeDetailScreen />} />
      <Route path="/recetas/:recipeId/editar" element={<RecipeEditScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
