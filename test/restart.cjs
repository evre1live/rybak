// Перезапуск сервера посреди игры вдвоём — в настоящем браузере и с настоящим процессом сервера.
// Сервер запускается здесь же, со своей базой в файлах (PGlite, RYBAK_DB=dir:…): её не стирает перезапуск, как и Postgres
// на Render. Дважды: «выкладка» (SIGTERM — сервер записывает комнаты и отпускает игроков) и «падение» (SIGKILL — никого
// не предупредив). Оба раза игроки должны сами вернуться в ту же комнату, на свои места, с тем же турниром.
// Запуск: node test/restart.cjs [папка для снимков]   (порт — RESTART_PORT, по умолчанию 3113)
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const out = process.argv[2] || '/tmp/rybak-shots';
fs.mkdirSync(out, { recursive: true });
const PORT = Number(process.env.RESTART_PORT) || 3113;
const BASE = `http://127.0.0.1:${PORT}`;
const Q = 'q=low&norender&h=13';
const root = path.join(__dirname, '..');
const dbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rybak-restart-'));

let server = null;
const logs = [];
const pages = {};
/** Запустить сервер и дождаться, пока он ответит и подключится к базе. */
async function boot() {
  const child = spawn(process.execPath, ['server/index.js'], { cwd: root, env: { ...process.env, PORT: String(PORT), RYBAK_DB: 'dir:' + dbDir, DATABASE_URL: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', (d) => logs.push(String(d)));
  child.stderr.on('data', (d) => logs.push(String(d)));
  child.exited = new Promise((r) => child.once('exit', (code, sig) => r(sig || code)));
  server = child;
  const t0 = Date.now();
  for (;;) {
    const h = await fetch(`${BASE}/health`).then((r) => r.json()).catch(() => null);
    if (h && h.db) return h;
    if (Date.now() - t0 > 60000) throw new Error('сервер не запустился: ' + logs.join('').slice(-600));
    await new Promise((r) => setTimeout(r, 150));
  }
}
const health = () => fetch(`${BASE}/health`).then((r) => r.json());

async function open(browser, url, name) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.log(`[${name}] PAGEERROR`, e.message.slice(0, 500)); page.__err = (page.__err || 0) + 1; });
  pages[name] = page;
  await page.goto(url);
  await page.waitForFunction(() => window.RYBAK && window.__frames > 3, null, { timeout: 90000 });
  // все всплывающие сообщения — в список: по ним видно, что игроку говорили, пока сервера не было
  await page.evaluate(() => {
    window.__toasts = [];
    const u = RYBAK.ui, t0 = u.toast.bind(u);
    u.toast = (text, ...rest) => { window.__toasts.push(String(text)); return t0(text, ...rest); };
    // и что приходило о составе комнаты — на случай разбора провала
    window.__net = [];
    const n = RYBAK.net, h0 = n.handle.bind(n);
    n.handle = (m) => {
      if (['joined', 'in', 'out', 'host', 'error', 'replaced', 'mode'].includes(m.t)) window.__net.push([Date.now() % 100000, m.t, m.id ?? (m.p && m.p.id) ?? m.code ?? '', m.why || m.back || m.m || m.message || '']);
      return h0(m);
    };
  });
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
/** Что игрок знает о комнате и о себе в ней. */
const view = (page) => G(page, () => {
  const g = RYBAK;
  return {
    code: g.code, id: g.me.id, slot: g.me.slot, seed: g.seed, t0: g.t0, host: g.hostId, state: g.state, open: !!g.net.open,
    friends: [...g.players.values()].map((p) => [p.id, p.slot, p.card.name, p.mode]),
    tour: g.tour ? { id: g.tour.id, kind: g.tour.kind, end: g.tour.end, scores: [...g.tour.scores.values()].map((r) => [r.id, r.s.n]) } : null
  };
});

(async () => {
  const h0 = await boot();
  assert.deepEqual([h0.rooms, h0.restored], [0, 0]);
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const a = await open(browser, `${BASE}/?${Q}`, 'А');
  await a.fill('#nm', 'Жамшид');
  await a.click('[data-a="create"]');
  await a.waitForFunction(() => RYBAK.state === 'lobby' && RYBAK.code.length === 4);
  const code = await G(a, () => RYBAK.code);
  const b = await open(browser, `${BASE}/?room=${code}&${Q}`, 'Б');
  await b.fill('#nm', 'Нори');
  await b.click('[data-a="join"]');
  await b.waitForFunction(() => RYBAK.state === 'lobby');
  await a.waitForFunction(() => RYBAK.players.size === 1);
  for (const p of [a, b]) {
    await G(p, () => { RYBAK.profile.seenIntro = true; RYBAK.enterWorld(); });
    await p.waitForFunction(() => RYBAK.state === 'world');
  }
  await a.waitForFunction(() => { const p = [...RYBAK.players.values()][0]; return p && p.mode === 'world' && p.st; }, null, { timeout: 30000 });
  await b.waitForFunction(() => { const p = [...RYBAK.players.values()][0]; return p && p.mode === 'world' && p.st; }, null, { timeout: 30000 });
  // хозяин объявляет турнир на десять минут, у гостьи — улов в зачёте
  await G(a, () => RYBAK.net.send({ t: 'tour', kind: 'sum', len: 600 }));
  await b.waitForFunction(() => RYBAK.tour && RYBAK.tour.begun, null, { timeout: 30000 });
  await b.waitForTimeout(1500); // часы страницы могут чуть спешить: улов в первый же миг сервер ещё не засчитает
  await G(b, () => RYBAK.fishing.showCatch('okun', 0.5));
  await a.waitForFunction(() => RYBAK.tour && [...RYBAK.tour.scores.values()].some((r) => r.s.n === 1), null, { timeout: 20000 });
  await b.waitForFunction(() => RYBAK.fishing.state === 'idle' || (RYBAK.fishing.state === 'landed' && RYBAK.fishing.landT > 0.5));
  await G(b, () => RYBAK.fishing.finish(false));
  const [va, vb] = [await view(a), await view(b)];
  assert.ok(va.host === va.id && vb.host === va.id && va.tour && vb.tour && va.tour.scores.length === 1, `до перезапуска: ${JSON.stringify([va, vb])}`);
  console.log(`  комната ${code}: двое на рыбалке, идёт турнир`);

  /** После перезапуска оба игрока — там же и те же: комната, места, часы, хозяин, турнир; друг снова виден и двигается. */
  const joins = (p) => G(p, () => window.__net.filter((m) => m[1] === 'joined').length);
  const same = async (what, was) => {
    for (const [i, [p, v, name]] of [[a, va, 'хозяин'], [b, vb, 'гостья']].entries()) {
      // вернулся — значит, сервер заново ответил «вы в комнате» (до того на странице лежит прежний состав комнаты) и друг снова рядом
      await p.waitForFunction((n) => RYBAK.net.open && window.__net.filter((m) => m[1] === 'joined').length > n && RYBAK.players.size === 1 && [...RYBAK.players.values()][0].mode === 'world', was[i], { timeout: 90000 });
      const now = await view(p);
      assert.deepEqual([now.code, now.id, now.slot, now.seed, now.t0, now.host, now.state], [v.code, v.id, v.slot, v.seed, v.t0, v.host, 'world'], `${what}, ${name}: та же комната, место, зерно, часы и хозяин — ${JSON.stringify(now)}`);
      assert.deepEqual(now.friends, v.friends, `${what}, ${name}: друг на месте`);
      assert.deepEqual(now.tour, v.tour, `${what}, ${name}: турнир и зачёт те же`);
      assert.ok(!p.__err, `${what}, ${name}: ошибок на странице нет`);
    }
    // связь работает в обе стороны: положения, чат, события
    // сначала дожидаемся первого положения друга после возвращения: без него сравнивать не с чем
    await b.waitForFunction(() => { const st = [...RYBAK.players.values()][0].st; return st && Number.isFinite(st[0]); }, null, { timeout: 20000 });
    const x0 = await G(b, () => [...RYBAK.players.values()][0].st[0]);
    await G(a, () => { const pl = RYBAK.player; pl.place(pl.x + 1.5, pl.z, pl.yaw); });
    await b.waitForFunction((x) => { const st = [...RYBAK.players.values()][0].st; return st && Math.abs(st[0] - x) > 1; }, x0, { timeout: 20000 });
    const stamp = what + ' ' + Date.now();
    await G(b, (text) => RYBAK.net.send({ t: 'chat', text }), stamp);
    await a.waitForFunction((text) => document.querySelector('#feed').textContent.includes(text), stamp, { timeout: 20000 });
  };

  // ───── выкладка: сервер останавливают вежливо ─────
  for (const p of [a, b]) await G(p, () => { window.__toasts.length = 0; });
  let was = [await joins(a), await joins(b)];
  server.kill('SIGTERM');
  const how1 = await server.exited;
  assert.ok(how1 === 0 || how1 === 'SIGTERM', `сервер остановился сам: ${how1}`);
  assert.match(logs.join(''), /SIGTERM: записываю комнаты и останавливаюсь/);
  await a.waitForFunction(() => !RYBAK.net.open && window.__toasts.some((t) => /Сервер обновляется/.test(t)), null, { timeout: 20000 });
  await b.waitForFunction(() => !RYBAK.net.open && window.__toasts.some((t) => /Сервер обновляется/.test(t)), null, { timeout: 20000 });
  await a.waitForTimeout(3000); // сервера нет несколько секунд: игроки остаются в бухте и рыбачат дальше
  assert.deepEqual([await G(a, () => RYBAK.state), await G(b, () => RYBAK.state)], ['world', 'world']);
  const h1 = await boot();
  assert.ok(h1.rooms === 0 || h1.restored === 1, `новый сервер начинает с пустой памяти: ${JSON.stringify(h1)}`);
  await same('после выкладки', was);
  const h1b = await health();
  assert.deepEqual([h1b.rooms, h1b.players, h1b.restored], [1, 2, 1], `комната поднята из базы один раз: ${JSON.stringify(h1b)}`);
  for (const p of [a, b]) {
    const t = await G(p, () => window.__toasts.slice());
    assert.ok(t.some((x) => /Связь вернулась/.test(x)), `игроку сказали, что связь вернулась: ${JSON.stringify(t)}`);
    assert.ok(!t.some((x) => /Комната закрылась|Сервер не отвечает/.test(x)), `и не выгоняли в меню: ${JSON.stringify(t)}`);
    assert.ok(t.filter((x) => /Сервер обновляется|Сервер ещё запускается/.test(x)).length <= 3, `о перезапуске говорили, но не на каждую попытку: ${JSON.stringify(t)}`);
  }
  await shot(a, 'r01-after-deploy', 300);
  console.log('  выкладка (SIGTERM): оба вернулись в ту же комнату сами — места, часы, хозяин и турнир на месте');

  // ───── падение: сервер убит без предупреждения ─────
  await a.waitForTimeout(2600); // даём последним переменам уйти в базу: запись — не позже чем через две секунды
  for (const p of [a, b]) await G(p, () => { window.__toasts.length = 0; });
  was = [await joins(a), await joins(b)];
  server.kill('SIGKILL');
  assert.equal(await server.exited, 'SIGKILL');
  await a.waitForFunction(() => !RYBAK.net.open && window.__toasts.some((t) => /Связь пропала/.test(t)), null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  await boot();
  await same('после падения', was);
  const h2 = await health();
  assert.deepEqual([h2.rooms, h2.players, h2.restored], [1, 2, 1], JSON.stringify(h2));
  console.log('  падение (SIGKILL): то же самое — комната в базе не старше пары секунд');

  // ───── гостья перезагружает страницу уже после перезапуска: место её ждёт ─────
  // (страницу открываем заново по той же ссылке с параметрами проверки: в адресе после входа остаётся только комната)
  await b.goto(`${BASE}/?room=${code}&${Q}`);
  await b.waitForFunction(() => window.RYBAK && window.__frames > 3, null, { timeout: 90000 });
  assert.equal(await b.inputValue('#nm'), 'Нори', 'имя помнится');
  await b.click('[data-a="join"]');
  await b.waitForFunction(() => RYBAK.state === 'lobby' && RYBAK.net.room);
  const vb2 = await view(b);
  assert.deepEqual([vb2.code, vb2.id, vb2.slot, vb2.host], [vb.code, vb.id, vb.slot, va.id], `после перезагрузки страницы — то же место: ${JSON.stringify(vb2)}`);
  assert.ok(vb2.tour && vb2.tour.id === va.tour.id, 'и турнир виден');
  console.log('  перезагрузка страницы после перезапуска: место то же');

  // ───── все ушли: комната ждёт четверть часа и в базе; сервер перезапустили — по ссылке она находится ─────
  await G(a, () => RYBAK.net.send({ t: 'tour', a: 'stop' }));
  await b.waitForFunction(() => !RYBAK.tour, null, { timeout: 20000 });
  // первой уходит гостья: уйди первым хозяин — комната успела бы перейти к ней, и ждали бы после перезапуска уже её
  await b.close();
  await a.close();
  await new Promise((r) => setTimeout(r, 2600));
  server.kill('SIGTERM');
  await server.exited;
  await boot();
  const c = await open(browser, `${BASE}/?room=${code}&${Q}`, 'В');
  assert.match(await c.textContent('.tcard .btn.pri'), new RegExp(code), 'по ссылке-приглашению комнату видно и после перезапуска');
  await c.fill('#nm', 'Пип');
  await c.click('[data-a="join"]');
  await c.waitForFunction(() => RYBAK.state === 'lobby' && RYBAK.net.room);
  const vc = await view(c);
  assert.deepEqual([vc.code, vc.seed, vc.t0, vc.tour], [code, va.seed, va.t0, null], `новый гость попадает в ту же комнату: ${JSON.stringify(vc)}`);
  assert.equal(vc.host, va.id, 'прежнего хозяина полминуты ждут…');
  await c.waitForFunction(() => RYBAK.hostId === RYBAK.me.id, null, { timeout: 60000 });
  console.log('  пустая комната после перезапуска: по ссылке находится; прежний хозяин не вернулся — комната переходит гостю');

  await browser.close();
  server.kill('SIGTERM');
  await server.exited;
  fs.rmSync(dbDir, { recursive: true, force: true });
  console.log('ПЕРЕЗАПУСК СЕРВЕРА: всё в порядке');
})().catch((e) => {
  console.error('ПРОВАЛ:', e.message.split('\n').slice(0, 8).join('\n'), '\n', (e.stack || '').split('\n').filter((l) => l.includes('restart.cjs')).slice(0, 3).join('\n'));
  console.error('журнал сервера:\n' + logs.join('').split('\n').slice(-12).join('\n'));
  const dump = async () => {
    for (const [name, p] of Object.entries(pages)) {
      const d = await p.evaluate(() => ({ net: window.__net, toasts: window.__toasts, state: RYBAK.state, players: RYBAK.players.size })).catch((e2) => String(e2.message).slice(0, 80));
      console.error(name + ':', JSON.stringify(d));
      await p.screenshot({ path: `${out}/fail-${name}.png` }).catch(() => {});
    }
  };
  dump().finally(() => {
    if (server) server.kill('SIGKILL');
    process.exit(1);
  });
});
