import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/(home)/page';
import { routing } from '@/i18n/routing';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('HomePage language picker', () => {
  it('links to every routed locale, in routing order', () => {
    render(<HomePage />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(routing.locales.map((l) => `/${l}`));
  });
});
