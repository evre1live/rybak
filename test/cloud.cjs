// Сохранение на сервере и таблица рекордов в настоящем браузере: два «устройства» с одним кодом, расхождение, таблица.
// Проверка сама поднимает себе два сервера: один с чистой базой в памяти (PORT + 10), другой без базы (PORT + 11).
// Запуск: PORT=3111 node test/cloud.cjs [папка для снимков]
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const out = process.argv[2] || '/tmp/rybak-cloud';
fs.mkdirSync(out, { recursive: true });
const PORT = +(process.env.PORT || 3111) + 10;
const BASE = `http://127.0.0.1:${PORT}`;
/** Поднять сервер игры на порту и дождаться, пока он ответит (и, если просили базу, пока она заведётся). */
async function serve(port, db) {
  const srv = spawn(process.execPath, ['server/index.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: String(port), RYBAK_DB: db ? 'memory' : '', DATABASE_URL: '' }, stdio: 'ignore' });
  for (let i = 0; i < 150; i++) {
    const st = await fetch(`http://127.0.0.1:${port}/api/status`).then((r) => r.json(), () => null);
    if (st && st.ok && st.db === db) return srv;
    await new Promise((r) => setTimeout(r, 200));
  }
  srv.kill();
  throw new Error(`сервер на порту ${port} не поднялся`);
}
const servers = [];
process.on('exit', () => servers.forEach((s) => s.kill()));
const G = (page, fn, arg) => page.evaluate(fn, arg);

async function shot(page, file, wait = 300) {
  await page.waitForTimeout(wait);
  const before = await page.evaluate(() => { window.__render = true; return window.__rendered || 0; });
  await page.waitForFunction((b) => (window.__rendered || 0) > b, before, { timeout: 120000 });
  await page.screenshot({ path: `${out}/${file}.png` });
  console.log('  снимок', file);
}
/** Открыть игру на «устройстве» (отдельное хранилище браузера). */
async function device(browser, tag, base = BASE) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  page.tag = tag;
  page.on('pageerror', (e) => { console.log(`[${tag}] PAGEERROR`, e.message.slice(0, 400)); page.__err = (page.__err || 0) + 1; });
  await page.goto(`${base}/?q=low&norender&ts=3&h=13`);
  await booted(page);
  return page;
}
const booted = (page) => page.waitForFunction(() => window.RYBAK && window.__frames > 3 && RYBAK.state === 'title' && !window.__old, null, { timeout: 90000 });
/** Сделать то, после чего игра должна открыться заново, и дождаться новой страницы. */
async function reopened(page, fn) {
  await page.evaluate(() => { window.__old = true; });
  await fn();
  await booted(page);
}
/** Дождаться, пока прогресс на устройстве станет таким же, как на другом, — без перезапуска страницы. */
async function same(page, other, what) {
  const want = await prof(other);
  await page.evaluate(() => { window.__same = true; });
  await page.waitForFunction((w) => { const p = RYBAK.profile; return p.xp === w.xp && p.stats.caught === w.caught && Object.keys(p.journal).sort().join() === w.species; }, want, { timeout: 30000 }).catch(async () => assert.deepEqual(await prof(page), want, what));
  assert.equal(await page.evaluate(() => window.__same), true, 'страница при этом не перезапускалась');
  assert.deepEqual(await prof(page), want, what);
}
/** С заставки — на рыбалку в одиночку. */
async function enter(page, name) {
  if (await G(page, () => RYBAK.state === 'world')) return;
  if (name) await page.fill('#nm', name);
  await G(page, () => { RYBAK.profile.seenIntro = true; });
  await page.click('[data-a="solo"]');
  await page.waitForFunction(() => RYBAK.state === 'lobby', null, { timeout: 30000 }).catch(async (e) => {
    console.log(`[${page.tag}] не вошли в лобби:`, JSON.stringify(await G(page, () => { const b = document.querySelector('[data-a="solo"]'); const r = b && b.getBoundingClientRect(); const at = r && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { state: RYBAK.state, view: RYBAK.ui.view, panel: RYBAK.ui.panel, err: (document.querySelector('#terr') || {}).textContent, nm: (document.querySelector('#nm') || {}).value, solo: RYBAK.solo, btn: !!b, rect: r && [r.left, r.top, r.width, r.height].map(Math.round), at: at && (at.tagName + '.' + at.className + '#' + at.id), screenKids: document.querySelector('#screen').children.length, titles: document.querySelectorAll('.title').length }; })));
    await page.screenshot({ path: `${out}/fail-${page.tag}.png` });
    throw e;
  });
  await G(page, () => RYBAK.enterWorld());
  await page.waitForFunction(() => RYBAK.state === 'world');
  await G(page, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; });
}
/** Поймать рыбу и положить в садок — настоящим путём игры: журнал, опыт, сохранение в браузере. */
const fish = (page, sp, u = 0.5) => G(page, ({ sp, u }) => { const g = RYBAK, f = g.fishing; f.showCatch(sp, u); f.finish(false); g.ui.catchCard(null); }, { sp, u });
const cloud = (page) => G(page, () => { const c = RYBAK.cloud; return { state: c.state, rev: c.s.rev, dirty: c.s.dirty, on: c.s.on, listed: c.s.listed, pub: c.s.pub, clash: c.clash ? c.clash.sum : null, code: c.code, timer: !!c.timer, moved: c.moved() }; });
const prof = (page) => G(page, () => { const p = RYBAK.profile; return { name: p.name, xp: p.xp, caught: p.stats.caught, species: Object.keys(p.journal).sort().join(), cooler: p.cooler.length }; });
const server = async (code, base = BASE) => {
  const r = await fetch(`${base}/api/load`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code }) });
  return { http: r.status, ...(await r.json()) };
};
const synced = (page, ms = 30000) => page.waitForFunction(() => RYBAK.cloud.state === 'ok', null, { timeout: ms });
const toast = (page, re, ms = 15000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('#toasts').textContent), re.source, { timeout: ms });
const openSave = async (page) => {
  await G(page, () => RYBAK.ui.openPanel('save'));
  await page.waitForSelector('.savep');
};

