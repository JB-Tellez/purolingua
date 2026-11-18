import Link from 'next/link';
import { routing } from '@/i18n/routing';
import type { Lang } from '@/types';

// Record<Lang, …>: tsc fails here if a locale in routing.locales has no entry.
const LANGUAGES: Record<Lang, { flag: string; name: string; description: string; theme: string }> = {
  it: {
    flag: '🇮🇹',
    name: 'Italiano',
    description: 'Impara frasi utili per la vita quotidiana.',
    theme: 'green',
  },
  es: {
    flag: '🇪🇸',
    name: 'Español',
    description: 'Aprende frases útiles para la vida diaria.',
    theme: 'red',
  },
};

export default function HomePage() {
  return (
    <>
      <header>
        <nav>
          <div className="logo">
            <span>🌍</span>
            <span>PuroLingua</span>
          </div>
        </nav>
      </header>
      <main>
        <div className="section-header">
          <h1>Choose Your Language</h1>
          <p className="subtitle"><span lang="it">Scegli la lingua</span> · <span lang="es">Elige tu idioma</span></p>
        </div>
        <div className="activity-grid">
          {routing.locales.map((code) => {
            const { flag, name, description, theme } = LANGUAGES[code];
            return (
              <Link
                key={code}
                href={`/${code}`}
                style={{ textDecoration: 'none', display: 'block', height: '100%' }}
              >
                <div className={`deck-card theme-${theme}`} style={{ height: '100%' }} lang={code}>
                  <div className="deck-icon-circle">{flag}</div>
                  <h3>{name}</h3>
                  <p>{description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
