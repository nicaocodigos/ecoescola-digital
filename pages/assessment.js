/**
 * Questionários inicial (pre) e final (post): 10 questões objetivas, uma por tela.
 * Não mostram gabarito (o inicial não pode "ensinar" antes da atividade).
 * Rascunho salvo na sessão para não perder respostas se a página for recarregada.
 */
import { ASSESSMENT } from '../js/data/assessment.js';
import { registerActivity, STATUS_MESSAGES } from '../js/results.js';
import { progressBar, optionsFieldset, blocker, notice, statusNotice } from '../components/ui.js';
import { renderNotFound } from './home.js';

const NAMES = { pre: 'Questionário inicial', post: 'Questionário final' };

const draftKey = (type, code) => `eco:draft:${type}:${code}`;
const readDraft = (k) => { try { return JSON.parse(sessionStorage.getItem(k)) || {}; } catch { return {}; } };
const writeDraft = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* ignora */ } };

export function render(root, ctx, [slug]) {
  const type = { inicial: 'pre', final: 'post' }[slug];
  if (!type) return renderNotFound(root);
  const title = NAMES[type];

  if (!ctx.school) {
    root.innerHTML = blocker(title, '<p>Os questionários só podem ser respondidos pelo QR Code da sua escola.</p>', '<a class="btn btn--primary" href="#/">Voltar ao início</a>');
    return;
  }
  const p = ctx.participant;
  if (!p) {
    root.innerHTML = blocker(title, '<p>Primeiro, gere seu código de participante. Ele substitui o seu nome.</p>', '<a class="btn btn--primary" href="#/jornada">Ir para Minha jornada</a>');
    return;
  }
  if (type === 'post' && !p.done.pre) {
    root.innerHTML = blocker(title, '<p>O questionário final é liberado depois do questionário inicial.</p>', '<a class="btn btn--primary" href="#/questionario/inicial">Fazer o questionário inicial</a>');
    return;
  }
  if (p.done[type]) return renderDone(root, type, p.results[type], p);

  const questions = ASSESSMENT[p.level];
  const key = draftKey(type, p.code);
  const answers = readDraft(key);
  let index = 0;

  function intro() {
    const missingContent = type === 'post' && (!p.done.conteudo_ambiente || !p.done.conteudo_saude);
    root.innerHTML = `
      <section class="card">
        <h1 tabindex="-1">📝 ${title}</h1>
        <p>${type === 'pre'
          ? 'Antes de começar, queremos saber o que você já conhece. <strong>Não vale nota</strong> e ninguém vai saber quem respondeu.'
          : 'Agora que você explorou as atividades, responda novamente. Assim descobrimos o que mudou no seu conhecimento.'}</p>
        <ul class="checklist">
          <li>10 questões, uma por vez</li>
          <li>Responda sozinho(a), sem pesquisar</li>
          <li>Se não souber, escolha a que achar mais certa</li>
        </ul>
        ${missingContent ? notice('Você ainda não marcou como lidas as áreas de Meio Ambiente e Saúde. Recomendamos explorá-las antes.', 'info') : ''}
        <div class="actions"><button class="btn btn--primary btn--lg" id="begin" type="button">Começar</button></div>
      </section>`;
    root.querySelector('#begin').addEventListener('click', () => step(Object.keys(answers).length >= questions.length ? questions.length - 1 : 0));
  }

  function step(i) {
    index = i;
    const q = questions[i];
    const selected = answers[q.id] ?? null;
    const last = i === questions.length - 1;
    root.innerHTML = `
      <section class="card">
        <h1 class="sr-only" tabindex="-1">${title}, questão ${i + 1}</h1>
        ${progressBar(i + 1, questions.length, title)}
        <form id="qform" novalidate>
          ${optionsFieldset(q, selected, { legendPrefix: `<span class="question__num">${i + 1}.</span> ` })}
          <p class="field-error" id="qerror" aria-live="assertive"></p>
          <div class="actions actions--split">
            <button class="btn btn--ghost" type="button" id="back" ${i === 0 ? 'disabled' : ''}>← Voltar</button>
            <button class="btn btn--primary" type="submit">${last ? 'Revisar' : 'Próxima →'}</button>
          </div>
        </form>
      </section>`;
    const form = root.querySelector('#qform');
    form.addEventListener('change', (e) => {
      answers[q.id] = Number(e.target.value);
      writeDraft(key, answers);
      root.querySelector('#qerror').textContent = '';
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (answers[q.id] == null) {
        root.querySelector('#qerror').textContent = 'Escolha uma alternativa para continuar.';
        return;
      }
      last ? review() : step(i + 1);
    });
    root.querySelector('#back').addEventListener('click', () => step(i - 1));
    root.querySelector('h1').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function review() {
    const missing = questions.filter((q) => answers[q.id] == null);
    root.innerHTML = `
      <section class="card">
        <h1 tabindex="-1">Revisão</h1>
        <p>Você respondeu <strong>${questions.length - missing.length} de ${questions.length}</strong> questões.</p>
        ${missing.length ? notice(`Faltam as questões: ${missing.map((q) => questions.indexOf(q) + 1).join(', ')}.`, 'warning') : '<p>Tudo certo! Se quiser, volte para conferir antes de enviar.</p>'}
        <div class="actions actions--split">
          <button class="btn btn--ghost" type="button" id="back">← Voltar às questões</button>
          <button class="btn btn--primary" type="button" id="send" ${missing.length ? 'disabled' : ''}>Enviar respostas</button>
        </div>
        <div id="send-status" aria-live="polite"></div>
      </section>`;
    root.querySelector('#back').addEventListener('click', () => step(missing.length ? questions.indexOf(missing[0]) : questions.length - 1));
    root.querySelector('#send').addEventListener('click', async (e) => {
      e.target.disabled = true;
      e.target.textContent = 'Enviando…';
      const score = questions.reduce((s, q) => s + (answers[q.id] === q.correct ? 1 : 0), 0);
      const result = { score, total: questions.length };
      const status = await registerActivity(type, { ...answers }, result);
      sessionStorage.removeItem(key);
      renderDone(root, type, result, ctx.participant, status);
    });
  }

  intro();
}

function renderDone(root, type, result, p, status = null) {
  const pre = p.results.pre;
  const comparison = type === 'post' && pre && result
    ? `<div class="compare">
        <div><span>Inicial</span><strong>${pre.score}/${pre.total}</strong></div>
        <div aria-hidden="true">→</div>
        <div><span>Final</span><strong>${result.score}/${result.total}</strong></div>
      </div>
      <p>${result.score > pre.score ? 'Você evoluiu! 🎉' : result.score === pre.score ? 'Você manteve seu resultado. Continue aprendendo!' : 'Cada passo conta. Que tal rever os conteúdos?'}</p>`
    : '';
  root.innerHTML = `
    <section class="card card--center">
      <h1 tabindex="-1">${type === 'pre' ? '✅ Questionário inicial concluído' : '🏁 Questionário final concluído'}</h1>
      ${status ? statusNotice(STATUS_MESSAGES[status]) : ''}
      ${result ? `<p class="score">${result.score} <small>de ${result.total}</small></p>` : ''}
      ${comparison}
      <p>${type === 'pre' ? 'Obrigado! Agora explore os conteúdos de Meio Ambiente e Saúde.' : 'Obrigado por participar do EcoEscola Digital!'}</p>
      <div class="actions">
        ${type === 'pre'
          ? '<a class="btn btn--primary" href="#/meio-ambiente">Ir para Meio Ambiente →</a>'
          : '<a class="btn btn--primary" href="#/jornada">Ver minha jornada</a>'}
      </div>
    </section>`;
}
