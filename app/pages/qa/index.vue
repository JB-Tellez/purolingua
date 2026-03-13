<script setup lang="ts">
import { scenarios } from '../../../src/data/qa'
import { isCardDue } from '~/lib/srs'
import type { Scenario } from '~/types'

const SCENARIO_THEMES = ['teal', 'blue', 'red', 'yellow', 'green', 'purple', 'orange'] as const

const { t, locale } = useI18n()
const lang = computed(() => locale.value as 'it' | 'es')

const { progress, hasProgress } = useSRS(lang.value)
const { activeLevels, setActiveLevels } = useLevelFilter(lang.value, hasProgress)

function getQADueCount(scenario: Scenario): number {
  if (!activeLevels.value) return 0
  return scenario.cards.filter(card =>
    activeLevels.value!.includes(card.level) &&
    isCardDue(progress.value[`qa_${scenario.id}_${card.id}`])
  ).length
}

const scenarioDueCounts = computed(() =>
  Object.fromEntries(scenarios.map(s => [s.id, getQADueCount(s)]))
)
</script>

<template>
  <main>
    <div class="section-header">
      <h1>{{ t('page.title') }}</h1>
    </div>
    <div data-level-filter>
      <LevelFilterChips :active-levels="activeLevels ?? []" @update:active-levels="setActiveLevels" />
    </div>
    <div class="deck-grid">
      <NuxtLinkLocale
        v-for="(scenario, index) in scenarios"
        :key="scenario.id"
        :to="'/qa/' + scenario.id"
      >
        <div :class="['deck-card', 'theme-' + SCENARIO_THEMES[index % SCENARIO_THEMES.length]]">
          <div class="deck-icon-circle">{{ scenario.icon }}</div>
          <h3>{{ lang === 'it' ? scenario.titleIt : scenario.titleEs }}</h3>
          <span :class="['deck-card-badge', scenarioDueCounts[scenario.id] === 0 ? 'deck-card-badge--done' : '']">
            {{ scenarioDueCounts[scenario.id] === 0 ? '✓' : scenarioDueCounts[scenario.id] }}
          </span>
        </div>
      </NuxtLinkLocale>
    </div>
  </main>
</template>
