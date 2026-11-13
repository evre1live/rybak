// Мир за пределами бухты: причалы для лодки, проходы, зоны ловли в море.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../client/terrain.js';
import { ZONES, FISH } from '../shared/data.js';
import { newProfile, fixProfile } from '../shared/logic.js';

// как hullFits в client/boat.js (моторка 4,6 × 2,1 м): нос, середина, корма и оба борта на воде
const fits = (x, z, yaw) => {
  const sn = Math.sin(yaw);
  const cs = Math.cos(yaw);
  return T.canSail(x, z) && T.canSail(x - sn * 2.1, z - cs * 2.1) && T.canSail(x + sn * 2.1, z + cs * 2.1) && T.canSail(x - cs * 0.9, z + sn * 0.9) && T.canSail(x + cs * 0.9, z - sn * 0.9);
};

test('площадка проката: на ней можно стоять, и она не мешает лодке у пирса', () => {
  const d = T.DECKS.find((k) => k.id === 'rental');
  assert.ok(d, 'площадка есть');
  assert.ok(T.canStand(2.2, -6.4) && T.deckAt(2.2, -6.4), 'перед прилавком будки можно стоять');
  assert.ok(T.canStand(1.6, -6.4), 'с пирса на площадку — без щели');
  const m = T.MOORINGS[0];
  assert.ok(m.z + 2.3 < d.z0, 'лодка стоит севернее площадки');
});

test('преграда, выросшая вокруг игрока, не запирает: её можно не считать, пока выходишь', () => {
  const c = { x: 2.6, z: 9, r: 0.8 };
  assert.ok(T.canStand(2.6, 9) && !T.blocksAt(2.6, 9), 'место свободно');
  T.CIRCLES.push(c);
  try {
    assert.equal(T.canStand(2.6, 9), false, 'теперь тут преграда');
    const inside = T.blocksAt(2.7, 9);
    assert.deepEqual(inside, [c]);
    assert.ok(T.canStand(3.0, 9, inside), 'шаг наружу разрешён');
    assert.equal(T.blocksAt(3.5, 9), null, 'снаружи преграды нет');
  } finally {
    T.CIRCLES.pop();
  }
  // то же с прямоугольником: так встаёт будка проката на своей площадке
  const b = { x0: 2.5, x1: 5.8, z0: -8.8, z1: -4.0 };
  T.BOXES.push(b);
  try {
    assert.equal(T.canStand(4, -6.4), false, 'в будке стоять нельзя');
    const inside = T.blocksAt(4, -6.4);
    assert.deepEqual(inside, [b]);
    assert.ok(T.canStand(3, -6.4, inside), 'внутри будки идти к выходу можно');
    assert.ok(T.canStand(2.2, -6.4, inside) && T.canStand(2.2, -6.4), 'перед прилавком — свободно');
    assert.equal(T.canStand(5.7, -6.4, inside), false, 'за край площадки из будки не шагнуть');
  } finally {
    T.BOXES.pop();
  }
});

test('причалы: лодка помещается, под килем глубоко, рыбак выходит на настил', () => {
  assert.equal(T.MOORINGS.filter((m) => m.rent).length, 1, 'лодку берут и сдают в одном месте');
  for (const m of T.MOORINGS) {
    assert.ok(fits(m.x, m.z, m.yaw), `${m.id}: лодка помещается`);
    assert.ok(T.groundH(m.x, m.z) < -1.5, `${m.id}: глубина`);
    assert.ok(T.canStand(m.sx, m.sz) && T.deckAt(m.sx, m.sz), `${m.id}: выход на настил`);
    const d = Math.hypot(m.x - m.sx, m.z - m.sz);
    assert.ok(d > 1.5 && d < 3.6, `${m.id}: от настила до лодки ${d.toFixed(1)} м — можно дотянуться`);
  }
});

test('от домашнего пирса лодка сразу выходит на чистую воду', () => {
  const m = T.MOORINGS[0];
  let x = m.x;
  let z = m.z;
  let d = 0;
  while (d < 200 && fits(x - Math.sin(m.yaw) * 0.25, z - Math.cos(m.yaw) * 0.25, m.yaw)) {
    x -= Math.sin(m.yaw) * 0.25;
    z -= Math.cos(m.yaw) * 0.25;
    d += 0.25;
  }
  assert.ok(d > 40, `прямо по курсу свободно ${d.toFixed(0)} м`);
});

