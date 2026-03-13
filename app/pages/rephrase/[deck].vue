<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Card, DeckId, Lang, Level } from '~/types'
import { useSRS } from '~/composables/useSRS'
import { useLevelFilter } from '~/composables/useLevelFilter'
import { useVoiceRecognition } from '~/composables/useVoiceRecognition'
import { DECK_MAP } from '~/data/deckMap'
import { deckMetadata } from '~/data/decks'
import { generateChoices } from '~/lib/generateChoices'

// --- Types ---
type DueEntry = { originalIndex: number; card: Card }
type FeedbackState = 'correct' | 'incorrect' | 'heard' | 'notRecognized' | null

// --- i18n & routing ---
const { t, locale } = useI18n()
const route = useRoute()
const lang = locale.value as Lang
const deckId = route.params.deck as DeckId
const cards: Card[] = DECK_MAP[lang]?.[deckId] ?? []

// --- Composables (top-level, no onMounted) ---
const { isCardDueForDeck, updateCard, hasProgress, progress } = useSRS(lang)
const { activeLevels } = useLevelFilter(lang, hasProgress)
const { isSupported, isListening, startListening } = useVoiceRecognition(lang)

// --- Session state ---
const dueCards = ref<DueEntry[]>([])
const index = ref(0)
const flipped = ref(false)
const done = ref(false)
const allDone = ref(false)
const selectedChoice = ref<number | null>(null)
const micState = ref<'idle' | 'listening' | 'error'>('idle')
const feedbackState = ref<FeedbackState>(null)

// --- Snapshot dueCards in onMounted (Rule: never computed) ---
onMounted(() => {
  const levels: Level[] = activeLevels.value ?? ['A1']
  dueCards.value = cards
    .map((card, i) => ({ originalIndex: i, card }))
    .filter(({ card, originalIndex }) =>
      levels.includes(card.level) && isCardDueForDeck(deckId, originalIndex)
    )
})

// --- Computed helpers ---
const filteredCards = computed(() =>
  cards.filter(c => (activeLevels.value ?? ['A1']).includes(c.level))
)

const currentEntry = computed(() => dueCards.value[index.value] ?? null)

const choices = computed(() =>
  currentEntry.value ? generateChoices(currentEntry.value.card, filteredCards.value) : []
)

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

// --- Reset session ---
function resetSession() {
  index.value = 0
  flipped.value = false
  done.value = false
  allDone.value = false
  selectedChoice.value = null
  micState.value = 'idle'
  feedbackState.value = null
  // Re-snapshot dueCards with fresh SRS state
  const levels: Level[] = activeLevels.value ?? ['A1']
  dueCards.value = cards
    .map((card, i) => ({ originalIndex: i, card }))
    .filter(({ card, originalIndex }) =>
      levels.includes(card.level) && isCardDueForDeck(deckId, originalIndex)
    )
}

// --- Handle answer (SRS update + advance) ---
function handleAnswer(correct: boolean) {
  if (!currentEntry.value) return
  const { originalIndex } = currentEntry.value
  updateCard(deckId, originalIndex, correct)
  flipped.value = false
  selectedChoice.value = null
  feedbackState.value = null

  if (index.value < dueCards.value.length - 1) {
    index.value++
  } else {
    // Check if all decks are exhausted
    const langDecks = deckMetadata.filter(d => d.lang === lang)
    const allDecksEmpty = langDecks.every(({ id }) => {
      const deckCards = DECK_MAP[lang]?.[id] ?? []
      const levels: Level[] = activeLevels.value ?? ['A1']
      return deckCards
        .map((card, i) => ({ card, i }))
        .filter(({ card }) => levels.includes(card.level))
        .every(({ i }) => !isCardDueForDeck(id, i))
    })
    if (allDecksEmpty) {
      allDone.value = true
    } else {
      done.value = true
    }
  }
}

// --- Handle Prossimo (Next) button: flip back to front, then advance ---
function handleNext() {
  flipped.value = false
  setTimeout(() => handleAnswer(true), 700)
}

// --- Handle choice button click ---
function handleChoiceClick(i: number) {
  if (selectedChoice.value !== null) return // already answered
  const isCorrect = choices.value[i].isCorrect
  selectedChoice.value = i
  feedbackState.value = isCorrect ? 'correct' : 'incorrect'
  setTimeout(() => {
    handleAnswer(isCorrect)
    selectedChoice.value = null
  }, 600)
}

// --- Mic: front of card ---
function handleFrontMicPress() {
  if (isListening.value || !currentEntry.value) return
  micState.value = 'listening'
  startListening(
    (transcript) => {
      micState.value = 'idle'
      if (normalize(transcript) === normalize(currentEntry.value!.card.front)) {
        flipped.value = true
        feedbackState.value = null
      } else {
        feedbackState.value = 'notRecognized'
        micState.value = 'error'
        setTimeout(() => { micState.value = 'idle' }, 800)
      }
    },
    () => {
      feedbackState.value = 'notRecognized'
      micState.value = 'error'
      setTimeout(() => { micState.value = 'idle' }, 800)
    }
  )
}

