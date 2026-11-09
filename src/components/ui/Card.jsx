import './ui.css'

export default function Card({ tone = 'white', className = '', as: Tag = 'div', ...props }) {
  const classes = ['card', tone === 'butter' && 'card--butter', className].filter(Boolean).join(' ')
  return <Tag className={classes} {...props} />
}
