// Сохранение на сервере и таблица рекордов — запросы /api/…
//
//   GET  /api/status            → { ok, db }                 хранит ли сервер сохранения
//   POST /api/save   { code, base, at, listed, force, tag, save } → { ok, rev, at, pub }   или 409 { why: 'CONFLICT', now }
//   POST /api/load   { code }   → { ok, rev, at, save, sum, pub, listed, tag }             или 404 { why: 'NO_SAVE' }
//   POST /api/forget { code }   → { ok, gone }               стереть сохранение с сервера
//   GET  /api/top?me=<pub>      → { ok, anglers, records, total, me }
//
// Код сохранения идёт только в теле запроса и нигде не записывается: в базе лежит его отпечаток.
import crypto from 'node:crypto';
import { bucket } from './voice.js';
import { cleanCode, saveSummary, hasProgress, MAX_SAVE_BYTES } from '../shared/cloud.js';

const MAX_BODY = MAX_SAVE_BYTES + 4096;
const MAX_PLAYERS_STORED = 50000; // потолок на число сохранений: диск базы не резиновый
const TOP_TTL = 15000;
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
export const idOf = (code) => sha('rybak-save:' + code).slice(0, 40);
export const pubOf = (code) => sha('rybak-pub:' + code).slice(0, 12);

