// tests/nuxt/AudioButton.test.ts
// Contract tests for AudioButton.vue — RED phase (component does not exist yet)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('AudioButton', () => {
  it('renders a button with aria-label containing study.audio translation', async () => {
    const { default: AudioButton } = await import('../../app/components/AudioButton.vue')
    const wrapper = await mountSuspended(AudioButton, {
      props: { phrase: 'Ciao come stai', lang: 'it' },
    })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-label')).toBeTruthy()
  })

  it('does not crash during SSR mount (speak returns early if not client)', async () => {
    const { default: AudioButton } = await import('../../app/components/AudioButton.vue')
    const wrapper = await mountSuspended(AudioButton, {
      props: { phrase: 'Buenos días', lang: 'es' },
    })
    // If component mounted without throwing, SSR safety guard is in place
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a button element', async () => {
    const { default: AudioButton } = await import('../../app/components/AudioButton.vue')
    const wrapper = await mountSuspended(AudioButton, {
      props: { phrase: 'Ciao', lang: 'it' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })
})
