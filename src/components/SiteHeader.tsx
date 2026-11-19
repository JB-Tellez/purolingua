'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Lang } from '@/types';
import { reloadPage } from '@/lib/reloadPage';
import { clearProgress } from '@/lib/progressStorage';

const LANG_META: Record<Lang, { flag: string; name: string }> = {
  it: { flag: '🇮🇹', name: 'Italiano' },
  es: { flag: '🇪🇸', name: 'Español' },
};

interface SiteHeaderProps {
  lang: Lang;
}

export default function SiteHeader({ lang }: SiteHeaderProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // An open dropdown closes on a click outside it or on Escape (v1.1 closed on outside clicks).
  useEffect(() => {
    if (!dropdownOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!selectorRef.current?.contains(e.target as Node)) setDropdownOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [dropdownOpen]);

  // Show a back link (one level up) on every page below the language home: 2+ segments, e.g. /it/rephrase → /it
  const segments = pathname.split('/').filter(Boolean);
  const showBackLink = segments.length >= 2;
  const backHref = '/' + segments.slice(0, -1).join('/');

  function handleReset() {
    // Deletes all progress for this language with no undo, so ask first (as v1.1 did).
    if (typeof window !== 'undefined' && window.confirm(t('resetConfirm'))) {
      clearProgress(lang);
      // Full reload, not router.refresh(): refresh keeps client state, so mounted
      // grids and study sessions would keep showing (and re-saving) old progress.
      reloadPage();
    }
  }

  const currentMeta = LANG_META[lang];

  return (
    <header>
      <nav>
        <div className="logo">
          <span>{currentMeta.flag}</span>
          <span>{t('logo')}</span>
        </div>
        <ul className="nav-links">
          {showBackLink && (
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
            <div className="language-selector" ref={selectorRef}>
              <button
                className="language-btn"
                aria-label={t('changeLanguage')}
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((o) => !o)}
              >
                {currentMeta.flag}
              </button>
              {dropdownOpen && (
                <div className="language-dropdown" onClick={() => setDropdownOpen(false)}>
                  {(Object.keys(LANG_META) as Lang[]).map((code) => (
                    <Link
                      key={code}
                      href={`/${code}`}
                      className={`language-option${code === lang ? ' active' : ''}`}
                    >
                      <span className="flag">{LANG_META[code].flag}</span>
                      <span>{LANG_META[code].name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
