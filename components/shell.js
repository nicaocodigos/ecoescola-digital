/** Cabeçalho, navegação inferior (mobile) e rodapé da área do estudante. */
import { esc } from '../js/utils.js';
import { SCHOOL_NAMES, LEVEL_NAMES } from '../js/config.js';
import { onQueueChange, flush } from '../js/outbox.js';

const NAV = [
  { href: '#/', icon: '🏠', label: 'Início', match: /^\/$/ },
  { href: '#/jornada', icon: '🧭', label: 'Jornada', match: /^\/(jornada|questionario)/ },
  { href: '#/meio-ambiente', icon: '🌱', label: 'Ambiente', match: /^\/meio-ambiente/ },
  { href: '#/saude', icon: '🩺', label: 'Saúde', match: /^\/saude/ },
  { href: '#/desafios', icon: '🎯', label: 'Desafios', match: /^\/(desafios|quiz)/ },
];

export function renderShell(root) {
  root.innerHTML = `
    <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header class="topbar">
      <a class="brand" href="#/" aria-label="EcoEscola Digital, página inicial">
        <img src="assets/img/logo.svg" alt="" width="36" height="36">
        <span>EcoEscola <strong>Digital</strong></span>
      </a>
      <div class="topbar__info">
        <span id="school-badge" class="badge"></span>
        <button id="sync-badge" class="badge badge--warning" type="button" hidden></button>
      </div>
    </header>
    <div id="global-notice"></div>
    <main id="conteudo" class="container" tabindex="-1"></main>
    <footer class="footer">
      <p>EcoEscola Digital · Itinerário Extensionista ADS · Universidade Cruzeiro do Sul · Eixo Meio Ambiente e Saúde</p>
      <p><a href="#/imprimir">Versão para impressão</a> · <a href="#/privacidade">Privacidade</a></p>
    </footer>
    <nav class="bottom-nav" aria-label="Navegação principal">
      ${NAV.map((n) => `<a href="${n.href}" data-match="${n.match.source}"><span aria-hidden="true">${n.icon}</span>${esc(n.label)}</a>`).join('')}
    </nav>`;

  const syncBadge = root.querySelector('#sync-badge');
  syncBadge.addEventListener('click', async () => {
    syncBadge.disabled = true;
    await flush();
    syncBadge.disabled = false;
  });
  onQueueChange((pending) => {
    syncBadge.hidden = pending === 0;
    syncBadge.textContent = `⏳ ${pending} envio(s) pendente(s) · tentar agora`;
  });

  return root.querySelector('#conteudo');
}

export function updateShell(path, { school, level }) {
  document.querySelectorAll('.bottom-nav a').forEach((a) => {
    const active = new RegExp(a.dataset.match).test(path);
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const badge = document.getElementById('school-badge');
  badge.textContent = school ? `${SCHOOL_NAMES[school]} · ${LEVEL_NAMES[level]}` : 'Escola não identificada';
  badge.classList.toggle('badge--muted', !school);
}

export function setGlobalNotice(html) {
  document.getElementById('global-notice').innerHTML = html;
}
