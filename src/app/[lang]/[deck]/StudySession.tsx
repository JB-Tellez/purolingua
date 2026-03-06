'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Card, DeckId, Lang } from '@/types';
import { useSRS } from '@/hooks/useSRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';
import { generateChoices } from '@/lib/generateChoices';
import AudioButton from '@/components/AudioButton';
import ChoiceButton from '@/components/ChoiceButton';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import MicButton from '@/components/MicButton';

interface Props {
  lang: Lang;
  deckId: DeckId;
  cards: Card[];
}

export default function StudySession({ lang, deckId, cards }: Props) {
  const { isCardDueForDeck, updateCard, hasProgress } = useSRS(lang);
  const { activeLevels } = useLevelFilter(lang, hasProgress);
  const t = useTranslations('study');

  const dueCards: { originalIndex: number; card: Card }[] = cards
    .map((card, i) => ({ originalIndex: i, card }))
    .filter(({ card, originalIndex }) =>
      activeLevels.includes(card.level) && isCardDueForDeck(deckId, originalIndex)
    );

  const { isSupported, isListening, startListening } = useVoiceRecognition(lang);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  // selectedChoice: null = not answered, index of selected choice once answered
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [micState, setMicState] = useState<'idle' | 'listening' | 'error'>('idle');

  const backLink = `/${lang}`;

  if (done || dueCards.length === 0) {
    return (
      <main>
        <div id="flashcard-view" style={{ paddingTop: '2rem' }}>
          <Link href={backLink} className="nav-back-btn">{t('backToDecks')}</Link>
          <div className="card-container" style={{ height: 'auto', perspective: 'none' }}>
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                {t('allDone')}
              </p>
              <Link href={backLink}>
                <button className="btn primary" style={{ maxWidth: '200px', flex: 'none' }}>
                  {t('backToDecks')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { originalIndex, card: currentCard } = dueCards[index];

  // Generate multiple-choice options: 1 correct + up to 3 foils, shuffled
  const choices = generateChoices(currentCard, cards);

  const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?;:'"¿¡]+$/g, '').trim();

  function handleFrontMicPress() {
    if (isListening) return;
    setMicState('listening');
    startListening(
      (transcript) => {
        setMicState('idle');
        if (normalize(transcript) === normalize(currentCard.front)) {
          setFlipped(true);
        } else {
          setMicState('error');
          setTimeout(() => setMicState('idle'), 800);
        }
      },
      () => {
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
          handleChoiceClick(matchedIndex);
        } else {
          setMicState('error');
          setTimeout(() => setMicState('idle'), 800);
        }
      },
      () => {
        setMicState('error');
        setTimeout(() => setMicState('idle'), 800);
      }
    );
  }

  function handleAnswer(isCorrect: boolean) {
    updateCard(deckId, originalIndex, isCorrect);
    setFlipped(false);
    setSelectedChoice(null);
    if (index + 1 < dueCards.length) {
      setIndex((i) => i + 1);
    } else {
      setDone(true);
    }
  }

  function handleChoiceClick(choiceIndex: number) {
    if (selectedChoice !== null) return; // already answered
    const isCorrect = choices[choiceIndex].isCorrect;
    setSelectedChoice(choiceIndex);
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
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {flipped && (
          <div className="controls">
            <button className="btn secondary" onClick={() => handleAnswer(false)}>
              {t('flipButton')}
            </button>
            <button className="btn primary" onClick={() => handleAnswer(true)}>
              {t('nextButton')}
            </button>
          </div>
        )}

        {!flipped && (
          <div className="controls">
            <button className="btn primary" onClick={() => setFlipped(true)}>
              {t('revealAnswer')}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
