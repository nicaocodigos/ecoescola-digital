/**
 * Minha jornada: geração/recuperação do código anônimo e roteiro das etapas.
 */
import { esc } from '../js/utils.js';
import { SCHOOL_NAMES, LEVEL_NAMES, LEVELS } from '../js/config.js';
import { createParticipant, adoptParticipant, clearParticipant, normalizeCode, isFinished } from '../js/participant.js';
import { registerActivity } from '../js/results.js';
import { apiCall } from '../js/api.js';
import { pendingCount } from '../js/outbox.js';
import { notice, blocker } from '../components/ui.js';
import { toast } from '../components/toast.js';

export const STEPS = [
  { types: ['pre'], icon: '📝', label: 'Questionário inicial', desc: 'Mostre o que você já sabe (10 questões).', href: '#/questionario/inicial' },
  { types: ['conteudo_ambiente'], icon: '🌱', label: 'Meio Ambiente', desc: 'Sustentabilidade, reciclagem e descarte.', href: '#/meio-ambiente' },
  { types: ['conteudo_saude'], icon: '🩺', label: 'Saúde', desc: 'Ambiente, saúde e prevenção da dengue.', href: '#/saude' },
  { types: ['desafio1', 'desafio2', 'desafio3'], icon: '🎯', label: 'Desafios', desc: 'Três atividades práticas.', href: '#/desafios' },
  { types: ['quiz'], icon: '❓', label: 'Quiz', desc: '10 perguntas com explicações.', href: '#/quiz' },
  { types: ['post'], icon: '🏁', label: 'Questionário final', desc: 'Veja o quanto você aprendeu.', href: '#/questionario/final', requires: 'pre' },
];

export function render(root, ctx) {
  if (!ctx.school) {
    root.innerHTML = blocker(
      'Acesse pelo QR Code da sua escola',
      '<p>Para registrar sua participação, abra o EcoEscola Digital pelo QR Code fixado na sua escola. Assim sabemos de qual escola são as respostas, sem pedir seus dados.</p><p>Enquanto isso, você pode explorar os conteúdos.</p>',
      '<a class="btn btn--primary" href="#/meio-ambiente">Explorar conteúdos</a>',
    );
    return;
  }
  const p = ctx.participant;
  if (!p) return renderStart(root, ctx);
  return renderSteps(root, ctx, p);
}

function renderStart(root, ctx) {
  root.innerHTML = `
    <section class="card">
      <h1 tabindex="-1">Minha jornada</h1>
      <p>Você vai receber um <strong>código secreto</strong>. Ele substitui o seu nome: assim ligamos seu questionário inicial ao final sem saber quem você é.</p>
      <div class="actions">
        <button class="btn btn--primary btn--lg" id="new-code" type="button">Gerar meu código</button>
      </div>
    </section>
    <section class="card">
      <h2>Já tenho um código</h2>
      <p>Use esta opção se você já começou em outro aparelho ou recebeu um código na folha impressa.</p>
      <form id="adopt-form" class="form" novalidate>
        <label for="code-input">Código (ex.: ${esc(ctx.school)}-7KX3Q)</label>
        <input id="code-input" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8" inputmode="text" required aria-describedby="code-error">
        <p id="code-error" class="field-error" aria-live="polite"></p>
        <button class="btn btn--secondary" type="submit">Continuar com este código</button>
      </form>
    </section>`;

  root.querySelector('#new-code').addEventListener('click', () => {
    createParticipant(ctx.school, ctx.level);
    registerActivity('start'); // registra o início da participação (sem bloquear a tela)
    ctx.reload();
    toast('Código gerado! Anote-o antes de continuar.', 'success');
  });

  const form = root.querySelector('#adopt-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = form.querySelector('#code-error');
    const btn = form.querySelector('button');
    const code = normalizeCode(form.code.value);
    err.textContent = '';
    if (!code) {
      err.textContent = 'Código inválido. Ele tem uma letra da escola e 5 caracteres (ex.: A-7KX3Q).';
      form.code.focus();
      return;
    }
    if (code[0] !== ctx.school) {
      err.textContent = `Este código é da ${SCHOOL_NAMES[code[0]]}. Use o QR Code da sua própria escola.`;
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Verificando…';
    try {
      const st = await apiCall('status', { code });
      const level = LEVELS.includes(st.level) ? st.level : ctx.level;
      const results = {};
      for (const [t, r] of Object.entries(st.results || {})) results[t] = r;
      adoptParticipant(code, ctx.school, level, st.types, results);
      toast(st.types.length ? 'Código encontrado! Continue de onde parou.' : 'Código aceito.', 'success');
    } catch (ex) {
      if (!ex.retryable) {
        err.textContent = ex.message;
        btn.disabled = false;
        btn.textContent = 'Continuar com este código';
        return;
      }
      // Sem conexão: aceita o código; o servidor evita registros duplicados depois.
      adoptParticipant(code, ctx.school, ctx.level);
      toast('Sem conexão para verificar o código. Ele foi aceito e será conferido no envio.', 'warning', 7000);
    }
    ctx.reload();
  });
}

