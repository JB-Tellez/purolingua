// app/composables/useQASRS.ts
import { ref, computed, onMounted } from 'vue'
import type { Lang, Level, QACard, ScenarioId, ProgressRecord } from '~/types'
import { advanceBox, isCardDue } from '~/lib/srs'

function getQACardKey(scenarioId: ScenarioId, cardId: string): string {
  return `qa_${scenarioId}_${cardId}`
}
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

export function useQASRS(
  lang: Lang,
  scenarioId: ScenarioId,
  cards: QACard[],
  activeLevels: Level[]
) {
  const progress = ref<ProgressRecord>({})

  onMounted(() => {
    progress.value = loadFromStorage(lang)
  })

  const dueCards = computed(() =>
    cards.filter(card =>
      activeLevels.includes(card.level) &&
      isCardDue(progress.value[getQACardKey(scenarioId, card.id)])
    )
  )

  function updateCard(cardId: string, isCorrect: boolean) {
    const key = getQACardKey(scenarioId, cardId)
    progress.value = { ...progress.value, [key]: advanceBox(progress.value[key], isCorrect) }
    saveToStorage(lang, progress.value)
  }

  function isCardDueForScenario(cardId: string): boolean {
    return isCardDue(progress.value[getQACardKey(scenarioId, cardId)])
  }

  const hasProgress = computed(() => Object.keys(progress.value).length > 0)

  return { dueCards, updateCard, isCardDueForScenario, hasProgress, progress }
}
