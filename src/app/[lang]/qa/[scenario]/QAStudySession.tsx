'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Lang, Level, Scenario, ScenarioId, ProgressRecord } from '@/types';
import { useQASRS } from '@/hooks/useQASRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { isCardDue, getQACardKey } from '@/lib/srs';
import { loadProgress } from '@/lib/progressStorage';
import { bestMatch } from '@/lib/matchTranscript';
import { shuffle } from '@/lib/shuffle';
import { speak, stopSpeaking } from '@/lib/speak';
import { scenarios as allScenarios } from '@/data/qa';
import AudioButton from '@/components/AudioButton';
import ChoiceButton from '@/components/ChoiceButton';
import FeedbackMessage from '@/components/FeedbackMessage';
import MicButton from '@/components/MicButton';

interface Props {
  lang: Lang;
  scenario: Scenario;
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
    return isCardDue(progress[getQACardKey(scenarioId, card.id)]);
  });
}

export default function QAStudySession({ lang, scenario }: Props) {
  // useLevelFilter needs hasProgress before useQASRS can run (useQASRS needs
  // activeLevels), so read it straight from storage once. It only picks the
  // default levels when no Q&A filter is saved. Any progress counts (Rephrase
  // or Q&A), matching the Q&A list page, so both default to the same levels.
  const [bootstrapHasProgress] = useState(() => Object.keys(loadProgress(lang)).length > 0);

  const { activeLevels } = useLevelFilter(lang, bootstrapHasProgress, 'qa');

  const { dueCards, updateCard, progress } = useQASRS(
    lang,
    scenario.id,
    scenario.cards,
    activeLevels
  );

  const t = useTranslations('study');

  // Snapshot due cards once at session start — prevents re-filtering mid-session
  const [sessionDueCards] = useState(() => dueCards);

  const { isSupported, startListening, stopListening } = useVoiceRecognition(lang);

  const [index, setIndex] = useState(0);
  // Which end screen to show is derived at render time (below), not decided in
  // `advance()`: its closure still sees progress from before
  // updateCard, so the just-answered card would always look due.
  const [finished, setFinished] = useState(false);
  // "Study again" replays the session as practice: answers are not saved.
  const [practice, setPractice] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  // A wrong choice lets the user retry, but the card is still recorded as wrong.
  const [missedCurrent, setMissedCurrent] = useState(false);
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

  // Auto-speak the question whenever a card is shown: a new index, or the
  // first card again after "Study again" (finished goes back to false, which
  // matters when a one-card session's index never changes). Not on end screens.
  useEffect(() => {
    if (questionText && !finished) speak(questionText, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished]);

  // Leaving the session stops a question still being read.
  useEffect(() => stopSpeaking, []);

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
    setFinished(false);
    setPractice(true);
    setSelectedChoice(null);
    setMissedCurrent(false);
    setMicState('idle');
    setFeedbackState(null);
  }

  // Recorded when the correct answer is given, not when the card advances:
  // leaving the page during the 600 ms delay must not leave it to a timer.
  // A card missed before the correct retry counts as wrong.
  function recordCorrectAnswer() {
    if (currentCard && !practice) updateCard(currentCard.id, !missedCurrent);
  }

  function advance() {
    setSelectedChoice(null);
    setMissedCurrent(false);
    setFeedbackState(null);

    if (index + 1 < sessionDueCards.length) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  }

  function handleChoiceClick(choiceIndex: number) {
    if (selectedChoice !== null) return; // already answered
    // A tap ends a voice attempt in progress, so its late result can't answer
    // again (or record a missed card as correct).
    if (micState === 'listening') cancelListening();
    const isCorrect = choices[choiceIndex].isCorrect;
    setSelectedChoice(choiceIndex);
    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      recordCorrectAnswer();
      setTimeout(advance, 600);
    } else {
      // Wrong answer — show red/green feedback, then reset so user can retry
      setMissedCurrent(true);
      setTimeout(() => {
        setSelectedChoice(null);
        setFeedbackState(null);
      }, 800);
    }
  }

  function cancelListening() {
    stopListening();
    setMicState('idle');
  }

  // Ends the 800 ms error display, unless a new attempt has already replaced it.
  function resetMicError() {
    setMicState((s) => (s === 'error' ? 'idle' : s));
    setFeedbackState((f) => (f === 'notRecognized' ? null : f));
  }

  function handleMicPress() {
    // Pressing the mic while listening cancels (the button is a toggle: aria-pressed).
    // micState is the session's own listening state, set only when listening starts.
    if (micState === 'listening') return cancelListening();
    if (selectedChoice !== null) return;
    const started = startListening(
      (transcript) => {
        setMicState('idle');
        // Best match over every choice: a transcript closer to a foil is not correct.
        const matchedIndex = bestMatch(transcript, choices.map((c) => c.text));
        if (matchedIndex !== -1 && choices[matchedIndex].isCorrect) {
          setSelectedChoice(matchedIndex);
          setFeedbackState('correct');
          recordCorrectAnswer();
          setTimeout(advance, 600);
        } else {
          // Non-match: notRecognized, no SRS update, choices remain available
          setFeedbackState('notRecognized');
          setMicState('error');
          setTimeout(resetMicError, 800);
        }
      },
      () => {
        // Recognition error
        setFeedbackState('notRecognized');
        setMicState('error');
        setTimeout(resetMicError, 800);
      }
    );
    if (started) setMicState('listening'); // a refused start must not look like listening
  }

  // Opening a scenario with nothing due is like finishing it: all-done only when
  // no scenario has due cards, otherwise scenario-done.
  // `progress` here is post-updateCard, so the just-answered card is counted correctly.
  const scenarioDone = finished || sessionDueCards.length === 0;
  const allDone =
    scenarioDone &&
    !allScenarios.some((sc) => isScenarioHasDue(progress, sc.id, sc.cards, activeLevels));

  if (allDone) {
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
                {sessionDueCards.length > 0 && (
                  <button className="btn primary" type="button" onClick={resetSession}>
                    {t('studyAgain')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Scenario-done screen (this scenario finished or had nothing due, but other scenarios have due cards)
  if (scenarioDone) {
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
                {sessionDueCards.length > 0 && (
                  <button className="btn primary" type="button" onClick={resetSession}>
                    {t('studyAgain')}
                  </button>
                )}
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem 1.25rem',
            background: 'rgba(230, 155, 0, 0.07)',
            border: '1.5px solid rgba(230, 155, 0, 0.22)',
            borderRadius: '12px',
            marginBottom: '0.5rem',
          }}
        >
          <p
            id="question-text"
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {questionText}
          </p>
          <div className="card-audio-controls">
            <AudioButton phrase={questionText} lang={lang} />
          </div>
        </div>

        {isSupported && (
          <div
            className="card-audio-controls"
            style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}
          >
            <MicButton state={micState} onPress={handleMicPress} />
          </div>
        )}

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
