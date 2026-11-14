// Палитры (client/palette.js): у всех один и тот же набор чисел, сутки идут по порядку и замыкаются.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PALETTES, PAL, usePalette, DEFAULT_PALETTE } from '../client/palette.js';

const COLORS = ['zen', 'hor', 'sun', 'hemiS', 'hemiG', 'fog', 'wS', 'wD', 'cloud'];
const NUMS = ['h', 'sunI', 'hemiI', 'stars', 'glit', 'exp'];
const fin = (o, keys, where) => { for (const k of keys) assert.ok(Number.isFinite(o[k]), `${where}: ${k} = ${o[k]}`); };

test('палитры: полный набор чисел, сутки по порядку от 0 до 24 и без шва в полночь', () => {
  assert.deepEqual(Object.keys(PALETTES), ['now', 'tropic', 'pine', 'coral', 'ocean', 'pastel', 'cinema']); // pine — палитра «Соснового озера», ocean — «Синего простора»
  for (const [id, P] of Object.entries(PALETTES)) {
    assert.ok(P.name.length > 2, id);
    fin(P.tone, ['sat', 'vib', 'con', 'toe'], `${id}.tone`);
    for (const k of ['sh', 'hi']) assert.ok(P.tone[k].length === 3 && P.tone[k].every((v) => v > 0.7 && v < 1.3), `${id}.tone.${k}`);
    fin(P.water, ['clear', 'pathMin', 'fres', 'net', 'deepAt', 'netDeep', 'netTint', 'seaDeep', 'bedNet', 'bedTint', 'bedFog', 'bedDeep'], `${id}.water`);
    fin(P.post, ['bloom', 'thr', 'vig'], `${id}.post`);
    fin(P.fog, ['near', 'far'], `${id}.fog`);
    assert.ok(P.fog.far > P.fog.near + 500 && P.water.clear > 0.03 && P.water.pathMin > 0.1 && P.water.deepAt > 5, `${id}: дымка и вода в разумных пределах`);
    const K = P.keys;
    assert.ok(K.length >= 8 && K[0].h === 0 && K[K.length - 1].h === 24, `${id}: сутки от 0 до 24`);
    for (let i = 0; i < K.length; i++) {
      fin(K[i], NUMS, `${id}, час ${K[i].h}`);
      for (const c of COLORS) assert.ok(K[i][c] instanceof THREE.Color && [K[i][c].r, K[i][c].g, K[i][c].b].every((v) => v >= 0 && v <= 1.0001), `${id}, час ${K[i].h}: ${c}`);
      if (i) assert.ok(K[i].h > K[i - 1].h, `${id}: часы идут по порядку (${K[i - 1].h} → ${K[i].h})`);
      assert.ok(K[i].sunI > 0.3 && K[i].hemiI > 0.3 && K[i].exp > 0.5 && K[i].exp < 1.6, `${id}, час ${K[i].h}: свет не гаснет совсем`);
    }
    // полночь: последний ключ совпадает с первым — иначе в 24:00 небо «прыгнет»
    for (const c of COLORS) assert.equal(K[0][c].getHexString(), K[K.length - 1][c].getHexString(), `${id}: ${c} в 0 и в 24 часа`);
    for (const n of NUMS.slice(1)) assert.equal(K[0][n], K[K.length - 1][n], `${id}: ${n} в 0 и в 24 часа`);
    // день светлее ночи, вода на мели светлее глубины
    const noon = K.find((k) => k.h === 12);
    const L = (c) => c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722;
    assert.ok(noon && L(noon.zen) > L(K[0].zen) * 3 && noon.sunI > K[0].sunI * 2, `${id}: полдень светлее полуночи`);
    for (const k of K) assert.ok(L(k.wS) > L(k.wD), `${id}, час ${k.h}: мель светлее глубины`);
  }
});

test('палитры: в игре — «Тропики»; прежняя цела для сравнения; смена на ходу и неизвестное имя', () => {
  assert.equal(DEFAULT_PALETTE, 'tropic');
  assert.equal(PAL.id, 'tropic');
  assert.equal(PAL.keys, PALETTES.tropic.keys);
  const N = PALETTES.now;
  assert.deepEqual(N.tone, { sat: 1.25, vib: 0, con: 1.08, toe: 0.7, sh: [1, 1, 1], hi: [1, 1, 1] });
  assert.deepEqual([N.water.clear, N.water.pathMin, N.water.fres, N.water.net, N.water.deepAt, N.water.netDeep, N.water.netTint, N.water.seaDeep], [0.16, 0.18, 0.8, 0.27, 14, 0.55, 0, 0.45]);
  assert.deepEqual([N.water.bedNet, N.water.bedTint, N.water.bedFog, N.water.bedDeep], [0.62, 0.7, 0.075, 0.5]);
  assert.deepEqual(N.post, { bloom: 0.115, thr: 1.0, vig: 0.32 });
  assert.deepEqual(N.fog, { near: 170, far: 1700 });
  assert.deepEqual(N.keys.map((k) => k.h), [0, 4.6, 5.7, 7.2, 12, 17, 19, 20.4, 21.4, 24]);
  assert.equal(N.keys[4].wS.getHexString(), '35e0d4');
  assert.ok(PAL.water.clear < N.water.clear && PAL.water.deepAt > N.water.deepAt, 'в палитре игры вода прозрачнее и бирюзовая до большей глубины');
  assert.equal(usePalette('now').id, 'now');
  assert.equal(PAL.tone, N.tone);
  assert.equal(usePalette('нет такой').id, 'tropic');
  assert.equal(PAL.tone, PALETTES.tropic.tone);
});
