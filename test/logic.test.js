import test from 'node:test';
import assert from 'node:assert/strict';
import { FISH, FISH_BY_ID, ITEMS, RODS, ZONES, CATS, clockHours, dayPart, fmtClock, DAY_REAL_SEC } from '../shared/data.js';
import * as L from '../shared/logic.js';

const rng = () => L.mulberry32(42);

test('данные согласованы: у каждой рыбы есть зона, наживка и внешний вид', () => {
  const ids = new Set();
  for (const f of FISH) {
    assert.ok(!ids.has(f.id), f.id);
    ids.add(f.id);
    assert.ok(f.w[0] > 0 && f.w[1] > f.w[0], f.id);
    for (const z of Object.keys(f.zones)) assert.ok(ZONES[z], `${f.id}: зона ${z}`);
    for (const b of Object.keys(f.baits)) assert.ok(ITEMS[b] && ITEMS[b].cat === 'tackle', `${f.id}: наживка ${b}`);
    assert.ok(f.look && f.look.shape && f.look.lenK, f.id);
    assert.ok(Object.keys(f.baits).length || f.lure > 0, f.id);
  }
  const itemIds = CATS.flatMap((c) => c.items.map((i) => i.id));
  assert.equal(new Set(itemIds).size, itemIds.length);
});

test('каждую рыбу можно поймать хоть где-то и хоть на что-то', () => {
  const caught = new Set();
  const r = rng();
  const tackles = Object.values(ITEMS).filter((i) => i.count).map((i) => i.id);
  for (const zone of Object.keys(ZONES)) for (const tk of tackles) for (const hour of [6, 12, 19, 23]) {
    const spot = { zone, depth: zone === 'deep' || zone === 'arch' ? 12 : 3, pier: zone === 'pier', hot: true };
    for (const e of L.speciesWeights(spot, tk, hour)) caught.add(e.f.id);
    const c = L.rollFish(spot, tk, hour, r);
    assert.ok(c.w > 0 && (c.junk || FISH_BY_ID[c.sp]));
  }
  assert.equal(caught.size, FISH.length, FISH.filter((f) => !caught.has(f.id)).map((f) => f.id).join());
});

test('вес рыбы в пределах вида, трофеи редки', () => {
  const r = rng();
  let trophy = 0;
  let n = 0;
  for (let i = 0; i < 4000; i++) {
    const c = L.rollFish({ zone: 'mid', depth: 4, hot: false }, 'worm', 12, r);
    if (c.junk) continue;
    const f = FISH_BY_ID[c.sp];
    assert.ok(c.w >= f.w[0] - 1e-9 && c.w <= f.w[1] + 1e-9);
    n++;
    if (c.trophy) trophy++;
  }
  assert.ok(trophy / n < 0.12 && trophy > 0);
});

test('поклёвка: в разумных пределах, на косяке быстрее', () => {
  const p = L.newProfile();
  const kit = L.kitStats(p);
  const r = rng();
  const avg = (hot) => {
    let s = 0;
    for (let i = 0; i < 3000; i++) {
      const d = L.biteDelay({ zone: 'mid', depth: 4, hot }, 'worm', 12, kit, r);
      assert.ok(d.t >= 2.5 && d.t <= 28);
      s += d.t;
    }
    return s / 3000;
  };
  const a = avg(false);
  const b = avg(true);
  assert.ok(a > 7 && a < 14, String(a));
  assert.ok(b < a * 0.75);
});

test('вываживание: мелочь ловится стартовой удочкой, великан на ней рвёт леску у новичка', () => {
  const p = L.newProfile();
  const kit = L.kitStats(p);
  const r = rng();
  let ok = 0;
  for (let i = 0; i < 100; i++) if (L.botFight({ sp: 'okun', w: 0.5 }, kit, r, 0.5).result === 'landed') ok++;
  assert.ok(ok >= 95, 'окунь ' + ok);
  let snap = 0;
  for (let i = 0; i < 100; i++) if (L.botFight({ sp: 'som', w: 30 }, kit, r, 0.5).result !== 'landed') snap++;
  assert.ok(snap >= 95, 'сом ' + snap);
});

