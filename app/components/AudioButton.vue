<script setup lang="ts">
const props = defineProps<{
  phrase: string
  lang: 'it' | 'es'
}>()

const { t } = useI18n()

const LANG_LOCALE: Record<string, string> = {
  it: 'it-IT',
  es: 'es-ES',
}

function speak() {
  console.log('[AudioButton] speak called', { phrase: props.phrase, lang: props.lang, isClient: import.meta.client, hasSynth: !!window?.speechSynthesis })
  if (!import.meta.client || !window.speechSynthesis) return
  const synth = window.speechSynthesis
  synth.cancel()
  synth.resume()
  const utter = new SpeechSynthesisUtterance(props.phrase)
  utter.lang = LANG_LOCALE[props.lang]
  utter.rate = 0.9
  synth.speak(utter)
}
</script>

<template>
  <button
    type="button"
    class="audio-btn"
    :aria-label="t('study.audio')"
    @click.stop="speak()"
  >🔊</button>
</template>
