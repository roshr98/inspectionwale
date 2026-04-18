import { syncNext } from './queue.mjs';
import { refreshPendingCounts, toast } from './ui.mjs';

let isRunning = false;

export async function runSyncOnce({ force = false } = {}) {
  if (!navigator.onLine) return;
  if (isRunning) return;
  isRunning = true;
  try {
    // Drain a few items per tick to avoid blocking UI.
    for (let i = 0; i < 3; i++) {
      const r = await syncNext({ force });
      if (!r.didWork) break;
    }
  } finally {
    isRunning = false;
    await refreshPendingCounts();
  }
}

export function startOnlineListener() {
  window.addEventListener('online', () => {
    toast('Back online — syncing…', 'ok');
    runSyncOnce({ force: true });
  });
}