test('вываживание: если держать кнопку не отпуская — леска рвётся; если не мотать — рыба сходит', () => {
  const kit = L.kitStats(L.newProfile());
  const r = rng();
  const s = L.fightInit({ sp: 'kefal', w: 1.5 }, kit, r);
  for (let i = 0; i < 3000 && !s.result; i++) L.fightStep(s, { reel: true, steer: 0 }, 1 / 30, kit, r);
  assert.equal(s.result, 'snap');
  const s2 = L.fightInit({ sp: 'kefal', w: 1.5 }, kit, r);
  for (let i = 0; i < 3000 && !s2.result; i++) L.fightStep(s2, { reel: false, steer: 0 }, 1 / 30, kit, r);
  assert.equal(s2.result, 'escape');
});

test('цены: крупнее — дороже, трофей и спрос добавляют', () => {
  const m = L.marketState('seed', 100);
  assert.equal(m.hot.length, 3);
  for (const f of FISH) assert.ok(m.mult[f.id] >= 0.85 && m.mult[f.id] <= 1.6);
  const a = L.fishValue({ sp: 'okun', w: 0.3 }, null);
  const b = L.fishValue({ sp: 'okun', w: 1.0 }, null);
  const c = L.fishValue({ sp: 'okun', w: 1.0, trophy: true }, null);
  assert.ok(a < b && b < c);
  const same = L.marketState('seed', 101);
  assert.deepEqual(same.mult, m.mult);
  assert.notDeepEqual(L.marketState('seed', 700).mult, m.mult);
});

test('профиль: купить, взять, поймать, продать', () => {
  const p = L.newProfile();
  assert.equal(L.buy(p, 'rod2').ok, false);
  p.coins = 1000;
  assert.equal(L.buy(p, 'rod2').ok, true);
  assert.equal(p.equip.rod, 'rod2');
  assert.equal(p.coins, 550);
  assert.equal(L.buy(p, 'rod2').ok, false);
  assert.equal(L.equip(p, 'rod1').ok, true);
  assert.equal(L.equip(p, 'rod6').ok, false);
  assert.equal(L.buy(p, 'shrimp').ok, true);
  assert.equal(p.tackle.shrimp, 10);
  assert.equal(L.equip(p, 'shrimp').ok, true);
  for (let i = 0; i < 10; i++) L.spendTackle(p);
  assert.equal(p.equip.tackle, 'bread');
  assert.equal(L.spendTackle(p).left, Infinity);
  const kit = L.kitStats(p);
  for (let i = 0; i < kit.bagCap; i++) assert.equal(L.addCatch(p, { sp: 'okun', w: 0.4, len: 24 }, kit).ok, true);
  assert.equal(L.addCatch(p, { sp: 'okun', w: 0.4 }, kit).full, true);
  const r = L.recordCatch(p, { sp: 'okun', w: 0.4 }, false);
  assert.ok(r.isNew && r.xp > 0);
  const before = p.coins;
  const one = L.sell(p, 0, null);
  assert.ok(one.ok && one.n === 1);
  const all = L.sell(p, null, null);
  assert.equal(all.n, kit.bagCap - 1);
  assert.equal(p.coins, before + one.total + all.total);
  assert.equal(L.sell(p, null, null).ok, false);
  const fixed = L.fixProfile(JSON.parse(JSON.stringify(p)));
  assert.equal(fixed.coins, p.coins);
  assert.ok(L.fixProfile({ coins: 'x', equip: { rod: 'nope' } }).equip.rod === 'rod1');
});

