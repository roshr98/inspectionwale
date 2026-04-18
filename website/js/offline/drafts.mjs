import { getDb } from './db.mjs';
import { nowMs, dataUrlToBlob, isDataImageUrl } from './utils.mjs';
import { getInspectionIdFromPayload } from './form-serializer.mjs';

const IMAGE_REF_PREFIX = '__iw_blob__:';

export function isImageRef(value) {
  return typeof value === 'string' && value.startsWith(IMAGE_REF_PREFIX);
}

export function makeImageRef(imageKey) {
  return `${IMAGE_REF_PREFIX}${imageKey}`;
}

export async function saveDraftFromPayload(payload, { status = 'draft' } = {}) {
  const db = await getDb();
  const inspectionId = getInspectionIdFromPayload(payload);

  const token = sessionStorage.getItem('inspectorToken') || '';
  const inspectorName = sessionStorage.getItem('inspectorName') || '';
  const pdfEndpoint = globalThis.__IW_PDF_ENDPOINT || '';

  // Copy payload (JSON-safe in this app) and move embedded dataURL images into separate blob store.
  const payloadCopy = JSON.parse(JSON.stringify(payload));
  const imageEntries = [];

  if (payloadCopy.images && typeof payloadCopy.images === 'object') {
    for (const [key, value] of Object.entries(payloadCopy.images)) {
      if (typeof value === 'string' && isDataImageUrl(value)) {
        try {
          const { blob, mime } = dataUrlToBlob(value);
          payloadCopy.images[key] = makeImageRef(key);
          imageEntries.push({ inspectionId, key, blob, mime, size: blob.size, updatedAt: nowMs() });
        } catch (_) {
          // If parsing fails, keep original string to avoid data loss.
        }
      }
    }
  }

  const existing = await db.inspections.get(inspectionId);
  const createdAt = existing?.createdAt || nowMs();
  const updatedAt = nowMs();

  await db.transaction('rw', db.inspections, db.images, db.meta, async () => {
    await db.inspections.put({
      id: inspectionId,
      createdAt,
      updatedAt,
      status,
      retryCount: existing?.retryCount || 0,
      nextAttemptAt: existing?.nextAttemptAt || null,
      lastError: existing?.lastError || '',
      payload: payloadCopy,
      inspectorName,
      // Store a token snapshot for background sync; may expire.
      inspectorToken: token,
      pdfEndpoint,
      pdfFilename: existing?.pdfFilename || '',
      reportUrl: existing?.reportUrl || '',
      pdfBlobId: existing?.pdfBlobId || ''
    });

    if (imageEntries.length) {
      // Upsert per image key
      for (const row of imageEntries) {
        await db.images.put(row);
      }
    }

    await db.meta.put({ key: 'lastDraftId', value: inspectionId, updatedAt });
  });

  return inspectionId;
}

export async function loadDraft(inspectionId) {
  const db = await getDb();
  return await db.inspections.get(inspectionId);
}

export async function loadLastDraftId() {
  const db = await getDb();
  const row = await db.meta.get('lastDraftId');
  return row?.value || '';
}

export async function listPendingCounts() {
  const db = await getDb();
  const queued = await db.inspections.where('status').equals('queued').count();
  const failed = await db.inspections.where('status').equals('failed').count();
  const needsAuth = await db.inspections.where('status').equals('needs_auth').count();
  const syncing = await db.inspections.where('status').equals('syncing').count();
  return { queued, failed, needsAuth, syncing, total: queued + failed + needsAuth + syncing };
}

export async function getPendingList(limit = 20) {
  const db = await getDb();
  const rows = await db.inspections
    .where('status')
    .anyOf(['queued', 'failed', 'needs_auth', 'syncing'])
    .reverse()
    .sortBy('updatedAt');
  return rows.slice(0, limit);
}
