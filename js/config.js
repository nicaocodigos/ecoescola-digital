/**
 * Configuração pública da aplicação.
 *
 * ATENÇÃO: este arquivo é público (vai para o navegador).
 * NUNCA coloque senhas ou tokens aqui. A senha do painel administrativo
 * fica somente nas "Propriedades do script" do Google Apps Script.
 */

/** URL do Web App do Google Apps Script (termina em /exec). Substitua após publicar. */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2ukiClE9Eg74dqOKi6MRIHIyG11OW5SU5Z_7pbxjIUzpJAF394o2FjTBzNa2WnhVX/exec';

const isLocalhost = ['localhost', '127.0.0.1'].includes(globalThis.location?.hostname);

/** Em localhost usa o servidor de desenvolvimento (tools/dev-server.mjs). */
export const API_URL = isLocalhost ? '/api' : APPS_SCRIPT_URL;

export const API_CONFIGURED = isLocalhost || !APPS_SCRIPT_URL.includes('COLE_AQUI');

/** Identificadores aceitos no parâmetro ?escola= */
export const SCHOOLS = ['A', 'B', 'C'];

export const SCHOOL_NAMES = { A: 'Escola A', B: 'Escola B', C: 'Escola C' };

/** Níveis de linguagem */
export const LEVELS = ['f1', 'f2', 'em'];

export const LEVEL_NAMES = { f1: 'Fundamental I', f2: 'Fundamental II', em: 'Ensino Médio' };

/** Nível usado quando a configuração remota ainda não foi carregada. */
export const DEFAULT_LEVEL = 'f2';
