import { describe, it, expect } from 'vitest'
import { normalizeName } from './normalize.js'

describe('normalizeName', () => {
  it('quita tildes, mayúsculas y espacios sobrantes', () => {
    expect(normalizeName('  Plátano   de Canarias ')).toBe('platano de canarias')
  })
  it('acepta valores vacíos', () => {
    expect(normalizeName(undefined)).toBe('')
  })
})