/** getStore() → хранилище (server/store.js) или null, пока базы нет. */
export function createApi({ getStore, now = () => Date.now() }) {
  // ограничители: на адрес и общий — от перебора кодов и от засорения базы
  const ips = new Map(); // адрес → { any, miss, fresh, seen }
  const all = { fresh: bucket(600 / 3600, 120) };
  const limits = (ip) => {
    let l = ips.get(ip);
    if (!l) {
      if (ips.size > 20000) for (const [k, v] of ips) if (now() - v.seen > 10 * 60 * 1000) ips.delete(k);
      l = { any: bucket(4, 40), miss: bucket(1 / 20, 12), fresh: bucket(8 / 3600, 8), seen: 0 };
      ips.set(ip, l);
    }
    l.seen = now();
    return l;
  };
  const perId = new Map(); // игрок → ограничитель записи и отпечаток рекордов (чтобы не переписывать их без нужды)
  const idState = (id) => {
    let s = perId.get(id);
    if (!s) {
      if (perId.size > 5000) perId.clear();
      s = { save: bucket(1 / 3, 6), rec: null, key: null, listed: null };
      perId.set(id, s);
    }
    return s;
  };
  // таблица рекордов пересчитывается не на каждый запрос: раз в 15 секунд, а если кто-то сохранился с новым
  // уловом — не чаще двух раз в секунду. Скрылся из таблицы или стёр сохранение — сразу.
  let topCache = null;
  let topStale = 0; // 0 — свежая, 1 — есть новости, 2 — пересчитать немедленно
  let countCache = { at: 0, n: 0 };

  const json = (res, code, body) => {
    const raw = JSON.stringify(body);
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'content-length': Buffer.byteLength(raw) });
    res.end(raw);
  };
  const readBody = (req, res) =>
    new Promise((resolve, reject) => {
      const parts = [];
      let size = 0;
      // слишком большое тело не читаем: отвечаем отказом и закрываем соединение
      const tooBig = () => {
        req.removeAllListeners('data');
        req.resume();
        res.setHeader('connection', 'close');
        res.on('finish', () => req.destroy());
        reject(Object.assign(new Error('big'), { http: 413, why: 'TOO_BIG' }));
      };
      if (Number(req.headers['content-length']) > MAX_BODY) return tooBig();
      req.on('data', (c) => {
        size += c.length;
        if (size > MAX_BODY) tooBig();
        else parts.push(c);
      });
      req.on('end', () => {
        try {
          const d = JSON.parse(Buffer.concat(parts).toString('utf8'));
          if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('shape');
          resolve(d);
        } catch {
          reject(Object.assign(new Error('json'), { http: 400, why: 'BAD_JSON' }));
        }
      });
      req.on('error', reject);
    });
  const fail = (http, why) => Object.assign(new Error(why), { http, why });

  async function route(req, res, url) {
    const path = url.pathname;
    const store = getStore();
    const h = req.headers;
    const ip = String(h['cf-connecting-ip'] || h['true-client-ip'] || String(h['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '');
    const lim = limits(ip);
    if (!lim.any()) throw fail(429, 'SLOW_DOWN');

    if (path === '/api/status' && req.method === 'GET') return json(res, 200, { ok: true, db: !!store });
    if (!store) throw fail(503, 'NO_DB');

    if (path === '/api/top' && req.method === 'GET') {
      const age = topCache ? now() - topCache.at : Infinity;
      if (age > TOP_TTL || topStale === 2 || (topStale === 1 && age > 500)) {
        topStale = 0;
        topCache = { at: now(), data: await store.top(30), me: new Map() };
      }
      const pub = String(url.searchParams.get('me') || '').slice(0, 12);
      let me = null;
      if (/^[0-9a-f]{12}$/.test(pub)) {
        if (!topCache.me.has(pub)) {
          if (topCache.me.size > 2000) topCache.me.clear();
          topCache.me.set(pub, await store.place(pub));
        }
        me = topCache.me.get(pub);
      }
      return json(res, 200, { ok: true, at: topCache.at, ...topCache.data, me });
    }

    if (req.method !== 'POST' || !['/api/save', '/api/load', '/api/forget'].includes(path)) throw fail(404, 'NO_ROUTE');
    const body = await readBody(req, res);
    const code = cleanCode(body.code);
    if (!code) throw fail(400, 'BAD_CODE');
    const id = idOf(code);

    if (path === '/api/load') {
      const r = await store.load(id);
      if (!r) {
        // промах: кода нет. Подбирать коды перебором бессмысленно (80 бит), но и стучать в базу без счёта не дадим
        if (!lim.miss()) throw fail(429, 'SLOW_DOWN');
        throw fail(404, 'NO_SAVE');
      }
      return json(res, 200, { ok: true, ...r });
    }
    if (path === '/api/forget') {
      const gone = await store.forget(id);
      perId.delete(id);
      topStale = 2;
      return json(res, 200, { ok: true, gone });
    }

    // запись
    const save = body.save;
    if (!save || typeof save !== 'object' || Array.isArray(save)) throw fail(400, 'BAD_SAVE');
    if (Buffer.byteLength(JSON.stringify(save)) > MAX_SAVE_BYTES) throw fail(413, 'TOO_BIG');
    const st = idState(id);
    if (!st.save()) throw fail(429, 'SLOW_DOWN');
    const sum = saveSummary(save);
    const base = Math.max(0, Math.round(Number(body.base) || 0));
    if (!base) {
      // первая запись этого игрока: пустые сохранения не держим, новых — не больше, чем положено
      const known = await store.load(id);
      if (!known) {
        if (!hasProgress(sum)) return json(res, 200, { ok: true, rev: 0, skipped: true, pub: pubOf(code) });
        if (now() - countCache.at > 60000) countCache = { at: now(), n: await store.count() };
        if (countCache.n >= MAX_PLAYERS_STORED) throw fail(507, 'FULL');
        if (!lim.fresh() || !all.fresh()) throw fail(429, 'SLOW_DOWN');
        countCache.n++;
      }
    }
    const r = await store.save({ id, pub: pubOf(code), base, force: body.force === true, save, sum, clientAt: Number(body.at) || 0, listed: body.listed !== false, tag: typeof body.tag === 'string' ? body.tag : '' });
    if (!r.ok) {
      const cur = r.now;
      return json(res, 409, { ok: false, why: 'CONFLICT', now: cur ? { rev: cur.rev, at: cur.at, sum: cur.sum } : null });
    }
    const rec = JSON.stringify(sum.records);
    if (st.rec !== rec) {
      await store.setRecords(id, sum.records);
      st.rec = rec;
      topStale = Math.max(topStale, 1);
    }
    const listed = body.listed !== false;
    const key = `${sum.name}|${sum.xp}|${sum.legends}|${sum.medals}`;
    if (st.listed !== listed) topStale = 2;
    else if (st.key !== key) topStale = Math.max(topStale, 1);
    st.listed = listed;
    st.key = key;
    return json(res, 200, { ok: true, rev: r.rev, at: r.at, pub: pubOf(code) });
  }

  /** Обработать запрос к /api/… (вызывается из server/index.js). */
  return function handle(req, res, url) {
    route(req, res, url).catch((e) => {
      if (res.headersSent) return res.end();
      if (e && e.http) return json(res, e.http, { ok: false, why: e.why });
      console.error('сохранения: ошибка запроса', url.pathname, e && e.message);
      json(res, 503, { ok: false, why: 'DB' });
    });
  };
}
