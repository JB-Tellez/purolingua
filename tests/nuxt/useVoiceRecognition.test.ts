import { defineComponent } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach, vi } from 'vitest'
// composable imported here — will fail until Plan 02 creates it
import { useVoiceRecognition } from '~/composables/useVoiceRecognition'

// Mock SpeechRecognition for test environment
class MockSpeechRecognition {
  lang = ''
  interimResults = false
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onresult: ((event: { results: Array<Array<{ transcript: string }>> }) => void) | null = null
  onerror: ((event: { error: string }) => void) | null = null
  start() {}
  stop() {}
}

let mockRecognitionInstance: MockSpeechRecognition

beforeEach(() => {
  mockRecognitionInstance = new MockSpeechRecognition()
  const MockClass = vi.fn(() => mockRecognitionInstance)
  Object.defineProperty(window, 'SpeechRecognition', {
    value: MockClass,
    writable: true,
    configurable: true,
  })
})

function makeWrapper(lang: 'it' | 'es') {
  return defineComponent({
    setup() { return useVoiceRecognition(lang) },
    template: '<div />',
  })
}

describe('useVoiceRecognition', () => {
  // VOICE-01: isSupported = true when SpeechRecognition present
  it('VOICE-01: returns isSupported true when SpeechRecognition is on window', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    expect(wrapper.vm.isSupported).toBe(true)
  })

  // VOICE-02: isSupported = false when API absent
  it('VOICE-02: returns isSupported false when SpeechRecognition is absent', async () => {
    Object.defineProperty(window, 'SpeechRecognition', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const wrapper = await mountSuspended(makeWrapper('it'))
    expect(wrapper.vm.isSupported).toBe(false)
  })

  // VOICE-03: isListening starts false, becomes true after startListening + onstart fires
  it('VOICE-03: isListening becomes true after startListening called and onstart fires', async () => {
    const wrapper = await mountSuspended(makeWrapper('it'))
    expect(wrapper.vm.isListening).toBe(false)
    wrapper.vm.startListening(vi.fn(), vi.fn())
    mockRecognitionInstance.onstart?.()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isListening).toBe(true)
  })
})