test('уровни растут, часы идут по кругу', () => {
  assert.equal(L.levelInfo(0).lvl, 1);
  assert.ok(L.levelInfo(5000).lvl > L.levelInfo(500).lvl);
  assert.equal(fmtClock(clockHours(0, 8)), '08:00');
  let prev = clockHours(0, 8);
  let wraps = 0;
  for (let t = 10; t <= DAY_REAL_SEC; t += 10) {
    const h = clockHours(t, 8);
    if (h < prev) wraps++;
    prev = h;
  }
  assert.equal(wraps, 1);
  assert.ok(Math.abs(clockHours(DAY_REAL_SEC, 8) - 8) < 0.05);
  assert.equal(dayPart(12), 'day');
  assert.equal(dayPart(23), 'night');
  assert.ok(RODS.every((r, i) => !i || r.cast > RODS[i - 1].cast));
});

test('погода: одна на всех по зерну комнаты, меняется плавно, в непогоду клюёт чаще', () => {
  // первые пять минут — всегда ясно; дальше по зерну, у двух игроков с одним зерном — одно и то же
  assert.equal(L.weatherAt('room1', 0).kind, 'clear');
  assert.equal(L.weatherAt('room1', 250).rain, 0);
  const kinds = new Set();
  for (let t = 0; t < 400 * L.WEATHER_PERIOD; t += 97) {
    const a = L.weatherAt('room1', t);
    assert.deepEqual(a, L.weatherAt('room1', t));
    assert.ok(L.WEATHER[a.kind] && a.bite >= 1 && a.bite <= 1.3 + 1e-9 && a.cover >= 0 && a.cover <= 1 && a.rain >= 0 && a.rain <= 1 && a.fog >= 0 && a.fog <= 1);
    kinds.add(a.kind);
  }
  assert.deepEqual([...kinds].sort(), ['clear', 'cloudy', 'fog', 'rain']);
  // переход без скачков: за секунду ни одна величина не меняется заметно
  let prev = L.weatherAt('room1', 0);
  for (let t = 1; t < 30 * L.WEATHER_PERIOD; t++) {
    const w = L.weatherAt('room1', t);
    for (const k of ['cover', 'rain', 'fog', 'bite']) assert.ok(Math.abs(w[k] - prev[k]) < 0.04, `${k} скачет на ${t}-й секунде`);
    prev = w;
  }
  // насильно заданная погода (для проверок) держится всё время
  assert.equal(L.weatherAt('room1', 12345, 'rain').rain, 1);
  assert.equal(L.weatherAt('room1', 12345, 'fog').kind, 'fog');
  // клёв: в дождь ждать меньше, эхолот показывает больше
  const kit = L.kitStats(L.newProfile());
  const mean = (wx) => {
    const r = rng();
    let s = 0;
    for (let i = 0; i < 3000; i++) s += L.biteDelay({ zone: 'mid', depth: 4, wx }, 'worm', 12, kit, r).t;
    return s / 3000;
  };
  const dry = mean(1);
  const wet = mean(L.WEATHER.rain.bite);
  assert.ok(wet < dry * 0.9 && wet > dry * 0.7, `в дождь ${wet.toFixed(1)} с против ${dry.toFixed(1)} с`);
  assert.ok(L.activity({ zone: 'mid', depth: 4, wx: 1.3 }, 'worm', 12, kit) > L.activity({ zone: 'mid', depth: 4 }, 'worm', 12, kit));
});

