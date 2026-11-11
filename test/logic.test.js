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
