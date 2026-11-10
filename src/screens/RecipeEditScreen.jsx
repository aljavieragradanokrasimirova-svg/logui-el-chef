import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ScreenHeader from '../components/ui/ScreenHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Modal, { ModalActions } from '../components/ui/Modal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { haptic } from '../feel/haptics.js'
import { pickLine } from '../data/loguiLines.js'
import UiIcon from '../components/icons/UiIcon.jsx'
import CategoryIcon, { Icon } from '../components/icons/CategoryIcon.jsx'
import ItemFields from '../components/pickers/ItemFields.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { ICON_IDS_RECIPE, DEFAULT_RECIPE_ICON } from '../domain/recipes.js'
import { suggestProducts } from '../domain/products.js'
import { normalizeName } from '../domain/normalize.js'
import { CATEGORY_BY_ID, DEFAULT_CATEGORY } from '../data/categories.js'
import { DEFAULT_UNIT } from '../data/units.js'
import { formatQuantity } from '../domain/format.js'
import '../components/recipes/recipe-detail.css'
import { useAppNavigate } from '../feel/viewTransitions.js'

const ICON_LABELS = { pot: 'Olla', pan: 'Sartén', salad: 'Ensalada', cake: 'Tarta', soup: 'Sopa', pasta: 'Pasta' }

/** Crear (`/recetas/nueva`) o editar (`/recetas/:recipeId/editar`) una receta. */
export default function RecipeEditScreen() {
  const { recipeId } = useParams()
  const { state } = useStore()
  const location = useLocation()
  const recipe = recipeId ? state.recipes.find((r) => r.id === recipeId) : null
  const imported = recipeId ? null : location.state

  if (recipeId && !recipe) {
    return (
      <main className="screen">
        <ScreenHeader title="Receta" backTo="/recetas" />
        <div className="empty">
          <p>Esta receta ya no existe.</p>
          <Link to="/recetas" className="btn">Ver recetas</Link>
        </div>
      </main>
    )
  }
  return <RecipeForm key={recipeId ?? (imported?.draft ? 'foto' : 'nueva')} recipe={recipe} draft={imported?.draft} warnings={imported?.warnings} />
}

let rowCounter = 0
const rowKey = () => `row-${++rowCounter}`

function toRows(recipe) {
  return (recipe?.ingredients ?? []).map((i) => ({
    key: i.id,
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    unit: i.unit,
    categoryId: i.categoryId,
  }))
}

const emptyRow = () => ({ key: rowKey(), name: '', quantity: null, unit: DEFAULT_UNIT, categoryId: DEFAULT_CATEGORY })

