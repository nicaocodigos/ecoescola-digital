/** Configuração do nível de conteúdo de cada escola (salvo no servidor). */
import { apiCall } from '../../js/api.js';
import { SCHOOLS, SCHOOL_NAMES, LEVELS, LEVEL_NAMES } from '../../js/config.js';
import { toast } from '../../components/toast.js';

export function renderSettings(root, { token, config, onSaved, onUnauthorized }) {
  root.innerHTML = `
    <section class="panel">
      <h2>Nível de conteúdo por escola</h2>
      <p class="muted">Define a linguagem dos conteúdos, desafios, quiz e questionários. Os temas e objetivos são os mesmos nos três níveis.
        Participantes que já começaram mantêm o nível do início, para que inicial e final sejam comparáveis.</p>
      <form id="levels" class="form">
        ${SCHOOLS.map((s) => `<div class="field"><label for="lv-${s}">${SCHOOL_NAMES[s]}</label>
          <select id="lv-${s}" name="${s}">${LEVELS.map((l) => `<option value="${l}" ${config.levels[s] === l ? 'selected' : ''}>${LEVEL_NAMES[l]}</option>`).join('')}</select></div>`).join('')}
        <button class="btn btn--primary" type="submit">Salvar níveis</button>
      </form>
    </section>`;
  const form = root.querySelector('#levels');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const levels = Object.fromEntries(SCHOOLS.map((s) => [s, form[s].value]));
    const btn = form.querySelector('button');
    btn.disabled = true;
    try {
      const res = await apiCall('setConfig', { token, config: { levels } });
      toast('Níveis salvos.', 'success');
      onSaved(res.config);
    } catch (ex) {
      if (ex.code === 'unauthorized') return onUnauthorized();
      toast(ex.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
}
