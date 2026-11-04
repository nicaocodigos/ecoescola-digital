/** Página inicial, privacidade e página não encontrada. */
import { SCHOOL_NAMES } from '../js/config.js';
import { notice } from '../components/ui.js';

export function render(root, ctx) {
  const p = ctx.participant;
  const cta = p ? 'Continuar minha jornada' : 'Começar minha jornada';
  root.innerHTML = `
    <section class="hero">
      <img class="hero__logo" src="assets/img/logo.svg" alt="Logo EcoEscola Digital" width="96" height="96">
      <h1 tabindex="-1">EcoEscola Digital</h1>
      <p class="hero__slogan">Pequenas atitudes, grandes transformações.</p>
      <p class="hero__intro">
        Aprenda a cuidar do ambiente da sua escola e da sua saúde: separação do lixo,
        prevenção da dengue, desafios e quiz. Você não precisa informar seu nome.
      </p>
      <a class="btn btn--primary btn--lg" href="#/jornada">${cta} →</a>
      ${ctx.school ? `<p class="hero__school">Você está participando pela <strong>${SCHOOL_NAMES[ctx.school]}</strong>.</p>` : ''}
    </section>

    ${ctx.school ? '' : notice('Para participar das atividades com registro, acesse pelo <strong>QR Code da sua escola</strong>. Você pode explorar os conteúdos livremente.', 'info')}

    <h2 class="section-title">Temas</h2>
    <div class="grid grid--2">
      <a class="theme-card theme-card--env" href="#/meio-ambiente">
        <span class="theme-card__icon" aria-hidden="true">🌱</span>
        <span class="theme-card__title">Meio Ambiente</span>
        <span class="theme-card__desc">Sustentabilidade, coleta seletiva, separação de resíduos e consumo consciente.</span>
      </a>
      <a class="theme-card theme-card--health" href="#/saude">
        <span class="theme-card__icon" aria-hidden="true">🩺</span>
        <span class="theme-card__title">Saúde</span>
        <span class="theme-card__desc">Ambiente e saúde, prevenção da dengue e eliminação de criadouros.</span>
      </a>
    </div>

    <h2 class="section-title">Atividades</h2>
    <div class="grid grid--3">
      <a class="tile" href="#/desafios"><span aria-hidden="true">🎯</span><strong>Desafios</strong><small>Onde descartar? Identifique o risco. Minha escola.</small></a>
      <a class="tile" href="#/quiz"><span aria-hidden="true">❓</span><strong>Quiz</strong><small>10 perguntas com explicações.</small></a>
      <a class="tile" href="#/jornada"><span aria-hidden="true">📝</span><strong>Questionários</strong><small>Inicial e final, para medir o que aprendemos.</small></a>
    </div>`;
}

export function renderPrivacy(root) {
  root.innerHTML = `
    <article class="card prose">
      <h1 tabindex="-1">Privacidade</h1>
      <p>O EcoEscola Digital <strong>não pede</strong> nome, CPF, telefone, endereço ou e-mail.</p>
      <ul>
        <li>Cada participante recebe um <strong>código aleatório</strong> (ex.: A-7KX3Q), usado só para ligar o questionário inicial ao final.</li>
        <li>São registrados: escola (A, B ou C), nível de ensino, respostas das atividades e data/hora do envio.</li>
        <li>Comentários livres passam por um filtro que remove e-mails e números longos (como telefones). Mesmo assim, não escreva nomes ou dados pessoais.</li>
        <li>Os dados são usados apenas pela equipe do projeto extensionista, de forma agregada, no relatório da Universidade Cruzeiro do Sul.</li>
        <li>Enquanto não há internet, as respostas ficam guardadas temporariamente neste aparelho e são enviadas quando a conexão voltar.</li>
      </ul>
    </article>`;
}

export function renderNotFound(root) {
  root.innerHTML = `<section class="card card--center"><h1 tabindex="-1">Página não encontrada</h1>
    <p>O endereço acessado não existe.</p><a class="btn btn--primary" href="#/">Voltar ao início</a></section>`;
}
