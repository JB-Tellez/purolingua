import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityPicker from '@/components/ActivityPicker';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('ActivityPicker', () => {
  it('renders Rephrase card with href /it/rephrase', () => {
    render(<ActivityPicker lang="it" />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/it/rephrase');
  });

  it('renders Q&A card with href /it/qa', () => {
    render(<ActivityPicker lang="it" />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/it/qa');
  });

  it('renders Rephrase title from i18n', () => {
    render(<ActivityPicker lang="it" />);
    expect(screen.getByText('rephrase.title')).toBeTruthy();
  });

  it('renders Q&A title from i18n', () => {
    render(<ActivityPicker lang="it" />);
    expect(screen.getByText('qa.title')).toBeTruthy();
  });

  it('renders two description strings', () => {
    render(<ActivityPicker lang="it" />);
    expect(screen.getByText('rephrase.description')).toBeTruthy();
    expect(screen.getByText('qa.description')).toBeTruthy();
  });
});
