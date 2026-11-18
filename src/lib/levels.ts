// src/lib/levels.ts
// The CEFR levels the app has content for.
import type { Level } from '@/types';

// Record<Level, …>: tsc fails here if a Level is added without updating this list.
const LEVEL_ORDER: Record<Level, number> = { A1: 0, A2: 1 };

export const LEVELS = (Object.keys(LEVEL_ORDER) as Level[]).sort((a, b) => LEVEL_ORDER[a] - LEVEL_ORDER[b]);

export function isLevel(value: unknown): value is Level {
  return typeof value === 'string' && Object.hasOwn(LEVEL_ORDER, value);
}