test('в лодку не въехать на берег, причал, риф и буёк; за край мира не уйти', () => {
  assert.equal(T.canSail(0, -10), false, 'пирс');
  assert.equal(T.canSail(0, 20), false, 'берег');
  assert.equal(T.canSail(T.REEF.x, T.REEF.z), false, 'риф');
  assert.equal(T.canSail(-12, -43), false, 'буёк');
  assert.equal(T.canSail(T.ISLAND.x, T.ISLAND.z), false, 'остров с маяком');
  assert.equal(T.canSail(T.PALM.x, T.PALM.z), false, 'Пальмовый остров');
  assert.equal(T.canSail(T.WRECK.x, T.WRECK.z), false, 'корабль');
  assert.equal(T.canSail(T.WORLD.x1 + 1, 0), false);
  assert.equal(T.canSail(0, T.WORLD.z0 - 1), false);
  // вокруг большого острова есть вода со всех сторон
  for (const [x, z] of [[195, 0], [0, 172], [-195, 0], [0, -250], [300, -300], [-300, -400]]) assert.ok(T.canSail(x, z), `вода в точке ${x}, ${z}`);
});

test('зоны ловли в море: открытое море, лагуна, корабль — и в каждой есть кого ловить', () => {
  assert.equal(T.spotAt(60, -300).zone, 'sea');
  assert.equal(T.spotAt(-40, -200).zone, 'sea');
  assert.equal(T.spotAt(T.PALM.x - T.PALM.rx - 12, T.PALM.z).zone, 'lagoon');
  assert.equal(T.spotAt(T.WRECK.x + 14, T.WRECK.z).zone, 'wreck');
  // в бухте всё по-прежнему
  assert.equal(T.spotAt(2.6, -2).zone, 'pier');
  assert.equal(T.spotAt(0, -30).zone, 'deep');
  assert.equal(T.spotAt(T.ARCH.x, T.ARCH.z + 6).zone, 'arch');
  for (const z of ['sea', 'lagoon', 'wreck']) {
    assert.ok(ZONES[z], `зона ${z} описана`);
    const list = FISH.filter((f) => f.zones[z] > 0);
    assert.ok(list.length >= 4, `${z}: видов ${list.length}`);
    // лагуна — место щедрое, но спокойное; за трофеями идут в море и к кораблю
    assert.ok(list.some((f) => f.rar >= (z === 'lagoon' ? 2 : 3)), `${z}: есть ценная рыба`);
  }
  // на косяки в новых местах можно забросить
  for (const [x, z] of T.SCHOOL_HOMES) assert.ok(T.spotAt(x, z), `косяк ${x}, ${z} стоит в воде`);
});

test('на Пальмовом острове можно ходить, а глубже колена не зайти', () => {
  assert.ok(T.canStand(T.PALM.x, T.PALM.z));
  assert.ok(T.groundH(T.PALM.x, T.PALM.z) > 1.5, 'песчаный купол над водой');
  assert.ok(T.canStand(240, -190), 'мостки доходят до пляжа');
  assert.equal(T.canStand(222, -175), false, 'в лагуну по шею не зайти');
});

test('арка: между опорами лодка проходит, в опоры упирается; опоры стоят на дне', () => {
  const A = T.ARCH;
  // ось опор и ось прохода (поперёк неё)
  const ax = Math.cos(A.ry);
  const az = -Math.sin(A.ry);
  const yaw = Math.atan2(-az, ax); // нос — вдоль прохода: (sin yaw, cos yaw) = (−az, ax)
  for (let d = -16; d <= 16; d += 1) {
    const x = A.x - az * d;
    const z = A.z + ax * d;
    assert.ok(fits(x, z, yaw), `под аркой по оси прохода лодка идёт (${d} м от середины)`);
    // и со смещением на метр в сторону — тоже: проход не «в нитку»
    assert.ok(fits(x + ax, z + az, yaw) && fits(x - ax, z - az, yaw), `проход шире лодки (${d} м от середины)`);
  }
  assert.equal(T.ARCH_LEGS.length, 2);
  for (const [lx, lz] of T.ARCH_LEGS) {
    assert.equal(T.canSail(lx, lz), false, 'в опору не въехать');
    assert.ok(T.groundH(lx, lz) < -5, 'опора стоит на глубине — у неё есть подводная подошва');
    assert.ok(Math.abs(Math.hypot(lx - A.x, lz - A.z) - A.leg) < 1e-6);
  }
  // проход не уже лодки с запасом: между преградами опор остаётся больше трёх метров
  assert.ok(2 * (A.leg - A.block) > 3, `проход ${(2 * (A.leg - A.block)).toFixed(1)} м`);
  assert.equal(T.spotAt(A.x, A.z).zone, 'arch');
});

