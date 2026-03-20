import { useDogStore } from '@/hooks/useDogStore';
import { useEffect } from 'react';

/** How often the UI recomputes local decay between server syncs. */
const LIVE_TICK_MS = 1000;

/**
 * Smooth food / water / health / maladie between throttled GET /dogs syncs.
 * Only run while mounted (e.g. home tab).
 */
export function useDogLiveStats(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    useDogStore.getState().applyLiveTick();
    const id = setInterval(() => {
      useDogStore.getState().applyLiveTick();
    }, LIVE_TICK_MS);
    return () => clearInterval(id);
  }, [enabled]);
}
