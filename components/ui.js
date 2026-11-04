/** Pequenos blocos de HTML reutilizados pelas páginas. Todo texto dinâmico passa por esc(). */
import { esc } from '../js/utils.js';

/** Barra de progresso acessível. */
export function progressBar(current, total, label = 'Progresso') {
  const pct = total ? Math.round((current / total) * 100) : 0;
  return `
    <div class="progress" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${current}">
      <div class="progress__bar" style="width:${pct}%"></div>
    </div>
    <p class="progress__text">${current} de ${total}</p>`;
}

/** Caixa de aviso. type: info | success | warning | error */
export function notice(html, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  return `<div class="notice notice--${type}" role="${type === 'error' ? 'alert' : 'note'}">
    <span class="notice__icon" aria-hidden="true">${icons[type]}</span><div>${html}</div></div>`;
}

/** Mensagem de status de envio. */
export function statusNotice(message) {
  return notice(esc(message.text), message.type);
}

/**
 * Alternativas de uma questão como botões grandes de rádio (fáceis de tocar no celular).
 * @param {{ id:string, text:string, options:string[] }} q
 * @param {number|null} selected
 */
export function optionsFieldset(q, selected = null, { disabled = false, correct = null, legendPrefix = '' } = {}) {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const opts = q.options
    .map((opt, i) => {
      let state = '';
      if (correct != null) {
        if (i === correct) state = ' option--correct';
        else if (i === selected) state = ' option--wrong';
      }
      return `<label class="option${state}">
        <input type="radio" name="q-${esc(q.id)}" value="${i}" ${selected === i ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
        <span class="option__letter" aria-hidden="true">${letters[i]}</span>
        <span class="option__text">${esc(opt)}</span>
      </label>`;
    })
    .join('');
  return `<fieldset class="question">
      <legend class="question__text">${legendPrefix}${esc(q.text)}</legend>
      <div class="options">${opts}</div>
    </fieldset>`;
}

/** Tela de bloqueio com ação (ex.: "acesse pelo QR Code"). */
export function blocker(title, html, actions = '') {
  return `<section class="card card--center">
    <h1 tabindex="-1">${esc(title)}</h1>
    <div class="stack">${html}</div>
    ${actions ? `<div class="actions">${actions}</div>` : ''}
  </section>`;
}
