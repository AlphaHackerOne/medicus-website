/**
 * Medicus Platform — Local/Git Server
 * Run: node server.js
 * Then open: http://localhost:3000
 *
 * Data is stored permanently in data.json in this directory.
 * On first run, data.json is created automatically.
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT      = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const HTML_FILE = path.join(__dirname, 'index.html');

// ── Ensure data.json exists ──────────────────────────────────────────────────
function ensureData() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultPwd = Math.random().toString(36).slice(2, 10).toUpperCase();
    const init = { modules: [], topics: {}, stats: { exams: 0 }, adminPassword: defaultPwd };
    fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2));
    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│  Medicus — First Run Setup               │');
    console.log(`│  Admin password: ${defaultPwd.padEnd(23)}│`);
    console.log('│  Change it in Admin → Settings           │');
    console.log('└─────────────────────────────────────────┘\n');
  }
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { modules: [], topics: {}, stats: { exams: 0 }, adminPassword: 'CHANGE_ME' }; }
}

function writeData(d) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}

// ── CORS + JSON helpers ──────────────────────────────────────────────────────
function jsonRes(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password'
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

function authCheck(req, res) {
  const d = readData();
  const pwd = req.headers['x-admin-password'];
  if (pwd !== d.adminPassword) { jsonRes(res, 401, { error: 'Unauthorized' }); return false; }
  return true;
}

// ── Router ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // OPTIONS preflight
  if (req.method === 'OPTIONS') { jsonRes(res, 200, {}); return; }

  // Serve index.html
  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    const html = fs.readFileSync(HTML_FILE);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // ── API routes ──────────────────────────────────────────────────────────────

  // GET /api/data  — read all (public: modules + topics only)
  if (req.method === 'GET' && pathname === '/api/data') {
    const d = readData();
    jsonRes(res, 200, { modules: d.modules, topics: d.topics, stats: d.stats });
    return;
  }

  // POST /api/auth/check  — verify admin password
  if (req.method === 'POST' && pathname === '/api/auth/check') {
    const body = await readBody(req);
    const d = readData();
    jsonRes(res, 200, { ok: body.password === d.adminPassword });
    return;
  }

  // POST /api/auth/change  — change admin password
  if (req.method === 'POST' && pathname === '/api/auth/change') {
    if (!authCheck(req, res)) return;
    const body = await readBody(req);
    if (!body.newPassword || body.newPassword.length < 6) {
      jsonRes(res, 400, { error: 'Password must be at least 6 characters' }); return;
    }
    const d = readData();
    d.adminPassword = body.newPassword;
    writeData(d);
    jsonRes(res, 200, { ok: true });
    return;
  }

  // GET /api/admin/password-hint  — first 2 chars for display only (auth required)
  if (req.method === 'GET' && pathname === '/api/admin/password-hint') {
    if (!authCheck(req, res)) return;
    const d = readData();
    jsonRes(res, 200, { hint: d.adminPassword.slice(0,2)+'***' });
    return;
  }

  // PUT /api/modules  — save modules array
  if (req.method === 'PUT' && pathname === '/api/modules') {
    if (!authCheck(req, res)) return;
    const body = await readBody(req);
    const d = readData();
    d.modules = body.modules || [];
    writeData(d);
    jsonRes(res, 200, { ok: true });
    return;
  }

  // PUT /api/topics  — save topics object
  if (req.method === 'PUT' && pathname === '/api/topics') {
    if (!authCheck(req, res)) return;
    const body = await readBody(req);
    const d = readData();
    d.topics = body.topics || {};
    writeData(d);
    jsonRes(res, 200, { ok: true });
    return;
  }

  // DELETE /api/topics/:key  — delete one topic
  if (req.method === 'DELETE' && pathname.startsWith('/api/topics/')) {
    if (!authCheck(req, res)) return;
    const key = decodeURIComponent(pathname.slice('/api/topics/'.length));
    const d = readData();
    delete d.topics[key];
    writeData(d);
    jsonRes(res, 200, { ok: true });
    return;
  }

  // PUT /api/stats  — update stats
  if (req.method === 'PUT' && pathname === '/api/stats') {
    const body = await readBody(req);
    const d = readData();
    d.stats = { ...d.stats, ...body };
    writeData(d);
    jsonRes(res, 200, { ok: true });
    return;
  }

  // POST /api/import  — bulk import
  if (req.method === 'POST' && pathname === '/api/import') {
    if (!authCheck(req, res)) return;
    const body = await readBody(req);
    if (!body.modules || !body.topics) { jsonRes(res, 400, { error: 'Invalid import format' }); return; }
    const d = readData();
    d.modules = body.modules;
    d.topics = body.topics;
    writeData(d);
    jsonRes(res, 200, { ok: true, modules: body.modules.length, topics: Object.keys(body.topics).length });
    return;
  }

  // 404
  jsonRes(res, 404, { error: 'Not found' });
});

ensureData();
server.listen(PORT, () => {
  console.log(`Medicus running → http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
