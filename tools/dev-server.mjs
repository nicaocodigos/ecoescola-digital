/**
 * Servidor de desenvolvimento local (somente para testes).
 *  - Serve os arquivos estáticos do projeto.
 *  - Responde em /api usando a MESMA lógica do Apps Script (apps-script/Core.gs).
 *  - Grava os dados em dev-data/db.json (não versionado).
 *
 * Uso:  ADMIN_PASSWORD="uma-senha-local" node tools/dev-server.mjs
 * Depois abra http://localhost:8080/?escola=A
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCore, createMemoryStore } from './load-core.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT || 8080);
const DB_DIR = join(ROOT, 'dev-data');
const DB_FILE = join(DB_DIR, 'db.json');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const core = loadCore();
const store = createMemoryStore({
  adminPassword: process.env.ADMIN_PASSWORD || null,
  load: () => (existsSync(DB_FILE) ? JSON.parse(readFileSync(DB_FILE, 'utf8')) : null),
  save: (db) => {
    mkdirSync(DB_DIR, { recursive: true });
    writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  },
});

async function handleApi(req, res) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 100_000) break;
  }
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    payload = null;
  }
  const result = payload ? core.handleRequest(payload, store) : { ok: false, error: 'invalid_json', message: 'JSON inválido.' };
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(result));
}

async function handleStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, path));
  // Bloqueia acesso fora da pasta do projeto e a arquivos internos.
  if (!file.startsWith(ROOT) || /[\\/](dev-data|tools|apps-script|\.git)[\\/]/.test(file)) {
    res.writeHead(403).end('Proibido');
    return;
  }
  try {
    if (!(await stat(file)).isFile()) throw new Error('not file');
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Não encontrado');
  }
}

createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    if (req.method !== 'POST') return res.writeHead(405).end();
    return handleApi(req, res);
  }
  return handleStatic(req, res);
}).listen(PORT, () => {
  console.log(`EcoEscola Digital (dev) em http://localhost:${PORT}/?escola=A`);
  console.log(`Painel: http://localhost:${PORT}/admin.html`);
  if (!process.env.ADMIN_PASSWORD) console.log('Aviso: defina ADMIN_PASSWORD para usar o painel administrativo.');
});
