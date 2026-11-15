// «Водопадная чаша»: рельеф, водопады и зоны лесной чаши (client/loc/cascade.js) — без браузера.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../client/loc/cascade.js';
import { fishOf, zonesOf } from '../shared/data.js';
import { BEASTS } from '../shared/beasts.js';

test('Водопадная чаша: база как везде — стоять на настиле и пляже, у пирса глубина, в стену не залезть', () => {
  assert.ok(C.canStand(C.SPAWN.x, C.SPAWN.z), 'точка появления');
  assert.ok(C.canStand(0, -20), 'пирс');
  assert.ok(C.canStand(-20, 18), 'пляж за лавкой');
  assert.ok(!C.canStand(0, -40), 'в воду глубже колена не зайти');
  const d = -C.groundH(0, -26);
  assert.ok(d > 3 && d < 12, `у головы пирса ${d.toFixed(1)} м`);
  // Котёл — самое глубокое место; Скала-черепаха торчит из воды
  assert.ok(-C.groundH(C.PIT.x, C.PIT.z) > 14, `Котёл ${(-C.groundH(C.PIT.x, C.PIT.z)).toFixed(1)} м`);
  assert.ok(C.groundH(C.ISLET.x, C.ISLET.z) > 2.5, 'Скала-черепаха над водой');
  assert.ok(C.groundH(C.BACKWATER.x, C.BACKWATER.z - 4) < 0, 'заводь — вода');
});

test('Водопадная чаша: стена в две ступени, струи падают с верха на полку и в чашу', () => {
  assert.equal(C.FALLS.length, 5);
  assert.equal(C.FALLS.filter((f) => f.main).length, 1, 'один Большой каскад');
  for (const f of C.FALLS) {
    assert.ok(f.top > 20, `верх струи ${f.top.toFixed(1)} м`);
    assert.ok(C.groundH(f.bx, f.bz) < -0.5, 'струя падает в воду');
    // от подножия к струе — сперва вода, потом стена: вверх идёт круто
    assert.ok(C.groundH(f.x, f.z) > 6, `полка/стена под струёй ${C.groundH(f.x, f.z).toFixed(1)} м`);
  }
  const main = C.FALLS.find((f) => f.main);
  assert.ok(Math.hypot(main.bx - C.PIT.x, main.bz - C.PIT.z) < C.PIT.r + 6, 'Большой каскад бьёт в Котёл');
  // у стены — круча: по ней не пройти
  assert.ok(!C.canStand(main.x, main.z), 'на стену не забраться');
});

test('Водопадная чаша: лодка от причала проходит к Котлу, Коряги и камни обходит', () => {
  for (const m of C.MOORINGS) {
    assert.ok(C.canSail(m.x, m.z), `${m.id}: лодка встаёт у причала`);
    assert.ok(C.deckAt(m.sx, m.sz), `${m.id}: рыбак выходит на настил`);
  }
  const line = (ax, az, bx, bz) => {
    for (let i = 0; i <= 200; i++) {
      const x = ax + ((bx - ax) * i) / 200;
      const z = az + ((bz - az) * i) / 200;
      const buoy = [...C.MARKS, ...C.BUOYS].some(([bx, bz]) => Math.hypot(x - bx, z - bz) < 2);
      if (Math.hypot(x - 4, z + 12) > 14 && !buoy && !C.canSail(x, z)) return [x, z];
    }
    return null;
  };
  assert.equal(line(10, -30, C.PIT.x - 14, C.PIT.z + 14), null, 'к Котлу');
  assert.equal(line(10, -30, C.SNAGS.x - 20, C.SNAGS.z), null, 'к Корягам');
  assert.equal(line(10, -30, C.ISLET.x + 14, C.ISLET.z), null, 'к Скале-черепахе');
  for (const [x, z] of C.SNAG_TRUNKS) assert.ok(!C.canSail(x, z), 'сквозь ствол не проплыть');
  for (const [x, z] of C.BUOYS) assert.ok(C.groundH(x, z) < -2, `буй ${x},${z} на воде`);
});

test('Водопадная чаша: все зоны ловли на месте, и в каждой есть своя рыба', () => {
  const seen = {};
  for (let x = -100; x <= 108; x += 2) {
    for (let z = -110; z <= 44; z += 2) {
      const s = C.spotAt(x, z);
      if (s) seen[s.zone] = Math.max(seen[s.zone] || 0, s.depth);
    }
  }
  const fish = fishOf('cascade');
  assert.ok(fish.length >= 12, `видов ${fish.length}`);
  const used = new Set(fish.flatMap((f) => Object.keys(zonesOf(f, 'cascade'))));
  for (const z of used) assert.ok(seen[z], `зона ${z} есть на карте: ${JSON.stringify(seen)}`);
  for (const z of Object.keys(seen)) assert.ok(used.has(z), `в зоне ${z} кто-то водится`);
  for (const f of fish.filter((x) => x.minDepth)) {
    assert.ok(Object.keys(zonesOf(f, 'cascade')).some((z) => seen[z] >= f.minDepth), `${f.id}: хватает глубины`);
  }
  assert.equal(C.spotAt(2.4, -4).zone, 'pier', 'у корня пирса — пирсовая зона');
  assert.equal(C.spotAt(0, -30).zone, 'deep', 'с головы пирса сразу глубина');
  assert.equal(C.spotAt(C.PIT.x, C.PIT.z).zone, 'pit');
  assert.equal(C.spotAt(C.SNAGS.x - 8, C.SNAGS.z + 8).zone, 'snags');
  // Радужный змей живёт в Котле — там ему хватает места
  const rb = BEASTS.rainbow;
  assert.equal(rb.loc, 'cascade');
  assert.ok(seen[rb.zone] > 12, 'логово змея достаточно глубокое');
  for (const [x, z] of C.SCHOOL_HOMES) assert.ok(C.groundH(x, z) < -1.5 && !C.inRocks(x, z), `косяк ${x},${z} на воде`);
});