// --- Mic: back of card (choice matching) ---
function handleBackMicPress() {
  if (isListening.value || selectedChoice.value !== null) return
  micState.value = 'listening'
  startListening(
    (transcript) => {
      micState.value = 'idle'
      const matchedIndex = choices.value.findIndex(
        c => normalize(c.text) === normalize(transcript)
      )
      if (matchedIndex !== -1) {
        feedbackState.value = 'heard'
        handleChoiceClick(matchedIndex)
      } else {
        feedbackState.value = 'notRecognized'
        micState.value = 'error'
        setTimeout(() => { micState.value = 'idle' }, 800)
      }
    },
    () => {
      feedbackState.value = 'notRecognized'
      micState.value = 'error'
      setTimeout(() => { micState.value = 'idle' }, 800)
    }
  )
}

// --- Choice button state helper ---
function choiceState(i: number): 'idle' | 'correct' | 'incorrect' {
  if (selectedChoice.value === null) return 'idle'
  if (choices.value[i].isCorrect) return 'correct'
  if (i === selectedChoice.value) return 'incorrect'
  return 'idle'
}
</script>

<template>
  <ClientOnly>
    <main>
      <!-- All-done screen: no cards due at all across all decks -->
      <div v-if="allDone || dueCards.length === 0" data-session-done>
        <NuxtLinkLocale to="/rephrase" class="nav-back-btn">
          {{ t('study.backToDecks') }}
        </NuxtLinkLocale>
        <div style="text-align: center; padding: 4rem 2rem;">
          <p style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">
            {{ t('study.allDone') }}
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <NuxtLinkLocale to="/rephrase">
              <button type="button" class="btn secondary">{{ t('study.backToDecks') }}</button>
            </NuxtLinkLocale>
            <button type="button" class="btn primary" @click="resetSession">
              {{ t('study.studyAgain') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Deck-done screen: this deck exhausted but others remain -->
      <div v-else-if="done && !allDone" data-deck-done>
        <NuxtLinkLocale to="/rephrase" class="nav-back-btn">
          {{ t('study.backToDecks') }}
        </NuxtLinkLocale>
        <div style="text-align: center; padding: 4rem 2rem;">
          <p style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">
            {{ t('study.deckComplete') }}
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <NuxtLinkLocale to="/rephrase">
              <button type="button" class="btn secondary">{{ t('study.backToDecks') }}</button>
            </NuxtLinkLocale>
            <button type="button" class="btn primary" @click="resetSession">
              {{ t('study.studyAgain') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Active session card -->
      <div v-else data-session-card>
        <NuxtLinkLocale to="/rephrase" class="nav-back-btn">
          {{ t('study.backToDecks') }}
        </NuxtLinkLocale>

        <!-- Progress bar -->
        <div data-progress-bar class="progress-bar" style="width: 100%;">
          <div
            class="progress-fill"
            :style="{ width: `${((index) / dueCards.length) * 100}%` }"
          />
        </div>

        <!-- Card counter -->
        <p style="font-size: 0.85rem; text-align: center;">
          <span data-card-counter>
            {{ t('study.cardCounter', { current: index + 1, total: dueCards.length }) }}
          </span>
        </p>

        <!-- Card container -->
        <div class="card-container">
          <div
            class="card"
            :class="{ flipped }"
            @click="() => { if (!flipped) flipped = true }"
          >
            <!-- Front face -->
            <div class="card-face card-front">
              <AudioButton
                v-if="currentEntry"
                :phrase="currentEntry.card.front"
                :lang="lang"
              />
              <MicButton
                v-if="isSupported"
                :state="micState"
                @press="handleFrontMicPress"
              />
              <span id="card-front-text">{{ currentEntry?.card.front }}</span>
              <p style="margin-top: 1.5rem; font-size: 0.85rem;">
                {{ t('study.tapToReveal') }}
              </p>
              <FeedbackMessage :state="feedbackState" />
            </div>

            <!-- Back face (choices) -->
            <div class="card-face card-back" style="padding-top: 4rem;">
              <MicButton
                v-if="isSupported"
                :state="micState"
                @press="handleBackMicPress"
              />
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
              <FeedbackMessage :state="feedbackState" />

              <div v-if="selectedChoice === null" class="controls">
                <button
                  type="button"
                  class="btn secondary"
                  @click.stop="flipped = false"
                >
                  {{ t('study.flipButton') }}
                </button>
                <button
                  type="button"
                  class="btn primary"
                  @click="handleNext"
                >
                  {{ t('study.nextButton') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <template #fallback>
      <p>Loading...</p>
    </template>
  </ClientOnly>
</template>
