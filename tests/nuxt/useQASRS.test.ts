import { defineComponent } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach } from 'vitest'
// composable imported here — will fail until Plan 02 creates it
import { useQASRS } from '~/composables/useQASRS'
import type { QACard, Level } from '~/types'

// Inline fixture — no import from src/data/qa/
const mockCards: QACard[] = [
  {
    id: 'test_01',
    question: 'Q1?',
    correct: 'C1',
    foils: ['F1', 'F2', 'F3'],
    questionEs: 'P1?',
    correctEs: 'R1',
    foilsEs: ['D1', 'D2', 'D3'],
    level: 'A1',
  },
  {
    id: 'test_02',
    question: 'Q2?',
    correct: 'C2',
    foils: ['F4', 'F5', 'F6'],
    questionEs: 'P2?',
    correctEs: 'R2',
    foilsEs: ['D4', 'D5', 'D6'],
    level: 'A2',
  },
]

function makeWrapper(lang: 'it' | 'es', scenarioId: string, cards: QACard[], activeLevels: Level[]) {
  return defineComponent({
    setup() { return useQASRS(lang, scenarioId, cards, activeLevels) },
    template: '<div />',
  })
}

beforeEach(() => localStorage.clear())

describe('useQASRS initial state', () => {
  it('starts with empty progress (hasProgress = false)', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1', 'A2']))
    expect(wrapper.vm.hasProgress).toBe(false)
  })

  it('all cards are dueCards for a new user with no progress', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1', 'A2']))
    expect(wrapper.vm.dueCards).toHaveLength(2)
  })
})

describe('useQASRS level filtering', () => {
  it("activeLevels=['A1'] excludes A2 cards from dueCards", async () => {
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1']))
    expect(wrapper.vm.dueCards).toHaveLength(1)
    expect(wrapper.vm.dueCards[0].id).toBe('test_01')
  })

  it("activeLevels=['A2'] excludes A1 cards from dueCards", async () => {
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A2']))
    expect(wrapper.vm.dueCards).toHaveLength(1)
    expect(wrapper.vm.dueCards[0].id).toBe('test_02')
  })

  it("activeLevels=['A1','A2'] includes all due cards", async () => {
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1', 'A2']))
    expect(wrapper.vm.dueCards).toHaveLength(2)
  })
})

describe('useQASRS updateCard', () => {
  it("updateCard stores key 'qa_coffee_test_01' in 'it-progress'", async () => {
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1', 'A2']))
    wrapper.vm.updateCard('test_01', true)
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}')
    expect(stored['qa_coffee_test_01']).toBeDefined()
  })

  it('correct answer advances box from undefined to 2', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1', 'A2']))
    wrapper.vm.updateCard('test_01', true)
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}')
    expect(stored['qa_coffee_test_01'].box).toBe(2)
  })

  it('incorrect answer resets box to 1', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1', 'A2']))
    wrapper.vm.updateCard('test_01', false)
    const stored = JSON.parse(localStorage.getItem('it-progress') ?? '{}')
    expect(stored['qa_coffee_test_01'].box).toBe(1)
  })

  it('after updateCard, hasProgress becomes true', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1', 'A2']))
    wrapper.vm.updateCard('test_01', true)
    expect(wrapper.vm.hasProgress).toBe(true)
  })

  it('answered card is removed from dueCards (nextReview in future)', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1', 'A2']))
    wrapper.vm.updateCard('test_01', true)
    const ids = wrapper.vm.dueCards.map((c: QACard) => c.id)
    expect(ids).not.toContain('test_01')
  })
})

describe('useQASRS key isolation', () => {
  it("Q&A key 'qa_coffee_test_01' does not conflict with Rephrase key 'caffe_test_01'", async () => {
    // Pre-seed a Rephrase key in localStorage
    localStorage.setItem('it-progress', JSON.stringify({ 'caffe_test_01': { box: 3, nextReview: '2099-01-01' } }))
    const wrapper = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1', 'A2']))
    // The Q&A hook should still see both cards as due (qa_coffee_test_01 has no progress)
    expect(wrapper.vm.dueCards).toHaveLength(2)
  })

  it('it-progress and es-progress are independent', async () => {
    const wrapperIt = await mountSuspended(makeWrapper('it', 'coffee', mockCards, ['A1', 'A2']))
    const wrapperEs = await mountSuspended(makeWrapper('es', 'coffee', mockCards, ['A1', 'A2']))
    wrapperIt.vm.updateCard('test_01', true)
    expect(wrapperEs.vm.hasProgress).toBe(false)
    expect(localStorage.getItem('es-progress')).toBeNull()
  })
})
