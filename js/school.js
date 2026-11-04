/**
 * Identificação da escola pelo QR Code (?escola=A | B | C).
 *
 * Regras:
 *  - A escola vem SOMENTE do endereço de acesso; não existe seletor na interface.
 *  - Enquanto houver uma atividade em andamento (participante sem questionário final),
 *    a escola fica travada. Um link de outra escola é ignorado e o usuário é avisado.
 *  - O parâmetro é removido da barra de endereço depois de lido.
 */
import { SCHOOLS, DEFAULT_LEVEL, LEVELS } from './config.js';
import { storage } from './utils.js';
import { apiCall } from './api.js';
import { getParticipant, isFinished } from './participant.js';

const SCHOOL_KEY = 'eco:school';
const CONFIG_KEY = 'eco:config';

function readUrlSchool() {
  const value = new URLSearchParams(location.search).get('escola');
  const s = value ? value.trim().toUpperCase() : null;
  return SCHOOLS.includes(s) ? s : null;
}

/** @returns {{ school: string|null, conflict: string|null }} */
export function resolveSchool() {
  const urlSchool = readUrlSchool();
  const participant = getParticipant();
  let school = null;
  let conflict = null;

  if (participant && !isFinished(participant)) {
    school = participant.school;
    if (urlSchool && urlSchool !== school) conflict = urlSchool;
  } else if (urlSchool) {
    school = urlSchool;
  } else {
    school = storage.get(SCHOOL_KEY, null);
    if (!SCHOOLS.includes(school)) school = null;
  }

  if (school) storage.set(SCHOOL_KEY, school);

  if (location.search) {
    // Limpa o parâmetro para que não seja editado à mão durante a atividade.
    history.replaceState(null, '', location.pathname + location.hash);
  }
  return { school, conflict };
}

/** Níveis configurados pelo administrador (cache local + atualização remota). */
export const cachedLevels = () => storage.get(CONFIG_KEY, null)?.levels ?? null;

export async function refreshLevels() {
  try {
    const { config } = await apiCall('getConfig', {}, { timeoutMs: 10000 });
    storage.set(CONFIG_KEY, config);
    return config.levels;
  } catch {
    return cachedLevels();
  }
}

/** Nível efetivo: o do participante (travado no início) ou o configurado para a escola. */
export function effectiveLevel(school) {
  const p = getParticipant();
  if (p && !isFinished(p) && LEVELS.includes(p.level)) return p.level;
  const levels = cachedLevels();
  return (school && levels?.[school]) || DEFAULT_LEVEL;
}
