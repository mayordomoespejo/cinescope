import { describe, it, expect } from 'vitest'
import { mediaGridContainer, mediaGridItem } from '@/components/ui/mediaGridVariants'

describe('mediaGridContainer', () => {
  it('has hidden state with opacity 0', () => {
    expect(mediaGridContainer.hidden.opacity).toBe(0)
  })

  it('has show state with opacity 1', () => {
    expect(mediaGridContainer.show.opacity).toBe(1)
  })

  it('has staggerChildren in show transition', () => {
    expect(mediaGridContainer.show.transition.staggerChildren).toBe(0.04)
  })
})

describe('mediaGridItem', () => {
  it('has hidden state with opacity 0', () => {
    expect(mediaGridItem.hidden.opacity).toBe(0)
  })

  it('has show state with opacity 1', () => {
    expect(mediaGridItem.show.opacity).toBe(1)
  })

  it('has exit state with opacity 0', () => {
    expect(mediaGridItem.exit.opacity).toBe(0)
  })

  it('hidden state has y offset', () => {
    expect(mediaGridItem.hidden.y).toBe(24)
  })

  it('show state has y 0', () => {
    expect(mediaGridItem.show.y).toBe(0)
  })
})
