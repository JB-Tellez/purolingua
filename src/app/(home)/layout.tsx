import type { Metadata } from 'next';
import RootDocument from '../RootDocument';

export const metadata: Metadata = {
  title: 'PuroLingua',
  description: 'Language learning flashcards',
};

// Root layout for the language picker. Its heading is English; the Italian and
// Spanish parts of the page carry their own lang attributes.
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
