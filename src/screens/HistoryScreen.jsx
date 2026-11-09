import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ui/ScreenHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Modal, { ModalActions } from '../components/ui/Modal.jsx'
import UiIcon from '../components/icons/UiIcon.jsx'
import ListCard from '../components/lists/ListCard.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import '../components/lists/lists.css'

export default function HistoryScreen() {
  const navigate = useNavigate()
  const { state, actions } = useStore()
  const [deleting, setDeleting] = useState(null)

  const archived = state.lists
    .filter((list) => list.archivedAt !== null)
    .sort((a, b) => b.archivedAt.localeCompare(a.archivedAt))

  return (
    <main className="screen">
      <ScreenHeader title="Historial" backTo="/" />

      {archived.length > 0 ? (
        archived.map((list) => (
          <ListCard key={list.id} list={list} to={`/listas/${list.id}`}>
            <Button
              variant="primary"
              size="small"
              onClick={() => navigate(`/listas/${actions.reuseList(list.id)}`)}
            >
              <UiIcon name="reuse" size={20} /> Usar de nuevo
            </Button>
            <Button
              round
              size="small"
              aria-label={`Borrar ${list.name}`}
              onClick={() => setDeleting(list)}
            >
              <UiIcon name="trash" />
            </Button>
          </ListCard>
        ))
      ) : (
        <div className="empty">
          <p>Aquí aparecerán las listas que archives.</p>
        </div>
      )}

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="¿Borrar la lista?">
        {deleting && (
          <>
            <p style={{ margin: 0 }}>
              Se borrará «{deleting.name}». No se puede deshacer.
            </p>
            <ModalActions>
              <Button size="small" onClick={() => setDeleting(null)}>Cancelar</Button>
              <Button
                size="small"
                variant="primary"
                onClick={() => {
                  actions.deleteList(deleting.id)
                  setDeleting(null)
                }}
              >
                Borrar
              </Button>
            </ModalActions>
          </>
        )}
      </Modal>
    </main>
  )
}
