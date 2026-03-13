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
  if (!import.meta.client) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(props.phrase)
  utter.lang = LANG_LOCALE[props.lang]
  utter.rate = 0.9
  const voices = window.speechSynthesis.getVoices()
  const best = voices.find(v => v.lang.startsWith(LANG_LOCALE[props.lang].slice(0, 2)))
  if (best) utter.voice = best
  window.speechSynthesis.speak(utter)
}
</script>

<template>
  <button
    type="button"
    :aria-label="t('study.audio')"
    @click="speak()"
  >🔊</button>
</template>
