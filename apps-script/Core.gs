/**
 * EcoEscola Digital — núcleo do backend (lógica pura).
 *
 * Este arquivo NÃO usa APIs do Google. Toda persistência passa pelo objeto `store`
 * (ver Code.gs para a versão Google Sheets e tools/dev-server.mjs para a versão local).
 * Assim, a mesma validação roda no Apps Script e nos testes locais.
 *
 * Regras de segurança aplicadas aqui:
 *  - Lista fechada de ações, tipos, escolas e níveis.
 *  - A pontuação é recalculada no servidor a partir do gabarito (ANSWER_KEY);
 *    o valor enviado pelo navegador nunca é confiado.
 *  - Idempotência: o mesmo submissionId nunca é gravado duas vezes.
 *  - Um único registro por participante e por tipo de atividade.
 *  - Textos livres são limpos (HTML, e-mails e sequências numéricas longas são removidos).
 *  - Ações administrativas exigem token emitido após login (senha só no servidor).
 */

var SCHOOLS = ['A', 'B', 'C'];
var LEVELS = ['f1', 'f2', 'em'];
var TYPES = ['start', 'pre', 'post', 'quiz', 'conteudo_ambiente', 'conteudo_saude', 'desafio1', 'desafio2', 'desafio3'];
var ADMIN_ENTRY_TYPES = ['pre', 'post', 'quiz'];
var CODE_RE = /^([ABC])-[2-9A-HJKMNP-Z]{5}$/;
var SUBMISSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;
var MAX_REQUEST_CHARS = 20000;
var MAX_LOGIN_FAILURES = 5;
var COMMENT_MAX = 280;
var DEFAULT_CONFIG = { levels: { A: 'f2', B: 'f2', C: 'f2' } };

/** Ponto de entrada único. `req` = objeto JSON vindo do navegador. */
function handleRequest(req, store) {
  try {
    if (!req || typeof req !== 'object' || Array.isArray(req)) return fail('invalid_request', 'Requisição inválida.');
    if (JSON.stringify(req).length > MAX_REQUEST_CHARS) return fail('too_large', 'Requisição muito grande.');

    switch (req.action) {
      case 'ping':
        return ok({ time: store.now() });
      case 'getConfig':
        return ok({ config: readConfig(store) });
      case 'status':
        return participantStatus(req.code, store);
      case 'submit':
        return submit(req.data, store, 'app', ['start', 'pre', 'post', 'quiz', 'conteudo_ambiente', 'conteudo_saude', 'desafio1', 'desafio2', 'desafio3']);
      case 'login':
        return login(req.password, store);
      case 'logout':
        if (typeof req.token === 'string') store.revokeToken(req.token);
        return ok({});
      case 'adminData':
        if (!isAdmin(req, store)) return unauthorized();
        return ok({ records: store.listRecords(), config: readConfig(store), generatedAt: store.now() });
      case 'setConfig':
        if (!isAdmin(req, store)) return unauthorized();
        return setConfig(req.config, store);
      case 'adminSubmit':
        if (!isAdmin(req, store)) return unauthorized();
        return submit(req.data, store, 'papel', ADMIN_ENTRY_TYPES);
      default:
        return fail('unknown_action', 'Ação desconhecida.');
    }
  } catch (err) {
    if (err && err.isValidation) return fail('validation', err.message);
    if (typeof console !== 'undefined') console.error(err);
    return fail('server_error', 'Erro interno. Tente novamente.');
  }
}

/* ------------------------------------------------------------------ */
/* Respostas padronizadas                                              */
/* ------------------------------------------------------------------ */

function ok(data) {
  var out = { ok: true };
  for (var k in data) out[k] = data[k];
  return out;
}

function fail(error, message) {
  return { ok: false, error: error, message: message || error };
}

function unauthorized() {
  return fail('unauthorized', 'Sessão expirada ou inválida. Faça login novamente.');
}

