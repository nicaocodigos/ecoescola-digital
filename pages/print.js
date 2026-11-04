/**
 * Alternativa impressa para quando não houver internet.
 * Gera folhas a partir dos MESMOS dados do aplicativo (questões, quiz, desafios, conteúdos),
 * mais uma folha de códigos anônimos. Depois, a equipe lança as respostas no painel
 * administrativo ("Lançar respostas em papel"), mantendo as métricas comparáveis.
 */
import { esc, byLevel, LETTERS } from '../js/utils.js';
import { SCHOOLS, SCHOOL_NAMES, LEVELS, LEVEL_NAMES } from '../js/config.js';
import { ASSESSMENT } from '../js/data/assessment.js';
import { QUIZ } from '../js/data/quiz.js';
import { BINS, DISPOSAL_ITEMS, RISK_SITUATIONS, SCHOOL_PROBLEMS, SCHOOL_IMPROVEMENTS } from '../js/data/challenges.js';
import { ENVIRONMENT_TOPICS, HEALTH_TOPICS, HEALTH_DISCLAIMER } from '../js/data/content.js';
import { generateCode } from '../js/participant.js';

const MATERIALS = {
  pre: 'Questionário inicial',
  post: 'Questionário final',
  quiz: 'Quiz (com gabarito comentado)',
  desafios: 'Desafios 1, 2 e 3',
  conteudo: 'Conteúdo resumido (Meio Ambiente e Saúde)',
  codigos: 'Folha de códigos dos participantes',
};

const sheetHeader = (title, school, level, withCode = true) => `
  <div class="print-head">
    <div><strong>EcoEscola Digital</strong> · ${esc(title)}</div>
    <div>${esc(SCHOOL_NAMES[school])} · ${esc(LEVEL_NAMES[level])}</div>
    ${withCode ? '<div class="print-code">Código do participante: <span>__ - __ __ __ __ __</span></div>' : ''}
  </div>`;

function questionList(questions) {
  return `<ol class="print-questions">${questions.map((q) => `<li>
      <p>${esc(q.text)}</p>
      <ul>${q.options.map((o, i) => `<li>( &nbsp; ) ${LETTERS[i]}) ${esc(o)}</li>`).join('')}</ul>
    </li>`).join('')}</ol>`;
}

function buildMaterial(kind, school, level) {
  switch (kind) {
    case 'pre':
    case 'post':
      return `<section class="sheet">${sheetHeader(MATERIALS[kind], school, level)}
        <p>Marque um X na alternativa que você considera correta. Não escreva seu nome.</p>
        ${questionList(ASSESSMENT[level])}</section>`;
    case 'quiz':
      return `<section class="sheet">${sheetHeader('Quiz EcoEscola', school, level)}${questionList(QUIZ[level])}</section>
        <section class="sheet">${sheetHeader('Quiz — gabarito comentado (para o professor)', school, level, false)}
        <ol>${QUIZ[level].map((q) => `<li><strong>${LETTERS[q.correct]}) ${esc(q.options[q.correct])}</strong> — ${esc(q.explain)}</li>`).join('')}</ol></section>`;
    case 'desafios':
      return `<section class="sheet">${sheetHeader('Desafio 1 — Onde descartar?', school, level)}
          <p>Escreva a letra da lixeira correta ao lado de cada resíduo.</p>
          <p class="print-legend">${BINS.map((b, i) => `<span>${LETTERS[i]}) ${esc(b.label)}</span>`).join(' · ')}</p>
          <ol>${DISPOSAL_ITEMS.map((it) => `<li>${esc(it.name)} ............ ( &nbsp;&nbsp; )</li>`).join('')}</ol>
        </section>
        <section class="sheet">${sheetHeader('Desafio 2 — Identifique o risco', school, level)}
          <ol>${RISK_SITUATIONS.map((s) => `<li><p><strong>${esc(s.title)}:</strong> ${esc(s.description)}</p>
            <p>Há risco? ( &nbsp; ) Sim &nbsp; ( &nbsp; ) Não</p>
            <ul>${s.actions.map((a, i) => `<li>( &nbsp; ) ${LETTERS[i]}) ${esc(a.text)}</li>`).join('')}</ul></li>`).join('')}</ol>
        </section>
        <section class="sheet">${sheetHeader('Desafio 3 — Minha escola mais sustentável', school, level)}
          <p><strong>Problemas que observo:</strong></p><ul class="print-checks">${SCHOOL_PROBLEMS.map((o) => `<li>☐ ${esc(o.label)}</li>`).join('')}</ul>
          <p><strong>Melhorias que sugiro:</strong></p><ul class="print-checks">${SCHOOL_IMPROVEMENTS.map((o) => `<li>☐ ${esc(o.label)}</li>`).join('')}</ul>
          <p><strong>Outra ideia (sem nomes):</strong></p><div class="print-lines"></div>
        </section>`;
    case 'conteudo':
      return `<section class="sheet">${sheetHeader('Meio Ambiente', school, level, false)}
          ${ENVIRONMENT_TOPICS.map((t) => `<h3>${esc(t.title)}</h3><p>${esc(byLevel(t.text, level))}</p>`).join('')}
          <p><strong>Cores da coleta seletiva:</strong> ${BINS.map((b) => esc(b.label)).join(', ')}.</p>
        </section>
        <section class="sheet">${sheetHeader('Saúde', school, level, false)}
          ${HEALTH_TOPICS.map((t) => `<h3>${esc(t.title)}</h3><p>${esc(byLevel(t.text, level))}</p>`).join('')}
          <p><em>${esc(HEALTH_DISCLAIMER)}</em></p>
        </section>`;
    case 'codigos': {
      const codes = Array.from({ length: 30 }, () => generateCode(school));
      return `<section class="sheet">${sheetHeader('Códigos dos participantes', school, level, false)}
        <p>Recorte e entregue um código para cada estudante. Ele deve escrever o MESMO código nas folhas inicial e final. Não associe códigos a nomes.</p>
        <div class="code-grid">${codes.map((c) => `<div class="code-slip">${esc(c)}</div>`).join('')}</div></section>`;
    }
    default:
      return '';
  }
}

export function render(root, ctx) {
  const school = ctx.school || 'A';
  root.innerHTML = `
    <section class="card no-print">
      <h1 tabindex="-1">🖨️ Versão para impressão</h1>
      <p>Use quando não houver internet. Depois, a equipe do projeto lança as respostas no painel administrativo, em “Lançar respostas em papel”.</p>
      <form id="pform" class="form form--inline">
        <div class="field"><label for="material">Material</label>
          <select id="material">${Object.entries(MATERIALS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select></div>
        <div class="field"><label for="pschool">Escola (cabeçalho e códigos)</label>
          <select id="pschool">${SCHOOLS.map((s) => `<option value="${s}" ${s === school ? 'selected' : ''}>${SCHOOL_NAMES[s]}</option>`).join('')}</select></div>
        <div class="field"><label for="plevel">Nível</label>
          <select id="plevel">${LEVELS.map((l) => `<option value="${l}" ${l === ctx.level ? 'selected' : ''}>${LEVEL_NAMES[l]}</option>`).join('')}</select></div>
        <button class="btn btn--primary" type="button" id="do-print">Imprimir</button>
      </form>
    </section>
    <div id="print-area" class="print-area"></div>`;

  const form = root.querySelector('#pform');
  const area = root.querySelector('#print-area');
  const update = () => { area.innerHTML = buildMaterial(form.material.value, form.pschool.value, form.plevel.value); };
  form.addEventListener('change', update);
  root.querySelector('#do-print').addEventListener('click', () => window.print());
  update();
}
