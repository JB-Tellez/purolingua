// app/composables/useVoiceRecognition.ts
import { ref, onMounted, onUnmounted } from 'vue'
import type { Lang } from '~/types'

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  start(): void
  stop(): void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

const LANG_LOCALE: Record<Lang, string> = { it: 'it-IT', es: 'es-ES' }

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useVoiceRecognition(lang: Lang) {
  const isSupported = ref(false)
  const isListening = ref(false)
  const recognitionRef = ref<SpeechRecognitionInstance | null>(null)

  onMounted(() => {
    isSupported.value = !!getSpeechRecognition()   // flash: false → true
  })

  onUnmounted(() => {
    recognitionRef.value?.stop()                   // cleanup dangling session
  })

  function startListening(
    onResult: (transcript: string) => void,
    onError: () => void
  ) {
    const RecognitionClass = getSpeechRecognition()
    if (!RecognitionClass || isListening.value) return
    const rec = new RecognitionClass()
    rec.lang = LANG_LOCALE[lang]
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => { isListening.value = true }
    rec.onend = () => { isListening.value = false }
    rec.onresult = (e) => { onResult(e.results[0][0].transcript) }
    rec.onerror = () => { isListening.value = false; onError() }
    recognitionRef.value = rec
    try { rec.start() } catch { /* guard against already-started */ }
  }

  function stopListening() {
    recognitionRef.value?.stop()
  }

  return { isSupported, isListening, startListening, stopListening }
}
