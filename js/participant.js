/**
 * Participante anônimo: código aleatório (ex.: A-7KX3Q) que liga o questionário
 * inicial ao final sem coletar nome, CPF, telefone, endereço ou e-mail.
 * A primeira letra identifica a escola. O alfabeto exclui caracteres ambíguos (0/O, 1/I/L).
 */
import { storage } from './utils.js';

const KEY = 'eco:participant';
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CODE_RE = /^([ABC])-[2-9A-HJKMNP-Z]{5}$/;

export function generateCode(school) {
  const rnd = crypto.getRandomValues(new Uint32Array(5));
  return `${school}-${[...rnd].map((n) => ALPHABET[n % ALPHABET.length]).join('')}`;
}

/** Aceita "a7kx3q", "A 7KX3Q", "A-7KX3Q"… e devolve "A-7KX3Q" (ou null se inválido). */
export function normalizeCode(input) {
  const raw = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (raw.length !== 6) return null;
  const code = `${raw[0]}-${raw.slice(1)}`;
  return CODE_RE.test(code) ? code : null;
}

export const getParticipant = () => storage.get(KEY, null);

function save(p) {
  storage.set(KEY, p);
  return p;
}

export function createParticipant(school, level) {
  return save({ code: generateCode(school), school, level, createdAt: new Date().toISOString(), done: {}, results: {} });
}

/** Retoma um código já existente (ex.: questionário final em outro aparelho). */
export function adoptParticipant(code, school, level, doneTypes = [], results = {}) {
  const done = Object.fromEntries(doneTypes.map((t) => [t, true]));
  return save({ code, school, level, createdAt: new Date().toISOString(), done, results, adopted: true });
}

export function markDone(type, result) {
  const p = getParticipant();
  if (!p) return null;
  p.done[type] = true;
  if (result) p.results[type] = result;
  return save(p);
}

export const clearParticipant = () => storage.remove(KEY);

export const isFinished = (p) => !!p?.done?.post;
