/**
 * Testes automatizados (sem dependências): node tools/run-tests.mjs
 * Cobrem o backend (Core.gs executado no Node), as métricas e a exportação CSV.
 */
import assert from 'node:assert/strict';
import { loadCore, createMemoryStore } from './load-core.mjs';
import { computeMetrics, dedupe } from '../js/metrics.js';
import { summaryCSV, participantsCSV, toCSV } from '../js/export.js';
import { ASSESSMENT } from '../js/data/assessment.js';
import { QUIZ } from '../js/data/quiz.js';
import { DISPOSAL_ITEMS, RISK_SITUATIONS } from '../js/data/challenges.js';
import { buildAnswerKey } from './build-answer-key.mjs';
import { readFileSync } from 'node:fs';

let passed = 0;
const failures = [];
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✔ ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`  ✘ ${name}\n    ${e.message}`);
  }
}

const core = loadCore();
const newStore = () => createMemoryStore({ adminPassword: 'senha-de-teste-123' });
let seq = 0;
const sid = () => `test-${String(++seq).padStart(8, '0')}`;
/** Respostas com `k` acertos (primeiras k corretas, demais erradas). */
function answersWith(level, k, bank = ASSESSMENT) {
  return Object.fromEntries(bank[level].map((q, i) => [q.id, i < k ? q.correct : (q.correct + 1) % q.options.length]));
}
const submit = (store, data) => core.handleRequest({ action: 'submit', data: { submissionId: sid(), level: 'f2', ...data } }, store);

console.log('\nGabarito');
test('AnswerKey.gs está sincronizado com js/data', () => {
  const gs = readFileSync(new URL('../apps-script/AnswerKey.gs', import.meta.url), 'utf8');
  const json = gs.slice(gs.indexOf('{'), gs.lastIndexOf('}') + 1);
  assert.deepEqual(JSON.parse(json), buildAnswerKey());
});

