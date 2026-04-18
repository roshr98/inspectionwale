import { isDataImageUrl } from './utils.mjs';

function setDeep(target, path, value) {
  const parts = String(path).split('.');
  let cur = target;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const isLast = i === parts.length - 1;
    if (isLast) {
      cur[key] = value;
    } else {
      if (!cur[key] || typeof cur[key] !== 'object') cur[key] = {};
      cur = cur[key];
    }
  }
}

function safeString(v) {
  if (v === undefined || v === null) return '';
  return String(v);
}

export function serializeFormToPayload(formEl) {
  const payload = {};
  const fd = new FormData(formEl);
  for (const [name, value] of fd.entries()) {
    setDeep(payload, name, safeString(value).trim());
  }

  // Apply same derived logic as the online submit handler, but without changing it.
  const inspectorName = sessionStorage.getItem('inspectorName') || '';
  if (inspectorName) {
    payload.inspection = payload.inspection || {};
    payload.inspection.inspector_name = inspectorName;
  }

  payload.flags = payload.flags || {};
  if (!payload.flags.has_cng) {
    payload.flags.has_cng = payload.vehicle && payload.vehicle.cng && payload.vehicle.cng.present === 'Yes' ? 'Yes' : 'No';
  }
  if (!payload.flags.has_hypothecation) {
    payload.flags.has_hypothecation = payload.vehicle && payload.vehicle.hypothecation ? 'Yes' : 'No';
  }

  // Ensure payload.images exists if form has images.
  if (payload.images && typeof payload.images === 'object') {
    for (const [k, v] of Object.entries(payload.images)) {
      if (typeof v === 'string' && isDataImageUrl(v)) {
        // This is handled by offline storage layer; keep as-is here.
      }
    }
  }

  return payload;
}

export function getInspectionIdFromPayload(payload) {
  const id = payload && payload.inspection && payload.inspection.id ? String(payload.inspection.id).trim() : '';
  return id || `OFF-${Date.now()}`;
}
