'use client';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * Renders `children` only in the browser after hydration: nothing in the
 * prerendered HTML or during hydration. For UI built from localStorage, which
 * the static export cannot know, so hydration never sees a mismatch.
 */
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  return isClient ? children : null;
}
