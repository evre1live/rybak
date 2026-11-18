// Коды в настоящем браузере (client/cheats.js). Десять нажатий подряд на «ТОРГОВЕЦ» открывают окошко ввода.
// 818181 даёт монеты, которых нет ни в одном сохранении. 424242 — клюёт только крупное. 636363 — рыба ждёт подсечки,
// не рвёт леску и вытаскивается кликами. Повторный ввод выключает код. Перезагрузка выключает всё,
// а переезд на другую локацию — нет.
// Запуск: PORT=3111 node test/cheats.cjs [папка для снимков]
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = process.argv[2] || '/tmp/rybak-cheats';
fs.mkdirSync(out, { recursive: true });
const BASE = `http://127.0.0.1:${process.env.PORT || 3111}`;
const G = (page, fn, arg) => page.evaluate(fn, arg);

async function shot(page, file, wait = 300) {
  await page.waitForTimeout(wait);
  const before = await page.evaluate(() => { window.__render = true; return window.__rendered || 0; });
  await page.waitForFunction((b) => (window.__rendered || 0) > b, before, { timeout: 120000 });
  await page.screenshot({ path: `${out}/${file}.png` });
  console.log('  снимок', file);
}
const booted = (page, state = 'title') => page.waitForFunction((st) => window.RYBAK && window.__frames > 3 && RYBAK.state === st && !window.__old, state, { timeout: 90000 });
const frames = (page, n = 2) => page.evaluate((n) => new Promise((ok) => { const f0 = window.__frames; const t = setInterval(() => { if (window.__frames >= f0 + n) { clearInterval(t); ok(); } }, 5); }), n);
/** Что лежит в сохранении браузера (туда монеты «Богатейшего» попадать не должны). */
const saved = (page) => G(page, () => JSON.parse(localStorage.getItem('rybak.profile.v1') || 'null'));
const state = (page) => G(page, () => ({ coins: RYBAK.profile.coins, on: RYBAK.cheats.list(), bonus: RYBAK.cheats.bonus }));
let FISH_BY_ID = null; // из shared/data.js (ESM) — загружается в начале проверки
const big = (sp) => { const f = FISH_BY_ID[sp]; return !!f && !!(f.giant || f.rar >= 3); };

async function enter(page, name) {
  await page.fill('#nm', name);
  await G(page, () => { RYBAK.profile.seenIntro = true; });
  await page.click('[data-a="solo"]');
  await page.waitForFunction(() => RYBAK.state === 'lobby', null, { timeout: 30000 });
  await G(page, () => RYBAK.enterWorld());
  await page.waitForFunction(() => RYBAK.state === 'world');
  await G(page, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; });
}
/** Нажать на «ТОРГОВЕЦ» n раз подряд — настоящими кликами мыши. */
async function taps(page, n) {
  const r = await page.locator('[data-a="vendor"]').boundingBox();
  for (let i = 0; i < n; i++) await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
}
/** Набрать код в окошке (шестая цифра отправляет его сама) и вернуть, что окошко ответило. */
async function code(page, c) {
  await page.focus('#cheatIn');
  await page.keyboard.type(c, { delay: 20 });
  return G(page, () => { const b = document.querySelector('#cheat'); return { cls: b.className, msg: b.querySelector('.ch-msg').textContent, on: b.querySelector('.ch-on').textContent, val: b.querySelector('#cheatIn').value }; });
}

