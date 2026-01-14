import { getDb } from './db.mjs';
import { nowMs, computeBackoffMs, getPdfEndpoint, blobToDataUrl } from './utils.mjs';
import { isImageRef, loadDraft, makeImageRef } from './drafts.mjs';
import { loadPayloadChunks, storePayloadChunks } from './payload-chunks.mjs';

async function hydratePayloadForUpload(db, inspection) {
  // Prefer chunked payload if present (can be used for future schema upgrades).
  let payload = inspection.payload;

  // If payload was chunked, re-load it.
  const chunked = await db.payloadChunks.where('inspectionId').equals(inspection.id).count();
  if (chunked) {
    const jsonText = await loadPayloadChunks(inspection.id);
    payload = JSON.parse(jsonText);
  }

  // Replace image refs with data URLs.
  if (payload.images && typeof payload.images === 'object') {
    for (const [key, value] of Object.entries(payload.images)) {
      if (isImageRef(value)) {
        const imgKey = String(value).replace(/^__iw_blob__:/, '');
        const row = await db.images.get([inspection.id, imgKey]);
        if (row && row.blob) {
          payload.images[key] = await blobToDataUrl(row.blob);
        } else {
          // If missing blob, keep the ref to avoid corrupting.
          payload.images[key] = makeImageRef(imgKey);
        }
      }
    }
  }

  return payload;
}

function parseGenerateResult(result, payload) {
  if (!result || !result.success || (!result.pdfData && !result.reportUrl)) {
    throw new Error((result && result.message) || 'Failed to generate report');
  }
  const fileName = result.filename || `Inspection_Report_${(payload.inspection && payload.inspection.id) || Date.now()}.pdf`;
  return { fileName, pdfData: result.pdfData || null, reportUrl: result.reportUrl || null };
}

async function fetchPdfOnline({ payload, token, endpoint }) {
  const url = endpoint || getPdfEndpoint();
  if (!url) throw new Error('Missing PDF endpoint');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch (_) {
    result = { success: false, message: `Non-JSON response (${res.status})` };
  }

  if (res.status === 401 || res.status === 403) {
    const err = new Error('AUTH_REQUIRED');
    err.code = 'AUTH_REQUIRED';
    err.details = result;
    throw err;
  }

  if (!res.ok) {
    throw new Error((result && result.message) || `HTTP ${res.status}`);
  }

  return parseGenerateResult(result, payload);
}

export async function enqueueInspection(inspectionId) {
  const db = await getDb();
  const row = await db.inspections.get(inspectionId);
  if (!row) throw new Error('Draft not found');

  // Optionally chunk payload for storage safety.
  const jsonText = JSON.stringify(row.payload);
  if (jsonText.length > 700_000) {
    await storePayloadChunks(inspectionId, jsonText);
  }

  await db.inspections.update(inspectionId, {
    status: 'queued',
    updatedAt: nowMs(),
    lastError: ''
  });

  return true;
}

export async function syncNext({ force = false } = {}) {
  const db = await getDb();
  const now = nowMs();

  const candidates = await db.inspections
    .where('status')
    .anyOf(['queued', 'failed'])
    .toArray();

  // Select earliest eligible.
  candidates.sort((a, b) => {
    const aNext = a.nextAttemptAt || 0;
    const bNext = b.nextAttemptAt || 0;
    return aNext - bNext;
  });

  const inspection = candidates.find((r) => force || !r.nextAttemptAt || r.nextAttemptAt <= now);
  if (!inspection) return { didWork: false };

  // Acquire a simple lock to prevent duplicate submissions.
  const locked = await db.transaction('rw', db.inspections, async () => {
    const cur = await db.inspections.get(inspection.id);
    if (!cur) return false;
    if (!['queued', 'failed'].includes(cur.status)) return false;
    if (!force && cur.nextAttemptAt && cur.nextAttemptAt > now) return false;
    await db.inspections.update(inspection.id, { status: 'syncing', updatedAt: nowMs() });
    return true;
  });
  if (!locked) return { didWork: false };

  try {
    const payload = await hydratePayloadForUpload(db, inspection);

    // Keep token snapshot from when it was saved; prefer current session token if present.
    const token = sessionStorage.getItem('inspectorToken') || inspection.inspectorToken || '';
    if (!token) {
      await db.inspections.update(inspection.id, {
        status: 'needs_auth',
        updatedAt: nowMs(),
        lastError: 'Login required to sync.'
      });
      return { didWork: true, status: 'needs_auth' };
    }

    const result = await fetchPdfOnline({ payload, token, endpoint: inspection.pdfEndpoint });

    // Persist reportUrl (always) and optional inline pdfData.
    let pdfBlobId = inspection.pdfBlobId || '';
    if (result.pdfData) {
      const byteCharacters = atob(String(result.pdfData));
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
      pdfFilename: result.fileName,
      reportUrl: result.reportUrl || '',
      pdfBlobId
    });

    return { didWork: true, status: 'synced', inspectionId: inspection.id };
  } catch (e) {
    if (e && e.code === 'AUTH_REQUIRED') {
      await db.inspections.update(inspection.id, {
        status: 'needs_auth',
        updatedAt: nowMs(),
        lastError: 'Session expired. Please login again.'
      });
      return { didWork: true, status: 'needs_auth', inspectionId: inspection.id };
    }

    const retryCount = (inspection.retryCount || 0) + 1;
    const nextAttemptAt = nowMs() + computeBackoffMs(retryCount);

    await db.inspections.update(inspection.id, {
      status: 'failed',
      updatedAt: nowMs(),
      retryCount,
      nextAttemptAt,
      lastError: e && e.message ? String(e.message) : 'Sync failed'
    });

    return { didWork: true, status: 'failed', inspectionId: inspection.id };
  }
}
