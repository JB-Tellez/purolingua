<script setup lang="ts">
import type { Level } from '~/types'

const props = defineProps<{
  activeLevels: Level[]
}>()

const emit = defineEmits<{
  'update:activeLevels': [levels: Level[]]
}>()

const { t } = useI18n()

const LEVELS: Level[] = ['A1', 'A2']

function toggle(level: Level) {
  if (props.activeLevels.includes(level)) {
    emit('update:activeLevels', props.activeLevels.filter(l => l !== level))
  } else {
    emit('update:activeLevels', [...props.activeLevels, level])
  }
}
</script>

<template>
  <div class="level-filter" :aria-label="t('filter.label')">
    <button
      v-for="level in LEVELS"
      :key="level"
      type="button"
      :class="`filter-chip${activeLevels.includes(level) ? ' active' : ''}`"
      @click="toggle(level)"
    >{{ level }}</button>
  </div>
</template>
