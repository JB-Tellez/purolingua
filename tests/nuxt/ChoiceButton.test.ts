// tests/nuxt/ChoiceButton.test.ts
// Contract tests for ChoiceButton.vue — RED phase (component does not exist yet)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('ChoiceButton', () => {
  it('renders the text prop inside the button', async () => {
    const { default: ChoiceButton } = await import('../../app/components/ChoiceButton.vue')
    const wrapper = await mountSuspended(ChoiceButton, {
      props: { text: 'Hello world', state: 'idle' },
    })
    expect(wrapper.text()).toContain('Hello world')
  })

  it('emits click when the button body is clicked', async () => {
    const { default: ChoiceButton } = await import('../../app/components/ChoiceButton.vue')
    const wrapper = await mountSuspended(ChoiceButton, {
      props: { text: 'Option A', state: 'idle' },
    })
    await wrapper.find('.quiz-btn').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('emits speak when the speaker button is clicked', async () => {
    const { default: ChoiceButton } = await import('../../app/components/ChoiceButton.vue')
    const wrapper = await mountSuspended(ChoiceButton, {
      props: { text: 'Option A', state: 'idle' },
    })
    await wrapper.find('[data-speaker]').trigger('click')
    expect(wrapper.emitted('speak')).toBeTruthy()
  })

  it('clicking speaker button does NOT emit click (audio does not trigger answer)', async () => {
    const { default: ChoiceButton } = await import('../../app/components/ChoiceButton.vue')
    const wrapper = await mountSuspended(ChoiceButton, {
      props: { text: 'Option A', state: 'idle' },
    })
    await wrapper.find('[data-speaker]').trigger('click')
    expect(wrapper.emitted('speak')).toBeTruthy()
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('button is disabled when disabled prop is true', async () => {
    const { default: ChoiceButton } = await import('../../app/components/ChoiceButton.vue')
    const wrapper = await mountSuspended(ChoiceButton, {
      props: { text: 'Option A', state: 'idle', disabled: true },
    })
    expect(wrapper.find('.quiz-btn').attributes('disabled')).toBeDefined()
  })

  it('button is disabled when state is correct', async () => {
    const { default: ChoiceButton } = await import('../../app/components/ChoiceButton.vue')
    const wrapper = await mountSuspended(ChoiceButton, {
      props: { text: 'Option A', state: 'correct' },
    })
    expect(wrapper.find('.quiz-btn').attributes('disabled')).toBeDefined()
  })

  it('button is disabled when state is incorrect', async () => {
    const { default: ChoiceButton } = await import('../../app/components/ChoiceButton.vue')
    const wrapper = await mountSuspended(ChoiceButton, {
      props: { text: 'Option A', state: 'incorrect' },
    })
    expect(wrapper.find('.quiz-btn').attributes('disabled')).toBeDefined()
  })

  it('speaker span emits speak on Enter keydown', async () => {
    const { default: ChoiceButton } = await import('../../app/components/ChoiceButton.vue')
    const wrapper = await mountSuspended(ChoiceButton, {
      props: { text: 'Option A', state: 'idle' },
    })
    await wrapper.find('[data-speaker]').trigger('keydown.enter')
    expect(wrapper.emitted('speak')).toBeTruthy()
  })

  it('speaker span emits speak on Space keydown', async () => {
    const { default: ChoiceButton } = await import('../../app/components/ChoiceButton.vue')
    const wrapper = await mountSuspended(ChoiceButton, {
      props: { text: 'Option A', state: 'idle' },
    })
    await wrapper.find('[data-speaker]').trigger('keydown.space')
    expect(wrapper.emitted('speak')).toBeTruthy()
  })
})
