import { describe, it, expect } from 'vitest';
import { normalize, matchesTranscript } from '@/lib/matchTranscript';

describe('normalize', () => {
  it('lowercases, strips accents, turns punctuation into spaces, and collapses whitespace', () => {
    expect(normalize('  ¿Perché   NO, señor?! ')).toBe('perche no senor');
  });

  it('keeps apostrophe-joined words apart', () => {
    expect(normalize("Un'altra volta")).toBe('un altra volta');
  });

  it('turns non-decomposable non-ASCII letters into spaces (documented limitation)', () => {
    expect(normalize('straße')).toBe('stra e');
  });
});

describe('matchesTranscript', () => {
  it('matches when the transcript equals the target after normalization', () => {
    expect(matchesTranscript('ho perso il treno', 'Ho perso il treno.')).toBe(true);
  });

  it('ignores accents the recognizer drops', () => {
    expect(matchesTranscript('perche no', 'Perché no?')).toBe(true);
  });

  it('accepts at least 80% of the target words, in any order', () => {
    // 4 of 5 target words = 0.8
    expect(matchesTranscript('non sono arrivato stazione', 'Non sono arrivato alla stazione.')).toBe(true);
  });

  it('rejects fewer than 80% of the target words', () => {
    // 3 of 5 = 0.6
    expect(matchesTranscript('non sono arrivato', 'Non sono arrivato alla stazione.')).toBe(false);
  });

  it('is not penalised by extra words in the transcript', () => {
    expect(matchesTranscript('allora ehm ho perso il treno ieri', 'Ho perso il treno.')).toBe(true);
  });

  it('does not match an unrelated phrase', () => {
    expect(matchesTranscript('buongiorno a tutti', 'Ho perso il treno.')).toBe(false);
  });

  it('treats an empty target as matching only an empty transcript', () => {
    expect(matchesTranscript('', '?!')).toBe(true);
    expect(matchesTranscript('ciao', '?!')).toBe(false);
  });
});
