import { registerServiceWorker, requestBackgroundSync } from './sw-register.mjs';
import { serializeFormToPayload } from './form-serializer.mjs';
import { saveDraftFromPayload } from './drafts.mjs';
import { enqueueInspection } from './queue.mjs';
import { debounce } from './utils.mjs';
import { installOfflineBar, setNetworkUi, refreshPendingCounts, hookSyncButtons, toast } from './ui.mjs';
import { runSyncOnce, startOnlineListener } from './sync-loop.mjs';

async function init() {
  const form = document.getElementById('inspectionForm');
  if (!form) return;

  installOfflineBar();
  setNetworkUi(navigator.onLine);
  await refreshPendingCounts();

  // Register SW (offline caching + optional background sync)
  const reg = await registerServiceWorker();
  if (reg) await requestBackgroundSync(reg);

  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = event && event.data ? event.data : null;
      if (!data || !data.type) return;
      if (data.type === 'IW_SYNC_REQUEST') {
        runSyncOnce({ force: true });
        return;
      }
      if (data.type === 'IW_SYNC_PROGRESS') {
        toast(`Syncing ${data.inspectionId || ''}…`, 'info');
        refreshPendingCounts();
        return;
      }
      if (data.type === 'IW_SYNC_DONE') {
        toast(`Synced ${data.inspectionId || ''}`, 'ok');
        refreshPendingCounts();
        return;
      }
      if (data.type === 'IW_SYNC_ERROR') {
        toast(`Sync failed for ${data.inspectionId || ''}`, 'bad');
        refreshPendingCounts();
      }
    });
  }

  // Keep UI in sync with network.
  window.addEventListener('online', () => setNetworkUi(true));
  window.addEventListener('offline', () => setNetworkUi(false));

  // Auto-save every change (debounced). Data integrity > performance.
  const autosave = debounce(async () => {
    try {
      const payload = serializeFormToPayload(form);
      await saveDraftFromPayload(payload, { status: 'draft' });
      await refreshPendingCounts();
    } catch (e) {
      console.warn('Autosave failed:', e);
    }
  }, 400);

  form.addEventListener('input', autosave, { capture: true });
  form.addEventListener('change', autosave, { capture: true });

  // Expose a tiny hook so the existing submit handler can queue offline.
  globalThis.__iwOffline = {
    async queueCurrentPayload(payload) {
      const inspectionId = await saveDraftFromPayload(payload, { status: 'queued' });
      await enqueueInspection(inspectionId);
      await refreshPendingCounts();

      if (reg) await requestBackgroundSync(reg);
      // Fallback: kick a foreground sync attempt too.
      runSyncOnce({ force: true });

      return inspectionId;
    },
    async saveCurrentPayload(payload) {
      const inspectionId = await saveDraftFromPayload(payload, { status: 'draft' });
      await refreshPendingCounts();
      return inspectionId;
    }
  };

  hookSyncButtons({
    onSyncNow: async () => {
      toast('Sync started…', 'info');
      if (reg) await requestBackgroundSync(reg);
      await runSyncOnce({ force: true });
    }
  });

  startOnlineListener();
  // Light periodic tick (covers browsers without Background Sync)
  setInterval(() => runSyncOnce({ force: false }), 25_000);
}

init();
