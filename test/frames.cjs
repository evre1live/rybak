// Пустые кадры. У холста WebGL картинка живёт до конца кадра; смена размера холста её стирает. Если игра меняет
// разрешение после того, как кадр нарисован, на экран уходит пустой кадр — чёрная вспышка. Так и было: автоподбор
// качества менял разрешение в конце кадра, и экран время от времени мигал чёрным.
// Здесь после каждого нарисованного кадра смотрим, что лежит в холсте к моменту показа, — пока игра меняет разрешение,
// уровень отражений, ступень качества и размер окна. Пустых кадров быть не должно.
// Запуск: PORT=3111 node test/frames.cjs   (QUICK=1 — без смены ступеней качества, в несколько раз быстрее)
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const BASE = `http://127.0.0.1:${process.env.PORT || 3111}`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  // окно не меньше 720 строк: ниже 540 строк игра картинку не опускает, и в маленьком окне разрешение не меняется вовсе
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  let errors = 0;
  page.on('pageerror', (e) => { errors++; console.log('PAGEERROR', e.message.slice(0, 400)); });
  await page.goto(`${BASE}/?h=13&ts=3`);
  await page.waitForFunction(() => window.RYBAK && window.__frames > 3 && RYBAK.state === 'title' && !RYBAK.booting, null, { timeout: 300000 });
  await page.fill('#nm', 'Кадр');
  await page.evaluate(() => { RYBAK.profile.seenIntro = true; });
  await page.click('[data-a="solo"]');
  await page.waitForFunction(() => RYBAK.state === 'lobby', null, { timeout: 60000 });
  await page.evaluate(() => RYBAK.enterWorld());
  await page.waitForFunction(() => RYBAK.state === 'world', null, { timeout: 60000 });

  // наблюдатель: после каждого нарисованного кадра — девять точек того, что уйдёт на экран
  await page.evaluate(() => {
    const g = RYBAK, gl = g.gfx.renderer.getContext();
    const px = new Uint8Array(4);
    const W = (window.__watch = { blanks: [], seen: 0, phase: 'начало', after: null, inside: null });
    const blank = () => {
      const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      let sum = 0;
      for (const fx of [0.2, 0.5, 0.8]) for (const fy of [0.2, 0.5, 0.8]) { gl.readPixels(Math.floor(w * fx), Math.floor(h * fy), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); sum += px[0] + px[1] + px[2] + px[3]; }
      return sum === 0;
    };
    const frame = Object.getPrototypeOf(g).frame;
    g.frame = function (t) {
      const r0 = window.__rendered || 0;
      frame.call(this, t);
      if (W.after) { const f = W.after; W.after = null; f(this); } // то, что игра делает в самом конце своего кадра
      if ((window.__rendered || 0) === r0) return; // в этом кадре игра не рисовала
      W.seen++;
      if (blank()) W.blanks.push({ phase: W.phase, frame: W.seen, size: gl.drawingBufferWidth + '×' + gl.drawingBufferHeight });
    };
    // «внутри кадра, после отрисовки»: для проверки страховки
    const end = g.input.endFrame;
    g.input.endFrame = function () { if (W.inside) { const f = W.inside; W.inside = null; f(g); } return end.apply(this, arguments); };
    g.realTune = g.tune;
    g.tune = () => {}; // настоящий автоподбор пока молчит: шаги делаем сами, в известном порядке
  });
  const phase = (name) => page.evaluate((name) => { window.__watch.phase = name; }, name);
  const frames = async (n = 2) => {
    const s0 = await page.evaluate(() => window.__watch.seen);
    await page.waitForFunction(([s0, n]) => window.__watch.seen >= s0 + n, [s0, n], { timeout: 300000 });
  };
  const state = () => page.evaluate(() => { const g = RYBAK.gfx, gl = g.renderer.getContext(); return { q: g.quality, scale: +g.scale.toFixed(2), refl: g.reflLevel, size: gl.drawingBufferWidth + '×' + gl.drawingBufferHeight, blanks: window.__watch.blanks.length, seen: window.__watch.seen }; });
  const blanks = () => page.evaluate(() => window.__watch.blanks.slice());

  await phase('обычные кадры');
  await frames(3);
  let s = await state();
  assert.equal(s.blanks, 0, `обычные кадры не пустые: ${JSON.stringify(await blanks())}`);
  console.log(`  качество «${s.q}», кадр ${s.size}: обычные кадры на месте`);

  // наблюдатель видит пустой кадр: стираем холст сами, уже после кадра игры
  await phase('наблюдатель');
  await page.evaluate(() => { window.__watch.after = (g) => { const c = g.gfx.renderer.domElement; c.width += 2; c.width -= 2; }; }); // размер тот же, а картинки уже нет
  await frames(2);
  let b = await blanks();
  assert.ok(b.length === 1 && b[0].phase === 'наблюдатель', `наблюдатель замечает стёртый холст: ${JSON.stringify(b)}`);
  await page.evaluate(() => { window.__watch.blanks.length = 0; });

  // 1) автоподбор уменьшает разрешение — своим путём: решение применяется после проверки цены двух кадров
  await phase('разрешение вниз');
  const size0 = (await state()).size;
  await page.evaluate(() => { RYBAK.gfx.setScale(1); });
  await frames(2);
  const sizeFull = (await state()).size;
  await page.evaluate(() => { RYBAK.tunePlan = { out: { scale: 0.8 }, n: 1, work: 999 }; });
  await page.waitForFunction(() => Math.abs(RYBAK.gfx.scale - 0.8) < 0.01, null, { timeout: 120000 });
  await frames(2);
  s = await state();
  assert.notEqual(s.size, sizeFull, `разрешение и правда уменьшилось: было ${sizeFull}, стало ${s.size}`);
  assert.equal(s.blanks, 0, `разрешение вниз — без пустого кадра: ${JSON.stringify(await blanks())}`);
  // 2) автоподбор поднимает разрешение — сразу, в конце кадра
  await phase('разрешение вверх');
  await page.evaluate(() => { window.__watch.after = (g) => g.applyTune({ scale: 1 }); });
  await page.waitForFunction(() => RYBAK.gfx.scale === 1, null, { timeout: 120000 });
  await frames(2);
  s = await state();
  assert.equal(s.size, sizeFull, `разрешение вернулось: ${s.size}`);
  assert.equal(s.blanks, 0, `разрешение вверх — без пустого кадра: ${JSON.stringify(await blanks())}`);
  console.log(`  разрешение ${sizeFull} → вниз → обратно (на входе было ${size0}): пустых кадров нет`);

  // 3) страховка: холст стёрли внутри кадра уже после отрисовки — игра дорисовывает кадр сама
  await phase('страховка');
  await page.evaluate(() => { window.__watch.inside = (g) => g.gfx.setScale(0.8); });
  await page.waitForFunction(() => Math.abs(RYBAK.gfx.scale - 0.8) < 0.01, null, { timeout: 120000 });
  await frames(2);
  s = await state();
  assert.equal(s.blanks, 0, `холст стёрт после отрисовки — кадр нарисован заново: ${JSON.stringify(await blanks())}`);
  await page.evaluate(() => { window.__watch.after = (g) => g.applyTune({ scale: 1 }); });
  await page.waitForFunction(() => RYBAK.gfx.scale === 1, null, { timeout: 120000 });
  console.log('  страховка: кадр, стёртый после отрисовки, рисуется заново');

  // 4) размер окна
  await phase('размер окна');
  await page.setViewportSize({ width: 1100, height: 760 });
  await frames(2);
  await page.setViewportSize({ width: 1280, height: 720 });
  await frames(2);
  assert.equal((await state()).blanks, 0, `смена размера окна — без пустого кадра: ${JSON.stringify(await blanks())}`);

  const QUICK = !!process.env.QUICK; // QUICK=1 — без смены ступеней качества: они на проверочной машине идут минут десять
  // Дальше окно поменьше: проверочная машина рисует программно, и «высокое» в большом окне идёт по кадру в несколько
  // секунд. Разрешение при этом всё ещё меняется (800×600 ↔ 720×540).
  if (!QUICK) {
    await page.setViewportSize({ width: 800, height: 600 });
    await frames(2);
  }
  // 5) ступени качества — как из настроек: шейдеры собираются в фоне, потом картинка переключается
  const tier = async (q) => {
    await phase(`качество «${q}»`);
    await page.evaluate((q) => new Promise((ok) => RYBAK.switchTier(q, ok)), q);
    await page.waitForFunction((q) => RYBAK.gfx.quality === q && !RYBAK.tierBusy, q, { timeout: 300000 });
    await frames(2);
    assert.equal((await state()).blanks, 0, `переход на «${q}» — без пустого кадра: ${JSON.stringify(await blanks())}`);
  };
  if (!QUICK) {
    await tier('medium');
    await tier('high');
  }
  s = await state();
  if (QUICK) console.log('  (быстрый прогон: ступени качества пропущены)');
  else if (s.q === 'high' && s.refl > 0) {
    // 6) отражения дешевле и совсем без них — так автоподбор облегчает «высокое» в первую очередь
    for (const level of [1, 0, 2]) {
      await phase(`отражения ${level}`);
      await page.evaluate((level) => { window.__watch.after = (g) => (level === 2 ? g.gfx.setRefl(2) : g.applyTune({ refl: level })); }, level);
      await page.waitForFunction((level) => RYBAK.gfx.reflLevel === level, level, { timeout: 120000 });
      await frames(2);
    }
    assert.equal((await state()).blanks, 0, `смена уровня отражений — без пустого кадра: ${JSON.stringify(await blanks())}`);
    // 7) и разрешение на «высоком»: у него кадр идёт через буферы, их размер меняется вместе с холстом
    await phase('разрешение на «высоком»');
    await page.evaluate(() => { RYBAK.tunePlan = { out: { scale: 0.8 }, n: 1, work: 999 }; });
    await page.waitForFunction(() => Math.abs(RYBAK.gfx.scale - 0.8) < 0.01, null, { timeout: 120000 });
    await frames(2);
    await page.evaluate(() => { window.__watch.after = (g) => g.applyTune({ scale: 1 }); });
    await page.waitForFunction(() => RYBAK.gfx.scale === 1, null, { timeout: 120000 });
    await frames(2);
    assert.equal((await state()).blanks, 0, `разрешение на «высоком» — без пустого кадра: ${JSON.stringify(await blanks())}`);
    // 8) автоподбор опускает ступень: «высокое» → «среднее»
    await phase('ступень ниже');
    await page.evaluate(() => { window.__watch.after = (g) => g.applyTune({ drop: true }); });
    await page.waitForFunction(() => RYBAK.gfx.quality === 'medium' && !RYBAK.tierBusy, null, { timeout: 300000 });
    await frames(2);
    assert.equal((await state()).blanks, 0, `ступень ниже — без пустого кадра: ${JSON.stringify(await blanks())}`);
    console.log('  «высокое»: отражения 2 → 1 → 0 → 2, разрешение вниз и вверх, ступень ниже — пустых кадров нет');
  } else console.log('  (буферов «высокого» у этой видеокарты нет — его шаги пропущены)');
  if (!QUICK) await tier('low');

  // 9) решает сам автоподбор: ему подсказываем только времена кадров (проверочная машина рисует программно, её кадры
  // он за обычный ход не считает). 30 мс на кадр — тяжело: разрешение вниз, своим путём, с проверкой цены двух кадров;
  // 10 мс — легко: через шестнадцать спокойных полусекунд разрешение идёт вверх.
  await page.setViewportSize({ width: 1280, height: 720 }); // «низкое» рисуется быстро и в большом окне, а шаги разрешения в нём настоящие
  await frames(2);
  await phase('автоподбор сам');
  await page.evaluate(() => {
    const g = RYBAK, W = window.__watch;
    g.gfx.setScale(1);
    Object.assign(g.tuner, { hold: 0, bad: 0, good: 0 });
    g.tuneAcc = null;
    W.feed = { ms: 30, done: () => g.gfx.scale < 0.99 }; // тяжело — пока разрешение не опустится (дальше не давим: иначе он уйдёт до самого низа)
    const after = () => {
      // подсказываем, пока он не принял решение; принятое решение игра доводит сама
      for (let i = 0; i < 60 && W.feed && !W.feed.done() && !g.tunePlan && !g.scaleNext; i++) g.realTune.call(g, W.feed.ms);
      W.after = after;
    };
    W.after = after;
  });
  await page.waitForFunction(() => RYBAK.gfx.scale < 0.99, null, { timeout: 180000 });
  await frames(2);
  const low = await state();
  assert.equal(low.blanks, 0, `автоподбор сам опустил разрешение — без пустого кадра: ${JSON.stringify(await blanks())}`);
  await page.evaluate((k) => { const g = RYBAK; window.__watch.feed = { ms: 10, done: () => g.gfx.scale > k + 0.01 }; }, low.scale);
  await page.waitForFunction((k) => RYBAK.gfx.scale > k + 0.01, low.scale, { timeout: 180000 });
  await frames(2);
  s = await state();
  await page.evaluate(() => { window.__watch.feed = null; window.__watch.after = null; });
  assert.equal(s.blanks, 0, `автоподбор сам поднял разрешение — без пустого кадра: ${JSON.stringify(await blanks())}`);
  console.log(`  автоподбор сам: тяжёлые кадры — разрешение ${Math.round(low.scale * 100)} %, лёгкие — снова ${Math.round(s.scale * 100)} %, пустых кадров нет`);

  assert.equal(errors, 0, 'ошибок на странице нет');
  console.log(`  всего нарисовано кадров под наблюдением: ${s.seen}`);
  await browser.close();
  console.log('ПУСТЫЕ КАДРЫ: ни одного');
})().catch((e) => { console.error('ПРОВАЛ:', e.message.split('\n').slice(0, 8).join('\n'), '\n', (e.stack || '').split('\n').filter((l) => l.includes('frames.cjs')).slice(0, 3).join('\n')); process.exit(1); });
