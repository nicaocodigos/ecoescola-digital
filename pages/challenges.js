/**
 * Área de desafios:
 *  1 — Onde descartar? (classificar resíduos nas lixeiras)
 *  2 — Identifique o risco (avaliar situações e escolher a solução)
 *  3 — Minha escola mais sustentável (problemas observados e melhorias, anônimo)
 */
import { esc, byLevel } from '../js/utils.js';
import { BINS, DISPOSAL_ITEMS, RISK_SITUATIONS, SCHOOL_PROBLEMS, SCHOOL_IMPROVEMENTS, COMMENT_MAX } from '../js/data/challenges.js';
import { registerActivity, STATUS_MESSAGES } from '../js/results.js';
import { progressBar, statusNotice, notice } from '../components/ui.js';
import { renderNotFound } from './home.js';
import { preNotice } from './journey.js';

const CHALLENGES = [
  { n: '1', type: 'desafio1', icon: '🗑️', title: 'Onde descartar?', desc: 'Coloque cada resíduo na lixeira certa.' },
  { n: '2', type: 'desafio2', icon: '🔍', title: 'Identifique o risco', desc: 'Encontre os riscos e escolha a solução.' },
  { n: '3', type: 'desafio3', icon: '🏫', title: 'Minha escola mais sustentável', desc: 'Conte o que você observa e o que pode melhorar.' },
];

const INTRO = {
  desafio1: { f1: 'Toque na lixeira certa para cada objeto!', f2: 'Classifique cada resíduo na categoria correta de descarte.', em: 'Classifique cada resíduo conforme o padrão de cores da coleta seletiva (CONAMA 275/2001).' },
  desafio2: { f1: 'Olhe a imagem. Tem perigo? O que fazer?', f2: 'Analise cada situação: há risco para o ambiente ou para a saúde? Qual a melhor solução?', em: 'Avalie cada cenário quanto ao risco ambiental e sanitário e indique a intervenção mais adequada.' },
};

export function renderHub(root, ctx) {
  const p = ctx.participant;
  root.innerHTML = `
    <header class="page-head"><span class="page-head__icon" aria-hidden="true">🎯</span>
      <div><h1 tabindex="-1">Desafios</h1><p>Coloque em prática o que você aprendeu.</p></div></header>
    ${preNotice(ctx)}
    <div class="grid">
      ${CHALLENGES.map((c) => `<a class="tile tile--row" href="#/desafios/${c.n}">
        <span aria-hidden="true">${c.icon}</span>
        <span><strong>Desafio ${c.n} — ${esc(c.title)}</strong><small>${esc(c.desc)}</small></span>
        ${p?.done[c.type] ? '<span class="badge badge--success">Concluído</span>' : ''}
      </a>`).join('')}
      <a class="tile tile--row" href="#/quiz"><span aria-hidden="true">❓</span>
        <span><strong>Quiz EcoEscola</strong><small>10 perguntas com explicações.</small></span>
        ${p?.done.quiz ? '<span class="badge badge--success">Concluído</span>' : ''}</a>
    </div>`;
}

export function render(root, ctx, [n]) {
  if (n === '1') return disposal(root, ctx);
  if (n === '2') return risk(root, ctx);
  if (n === '3') return schoolIdeas(root, ctx);
  return renderNotFound(root);
}

/** Tela final comum aos desafios com pontuação. */
async function finishScored(root, ctx, type, title, answers, score, total) {
  const status = await registerActivity(type, answers, { score, total });
  root.innerHTML = `
    <section class="card card--center">
      <h1 tabindex="-1">🏆 ${esc(title)}: concluído!</h1>
      <p class="score">${score} <small>de ${total}</small></p>
      <p>${score === total ? 'Perfeito! Você é um(a) guardião(ã) do ambiente!' : score >= total / 2 ? 'Muito bem! Revise as explicações para acertar todas.' : 'Bom começo! Que tal rever o conteúdo e tentar de novo?'}</p>
      ${statusNotice(STATUS_MESSAGES[status])}
      <div class="actions">
        <a class="btn btn--primary" href="#/desafios">Voltar aos desafios</a>
        <button class="btn btn--ghost" type="button" id="again">Jogar de novo</button>
      </div>
    </section>`;
  root.querySelector('#again').addEventListener('click', () => ctx.reload());
}

