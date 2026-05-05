import { describe, expect, it } from 'vitest'

import {
  getDragonBallOReplacementPlan,
  getDragonBallReplacementLetterSide,
  hasDragonBallOReplacement,
} from '../dragonBallOReplacement'

function renderPlan(text: string): string {
  const plan = getDragonBallOReplacementPlan(text)

  return Array.from(text.toUpperCase())
    .map((char, index) => {
      if (char === 'O') return 'B'
      return getDragonBallReplacementLetterSide(plan, index) === 'yellow' ? 'Y' : 'R'
    })
    .join('')
}

describe('dragon ball O replacement', () => {
  it('detects replaceable O letters', () => {
    expect(hasDragonBallOReplacement('John')).toBe(true)
    expect(hasDragonBallOReplacement('MATT')).toBe(false)
  })

  it('uses a middle O as the yellow/red separator', () => {
    expect(renderPlan('JOHN')).toBe('YBRR')
    expect(renderPlan('GOKU')).toBe('YBRR')
  })

  it('uses the previous O when the last O is the last letter', () => {
    expect(renderPlan('GOJO')).toBe('YBRB')
  })

  it('falls back to midpoint over non-O letters for edge-only Os', () => {
    expect(renderPlan('OSCAR')).toBe('BYYRR')
    expect(renderPlan('MARIO')).toBe('YYRRB')
    expect(renderPlan('OJO')).toBe('BYB')
  })

  it('uses the last non-edge O when multiple middle Os exist', () => {
    expect(renderPlan('FOOD')).toBe('YBBR')
  })
})