test('задания на день: три разной трудности, у всех одинаковые, числа и награды растут с уровнем', () => {
  const kindsSeen = new Set();
  for (let day = 20000; day < 20400; day++) {
    const a = L.makeQuests(day, 1);
    assert.deepEqual(a, L.makeQuests(day, 1));
    assert.equal(a.length, 3);
    assert.deepEqual(a.map((q) => q.tier), [0, 1, 2]);
    assert.equal(new Set(a.map((q) => q.k)).size, 3, 'виды заданий в один день не повторяются');
    for (const q of a) {
      kindsSeen.add(q.k);
      assert.ok(q.n > 0 && q.c === 0 && !q.done);
      const text = L.questText(q);
      assert.ok(text.length > 8 && !/undefined|NaN|\?/.test(text), text);
      if (q.k === 'sp') assert.ok(FISH_BY_ID[q.a] && FISH_BY_ID[q.a].rar <= 1);
      if (q.k === 'zone') assert.ok(ZONES[q.a], q.a);
      const r = L.questReward(q, 1);
      assert.ok(r.coins >= 25 && r.xp >= 20);
    }
    // у опытного игрока те же виды заданий, но числа и награды крупнее
    const b = L.makeQuests(day, 15);
    assert.deepEqual(b.map((q) => [q.k, q.a]), a.map((q) => [q.k, q.a]));
    for (let i = 0; i < 3; i++) {
      assert.ok(b[i].n >= a[i].n);
      assert.ok(L.questReward(b[i], 15).coins > L.questReward(a[i], 1).coins);
    }
    assert.ok(L.questReward(a[2], 1).coins > L.questReward(a[1], 1).coins && L.questReward(a[1], 1).coins > L.questReward(a[0], 1).coins);
  }
  assert.ok(kindsSeen.size >= 12, [...kindsSeen].join());
  // день считается по местному времени: в полночь по Москве (UTC+3) номер меняется
  const msk = -180;
  assert.equal(L.questDay(Date.UTC(2026, 10, 12, 20, 59), msk) + 1, L.questDay(Date.UTC(2026, 10, 12, 21, 1), msk));
});

test('задания: улов, продажа и турнир двигают счёт; награда приходит один раз, за все три — премия', () => {
  const p = L.newProfile();
  assert.equal(L.syncQuests(p, 20000), true);
  assert.equal(L.syncQuests(p, 20000), false, 'в тот же день задания не перевыдаются');
  // собираем свой набор — по одному заданию каждого вида счёта
  const set = (list) => (p.quests = { day: 20000, bonus: false, list: list.map(([k, n, a], tier) => ({ k, n, a, c: 0, tier, done: false, ...(k === 'kinds' ? { s: [] } : {}) })) });
  const okun = (w, extra = {}) => ({ t: 'catch', c: { sp: 'okun', w, junk: false, trophy: false }, zone: 'pier', boat: false, released: false, wx: 'clear', ...extra });
  set([['fish', 2], ['sp', 1, 'plotva'], ['kg', 1]]);
  const coins0 = p.coins;
  let r = L.questEvent(p, { t: 'catch', c: { sp: 'boot', w: 0.5, junk: true } });
  assert.equal(r.done.length, 0, 'хлам в зачёт не идёт');
  assert.equal(p.quests.list[0].c, 0);
  r = L.questEvent(p, okun(0.4));
  assert.deepEqual(p.quests.list.map((q) => q.c), [1, 0, 0.4]);
  assert.equal(L.questCount(p.quests.list[0]), '1 / 2');
  assert.equal(L.questCount(p.quests.list[2]), '0,4 / 1 кг');
  r = L.questEvent(p, okun(0.7));
  assert.deepEqual(r.done.map((q) => q.k), ['fish', 'kg']);
  assert.equal(r.coins, 25 + 130);
  assert.equal(p.coins, coins0 + 155);
  assert.equal(r.bonus, 0);
  r = L.questEvent(p, okun(0.7));
  assert.equal(r.done.length, 0, 'закрытое задание второй раз не платит');
  r = L.questEvent(p, { t: 'catch', c: { sp: 'plotva', w: 0.2 }, zone: 'backwater' });
  assert.deepEqual(r.done.map((q) => q.k), ['sp']);
  assert.ok(r.bonus >= L.QUEST_BONUS && r.coins >= 60, 'все три — премия (награды растут с уровнем, а он от опыта за задания вырос)');
  assert.equal(p.coins, coins0 + 155 + r.coins + r.bonus);
  assert.equal(p.stats.quests, 3);
  assert.equal(L.questEvent(p, okun(1)).bonus, 0, 'премия одна');
  // остальные виды счёта
  set([['kinds', 2], ['zone', 2, 'sea'], ['free', 1]]);
  L.questEvent(p, okun(0.3, { zone: 'sea', released: true }));
  L.questEvent(p, okun(0.3, { zone: 'sea' }));
  assert.deepEqual(p.quests.list.map((q) => [q.c, q.done]), [[1, false], [2, true], [1, true]]);
  L.questEvent(p, { t: 'catch', c: { sp: 'bychok', w: 0.1 }, zone: 'pier' });
  assert.equal(p.quests.list[0].done, true);
  set([['big', 1.2], ['rare', 1, 2], ['trophy', 1]]);
  L.questEvent(p, okun(1.1));
  assert.equal(L.questCount(p.quests.list[0]), 'пока 1,1 кг');
  L.questEvent(p, { t: 'catch', c: { sp: 'karp', w: 3, trophy: true }, zone: 'backwater' });
  assert.deepEqual(p.quests.list.map((q) => q.done), [true, false, true], 'карп — необычная рыба, редкой не считается');
  L.questEvent(p, { t: 'catch', c: { sp: 'shuka', w: 2 }, zone: 'backwater' });
  assert.equal(p.quests.list[1].done, true);
  set([['boat', 1], ['wx', 1], ['sell', 100]]);
  L.questEvent(p, okun(0.3));
  assert.deepEqual(p.quests.list.map((q) => q.c), [0, 0, 0]);
  L.questEvent(p, okun(0.3, { boat: true, wx: 'rain' }));
  L.questEvent(p, { t: 'sell', total: 60 });
  assert.equal(L.questCount(p.quests.list[2]), '60 / 100');
  L.questEvent(p, { t: 'sell', total: 60 });
  assert.deepEqual(p.quests.list.map((q) => q.done), [true, true, true]);
  set([['tour', 1], ['fish', 99], ['fish', 99]]);
  assert.equal(L.questEvent(p, { t: 'tour' }).done.length, 1);
  // новый день — новые задания; сломанное сохранение чинится
  assert.equal(L.syncQuests(p, 20001), true);
  assert.equal(p.quests.list.every((q) => !q.done && q.c === 0), true);
  p.quests = { day: 'x', list: 5 };
  p.stats.quests = 'много';
  L.fixProfile(p);
  assert.equal(p.quests, null);
  assert.equal(p.stats.quests, 0);
  assert.equal(L.questEvent(p, okun(1)).done.length, 0, 'без заданий событие ничего не ломает');
  const old = L.fixProfile({ name: 'Старожил', coins: 5, stats: { caught: 9 } });
  assert.equal(old.stats.caught, 9);
  assert.equal(old.stats.tours, 0);
  assert.equal(old.quests, null);
});