/* ---------------- Desafio 1 ---------------- */
function disposal(root, ctx) {
  const answers = {};
  let score = 0;

  function show(i) {
    if (i >= DISPOSAL_ITEMS.length) return finishScored(root, ctx, 'desafio1', 'Onde descartar?', answers, score, DISPOSAL_ITEMS.length);
    const item = DISPOSAL_ITEMS[i];
    root.innerHTML = `
      <section class="card">
        <h1 tabindex="-1">🗑️ Desafio 1 — Onde descartar?</h1>
        <p class="muted">${esc(byLevel(INTRO.desafio1, ctx.level))}</p>
        ${progressBar(i + 1, DISPOSAL_ITEMS.length, 'Itens')}
        <div class="item-card"><span class="item-card__icon" aria-hidden="true">${item.icon}</span><p class="item-card__name">${esc(item.name)}</p></div>
        <div class="bin-buttons" role="group" aria-label="Escolha a lixeira">
          ${BINS.map((b) => `<button type="button" class="bin-btn" data-bin="${b.id}" style="--bin:${b.color};--bin-text:${b.text}">
            <span aria-hidden="true">${b.icon}</span>${esc(b.label)}</button>`).join('')}
        </div>
        <div id="feedback" aria-live="assertive"></div>
      </section>`;
    root.querySelectorAll('.bin-btn').forEach((btn) => btn.addEventListener('click', () => {
      const chosen = btn.dataset.bin;
      answers[item.id] = chosen;
      const correct = chosen === item.bin;
      if (correct) score++;
      const right = BINS.find((b) => b.id === item.bin);
      root.querySelectorAll('.bin-btn').forEach((b) => {
        b.disabled = true;
        if (b.dataset.bin === item.bin) b.classList.add('is-correct');
        else if (b === btn) b.classList.add('is-wrong');
      });
      root.querySelector('#feedback').innerHTML = `
        ${notice(`<strong>${correct ? 'Correto!' : `Não foi dessa vez. O certo é: ${esc(right.label)}.`}</strong> ${esc(item.explain)}`, correct ? 'success' : 'error')}
        <div class="actions"><button class="btn btn--primary" type="button" id="next">${i + 1 < DISPOSAL_ITEMS.length ? 'Próximo →' : 'Ver resultado'}</button></div>`;
      root.querySelector('#next').addEventListener('click', () => show(i + 1));
      root.querySelector('#next').focus();
    }));
  }
  show(0);
}

/* ---------------- Desafio 2 ---------------- */
function risk(root, ctx) {
  const answers = {};
  let score = 0;

  function show(i) {
    if (i >= RISK_SITUATIONS.length) return finishScored(root, ctx, 'desafio2', 'Identifique o risco', answers, score, RISK_SITUATIONS.length);
    const s = RISK_SITUATIONS[i];
    root.innerHTML = `
      <section class="card">
        <h1 tabindex="-1">🔍 Desafio 2 — Identifique o risco</h1>
        <p class="muted">${esc(byLevel(INTRO.desafio2, ctx.level))}</p>
        ${progressBar(i + 1, RISK_SITUATIONS.length, 'Situações')}
        <figure class="situation">
          <img src="${esc(s.image)}" alt="Ilustração: ${esc(s.description)}" width="320" height="200">
          <figcaption><strong>${esc(s.title)}</strong><br>${esc(s.description)}</figcaption>
        </figure>
        <form id="rform" novalidate>
          <fieldset class="question"><legend class="question__text">Esta situação oferece risco para o ambiente ou para a saúde?</legend>
            <div class="options options--inline">
              <label class="option"><input type="radio" name="risk" value="yes"><span class="option__text">⚠️ Sim, há risco</span></label>
              <label class="option"><input type="radio" name="risk" value="no"><span class="option__text">👍 Não há risco</span></label>
            </div>
          </fieldset>
          <fieldset class="question"><legend class="question__text">O que deve ser feito?</legend>
            <div class="options">
              ${s.actions.map((a) => `<label class="option"><input type="radio" name="action" value="${esc(a.id)}"><span class="option__text">${esc(a.text)}</span></label>`).join('')}
            </div>
          </fieldset>
          <p class="field-error" id="rerror" aria-live="assertive"></p>
          <div class="actions"><button class="btn btn--primary" type="submit">Confirmar</button></div>
        </form>
        <div id="feedback" aria-live="assertive"></div>
      </section>`;
    const form = root.querySelector('#rform');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const r = form.risk.value;
      const a = form.action.value;
      if (!r || !a) {
        root.querySelector('#rerror').textContent = 'Responda as duas perguntas.';
        return;
      }
      const riskAnswer = r === 'yes';
      answers[s.id] = { risk: riskAnswer, action: a };
      const riskOk = riskAnswer === s.risk;
      const actionOk = a === s.action;
      if (riskOk && actionOk) score++;
      form.querySelectorAll('input, button').forEach((el) => { el.disabled = true; });
      const correctAction = s.actions.find((x) => x.id === s.action).text;
      root.querySelector('#feedback').innerHTML = `
        ${notice(`<strong>${riskOk && actionOk ? 'Muito bem!' : 'Quase!'}</strong>
          ${riskOk ? '' : `<br>${s.risk ? 'Esta situação <strong>tem risco</strong>.' : 'Esta situação <strong>não tem risco</strong>.'}`}
          ${actionOk ? '' : `<br>Melhor atitude: <strong>${esc(correctAction)}</strong>.`}
          <br>${esc(s.explain)}`, riskOk && actionOk ? 'success' : 'error')}
        <div class="actions"><button class="btn btn--primary" type="button" id="next">${i + 1 < RISK_SITUATIONS.length ? 'Próxima situação →' : 'Ver resultado'}</button></div>`;
      root.querySelector('#next').addEventListener('click', () => show(i + 1));
      root.querySelector('#next').focus();
    });
  }
  show(0);
}

