import './ui.css'

/**
 * Botón con contorno grueso y sombra dura.
 * variant: 'default' | 'primary' | 'accent' | 'ghost'
 * size: 'normal' | 'small'
 * round: botón circular para iconos
 */
export default function Button({ variant = 'default', size = 'normal', round = false, className = '', ...props }) {
  const classes = [
    'btn',
    variant !== 'default' && `btn--${variant}`,
    size === 'small' && 'btn--small',
    round && 'btn--round',
    className,
  ].filter(Boolean).join(' ')
  return <button type="button" className={classes} {...props} />
}
