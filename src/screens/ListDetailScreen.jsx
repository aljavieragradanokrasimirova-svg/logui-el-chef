import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ScreenHeader from '../components/ui/ScreenHeader.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import UiIcon from '../components/icons/UiIcon.jsx'
import CategoryIcon from '../components/icons/CategoryIcon.jsx'
import AddItemSheet from '../components/lists/AddItemSheet.jsx'
import ItemRow from '../components/lists/ItemRow.jsx'
import EditItemModal from '../components/lists/EditItemModal.jsx'
import RenameModal from '../components/lists/RenameModal.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { groupByCategory, listProgress, isComplete } from '../domain/lists.js'
import { formatDate } from '../domain/format.js'
import { CATEGORY_BY_ID } from '../data/categories.js'
import Logui from '../mascot/Logui.jsx'
import { useFlip } from '../components/motion/useFlip.js'
import { haptic } from '../feel/haptics.js'
import { pickLine } from '../data/loguiLines.js'
import { useMascot } from '../mascot/useMascot.js'
import Confetti from '../feel/Confetti.jsx'
import '../components/lists/lists.css'
import { useAppNavigate } from '../feel/viewTransitions.js'

export default function ListDetailScreen() {
  const { listId } = useParams()
  const navigate = useAppNavigate()
  const { state, actions } = useStore()
  const list = state.lists.find((l) => l.id === listId)
  const [editingId, setEditingId] = useState(null)
  const [dialog, setDialog] = useState(null) // 'menu' | 'rename' | null
  const [adding, setAdding] = useState(false)
  const toast = useToast()
  const [burst, setBurst] = useState(0) // confeti al completar
  const [emptyLine] = useState(() => pickLine('emptyList'))
  const done = Boolean(list) && isComplete(list)
  const hasPending = Boolean(list) && list.archivedAt === null && list.items.some((i) => !i.checked)
  const logui = useMascot(done ? 'celebrate' : 'idle', { idleLine: hasPending ? () => pickLine('idle') : null })

  const pendingNames = useMemo(
    () => (list ? list.items.filter((i) => !i.checked).map((i) => i.name) : []),
    [list],
  )

  if (!list) {
    return (
      <main className="screen">
        <ScreenHeader title="Lista" backTo="/listas" />
        <div className="empty">
          <p>Esta lista ya no existe.</p>
          <Link to="/listas" className="btn">Ver mis listas</Link>
        </div>
      </main>
    )
  }

  const archived = list.archivedAt !== null
  const backTo = archived ? '/historial' : '/listas'
  const { checked, total } = listProgress(list)
  const complete = isComplete(list)
  const groups = groupByCategory(list.items)
  const editing = list.items.find((i) => i.id === editingId) ?? null
  const close = () => setDialog(null)
  const archive = () => {
    haptic('tap')
    actions.archiveList(list.id)
    navigate('/listas')
    toast.show({ message: pickLine('listArchived'), detail: list.name, mood: 'wave', duration: 3000 })
  }
  const reuse = () => navigate(`/listas/${actions.reuseList(list.id)}`)

  const toggle = (itemId) => {
    const item = list.items.find((i) => i.id === itemId)
    const completes = item && !item.checked && checked === total - 1
    haptic(completes ? 'success' : 'tap')
    actions.toggleItem(list.id, itemId)
    if (completes) {
      setBurst((n) => n + 1)
      logui.react('celebrate', pickLine('listDone'), 3500)
    } else if (item && !item.checked) {
      // Logui se alegra al marcar; a veces lo comenta (siempre al llegar a la mitad)
      const half = checked + 1 === Math.ceil(total / 2) && total >= 4
      logui.react('wave', half ? '¡Ya vamos por la mitad!' : Math.random() < 0.3 ? pickLine('itemChecked') : '', 1400)
    }
  }

  const closeAdding = (count) => {
    setAdding(false)
    if (count > 0) logui.react('wave', pickLine('itemAdded'), 2600)
  }

  // Borrar no pide confirmación: se puede deshacer desde el aviso durante unos segundos.
  const deleteItem = (item) => {
    const index = list.items.findIndex((i) => i.id === item.id)
    actions.removeItem(list.id, item.id)
    toast.show({
      message: pickLine('itemDeleted'),
      detail: item.name,
      mood: 'think',
      actionLabel: 'Deshacer',
      onAction: () => actions.restoreItem(list.id, item, index),
    })
  }

  const deleteList = () => {
    const index = state.lists.findIndex((l) => l.id === list.id)
    const snapshot = list
    haptic('remove')
    actions.deleteList(list.id)
    navigate(backTo, { replace: true })
    toast.show({
      message: pickLine('listDeleted'),
      detail: snapshot.name,
      mood: 'think',
      actionLabel: 'Deshacer',
      onAction: () => actions.restoreList(snapshot, index),
    })
  }

  return (
    <main className="screen">
      <Confetti burst={burst} />
      <ScreenHeader
        title={list.name}
        backTo={backTo}
        mascot={logui.mood}
        bubble={logui.bubble}
        onMascotTap={() => logui.react('wave', pickLine(complete ? 'listDone' : hasPending ? 'idle' : 'emptyList'), 2600)}
        actions={
          <Button round size="small" aria-label="Opciones de la lista" onClick={() => setDialog('menu')}>
            <UiIcon name="more" />
          </Button>
        }
      >
        <div className="hero-badges">
          <span className="hero-badge">{total === 0 ? 'Sin productos' : `${checked} de ${total}`}</span>
          {groups.length > 0 && (
            <span className="hero-badge hero-badge--butter">
              {groups.length} {groups.length === 1 ? 'pasillo' : 'pasillos'}
            </span>
          )}
          {archived && <span className="hero-badge hero-badge--mint">Archivada</span>}
        </div>
        {total > 0 && <ProgressBar value={checked} max={total} label="Productos comprados" />}
      </ScreenHeader>

      {archived ? (
        <Card tone="butter" className="list-banner">
          <p>Archivada el {formatDate(list.archivedAt)}. No se puede editar.</p>
          <Button variant="primary" size="small" onClick={reuse}>
            <UiIcon name="reuse" size={20} /> Usar de nuevo
          </Button>
        </Card>
      ) : null}

      {complete && !archived && (
        <Card tone="butter" className="list-banner list-banner--done">
          <Logui mood="celebrate" size={76} className="list-banner__logui" />
          <p><strong>¡Todo comprado!</strong> ¿Guardamos la lista en el historial?</p>
          <Button variant="primary" size="small" onClick={archive}>
            <UiIcon name="archive" size={20} /> Archivar
          </Button>
        </Card>
      )}

      {total === 0 && !archived && (
        <div className="empty">
          <Logui mood="think" size={100} />
          <p>
            <strong>{emptyLine}</strong>
            <br />
            Pulsa «Añadir» para apuntar el primer producto.
          </p>
        </div>
      )}

      {groups.map((group) => (
        <Aisle
          key={group.categoryId}
          group={group}
          readOnly={archived}
          onToggle={toggle}
          onEdit={setEditingId}
          onDelete={deleteItem}
        />
      ))}

      <EditItemModal
        item={editing}
        onClose={() => setEditingId(null)}
        onSave={(changes) => {
          actions.updateItem(list.id, editing.id, changes)
          setEditingId(null)
        }}
        onDelete={() => {
          deleteItem(editing)
          setEditingId(null)
        }}
      />

      <Modal open={dialog === 'menu'} onClose={close} title={list.name}>
        <div className="menu">
          {archived ? (
            <Button onClick={reuse}><UiIcon name="reuse" /> Usar de nuevo</Button>
          ) : (
            <>
              <Button onClick={() => setDialog('rename')}><UiIcon name="pencil" /> Cambiar nombre</Button>
              <Button onClick={archive}><UiIcon name="archive" /> Archivar</Button>
            </>
          )}
          <Button onClick={deleteList} style={{ color: 'var(--c-tomato-dark)' }}>
            <UiIcon name="trash" /> Borrar lista
          </Button>
        </div>
      </Modal>

      <RenameModal
        open={dialog === 'rename'}
        name={list.name}
        onClose={close}
        onSave={(name) => {
          actions.renameList(list.id, name)
          close()
        }}
      />

      {!archived && (
        <button type="button" className="fab" onClick={() => setAdding(true)}>
          <UiIcon name="plus" /> Añadir
        </button>
      )}

      <AddItemSheet
        open={adding}
        onClose={closeAdding}
        memory={state.productMemory}
        exclude={pendingNames}
        onAdd={(item) => actions.addItem(list.id, item)}
      />
    </main>
  )
}

/** Un pasillo (categoría) con sus productos; al marcar, el producto se desliza a su nuevo sitio. */
function Aisle({ group, readOnly, onToggle, onEdit, onDelete }) {
  const listRef = useRef(null)
  useFlip(listRef)
  const category = CATEGORY_BY_ID[group.categoryId]
  const left = group.items.filter((i) => !i.checked).length
  return (
    <section className="aisle" style={{ '--aisle-color': category.color }}>
      <h2 className="aisle__title">
        <CategoryIcon categoryId={group.categoryId} size={30} />
        <span>{category.label}</span>
        <span className="aisle__count" aria-label={left ? `${left} pendientes` : 'Todo comprado'}>
          {left || <UiIcon name="check" size={16} strokeWidth={3.5} />}
        </span>
      </h2>
      <ul className="aisle__items" ref={listRef}>
        {group.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            readOnly={readOnly}
            onToggle={() => onToggle(item.id)}
            onEdit={() => onEdit(item.id)}
            onDelete={() => onDelete(item)}
          />
        ))}
      </ul>
    </section>
  )
}
