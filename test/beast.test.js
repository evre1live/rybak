// Общий бой с чудищем: сервер ведёт шкалу, рывки и багор (server/beast.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beastMsg, beastTick, pubBeast } from '../server/beast.js';
import { BEASTS, BEAST_K, beastAwake, BEAST_BAITS } from '../shared/beasts.js';

function room(loc, n = 2, spread = 10) {
  const players = new Map();
  for (let i = 1; i <= n; i++) players.set(i, { id: i, ws: {}, mode: 'world', st: [i * spread, 0, 0] });
  return { loc, players };
}

test('приманки чудищ: по одной на существо, цена — четверть награды', () => {
  assert.equal(BEAST_BAITS.length, Object.keys(BEASTS).length);
  for (const b of BEAST_BAITS) assert.ok(b.price > 0 && b.beast && BEASTS[b.beast].bait === b.id);
});

test('время и погода: Несси — на рассвете или в тумане, кракен — ночью через полночь', () => {
  assert.ok(beastAwake(BEASTS.nessie, 5, 'clear'));
  assert.ok(!beastAwake(BEASTS.nessie, 12, 'clear'));
  assert.ok(beastAwake(BEASTS.nessie, 12, 'fog'));
  assert.ok(beastAwake(BEASTS.kraken, 23, 'clear') && beastAwake(BEASTS.kraken, 2, 'clear'));
  assert.ok(!beastAwake(BEASTS.kraken, 12, 'clear'));
});

test('одному не бросить, чужое существо не позвать', () => {
  const r1 = room('lake', 1);
  assert.match(beastMsg(r1, r1.players.get(1), { a: 'call', kind: 'nessie', x: 0, z: 0 }, 0), /второй/);
  const r2 = room('lake', 2, 200); // второй далеко
  assert.match(beastMsg(r2, r2.players.get(1), { a: 'call', kind: 'nessie', x: 0, z: 0 }, 0), /второй/);
  const r3 = room('bay', 2);
  assert.match(beastMsg(r3, r3.players.get(1), { a: 'call', kind: 'nessie', x: 0, z: 0 }, 0), /не водится/);
});

test('бой целиком: зов → поклёвка → второй подсекает → шкала → багор вдвоём → победа', () => {
  const r = room('lake', 3);
  const [a, b2, c] = [1, 2, 3].map((i) => r.players.get(i));
  assert.equal(beastMsg(r, a, { a: 'call', kind: 'nessie', x: 5, z: 5 }, 0), null);
  assert.equal(r.beast.phase, 'call');
  beastTick(r, (BEAST_K.callT + 0.1) * 1000);
  assert.equal(r.beast.phase, 'bite');
  assert.deepEqual(pubBeast(r.beast).hooked, [1]);
  // далеко — не подсечь
  assert.match(beastMsg(r, b2, { a: 'hook', x: 80, z: 80 }, 8000), /Далеко/);
  assert.equal(beastMsg(r, b2, { a: 'hook', x: 8, z: 4 }, 8000), null);
  assert.equal(r.beast.phase, 'fight');
  // тянут оба; рывки идут по очереди
  let t = 8000;
  let lunges = 0;
  for (let i = 0; i < 4000 && r.beast.phase === 'fight'; i++) {
    t += 80;
    beastTick(r, t, () => 0.3);
    if (r.beast.lunge) lunges++;
    for (const p of [a, b2]) beastMsg(r, p, { a: 'pull', g: 0.004 }, t);
  }
  assert.equal(r.beast.phase, 'gaff');
  assert.ok(lunges > 0, 'существо бросалось на рыбаков');
  // багор: один — мало; второй (даже не на леске, просто рядом) — победа
  beastMsg(r, a, { a: 'gaff' }, t + 100);
  assert.equal(r.beast.phase, 'gaff');
  beastMsg(r, c, { a: 'gaff' }, t + 900);
  assert.equal(r.beast.phase, 'won');
  assert.deepEqual(r.beast.win.sort(), [1, 2, 3]);
  // через несколько секунд запись пропадает
  beastTick(r, t + 20000);
  assert.equal(r.beast, null);
});

test('один не подсёк вовремя — существо уходит; все лески лопнули — тоже', () => {
  const r = room('keys', 2);
  beastMsg(r, r.players.get(1), { a: 'call', kind: 'serpent', x: 0, z: 0 }, 0);
  beastTick(r, (BEAST_K.callT + 0.1) * 1000);
  beastTick(r, (BEAST_K.callT + BEAST_K.biteWindow + 1) * 1000);
  assert.equal(r.beast.phase, 'gone');
  const r2 = room('keys', 2);
  beastMsg(r2, r2.players.get(1), { a: 'call', kind: 'serpent', x: 0, z: 0 }, 0);
  beastTick(r2, 8000);
  beastMsg(r2, r2.players.get(2), { a: 'hook', x: 2, z: 2 }, 9000);
  beastMsg(r2, r2.players.get(1), { a: 'snap' }, 10000);
  assert.equal(r2.beast.phase, 'fight');
  // сорвавшийся цепляется снова в своё окно
  assert.equal(beastMsg(r2, r2.players.get(1), { a: 'hook', x: 1, z: 1 }, 15000), null);
  assert.deepEqual(pubBeast(r2.beast).hooked.sort(), [1, 2]);
  beastMsg(r2, r2.players.get(1), { a: 'snap' }, 16000);
  beastMsg(r2, r2.players.get(2), { a: 'snap' }, 16000);
  assert.equal(r2.beast.phase, 'gone');
});

test('в рывок на рыбака его подмотка не в счёт, остальные тянут вдвое', () => {
  const r = room('blue', 2);
  beastMsg(r, r.players.get(1), { a: 'call', kind: 'whale', x: 0, z: 0 }, 0);
  beastTick(r, 8000);
  beastMsg(r, r.players.get(2), { a: 'hook', x: 1, z: 1 }, 9000);
  r.beast.lunge = { to: 1, until: 99 };
  const p0 = r.beast.P;
  beastMsg(r, r.players.get(1), { a: 'pull', g: 0.01 }, 9100);
  assert.equal(r.beast.P, p0);
  beastMsg(r, r.players.get(2), { a: 'pull', g: 0.01 }, 9200);
  assert.ok(r.beast.P > p0 + 0.008);
});