test('турнир: зачёт, таблица, призы и медали', () => {
  const a = L.tourBlank();
  assert.equal(L.tourAdd(a, { sp: 'boot', w: 0.5, junk: true }, 1), false, 'хлам не считается');
  assert.equal(L.tourAdd(a, { sp: 'нет такой', w: 3 }, 1), false);
  assert.equal(L.tourAdd(a, { sp: 'okun', w: 0.4 }, 10), true);
  assert.equal(L.tourAdd(a, { sp: 'okun', w: 999 }, 20), true);
  assert.ok(a.best <= FISH_BY_ID.okun.w[1] * 1.02 + 1e-9, 'вес не больше, чем бывает у вида');
  assert.equal(a.n, 2);
  const b = L.tourBlank();
  L.tourAdd(b, { sp: 'karp', w: 4.2 }, 30);
  const c = L.tourBlank();
  const rows = [{ id: 1, name: 'А', slot: 0, s: a }, { id: 2, name: 'Б', slot: 1, s: b }, { id: 3, name: 'В', slot: 2, s: c }];
  assert.deepEqual(L.tourTable('big', rows).map((r) => [r.id, r.place]), [[2, 1], [1, 2], [3, 0]]);
  assert.deepEqual(L.tourTable('count', rows).map((r) => [r.id, r.place]), [[1, 1], [2, 2], [3, 0]]);
  assert.deepEqual(L.tourTable('sum', rows).map((r) => r.id), [2, 1, 3]);
  assert.equal(L.tourScoreText('count', a), '2 рыбы');
  assert.equal(L.tourScoreText('big', b), '4,2 кг');
  // при равном счёте выше тот, кто набрал его раньше
  const d = L.tourBlank();
  L.tourAdd(d, { sp: 'karp', w: 4.2 }, 5);
  assert.deepEqual(L.tourTable('big', [...rows, { id: 4, name: 'Г', slot: 3, s: d }]).map((r) => r.id).slice(0, 2), [4, 2]);
  // призы: в комнате от двух человек; первое место больше второго; без улова — ничего
  assert.equal(L.tourPrize(1, 1, 300), 0);
  assert.equal(L.tourPrize(0, 4, 300), 0);
  for (const n of [2, 3, 5, 8]) for (const len of L.TOUR_LENS) {
    assert.ok(L.tourPrize(1, n, len) > L.tourPrize(2, n, len) && L.tourPrize(2, n, len) >= 10);
    assert.ok(L.tourPrize(1, n, len) <= 250);
  }
  assert.ok(L.tourPrize(1, 8, 600) > L.tourPrize(1, 2, 180));
  // медали в одиночку: пороги растут от бронзы к золоту, с длиной заплыва и со снастью
  const starter = L.kitStats(L.newProfile());
  for (const kind of Object.keys(L.TOURS)) for (const len of L.TOUR_LENS) {
    const t = L.tourTargets(kind, len, starter);
    assert.ok(t[0] > 0 && t[1] > t[0] && t[2] > t[1], `${kind} ${len}: ${t}`);
    assert.equal(L.tourMedal(kind, len, starter, L.tourBlank()), 0);
  }
  assert.ok(L.tourTargets('sum', 600, starter)[2] > L.tourTargets('sum', 180, starter)[2]);
  assert.ok(L.tourTargets('big', 300, { lineKg: 15 })[2] > L.tourTargets('big', 300, starter)[2]);
  const s = L.tourBlank();
  for (let i = 0; i < 7; i++) L.tourAdd(s, { sp: 'okun', w: 0.3 }, i);
  assert.equal(L.tourMedal('count', 300, starter, s), 3);
  assert.equal(L.tourMedal('count', 600, starter, s), 1);
  assert.ok(L.medalPrize(3, 300) > L.medalPrize(2, 300) && L.medalPrize(2, 300) > L.medalPrize(1, 300) && L.medalPrize(0, 300) === 0);
});

