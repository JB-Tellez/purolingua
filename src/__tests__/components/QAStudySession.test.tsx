import { describe, it, vi } from 'vitest';
import React from 'react';

// ---------------------------------------------------------------------------
// Module mocks (Plan 02 will configure return values per test)
// ---------------------------------------------------------------------------

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return `${key}(${JSON.stringify(params)})`;
    return key;
  },
}));
vi.mock('@/hooks/useQASRS', () => ({ useQASRS: vi.fn() }));
vi.mock('@/hooks/useVoiceRecognition', () => ({ useVoiceRecognition: vi.fn() }));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// ---------------------------------------------------------------------------
// Test scaffold — all stubs are it.todo(); Plan 02 fills in test bodies
// ---------------------------------------------------------------------------

describe('QAStudySession', () => {
  it.todo('renders question text and audio button on card face');
  it.todo('renders exactly 4 choice buttons (1 correct + 3 foils)');
  it.todo('tapping correct choice shows correct feedback state');
  it.todo('tapping incorrect choice shows incorrect feedback state');
  it.todo('auto-advances to next card after 600ms delay');
  it.todo('mic button appears when isSupported; spoken match triggers correct feedback');
  it.todo('spoken non-match sets notRecognized feedback, no SRS update');
  it.todo('shows scenarioDone screen after last card when another scenario has due cards');
  it.todo('shows allScenariosDone screen after last card when all scenarios are empty');
  it.todo('dueCards.length === 0 at mount shows done screen immediately');
  it.todo('Study again button on scenarioDone screen resets session');
});
