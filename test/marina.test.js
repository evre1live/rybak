// «Пальмовая марина»: рельеф, набережные, причалы и зоны (client/loc/marina.js) — без браузера.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../client/loc/marina.js';
import { fishOf, zonesOf, clockHours, DAY_REAL_SEC } from '../shared/data.js';
import { BEASTS } from '../shared/beasts.js';
import { locOf } from '../shared/locations.js';

test('Пальмовая марина: база как везде, гавань глубокая, город — на ровной набережной', () => {
  assert.ok(R.canStand(R.SPAWN.x, R.SPAWN.z), 'точка появления');
  assert.ok(R.canStand(0, -20), 'пирс');
  assert.ok(!R.canStand(0, -40), 'в воду глубже колена не зайти');
  const d = -R.groundH(0, -27);
  assert.ok(d > 2.5 && d < 6, `у головы пирса ${d.toFixed(1)} м`);
  // у набережных стенка отвесная: в паре метров от неё уже глубоко; сама набережная — на высоте города
  assert.ok(-R.groundH(0, R.HARBOR.z0 + 2.5) > 5, `у северной набережной ${(-R.groundH(0, R.HARBOR.z0 + 2.5)).toFixed(1)} м`);
  assert.ok(Math.abs(R.groundH(0, R.HARBOR.z0 - 6) - R.QUAY_Y) < 0.2, 'набережная ровная');
  assert.ok(Math.abs(R.groundH(R.HARBOR.x0 - 6, -80) - R.QUAY_Y) < 0.3, 'западная набережная');
  // под мостом — яма, на пляже — по колено, гребень мола над водой
  assert.ok(-R.groundH(R.BRIDGE.x, R.BRIDGE.z) > 9, `под мостом ${(-R.groundH(R.BRIDGE.x, R.BRIDGE.z)).toFixed(1)} м`);
  const b = -R.groundH(R.BACKWATER.x, R.BACKWATER.z - 4);
  assert.ok(b > 0.2 && b < 1.4, `у пляжа ${b.toFixed(2)} м`);
  assert.ok(R.groundH(R.MOLE.x, (R.MOLE.z0 + R.MOLE.z1) / 2) > 2, 'мол над водой');
});

test('Пальмовая марина: рыбацкий пирс у моста — на нём стоят, катер встаёт рядом', () => {
  const m = R.MOORINGS.find((x) => x.id === 'fpier');
  assert.ok(R.canStand(m.sx, m.sz) && R.deckAt(m.sx, m.sz), 'рыбак выходит на площадку пирса');
  assert.ok(R.canStand(R.FPIER.x, R.FPIER.z1 - 8), 'по мосткам пирса можно пройти');
  assert.ok(R.canSail(m.x, m.z), 'катер встаёт у площадки');
  const toBridge = Math.hypot(m.sx - R.BRIDGE.x, m.sz - R.BRIDGE.z);
  assert.ok(toBridge < 40, `от пирса до моста ${toBridge.toFixed(0)} м`);
});

test('Пальмовая марина: катер проходит по гавани, мимо понтонов, под мост в канал и за мол в море', () => {
  for (const m of R.MOORINGS) assert.ok(R.canSail(m.x, m.z), `${m.id}: лодка встаёт у причала`);
  const line = (ax, az, bx, bz) => {
    for (let i = 0; i <= 200; i++) {
      const x = ax + ((bx - ax) * i) / 200;
      const z = az + ((bz - az) * i) / 200;
      const buoy = R.BUOYS.some(([px, pz]) => Math.hypot(x - px, z - pz) < 2);
      if (Math.hypot(x - 4, z + 12) > 14 && !buoy && !R.canSail(x, z)) return [x, z];
    }
    return null;
  };
  const path = (pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const bad = line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      if (bad) return bad;
    }
    return null;
  };
  assert.equal(path([[10, -30], [-70, -80], [R.FPIER.x + 1.5, R.FPIER.z1 + R.FPIER.hd + 3.4]]), null, 'к рыбацкому пирсу');
  assert.equal(path([[10, -30], [-70, -80], [-100, -85], [-108, -101], [R.BRIDGE.x, R.BRIDGE.z], [-200, -112], [-260, -135]]), null, 'мимо рыбацкого пирса под мост и по каналу');
  assert.equal(path([[10, -30], [100, -85], [140, -100], [220, -100]]), null, 'через выход из гавани в море');
  // между понтонами — проход к набережной
  for (let i = 0; i < R.PONTOONS.length - 1; i++) {
    const x = (R.PONTOONS[i].x + R.PONTOONS[i + 1].x) / 2;
    assert.equal(line(x, -70, x, R.HARBOR.z0 + 12), null, `проход между понтонами у x=${x}`);
  }
  for (const p of R.PONTOONS) assert.ok(!R.canSail(p.x, (p.z0 + p.z1) / 2), 'сквозь понтон не проплыть');
  for (const y of R.YACHTS) assert.ok(!R.canSail(y.x, y.z), `сквозь яхту не проплыть: ${y.x},${y.z}`);
  assert.ok(!R.canSail(R.MOLE.x, -40), 'сквозь мол не проплыть');
  for (const [x, z] of R.BUOYS) assert.ok(R.groundH(x, z) < -1.5, `буй ${x},${z} на воде`);
});

