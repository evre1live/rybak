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
  // друг играет в старой версии и присылает персонажа «из частей»: у нас он всё равно выглядит героем (первым из списка)
  await G(b, () => { RYBAK.profile.look = { body: 2, hair: 5, hairC: '#e85d9a', hat: 1, hatC: '#e85d9a', top: 2, topC: '#c9a26b', hero: '' }; });
  await b.click('[data-a="join"]');
  await b.waitForFunction(() => RYBAK.state === 'lobby');
  await a.waitForFunction(() => RYBAK.players.size === 1);
  assert.equal(await G(a, () => [...RYBAK.players.values()][0].card.name), 'Нори');
  await a.waitForFunction(() => { const r = [...RYBAK.players.values()][0].remote; return r.char.look.hero === '' && r.char.hero && r.char.hero.tpl.info.id === 'hero-yellow'; }, null, { timeout: 60000 });
  // друг выбирает героя: модель догружается, и всё это время куклы из частей не видно
  await G(b, () => { const g = RYBAK; g.profile.look = { hero: 'hero-kai' }; g.meChar.setLook(g.profile.look); g.net.send({ t: 'card', card: g.card() }); });
  await a.waitForFunction(() => [...RYBAK.players.values()][0].remote.char.look.hero === 'hero-kai');
  assert.ok(await G(a, () => { const c = [...RYBAK.players.values()][0].remote.char; return !!c.hero || c.root.visible === false; }), 'пока герой друга грузится, куклы не видно');
  await a.waitForFunction(() => { const r = [...RYBAK.players.values()][0].remote; return r.char.hero && r.char.hero.tpl.info.id === 'hero-kai'; }, null, { timeout: 60000 });
  console.log('  герой друга загружен');
  assert.equal(await G(b, () => [...RYBAK.players.values()][0].card.name), 'Жамшид');
  // в лобби: плашка с кодом комнаты и счётом «2/8», рядом — портрет друга
  assert.match(await a.textContent('.codepill'), new RegExp(`КОД ${code}.*2/8`));
  assert.equal(await a.locator('.crewrow .ava').count(), 1);
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
  {
    // команда справа вверху: счёт игроков, у друга своя фигурка, огонёк и микрофон; та же фигурка — над его головой
    const crew = await G(a, () => { const q = (s) => document.querySelector(s); return { head: q('#onlineN').textContent, name: q('#crew .crow b').textContent, mark: q('#crew .crow .mark').outerHTML, dot: !!q('#crew .crow .dot'), mic: !!q('#crew .crow .ic'), tag: q('.tag .mark').outerHTML, tagName: q('.tag .nm span').textContent, box: q('.crewbox').getBoundingClientRect().left > innerWidth / 2 }; });
    const shapeOf = (svg) => (/<(circle|rect|path d="[^"]*")/.exec(svg) || [])[0];
    assert.ok(crew.head === 'Команда 2/8' && crew.name === 'Нори' && crew.dot && crew.mic && crew.box, `команда справа вверху: ${JSON.stringify(crew)}`);
    assert.ok(shapeOf(crew.mark) && shapeOf(crew.mark) === shapeOf(crew.tag) && crew.tagName === 'Нори', `фигурка друга в списке и над головой одна и та же: ${shapeOf(crew.mark)} / ${shapeOf(crew.tag)}`);
    assert.ok(/fill="none"/.test(crew.mark) && !/fill="none"/.test(crew.tag), 'в списке фигурка контуром, над головой — залитая');
  }

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
      else if (f.state === 'fight') { const s = f.fight; const run = s.phase === 'run'; i.primary = s.T < (s.jumpT > 0 ? 0.45 : s.stuck ? 0.72 : run ? 0.5 : s.warned ? 0.42 : 0.64); i.keys.delete('KeyA'); i.keys.delete('KeyD'); if (run && s.dir) i.keys.add(s.dir > 0 ? 'KeyA' : 'KeyD'); }
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

  // ── подсак друга: Нори вываживает, Жамшид рядом с пустыми руками — берёт её рыбу подсаком с 70 % пути ──
  {
    await G(a, () => { const g = RYBAK; g.fishing.reelIn(true); g.input.locked = true; g.input.enabled = true; g.player.place(-0.6, -13, 0); });
    const was = await G(a, () => ({ xp: RYBAK.profile.xp, n: RYBAK.profile.stats.assists }));
    // у Нори на крючке щука; правила боя стоят — путь выставляем сами
    await G(b, () => {
      const g = RYBAK, f = g.fishing;
      if (f.state !== 'idle') f.toIdle();
      g.ui.catchCard(null);
      g.input.primary = false; g.input.keys.clear();
      g.player.place(1, -14, 0);
      f.startFight('shuka', 0.5, 9);
      window.__upd = f.update;
      f.update = () => {};
      f.fight.p = 0.4;
    });
    // рыба ещё далеко: подсказка есть, кнопка не берёт
    await a.waitForFunction(() => /ПОДСАК НАГОТОВЕ/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
    assert.match(await a.textContent('#prompt'), /НОРИ.*40 % ИЗ 70/);
    // рыбаку видно, что друг наготове: отметка на полосе пути и подсказка
    await b.waitForFunction(() => document.querySelector('#pbar').classList.contains('help') && /Жамшид рядом — с 70 % пути/.test(document.querySelector('#toasts').textContent), null, { timeout: 10000 });
    await G(a, () => RYBAK.input.pressed.add('KeyE'));
    await a.waitForTimeout(700);
    assert.equal(await G(b, () => RYBAK.fishing.state), 'fight', 'раньше 70 % пути подсак не берёт');
    // дошла — но сейчас свеча: игра Нори отвечает, почему нельзя
    await G(b, () => { const s = RYBAK.fishing.fight; s.p = 0.74; s.jumpT = 0.5; });
    await a.waitForFunction(() => /ПОДСАЧИТЬ РЫБУ — НОРИ/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
    await G(a, () => RYBAK.input.pressed.add('KeyE'));
    await a.waitForFunction(() => /Рыба в воздухе/.test(document.querySelector('#toasts').textContent), null, { timeout: 10000 });
    assert.equal(await G(b, () => RYBAK.fishing.state), 'fight', 'в свече рыбу не взять');
    // свеча кончилась — берём (между попытками полторы секунды)
    await G(b, () => { RYBAK.fishing.fight.jumpT = 0; });
    await a.waitForTimeout(1600);
    await G(a, () => RYBAK.input.pressed.add('KeyE'));
    await b.waitForFunction(() => RYBAK.fishing.state === 'landed', null, { timeout: 10000 });
    const got = await G(b, () => ({ help: RYBAK.fishing.catch.help, card: document.querySelector('#catch').textContent, toast: document.querySelector('#toasts').textContent }));
    assert.equal(got.help, 'Жамшид');
    assert.match(got.card, /ПОДСАЧИЛ: ЖАМШИД/);
    assert.match(got.toast, /Жамшид подсачил вашу рыбу/);
    // помощнику — четверть опыта, отметка в журнале и строка в ленте
    await a.waitForFunction((n) => RYBAK.profile.stats.assists === n + 1, was.n, { timeout: 10000 });
    const now = await G(a, () => ({ xp: RYBAK.profile.xp, feed: document.querySelector('#feed').textContent, toast: document.querySelector('#toasts').textContent }));
    assert.ok(now.xp > was.xp, `опыт помощнику: ${was.xp} → ${now.xp}`);
    assert.match(now.feed, /Нори — .*подсачили вы/);
    assert.match(now.toast, /Вы подсачили рыбу для Нори/);
    await shot(b, 'c05b-assist-catch', 300);
    await G(b, () => { const f = RYBAK.fishing; f.update = window.__upd; f.finish(false); RYBAK.ui.catchCard(null); });
    await a.waitForFunction(() => !/ПОДСА/.test(document.querySelector('#prompt').textContent), null, { timeout: 10000 });
    // легенда: пока впереди «второе дыхание», подсак не поможет
    await G(b, () => { const f = RYBAK.fishing; f.startFight('koi', 0.5, 9); window.__upd = f.update; f.update = () => {}; f.fight.p = 0.75; });
    await a.waitForFunction(() => /ПОДСАЧИТЬ РЫБУ — НОРИ/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
    await a.waitForTimeout(1600);
    await G(a, () => RYBAK.input.pressed.add('KeyE'));
    await a.waitForFunction(() => /Легенда ещё не выдохлась/.test(document.querySelector('#toasts').textContent), null, { timeout: 10000 });
    assert.equal(await G(b, () => RYBAK.fishing.state), 'fight');
    await G(b, () => { const f = RYBAK.fishing; f.update = window.__upd; f.toIdle(); RYBAK.ui.catchCard(null); });
    assert.equal(await G(a, () => RYBAK.profile.stats.assists), was.n + 1);
    console.log('  подсак друга: рано — не берёт, в свече и у легенды — отказ с причиной, с 70 % — улов рыбаку, опыт помощнику');
  }

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

  // общая лодка: Жамшид берёт лодку, Нори садится к нему пассажиром, едет, ловит с борта и сходит у маяка
  const [aId, bId] = [await G(a, () => RYBAK.me.id), await G(b, () => RYBAK.me.id)];
  await G(a, () => { const g = RYBAK; g.player.place(0.9, -12, -Math.PI / 2); });
  await a.waitForFunction(() => /ЛОДКА НАПРОКАТ/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
  await G(a, () => RYBAK.input.pressed.add('KeyE'));
  await a.waitForFunction(() => RYBAK.boat.active);
  await G(b, () => { const g = RYBAK; g.player.place(0.9, -12, -Math.PI / 2); });
  await b.waitForFunction(() => /СЕСТЬ В ЛОДКУ — ЖАМШИД/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
  await G(b, () => RYBAK.input.pressed.add('KeyE'));
  await b.waitForFunction(() => RYBAK.ride && RYBAK.player.boat === RYBAK.ride);
  assert.deepEqual(await G(b, () => [RYBAK.ride.id, RYBAK.ride.seatI, RYBAK.boat.active]), [aId, 1, false]);
  await a.waitForFunction(() => /Нори.*садится к вам в лодку/.test(document.querySelector('#feed').textContent), null, { timeout: 20000 });
  // хозяин видит пассажирку на передней банке своей лодки
  await a.waitForFunction((id) => { const g = RYBAK; const p = g.players.get(id); if (!p || !p.st || p.st[17] !== g.me.id) return false; const c = p.remote.char.group.position; const o = g.boat.vis.group.position; return Math.hypot(c.x - o.x, c.z - o.z) < 1.6 && (p.st[11] & 1); }, bId, { timeout: 20000 });
  await G(a, () => { RYBAK.player.pitch = -0.35; });
  await shot(a, 'c07-passenger', 400);
  // хозяин даёт ход: пассажирка едет вместе с лодкой, на ходу забросить нельзя
  const stopBoat = async () => {
    // тормозим задним ходом, чтобы лодка не докатилась до острова
    await G(a, () => { const k = RYBAK.input.keys; k.delete('KeyW'); k.add('KeyS'); });
    await a.waitForFunction(() => RYBAK.boat.v < 1.2, null, { timeout: 40000 });
    await G(a, () => RYBAK.input.keys.delete('KeyS'));
    await b.waitForFunction(() => Math.abs(RYBAK.ride.v) < 1, null, { timeout: 40000 });
  };
  // (время в проверке идёт втрое быстрее — лодка за секунду проходит под сорок метров, поэтому всё делаем сразу)
  await G(b, () => { RYBAK.player.pitch = -0.25; });
  await G(a, () => RYBAK.input.keys.add('KeyW'));
  await b.waitForFunction(() => { const g = RYBAK; if (Math.abs(g.ride.v) < 5) return false; g.input.pressed.add('Primary'); return true; }, null, { timeout: 40000 });
  const close = await G(b, (id) => { const g = RYBAK; const o = g.players.get(id).remote.boat.group.position; return Math.hypot(g.player.x - o.x, g.player.z - o.z); }, aId);
  await b.waitForFunction(() => /На ходу не забросить/.test(document.querySelector('#toasts').textContent), null, { timeout: 10000 });
  assert.equal(await G(b, () => RYBAK.fishing.state), 'idle');
  // лодка встала — заброс с борта работает; пошла снова — леска сматывается сама
  await stopBoat();
  assert.ok(close < 1.6 && (await G(b, () => Math.hypot(RYBAK.player.x - 4, RYBAK.player.z + 12))) > 3, `пассажирка едет в лодке, а не отстаёт от неё: ${close.toFixed(2)} м от середины`);
  await shot(b, 'c08-riding', 300);
  for (const turn of [Math.PI / 2, -Math.PI / 2, Math.PI, 0]) {
    await G(b, (t) => { const g = RYBAK; g.player.yaw = g.ride.yaw + t; g.player.pitch = -0.2; }, turn);
    await b.waitForTimeout(250);
    if (await G(b, () => RYBAK.fishing.aim.ok)) break;
  }
  assert.ok(await G(b, () => RYBAK.fishing.aim.ok), 'с борта есть куда забросить');
  await G(b, () => { const i = RYBAK.input; i.primary = true; i.pressed.add('Primary'); });
  await b.waitForFunction(() => RYBAK.fishing.state === 'charge' && RYBAK.fishing.power > 0.8, null, { timeout: 10000 });
  await G(b, () => { RYBAK.input.primary = false; });
  await b.waitForFunction(() => RYBAK.fishing.state === 'wait', null, { timeout: 20000 });
  assert.ok(await G(b, () => RYBAK.fishing.inBoat), 'улов с чужой лодки считается уловом с лодки');
  await G(a, () => RYBAK.input.keys.add('KeyW'));
  await b.waitForFunction(() => RYBAK.fishing.state === 'idle' && /Лодка пошла — леска смотана/.test(document.querySelector('#toasts').textContent), null, { timeout: 40000 });
  await stopBoat();
  // хозяин причаливает у маяка: пассажирка может сойти на тот же причал
  await G(a, () => RYBAK.dock(1));
  await b.waitForFunction(() => RYBAK.ride && RYBAK.ride.moored === 1 && /СОЙТИ НА ПРИЧАЛ — ПРИЧАЛ У МАЯКА/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
  await G(b, () => RYBAK.input.pressed.add('KeyE'));
  await b.waitForFunction(() => !RYBAK.ride && !RYBAK.player.boat && RYBAK.player.onDeck);
  assert.ok(await G(b, () => Math.hypot(RYBAK.player.x + 17.5, RYBAK.player.z + 70.7) < 2), 'пассажирка на причале у маяка');
  await a.waitForFunction((id) => { const p = RYBAK.players.get(id); return p.st && p.st[17] === 0 && /Нори.*сходит на причал/.test(document.querySelector('#feed').textContent); }, bId, { timeout: 20000 });
  // в лодку, оставленную у причала, можно сесть и без хозяина; хозяин сдал лодку — пассажирку высаживает на ближайший причал
  await b.waitForFunction(() => /СЕСТЬ В ЛОДКУ — ЖАМШИД/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
  await G(b, () => RYBAK.input.pressed.add('KeyE'));
  await b.waitForFunction(() => RYBAK.ride && RYBAK.ride.moored === 1);
  await G(a, () => RYBAK.goHome());
  await b.waitForFunction(() => !RYBAK.ride && RYBAK.player.onDeck && /Лодка ушла из-под вас/.test(document.querySelector('#toasts').textContent), null, { timeout: 20000 });
  assert.ok(await G(b, () => Math.hypot(RYBAK.player.x + 17.5, RYBAK.player.z + 70.7) < 2));
  console.log('  общая лодка: посадка, ход, заброс с борта, высадка у маяка, сдача лодки хозяином');

  // удар лодки о преграду: рулевой слышит и чувствует его сам, пассажирка — так же, подруга на берегу — тише и со своей стороны
  {
    // у обоих записываем, что дошло до звука, брызг, тряски и вибрации
    const spy = (page) => G(page, () => {
      const g = RYBAK;
      g.__bumps = [];
      g.__motor = [];
      const bb = g.boatBump.bind(g);
      g.boatBump = (sp, edge, x, z, aboard, from) => {
        const rec = { sp, edge, x, z, aboard, from: from || 0, thud: null, hit: -1, splash: 0, rumble: 0, shake0: g.player.shake };
        const a = g.audio, t0 = a.thud, f0 = g.fx.splash, r0 = g.rumble;
        a.thud = function (p, o) { rec.thud = { p, ...(o || {}) }; return (rec.hit = t0.apply(this, arguments)); };
        g.fx.splash = function () { rec.splash++; return f0.apply(this, arguments); };
        g.rumble = function () { rec.rumble++; };
        try { bb(sp, edge, x, z, aboard, from); } finally { a.thud = t0; g.fx.splash = f0; g.rumble = r0; }
        rec.shake = g.player.shake;
        rec.me = [g.player.x, g.player.z, g.player.yaw];
        g.__bumps.push(rec);
      };
      const m0 = g.audio.motorNear.bind(g.audio);
      g.audio.motorNear = (k, d, side) => { g.__motor = [k, d, side]; return m0(k, d, side); };
    });
    await spy(a);
    await spy(b);
    await G(a, () => { const g = RYBAK; g.profile.coins = Math.max(g.profile.coins, 500); g.fishing.reelIn(true); g.player.place(0.9, -12, -Math.PI / 2); });
    await a.waitForFunction(() => /ЛОДКА НАПРОКАТ/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
    await G(a, () => RYBAK.input.pressed.add('KeyE'));
    await a.waitForFunction(() => RYBAK.boat.active);
    await G(b, () => { const g = RYBAK; g.fishing.reelIn(true); g.player.place(0.9, -12, -Math.PI / 2); });
    await b.waitForFunction(() => /СЕСТЬ В ЛОДКУ — ЖАМШИД/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
    await G(b, () => RYBAK.input.pressed.add('KeyE'));
    await b.waitForFunction(() => RYBAK.ride && RYBAK.player.boat === RYBAK.ride);
    // пока едем в лодке друга, её мотор — «свой»: отдельного чужого мотора рядом нет
    await b.waitForFunction(() => RYBAK.__motor[0] === -1, null, { timeout: 10000 });
    // куда править, чтобы метрах в двадцати–шестидесяти упереться в берег, а до него шла чистая вода
    const aim = await G(a, () => {
      const b = RYBAK.boat;
      for (let d = 20; d <= 60; d += 2) for (let k = 0; k < 36; k++) {
        const yaw = (k / 36) * Math.PI * 2;
        const at = (e) => b.fits(b.x - Math.sin(yaw) * e, b.z - Math.cos(yaw) * e, yaw);
        if (at(d)) continue;
        let free = true;
        for (let e = 1; e <= d - 2; e += 1) free = free && at(e);
        if (free) return { yaw, d };
      }
      return null;
    });
    assert.ok(aim, 'нашли, во что упереться');
    const ram = () => G(a, (yaw) => { const g = RYBAK; g.boat.yaw = yaw; g.boat.v = 9; g.input.keys.add('KeyW'); }, aim.yaw);
    await ram();
    await a.waitForFunction(() => RYBAK.__bumps.length > 0, null, { timeout: 40000 });
    await b.waitForFunction(() => RYBAK.__bumps.length > 0, null, { timeout: 20000 });
    await G(a, () => RYBAK.input.keys.delete('KeyW'));
    const [ha, hb] = [await G(a, () => RYBAK.__bumps[0]), await G(b, () => RYBAK.__bumps[0])];
    assert.ok(ha.aboard && ha.from === 0 && !ha.edge && ha.sp > 7 && ha.hit === 2 && ha.thud.p > 0.9 && ha.thud.vol === 1 && ha.splash === 1 && ha.rumble === 1 && ha.shake > 0.8, `рулевой: сильный удар, брызги, тряска и вибрация — ${JSON.stringify(ha)}`);
    assert.ok(hb.aboard && hb.from === aId && !hb.edge && Math.abs(hb.sp - ha.sp) < 0.06 && hb.hit === 2 && hb.thud.vol === 1 && hb.thud.pan === 0 && hb.splash === 1 && hb.rumble === 1 && hb.shake > 0.8, `пассажирка: тот же удар в полную силу, брызги, тряска и вибрация — ${JSON.stringify(hb)}`);
    assert.ok(Math.hypot(hb.x - ha.x, hb.z - ha.z) < 0.11, `место удара у пассажирки то же: ${JSON.stringify([ha.x, ha.z, hb.x, hb.z])}`);
    // удар пришёлся носом: метрах в двух перед серединой лодки, по курсу
    const bow = await G(a, () => [RYBAK.boat.x, RYBAK.boat.z]);
    assert.ok(Math.hypot(ha.x - bow[0], ha.z - bow[1]) < 6, `удар — у носа лодки: ${JSON.stringify([ha.x, ha.z, bow])}`);

    // пассажирка сходит домой и слышит следующий удар уже со стороны
    await a.waitForFunction(() => Math.abs(RYBAK.boat.v) < 1.5, null, { timeout: 20000 });
    await G(b, () => RYBAK.leaveRide(0));
    await b.waitForFunction(() => !RYBAK.ride && RYBAK.player.onDeck);
    await G(b, () => RYBAK.player.place(-2, 9, 0)); // и отходит на пляж, метров на двадцать от места удара
    // теперь лодка друга — чужая: её мотор слышен отсюда, пока она в пределах слышимости
    await b.waitForFunction(() => RYBAK.__motor[0] >= 0 && RYBAK.__motor[1] < 70, null, { timeout: 20000 });
    await a.waitForTimeout(2700); // звук считает удары подряд по настоящим часам: ждём, пока прошлый «забудется»
    await G(a, () => { RYBAK.__bumps.length = 0; });
    await G(b, () => { RYBAK.__bumps.length = 0; });
    await ram();
    await a.waitForFunction(() => RYBAK.__bumps.length > 0, null, { timeout: 40000 });
    await b.waitForFunction(() => RYBAK.__bumps.length > 0, null, { timeout: 20000 });
    await G(a, () => RYBAK.input.keys.delete('KeyW'));
    const hc = await G(b, () => RYBAK.__bumps[0]);
    const dx = hc.x - hc.me[0], dz = hc.z - hc.me[1];
    const dist = Math.hypot(dx, dz);
    const k = Math.max(0, Math.min(1, 1.1 - dist / 80));
    const side = ((dx * Math.cos(hc.me[2]) - dz * Math.sin(hc.me[2])) / dist) * 0.75;
    assert.ok(!hc.aboard && hc.from === aId && dist > 10 && dist < 75, `подруга на берегу, удар в стороне: ${JSON.stringify(hc)}`);
    assert.ok(Math.abs(hc.thud.vol - k * k) < 0.01 && hc.thud.vol > 0.02 && hc.thud.vol < 0.98, `со стороны удар тише — по расстоянию ${dist.toFixed(1)} м: ${hc.thud.vol} (ждали ${(k * k).toFixed(3)})`);
    assert.ok(Math.abs(hc.thud.pan - side) < 0.01, `и слышен с той стороны, где случился: ${hc.thud.pan} (ждали ${side.toFixed(3)})`);
    assert.ok(hc.hit === 2 && hc.splash === 1 && hc.rumble === 0 && hc.shake === hc.shake0, `на берегу — звук и брызги, без тряски и вибрации: ${JSON.stringify(hc)}`);
    // хозяин сдаёт лодку — чужого мотора больше не слышно
    await G(a, () => RYBAK.goHome());
    await b.waitForFunction(() => RYBAK.__motor[0] === -1, null, { timeout: 20000 });
    console.log(`  удар лодки: рулевой и пассажирка — в полную силу, с тряской; с берега за ${dist.toFixed(0)} м — громкость ${hc.thud.vol.toFixed(2)}, сторона ${hc.thud.pan.toFixed(2)}; мотор чужой лодки слышен рядом`);
  }

  // турнир: объявляет хозяин комнаты, улов гостьи идёт в зачёт у обоих, по итогам — приз
  await G(b, () => RYBAK.input.pressed.add('KeyT'));
  await b.waitForSelector('.tourp');
  assert.match(await b.textContent('.tourp'), /Турнир запускает хозяин комнаты — Жамшид/);
  assert.equal(await b.locator('[data-a="tstart"]').count(), 0);
  await b.keyboard.press('Escape');
  await G(a, () => RYBAK.input.pressed.add('KeyT'));
  await a.waitForSelector('[data-a="tstart"]');
  await a.click('[data-a="tkind"][data-id="sum"]');
  await a.click('[data-a="tlen"][data-id="180"]');
  await a.click('[data-a="tstart"]');
  await b.waitForFunction(() => RYBAK.tour && RYBAK.tour.kind === 'sum' && RYBAK.tour.len === 180 && /Жамшид.*объявляет турнир/.test(document.querySelector('#feed').textContent), null, { timeout: 20000 });
  await a.waitForFunction(() => RYBAK.tour && !document.querySelector('#tour').classList.contains('hidden'));
  await b.waitForFunction(() => RYBAK.tour.begun, null, { timeout: 20000 });
  const bCoins = await G(b, () => RYBAK.profile.coins);
  await G(b, () => RYBAK.fishing.showCatch('okun', 0.5));
  await a.waitForFunction((id) => { const r = RYBAK.tour.scores.get(id); return r && r.s.n === 1 && /Нори/.test(document.querySelector('#tour').textContent); }, bId, { timeout: 20000 });
  await b.waitForFunction(() => /Вы/.test(document.querySelector('#tour').textContent), null, { timeout: 20000 });
  await shot(a, 'c09-tournament', 300);
  // улов гостья кладёт в садок (или он уже лёг туда сам — карточка улова закрывается через несколько секунд)
  await b.waitForFunction(() => RYBAK.fishing.state === 'idle' || (RYBAK.fishing.state === 'landed' && RYBAK.fishing.landT > 0.5));
  await G(b, () => RYBAK.fishing.finish(false));
  await G(a, () => RYBAK.stopTour());
  await b.waitForFunction(() => !RYBAK.tour && RYBAK.lastTour, null, { timeout: 20000 });
  await a.waitForFunction(() => !RYBAK.tour && RYBAK.lastTour && document.querySelector('#tour').classList.contains('hidden'), null, { timeout: 20000 });
  const tb = await G(b, () => ({ place: RYBAK.lastTour.place, prize: RYBAK.lastTour.prize, players: RYBAK.lastTour.players, early: RYBAK.lastTour.early, coins: RYBAK.profile.coins }));
  const ta = await G(a, () => ({ place: RYBAK.lastTour.place, prize: RYBAK.lastTour.prize, table: RYBAK.lastTour.table.map((r) => [r.name, r.place]) }));
  assert.deepEqual([tb.place, tb.prize, tb.players, tb.early], [1, 45, 2, true], JSON.stringify(tb));
  assert.ok(tb.coins >= bCoins + 45);
  assert.deepEqual(ta, { place: 0, prize: 0, table: [['Нори', 1]] });
  await shot(b, 'c10-tournament-result', 400);
  await G(b, () => RYBAK.ui.closePanel());
  await G(a, () => RYBAK.ui.closePanel());
  console.log('  турнир: объявлен хозяином, улов в зачёте, итоги и приз');

  // ── своя лодка: Нори покупает лодку — Жамшид видит на ней вымпел её цвета; за выход она не платит и лодку не сдаёт ──
  {
    await G(b, () => { const g = RYBAK; g.fishing.reelIn(true); g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; if (g.boat.active || g.boat.rented) g.goHome(); });
    await a.waitForFunction(() => { const p = [...RYBAK.players.values()][0]; return p.st && p.st[16] === 0 && !p.remote.boat; }, null, { timeout: 20000 });
    const own = await G(b, () => { const g = RYBAK; g.profile.coins = 5000; g.profile.boatTrips = 5; g.buy('boat'); return { own: g.ownBoat(), coins: g.profile.coins, rented: g.boat.rented, owner: g.boat.vis.owner, pennant: !!g.boat.vis.pennant, price: g.boatPrice(), slot: g.me.slot }; });
    assert.ok(own.own && own.coins === 500 && own.rented && own.pennant && own.price === 0 && /^#/.test(own.owner), `лодка куплена: ${JSON.stringify(own)}`);
    await a.waitForFunction(() => /Нори купил: .*Своя лодка/.test(document.querySelector('#feed').textContent), null, { timeout: 10000 });
    await G(b, () => { RYBAK.player.place(0.9, -12, -Math.PI / 2); });
    await b.waitForFunction(() => /СВОЯ ЛОДКА — В ПУТЬ/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
    await G(b, () => RYBAK.input.pressed.add('KeyE'));
    await b.waitForFunction(() => RYBAK.boat.active);
    assert.equal(await G(b, () => RYBAK.profile.coins), 500, 'за выход на своей лодке не платят');
    // у Жамшида лодка Нори — с вымпелом её цвета (цвет метки на карте); его прокатная — без
    await a.waitForFunction((c) => { const p = [...RYBAK.players.values()][0]; const r = p.remote; return p.st && p.st[16] === 1 && (p.st[11] & 16) && r.boat && r.boat.owner === c && !!r.boat.pennant; }, own.owner, { timeout: 20000 });
    assert.equal(await G(a, () => RYBAK.boat.vis.owner), null, 'у прокатной лодки вымпела нет');
    await G(a, () => { const g = RYBAK; g.player.place(1.2, -7.5, -0.56); g.player.pitch = -0.25; });
    await shot(a, 'c11-friend-own-boat', 500);
    // ушла в море и вернулась домой: лодка остаётся её
    await G(b, () => { const g = RYBAK; g.boat.away = true; g.dock(0); });
    const home = await G(b, () => ({ rented: RYBAK.boat.rented, away: RYBAK.boat.away, active: RYBAK.boat.active, toast: document.querySelector('#toasts').textContent }));
    assert.ok(home.rented && !home.away && !home.active && /на своём месте/.test(home.toast), `своя лодка дома: ${JSON.stringify(home)}`);
    console.log('  своя лодка: куплена, вымпел виден другу, выход бесплатный, дома остаётся своей');
  }

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
