// src/lib/shuffle.ts
// Uniform shuffle for answer choices (generateChoices and the Q&A session).

/** Fisher-Yates uniform shuffle — returns a shuffled copy; the input is not changed. */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
