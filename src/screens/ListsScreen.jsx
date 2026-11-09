import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ui/ScreenHeader.jsx'
import Button from '../components/ui/Button.jsx'
import UiIcon from '../components/icons/UiIcon.jsx'
import Logui from '../mascot/Logui.jsx'
import RenameModal from '../components/lists/RenameModal.jsx'
import ListCard from '../components/lists/ListCard.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import '../components/lists/lists.css'

export default function ListsScreen() {
  const navigate = useNavigate()
  const { state, actions } = useStore()
  const [creating, setCreating] = useState(false)

  const active = state.lists
    .filter((list) => list.archivedAt === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const archivedCount = state.lists.filter((list) => list.archivedAt !== null).length

  const createButton = (
    <Button variant="primary" onClick={() => setCreating(true)}>
      <UiIcon name="plus" /> Nueva lista
    </Button>
  )

  return (
    <main className="screen">
      <ScreenHeader title="Mis listas" mascot="idle" />

      {active.length > 0 ? (
        <>
          {createButton}
          {active.map((list) => (
            <ListCard key={list.id} list={list} to={`/listas/${list.id}`} />
          ))}
        </>
      ) : (
        <div className="empty">
          <Logui mood="think" size={110} />
          <p>Todavía no tienes listas.</p>
          {createButton}
        </div>
      )}

      {archivedCount > 0 && (
        <Link to="/historial" className="lists-history">
          Ver historial ({archivedCount})
        </Link>
      )}

      <RenameModal
        open={creating}
        title="Nueva lista"
        saveLabel="Crear"
        placeholder="Compra del sábado"
        onClose={() => setCreating(false)}
        onSave={(name) => {
          const id = actions.createList(name)
          setCreating(false)
          navigate(`/listas/${id}`)
        }}
      />
    </main>
  )
}
