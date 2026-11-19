import { describe, it, expect } from 'vitest';
import { normalize, matchesTranscript, bestMatch } from '@/lib/matchTranscript';

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

  it('accepts one dropped word on a longer phrase, in any order', () => {
    // 4 shared words of 4 + 5: overlap 0.89
    expect(matchesTranscript('non sono arrivato stazione', 'Non sono arrivato alla stazione.')).toBe(true);
  });

  it('rejects two dropped words of five', () => {
    // 3 shared words of 3 + 5: overlap 0.75
    expect(matchesTranscript('non sono arrivato', 'Non sono arrivato alla stazione.')).toBe(false);
  });

  it('counts extra words against the match, so an added negation is rejected', () => {
    // 2 shared words of 3 + 2: overlap 0.8
    expect(matchesTranscript('non ho compreso', 'Ho compreso.')).toBe(false);
    expect(matchesTranscript('allora ehm ho perso il treno ieri', 'Ho perso il treno.')).toBe(false);
  });

  it('rejects one wrong word in five', () => {
    expect(matchesTranscript('in italia è il 113', 'In Italia è il 115.')).toBe(false);
  });

  it('tolerates one extra word on a longer phrase', () => {
    // 4 shared words of 5 + 4: overlap 0.89
    expect(matchesTranscript('ho perso il treno ieri', 'Ho perso il treno.')).toBe(true);
  });

  it('matches a repeated target word only as often as the transcript says it', () => {
    // 2 shared words (il, bus) of 2 + 4: overlap 0.67
    expect(matchesTranscript('il bus', 'Il, il, il bus.')).toBe(false);
  });

  it('does not match an unrelated phrase', () => {
    expect(matchesTranscript('buongiorno a tutti', 'Ho perso il treno.')).toBe(false);
  });

  it('treats an empty target as matching only an empty transcript', () => {
    expect(matchesTranscript('', '?!')).toBe(true);
    expect(matchesTranscript('ciao', '?!')).toBe(false);
  });
});

describe('bestMatch', () => {
  it('prefers an exact match over an earlier partial match', () => {
    expect(bestMatch('ho perso il treno ieri', ['Ho perso il treno.', 'Ho perso il treno ieri.'])).toBe(1);
  });

  it('returns -1 when no target matches', () => {
    expect(bestMatch('buongiorno a tutti', ['Ho perso il treno.', 'Piove.'])).toBe(-1);
  });

  // Each transcript word matches at most one target word, so a target that
  // repeats a word can't out-score the exact answer.
  it('prefers the exact match over a target that repeats one of its words', () => {
    expect(bestMatch('il treno', ['Il treno.', 'Il treno, il.'])).toBe(0);
  });

  it('returns -1 when two targets match equally well', () => {
    expect(bestMatch('ho perso il treno', ['Ho perso il treno oggi.', 'Ho perso il treno ieri.'])).toBe(-1);
  });
});
