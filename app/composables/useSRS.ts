// app/composables/useSRS.ts
import { ref, computed, onMounted } from 'vue'
import type { DeckId, Lang, ProgressRecord } from '~/types'
import { getCardKey, advanceBox, isCardDue } from '~/lib/srs'

function getStorageKey(lang: Lang): string { return `${lang}-progress` }

function loadFromStorage(lang: Lang): ProgressRecord {
  try {
    const saved = localStorage.getItem(getStorageKey(lang))
    return saved ? (JSON.parse(saved) as ProgressRecord) : {}
  } catch { return {} }
}

function saveToStorage(lang: Lang, record: ProgressRecord): void {
  try { localStorage.setItem(getStorageKey(lang), JSON.stringify(record)) } catch { /* silent */ }
}

export function useSRS(lang: Lang) {
  const progress = ref<ProgressRecord>({})          // safe SSR default

  onMounted(() => {                                  // only runs client-side
    progress.value = loadFromStorage(lang)
  })

  function updateCard(deckId: DeckId, cardIndex: number, isCorrect: boolean) {
    const key = getCardKey(deckId, cardIndex)
    progress.value = { ...progress.value, [key]: advanceBox(progress.value[key], isCorrect) }
    saveToStorage(lang, progress.value)
  }

  function isCardDueForDeck(deckId: DeckId, cardIndex: number): boolean {
    return isCardDue(progress.value[getCardKey(deckId, cardIndex)])
  }

  const hasProgress = computed(() => Object.keys(progress.value).length > 0)

  return { progress, updateCard, isCardDueForDeck, hasProgress }
}
