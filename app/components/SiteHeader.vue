<script setup lang="ts">
import type { Lang } from '~/types'

const props = defineProps<{
  lang: Lang
}>()

const { t, locale } = useI18n()
const route = useRoute()
const dropdownOpen = ref(false)

const FLAGS: Record<string, string> = { it: '🇮🇹', es: '🇪🇸' }

const segments = computed(() => route.path.split('/').filter(Boolean))
const onDeckPage = computed(() => segments.value.length >= 2)
const backHref = computed(() => '/' + segments.value.slice(0, -1).join('/'))

function handleReset() {
  localStorage.removeItem(`${props.lang}-progress`)
  window.location.reload()
}
</script>

<template>
  <header>
    <NuxtLink :to="`/${props.lang}/`" class="nav-logo">{{ t('nav.logo') }}</NuxtLink>
    <NuxtLink
      v-if="onDeckPage"
      :to="backHref"
      class="nav-back-btn"
      data-back
    >{{ t('nav.back') }}</NuxtLink>
    <div class="locale-switcher" data-locale-switcher>
      <button @click="dropdownOpen = !dropdownOpen">{{ FLAGS[locale] ?? locale }}</button>
      <div v-if="dropdownOpen" @click="dropdownOpen = false">
        <NuxtLinkLocale to="/" :locale="'it'" :class="{ active: locale === 'it' }">
          Italiano
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/" :locale="'es'" :class="{ active: locale === 'es' }">
          Español
        </NuxtLinkLocale>
      </div>
    </div>
    <button class="nav-reset-btn" data-reset @click="handleReset">{{ t('nav.reset') }}</button>
  </header>
</template>
