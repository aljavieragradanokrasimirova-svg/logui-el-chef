import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen.jsx'
import ListsScreen from './screens/ListsScreen.jsx'
import ListDetailScreen from './screens/ListDetailScreen.jsx'
import HistoryScreen from './screens/HistoryScreen.jsx'

/**
 * Rutas de la app. HashRouter para que funcione en cualquier hosting estático (y como PWA) sin configurar
 * el servidor.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/listas" element={<ListsScreen />} />
        <Route path="/listas/:listId" element={<ListDetailScreen />} />
        <Route path="/historial" element={<HistoryScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
