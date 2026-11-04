/**
 * Dashboard: visão geral ou por escola + comparação entre escolas.
 * Todos os números vêm de computeMetrics() sobre os registros reais da base central.
 */
import { computeMetrics, ACTIVITY_LABELS } from '../../js/metrics.js';
import { esc, formatPercent, formatPP } from '../../js/utils.js';
import { SCHOOLS, SCHOOL_NAMES, LEVEL_NAMES } from '../../js/config.js';
import { THEMES, ITEM_OBJECTIVES } from '../../js/data/assessment.js';
import { SCHOOL_PROBLEMS } from '../../js/data/challenges.js';
import { barChart, destroyCharts, COLORS } from '../../components/charts.js';

const nTag = (n) => `<span class="n" title="Quantidade de respostas válidas">n = ${n}</span>`;

function stat(label, value, extra = '', help = '') {
  return `<div class="stat"><p class="stat__label">${esc(label)}</p><p class="stat__value">${value}</p>
    ${extra ? `<p class="stat__extra">${extra}</p>` : ''}${help ? `<p class="stat__help">${esc(help)}</p>` : ''}</div>`;
}

function table(headers, rows, caption) {
  return `<div class="table-wrap"><table><caption>${esc(caption)}</caption>
    <thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

export function renderDashboard(root, { records, scope, config, generatedAt, onScope }) {
  destroyCharts();
  const m = computeMetrics(records, scope);
  const perSchool = Object.fromEntries(SCHOOLS.map((s) => [s, computeMetrics(records, s)]));
  const scopeName = scope ? SCHOOL_NAMES[scope] : 'Geral (três escolas)';
  const empty = m.totalRecords === 0;

  root.innerHTML = `
    <div class="scope" role="group" aria-label="Recorte do painel">
      ${[null, ...SCHOOLS].map((s) => `<button type="button" class="chip ${s === scope ? 'active' : ''}" data-scope="${s ?? ''}" aria-pressed="${s === scope}">
        ${s ? SCHOOL_NAMES[s] : 'Geral'}</button>`).join('')}
    </div>
    <p class="muted">Base central: ${m.totalRecords} registro(s) válidos em ${esc(scopeName)} (aplicativo: ${m.sources.app}, papel: ${m.sources.papel}).
      ${scope ? `Nível configurado: ${esc(LEVEL_NAMES[config.levels[scope]])}.` : ''} Atualizado em ${esc(new Date(generatedAt).toLocaleString('pt-BR'))}.</p>

    ${empty ? '<div class="notice notice--info"><div>Ainda não há registros neste recorte. Os indicadores aparecem assim que houver respostas reais.</div></div>' : ''}

    <h2>${esc(scopeName)}</h2>
    <div class="stats">
      ${stat('Participantes', m.participants, `${m.concluded} concluíram (q. final)`)}
      ${stat('Questionários iniciais', m.pre.n)}
      ${stat('Questionários finais', m.post.n)}
      ${stat('Quizzes realizados', m.quiz.n, m.quiz.mean != null ? `média ${formatPercent(m.quiz.mean)}` : '')}
      ${stat('Média inicial', formatPercent(m.pre.mean), nTag(m.pre.n), 'Todas as respostas iniciais válidas.')}
      ${stat('Média final', formatPercent(m.post.mean), nTag(m.post.n), 'Todas as respostas finais válidas.')}
      ${stat('Evolução (pareados)', formatPP(m.paired.evolutionPP), `${formatPercent(m.paired.pre)} → ${formatPercent(m.paired.post)} · ${nTag(m.paired.n)}`,
        'Média final − média inicial dos mesmos participantes, em pontos percentuais.')}
      ${stat('Melhoraram (pareados)', m.paired.improved, `${m.paired.same} mantiveram · ${m.paired.worse} pioraram · ${nTag(m.paired.n)}`)}
    </div>
    <p class="muted small">Evolução sem pareamento (todas as respostas): ${formatPP(m.unpairedEvolutionPP)}. Use preferencialmente a evolução pareada no relatório.</p>

    <div class="grid-2">
      <section class="panel"><h3>1. Conhecimento inicial × final (pareados) ${nTag(m.paired.n)}</h3><div id="ch-prepost"></div></section>
      <section class="panel"><h3>4. Desempenho por tema educativo</h3><div id="ch-themes"></div>
        ${table(['Tema', 'Inicial', 'Final', 'Diferença'], Object.entries(m.themes).map(([k, v]) => [esc(THEMES[k] ?? k),
          `${formatPercent(v.pre?.pct)} <small>(${v.pre?.total ?? 0} resp.)</small>`, `${formatPercent(v.post?.pct)} <small>(${v.post?.total ?? 0} resp.)</small>`,
          v.pre?.pct != null && v.post?.pct != null ? formatPP(v.post.pct - v.pre.pct) : '—']), 'Aproveitamento por tema (questionários)')}
      </section>
    </div>

    <section class="panel">
      <h3>Principais dificuldades identificadas</h3>
      ${m.difficulties ? `
        <p class="muted small">Itens com menor aproveitamento no questionário ${m.difficulties.stage === 'post' ? 'final' : 'inicial (ainda não há finais)'}.</p>
        <ol>${m.difficulties.items.map((d) => `<li><strong>${esc(d.key)}</strong> — ${esc(ITEM_OBJECTIVES[d.key] ?? '')}: ${formatPercent(d.pct)} de acerto <small>(${d.total} resp.)</small></li>`).join('')}</ol>
        <p>Temas mais difíceis: ${m.difficulties.themes.map((t) => `<strong>${esc(THEMES[t.key] ?? t.key)}</strong> (${formatPercent(t.pct)})`).join(', ')}.</p>`
        : '<p class="empty">Sem questionários registrados.</p>'}
      <h4>Problemas mais apontados pelos estudantes (Desafio 3) ${nTag(m.ideas.n)}</h4>
      ${m.ideas.problems.length ? `<ol>${m.ideas.problems.slice(0, 5).map(([id, n]) => `<li>${esc(SCHOOL_PROBLEMS.find((p) => p.id === id)?.label ?? id)}: ${n}</li>`).join('')}</ol>` : '<p class="empty">Sem respostas.</p>'}
    </section>

    <section class="panel">
      <h3>Participação nas atividades — ${esc(scopeName)}</h3>
      ${table(['Atividade', 'Participantes', '% dos participantes'], Object.entries(ACTIVITY_LABELS).map(([t, l]) => [esc(l), m.activity[t],
        m.participants ? formatPercent((m.activity[t] / m.participants) * 100) : '—']), 'Participantes distintos por atividade')}
    </section>

    <h2>Comparação entre escolas</h2>
    <div class="grid-2">
      <section class="panel"><h3>2. Inicial × final por escola (pareados)</h3><div id="ch-schools"></div></section>
      <section class="panel"><h3>3. Participação por instituição</h3><div id="ch-participation"></div></section>
    </div>
    ${table(['Escola', 'Nível', 'Participantes', 'Concluíram', 'Média inicial', 'Média final', 'Pareados: inicial → final', 'Evolução', 'Quiz'],
      [...SCHOOLS.map((s) => [s, perSchool[s]]), ['Geral', computeMetrics(records)]].map(([s, x]) => [
        s === 'Geral' ? '<strong>Geral</strong>' : esc(SCHOOL_NAMES[s]), s === 'Geral' ? '—' : esc(LEVEL_NAMES[config.levels[s]]),
        x.participants, x.concluded,
        `${formatPercent(x.pre.mean)} <small>(n=${x.pre.n})</small>`, `${formatPercent(x.post.mean)} <small>(n=${x.post.n})</small>`,
        `${formatPercent(x.paired.pre)} → ${formatPercent(x.paired.post)} <small>(n=${x.paired.n})</small>`,
        `<strong>${formatPP(x.paired.evolutionPP)}</strong>`, `${formatPercent(x.quiz.mean)} <small>(n=${x.quiz.n})</small>`]),
      'Comparativo entre escolas')}
    <p class="muted small">Atenção: escolas configuradas com níveis diferentes respondem versões adaptadas dos mesmos itens. Compare a evolução (p.p.), não apenas as médias absolutas.</p>`;

  root.querySelectorAll('[data-scope]').forEach((b) => b.addEventListener('click', () => onScope(b.dataset.scope || null)));

  // Gráficos
  barChart(root.querySelector('#ch-prepost'), {
    title: 'Conhecimento inicial e final dos participantes pareados', percent: true,
    labels: [scopeName],
    datasets: [
      { label: 'Inicial', data: [m.paired.pre], color: COLORS.pre },
      { label: 'Final', data: [m.paired.post], color: COLORS.post },
    ],
  });
  const themeKeys = Object.keys(m.themes);
  barChart(root.querySelector('#ch-themes'), {
    title: 'Aproveitamento por tema', percent: true,
    labels: themeKeys.map((k) => THEMES[k] ?? k),
    datasets: [
      { label: 'Inicial', data: themeKeys.map((k) => m.themes[k].pre?.pct ?? null), color: COLORS.pre },
      { label: 'Final', data: themeKeys.map((k) => m.themes[k].post?.pct ?? null), color: COLORS.post },
    ],
  });
  barChart(root.querySelector('#ch-schools'), {
    title: 'Média inicial e final pareadas por escola', percent: true,
    labels: SCHOOLS.map((s) => `${SCHOOL_NAMES[s]} (n=${perSchool[s].paired.n})`),
    datasets: [
      { label: 'Inicial', data: SCHOOLS.map((s) => perSchool[s].paired.pre), color: COLORS.pre },
      { label: 'Final', data: SCHOOLS.map((s) => perSchool[s].paired.post), color: COLORS.post },
    ],
  });
  const acts = ['start', 'pre', 'desafio1', 'quiz', 'post'];
  barChart(root.querySelector('#ch-participation'), {
    title: 'Participantes por atividade e escola',
    labels: acts.map((t) => ACTIVITY_LABELS[t]),
    datasets: SCHOOLS.map((s) => ({ label: SCHOOL_NAMES[s], data: acts.map((t) => perSchool[s].activity[t]), color: COLORS[s] })),
  });
}

