import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen.jsx'
import ListsScreen from './screens/ListsScreen.jsx'
import ListDetailScreen from './screens/ListDetailScreen.jsx'
import HistoryScreen from './screens/HistoryScreen.jsx'
import RecipesScreen from './screens/RecipesScreen.jsx'
import RecipeDetailScreen from './screens/RecipeDetailScreen.jsx'
import RecipeEditScreen from './screens/RecipeEditScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import TabBar from './components/ui/TabBar.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import { ViewTransitions } from './feel/viewTransitions.js'
import ScreenGestures from './feel/ScreenGestures.jsx'

/**
 * Rutas de la app. HashRouter para que funcione en cualquier hosting estático (y como PWA) sin configurar
 * el servidor.
 */
export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
      <ViewTransitions />
      <ScreenGestures />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/listas" element={<ListsScreen />} />
        <Route path="/listas/:listId" element={<ListDetailScreen />} />
        <Route path="/historial" element={<HistoryScreen />} />
        <Route path="/recetas" element={<RecipesScreen />} />
        <Route path="/recetas/nueva" element={<RecipeEditScreen />} />
        <Route path="/recetas/:recipeId" element={<RecipeDetailScreen />} />
        <Route path="/recetas/:recipeId/editar" element={<RecipeEditScreen />} />
        <Route path="/ajustes" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
      </ToastProvider>
    </HashRouter>
  )
}
