const COUNT_UNITS = ['ud', 'paquete', 'bote', 'bandeja']
const DECIMAL_UNITS = ['kg', 'l']
const GRAM_UNITS = ['g', 'ml']

const TOLERANCE = 1e-9

function round2(value) {
  return Math.round(value * 100) / 100
}

function stepFor(quantity, unit, direction) {
  if (COUNT_UNITS.includes(unit)) return 1
  if (DECIMAL_UNITS.includes(unit)) return 0.25
  if (GRAM_UNITS.includes(unit)) {
    if (direction > 0) return quantity < 500 ? 50 : 100
    return quantity <= 500 ? 50 : 100
  }
  return 1
}

function initialFor(unit) {
  if (GRAM_UNITS.includes(unit)) return 100
  return 1
}

export function stepQuantity(quantity, unit, direction) {
  const safeUnit = COUNT_UNITS.includes(unit) || DECIMAL_UNITS.includes(unit) || GRAM_UNITS.includes(unit)
    ? unit
    : 'ud'

  if (quantity === null || quantity === undefined) {
    return direction > 0 ? initialFor(safeUnit) : null
  }

  const step = stepFor(quantity, safeUnit, direction)

  if (direction > 0) {
    const next = (Math.floor(quantity / step + TOLERANCE) + 1) * step
    return round2(next)
  }

  const previous = (Math.ceil(quantity / step - TOLERANCE) - 1) * step
  if (previous <= 0) return null
  return round2(previous)
}
