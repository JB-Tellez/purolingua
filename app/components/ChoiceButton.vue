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
  <div class="choice-btn-group">
    <button
      type="button"
      :disabled="disabled || state !== 'idle'"
      :class="['quiz-btn', { [state]: state !== 'idle' }]"
      @click="emit('click')"
    >
      {{ text }}
    </button>
    <button
      type="button"
      class="quiz-audio-btn"
      :disabled="disabled || state !== 'idle'"
      data-speaker
      :aria-label="text + ' audio'"
      @click.stop="emit('speak')"
      @keydown.enter.stop="emit('speak')"
      @keydown.space.stop="emit('speak')"
    >🔊</button>
  </div>
</template>
