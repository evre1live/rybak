// Сохранение на сервере и таблица рекордов: общие правила, запросы к базе (настоящий Postgres в памяти — PGlite) и /api/…
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { createServer } from '../server/index.js';
import { createStore } from '../server/store.js';
import { idOf, pubOf } from '../server/api.js';
import { cleanCode, showCode, makeCode, saveSummary, hasProgress, agoText, plural, CODE_ALPHABET, MAX_SAVE_BYTES } from '../shared/cloud.js';
import { newProfile, recordCatch, exportSave, importSave } from '../shared/logic.js';
import { FISH_BY_ID } from '../shared/data.js';

const db = new PGlite();
const store = createStore((t, p) => db.query(t, p));
const ready = store.init();
const code = () => makeCode((n) => crypto.randomBytes(n));
/** Профиль с уловом: [вид, вес] по очереди. */
function angler(name, catches = []) {
  const p = newProfile();
  p.name = name;
  for (const [sp, w] of catches) recordCatch(p, { sp, w, len: 30, trophy: false, junk: false }, false);
  return p;
}
const put = (c, p, o = {}) => store.save({ id: idOf(c), pub: pubOf(c), base: 0, save: p, sum: saveSummary(p), clientAt: 1, listed: true, ...o });

test('код сохранения: вид, разбор, случайность', () => {
  const c = code();
  assert.equal(c.length, 16);
  assert.ok([...c].every((ch) => CODE_ALPHABET.includes(ch)));
  assert.notEqual(c, code());
  assert.match(showCode(c), /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  // набрали как показано, строчными, с пробелами — тот же код
  assert.equal(cleanCode(showCode(c).toLowerCase()), c);
  assert.equal(cleanCode(`  ${c.slice(0, 8)} ${c.slice(8)}\n`), c);
  // не код: короче, длиннее, со знаками, которых в кодах не бывает (0, 1, I, O)
  assert.equal(cleanCode(c.slice(1)), '');
  assert.equal(cleanCode(c + 'A'), '');
  assert.equal(cleanCode('0' + c.slice(1)), '');
  assert.equal(cleanCode('O' + c.slice(1)), '');
  assert.equal(cleanCode(''), '');
  assert.equal(cleanCode(null), '');
  // байты с любыми значениями дают знаки из набора поровну (5 младших бит)
  assert.equal(makeCode(() => new Uint8Array(16).fill(255)), '9'.repeat(16));
  assert.equal(makeCode(() => new Uint8Array(16).fill(32)), 'A'.repeat(16));
});

test('что из сохранения идёт в таблицу: только правдоподобное', () => {
  const p = angler('  Аня<b>\u0007  ', [['karp', 5.5], ['karp', 7.25], ['okun', 0.4], ['starik', 120]]);
  const s = saveSummary(p);
  assert.equal(s.name, 'Аняb');
  assert.equal(s.species, 3);
  assert.equal(s.caught, 4);
  assert.equal(s.legends, 1);
  assert.ok(s.xp > 0 && s.lvl >= 1);
  assert.deepEqual(s.records.find((r) => r.sp === 'karp'), { sp: 'karp', w: 7.25, n: 2 });
  assert.ok(hasProgress(s));
  assert.ok(!hasProgress(saveSummary(newProfile())));
  // рыба тяжелее, чем бывает у вида, неизвестный вид, нулевой счёт — мимо таблицы; опыт и счётчики — в пределах
  const bad = angler('Жулик');
  bad.xp = 1e12;
  bad.stats.caught = -5;
  bad.stats.legends = 'много';
  bad.journal = { karp: { n: 3, best: FISH_BY_ID.karp.w[1] + 0.5 }, okun: { n: 0, best: 0.4 }, drakon: { n: 1, best: 5 }, plotva: { n: 2, best: FISH_BY_ID.plotva.w[1] }, shuka: 'x' };
  const b = saveSummary(bad);
  assert.equal(b.xp, 3000000);
  assert.equal(b.lvl, 99);
  assert.equal(b.caught, 0);
  assert.equal(b.legends, 0);
  assert.deepEqual(b.records, [{ sp: 'plotva', w: FISH_BY_ID.plotva.w[1], n: 2 }]);
  // мусор вместо сохранения не роняет разбор
  for (const junk of [null, 5, 'x', [], { journal: 5, stats: 'y' }]) assert.equal(saveSummary(junk).name, 'Рыбак');
});

test('подписи: когда сохранено', () => {
  const now = new Date(2026, 10, 13, 12, 0, 0).getTime();
  assert.equal(agoText(now - 5000, now), 'только что');
  assert.equal(agoText(now - 60 * 1000, now), '1 минуту назад');
  assert.equal(agoText(now - 3 * 60 * 1000, now), '3 минуты назад');
  assert.equal(agoText(now - 25 * 60 * 1000, now), '25 минут назад');
  assert.equal(agoText(now - 2 * 3600 * 1000, now), 'сегодня в 10:00');
  assert.equal(agoText(new Date(2026, 10, 12, 21, 40).getTime(), now), 'вчера в 21:40');
  assert.equal(agoText(new Date(2026, 10, 2, 9, 5).getTime(), now), '2 ноября');
  assert.equal(agoText(0, now), '');
  assert.equal(plural(21, 'вид', 'вида', 'видов'), 'вид');
  assert.equal(plural(12, 'вид', 'вида', 'видов'), 'видов');
  assert.equal(plural(3, 'вид', 'вида', 'видов'), 'вида');
});

test('база: запись сверяет версию и не даёт опыту уменьшиться без спроса', async () => {
  await ready;
  const c = code();
  const p = angler('Аня', [['karp', 5.5]]);
  const r1 = await put(c, p);
  assert.deepEqual([r1.ok, r1.rev, r1.fresh], [true, 1, true]);
  const got = await store.load(idOf(c));
  assert.equal(got.rev, 1);
  assert.deepEqual(got.save, JSON.parse(JSON.stringify(p)));
  assert.equal(got.sum.name, 'Аня');
  assert.equal(got.pub, pubOf(c));
  assert.ok(Math.abs(got.at - Date.now()) < 60000, 'время сохранения — часы сервера, в миллисекундах');

  // дальше по порядку: версия растёт
  recordCatch(p, { sp: 'okun', w: 0.4, len: 20 }, false);
  const r2 = await put(c, p, { base: 1 });
  assert.deepEqual([r2.ok, r2.rev, r2.fresh], [true, 2, false]);
  // другое устройство шло от версии 1 — его запись не проходит, в ответ — что лежит на сервере
  const other = angler('Аня', [['karp', 5.5], ['plotva', 0.3]]);
  const r3 = await put(c, other, { base: 1 });
  assert.equal(r3.ok, false);
  assert.equal(r3.now.rev, 2);
  assert.equal(r3.now.sum.species, 2);
  assert.equal((await store.load(idOf(c))).rev, 2, 'сохранение на сервере не тронуто');
  // версия та же, но опыта меньше, чем на сервере (свежий профиль вместо настоящего) — без спроса не пишем
  const blank = angler('Аня');
  assert.equal((await put(c, blank, { base: 2 })).ok, false);
  // игрок сам велел заменить — пишем
  const r4 = await put(c, blank, { base: 1, force: true });
  assert.deepEqual([r4.ok, r4.rev], [true, 3]);
  assert.equal((await store.load(idOf(c))).sum.xp, 0);
  // нет такого игрока — null; стереть можно один раз
  assert.equal(await store.load(idOf(code())), null);
  assert.equal(await store.forget(idOf(c)), true);
  assert.equal(await store.forget(idOf(c)), false);
  assert.equal(await store.load(idOf(c)), null);
});

test('база: запас сохранений по дням', async () => {
  await ready;
  const c = code();
  const id = idOf(c);
  const p = angler('Боря', [['karp', 3]]);
  await put(c, p);
  assert.deepEqual(await store.history(id), [], 'у первой записи запаса нет — затирать было нечего');
  recordCatch(p, { sp: 'karp', w: 4, len: 30 }, false);
  await put(c, p, { base: 1 });
  recordCatch(p, { sp: 'karp', w: 5, len: 30 }, false);
  await put(c, p, { base: 2 });
  let h = await store.history(id);
  assert.equal(h.length, 1, 'в запасе одно сохранение за день — то, с которого день начался');
  assert.equal(h[0].rev, 1);
  // на следующий день (сдвигаем время записи в базе на сутки назад) запас пополняется
  await db.query(`UPDATE players SET saved_at = saved_at - interval '1 day' WHERE id = $1`, [id]);
  await db.query(`UPDATE history SET day = day - 2, saved_at = saved_at - interval '2 days' WHERE player_id = $1`, [id]);
  recordCatch(p, { sp: 'karp', w: 6, len: 30 }, false);
  await put(c, p, { base: 3 });
  h = await store.history(id);
  assert.deepEqual(h.map((x) => x.rev), [3, 1]);
  assert.ok(h[0].xp > h[1].xp);
  // отказанная запись запас не трогает
  await put(c, angler('Боря'), { base: 4 });
  assert.equal((await store.history(id)).length, 2);
  // старше 30 дней — убирается при запуске
  await db.query(`UPDATE history SET saved_at = now() - interval '40 days' WHERE player_id = $1 AND rev = 1`, [id]);
  await store.init();
  assert.deepEqual((await store.history(id)).map((x) => x.rev), [3]);
  await store.forget(id);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM history WHERE player_id = $1', [id])).rows[0].n, 0, 'стёрли игрока — стёрт и его запас');
});

test('база: таблица рекордов', async () => {
  await ready;
  await db.query('DELETE FROM players');
  const [ca, cb, cc] = [code(), code(), code()];
  const a = angler('Аня', [['karp', 5.5], ['okun', 0.4], ['plotva', 0.3]]);
  const b = angler('Боря', [['karp', 7.25], ['okun', 0.4]]);
  const s = angler('Скрытный', [['karp', 8.9], ['som', 40]]);
  await put(ca, a);
  await put(cb, b);
  await put(cc, s, { listed: false });
  for (const [c, p] of [[ca, a], [cb, b], [cc, s]]) await store.setRecords(idOf(c), saveSummary(p).records);
  let top = await store.top(30);
  assert.equal(top.total, 2, 'скрывший себя в счёт не идёт');
  assert.deepEqual(top.anglers.map((r) => r.name), a.xp >= b.xp ? ['Аня', 'Боря'] : ['Боря', 'Аня']);
  assert.ok(top.anglers.every((r) => r.pub && r.lvl >= 1 && typeof r.xp === 'number' && typeof r.species === 'number'));
  const rec = Object.fromEntries(top.records.map((r) => [r.sp, r]));
  assert.deepEqual(Object.keys(rec).sort(), ['karp', 'okun', 'plotva']);
  assert.equal(rec.karp.name, 'Боря');
  assert.equal(rec.karp.w, 7.25);
  assert.equal(rec.okun.name, 'Аня', 'при равном весе рекорд за тем, кто поймал раньше');
  assert.equal(rec.karp.pub, pubOf(cb));
  // места
  const first = top.anglers[0].name === 'Аня' ? ca : cb;
  const second = first === ca ? cb : ca;
  assert.equal((await store.place(pubOf(first))).place, 1);
  assert.equal((await store.place(pubOf(second))).place, 2);
  assert.equal(await store.place(pubOf(cc)), null);
  assert.equal(await store.place('000000000000'), null);
  // рекорды — зеркало журнала: подрос — обновился, пропал из журнала — убран
  recordCatch(a, { sp: 'karp', w: 8, len: 40 }, false);
  delete a.journal.plotva;
  await put(ca, a, { base: 1 });
  await store.setRecords(idOf(ca), saveSummary(a).records);
  top = await store.top(30);
  const rec2 = Object.fromEntries(top.records.map((r) => [r.sp, r]));
  assert.equal(rec2.karp.name, 'Аня');
  assert.equal(rec2.karp.w, 8);
  assert.equal(rec2.plotva, undefined);
  // скрытный передумал — появился и забрал рекорд по карпу
  await put(cc, s, { base: 1, listed: true });
  top = await store.top(30);
  assert.equal(top.total, 3);
  assert.equal(top.records.find((r) => r.sp === 'karp').name, 'Скрытный');
  assert.equal(top.records.find((r) => r.sp === 'som').w, 40);
  // предел числа строк
  assert.equal((await store.top(2)).anglers.length, 2);
  assert.equal(await store.count(), 3);
});

async function withServer(fn, st = store) {
  await ready;
  const srv = createServer({ store: st });
  await new Promise((r) => srv.server.listen(0, r));
  const base = `http://127.0.0.1:${srv.server.address().port}`;
  const call = async (path, body, method) => {
    const r = await fetch(base + path, body === undefined ? { method: method || 'GET' } : { method: method || 'POST', headers: { 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
    let d = null;
    try {
      d = await r.json();
    } catch {
      d = null;
    }
    return { http: r.status, ...d };
  };
  try {
    await fn(call, srv);
  } finally {
    srv.close();
  }
}

test('сервер: сохранить, загрузить на другом устройстве, разойтись и сойтись', async () => {
  await withServer(async (call) => {
    await db.query('DELETE FROM players');
    assert.deepEqual(await call('/api/status'), { http: 200, ok: true, db: true });
    const c = code();
    const p = angler('Жамшид', [['karp', 6.1], ['okun', 0.5]]);
    // пустое сохранение сервер не заводит
    const empty = await call('/api/save', { code: c, base: 0, save: newProfile() });
    assert.deepEqual([empty.http, empty.ok, empty.rev, empty.skipped], [200, true, 0, true]);
    assert.equal((await call('/api/load', { code: c })).why, 'NO_SAVE');
    // первое настоящее
    const s1 = await call('/api/save', { code: showCode(c).toLowerCase(), base: 0, at: 123, save: p });
    assert.deepEqual([s1.http, s1.ok, s1.rev], [200, true, 1]);
    assert.equal(s1.pub, pubOf(c));
    assert.ok(!JSON.stringify(s1).includes(c), 'код в ответе не повторяется');
    // «другое устройство»: знает только код
    const l1 = await call('/api/load', { code: c });
    assert.equal(l1.http, 200);
    assert.equal(l1.rev, 1);
    assert.equal(l1.sum.name, 'Жамшид');
    assert.equal(l1.sum.species, 2);
    assert.deepEqual(l1.save, JSON.parse(JSON.stringify(p)));
    // сохранение с сервера проходит ту же починку, что и файл: его можно сразу брать в игру
    const back = importSave(exportSave(l1.save, 0));
    assert.equal(back.ok, true);
    assert.equal(back.profile.journal.karp.best, 6.1);
    // оба устройства играют от версии 1: первое записалось, второму — отказ с описанием того, что на сервере
    const p2 = JSON.parse(JSON.stringify(p));
    recordCatch(p, { sp: 'plotva', w: 0.3, len: 20 }, false);
    recordCatch(p2, { sp: 'karas', w: 1.1, len: 25 }, false);
    assert.equal((await call('/api/save', { code: c, base: 1, save: p })).rev, 2);
    const clash = await call('/api/save', { code: c, base: 1, save: p2 });
    assert.deepEqual([clash.http, clash.ok, clash.why, clash.now.rev], [409, false, 'CONFLICT', 2]);
    assert.equal(clash.now.sum.species, 3);
    assert.equal(clash.now.save, undefined, 'в отказе — только описание, не всё сохранение');
    // игрок выбрал оставить второе устройство
    const forced = await call('/api/save', { code: c, base: 2, force: true, save: p2 });
    assert.deepEqual([forced.http, forced.rev], [200, 3]);
    assert.equal((await call('/api/load', { code: c })).save.journal.karas.best, 1.1);
    // таблица: игрок в ней, с рекордами; его место считается по открытому номеру, а не по коду
    const top = await call(`/api/top?me=${s1.pub}`);
    assert.equal(top.http, 200);
    assert.equal(top.total, 1);
    assert.equal(top.anglers[0].name, 'Жамшид');
    assert.equal(top.anglers[0].pub, s1.pub);
    assert.deepEqual(top.me, { xp: top.anglers[0].xp, place: 1 });
    assert.deepEqual(top.records.map((r) => r.sp).sort(), ['karas', 'karp', 'okun']);
    assert.ok(!JSON.stringify(top).includes(idOf(c)), 'номер строки в базе наружу не уходит');
    assert.equal((await call('/api/top')).me, null);
    // скрылся из таблицы
    assert.equal((await call('/api/save', { code: c, base: 3, listed: false, save: p2 })).rev, 4);
    const hidden = await call(`/api/top?me=${s1.pub}`);
    assert.deepEqual([hidden.total, hidden.anglers.length, hidden.records.length, hidden.me], [0, 0, 0, null]);
    assert.equal((await call('/api/load', { code: c })).listed, false);
    // стёр сохранение с сервера
    assert.deepEqual(await call('/api/forget', { code: c }), { http: 200, ok: true, gone: true });
    assert.equal((await call('/api/load', { code: c })).http, 404);
    assert.deepEqual(await call('/api/forget', { code: c }), { http: 200, ok: true, gone: false });
  });
});

test('сервер: отказы — плохой код, мусор, слишком большое, слишком часто', async () => {
  await withServer(async (call) => {
    const c = code();
    assert.deepEqual(await call('/api/save', { code: 'ABC', save: {} }), { http: 400, ok: false, why: 'BAD_CODE' });
    assert.deepEqual(await call('/api/load', {}), { http: 400, ok: false, why: 'BAD_CODE' });
    assert.deepEqual(await call('/api/save', 'не json'), { http: 400, ok: false, why: 'BAD_JSON' });
    assert.deepEqual(await call('/api/save', '[1,2]'), { http: 400, ok: false, why: 'BAD_JSON' });
    assert.deepEqual(await call('/api/save', { code: c, save: 'строка' }), { http: 400, ok: false, why: 'BAD_SAVE' });
    assert.deepEqual(await call('/api/save', { code: c, save: [1] }), { http: 400, ok: false, why: 'BAD_SAVE' });
    assert.deepEqual(await call('/api/nope', { code: c }), { http: 404, ok: false, why: 'NO_ROUTE' });
    assert.deepEqual(await call('/api/save', undefined, 'GET'), { http: 404, ok: false, why: 'NO_ROUTE' });
    // сохранение больше положенного
    const fat = angler('Толстяк', [['karp', 5]]);
    fat.note = 'x'.repeat(MAX_SAVE_BYTES);
    const big = await call('/api/save', { code: c, save: fat });
    assert.deepEqual([big.http, big.why], [413, 'TOO_BIG']);
    fat.note = 'x'.repeat(MAX_SAVE_BYTES * 3);
    assert.equal((await call('/api/save', { code: c, save: fat })).http, 413);
    assert.equal((await call('/api/load', { code: c })).http, 404, 'ничего не записалось');
    // запись одного игрока чаще, чем раз в три секунды: первые шесть проходят (запас), дальше — «помедленнее»
    const p = angler('Спешка', [['karp', 5]]);
    const codes = [];
    for (let i = 0; i < 9; i++) codes.push((await call('/api/save', { code: c, base: i, save: p })).http);
    assert.deepEqual(codes.slice(0, 6), [200, 200, 200, 200, 200, 200]);
    assert.ok(codes.slice(6).every((x) => x === 429), codes.join());
  });
});

test('сервер: с одного адреса — не больше восьми новых сохранений подряд и не больше дюжины промахов кодом', async () => {
  await withServer(async (call) => {
    const p = angler('Много', [['karp', 5]]);
    const made = [];
    for (let i = 0; i < 10; i++) made.push((await call('/api/save', { code: code(), base: 0, save: p })).http);
    assert.deepEqual(made, [200, 200, 200, 200, 200, 200, 200, 200, 429, 429]);
    const miss = [];
    for (let i = 0; i < 14; i++) miss.push((await call('/api/load', { code: code() })).http);
    assert.deepEqual(miss.slice(0, 12), new Array(12).fill(404));
    assert.deepEqual(miss.slice(12), [429, 429]);
  });
});

test('сервер без базы: игра работает, сохранения — нет', async () => {
  await withServer(async (call, srv) => {
    assert.deepEqual(await call('/api/status'), { http: 200, ok: true, db: false });
    assert.deepEqual(await call('/api/load', { code: code() }), { http: 503, ok: false, why: 'NO_DB' });
    assert.deepEqual(await call('/api/top'), { http: 503, ok: false, why: 'NO_DB' });
    const h = await call('/health');
    assert.deepEqual([h.ok, h.db], [true, false]);
    // базу дали позже — заработало без перезапуска
    srv.setStore(store);
    assert.equal((await call('/api/status')).db, true);
    assert.equal((await call('/health')).db, true);
  }, null);
});

test('сервер: база сломалась посреди работы — отказ без подробностей, сервер жив', async () => {
  const broken = createStore(async () => {
    throw new Error('connection terminated: password=secret');
  });
  const errors = [];
  const orig = console.error;
  console.error = (...a) => errors.push(a.join(' '));
  try {
    await withServer(async (call) => {
      const r = await call('/api/load', { code: code() });
      assert.deepEqual(r, { http: 503, ok: false, why: 'DB' });
      assert.equal((await call('/api/top')).http, 503);
      assert.equal((await call('/health')).ok, true);
    }, broken);
  } finally {
    console.error = orig;
  }
  assert.ok(errors.length >= 2, 'ошибка базы записана в журнал сервера');
});
