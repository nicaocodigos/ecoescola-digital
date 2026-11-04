/**
 * Painel administrativo.
 * A senha é verificada SOMENTE no servidor (Apps Script). O navegador guarda apenas
 * um token temporário (6 h) em sessionStorage, apagado ao fechar a aba ou clicar em "Sair".
 */
import { apiCall } from './api.js';
import { API_CONFIGURED } from './config.js';
import { esc } from './utils.js';
import { renderDashboard } from '../pages/admin/dashboard.js';
import { renderEntry } from '../pages/admin/entry.js';
import { renderSettings } from '../pages/admin/settings.js';
import { renderExports } from '../pages/admin/exports.js';
import { destroyCharts } from '../components/charts.js';
import { toast } from '../components/toast.js';

const TOKEN_KEY = 'eco:adminToken';
const root = document.getElementById('admin');

const state = { token: sessionStorage.getItem(TOKEN_KEY), records: [], config: null, generatedAt: null, scope: null, tab: 'painel' };

const TABS = { painel: 'Painel', papel: 'Lançar respostas em papel', config: 'Configurações', exportar: 'Exportar' };

function logoutLocal(message) {
  sessionStorage.removeItem(TOKEN_KEY);
  state.token = null;
  renderLogin(message);
}

function renderLogin(message = '') {
  destroyCharts();
  root.innerHTML = `
    <main class="login">
      <form id="login" class="card" novalidate>
        <img src="assets/img/logo.svg" alt="" width="56" height="56">
        <h1>Painel EcoEscola</h1>
        <p class="muted">Acesso exclusivo da equipe do projeto.</p>
        ${!API_CONFIGURED ? '<div class="notice notice--warning"><div>A URL do Apps Script ainda não foi configurada em js/config.js.</div></div>' : ''}
        <label for="password">Senha</label>
        <input id="password" type="password" autocomplete="current-password" required>
        <p class="field-error" id="login-error" aria-live="assertive">${esc(message)}</p>
        <button class="btn btn--primary" type="submit">Entrar</button>
        <p class="small"><a href="./">← Voltar ao site</a></p>
      </form>
    </main>`;
  const form = root.querySelector('#login');
  form.password.focus();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = root.querySelector('#login-error');
    if (!form.password.value) { err.textContent = 'Digite a senha.'; return; }
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Entrando…';
    try {
      const res = await apiCall('login', { password: form.password.value });
      state.token = res.token;
      sessionStorage.setItem(TOKEN_KEY, res.token);
      await loadData();
    } catch (ex) {
      err.textContent = ex.message;
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}

async function loadData() {
  root.innerHTML = '<main class="login"><p class="card">Carregando dados…</p></main>';
  try {
    const res = await apiCall('adminData', { token: state.token }, { timeoutMs: 45000 });
    state.records = res.records;
    state.config = res.config;
    state.generatedAt = res.generatedAt;
    renderApp();
  } catch (ex) {
    if (ex.code === 'unauthorized') return logoutLocal('Sessão expirada. Entre novamente.');
    root.innerHTML = `<main class="login"><div class="card"><h1>Não foi possível carregar os dados</h1>
      <p>${esc(ex.message)}</p><button class="btn btn--primary" id="retry" type="button">Tentar novamente</button></div></main>`;
    root.querySelector('#retry').addEventListener('click', loadData);
  }
}

function renderApp() {
  root.innerHTML = `
    <header class="admin-bar">
      <a class="brand" href="./"><img src="assets/img/logo.svg" alt="" width="32" height="32"><span>EcoEscola <strong>Painel</strong></span></a>
      <div class="admin-bar__actions">
        <button class="btn btn--ghost btn--sm" id="refresh" type="button">↻ Atualizar dados</button>
        <button class="btn btn--ghost btn--sm" id="logout" type="button">Sair</button>
      </div>
    </header>
    <nav class="tabs" role="tablist" aria-label="Seções do painel">
      ${Object.entries(TABS).map(([k, v]) => `<button role="tab" type="button" data-tab="${k}" aria-selected="${k === state.tab}" class="${k === state.tab ? 'active' : ''}">${v}</button>`).join('')}
    </nav>
    <main id="tab-body" class="admin-main" role="tabpanel"></main>`;

  root.querySelector('#refresh').addEventListener('click', loadData);
  root.querySelector('#logout').addEventListener('click', async () => {
    try { await apiCall('logout', { token: state.token }); } catch { /* sai mesmo sem conexão */ }
    logoutLocal('Você saiu do painel.');
  });
  root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
    state.tab = b.dataset.tab;
    root.querySelectorAll('[data-tab]').forEach((x) => {
      x.classList.toggle('active', x === b);
      x.setAttribute('aria-selected', String(x === b));
    });
    renderTab();
  }));
  renderTab();
}

function renderTab() {
  destroyCharts();
  const body = root.querySelector('#tab-body');
  const common = {
    token: state.token,
    config: state.config,
    onUnauthorized: () => logoutLocal('Sessão expirada. Entre novamente.'),
  };
  if (state.tab === 'painel') {
    renderDashboard(body, {
      records: state.records, scope: state.scope, config: state.config, generatedAt: state.generatedAt,
      onScope: (s) => { state.scope = s; renderTab(); },
    });
  } else if (state.tab === 'papel') {
    renderEntry(body, { ...common, onSaved: () => toast('Clique em “Atualizar dados” para ver no painel.', 'info') });
  } else if (state.tab === 'config') {
    renderSettings(body, { ...common, onSaved: (cfg) => { state.config = cfg; } });
  } else {
    renderExports(body, { records: state.records });
  }
}

if (state.token) loadData();
else renderLogin();
