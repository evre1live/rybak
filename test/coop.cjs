// Проверка игры вдвоём в настоящем браузере: комната по ссылке, лобби, друг в бухте, чат, голос, улов, обрыв связи.
// Запуск: PORT=3111 node test/coop.cjs [папка для снимков]
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = process.argv[2] || '/tmp/rybak-shots';
fs.mkdirSync(out, { recursive: true });
const BASE = `http://127.0.0.1:${process.env.PORT || 3111}`;
const Q = 'q=low&norender&ts=3&h=13';

async function open(browser, url, name) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, permissions: ['microphone'] });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log(`[${name}] console.error`, m.text().slice(0, 300)); });
  page.on('pageerror', (e) => { console.log(`[${name}] PAGEERROR`, e.message.slice(0, 500)); page.__err = (page.__err || 0) + 1; });
  await page.goto(url);
  await page.waitForFunction(() => window.RYBAK && window.__frames > 3, null, { timeout: 60000 });
  return page;
}
async function shot(page, file, wait = 0) {
  if (wait) await page.waitForTimeout(wait);
  const before = await page.evaluate(() => { window.__render = true; return window.__rendered || 0; });
  await page.waitForFunction((b) => (window.__rendered || 0) > b, before, { timeout: 120000 });
  await page.screenshot({ path: `${out}/${file}.png` });
  console.log('  снимок', file);
}
const G = (page, fn, arg) => page.evaluate(fn, arg);

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const a = await open(browser, `${BASE}/?${Q}`, 'А');
  await a.fill('#nm', 'Жамшид');
  await a.click('[data-a="create"]');
  await a.waitForFunction(() => RYBAK.state === 'lobby' && RYBAK.code.length === 4);
  const code = await G(a, () => RYBAK.code);
  assert.match(await a.url(), new RegExp('room=' + code));
  console.log('  комната', code);

  // друг заходит по ссылке
  const b = await open(browser, `${BASE}/?room=${code}&${Q}`, 'Б');
  assert.match(await b.textContent('.tcard .btn.pri'), new RegExp(code));
  await b.fill('#nm', 'Нори');
  await G(b, () => { RYBAK.profile.look = { ...RYBAK.profile.look, hair: 5, hairC: '#e85d9a', hat: 1, hatC: '#e85d9a', top: 2, topC: '#c9a26b', topC2: '#f1efe6' }; });
  await b.click('[data-a="join"]');
  await b.waitForFunction(() => RYBAK.state === 'lobby');
  await a.waitForFunction(() => RYBAK.players.size === 1);
  assert.equal(await G(a, () => [...RYBAK.players.values()][0].card.name), 'Нори');
  // друг с готовым героем: модель догружается и встаёт вместо куклы
  if (await G(b, () => fetch('models/manifest.json').then((r) => r.json()).then((m) => m.heroes.some((h) => h.id === 'hero-nori'), () => false))) {
    await G(b, () => { const g = RYBAK; g.profile.look = { ...g.profile.look, hero: 'hero-nori' }; g.meChar.setLook(g.profile.look); g.net.send({ t: 'card', card: g.card() }); });
    await a.waitForFunction(() => { const r = [...RYBAK.players.values()][0].remote; return r.char.look.hero === 'hero-nori' && !!r.char.hero; }, null, { timeout: 60000 });
    console.log('  герой друга загружен');
  }
  assert.equal(await G(b, () => [...RYBAK.players.values()][0].card.name), 'Жамшид');
  assert.match(await a.textContent('.lob-tl'), /2\/8/);
  await a.waitForFunction(() => document.querySelectorAll('.plate').length === 2);
  await shot(a, 'c01-lobby-two', 300);

  // неверный код
  const c = await open(browser, `${BASE}/?${Q}`, 'В');
  await c.fill('#nm', 'Пип');
  await c.fill('#code', 'ZZZZ');
  await c.click('[data-a="joincode"]');
  await c.waitForFunction(() => /Комнаты с таким кодом нет/.test(document.querySelector('#terr').textContent));
  await c.close();

  // голос: оба включают, связь устанавливается
  await a.click('[data-a="voice"]');
  await a.waitForFunction(() => RYBAK.voice.state.joined, null, { timeout: 20000 });
  await b.click('[data-a="voice"]');
  await b.waitForFunction(() => RYBAK.voice.state.joined, null, { timeout: 20000 });
  await a.waitForFunction(() => RYBAK.voice.state.roster.length === 2);
  await a.waitForFunction(() => [...RYBAK.voice.state.peers.values()].some((p) => p.state === 'connected' || p.state === 'relay'), null, { timeout: 30000 });
  const vstate = await G(a, () => [...RYBAK.voice.state.peers.values()].map((p) => p.state));
  console.log('  голос:', vstate.join());
  // «тестовый микрофон» браузера пищит — друг должен увидеть, что мы говорим
  await b.waitForFunction(() => RYBAK.roster().some((p) => !p.me && p.talk), null, { timeout: 30000 });
  await G(a, () => RYBAK.toggleVoice());
  await b.waitForFunction(() => RYBAK.roster().find((p) => !p.me).muted === true);
  await G(a, () => RYBAK.toggleVoice());
  await b.waitForFunction(() => RYBAK.roster().find((p) => !p.me).muted === false);

  // на рыбалку: хозяин первым, друг видит его из лобби, потом заходит сам
  await G(a, () => { RYBAK.profile.seenIntro = true; });
  await G(b, () => { RYBAK.profile.seenIntro = true; });
  await a.click('[data-a="start"]');
  await a.waitForFunction(() => RYBAK.state === 'world');
  await b.waitForFunction(() => [...RYBAK.players.values()][0].mode === 'world');
  await b.click('[data-a="start"]');
  await b.waitForFunction(() => RYBAK.state === 'world');
  await a.waitForFunction(() => { const p = [...RYBAK.players.values()][0]; return p.mode === 'world' && p.st; });
  // Нори встаёт на край пирса и забрасывает, Жамшид смотрит на неё
  await G(b, () => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(1, -14, -1.35); g.player.pitch = -0.2; });
  await G(a, () => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(-1, -8.5, -0.42); g.player.pitch = -0.08; });
  await b.waitForTimeout(400);
  await G(b, () => { const i = RYBAK.input; i.primary = true; i.pressed.add('Primary'); });
  await b.waitForFunction(() => RYBAK.fishing.state === 'charge' && RYBAK.fishing.power > 0.9);
  await G(b, () => { RYBAK.input.primary = false; });
  await b.waitForFunction(() => RYBAK.fishing.state === 'wait', null, { timeout: 20000 });
  await a.waitForFunction(() => { const p = [...RYBAK.players.values()][0]; const r = p.remote; return p.st && p.st[6] === 3 && r.bob.visible && r.line.line.visible && r.char.group.visible; }, null, { timeout: 20000 });
  const pos = await G(a, () => { const p = [...RYBAK.players.values()][0]; return [p.st[0], p.st[2], p.st[6]]; });
  assert.ok(Math.abs(pos[0] - 1) < 0.2 && Math.abs(pos[1] + 14) < 0.2 && pos[2] === 3, 'положение друга: ' + pos);
  await shot(a, 'c02-friend-fishing', 400);
  assert.ok(await G(a, () => document.querySelectorAll('.tag').length === 1), 'табличка с именем');
  assert.ok(await G(a, () => document.querySelectorAll('#crew .crow').length === 1), 'список друзей');

  // чат и жесты
  await G(b, () => RYBAK.sendChat('Клюёт?'));
  await a.waitForFunction(() => /Нори:.*Клюёт\?/.test(document.querySelector('#feed').textContent));
  await G(b, () => { RYBAK.input.pressed.add('KeyR'); });
  await b.waitForFunction(() => RYBAK.fishing.state === 'idle');
  await G(b, () => { RYBAK.input.pressed.add('Digit1'); });
  await a.waitForFunction(() => [...RYBAK.players.values()][0].remote.emote === 'wave');
  await shot(a, 'c03-wave', 500);

  // улов друга виден в ленте
  await G(b, () => {
    const g = RYBAK;
    window.__bot = setInterval(() => {
      const f = g.fishing, i = g.input;
      if (f.state === 'idle') { i.primary = true; i.pressed.add('Primary'); }
      else if (f.state === 'charge') { if (f.power > 0.9) i.primary = false; }
      else if (f.state === 'bite') { i.pressed.add('Primary'); }
      else if (f.state === 'fight') { const s = f.fight; const run = s.phase === 'run'; i.primary = s.T < (run ? 0.5 : s.warned ? 0.42 : 0.64); i.keys.delete('KeyA'); i.keys.delete('KeyD'); if (run && s.dir) i.keys.add(s.dir > 0 ? 'KeyA' : 'KeyD'); }
      else if (f.state === 'landed') { i.primary = false; if (f.landT > 2.5) i.pressed.add('Primary'); }
      else i.primary = false;
    }, 30);
  });
  await a.waitForFunction(() => { const r = [...RYBAK.players.values()][0]; return r.st && r.st[6] === 5; }, null, { timeout: 120000 });
  await shot(a, 'c04-friend-fight', 300);
  await a.waitForFunction(() => /Нори — /.test(document.querySelector('#feed').textContent), null, { timeout: 300000 });
  console.log('  лента:', (await a.textContent('#feed')).replace(/\s+/g, ' ').slice(0, 160));
  await shot(a, 'c05-friend-catch', 200);
  await G(b, () => { clearInterval(window.__bot); RYBAK.input.primary = false; RYBAK.input.keys.clear(); });

  // лодка: Нори берёт её у пирса и отходит; Жамшид видит лодку, подругу на банке и запись в ленте
  await G(b, () => { const g = RYBAK; g.fishing.reelIn(true); g.input.locked = true; g.input.enabled = true; g.player.place(0.9, -12, -Math.PI / 2); });
  await b.waitForFunction(() => /ЛОДКА НАПРОКАТ/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
  await G(b, () => RYBAK.input.pressed.add('KeyE'));
  await b.waitForFunction(() => RYBAK.boat.active);
  await a.waitForFunction(() => /Нори.*берёт лодку/.test(document.querySelector('#feed').textContent), null, { timeout: 20000 });
  await a.waitForFunction(() => { const p = [...RYBAK.players.values()][0]; const r = p.remote; return p.st && p.st[16] === 1 && r.boat && r.boat.group.visible && (p.st[11] & 1) && Math.abs(r.char.group.position.y - p.st[1]) < 0.25; }, null, { timeout: 20000 });
  await G(a, () => { const g = RYBAK; g.player.place(1.2, -7.5, -0.56); g.player.pitch = -0.25; });
  await a.waitForFunction(() => { const r = [...RYBAK.players.values()][0].remote; return !r.boat || r.boat.model !== false; }, null, { timeout: 60000 }).catch(() => {});
  await shot(a, 'c06-friend-boat', 500);
  // свою лодку Жамшид видит у пирса по-прежнему: у каждого она своя
  assert.ok(await G(a, () => !RYBAK.boat.active && RYBAK.boat.moor === 0 && RYBAK.boat.vis.group.visible), 'своя лодка на месте');
  await G(b, () => RYBAK.input.keys.add('KeyW'));
  await a.waitForFunction(() => { const p = [...RYBAK.players.values()][0]; const r = p.remote; return p.st && Math.hypot(p.st[0] - 4, p.st[2] + 12) > 25 && r.boat && Math.hypot(r.boat.group.position.x - p.st[0], r.boat.group.position.z - p.st[2]) < 4; }, null, { timeout: 40000 });
  await G(b, () => RYBAK.input.keys.delete('KeyW'));
  // подруга оставила лодку у причала маяка — она стоит там и для Жамшида; вернула — лодка исчезла
  await G(b, () => RYBAK.dock(1));
  await a.waitForFunction(() => { const p = [...RYBAK.players.values()][0]; const r = p.remote; return p.st && p.st[16] === 3 && !(p.st[11] & 1) && r.boat && Math.hypot(r.boat.group.position.x + 17.5, r.boat.group.position.z + 68.4) < 12; }, null, { timeout: 20000 });
  await G(b, () => RYBAK.goHome());
  await a.waitForFunction(() => { const p = [...RYBAK.players.values()][0]; return p.st && p.st[16] === 0 && !p.remote.boat; }, null, { timeout: 20000 });
  console.log('  лодка друга: видна на ходу и у причала, после возврата исчезает');

  // обрыв связи у друга: он пропадает и возвращается на своё место
  const slot = await G(b, () => RYBAK.me.slot);
  await G(b, () => RYBAK.net.ws.close());
  await a.waitForFunction(() => RYBAK.players.size === 0, null, { timeout: 10000 });
  await a.waitForFunction(() => RYBAK.players.size === 1, null, { timeout: 20000 });
  await b.waitForFunction(() => RYBAK.net.open && RYBAK.net.room);
  assert.equal(await G(b, () => RYBAK.me.slot), slot);
  assert.equal(await G(b, () => RYBAK.state), 'world');
  await a.waitForFunction(() => [...RYBAK.players.values()][0].mode === 'world', null, { timeout: 10000 });
  await b.waitForFunction(() => RYBAK.voice.state.joined && [...RYBAK.voice.state.peers.values()].some((p) => p.state === 'connected' || p.state === 'relay'), null, { timeout: 40000 });

  // друг уходит
  await b.close();
  await a.waitForFunction(() => RYBAK.players.size === 0, null, { timeout: 10000 });
  assert.ok(!a.__err, 'ошибки на странице А');
  await browser.close();
  console.log('ИГРА ВДВОЁМ: всё в порядке');
})().catch((e) => { console.error('ПРОВАЛ:', e.message.split('\n').slice(0, 6).join('\n'), '\n', (e.stack || '').split('\n').filter((l) => l.includes('coop.cjs')).slice(0, 2).join('\n')); process.exit(1); });