test('Пальмовая марина: все зоны ловли на месте, в каждой своя рыба; ночь длиннее, комната начинается вечером', () => {
  const seen = {};
  for (let x = -300; x <= 340; x += 3) {
    for (let z = -300; z <= 40; z += 3) {
      const s = R.spotAt(x, z);
      if (s) seen[s.zone] = Math.max(seen[s.zone] || 0, s.depth);
    }
  }
  const fish = fishOf('marina');
  assert.ok(fish.length >= 14, `видов ${fish.length}`);
  const used = new Set(fish.flatMap((f) => Object.keys(zonesOf(f, 'marina'))));
  for (const z of used) assert.ok(seen[z], `зона ${z} есть на карте: ${JSON.stringify(seen)}`);
  for (const z of Object.keys(seen)) assert.ok(used.has(z), `в зоне ${z} кто-то водится`);
  for (const f of fish.filter((x) => x.minDepth)) {
    assert.ok(Object.keys(zonesOf(f, 'marina')).some((z) => seen[z] >= f.minDepth), `${f.id}: хватает глубины`);
  }
  assert.equal(R.spotAt(2.4, -4).zone, 'pier', 'у корня пирса — пирсовая зона');
  assert.equal(R.spotAt(R.BRIDGE.x, R.BRIDGE.z).zone, 'bridge', 'под мостом');
  assert.equal(R.spotAt(R.PONTOONS[1].x + 4, R.PONTOONS[1].z1 - 2).zone, 'lights', 'у понтона — огни');
  assert.equal(R.spotAt(-200, -113).zone, 'channel', 'канал');
  assert.equal(R.spotAt(126, -95).zone, 'mouth', 'выход из гавани');
  assert.equal(R.spotAt(220, -100).zone, 'sea', 'море за молом');
  assert.equal(R.spotAt(R.BACKWATER.x, R.BACKWATER.z - 4).zone, 'backwater', 'пляж');
  // Лунный призрак — в море за молом: там глубоко
  const L = BEASTS.luna;
  assert.equal(L.loc, 'marina');
  assert.ok(seen[L.zone] > 15, 'логово Лунного призрака глубокое');
  for (const [x, z] of R.SCHOOL_HOMES) assert.ok(R.groundH(x, z) < -1.4 && !R.inRocks(x, z), `косяк ${x},${z} на воде`);
  // сутки: новая комната начинается вечером, ночь занимает почти половину реального времени
  const loc = locOf('marina');
  const h0 = clockHours(0, loc.start, loc.dayShare);
  assert.ok(h0 > 20 && h0 < 21, `начало ${h0.toFixed(2)} ч`);
  let night = 0;
  for (let t = 0; t < DAY_REAL_SEC; t += 10) {
    const h = clockHours(t, loc.start, loc.dayShare);
    if (h >= 21 || h < 5) night++;
  }
  const share = night / (DAY_REAL_SEC / 10);
  assert.ok(share > 0.4 && share < 0.5, `доля ночи ${share.toFixed(2)}`);
  assert.ok(Math.abs(clockHours(0) - 8) < 1e-9, 'на других локациях — как было');
});
