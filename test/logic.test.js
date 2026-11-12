import test from 'node:test';
import assert from 'node:assert/strict';
import { FISH, FISH_BY_ID, FIGHT_STYLES, ITEMS, RODS, ZONES, CATS, clockHours, dayPart, fmtClock, DAY_REAL_SEC } from '../shared/data.js';
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

// снасть для проверок вываживания: стартовая — из нового профиля, остальные собираем
const kitOf = (rod, line, reel, hook, net) => {
  const p = L.newProfile();
  Object.assign(p.equip, { rod, line, reel, hook });
  if (net) p.owned.net = true;
  return L.kitStats(p);
};
const MID = () => kitOf('rod3', 'line2', 'reel2', 'hook2', true);
const TOP = () => kitOf('rod6', 'line4', 'reel4', 'hook4', true);
const half = () => 0.5; // «случай», при котором всё происходит по среднему
const DT = 1 / 30;

test('манеры: у каждой рыбы своя, все семь в деле; у легенд два «вторых дыхания», у мусора — ничего', () => {
  const used = new Set();
  const kit = L.kitStats(L.newProfile());
  for (const f of FISH) {
    assert.ok(FIGHT_STYLES[f.style] && FIGHT_STYLES[f.style].name && FIGHT_STYLES[f.style].tip, f.id);
    assert.ok(L.STYLE_K[f.style], f.id);
    used.add(f.style);
    const s = L.fightInit({ sp: f.id, w: f.w[0] }, kit, half);
    assert.equal(s.style, f.style, f.id);
    assert.equal(s.boss, f.rar >= 4 ? 2 : 0, f.id);
  }
  assert.deepEqual([...used].sort(), Object.keys(FIGHT_STYLES).sort());
  assert.ok(FISH.filter((f) => f.rar >= 4).length >= 3);
  const junk = L.fightInit({ sp: 'boot', w: 1, junk: true }, kit, half);
  assert.equal(junk.style, 'plain');
  assert.equal(junk.boss, 0);
});

test('свеча: опасная зона начинается раньше, подмотка рвёт леску, отпущенная леска успевает ослабнуть', () => {
  const kit = L.kitStats(L.newProfile()); // щука на стартовой снасти — рыба в полную силу
  const start = () => {
    const s = L.fightInit({ sp: 'shuka', w: 4 }, kit, half);
    assert.ok(s.rho >= 1, String(s.rho));
    s.next = 'run';
    s.warned = true; // всплеск-предупреждение уже был
    s.phaseT = 0;
    s.T = 0.6;
    return s;
  };
  const a = start();
  assert.deepEqual(L.fightStep(a, { reel: false, steer: 0 }, DT, kit, half), ['run', 'jump']);
  assert.ok(a.jumpT > 0.7);
  assert.equal(L.dangerAt(a), L.T_DANGER, 'первые доли секунды — время заметить');
  for (let i = 0; i < 8; i++) L.fightStep(a, { reel: false, steer: 0 }, DT, kit, half);
  assert.equal(L.dangerAt(a), L.T_JUMP);
  for (let i = 0; i < 12; i++) L.fightStep(a, { reel: false, steer: 0 }, DT, kit, half);
  assert.equal(a.result, null);
  assert.ok(a.T < 0.45, 'отпустили — ослабла: ' + a.T.toFixed(2));
  assert.equal(a.slack, 0, 'в прыжке слабина сходом не грозит');
  for (let i = 0; i < 6; i++) L.fightStep(a, { reel: false, steer: 0 }, DT, kit, half);
  assert.equal(L.dangerAt(a), L.T_DANGER, 'рыба в воде — зона прежняя');
  // тот же прыжок, но кнопку не отпустили
  const b = start();
  let n = 0;
  while (!b.result && n < 30) {
    L.fightStep(b, { reel: true, steer: 0 }, DT, kit, half);
    n++;
  }
  assert.equal(b.result, 'snap');
  assert.ok(n * DT < 0.75, 'обрыв ещё в воздухе: ' + (n * DT).toFixed(2));
  // без свечи та же отпущенная леска в рывке почти не слабнет
  const c = start();
  c.style = 'bulldog';
  L.fightStep(c, { reel: false, steer: 0 }, DT, kit, () => 0.99);
  assert.equal(c.jumpT, 0);
  for (let i = 0; i < 20; i++) L.fightStep(c, { reel: false, steer: 0 }, DT, kit, half);
  assert.ok(c.T > 0.55, c.T.toFixed(2));
});