(async () => {
  const browser = await chromium.launch({ env: { ...process.env, LC_ALL: 'C.UTF-8', LANG: 'C.UTF-8' }, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  ({ FISH_BY_ID } = await import('../shared/data.js'));
  let errors = 0;
  page.on('pageerror', (e) => { console.log('PAGEERROR', e.message.slice(0, 400)); errors++; });
  await page.goto(`${BASE}/?q=low&norender&ts=3&h=13`);
  await booted(page);
  await enter(page, 'Кодер');
  const base = (await state(page)).coins;
  assert.deepEqual((await state(page)).on, [], 'в начале кодов нет');

  // ───── окошко: десять нажатий подряд; с паузой больше полутора секунд счёт начинается заново ─────
  await G(page, () => RYBAK.ui.openPanel('sell'));
  await page.waitForSelector('[data-a="vendor"]');
  await taps(page, 5);
  await page.waitForTimeout(1700);
  await taps(page, 9);
  assert.equal(await page.$('#cheat'), null, 'пять нажатий, пауза, ещё девять — окошка нет');
  await taps(page, 1);
  await page.waitForSelector('#cheat');
  assert.equal(await G(page, () => document.activeElement && document.activeElement.id), 'cheatIn', 'поле ввода сразу в фокусе');
  assert.match(await page.textContent('#cheat .ch-msg'), /Шесть цифр/);

  // чужой код
  let r = await code(page, '123456');
  assert.match(r.cls, /bad/);
  assert.equal(r.msg, 'Такого кода нет');
  assert.equal(r.val, '', 'поле очищается после ввода');
  // буквы в поле не попадают
  await page.focus('#cheatIn');
  await page.keyboard.type('ab12');
  assert.equal(await G(page, () => document.querySelector('#cheatIn').value), '12', 'только цифры');
  await page.fill('#cheatIn', '');

  // ───── «Богатейший»: монеты есть, но ни в одно сохранение не попадают; тратятся первыми ─────
  r = await code(page, '818181');
  assert.match(r.cls, /ok/);
  assert.match(r.msg, /«Богатейший» включён/);
  assert.match(r.on, /Богатейший/);
  let s = await state(page);
  assert.equal(s.coins, base + 9999999, 'на счету +9 999 999');
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  assert.match(await page.textContent('.ptitle .coinbox'), new RegExp(fmt(base + 9999999)), 'в шапке рынка новые монеты');
  assert.equal(await page.textContent('#coins'), fmt(base + 9999999), 'и на экране игры');
  await page.waitForTimeout(700); // сохранение в браузере — через 300 мс после изменения
  assert.equal((await saved(page)).coins, base, 'в сохранении браузера монеты прежние');
  const cloudCoins = await G(page, () => RYBAK.cloud.profile().coins);
  assert.equal(cloudCoins, base, 'на сервер уходят прежние монеты');
  // покупка за монеты «Богатейшего»: удочка остаётся, сохранённые монеты не трогаются
  await G(page, () => RYBAK.buy('rod2'));
  s = await state(page);
  assert.equal(s.coins, base + 9999999 - 450);
  assert.equal(s.bonus, 9999999 - 450, 'покупка оплачена монетами «Богатейшего»');
  await page.waitForTimeout(700);
  let sv = await saved(page);
  assert.equal(sv.coins, base, 'в сохранении монеты прежние');
  assert.ok(sv.owned.rod2, 'а удочка куплена');
  // повторный ввод — выключает: остаток монет забирается
  r = await code(page, '818181');
  assert.match(r.msg, /«Богатейший» выключен/);
  s = await state(page);
  assert.deepEqual([s.coins, s.bonus, s.on], [base, 0, []], `монеты как до кода: ${JSON.stringify(s)}`);
  assert.equal(await page.textContent('#coins'), fmt(base), 'на экране игры — тоже прежние');
  assert.equal(r.on, '', 'список включённых пуст');

  // ───── все три сразу ─────
  await code(page, '818181');
  await code(page, '424242');
  r = await code(page, '636363');
  assert.match(r.msg, /«Бог Улова» включён/);
  assert.match(r.on, /Моби Дик.*Богатейший.*Бог Улова/, `включены все три: ${r.on}`);
  await shot(page, 'cheat-box');
  // Esc в поле закрывает только окошко, рынок остаётся
  await page.focus('#cheatIn');
  await page.keyboard.press('Escape');
  assert.equal(await page.$('#cheat'), null, 'Esc закрыл окошко');
  assert.equal(await G(page, () => RYBAK.ui.panel), 'sell', 'а рынок открыт');
  // окошко открывается снова и помнит, что включено; закрыли рынок — закрылось и оно
  await taps(page, 10);
  await page.waitForSelector('#cheat');
  assert.match(await page.textContent('#cheat .ch-on'), /Моби Дик.*Богатейший.*Бог Улова/);
  await G(page, () => RYBAK.ui.closePanel());
  assert.equal(await page.$('#cheat'), null, 'закрыли рынок — окошко тоже');
  await G(page, () => { RYBAK.input.locked = true; RYBAK.input.enabled = true; });

  // ───── «Моби Дик»: в любом месте клюёт только крупное, трофейного веса ─────
  const rolls = await G(page, () => {
    const f = RYBAK.fishing, res = [];
    for (let x = -60; x <= 60 && res.length < 60; x += 6) for (let z = -80; z <= 40 && res.length < 60; z += 6) { const r = f.probe(x, z); if (r) res.push(r.c); }
    return res;
  });
  assert.ok(rolls.length >= 20, `нашлась вода: ${rolls.length}`);
  for (const c of rolls) {
    assert.ok(!c.junk && big(c.sp) && c.trophy, `крупная трофейная: ${JSON.stringify(c)}`);
  }
  console.log('  «Моби Дик»:', [...new Set(rolls.map((c) => c.sp))].join(', '));

  // ───── «Бог Улова»: настоящий заброс — рыба ждёт подсечки, леска не рвётся, клики её вытаскивают ─────
  await G(page, () => { const g = RYBAK; g.player.place(0, -24.5, 0); g.player.pitch = -0.22; });
  await frames(page, 3);
  await G(page, () => { const i = RYBAK.input; i.primary = true; i.pressed.add('Primary'); });
  await page.waitForFunction(() => RYBAK.fishing.state === 'charge' && RYBAK.fishing.power > 0.7);
  await G(page, () => { RYBAK.input.primary = false; });
  await page.waitForFunction(() => RYBAK.fishing.state === 'wait', null, { timeout: 20000 });
  await G(page, () => { RYBAK.fishing.biteLeft = 0.3; RYBAK.fishing.nibbles = []; });
  await page.waitForFunction(() => RYBAK.fishing.state === 'bite', null, { timeout: 20000 });
  const win = await G(page, () => RYBAK.fishing.kit.hookWin);
  await page.waitForTimeout(Math.max(3000, win * 2000));
  assert.equal(await G(page, () => RYBAK.fishing.state), 'bite', 'рыба ждёт подсечки дольше обычного окна');
  await G(page, () => RYBAK.input.pressed.add('Primary'));
  await page.waitForFunction(() => RYBAK.fishing.state === 'fight', null, { timeout: 10000 });
  const hooked = await G(page, () => ({ ...RYBAK.fishing.catch }));
  assert.ok(!hooked.junk && big(hooked.sp) && hooked.trophy, `на крючке крупная трофейная: ${JSON.stringify(hooked)}`);
  // держим кнопку четыре секунды — гигант на стартовой удочке порвал бы леску; здесь — нет
  await G(page, () => { RYBAK.input.primary = true; });
  await page.waitForTimeout(4000);
  await G(page, () => { RYBAK.input.primary = false; });
  let fs1 = await G(page, () => ({ state: RYBAK.fishing.state, T: RYBAK.fishing.fight && RYBAK.fishing.fight.T, p: RYBAK.fishing.fight && RYBAK.fishing.fight.p }));
  assert.ok(fs1.state === 'fight' || fs1.state === 'landed', `леска цела: ${JSON.stringify(fs1)}`);
  if (fs1.state === 'fight') {
    assert.ok(fs1.T >= 0.32 && fs1.T <= 0.66, `стрелка в бирюзовой зоне: ${fs1.T}`);
    assert.equal(await page.textContent('#fstate'), 'КЛИКАЙ!');
    assert.match(await page.textContent('#ftip'), /БОГ УЛОВА/);
    await shot(page, 'cheat-fight');
    // бросили кнопку — рыба не уходит
    await page.waitForTimeout(2500);
    const fs2 = await G(page, () => ({ state: RYBAK.fishing.state, p: RYBAK.fishing.fight && RYBAK.fishing.fight.p }));
    assert.equal(fs2.state, 'fight', 'отпустили — не сошла');
    assert.ok(fs2.p >= fs1.p - 1e-6, `и назад не ушла: ${fs1.p} → ${fs2.p}`);
    // клики
    let clicks = 0;
    while ((await G(page, () => RYBAK.fishing.state)) === 'fight' && clicks < 14) {
      await G(page, () => RYBAK.input.pressed.add('Primary'));
      await frames(page, 2);
      clicks++;
    }
    await page.waitForFunction(() => RYBAK.fishing.state === 'landed', null, { timeout: 10000 });
    console.log(`  «Бог Улова»: ${hooked.sp} ${hooked.w} кг вытащен за ${clicks} кликов`);
    assert.ok(clicks <= 12, `хватило дюжины кликов: ${clicks}`);
  }
  await page.waitForTimeout(1200);
  await G(page, () => RYBAK.input.pressed.add('Primary')); // в садок
  await page.waitForFunction(() => RYBAK.fishing.state === 'idle', null, { timeout: 30000 });

  // ───── переезд на другую локацию: коды едут вместе с игроком; монеты «Богатейшего» — тоже, но не в сохранение ─────
  s = await state(page);
  await G(page, () => { RYBAK.profile.xp = Math.max(RYBAK.profile.xp, 20000); });
  await page.waitForTimeout(500);
  await G(page, () => { window.__old = true; RYBAK.startSolo('lake'); });
  await booted(page, 'lobby');
  let s2 = await state(page);
  assert.deepEqual(s2.on, ['Моби Дик', 'Богатейший', 'Бог Улова'], `после переезда коды на месте: ${JSON.stringify(s2)}`);
  assert.equal(s2.bonus, 9999999, 'и монеты «Богатейшего»');
  assert.equal(s2.coins, s.coins, 'монет столько же, сколько до переезда');
  assert.equal(await G(page, () => location.search.includes('loc=lake')), true);
  sv = await saved(page);
  assert.equal(sv.coins, s.coins - 9999999, 'в сохранении — без них');
  assert.equal(await G(page, () => sessionStorage.getItem('rybak.cheats')), null, 'передача кодов забрана');

  // ───── перезагрузка — коды выключены, монеты — из сохранения ─────
  await G(page, () => { window.__old = true; });
  await page.reload();
  await booted(page);
  s2 = await state(page);
  assert.deepEqual([s2.on, s2.bonus, s2.coins], [[], 0, s.coins - 9999999], `после перезагрузки кодов нет: ${JSON.stringify(s2)}`);
  assert.equal(await G(page, () => RYBAK.fishing.cheatKit().god || RYBAK.fishing.cheatKit().moby), false);

  assert.equal(errors, 0, 'ошибок на странице нет');
  await browser.close();
  console.log('ОК: коды');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
