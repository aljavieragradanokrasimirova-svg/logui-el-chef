import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ScreenHeader from '../components/ui/ScreenHeader.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Modal, { ModalActions } from '../components/ui/Modal.jsx'
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
import '../components/lists/lists.css'

export default function ListDetailScreen() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const { state, actions } = useStore()
  const list = state.lists.find((l) => l.id === listId)
  const [editingId, setEditingId] = useState(null)
  const [dialog, setDialog] = useState(null) // 'menu' | 'rename' | 'delete' | null
  const [adding, setAdding] = useState(false)

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
    actions.archiveList(list.id)
    navigate('/listas')
  }
  const reuse = () => navigate(`/listas/${actions.reuseList(list.id)}`)

  return (
    <main className="screen">
      <ScreenHeader
        title={list.name}
        backTo={backTo}
        mascot={complete ? 'celebrate' : 'idle'}
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
          <p>La lista está vacía. Pulsa «Añadir» para apuntar el primer producto.</p>
        </div>
      )}

      {groups.map((group) => (
        <Aisle
          key={group.categoryId}
          group={group}
          readOnly={archived}
          onToggle={(itemId) => actions.toggleItem(list.id, itemId)}
          onEdit={setEditingId}
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
          actions.removeItem(list.id, editing.id)
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
          <Button onClick={() => setDialog('delete')} style={{ color: 'var(--c-tomato-dark)' }}>
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

      <Modal open={dialog === 'delete'} onClose={close} title="¿Borrar la lista?">
        <p style={{ margin: 0 }}>
          Se borrará «{list.name}» con {total === 1 ? 'su producto' : `sus ${total} productos`}. No se puede deshacer.
        </p>
        <ModalActions>
          <Button size="small" onClick={close}>Cancelar</Button>
          <Button
            size="small"
            variant="primary"
            onClick={() => {
              actions.deleteList(list.id)
              navigate(backTo, { replace: true })
            }}
          >
            Borrar
          </Button>
        </ModalActions>
      </Modal>
      {!archived && (
        <button type="button" className="fab" onClick={() => setAdding(true)}>
          <UiIcon name="plus" /> Añadir
        </button>
      )}

      <AddItemSheet
        open={adding}
        onClose={() => setAdding(false)}
        memory={state.productMemory}
        exclude={pendingNames}
        onAdd={(item) => actions.addItem(list.id, item)}
      />
    </main>
  )
}

/** Un pasillo (categoría) con sus productos; al marcar, el producto se desliza a su nuevo sitio. */
function Aisle({ group, readOnly, onToggle, onEdit }) {
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
          />
        ))}
      </ul>
    </section>
  )
}
