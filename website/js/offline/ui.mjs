import { listPendingCounts, getPendingList } from './drafts.mjs';
import { listSynced, downloadSyncedPdf } from './synced.mjs';

function el(id) {
  return document.getElementById(id);
}

export function installOfflineBar() {
  if (el('iwOfflineBar')) return;

  // Minimal styles (additive, self-contained)
  if (!el('iwOfflineStyles')) {
    const style = document.createElement('style');
    style.id = 'iwOfflineStyles';
    style.textContent = `
      #iwOfflineBar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid #e2e8f0;background:#ffffff;position:sticky;top:0;z-index:30}
      #iwOfflineBar .iw-offline-left{display:flex;align-items:center;gap:8px}
      #iwOfflineBar .iw-offline-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      .iw-dot{width:10px;height:10px;border-radius:999px;background:#22c55e;display:inline-block}
      .iw-dot.offline{background:#ef4444}
      .iw-pill{background:#0f172a;color:#fff;border-radius:999px;padding:4px 10px;font-size:12px;line-height:18px}
      #iwQueueModal,#iwSyncedModal{position:fixed;inset:0;z-index:60}
      .iw-modal-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.45)}
      .iw-modal{position:relative;max-width:820px;margin:8vh auto 0;background:#fff;border-radius:12px;box-shadow:0 10px 35px rgba(0,0,0,.25);overflow:hidden}
      .iw-modal-head,.iw-modal-foot{padding:12px 14px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:10px}
      .iw-modal-foot{border-top:1px solid #e2e8f0;border-bottom:none}
      .iw-modal-body{max-height:60vh;overflow:auto}
      .iw-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid #f1f5f9}
      .iw-row:last-child{border-bottom:none}
      .iw-row-sub{font-size:12px;color:#475569;margin-top:3px}
      .iw-status{font-size:12px;color:#334155;margin-left:6px}
      .iw-toast{position:fixed;right:14px;bottom:14px;z-index:70;background:#0f172a;color:#fff;border-radius:10px;padding:10px 12px;max-width:70vw;box-shadow:0 10px 25px rgba(0,0,0,.25)}
      .iw-toast.error{background:#b91c1c}
      .iw-toast.success{background:#166534}
    `;
    document.head.appendChild(style);
  }

  const bar = document.createElement('div');
  bar.id = 'iwOfflineBar';
  bar.innerHTML = `
    <div class="iw-offline-left">
      <span id="iwNetDot" class="iw-dot" aria-hidden="true"></span>
      <span id="iwNetText" class="iw-net-text">Checking network…</span>
    </div>
    <div class="iw-offline-right">
      <span id="iwPendingCount" class="iw-pill" title="Pending inspections">0 pending</span>
      <button id="iwSyncNow" class="btn btn-secondary btn-small" type="button">Sync now</button>
      <button id="iwShowQueue" class="btn btn-secondary btn-small" type="button">Queue</button>
      <button id="iwShowSynced" class="btn btn-secondary btn-small" type="button">Synced</button>
    </div>
  `;

  const header = document.querySelector('.header');
  if (header && header.parentNode) {
    header.parentNode.insertBefore(bar, header.nextSibling);
  } else {
    document.body.insertBefore(bar, document.body.firstChild);
  }

  const modal = document.createElement('div');
  modal.id = 'iwQueueModal';
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="iw-modal-backdrop"></div>
    <div class="iw-modal">
      <div class="iw-modal-head">
        <div style="font-weight:900;">Offline Queue</div>
        <button id="iwCloseQueue" class="btn btn-secondary btn-small" type="button">Close</button>
      </div>
      <div id="iwQueueBody" class="iw-modal-body"></div>
      <div class="iw-modal-foot">
        <div style="font-size:12px; color:#475569;">If items are stuck on “Login required”, open login and retry.</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const syncedModal = document.createElement('div');
  syncedModal.id = 'iwSyncedModal';
  syncedModal.style.display = 'none';
  syncedModal.innerHTML = `
    <div class="iw-modal-backdrop"></div>
    <div class="iw-modal">
      <div class="iw-modal-head">
        <div style="font-weight:900;">Synced items</div>
        <button id="iwCloseSynced" class="btn btn-secondary btn-small" type="button">Close</button>
      </div>
      <div id="iwSyncedBody" class="iw-modal-body"></div>
      <div class="iw-modal-foot">
        <div style="font-size:12px; color:#475569;">Downloads use local PDF blob when available, otherwise the stored report URL.</div>
      </div>
    </div>
  `;
  document.body.appendChild(syncedModal);

  el('iwShowQueue').addEventListener('click', async () => {
    await refreshQueueModal();
    modal.style.display = 'block';
  });
  el('iwCloseQueue').addEventListener('click', () => (modal.style.display = 'none'));
  modal.querySelector('.iw-modal-backdrop').addEventListener('click', () => (modal.style.display = 'none'));

  el('iwShowSynced').addEventListener('click', async () => {
    await refreshSyncedModal();
    syncedModal.style.display = 'block';
  });
  el('iwCloseSynced').addEventListener('click', () => (syncedModal.style.display = 'none'));
  syncedModal.querySelector('.iw-modal-backdrop').addEventListener('click', () => (syncedModal.style.display = 'none'));

  // Download click delegation
  syncedModal.addEventListener('click', async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.getAttribute('data-iw-download');
    if (!id) return;
    target.setAttribute('disabled', 'disabled');
    try {
      await downloadSyncedPdf(id);
      toast('Download started', 'success');
    } catch (err) {
      toast(err?.message || 'Download failed', 'error');
    } finally {
      target.removeAttribute('disabled');
    }
  });
}

