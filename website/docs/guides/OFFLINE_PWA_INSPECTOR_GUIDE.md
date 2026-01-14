# Offline-First Inspector Flow (Production)

This guide describes the additive offline-first implementation for `inspector-form.html`.

## Goals

- Inspectors can work fully offline for 3–4 hours.
- All form data + images persist locally (IndexedDB) even if the browser is closed.
- When network returns, submissions auto-sync to the existing PDF endpoint.
- No backend changes and no regressions to the current online flow.

## What Was Added

### Client Modules

- `js/offline/db.mjs`
  - Dexie database setup (IndexedDB).
- `js/offline/form-serializer.mjs`
  - Serializes the form to the same payload shape as the current submit handler.
- `js/offline/drafts.mjs`
  - Saves payload drafts and stores images as `Blob` records.
- `js/offline/payload-chunks.mjs`
  - Optional chunk storage for very large JSON payloads.
- `js/offline/queue.mjs`
  - Upload queue manager + retry/backoff + idempotent client-side behavior.
- `js/offline/sync-loop.mjs`
  - Foreground sync loop (fallback for browsers without Background Sync).
- `js/offline/ui.mjs`
  - Offline banner + pending counter + queue modal + toast notifications.
- `js/offline/synced.mjs`
  - Lists synced items and supports PDF downloads (blob or report URL).
- `js/offline/sw-register.mjs`
  - Service worker registration + `sync` registration (best-effort).
- `js/offline/init-inspector-form.mjs`
  - Wires autosave, offline UI, and sync engine into the inspector form.
- `js/offline/init-login.mjs`
  - Registers the service worker from the login page.

### PWA / Service Worker

- `manifest.webmanifest`
  - Makes the app installable.
- `sw.js`
  - App-shell caching.
  - Background sync for queued inspections (where supported).

### Dexie (Self-Hosted)

To ensure offline operation without CDN access, Dexie is vendored:

- `js/vendor/dexie.mjs`
- `js/vendor/dexie.min.js`

`package.json` now includes `dexie` as a dependency.

## IndexedDB Schema

Database name: `inspectionwale_offline_v1`

Tables:

- `inspections`
  - `id` (primary key): inspection ID
  - `payload`: form JSON (images replaced with `__iw_blob__:key` refs)
  - `status`: `draft | queued | syncing | synced | failed | needs_auth`
  - `retryCount`, `nextAttemptAt`, `lastError`
  - `inspectorToken` snapshot (used for background sync)
  - `pdfEndpoint` snapshot
  - `pdfFilename`, `reportUrl`, `pdfBlobId`

- `images`
  - composite key `[inspectionId+key]`
  - stores `Blob` for images and (optionally) inline PDF blob

- `payloadChunks`
  - composite key `[inspectionId+chunkIndex]`

- `progress`
  - reserved for granular progress reporting

- `meta`
  - key/value store (`lastDraftId`, etc.)

## Integration Points

### `inspector-form.html`

- Adds PWA manifest + theme color.
- Exposes `window.__IW_PDF_ENDPOINT` (read-only) for offline modules.
- When offline, the existing submit handler queues the payload instead of calling the API.
- Photo attachment now dispatches `input/change` so autosave captures it.

### Autosave

- Runs on every `input/change` event (debounced ~400ms).
- Saves payload + images into IndexedDB.

### Sync Engine

- Triggers on:
  - browser `online` event
  - periodic timer (fallback)
  - Service Worker Background Sync (`sync` event) where supported

### Idempotency

Backend is unchanged. Idempotency is achieved client-side by ensuring a queued item is only synced once via a simple lock (`status -> syncing`) in IndexedDB.

## Notes / Limitations

- Some mobile browsers (notably iOS Safari) do not reliably support Background Sync. The foreground sync loop covers those cases.
- If an auth token expires while offline, the queued item becomes `needs_auth` until the inspector logs in again.
- “Resume interrupted upload” is implemented as: the inspection remains queued/failed with full data persisted locally, and retries resume automatically. HTTP-level upload resuming is not possible without backend multipart support.

## How To Test (Quick)

1. Open `inspector-login.html` and login.
2. Open `inspector-form.html` and fill some fields.
3. Attach a few images.
4. Toggle DevTools → Network → Offline.
5. Click “Generate PDF” → should show “Saved offline…”.
6. Toggle back online → sync should run and the item should become synced.

