/**
 * Carrega apps-script/AnswerKey.gs + Core.gs em um contexto isolado do Node.
 * Permite executar exatamente a mesma lógica do Apps Script localmente e nos testes.
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

export function loadCore() {
  const context = vm.createContext({ console });
  for (const file of ['AnswerKey.gs', 'Core.gs']) {
    const code = readFileSync(new URL(`../apps-script/${file}`, import.meta.url), 'utf8');
    vm.runInContext(code, context, { filename: file });
  }
  return context;
}

/** Implementação em memória (com persistência opcional em arquivo) do `store` esperado pelo Core. */
export function createMemoryStore({ adminPassword = null, load = null, save = null } = {}) {
  const db = load?.() ?? { records: [], config: null };
  const tokens = new Map();
  let failures = 0;
  let failuresUntil = 0;
  const persist = () => save?.(db);

  return {
    db,
    now: () => new Date().toISOString(),
    withLock: (fn) => fn(),
    hasSubmission: (id) => db.records.some((r) => r.submissionId === id),
    hasCodeType: (code, type) => db.records.some((r) => r.participantCode === code && r.type === type),
    append: (rec) => {
      db.records.push(JSON.parse(JSON.stringify(rec)));
      persist();
    },
    listRecords: () => JSON.parse(JSON.stringify(db.records)).map((r) => {
      for (const k of Object.keys(r)) if (r[k] === '') r[k] = null;
      return r;
    }),
    getConfig: () => db.config,
    setConfig: (cfg) => {
      db.config = cfg;
      persist();
    },
    isPasswordConfigured: () => !!adminPassword,
    verifyPassword: (pw) => pw === adminPassword,
    getLoginFailures: () => (Date.now() > failuresUntil ? 0 : failures),
    registerLoginFailure: () => {
      failures = Date.now() > failuresUntil ? 1 : failures + 1;
      failuresUntil = Date.now() + 15 * 60 * 1000;
    },
    resetLoginFailures: () => { failures = 0; },
    createToken: () => {
      const token = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, '0')).join('');
      tokens.set(token, Date.now() + 6 * 3600 * 1000);
      return token;
    },
    isValidToken: (t) => (tokens.get(t) ?? 0) > Date.now(),
    revokeToken: (t) => tokens.delete(t),
  };
}
