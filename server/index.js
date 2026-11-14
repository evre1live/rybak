// РЫБАК — сервер: раздаёт игру, держит комнаты, передаёт друзьям положение, события, чат и голос.
// Рыбалка считается в браузере каждого игрока; сервер — общие часы бухты, рынок (по зерну комнаты) и связь.
// Ещё он хранит сохранения игроков и таблицу рекордов (server/api.js, server/store.js), если ему дали базу.
// Комнаты живут в памяти, но каждая записана в базу: после перезапуска сервера игроки возвращаются в ту же комнату.
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { Voice, bucket } from './voice.js';
import { createApi } from './api.js';
import { openStore, selfCheck } from './store.js';
import { MAX_PLAYERS } from '../shared/data.js';
import { TOURS, TOUR_LENS, TOUR_COUNTDOWN, tourBlank, tourAdd, tourTable } from '../shared/logic.js';
import { cleanLoc, canHost, locOf } from '../shared/locations.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ROOM_IDLE_MS = 15 * 60 * 1000; // пустая комната живёт 15 минут
const GRACE_MS = 90 * 1000; // столько держим место за игроком после обрыва связи
const TICK_MS = 80;
const SAVE_MS = 2000; // комната изменилась — запись в базу уходит не позже чем через столько
const BEAT_MS = 60 * 1000; // как часто отмечаем в базе комнаты, где есть люди
const HOLD_MS = 30 * 1000; // комната вернулась из базы: столько ждём её хозяина и не подводим итоги турнира
const STORE_WAIT_MS = 15 * 1000; // сервер только что запустился и ещё не подключился к базе: столько ждём её, прежде чем сказать «комнаты нет»
const MISS_MS = 20 * 1000; // столько помним, что комнаты с таким кодом в базе нет

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.webm': 'audio/webm', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
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
const CODE_RE = /^[A-HJ-NP-Z2-9]{4}$/;
/** Код новой комнаты: не занятый ни в памяти, ни среди комнат, оставшихся в базе от прошлого запуска (taken). */
function makeCode(rooms, taken) {
  for (;;) {
    let c = '';
    for (let i = 0; i < 4; i++) c += ALPHABET[crypto.randomInt(ALPHABET.length)];
    if (!rooms.has(c) && !taken.has(c)) return c;
  }
}
/** Отпечаток жетона места: в базе и в памяти сверяем по нему, сам жетон знает только игрок. */
const hashToken = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');
const EVENTS = new Set(['cast', 'land', 'bite', 'hook', 'catch', 'lost', 'emote', 'sold', 'reel', 'jump', 'buy', 'boat', 'assist']);

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
  return { name, look: look || {}, rod: str(c.rod, 12), reel: str(c.reel, 12), fl: str(c.fl, 12), line: str(c.line, 12), lvl: Math.max(1, Math.min(99, Math.round(Number(c.lvl) || 1))) };
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

/**
 * store — хранилище сохранений и комнат (server/store.js); его можно дать и позже, через setStore: игра работает и без него.
 * storeSoon — хранилище вот-вот подключится (сервер только что запущен): вход в комнату, которой нет в памяти, его подождёт.
 * saveMs — через сколько изменившаяся комната уходит в базу. log — куда писать заметки о работе (в проверках — никуда).
 */
