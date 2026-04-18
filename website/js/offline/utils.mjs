export function nowMs() {
  return Date.now();
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function jitter(ms, pct = 0.2) {
  const delta = ms * pct;
  const j = (Math.random() * 2 - 1) * delta;
  return Math.max(0, Math.round(ms + j));
}

export function computeBackoffMs(retryCount) {
  const base = 5_000; // 5s
  const cap = 10 * 60_000; // 10m
  const ms = Math.min(cap, base * Math.pow(2, Math.min(10, retryCount)));
  return jitter(ms, 0.25);
}

export function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

export function dataUrlToBlob(dataUrl) {
  const m = String(dataUrl).match(/^data:([^;]+);base64,(.*)$/);
  if (!m) throw new Error('Invalid data URL');
  const mime = m[1];
  const b64 = m[2];
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { blob: new Blob([bytes], { type: mime }), mime };
}

export async function blobToDataUrl(blob) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

export function isDataImageUrl(value) {
  return /^data:image\/(png|jpe?g|webp);base64,/i.test(String(value || ''));
}

export function isProbablyHttpUrl(value) {
  if (!value) return false;
  try {
    const u = new URL(String(value));
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export function debounce(fn, waitMs) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), waitMs);
  };
}

export function getPdfEndpoint() {
  // inspector-form.html sets this.
  return globalThis.__IW_PDF_ENDPOINT || '';
}
