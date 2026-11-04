/**
 * Registro dos resultados de cada atividade do participante.
 * Monta o envio (sem dados pessoais), marca a etapa como concluída no aparelho
 * e entrega à fila de envio (outbox), que garante a chegada ao servidor.
 */
import { uuid } from './utils.js';
import { enqueue } from './outbox.js';
import { getParticipant, markDone } from './participant.js';

export const STATUS_MESSAGES = {
  sent: { type: 'success', text: 'Respostas registradas com sucesso!' },
  queued: { type: 'warning', text: 'Sem conexão agora. Suas respostas ficaram guardadas neste aparelho e serão enviadas automaticamente.' },
  rejected: { type: 'error', text: 'Não foi possível registrar as respostas. Avise o responsável pela atividade.' },
  already: { type: 'info', text: 'Esta atividade já tinha sido registrada. Esta tentativa não altera o resultado.' },
  practice: { type: 'info', text: 'Modo livre: para registrar seus resultados, gere seu código na página “Minha jornada”.' },
};

/**
 * @param {string} type  'start' | 'pre' | 'post' | 'quiz' | 'conteudo_ambiente' | 'conteudo_saude' | 'desafio1' | 'desafio2' | 'desafio3'
 * @param {object} [answers]  respostas (o servidor recalcula a pontuação)
 * @param {object} [localResult] resumo guardado no aparelho para exibição (ex.: { score, total })
 * @returns {Promise<'sent'|'queued'|'rejected'|'already'|'practice'>}
 */
export async function registerActivity(type, answers = null, localResult = null) {
  const p = getParticipant();
  if (!p) return 'practice';
  if (p.done[type]) return 'already';

  const submission = {
    submissionId: uuid(),
    type,
    school: p.school,
    level: p.level,
    participantCode: p.code,
    clientTime: new Date().toISOString(),
  };
  if (answers) submission.answers = answers;

  // Marca antes de enviar: se a conexão falhar, o envio já está seguro na fila local.
  markDone(type, localResult);
  return enqueue(submission);
}
