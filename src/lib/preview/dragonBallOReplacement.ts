export type DragonBallLetterSide = 'yellow' | 'red'

export interface DragonBallOReplacementPlan {
  oIndexes: number[]
  letterIndexes: number[]
  separatorOIndex: number | null
  fallbackYellowLetterCount: number
}

export function hasDragonBallOReplacement(text: string): boolean {
  return Array.from(text.toUpperCase()).some((char) => char === 'O')
}

export function getDragonBallOReplacementPlan(text: string): DragonBallOReplacementPlan {
  const chars = Array.from(text.toUpperCase())
  const oIndexes: number[] = []
  const letterIndexes: number[] = []

  chars.forEach((char, index) => {
    if (char === 'O') {
      oIndexes.push(index)
    } else {
      letterIndexes.push(index)
    }
  })

  const middleOIndexes = oIndexes.filter((index) => index > 0 && index < chars.length - 1)

  return {
    oIndexes,
    letterIndexes,
    separatorOIndex: middleOIndexes.at(-1) ?? null,
    fallbackYellowLetterCount: Math.ceil(letterIndexes.length / 2),
  }
}

export function getDragonBallReplacementLetterSide(
  plan: DragonBallOReplacementPlan,
  index: number,
): DragonBallLetterSide | null {
  if (plan.oIndexes.includes(index)) return null

  if (plan.separatorOIndex !== null) {
    return index < plan.separatorOIndex ? 'yellow' : 'red'
  }

  const letterRank = plan.letterIndexes.indexOf(index)
  if (letterRank === -1) return null

  return letterRank < plan.fallbackYellowLetterCount ? 'yellow' : 'red'
}
