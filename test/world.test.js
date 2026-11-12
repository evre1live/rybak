// Мир за пределами бухты: причалы для лодки, проходы, зоны ловли в море.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../client/terrain.js';
import { ZONES, FISH } from '../shared/data.js';
import { newProfile, fixProfile } from '../shared/logic.js';

// как в client/boat.js: нос, середина, корма и оба борта на воде
const fits = (x, z, yaw) => {
  const sn = Math.sin(yaw);
  const cs = Math.cos(yaw);
  return T.canSail(x, z) && T.canSail(x - sn * 1.9, z - cs * 1.9) && T.canSail(x + sn * 1.8, z + cs * 1.8) && T.canSail(x - cs * 0.8, z + sn * 0.8) && T.canSail(x + cs * 0.8, z - sn * 0.8);
};

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

test('профиль: счётчик выходов на лодке появляется у старых сохранений и не ломается от мусора', () => {
  assert.equal(newProfile().boatTrips, 0);
  const old = newProfile();
  delete old.boatTrips;
  assert.equal(fixProfile(old).boatTrips, 0);
  assert.equal(fixProfile({ ...newProfile(), boatTrips: 'много' }).boatTrips, 0);
  assert.equal(fixProfile({ ...newProfile(), boatTrips: 3 }).boatTrips, 3);
});
