// РЫБАК — сервер: раздаёт игру, держит комнаты, передаёт друзьям положение, события, чат и голос.
// Рыбалка считается в браузере каждого игрока; сервер — общие часы бухты, рынок (по зерну комнаты) и связь.
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { Voice, bucket } from './voice.js';
import { MAX_PLAYERS } from '../shared/data.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ROOM_IDLE_MS = 15 * 60 * 1000; // пустая комната живёт 15 минут
const GRACE_MS = 90 * 1000; // столько держим место за игроком после обрыва связи
const TICK_MS = 80;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};
const LONG_CACHE = new Set(['.mp3', '.png', '.webp', '.jpg', '.woff2', '.ico']);
const GZIP = new Set(['.html', '.js', '.css', '.svg', '.json', '.txt', '.webmanifest']);
const gzCache = new Map();

class GameError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeCode(rooms) {
  for (;;) {
    let c = '';
    for (let i = 0; i < 4; i++) c += ALPHABET[crypto.randomInt(ALPHABET.length)];
    if (!rooms.has(c)) return c;
  }
}
const EVENTS = new Set(['cast', 'land', 'bite', 'hook', 'catch', 'lost', 'emote', 'sold', 'reel', 'jump', 'buy', 'boat']);

// карточка игрока: имя, внешность, что в руках — всё, что видят друзья
function cleanCard(c) {
  c = c && typeof c === 'object' ? c : {};
  let look = null;
  try {
    const s = JSON.stringify(c.look || {});
    if (s.length <= 2500) look = JSON.parse(s);
  } catch {
    look = null;
  }
  const str = (v, n) => String(v == null ? '' : v).slice(0, n);
  const name = str(c.name, 16).replace(/[\u0000-\u001f<>]/g, '').trim() || 'Рыбак';
  return { name, look: look || {}, rod: str(c.rod, 12), fl: str(c.fl, 12), line: str(c.line, 12), lvl: Math.max(1, Math.min(99, Math.round(Number(c.lvl) || 1))) };
}
function cleanState(a) {
  if (!Array.isArray(a) || a.length > 20) return null;
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    const v = Number(a[i]);
    if (!Number.isFinite(v)) return null;
    out[i] = Math.round(v * 1000) / 1000;
  }
  return out;
}

