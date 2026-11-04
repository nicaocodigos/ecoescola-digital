/**
 * Ponto de entrada da área do estudante.
 * Ordem: identificar escola → montar layout → iniciar rotas → sincronizar config e fila de envios.
 */
import { createRouter } from './router.js';
import { resolveSchool, effectiveLevel, refreshLevels } from './school.js';
import { getParticipant } from './participant.js';
import { startAutoFlush } from './outbox.js';
import { API_CONFIGURED, SCHOOL_NAMES } from './config.js';
import { renderShell, updateShell, setGlobalNotice } from '../components/shell.js';
import { notice } from '../components/ui.js';

import * as home from '../pages/home.js';
import * as journey from '../pages/journey.js';
import * as assessment from '../pages/assessment.js';
import * as environment from '../pages/environment.js';
import * as health from '../pages/health.js';
import * as challenges from '../pages/challenges.js';
import * as quiz from '../pages/quiz.js';
import * as print from '../pages/print.js';

const { school, conflict } = resolveSchool();
const main = renderShell(document.getElementById('app'));

/** Contexto compartilhado com as páginas. */
const ctx = {
  school,
  get level() { return effectiveLevel(this.school); },
  get participant() { return getParticipant(); },
  go: (path) => router.go(path),
  reload: () => router.reload(),
};

const routes = [
  { path: '/', title: 'Início', page: home.render },
  { path: '/privacidade', title: 'Privacidade', page: home.renderPrivacy },
  { path: '/jornada', title: 'Minha jornada', page: journey.render },
  { path: '/questionario/:tipo', title: 'Questionário', page: assessment.render },
  { path: '/meio-ambiente', title: 'Meio Ambiente', page: environment.render },
  { path: '/saude', title: 'Saúde', page: health.render },
  { path: '/desafios', title: 'Desafios', page: challenges.renderHub },
  { path: '/desafios/:n', title: 'Desafio', page: challenges.render },
  { path: '/quiz', title: 'Quiz', page: quiz.render },
  { path: '/imprimir', title: 'Versão para impressão', page: print.render },
];
const notFound = { title: 'Página não encontrada', page: home.renderNotFound };

let cleanup = null;
const router = createRouter(routes, notFound, ({ route, params, path }) => {
  if (typeof cleanup === 'function') cleanup();
  main.innerHTML = '';
  cleanup = route.page(main, ctx, params);
  document.title = `${route.title} · EcoEscola Digital`;
  updateShell(path, { school: ctx.school, level: ctx.level });
  window.scrollTo(0, 0);
  // Acessibilidade: leva o foco ao título da nova página.
  (main.querySelector('h1') || main).focus({ preventScroll: true });
});

// Avisos globais
const notices = [];
if (!API_CONFIGURED) {
  notices.push(notice('A base de dados ainda não foi configurada (js/config.js). As respostas ficam guardadas apenas neste aparelho até a configuração.', 'warning'));
}
if (conflict) {
  notices.push(notice(`Este aparelho tem uma atividade em andamento da <strong>${SCHOOL_NAMES[school]}</strong>. O link da ${SCHOOL_NAMES[conflict]} foi ignorado. Para trocar, conclua a atividade ou use “Trocar de participante” em Minha jornada.`, 'warning'));
}
setGlobalNotice(notices.length
  ? `${notices.join('')}<p class="notice-close"><button type="button" class="btn btn--ghost btn--sm" id="close-notice">Entendi, fechar aviso</button></p>`
  : '');
document.getElementById('close-notice')?.addEventListener('click', () => setGlobalNotice(''));

router.start();
startAutoFlush();

// Atualiza o nível configurado pelo administrador sem bloquear a abertura do site.
refreshLevels().then(() => {
  if (!ctx.participant) router.reload();
});
