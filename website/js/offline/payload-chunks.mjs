import { getDb } from './db.mjs';

const DEFAULT_CHUNK_BYTES = 512 * 1024; // 512KB

export async function storePayloadChunks(inspectionId, jsonText, chunkBytes = DEFAULT_CHUNK_BYTES) {
  const db = await getDb();
  if (typeof jsonText !== 'string') throw new Error('jsonText must be a string');

  // Simple UTF-16 chunking is OK for JSON (ASCII-heavy). If needed, switch to UTF-8 chunks.
  const chunks = [];
  for (let i = 0; i < jsonText.length; i += chunkBytes) {
    chunks.push(jsonText.slice(i, i + chunkBytes));
  }

  await db.transaction('rw', db.payloadChunks, async () => {
    await db.payloadChunks.where('inspectionId').equals(inspectionId).delete();
    for (let idx = 0; idx < chunks.length; idx++) {
      await db.payloadChunks.put({ inspectionId, chunkIndex: idx, text: chunks[idx] });
    }
  });

  return { totalChunks: chunks.length, chunkBytes };
}

export async function loadPayloadChunks(inspectionId) {
  const db = await getDb();
  const rows = await db.payloadChunks.where('inspectionId').equals(inspectionId).sortBy('chunkIndex');
  if (!rows.length) return '';
  return rows.map((r) => r.text).join('');
}
