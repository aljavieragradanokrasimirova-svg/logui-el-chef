import { describe, it, expect } from 'vitest'
import { LINES, pickLine } from './loguiLines.js'

const KINDS = [
  'itemAdded', 'itemChecked', 'itemDeleted', 'listDone', 'listArchived', 'listDeleted',
  'emptyList', 'emptyLists', 'emptyRecipes', 'recipeSaved', 'idle',
]
const EMOJI = /\p{Extended_Pictographic}/u

describe('LINES', () => {
  it('tiene todos los tipos con 6-12 frases', () => {
    for (const kind of KINDS) {
      expect(Array.isArray(LINES[kind]), kind).toBe(true)
      expect(LINES[kind].length, kind).toBeGreaterThanOrEqual(6)
      expect(LINES[kind].length, kind).toBeLessThanOrEqual(12)
    }
  })

  it('frases cortas, limpias y sin repetir', () => {
    const all = KINDS.flatMap((k) => LINES[k])
    expect(new Set(all).size).toBe(all.length)
    for (const line of all) {
      expect(typeof line).toBe('string')
      expect(line.length, line).toBeLessThanOrEqual(48)
      expect(line, line).toBe(line.trim())
      expect(line, line).not.toMatch(/["«»\n]/)
      expect(EMOJI.test(line), line).toBe(false)
      expect(line, line).toMatch(/^[¡¿]?[A-ZÁÉÍÓÚÑ]/)
    }
  })
})

describe('pickLine', () => {
  it('elige con random', () => {
    expect(pickLine('itemAdded', { random: () => 0 })).toBe(LINES.itemAdded[0])
    expect(pickLine('itemAdded', { random: () => 0.9999 })).toBe(LINES.itemAdded.at(-1))
  })

  it('evita repetir la anterior', () => {
    expect(pickLine('listDone', { random: () => 0, avoid: LINES.listDone[0] })).toBe(LINES.listDone[1])
    const last = LINES.listDone.at(-1)
    expect(pickLine('listDone', { random: () => 0.9999, avoid: last })).toBe(LINES.listDone[0])
  })

  it('tipo desconocido devuelve vacío', () => {
    expect(pickLine('nada')).toBe('')
    expect(pickLine('itemAdded')).toSatisfy((l) => LINES.itemAdded.includes(l))
  })
})
