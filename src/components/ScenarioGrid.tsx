'use client';
import Link from 'next/link';
import { scenarios } from '@/data/qa';
import { useQASRS } from '@/hooks/useQASRS';
import type { Lang, Level, Scenario } from '@/types';

const SCENARIO_THEMES = ['teal', 'blue', 'red', 'yellow', 'green', 'purple', 'orange'] as const;

interface ScenarioGridProps {
  lang: Lang;
  activeLevels: Level[];
}

interface ScenarioTileProps {
  scenario: Scenario;
  lang: Lang;
  activeLevels: Level[];
  index: number;
}

function ScenarioTile({ scenario, lang, activeLevels, index }: ScenarioTileProps) {
  const { dueCards } = useQASRS(lang, scenario.id, scenario.cards, activeLevels);
  const due = dueCards.length;
  const title = lang === 'it' ? scenario.titleIt : scenario.titleEs;
  const theme = SCENARIO_THEMES[index % SCENARIO_THEMES.length];

  return (
    <Link
      href={`/${lang}/qa/${scenario.id}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <div className={`deck-card theme-${theme}`} style={{ height: '100%' }}>
        <div className="deck-icon-circle">{scenario.icon}</div>
        <h3>{title}</h3>
        <span className={`deck-card-badge${due === 0 ? ' deck-card-badge--done' : ''}`}>
          {due === 0 ? '✓' : due}
        </span>
      </div>
    </Link>
  );
}

export default function ScenarioGrid({ lang, activeLevels }: ScenarioGridProps) {
  return (
    <div className="deck-grid">
      {scenarios.map((scenario, index) => (
        <ScenarioTile
          key={scenario.id}
          scenario={scenario}
          lang={lang}
          activeLevels={activeLevels}
          index={index}
        />
      ))}
    </div>
  );
}