function stepState(step, p) {
  const doneCount = step.types.filter((t) => p.done[t]).length;
  if (doneCount === step.types.length) return 'done';
  if (step.requires && !p.done[step.requires]) return 'locked';
  return doneCount > 0 ? 'partial' : 'todo';
}

function renderSteps(root, ctx, p) {
  const finished = isFinished(p);
  const pending = pendingCount();
  const next = STEPS.find((s) => stepState(s, p) !== 'done' && stepState(s, p) !== 'locked');
  const pre = p.results.pre;
  const post = p.results.post;

  root.innerHTML = `
    <section class="card code-card">
      <h1 tabindex="-1">Minha jornada</h1>
      <p>Seu código de participante:</p>
      <p class="code-display" id="code-value" aria-label="Código ${esc(p.code.split('').join(' '))}">${esc(p.code)}</p>
      <p class="muted">Anote este código. Você vai precisar dele se trocar de aparelho. ${esc(SCHOOL_NAMES[p.school])} · ${esc(LEVEL_NAMES[p.level])}</p>
      <button class="btn btn--ghost btn--sm" id="copy-code" type="button">Copiar código</button>
    </section>

    ${pending ? notice(`${pending} resultado(s) aguardando conexão para envio. Eles estão guardados neste aparelho.`, 'warning') : ''}

    ${finished ? `
      <section class="card card--success">
        <h2>🎉 Parabéns! Você concluiu a jornada EcoEscola!</h2>
        ${pre && post ? `<p>Questionário inicial: <strong>${pre.score}/${pre.total}</strong> → final: <strong>${post.score}/${post.total}</strong>.</p>` : ''}
        <p>Obrigado por participar. Continue colocando em prática o que aprendeu!</p>
      </section>` : ''}

    <ol class="steps">
      ${STEPS.map((s, i) => {
        const st = stepState(s, p);
        const labels = { done: '✔ Concluído', partial: 'Em andamento', todo: 'A fazer', locked: '🔒 Faça o questionário inicial primeiro' };
        const action = st === 'locked'
          ? `<span class="btn btn--disabled" aria-disabled="true">Bloqueado</span>`
          : `<a class="btn ${s === next ? 'btn--primary' : 'btn--secondary'} btn--sm" href="${s.href}">${st === 'done' ? 'Rever' : 'Abrir'}</a>`;
        return `<li class="step step--${st}">
          <span class="step__num" aria-hidden="true">${st === 'done' ? '✓' : i + 1}</span>
          <div class="step__body">
            <h2 class="step__title"><span aria-hidden="true">${s.icon}</span> ${esc(s.label)}</h2>
            <p class="step__desc">${esc(s.desc)}</p>
            <p class="step__status">${labels[st]}${s.types.length > 1 ? ` (${s.types.filter((t) => p.done[t]).length}/${s.types.length})` : ''}</p>
          </div>
          ${action}
        </li>`;
      }).join('')}
    </ol>

    <section class="card card--muted">
      <h2>Aparelho compartilhado?</h2>
      <p>Se outra pessoa vai usar este aparelho, anote seu código e troque de participante.</p>
      <button class="btn btn--ghost" id="switch" type="button">Trocar de participante</button>
    </section>`;

  root.querySelector('#copy-code').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(p.code);
      toast('Código copiado.', 'success');
    } catch {
      toast(`Seu código é ${p.code}. Anote-o.`, 'info');
    }
  });

  root.querySelector('#switch').addEventListener('click', () => {
    const warn = pendingCount() ? '\n\nAtenção: há resultados aguardando envio; eles continuarão guardados e serão enviados.' : '';
    if (!confirm(`Anotou seu código ${p.code}? Ao trocar, este aparelho fica livre para outra pessoa.${warn}`)) return;
    clearParticipant();
    toast('Pronto! O próximo participante pode gerar um novo código.', 'success');
    ctx.reload();
  });
}

/** Usado por outras páginas: o participante já fez o questionário inicial? */
export function preNotice(ctx) {
  const p = ctx.participant;
  if (p && !p.done.pre && !isFinished(p)) {
    return notice('Antes de estudar, responda o <a href="#/questionario/inicial">questionário inicial</a>. Ele mostra o que você já sabe e não vale nota.', 'warning');
  }
  return '';
}
