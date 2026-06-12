import Link from 'next/link';

const LANGUAGES = [
  {
    code: 'it',
    flag: '🇮🇹',
    name: 'Italiano',
    description: 'Impara frasi utili per la vita quotidiana.',
    theme: 'green',
  },
  {
    code: 'es',
    flag: '🇪🇸',
    name: 'Español',
    description: 'Aprende frases útiles para la vida diaria.',
    theme: 'red',
  },
] as const;

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
          <p className="subtitle">Scegli la lingua · Elige tu idioma</p>
        </div>
        <div className="activity-grid">
          {LANGUAGES.map(({ code, flag, name, description, theme }) => (
            <Link
              key={code}
              href={`/${code}`}
              style={{ textDecoration: 'none', display: 'block', height: '100%' }}
            >
              <div className={`deck-card theme-${theme}`} style={{ height: '100%' }}>
                <div className="deck-icon-circle">{flag}</div>
                <h3>{name}</h3>
                <p>{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
