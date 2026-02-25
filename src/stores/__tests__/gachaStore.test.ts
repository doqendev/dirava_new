import { describe, it, expect, beforeEach } from 'vitest'
import { useGachaStore, getRarityStyles, getBoxThemeColor } from '../gachaStore'
import type { Rarity } from '@/types/gacha'

describe('gachaStore', () => {
  beforeEach(() => {
    useGachaStore.getState().reset()
  })

  it('has correct initial state', () => {
    const state = useGachaStore.getState()
    expect(state.phase).toBe('idle')
    expect(state.currentCode).toBeNull()
    expect(state.result).toBeNull()
    expect(state.isAnimating).toBe(false)
    expect(state.skipRequested).toBe(false)
    expect(state.isMuted).toBe(false)
    expect(state.isClaimOpen).toBe(false)
    expect(state.error).toBeNull()
    expect(state.isLoading).toBe(false)
  })

  it('setCode updates code', () => {
    useGachaStore.getState().setCode('TEST-CODE')
    expect(useGachaStore.getState().currentCode).toBe('TEST-CODE')
  })

  it('setPhase updates phase', () => {
    useGachaStore.getState().setPhase('shake')
    expect(useGachaStore.getState().phase).toBe('shake')
  })

  it('toggleMute toggles muted state', () => {
    expect(useGachaStore.getState().isMuted).toBe(false)
    useGachaStore.getState().toggleMute()
    expect(useGachaStore.getState().isMuted).toBe(true)
    useGachaStore.getState().toggleMute()
    expect(useGachaStore.getState().isMuted).toBe(false)
  })

  it('openClaim and closeClaim control claim state', () => {
    useGachaStore.getState().openClaim()
    expect(useGachaStore.getState().isClaimOpen).toBe(true)
    useGachaStore.getState().closeClaim()
    expect(useGachaStore.getState().isClaimOpen).toBe(false)
  })

  it('canSkip returns true during skippable phases when animating', () => {
    useGachaStore.setState({ isAnimating: true, phase: 'intro' })
    expect(useGachaStore.getState().canSkip()).toBe(true)

    useGachaStore.setState({ phase: 'shake' })
    expect(useGachaStore.getState().canSkip()).toBe(true)

    useGachaStore.setState({ phase: 'open' })
    expect(useGachaStore.getState().canSkip()).toBe(true)

    useGachaStore.setState({ phase: 'rarity-reveal' })
    expect(useGachaStore.getState().canSkip()).toBe(true)
  })

  it('canSkip returns false during non-skippable phases', () => {
    useGachaStore.setState({ isAnimating: true, phase: 'idle' })
    expect(useGachaStore.getState().canSkip()).toBe(false)

    useGachaStore.setState({ phase: 'item-reveal' })
    expect(useGachaStore.getState().canSkip()).toBe(false)

    useGachaStore.setState({ phase: 'celebration' })
    expect(useGachaStore.getState().canSkip()).toBe(false)

    useGachaStore.setState({ phase: 'complete' })
    expect(useGachaStore.getState().canSkip()).toBe(false)
  })

  it('canSkip returns false when not animating', () => {
    useGachaStore.setState({ isAnimating: false, phase: 'intro' })
    expect(useGachaStore.getState().canSkip()).toBe(false)
  })

  it('requestSkip sets skipRequested when canSkip is true', () => {
    useGachaStore.setState({ isAnimating: true, phase: 'shake' })
    useGachaStore.getState().requestSkip()
    expect(useGachaStore.getState().skipRequested).toBe(true)
  })

  it('reset restores initial state', () => {
    useGachaStore.setState({
      currentCode: 'TEST',
      phase: 'complete',
      isAnimating: true,
      error: 'some error',
    })
    useGachaStore.getState().reset()

    const state = useGachaStore.getState()
    expect(state.currentCode).toBeNull()
    expect(state.phase).toBe('idle')
    expect(state.isAnimating).toBe(false)
    expect(state.error).toBeNull()
  })
})

describe('getRarityStyles', () => {
  it('returns correct styles for each rarity', () => {
    const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary']
    for (const rarity of rarities) {
      const styles = getRarityStyles(rarity)
      expect(styles).toHaveProperty('textColor')
      expect(styles).toHaveProperty('bgColor')
      expect(styles).toHaveProperty('borderColor')
      expect(styles).toHaveProperty('glowClass')
    }
  })

  it('legendary has yellow theme', () => {
    const styles = getRarityStyles('legendary')
    expect(styles.textColor).toContain('yellow')
  })

  it('epic has purple theme', () => {
    const styles = getRarityStyles('epic')
    expect(styles.textColor).toContain('purple')
  })

  it('rare has blue theme', () => {
    const styles = getRarityStyles('rare')
    expect(styles.textColor).toContain('blue')
  })

  it('common has green theme', () => {
    const styles = getRarityStyles('common')
    expect(styles.textColor).toContain('green')
  })
})

describe('getBoxThemeColor', () => {
  it('returns theme color when box has theme', () => {
    const box = { theme: { color: '#ff0000' } } as never
    expect(getBoxThemeColor(box)).toBe('#ff0000')
  })

  it('returns default cyan when box is null', () => {
    expect(getBoxThemeColor(null)).toBe('#00f5ff')
  })

  it('returns default cyan when box has no theme', () => {
    const box = { theme: null } as never
    expect(getBoxThemeColor(box)).toBe('#00f5ff')
  })
})
