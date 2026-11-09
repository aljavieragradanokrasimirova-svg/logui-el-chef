import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ScreenHeader from '../components/ui/ScreenHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Chip from '../components/ui/Chip.jsx'
import Modal, { ModalActions } from '../components/ui/Modal.jsx'
import UiIcon from '../components/icons/UiIcon.jsx'
import CategoryIcon, { Icon } from '../components/icons/CategoryIcon.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { scaleIngredients } from '../domain/recipes.js'
import { formatQuantity } from '../domain/format.js'
import '../components/recipes/recipe-detail.css'

const MAX_SERVINGS = 99

export default function RecipeDetailScreen() {
  const { recipeId } = useParams()
  const { state } = useStore()
  const recipe = state.recipes.find((r) => r.id === recipeId)

  if (!recipe) {
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
  // `key` reinicia las raciones elegidas si se cambia de receta.
  return <RecipeDetail key={recipe.id} recipe={recipe} />
}

function RecipeDetail({ recipe }) {
  const [servings, setServings] = useState(recipe.servings)
  const [adding, setAdding] = useState(false)
  const ingredients = scaleIngredients(recipe, servings)
  const scaled = servings !== recipe.servings

  return (
    <main className="screen">
      <ScreenHeader
        title={recipe.name}
        backTo="/recetas"
        actions={
          <Link to={`/recetas/${recipe.id}/editar`} className="btn btn--round btn--small" aria-label="Editar receta">
            <UiIcon name="pencil" />
          </Link>
        }
      />

      <section className="recipe-hero">
        <span className="recipe-hero__icon"><Icon icon={recipe.iconId} size={88} /></span>
        {recipe.tags.length > 0 && (
          <div className="recipe-hero__tags">
            {recipe.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}
          </div>
        )}
      </section>

      <section className="recipe-servings" aria-label="Raciones">
        <Button round size="small" aria-label="Menos raciones" disabled={servings <= 1} onClick={() => setServings((n) => n - 1)}>
          <span className="recipe-servings__sign" aria-hidden="true">−</span>
        </Button>
        <div className="recipe-servings__value" aria-live="polite">
          <strong>{servings}</strong> {servings === 1 ? 'ración' : 'raciones'}
          {scaled && (
            <button type="button" className="recipe-servings__reset" onClick={() => setServings(recipe.servings)}>
              (receta: {recipe.servings})
            </button>
          )}
        </div>
        <Button round size="small" aria-label="Más raciones" disabled={servings >= MAX_SERVINGS} onClick={() => setServings((n) => n + 1)}>
          <UiIcon name="plus" size={20} />
        </Button>
      </section>

      <section className="card recipe-section">
        <h2>Ingredientes</h2>
        {ingredients.length === 0 ? (
          <p className="recipe-section__empty">Esta receta aún no tiene ingredientes.</p>
        ) : (
          <ul className="recipe-ingredients">
            {ingredients.map((ing) => (
              <li key={ing.id}>
                <CategoryIcon categoryId={ing.categoryId} size={28} />
                <span className="recipe-ingredients__name">{ing.name}</span>
                {ing.quantity != null && <span className="recipe-ingredients__qty">{formatQuantity(ing.quantity, ing.unit)}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {recipe.steps.length > 0 && (
        <section className="card recipe-section">
          <h2>Pasos</h2>
          <ol className="recipe-steps">
            {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </section>
      )}

      {ingredients.length > 0 && (
        <div className="recipe-cta">
          <Button variant="primary" onClick={() => setAdding(true)}>
            <UiIcon name="plus" /> Añadir a una lista
          </Button>
        </div>
      )}

      <AddToListModal open={adding} recipe={recipe} servings={servings} onClose={() => setAdding(false)} />
    </main>
  )
}

const NEW_LIST = '__nueva__'

/** Elegir lista (o crear una) y volcar los ingredientes escalados. */
function AddToListModal({ open, recipe, servings, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Añadir a una lista">
      {open && <AddToListForm recipe={recipe} servings={servings} onClose={onClose} />}
    </Modal>
  )
}

function AddToListForm({ recipe, servings, onClose }) {
  const navigate = useNavigate()
  const { state, actions } = useStore()
  const lists = state.lists
    .filter((l) => l.archivedAt === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const [target, setTarget] = useState(lists[0]?.id ?? NEW_LIST)
  const [newName, setNewName] = useState(recipe.name)

  function submit(e) {
    e.preventDefault()
    let listId = target
    if (target === NEW_LIST) {
      if (!newName.trim()) return
      listId = actions.createList(newName)
    }
    actions.addRecipeToList(recipe.id, listId, servings)
    onClose()
    navigate(`/listas/${listId}`)
  }

  return (
    <form onSubmit={submit} className="add-to-list">
      <p className="add-to-list__hint">
        {recipe.ingredients.length} ingredientes para {servings} {servings === 1 ? 'ración' : 'raciones'}.
        Si ya están en la lista con la misma unidad, se suman.
      </p>
      <fieldset className="add-to-list__options">
        <legend className="sr-only">Lista</legend>
        {lists.map((l) => (
          <label key={l.id} className={`add-to-list__option${target === l.id ? ' add-to-list__option--on' : ''}`}>
            <input type="radio" name="list" value={l.id} checked={target === l.id} onChange={() => setTarget(l.id)} />
            <span>{l.name}</span>
          </label>
        ))}
        <label className={`add-to-list__option${target === NEW_LIST ? ' add-to-list__option--on' : ''}`}>
          <input type="radio" name="list" value={NEW_LIST} checked={target === NEW_LIST} onChange={() => setTarget(NEW_LIST)} />
          <span>Nueva lista</span>
        </label>
      </fieldset>
      {target === NEW_LIST && (
        <input
          className="field"
          aria-label="Nombre de la nueva lista"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          autoComplete="off"
        />
      )}
      <ModalActions>
        <Button size="small" onClick={onClose}>Cancelar</Button>
        <Button size="small" variant="primary" type="submit" disabled={target === NEW_LIST && !newName.trim()}>
          Añadir
        </Button>
      </ModalActions>
    </form>
  )
}
