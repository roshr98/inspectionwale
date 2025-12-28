type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type UpsertResponse = {
  success: boolean;
  inspectionId?: string;
  message?: string;
};

type UploadBase64Response = {
  success: boolean;
  url?: string;
  key?: string;
  message?: string;
};

function getGlobalBaseUrl(): string | undefined {
  try {
    const w = window as any;
    const v = w.__INSPECTION_API_BASE_URL__ || w.INSPECTION_API_BASE_URL;
    return typeof v === 'string' ? v : undefined;
  } catch {
    return undefined;
  }
}

export function getInspectionApiBaseUrl(): string {
  const global = getGlobalBaseUrl();
  const env = (import.meta as any).env?.VITE_INSPECTION_API_BASE_URL as string | undefined;
  const base = (global || env || '').trim();
  return base.replace(/\/$/, '');
}

export function isInspectionApiEnabled(): boolean {
  // Never call backend from Lambda PDF rendering.
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'report') return false;
  } catch {
    // ignore
  }
  return getInspectionApiBaseUrl().length > 0;
}

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const base = getInspectionApiBaseUrl();
  const url = `${base}${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { success: false, message: text || `HTTP ${res.status}` };
  }

  if (!res.ok) {
    const message = parsed?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return parsed as T;
}

export async function upsertInspection(inspectionId: string, data: JsonValue): Promise<UpsertResponse> {
  if (!inspectionId) return { success: false, message: 'Missing inspectionId' };
  return postJson<UpsertResponse>('/api/inspection/upsert', { inspectionId, data });
}

export async function uploadInspectionImageBase64(params: {
  inspectionId: string;
  fieldName: string;
  fileName?: string;
  contentType?: string;
  base64: string;
}): Promise<UploadBase64Response> {
  return postJson<UploadBase64Response>('/api/inspection/images/uploadBase64', params);
}
