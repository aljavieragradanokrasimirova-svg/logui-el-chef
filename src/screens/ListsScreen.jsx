import ScreenHeader from '../components/ui/ScreenHeader.jsx'

/** Provisional: se construye en las tareas de la capa 1. */
export default function ListsScreen() {
  return (
    <main className="screen">
      <ScreenHeader title="Mis listas" backTo="/" />
      <p className="empty">En construcción…</p>
    </main>
  )
}
