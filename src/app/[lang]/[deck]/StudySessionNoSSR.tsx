'use client';
import dynamic from 'next/dynamic';
import type { Card, DeckId, Lang } from '@/types';

const StudySession = dynamic(() => import('./StudySession'), { ssr: false });

interface Props {
  lang: Lang;
  deckId: DeckId;
  cards: Card[];
}

export default function StudySessionNoSSR(props: Props) {
  return <StudySession {...props} />;
}
