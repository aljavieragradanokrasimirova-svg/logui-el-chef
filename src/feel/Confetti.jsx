import { useEffect, useMemo, useState } from 'react'
import { prefersReducedMotion } from '../components/motion/useFlip.js'

const COLORS = ['var(--c-tomato)', 'var(--c-butter)', 'var(--c-mint)', 'var(--c-caramel)', '#8FC9F0', '#F4A3B8']
const SHAPES = ['round', 'square', 'strip', 'star']
const PIECES = 34
const LIFE_MS = 1900

/** Números pseudoaleatorios con semilla: cada ráfaga distinta, pero sin depender de Math.random en el render. */
function seeded(seed) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

/**
 * Ráfaga de confeti desde arriba al completar una lista. Se monta con una `burst` nueva (número) y
 * desaparece sola. Con «reducir animaciones» no se pinta.
 */
export default function Confetti({ burst }) {
  const [visible, setVisible] = useState(Boolean(burst))

  useEffect(() => {
    if (!burst) return undefined
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), LIFE_MS)
    return () => clearTimeout(timer)
  }, [burst])

  const pieces = useMemo(() => {
    const rand = seeded(burst || 1)
    return Array.from({ length: PIECES }, (_, i) => {
      const angle = -Math.PI / 2 + (rand() - 0.5) * Math.PI * 1.1
      const power = 140 + rand() * 220
      return {
        id: i,
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power,
        fall: 260 + rand() * 260,
        spin: (rand() - 0.5) * 900,
        delay: rand() * 120,
        color: COLORS[i % COLORS.length],
        shape: SHAPES[Math.floor(rand() * SHAPES.length)],
        size: 8 + rand() * 8,
      }
    })
  }, [burst])

  if (!burst || !visible || prefersReducedMotion()) return null
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`confetti__piece confetti__piece--${p.shape}`}
          style={{
            '--x': `${p.x}px`,
            '--y': `${p.y}px`,
            '--fall': `${p.fall}px`,
            '--spin': `${p.spin}deg`,
            '--size': `${p.size}px`,
            background: p.shape === 'star' ? 'none' : p.color,
            color: p.color,
            animationDelay: `${p.delay}ms`,
          }}
        >
          {p.shape === 'star' ? '★' : null}
        </span>
      ))}
    </div>
  )
}
