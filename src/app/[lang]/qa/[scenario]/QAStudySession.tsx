'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Lang, Level, Scenario, ScenarioId, ProgressRecord } from '@/types';
import { useQASRS } from '@/hooks/useQASRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { isCardDue } from '@/lib/srs';
import { scenarios as allScenarios } from '@/data/qa';
import AudioButton from '@/components/AudioButton';
import ChoiceButton from '@/components/ChoiceButton';
import FeedbackMessage from '@/components/FeedbackMessage';
import MicButton from '@/components/MicButton';

interface Props {
  lang: Lang;
  scenario: Scenario;
}

const LANG_LOCALE: Record<Lang, string> = { it: 'it-IT', es: 'es-ES' };

function speak(phrase: string, lang: Lang) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.lang = LANG_LOCALE[lang];
  utterance.rate = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const matching = voices.filter((v) => v.lang.startsWith(lang));
  const exact = matching.find((v) => v.lang === LANG_LOCALE[lang]);
  utterance.voice = exact ?? matching[0] ?? null;
  window.speechSynthesis.speak(utterance);
}

/** Fisher-Yates shuffle — returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Check whether a given scenario has any cards due, using raw progress state.
 * Used for the all-done check across all scenarios after the last card.
 */
function isScenarioHasDue(
  progress: ProgressRecord,
  scenarioId: ScenarioId,
  cards: { id: string; level: Level }[],
  activeLevels: Level[]
): boolean {
  return cards.some((card) => {
    if (!activeLevels.includes(card.level)) return false;
    const key = `qa_${scenarioId}_${card.id}`;
    return isCardDue(progress[key]);
  });
}

