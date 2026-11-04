/** Área educativa: Saúde (ambiente e saúde, prevenção da dengue). */
import { HEALTH_TOPICS, HEALTH_DISCLAIMER } from '../js/data/content.js';
import { esc } from '../js/utils.js';
import { mountTopics } from '../components/topics.js';
import { notice } from '../components/ui.js';
import { preNotice } from './journey.js';

export function render(root, ctx) {
  root.innerHTML = `
    <header class="page-head page-head--health">
      <span class="page-head__icon" aria-hidden="true">🩺</span>
      <div><h1 tabindex="-1">Saúde</h1><p>Ambiente limpo é ambiente saudável. Aprenda a prevenir a dengue.</p></div>
    </header>
    ${preNotice(ctx)}
    ${notice(esc(HEALTH_DISCLAIMER), 'info')}
    <p class="muted" data-read-count></p>
    <div class="topics" data-topics></div>
    <p class="source">Fontes: Ministério da Saúde e Fundação Oswaldo Cruz (Fiocruz).</p>
    <div class="finish">
      <button class="btn btn--primary" type="button" data-finish>Concluir leitura</button>
      <a class="btn btn--secondary" href="#/desafios">Ir para os desafios →</a>
      <div data-finish-status aria-live="polite"></div>
    </div>`;
  mountTopics(root, HEALTH_TOPICS, ctx.level, 'conteudo_saude', ctx);
}
