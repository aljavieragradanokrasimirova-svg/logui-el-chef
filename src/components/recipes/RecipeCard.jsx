import { Link } from 'react-router-dom'
import { Icon } from '../icons/CategoryIcon.jsx'
import Chip from '../ui/Chip.jsx'
import './recipes.css'

function plural(count, singular, pluralWord) {
  return `${count} ${count === 1 ? singular : pluralWord}`
}

export default function RecipeCard({ recipe }) {
  const servings = plural(recipe.servings, 'ración', 'raciones')
  const ingredients = plural(recipe.ingredients.length, 'ingrediente', 'ingredientes')

  return (
    <Link to={'/recetas/' + recipe.id} className="recipe-card">
      <span className="recipe-card__icon">
        <Icon icon={recipe.iconId} size={56} />
      </span>
      <span className="recipe-card__body">
        <span className="recipe-card__name">{recipe.name}</span>
        <span className="recipe-card__meta">
          {servings} · {ingredients}
        </span>
        {recipe.tags.length > 0 && (
          <span className="recipe-card__tags">
            {recipe.tags.map((tag) => (
              <Chip key={tag} className="recipe-card__tag">
                {tag}
              </Chip>
            ))}
          </span>
        )}
      </span>
    </Link>
  )
}
