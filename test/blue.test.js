// «Синий простор»: рельеф и зоны океанского острова (client/loc/blue.js) — без браузера.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as B from '../client/loc/blue.js';
import { fishOf, zonesOf } from '../shared/data.js';

test('Синий простор: база как везде — стоять на настиле и пляже, у пирса глубина, обрывы не пускают', () => {
  assert.ok(B.canStand(B.SPAWN.x, B.SPAWN.z), 'точка появления');
  assert.ok(B.canStand(0, -20), 'пирс');
  assert.ok(B.canStand(-20, 18), 'пляж за лавкой');
  assert.ok(!B.canStand(0, -40), 'в воду глубже колена не зайти');
  assert.ok(!B.canStand(B.HOME.x, B.HOME.z + 40), 'на вершину острова не забраться');
  const d = -B.groundH(0, -26);
  assert.ok(d > 3 && d < 9, `у головы пирса ${d.toFixed(1)} м`);
  // тихая бухточка к западу — вода, Маячная скала и Тюленьи камни торчат над водой
  assert.ok(B.groundH(B.BACKWATER.x, B.BACKWATER.z - 4) < 0);
  assert.ok(B.groundH(B.LIGHTHOUSE.x, B.LIGHTHOUSE.z) > 7, 'маяк стоит на скале');
  assert.ok(Math.abs(B.groundH(B.COTTAGE.x, B.COTTAGE.z) - B.COTTAGE.y) < 0.2, 'площадка под домиком смотрителя ровная');
  for (const [ox, oz, , top] of B.SEALS.rocks) assert.ok(B.groundH(B.SEALS.x + ox, B.SEALS.z + oz) > top * 0.6, 'камень над водой');
});

test('Синий простор: причалы для лодки, мостки Маячной скалы, путь в океан открыт', () => {
  for (const m of B.MOORINGS) {
    assert.ok(B.canSail(m.x, m.z), `${m.id}: лодка встаёт у причала`);
    assert.ok(B.deckAt(m.sx, m.sz), `${m.id}: рыбак выходит на настил`);
  }
  // по прямой от домашнего причала до Банки и до Течения — только вода
  const line = (ax, az, bx, bz) => {
    for (let i = 0; i <= 200; i++) {
      const x = ax + ((bx - ax) * i) / 200;
      const z = az + ((bz - az) * i) / 200;
      const buoy = [...B.MARKS, ...B.BUOYS].some(([bx, bz]) => Math.hypot(x - bx, z - bz) < 2); // буй лодка обходит
      if (Math.hypot(x - 4, z + 12) > 14 && !buoy && !B.canSail(x, z)) return [x, z];
    }
    return null;
  };
  // к Банке — мимо Маячной скалы (левее неё)
  assert.equal(line(4, -40, 10, -160), null, 'от пирса в открытый океан');
  assert.equal(line(10, -160, B.BANK.x, B.BANK.z), null, 'к Банке');
  assert.equal(line(4, -40, -60, -370), null, 'к Течению');
  assert.equal(line(4, -40, B.SEALS.x + 35, B.SEALS.z), null, 'к Тюленьим камням');
  for (const [x, z] of [...B.MARKS, ...B.BUOYS]) assert.ok(B.groundH(x, z) < -2, `веха/буй ${x},${z} на воде`);
});

test('Синий простор: все зоны ловли на месте, и в каждой есть своя рыба', () => {
  const seen = {};
  for (let x = -520; x <= 520; x += 8) {
    for (let z = -620; z <= 200; z += 8) {
      const s = B.spotAt(x, z);
      if (s) seen[s.zone] = Math.max(seen[s.zone] || 0, s.depth);
    }
  }
  const fish = fishOf('blue');
  assert.ok(fish.length >= 14, `видов ${fish.length}`);
  const used = new Set(fish.flatMap((f) => Object.keys(zonesOf(f, 'blue'))));
  for (const z of used) assert.ok(seen[z], `зона ${z} есть на карте: ${JSON.stringify(seen)}`);
  for (const z of Object.keys(seen)) assert.ok(used.has(z), `в зоне ${z} кто-то водится`);
  // гиганты: у каждого найдётся глубина не меньше той, что ему нужна
  for (const f of fish.filter((x) => x.minDepth)) {
    assert.ok(Object.keys(zonesOf(f, 'blue')).some((z) => seen[z] >= f.minDepth), `${f.id}: хватает глубины`);
  }
  assert.ok(B.spotAt(0, -24).zone === 'pier');
  assert.equal(B.spotAt(B.BANK.x, B.BANK.z).zone, 'bank');
  assert.equal(B.spotAt(B.SEALS.x + 30, B.SEALS.z).zone, 'reef');
});

test('Синий простор: киты, дельфины и морские косяки — на глубокой воде, в стороне от скал', () => {
  // киты — только над синевой; дельфины и косяки бывают и над Банкой (там 8 м)
  for (const [x, z] of B.WHALE_WAY) assert.ok(B.groundH(x, z) < -12 && !B.inRocks(x, z), `кит ${x},${z}: глубоко`);
  for (const [x, z] of [...B.DOLPHIN_WAY, ...B.SEA_HOMES]) assert.ok(B.groundH(x, z) < -6 && !B.inRocks(x, z), `${x},${z}: глубоко`);
  // кит проходит мимо базы на таком расстоянии, что его фонтан видно с пирса
  const near = Math.min(...B.WHALE_WAY.map(([x, z]) => Math.hypot(x, z + 20)));
  assert.ok(near < 380, `ближе всего к пирсу ${near.toFixed(0)} м`);
});
