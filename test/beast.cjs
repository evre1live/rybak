// Общий бой с чудищем вдвоём в настоящем браузере: Несси на Сосновом озере.
// Одному не позвать; приманка в Яме на рассвете — вода бурлит, Несси берёт; второй подсекает рядом;
// оба тянут, на одного из них — рывок; у борта двое бьют багром — трофей обоим, приманка потрачена.
// Запуск: PORT=3111 node test/beast.cjs [папка для снимков]
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = process.argv[2] || '/tmp/rybak-shots';
fs.mkdirSync(out, { recursive: true });
const BASE = `http://127.0.0.1:${process.env.PORT || 3111}`;
const Q = 'q=low&norender&h=6&w=clear&loc=lake';

async function open(browser, url, name) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) console.log(`[${name}] console.error`, m.text().slice(0, 300)); });
  page.on('pageerror', (e) => { console.log(`[${name}] PAGEERROR`, e.message.slice(0, 500)); page.__err = (page.__err || 0) + 1; });
  await page.goto(url);
  await page.waitForFunction(() => window.RYBAK && window.__frames > 3, null, { timeout: 120000 });
  return page;
}
const G = (page, fn, arg) => page.evaluate(fn, arg);
async function shot(page, file) {
  const before = await page.evaluate(() => { window.__render = true; return window.__rendered || 0; });
  await page.waitForFunction((b) => (window.__rendered || 0) > b, before, { timeout: 120000 });
  await page.screenshot({ path: `${out}/${file}.png` });
  console.log('  снимок', file);
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const a = await open(browser, `${BASE}/?${Q}`, 'А');
  await G(a, () => { RYBAK.profile.xp = 52000; RYBAK.profile.seenIntro = true; });
  await a.fill('#nm', 'Жамшид');
  await a.click('[data-a="create"]');
  await a.waitForFunction(() => RYBAK.state === 'lobby' && RYBAK.code.length === 4, null, { timeout: 60000 });
  const code = await G(a, () => RYBAK.code);
  const b = await open(browser, `${BASE}/?room=${code}&${Q}`, 'Б');
  await G(b, () => { RYBAK.profile.seenIntro = true; });
  await b.fill('#nm', 'Нори');
  await b.click('[data-a="join"]');
  await b.waitForFunction(() => RYBAK.state === 'lobby', null, { timeout: 60000 });
  await G(a, () => RYBAK.enterWorld());
  await a.waitForFunction(() => RYBAK.state === 'world' && !RYBAK.booting, null, { timeout: 300000 });
  console.log('  Жамшид у озера');

  await G(a, () => { const p = RYBAK.profile; p.coins = 100000; p.tackle.nessiebait = 2; p.equip.tackle = 'nessiebait'; });

  // одному — нельзя: друг ещё в лобби
  const solo = await G(a, () => { const t = []; const toast = RYBAK.ui.toast.bind(RYBAK.ui); RYBAK.ui.toast = (m, k) => (t.push(m), toast(m, k)); RYBAK.__t = t; return RYBAK.beasts.onLand(RYBAK.player.x + 8, RYBAK.player.z, { zone: 'pit' }); });
  assert.equal(solo, true, 'особая приманка — без обычной поклёвки');
  await a.waitForFunction(() => RYBAK.__t.some((m) => /второй/.test(m)), null, { timeout: 10000 });
  // не та зона и не то время — подсказка, приманка цела
  await G(a, () => RYBAK.beasts.onLand(RYBAK.player.x + 8, RYBAK.player.z, { zone: 'shallow' }));
  await a.waitForFunction(() => RYBAK.__t.some((m) => /Яма/.test(m)), null, { timeout: 5000 });
  assert.equal(await G(a, () => RYBAK.profile.tackle.nessiebait), 2, 'приманка цела, пока существо не позвали');

  // друг пришёл: зовём
  await G(b, () => RYBAK.enterWorld());
  await b.waitForFunction(() => RYBAK.state === 'world' && !RYBAK.booting, null, { timeout: 300000 });
  await a.waitForFunction(() => [...RYBAK.players.values()].some((p) => p.mode === 'world' && p.st), null, { timeout: 30000 });
  await G(b, () => { RYBAK.player.place(RYBAK.player.x + 3, RYBAK.player.z, 0); });
  const pit = await G(a, () => RYBAK.beasts.zonePoint('pit', RYBAK.player.x, RYBAK.player.z));
  assert.ok(pit, 'Яма на озере есть');
  await G(a, (pit) => RYBAK.beasts.onLand(pit[0], pit[1], { zone: 'pit' }), pit);
  await a.waitForFunction(() => RYBAK.beasts.b && RYBAK.beasts.b.phase === 'call', null, { timeout: 10000 });
  assert.equal(await G(a, () => RYBAK.profile.tackle.nessiebait), 1, 'позвали — приманка потрачена');
  await b.waitForFunction(() => RYBAK.beasts.b && RYBAK.beasts.b.kind === 'nessie', null, { timeout: 10000 });
  console.log('  вода бурлит — Несси идёт');
  await a.waitForFunction(() => RYBAK.beasts.b.phase === 'bite' && RYBAK.fishing.state === 'beast', null, { timeout: 20000 });
  console.log('  Несси взяла у Жамшида');
  // второй забрасывает рядом с ней и подсекает
  const at = await G(b, () => [RYBAK.beasts.pos.x, RYBAK.beasts.pos.z]);
  await G(b, (at) => RYBAK.beasts.onLand(at[0] + 2, at[1] + 1, { zone: 'pit' }), at);
  await b.waitForFunction(() => RYBAK.beasts.b.phase === 'fight' && RYBAK.fishing.state === 'beast', null, { timeout: 10000 });
  await a.waitForFunction(() => RYBAK.beasts.b.phase === 'fight' && RYBAK.beasts.b.hooked.length === 2, null, { timeout: 10000 });
  console.log('  держат вдвоём');
  // на экране — шкала и кто держит; натяжение лески видно на общей панели
  assert.match(await a.textContent('#beasthud'), /Несси.*Держат: .*Нори/);
  // существо видно в воде у тех, кто держит
  await a.waitForFunction(() => RYBAK.beasts.view && RYBAK.beasts.view.mesh.visible, null, { timeout: 60000 });
  // тянем вместе (подмотку отправляем быстрее, чем руками) — до багра
  let lunged = false;
  for (let i = 0; i < 400; i++) {
    const ph = await G(a, () => { RYBAK.net.send({ t: 'beast', a: 'pull', g: 0.05 }); const b = RYBAK.beasts.b; return b ? [b.phase, !!b.lunge, b.why] : ['none']; });
    assert.ok(ph[0] !== 'none' && ph[0] !== 'gone', `бой не оборвался: ${ph[2] || ph[0]}`);
    await G(b, () => RYBAK.net.send({ t: 'beast', a: 'pull', g: 0.05 }));
    lunged = lunged || ph[1];
    if (ph[0] === 'gaff') break;
    await a.waitForTimeout(160);
  }
  await a.waitForFunction(() => RYBAK.beasts.b.phase === 'gaff', null, { timeout: 30000 });
  console.log('  Несси у борта', lunged ? '(рывки были)' : '');
  await G(a, () => { const g = RYBAK; g.player.yaw = Math.atan2(-(g.beasts.pos.x - g.player.x), -(g.beasts.pos.z - g.player.z)); g.player.pitch = -0.2; });
  await shot(a, 'b1-nessie-gaff');
  // багор: двое разом
  const c0 = await G(a, () => RYBAK.profile.coins);
  for (const pg of [a, b]) await G(pg, () => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.input.pressed.add('KeyE'); });
  await a.waitForFunction(() => !RYBAK.beasts.b || RYBAK.beasts.b.phase === 'won', null, { timeout: 15000 });
  const won = await G(a, () => ({ coins: RYBAK.profile.coins, n: RYBAK.profile.beasts.nessie, st: RYBAK.fishing.state, beasts: RYBAK.profile.stats.beasts }));
  assert.ok(won.coins === c0 + 60000 && won.n === 1 && won.beasts === 1 && won.st === 'idle', `трофей Жамшиду: ${JSON.stringify(won)}`);
  await b.waitForFunction(() => RYBAK.profile.beasts.nessie === 1, null, { timeout: 15000 });
  console.log('  Несси взята вдвоём — трофей обоим');
  // запись о бое пропадает
  await a.waitForFunction(() => !RYBAK.beasts.b, null, { timeout: 30000 });
  assert.ok(!a.__err && !b.__err, 'ошибки на странице');
  console.log('ЧУДИЩА: всё в порядке');
  await browser.close();
})().catch((e) => {
  console.log('ПРОВАЛ:', e.message);
  process.exit(1);
});
