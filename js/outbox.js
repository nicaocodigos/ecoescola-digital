/**
 * Registro de resultados com tolerância a falhas de conexão.
 *
 * Cada envio é guardado no aparelho ANTES de ir para o servidor (fila "outbox").
 * Só sai da fila quando o servidor confirma. Se a internet cair, o envio fica
 * guardado e é reenviado automaticamente (ao reconectar, a cada 30 s e ao reabrir o site).
 * O submissionId é fixo por envio, então reenvios nunca geram registros duplicados.
 *
 * O localStorage aqui é apenas um buffer temporário: as métricas consolidadas
 * vêm sempre da base central (Google Sheets).
 */
import { apiCall } from './api.js';
import { storage } from './utils.js';

const OUTBOX_KEY = 'eco:outbox';
const REJECTED_KEY = 'eco:rejected';
const RETRY_MS = 30000;

const listeners = new Set();
let flushing = null;

const readQueue = () => storage.get(OUTBOX_KEY, []);
const writeQueue = (q) => storage.set(OUTBOX_KEY, q);

function notify() {
  const pending = readQueue().length;
  listeners.forEach((fn) => fn(pending));
}

/** Recebe atualizações da quantidade de envios pendentes. Retorna função para cancelar. */
export function onQueueChange(fn) {
  listeners.add(fn);
  fn(readQueue().length);
  return () => listeners.delete(fn);
}

export const pendingCount = () => readQueue().length;

/**
 * Adiciona um envio à fila e tenta enviá-lo.
 * @returns {Promise<'sent'|'queued'|'rejected'>}
 */
export async function enqueue(submission) {
  const q = readQueue();
  if (!q.some((s) => s.submissionId === submission.submissionId)) {
    q.push(submission);
    if (!writeQueue(q)) {
      // Sem espaço local: tenta enviar direto.
      return sendOne(submission).then((r) => r.outcome);
    }
    notify();
  }
  const id = submission.submissionId;
  const inQueue = () => readQueue().some((s) => s.submissionId === id);
  let results = await flush();
  // Se um envio anterior já estava em andamento, este item ainda não foi processado.
  if (!results.has(id) && inQueue()) results = await flush();
  return results.get(id) ?? (inQueue() ? 'queued' : 'sent');
}

async function sendOne(submission) {
  try {
    const res = await apiCall('submit', { data: submission });
    return { outcome: 'sent', status: res.status };
  } catch (err) {
    if (err.retryable) return { outcome: 'queued', error: err };
    return { outcome: 'rejected', error: err };
  }
}

/** Envia a fila em ordem. Para no primeiro erro de conexão. */
export function flush() {
  if (flushing) return flushing;
  flushing = (async () => {
    const results = new Map();
    for (const submission of readQueue()) {
      const r = await sendOne(submission);
      results.set(submission.submissionId, r.outcome);
      if (r.outcome === 'queued') break;
      const remaining = readQueue().filter((s) => s.submissionId !== submission.submissionId);
      writeQueue(remaining);
      if (r.outcome === 'rejected') {
        // Dados inválidos não são reenviados para sempre; ficam guardados para diagnóstico.
        const rejected = storage.get(REJECTED_KEY, []);
        rejected.push({ submission, error: r.error.message, at: new Date().toISOString() });
        storage.set(REJECTED_KEY, rejected.slice(-50));
        console.warn('Envio rejeitado pelo servidor:', r.error.message);
      }
    }
    notify();
    return results;
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}

/** Inicia as tentativas automáticas de reenvio. */
export function startAutoFlush() {
  window.addEventListener('online', () => flush());
  setInterval(() => {
    if (readQueue().length && navigator.onLine !== false) flush();
  }, RETRY_MS);
  if (readQueue().length) flush();
}
