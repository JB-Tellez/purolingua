// tests/nuxt/ActivityPicker.test.ts
// Contract tests for app/pages/index.vue — RED phase (page is a placeholder)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('ActivityPicker', () => {
  it('renders two activity tiles', async () => {
    const { default: Page } = await import('../../app/pages/index.vue')
    const wrapper = await mountSuspended(Page)
    const cards = wrapper.findAll('.deck-card')
    expect(cards.length).toBe(2)
  })

  it('Rephrase tile has an anchor with href containing "/rephrase"', async () => {
    const { default: Page } = await import('../../app/pages/index.vue')
    const wrapper = await mountSuspended(Page)
    const link = wrapper.find('a[href*="/rephrase"]')
    expect(link.exists()).toBe(true)
  })

  it('Q&A tile has an anchor with href containing "/qa"', async () => {
    const { default: Page } = await import('../../app/pages/index.vue')
    const wrapper = await mountSuspended(Page)
    const link = wrapper.find('a[href*="/qa"]')
    expect(link.exists()).toBe(true)
  })
})
