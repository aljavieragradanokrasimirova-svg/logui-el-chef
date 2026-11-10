import ScreenHeader from '../components/ui/ScreenHeader.jsx'
import Button from '../components/ui/Button.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import UiIcon from '../components/icons/UiIcon.jsx'
import ListCard from '../components/lists/ListCard.jsx'
import Logui from '../mascot/Logui.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { haptic } from '../feel/haptics.js'
import { pickLine } from '../data/loguiLines.js'
import '../components/lists/lists.css'
import { useAppNavigate } from '../feel/viewTransitions.js'

export default function HistoryScreen() {
  const navigate = useAppNavigate()
  const { state, actions } = useStore()
  const toast = useToast()

  const remove = (list) => {
    const index = state.lists.findIndex((l) => l.id === list.id)
    haptic('remove')
    actions.deleteList(list.id)
    toast.show({
      message: pickLine('listDeleted'),
      detail: list.name,
      mood: 'think',
      actionLabel: 'Deshacer',
      onAction: () => actions.restoreList(list, index),
    })
  }

  const archived = state.lists
    .filter((list) => list.archivedAt !== null)
    .sort((a, b) => b.archivedAt.localeCompare(a.archivedAt))

  return (
    <main className="screen">
      <ScreenHeader title="Historial" backTo="/listas" backLabel="Volver a mis listas" />

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
              onClick={() => remove(list)}
            >
              <UiIcon name="trash" />
            </Button>
          </ListCard>
        ))
      ) : (
        <div className="empty">
          <Logui mood="idle" size={110} />
          <p>Aquí aparecerán las listas que archives.</p>
        </div>
      )}

    </main>
  )
}
