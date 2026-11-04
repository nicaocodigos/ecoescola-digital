/**
 * Gera apps-script/AnswerKey.gs a partir dos dados do front-end (js/data/*.js).
 * Assim o gabarito do servidor nunca fica diferente das questões exibidas.
 * Uso: npm run build:key
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ASSESSMENT } from '../js/data/assessment.js';
import { QUIZ } from '../js/data/quiz.js';
import { BINS, DISPOSAL_ITEMS, RISK_SITUATIONS, SCHOOL_PROBLEMS, SCHOOL_IMPROVEMENTS } from '../js/data/challenges.js';

export function buildAnswerKey() {
  const questionKey = (bank) =>
    Object.fromEntries(
      Object.entries(bank).map(([level, questions]) => [
        level,
        Object.fromEntries(questions.map((q) => [q.id, { correct: q.correct, options: q.options.length, theme: q.theme }])),
      ]),
    );

  return {
    assessment: questionKey(ASSESSMENT),
    quiz: questionKey(QUIZ),
    desafio1: {
      bins: BINS.map((b) => b.id),
      items: Object.fromEntries(DISPOSAL_ITEMS.map((i) => [i.id, i.bin])),
    },
    desafio2: Object.fromEntries(
      RISK_SITUATIONS.map((s) => [s.id, { risk: s.risk, action: s.action, actions: s.actions.map((a) => a.id) }]),
    ),
    desafio3: {
      problems: SCHOOL_PROBLEMS.map((p) => p.id),
      improvements: SCHOOL_IMPROVEMENTS.map((m) => m.id),
    },
  };
}

/** Verificações de consistência dos dados antes de gerar o gabarito. */
function checkData() {
  const problems = [];
  for (const [name, bank] of [['ASSESSMENT', ASSESSMENT], ['QUIZ', QUIZ]]) {
    const idsByLevel = Object.values(bank).map((qs) => qs.map((q) => q.id).join(','));
    if (new Set(idsByLevel).size !== 1) problems.push(`${name}: os níveis devem ter os mesmos ids na mesma ordem`);
    for (const [level, qs] of Object.entries(bank)) {
      if (qs.length !== 10) problems.push(`${name}.${level}: esperado 10 questões, encontrado ${qs.length}`);
      for (const q of qs) {
        if (!(q.correct >= 0 && q.correct < q.options.length)) problems.push(`${name}.${level}.${q.id}: índice correto inválido`);
      }
    }
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = checkData();
  if (problems.length) {
    console.error('Dados inconsistentes:\n- ' + problems.join('\n- '));
    process.exit(1);
  }
  const out = new URL('../apps-script/AnswerKey.gs', import.meta.url);
  const body =
    '/**\n * ARQUIVO GERADO AUTOMATICAMENTE por tools/build-answer-key.mjs — não edite à mão.\n' +
    ' * Gabarito usado pelo servidor para recalcular as pontuações.\n */\n' +
    `var ANSWER_KEY = ${JSON.stringify(buildAnswerKey(), null, 2)};\n`;
  writeFileSync(out, body);
  console.log('Gabarito gerado em apps-script/AnswerKey.gs');
}
