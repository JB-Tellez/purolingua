// tests/nuxt/FeedbackMessage.test.ts
// Contract tests for FeedbackMessage.vue — RED phase (component does not exist yet)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('FeedbackMessage', () => {
  it('renders nothing when state is null', async () => {
    const { default: FeedbackMessage } = await import('../../app/components/FeedbackMessage.vue')
    const wrapper = await mountSuspended(FeedbackMessage, {
      props: { state: null },
    })
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  it('renders a p[role="status"] when state is correct', async () => {
    const { default: FeedbackMessage } = await import('../../app/components/FeedbackMessage.vue')
    const wrapper = await mountSuspended(FeedbackMessage, {
      props: { state: 'correct' },
    })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.find('[role="status"]').element.tagName.toLowerCase()).toBe('p')
  })

  it('renders a p[role="status"] when state is incorrect', async () => {
    const { default: FeedbackMessage } = await import('../../app/components/FeedbackMessage.vue')
    const wrapper = await mountSuspended(FeedbackMessage, {
      props: { state: 'incorrect' },
    })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.find('[role="status"]').element.tagName.toLowerCase()).toBe('p')
  })

  it('has text-green-600 class when state is correct', async () => {
    const { default: FeedbackMessage } = await import('../../app/components/FeedbackMessage.vue')
    const wrapper = await mountSuspended(FeedbackMessage, {
      props: { state: 'correct' },
    })
    expect(wrapper.find('[role="status"]').classes()).toContain('text-green-600')
  })

  it('has text-red-500 class when state is incorrect', async () => {
    const { default: FeedbackMessage } = await import('../../app/components/FeedbackMessage.vue')
    const wrapper = await mountSuspended(FeedbackMessage, {
      props: { state: 'incorrect' },
    })
    expect(wrapper.find('[role="status"]').classes()).toContain('text-red-500')
  })

  it('has text-blue-500 class when state is heard', async () => {
    const { default: FeedbackMessage } = await import('../../app/components/FeedbackMessage.vue')
    const wrapper = await mountSuspended(FeedbackMessage, {
      props: { state: 'heard' },
    })
    expect(wrapper.find('[role="status"]').classes()).toContain('text-blue-500')
  })

  it('has text-gray-500 class when state is notRecognized', async () => {
    const { default: FeedbackMessage } = await import('../../app/components/FeedbackMessage.vue')
    const wrapper = await mountSuspended(FeedbackMessage, {
      props: { state: 'notRecognized' },
    })
    expect(wrapper.find('[role="status"]').classes()).toContain('text-gray-500')
  })
})
