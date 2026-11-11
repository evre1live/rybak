import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import { createServer } from '../server/index.js';

function client(port) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
  const got = [];
  const bin = [];
  const waiters = [];
  ws.on('message', (raw, isBinary) => {
    if (isBinary) return bin.push(raw);
    const m = JSON.parse(String(raw));
    got.push(m);
    for (const w of [...waiters]) if (w.fn(m)) {
      waiters.splice(waiters.indexOf(w), 1);
      w.resolve(m);
    }
  });
  return {
    ws, got, bin,
    open: () => new Promise((r) => ws.once('open', r)),
    send: (m) => ws.send(JSON.stringify(m)),
    wait: (t, pred = () => true, ms = 2000) => new Promise((resolve, reject) => {
      const hit = got.find((m) => m.t === t && pred(m));
      if (hit) return resolve(hit);
      const w = { fn: (m) => m.t === t && pred(m), resolve };
      waiters.push(w);
      setTimeout(() => reject(new Error('нет сообщения ' + t)), ms);
    }),
    close: () => new Promise((r) => (ws.once('close', r), ws.close()))
  };
}

test('комната: вход по коду, положения, события, чат, голос, возвращение', async () => {
  const srv = createServer();
  await new Promise((r) => srv.server.listen(0, r));
  const port = srv.server.address().port;
  const h = await fetch(`http://127.0.0.1:${port}/health`).then((r) => r.json());
  assert.equal(h.ok, true);

  const a = client(port);
  const b = client(port);
  await Promise.all([a.open(), b.open()]);
  a.send({ t: 'create', card: { name: 'Финн', look: { hair: 2 }, rod: 'rod1', lvl: 3 } });
  const ja = await a.wait('joined');
  assert.match(ja.code, /^[A-Z2-9]{4}$/);
  assert.equal(ja.host, ja.id);
  assert.equal(ja.players.length, 0);

  b.send({ t: 'join', code: 'ZZZZ', card: { name: 'Нори' } });
  assert.equal((await b.wait('error')).code, 'NO_ROOM');
  b.send({ t: 'join', code: ja.code.toLowerCase(), card: { name: 'Нори<b>', look: {}, rod: 'rod2' } });
  const jb = await b.wait('joined');
  assert.equal(jb.seed, ja.seed);
  assert.equal(jb.players.length, 1);
  assert.equal(jb.players[0].card.name, 'Финн');
  assert.notEqual(jb.slot, ja.slot);
  const inb = await a.wait('in');
  assert.equal(inb.p.card.name, 'Нориb');

  // положения видят только те, кто уже на рыбалке
  a.send({ t: 'mode', m: 'world' });
  await b.wait('mode', (m) => m.id === ja.id && m.m === 'world');
  a.send({ t: 'st', s: [1.5, 1.1, -3.25, 0.5, 0, 1, 3, 4, 0, -12] });
  const sts = await b.wait('sts');
  assert.deepEqual(sts.a[0], [ja.id, [1.5, 1.1, -3.25, 0.5, 0, 1, 3, 4, 0, -12]]);
  a.send({ t: 'st', s: [1, 'x'] });
  a.send({ t: 'st', s: new Array(40).fill(1) });

  a.send({ t: 'ev', k: 'catch', d: { sp: 'okun', w: 0.42 } });
  const ev = await b.wait('ev');
  assert.deepEqual([ev.id, ev.k, ev.d.sp], [ja.id, 'catch', 'okun']);
  a.send({ t: 'ev', k: 'hack', d: {} });
  b.send({ t: 'chat', text: '  клюёт!  ' });
  assert.equal((await a.wait('chat')).text, 'клюёт!');
  b.send({ t: 'card', card: { name: 'Нори', look: { hat: 3 }, rod: 'rod3', lvl: 7 } });
  assert.equal((await a.wait('card')).card.rod, 'rod3');

  // часы
  a.send({ t: 'ping', c: 7 });
  const pong = await a.wait('pong');
  assert.equal(pong.c, 7);
  assert.ok(Math.abs(pong.at - Date.now()) < 2000);

  // голос: приглашения и ретранслятор
  a.send({ t: 'vjoin', muted: false });
  const va = await a.wait('vjoined');
  b.send({ t: 'vjoin', muted: false });
  const vb = await b.wait('vjoined');
  assert.deepEqual(vb.peers, [va.me]);
  assert.ok(vb.ice.length >= 1);
  b.send({ t: 'vsignal', to: va.me, data: { sdp: { type: 'offer', sdp: 'x' } } });
  const sig = await a.wait('vsignal');
  assert.equal(sig.from, vb.me);
  const frame = Buffer.alloc(2 + 2 + 320, 0x7f);
  frame[0] = 1;
  frame[1] = 1;
  frame.writeUInt16BE(va.me, 2);
  b.ws.send(frame);
  await new Promise((r) => setTimeout(r, 150));
  assert.equal(a.bin.length, 1);
  assert.equal(a.bin[0].readUInt16BE(1), vb.me);
  assert.equal(a.bin[0].length, 3 + 320);
  const roster = await a.wait('vroster', (m) => m.list.length === 2);
  assert.ok(roster.list.some((m) => m.pid === jb.id));

  // обрыв связи и возвращение на то же место
  await b.close();
  const out = await a.wait('out');
  assert.deepEqual([out.id, out.why], [jb.id, 'lost']);
  const b2 = client(port);
  await b2.open();
  b2.send({ t: 'join', code: ja.code, token: jb.token, card: { name: 'Нори' } });
  const jb2 = await b2.wait('joined');
  assert.equal(jb2.id, jb.id);
  assert.equal(jb2.slot, jb.slot);
  await a.wait('in', (m) => m.back === true);

  // хозяин ушёл — комната переходит следующему
  a.send({ t: 'leave' });
  await a.wait('left');
  assert.equal((await b2.wait('host')).id, jb.id);
  await a.close();
  await b2.close();
  srv.close();
});

test('в комнату помещается не больше восьми', async () => {
  const srv = createServer();
  await new Promise((r) => srv.server.listen(0, r));
  const port = srv.server.address().port;
  const cs = [];
  let code = '';
  for (let i = 0; i < 9; i++) {
    const c = client(port);
    await c.open();
    cs.push(c);
    if (!i) {
      c.send({ t: 'create', card: { name: 'А' } });
      code = (await c.wait('joined')).code;
    } else {
      c.send({ t: 'join', code, card: { name: 'Б' + i } });
      if (i < 8) await c.wait('joined');
      else assert.equal((await c.wait('error')).code, 'FULL');
    }
  }
  for (const c of cs) await c.close();
  srv.close();
});
