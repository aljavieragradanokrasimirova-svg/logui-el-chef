import './ui.css'

export default function Chip({ active = false, color, className = '', style, ...props }) {
  const classes = ['chip', active && 'chip--active', className].filter(Boolean).join(' ')
  return <span className={classes} style={color ? { background: color, ...style } : style} {...props} />
}
