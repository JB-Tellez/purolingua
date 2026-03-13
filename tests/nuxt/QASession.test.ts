// tests/nuxt/QASession.test.ts
// Wave 0 contract stubs for app/pages/qa/[scenario].vue — RED phase (page is a placeholder)
// These tests define the selector contracts that Plan 03 must satisfy.
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach } from 'vitest'

describe('QASession', () => {
  beforeEach(() => localStorage.clear())

  it('shows [data-session-done] when localStorage is empty (0 due cards)', async () => {
    const { default: Page } = await import('../../app/pages/qa/[scenario].vue')
    const wrapper = await mountSuspended(Page)
    expect(wrapper.find('[data-session-done]').exists()).toBe(true)
  })

  it.skip('shows [data-session-card] and 4 [data-choice] elements when cards are due', async () => {
    // Full Q&A SRS state seeding requires knowledge of the key format established in Plan 03.
    // This test is written alongside implementation in Plan 03.
    // Selector contracts: [data-session-card], [data-choice] (4 per card)
    const { default: Page } = await import('../../app/pages/qa/[scenario].vue')
    const wrapper = await mountSuspended(Page)
    expect(wrapper.find('[data-session-card]').exists()).toBe(true)
    const choices = wrapper.findAll('[data-choice]')
    expect(choices.length).toBe(4)
  })

  it.skip('shows [data-card-counter] when cards are due', async () => {
    // Full Q&A SRS state seeding requires knowledge of the key format established in Plan 03.
    // This test is written alongside implementation in Plan 03.
    // Selector contract: [data-card-counter]
    const { default: Page } = await import('../../app/pages/qa/[scenario].vue')
    const wrapper = await mountSuspended(Page)
    expect(wrapper.find('[data-card-counter]').exists()).toBe(true)
  })

  it('does NOT contain placeholder text "session placeholder"', async () => {
    const { default: Page } = await import('../../app/pages/qa/[scenario].vue')
    const wrapper = await mountSuspended(Page)
    expect(wrapper.html()).not.toContain('session placeholder')
  })
})