export function createServer({ now = () => Date.now() } = {}) {
  const rooms = new Map(); // код → комната
  const sockets = new Map(); // ws → { roomCode, playerId, chat, ev }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://local');
    if (url.pathname === '/health') {
      let players = 0;
      for (const r of rooms.values()) for (const p of r.players.values()) if (p.ws) players++;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, rooms: rooms.size, players }));
      return;
    }
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/' || !path.extname(rel)) rel = '/index.html';
    const file = path.normalize(path.join(PUBLIC_DIR, rel));
    if (!file.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('Не найдено');
        return;
      }
      const ext = path.extname(file);
      const etag = `"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
      const headers = {
        'content-type': MIME[ext] || 'application/octet-stream',
        'cache-control': LONG_CACHE.has(ext) ? 'public, max-age=604800' : 'no-cache',
        etag,
        'x-content-type-options': 'nosniff'
      };
      if (GZIP.has(ext)) headers.vary = 'accept-encoding';
      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304, headers);
        res.end();
        return;
      }
      if (GZIP.has(ext) && st.size > 1024 && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
        const hit = gzCache.get(file);
        const done = (buf) => {
          res.writeHead(200, { ...headers, 'content-encoding': 'gzip', 'content-length': buf.length });
          res.end(buf);
        };
        if (hit && hit.etag === etag) return done(hit.buf);
        return fs.readFile(file, (e2, raw) => {
          if (e2) {
            res.writeHead(500);
            return res.end();
          }
          zlib.gzip(raw, { level: 9 }, (e3, buf) => {
            if (e3) {
              res.writeHead(200, headers);
              return res.end(raw);
            }
            gzCache.set(file, { etag, buf });
            done(buf);
          });
        });
      }
      res.writeHead(200, headers);
      fs.createReadStream(file).pipe(res);
    });
  });

  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 16384 });
  const send = (ws, msg) => {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
  };
  const voice = new Voice({ sendJson: send, sockets });

  const pub = (p) => ({ id: p.id, slot: p.slot, card: p.card, mode: p.mode, st: p.st });
  function broadcast(room, msg, except = null) {
    const raw = JSON.stringify(msg);
    for (const p of room.players.values()) if (p.ws && p.ws !== except && p.ws.readyState === 1) p.ws.send(raw);
  }
  function makeRoom() {
    const code = makeCode(rooms);
    const room = { code, seed: crypto.randomBytes(6).toString('hex'), t0: now(), players: new Map(), hostId: 0, nextId: 1, lastActive: now() };
    rooms.set(code, room);
    return room;
  }
  function addPlayer(room, card) {
    const live = [...room.players.values()];
    if (live.length >= MAX_PLAYERS) {
      // место могут держать те, у кого оборвалась связь, — освобождаем самое давнее
      const gone = live.filter((p) => !p.ws).sort((a, b) => a.lostAt - b.lostAt)[0];
      if (!gone) throw new GameError('FULL', `В комнате уже ${MAX_PLAYERS} рыбаков`);
      room.players.delete(gone.id);
    }
    const used = new Set([...room.players.values()].map((p) => p.slot));
    let slot = 0;
    while (used.has(slot)) slot++;
    const p = { id: room.nextId++, token: crypto.randomBytes(12).toString('hex'), slot, card: cleanCard(card), mode: 'lobby', st: null, ws: null, lostAt: 0 };
    room.players.set(p.id, p);
    if (!room.hostId) room.hostId = p.id;
    return p;
  }
  function attach(ws, room, p) {
    if (p.ws && p.ws !== ws) {
      const old = sockets.get(p.ws);
      if (old) old.playerId = null;
      send(p.ws, { t: 'replaced' });
      try {
        p.ws.close(4000, 'replaced');
      } catch {
        /* уже закрыт */
      }
    }
    const info = sockets.get(ws);
    info.roomCode = room.code;
    info.playerId = p.id;
    const back = !!p.lostAt;
    p.ws = ws;
    p.lostAt = 0;
    room.lastActive = now();
    send(ws, {
      t: 'joined', code: room.code, id: p.id, token: p.token, slot: p.slot, seed: room.seed, t0: room.t0, now: now(), host: room.hostId,
      players: [...room.players.values()].filter((o) => o.ws && o.id !== p.id).map(pub)
    });
    send(ws, { t: 'vroster', list: voice.roster(room.code) });
    broadcast(room, { t: 'in', p: pub(p), back }, ws);
  }
  function dropPlayer(room, p, why) {
    room.players.delete(p.id);
    broadcast(room, { t: 'out', id: p.id, why });
    if (room.hostId === p.id) {
      const next = [...room.players.values()].find((o) => o.ws) || [...room.players.values()][0];
      room.hostId = next ? next.id : 0;
      if (next) broadcast(room, { t: 'host', id: next.id });
    }
    room.lastActive = now();
  }

  function handle(ws, msg) {
    const info = sockets.get(ws);
    switch (msg.t) {
      case 'ping':
        return send(ws, { t: 'pong', at: now(), c: msg.c });
      case 'create': {
        if (info.playerId) leaveRoom(ws);
        const room = makeRoom();
        return attach(ws, room, addPlayer(room, msg.card));
      }
      case 'join': {
        const room = rooms.get(String(msg.code || '').trim().toUpperCase());
        if (!room) throw new GameError('NO_ROOM', 'Комнаты с таким кодом нет. Проверьте код или попросите новую ссылку.');
        if (info.playerId) leaveRoom(ws);
        // вернулся после обрыва связи или перезагрузки страницы — отдаём прежнее место
        const old = msg.token && [...room.players.values()].find((p) => p.token === String(msg.token));
        if (old) {
          old.card = cleanCard(msg.card);
          return attach(ws, room, old);
        }
        return attach(ws, room, addPlayer(room, msg.card));
      }
      case 'peek': {
        const room = rooms.get(String(msg.code || '').trim().toUpperCase());
        return send(ws, { t: 'peek', code: String(msg.code || ''), exists: !!room, players: room ? [...room.players.values()].filter((p) => p.ws).length : 0 });
      }
      default:
        break;
    }
    const room = info.roomCode && rooms.get(info.roomCode);
    const p = room && room.players.get(info.playerId);
    if (!p) throw new GameError('NO_ROOM', 'Вы не в комнате');
    room.lastActive = now();
    switch (msg.t) {
      case 'st': {
        const s = cleanState(msg.s);
        if (s) {
          p.st = s;
          p.dirty = true;
        }
        return;
      }
      case 'card':
        p.card = cleanCard(msg.card);
        return broadcast(room, { t: 'card', id: p.id, card: p.card }, ws);
      case 'mode':
        p.mode = msg.m === 'world' ? 'world' : 'lobby';
        return broadcast(room, { t: 'mode', id: p.id, m: p.mode }, ws);
      case 'ev': {
        if (!EVENTS.has(msg.k) || !info.ev()) return;
        let d = null;
        try {
          const s = JSON.stringify(msg.d ?? null);
          if (s.length <= 400) d = JSON.parse(s);
        } catch {
          d = null;
        }
        return broadcast(room, { t: 'ev', id: p.id, k: msg.k, d }, ws);
      }
      case 'chat': {
        const text = String(msg.text || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 200);
        if (!text || !info.chat()) return;
        return broadcast(room, { t: 'chat', id: p.id, text });
      }
      case 'vjoin': {
        const r = voice.join(ws, room.code, p.id, msg.muted);
        if (r.error) throw new GameError('VOICE_FULL', r.error);
        return;
      }
      case 'vleave':
        return voice.leave(ws);
      case 'vsignal':
        return voice.signal(ws, msg.to, msg.data);
      case 'vmute':
        return voice.mute(ws, msg.muted);
      case 'leave':
        leaveRoom(ws);
        return send(ws, { t: 'left' });
      default:
        throw new GameError('UNKNOWN', 'Неизвестная команда');
    }
  }
  function leaveRoom(ws) {
    const info = sockets.get(ws);
    voice.leave(ws);
    const room = info.roomCode && rooms.get(info.roomCode);
    const p = room && room.players.get(info.playerId);
    if (p) dropPlayer(room, p, 'left');
    info.roomCode = null;
    info.playerId = null;
  }

  wss.on('connection', (ws) => {
    sockets.set(ws, { roomCode: null, playerId: null, chat: bucket(1.5, 6), ev: bucket(12, 40) });
    ws.on('message', (raw, isBinary) => {
      if (isBinary) return voice.frame(ws, raw);
      let msg;
      try {
        msg = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (!msg || typeof msg !== 'object') return;
      try {
        handle(ws, msg);
      } catch (e) {
        if (e instanceof GameError) send(ws, { t: 'error', code: e.code, message: e.message, req: msg.t });
        else {
          console.error('ошибка обработки', msg.t, e);
          send(ws, { t: 'error', code: 'INTERNAL', message: 'Что-то пошло не так на сервере', req: msg.t });
        }
      }
    });
    ws.on('close', () => {
      voice.leave(ws);
      const info = sockets.get(ws);
      sockets.delete(ws);
      const room = info && info.roomCode && rooms.get(info.roomCode);
      const p = room && room.players.get(info.playerId);
      if (p && p.ws === ws) {
        // связь оборвалась: друзья сразу перестают видеть рыбака, но место и жетон ждут его возвращения
        p.ws = null;
        p.lostAt = now();
        broadcast(room, { t: 'out', id: p.id, why: 'lost' });
        if (room.hostId === p.id) {
          const next = [...room.players.values()].find((o) => o.ws);
          if (next) {
            room.hostId = next.id;
            broadcast(room, { t: 'host', id: next.id });
          }
        }
      }
    });
    ws.on('error', () => {});
  });

  // рассылка положений: 12 раз в секунду, только изменившиеся
  const tick = setInterval(() => {
    for (const room of rooms.values()) {
      const moved = [];
      for (const p of room.players.values()) {
        if (p.dirty && p.ws && p.mode === 'world') moved.push([p.id, p.st]);
        p.dirty = false;
      }
      if (!moved.length) continue;
      for (const p of room.players.values()) {
        if (!p.ws || p.ws.readyState !== 1 || p.ws.bufferedAmount > 256 * 1024) continue;
        const a = moved.filter((m) => m[0] !== p.id);
        if (a.length) p.ws.send(JSON.stringify({ t: 'sts', a }));
      }
    }
  }, TICK_MS);
  tick.unref();

  const sweep = setInterval(() => {
    const t = now();
    for (const [code, room] of rooms) {
      for (const p of [...room.players.values()]) if (!p.ws && t - p.lostAt > GRACE_MS) room.players.delete(p.id);
      const anyone = [...room.players.values()].some((p) => p.ws);
      if (!anyone && t - room.lastActive > ROOM_IDLE_MS) {
        rooms.delete(code);
        voice.dropRoom(code);
      }
    }
  }, 30 * 1000);
  sweep.unref();

  return { server, wss, rooms, voice, close: () => (clearInterval(tick), clearInterval(sweep), wss.close(), server.close()) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  const { server } = createServer();
  server.listen(port, () => console.log(`Рыбак слушает порт ${port}`));
}
