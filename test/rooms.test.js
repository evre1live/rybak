// Комнаты переживают перезапуск сервера: запись в базу (настоящий Postgres в памяти — PGlite), возвращение игроков
// на свои места, хозяин и турнир, срок жизни пустой комнаты, работа без базы и пока база ещё не подключилась.
import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import { PGlite } from '@electric-sql/pglite';
import { createServer } from '../server/index.js';
import { createStore, selfCheck } from '../server/store.js';
import { TOUR_LENS, TOUR_COUNTDOWN } from '../shared/logic.js';

const pg = new PGlite();
const store = createStore((t, p) => pg.query(t, p));
const ready = store.init();
const MIN = 60 * 1000;

function client(port) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
  const got = [];
  const waiters = [];
  let closed = null;
  ws.on('message', (raw, isBinary) => {
    if (isBinary) return;
    const m = JSON.parse(String(raw));
    got.push(m);
    for (const w of [...waiters]) if (w.fn(m)) {
      waiters.splice(waiters.indexOf(w), 1);
      w.resolve(m);
    }
  });
  const gone = new Promise((r) => ws.once('close', (code) => r((closed = code))));
  ws.on('error', () => {});
  return {
    ws, got, gone,
    get closed() { return closed; },
    open: () => new Promise((r) => ws.once('open', r)),
    send: (m) => ws.send(JSON.stringify(m)),
    wait: (t, pred = () => true, ms = 3000) => new Promise((resolve, reject) => {
      const hit = got.find((m) => m.t === t && pred(m));
      if (hit) return resolve(hit);
      const w = { fn: (m) => m.t === t && pred(m), resolve };
      waiters.push(w);
      setTimeout(() => reject(new Error('нет сообщения ' + t)), ms);
    }),
    close: () => (closed != null ? Promise.resolve() : (ws.close(), gone))
  };
}
/** Сервер на свободном порту; t — проверка, после которой его надо закрыть, даже если она провалилась. */
async function start(t, opts) {
  const notes = [];
  const srv = createServer({ log: (text) => notes.push(text), ...opts });
  t.after(() => srv.close());
  await new Promise((r) => srv.server.listen(0, r));
  const port = srv.server.address().port;
  const join = async (msg) => {
    const c = client(port);
    await c.open();
    if (msg) c.send(msg);
    return c;
  };
  return { srv, port, join, notes, health: () => fetch(`http://127.0.0.1:${port}/health`).then((r) => r.json()) };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test('самопроверка базы проходит и с комнатами', async (t) => {
  await ready;
  await selfCheck(store);
  assert.deepEqual(await store.roomCodes(0), [], 'служебная комната за собой убрана');
});

test('перезапуск сервера: игроки возвращаются в ту же комнату на свои места, турнир и часы целы', async (t) => {
  await ready;
  let clock = 5_000_000;
  const now = () => clock;
  const one = await start(t, { store, now, saveMs: 60000 });
  const a = await one.join({ t: 'create', card: { name: 'Финн', look: { hair: 2 }, rod: 'rod1', lvl: 3 } });
  const ja = await a.wait('joined');
  const b = await one.join({ t: 'join', code: ja.code, card: { name: 'Нори', rod: 'rod2' } });
  const jb = await b.wait('joined');
  a.send({ t: 'mode', m: 'world' });
  await b.wait('mode', (m) => m.id === ja.id && m.m === 'world');
  // идёт турнир, у гостьи уже есть улов в зачёте
  a.send({ t: 'tour', kind: 'big', len: TOUR_LENS[0] });
  const tour = (await b.wait('tour')).tour;
  clock += TOUR_COUNTDOWN * 1000 + 1000;
  b.send({ t: 'ev', k: 'catch', d: { sp: 'okun', w: 0.42 } });
  const score = await a.wait('tscore');
  assert.equal(score.row.id, jb.id);

  // сервер останавливают: он записывает комнаты и отпускает игроков — те узнают об этом по закрытию связи
  await one.srv.shutdown();
  assert.deepEqual([await a.gone, await b.gone], [1012, 1012], 'связь закрыта с пометкой «перезапуск»');
  one.srv.close();
  const row = await store.loadRoom(ja.code, 0);
  assert.ok(row && row.data.players.length === 2 && row.data.players.every((p) => /^[0-9a-f]{64}$/.test(p.th)), 'комната записана, у мест — отпечатки жетонов');
  const raw = JSON.stringify(row.data);
  assert.ok(!raw.includes(ja.token) && !raw.includes(jb.token) && !/"token"/.test(raw), 'самих жетонов в базе нет');

  // новый сервер: в памяти у него пусто, комната поднимается из базы, когда возвращается первый игрок
  clock += 20 * 1000;
  const two = await start(t, { store, now, saveMs: 60000 });
  assert.deepEqual([(await two.health()).rooms, (await two.health()).restored], [0, 0]);
  const b2 = await two.join({ t: 'join', code: ja.code, token: jb.token, card: { name: 'Нори', rod: 'rod2' } });
  b2.send({ t: 'st', s: [1, 2, 3] }); // пока комнату ищут, положения и события просто пропускаются — без ошибок
  b2.send({ t: 'mode', m: 'lobby' });
  const jb2 = await b2.wait('joined');
  assert.deepEqual([jb2.code, jb2.id, jb2.slot, jb2.seed, jb2.t0, jb2.token], [ja.code, jb.id, jb.slot, ja.seed, ja.t0, jb.token], 'гостья на своём месте: тот же номер, цвет, зерно рынка и часы бухты');
  assert.equal(jb2.host, ja.id, 'хозяин комнаты прежний, хотя он ещё не вернулся');
  assert.equal(jb2.players.length, 0);
  assert.ok(jb2.tour && jb2.tour.id === tour.id && jb2.tour.end === tour.end && jb2.tour.scores.length === 1 && jb2.tour.scores[0].id === jb.id, `турнир и зачёт на месте: ${JSON.stringify(jb2.tour)}`);
  const a2 = await two.join({ t: 'join', code: ja.code, token: ja.token, card: { name: 'Финн', look: { hair: 2 }, rod: 'rod1', lvl: 4 } });
  const ja2 = await a2.wait('joined');
  assert.deepEqual([ja2.id, ja2.slot, ja2.host], [ja.id, ja.slot, ja.id]);
  assert.deepEqual(ja2.players.map((p) => [p.id, p.card.name, p.mode]), [[jb.id, 'Нори', 'lobby']]);
  const back = await b2.wait('in', (m) => m.p.id === ja.id);
  assert.deepEqual([back.back, back.p.card.name, back.p.card.lvl, back.p.mode], [true, 'Финн', 4, 'world'], 'друзья видят вернувшегося — там же, где он был, с новой карточкой');
  assert.ok(!b2.got.some((m) => m.t === 'error') && !a2.got.some((m) => m.t === 'error'), 'ошибок игрокам не показывали');
  assert.ok(!b2.got.some((m) => m.t === 'host'), 'комната ни к кому не переходила');
  const h = await two.health();
  assert.deepEqual([h.rooms, h.players, h.restored], [1, 2, 1]);
  assert.deepEqual(two.notes, [`комната ${ja.code} вернулась из базы: мест 2, идёт турнир`], 'в журнале сервера — одна запись о возвращении');
  // турнир продолжается: улов хозяина идёт в зачёт, как до перезапуска
  a2.send({ t: 'ev', k: 'catch', d: { sp: 'shuka', w: 3.2 } });
  assert.equal((await b2.wait('tscore', (m) => m.row.id === ja.id)).id, tour.id);
  // чужой с неверным жетоном места не получает: он новый игрок
  const c = await two.join({ t: 'join', code: ja.code, token: 'f'.repeat(24), card: { name: 'Пип' } });
  const jc = await c.wait('joined');
  assert.ok(jc.id !== ja.id && jc.id !== jb.id && jc.slot !== ja.slot && jc.slot !== jb.slot, `новый игрок — новое место: ${JSON.stringify([jc.id, jc.slot])}`);
  await Promise.all([a2.close(), b2.close(), c.close()]);
  two.srv.close();
});

test('перезапуск сервера: комната помнит свою локацию; старые записи без неё — бухта', async (t) => {
  await ready;
  const one = await start(t, { store, saveMs: 60000 });
  const a = await one.join({ t: 'create', card: { name: 'Финн', lvl: 5 }, loc: 'lake' });
  const ja = await a.wait('joined');
  assert.equal(ja.loc, 'lake');
  await one.srv.shutdown();
  await a.gone;
  one.srv.close();
  const row = await store.loadRoom(ja.code, 0);
  assert.equal(row.data.loc, 'lake', 'локация записана в базу');
  const two = await start(t, { store, saveMs: 60000 });
  const a2 = await two.join({ t: 'join', code: ja.code, token: ja.token, card: { name: 'Финн' } });
  const ja2 = await a2.wait('joined');
  assert.deepEqual([ja2.code, ja2.loc, ja2.id], [ja.code, 'lake', ja.id]);
  assert.deepEqual(two.notes, [`комната ${ja.code} вернулась из базы: мест 1, локация lake`]);
  await a2.close();
  two.srv.close();
  // запись старого образца: поля loc нет
  const old = { ...row.data };
  delete old.loc;
  await store.saveRoom('QLDX', old, Date.now());
  const three = await start(t, { store, saveMs: 60000 });
  const b = await three.join({ t: 'join', code: 'QLDX', token: ja.token, card: { name: 'Финн' } });
  assert.equal((await b.wait('joined')).loc, 'bay');
  await b.close();
  three.srv.close();
});

test('сервер упал без предупреждения: в базе комната не старше пары секунд', async (t) => {
  await ready;
  const one = await start(t, { store, saveMs: 30 });
  const a = await one.join({ t: 'create', card: { name: 'Финн' } });
  const ja = await a.wait('joined');
  const b = await one.join({ t: 'join', code: ja.code, card: { name: 'Нори' } });
  const jb = await b.wait('joined');
  b.send({ t: 'card', card: { name: 'Нори', rod: 'rod3', lvl: 9 } });
  await a.wait('card');
  await sleep(200); // записи никто не просил — она ушла сама
  one.srv.close(); // «упал»: без shutdown
  await Promise.all([a.gone, b.gone]);
  const two = await start(t, { store, saveMs: 30 });
  const peek = await two.join({ t: 'peek', code: ja.code });
  assert.deepEqual([(await peek.wait('peek')).exists, (await peek.wait('peek')).players], [true, 0], 'по ссылке-приглашению комната находится');
  const a2 = await two.join({ t: 'join', code: ja.code, token: ja.token, card: { name: 'Финн' } });
  assert.equal((await a2.wait('joined')).id, ja.id);
  const b2 = await two.join({ t: 'join', code: ja.code, token: jb.token, card: { name: 'Нори', rod: 'rod3', lvl: 9 } });
  const jb2 = await b2.wait('joined');
  assert.deepEqual([jb2.id, jb2.slot, jb2.players.length], [jb.id, jb.slot, 1]);
  await Promise.all([a2.close(), b2.close(), peek.close()]);
  two.srv.close();
});

test('после возвращения комнаты хозяина ждут; не вернулся — комната переходит другому, кончившийся турнир подводит итоги', async (t) => {
  await ready;
  let clock = 9_000_000;
  const now = () => clock;
  const one = await start(t, { store, now });
  const a = await one.join({ t: 'create', card: { name: 'Финн' } });
  const ja = await a.wait('joined');
  const b = await one.join({ t: 'join', code: ja.code, card: { name: 'Нори' } });
  const jb = await b.wait('joined');
  a.send({ t: 'tour', kind: 'big', len: TOUR_LENS[0] });
  const tour = (await b.wait('tour')).tour;
  clock += TOUR_COUNTDOWN * 1000 + 1000;
  b.send({ t: 'ev', k: 'catch', d: { sp: 'okun', w: 0.42 } });
  await a.wait('tscore');
  await one.srv.shutdown();
  one.srv.close();
  // сервера не было дольше, чем шёл турнир
  clock = tour.end + 5000;
  const two = await start(t, { store, now });
  const b2 = await two.join({ t: 'join', code: ja.code, token: jb.token, card: { name: 'Нори' } });
  const jb2 = await b2.wait('joined');
  assert.deepEqual([jb2.host, !!jb2.tour], [ja.id, true], 'хозяина ждут, итоги турнира не подводят, пока игроки собираются');
  await sleep(250);
  assert.ok(!b2.got.some((m) => m.t === 'tend' || m.t === 'host'), 'полминуты после возвращения комнаты — без перемен');
  clock += 31 * 1000;
  const host = await b2.wait('host');
  const tend = await b2.wait('tend');
  assert.equal(host.id, jb.id, 'хозяин не вернулся — комната перешла тому, кто на связи');
  assert.deepEqual([tend.id, tend.table.length, tend.table[0].id], [tour.id, 1, jb.id], 'итоги турнира подведены');
  // хозяин вернулся позже срока — он обычный игрок на своём месте (если место ещё ждёт)
  const a2 = await two.join({ t: 'join', code: ja.code, token: ja.token, card: { name: 'Финн' } });
  const ja2 = await a2.wait('joined');
  assert.deepEqual([ja2.id, ja2.host, ja2.tour], [ja.id, jb.id, null]);
  await Promise.all([a2.close(), b2.close()]);
  two.srv.close();
});

test('пустая комната живёт четверть часа — и в памяти, и в базе', async (t) => {
  await ready;
  let clock = 20_000_000;
  const now = () => clock;
  const one = await start(t, { store, now });
  const a = await one.join({ t: 'create', card: { name: 'Финн' } });
  const ja = await a.wait('joined');
  await one.srv.shutdown();
  one.srv.close();
  // через 14 минут комната ещё возвращается, через 16 — уже нет
  clock += 14 * MIN;
  const two = await start(t, { store, now });
  const a2 = await two.join({ t: 'join', code: ja.code, token: ja.token, card: { name: 'Финн' } });
  assert.equal((await a2.wait('joined')).id, ja.id);
  a2.send({ t: 'leave' });
  await a2.wait('left');
  await two.srv.saveRooms();
  assert.ok(await store.loadRoom(ja.code, 0), 'все ушли — комната ещё ждёт');
  await two.srv.shutdown();
  two.srv.close();
  clock += 16 * MIN;
  const three = await start(t, { store, now });
  const a3 = await three.join({ t: 'join', code: ja.code, token: ja.token, card: { name: 'Финн' } });
  assert.equal((await a3.wait('error')).code, 'NO_ROOM');
  // уборка: из памяти и из базы
  const b = await three.join({ t: 'create', card: { name: 'Нори' } });
  const jb = await b.wait('joined');
  b.send({ t: 'leave' });
  await b.wait('left');
  await three.srv.saveRooms();
  assert.ok(await store.loadRoom(jb.code, 0));
  clock += 16 * MIN;
  three.srv.sweepRooms();
  await three.srv.saveRooms();
  assert.equal(three.srv.rooms.has(jb.code), false);
  assert.equal(await store.loadRoom(jb.code, 0), null, 'убранная комната стёрта и из базы');
  const left = await store.roomCodes(clock - 15 * MIN);
  assert.ok(!left.includes(ja.code) && !left.includes(jb.code), `давние комнаты прошлых запусков убраны: ${left}`);
  await Promise.all([a2.close(), a3.close(), b.close()]);
  three.srv.close();
});

test('комната с людьми отмечается в базе раз в минуту: по отметке видно, что она живая', async (t) => {
  await ready;
  let clock = 40_000_000;
  const now = () => clock;
  const one = await start(t, { store, now });
  const a = await one.join({ t: 'create', card: { name: 'Финн' } });
  const ja = await a.wait('joined');
  await one.srv.saveRooms();
  // час игры без перемен в составе: запись не трогали, но отметка свежая
  clock += 60 * MIN;
  await one.srv.beatRooms();
  assert.equal((await store.loadRoom(ja.code, clock - MIN)).seen, clock);
  one.srv.close(); // упал
  await a.gone;
  clock += 5 * MIN;
  const two = await start(t, { store, now });
  const a2 = await two.join({ t: 'join', code: ja.code, token: ja.token, card: { name: 'Финн' } });
  assert.equal((await a2.wait('joined')).id, ja.id);
  await a2.close();
  two.srv.close();
});

test('база ищется только по делу: настоящий код, не чаще положенного, без базы — сразу ответ', async (t) => {
  await ready;
  let looks = 0;
  const spy = { ...store, loadRoom: (...a) => (looks++, store.loadRoom(...a)) };
  const one = await start(t, { store: spy });
  const c = await one.join();
  const no = async (code) => {
    const n = c.got.filter((m) => m.t === 'error').length;
    c.send({ t: 'join', code, card: { name: 'Пип' } });
    await c.wait('error', () => c.got.filter((m) => m.t === 'error').length > n);
    return c.got.filter((m) => m.t === 'error').pop().code;
  };
  assert.equal(await no('ab'), 'NO_ROOM');
  assert.equal(await no('ZZZ0'), 'NO_ROOM'); // нуля в кодах комнат не бывает
  assert.equal(looks, 0, 'код не похож на настоящий — в базу не ходим');
  assert.equal(await no('ZZZZ'), 'NO_ROOM');
  assert.equal(await no('ZZZZ'), 'NO_ROOM');
  assert.equal(await no('zzzz'), 'NO_ROOM');
  assert.equal(looks, 1, 'тот же код подряд — один поиск');
  for (const code of ['AAAA', 'BBBB', 'CCCC', 'DDDD', 'EEEE', 'FFFF', 'GGGG']) assert.equal(await no(code), 'NO_ROOM');
  assert.ok(looks <= 5, `перебор кодов с одного соединения упирается в предел: поисков ${looks}`);
  await c.close();
  one.srv.close();

  // базы нет и не будет: ответ сразу
  const two = await start(t, {});
  const d = await two.join({ t: 'join', code: 'ZZZZ', card: { name: 'Пип' } });
  assert.equal((await d.wait('error', () => true, 500)).code, 'NO_ROOM');
  await d.close();
  two.srv.close();
});

test('сервер только что запустился и ещё не подключился к базе: вход в прежнюю комнату ждёт её', async (t) => {
  await ready;
  const one = await start(t, { store });
  const a = await one.join({ t: 'create', card: { name: 'Финн' } });
  const ja = await a.wait('joined');
  await one.srv.shutdown();
  one.srv.close();

  const two = await start(t, { storeSoon: true });
  const a2 = await two.join({ t: 'join', code: ja.code, token: ja.token, card: { name: 'Финн' } });
  await sleep(200);
  assert.ok(!a2.got.some((m) => m.t === 'joined' || m.t === 'error'), 'пока базы нет — ни входа, ни отказа');
  a2.send({ t: 'ping', c: 5 });
  assert.equal((await a2.wait('pong')).c, 5, 'часы при этом отвечают');
  two.srv.setStore(store);
  assert.equal((await a2.wait('joined')).id, ja.id, 'база подключилась — игрок на своём месте');
  await a2.close();
  two.srv.close();

  // базы так и не оказалось: ждавшим — обычный отказ
  const three = await start(t, { storeSoon: true });
  const a3 = await three.join({ t: 'join', code: ja.code, token: ja.token, card: { name: 'Финн' } });
  await sleep(100);
  three.srv.setStore(null);
  assert.equal((await a3.wait('error')).code, 'NO_ROOM');
  await a3.close();
  three.srv.close();
});

test('комната, созданная без базы, записывается, когда база подключается', async (t) => {
  await ready;
  const one = await start(t, { storeSoon: true, saveMs: 20 });
  const a = await one.join({ t: 'create', card: { name: 'Финн' } });
  const ja = await a.wait('joined');
  assert.equal(await store.loadRoom(ja.code, 0), null);
  one.srv.setStore(store);
  await sleep(200);
  const row = await store.loadRoom(ja.code, 0);
  assert.ok(row && row.data.players.length === 1 && row.data.seed === ja.seed);
  await a.close();
  one.srv.close();
});