test('присоска: залегла — ни с места, пока не оторвёшь натяжением у верхней границы нормы', () => {
  const kit = L.kitStats(L.newProfile());
  const s = L.fightInit({ sp: 'skat', w: 12 }, kit, half);
  s.phase = 'run';
  s.next = 'calm';
  s.phaseT = 0;
  s.p = 0.4;
  s.T = 0.4;
  const ev = L.fightStep(s, { reel: true, steer: 0 }, DT, kit, half);
  assert.ok(ev.includes('stuck'), ev.join());
  const p0 = s.p;
  // мотаем на слабой леске — рыба не идёт
  for (let i = 0; i < 6; i++) L.fightStep(s, { reel: s.T < 0.5, steer: 0 }, DT, kit, half);
  assert.equal(s.p, p0);
  assert.equal(s.lift, 0);
  // держим у верхней границы нормы — отрывается
  let got = null;
  let n = 0;
  while (!got && n < 300) {
    const e = L.fightStep(s, { reel: s.T < 0.7, steer: 0 }, DT, kit, half);
    assert.ok(!e.includes('stuck'), 'пока лежит, заново не залегает');
    if (e.includes('unstuck')) got = n * DT;
    n++;
  }
  assert.ok(got != null && got < 4, String(got));
  assert.ok(s.p > p0, 'оторвали — подалась');
  assert.equal(s.stuck, 0);
  assert.ok(s.stickCd > 5, 'какое-то время больше не залегает');
  // а если ничего не делать, снимется сама, но не скоро
  const z = L.fightInit({ sp: 'skat', w: 12 }, kit, half);
  Object.assign(z, { phase: 'run', next: 'calm', phaseT: 0, p: 0.4 });
  L.fightStep(z, { reel: false, steer: 0 }, DT, kit, half);
  assert.equal(z.stuck, 1);
  z.slack = -100; // сход нас тут не интересует
  let t = 0;
  while (z.stuck && t < 20) {
    L.fightStep(z, { reel: false, steer: 0 }, DT, kit, half);
    z.slack = -100;
    t += DT;
  }
  assert.ok(t > 8 && t < 10, t.toFixed(1));
});

test('хитрец: не увёл от укрытия — леска заходит за камни; увёл — нет', () => {
  const kit = L.kitStats(L.newProfile());
  const start = () => {
    const s = L.fightInit({ sp: 'ugor', w: 2.5 }, kit, half);
    s.next = 'run';
    s.warned = true;
    s.phaseT = 0;
    s.T = 0.35;
    return s;
  };
  const a = start();
  assert.deepEqual(L.fightStep(a, { reel: false, steer: 0 }, DT, kit, half), ['run']);
  assert.ok(a.dir === 1 || a.dir === -1);
  let wraps = 0;
  let at = 0;
  let before = 0;
  for (let i = 0; i < 45 && a.phase === 'run'; i++) {
    const T0 = a.T;
    if (L.fightStep(a, { reel: false, steer: 0 }, DT, kit, half).includes('wrap')) {
      wraps++;
      at = i * DT;
      before = T0;
      assert.ok(a.T - T0 > 0.1, 'натяжение подскочило');
    }
  }
  assert.equal(wraps, 1);
  assert.ok(at > 1 && at < 1.2, at.toFixed(2));
  assert.ok(before < L.T_DANGER);
  const b = start();
  L.fightStep(b, { reel: false, steer: 0 }, DT, kit, half);
  for (let i = 0; i < 45 && b.phase === 'run'; i++) assert.ok(!L.fightStep(b, { reel: false, steer: -b.dir }, DT, kit, half).includes('wrap'));
  assert.equal(b.wrapT, 0);
  assert.ok(b.T < a.T);
});

test('тяжеловес идёт к берегу, только пока леска внатяг; трясун дёргает стрелку', () => {
  const kit = L.kitStats(L.newProfile());
  const gain = (T, style) => {
    const s = L.fightInit({ sp: 'som', w: 20 }, kit, half);
    s.style = style;
    s.T = T;
    const p0 = s.p;
    L.fightStep(s, { reel: true, steer: 0 }, DT, kit, half);
    return s.p - p0;
  };
  assert.ok(gain(0.4, 'bulldog') < gain(0.6, 'bulldog') * 0.5);
  assert.ok(Math.abs(gain(0.4, 'plain') - gain(0.6, 'plain')) < 1e-9);
  assert.ok(Math.abs(gain(0.6, 'bulldog') - gain(0.6, 'plain')) < 1e-9);
  // трясун: без кнопки стрелка у обычной рыбы идёт ровно вниз, у трясуна — с рывками вверх
  const path = (style) => {
    const s = L.fightInit({ sp: 'okun', w: 1.2 }, kit, half);
    s.style = style;
    s.rho = 1.2; // рыба в полную силу снасти: у слабой тряска вдвое меньше
    s.phaseT = 9;
    let ups = 0;
    for (let i = 0; i < 30; i++) {
      const T0 = s.T;
      L.fightStep(s, { reel: false, steer: 0 }, DT, kit, half);
      if (s.T > T0) ups++;
    }
    return ups;
  };
  assert.equal(path('plain'), 0);
  assert.ok(path('thrash') >= 5);
});

