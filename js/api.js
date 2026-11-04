/**
 * Comunicação com o backend (Google Apps Script ou servidor local).
 * Usa POST com Content-Type text/plain: o Apps Script aceita sem preflight CORS.
 */
import { API_URL, API_CONFIGURED } from './config.js';

export class ApiError extends Error {
  /**
   * @param {string} code    código do erro (ex.: 'network', 'validation', 'unauthorized')
   * @param {string} message mensagem para o usuário
   * @param {boolean} retryable true se vale tentar de novo mais tarde (falha de conexão)
   */
  constructor(code, message, retryable = false) {
    super(message);
    this.code = code;
    this.retryable = retryable;
  }
}

export async function apiCall(action, payload = {}, { timeoutMs = 20000 } = {}) {
  if (!API_CONFIGURED) {
    throw new ApiError('not_configured', 'A base de dados ainda não foi configurada.', true);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
      redirect: 'follow',
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('network', 'Sem conexão com o servidor.', true);
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) throw new ApiError(`http_${response.status}`, 'O servidor não respondeu corretamente.', true);

  let json;
  try {
    json = await response.json();
  } catch {
    throw new ApiError('bad_response', 'Resposta inválida do servidor.', true);
  }
  if (!json.ok) {
    const retryable = json.error === 'server_error';
    throw new ApiError(json.error || 'unknown', json.message || 'Erro desconhecido.', retryable);
  }
  return json;
}