export function createServer({ now = () => Date.now(), store = null, storeSoon = false, saveMs = SAVE_MS, log = (text) => console.log(text) } = {}) {
  const rooms = new Map(); // код → комната
  const sockets = new Map(); // ws → { roomCode, playerId, chat, ev, find, wait }
  const db = { store, soonUntil: storeSoon && !store ? Date.now() + STORE_WAIT_MS : 0, waiters: [] };
  const api = createApi({ getStore: () => db.store, now });
  // запись комнат в базу: dirty — что изменилось, loading — какие комнаты сейчас читаем, miss — каких в базе нет,
  // taken — коды, оставшиеся в базе от прошлого запуска, restored — сколько комнат вернули из базы
  const keep = { dirty: new Set(), timer: null, chain: Promise.resolve(), loading: new Map(), miss: new Map(), taken: new Set(), restored: 0, failed: 0 };
  const started = Date.now();

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://local');
    if (url.pathname === '/health') {
      let players = 0;
      for (const r of rooms.values()) for (const p of r.players.values()) if (p.ws) players++;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, rooms: rooms.size, players, db: !!db.store, up: Math.round((Date.now() - started) / 1000), restored: keep.restored }));
      return;
    }
    if (url.pathname.startsWith('/api/')) return api(req, res, url);
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
  /** Новая комната. loc — локация: её выбирает создатель, комната помнит её до конца (в том числе после перезапуска). */
  function makeRoom(loc) {
    const code = makeCode(rooms, keep.taken);
    const room = { code, loc: cleanLoc(loc), seed: crypto.randomBytes(6).toString('hex'), t0: now(), players: new Map(), hostId: 0, nextId: 1, lastActive: now(), hold: 0 };
    rooms.set(code, room);
    keep.miss.delete(code);
    return room;
  }

  // ───── комнаты в базе: записываем при каждой перемене, возвращаем после перезапуска ─────
  const storeDue = () => !!db.store || db.soonUntil > Date.now();
  /** Хранилище: сразу, если оно есть или его не будет; если сервер только запустился — когда подключится (или null, не дождавшись). */
  function whenStore() {
    if (db.store || db.soonUntil <= Date.now()) return Promise.resolve(db.store);
    return new Promise((ok) => {
      const done = (st) => {
        clearTimeout(t);
        const i = db.waiters.indexOf(done);
        if (i >= 0) db.waiters.splice(i, 1);
        ok(st);
      };
      const t = setTimeout(() => done(db.store), Math.max(0, db.soonUntil - Date.now()));
      db.waiters.push(done);
    });
  }
  function setStore(st) {
    db.store = st;
    db.soonUntil = 0;
    for (const w of [...db.waiters]) w(st);
    if (!st) return;
    // что успело измениться без базы — записать; коды комнат прошлого запуска новым комнатам не давать
    for (const code of rooms.keys()) keep.dirty.add(code);
    plan();
    st.roomCodes(now() - ROOM_IDLE_MS).then((list) => {
      keep.taken = new Set(list.filter((c) => !rooms.has(c)));
    }).catch((e) => console.error('комнаты: не удалось прочитать список из базы —', e.message));
  }
  /** Что из комнаты нужно, чтобы вернуть её после перезапуска. Положения игроков не нужны: их пришлют заново. */
  const snapshot = (room) => ({
    v: 1, loc: room.loc, seed: room.seed, t0: room.t0, hostId: room.hostId, nextId: room.nextId, tourN: room.tourN || 0,
    tour: room.tour ? pubTour(room.tour) : null,
    players: [...room.players.values()].map((p) => ({ id: p.id, th: p.th, slot: p.slot, card: p.card, mode: p.mode }))
  });
  const plan = (ms = saveMs) => {
    if (keep.timer || !db.store || !keep.dirty.size) return;
    keep.timer = setTimeout(() => {
      keep.timer = null;
      flush();
    }, ms);
    keep.timer.unref();
  };
  /** Комната изменилась (или её не стало) — записать в базу, не чаще раза в saveMs. */
  function touch(code) {
    if (!storeDue()) return;
    keep.dirty.add(code);
    plan();
  }
  /** Записать в базу всё изменившееся. Записи идут по очереди; что не удалось — повторится позже. */
  function flush() {
    keep.chain = keep.chain.then(async () => {
      const st = db.store;
      if (!st || !keep.dirty.size) return;
      const codes = [...keep.dirty];
      keep.dirty.clear();
      let bad = null;
      for (const code of codes) {
        const room = rooms.get(code);
        try {
          if (room) await st.saveRoom(code, snapshot(room), [...room.players.values()].some((p) => p.ws) ? now() : room.lastActive);
          else await st.dropRoom(code);
        } catch (e) {
          keep.dirty.add(code);
          bad = e;
        }
      }
      if (bad) {
        // база моргнула: не шумим на каждую попытку, пробуем реже
        if (!keep.failed++) console.error('комнаты: не удалось записать в базу —', bad.message);
        plan(15000);
      } else keep.failed = 0;
    });
    return keep.chain;
  }
  /** Вернуть комнату из записи в базе: все её игроки — «потеряли связь» и ждут возвращения, турнир и часы — как были. */
  function revive(code, d) {
    const t = now();
    // у комнат, записанных до появления локаций, поля loc нет — это бухта
    const room = { code, loc: cleanLoc(d.loc), seed: String(d.seed || ''), t0: Number(d.t0) || t, players: new Map(), hostId: 0, nextId: 1, lastActive: t, hold: t + HOLD_MS, tourN: Number(d.tourN) || 0 };
    for (const q of Array.isArray(d.players) ? d.players : []) {
      const id = Number(q && q.id) | 0;
      if (id <= 0 || typeof q.th !== 'string' || room.players.has(id) || room.players.size >= MAX_PLAYERS) continue;
      room.players.set(id, { id, th: q.th, token: null, slot: Math.max(0, Number(q.slot) | 0), card: cleanCard(q.card), mode: q.mode === 'world' ? 'world' : 'lobby', st: null, ws: null, lostAt: t });
      room.nextId = Math.max(room.nextId, id + 1);
    }
    room.nextId = Math.max(room.nextId, Number(d.nextId) | 0);
    room.hostId = room.players.has(Number(d.hostId) | 0) ? Number(d.hostId) | 0 : 0;
    const tr = d.tour;
    if (tr && TOURS[tr.kind] && Number(tr.end) > 0) {
      const scores = new Map();
      for (const r of Array.isArray(tr.scores) ? tr.scores : []) if (r && r.s && Number(r.id) > 0) scores.set(Number(r.id), r);
      room.tour = { id: Number(tr.id) | 0, kind: tr.kind, len: Number(tr.len) || TOUR_LENS[1], start: Number(tr.start) || 0, end: Number(tr.end), by: Number(tr.by) | 0, scores };
    }
    rooms.set(code, room);
    keep.taken.delete(code);
    keep.restored++;
    log(`комната ${code} вернулась из базы: мест ${room.players.size}${room.loc !== 'bay' ? `, локация ${room.loc}` : ''}${room.tour ? ', идёт турнир' : ''}`);
    return room;
  }
  /** Стоит ли искать комнату в базе: код похож на настоящий, база есть (или вот-вот будет) и мы не искали его только что. */
  const canRecall = (code) => CODE_RE.test(code) && storeDue() && !(keep.miss.get(code) > Date.now());
  /** Комната, которой нет в памяти: возможно, сервер перезапускался — читаем её из базы. → Promise<комната | null> */
  function recall(code) {
    let job = keep.loading.get(code);
    if (job) return job;
    job = whenStore()
      .then((st) => (st && !rooms.has(code) ? st.loadRoom(code, now() - ROOM_IDLE_MS) : null))
      .then((row) => {
        if (rooms.has(code)) return rooms.get(code);
        if (row && row.data) return revive(code, row.data);
        if (keep.miss.size > 4000) keep.miss.clear();
        keep.miss.set(code, Date.now() + MISS_MS);
        return null;
      })
      .catch((e) => {
        console.error('комнаты: не удалось прочитать из базы —', e.message);
        return null;
      })
      .finally(() => keep.loading.delete(code));
    keep.loading.set(code, job);
    return job;
  }
  /** Хозяина нет на месте — комната переходит первому, кто на связи. */
  function fixHost(room) {
    const host = room.players.get(room.hostId);
    if (host && host.ws) return;
    const next = [...room.players.values()].find((o) => o.ws);
    if (!next) return;
    room.hostId = next.id;
    broadcast(room, { t: 'host', id: next.id });
    touch(room.code);
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
    const token = crypto.randomBytes(12).toString('hex');
    const p = { id: room.nextId++, token, th: hashToken(token), slot, card: cleanCard(card), mode: 'lobby', st: null, ws: null, lostAt: 0 };
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
    // хозяин ушёл или потерял связь, когда в комнате больше никого не было, — она переходит тому, кто пришёл.
    // Комната только что вернулась из базы — хозяина ещё ждём: он возвращается вместе со всеми
    const host = room.players.get(room.hostId);
    if (!host || (!host.ws && !(room.hold > now()))) {
      room.hostId = p.id;
      broadcast(room, { t: 'host', id: p.id }, ws);
    }
    touch(room.code);
    send(ws, {
      t: 'joined', code: room.code, loc: room.loc, id: p.id, token: p.token, slot: p.slot, seed: room.seed, t0: room.t0, now: now(), host: room.hostId,
      players: [...room.players.values()].filter((o) => o.ws && o.id !== p.id).map(pub),
      tour: room.tour ? pubTour(room.tour) : null // турнир уже идёт — опоздавший сразу видит таблицу
    });
    send(ws, { t: 'vroster', list: voice.roster(room.code) });
    broadcast(room, { t: 'in', p: pub(p), back }, ws);
  }
  // ───── турнир: запускает хозяин комнаты, очки считаются здесь же по событиям улова ─────
  const pubTour = (t) => ({ id: t.id, kind: t.kind, len: t.len, start: t.start, end: t.end, by: t.by, scores: [...t.scores.values()] });
  function finishTour(room, early = false) {
    const t = room.tour;
    if (!t) return;
    room.tour = null;
    touch(room.code);
    const table = tourTable(t.kind, [...t.scores.values()]);
    // n — сколько рыбаков было в комнате: от этого зависит призовой фонд
    broadcast(room, { t: 'tend', id: t.id, kind: t.kind, len: t.len, early, table, n: [...room.players.values()].filter((p) => p.ws).length });
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
    touch(room.code);
  }
  /** Войти в комнату: на прежнее место, если жетон подходит, иначе — новым игроком. */
  function joinRoom(ws, room, msg) {
    const info = sockets.get(ws);
    if (info.playerId) leaveRoom(ws);
    // вернулся после обрыва связи, перезагрузки страницы или перезапуска сервера — отдаём прежнее место
    const token = msg.token ? String(msg.token).slice(0, 64) : '';
    const th = token ? hashToken(token) : '';
    const old = th && [...room.players.values()].find((p) => p.th === th);
    if (old) {
      old.token = token;
      old.card = cleanCard(msg.card);
      return attach(ws, room, old);
    }
    return attach(ws, room, addPlayer(room, msg.card));
  }
  const fail = (ws, msg, e) => {
    if (e instanceof GameError) send(ws, { t: 'error', code: e.code, message: e.message, req: msg.t });
    else {
      console.error('ошибка обработки', msg.t, e);
      send(ws, { t: 'error', code: 'INTERNAL', message: 'Что-то пошло не так на сервере', req: msg.t });
    }
  };
  /**
   * Комнаты с кодом code нет в памяти. Если она может лежать в базе — читаем и продолжаем (then), когда узнаем;
   * остальные сообщения этого соединения до тех пор пропускаем. Искать нечего — отвечаем сразу.
   */
  function later(ws, msg, code, then) {
    const info = sockets.get(ws);
    if (!canRecall(code) || !info.find()) return then(null);
    info.wait = true;
    recall(code).then((room) => {
      if (sockets.get(ws) !== info) return; // не дождался
      info.wait = false;
      try {
        then(room);
      } catch (e) {
        fail(ws, msg, e);
      }
    });
  }

  function handle(ws, msg) {
    const info = sockets.get(ws);
    if (msg.t === 'ping') return send(ws, { t: 'pong', at: now(), c: msg.c });
    if (info.wait) return; // ищем комнату этого соединения в базе: положения и события придут снова
    switch (msg.t) {
      case 'create': {
        // локация открывается по уровню (в гости — с любым): уровень приходит с карточкой игрока. Игра сама не даст
        // создать комнату раньше времени; здесь — та же проверка для тех, кто шлёт сообщения мимо неё
        const loc = cleanLoc(msg.loc);
        if (!canHost(loc, cleanCard(msg.card).lvl)) throw new GameError('LOCKED', `${locOf(loc).name} открывается с ${locOf(loc).level}-го уровня`);
        if (info.playerId) leaveRoom(ws);
        const room = makeRoom(loc);
        return attach(ws, room, addPlayer(room, msg.card));
      }
      case 'join': {
        const code = String(msg.code || '').trim().toUpperCase();
        const enter = (room) => {
          if (!room) throw new GameError('NO_ROOM', 'Комнаты с таким кодом нет. Проверьте код или попросите новую ссылку.');
          return joinRoom(ws, room, msg);
        };
        return rooms.has(code) ? enter(rooms.get(code)) : later(ws, msg, code, enter);
      }
      case 'peek': {
        const code = String(msg.code || '').trim().toUpperCase();
        const tell = (room) => send(ws, { t: 'peek', code: String(msg.code || ''), exists: !!room, loc: room ? room.loc : null, players: room ? [...room.players.values()].filter((p) => p.ws).length : 0 });
        return rooms.has(code) ? tell(rooms.get(code)) : later(ws, msg, code, tell);
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
        touch(room.code);
        return broadcast(room, { t: 'card', id: p.id, card: p.card }, ws);
      case 'mode': {
        // вернувшийся после обрыва связи повторяет, где он; друзьям об этом сообщаем, только если что-то изменилось
        const m = msg.m === 'world' ? 'world' : 'lobby';
        if (p.mode === m) return;
        p.mode = m;
        touch(room.code);
        return broadcast(room, { t: 'mode', id: p.id, m }, ws);
      }
      case 'ev': {
        if (!EVENTS.has(msg.k) || !info.ev()) return;
        let d = null;
        try {
          const s = JSON.stringify(msg.d ?? null);
          if (s.length <= 400) d = JSON.parse(s);
        } catch {
          d = null;
        }
        broadcast(room, { t: 'ev', id: p.id, k: msg.k, d }, ws);
        // улов во время турнира идёт в зачёт
        const tr = room.tour;
        if (msg.k === 'catch' && d && tr && now() >= tr.start && now() < tr.end) {
          let row = tr.scores.get(p.id);
          if (!row) row = { id: p.id, name: p.card.name, slot: p.slot, s: tourBlank() };
          if (tourAdd(row.s, { sp: String(d.sp || ''), w: Number(d.w) }, now() - tr.start, room.loc)) { // рыба — только с локации комнаты
            row.name = p.card.name;
            tr.scores.set(p.id, row);
            touch(room.code);
            broadcast(room, { t: 'tscore', id: tr.id, row });
          }
        }
        return;
      }
      case 'tour': {
        if (room.hostId !== p.id) throw new GameError('NOT_HOST', 'Турнир запускает и останавливает хозяин комнаты');
        if (msg.a === 'stop') return finishTour(room, true);
        if (room.tour) throw new GameError('TOUR_ON', 'Турнир уже идёт');
        const kind = TOURS[msg.kind] ? msg.kind : 'big';
        const len = TOUR_LENS.includes(Number(msg.len)) ? Number(msg.len) : TOUR_LENS[1];
        const start = now() + TOUR_COUNTDOWN * 1000;
        room.tourN = (room.tourN || 0) + 1;
        room.tour = { id: room.tourN, kind, len, start, end: start + len * 1000, by: p.id, scores: new Map() };
        touch(room.code);
        return broadcast(room, { t: 'tour', tour: pubTour(room.tour) });
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
    sockets.set(ws, { roomCode: null, playerId: null, chat: bucket(1.5, 6), ev: bucket(12, 40), find: bucket(0.5, 4), wait: false });
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
        fail(ws, msg, e);
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
        if (room.hostId === p.id) fixHost(room);
        room.lastActive = now();
        touch(room.code);
      }
    });
    ws.on('error', () => {});
  });

  // рассылка положений: 12 раз в секунду, только изменившиеся
  const tick = setInterval(() => {
    for (const room of rooms.values()) {
      // комната недавно вернулась из базы: даём игрокам время собраться, потом — хозяин и итоги турнира, если он кончился
      if (room.hold && room.hold <= now()) {
        room.hold = 0;
        fixHost(room);
      }
      if (room.tour && !room.hold && now() >= room.tour.end) finishTour(room);
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

  /** Уборка: места тех, кто не вернулся, и комнаты, где давно никого нет (из базы они уходят тоже). */
  function sweepRooms() {
    const t = now();
    for (const [code, room] of rooms) {
      for (const p of [...room.players.values()]) {
        if (!p.ws && t - p.lostAt > GRACE_MS) {
          room.players.delete(p.id);
          touch(code);
        }
      }
      const anyone = [...room.players.values()].some((p) => p.ws);
      if (!anyone && t - room.lastActive > ROOM_IDLE_MS) {
        rooms.delete(code);
        voice.dropRoom(code);
        touch(code);
      }
    }
  }
  const sweep = setInterval(sweepRooms, 30 * 1000);
  sweep.unref();

  /** Раз в минуту: отмечаем в базе комнаты, где есть люди, — по этой отметке после перезапуска видно, что комната живая. */
  let beats = 0;
  function beatRooms() {
    const st = db.store;
    if (!st) return Promise.resolve();
    const live = [...rooms.values()].filter((r) => [...r.players.values()].some((p) => p.ws)).map((r) => r.code);
    const t = Date.now();
    for (const [code, till] of keep.miss) if (till <= t) keep.miss.delete(code);
    // раз в десять минут — заодно убираем из базы комнаты, которые давно пусты (остались от прошлых запусков)
    const tidy = ++beats % 10 === 0;
    return st.touchRooms(live, now())
      .then(() => (tidy ? st.roomCodes(now() - ROOM_IDLE_MS) : null))
      .then((list) => {
        if (list) keep.taken = new Set(list.filter((c) => !rooms.has(c)));
      })
      .catch((e) => console.error('комнаты: не удалось отметить в базе —', e.message));
  }
  const beat = setInterval(beatRooms, BEAT_MS);
  beat.unref();

  /** Записать в базу все комнаты как есть — перед остановкой сервера. */
  function saveAll() {
    for (const code of rooms.keys()) keep.dirty.add(code);
    return flush();
  }
  /**
   * Остановка (выкладка новой версии): записываем комнаты и отпускаем игроков — они сами тут же вернутся,
   * уже на новый сервер, и он поднимет их комнату из базы.
   */
  async function shutdown() {
    await saveAll();
    for (const ws of [...sockets.keys()]) {
      try {
        ws.close(1012, 'restart');
      } catch {
        /* уже закрыт */
      }
    }
  }
  const close = () => {
    clearInterval(tick);
    clearInterval(sweep);
    clearInterval(beat);
    clearTimeout(keep.timer);
    for (const ws of sockets.keys()) ws.terminate();
    wss.close();
    server.close();
  };
  return { server, wss, rooms, voice, setStore, close, saveRooms: flush, saveAll, shutdown, sweepRooms, beatRooms };
}

// База может быть не готова в момент запуска (перезапускается, сеть моргнула) — игра от этого не зависит:
// сервер поднимается сразу, а к базе стучится, пока не получится.
async function connectStore(srv) {
  try {
    const store = await openStore();
    if (!store) {
      srv.setStore(null); // базы не будет: входящих в комнату не заставляем её ждать
      return console.log('Сохранения на сервере выключены: база не задана (DATABASE_URL)');
    }
    try {
      await selfCheck(store);
    } catch (e) {
      await store.close().catch(() => {});
      throw e;
    }
    srv.setStore(store);
    console.log(`Сохранения и комнаты на сервере: ${store.kind === 'postgres' ? 'Postgres' : store.kind === 'files' ? 'файлы на диске' : 'память — до перезапуска'}, самопроверка пройдена, сохранений в базе — ${await store.count()}`);
  } catch (e) {
    console.error(`Сохранения на сервере: база не готова (${e && e.message}) — попробую снова через 30 секунд`);
    setTimeout(() => connectStore(srv), 30000);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  const srv = createServer({ storeSoon: true });
  srv.server.listen(port, () => console.log(`Рыбак слушает порт ${port}`));
  connectStore(srv);
  // остановка (Render останавливает прежний сервер при каждой выкладке): комнаты — в базу, игроков — отпустить
  let stopping = false;
  const stop = (sig) => {
    if (stopping) return;
    stopping = true;
    console.log(`${sig}: записываю комнаты и останавливаюсь`);
    const hard = setTimeout(() => process.exit(0), 8000);
    srv.shutdown().catch((e) => console.error('остановка:', e && e.message)).finally(() => {
      clearTimeout(hard);
      setTimeout(() => process.exit(0), 150); // дать закрытию соединений уйти в сеть
    });
  };
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
}
