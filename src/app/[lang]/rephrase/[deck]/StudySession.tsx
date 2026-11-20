'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Card, DeckId, Lang } from '@/types';
import { useSRS } from '@/hooks/useSRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import { generateChoices } from '@/lib/generateChoices';
import { bestMatch, matchesTranscript } from '@/lib/matchTranscript';
import { speak } from '@/lib/speak';
import AudioButton from '@/components/AudioButton';
import ChoiceButton from '@/components/ChoiceButton';
import FeedbackMessage from '@/components/FeedbackMessage';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import MicButton from '@/components/MicButton';
import { deckMetadata } from '@/data/decks';
import { DECK_MAP } from '@/data/deckMap';

interface Props {
  lang: Lang;
  deckId: DeckId;
  cards: Card[];
}

export default function StudySession({ lang, deckId, cards }: Props) {
  const { isCardDueForDeck, updateCard, hasProgress } = useSRS(lang);
  const { activeLevels } = useLevelFilter(lang, hasProgress, 'rephrase');
  const t = useTranslations('study');

  // Snapshot due cards once at session start — prevents re-filtering as SRS state updates
  // during the session (which would cause cards to be skipped as each answered card
  // is removed from the due list, shifting indices).
  const [dueCards] = useState(() =>
    cards
      .map((card, i) => ({ originalIndex: i, card }))
      .filter(({ card, originalIndex }) =>
        activeLevels.includes(card.level) && isCardDueForDeck(deckId, originalIndex)
      )
  );

  const { isSupported, startListening, stopListening } = useVoiceRecognition(lang);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // Which end screen to show is derived at render time (below), not decided in
  // `advance()`: its closure still sees progress from before
  // updateCard, so the just-answered card would always look due.
  const [finished, setFinished] = useState(false);
  // "Study again" replays the session as practice: answers are not saved.
  const [practice, setPractice] = useState(false);
  // selectedChoice: null = not answered, index of selected choice once answered
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [micState, setMicState] = useState<'idle' | 'listening' | 'error'>('idle');
  const [feedbackState, setFeedbackState] = useState<'correct' | 'incorrect' | 'heard' | 'notRecognized' | null>(null);
  // Pending auto-advance after a choice; Next cancels it and advances at once.
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const backLink = `/${lang}/rephrase`;

  // Filtered cards pool for choices — stable for the session
  const filteredCards = useMemo(
    () => cards.filter(card => activeLevels.includes(card.level)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // activeLevels is stable for the session; cards is a prop that won't change
  );

  const currentEntry = dueCards[index];

  // Must be called unconditionally (Rules of Hooks) — safe fallback when no current card
  const choices = useMemo(
    () => currentEntry ? generateChoices(currentEntry.card, filteredCards) : [],
    [currentEntry, filteredCards]
  );

  // Keyboard users follow the flip: to the first answer when the card turns
  // over, back to the reveal button when it turns back (Flip, or the next card).
  const revealRef = useRef<HTMLButtonElement>(null);
  const answersRef = useRef<HTMLDivElement>(null);
  const wasFlipped = useRef(flipped);
  useEffect(() => {
    if (wasFlipped.current === flipped) return;
    wasFlipped.current = flipped;
    if (flipped) answersRef.current?.querySelector<HTMLButtonElement>('.quiz-btn')?.focus();
    else revealRef.current?.focus();
  }, [flipped]);

  function resetSession() {
    setIndex(0);
    setFlipped(false);
    setFinished(false);
    setPractice(true);
    setSelectedChoice(null);
    setMicState('idle');
    setFeedbackState(null);
  }

  function allDecksEmpty(): boolean {
    return deckMetadata
      .filter((d) => d.lang === lang)
      .every(({ id }) =>
        (DECK_MAP[lang]?.[id] ?? [])
          .map((card, i) => ({ card, i }))
          .filter(({ card }) => activeLevels.includes(card.level))
          .every(({ i }) => !isCardDueForDeck(id, i))
      );
  }

  // Opening a deck with nothing due is like finishing it: all-done only when
  // no deck has due cards, otherwise deck-complete.
  const deckDone = finished || dueCards.length === 0;
  const allDone = deckDone && allDecksEmpty();

  if (allDone) {
    return (
      <main>
        <div id="flashcard-view" style={{ paddingTop: '2rem' }}>
          <Link href={backLink} className="nav-back-btn">{t('backToDecks')}</Link>
          <div className="card-container" style={{ height: 'auto', perspective: 'none' }}>
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                {t('allDone')}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={backLink}>
                  <button className="btn secondary" type="button">{t('backToDecks')}</button>
                </Link>
                {dueCards.length > 0 && (
                  <button className="btn primary" type="button" onClick={resetSession}>{t('studyAgain')}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (deckDone) {
    return (
      <main>
        <div id="flashcard-view" style={{ paddingTop: '2rem' }}>
          <Link href={backLink} className="nav-back-btn">{t('backToDecks')}</Link>
          <div className="card-container" style={{ height: 'auto', perspective: 'none' }}>
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                {t('deckComplete')}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={backLink}>
                  <button className="btn secondary" type="button">{t('backToDecks')}</button>
                </Link>
                {dueCards.length > 0 && (
                  <button className="btn primary" type="button" onClick={resetSession}>{t('studyAgain')}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { originalIndex, card: currentCard } = currentEntry!;

  // Pressing the mic while listening cancels (the button is a toggle: aria-pressed).
  // micState is the session's own listening state, set only when listening starts.
  function cancelListening() {
    stopListening();
    setMicState('idle');
  }

  // Ends the 800 ms error display, unless a new attempt has already replaced it.
  function resetMicError() {
    setMicState((s) => (s === 'error' ? 'idle' : s));
  }

  function handleFrontMicPress() {
    if (micState === 'listening') return cancelListening();
    const started = startListening(
      (transcript) => {
        setMicState('idle');
        if (matchesTranscript(transcript, currentCard.front)) {
          setFeedbackState('heard');
          setFlipped(true);
        } else {
          setFeedbackState('notRecognized');
          setMicState('error');
          setTimeout(resetMicError, 800);
        }
      },
      () => {
        setFeedbackState('notRecognized');
        setMicState('error');
        setTimeout(resetMicError, 800);
      }
    );
    if (started) setMicState('listening'); // a refused start must not look like listening
  }

  function handleBackMicPress() {
    if (micState === 'listening') return cancelListening();
    if (selectedChoice !== null) return;
    const started = startListening(
      (transcript) => {
        setMicState('idle');
        const matchedIndex = bestMatch(transcript, choices.map((c) => c.text));
        if (matchedIndex !== -1) {
          setFeedbackState('heard');
          handleChoiceClick(matchedIndex);
        } else {
          setFeedbackState('notRecognized');
          setMicState('error');
          setTimeout(resetMicError, 800);
        }
      },
      () => {
        setFeedbackState('notRecognized');
        setMicState('error');
        setTimeout(resetMicError, 800);
      }
    );
    if (started) setMicState('listening'); // a refused start must not look like listening
  }

  function advance() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    setFlipped(false);
    setSelectedChoice(null);
    setFeedbackState(null);
    if (index + 1 < dueCards.length) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  }

  function handleChoiceClick(choiceIndex: number) {
    if (selectedChoice !== null) return; // already answered
    // A tap ends a voice attempt in progress, so its late result can't answer again.
    if (micState === 'listening') cancelListening();
    const isCorrect = choices[choiceIndex].isCorrect;
    setSelectedChoice(choiceIndex);
    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    // Recorded at the tap, not when the card advances: leaving the page during
    // the 600 ms delay must not leave the answer to a timer.
    if (!practice) updateCard(deckId, originalIndex, isCorrect);
    advanceTimer.current = setTimeout(advance, 600);
  }

  const progressPercent = Math.round((index / dueCards.length) * 100);

  return (
    <main>
      <div id="flashcard-view">
        <Link href={backLink} className="nav-back-btn">{t('backToDecks')}</Link>

        <div className="progress-bar" style={{ width: '100%' }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
          {t('cardCounter', { current: index + 1, total: dueCards.length })}
        </p>

        <div
          className="card-container"
          onClick={() => { if (!flipped) setFlipped(true); }}
        >
          <div className={`card${flipped ? ' flipped' : ''}`}>
            <div className="card-face card-front">
              <AudioButton phrase={currentCard.front} lang={lang} />
              {isSupported && (
                <MicButton state={micState} onPress={handleFrontMicPress} />
              )}
              <span id="card-front-text">{currentCard.front}</span>
              {/* A real button, so the card can be revealed from the keyboard;
                  a click anywhere on the card still flips it too. */}
              {!flipped && (
                <button
                  ref={revealRef}
                  type="button"
                  onClick={() => setFlipped(true)}
                  style={{ font: 'inherit', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {t('tapToReveal')}
                </button>
              )}
            </div>
            <div className="card-face card-back">
              {isSupported && flipped && (
                <MicButton state={micState} onPress={handleBackMicPress} />
              )}
              <div className="quiz-options" ref={answersRef}>
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
            </div>
          </div>
        </div>

        {/* One live region, outside the card: the back face is hidden while
            the card is face-down, which is when front-mic feedback appears. */}
        <FeedbackMessage state={feedbackState} />

        {flipped && (
          <div className="controls">
            <button className="btn secondary" onClick={() => setFlipped(false)}>
              {t('flipButton')}
            </button>
            <button
              className="btn primary"
              disabled={selectedChoice === null}
              onClick={() => { if (selectedChoice !== null) advance(); }}
            >
              {t('nextButton')}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
