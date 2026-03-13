// tests/nuxt/RephraseSession.test.ts
// Wave 0 contract stubs for app/pages/rephrase/[deck].vue — RED phase (page is a placeholder)
// These tests define the selector contracts that Plan 02 must satisfy.
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach } from 'vitest'

describe('RephraseSession', () => {
  beforeEach(() => localStorage.clear())

  it('shows [data-session-done] when localStorage is empty (0 due cards)', async () => {
    const { default: Page } = await import('../../app/pages/rephrase/[deck].vue')
    const wrapper = await mountSuspended(Page)
    expect(wrapper.find('[data-session-done]').exists()).toBe(true)
  })

  it.skip('shows [data-session-card] and [data-card-counter] when cards are due', async () => {
    // Full SRS state seeding requires knowledge of the key format established in Plan 02.
    // This test is written alongside implementation in Plan 02.
    // Selector contracts: [data-session-card], [data-card-counter]
    const { default: Page } = await import('../../app/pages/rephrase/[deck].vue')
    const wrapper = await mountSuspended(Page)
    expect(wrapper.find('[data-session-card]').exists()).toBe(true)
    expect(wrapper.find('[data-card-counter]').exists()).toBe(true)
  })

  it.skip('shows [data-progress-bar] when cards are due', async () => {
    // Full SRS state seeding requires knowledge of the key format established in Plan 02.
    // This test is written alongside implementation in Plan 02.
    // Selector contract: [data-progress-bar]
    const { default: Page } = await import('../../app/pages/rephrase/[deck].vue')
    const wrapper = await mountSuspended(Page)
    expect(wrapper.find('[data-progress-bar]').exists()).toBe(true)
  })

  it('does NOT contain placeholder text "session placeholder"', async () => {
    const { default: Page } = await import('../../app/pages/rephrase/[deck].vue')
    const wrapper = await mountSuspended(Page)
    expect(wrapper.html()).not.toContain('session placeholder')
  })
})
