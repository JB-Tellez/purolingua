// tests/nuxt/QASession.test.ts
// GREEN tests for app/pages/qa/[scenario].vue (Plan 25-03)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach } from 'vitest'

// Q&A SRS key format: qa_{scenarioId}_{cardId}
// The 'coffee' scenario is 'caffe' in src/data/qa (Italian internal ID)
// Route param 'scenario' maps to ScenarioId; use 'caffe' (the actual ID in scenarios array)
function seedAllCardsReviewed(lang: string, scenarioId: string, cardIds: string[]) {
  const progress: Record<string, { box: number; nextReview: string }> = {}
  const futureDate = '2099-12-31'
  for (const cardId of cardIds) {
    progress[`qa_${scenarioId}_${cardId}`] = { box: 3, nextReview: futureDate }
  }
  localStorage.setItem(`${lang}-progress`, JSON.stringify(progress))
}

describe('QASession', () => {
  beforeEach(() => localStorage.clear())

  it('shows [data-session-done] when localStorage is empty (0 due cards)', async () => {
    const { default: Page } = await import('../../app/pages/qa/[scenario].vue')
    const wrapper = await mountSuspended(Page)
    expect(wrapper.find('[data-session-done]').exists()).toBe(true)
  })

  it('shows [data-session-card] and 4 [data-choice] elements when cards are due', async () => {
    // All cards are due when localStorage is empty (no progress = always due)
    // Route uses ScenarioId 'coffee' (caffe.ts exports id: 'coffee')
    const { default: Page } = await import('../../app/pages/qa/[scenario].vue')
    const wrapper = await mountSuspended(Page, { route: '/it/qa/coffee' })
    expect(wrapper.find('[data-session-card]').exists()).toBe(true)
    const choices = wrapper.findAll('[data-choice]')
    expect(choices.length).toBe(4)
  })

  it('shows [data-card-counter] when cards are due', async () => {
    const { default: Page } = await import('../../app/pages/qa/[scenario].vue')
    const wrapper = await mountSuspended(Page, { route: '/it/qa/coffee' })
    expect(wrapper.find('[data-card-counter]').exists()).toBe(true)
  })

  it('shows [data-progress-bar] when cards are due', async () => {
    const { default: Page } = await import('../../app/pages/qa/[scenario].vue')
    const wrapper = await mountSuspended(Page, { route: '/it/qa/coffee' })
    expect(wrapper.find('[data-progress-bar]').exists()).toBe(true)
  })

  it('does NOT contain placeholder text "session placeholder"', async () => {
    const { default: Page } = await import('../../app/pages/qa/[scenario].vue')
    const wrapper = await mountSuspended(Page)
    expect(wrapper.html()).not.toContain('session placeholder')
  })
})
