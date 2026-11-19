// The list pages are prerendered with empty storage (static export). A returning
// visitor's saved progress and level filter must not make hydration fail.
import { describe, it, expect, vi } from 'vitest';
import { act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { NextIntlClientProvider } from 'next-intl';
import RephraseBrowserPage from '@/app/[lang]/rephrase/page';
import QABrowserPage from '@/app/[lang]/qa/page';
import itMessages from '../../../messages/it.json';

vi.mock('next/navigation', () => ({ useParams: () => ({ lang: 'it' }), usePathname: () => '/it' }));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe.each([
  ['Rephrase', RephraseBrowserPage],
  ['Q&A', QABrowserPage],
])('%s list page', (_name, Page) => {
  it('hydrates without a mismatch for a returning visitor', async () => {
    const tree = (
      <NextIntlClientProvider locale="it" messages={itMessages}><Page /></NextIntlClientProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    document.body.appendChild(container);

    localStorage.setItem('it-progress', JSON.stringify({
      daily_0: { box: 2, nextReview: '2099-01-01' },
      qa_coffee_coffee_01: { box: 2, nextReview: '2099-01-01' },
    }));
    localStorage.setItem('it-level-filter', JSON.stringify(['A1', 'A2']));
    localStorage.setItem('it-qa-level-filter', JSON.stringify(['A1', 'A2']));

    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    await act(async () => { root = hydrateRoot(container, tree, { onRecoverableError }); });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelectorAll('.filter-chip[aria-pressed="true"]')).toHaveLength(2);
    act(() => root?.unmount());
    container.remove();
  });
});
