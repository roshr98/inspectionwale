/* eslint-disable no-undef */
// Classic service worker (broadest mobile compatibility). Provides:
// - App-shell caching for offline use
// - Background sync for queued inspections (where supported)

// Dexie UMD build (self-hosted) for SW-side IndexedDB access.
try {
  importScripts('/js/vendor/dexie.min.js');
} catch (e) {
  // If Dexie fails to load, we still keep caching working.
}

const CACHE_NAME = 'iw-shell-v2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/inspector-login.html',
  '/inspector-form.html',
  '/manifest.webmanifest',
  '/Images/logo.png',
  '/js/vendor/dexie.mjs',
  '/js/vendor/dexie.min.js',
  '/js/offline/init-inspector-form.mjs',
  '/js/offline/db.mjs',
  '/js/offline/utils.mjs',
  '/js/offline/form-serializer.mjs',
  '/js/offline/drafts.mjs',
  '/js/offline/payload-chunks.mjs',
  '/js/offline/queue.mjs',
  '/js/offline/ui.mjs',
  '/js/offline/sw-register.mjs',
  '/js/offline/sync-loop.mjs',
  '/js/offline/init-login.mjs'
];

const IMAGE_REF_PREFIX = '__iw_blob__:';

function nowMs() {
  return Date.now();
}

function jitter(ms, pct) {
  const delta = ms * pct;
  const j = (Math.random() * 2 - 1) * delta;
  return Math.max(0, Math.round(ms + j));
}

function computeBackoffMs(retryCount) {
  const base = 5000;
  const cap = 10 * 60_000;
  const ms = Math.min(cap, base * Math.pow(2, Math.min(10, retryCount || 0)));
  return jitter(ms, 0.25);
}

function isImageRef(value) {
  return typeof value === 'string' && value.startsWith(IMAGE_REF_PREFIX);
}

async function blobToDataUrl(blob) {
  const ab = await blob.arrayBuffer();
  const bytes = new Uint8Array(ab);
  let binary = '';
  // Chunk the string build to avoid call stack/memory spikes.
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
  }
  return `data:${blob.type || 'application/octet-stream'};base64,${btoa(binary)}`;
}

let _db;
function getDb() {
  if (_db) return _db;
  if (typeof Dexie === 'undefined') return null;
  const db = new Dexie('inspectionwale_offline_v1');
  db.version(1).stores({
    inspections: '&id, status, updatedAt, createdAt, nextAttemptAt',
    images: '&[inspectionId+key], inspectionId, updatedAt',
    payloadChunks: '&[inspectionId+chunkIndex], inspectionId, chunkIndex',
    progress: '&inspectionId, updatedAt',
    meta: '&key'
  });
  _db = db;
  return _db;
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage(message);
  }
}

async function syncOneInspection(db, inspection) {
  const endpoint = inspection.pdfEndpoint || '';
  const token = inspection.inspectorToken || '';
  if (!endpoint) throw new Error('Missing PDF endpoint');
  if (!token) {
    await db.inspections.update(inspection.id, {
      status: 'needs_auth',
      updatedAt: nowMs(),
      lastError: 'Login required to sync.'
    });
    return;
  }

  // Re-hydrate payload (replace image refs with data URLs)
  const payload = inspection.payload;
  if (payload && payload.images && typeof payload.images === 'object') {
    for (const key of Object.keys(payload.images)) {
      const value = payload.images[key];
      if (!isImageRef(value)) continue;
      const imgKey = String(value).replace(/^__iw_blob__:/, '');
      const row = await db.images.get([inspection.id, imgKey]);
      if (row && row.blob) {
        payload.images[key] = await blobToDataUrl(row.blob);
      }
    }
  }

  await notifyClients({ type: 'IW_SYNC_PROGRESS', inspectionId: inspection.id, phase: 'uploading' });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (_) {
    json = { success: false, message: `Non-JSON response (${res.status})` };
  }

  if (res.status === 401 || res.status === 403) {
    await db.inspections.update(inspection.id, {
      status: 'needs_auth',
      updatedAt: nowMs(),
      lastError: 'Session expired. Please login again.'
    });
    return;
  }

  if (!res.ok || !json || !json.success || (!json.pdfData && !json.reportUrl)) {
    throw new Error((json && json.message) || `HTTP ${res.status}`);
  }

  const fileName = json.filename || `Inspection_Report_${inspection.id}.pdf`;
  let pdfBlobId = inspection.pdfBlobId || '';
  if (json.pdfData) {
    const byteCharacters = atob(String(json.pdfData));
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
    pdfBlobId = `pdf:${inspection.id}`;
    await db.images.put({ inspectionId: inspection.id, key: pdfBlobId, blob, mime: 'application/pdf', size: blob.size, updatedAt: nowMs() });
  }

  await db.inspections.update(inspection.id, {
    status: 'synced',
    updatedAt: nowMs(),
    retryCount: 0,
    nextAttemptAt: null,
    lastError: '',
    pdfFilename: fileName,
    reportUrl: String(json.reportUrl || ''),
    pdfBlobId
  });

  await notifyClients({ type: 'IW_SYNC_DONE', inspectionId: inspection.id, reportUrl: String(json.reportUrl || '') });
}

async function syncQueueInBackground() {
  const db = getDb();
  if (!db) {
    await notifyClients({ type: 'IW_SYNC_REQUEST' });
    return;
  }

  const now = nowMs();
  const list = await db.inspections.where('status').anyOf(['queued', 'failed']).toArray();
  list.sort((a, b) => (a.nextAttemptAt || 0) - (b.nextAttemptAt || 0));

  // Do one per sync event to keep SW short-lived.
  const candidate = list.find((r) => !r.nextAttemptAt || r.nextAttemptAt <= now);
  if (!candidate) return;

  const locked = await db.transaction('rw', db.inspections, async () => {
    const cur = await db.inspections.get(candidate.id);
    if (!cur) return false;
    if (!['queued', 'failed'].includes(cur.status)) return false;
    if (cur.nextAttemptAt && cur.nextAttemptAt > now) return false;
    await db.inspections.update(candidate.id, { status: 'syncing', updatedAt: nowMs() });
    return true;
  });
  if (!locked) return;

  const next = await db.inspections.get(candidate.id);
  if (!next) return;

  try {
    await syncOneInspection(db, next);
  } catch (e) {
    const retryCount = (next.retryCount || 0) + 1;
    await db.inspections.update(next.id, {
      status: 'failed',
      updatedAt: nowMs(),
      retryCount,
      nextAttemptAt: nowMs() + computeBackoffMs(retryCount),
      lastError: e && e.message ? String(e.message) : 'Sync failed'
    });
    await notifyClients({ type: 'IW_SYNC_ERROR', inspectionId: next.id });
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Never interfere with non-GET requests.
  if (req.method !== 'GET') return;

  // Never cache cross-origin API calls.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation: network-first, fallback to cached inspector form.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone());
          return res;
        } catch (_) {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(req)) || (await cache.match('/inspector-form.html'));
        }
      })()
    );
    return;
  }

  // Static assets: cache-first.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      cache.put(req, res.clone());
      return res;
    })()
  );
});

// Background Sync event.
self.addEventListener('sync', (event) => {
  if (event.tag !== 'iw-sync') return;
  event.waitUntil(syncQueueInBackground());
});
