import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ScreenHeader from '../components/ui/ScreenHeader.jsx'
import UiIcon from '../components/icons/UiIcon.jsx'
import { Icon } from '../components/icons/CategoryIcon.jsx'
import RecipeCard from '../components/recipes/RecipeCard.jsx'
import { useStore } from '../store/StoreProvider.jsx'
import { allTags, filterByTag } from '../domain/recipes.js'
import '../components/recipes/recipes.css'

export default function RecipesScreen() {
  const { state } = useStore()
  const [tag, setTag] = useState(null)

  const tags = useMemo(() => allTags(state.recipes), [state.recipes])

  const recipes = useMemo(() => {
    const filtered = filterByTag(state.recipes, tag ?? '')
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [state.recipes, tag])

  return (
    <main className="screen">
      <ScreenHeader title="Recetas" backTo="/">
        <Link
          to="/recetas/nueva"
          className="btn btn--round btn--small btn--primary"
          aria-label="Nueva receta"
        >
          <UiIcon name="plus" />
        </Link>
      </ScreenHeader>

      {tags.length > 0 && (
        <div className="recipes-filters">
          <button
            type="button"
            className={'chip recipes-filter' + (tag === null ? ' chip--active recipes-filter--active' : '')}
            aria-pressed={tag === null}
            onClick={() => setTag(null)}
          >
            Todas
          </button>
          {tags.map((name) => {
            const active = name === tag
            return (
              <button
                key={name}
                type="button"
                className={'chip recipes-filter' + (active ? ' chip--active recipes-filter--active' : '')}
                aria-pressed={active}
                onClick={() => setTag(active ? null : name)}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}

      {state.recipes.length === 0 ? (
        <div className="empty">
          <Icon icon="pot" size={72} />
          <p>Tu libro de recetas está vacío.</p>
          <Link to="/recetas/nueva" className="btn btn--primary">Crear receta</Link>
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty">
          <p>No hay recetas con esa etiqueta.</p>
        </div>
      ) : (
        <div className="recipes-list">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </main>
  )
}
