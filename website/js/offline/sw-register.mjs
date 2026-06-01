export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (e) {
    console.warn('Service worker registration failed:', e);
    return null;
  }
}

export async function requestBackgroundSync(reg) {
  try {
    if (!reg) return false;
    if (!('sync' in reg)) return false;
    await reg.sync.register('iw-sync');
    return true;
  } catch (_) {
    return false;
  }
}