test('домик смотрителя: под ним ровная площадка, а холм под маяком и обрыв острова не тронуты', () => {
  const C = T.COTTAGE;
  const c = Math.cos(C.ry);
  const s = Math.sin(C.ry);
  // углы дома (вдоль — половина длины, поперёк — до стен) лежат на уровне пола
  for (const [u, v] of [[0, 0], [0.46 * C.s, 0.33 * C.s], [-0.46 * C.s, 0.33 * C.s], [0.46 * C.s, -0.3 * C.s], [-0.46 * C.s, -0.3 * C.s]]) {
    const h = T.groundH(C.x + u * c + v * s, C.z - u * s + v * c);
    assert.ok(Math.abs(h - C.y) < 0.02, `под домом ровно: ${h.toFixed(2)} при поле ${C.y}`);
  }
  assert.ok(Math.hypot(...T.cottageUV(C.x, C.z)) < 1e-9, 'середина дома — начало его осей');
  // маяк стоит на макушке холма, как и стоял: площадка до его основания не достаёт
  const L = T.LIGHTHOUSE;
  assert.ok(Math.abs(T.groundH(L.x, L.z) - 19.88) < 0.02, 'земля под маяком на месте');
  for (let a = 0; a < 6.28; a += 0.4) {
    const [u, v] = T.cottageUV(L.x + Math.cos(a) * 2.8, L.z + Math.sin(a) * 2.8);
    const d = Math.hypot(Math.max(Math.abs(u) - C.pad[0], 0), Math.max(Math.abs(v) - C.pad[1], 0));
    assert.ok(d >= C.pad[2], 'основание башни вне откоса площадки');
  }
  // и до обрыва далеко: кромка острова не изменилась
  assert.ok(Math.hypot(C.x - T.ISLAND.x, C.z - T.ISLAND.z) + C.s < T.islandR(0) - 12, 'домик в глубине острова');
});

test('камни в воде: рыбе и лодке туда нельзя, а у пирса и над косяками вода чистая', () => {
  // риф, опоры арки и корабль — камни; лодка туда не идёт
  for (const [x, z] of [[T.REEF.x, T.REEF.z], [T.ARCH_LEGS[0][0], T.ARCH_LEGS[0][1]], [T.WRECK.x, T.WRECK.z]]) {
    assert.ok(T.inRocks(x, z), `камни в ${x}, ${z}`);
    assert.ok(!T.canSail(x, z));
  }
  // у головы пирса и посреди бухты камней нет
  for (const [x, z] of [[0, -32], [-8, -14], [10, -45]]) assert.ok(!T.inRocks(x, z) && T.canSail(x, z), `чистая вода в ${x}, ${z}`);
  // правило лодки не изменилось: там, где глубоко, нет настила и нет камней, — плыть можно
  let n = 0;
  for (let x = -160; x <= 160; x += 7)
    for (let z = -180; z <= 20; z += 7) {
      const deck = T.DECKS.some((d) => x > d.x0 - 0.7 && x < d.x1 + 0.7 && z > d.z0 - 0.7 && z < d.z1 + 0.7);
      if (T.groundH(x, z) > -0.6 || deck) continue;
      assert.equal(T.canSail(x, z), !T.inRocks(x, z), `в ${x}, ${z}`);
      n++;
    }
  assert.ok(n > 400);
});

test('профиль: счётчик выходов на лодке появляется у старых сохранений и не ломается от мусора', () => {
  assert.equal(newProfile().boatTrips, 0);
  const old = newProfile();
  delete old.boatTrips;
  assert.equal(fixProfile(old).boatTrips, 0);
  assert.equal(fixProfile({ ...newProfile(), boatTrips: 'много' }).boatTrips, 0);
  assert.equal(fixProfile({ ...newProfile(), boatTrips: 3 }).boatTrips, 3);
});

// ───── открытое море: скалы, вехи, зыбь, дальние острова, дельфины ─────
const W = await import('../client/water.js');
const FI = await import('../client/farisles.js');
const D = await import('../client/dolphins.js');

