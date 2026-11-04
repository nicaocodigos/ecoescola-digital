/**
 * Cálculo das métricas do painel (funções puras, sem DOM; testadas em tools/run-tests.mjs).
 *
 * Definições:
 *  - Participantes: códigos distintos com pelo menos um registro.
 *  - Concluíram: participantes com questionário final registrado.
 *  - Aproveitamento: acertos ÷ total de questões × 100.
 *  - Evolução (p.p.) = média final (%) − média inicial (%).
 *    É diferença absoluta em PONTOS PERCENTUAIS, não crescimento relativo.
 *    O indicador principal usa apenas participantes PAREADOS (fizeram inicial e final),
 *    para comparar as mesmas pessoas antes e depois.
 *  - Todo resultado traz `n` = quantidade de respostas válidas usadas no cálculo.
 */

export const ACTIVITY_LABELS = {
  start: 'Iniciaram (código gerado)',
  pre: 'Questionário inicial',
  conteudo_ambiente: 'Conteúdo Meio Ambiente',
  conteudo_saude: 'Conteúdo Saúde',
  desafio1: 'Desafio 1',
  desafio2: 'Desafio 2',
  desafio3: 'Desafio 3',
  quiz: 'Quiz',
  post: 'Questionário final',
};

export const percentOf = (r) => (r.total ? (r.score / r.total) * 100 : null);

export function mean(values) {
  const xs = values.filter((v) => Number.isFinite(v));
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

const isScored = (r) => Number.isFinite(r.score) && Number.isFinite(r.total) && r.total > 0;

/**
 * Defesa extra contra duplicidade: mantém um registro por participante + tipo (o primeiro recebido).
 * O servidor já impede duplicatas; isto protege contra linhas copiadas manualmente na planilha.
 */
export function dedupe(records) {
  const sorted = [...records].filter((r) => r && r.participantCode && r.type)
    .sort((a, b) => String(a.receivedAt ?? '').localeCompare(String(b.receivedAt ?? '')));
  const seen = new Set();
  return sorted.filter((r) => {
    const key = `${r.participantCode}|${r.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const scoreSummary = (rs) => ({ n: rs.length, mean: mean(rs.map(percentOf)) });

/** Soma acertos/total por chave a partir de um campo {chave: [acertos, total]} ou {chave: 0|1}. */
function aggregate(records, field) {
  const acc = {};
  for (const r of records) {
    const obj = r[field];
    if (!obj || typeof obj !== 'object') continue;
    for (const [k, v] of Object.entries(obj)) {
      const [c, t] = Array.isArray(v) ? v : [Number(v) ? 1 : 0, 1];
      acc[k] ??= { correct: 0, total: 0 };
      acc[k].correct += c;
      acc[k].total += t;
    }
  }
  for (const v of Object.values(acc)) v.pct = v.total ? (v.correct / v.total) * 100 : null;
  return acc;
}

function mergeStages(pre, post) {
  const keys = [...new Set([...Object.keys(pre), ...Object.keys(post)])].sort();
  return Object.fromEntries(keys.map((k) => [k, { pre: pre[k] ?? null, post: post[k] ?? null }]));
}

function countChoices(records) {
  const problems = {};
  const improvements = {};
  const comments = [];
  for (const r of records) {
    const x = r.extra;
    if (!x) continue;
    (x.problems || []).forEach((p) => { problems[p] = (problems[p] || 0) + 1; });
    (x.improvements || []).forEach((m) => { improvements[m] = (improvements[m] || 0) + 1; });
    if (x.comment) comments.push({ school: r.school, level: r.level, comment: x.comment });
  }
  const sortDesc = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);
  return { n: records.length, problems: sortDesc(problems), improvements: sortDesc(improvements), comments };
}

/**
 * @param {object[]} allRecords registros vindos da base central
 * @param {string|null} school 'A' | 'B' | 'C' | null (geral)
 */
export function computeMetrics(allRecords, school = null) {
  const records = dedupe(allRecords).filter((r) => !school || r.school === school);
  const byType = {};
  for (const r of records) (byType[r.type] ??= []).push(r);
  const ofType = (t) => byType[t] ?? [];
  const scored = (t) => ofType(t).filter(isScored);

  const participants = new Set(records.map((r) => r.participantCode));
  const pre = scored('pre');
  const post = scored('post');

  // Pareamento pelo código anônimo
  const preBy = new Map(pre.map((r) => [r.participantCode, r]));
  const pairs = post
    .filter((r) => preBy.has(r.participantCode))
    .map((r) => ({ code: r.participantCode, school: r.school, pre: percentOf(preBy.get(r.participantCode)), post: percentOf(r) }));
  const pairedPre = mean(pairs.map((p) => p.pre));
  const pairedPost = mean(pairs.map((p) => p.post));

  const preSummary = scoreSummary(pre);
  const postSummary = scoreSummary(post);

  const themes = mergeStages(aggregate(pre, 'themes'), aggregate(post, 'themes'));
  const items = mergeStages(aggregate(pre, 'detail'), aggregate(post, 'detail'));

  // Principais dificuldades: itens e temas com menor aproveitamento no final (ou no inicial, se ainda não houver final).
  const stage = post.length ? 'post' : pre.length ? 'pre' : null;
  const rank = (obj) => Object.entries(obj)
    .filter(([, v]) => v[stage]?.total)
    .map(([key, v]) => ({ key, pct: v[stage].pct, total: v[stage].total }))
    .sort((a, b) => a.pct - b.pct);

  return {
    school,
    totalRecords: records.length,
    participants: participants.size,
    concluded: new Set(ofType('post').map((r) => r.participantCode)).size,
    activity: Object.fromEntries(
      Object.keys(ACTIVITY_LABELS).map((t) => [t, new Set(ofType(t).map((r) => r.participantCode)).size]),
    ),
    pre: preSummary,
    post: postSummary,
    unpairedEvolutionPP: preSummary.mean != null && postSummary.mean != null ? postSummary.mean - preSummary.mean : null,
    paired: {
      n: pairs.length,
      pre: pairedPre,
      post: pairedPost,
      evolutionPP: pairs.length ? pairedPost - pairedPre : null,
      improved: pairs.filter((p) => p.post > p.pre).length,
      same: pairs.filter((p) => p.post === p.pre).length,
      worse: pairs.filter((p) => p.post < p.pre).length,
    },
    pairs,
    quiz: scoreSummary(scored('quiz')),
    desafio1: scoreSummary(scored('desafio1')),
    desafio2: scoreSummary(scored('desafio2')),
    themes,
    items,
    difficulties: stage ? { stage, items: rank(items).slice(0, 3), themes: rank(themes).slice(0, 2) } : null,
    ideas: countChoices(ofType('desafio3')),
    sources: { app: records.filter((r) => r.source !== 'papel').length, papel: records.filter((r) => r.source === 'papel').length },
  };
}
