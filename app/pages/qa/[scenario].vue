<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Lang, Level, QACard, ScenarioId, ProgressRecord } from '~/types'
import { useSRS } from '~/composables/useSRS'
import { useLevelFilter } from '~/composables/useLevelFilter'
import { useQASRS } from '~/composables/useQASRS'
import { useVoiceRecognition } from '~/composables/useVoiceRecognition'
import { isCardDue } from '~/lib/srs'
import { scenarios } from '../../../src/data/qa'

// --- Types ---
type FeedbackState = 'correct' | 'incorrect' | null

// --- i18n & routing ---
const { t, locale } = useI18n()
const route = useRoute()
const lang = locale.value as Lang
const scenarioId = route.params.scenario as ScenarioId
const scenario = scenarios.find(s => s.id === scenarioId)!

// --- Composables (top-level, no onMounted) ---
const { hasProgress, progress } = useSRS(lang)
const { activeLevels } = useLevelFilter(lang, hasProgress)
const { dueCards: qaComputedDue, updateCard } = useQASRS(
  lang,
  scenarioId,
  scenario?.cards ?? [],
  activeLevels.value ?? ['A1']
)
const { isSupported, isListening, startListening } = useVoiceRecognition(lang)

// --- Session state ---
const sessionDueCards = ref<QACard[]>([])
const index = ref(0)
const done = ref(false)
const allDone = ref(false)
const selectedChoice = ref<number | null>(null)
const feedbackState = ref<FeedbackState>(null)
const micState = ref<'idle' | 'listening' | 'error'>('idle')

// --- Snapshot dueCards in onMounted (Rule: never computed) ---
onMounted(() => {
  sessionDueCards.value = [...qaComputedDue.value]
})

// --- Computed helpers ---
const currentCard = computed(() => sessionDueCards.value[index.value] ?? null)

// --- Fisher-Yates shuffle ---
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const choices = computed(() => {
  if (!currentCard.value) return []
  const correctText = lang === 'it' ? currentCard.value.correct : currentCard.value.correctEs
  const foilTexts = lang === 'it' ? [...currentCard.value.foils] : [...currentCard.value.foilsEs]
  return shuffle([
    { text: correctText, isCorrect: true },
    ...foilTexts.map((f: string) => ({ text: f, isCorrect: false })),
  ])
})

// --- TTS speak helper (DEBT-01: not extracted to shared module) ---
const LANG_LOCALE: Record<Lang, string> = { it: 'it-IT', es: 'es-ES' }