test('морские косяки и вехи стоят на глубокой воде, и лодка к ним проходит', () => {
  for (const [x, z] of T.SEA_HOMES) {
    assert.equal(T.spotAt(x, z).zone, 'sea', `косяк (${x}, ${z}) — в открытом море`);
    assert.ok(fits(x, z, 0) && fits(x, z, 1.2), `к косяку (${x}, ${z}) можно подойти на лодке`);
  }
  // два морских косяка не встают в одну точку: мест хватает
  assert.ok(T.SEA_HOMES.length >= 4);
  for (const [x, z] of T.MARKS) {
    assert.ok(-T.groundH(x, z) > 2.5, `веха (${x}, ${z}) — на воде, а не на мели`); // одна стоит у входа в лагуну Пальмового острова
    assert.ok(Math.hypot(x - T.SEA.x, z - T.SEA.z) > T.SEA.r, 'вехи стоят в открытом море, а не в бухте');
    assert.ok(!T.canSail(x, z), 'в веху лодка упирается');
    assert.ok(T.canSail(x + 6, z) && T.canSail(x - 6, z) && T.canSail(x, z + 6) && T.canSail(x, z - 6), 'а рядом с ней — чистая вода');
  }
});

test('скалы в море: камни над водой, под ними отмель с рифовой рыбой, вокруг — море и проход', () => {
  for (const s of T.SKERRIES) {
    const [ox, oz, w, tall] = s.rocks[0];
    assert.ok(tall >= 1, 'главная скала не ниже своего поперечника');
    assert.ok(!T.canSail(s.x + ox, s.z + oz), `${s.id}: в скалу лодка упирается`);
    assert.ok(T.groundH(s.x + ox, s.z + oz) > -1.5, `${s.id}: под скалой дно у самой поверхности`);
    assert.ok(w > 3, 'главная скала — не камешек');
    // отмель: у камней мелко, рыба рифовая
    let wet = 0;
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const near = T.spotAt(s.x + Math.cos(a) * s.r * 0.6, s.z + Math.sin(a) * s.r * 0.6);
      if (!near) continue; // здесь стоит камень
      wet++;
      assert.equal(near.zone, 'reef', `${s.id}: у камней рифовая зона`);
      assert.ok(near.depth < 8, `${s.id}: у камней отмель, а не глубина (${near.depth.toFixed(1)} м)`);
    }
    assert.ok(wet >= 8, `${s.id}: отмель — это вода с камнями, а не остров (${wet} из 12)`);
    // в сорока метрах за краем отмели — снова открытое море, и туда можно дойти со всех сторон
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const x = s.x + Math.cos(a) * (s.r + 40), z = s.z + Math.sin(a) * (s.r + 40);
      if (x < T.WORLD.x0 + 6 || x > T.WORLD.x1 - 6 || z < T.WORLD.z0 + 6 || z > T.WORLD.z1 - 6) continue; // Западные камни — у самого края карты
      assert.equal(T.spotAt(x, z).zone, 'sea', `${s.id}: вокруг отмели открытое море`);
      assert.ok(T.canSail(x, z), `${s.id}: вокруг отмели лодка ходит`);
    }
    // скалы — в открытом море, не в бухте и не у других островов
    assert.ok(Math.hypot(s.x - T.SEA.x, s.z - T.SEA.z) > T.SEA.r + 60, `${s.id}: далеко от бухты`);
  }
});

test('зыбь: в бухте её нет вовсе, в открытом море она есть и растёт с ветром', () => {
  for (const [x, z] of [[T.SPAWN.x, T.SPAWN.z], [0, -40], [T.REEF.x, T.REEF.z], [T.MOORINGS[0].x, T.MOORINGS[0].z]]) {
    assert.equal(W.seaK(x, z), 0, `в бухте (${x}, ${z}) зыби нет`);
    assert.equal(W.swellMax(x, z), 0);
  }
  assert.equal(W.seaK(300, -300), 1, 'в море зыбь в полную силу');
  W.sea.k = 0.6;
  const calm = W.swellMax(300, -300);
  // высота волны в бухте от силы зыби не зависит
  const bay = W.waveH(0, -40, 7.3);
  W.sea.k = 1.4;
  assert.ok(W.swellMax(300, -300) > calm * 2, 'в ветер зыбь выше');
  assert.equal(W.waveH(0, -40, 7.3), bay, 'бухту ветер в море не качает');
  assert.ok(W.swellMax(300, -300) < 0.9, 'но лодку волна не накрывает');
  W.sea.k = 0.75;
});

