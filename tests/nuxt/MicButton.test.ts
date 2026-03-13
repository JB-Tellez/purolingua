// tests/nuxt/MicButton.test.ts
// Contract tests for MicButton.vue — RED phase (component does not exist yet)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('MicButton', () => {
  it('renders a mic icon button', async () => {
    const { default: MicButton } = await import('../../app/components/MicButton.vue')
    const wrapper = await mountSuspended(MicButton, {
      props: { state: 'idle' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('emits press when clicked', async () => {
    const { default: MicButton } = await import('../../app/components/MicButton.vue')
    const wrapper = await mountSuspended(MicButton, {
      props: { state: 'idle' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('press')).toBeTruthy()
  })

  it('adds mic-btn--listening class when state is listening', async () => {
    const { default: MicButton } = await import('../../app/components/MicButton.vue')
    const wrapper = await mountSuspended(MicButton, {
      props: { state: 'listening' },
    })
    expect(wrapper.find('button').classes()).toContain('mic-btn--listening')
  })

  it('adds mic-btn--error class when state is error', async () => {
    const { default: MicButton } = await import('../../app/components/MicButton.vue')
    const wrapper = await mountSuspended(MicButton, {
      props: { state: 'error' },
    })
    expect(wrapper.find('button').classes()).toContain('mic-btn--error')
  })

  it('has no state modifier class when state is idle', async () => {
    const { default: MicButton } = await import('../../app/components/MicButton.vue')
    const wrapper = await mountSuspended(MicButton, {
      props: { state: 'idle' },
    })
    const classes = wrapper.find('button').classes()
    expect(classes).not.toContain('mic-btn--listening')
    expect(classes).not.toContain('mic-btn--error')
  })
})
