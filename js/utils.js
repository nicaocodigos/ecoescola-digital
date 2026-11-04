/** Utilitários genéricos, sem dependência de estado da aplicação. */

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto antes de interpolar em HTML (evita XSS). */
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

/** UUID v4 (usado como identificador único de cada envio, para evitar duplicidade). */
export function uuid() {
  if (globalThis.crypto?.randomUUID) {
    try { return crypto.randomUUID(); } catch { /* contexto inseguro: usa fallback */ }
  }
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Acesso seguro ao localStorage (modo privado ou cota cheia não quebram a aplicação). */
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* ignora */ }
  },
};

const numberFmt = (digits) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function formatNumber(value, digits = 1) {
  return value == null || Number.isNaN(value) ? '—' : numberFmt(digits).format(value);
}

export function formatPercent(value, digits = 1) {
  return value == null || Number.isNaN(value) ? '—' : `${numberFmt(digits).format(value)}%`;
}

/** Pontos percentuais: diferença absoluta entre dois percentuais (não é crescimento relativo). */
export function formatPP(value, digits = 1) {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${numberFmt(digits).format(Math.abs(value))} p.p.`;
}

/** Escolhe a variação de texto conforme o nível ('f1' | 'f2' | 'em'). */
export function byLevel(value, level) {
  if (value == null || typeof value === 'string' || Array.isArray(value)) return value;
  return value[level] ?? value.f2 ?? value.f1 ?? value.em;
}

export const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
