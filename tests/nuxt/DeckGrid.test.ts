// tests/nuxt/DeckGrid.test.ts
// Contract tests for app/pages/rephrase/index.vue — RED phase (page is a placeholder)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('DeckGrid', () => {
  it('renders at least one .deck-card element', async () => {
    const { default: Page } = await import('../../app/pages/rephrase/index.vue')
    const wrapper = await mountSuspended(Page)
    const cards = wrapper.findAll('.deck-card')
    expect(cards.length).toBeGreaterThanOrEqual(1)
  })

  it('each .deck-card contains a .deck-card-badge element', async () => {
    const { default: Page } = await import('../../app/pages/rephrase/index.vue')
    const wrapper = await mountSuspended(Page)
    const cards = wrapper.findAll('.deck-card')
    expect(cards.length).toBeGreaterThanOrEqual(1)
    for (const card of cards) {
      const badge = card.find('.deck-card-badge')
      expect(badge.exists()).toBe(true)
    }
  })

  it('a [data-level-filter] element is present (LevelFilterChips)', async () => {
    const { default: Page } = await import('../../app/pages/rephrase/index.vue')
    const wrapper = await mountSuspended(Page)
    const filter = wrapper.find('[data-level-filter]')
    expect(filter.exists()).toBe(true)
  })

  it('badge count is a number or checkmark (not NaN, not empty string)', async () => {
    const { default: Page } = await import('../../app/pages/rephrase/index.vue')
    const wrapper = await mountSuspended(Page)
    const cards = wrapper.findAll('.deck-card')
    expect(cards.length).toBeGreaterThanOrEqual(1)
    for (const card of cards) {
      const badge = card.find('.deck-card-badge')
      const text = badge.text().trim()
      const isNumber = /^\d+$/.test(text)
      const isCheck = text === '✓'
      expect(isNumber || isCheck).toBe(true)
    }
  })
})
