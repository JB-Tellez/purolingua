<script setup lang="ts">
defineProps<{
  state: 'idle' | 'listening' | 'error'
}>()

const emit = defineEmits<{
  press: []
}>()
</script>

<template>
  <button
    type="button"
    :class="`mic-btn${state !== 'idle' ? ` mic-btn--${state}` : ''}`"
    :aria-label="state === 'listening' ? 'Listening\u2026' : 'Start speaking'"
    :aria-pressed="state === 'listening'"
    @click.stop="emit('press')"
  >🎙</button>
</template>
