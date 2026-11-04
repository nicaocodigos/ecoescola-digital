/** Mensagens rápidas de sucesso/erro, anunciadas por leitores de tela (aria-live). */
let region;

function ensureRegion() {
  if (region) return region;
  region = document.createElement('div');
  region.className = 'toast-region';
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('role', 'status');
  document.body.appendChild(region);
  return region;
}

/** @param {'success'|'error'|'warning'|'info'} type */
export function toast(message, type = 'info', ms = 5000) {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  ensureRegion().appendChild(el);
  setTimeout(() => el.remove(), ms);
}