export default function QAStudySession({ lang, scenario }: Props) {
  // useLevelFilter called first; hasProgress defaults to false if no localStorage entry.
  // In practice, useLevelFilter reads its own saved filter from localStorage, so
  // hasProgress only affects the default when there is NO saved filter.
  // We derive hasProgress from the progress object returned by useQASRS after initial render.
  // The dependency chain: useLevelFilter(hasProgress) → activeLevels → useQASRS(activeLevels)
  // Since useLevelFilter's hasProgress param only sets the DEFAULT levels (localStorage wins),
  // we bootstrap with hasProgress=false and let useQASRS's returned hasProgress update on rerender.
  // For the first render this means new users get A1 (correct), returning users get their saved filter.
  const [bootstrapHasProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(`${lang}-progress`);
      if (!saved) return false;
      const parsed = JSON.parse(saved) as Record<string, unknown>;
      return Object.keys(parsed).some((k) => k.startsWith('qa_'));
    } catch {
      return false;
    }
  });

  const { activeLevels } = useLevelFilter(lang, bootstrapHasProgress);

  const { dueCards, updateCard, progress } = useQASRS(
    lang,
    scenario.id,
    scenario.cards,
    activeLevels
  );

  const t = useTranslations('study');

  // Snapshot due cards once at session start — prevents re-filtering mid-session
  const [sessionDueCards] = useState(() => dueCards);

  const { isSupported, isListening, startListening } = useVoiceRecognition(lang);

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [micState, setMicState] = useState<'idle' | 'listening' | 'error'>('idle');
  const [feedbackState, setFeedbackState] = useState<
    'correct' | 'incorrect' | 'heard' | 'notRecognized' | null
  >(null);

  const backLink = `/${lang}/qa`;

  const currentCard = sessionDueCards[index];

  // Resolve text fields based on language
  const questionText = currentCard
    ? lang === 'it'
      ? currentCard.question
      : currentCard.questionEs
    : '';
  const correctText = currentCard
    ? lang === 'it'
      ? currentCard.correct
      : currentCard.correctEs
    : '';
  const foilTexts: string[] = currentCard
    ? lang === 'it'
      ? [...currentCard.foils]
      : [...currentCard.foilsEs]
    : [];

  // Stable shuffled choices for the current card — recomputes when card changes
  const choices = useMemo(() => {
    if (!currentCard) return [];
    const options: { text: string; isCorrect: boolean }[] = [
      { text: correctText, isCorrect: true },
      ...foilTexts.map((f) => ({ text: f, isCorrect: false })),
    ];
    return shuffle(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCard]);

  function resetSession() {
    setIndex(0);
    setDone(false);
    setAllDone(false);
    setSelectedChoice(null);
    setMicState('idle');
    setFeedbackState(null);
  }

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"¿¡]+$/g, '')
      .trim();

  function handleAnswer(isCorrect: boolean) {
    if (currentCard) {
      updateCard(currentCard.id, isCorrect);
    }
    setSelectedChoice(null);
    setFeedbackState(null);

    if (index + 1 < sessionDueCards.length) {
      setIndex((i) => i + 1);
    } else {
      // Check all 7 scenarios for any remaining due cards using live progress state
      const anyScenarioHasDue = allScenarios.some((sc) =>
        isScenarioHasDue(progress, sc.id, sc.cards, activeLevels)
      );
      if (anyScenarioHasDue) {
        setDone(true);
      } else {
        setAllDone(true);
      }
    }
  }

  function handleChoiceClick(choiceIndex: number) {
    if (selectedChoice !== null) return; // already answered
    const isCorrect = choices[choiceIndex].isCorrect;
    setSelectedChoice(choiceIndex);
    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => handleAnswer(isCorrect), 600);
  }

  function handleMicPress() {
    if (isListening || selectedChoice !== null) return;
    setMicState('listening');
    startListening(
      (transcript) => {
        setMicState('idle');
        if (normalize(transcript) === normalize(correctText)) {
          // Matched correct answer — find correct choice and trigger click
          const correctIndex = choices.findIndex((c) => c.isCorrect);
          if (correctIndex !== -1) {
            setSelectedChoice(correctIndex);
            setFeedbackState('correct');
            setTimeout(() => handleAnswer(true), 600);
          }
        } else {
          // Non-match: notRecognized, no SRS update, choices remain available
          setFeedbackState('notRecognized');
          setMicState('error');
          setTimeout(() => {
            setMicState('idle');
            setFeedbackState(null);
          }, 800);
        }
      },
      () => {
        // Recognition error
        setFeedbackState('notRecognized');
        setMicState('error');
        setTimeout(() => {
          setMicState('idle');
          setFeedbackState(null);
        }, 800);
      }
    );
  }

  // All-done screen (shown when 0 due cards at mount OR after all scenarios exhausted)
  if (allDone || sessionDueCards.length === 0) {
    return (
      <main>
        <div id="flashcard-view" style={{ paddingTop: '2rem' }}>
          <Link href={backLink} className="nav-back-btn">
            {t('backToScenarios')}
          </Link>
          <div className="card-container" style={{ height: 'auto', perspective: 'none' }}>
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                  color: 'var(--color-text)',
                }}
              >
                {t('allScenariosDone')}
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link href={backLink}>
                  <button className="btn secondary" type="button">
                    {t('backToScenarios')}
                  </button>
                </Link>
                <button className="btn primary" type="button" onClick={resetSession}>
                  {t('studyAgain')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Scenario-done screen (shown after last card in this scenario, but other scenarios have due cards)
  if (done) {
    return (
      <main>
        <div id="flashcard-view" style={{ paddingTop: '2rem' }}>
          <Link href={backLink} className="nav-back-btn">
            {t('backToScenarios')}
          </Link>
          <div className="card-container" style={{ height: 'auto', perspective: 'none' }}>
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                  color: 'var(--color-text)',
                }}
              >
                {t('scenarioDone')}
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link href={backLink}>
                  <button className="btn secondary" type="button">
                    {t('backToScenarios')}
                  </button>
                </Link>
                <button className="btn primary" type="button" onClick={resetSession}>
                  {t('studyAgain')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const progressPercent = Math.round((index / sessionDueCards.length) * 100);

  return (
    <main>
      <div id="flashcard-view">
        <Link href={backLink} className="nav-back-btn">
          {t('backToScenarios')}
        </Link>

        <div className="progress-bar" style={{ width: '100%' }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-light)',
            textAlign: 'center',
          }}
        >
          {t('cardCounter', { current: index + 1, total: sessionDueCards.length })}
        </p>

        <div className="card-container">
          <div className="card">
            <div className="card-face">
              <p
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  marginBottom: '1rem',
                  color: 'var(--color-text)',
                }}
                id="question-text"
              >
                {questionText}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                <AudioButton phrase={questionText} lang={lang} />
                {isSupported && <MicButton state={micState} onPress={handleMicPress} />}
              </div>
            </div>
          </div>
        </div>

        <div className="quiz-options">
          {choices.map((choice, i) => {
            let state: 'idle' | 'correct' | 'incorrect' = 'idle';
            if (selectedChoice !== null) {
              if (choice.isCorrect) state = 'correct';
              else if (i === selectedChoice) state = 'incorrect';
            }
            return (
              <ChoiceButton
                key={i}
                text={choice.text}
                state={state}
                onClick={() => handleChoiceClick(i)}
                disabled={selectedChoice !== null}
                onSpeak={() => speak(choice.text, lang)}
              />
            );
          })}
        </div>

        <FeedbackMessage state={feedbackState} />
      </div>
    </main>
  );
}
