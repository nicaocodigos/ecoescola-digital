/** Área educativa: Meio Ambiente. */
import { ENVIRONMENT_TOPICS } from '../js/data/content.js';
import { mountTopics } from '../components/topics.js';
import { preNotice } from './journey.js';

export function render(root, ctx) {
  root.innerHTML = `
    <header class="page-head page-head--env">
      <span class="page-head__icon" aria-hidden="true">🌱</span>
      <div><h1 tabindex="-1">Meio Ambiente</h1><p>Como nossas escolhas do dia a dia cuidam do planeta e da escola.</p></div>
    </header>
    ${preNotice(ctx)}
    <p class="muted" data-read-count></p>
    <div class="topics" data-topics></div>
    <div class="finish">
      <button class="btn btn--primary" type="button" data-finish>Concluir leitura</button>
      <a class="btn btn--secondary" href="#/saude">Próxima área: Saúde →</a>
      <div data-finish-status aria-live="polite"></div>
    </div>`;
  mountTopics(root, ENVIRONMENT_TOPICS, ctx.level, 'conteudo_ambiente', ctx);
}