test('легенда дважды собирается с силами: забирает часть пути и рвёт; время боя при этом не сбрасывается', () => {
  const kit = TOP();
  const f = FISH_BY_ID.mech;
  const w = f.w[0] + (f.w[1] - f.w[0]) * 0.28;
  const s = L.fightInit({ sp: 'mech', w }, kit, half);
  s.p = 0.449;
  s.fat = 20;
  const t0 = s.t;
  let ev = L.fightStep(s, { reel: true, steer: 0 }, DT, kit, half);
  for (let i = 0; i < 8 && !ev.includes('rage'); i++) ev = L.fightStep(s, { reel: true, steer: 0 }, DT, kit, half);
  assert.ok(ev.includes('rage'));
  assert.equal(s.boss, 1);
  assert.ok(s.p < 0.37 && s.p > 0.33, s.p.toFixed(3));
  assert.ok(s.fat < 16 && s.fat > 14, 'усталость частью сброшена');
  assert.ok(s.t > t0, 'часы боя идут вперёд');
  assert.equal(s.warned, true);
  // рывок приходит через полсекунды, он длиннее и сильнее обычного
  let ran = false;
  for (let i = 0; i < 25 && !ran; i++) ran = L.fightStep(s, { reel: false, steer: 0 }, DT, kit, half).includes('run');
  assert.ok(ran);
  assert.ok(s.t - t0 > 0.5 && s.t - t0 < 1);
  // весь бой: у легенды два «вторых дыхания», у обычной рыбы — ни одного; сильный рыбак на лучшей снасти вытаскивает
  const r = rng();
  let ok = 0;
  let long = 0;
  for (let i = 0; i < 60; i++) {
    const b = L.botFight({ sp: 'mech', w }, kit, r, 0.85);
    if (b.result === 'landed') {
      ok++;
      assert.equal(b.seen.rage, 2);
      assert.ok(b.seen.jump >= 1);
    } else assert.ok((b.seen.rage || 0) <= 2);
    long += b.t;
  }
  assert.ok(ok >= 57, 'меч-рыба ' + ok);
  assert.ok(long / 60 > 25 && long / 60 < 50, (long / 60).toFixed(0));
  const plain = L.botFight({ sp: 'shuka', w: 4 }, MID(), r, 0.85);
  assert.equal(plain.result, 'landed');
  assert.equal(plain.seen.rage, undefined);
});

test('баланс манер: мелочь ловится у всех, редкая рыба на своей снасти — у умелого, легенды на лучшей — тоже', () => {
  const r = rng();
  const rate = (sp, k, kit, skill, n = 80) => {
    const f = FISH_BY_ID[sp];
    const w = f.w[0] + (f.w[1] - f.w[0]) * k;
    let ok = 0;
    for (let i = 0; i < n; i++) if (L.botFight({ sp, w }, kit, r, skill, 900).result === 'landed') ok++;
    return (100 * ok) / n;
  };
  const start = L.kitStats(L.newProfile());
  for (const f of FISH.filter((x) => x.rar === 0)) assert.ok(rate(f.id, 0.28, start, 0.5, 40) >= 95, f.id);
  const mid = MID();
  for (const f of FISH.filter((x) => x.rar === 1 || x.rar === 2)) assert.ok(rate(f.id, 0.28, mid, 0.5, 40) >= 95, f.id);
  for (const sp of ['som', 'tunec', 'losos', 'skat']) assert.ok(rate(sp, 0.28, mid, 0.85) >= 80, sp);
  const top = TOP();
  for (const f of FISH.filter((x) => x.rar >= 4)) {
    assert.ok(rate(f.id, 0.28, top, 0.85) >= 96, f.id);
    assert.ok(rate(f.id, 0.8, top, 0.85) >= 94, f.id + ' крупная');
  }
  // а новичку на лучшей снасти крупная меч-рыба и Старик даются не всегда
  assert.ok(rate('mech', 0.8, top, 0.5, 120) < 50);
  assert.ok(rate('starik', 0.8, top, 0.5, 120) < 60);
});