function speak(phrase: string, speakLang: Lang) {
  if (!import.meta.client || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(phrase)
  utterance.lang = LANG_LOCALE[speakLang]
  utterance.rate = 0.9
  const voices = window.speechSynthesis.getVoices()
  const matching = voices.filter(v => v.lang.startsWith(speakLang))
  const exact = matching.find(v => v.lang === LANG_LOCALE[speakLang])
  utterance.voice = exact ?? matching[0] ?? null
  window.speechSynthesis.speak(utterance)
}

// --- Normalize helper for mic transcript matching ---
const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;:'"¿¡]+$/g, '').trim()

// --- All-scenarios-done check ---
function isScenarioHasDue(
  prog: ProgressRecord,
  scId: string,
  cards: QACard[],
  levels: Level[]
): boolean {
  return cards
    .filter(c => levels.includes(c.level))
    .some(c => isCardDue(prog[`qa_${scId}_${c.id}`]))
}

// --- Handle answer (SRS update + advance) ---
function handleAnswer() {
  if (!currentCard.value) return
  updateCard(currentCard.value.id, true)

  if (index.value < sessionDueCards.value.length - 1) {
    index.value++
  } else {
    // Check if any scenario has due cards
    const levels: Level[] = activeLevels.value ?? ['A1']
    const anyHasDue = scenarios.some(sc =>
      isScenarioHasDue(progress.value, sc.id, sc.cards, levels)
    )
    if (anyHasDue) {
      done.value = true
    } else {
      allDone.value = true
    }
  }
}

// --- Handle choice button click ---
function handleChoiceClick(i: number) {
  if (selectedChoice.value !== null) return // already answered
  selectedChoice.value = i

  if (choices.value[i].isCorrect) {
    feedbackState.value = 'correct'
    setTimeout(() => {
      handleAnswer()
      selectedChoice.value = null
      feedbackState.value = null
    }, 600)
  } else {
    feedbackState.value = 'incorrect'
    setTimeout(() => {
      selectedChoice.value = null
      feedbackState.value = null
    }, 800)
  }
}

// --- Choice button state helper ---
function choiceState(i: number): 'idle' | 'correct' | 'incorrect' {
  if (selectedChoice.value === null) return 'idle'
  if (choices.value[i].isCorrect) return 'correct'
  if (i === selectedChoice.value) return 'incorrect'
  return 'idle'
}

// --- Reset session ---
function resetSession() {
  index.value = 0
  done.value = false
  allDone.value = false
  selectedChoice.value = null
  micState.value = 'idle'
  feedbackState.value = null
  sessionDueCards.value = [...qaComputedDue.value]
}

// --- Mic: choice matching ---
function handleMicPress() {
  if (isListening.value || selectedChoice.value !== null) return
  micState.value = 'listening'
  startListening(
    (transcript) => {
      micState.value = 'idle'
      const norm = normalize(transcript)
      const match = choices.value.findIndex(c => normalize(c.text) === norm)
      if (match >= 0) {
        handleChoiceClick(match)
      } else {
        feedbackState.value = null
        micState.value = 'idle'
      }
    },
    () => {
      micState.value = 'error'
    }
  )
}
</script>

<template>
  <ClientOnly>
    <main>
      <!-- All-done screen: no cards due at all across all scenarios -->
      <div v-if="allDone || sessionDueCards.length === 0" data-session-done>
        <NuxtLinkLocale to="/qa" class="nav-back-btn">
          {{ t('study.backToScenarios') }}
        </NuxtLinkLocale>
        <div style="text-align: center; padding: 4rem 2rem;">
          <p style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">
            {{ t('study.allScenariosDone') }}
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <NuxtLinkLocale to="/qa">
              <button type="button" class="btn secondary">{{ t('study.backToScenarios') }}</button>
            </NuxtLinkLocale>
          </div>
        </div>
      </div>

      <!-- Scenario-done screen: this scenario exhausted but others remain -->
      <div v-else-if="done && !allDone" data-deck-done>
        <NuxtLinkLocale to="/qa" class="nav-back-btn">
          {{ t('study.backToScenarios') }}
        </NuxtLinkLocale>
        <div style="text-align: center; padding: 4rem 2rem;">
          <p style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">
            {{ t('study.scenarioDone') }}
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <NuxtLinkLocale to="/qa">
              <button type="button" class="btn secondary">{{ t('study.backToScenarios') }}</button>
            </NuxtLinkLocale>
            <button type="button" class="btn primary" @click="resetSession">
              {{ t('study.studyAgain') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Active session card -->
      <div v-else data-session-card>
        <NuxtLinkLocale to="/qa" class="nav-back-btn">
          {{ t('study.backToScenarios') }}
        </NuxtLinkLocale>

        <!-- Progress bar -->
        <div data-progress-bar class="progress-bar" style="width: 100%;">
          <div
            class="progress-fill"
            :style="{ width: `${(index / sessionDueCards.length) * 100}%` }"
          />
        </div>

        <!-- Card counter -->
        <p style="font-size: 0.85rem; text-align: center;">
          <span data-card-counter>
            {{ t('study.cardCounter', { current: index + 1, total: sessionDueCards.length }) }}
          </span>
        </p>

        <!-- Question text -->
        <div class="card-container" style="margin: 1.5rem 0;">
          <p style="font-size: 1.25rem; font-weight: 600; text-align: center; margin-bottom: 1rem;">
            {{ lang === 'it' ? currentCard?.question : currentCard?.questionEs }}
          </p>
          <AudioButton
            v-if="currentCard"
            :phrase="lang === 'it' ? currentCard.question : (currentCard.questionEs ?? '')"
            :lang="lang"
          />
        </div>

        <!-- Choice buttons -->
        <div class="quiz-options">
          <ChoiceButton
            v-for="(choice, i) in choices"
            :key="i"
            :text="choice.text"
            :state="choiceState(i)"
            :disabled="selectedChoice !== null"
            data-choice
            @click="handleChoiceClick(i)"
            @speak="speak(choice.text, lang)"
          />
        </div>

        <!-- Feedback -->
        <FeedbackMessage :state="feedbackState" />

        <!-- Mic button -->
        <MicButton
          v-if="isSupported"
          :state="micState"
          @press="handleMicPress"
        />
      </div>
    </main>

    <template #fallback>
      <p>Loading...</p>
    </template>
  </ClientOnly>
</template>
