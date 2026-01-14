import Dexie from '../vendor/dexie.mjs';

export const DB_NAME = 'inspectionwale_offline_v1';

export function openDb() {
  const db = new Dexie(DB_NAME);

  // NOTE: Keep schema additive (version bumps) to avoid data loss.
  db.version(1).stores({
    // Stores the latest draft (form JSON) and submission status.
    // status: 'draft' | 'queued' | 'syncing' | 'synced' | 'failed' | 'needs_auth'
    inspections: '&id, status, updatedAt, createdAt, nextAttemptAt',

    // Stores image blobs keyed by inspectionId + imageKey.
    images: '&[inspectionId+key], inspectionId, updatedAt',

    // Stores large JSON payload as chunks (optional).
    payloadChunks: '&[inspectionId+chunkIndex], inspectionId, chunkIndex',

    // Stores sync progress for UI.
    progress: '&inspectionId, updatedAt',

    // Small key/value store (e.g., lastDraftId)
    meta: '&key'
  });

  return db;
}

export async function getDb() {
  // Dexie is lazy, but keep a single instance per window.
  if (!globalThis.__iwOfflineDb) {
    globalThis.__iwOfflineDb = openDb();
  }
  return globalThis.__iwOfflineDb;
}