test('выслеженная рыба: наживка у крупной тени — клюёт скорее, не хлам и не мелочь; опыта за неё больше', () => {
  const kit = L.kitStats(L.newProfile());
  const spot = (big) => ({ zone: 'pier', depth: 3, pier: true, hot: false, big });
  const r = rng();
  const mean = (big) => {
    let t = 0;
    for (let i = 0; i < 4000; i++) t += L.biteDelay(spot(big), 'worm', 12, kit, r).t;
    return t / 4000;
  };
  const plain = mean(0);
  const seen = mean(0.5);
  assert.ok(seen < plain * 0.62, `поклёвка скорее: ${seen.toFixed(1)} с против ${plain.toFixed(1)} с`);
  const roll = (big, n = 3000) => {
    const out = { junk: 0, u: 0, min: 1, trophy: 0, stalked: 0 };
    for (let i = 0; i < n; i++) {
      const c = L.rollFish(spot(big), 'worm', 12, r);
      if (c.junk) { out.junk++; continue; }
      const f = FISH_BY_ID[c.sp];
      const u = (c.w - f.w[0]) / (f.w[1] - f.w[0]);
      out.u += u / n;
      out.min = Math.min(out.min, u);
      if (c.trophy) out.trophy++;
      if (c.stalked) out.stalked++;
    }
    return out;
  };
  const a = roll(0);
  const small = roll(0.05);
  const big = roll(1);
  assert.ok(a.junk > 50 && a.stalked === 0, 'обычный заброс у причала: бывает и хлам — ' + a.junk);
  assert.equal(small.junk + big.junk, 0, 'выслеженная рыба — не хлам');
  assert.equal(small.stalked, 3000);
  assert.ok(small.min > 0.34 && big.min > 0.74, `нижняя граница веса растёт с тенью: ${small.min.toFixed(2)} и ${big.min.toFixed(2)}`);
  assert.ok(a.u < 0.3 && small.u > 0.4 && big.u > 0.78, `в среднем: ${a.u.toFixed(2)} → ${small.u.toFixed(2)} → ${big.u.toFixed(2)}`);
  assert.ok(big.trophy > 1200 && big.trophy < 2700 && small.trophy < 400, `трофеи: у крупной тени — половина, у мелкой — редко (${big.trophy}, ${small.trophy})`);
  // опыт и счёт в журнале
  const c = { sp: 'okun', w: 0.6, len: 30, trophy: false, junk: false };
  assert.ok(L.xpFor({ ...c, stalked: true }) > L.xpFor(c) * 1.15);
  const p = L.newProfile();
  L.recordCatch(p, { ...c, stalked: true }, false);
  L.recordCatch(p, c, false);
  assert.equal(p.stats.stalked, 1);
  assert.equal(L.fixProfile({ ...L.newProfile(), stats: { casts: 3 } }).stats.stalked, 0, 'старым сохранениям счётчик добавляется');
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
import { newTuner, tuneStep, longShare, JIT_BAD, JIT_OK, needDrop, scaleFor, pickQuality, TARGET_MS, BUDGET_MS, Perf, isSoftware } from '../client/perf.js';

test('подбор при загрузке: дорогой кадр — ступень ниже, небольшое превышение — разрешение меньше', () => {
  assert.ok(needDrop(40, 'high') && needDrop(40, 'medium') && !needDrop(40, 'low'), 'ниже «низкого» ступени нет');
  // с «высокого» уходим раньше, чем со «среднего»: разрешение ему помогает слабо (замер на Apple M4: 15,4 мс — остаёмся)
  assert.ok(!needDrop(15.4, 'high') && needDrop(19, 'high') && !needDrop(22, 'medium') && needDrop(27, 'medium'));
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
  assert.ok(run(16.7, 18).some((r) => r.scale > 0.7), 'подняли');
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

test('подбор ступени замерами: вниз, пока кадр не укладывается; вверх, если запас; неудачный замер не закрепляется', async () => {
  // «машина» — цена тяжёлого кадра: [высокое с отражениями в полкадра, в четверть, без отражений, среднее, низкое]
  const run = async (m, start, top = 'high', refl = 2) => {
    const seen = [];
    const res = await pickQuality({ start, top, refl, cost: async (tier, r) => { seen.push(tier + (tier === 'high' ? r : '')); return tier === 'high' ? m[2 - r] : tier === 'medium' ? m[3] : m[4]; } });
    return { ...res, seen: seen.join(' ') };
  };
  const fresh = { tier: 'high' };
  let r = await run([8, 7, 6, 4, 3], fresh);
  assert.ok(r.tier === 'high' && r.refl === 2 && r.seen === 'high2', 'сильная машина: один замер');
  // Apple M4: с отражениями тяжёлый кадр не успевает к обновлению экрана — ход шёл рывками; без них — ровно
  r = await run([18, 15.5, 12.5, 8, 4.6], fresh);
  assert.ok(r.tier === 'high' && r.refl === 0 && r.ms === 12.5 && r.seen === 'high2 high1 high0', `отражения не укладываются — «высокое» без них: ${r.seen}`);
  r = await run([17, 14, 12, 8, 5], fresh);
  assert.ok(r.tier === 'high' && r.refl === 1 && r.seen === 'high2 high1', 'отражения в четверть кадра укладываются — оставляем их');
  r = await run([60, 55, 50, 28, 13], fresh);
  assert.ok(r.tier === 'low' && r.seen === 'high2 high1 high0 medium low', `слабая: до «низкого»: ${r.seen}`);
  r = await run([60, 55, 50, 22, 13], fresh);
  assert.equal(r.tier, 'medium', '22 мс на «среднем» ещё годится: дальше поможет разрешение');
  r = await run([30, 26, 19, 9, 5], fresh);
  assert.equal(r.tier, 'medium', '19 мс на «высоком» без отражений — уже не ровно: уходим на «среднее»');
  // в прошлый раз вышло «среднее», а сегодня запас большой — поднимаемся
  r = await run([14, 12, 10, 5, 3], { tier: 'medium' });
  assert.ok(r.tier === 'high' && r.refl === 2 && r.seen === 'medium high2', `перепроверка вверх: ${r.seen}`);
  // запас небольшой — ступень выше даже не пробуем (шейдеры лишний раз не собираем)
  r = await run([20, 17, 14, 9, 6], { tier: 'medium' });
  assert.ok(r.tier === 'medium' && r.seen === 'medium');
  // попробовали выше — не потянула — остаёмся
  r = await run([30, 27, 25, 6, 4], { tier: 'medium' });
  assert.ok(r.tier === 'medium' && r.ms === 6 && r.seen === 'medium high2 high1 high0', `не потянула: ${r.seen}`);
  // с «низкого» через «среднее» до «высокого» — если машина позволяет
  r = await run([13, 11, 9, 6, 4], { tier: 'low' });
  assert.ok(r.tier === 'high' && r.refl === 2 && r.seen === 'low medium high2', `с низкого наверх: ${r.seen}`);
  r = await run([40, 35, 30, 12, 5], { tier: 'low' });
  assert.ok(r.tier === 'medium' && r.seen === 'low medium', 'до «среднего» и стоп: запаса на «высокое» нет');
  // телефон: выше «среднего» не поднимаемся; без видеокарты — только «низкое»
  r = await run([10, 9, 8, 4, 3], { tier: 'medium' }, 'medium');
  assert.ok(r.tier === 'medium' && r.seen === 'medium');
  r = await run([10, 9, 8, 4, 3], { tier: 'high' }, 'low');
  assert.ok(r.tier === 'low' && r.seen === 'low');
  // отражения когда-то отключили, а теперь запас есть — возвращаем по уровню, пока укладывается
  r = await run([14, 10.5, 9, 5, 3], { tier: 'high', refl: 0 });
  assert.ok(r.tier === 'high' && r.refl === 2 && r.seen === 'high0 high1 high2', `вернули отражения: ${r.seen}`);
  r = await run([19, 13, 9, 5, 3], { tier: 'high', refl: 0 });
  assert.ok(r.refl === 1 && r.ms === 13 && r.seen === 'high0 high1', `вернули в четверть кадра, на полкадра запаса нет: ${r.seen}`);
  r = await run([23, 18, 14, 5, 3], { tier: 'high', refl: 0 });
  assert.ok(r.tier === 'high' && r.refl === 0 && r.seen === 'high0', 'запаса нет — не трогаем');
  // отражения запрещены (?refl=0) — их и не пробуем
  r = await run([8, 7, 6, 4, 3], fresh, 'high', 0);
  assert.ok(r.tier === 'high' && r.refl === 0 && r.seen === 'high0');
});

test('подбор на ходу: первым делом — отражения; во время вываживания вверх не идём', () => {
  const st = newTuner();
  const q = { scale: 1, floor: 0.62, canDrop: true, drs: true, refl: 2, busy: false };
  const outs = [];
  for (let i = 0; i < 12; i++) { const r = tuneStep(st, 30, q); if (r) { outs.push(r); if (r.refl != null) q.refl = r.refl; if (r.scale) q.scale = r.scale; } }
  assert.deepEqual(outs.slice(0, 2), [{ refl: 1 }, { refl: 0 }], 'отражения в четверть кадра, потом без них');
  assert.ok(outs[2] && outs[2].scale < 1, 'и только потом разрешение');
  // рыба на крючке: кадры ровные, но разрешение вверх не трогаем — смена сама даёт рывок
  Object.assign(st, newTuner());
  Object.assign(q, { scale: 0.7, refl: 0, busy: true });
  for (let i = 0; i < 80; i++) assert.equal(tuneStep(st, 16.7, q), null);
  q.busy = false;
  let up = null;
  for (let i = 0; i < 40 && !up; i++) up = tuneStep(st, 16.7, q);
  assert.ok(up && up.scale > 0.7, 'вытащили рыбу — можно');
  // а вниз — можно и во время вываживания: рывки хуже
  Object.assign(st, newTuner());
  Object.assign(q, { scale: 1, refl: 0, busy: true });
  let down = null;
  for (let i = 0; i < 6 && !down; i++) down = tuneStep(st, 30, q);
  assert.ok(down && down.scale < 1);
});

test('неровный ход: доля долгих кадров видна там, где средняя длительность молчит', () => {
  const win = (n, long, base = 16.7, k = 2) => Array.from({ length: n }, (_, i) => (i < long ? base * k : base) + (i % 3) * 0.2);
  assert.equal(longShare(win(30, 0)), 0, 'ровные 60 кадров в секунду');
  assert.ok(Math.abs(longShare(win(30, 6)) - 0.2) < 1e-9, 'каждый пятый кадр вдвое дольше');
  assert.equal(longShare(win(30, 1)), 1 / 30);
  assert.equal(longShare(win(15, 0, 33.3)), 0, 'ровные 30 кадров в секунду — не рывки (медленно, но ровно)');
  assert.equal(longShare(win(72, 0, 6.9)), 0, 'экран 144 Гц');
  assert.ok(longShare(win(36, 8, 13.9, 1.5)) > 0.2, 'экран 144 Гц: кадры то в два, то в три обновления');
  assert.equal(longShare([16, 17, 33]), 0, 'по трём кадрам не судим');
  // каждый пятый кадр вдвое дольше: в среднем 20 мс — «терпимо» по средней, но на глаз игра дёргается
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const jerky = win(30, 6);
  assert.ok(avg(jerky) < TARGET_MS * 1.2 && longShare(jerky) > JIT_BAD);
  const st = newTuner();
  const q = { scale: 1, floor: 0.62, canDrop: true, drs: true, refl: 2, busy: true, jit: longShare(jerky) };
  const outs = [];
  for (let i = 0; i < 14; i++) { const r = tuneStep(st, avg(jerky), q); if (r) { outs.push(r); if (r.refl != null) q.refl = r.refl; if (r.scale) q.scale = r.scale; } }
  assert.deepEqual(outs.slice(0, 2), [{ refl: 1 }, { refl: 0 }], 'рывки — первым делом дешевеют отражения, даже во время вываживания');
  assert.ok(outs[2] && Math.abs(outs[2].scale - 0.9) < 1e-9, 'потом разрешение — на шаг, а не обвалом: средняя-то в порядке');
  // редкий долгий кадр — случайность: ничего не трогаем, но и «ровным» такой ход не считаем
  Object.assign(st, newTuner());
  Object.assign(q, { scale: 0.7, refl: 0, busy: false, jit: 2 / 30 });
  assert.ok(q.jit < JIT_BAD && q.jit > JIT_OK);
  for (let i = 0; i < 120; i++) assert.equal(tuneStep(st, 17, q), null, 'ни вниз, ни вверх');
  q.jit = 1 / 30;
  let up = null;
  for (let i = 0; i < 40 && !up; i++) up = tuneStep(st, 17, q);
  assert.ok(up && up.scale > 0.7, 'один долгий кадр из тридцати — ход ровный, разрешение возвращается');
});
