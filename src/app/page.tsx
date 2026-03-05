import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">PuroLingua</h1>
      <p className="text-lg text-gray-600">Choose your language / Scegli la lingua</p>
      <div className="flex gap-6">
        <Link
          href="/it"
          className="rounded-xl border-2 border-gray-200 px-8 py-4 text-xl font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          Italiano
        </Link>
        <Link
          href="/es"
          className="rounded-xl border-2 border-gray-200 px-8 py-4 text-xl font-medium hover:border-red-500 hover:text-red-600 transition-colors"
        >
          Espanol
        </Link>
      </div>
    </main>
  );
}