test('дальние острова: настоящая суша далеко за краем моря, до неё не доплыть', () => {
  assert.ok(FI.FAR_ISLES.length >= 5);
  // всюду, куда доходит лодка, и ещё на полтораста метров дальше — дальних островов нет
  let nearest = Infinity;
  for (let x = T.WORLD.x0 - 400; x <= T.WORLD.x1 + 400; x += 8) {
    for (let z = T.WORLD.z0 - 400; z <= T.WORLD.z1; z += 8) {
      if (FI.farH(x, z) < 0) continue;
      const dx = Math.max(T.WORLD.x0 - x, 0, x - T.WORLD.x1), dz = Math.max(T.WORLD.z0 - z, 0, z - T.WORLD.z1);
      nearest = Math.min(nearest, Math.hypot(dx, dz));
    }
  }
  assert.ok(nearest > 150, `от края моря до ближайшего дальнего берега ${nearest.toFixed(0)} м`);
  assert.ok(nearest < 400, 'но острова не за горизонтом: их видно с лодки');
  for (const I of FI.FAR_ISLES) {
    assert.ok(FI.farH(I.x, I.z) > 3, `${I.id}: в середине острова суша`);
    const trees = FI.farTrees(I);
    assert.ok(trees.length >= 3, `${I.id}: на острове лес`);
    for (const t of trees) assert.ok(FI.farH(t.x, t.z) > 0.3, `${I.id}: дерево стоит на суше`);
  }
  const all = FI.FAR_ISLES.reduce((n, I) => n + FI.farTrees(I).length, 0);
  assert.ok(all < 1600, `лес на дальних островах не дороже полутора тысяч деревьев (${all})`);
});

test('дельфины: дорога стай замкнута, идёт по глубокой воде мимо скал, вех и островов', () => {
  assert.ok(D.WAY_LEN > 1200 && D.WAY_LEN < 2600, `длина петли ${D.WAY_LEN.toFixed(0)} м`);
  const a = D.wayAt(0), b = D.wayAt(D.WAY_LEN - 0.5);
  assert.ok(Math.hypot(a.x - b.x, a.z - b.z) < 1, 'петля замкнута');
  for (let s = 0; s < D.WAY_LEN; s += 2) {
    const w = D.wayAt(s);
    assert.ok(Math.abs(Math.hypot(w.dx, w.dz) - 1) < 1e-6, 'направление — единичный вектор');
    for (const side of [-4, 0, 4]) {
      const x = w.x - w.dz * side, z = w.z + w.dx * side;
      assert.ok(-T.groundH(x, z) > 6, `на дороге мелко у (${x.toFixed(0)}, ${z.toFixed(0)})`);
      assert.ok(T.canSail(x, z), `дорога упирается в преграду у (${x.toFixed(0)}, ${z.toFixed(0)})`);
      assert.ok(Math.hypot(x - T.SEA.x, z - T.SEA.z) > T.SEA.r + 15, 'в бухту дельфины не заходят');
      for (const [mx, mz] of T.MARKS) assert.ok(Math.hypot(x - mx, z - mz) > 14, 'веху обходят');
    }
  }
  // стаи идут с одной скоростью и не сходятся; место стаи зависит только от общих часов
  assert.equal(D.DOLPHINS, D.PODS.reduce((n, p) => n + p.n, 0));
  for (let T0 = 0; T0 < D.WAY_LEN / D.DOLPHIN_SPEED; T0 += 2) {
    const [p, q] = D.PODS.map((pod) => D.wayAt(D.podS(pod, T0)));
    assert.ok(Math.hypot(p.x - q.x, p.z - q.z) > 50, 'стаи не сходятся: одна идёт внешней дорогой, другая — внутренней');
  }
  for (const T0 of [0, 1234.5, 98765]) {
    const s0 = D.podS(D.PODS[0], T0), s1 = D.podS(D.PODS[0], T0 + 1);
    assert.ok(Math.abs(((s1 - s0 + D.WAY_LEN) % D.WAY_LEN) - D.DOLPHIN_SPEED) < 1e-6, 'за секунду стая проходит свою скорость');
  }
});
