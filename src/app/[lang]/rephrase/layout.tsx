import { routing } from '@/i18n/routing';
import { DECK_IDS } from '@/data/decks';

export function generateStaticParams() {
  return routing.locales.flatMap((lang) =>
    DECK_IDS.map((deck) => ({ lang, deck }))
  );
}

type Props = { children: React.ReactNode };
export default function RephraseLayout({ children }: Props) {
  return <>{children}</>;
}
