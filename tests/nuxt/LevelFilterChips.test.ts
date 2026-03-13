// tests/nuxt/LevelFilterChips.test.ts
// Contract tests for LevelFilterChips.vue — RED phase (component does not exist yet)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import type { Level } from '../../app/types'

describe('LevelFilterChips', () => {
  it('renders two buttons (A1 and A2)', async () => {
    const { default: LevelFilterChips } = await import('../../app/components/LevelFilterChips.vue')
    const wrapper = await mountSuspended(LevelFilterChips, {
      props: { activeLevels: ['A1'] as Level[] },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
  })

  it('A1 button has active class when A1 is in activeLevels', async () => {
    const { default: LevelFilterChips } = await import('../../app/components/LevelFilterChips.vue')
    const wrapper = await mountSuspended(LevelFilterChips, {
      props: { activeLevels: ['A1'] as Level[] },
    })
    const a1Button = wrapper.findAll('button').find(b => b.text().includes('A1'))
    expect(a1Button?.classes()).toContain('active')
  })

  it('A2 button has active class when A2 is in activeLevels', async () => {
    const { default: LevelFilterChips } = await import('../../app/components/LevelFilterChips.vue')
    const wrapper = await mountSuspended(LevelFilterChips, {
      props: { activeLevels: ['A1', 'A2'] as Level[] },
    })
    const a2Button = wrapper.findAll('button').find(b => b.text().includes('A2'))
    expect(a2Button?.classes()).toContain('active')
  })

  it('clicking A1 when active emits update:activeLevels with A1 removed', async () => {
    const { default: LevelFilterChips } = await import('../../app/components/LevelFilterChips.vue')
    const wrapper = await mountSuspended(LevelFilterChips, {
      props: { activeLevels: ['A1', 'A2'] as Level[] },
    })
    const a1Button = wrapper.findAll('button').find(b => b.text().includes('A1'))
    await a1Button?.trigger('click')
    const emitted = wrapper.emitted('update:activeLevels')
    expect(emitted).toBeTruthy()
    expect((emitted![0][0] as Level[])).not.toContain('A1')
  })

  it('clicking A2 when not active emits update:activeLevels with A2 added', async () => {
    const { default: LevelFilterChips } = await import('../../app/components/LevelFilterChips.vue')
    const wrapper = await mountSuspended(LevelFilterChips, {
      props: { activeLevels: ['A1'] as Level[] },
    })
    const a2Button = wrapper.findAll('button').find(b => b.text().includes('A2'))
    await a2Button?.trigger('click')
    const emitted = wrapper.emitted('update:activeLevels')
    expect(emitted).toBeTruthy()
    expect((emitted![0][0] as Level[])).toContain('A2')
  })
})
