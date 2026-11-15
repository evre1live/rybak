// «Мангровая протока»: рельеф, протоки и зоны (client/loc/mangrove.js) — без браузера.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../client/loc/mangrove.js';
import { fishOf, zonesOf } from '../shared/data.js';
import { BEASTS } from '../shared/beasts.js';

test('Мангровая протока: база как везде — стоять на настиле и пляже, у пирса глубина, в лагуну не зайти', () => {
  assert.ok(R.canStand(R.SPAWN.x, R.SPAWN.z), 'точка появления');
  assert.ok(R.canStand(0, -20), 'пирс');
  assert.ok(R.canStand(-20, 18), 'пляж за лавкой');
  assert.ok(!R.canStand(0, -40), 'в воду глубже колена не зайти');
  const d = -R.groundH(0, -27);
  assert.ok(d > 2.5 && d < 6, `у головы пирса ${d.toFixed(1)} м`);
  // Омут глубже всего, отмель — по колено, на островках — сухая кочка
  assert.ok(-R.groundH(R.OMUT.x, R.OMUT.z) > 10, `Омут ${(-R.groundH(R.OMUT.x, R.OMUT.z)).toFixed(1)} м`);
  for (const I of R.ISLES) assert.ok(R.groundH(I.x, I.z) > 0.3, `островок ${I.x},${I.z} над водой`);
  const f = -R.groundH(R.FLATS.x, R.FLATS.z);
  assert.ok(f > 0 && f < 1.2, `на отмели ${f.toFixed(2)} м`);
});

test('Мангровая протока: хижина на сваях у северного берега, на её мостках можно стоять, в дом — нет', () => {
  const H = R.HUT;
  assert.ok(Math.abs(H.x - 6) < 1 && H.z < -80 && H.z > -110, `хижина у северного берега: ${H.z}`);
  const hm = R.MOORINGS.find((m) => m.id === 'hut');
  assert.ok(R.canStand(hm.sx, hm.sz) && R.deckAt(hm.sx, hm.sz), 'рыбак выходит на мостки хижины');
  assert.ok(!R.canStand(H.x, H.z - 2), 'внутрь хижины не пройти');
  assert.ok(R.canSail(hm.x, hm.z), 'каноэ встаёт у мостков');
});

test('Мангровая протока: каноэ от причала проходит по лагуне, по узкой протоке, к Омуту и в устье', () => {
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
  // по ломаной середины протоки — только вода
  const path = (pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const bad = line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      if (bad) return bad;
    }
    return null;
  };
  assert.equal(line(10, -30, R.HUT.x, R.HUT.z + 9), null, 'к хижине');
  assert.equal(path([[10, -30], ...R.NARROW.pts.slice(0, 7)]), null, 'по узкой протоке');
  assert.equal(path([[10, -30], [50, -40], ...R.WIDE.pts]), null, 'по широкой протоке до устья (островок обходим справа)');
  assert.ok(R.canSail(R.MOUTH.x, R.MOUTH.z), 'устье');
  for (const [x, z] of R.BUOYS) assert.ok(R.groundH(x, z) < -1.5, `буй ${x},${z} на воде`);
  for (const I of R.ISLES) assert.ok(!R.canSail(I.x + I.r, I.z), 'сквозь корни островка не проплыть');
});

test('Мангровая протока: все зоны ловли на месте, и в каждой есть своя рыба', () => {
  const seen = {};
  for (let x = -120; x <= 320; x += 3) {
    for (let z = -290; z <= 44; z += 3) {
      const s = R.spotAt(x, z);
      if (s) seen[s.zone] = Math.max(seen[s.zone] || 0, s.depth);
    }
  }
  const fish = fishOf('mangrove');
  assert.ok(fish.length >= 12, `видов ${fish.length}`);
  const used = new Set(fish.flatMap((f) => Object.keys(zonesOf(f, 'mangrove'))));
  for (const z of used) assert.ok(seen[z], `зона ${z} есть на карте: ${JSON.stringify(seen)}`);
  for (const z of Object.keys(seen)) assert.ok(used.has(z), `в зоне ${z} кто-то водится`);
  for (const f of fish.filter((x) => x.minDepth)) {
    assert.ok(Object.keys(zonesOf(f, 'mangrove')).some((z) => seen[z] >= f.minDepth), `${f.id}: хватает глубины`);
  }
  assert.equal(R.spotAt(2.4, -4).zone, 'pier', 'у корня пирса — пирсовая зона');
  assert.equal(R.spotAt(R.OMUT.x, R.OMUT.z).zone, 'pit', 'Омут');
  assert.equal(R.spotAt(R.MOUTH.x, R.MOUTH.z).zone, 'mouth', 'Устье');
  assert.equal(R.spotAt(R.FLATS.x, R.FLATS.z).zone, 'backwater', 'Илистая отмель');
  assert.equal(R.spotAt(-56, -150).zone, 'channel', 'узкая протока');
  // Хозяин протоки живёт в Омуте — там ему хватает глубины
  const hz = BEASTS.hozyain;
  assert.equal(hz.loc, 'mangrove');
  assert.ok(seen[hz.zone] > 10, 'логово Хозяина протоки глубокое');
  for (const [x, z] of R.SCHOOL_HOMES) assert.ok(R.groundH(x, z) < -1.4 && !R.inRocks(x, z), `косяк ${x},${z} на воде`);
});
