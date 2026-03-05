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
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const backLink = `/${lang}`;

  if (done || dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <Link href={backLink} className="text-sm text-blue-500 self-start">Back to decks</Link>
        <p className="text-xl font-semibold">All done for today! Come back tomorrow.</p>
        <Link href={backLink} className="border rounded px-4 py-2">Back to decks</Link>
      </div>
    );
  }

  const { originalIndex, card: currentCard } = dueCards[index];

  function handleAnswer(isCorrect: boolean) {
    updateCard(deckId, originalIndex, isCorrect);
    setRevealed(false);
    if (index + 1 < dueCards.length) {
      setIndex(i => i + 1);
    } else {
      setDone(true);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <Link href={backLink} className="text-sm text-blue-500 self-start">Back to decks</Link>

      <p className="text-sm text-gray-400">
        Card {index + 1} of {dueCards.length}
      </p>

      <p className="text-2xl font-bold">{currentCard.front}</p>

      {!revealed ? (
        <button
          className="border rounded px-4 py-2"
          onClick={() => setRevealed(true)}
        >
          Reveal
        </button>
      ) : (
        <>
          <p className="text-xl text-gray-600">{currentCard.back}</p>
          <div className="flex gap-4">
            <button
              className="border rounded px-4 py-2"
              onClick={() => handleAnswer(true)}
            >
              Correct
            </button>
            <button
              className="border rounded px-4 py-2"
              onClick={() => handleAnswer(false)}
            >
              Incorrect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
