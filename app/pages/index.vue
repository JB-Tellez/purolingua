<script setup lang="ts">
const { t } = useI18n()

const ACTIVITIES = [
  { key: 'rephrase', icon: '🃏', path: '/rephrase' },
  { key: 'qa',       icon: '💬', path: '/qa' },
] as const
</script>

<template>
  <main>
    <div class="section-header">
      <h1>{{ t('page.title') }}</h1>
      <p class="subtitle">{{ t('page.subtitle') }}</p>
    </div>
    <div class="activity-grid">
      <NuxtLinkLocale
        v-for="activity in ACTIVITIES"
        :key="activity.key"
        :to="activity.path"
      >
        <div class="deck-card">
          <div class="deck-icon-circle">{{ activity.icon }}</div>
          <h3>{{ t('activities.' + activity.key + '.title') }}</h3>
          <p>{{ t('activities.' + activity.key + '.description') }}</p>
        </div>
      </NuxtLinkLocale>
    </div>
  </main>
</template>
