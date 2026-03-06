'use client';
// StudySession — client component for the quiz flow.
// Shows one card at a time: front → reveal back → correct/incorrect → next.
import { useState } from 'react';
import Link from 'next/link';
import type { Card, DeckId, Lang } from '@/types';
import { useSRS } from '@/hooks/useSRS';
import { useLevelFilter } from '@/hooks/useLevelFilter';

interface Props {
  lang: Lang;
  deckId: DeckId;
  cards: Card[];
}

export default function StudySession({ lang, deckId, cards }: Props) {
  const { isCardDueForDeck, updateCard, hasProgress } = useSRS(lang);
  const { activeLevels } = useLevelFilter(lang, hasProgress);

  // Build list of due cards (index + card pair) filtered by level
  const dueCards: { originalIndex: number; card: Card }[] = cards
    .map((card, i) => ({ originalIndex: i, card }))
    .filter(({ card, originalIndex }) =>
      activeLevels.includes(card.level) && isCardDueForDeck(deckId, originalIndex)
    );

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const backLink = `/${lang}`;

  if (done || dueCards.length === 0) {
    return (
      <main>
        <div
          id="flashcard-view"
          style={{ paddingTop: '2rem' }}
        >
          <Link href={backLink} className="nav-back-btn">&larr; Back to decks</Link>
          <div className="card-container" style={{ height: 'auto', perspective: 'none' }}>
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                All done for today! Come back tomorrow.
              </p>
              <Link href={backLink}>
                <button className="btn primary" style={{ maxWidth: '200px', flex: 'none' }}>
                  Back to decks
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { originalIndex, card: currentCard } = dueCards[index];

  function handleAnswer(isCorrect: boolean) {
    updateCard(deckId, originalIndex, isCorrect);
    setFlipped(false);
    if (index + 1 < dueCards.length) {
      setIndex(i => i + 1);
    } else {
      setDone(true);
    }
  }

  const progressPercent = Math.round((index / dueCards.length) * 100);

  return (
    <main>
      <div id="flashcard-view">
        <Link href={backLink} className="nav-back-btn">&larr; Back to decks</Link>

        {/* Progress bar */}
        <div className="progress-bar" style={{ width: '100%' }}>
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
          Card {index + 1} of {dueCards.length}
        </p>

        {/* Card flip container */}
        <div
          className="card-container"
          onClick={() => { if (!flipped) setFlipped(true); }}
        >
          <div className={`card${flipped ? ' flipped' : ''}`}>
            {/* Front face */}
            <div className="card-face card-front">
              <span id="card-front-text">{currentCard.front}</span>
              {!flipped && (
                <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                  Tap to reveal
                </p>
              )}
            </div>

            {/* Back face */}
            <div className="card-face card-back">
              <p style={{
                fontFamily: "'Crimson Text', 'Georgia', serif",
                fontSize: '1.75rem',
                fontWeight: 600,
                color: '#2E5B2E',
                textAlign: 'center',
                lineHeight: 1.3,
              }}>
                {currentCard.back}
              </p>
            </div>
          </div>
        </div>

        {/* Controls — shown only after flip */}
        {flipped && (
          <div className="controls">
            <button
              className="btn secondary"
              onClick={() => handleAnswer(false)}
            >
              Incorrect
            </button>
            <button
              className="btn primary"
              onClick={() => handleAnswer(true)}
            >
              Correct
            </button>
          </div>
        )}

        {!flipped && (
          <div className="controls">
            <button
              className="btn primary"
              onClick={() => setFlipped(true)}
            >
              Reveal Answer
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
