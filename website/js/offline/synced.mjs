import { getDb } from './db.mjs';

export async function listSynced(limit = 20) {
  const db = await getDb();
  const rows = await db.inspections.where('status').equals('synced').toArray();
  rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return rows.slice(0, limit);
}

async function tryDownloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'Inspection_Report.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export async function downloadSyncedPdf(inspectionId) {
  const db = await getDb();
  const row = await db.inspections.get(inspectionId);
  if (!row) throw new Error('Not found');

  const filename = row.pdfFilename || `Inspection_Report_${inspectionId}.pdf`;

  // Prefer locally stored PDF blob (when Lambda returned inline base64).
  if (row.pdfBlobId) {
    const img = await db.images.get([inspectionId, row.pdfBlobId]);
    if (img && img.blob) {
      await tryDownloadBlob(img.blob, filename);
      return { source: 'blob' };
    }
  }

  // Fallback to reportUrl.
  const reportUrl = row.reportUrl ? String(row.reportUrl) : '';
  if (!reportUrl) throw new Error('No reportUrl available');

  try {
    // Try to force-download by fetching -> blob URL (works if CORS allows).
    const res = await fetch(reportUrl);
    if (!res.ok) throw new Error('Failed to fetch PDF');
    const pdfBlob = await res.blob();
    await tryDownloadBlob(pdfBlob, filename);
    return { source: 'reportUrl_fetch' };
  } catch (_) {
    // Last resort: open in new tab.
    window.open(reportUrl, '_blank', 'noopener');
    return { source: 'reportUrl_open' };
  }
}