export function setNetworkUi(isOnline) {
  const dot = el('iwNetDot');
  const text = el('iwNetText');
  if (!dot || !text) return;

  if (isOnline) {
    dot.classList.remove('offline');
    text.textContent = 'Online';
  } else {
    dot.classList.add('offline');
    text.textContent = 'Offline — saving locally';
  }
}

export async function refreshPendingCounts() {
  const pill = el('iwPendingCount');
  if (!pill) return;
  const counts = await listPendingCounts();
  pill.textContent = `${counts.total} pending`;
  pill.title = `Queued: ${counts.queued}, Failed: ${counts.failed}, Needs login: ${counts.needsAuth}, Syncing: ${counts.syncing}`;
}

export async function refreshQueueModal() {
  const body = el('iwQueueBody');
  if (!body) return;
  const rows = await getPendingList(30);
  if (!rows.length) {
    body.innerHTML = `<div style="padding:10px; color:#475569;">No pending items.</div>`;
    return;
  }

  body.innerHTML = rows
    .map((r) => {
      const when = new Date(r.updatedAt || r.createdAt || Date.now()).toLocaleString();
      const err = r.lastError ? `<div class="iw-row-sub">${escapeHtml(r.lastError)}</div>` : '';
      return `
        <div class="iw-row">
          <div class="iw-row-main">
            <div><b>${escapeHtml(r.id)}</b> <span class="iw-status">${escapeHtml(r.status)}</span></div>
            <div class="iw-row-sub">Updated: ${escapeHtml(when)} • Retries: ${escapeHtml(String(r.retryCount || 0))}</div>
            ${err}
          </div>
        </div>
      `;
    })
    .join('');
}

export async function refreshSyncedModal() {
  const body = el('iwSyncedBody');
  if (!body) return;
  const rows = await listSynced(30);
  if (!rows.length) {
    body.innerHTML = `<div style="padding:10px; color:#475569;">No synced items yet.</div>`;
    return;
  }

  body.innerHTML = rows
    .map((r) => {
      const when = new Date(r.updatedAt || r.createdAt || Date.now()).toLocaleString();
      const url = r.reportUrl ? `<div class="iw-row-sub">Report URL saved</div>` : `<div class="iw-row-sub">No report URL</div>`;
      return `
        <div class="iw-row">
          <div class="iw-row-main">
            <div><b>${escapeHtml(r.id)}</b> <span class="iw-status">synced</span></div>
            <div class="iw-row-sub">Updated: ${escapeHtml(when)}</div>
            ${url}
          </div>
          <div>
            <button class="btn btn-secondary btn-small" type="button" data-iw-download="${escapeHtml(r.id)}">Download</button>
          </div>
        </div>
      `;
    })
    .join('');
}

export function hookSyncButtons({ onSyncNow }) {
  const btn = el('iwSyncNow');
  if (btn) btn.addEventListener('click', onSyncNow);
}

export function toast(message, kind = 'info') {
  let t = el('iwToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'iwToast';
    document.body.appendChild(t);
  }
  const normalizedKind = kind === 'ok' ? 'success' : kind === 'bad' ? 'error' : kind;
  t.className = `iw-toast ${normalizedKind}`;
  t.textContent = message;
  t.style.display = 'block';
  clearTimeout(globalThis.__iwToastTimer);
  globalThis.__iwToastTimer = setTimeout(() => (t.style.display = 'none'), 3500);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