// ───── автоподбор качества (client/perf.js): чистая логика, без отрисовки ─────
import { newTuner, tuneStep, needDrop, scaleFor, TARGET_MS, BUDGET_MS, Perf, isSoftware } from '../client/perf.js';

test('подбор при загрузке: дорогой кадр — ступень ниже, небольшое превышение — разрешение меньше', () => {
  assert.ok(needDrop(40, 'high') && needDrop(40, 'medium') && !needDrop(40, 'low'), 'ниже «низкого» ступени нет');
  // с «высокого» уходим раньше, чем со «среднего»: разрешение ему помогает слабо (замер на Apple M4: 15,4 мс — остаёмся)
  assert.ok(!needDrop(15.4, 'high') && needDrop(22, 'high') && !needDrop(22, 'medium') && needDrop(27, 'medium'));
  assert.equal(scaleFor(6, 'high'), 1, 'запас есть — разрешение полное');
  assert.equal(scaleFor(BUDGET_MS * 1.05, 'high'), 1, 'чуть больше нормы — не трогаем');
  const s = scaleFor(20, 'high');
  assert.ok(s > 0.7 && s < 0.82, `20 мс на «высоком» → около 77 %: ${s}`);
  assert.equal(scaleFor(500, 'medium'), 0.62, 'нижняя граница на «среднем»');
  assert.equal(scaleFor(500, 'low'), 0.5, 'и на «низком»');
  assert.ok(isSoftware('Google, Vulkan 1.3.0 (SwiftShader Device (Subzero))') && isSoftware('llvmpipe (LLVM 15)') && !isSoftware('Apple M4') && !isSoftware('Intel(R) UHD Graphics 620'));
});

