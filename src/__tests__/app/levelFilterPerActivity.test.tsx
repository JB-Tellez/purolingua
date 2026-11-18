// The Rephrase and Q&A list pages each show their own saved level filter.
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import RephraseBrowserPage from '@/app/[lang]/rephrase/page';
import QABrowserPage from '@/app/[lang]/qa/page';
import itMessages from '../../../messages/it.json';

vi.mock('next/navigation', () => ({ useParams: () => ({ lang: 'it' }), usePathname: () => '/it' }));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

function pressedChips(Page: React.ComponentType) {
  const { unmount } = render(
    <NextIntlClientProvider locale="it" messages={itMessages}><Page /></NextIntlClientProvider>
  );
  const pressed = [...document.querySelectorAll('.filter-chip[aria-pressed="true"]')].map((b) => b.textContent);
  unmount();
  return pressed;
}

describe('level filter per activity', () => {
  it('the Rephrase page shows the Rephrase filter and the Q&A page the Q&A filter', () => {
    localStorage.setItem('it-level-filter', JSON.stringify(['A1']));
    localStorage.setItem('it-qa-level-filter', JSON.stringify(['A2']));
    expect(pressedChips(RephraseBrowserPage)).toEqual(['A1']);
    expect(pressedChips(QABrowserPage)).toEqual(['A2']);
  });
});
