<script setup lang="ts">
import type { Lang } from '~/types'

const { locale } = useI18n()
const lang = computed(() => locale.value as Lang)
</script>

<template>
  <SiteHeader :lang="lang" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