(async () => {
  servers.push(await serve(PORT, true));
  const browser = await chromium.launch({ env: { ...process.env, LC_ALL: 'C.UTF-8', LANG: 'C.UTF-8' }, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

  // ───── первое устройство: новичок, первая рыба, сохранение уходит само ─────
  const a = await device(browser, 'А');
  await page_ready(a);
  let ca = await cloud(a);
  assert.match(ca.code, /^[A-Z2-9]{16}$/, 'код сохранения придуман на устройстве');
  assert.deepEqual([ca.state, ca.rev, ca.on, ca.listed], ['empty', 0, true, true], `у новичка на сервере ничего нет: ${JSON.stringify(ca)}`);
  assert.equal((await server(ca.code)).http, 404, 'пустое сохранение на сервер не уходит');
  assert.match(await a.textContent('.tfoot'), /прогресс хранится в этом браузере/);
  assert.match(await a.textContent('.tfoot'), /Рекорды/);
  await enter(a, 'Жамшид');
  await fish(a, 'karp', 0.5);
  ca = await cloud(a);
  assert.ok(ca.dirty && ca.timer && ca.moved, `после улова сохранение ждёт отправки: ${JSON.stringify(ca)}`);
  // ждём, пока уйдёт само (через 12 секунд после изменения)
  await synced(a);
  ca = await cloud(a);
  const pa = await prof(a);
  assert.deepEqual([ca.rev, ca.dirty, ca.moved], [1, false, false], JSON.stringify(ca));
  assert.match(ca.pub, /^[0-9a-f]{12}$/);
  let sv = await server(ca.code);
  assert.deepEqual([sv.http, sv.rev, sv.sum.name, sv.sum.xp, sv.sum.species], [200, 1, 'Жамшид', pa.xp, 1]);
  assert.equal(sv.save.journal.karp.n, 1);
  assert.equal(sv.save.fresh, undefined, 'служебные поля профиля на сервер не уходят');
  // страницу сворачивают — несохранённое уходит сразу
  await fish(a, 'okun', 0.4);
  await G(a, () => RYBAK.cloud.flush());
  await synced(a);
  assert.equal((await server(ca.code)).rev, 2);
  console.log('  первое устройство: код придуман, пустое не шлётся, улов ушёл на сервер сам и при сворачивании');

  // панель «Сохранение»: состояние, код скрыт, показывается по кнопке
  await openSave(a);
  assert.match(await a.textContent('#saveLine'), /в браузере и на сервере: сохранено (только что|\d+ минут)/);
  const hidden = await a.textContent('#cloudmy');
  assert.ok(hidden.includes('••••') && !hidden.includes(ca.code.slice(4, 12)), 'код по умолчанию прикрыт');
  await a.click('[data-a="cloudshow"]');
  assert.equal((await a.textContent('#cloudmy')).replace(/-/g, ''), ca.code);
  await shot(a, 'c1-save-panel');
  await a.click('[data-a="cloudshow"]');
  // настройки ведут сюда же
  await G(a, () => RYBAK.ui.openPanel('settings'));
  assert.match(await a.textContent('#saveLine'), /в браузере и на сервере/);
  await a.click('.center [data-p="save"]');
  await a.waitForSelector('.savep');
  await G(a, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; });

  // ───── второе устройство: вход по коду ─────
  const b = await device(browser, 'Б');
  const cb0 = await cloud(b);
  assert.notEqual(cb0.code, ca.code);
  await openSave(b);
  // не код, чужой код, свой же код
  await b.fill('#cloudcode', 'привет');
  await b.click('[data-a="cloudlink"]');
  await toast(b, /16 букв и цифр/);
  await b.fill('#cloudcode', 'ABCD-EFGH-JKLM-NPQR');
  await b.click('[data-a="cloudlink"]');
  await toast(b, /Под таким кодом сохранения нет/);
  await b.fill('#cloudcode', cb0.code);
  await b.click('[data-a="cloudlink"]');
  await toast(b, /код этого же устройства/);
  assert.equal(await G(b, () => RYBAK.pendingCode || null), null);
  // настоящий код: как на бумажке — с дефисами и строчными
  await b.fill('#cloudcode', ca.code.replace(/(.{4})(?=.)/g, '$1-').toLowerCase());
  await b.keyboard.press('Enter');
  await b.waitForFunction(() => /ЗАМЕНИТЬ ПРОГРЕСС: ЖАМШИД, УРОВЕНЬ \d+\?/.test(document.querySelector('[data-a="cloudlink"]').textContent), null, { timeout: 15000 });
  assert.equal(await G(b, () => RYBAK.profile.xp), 0, 'до подтверждения прогресс прежний');
  await shot(b, 'c2-link-confirm');
  // прогресс первого устройства появляется на месте, игра не перезапускается
  await b.click('[data-a="cloudlink"]');
  await same(b, a, 'по коду прогресс переехал на второе устройство');
  await synced(b);
  let cb = await cloud(b);
  assert.deepEqual([cb.code, cb.rev, cb.dirty, cb.pub], [ca.code, 2, false, ca.pub], `второе устройство ведёт то же сохранение: ${JSON.stringify(cb)}`);
  assert.equal((await b.textContent('#cloudmy')).slice(0, 4), ca.code.slice(0, 4), 'на панели — уже новый код');
  assert.equal(await b.inputValue('#cloudcode'), '');
  assert.equal(await b.locator('[data-a="cloudlink"].red').count(), 0);
  await b.click('.savep .btn.pri');
  await b.click('.center [data-a="close"]');
  assert.equal(await b.inputValue('#nm'), 'Жамшид');
  assert.match(await b.textContent('#saveNote'), /в браузере и на сервере/);
  console.log('  второе устройство: плохой, чужой и свой код отклонены; по настоящему коду прогресс переехал после подтверждения');

  // ───── играли на втором — первое подхватывает само ─────
  await enter(b);
  await fish(b, 'plotva', 0.6);
  await G(b, () => RYBAK.cloud.flush());
  await synced(b);
  assert.equal((await cloud(b)).rev, 3);
  // на первом за это время ничего не делали, но игра сама что-то записала при входе (как задания дня) — это не «играл»
  await G(a, () => { RYBAK.profile.seenIntro = true; RYBAK.cloud.touch(); });
  assert.deepEqual(await G(a, () => [RYBAK.cloud.s.dirty, RYBAK.cloud.moved()]), [true, false]);
  await G(a, () => RYBAK.cloud.check());
  await same(a, b, 'первое устройство само взяло сохранение со второго');
  await synced(a);
  await toast(a, /Прогресс обновлён — вы играли на другом устройстве: Жамшид, уровень \d+/);
  assert.equal(await G(a, () => RYBAK.state), 'world', 'рыбалка при этом не прерывается');
  ca = await cloud(a);
  assert.deepEqual([ca.rev, ca.dirty, ca.clash], [3, false, null]);
  console.log('  первое устройство само взяло то, что наиграли на втором (служебная запись при входе выбором не обернулась)');

  // ───── играли на обоих, не сверяясь: выбор за игроком ─────
  await enter(a);
  await enter(b);
  await fish(b, 'karas', 0.7);
  await G(b, () => RYBAK.cloud.flush());
  await synced(b);
  await fish(a, 'bychok', 0.5);
  await G(a, () => RYBAK.cloud.push());
  await a.waitForFunction(() => RYBAK.cloud.state === 'clash', null, { timeout: 20000 });
  await toast(a, /разошлись/);
  ca = await cloud(a);
  assert.equal(ca.clash.species, 4, `в описании расхождения — что лежит на сервере: ${JSON.stringify(ca.clash)}`);
  assert.equal((await server(ca.code)).rev, 4, 'пока игрок не выбрал, на сервер ничего не пишется');
  await fish(a, 'bychok', 0.3);
  await G(a, () => RYBAK.cloud.push());
  assert.equal((await server(ca.code)).rev, 4);
  await openSave(a);
  const clashText = await a.textContent('.clash');
  assert.ok(/Сохранения разошлись/.test(clashText) && /На сервере — Жамшид: уровень \d+, 4 вида рыб, поймано 4/.test(clashText) && /На этом устройстве — уровень \d+, 4 вида рыб, поймано 5/.test(clashText), clashText);
  await shot(a, 'c3-clash');
  // «оставить с этого устройства»: на сервере теперь оно; второе устройство (не играли) подхватит само
  await a.click('[data-a="cloudmine"]');
  await toast(a, /На сервере теперь сохранение с этого устройства/);
  await synced(a);
  ca = await cloud(a);
  assert.deepEqual([ca.rev, ca.clash], [5, null]);
  sv = await server(ca.code);
  assert.equal(sv.save.journal.bychok.n, 2);
  assert.equal(sv.save.journal.karas, undefined);
  assert.equal(await a.locator('.clash').count(), 0, 'выбор сделан — блок расхождения убран');
  await G(a, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; });
  await G(b, () => RYBAK.cloud.check());
  await same(b, a, 'второе устройство взяло то, что игрок оставил с первого');
  await synced(b);
  // и наоборот: «взять с сервера»
  await enter(b);
  await fish(b, 'stavrida', 0.5);
  await G(b, () => RYBAK.cloud.flush());
  await synced(b);
  await fish(a, 'okun', 0.9);
  await G(a, () => RYBAK.cloud.push());
  await a.waitForFunction(() => RYBAK.cloud.state === 'clash', null, { timeout: 20000 });
  await G(a, () => { RYBAK.ui.closePanel(); RYBAK.leaveRoom(); });
  await a.waitForFunction(() => RYBAK.state === 'title');
  assert.match(await a.textContent('#saveNote'), /сохранения разошлись/, 'на заставке — ссылка на выбор');
  await a.click('#saveNote a');
  await a.waitForSelector('.savep .clash');
  await a.click('[data-a="cloudserver"]');
  await same(a, b, '«взять с сервера»');
  await synced(a);
  assert.equal(await a.locator('.clash').count(), 0);
  await a.click('.savep .btn.pri');
  await a.click('.center [data-a="close"]');
  assert.equal((await cloud(a)).rev, 6);
  console.log('  расхождение: запись на сервер остановлена, игрок выбрал — «с этого устройства» и «с сервера» работают');

  // ───── связь пропала и вернулась ─────
  await enter(a);
  await a.context().setOffline(true);
  await fish(a, 'kefal', 0.5);
  await G(a, () => RYBAK.cloud.push());
  assert.equal((await cloud(a)).state, 'net');
  await openSave(a);
  assert.match(await a.textContent('#saveLine'), /С сервером нет связи — отправим, как появится/);
  await G(a, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; });
  await a.context().setOffline(false);
  await synced(a, 40000);
  assert.equal((await server(ca.code)).save.journal.kefal.n, 1, 'как только связь вернулась, сохранение дошло само');
  console.log('  без связи: прогресс остаётся в браузере и уходит на сервер, когда связь вернулась');

  // ───── таблица рекордов ─────
  const c = await device(browser, 'В');
  await enter(c, 'Нори');
  await fish(c, 'karp', 0.95);
  await fish(c, 'okun', 0.2);
  await G(c, () => RYBAK.cloud.flush());
  await synced(c);
  const pubC = (await cloud(c)).pub;
  // открытие таблицы отправляет несохранённое сразу — и один раз: отложенная отправка того же самого отменяется
  {
    await fish(c, 'karas', 0.3);
    const c0 = await cloud(c);
    assert.ok(c0.dirty && c0.timer, `после улова сохранение ждёт своей очереди: ${JSON.stringify(c0)}`);
    await G(c, () => RYBAK.ui.openPanel('top'));
    await c.waitForFunction((r) => RYBAK.cloud.s.rev === r + 1 && !RYBAK.cloud.s.dirty, c0.rev, { timeout: 20000 });
    assert.equal((await cloud(c)).timer, false, 'отложенная отправка отменена');
    await c.waitForTimeout(13500);
    assert.equal((await cloud(c)).rev, c0.rev + 1, 'сохранение ушло один раз');
    await G(c, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; });
  }
  await G(a, () => RYBAK.ui.openPanel('pause'));
  await a.click('.center [data-p="top"]');
  await a.waitForSelector('.ttable .trow.me', { timeout: 20000 });
  const rowsA = await a.$$eval('.ttable .trow:not(.hd)', (els) => els.map((e) => ({ name: e.querySelector('.nm').childNodes[0].textContent.trim(), me: e.classList.contains('me') && !!e.querySelector('em') })));
  assert.deepEqual(rowsA.slice().sort((x, y) => x.name.localeCompare(y.name)), [{ name: 'Жамшид', me: true }, { name: 'Нори', me: false }], JSON.stringify(rowsA));
  assert.match(await a.textContent('.tophead .cnt'), /^2 рыбака$/);
  await shot(a, 'c4-top-anglers');
  await a.click('[data-a="toptab"][data-id="records"]');
  const rec = await a.$$eval('.ttable.rec .trow:not(.hd)', (els) => els.map((e) => ({ name: e.querySelector('.nm').textContent, w: e.querySelector('.w').textContent, who: e.querySelector('.who').textContent.trim(), me: e.classList.contains('me'), my: e.querySelector('.my').textContent })));
  assert.equal(rec.length, 43, 'в таблице — все виды рыбы, со всех локаций');
  const karp = rec.find((r) => r.name === 'Карп');
  assert.ok(karp && /Нори/.test(karp.who) && !karp.me && karp.my !== '—', `рекорд по карпу — у Нори, свой вес показан рядом: ${JSON.stringify(karp)}`);
  const okun = rec.find((r) => r.name === 'Окунь');
  assert.ok(okun && /Жамшид\s*вы/.test(okun.who) && okun.me, JSON.stringify(okun));
  assert.ok(rec.some((r) => r.name === '???' && r.who === 'ещё никто не поймал'), 'рыба, которую игрок не ловил, названа «???»');
  await shot(a, 'c5-top-records');
  await a.keyboard.press('Escape');
  // скрылся из таблицы
  await openSave(a);
  await a.click('[data-a="cloudlisted"]');
  await a.waitForFunction(() => RYBAK.cloud.s.listed === false && RYBAK.cloud.state === 'ok', null, { timeout: 20000 });
  assert.equal(await a.locator('.tog.on[data-a="cloudlisted"]').count(), 0);
  await G(c, () => RYBAK.ui.openPanel('top'));
  await c.waitForSelector('.ttable .trow.me', { timeout: 20000 });
  assert.equal(await c.locator('.ttable .trow:not(.hd)').count(), 1, 'скрывшегося другие не видят');
  await G(a, () => RYBAK.ui.openPanel('top'));
  await a.waitForSelector('.ttable', { timeout: 20000 });
  assert.match(await a.textContent('.toppanel .savenote'), /вы скрыли себя/);
  assert.equal(await a.locator('.ttable .trow.me').count(), 0);
  await openSave(a);
  await a.click('[data-a="cloudlisted"]');
  await a.waitForFunction(() => RYBAK.cloud.s.listed === true && RYBAK.cloud.state === 'ok', null, { timeout: 20000 });
  console.log('  таблица: рыбаки и рекорды по видам, «вы», неизвестная рыба — «???», скрыться и вернуться');

  // ───── выключить хранение: сохранение стирается с сервера; включить — заводится снова ─────
  await a.click('[data-a="cloudtog"]');
  assert.match(await a.textContent('#cloudNote'), /Выключить и стереть сохранение с сервера\? Нажмите переключатель ещё раз/);
  assert.equal((await server(ca.code)).http, 200, 'одно нажатие ничего не стирает');
  await a.click('[data-a="cloudtog"]');
  await a.waitForFunction(() => RYBAK.cloud.state === 'off', null, { timeout: 20000 });
  assert.equal((await server(ca.code)).http, 404);
  assert.equal(await a.locator('#cloudmy').count(), 0, 'выключено — кода и входа по коду на панели нет');
  assert.match(await a.textContent('#saveLine'), /только в этом браузере: сохранение на сервере выключено/);
  await fish(a, 'kefal', 0.2).catch(() => {});
  await G(a, () => RYBAK.cloud.push());
  assert.equal((await server(ca.code)).http, 404, 'выключено — ничего не уходит');
  await a.click('[data-a="cloudtog"]');
  await synced(a);
  sv = await server(ca.code);
  assert.deepEqual([sv.http, sv.rev, sv.sum.name], [200, 1, 'Жамшид']);
  console.log('  выключение хранения стирает сохранение с сервера (со второго нажатия), включение заводит его заново');

  // ───── «начать заново»: прогресс обнуляется и на сервере — без спора ─────
  await a.click('[data-a="reset"]');
  await a.click('[data-a="reset"]');
  await G(a, () => RYBAK.cloud.push());
  await synced(a);
  sv = await server(ca.code);
  assert.deepEqual([sv.sum.xp, sv.sum.species, (await cloud(a)).clash], [0, 0, null], 'сброс прогресса ушёл на сервер без расхождения');

  // ───── сохранение из файла с меньшим опытом заменяет серверное (игрок сам так решил) ─────
  // второе устройство не играло: сброс с первого оно принимает само (хотя сохранение на сервере заводилось заново и версия там теперь меньше)
  await G(b, () => RYBAK.cloud.check());
  await same(b, a, 'сброс прогресса дошёл до второго устройства');
  await synced(b);
  assert.deepEqual([(await prof(b)).xp, (await cloud(b)).rev, (await cloud(b)).clash], [0, 2, null]);
  await enter(b);
  await fish(b, 'karp', 0.5);
  await fish(b, 'karp', 0.6);
  await G(b, () => RYBAK.cloud.flush());
  await synced(b);
  const fat = (await prof(b)).xp;
  await openSave(b);
  const small = await G(b, () => { const p = JSON.parse(JSON.stringify(RYBAK.profile)); delete p.fresh; p.xp = 7; p.coins = 777; return JSON.stringify({ kind: 'rybak-save', v: 1, at: 1, name: p.name, lvl: 1, profile: p }); });
  await b.setInputFiles('#savein', { name: 'rybak.json', mimeType: 'application/json', buffer: Buffer.from(small) });
  await b.waitForFunction(() => /ЗАМЕНИТЬ ПРОГРЕСС/.test(document.querySelector('[data-a="loadfile"]').textContent), null, { timeout: 10000 });
  await reopened(b, () => b.click('[data-a="loadfile"]'));
  assert.equal(await G(b, () => RYBAK.profile.coins), 777);
  await synced(b);
  sv = await server(ca.code);
  assert.ok(fat > 7 && sv.sum.xp === 7 && sv.save.coins === 777 && (await cloud(b)).clash === null, `файл с меньшим опытом записан на сервер: было ${fat}, стало ${sv.sum.xp}`);
  console.log('  сброс прогресса и загрузка из файла уходят на сервер как решение игрока, без расхождения');

  for (const p of [a, b, c]) assert.ok(!p.__err, `ошибки на странице (${p.tag})`);

  // ───── сервер без базы: игра работает, про сохранение сказано честно ─────
  servers.push(await serve(PORT + 1, false));
  {
    const base2 = `http://127.0.0.1:${PORT + 1}`;
    const d = await device(browser, 'Г', base2);
    await d.waitForFunction(() => RYBAK.cloud.state === 'nodb', null, { timeout: 30000 });
    await enter(d, 'Тихон');
    await fish(d, 'karp', 0.5);
    await G(d, () => RYBAK.cloud.push());
    assert.equal((await cloud(d)).state, 'nodb');
    await openSave(d);
    assert.match(await d.textContent('#saveLine'), /сервер сейчас сохранений не принимает/);
    await G(d, () => RYBAK.ui.openPanel('top'));
    await d.waitForFunction(() => /не ведёт таблицу рекордов/.test((document.querySelector('.topnote') || {}).textContent || ''), null, { timeout: 20000 });
    await shot(d, 'c6-no-db');
    assert.ok(!d.__err, 'ошибки на странице (Г)');
  }
  console.log('  сервер без базы: игра идёт, сохранение только в браузере, таблица честно говорит, что её нет');

  await browser.close();
  console.log('СОХРАНЕНИЕ НА СЕРВЕРЕ: всё в порядке');
  process.exit(0);
})().catch((e) => { console.error('ПРОВАЛ:', e.message.split('\n').slice(0, 8).join('\n'), '\n', (e.stack || '').split('\n').filter((l) => l.includes('cloud.cjs')).slice(0, 3).join('\n')); process.exit(1); });

async function page_ready(page) {
  // сервер ответил, игра узнала, хранит ли он сохранения
  await page.waitForFunction(() => RYBAK.cloud.db !== null, null, { timeout: 30000 });
}
