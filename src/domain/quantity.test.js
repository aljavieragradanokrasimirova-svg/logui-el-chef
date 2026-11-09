import { describe, it, expect } from 'vitest'
import { stepQuantity } from './quantity.js'

describe('stepQuantity', () => {
  it.each([
    // sin cantidad
    [null, 'ud', 1, 1],
    [null, 'paquete', 1, 1],
    [null, 'kg', 1, 1],
    [null, 'l', 1, 1],
    [null, 'g', 1, 100],
    [null, 'ml', 1, 100],
    [null, 'ud', -1, null],
    [null, 'g', -1, null],
    // unidades sueltas
    [2, 'ud', 1, 3],
    [2, 'ud', -1, 1],
    [1, 'ud', -1, null],
    [1.5, 'ud', 1, 2],
    [1.5, 'ud', -1, 1],
    [3, 'bandeja', 1, 4],
    [1, 'bote', -1, null],
    // kilos y litros
    [1, 'kg', 1, 1.25],
    [1, 'kg', -1, 0.75],
    [0.33, 'kg', 1, 0.5],
    [0.33, 'kg', -1, 0.25],
    [0.75, 'l', 1, 1],
    [0.75, 'l', -1, 0.5],
    [0.25, 'kg', -1, null],
    [0.1, 'kg', -1, null],
    [0.1, 'kg', 1, 0.25],
    // gramos y mililitros
    [100, 'g', 1, 150],
    [480, 'g', 1, 500],
    [500, 'g', 1, 600],
    [520, 'g', 1, 600],
    [600, 'g', -1, 500],
    [550, 'g', -1, 500],
    [500, 'g', -1, 450],
    [50, 'g', -1, null],
    [30, 'ml', 1, 50],
    [30, 'ml', -1, null],
    [1000, 'ml', 1, 1100],
    // unidad desconocida = ud
    [2, 'docena', 1, 3],
    [null, undefined, 1, 1],
  ])('stepQuantity(%j, %j, %j) → %j', (q, unit, dir, expected) => {
    expect(stepQuantity(q, unit, dir)).toBe(expected)
  })
})
