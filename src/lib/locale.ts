// src/lib/locale.ts
// BCP 47 locale per app language, for speech synthesis and recognition.
import type { Lang } from '@/types';

export const LANG_LOCALE: Record<Lang, string> = { it: 'it-IT', es: 'es-ES' };
