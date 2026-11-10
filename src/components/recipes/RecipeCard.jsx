import { Link } from 'react-router-dom'
import { Icon } from '../icons/CategoryIcon.jsx'
import { RECIPE_ICON_COLORS, DEFAULT_RECIPE_COLOR } from '../../data/recipeIcons.js'
import './recipes.css'

const MAX_TAGS = 2

/**
 * Baldosa de receta para el libro: dibujo grande sobre su color, nombre, raciones e ingredientes y etiquetas.
 */
export default function RecipeCard({ recipe }) {
  const color = RECIPE_ICON_COLORS[recipe.iconId] ?? DEFAULT_RECIPE_COLOR
  const n = recipe.ingredients.length
  return (
    <Link to={'/recetas/' + recipe.id} className="recipe-card" data-vt-expand="" style={{ '--recipe-color': color }}>
      <span className="recipe-card__art">
        <Icon icon={recipe.iconId} size={64} />
        <span className="recipe-card__servings" aria-label={`${recipe.servings} raciones`}>
          {recipe.servings} {recipe.servings === 1 ? 'ración' : 'rac.'}
        </span>
      </span>
      <span className="recipe-card__body">
        <span className="recipe-card__name">{recipe.name}</span>
        <span className="recipe-card__meta">
          {n === 0 ? 'Sin ingredientes' : `${n} ${n === 1 ? 'ingrediente' : 'ingredientes'}`}
        </span>
        {recipe.tags.length > 0 && (
          <span className="recipe-card__tags">
            {recipe.tags.slice(0, MAX_TAGS).map((tag) => (
              <span key={tag} className="recipe-card__tag">{tag}</span>
            ))}
            {recipe.tags.length > MAX_TAGS && <span className="recipe-card__tag">+{recipe.tags.length - MAX_TAGS}</span>}
          </span>
        )}
      </span>
    </Link>
  )
}
