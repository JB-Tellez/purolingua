import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import type { Lang, Level } from '~/types'

function getFilterKey(lang: Lang): string { return `${lang}-level-filter` }

function loadFilter(lang: Lang): Level[] | null {
  try {
    const saved = localStorage.getItem(getFilterKey(lang))
    if (saved) {
      const parsed = JSON.parse(saved) as unknown
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as Level[]
    }
  } catch { /* corrupted JSON */ }
  return null
}

export function useLevelFilter(lang: Lang, hasProgress: Ref<boolean>) {
  const activeLevels = ref<Level[] | null>(null)

  onMounted(() => {
    const saved = loadFilter(lang)
    activeLevels.value = saved ?? (hasProgress.value ? ['A1', 'A2'] : ['A1'])
  })

  function setActiveLevels(levels: Level[] | null) {
    if (!levels || levels.length === 0) return   // FLTR-06 guard
    activeLevels.value = levels
    try {
      localStorage.setItem(getFilterKey(lang), JSON.stringify(levels))
    } catch { /* silent fail */ }
  }

  return { activeLevels, setActiveLevels }
}
