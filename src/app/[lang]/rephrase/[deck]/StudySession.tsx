'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Card, DeckId, Lang } from '@/types';
import { useSRS } from '@/hooks/useSRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import { generateChoices } from '@/lib/generateChoices';
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

export default function StudySession({ lang, deckId, cards }: Props) {
  const { isCardDueForDeck, updateCard, hasProgress } = useSRS(lang);
  const { activeLevels } = useLevelFilter(lang, hasProgress);
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

  const { isSupported, isListening, startListening } = useVoiceRecognition(lang);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  // selectedChoice: null = not answered, index of selected choice once answered
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [micState, setMicState] = useState<'idle' | 'listening' | 'error'>('idle');
  const [feedbackState, setFeedbackState] = useState<'correct' | 'incorrect' | 'heard' | 'notRecognized' | null>(null);

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

  function resetSession() {
    setIndex(0);
    setFlipped(false);
    setDone(false);
    setAllDone(false);
    setSelectedChoice(null);
    setMicState('idle');
    setFeedbackState(null);
  }

  if (allDone || dueCards.length === 0) {
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
                <button className="btn primary" type="button" onClick={resetSession}>{t('studyAgain')}</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (done) {
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
                <button className="btn primary" type="button" onClick={resetSession}>{t('studyAgain')}</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { originalIndex, card: currentCard } = currentEntry!;

  const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;:'"¿¡]+$/g, '').trim();

  function handleFrontMicPress() {
    if (isListening) return;
    setMicState('listening');
    startListening(
      (transcript) => {
        setMicState('idle');
        if (normalize(transcript) === normalize(currentCard.front)) {
          setFeedbackState('heard');
          setFlipped(true);
        } else {
          setFeedbackState('notRecognized');
          setMicState('error');
          setTimeout(() => setMicState('idle'), 800);
        }
      },
      () => {
        setFeedbackState('notRecognized');
        setMicState('error');
        setTimeout(() => setMicState('idle'), 800);
      }
    );
  }

  function handleBackMicPress() {
    if (isListening || selectedChoice !== null) return;
    setMicState('listening');
    startListening(
      (transcript) => {
        setMicState('idle');
        const matchedIndex = choices.findIndex(
          (c) => normalize(c.text) === normalize(transcript)
        );
        if (matchedIndex !== -1) {
          setFeedbackState('heard');
          handleChoiceClick(matchedIndex);
        } else {
          setFeedbackState('notRecognized');
          setMicState('error');
          setTimeout(() => setMicState('idle'), 800);
        }
      },
      () => {
        setFeedbackState('notRecognized');
        setMicState('error');
        setTimeout(() => setMicState('idle'), 800);
      }
    );
  }

  function handleAnswer(isCorrect: boolean) {
    updateCard(deckId, originalIndex, isCorrect);
    setFlipped(false);
    setSelectedChoice(null);
    setFeedbackState(null);
    if (index + 1 < dueCards.length) {
      setIndex((i) => i + 1);
    } else {
      const langDecks = deckMetadata.filter(d => d.lang === lang);
      const allDecksEmpty = langDecks.every(({ id }) => {
        const deckCards = DECK_MAP[lang]?.[id] ?? [];
        return deckCards
          .map((card, i) => ({ card, i }))
          .filter(({ card }) => activeLevels.includes(card.level))
          .every(({ i }) => !isCardDueForDeck(id, i));
      });
      if (allDecksEmpty) {
        setAllDone(true);
      } else {
        setDone(true);
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
              {!flipped && (
                <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                  {t('tapToReveal')}
                </p>
              )}
            </div>
            <div className="card-face card-back">
              {isSupported && flipped && (
                <MicButton state={micState} onPress={handleBackMicPress} />
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
          </div>
        </div>

        <FeedbackMessage state={feedbackState} />

        {flipped && (
          <div className="controls">
            <button className="btn secondary" onClick={() => setFlipped(false)}>
              {t('flipButton')}
            </button>
            <button className="btn primary" onClick={() => handleAnswer(true)}>
              {t('nextButton')}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
