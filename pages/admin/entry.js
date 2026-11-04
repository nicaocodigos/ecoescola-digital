/**
 * Lançamento das respostas das folhas impressas (alternativa sem internet).
 * Os registros entram com origem "papel" e passam pela mesma validação e pontuação do servidor.
 */
import { apiCall } from '../../js/api.js';
import { esc, uuid, LETTERS } from '../../js/utils.js';
import { SCHOOLS, SCHOOL_NAMES, LEVELS, LEVEL_NAMES } from '../../js/config.js';
import { ASSESSMENT } from '../../js/data/assessment.js';
import { QUIZ } from '../../js/data/quiz.js';
import { normalizeCode } from '../../js/participant.js';
import { toast } from '../../components/toast.js';

const TYPES = { pre: 'Questionário inicial', post: 'Questionário final', quiz: 'Quiz' };

export function renderEntry(root, { token, config, onSaved, onUnauthorized }) {
  root.innerHTML = `
    <section class="panel">
      <h2>Lançar respostas em papel</h2>
      <p class="muted">Digite exatamente o que o estudante marcou na folha. O código anônimo deve ser o mesmo nas folhas inicial e final.</p>
      <form id="entry" class="form" novalidate>
        <div class="form-row">
          <div class="field"><label for="e-school">Escola</label>
            <select id="e-school">${SCHOOLS.map((s) => `<option value="${s}">${SCHOOL_NAMES[s]}</option>`).join('')}</select></div>
          <div class="field"><label for="e-level">Nível da folha</label>
            <select id="e-level">${LEVELS.map((l) => `<option value="${l}">${LEVEL_NAMES[l]}</option>`).join('')}</select></div>
          <div class="field"><label for="e-type">Atividade</label>
            <select id="e-type">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
          <div class="field"><label for="e-code">Código do participante</label>
            <input id="e-code" autocomplete="off" maxlength="8" placeholder="A-7KX3Q" required></div>
        </div>
        <div id="e-questions"></div>
        <p class="field-error" id="e-error" aria-live="assertive"></p>
        <button class="btn btn--primary" type="submit">Salvar folha</button>
      </form>
    </section>`;

  const form = root.querySelector('#entry');
  const qbox = root.querySelector('#e-questions');
  const err = root.querySelector('#e-error');

  const questions = () => (form['e-type'].value === 'quiz' ? QUIZ : ASSESSMENT)[form['e-level'].value];

  function drawQuestions() {
    qbox.innerHTML = `<div class="entry-grid">${questions().map((q, i) => `
      <fieldset class="entry-q"><legend title="${esc(q.text)}">${i + 1}. ${esc(q.text.length > 70 ? q.text.slice(0, 70) + '…' : q.text)}</legend>
        ${q.options.map((_, j) => `<label><input type="radio" name="${q.id}" value="${j}" required> ${LETTERS[j]}</label>`).join('')}
      </fieldset>`).join('')}</div>`;
  }

  form['e-school'].addEventListener('change', () => {
    form['e-level'].value = config.levels[form['e-school'].value];
    drawQuestions();
  });
  form['e-level'].addEventListener('change', drawQuestions);
  form['e-type'].addEventListener('change', drawQuestions);
  form['e-level'].value = config.levels[form['e-school'].value];
  drawQuestions();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    const school = form['e-school'].value;
    const code = normalizeCode(form['e-code'].value);
    if (!code) { err.textContent = 'Código inválido (formato: letra da escola + 5 caracteres, ex.: A-7KX3Q).'; return; }
    if (code[0] !== school) { err.textContent = `O código ${code} não pertence à ${SCHOOL_NAMES[school]}.`; return; }
    const answers = {};
    const missing = [];
    questions().forEach((q, i) => {
      const checked = form.querySelector(`input[name="${q.id}"]:checked`);
      if (checked) answers[q.id] = Number(checked.value);
      else missing.push(i + 1);
    });
    if (missing.length) { err.textContent = `Faltam respostas nas questões: ${missing.join(', ')}.`; return; }

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const res = await apiCall('adminSubmit', {
        token,
        data: { submissionId: uuid(), type: form['e-type'].value, school, level: form['e-level'].value, participantCode: code, answers, clientTime: new Date().toISOString() },
      });
      if (res.status === 'saved') {
        toast(`Folha salva: ${code} — ${res.score}/${res.total}.`, 'success');
        form['e-code'].value = '';
        drawQuestions();
        onSaved();
      } else {
        err.textContent = `Já existe ${TYPES[form['e-type'].value].toLowerCase()} registrado para ${code}. Nada foi alterado.`;
      }
    } catch (ex) {
      if (ex.code === 'unauthorized') return onUnauthorized();
      err.textContent = ex.message;
    } finally {
      btn.disabled = false;
    }
  });
}
