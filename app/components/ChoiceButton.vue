<script setup lang="ts">
defineProps<{
  text: string
  state: 'idle' | 'correct' | 'incorrect'
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
  speak: []
}>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled || state !== 'idle'"
    :class="['quiz-btn', { [state]: state !== 'idle' }]"
    @click="emit('click')"
  >
    <span
      role="button"
      class="quiz-audio-icon"
      data-speaker
      :tabindex="0"
      @click.stop="emit('speak')"
      @keydown.enter.stop="emit('speak')"
      @keydown.space.stop="emit('speak')"
    >🔊</span>
    {{ text }}
  </button>
</template>
