import { defineComponent, ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach } from 'vitest'
// composable imported here — will fail until Plan 02 creates it
import { useSRS } from '~/composables/useSRS'

function makeWrapper(lang: 'it' | 'es') {
  return defineComponent({
    setup() { return useSRS(lang) },
    template: '<div />',
  })
}

beforeEach(() => localStorage.clear())

describe('useSRS initial state', () => {
  it('starts with empty progress for new user', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    expect(wrapper.vm.hasProgress).toBe(false)
  })

  it('isCardDueForDeck returns true for a new (never-answered) card', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    expect(wrapper.vm.isCardDueForDeck('daily', 0)).toBe(true)
  })
})

describe('useSRS updateCard', () => {
  it('updateCard persists to localStorage under {lang}-progress key', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    wrapper.vm.updateCard('daily', 0, true)
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}')
    expect(stored['daily_0'].box).toBe(2)
    expect(stored['daily_0'].nextReview).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('updateCard(correct=false) resets box to 1', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    wrapper.vm.updateCard('daily', 0, true)  // box → 2
    wrapper.vm.updateCard('daily', 0, false) // box → 1
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}')
    expect(stored['daily_0'].box).toBe(1)
  })

  it('after updateCard hasProgress becomes true', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    wrapper.vm.updateCard('daily', 0, true)
    expect(wrapper.vm.hasProgress).toBe(true)
  })
})

describe('useSRS language isolation', () => {
  it('it-progress and es-progress are independent storage keys', async () => {
    const wrapperIt = await mountSuspended(makeWrapper('it'))
    const wrapperEs = await mountSuspended(makeWrapper('es'))
    wrapperIt.vm.updateCard('daily', 0, true)
    expect(wrapperEs.vm.hasProgress).toBe(false)
    expect(localStorage.getItem('es-progress')).toBeNull()
  })
})

describe('useSRS isCardDueForDeck', () => {
  it('returns false for a just-answered card (box advanced, nextReview in future)', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    wrapper.vm.updateCard('daily', 0, true)
    // After correct answer: nextReview = tomorrow → not due today
    expect(wrapper.vm.isCardDueForDeck('daily', 0)).toBe(false)
  })
})
