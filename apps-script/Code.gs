/**
 * EcoEscola Digital — adaptador Google Apps Script + Google Sheets.
 *
 * Arquivos do projeto Apps Script: Code.gs (este), Core.gs e AnswerKey.gs.
 * Passo a passo de instalação: docs/INTEGRACAO.md.
 *
 * Propriedades do script (Configurações do projeto > Propriedades do script):
 *  - ADMIN_PASSWORD        → defina a senha aqui e execute protegerSenhaAdmin() uma vez.
 *                            A função converte em hash (SHA-256 + salt) e apaga o texto puro.
 *  - SPREADSHEET_ID        → opcional; se o script não estiver vinculado à planilha.
 */

var SHEET_RECORDS = 'Registros';
var RECORD_HEADERS = ['submissionId', 'receivedAt', 'source', 'type', 'school', 'level', 'participantCode',
  'score', 'total', 'percent', 'detail', 'themes', 'answers', 'extra', 'clientTime'];
var JSON_FIELDS = ['detail', 'themes', 'answers', 'extra'];
var TOKEN_TTL_SECONDS = 6 * 60 * 60;
var LOGIN_LOCK_SECONDS = 15 * 60;

/** O navegador envia POST com Content-Type text/plain (evita preflight CORS). */
function doPost(e) {
  var req;
  try {
    req = JSON.parse(e && e.postData ? e.postData.contents : '');
  } catch (err) {
    return jsonOutput(fail('invalid_json', 'JSON inválido.'));
  }
  return jsonOutput(handleRequest(req, sheetStore()));
}

/** Verificação simples de disponibilidade (abrir a URL no navegador). */
function doGet() {
  return jsonOutput({ ok: true, service: 'EcoEscola Digital', time: new Date().toISOString() });
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Execute uma vez pelo editor: cria a aba "Registros" com cabeçalhos. */
function setup() {
  var sheet = recordsSheet();
  Logger.log('Planilha pronta: ' + sheet.getParent().getUrl());
}

/** Execute uma vez após definir ADMIN_PASSWORD nas propriedades do script. */
function protegerSenhaAdmin() {
  var props = PropertiesService.getScriptProperties();
  var plain = props.getProperty('ADMIN_PASSWORD');
  if (!plain || plain.length < 10) throw new Error('Defina ADMIN_PASSWORD com pelo menos 10 caracteres nas propriedades do script.');
  var salt = Utilities.getUuid();
  props.setProperty('ADMIN_PASSWORD_SALT', salt);
  props.setProperty('ADMIN_PASSWORD_HASH', sha256Hex(salt + plain));
  props.deleteProperty('ADMIN_PASSWORD');
  Logger.log('Senha protegida. O texto puro foi apagado das propriedades.');
}

function sha256Hex(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); })
    .join('');
}

function spreadsheet() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function recordsSheet() {
  var ss = spreadsheet();
  var sheet = ss.getSheetByName(SHEET_RECORDS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_RECORDS);
    sheet.getRange(1, 1, 1, RECORD_HEADERS.length).setValues([RECORD_HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    // Formato texto evita que o Sheets converta códigos/datas automaticamente.
    sheet.getRange('A:G').setNumberFormat('@');
    sheet.getRange('K:O').setNumberFormat('@');
  }
  return sheet;
}

/** Impede que textos iniciados por = + - @ sejam interpretados como fórmula. */
function safeCell(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v;
  if (typeof v === 'object') v = JSON.stringify(v);
  v = String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

/** Implementação do `store` usado por Core.gs. */
function sheetStore() {
  var props = PropertiesService.getScriptProperties();
  var cache = CacheService.getScriptCache();
  var rowsCache = null;

  function readRows() {
    if (rowsCache) return rowsCache;
    var sheet = recordsSheet();
    var last = sheet.getLastRow();
    rowsCache = last < 2 ? [] : sheet.getRange(2, 1, last - 1, RECORD_HEADERS.length).getValues();
    return rowsCache;
  }

  function idx(name) { return RECORD_HEADERS.indexOf(name); }

  return {
    now: function () { return new Date().toISOString(); },

    withLock: function (fn) {
      var lock = LockService.getScriptLock();
      lock.waitLock(20000);
      try { rowsCache = null; return fn(); } finally { lock.releaseLock(); }
    },

    hasSubmission: function (id) {
      return readRows().some(function (r) { return String(r[idx('submissionId')]) === id; });
    },

    hasCodeType: function (code, type) {
      return readRows().some(function (r) {
        return String(r[idx('participantCode')]) === code && String(r[idx('type')]) === type;
      });
    },

    append: function (rec) {
      recordsSheet().appendRow(RECORD_HEADERS.map(function (h) { return safeCell(rec[h]); }));
      rowsCache = null;
    },

    listRecords: function () {
      return readRows().map(function (row) {
        var o = {};
        RECORD_HEADERS.forEach(function (h, i) {
          var v = row[i];
          if (v instanceof Date) v = v.toISOString();
          if (typeof v === 'string' && v.charAt(0) === "'") v = v.slice(1);
          if (JSON_FIELDS.indexOf(h) >= 0) {
            try { v = v ? JSON.parse(v) : null; } catch (e) { v = null; }
          }
          if ((h === 'score' || h === 'total' || h === 'percent') && v !== '' && v !== null) v = Number(v);
          if (v === '') v = null;
          o[h] = v;
        });
        return o;
      });
    },

    getConfig: function () {
      var raw = props.getProperty('APP_CONFIG');
      try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
    },

    setConfig: function (cfg) { props.setProperty('APP_CONFIG', JSON.stringify(cfg)); },

    isPasswordConfigured: function () { return !!props.getProperty('ADMIN_PASSWORD_HASH'); },

    verifyPassword: function (pw) {
      var hash = props.getProperty('ADMIN_PASSWORD_HASH');
      var salt = props.getProperty('ADMIN_PASSWORD_SALT') || '';
      var given = sha256Hex(salt + pw);
      // comparação em tempo constante
      var diff = hash.length ^ given.length;
      for (var i = 0; i < Math.min(hash.length, given.length); i++) diff |= hash.charCodeAt(i) ^ given.charCodeAt(i);
      return diff === 0;
    },

    getLoginFailures: function () { return Number(cache.get('login_failures') || 0); },
    registerLoginFailure: function () {
      cache.put('login_failures', String(this.getLoginFailures() + 1), LOGIN_LOCK_SECONDS);
    },
    resetLoginFailures: function () { cache.remove('login_failures'); },

    createToken: function () {
      var token = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
      cache.put('tok_' + token, '1', TOKEN_TTL_SECONDS);
      return token;
    },
    isValidToken: function (t) { return /^[a-f0-9]{64}$/.test(t) && cache.get('tok_' + t) === '1'; },
    revokeToken: function (t) { if (/^[a-f0-9]{64}$/.test(t)) cache.remove('tok_' + t); },
  };
}
