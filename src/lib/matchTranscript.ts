export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacriticals
    .replace(/[^\w\s]/g, ' ')        // all punctuation → space
    .replace(/\s+/g, ' ')
    .trim();
}

// Minimum word-overlap score for a match. One dropped or extra word passes on
// phrases of 5+ words; a wrong word in 5 ("113" for "115") or an added "non"
// on a short phrase does not.
const MATCH_THRESHOLD = 0.85;

// 1 for an exact match after normalization; otherwise the word overlap
// 2 × shared / (transcript words + target words), so missing and extra words both count.
function matchScore(transcript: string, target: string): number {
  const t = normalize(transcript);
  const g = normalize(target);
  if (t === g) return 1;

  const targetWords = g.split(' ').filter(Boolean);
  const transcriptWords = t.split(' ').filter(Boolean);
  if (targetWords.length === 0) return 0;
  const transcriptSet = new Set(transcriptWords);
  const shared = targetWords.filter((w) => transcriptSet.has(w)).length;
  return (2 * shared) / (transcriptWords.length + targetWords.length);
}

export function matchesTranscript(transcript: string, target: string): boolean {
  return matchScore(transcript, target) >= MATCH_THRESHOLD;
}

/**
 * Index of the target the transcript matches best, or -1 when none matches or
 * two match equally well (ambiguous). An exact match always wins.
 */
export function bestMatch(transcript: string, targets: string[]): number {
  const scores = targets.map((target) => matchScore(transcript, target));
  const top = Math.max(...scores);
  if (top < MATCH_THRESHOLD) return -1;
  return scores.filter((s) => s === top).length === 1 ? scores.indexOf(top) : -1;
}