test('подбор на ходу: проседает — разрешение вниз, потом ступень; идёт ровно — разрешение обратно', () => {
  const st = newTuner();
  const q = { scale: 1, floor: 0.62, canDrop: true, drs: true };
  const run = (avg, n) => { const out = []; for (let i = 0; i < n; i++) { const r = tuneStep(st, avg, q); if (r) { out.push(r); if (r.scale) q.scale = r.scale; } } return out; };
  // ровные 60 кадров: ничего не трогаем
  assert.deepEqual(run(16.7, 40), []);
  // 30 мс на кадр: через секунду разрешение уходит вниз, и так до нижней границы
  const down = run(30, 40);
  assert.ok(down.length >= 3 && down[0].scale < 1 && down[0].scale >= 0.75, `первый шаг не резче четверти: ${JSON.stringify(down[0])}`);
  const drop = down.findIndex((r) => r.drop);
  assert.ok(drop > 0 && down.slice(0, drop).every((r) => r.scale), 'сначала разрешение, и только на нижней границе — ступень качества');
  assert.ok(Math.abs(q.scale - 0.62) < 0.001, `дошли до границы: ${q.scale}`);
  // полегчало: разрешение возвращается шагами, но не выше того, на чём просело, — пока не пройдёт время
  Object.assign(st, newTuner());
  q.scale = 0.7;
  st.ceil = 0.85;
  const up = run(16.7, 60);
  assert.ok(up.length >= 2 && up.every((r) => r.scale > 0.7) && q.scale > 0.82 && q.scale <= 0.85, `вернулись к потолку (с точностью до шага): ${q.scale}`);
  run(16.7, 200);
  assert.ok(st.ceil > 0.85 && q.scale > 0.85, 'долго ровно — потолок поднимается');
  // подняли — и тут же просело: значит, выше не по силам, следующая попытка откладывается вдвое
  Object.assign(st, newTuner());
  q.scale = 0.7;
  st.ceil = 0.8;
  assert.ok(run(16.7, 12).some((r) => r.scale > 0.7), 'подняли');
  assert.ok(run(30, 6).some((r) => r.scale < 0.76) && st.wait === 60, `просело сразу после подъёма — ждём дольше: ${st.wait}`);
  // кадры между нормой и порогом (20 мс) — ни вверх, ни вниз
  Object.assign(st, newTuner());
  q.scale = 0.8;
  assert.deepEqual(run(TARGET_MS * 1.1, 60), []);
  // без плавного разрешения: только ступень, и не раньше четырёх секунд
  Object.assign(st, newTuner());
  const q2 = { scale: 1, floor: 0.62, canDrop: true, drs: false };
  const outs = [];
  for (let i = 0; i < 8; i++) outs.push(tuneStep(st, 40, q2));
  assert.ok(outs.slice(0, 7).every((r) => r === null) && outs[7] && outs[7].drop);
  // ручное качество: ступень не трогаем никогда
  Object.assign(st, newTuner());
  const q3 = { scale: 0.62, floor: 0.62, canDrop: false, drs: true };
  for (let i = 0; i < 60; i++) assert.equal(tuneStep(st, 50, q3), null);
});

test('счётчик кадров: среднее, худшие кадры и рывки', () => {
  const p = new Perf({ getContext: () => ({ getExtension: () => null, getParameter: () => 'Тестовая карта', RENDERER: 1 }) });
  assert.equal(p.gpu, 'Тестовая карта');
  for (let i = 0; i < 99; i++) p.push(10);
  p.push(80);
  p.push(5000); // вкладка была в фоне — не считается
  const s = p.stats();
  assert.ok(s.n === 100 && Math.abs(s.avg - 10.7) < 0.01 && s.max === 80 && s.hitches === 1 && Math.round(s.fps) === 93, JSON.stringify(s));
});
