import { describe, it, expect } from 'vitest'
import { formatQuantity, formatDate } from './format.js'

describe('formatQuantity', () => {
  it.each([
    [null, 'kg', ''],
    [1.5, 'kg', '1,5 kg'],
    [2, 'ud', '2 ud'],
    [0.25, 'l', '0,25 l'],
    [3, 'paquete', '3 paq.'],
  ])('%j %s → %j', (q, u, expected) => {
    expect(formatQuantity(q, u)).toBe(expected)
  })
})

describe('formatDate', () => {
  const now = '2026-11-09T12:00:00.000Z'
  it('omite el año si es el actual', () => {
    expect(formatDate('2026-03-15T12:00:00.000Z', now)).toBe('15 mar')
  })
  it('muestra el año si es otro', () => {
    expect(formatDate('2025-03-15T12:00:00.000Z', now)).toBe('15 mar 2025')
  })
  it('fecha no válida → vacío', () => {
    expect(formatDate('nada', now)).toBe('')
  })
})