function RecipeForm({ recipe, draft, warnings = [] }) {
  const navigate = useAppNavigate()
  const { state, actions } = useStore()
  const editing = Boolean(recipe)
  const source = recipe ?? draft // al crear desde una foto, el borrador hace de receta inicial
  const [name, setName] = useState(source?.name ?? '')
  const [iconId, setIconId] = useState(source?.iconId ?? DEFAULT_RECIPE_ICON)
  const [tags, setTags] = useState(source?.tags.join(', ') ?? '')
  const [servings, setServings] = useState(String(source?.servings ?? 2))
  const [rows, setRows] = useState(() => (source ? toRows(source) : [emptyRow()]))
  const [steps, setSteps] = useState(() => (source?.steps.length ? source.steps : ['']))
  const toast = useToast()
  const [detailsKey, setDetailsKey] = useState(null) // fila cuyo pasillo/cantidad/unidad se está editando
  const detailsRow = rows.find((r) => r.key === detailsKey) ?? null
  const lastRowRef = useRef(null)

  const updateRow = (key, changes) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...changes } : r)))

  /** Al salir del nombre, si coincide con un producto conocido, rellena categoría y unidad aún sin tocar. */
  function autofill(row) {
    if (row.categoryId !== DEFAULT_CATEGORY || row.unit !== DEFAULT_UNIT) return
    const match = suggestProducts(row.name, { memory: state.productMemory, limit: 6 }).find(
      (s) => normalizeName(s.name) === normalizeName(row.name),
    )
    if (match) updateRow(row.key, { categoryId: match.categoryId, unit: match.unit })
  }

  // Al añadir una fila, el foco pasa a su nombre (no al montar ni al quitar filas).
  const rowCount = useRef(rows.length)
  useEffect(() => {
    if (rows.length > rowCount.current) lastRowRef.current?.focus()
    rowCount.current = rows.length
  }, [rows.length])

  const addRow = () => setRows((rs) => [...rs, emptyRow()])

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const id = actions.saveRecipe({
      id: recipe?.id,
      name,
      iconId,
      tags: tags.split(','),
      servings,
      ingredients: rows.map(({ key, ...ing }) => ing),
      steps,
    })
    haptic('tap')
    toast.show({ message: pickLine('recipeSaved'), detail: name.trim(), mood: 'celebrate', duration: 2500 })
    navigate(`/recetas/${id}`, { replace: true })
  }

  // Sin confirmación: el aviso deja deshacerlo unos segundos.
  function remove() {
    const index = state.recipes.findIndex((r) => r.id === recipe.id)
    const snapshot = recipe
    haptic('remove')
    actions.deleteRecipe(recipe.id)
    navigate('/recetas', { replace: true })
    toast.show({
      message: '¡Receta al cubo!',
      detail: snapshot.name,
      mood: 'think',
      actionLabel: 'Deshacer',
      onAction: () => actions.restoreRecipe(snapshot, index),
    })
  }

  return (
    <main className="screen">
      <ScreenHeader title={editing ? 'Editar receta' : 'Nueva receta'} backTo={editing ? `/recetas/${recipe.id}` : '/recetas'} />

      {draft && (
        <Card tone="butter" className="recipe-import">
          <h2>Leída de la foto</h2>
          <p>Comprueba que todo está bien antes de guardar: la IA puede equivocarse con letra pequeña o borrosa.</p>
          {warnings.length > 0 && (
            <ul>
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          )}
        </Card>
      )}

      <form className="recipe-form" onSubmit={submit}>
        <label className="label">
          Nombre
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tortilla de patatas" autoComplete="off" />
        </label>

        <fieldset className="recipe-form__icons">
          <legend className="label">Icono</legend>
          {ICON_IDS_RECIPE.map((id) => (
            <label key={id} className={`recipe-form__icon${iconId === id ? ' recipe-form__icon--on' : ''}`} title={ICON_LABELS[id]}>
              <input type="radio" name="icon" value={id} checked={iconId === id} onChange={() => setIconId(id)} className="sr-only" aria-label={ICON_LABELS[id]} />
              <Icon icon={id} size={44} />
            </label>
          ))}
        </fieldset>

        <div className="recipe-form__pair">
          <label className="label">
            Raciones
            <input className="field" inputMode="numeric" value={servings} onChange={(e) => setServings(e.target.value)} />
          </label>
          <label className="label">
            Etiquetas
            <input className="field" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="cena, rápida" autoComplete="off" />
          </label>
        </div>

        <section className="recipe-form__block">
          <h2>Ingredientes</h2>
          {rows.map((row, i) => (
            <div key={row.key} className="ingredient-row">
              <input
                ref={i === rows.length - 1 ? lastRowRef : undefined}
                className="field ingredient-row__name"
                aria-label={`Ingrediente ${i + 1}`}
                placeholder="Ingrediente"
                value={row.name}
                onChange={(e) => updateRow(row.key, { name: e.target.value })}
                onBlur={() => autofill(row)}
                autoComplete="off"
              />
              <button
                type="button"
                className="ingredient-row__details"
                style={{ '--tile-color': CATEGORY_BY_ID[row.categoryId].color }}
                aria-label={`Pasillo y cantidad del ingrediente ${i + 1}`}
                onClick={() => setDetailsKey(row.key)}
              >
                <CategoryIcon categoryId={row.categoryId} size={24} />
                <span>{CATEGORY_BY_ID[row.categoryId].short}</span>
                <span className="ingredient-row__qty">{formatQuantity(row.quantity, row.unit) || 'sin cantidad'}</span>
                <UiIcon name="pencil" size={18} />
              </button>
              <button type="button" className="ingredient-row__remove" aria-label={`Quitar ingrediente ${i + 1}`} onClick={() => setRows((rs) => rs.filter((r) => r.key !== row.key))}>
                <UiIcon name="close" size={20} />
              </button>
            </div>
          ))}
          <Button size="small" onClick={addRow}><UiIcon name="plus" size={20} /> Añadir ingrediente</Button>
        </section>

        <section className="recipe-form__block">
          <h2>Pasos</h2>
          {steps.map((step, i) => (
            <div key={i} className="step-row">
              <span className="step-row__n" aria-hidden="true">{i + 1}</span>
              <textarea
                className="field step-row__text"
                aria-label={`Paso ${i + 1}`}
                rows={2}
                value={step}
                onChange={(e) => setSteps((ss) => ss.map((s, j) => (j === i ? e.target.value : s)))}
              />
              <button type="button" className="ingredient-row__remove" aria-label={`Quitar paso ${i + 1}`} onClick={() => setSteps((ss) => ss.filter((_, j) => j !== i))}>
                <UiIcon name="close" size={20} />
              </button>
            </div>
          ))}
          <Button size="small" onClick={() => setSteps((ss) => [...ss, ''])}><UiIcon name="plus" size={20} /> Añadir paso</Button>
        </section>

        <div className="recipe-form__actions">
          {editing && (
            <Button variant="ghost" onClick={remove} style={{ color: 'var(--c-tomato-dark)', marginRight: 'auto' }}>
              <UiIcon name="trash" /> Borrar
            </Button>
          )}
          <Button variant="primary" type="submit" disabled={!name.trim()}>Guardar receta</Button>
        </div>
      </form>

      <Modal
        open={Boolean(detailsRow)}
        onClose={() => setDetailsKey(null)}
        title={detailsRow?.name.trim() || 'Ingrediente'}
        variant="sheet"
      >
        {detailsRow && (
          <>
            <ItemFields value={detailsRow} onChange={(changes) => updateRow(detailsRow.key, changes)} />
            <ModalActions>
              <Button variant="primary" onClick={() => setDetailsKey(null)}>Listo</Button>
            </ModalActions>
          </>
        )}
      </Modal>

    </main>
  )
}