/* ---------------- Desafio 3 ---------------- */
function schoolIdeas(root, ctx) {
  const p = ctx.participant;
  const checkboxes = (list, name) => list.map((o) => `<label class="check-chip">
      <input type="checkbox" name="${name}" value="${esc(o.id)}"><span><span aria-hidden="true">${o.icon}</span> ${esc(o.label)}</span></label>`).join('');

  root.innerHTML = `
    <section class="card">
      <h1 tabindex="-1">🏫 Desafio 3 — Minha escola mais sustentável</h1>
      <p>Olhe ao seu redor. Não existe resposta certa ou errada, e <strong>ninguém saberá quem respondeu</strong>.</p>
      ${p?.done.desafio3 ? notice('Você já enviou este desafio. Um novo envio não será registrado.', 'info') : ''}
      <form id="ideas" novalidate>
        <fieldset class="question"><legend class="question__text">1. Quais problemas você observa na sua escola?</legend>
          <div class="check-grid">${checkboxes(SCHOOL_PROBLEMS, 'problems')}</div></fieldset>
        <fieldset class="question"><legend class="question__text">2. Quais melhorias você sugere?</legend>
          <div class="check-grid">${checkboxes(SCHOOL_IMPROVEMENTS, 'improvements')}</div></fieldset>
        <div class="field">
          <label for="comment">3. Quer contar mais alguma ideia? (opcional)</label>
          <textarea id="comment" name="comment" maxlength="${COMMENT_MAX}" rows="3" aria-describedby="comment-help"></textarea>
          <p id="comment-help" class="muted"><span id="count">0</span>/${COMMENT_MAX} caracteres. <strong>Não escreva nomes, telefones ou outros dados pessoais.</strong></p>
        </div>
        <p class="field-error" id="ierror" aria-live="assertive"></p>
        <div class="actions"><button class="btn btn--primary" type="submit">Enviar minhas ideias</button></div>
      </form>
    </section>`;

  const form = root.querySelector('#ideas');
  form.comment.addEventListener('input', () => { root.querySelector('#count').textContent = form.comment.value.length; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const problems = [...form.querySelectorAll('[name=problems]:checked')].map((c) => c.value);
    const improvements = [...form.querySelectorAll('[name=improvements]:checked')].map((c) => c.value);
    const comment = form.comment.value.trim().slice(0, COMMENT_MAX);
    if (!problems.length && !improvements.length) {
      root.querySelector('#ierror').textContent = 'Marque pelo menos um problema ou uma melhoria.';
      return;
    }
    form.querySelector('button[type=submit]').disabled = true;
    const status = await registerActivity('desafio3', { problems, improvements, comment });
    root.innerHTML = `
      <section class="card card--center">
        <h1 tabindex="-1">💚 Obrigado pelas ideias!</h1>
        ${statusNotice(STATUS_MESSAGES[status])}
        <p>Você marcou ${problems.length} problema(s) e ${improvements.length} melhoria(s). As respostas de todos ajudam a planejar ações na escola.</p>
        <div class="actions"><a class="btn btn--primary" href="#/desafios">Voltar aos desafios</a></div>
      </section>`;
  });
}
