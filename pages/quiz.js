/**
 * Quiz educativo: 10 perguntas, uma por vez, com correção imediata, explicação,
 * barra de progresso e pontuação final. Somente a primeira tentativa é registrada;
 * as seguintes servem para treinar.
 */
import { QUIZ } from '../js/data/quiz.js';
import { esc } from '../js/utils.js';
import { registerActivity, STATUS_MESSAGES } from '../js/results.js';
import { progressBar, optionsFieldset, notice, statusNotice } from '../components/ui.js';
import { preNotice } from './journey.js';

function encouragement(score, total) {
  const pct = score / total;
  if (pct === 1) return 'Incrível! Você acertou tudo! 🌟';
  if (pct >= 0.7) return 'Excelente! Você já sabe muito sobre meio ambiente e saúde! 🌿';
  if (pct >= 0.4) return 'Bom trabalho! Reveja as explicações e continue aprendendo. 💪';
  return 'Todo aprendizado começa assim. Explore os conteúdos e tente de novo! 🌱';
}

export function render(root, ctx) {
  const questions = QUIZ[ctx.level];
  const p = ctx.participant;
  const answers = {};
  let score = 0;

  function intro() {
    root.innerHTML = `
      <section class="card">
        <h1 tabindex="-1">❓ Quiz EcoEscola</h1>
        ${preNotice(ctx)}
        <p>São ${questions.length} perguntas. Depois de cada resposta, você descobre se acertou e aprende um pouco mais.</p>
        ${p?.done.quiz ? notice('Você já fez o quiz. Pode jogar de novo para treinar; o primeiro resultado continua registrado.', 'info') : ''}
        ${!p ? notice('Você está no modo livre: o resultado não será registrado. Para registrar, gere seu código em <a href="#/jornada">Minha jornada</a>.', 'info') : ''}
        <div class="actions"><button class="btn btn--primary btn--lg" id="start" type="button">Começar o quiz</button></div>
      </section>`;
    root.querySelector('#start').addEventListener('click', () => show(0));
  }

  function show(i) {
    if (i >= questions.length) return finish();
    const q = questions[i];
    root.innerHTML = `
      <section class="card">
        <h1 class="sr-only" tabindex="-1">Quiz, pergunta ${i + 1}</h1>
        ${progressBar(i, questions.length, 'Progresso do quiz')}
        <p class="quiz-score" aria-live="polite">Pontos: <strong>${score}</strong></p>
        <form id="qform">${optionsFieldset(q, null, { legendPrefix: `<span class="question__num">${i + 1}.</span> ` })}</form>
        <div id="feedback" aria-live="assertive"></div>
      </section>`;
    root.querySelector('h1').focus({ preventScroll: true });
    window.scrollTo(0, 0);

    root.querySelector('#qform').addEventListener('change', (e) => {
      const chosen = Number(e.target.value);
      answers[q.id] = chosen;
      const correct = chosen === q.correct;
      if (correct) score++;
      // Bloqueia a pergunta e mostra a correção.
      root.querySelector('#qform').innerHTML = optionsFieldset(q, chosen, { disabled: true, correct: q.correct, legendPrefix: `<span class="question__num">${i + 1}.</span> ` });
      root.querySelector('.quiz-score strong').textContent = score;
      root.querySelector('#feedback').innerHTML = `
        ${notice(`<strong>${correct ? '✔ Resposta correta!' : `✘ Resposta incorreta. A certa é: ${esc(q.options[q.correct])}.`}</strong><br>${esc(q.explain)}`, correct ? 'success' : 'error')}
        <div class="actions"><button class="btn btn--primary" type="button" id="next">${i + 1 < questions.length ? 'Próxima pergunta →' : 'Ver resultado'}</button></div>`;
      const next = root.querySelector('#next');
      next.addEventListener('click', () => show(i + 1));
      next.focus();
    }, { once: true });
  }

  async function finish() {
    root.innerHTML = `<section class="card card--center"><h1 tabindex="-1">Calculando…</h1></section>`;
    const status = await registerActivity('quiz', { ...answers }, { score, total: questions.length });
    root.innerHTML = `
      <section class="card card--center">
        ${progressBar(questions.length, questions.length, 'Progresso do quiz')}
        <h1 tabindex="-1">🎉 Parabéns! Você concluiu o desafio EcoEscola!</h1>
        <p class="score">${score} <small>de ${questions.length}</small></p>
        <p>${encouragement(score, questions.length)}</p>
        ${statusNotice(STATUS_MESSAGES[status])}
        <div class="actions">
          <a class="btn btn--primary" href="#/jornada">Continuar minha jornada</a>
          <button class="btn btn--ghost" type="button" id="again">Jogar de novo</button>
        </div>
      </section>`;
    root.querySelector('h1').focus();
    root.querySelector('#again').addEventListener('click', () => ctx.reload());
  }

  intro();
}
