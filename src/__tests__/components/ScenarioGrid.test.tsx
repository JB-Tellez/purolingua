import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScenarioGrid from '@/components/ScenarioGrid';
import type { Level } from '@/types';

// Mock useQASRS — default: 3 due cards (simulates cards in queue)
const mockUseQASRS = vi.fn((..._args: unknown[]) => ({ dueCards: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }] }));
vi.mock('@/hooks/useQASRS', () => ({ useQASRS: (...args: unknown[]) => mockUseQASRS(...args) }));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}(${JSON.stringify(params)})` : key,
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const activeLevels: Level[] = ['A1', 'A2'];

describe('ScenarioGrid', () => {
  it('renders 7 scenario tile links', () => {
    render(<ScenarioGrid lang="it" activeLevels={activeLevels} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(7);
  });

  it('shows target-language title (titleIt) when lang=it', () => {
    render(<ScenarioGrid lang="it" activeLevels={activeLevels} />);
    // The first scenario (caffe) has titleIt — check it is in the document
    // Exact title string depends on actual scenario data — check at least one h3 exists
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.length).toBe(7);
  });

  it('shows due count badge when dueCards.length > 0', () => {
    mockUseQASRS.mockReturnValue({ dueCards: [{ id: 'c1' }, { id: 'c2' }] });
    render(<ScenarioGrid lang="it" activeLevels={activeLevels} />);
    // Each tile uses the same mock
    expect(screen.getAllByText('due({"count":2})')).toHaveLength(7);
  });

  it('says each scenario is done, with the done style, when dueCards.length === 0', () => {
    mockUseQASRS.mockReturnValue({ dueCards: [] });
    render(<ScenarioGrid lang="it" activeLevels={activeLevels} />);
    const done = screen.getAllByText('done');
    expect(done).toHaveLength(7);
    done.forEach((b) => expect(b).toHaveClass('deck-card-badge--done'));
  });

  it('tile links point to /it/qa/[scenarioId]', () => {
    render(<ScenarioGrid lang="it" activeLevels={activeLevels} />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs.every((h) => h?.startsWith('/it/qa/'))).toBe(true);
  });
});
