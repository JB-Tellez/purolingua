import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SiteHeader from '@/components/SiteHeader';
import { reloadPage } from '@/lib/reloadPage';

// jsdom does not allow stubbing window.location.reload, so the reload goes
// through a tiny module that tests can replace.
vi.mock('@/lib/reloadPage', () => ({ reloadPage: vi.fn() }));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

let pathname = '/it';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

const progress = JSON.stringify({ daily_0: { box: 2, nextReview: '2099-01-01' } });

beforeEach(() => {
  pathname = '/it';
  vi.mocked(reloadPage).mockClear();
});

describe('SiteHeader reset', () => {
  // Reset deletes all progress for the language, so it asks first (as v1.1 did).
  beforeEach(() => { vi.spyOn(window, 'confirm').mockReturnValue(true); });

  it('is a button (an action, not a link)', () => {
    render(<SiteHeader lang="it" />);
    const reset = screen.getByRole('button', { name: 'reset' });
    expect(reset).toHaveAttribute('type', 'button');
    expect(screen.queryByRole('link', { name: 'reset' })).toBeNull();
  });

  it('asks for confirmation with the resetConfirm message', () => {
    render(<SiteHeader lang="it" />);
    fireEvent.click(screen.getByText('reset'));
    expect(window.confirm).toHaveBeenCalledWith('resetConfirm');
  });

  it('keeps the progress and does not reload when the user cancels', () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    localStorage.setItem('it-progress', progress);
    render(<SiteHeader lang="it" />);
    fireEvent.click(screen.getByText('reset'));
    expect(localStorage.getItem('it-progress')).toBe(progress);
    expect(reloadPage).not.toHaveBeenCalled();
  });

  it('removes the current language progress key', () => {
    localStorage.setItem('it-progress', progress);
    render(<SiteHeader lang="it" />);
    fireEvent.click(screen.getByText('reset'));
    expect(localStorage.getItem('it-progress')).toBeNull();
  });

  it('keeps the level filter', () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['A2']));
    render(<SiteHeader lang="it" />);
    fireEvent.click(screen.getByText('reset'));
    expect(localStorage.getItem('it-level-filter')).toBe('["A2"]');
  });

  it("does not touch the other language's progress", () => {
    localStorage.setItem('es-progress', progress);
    render(<SiteHeader lang="it" />);
    fireEvent.click(screen.getByText('reset'));
    expect(localStorage.getItem('es-progress')).toBe(progress);
  });

  it('reloads the page so mounted hooks and sessions drop their in-memory progress', () => {
    render(<SiteHeader lang="it" />);
    fireEvent.click(screen.getByText('reset'));
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  it('clears storage before reloading', () => {
    localStorage.setItem('it-progress', progress);
    vi.mocked(reloadPage).mockImplementationOnce(() => {
      expect(localStorage.getItem('it-progress')).toBeNull();
    });
    render(<SiteHeader lang="it" />);
    fireEvent.click(screen.getByText('reset'));
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });
});

describe('SiteHeader back link', () => {
  it('is hidden on the language home page', () => {
    pathname = '/it';
    render(<SiteHeader lang="it" />);
    expect(screen.queryByText('back')).toBeNull();
  });

  it('points one level up on a nested page', () => {
    pathname = '/it/rephrase/daily';
    render(<SiteHeader lang="it" />);
    expect(screen.getByText('back').closest('a')).toHaveAttribute('href', '/it/rephrase');
  });
});

describe('SiteHeader language dropdown', () => {
  const openDropdown = () => fireEvent.click(screen.getByLabelText('changeLanguage'));

  it.each(['it', 'es'] as const)('on /%s lists each language once, linking to its own home', (lang) => {
    pathname = `/${lang}`;
    render(<SiteHeader lang={lang} />);
    openDropdown();
    expect(screen.getByText('Italiano').closest('a')).toHaveAttribute('href', '/it');
    expect(screen.getByText('Español').closest('a')).toHaveAttribute('href', '/es');
    expect(screen.getAllByText(/Italiano|Español/)).toHaveLength(2);
  });

  it.each([
    ['it', 'Italiano', 'Español'],
    ['es', 'Español', 'Italiano'],
  ] as const)('on /%s marks only %s as active', (lang, current, other) => {
    pathname = `/${lang}`;
    render(<SiteHeader lang={lang} />);
    openDropdown();
    expect(screen.getByText(current).closest('a')).toHaveClass('active');
    expect(screen.getByText(other).closest('a')).not.toHaveClass('active');
  });
});

describe('SiteHeader language dropdown closing', () => {
  const button = () => screen.getByLabelText('changeLanguage');

  it('reports whether it is open (aria-expanded)', () => {
    render(<SiteHeader lang="it" />);
    expect(button()).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button());
    expect(button()).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on a click outside it, as v1.1 did', () => {
    render(<SiteHeader lang="it" />);
    fireEvent.click(button());
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Español')).toBeNull();
  });

  it('closes on Escape', () => {
    render(<SiteHeader lang="it" />);
    fireEvent.click(button());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Español')).toBeNull();
  });

  it('stays open when clicking inside it', () => {
    render(<SiteHeader lang="it" />);
    fireEvent.click(button());
    fireEvent.mouseDown(screen.getByText('Español'));
    expect(screen.getByText('Español')).toBeInTheDocument();
  });
});