console.log('\nBackend (Core.gs)');
test('registra questionário e recalcula a pontuação no servidor', () => {
  const store = newStore();
  const r = submit(store, { type: 'pre', school: 'A', participantCode: 'A-7KX3Q', answers: answersWith('f2', 4), score: 10 });
  assert.equal(r.ok, true);
  assert.equal(r.status, 'saved');
  assert.equal(r.score, 4); // ignora "score: 10" enviado pelo cliente
  assert.equal(store.db.records[0].percent, 40);
});
test('mesmo submissionId não duplica (reenvio após falha de rede)', () => {
  const store = newStore();
  const data = { submissionId: 'fixo-12345678', type: 'quiz', school: 'B', level: 'f1', participantCode: 'B-22222', answers: answersWith('f1', 5, QUIZ) };
  assert.equal(core.handleRequest({ action: 'submit', data }, store).status, 'saved');
  assert.equal(core.handleRequest({ action: 'submit', data }, store).status, 'duplicate');
  assert.equal(store.db.records.length, 1);
});
test('segundo questionário inicial do mesmo código é ignorado', () => {
  const store = newStore();
  submit(store, { type: 'pre', school: 'A', participantCode: 'A-33333', answers: answersWith('f2', 2) });
  const r = submit(store, { type: 'pre', school: 'A', participantCode: 'A-33333', answers: answersWith('f2', 9) });
  assert.equal(r.status, 'already_recorded');
  assert.equal(store.db.records.length, 1);
});
test('rejeita escola, código, nível e tipo inválidos', () => {
  const store = newStore();
  assert.equal(submit(store, { type: 'pre', school: 'D', participantCode: 'A-33333', answers: answersWith('f2', 2) }).ok, false);
  assert.equal(submit(store, { type: 'pre', school: 'B', participantCode: 'A-33333', answers: answersWith('f2', 2) }).ok, false);
  assert.equal(submit(store, { type: 'pre', school: 'A', participantCode: 'A-0O1IL', answers: answersWith('f2', 2) }).ok, false);
  assert.equal(submit(store, { type: 'pre', school: 'A', level: 'x', participantCode: 'A-33333', answers: answersWith('f2', 2) }).ok, false);
  assert.equal(submit(store, { type: 'admin', school: 'A', participantCode: 'A-33333' }).ok, false);
  assert.equal(store.db.records.length, 0);
});
test('rejeita questionário incompleto ou com alternativa inexistente', () => {
  const store = newStore();
  const partial = answersWith('f2', 3);
  delete partial.AV10;
  assert.equal(submit(store, { type: 'pre', school: 'A', participantCode: 'A-44444', answers: partial }).error, 'validation');
  const bad = { ...answersWith('f2', 3), AV01: 7 };
  assert.equal(submit(store, { type: 'pre', school: 'A', participantCode: 'A-44444', answers: bad }).error, 'validation');
});
test('desafios 1 e 2 são pontuados no servidor', () => {
  const store = newStore();
  const d1 = Object.fromEntries(DISPOSAL_ITEMS.map((i) => [i.id, i.bin]));
  d1.D1_10 = 'rejeito';
  assert.equal(submit(store, { type: 'desafio1', school: 'C', participantCode: 'C-55555', answers: d1 }).score, 9);
  const d2 = Object.fromEntries(RISK_SITUATIONS.map((s) => [s.id, { risk: s.risk, action: s.action }]));
  d2.S1 = { risk: false, action: 'a' };
  assert.equal(submit(store, { type: 'desafio2', school: 'C', participantCode: 'C-55555', answers: d2 }).score, 4);
});
test('desafio 3 remove e-mail, telefone e HTML do comentário', () => {
  const store = newStore();
  const r = submit(store, { type: 'desafio3', school: 'A', participantCode: 'A-66666',
    answers: { problems: ['p_lixo_chao'], improvements: [], comment: '<b>Oi</b> meu zap 11 98765-4321 e joao@email.com' } });
  assert.equal(r.ok, true);
  const c = store.db.records[0].extra.comment;
  assert.ok(!c.includes('98765') && !c.includes('@') && !c.includes('<b>'), c);
});
test('desafio 3 rejeita opções fora da lista', () => {
  const store = newStore();
  assert.equal(submit(store, { type: 'desafio3', school: 'A', participantCode: 'A-66666', answers: { problems: ['hack'] } }).ok, false);
});
test('ações administrativas exigem login; senha errada bloqueia após 5 tentativas', () => {
  const store = newStore();
  assert.equal(core.handleRequest({ action: 'adminData' }, store).error, 'unauthorized');
  assert.equal(core.handleRequest({ action: 'adminData', token: 'x'.repeat(64) }, store).error, 'unauthorized');
  for (let i = 0; i < 5; i++) assert.equal(core.handleRequest({ action: 'login', password: 'errada' }, store).error, 'invalid_credentials');
  assert.equal(core.handleRequest({ action: 'login', password: 'senha-de-teste-123' }, store).error, 'too_many_attempts');
  const store2 = newStore();
  const login = core.handleRequest({ action: 'login', password: 'senha-de-teste-123' }, store2);
  assert.equal(login.ok, true);
  assert.equal(core.handleRequest({ action: 'adminData', token: login.token }, store2).ok, true);
  core.handleRequest({ action: 'logout', token: login.token }, store2);
  assert.equal(core.handleRequest({ action: 'adminData', token: login.token }, store2).error, 'unauthorized');
});
test('configuração de nível: valida e persiste', () => {
  const store = newStore();
  const { token } = core.handleRequest({ action: 'login', password: 'senha-de-teste-123' }, store);
  assert.equal(core.handleRequest({ action: 'setConfig', token, config: { levels: { A: 'f1', B: 'zz', C: 'em' } } }, store).ok, false);
  assert.equal(core.handleRequest({ action: 'setConfig', token, config: { levels: { A: 'f1', B: 'f2', C: 'em' } } }, store).ok, true);
  const cfg = JSON.parse(JSON.stringify(core.handleRequest({ action: 'getConfig' }, store).config));
  assert.deepEqual(cfg.levels, { A: 'f1', B: 'f2', C: 'em' });
});
test('lançamento em papel exige token e grava origem "papel"', () => {
  const store = newStore();
  const data = { submissionId: sid(), type: 'post', school: 'A', level: 'f2', participantCode: 'A-77777', answers: answersWith('f2', 8) };
  assert.equal(core.handleRequest({ action: 'adminSubmit', data }, store).error, 'unauthorized');
  const { token } = core.handleRequest({ action: 'login', password: 'senha-de-teste-123' }, store);
  assert.equal(core.handleRequest({ action: 'adminSubmit', token, data }, store).status, 'saved');
  assert.equal(store.db.records[0].source, 'papel');
});
test('status informa atividades já feitas por um código', () => {
  const store = newStore();
  submit(store, { type: 'start', school: 'B', participantCode: 'B-88888' });
  submit(store, { type: 'pre', school: 'B', participantCode: 'B-88888', answers: answersWith('f2', 5) });
  const st = core.handleRequest({ action: 'status', code: 'B-88888' }, store);
  assert.deepEqual([...st.types].sort(), ['pre', 'start']);
  assert.equal(st.level, 'f2');
});
test('requisição gigante é recusada', () => {
  assert.equal(core.handleRequest({ action: 'ping', pad: 'x'.repeat(30000) }, newStore()).error, 'too_large');
});

