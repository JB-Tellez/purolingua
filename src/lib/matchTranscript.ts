export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacriticals
    .replace(/[^\w\s]/g, ' ')        // all punctuation → space
    .replace(/\s+/g, ' ')
    .trim();
}

// Exact match after normalization, with fallback word-overlap for minor transcription variance.
// Threshold: ≥80% of target words present in transcript (handles dropped articles, extra fillers).
export function matchesTranscript(transcript: string, target: string): boolean {
  const t = normalize(transcript);
  const g = normalize(target);
  if (t === g) return true;

  const targetWords = g.split(' ').filter(Boolean);
  if (targetWords.length === 0) return false;
  const transcriptSet = new Set(t.split(' ').filter(Boolean));
  const matched = targetWords.filter((w) => transcriptSet.has(w)).length;
  return matched / targetWords.length >= 0.8;
}
