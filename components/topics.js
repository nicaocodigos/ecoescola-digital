/**
 * Renderização dos tópicos educativos (acordeões acessíveis com <details>),
 * com texto adaptado ao nível e blocos interativos opcionais.
 */
import { esc, byLevel } from '../js/utils.js';
import { BINS } from '../js/data/challenges.js';
import { BREEDING_CHECKLIST } from '../js/data/content.js';
import { registerActivity, STATUS_MESSAGES } from '../js/results.js';
import { statusNotice } from './ui.js';

export function binsLegend() {
  return `<ul class="bins" aria-label="Cores da coleta seletiva">
    ${BINS.map((b) => `<li class="bin" style="--bin:${b.color};--bin-text:${b.text}">
      <span class="bin__icon" aria-hidden="true">${b.icon}</span><span>${esc(b.label)}</span></li>`).join('')}
  </ul>`;
}

function sortGame(items) {
  return `<div class="sort-game">
    <p><strong>Teste rápido:</strong> toque em cada item para descobrir se é reciclável.</p>
    <div class="grid grid--2">
      ${items.map((it, i) => `<button type="button" class="flip" data-flip="${i}" aria-pressed="false">
        <span class="flip__front">${esc(it.name)}<small>Toque para ver</small></span>
        <span class="flip__back ${it.recyclable ? 'is-yes' : 'is-no'}" hidden>${it.recyclable ? '♻️ Reciclável' : '🚫 Não reciclável'}</span>
      </button>`).join('')}
    </div>
  </div>`;
}

function checklist() {
  return `<div class="checklist-box">
    <p><strong>Vistoria semanal:</strong> marque o que você conferiu na escola ou em casa.</p>
    <ul class="check-list">
      ${BREEDING_CHECKLIST.map((item, i) => `<li><label><input type="checkbox" data-check="${i}"> ${esc(item)}</label></li>`).join('')}
    </ul>
    <p class="check-result" aria-live="polite"></p>
  </div>`;
}

function topicCard(t, level, i) {
  const examples = byLevel(t.examples, level);
  return `<details class="topic" ${i === 0 ? 'open' : ''}>
    <summary><span class="topic__icon" aria-hidden="true">${t.icon}</span><span class="topic__title">${esc(t.title)}</span></summary>
    <div class="topic__body">
      <p>${esc(byLevel(t.text, level))}</p>
      ${examples ? `<ul class="chips">${examples.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}
      ${t.showBins ? binsLegend() : ''}
      ${t.sortGame ? sortGame(t.sortGame) : ''}
      ${t.checklist ? checklist() : ''}
      ${t.fact ? `<p class="fact"><span aria-hidden="true">💡</span> <strong>Você sabia?</strong> ${esc(t.fact)}</p>` : ''}
    </div>
  </details>`;
}

/**
 * @param {HTMLElement} root
 * @param {object[]} topics
 * @param {string} level
 * @param {string} activityType 'conteudo_ambiente' | 'conteudo_saude'
 * @param {object} ctx
 */
export function mountTopics(root, topics, level, activityType, ctx) {
  const list = root.querySelector('[data-topics]');
  list.innerHTML = topics.map((t, i) => topicCard(t, level, i)).join('');

  const opened = new Set([0]);
  const counter = root.querySelector('[data-read-count]');
  const updateCounter = () => { counter.textContent = `${opened.size} de ${topics.length} tópicos abertos`; };
  list.querySelectorAll('details').forEach((d, i) => d.addEventListener('toggle', () => {
    if (d.open) opened.add(i);
    updateCounter();
  }));
  updateCounter();

  list.addEventListener('click', (e) => {
    const flip = e.target.closest('[data-flip]');
    if (!flip) return;
    const showBack = flip.getAttribute('aria-pressed') !== 'true';
    flip.setAttribute('aria-pressed', String(showBack));
    flip.querySelector('.flip__front').hidden = showBack;
    flip.querySelector('.flip__back').hidden = !showBack;
  });

  list.addEventListener('change', (e) => {
    if (!e.target.matches('[data-check]')) return;
    const boxes = [...list.querySelectorAll('[data-check]')];
    const n = boxes.filter((b) => b.checked).length;
    list.querySelector('.check-result').textContent = n === boxes.length
      ? '🏆 Vistoria completa! Repita toda semana.'
      : `${n} de ${boxes.length} itens conferidos.`;
  });

  const btn = root.querySelector('[data-finish]');
  const status = root.querySelector('[data-finish-status]');
  const p = ctx.participant;
  if (p?.done[activityType]) {
    btn.textContent = '✔ Leitura concluída';
    btn.disabled = true;
  }
  btn.addEventListener('click', async () => {
    if (opened.size < topics.length && !confirm(`Você abriu ${opened.size} de ${topics.length} tópicos. Deseja concluir mesmo assim?`)) return;
    btn.disabled = true;
    const result = await registerActivity(activityType);
    status.innerHTML = statusNotice(STATUS_MESSAGES[result]);
    btn.textContent = result === 'practice' ? 'Concluir leitura' : '✔ Leitura concluída';
    if (result === 'practice') btn.disabled = false;
  });
}
