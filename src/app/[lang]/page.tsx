import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function LangPage({ params }: Props) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Decks &mdash; {lang}</h1>
      <p className="text-gray-500 mt-2">Deck grid coming in Phase 12.</p>
    </main>
  );
}