function vErr(message) {
  var e = new Error(message);
  e.isValidation = true;
  return e;
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/* ------------------------------------------------------------------ */
/* Configuração (nível de conteúdo por escola)                          */
/* ------------------------------------------------------------------ */

function readConfig(store) {
  var cfg = store.getConfig() || {};
  var levels = {};
  SCHOOLS.forEach(function (s) {
    var l = cfg.levels && cfg.levels[s];
    levels[s] = LEVELS.indexOf(l) >= 0 ? l : DEFAULT_CONFIG.levels[s];
  });
  return { levels: levels };
}

function setConfig(cfg, store) {
  if (!isPlainObject(cfg) || !isPlainObject(cfg.levels)) throw vErr('Configuração inválida.');
  var levels = {};
  SCHOOLS.forEach(function (s) {
    if (LEVELS.indexOf(cfg.levels[s]) < 0) throw vErr('Nível inválido para a Escola ' + s + '.');
    levels[s] = cfg.levels[s];
  });
  store.setConfig({ levels: levels });
  return ok({ config: { levels: levels } });
}

/* ------------------------------------------------------------------ */
/* Autenticação administrativa                                         */
/* ------------------------------------------------------------------ */

function login(password, store) {
  if (typeof password !== 'string' || password.length < 1 || password.length > 200) {
    return fail('invalid_credentials', 'Senha inválida.');
  }
  if (!store.isPasswordConfigured()) {
    return fail('admin_not_configured', 'A senha administrativa ainda não foi configurada no servidor.');
  }
  if (store.getLoginFailures() >= MAX_LOGIN_FAILURES) {
    return fail('too_many_attempts', 'Muitas tentativas. Aguarde 15 minutos.');
  }
  if (!store.verifyPassword(password)) {
    store.registerLoginFailure();
    return fail('invalid_credentials', 'Senha incorreta.');
  }
  store.resetLoginFailures();
  return ok({ token: store.createToken(), expiresInSeconds: 6 * 60 * 60 });
}

function isAdmin(req, store) {
  return typeof req.token === 'string' && req.token.length >= 20 && req.token.length <= 200 && store.isValidToken(req.token);
}

/* ------------------------------------------------------------------ */
/* Situação de um participante (para continuar em outro aparelho)       */
/* ------------------------------------------------------------------ */

function participantStatus(code, store) {
  if (typeof code !== 'string' || !CODE_RE.test(code)) throw vErr('Código de participante inválido.');
  var types = [];
  var level = null;
  var results = {};
  store.listRecords().forEach(function (r) {
    if (r.participantCode !== code) return;
    if (types.indexOf(r.type) < 0) types.push(r.type);
    if (!level && (r.type === 'pre' || r.type === 'start')) level = r.level;
    if (r.type === 'pre' || r.type === 'post' || r.type === 'quiz') results[r.type] = { score: r.score, total: r.total };
  });
  return ok({ code: code, types: types, level: level, results: results });
}

/* ------------------------------------------------------------------ */
/* Registro de atividades                                              */
/* ------------------------------------------------------------------ */

function submit(d, store, source, allowedTypes) {
  var rec = buildRecord(d, source, allowedTypes);
  return store.withLock(function () {
    if (store.hasSubmission(rec.submissionId)) return ok({ status: 'duplicate', submissionId: rec.submissionId });
    if (store.hasCodeType(rec.participantCode, rec.type)) {
      return ok({ status: 'already_recorded', submissionId: rec.submissionId });
    }
    rec.receivedAt = store.now();
    store.append(rec);
    return ok({ status: 'saved', submissionId: rec.submissionId, score: rec.score, total: rec.total });
  });
}

/** Valida o envio e monta o registro que será gravado. Lança erro de validação se algo estiver errado. */
function buildRecord(d, source, allowedTypes) {
  if (!isPlainObject(d)) throw vErr('Dados ausentes.');
  if (typeof d.submissionId !== 'string' || !SUBMISSION_ID_RE.test(d.submissionId)) throw vErr('Identificador de envio inválido.');
  if (allowedTypes.indexOf(d.type) < 0) throw vErr('Tipo de atividade inválido.');
  if (SCHOOLS.indexOf(d.school) < 0) throw vErr('Escola inválida.');
  if (LEVELS.indexOf(d.level) < 0) throw vErr('Nível inválido.');
  var m = typeof d.participantCode === 'string' ? CODE_RE.exec(d.participantCode) : null;
  if (!m) throw vErr('Código de participante inválido.');
  if (m[1] !== d.school) throw vErr('O código não pertence a esta escola.');

  var rec = {
    submissionId: d.submissionId,
    receivedAt: '',
    source: source,
    type: d.type,
    school: d.school,
    level: d.level,
    participantCode: d.participantCode,
    score: '',
    total: '',
    percent: '',
    detail: '',
    themes: '',
    answers: '',
    extra: '',
    clientTime: typeof d.clientTime === 'string' ? d.clientTime.slice(0, 40) : '',
  };

  var result = null;
  if (d.type === 'pre' || d.type === 'post') result = scoreQuestions(ANSWER_KEY.assessment[d.level], d.answers);
  else if (d.type === 'quiz') result = scoreQuestions(ANSWER_KEY.quiz[d.level], d.answers);
  else if (d.type === 'desafio1') result = scoreDisposal(d.answers);
  else if (d.type === 'desafio2') result = scoreRisk(d.answers);
  else if (d.type === 'desafio3') rec.extra = validateSchoolIdeas(d.answers);

  if (result) {
    rec.score = result.score;
    rec.total = result.total;
    rec.percent = Math.round((result.score / result.total) * 1000) / 10;
    rec.detail = result.detail;
    rec.themes = result.themes || '';
    rec.answers = result.answers;
  }
  return rec;
}

/** Questionários e quiz: todas as questões devem ser respondidas com um índice válido. */
function scoreQuestions(keyset, answers) {
  if (!keyset) throw vErr('Gabarito indisponível para este nível.');
  if (!isPlainObject(answers)) throw vErr('Respostas inválidas.');
  var ids = Object.keys(keyset);
  if (Object.keys(answers).length !== ids.length) throw vErr('Responda todas as questões.');
  var detail = {}, themes = {}, clean = {}, score = 0;
  ids.forEach(function (id) {
    var v = answers[id], k = keyset[id];
    if (typeof v !== 'number' || v % 1 !== 0 || v < 0 || v >= k.options) throw vErr('Resposta inválida na questão ' + id + '.');
    var c = v === k.correct ? 1 : 0;
    score += c;
    detail[id] = c;
    clean[id] = v;
    if (!themes[k.theme]) themes[k.theme] = [0, 0];
    themes[k.theme][0] += c;
    themes[k.theme][1] += 1;
  });
  return { score: score, total: ids.length, detail: detail, themes: themes, answers: clean };
}

/** Desafio 1: cada item precisa de uma lixeira válida. */
function scoreDisposal(answers) {
  var key = ANSWER_KEY.desafio1;
  if (!isPlainObject(answers)) throw vErr('Respostas inválidas.');
  var ids = Object.keys(key.items);
  if (Object.keys(answers).length !== ids.length) throw vErr('Classifique todos os itens.');
  var detail = {}, clean = {}, score = 0;
  ids.forEach(function (id) {
    var v = answers[id];
    if (key.bins.indexOf(v) < 0) throw vErr('Categoria inválida no item ' + id + '.');
    var c = v === key.items[id] ? 1 : 0;
    score += c;
    detail[id] = c;
    clean[id] = v;
  });
  return { score: score, total: ids.length, detail: detail, answers: clean };
}

/** Desafio 2: acerto = identificar o risco corretamente E escolher a ação correta. */
function scoreRisk(answers) {
  var key = ANSWER_KEY.desafio2;
  if (!isPlainObject(answers)) throw vErr('Respostas inválidas.');
  var ids = Object.keys(key);
  if (Object.keys(answers).length !== ids.length) throw vErr('Responda todas as situações.');
  var detail = {}, clean = {}, score = 0;
  ids.forEach(function (id) {
    var a = answers[id], k = key[id];
    if (!isPlainObject(a) || typeof a.risk !== 'boolean' || k.actions.indexOf(a.action) < 0) {
      throw vErr('Resposta inválida na situação ' + id + '.');
    }
    var c = a.risk === k.risk && a.action === k.action ? 1 : 0;
    score += c;
    detail[id] = c;
    clean[id] = { risk: a.risk, action: a.action };
  });
  return { score: score, total: ids.length, detail: detail, answers: clean };
}

/** Desafio 3: listas fechadas + comentário opcional anonimizado. */
function validateSchoolIdeas(answers) {
  var key = ANSWER_KEY.desafio3;
  if (!isPlainObject(answers)) throw vErr('Respostas inválidas.');
  var problems = pickFromList(answers.problems, key.problems);
  var improvements = pickFromList(answers.improvements, key.improvements);
  if (problems.length + improvements.length === 0) throw vErr('Escolha pelo menos um problema ou uma melhoria.');
  return { problems: problems, improvements: improvements, comment: sanitizeText(answers.comment, COMMENT_MAX) };
}

function pickFromList(value, allowed) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > allowed.length) throw vErr('Lista inválida.');
  var out = [];
  value.forEach(function (v) {
    if (allowed.indexOf(v) < 0) throw vErr('Opção inválida.');
    if (out.indexOf(v) < 0) out.push(v);
  });
  return out;
}

/**
 * Limpa texto livre: remove HTML e caracteres de controle e mascara possíveis
 * dados pessoais (e-mails, telefones, CPF), mesmo que o estudante os digite por engano.
 */
function sanitizeText(value, max) {
  if (value == null) return '';
  if (typeof value !== 'string') throw vErr('Comentário inválido.');
  var s = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[removido]')
    .replace(/(?:\d[\s.\-()\/]*){7,}/g, '[removido]')
    .replace(/\s+/g, ' ')
    .trim();
  return s.slice(0, max);
}
