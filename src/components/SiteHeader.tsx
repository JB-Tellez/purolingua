'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Lang } from '@/types';

const LANG_META: Record<Lang, { flag: string; name: string }> = {
  it: { flag: '🇮🇹', name: 'Italiano' },
  es: { flag: '🇪🇸', name: 'Español' },
};

const OTHER_LANG: Record<Lang, Lang> = { it: 'es', es: 'it' };

interface SiteHeaderProps {
  lang: Lang;
}

export default function SiteHeader({ lang }: SiteHeaderProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Show back button only when on a deck/study page (path has 3+ segments: /lang/deck)
  const segments = pathname.split('/').filter(Boolean);
  const onDeckPage = segments.length >= 2;
  const backHref = '/' + segments.slice(0, -1).join('/');

  function handleReset() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${lang}-progress`);
      router.refresh();
    }
  }

  const other = OTHER_LANG[lang];
  const otherMeta = LANG_META[other];
  const currentMeta = LANG_META[lang];

  return (
    <header>
      <nav>
        <div className="logo">
          <span>{currentMeta.flag}</span>
          <span>{t('logo')}</span>
        </div>
        <ul className="nav-links">
          {onDeckPage && (
            <li>
              <Link href={backHref} className="nav-back-btn">
                {t('back')}
              </Link>
            </li>
          )}
          <li>
            <a
              href="#"
              className="nav-back-btn"
              onClick={(e) => { e.preventDefault(); handleReset(); }}
            >
              {t('reset')}
            </a>
          </li>
          <li>
            <div className="language-selector">
              <button
                className="language-btn"
                aria-label="Change language"
                onClick={() => setDropdownOpen((o) => !o)}
              >
                {currentMeta.flag}
              </button>
              {dropdownOpen && (
                <div className="language-dropdown" onClick={() => setDropdownOpen(false)}>
                  <Link
                    href={`/${lang}`}
                    className={`language-option${lang === 'it' ? ' active' : ''}`}
                  >
                    <span className="flag">{LANG_META.it.flag}</span>
                    <span>{LANG_META.it.name}</span>
                  </Link>
                  <Link
                    href={`/${other}`}
                    className={`language-option${lang === 'es' ? ' active' : ''}`}
                  >
                    <span className="flag">{otherMeta.flag}</span>
                    <span>{otherMeta.name}</span>
                  </Link>
                </div>
              )}
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
