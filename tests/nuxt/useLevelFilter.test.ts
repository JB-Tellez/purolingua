import { defineComponent, ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach } from 'vitest'
// composable imported here — will fail until Plan 02 creates it
import { useLevelFilter } from '~/composables/useLevelFilter'

function makeWrapper(lang: 'it' | 'es', hasProgress: boolean) {
  return defineComponent({
    setup() { return useLevelFilter(lang, ref(hasProgress)) },
    template: '<div />',
  })
}

beforeEach(() => localStorage.clear())

describe('useLevelFilter default values', () => {
  it('new user (hasProgress=false, no localStorage) defaults to ["A1"]', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', false))
    expect(wrapper.vm.activeLevels).toEqual(['A1'])
  })

  it('returning user (hasProgress=true, no localStorage) defaults to ["A1","A2"]', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', true))
    expect(wrapper.vm.activeLevels).toEqual(['A1', 'A2'])
  })

  it('saved localStorage value takes precedence over hasProgress default', async () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['A2']))
    const wrapper = await mountSuspended(makeWrapper('it', true))
    expect(wrapper.vm.activeLevels).toEqual(['A2'])
  })

  it('corrupted localStorage falls back to default', async () => {
    localStorage.setItem('it-level-filter', 'not-valid-json{{{')
    const wrapper = await mountSuspended(makeWrapper('it', false))
    expect(wrapper.vm.activeLevels).toEqual(['A1'])
  })
})

describe('useLevelFilter FLTR-06 guard', () => {
  it('setActiveLevels([]) is a no-op — cannot deselect all levels', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', false))
    wrapper.vm.setActiveLevels([])
    expect(wrapper.vm.activeLevels).toEqual(['A1'])
  })

  it('setActiveLevels(null) is a no-op — cannot deselect all levels', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', false))
    wrapper.vm.setActiveLevels(null)
    expect(wrapper.vm.activeLevels).toEqual(['A1'])
  })

  it('no-op does not write to localStorage', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', false))
    wrapper.vm.setActiveLevels([])
    expect(localStorage.getItem('it-level-filter')).toBeNull()
  })
})

describe('useLevelFilter localStorage persistence', () => {
  it('valid setActiveLevels saves to {lang}-level-filter key', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', false))
    wrapper.vm.setActiveLevels(['A1', 'A2'])
    const stored = JSON.parse(localStorage.getItem('it-level-filter') ?? 'null')
    expect(stored).toEqual(['A1', 'A2'])
  })

  it('uses {lang}-level-filter — Italian and Spanish keys are independent', async () => {
    const wrapper = await mountSuspended(makeWrapper('it', false))
    wrapper.vm.setActiveLevels(['A2'])
    expect(localStorage.getItem('es-level-filter')).toBeNull()
  })
})
