<script setup lang="ts">
import { deckMetadata } from '~/data/decks'
import { DECK_MAP } from '~/data/deckMap'
import type { Card, DeckId } from '~/types'

const { t, locale } = useI18n()
const lang = computed(() => locale.value as 'it' | 'es')

const { isCardDueForDeck, hasProgress } = useSRS(lang.value)
const { activeLevels, setActiveLevels } = useLevelFilter(lang.value, hasProgress)

const decks = computed(() => deckMetadata.filter(d => d.lang === lang.value))

function getDueCount(deckId: DeckId, cards: Card[]): number {
  if (!activeLevels.value) return 0
  return cards.filter((card, i) =>
    activeLevels.value!.includes(card.level) && isCardDueForDeck(deckId, i)
  ).length
}

const deckDueCounts = computed(() =>
  Object.fromEntries(
    decks.value.map(deck => {
      const cards = DECK_MAP[lang.value]?.[deck.id] ?? []
      return [deck.id, getDueCount(deck.id, cards)]
    })
  )
)
</script>

<template>
  <main>
    <h1>{{ t('page.chooseDeck') }}</h1>

    <div data-level-filter>
      <LevelFilterChips
        :active-levels="activeLevels ?? []"
        @update:active-levels="setActiveLevels"
      />
    </div>

    <div class="deck-grid">
      <NuxtLinkLocale
        v-for="deck in decks"
        :key="deck.id"
        :to="'/rephrase/' + deck.id"
      >
        <div :class="['deck-card', 'theme-' + deck.theme]">
          <div class="deck-icon-circle">{{ deck.icon }}</div>
          <h3>{{ t('decks.' + deck.i18nKey) }}</h3>
          <p>{{ t('deckDescriptions.' + deck.i18nKey) }}</p>
          <span
            :class="['deck-card-badge', deckDueCounts[deck.id] === 0 ? 'deck-card-badge--done' : '']"
          >{{ deckDueCounts[deck.id] === 0 ? '✓' : deckDueCounts[deck.id] }}</span>
        </div>
      </NuxtLinkLocale>
    </div>
  </main>
</template>
