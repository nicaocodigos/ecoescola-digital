/**
 * Exportação CSV (separador ";" e decimal com vírgula, padrão do Excel em português;
 * o Google Sheets também importa corretamente). Nenhum dado pessoal é exportado:
 * apenas o código anônimo, escola, nível e respostas.
 */
import { computeMetrics, dedupe, percentOf, ACTIVITY_LABELS } from './metrics.js';
import { SCHOOLS, SCHOOL_NAMES, LEVEL_NAMES } from './config.js';
import { THEMES, ITEM_OBJECTIVES } from './data/assessment.js';
import { SCHOOL_PROBLEMS, SCHOOL_IMPROVEMENTS } from './data/challenges.js';

const num = (v, d = 1) => (v == null || Number.isNaN(v) ? '' : v.toFixed(d).replace('.', ','));

function cell(v) {
  if (v == null) return '';
  let s = String(v);
  // Evita execução de fórmulas ao abrir no Excel/Sheets (CSV injection).
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(headers, rows) {
  return '\uFEFF' + [headers, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
}

export function download(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const scopeFilter = (records, school) => dedupe(records).filter((r) => !school || r.school === school);

/** Relatório consolidado: uma linha por recorte (Geral, A, B, C) com todas as métricas e seus n. */
export function summaryCSV(records) {
  const headers = ['Recorte', 'Participantes', 'Concluíram (q. final)',
    ...Object.values(ACTIVITY_LABELS).map((l) => `Participação: ${l}`),
    'Média inicial (%)', 'n inicial', 'Média final (%)', 'n final',
    'Média inicial pareada (%)', 'Média final pareada (%)', 'n pareado', 'Evolução pareada (p.p.)',
    'Pareados que melhoraram', 'Média quiz (%)', 'n quiz', 'Desafio 1 (%)', 'n desafio 1', 'Desafio 2 (%)', 'n desafio 2',
    ...Object.keys(THEMES).flatMap((t) => [`${THEMES[t]} inicial (%)`, `${THEMES[t]} final (%)`])];
  const rows = [null, ...SCHOOLS].map((s) => {
    const m = computeMetrics(records, s);
    return [s ? SCHOOL_NAMES[s] : 'Geral', m.participants, m.concluded,
      ...Object.keys(ACTIVITY_LABELS).map((t) => m.activity[t]),
      num(m.pre.mean), m.pre.n, num(m.post.mean), m.post.n,
      num(m.paired.pre), num(m.paired.post), m.paired.n, num(m.paired.evolutionPP), m.paired.improved,
      num(m.quiz.mean), m.quiz.n, num(m.desafio1.mean), m.desafio1.n, num(m.desafio2.mean), m.desafio2.n,
      ...Object.keys(THEMES).flatMap((t) => [num(m.themes[t]?.pre?.pct), num(m.themes[t]?.post?.pct)])];
  });
  return toCSV(headers, rows);
}

/** Resultados por participante (código anônimo): inicial, final, evolução e atividades. */
export function participantsCSV(records, school = null) {
  const recs = scopeFilter(records, school);
  const by = new Map();
  for (const r of recs) {
    if (!by.has(r.participantCode)) by.set(r.participantCode, { school: r.school, level: r.level, types: {} });
    by.get(r.participantCode).types[r.type] = r;
  }
  const headers = ['Código anônimo', 'Escola', 'Nível', 'Inicial (%)', 'Final (%)', 'Evolução (p.p.)', 'Quiz (%)',
    'Desafio 1 (%)', 'Desafio 2 (%)', 'Desafio 3', 'Leu Meio Ambiente', 'Leu Saúde', 'Origem dos dados'];
  const yes = (v) => (v ? 'sim' : 'não');
  const rows = [...by.entries()].sort().map(([code, p]) => {
    const t = p.types;
    const pre = t.pre ? percentOf(t.pre) : null;
    const post = t.post ? percentOf(t.post) : null;
    const sources = [...new Set(Object.values(t).map((r) => r.source || 'app'))].join('+');
    return [code, SCHOOL_NAMES[p.school], LEVEL_NAMES[p.level] ?? p.level, num(pre), num(post),
      pre != null && post != null ? num(post - pre) : '', t.quiz ? num(percentOf(t.quiz)) : '',
      t.desafio1 ? num(percentOf(t.desafio1)) : '', t.desafio2 ? num(percentOf(t.desafio2)) : '',
      yes(t.desafio3), yes(t.conteudo_ambiente), yes(t.conteudo_saude), sources];
  });
  return toCSV(headers, rows);
}

/** Respostas dos questionários, item a item (1 = acerto, 0 = erro). */
export function questionnairesCSV(records, school = null) {
  const items = Object.keys(ITEM_OBJECTIVES);
  const headers = ['Código anônimo', 'Escola', 'Nível', 'Questionário', 'Origem', 'Recebido em', 'Acertos', 'Total', 'Aproveitamento (%)',
    ...items.map((i) => `${i} (acerto)`), ...items.map((i) => `${i} (alternativa)`)];
  const rows = scopeFilter(records, school)
    .filter((r) => r.type === 'pre' || r.type === 'post')
    .map((r) => [r.participantCode, SCHOOL_NAMES[r.school], LEVEL_NAMES[r.level] ?? r.level, r.type === 'pre' ? 'Inicial' : 'Final',
      r.source || 'app', r.receivedAt, r.score, r.total, num(percentOf(r)),
      ...items.map((i) => r.detail?.[i] ?? ''), ...items.map((i) => (r.answers?.[i] != null ? 'abcdefg'[r.answers[i]] : ''))]);
  return toCSV(headers, rows);
}

/** Itens/temas: aproveitamento por objetivo de aprendizagem (inicial × final). */
export function itemsCSV(records, school = null) {
  const m = computeMetrics(records, school);
  const headers = ['Tipo', 'Chave', 'Descrição', 'Inicial (%)', 'Respostas inicial', 'Final (%)', 'Respostas final', 'Diferença (p.p.)'];
  const row = (kind, key, label, v) => [kind, key, label, num(v.pre?.pct), v.pre?.total ?? 0, num(v.post?.pct), v.post?.total ?? 0,
    v.pre?.pct != null && v.post?.pct != null ? num(v.post.pct - v.pre.pct) : ''];
  return toCSV(headers, [
    ...Object.entries(m.themes).map(([k, v]) => row('Tema', k, THEMES[k] ?? k, v)),
    ...Object.entries(m.items).map(([k, v]) => row('Item', k, ITEM_OBJECTIVES[k] ?? k, v)),
  ]);
}

/** Desafio 3: contagem de problemas/melhorias e comentários anonimizados. */
export function ideasCSV(records, school = null) {
  const m = computeMetrics(records, school);
  const label = (list, id) => list.find((x) => x.id === id)?.label ?? id;
  const rows = [
    ...m.ideas.problems.map(([id, n]) => ['Problema', label(SCHOOL_PROBLEMS, id), n, '']),
    ...m.ideas.improvements.map(([id, n]) => ['Melhoria', label(SCHOOL_IMPROVEMENTS, id), n, '']),
    ...m.ideas.comments.map((c) => ['Comentário', c.comment, '', SCHOOL_NAMES[c.school]]),
  ];
  return toCSV(['Categoria', 'Descrição', 'Quantidade', 'Escola'], rows);
}

/** Todos os registros brutos (sem dados pessoais). */
export function rawCSV(records, school = null) {
  const headers = ['submissionId', 'receivedAt', 'source', 'type', 'school', 'level', 'participantCode', 'score', 'total', 'percent', 'detail', 'themes', 'answers', 'extra'];
  const rows = scopeFilter(records, school).map((r) =>
    headers.map((h) => (r[h] != null && typeof r[h] === 'object' ? JSON.stringify(r[h]) : r[h] ?? '')));
  return toCSV(headers, rows);
}
