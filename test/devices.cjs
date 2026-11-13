// Проверка в настоящем браузере: телефон (сенсорное управление), страница без захвата мыши, пробная версия без сервера.
// Запуск: PORT=3111 node test/devices.cjs [папка для снимков]
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = process.argv[2] || '/tmp/rybak-shots';
fs.mkdirSync(out, { recursive: true });
const BASE = `http://127.0.0.1:${process.env.PORT || 3111}`;
const G = (page, fn, arg) => page.evaluate(fn, arg);

async function open(ctx, query, name) {
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log(`[${name}] console.error`, m.text().slice(0, 300)); });
  page.on('pageerror', (e) => { console.log(`[${name}] PAGEERROR`, e.message.slice(0, 500)); page.__err = (page.__err || 0) + 1; });
  await page.goto(`${BASE}/?${query}`);
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
/** В бухту в одиночку, минуя подсказку первого запуска. */
async function toWorld(page, tap) {
  await page.fill('#nm', 'Жамшид');
  await G(page, () => { RYBAK.profile.seenIntro = true; });
  await (tap ? page.tap('[data-a="solo"]') : page.click('[data-a="solo"]'));
  await page.waitForFunction(() => RYBAK.state === 'lobby');
  await (tap ? page.tap('[data-a="start"]') : page.click('[data-a="start"]'));
  await page.waitForFunction(() => RYBAK.state === 'world');
}
const atHead = (page) => G(page, () => { RYBAK.player.place(0.6, -20, 0.1); RYBAK.player.pitch = -0.15; });

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

  // ───── телефон, экран на боку ─────
  {
    const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await open(ctx, 'q=low&norender&ts=3&h=13', 'phone');
    const cdp = await ctx.newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id: id || 1 })) });
    const mid = async (sel) => { const b = await page.locator(sel).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
    const vis = (sel) => G(page, (s) => { const e = document.querySelector(s); return !!e && !e.closest('.hidden') && e.getClientRects().length > 0; }, sel);
    assert.ok(await G(page, () => RYBAK.input.touch.on), 'сенсорный режим включён');
    assert.equal(await vis('#touch'), false, 'в меню кнопок управления нет');
    // меню умещается на экране телефона
    const card = await page.locator('.tcard').boundingBox();
    assert.ok(card.y >= 0 && card.y + card.height <= 390, `меню умещается по высоте: ${Math.round(card.y)}…${Math.round(card.y + card.height)}`);
    await shot(page, 'd01-phone-title');
    await toWorld(page, true);
    await page.waitForFunction(() => !document.querySelector('#touch').classList.contains('hidden'));
    await atHead(page);
    assert.equal(await page.textContent('#tAct'), 'ЗАБРОС');
    assert.equal(await vis('#tR'), false);
    assert.equal(await vis('#hints'), false, 'подсказок с клавишами на телефоне нет');
    // кнопки не наезжают друг на друга и на панель снастей
    const boxes = {};
    for (const s of ['#stick', '#tAct', '#tSit', '#tMenu', '#hotbar', '.mapbox']) boxes[s] = await page.locator(s).boundingBox();
    const hit = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
    const names = Object.keys(boxes);
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) assert.ok(!hit(boxes[names[i]], boxes[names[j]]), `${names[i]} и ${names[j]} не пересекаются`);
    await shot(page, 'd02-phone-world', 300);

    // джойстик: идём назад по пирсу
    const z0 = await G(page, () => RYBAK.player.z);
    const [sx, sy] = await mid('#stick');
    await touch('touchStart', [[sx, sy]]);
    await touch('touchMove', [[sx, sy + 40]]);
    await page.waitForFunction((z) => RYBAK.player.z > z + 0.5, z0, { timeout: 30000 });
    await touch('touchEnd', []);
    assert.equal(await G(page, () => RYBAK.input.touch.mz), 0, 'джойстик отпущен');
    // джойстик до упора вперёд — бег; чуть отвели — шаг
    await touch('touchStart', [[sx, sy]]);
    await touch('touchMove', [[sx, sy - 20]]);
    await page.waitForFunction(() => RYBAK.input.touch.mz > 0.2);
    assert.equal(await G(page, () => RYBAK.input.touch.run), false, 'джойстик отведён слегка — шаг');
    await touch('touchMove', [[sx, sy - 90]]);
    await page.waitForFunction(() => RYBAK.input.touch.run && RYBAK.input.sprint && document.querySelector('#stick').classList.contains('run'), null, { timeout: 10000 });
    await touch('touchEnd', []);
    await page.waitForFunction(() => !RYBAK.input.touch.run && !RYBAK.input.sprint && !document.querySelector('#stick').classList.contains('run'), null, { timeout: 10000 }); // отпустили — бег выключился
    // палец по экрану — поворот
    await atHead(page);
    const yaw0 = await G(page, () => RYBAK.player.yaw);
    await touch('touchStart', [[420, 120]]);
    await touch('touchMove', [[470, 120]]);
    await touch('touchMove', [[520, 120]]);
    await touch('touchEnd', []);
    await page.waitForFunction((y) => Math.abs(RYBAK.player.yaw - y) > 0.05, yaw0, { timeout: 30000 });

    // заброс: держим жёлтую кнопку и отпускаем
    await atHead(page);
    const [ax, ay] = await mid('#tAct');
    await touch('touchStart', [[ax, ay]]);
    await page.waitForFunction(() => RYBAK.fishing.state === 'charge', null, { timeout: 30000 });
    assert.equal(await page.textContent('#tAct'), 'ОТПУСТИ');
    assert.equal(await vis('#hotbar'), false, 'во время замаха панель снастей убрана');
    await page.waitForFunction(() => RYBAK.fishing.power > 0.5, null, { timeout: 30000 });
    await touch('touchEnd', []);
    await page.waitForFunction(() => RYBAK.fishing.state === 'wait', null, { timeout: 60000 });
    await page.waitForFunction(() => document.querySelector('#tAct').textContent === 'ЖДЁМ');
    assert.equal(await vis('#tR'), true);
    assert.equal(await page.textContent('#tR'), 'СМОТАТЬ');
    await shot(page, 'd03-phone-wait');
    // поклёвка → подсечка → вываживание: джойстик работает как руль
    await G(page, () => { RYBAK.fishing.kit.hookWin = 9; }); // время в проверке ускорено втрое — даём пальцу успеть
    await page.waitForFunction(() => RYBAK.fishing.state === 'bite' && document.querySelector('#tAct').textContent === 'ПОДСЕКАЙ', null, { timeout: 240000 });
    await touch('touchStart', [[ax, ay]]); // кнопка мигает — жмём «пальцем» напрямую, не дожидаясь, пока она замрёт
    await touch('touchEnd', []);
    await page.waitForFunction(() => RYBAK.fishing.state === 'fight', null, { timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('#tAct').textContent === 'МОТАЙ');
    assert.ok(await G(page, () => document.querySelector('#stick').classList.contains('steer')));
    await touch('touchStart', [[sx, sy]]);
    await touch('touchMove', [[sx + 40, sy]]);
    await page.waitForFunction(() => RYBAK.input.touch.mx > 0.5);
    await page.waitForTimeout(150);
    await page.waitForFunction(() => RYBAK.input.steer === 1, null, { timeout: 30000 }); // джойстик вправо — руль вправо
    await touch('touchEnd', []);
    await shot(page, 'd04-phone-fight');
    // меню поверх игры: кнопки управления прячутся, а вернувшись — снова на месте
    await G(page, () => RYBAK.fishing.reelIn(true));
    await page.waitForFunction(() => RYBAK.fishing.state === 'idle');
    await page.tap('#tMenu');
    await page.waitForFunction(() => RYBAK.ui.panel === 'pause');
    assert.equal(await vis('#touch'), false);
    await shot(page, 'd05-phone-pause');
    await G(page, () => RYBAK.ui.closePanel());
    await page.waitForFunction(() => !document.querySelector('#touch').classList.contains('hidden'));
    // лодка: у пирса появляется кнопка, джойстик ведёт лодку, кнопки «сесть» в ней нет
    await G(page, () => { RYBAK.fishing.reelIn(true); RYBAK.player.place(0.9, -12, -Math.PI / 2); });
    await page.waitForFunction(() => { const e = document.querySelector('#tE'); return e.textContent === 'ЛОДКА' && !e.classList.contains('hidden'); }, null, { timeout: 30000 });
    assert.equal(await vis('#tSit'), false, 'у лодки вместо «сесть» — кнопка лодки');
    assert.match(await page.textContent('#prompt'), /^ЛОДКА НАПРОКАТ/, 'подсказка без названия клавиши');
    await page.tap('#tE');
    await page.waitForFunction(() => RYBAK.boat.active && document.querySelector('#tE').textContent === 'НА ПИРС', null, { timeout: 30000 });
    assert.equal(await vis('#tSit'), false);
    const bz = await G(page, () => RYBAK.boat.z);
    await touch('touchStart', [[sx, sy]]);
    await touch('touchMove', [[sx, sy - 90]]);
    await page.waitForFunction((z) => RYBAK.boat.z < z - 8 && RYBAK.boat.v > 3, bz, { timeout: 30000 });
    await touch('touchEnd', []);
    await page.waitForFunction(() => document.querySelector('#tE').classList.contains('hidden'), null, { timeout: 30000 }); // отошли от пирса — причаливать некуда
    await shot(page, 'd07-phone-boat', 200);
    await G(page, () => RYBAK.goHome());
    await page.waitForFunction(() => !RYBAK.boat.active && !document.querySelector('#touch').classList.contains('hidden'));
    // панель снастей нажимается: удочка открывает снасти
    await page.tap('#hotbar .slot[data-k="rod"]');
    await page.waitForFunction(() => RYBAK.ui.panel === 'tackle');
    await shot(page, 'd06-phone-tackle');
    assert.ok(!page.__err, 'ошибки на странице (телефон)');
    await ctx.close();
    console.log('  телефон: управление пальцами работает');
  }

  // ───── телефон стоймя: просим повернуть, но играть можно ─────
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await open(ctx, 'q=low&norender&h=13', 'portrait');
    assert.equal(await G(page, () => getComputedStyle(document.querySelector('#rotate')).display), 'flex');
    await page.tap('#rotate button');
    assert.equal(await G(page, () => getComputedStyle(document.querySelector('#rotate')).display), 'none');
    await toWorld(page, true);
    await shot(page, 'd07-portrait', 300);
    assert.ok(!page.__err, 'ошибки на странице (стоймя)');
    await ctx.close();
    console.log('  телефон стоймя: подсказка повернуть, игра идёт');
  }

  // ───── браузер не даёт захватить мышь (игра встроена в чужую страницу) ─────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(() => { HTMLCanvasElement.prototype.requestPointerLock = () => Promise.reject(new Error('sandboxed')); });
    const page = await open(ctx, 'q=low&norender&ts=3&h=13', 'nolock');
    await toWorld(page, false);
    await page.waitForFunction(() => RYBAK.input.lockFails === 1, null, { timeout: 30000 });
    assert.equal(await G(page, () => RYBAK.input.free), false, 'после первой неудачи ещё просим кликнуть');
    await page.waitForTimeout(400);
    await page.mouse.click(640, 300);
    await page.waitForFunction(() => RYBAK.input.free === true, null, { timeout: 30000 });
    await atHead(page);
    // движение мыши поворачивает камеру, у края экрана она доворачивается сама
    const yaw0 = await G(page, () => RYBAK.player.yaw);
    await page.mouse.move(640, 360);
    await page.mouse.move(700, 360, { steps: 4 });
    await page.waitForFunction((y) => Math.abs(RYBAK.player.yaw - y) > 0.02, yaw0, { timeout: 30000 });
    await page.mouse.move(1275, 360, { steps: 3 });
    const yaw1 = await G(page, () => RYBAK.player.yaw);
    await page.waitForFunction((y) => Math.abs(RYBAK.player.yaw - y) > 0.15, yaw1, { timeout: 30000 });
    // заброс мышью без захвата
    await page.mouse.move(640, 360);
    await atHead(page);
    await page.mouse.down();
    await page.waitForFunction(() => RYBAK.fishing.state === 'charge' && RYBAK.fishing.power > 0.5, null, { timeout: 30000 });
    await page.mouse.up();
    await page.waitForFunction(() => RYBAK.fishing.state === 'wait', null, { timeout: 60000 });
    // Esc открывает паузу
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => RYBAK.ui.panel === 'pause');
    assert.ok(!page.__err, 'ошибки на странице (без захвата мыши)');
    await ctx.close();
    console.log('  без захвата мыши: камера, заброс и пауза работают');
  }

  // ───── пробная версия одним файлом под строгой политикой загрузки (так страницу держит рамка без сети) ─────
  {
    const { execFileSync } = require('node:child_process');
    const http = require('node:http');
    const path = require('node:path');
    const os = require('node:os');
    const file = path.join(os.tmpdir(), `rybak-solo-${process.pid}.html`);
    execFileSync(process.execPath, [path.join(__dirname, '..', 'tools', 'artifact.js'), file]);
    const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; worker-src blob:; connect-src 'none'";
    const srv = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': CSP });
      res.end(fs.readFileSync(file));
    });
    await new Promise((r) => srv.listen(0, '127.0.0.1', r));
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(() => {
      window.__csp = [];
      document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`.slice(0, 120)));
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => { console.log('[solo-file] PAGEERROR', e.message.slice(0, 500)); page.__err = (page.__err || 0) + 1; });
    await page.goto(`http://127.0.0.1:${srv.address().port}/?q=low&norender&ts=3&h=13`);
    await page.waitForFunction(() => window.RYBAK && window.__frames > 3, null, { timeout: 60000 });
    await G(page, () => document.fonts.ready);
    assert.ok(await G(page, () => document.fonts.check('italic 900 20px "Sofia X"', 'РЫБАК') && document.fonts.check('400 16px "Onest"', 'Имя')), 'шрифты загрузились из самой страницы');
    assert.equal(await page.locator('[data-a="create"]').count(), 0);
    assert.equal(await page.locator('#code').count(), 0);
    assert.match(await page.textContent('.tcard .note'), /Пробная версия/);
    await shot(page, 'd08-solo-file-title');
    await toWorld(page, false);
    assert.equal(await G(page, () => RYBAK.solo), true);
    assert.equal(await G(page, () => !!RYBAK.net.ws), false, 'к серверу не подключаемся');
    // значки снастей нарисованы и показываются
    await G(page, () => RYBAK.ui.openPanel('tackle'));
    await page.waitForSelector('.panel .grid .tile img');
    assert.ok(await G(page, () => [...document.querySelectorAll('.panel .grid .tile img')].every((i) => i.complete && i.naturalWidth > 0)), 'значки снастей видны');
    await G(page, () => RYBAK.ui.closePanel());
    // заброс
    await G(page, () => { RYBAK.input.locked = true; RYBAK.input.enabled = true; });
    await atHead(page);
    await G(page, () => { RYBAK.input.primary = true; RYBAK.input.pressed.add('Primary'); });
    await page.waitForFunction(() => RYBAK.fishing.state === 'charge' && RYBAK.fishing.power > 0.5, null, { timeout: 30000 });
    await G(page, () => { RYBAK.input.primary = false; });
    await page.waitForFunction(() => RYBAK.fishing.state === 'wait', null, { timeout: 60000 });
    // сохранение в браузере работает и здесь
    await page.waitForTimeout(600);
    assert.equal(await G(page, () => JSON.parse(localStorage.getItem('rybak.profile.v1')).name), 'Жамшид');
    assert.deepEqual(await G(page, () => window.__csp), [], 'страница ничего не тянет извне');
    assert.ok(!page.__err, 'ошибки на странице (пробная версия)');
    await ctx.close();
    srv.close();
    fs.rmSync(file, { force: true });
    console.log('  пробная версия одним файлом: без сети, шрифты и значки на месте, рыбалка идёт');
  }

  // ───── кэш игры на устройстве: первый запуск заводит его, без сети игра открывается, новая версия не качает лишнего ─────
  {
    const SW = require('node:path').join(__dirname, '..', 'public', 'sw.js');
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => { console.log('[cache] PAGEERROR', e.message.slice(0, 300)); p.__err = 1; });
    let glb = 0; // запросы самого кэша — это и есть походы в сеть: страница получает ответы от него
    ctx.on('request', (r) => { if (/\.glb/.test(r.url()) && r.serviceWorker()) glb++; });
    const ready = () => p.waitForFunction(() => window.RYBAK && window.__frames > 3, null, { timeout: 120000 });
    await p.goto(`${BASE}/?sw=2&norender&q=low`);
    await ready();
    await p.waitForFunction(() => navigator.serviceWorker.controller && RYBAK.cache && RYBAK.cache.total > 100 && RYBAK.cache.done === RYBAK.cache.total, null, { timeout: 120000 });
    const c1 = await p.evaluate(async () => ({ total: RYBAK.cache.total, keys: await caches.keys(), n: (await (await caches.open((await caches.keys())[0])).keys()).length, lite: (await (await caches.open((await caches.keys())[0])).keys()).filter((r) => /\.lite\.glb/.test(r.url)).length }));
    assert.ok(c1.keys.length === 1 && c1.n > 100 && c1.lite === 0, `кэш заведён, облегчённые модели компьютеру не качаем: ${JSON.stringify(c1)}`);
    // ответы сервера кэш страницей игры не подменяет: /health и /api/* в адресной строке остаются ответами сервера
    {
      const p2 = await ctx.newPage();
      for (const u of ['/health', '/api/status']) {
        await p2.goto(BASE + u);
        const t = await p2.evaluate(() => ({ text: document.body.innerText, game: !!window.RYBAK, sw: !!navigator.serviceWorker.controller }));
        assert.ok(t.sw && !t.game && /^\s*\{"ok":true/.test(t.text), `${u} под кэшем — ответ сервера, а не игра: ${JSON.stringify(t).slice(0, 160)}`);
      }
      await p2.close();
    }
    // без сети: страница, код и модели — из кэша; на заставке сказано, что сервер не отвечает; одиночная рыбалка идёт
    await ctx.setOffline(true);
    await p.goto(`${BASE}/?sw=2&norender&q=low`);
    await ready();
    await p.waitForFunction(() => RYBAK.serverUp === false && !document.querySelector('#srvNote').classList.contains('hidden'), null, { timeout: 20000 });
    await p.fill('#nm', 'Автоном');
    await p.evaluate(() => { RYBAK.profile.seenIntro = true; });
    await p.click('[data-a="solo"]');
    await p.waitForFunction(() => RYBAK.state === 'lobby', null, { timeout: 20000 });
    await p.evaluate(() => RYBAK.enterWorld());
    await p.waitForFunction(() => RYBAK.state === 'world');
    await p.waitForFunction(() => { const e = RYBAK.world.scenery.envState(); return e.trees && e.rocks && e.kiosk && e.lighthouse; }, null, { timeout: 60000 });
    await shot(p, 'd09-offline-world', 300);
    await ctx.setOffline(false);
    // новая версия (как после выкладки): на заставке страница перезапускается сама, неизменённые модели переходят из старого кэша
    const src = fs.readFileSync(SW, 'utf8');
    const v0 = /const VERSION = "([0-9a-f]+)"/.exec(src)[1];
    fs.writeFileSync(SW, src.replace(`"${v0}"`, '"feedfacecafe"').replace(/"\/style\.css":"[0-9a-f]+"/, '"/style.css":"000000000000"'));
    try {
      glb = 0;
      await p.goto(`${BASE}/?sw=2&norender&q=low`);
      let keys = '';
      for (let i = 0; i < 120 && keys !== 'rybak-feedfacecafe'; i++) {
        keys = await p.evaluate(async () => (await caches.keys()).join()).catch(() => '');
        await new Promise((ok) => setTimeout(ok, 500));
      }
      assert.equal(keys, 'rybak-feedfacecafe', 'старый кэш заменён новым');
      await p.waitForTimeout(1500);
      await ready();
      const n2 = await p.evaluate(async () => (await (await caches.open('rybak-feedfacecafe')).keys()).length);
      assert.ok(n2 > 100 && glb === 0, `модели перешли в новый кэш без скачивания: файлов ${n2}, скачано моделей ${glb}`);
    } finally {
      fs.writeFileSync(SW, src);
    }
    // ?nosw снимает кэш совсем
    await p.goto(`${BASE}/?nosw&norender&q=low`);
    await ready();
    await p.waitForFunction(() => navigator.serviceWorker.getRegistrations().then((r) => (window.__regs = r.length)) && window.__regs === 0, null, { timeout: 20000 });
    assert.ok(!p.__err, 'ошибки на странице (кэш на устройстве)');
    await ctx.close();
    console.log('  кэш на устройстве: заведён, без сети игра идёт, новая версия берёт модели из старого кэша');
  }

  await browser.close();
  console.log('УСТРОЙСТВА: всё в порядке');
})().catch((e) => { console.error('ПРОВАЛ:', e.message.split('\n').slice(0, 6).join('\n'), '\n', (e.stack || '').split('\n').filter((l) => l.includes('devices.cjs')).slice(0, 2).join('\n')); process.exit(1); });
