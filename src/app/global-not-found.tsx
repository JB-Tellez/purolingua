import type { Metadata } from 'next';
import Link from 'next/link';
import RootDocument from './RootDocument';

export const metadata: Metadata = {
  title: 'PuroLingua',
};

// With two root layouts ((home) and [lang]) there is no app/layout.tsx to wrap
// a 404, so this renders the full document itself. Requires
// experimental.globalNotFound in next.config.ts (Next 16.1).
export default function GlobalNotFound() {
  return (
    <RootDocument lang="en">
      <main>
        <div className="section-header">
          <h1>404</h1>
          <p className="subtitle">This page could not be found.</p>
          <Link href="/" className="nav-back-btn">← PuroLingua</Link>
        </div>
      </main>
    </RootDocument>
  );
}
