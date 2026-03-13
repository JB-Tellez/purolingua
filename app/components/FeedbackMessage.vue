<script setup lang="ts">
type FeedbackState = 'correct' | 'incorrect' | 'heard' | 'notRecognized' | null

defineProps<{
  state: FeedbackState
}>()

const { t } = useI18n()

const COLOR_CLASS: Record<Exclude<FeedbackState, null>, string> = {
  correct: 'text-green-600',
  incorrect: 'text-red-500',
  heard: 'text-blue-500',
  notRecognized: 'text-gray-500',
}
</script>

<template>
  <p
    v-if="state !== null"
    role="status"
    aria-live="polite"
    :class="`text-sm font-medium text-center ${COLOR_CLASS[state!]}`"
  >{{ t(`study.${state}`) }}</p>
</template>