console.log('\nMétricas');
function scenario() {
  const store = newStore();
  // Escola A: 2 pareados (40→80 e 50→80) + 1 só inicial (20)
  submit(store, { type: 'pre', school: 'A', participantCode: 'A-AAAA2', answers: answersWith('f2', 4) });
  submit(store, { type: 'post', school: 'A', participantCode: 'A-AAAA2', answers: answersWith('f2', 8) });
  submit(store, { type: 'pre', school: 'A', participantCode: 'A-AAAA3', answers: answersWith('f2', 5) });
  submit(store, { type: 'post', school: 'A', participantCode: 'A-AAAA3', answers: answersWith('f2', 8) });
  submit(store, { type: 'pre', school: 'A', participantCode: 'A-AAAA4', answers: answersWith('f2', 2) });
  // Escola B: 1 pareado 60→70, nível f1
  submit(store, { type: 'pre', school: 'B', level: 'f1', participantCode: 'B-BBBB2', answers: answersWith('f1', 6) });
  submit(store, { type: 'post', school: 'B', level: 'f1', participantCode: 'B-BBBB2', answers: answersWith('f1', 7) });
  submit(store, { type: 'quiz', school: 'B', level: 'f1', participantCode: 'B-BBBB2', answers: answersWith('f1', 9, QUIZ) });
  return store.listRecords();
}
test('evolução em pontos percentuais usa participantes pareados', () => {
  const m = computeMetrics(scenario(), 'A');
  assert.equal(m.participants, 3);
  assert.equal(m.concluded, 2);
  assert.equal(m.pre.n, 3);
  assert.ok(Math.abs(m.pre.mean - 36.6667) < 0.01); // (40+50+20)/3
  assert.equal(m.paired.n, 2);
  assert.equal(m.paired.pre, 45);
  assert.equal(m.paired.post, 80);
  assert.equal(m.paired.evolutionPP, 35); // 80% − 45% = +35 p.p. (não 77,8% relativo)
});
test('geral combina as escolas e mantém os n corretos', () => {
  const m = computeMetrics(scenario());
  assert.equal(m.participants, 4);
  assert.equal(m.paired.n, 3);
  assert.ok(Math.abs(m.paired.pre - 50) < 1e-9); // (40+50+60)/3
  assert.ok(Math.abs(m.paired.post - 76.6667) < 0.01); // (80+80+70)/3
  assert.equal(m.quiz.n, 1);
  assert.equal(m.quiz.mean, 90);
});
test('escola sem dados retorna nulos (nunca valores inventados)', () => {
  const m = computeMetrics(scenario(), 'C');
  assert.equal(m.participants, 0);
  assert.equal(m.pre.mean, null);
  assert.equal(m.paired.evolutionPP, null);
  assert.equal(m.difficulties, null);
});
test('dedupe mantém o primeiro registro de cada código+tipo', () => {
  const r = [
    { participantCode: 'A-22222', type: 'pre', receivedAt: '2026-01-02', score: 9, total: 10 },
    { participantCode: 'A-22222', type: 'pre', receivedAt: '2026-01-01', score: 3, total: 10 },
  ];
  assert.equal(dedupe(r).length, 1);
  assert.equal(dedupe(r)[0].score, 3);
});
test('dificuldades apontam os itens com menor acerto no final', () => {
  const m = computeMetrics(scenario(), 'A');
  assert.equal(m.difficulties.stage, 'post');
  // No cenário, todos erraram AV09 e AV10 no questionário final.
  assert.deepEqual(m.difficulties.items.slice(0, 2).map((d) => d.key).sort(), ['AV09', 'AV10']);
  assert.equal(m.difficulties.items[0].pct, 0);
  assert.equal(m.difficulties.themes[0].key, 'ambiente_saude');
});

console.log('\nCSV');
test('CSV usa ";" , BOM e protege contra fórmulas', () => {
  const csv = toCSV(['a', 'b'], [['=SOMA(1)', 'x;y']]);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes("'=SOMA(1)"));
  assert.ok(csv.includes('"x;y"'));
});
test('relatório consolidado tem Geral + 3 escolas', () => {
  const lines = summaryCSV(scenario()).trim().split('\r\n');
  assert.equal(lines.length, 5);
  assert.ok(lines[1].startsWith('Geral;4;3'));
});
test('CSV de participantes não contém campos pessoais', () => {
  const csv = participantsCSV(scenario());
  assert.ok(!/nome|cpf|telefone|e-mail|endereço/i.test(csv));
  assert.ok(csv.includes('A-AAAA2'));
  assert.ok(csv.includes('40,0;80,0;40,0'));
});

console.log(`\n${passed} passaram, ${failures.length} falharam`);
process.exit(failures.length ? 1 : 0);
