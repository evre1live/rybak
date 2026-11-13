// Проверка игры в настоящем браузере: одиночная рыбалка от заброса до покупки, все экраны, снимки.
// Запуск: PORT=3111 node test/play.cjs [папка для снимков]
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = process.argv[2] || '/tmp/rybak-shots';
fs.mkdirSync(out, { recursive: true });
const BASE = `http://127.0.0.1:${process.env.PORT || 3111}`;
const W = +(process.env.W || 1280), H = +(process.env.H || 720);

async function open(browser, query, name) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
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
const G = (page, fn, arg) => page.evaluate(fn, arg);

(async () => {
  // LC_ALL: без русской (UTF-8) локали проверочный браузер заменяет русские имена скачанных файлов на «download»
  const browser = await chromium.launch({ env: { ...process.env, LC_ALL: 'C.UTF-8', LANG: 'C.UTF-8' }, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  if (process.env.ONLY === 'progress') {
    // быстрый прогон одной части: ONLY=progress node test/play.cjs
    await progress();
    await browser.close();
    return console.log('Проверена только часть «прогресс» (ONLY=progress).');
  }
  const page = await open(browser, 'q=low&norender&ts=3&h=13', 'solo');
  await shot(page, '01-title');

  // меню: без имени нельзя
  await page.click('[data-a="solo"]');
  assert.match(await page.textContent('#terr'), /представьтесь/);
  await page.fill('#nm', 'Жамшид');
  await page.click('[data-a="solo"]');
  await page.waitForFunction(() => RYBAK.state === 'lobby');
  await shot(page, '02-lobby', 300);
  {
    // меню — по макетам от 13 ноября (этап 20): заголовки и кнопки — жирным наклонным шрифтом, панели — тёмный графит, главная кнопка — закатный градиент;
    // на карточке места — запечённый вид бухты сверху с булавкой; слева внизу — игрок с уровнем; рыбак один — таблички под ногами нет
    const st = await G(page, async () => {
      const cs = (q) => getComputedStyle(document.querySelector(q));
      const b = cs('.lcard .btn.pri'), t = cs('.nav .tab.on'), h = cs('.lcard h2');
      const img = document.querySelector('.lcard .shot');
      await img.decode().catch(() => {});
      await document.fonts.ready;
      return {
        font: b.fontFamily, style: b.fontStyle, weight: Number(b.fontWeight), bg: b.backgroundImage, tab: t.backgroundImage, h2: h.fontStyle, shot: [img.naturalWidth, img.naturalHeight],
        pin: !!document.querySelector('.shotbox .pinm svg'), palm: getComputedStyle(document.querySelector('.lob-top .logo .palm'), '::before').maskImage || getComputedStyle(document.querySelector('.lob-top .logo .palm'), '::before').webkitMaskImage,
        me: document.querySelector('.mechip .nm').textContent, lvl: document.querySelector('.mechip .lv').textContent, plates: document.querySelectorAll('.plate').length,
        loaded: document.fonts.check('italic 800 20px "Fira Sans Condensed"', 'РЫБАК'), old: [...document.fonts].filter((f) => /Sofia/.test(f.family)).length,
        glass: getComputedStyle(document.documentElement).getPropertyValue('--gfill'), card: getComputedStyle(document.querySelector('.lcard')).backgroundImage, edge: getComputedStyle(document.querySelector('.lcard')).borderTopColor, enter: document.querySelector('#screen').classList.contains('enter'), shown: RYBAK.ui.shown
      };
    });
    const coral = /rgb\(255, 46, 147\)/; // закатный градиент главных кнопок начинается с розового
    assert.ok(/Fira Sans Condensed/.test(st.font) && st.style === 'italic' && st.weight >= 800 && coral.test(st.bg) && coral.test(st.tab) && st.h2 === 'italic' && st.loaded && st.old === 0, `меню в новом стиле: ${JSON.stringify(st)}`);
    assert.ok(st.shot[0] >= 900 && st.shot[1] >= 480 && st.pin && /svg/.test(st.palm), `карточка места: вид сверху, булавка, логотип с пальмой: ${JSON.stringify(st)}`);
    assert.ok(st.me === 'Жамшид' && /^Уровень 1$/.test(st.lvl) && st.plates === 0, `плашка игрока и строй без таблички: ${JSON.stringify(st)}`);
    // стекло панелей — дымчатый графит (а не голубоватое): заливка серая, рамка прозрачная — кромку рисует слой стекла;
    // при смене экрана панели всплывают (класс enter), при перерисовке того же экрана — нет
    assert.ok(/rgba\(84, ?88, ?98/.test(st.glass) && /rgba\(84, 88, 98/.test(st.card) && /rgba\(255, 255, 255, 0\.92\)/.test(st.card) && /rgba\(0, 0, 0, 0\)|transparent/.test(st.edge) && st.shown === 'lobby',
      `стекло: ${JSON.stringify({ glass: st.glass.slice(0, 90), card: st.card.slice(-200), edge: st.edge, enter: st.enter, shown: st.shown })}`);
    await G(page, () => RYBAK.ui.showLobby());
    assert.equal(await G(page, () => RYBAK.ui.shown), 'lobby');
  }

  // лобби → снасти, журнал, редактор
  await page.click('.nav [data-p="tackle"]');
  await page.waitForSelector('.panel .grid .tile');
  await shot(page, '03-tackle');
  for (const cat of ['tackle', 'lure', 'reel', 'line', 'hook', 'float', 'bag', 'extra']) {
    await page.click(`.tabs2 [data-id="${cat}"]`);
    assert.ok((await page.locator('.grid .tile').count()) >= 2, cat);
    assert.ok((await page.textContent('.detail h2')).length > 2);
  }
  await page.keyboard.press('Escape');
  await page.click('.nav [data-p="journal"]');
  await page.waitForSelector('.jstats');
  {
    // полоса «до уровня»: её длина — доля набранного опыта (обычной шириной, а не растяжением, как у полосы вываживания).
    // У новичка опыта нет — на время проверки даём половину уровня и открываем журнал заново.
    await G(page, () => { RYBAK.profile.xp = 30; RYBAK.ui.openPanel('journal'); });
    const lv = await G(page, () => {
      const i = document.querySelector('.loadout .pbar i'), b = i.parentElement.getBoundingClientRect(), r = i.getBoundingClientRect();
      return { w: r.width, bar: b.width, set: parseFloat(i.style.width) };
    });
    await G(page, () => { RYBAK.profile.xp = 0; RYBAK.ui.openPanel('journal'); });
    assert.ok(lv.bar > 100 && lv.set === 50 && Math.abs(lv.w / lv.bar - 0.5) < 0.03, `полоса «до уровня» нарисована по своей ширине: ${JSON.stringify(lv)}`);
  }
  await shot(page, '04-journal');
  await page.keyboard.press('Escape');
  await page.click('.nav [data-p="editor"]');
  await page.waitForSelector('.editor .opts');
  await shot(page, '05-editor', 400);
  // герои: других персонажей в игре нет. Новичку достаётся один из них, на экране «Персонаж» можно выбрать любого
  const heroIds = await G(page, () => fetch('models/manifest.json').then((r) => r.json()).then((m) => m.heroes.filter((h) => !h.npc).map((h) => h.id)));
  assert.ok(heroIds.length >= 9, 'героев девять');
  assert.deepEqual(Object.keys(await G(page, () => RYBAK.profile.look)), ['hero'], 'внешность игрока — это только герой');
  assert.ok(heroIds.includes(await G(page, () => RYBAK.profile.look.hero)), 'новичок получает героя');
  assert.equal(await page.locator('.hlist button').count(), heroIds.length, 'все герои в списке');
  assert.equal(await page.locator('.cats, .olist, .sw, [data-a="preset"], [data-a="rnd"], [data-a="nohero"], [data-a="opt"], [data-a="col"]').count(), 0, 'редактора из частей больше нет');
  await page.waitForFunction(() => [...document.querySelectorAll('.hlist img')].every((i) => /^models\/icons\/hero-[a-z]+\.webp$/.test(i.getAttribute('src')) && i.complete && i.naturalWidth > 0), null, { timeout: 30000 }); // портреты — готовые картинки, модели ради них не грузятся
  // куклу из частей не видно никогда: ни пока герой грузится, ни когда он встал
  const puppetShown = () => G(page, () => {
    const c = RYBAK.meChar; if (!c.root.visible) return 0;
    const skip = new Set(); if (c.hero) c.hero.wrap.traverse((o) => skip.add(o)); c.j.rod.traverse((o) => skip.add(o));
    let n = 0; c.root.traverse((o) => { if (o.isMesh && o.visible && !skip.has(o)) n++; }); return n;
  });
  const wear = async (id) => {
    await page.click(`.hlist [data-id="${id}"]`);
    assert.equal(await puppetShown(), 0, `${id}: пока модель грузится, старой куклы не видно`);
    await page.waitForFunction((id) => RYBAK.ui.ed.look.hero === id && RYBAK.meChar.hero && RYBAK.meChar.hero.tpl.info.id === id, id, { timeout: 60000 });
    assert.equal(await puppetShown(), 0, `${id}: на экране только герой`);
    assert.ok(await G(page, () => RYBAK.meChar.hero.act.idle && RYBAK.meChar.hero.act.walk && RYBAK.meChar.hero.act.run && RYBAK.meChar.hero.bones.hR && RYBAK.meChar.j.rod.parent === RYBAK.meChar.hero.grip), `${id}: скелет, анимации, удочка в руке`);
  };
  await wear('hero-bjorn');
  assert.equal(await page.textContent('.hinfo h2'), 'Бьорн');
  assert.ok((await page.textContent('.hinfo p')).length > 10, 'строка о герое');
  assert.ok(await G(page, () => RYBAK.meChar.look.height > 1.05), 'здоровяк выше остальных');
  await shot(page, '05b-hero-bjorn', 500);
  await wear('hero-gosha');
  assert.ok(await G(page, () => RYBAK.meChar.look.height < 1), 'коротышка ниже остальных');
  await wear('hero-black');
  await shot(page, '05c-hero-black', 500);
  await wear('hero-pip');
  await shot(page, '06-hero-pip', 300);
  await page.click('[data-a="edsave"]');
  assert.deepEqual(await G(page, () => RYBAK.profile.look), { hero: 'hero-pip' });
  assert.deepEqual(await G(page, () => RYBAK.card().look), { hero: 'hero-pip' }, 'друзьям уходит только имя героя');
  assert.equal(await G(page, () => RYBAK.player.eye), 1.62);

  // на рыбалку
  await page.click('[data-a="start"]');
  await page.waitForFunction(() => RYBAK.state === 'world');
  assert.ok(await page.isVisible('.center h1'), 'первая справка');
  await shot(page, '07-help');
  await page.click('.center [data-a="close"]');
  await G(page, () => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(0, -24.5, 0); g.player.pitch = -0.22; });
  await shot(page, '08-hud-idle', 300);
  assert.ok(await G(page, () => RYBAK.fishing.aim.ok), 'прицел на воде');

  // заброс: зажать, подождать, отпустить
  await G(page, () => { const i = RYBAK.input; i.primary = true; i.pressed.add('Primary'); });
  await page.waitForFunction(() => RYBAK.fishing.state === 'charge' && RYBAK.fishing.power > 0.6);
  await shot(page, '09-charge');
  await G(page, () => { RYBAK.input.primary = false; });
  await page.waitForFunction(() => RYBAK.fishing.state === 'wait', null, { timeout: 20000 });
  assert.equal(await G(page, () => RYBAK.profile.stats.casts), 1);
  await shot(page, '10-wait');
  // во время ожидания ходить нельзя
  const z0 = await G(page, () => RYBAK.player.z);
  await page.keyboard.down('KeyS');
  await page.waitForTimeout(400);
  await page.keyboard.up('KeyS');
  assert.equal(await G(page, () => RYBAK.player.z), z0);

  // ловим до первой рыбы в садке (с ботом на вываживании)
  await G(page, () => {
    const g = RYBAK;
    window.__log = [];
    const emit = g.fishing.emit;
    g.fishing.emit = (t, d) => { window.__log.push(t); emit(t, d); };
    window.__bot = setInterval(() => {
      const f = g.fishing, i = g.input;
      if (f.state === 'idle') { i.primary = true; i.pressed.add('Primary'); }
      else if (f.state === 'charge') { if (f.power > 0.9) i.primary = false; }
      else if (f.state === 'bite') { i.pressed.add('Primary'); }
      else if (f.state === 'fight') {
        const s = f.fight; const run = s.phase === 'run';
        // в свече леску отпускаем, залёгшую рыбу отрываем натяжением у верхней границы нормы
        i.primary = s.T < (s.jumpT > 0 ? 0.45 : s.stuck ? 0.72 : run ? 0.5 : s.warned ? 0.42 : 0.64);
        i.keys.delete('KeyA'); i.keys.delete('KeyD');
        if (run && s.dir) i.keys.add(s.dir > 0 ? 'KeyA' : 'KeyD');
      } else if (f.state === 'landed') { i.primary = false; if (f.landT > 1.2 && !window.__keep) i.pressed.add('Primary'); }
      else i.primary = false;
    }, 30);
  });
  await page.waitForFunction(() => RYBAK.fishing.state === 'bite', null, { timeout: 90000 });
  await shot(page, '11-bite');
  await page.waitForFunction(() => RYBAK.fishing.state === 'fight', null, { timeout: 30000 });
  await page.waitForFunction(() => RYBAK.fishing.state !== 'fight' || RYBAK.fishing.fight.p > 0.35, null, { timeout: 60000 });
  {
    // стрелка натяжения и полоса вываживания двигаются сдвигом и растяжением — проверяем, что стоят там, где положено
    const hud = await G(page, () => new Promise((ok) => requestAnimationFrame(() => {
      const f = RYBAK.fishing.fight;
      if (!f || RYBAK.fishing.state !== 'fight') return ok(null);
      const bar = document.querySelector('.tbar').getBoundingClientRect(), ptr = document.querySelector('#tptr').getBoundingClientRect();
      const pb = document.querySelector('#pfill').parentElement.getBoundingClientRect(), pf = document.querySelector('#pfill').getBoundingClientRect();
      const cs = getComputedStyle(document.querySelector('#tptr'));
      ok({ T: f.T, p: f.p, ptr: (ptr.left - bar.left) / bar.width, fill: pf.width / pb.width, left: pf.left - pb.left, trans: cs.transitionDuration, pct: document.querySelector('#ppct').textContent });
    })));
    if (hud) {
      assert.ok(Math.abs(hud.ptr - hud.T) < 0.03, `стрелка натяжения стоит на своём месте: ${JSON.stringify(hud)}`);
      assert.ok(Math.abs(hud.fill - hud.p) < 0.03 && Math.abs(hud.left) < 3, `полоса вываживания нужной длины: ${JSON.stringify(hud)}`);
      assert.ok(/^0s/.test(hud.trans) && hud.pct === Math.round(hud.p * 100) + '%', `стрелка без сглаживающей задержки, проценты те же: ${JSON.stringify(hud)}`);
    }
  }
  await shot(page, '12-fight');
  await G(page, () => { window.__keep = true; });
  await page.waitForFunction(() => window.__log.includes('caught'), null, { timeout: 240000 });
  await shot(page, '13-catch', 400);
  await G(page, () => { window.__keep = false; });
  await page.waitForFunction(() => RYBAK.profile.cooler.length >= 3, null, { timeout: 400000 });
  await G(page, () => { clearInterval(window.__bot); const i = RYBAK.input; i.primary = false; i.keys.clear(); window.__bot = setInterval(() => { if (RYBAK.fishing.state === 'landed') RYBAK.input.pressed.add('Primary'); else if (RYBAK.fishing.state !== 'idle' && RYBAK.fishing.state !== 'fight') RYBAK.input.pressed.add('KeyR'); }, 50); });
  await page.waitForFunction(() => RYBAK.fishing.state === 'idle', null, { timeout: 120000 });
  await G(page, () => clearInterval(window.__bot));
  const st = await G(page, () => ({ cooler: RYBAK.profile.cooler.length, xp: RYBAK.profile.xp, journal: Object.keys(RYBAK.profile.journal).length, log: [...new Set(window.__log)] }));
  console.log('  улов:', JSON.stringify(st));
  assert.ok(st.cooler >= 3 && st.xp > 0);

  // ── вываживание по манерам: подсказки на шкале, «второе дыхание» легенды, показ улова на леске и в подсаке ──
  {
    const fightOf = (sp, u = 0.5) => G(page, ([sp, u]) => {
      const g = RYBAK, f = g.fishing;
      if (f.state !== 'idle') f.toIdle();
      g.ui.catchCard(null);
      g.input.primary = false; g.input.keys.clear();
      f.startFight(sp, u, 10);
      // Бой для проверок «вечный»: пока смотрим на шкалу и на камеру, рыба не сходит, леска не рвётся, путь не идёт сам.
      // Счётчики провиса и перегруза правила обнуляют сами, едва стрелка вернулась в рабочую зону, — разовой правки мало,
      // поэтому чистим их перед каждым шагом боя (window.__eternal — пока идут эти проверки).
      if (!f.__pinned) {
        f.__pinned = true;
        const up = f.update;
        f.update = function (...a) {
          const s = this.fight;
          // …и рывков нет: на долгом кадре (шаг правил до 0,3 с при ускоренном времени) рывок рвал бы леску за один шаг
          if (window.__eternal && this.state === 'fight' && s) { s.slack = 0; s.strain = 0; s.phase = 'calm'; s.phaseT = 1e9; s.next = 'calm'; }
          return up.apply(this, a);
        };
      }
      window.__eternal = true;
      f.fight.stamina = 1e12;
      return { style: f.fight.style, boss: f.fight.boss };
    }, [sp, u]);
    // один кадр игры с остановленным боем: правила не идут, шкала перерисовывается
    const hud = (set) => G(page, (set) => new Promise((ok) => {
      const g = RYBAK, f = g.fishing.fight;
      Object.assign(f, set);
      const step = g.fishing.update;
      g.fishing.update = () => {};
      requestAnimationFrame(() => requestAnimationFrame(() => {
        g.fishing.update = step;
        const vis = (q) => getComputedStyle(document.querySelector(q)).display !== 'none';
        const box = (q) => { const r = document.querySelector(q).getBoundingClientRect(), b = document.querySelector('#tbar').getBoundingClientRect(); return [(r.left - b.left) / b.width, (r.right - b.left) / b.width]; };
        ok({ tip: document.querySelector('#ftip').textContent, bar: document.querySelector('#tbar').className.trim(), state: document.querySelector('#fstate').textContent, cls: document.querySelector('#fstate').className, jump: vis('#tzJump') && box('#tzJump'), lift: vis('#tzLift') && box('#tzLift'), slack: vis('.tz.slack') && box('.tz.slack'), liftK: document.querySelector('#tzLiftK').style.transform, ok: document.querySelector('#tok').textContent, pips: [...document.querySelectorAll('#fboss i')].map((e) => e.className || 'on'), marks: [...document.querySelectorAll('#pbar .pm')].map((e) => (getComputedStyle(e).display === 'none' ? '-' : e.className.includes('used') ? 'used' : 'on')), shake: document.querySelector('.fpanel').classList.contains('shake') });
      }));
    }), set);
    const near = (a, b) => Math.abs(a - b) < 0.03;

    // прыгун: пока рыба в воздухе, «опасно» начинается с 62 %
    let f = await fightOf('shuka');
    assert.equal(f.style, 'jumper');
    let h = await hud({ jumpT: 0, stuck: 0, T: 0.5, phase: 'calm', warned: false });
    assert.match(h.tip, /ПРЫГУН.*свеч/);
    assert.ok(!h.jump && !h.lift && !h.slack && h.state === 'РОВНО' && h.ok === 'НОРМА', JSON.stringify(h));
    h = await hud({ jumpT: 0.4, T: 0.5, phase: 'run' });
    assert.ok(h.jump && near(h.jump[0], 0.62) && near(h.jump[1], 0.78), 'зона свечи на шкале: ' + JSON.stringify(h));
    assert.ok(/СВЕЧА/.test(h.state) && h.cls === 'warn' && !h.shake, JSON.stringify(h));
    h = await hud({ jumpT: 0.4, T: 0.7, phase: 'run' });
    assert.ok(/ОТПУСТИ/.test(h.state) && h.cls === 'bad' && h.shake, 'в свече 70 % — уже опасно: ' + JSON.stringify(h));
    h = await hud({ jumpT: 0, T: 0.7, phase: 'run' });
    assert.ok(!h.jump && h.state === 'РЫВОК!' && !h.shake, JSON.stringify(h));

    // присоска: залегла — рамка «держи» у верхней границы нормы и полоска отрыва
    f = await fightOf('skat');
    assert.equal(f.style, 'flat');
    h = await hud({ stuck: 1, lift: 0, T: 0.4, phase: 'calm', warned: false });
    assert.ok(h.lift && near(h.lift[0], 0.6) && near(h.lift[1], 0.78) && /ЗАЛЕГЛА/.test(h.state), JSON.stringify(h));
    h = await hud({ stuck: 1, lift: 0.5 * (await G(page, () => RYBAK.fishing.fight.rho >= 1 ? 1.6 : (0.5 + 0.5 * RYBAK.fishing.fight.rho) * 1.6)), T: 0.7 });
    assert.match(h.liftK, /scaleX\(0\.5\d*\)/, 'полоска отрыва — половина: ' + h.liftK);
    h = await hud({ stuck: 0, T: 0.5 });
    assert.ok(!h.lift, JSON.stringify(h));

    // тяжеловес: норма делится на «вяло» и «внатяг»
    f = await fightOf('som', 0.3);
    assert.equal(f.style, 'bulldog');
    h = await hud({ T: 0.4, phase: 'calm', warned: false });
    assert.ok(h.slack && near(h.slack[0], 0.22) && near(h.slack[1], 0.5) && h.ok === 'ВНАТЯГ' && h.state === 'ТЯНИ ВНАТЯГ', JSON.stringify(h));
    h = await hud({ T: 0.6 });
    assert.equal(h.state, 'РОВНО');

    // хитрец: в рывке — «уводи», завёл — «за камнями»
    f = await fightOf('ugor');
    assert.equal(f.style, 'snag');
    h = await hud({ phase: 'run', dir: 1, T: 0.5, wrapped: false });
    assert.match(h.state, /УВОДИ/);
    h = await hud({ phase: 'run', dir: 1, T: 0.5, wrapped: true });
    assert.match(h.state, /ЗА КАМНЯМИ/);

    // легенда: два «дыхания», отметки на полосе; собралась — одно гаснет, путь уходит назад, на экране плашка
    f = await fightOf('koi');
    assert.equal(f.boss, 2);
    h = await hud({ T: 0.5, phase: 'calm', warned: false });
    assert.deepEqual(h.pips, ['on', 'on']);
    assert.deepEqual(h.marks, ['on', 'on']);
    const rage = await G(page, () => new Promise((ok) => {
      const g = RYBAK, f = g.fishing, s = f.fight;
      const emit = f.emit; const seen = [];
      f.emit = (t, d) => { seen.push(t); emit(t, d); };
      s.p = 0.46; s.T = 0.5;
      requestAnimationFrame(() => requestAnimationFrame(() => { f.emit = emit; ok({ seen, p: s.p, boss: s.boss, banner: document.querySelector('#banner').textContent, hidden: document.querySelector('#banner').classList.contains('hidden') }); }));
    }));
    assert.ok(rage.seen.includes('rage') && rage.boss === 1 && rage.p < 0.4, JSON.stringify(rage));
    assert.ok(/ВТОРОЕ ДЫХАНИЕ/.test(rage.banner) && !rage.hidden, JSON.stringify(rage));
    h = await hud({ T: 0.5 });
    assert.deepEqual(h.pips, ['on', 'used']);
    assert.deepEqual(h.marks, ['used', 'on']);
    f = await fightOf('okun');
    h = await hud({ T: 0.5 });
    assert.deepEqual(h.marks, ['-', '-'], 'у обычной рыбы отметок нет');

    // взгляд сам держится на рыбе (она левее середины кадра), пока мышь не трогают; выключили в настройках — стоит.
    // Угол на рыбу считаем по положению игрока и рыбы, а не по камере: её матрицы обновляются только в кадре, и сразу
    // после толчка она ещё «смотрит по-старому» — проверка по ней проходила или падала смотря успел ли пройти кадр.
    const view = () => G(page, () => { const g = RYBAK, f = g.fishing, pl = g.player; const a = pl.yaw - Math.atan2(-(f.bx - pl.x), -(f.bz - pl.z)); return { a: Math.atan2(Math.sin(a), Math.cos(a)), yaw: pl.yaw, state: f.state }; });
    // взгляд «на рыбе» — когда она на 0,22 рад левее середины кадра (правило из main.js)
    const onFish = () => page.waitForFunction(() => { const g = RYBAK, f = g.fishing, pl = g.player; if (f.state !== 'fight') return true; const a = pl.yaw - Math.atan2(-(f.bx - pl.x), -(f.bz - pl.z)); return Math.abs(Math.atan2(Math.sin(a), Math.cos(a)) + 0.22) < 0.03; }, null, { timeout: 30000 });
    assert.equal(await G(page, () => RYBAK.fishing.state), 'fight', 'бой для проверки камеры идёт');
    // на время проверки камеры правила боя стоят: рыба на месте, бой не кончается — смотрим только на взгляд
    await G(page, () => { const f = RYBAK.fishing; window.__upd = f.update; f.update = () => {}; RYBAK.followT = 0; });
    await onFish();
    const on = await view();
    assert.ok(on.state === 'fight' && Math.abs(on.a + 0.22) < 0.03, 'взгляд встал на рыбу: ' + JSON.stringify(on));
    // толкнули взгляд в сторону (как мышью) — он сам возвращается к рыбе
    const yawFar = await G(page, () => { RYBAK.player.yaw += 0.6; RYBAK.followT = 0; return RYBAK.player.yaw; });
    await onFish();
    const seen = await view();
    assert.ok(seen.state === 'fight' && Math.abs(seen.a + 0.22) < 0.03 && Math.abs(seen.yaw - yawFar) > 0.5, 'взгляд пришёл к рыбе: ' + JSON.stringify({ ...seen, yawFar }));
    // выключили в настройках — взгляд остаётся где был
    const follow = async (on) => {
      await G(page, () => { const g = RYBAK; g.fishing.toIdle(); g.ui.catchCard(null); g.ui.openPanel('pause'); });
      await page.click('[data-p="settings"]');
      await page.waitForSelector('.set');
      assert.equal(await page.locator('.tog.on[data-id="follow"]').count(), on ? 0 : 1);
      await page.click('.tog[data-id="follow"]');
      assert.equal(await G(page, () => JSON.parse(localStorage.getItem('rybak.settings.v1')).follow), on);
      await page.click('.center [data-a="close"]');
      await G(page, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; });
    };
    await follow(false);
    await fightOf('okun');
    const y0 = await G(page, () => { RYBAK.player.yaw += 0.6; RYBAK.followT = 0; return RYBAK.player.yaw; });
    await G(page, () => new Promise((ok) => { let n = 0; const w = () => (++n < 20 ? requestAnimationFrame(w) : ok()); w(); }));
    assert.equal(await G(page, () => RYBAK.fishing.state), 'fight');
    assert.ok(Math.abs((await view()).yaw - y0) < 1e-6, 'с выключенной настройкой взгляд не ведёт');
    await follow(true);
    await G(page, () => { RYBAK.fishing.update = window.__upd; window.__eternal = false; });

    // улов без подсака: рыба висит на леске под кончиком удилища, головой вверх
    const shown = (sp, net) => G(page, ([sp, net]) => new Promise((ok) => {
      const g = RYBAK, f = g.fishing, vm = g.vm;
      if (f.state !== 'idle') f.toIdle();
      g.ui.catchCard(null);
      f.kit.net = net;
      f.showCatch(sp, 0.5);
      const t0 = f.t;
      const wait = () => {
        if (f.t - t0 < 1.6) return requestAnimationFrame(wait);
        const tip = vm.rod.tip.getWorldPosition(new g.camera.position.constructor());
        vm.root.worldToLocal(tip);
        const fishW = f.fish.getWorldPosition(new g.camera.position.constructor());
        vm.root.worldToLocal(fishW);
        ok({ state: f.state, net: vm.show && vm.show.net, parent: f.fish.parent === vm.fishSlot ? 'line' : f.fish.parent === vm.netSlot ? 'net' : 'other', line: vm.hangLine.line.visible, waterLine: f.line.line.visible, netOn: vm.net.group.visible, netK: vm.netK, handK: vm.handK, tip: tip.toArray(), slot: vm.fishSlot.position.toArray(), fish: fishW.toArray(), s: f.shown.s, hoop: f.shown.hoop, rotZ: f.fish.rotation.z, rotX: f.fish.rotation.x, aura: vm.auraMesh.visible, card: !document.querySelector('#catch').classList.contains('hidden'), pitch: g.player.pitch, bend: vm.p.bend });
      };
      requestAnimationFrame(wait);
    }), [sp, net]);
    let c = await shown('shuka', false);
    assert.ok(c.state === 'landed' && c.net === false && c.parent === 'line' && c.line && !c.waterLine && !c.netOn && c.card, JSON.stringify(c));
    assert.ok(Math.abs(c.slot[0] - c.tip[0]) < 0.32 && Math.abs(c.slot[2] - c.tip[2]) < 0.01 && c.slot[1] < c.tip[1] - 0.15, 'рот рыбы — под кончиком удилища: ' + JSON.stringify(c));
    assert.ok(Math.abs(c.rotZ + Math.PI / 2) < 0.01 && Math.abs(c.fish[1] - (c.slot[1] - c.s / 2)) < 0.02, 'висит головой вверх, на полдлины ниже рта: ' + JSON.stringify(c));
    assert.ok(c.tip[2] < -1.5 && c.tip[1] > 0.5 && c.tip[1] < 1.15 && c.bend > 0.55 && c.aura, 'кончик согнутого удилища виден вверху кадра: ' + JSON.stringify(c));
    assert.ok(c.pitch > -0.2, 'взгляд поднят к улову: ' + c.pitch);
    await shot(page, '13b-catch-line');
    // улов с подсаком: рыба лежит на боку в сетке, левая рука держит рукоять
    c = await shown('shuka', true);
    assert.ok(c.state === 'landed' && c.net === true && c.parent === 'net' && !c.line && !c.waterLine && c.netOn && c.netK > 0.97 && c.handK > 0.97, JSON.stringify(c));
    assert.ok(Math.abs(c.rotX + Math.PI / 2) < 0.2 && c.hoop >= 0.38 && c.hoop <= 0.6 && c.fish[2] < -0.6 && c.fish[2] > -1.2 && Math.abs(c.fish[0]) < 0.3, 'рыба в сетке, перед глазами: ' + JSON.stringify(c));
    const fist = await G(page, () => { const g = RYBAK, vm = g.vm; const h = vm.arms ? vm.arms.b.hL.getWorldPosition(new g.camera.position.constructor()) : vm.handL.getWorldPosition(new g.camera.position.constructor()); vm.root.worldToLocal(h); const n = vm.net.group; const grip = new g.camera.position.constructor(0, 0, vm.net.grip()).applyQuaternion(n.quaternion).add(n.position); return { d: h.distanceTo(grip), h: h.toArray(), grip: grip.toArray() }; });
    assert.ok(fist.d < 0.12, 'левая кисть — на рукояти подсака: ' + JSON.stringify(fist));
    await shot(page, '13c-catch-net');
    const gone = await G(page, () => new Promise((ok) => {
      const g = RYBAK, f = g.fishing, vm = g.vm;
      f.toIdle(); g.ui.catchCard(null); f.refreshGear();
      const t0 = f.t;
      const wait = () => (f.t - t0 < 1 ? requestAnimationFrame(wait) : ok({ netOn: vm.net.group.visible, line: vm.hangLine.line.visible, show: vm.show, fish: f.fish, aura: vm.auraK }));
      requestAnimationFrame(wait);
    }));
    assert.ok(!gone.netOn && !gone.line && !gone.show && !gone.fish && !gone.aura, 'отпустили — подсак и леска убраны: ' + JSON.stringify(gone));
  }
  // ── звук: записи вместо синтеза там, где они есть; трещотка фрикциона; музыка, которую сочиняет игра ──
  {
    await page.waitForFunction(() => { const a = RYBAK.audio; return a.ctx && ['splash', 'plop', 'reel', 'snap'].every((k) => k in a.buf); }, null, { timeout: 15000 });
    const snd = await G(page, () => { const a = RYBAK.audio; return { state: a.ctx.state, buf: Object.fromEntries(Object.entries(a.buf).map(([k, b]) => [k, b ? +b.duration.toFixed(2) : null])), music: !!a.music, mus: a.mus.gain.value }; });
    console.log('  звук:', JSON.stringify(snd));
    assert.ok(snd.music && Math.abs(snd.mus - 0.45) < 1e-6, 'музыка есть, громкость по умолчанию: ' + JSON.stringify(snd));
    for (const [k, lo] of [['splash', 0.7], ['plop', 0.4], ['reel', 0.7], ['snap', 0.25]]) assert.ok(snd.buf[k] > lo, `запись «${k}» загружена и прочитана: ${JSON.stringify(snd.buf)}`);
    const use = await G(page, () => {
      const a = RYBAK.audio;
      for (let i = 0; i < 300; i++) a.drag(0); // после прежних рывков трещотка могла ещё не убраться
      const r = { splash: a.play('splash', { vol: 0.01 }), none: a.play('нет такой'), d0: !!a.dragN };
      a.tick(); a.plop(); a.snap(); a.splash(1, 0.01);
      a.drag(1); r.d1 = !!a.dragN && a.dragN.s.loop;
      for (let i = 0; i < 300; i++) a.drag(0);
      r.d2 = !!a.dragN;
      const none = a.buf.splash; a.buf.splash = null; r.fallback = a.play('splash') === false; a.splash(0.3, 0.01); a.buf.splash = none; // без записи — синтез, без ошибок
      return r;
    });
    assert.deepEqual(use, { splash: true, none: false, d0: false, d1: true, d2: false, fallback: true });
    // музыка идёт вперёд сама; в бою ей сообщают про бой; громкость на нуле — расписание стоит
    if (snd.state === 'running') {
      const i0 = await G(page, () => RYBAK.audio.music.i);
      await page.waitForFunction((i0) => RYBAK.audio.music.i > i0 + 2, i0, { timeout: 20000 });
      await G(page, () => { const g = RYBAK; g.fishing.toIdle(); g.ui.catchCard(null); g.fishing.startFight('koi', 0.5, 10); });
      await page.waitForFunction(() => RYBAK.audio.music.mood.fight === 1 && RYBAK.audio.music.mood.boss === 2, null, { timeout: 10000 });
      await G(page, () => { RYBAK.fishing.toIdle(); });
      await page.waitForFunction(() => RYBAK.audio.music.mood.fight === 0, null, { timeout: 10000 });
      await G(page, () => { const g = RYBAK; g.ui.openPanel('pause'); });
      await page.click('[data-p="settings"]');
      await page.waitForSelector('[data-set="music"]');
      await page.locator('[data-set="music"]').evaluate((e) => { e.value = 0; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
      await page.waitForFunction(() => RYBAK.audio.mus.gain.value === 0, null, { timeout: 5000 });
      await page.waitForTimeout(900);
      const i1 = await G(page, () => RYBAK.audio.music.i);
      await page.waitForTimeout(1500);
      assert.equal(await G(page, () => RYBAK.audio.music.i), i1, 'на нуле музыка не расписывается');
      await page.locator('[data-set="music"]').evaluate((e) => { e.value = 0.45; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
      await page.waitForFunction((i1) => RYBAK.audio.music.i > i1, i1, { timeout: 20000 });
      await page.click('.center [data-a="close"]');
      await G(page, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; });
    } else console.log('  (звуковой контекст не запущен в этом браузере — музыку по ходу не проверяю)');
  }
  // ── рыбалка по живой рыбе: наживка рядом с крупной тенью — клюёт она сама; плюхнули на неё или топали — уходит ──
  {
    // заброс «в точку»: снасть уже в воздухе и падает в (x, z)
    const dropAt = (x, z) => G(page, ([x, z]) => new Promise((ok) => {
      const g = RYBAK, f = g.fishing;
      if (f.state !== 'idle') f.toIdle();
      g.ui.catchCard(null);
      window.__land = null;
      const emit = f.emit;
      f.emit = (t, d) => { if (t === 'land') window.__land = d; emit(t, d); };
      f.target = { x, z };
      f.spot = { zone: 'pier', depth: 3, pier: true, hot: false };
      f.short = false; f.castDist = 6; f.flyT = 0.5; f.castT = 0.7; f.castK = 1; f.bob.visible = false;
      f.state = 'cast';
      const wait = () => (window.__land ? (f.emit = emit, ok({ land: window.__land, big: f.big, left: f.biteLeft, state: f.state, toast: [...document.querySelectorAll('#toasts > *')].map((e) => e.textContent).join(' | ') })) : requestAnimationFrame(wait));
      requestAnimationFrame(wait);
    }), [x, z]);
    const loner = (i) => G(page, (i) => { const o = RYBAK.fauna.loners.filter((o) => o.ok)[i]; o.gone = 0; o.flee = 0; o.f.len = o.len; return { x: o.f.x, z: o.f.z, len: o.len, n: RYBAK.fauna.loners.filter((o) => o.ok).length }; }, i);
    const state = (i) => G(page, (i) => { const fa = RYBAK.fauna, o = fa.loners.filter((o) => o.ok)[i], S = fa.suitor; return { gone: o.gone, flee: o.flee, shown: o.f.len, own: S.own === o, st: S.st, slen: S.f.len, big: RYBAK.fishing.big }; }, i);
    await G(page, () => { const g = RYBAK; g.player.place(0.6, -22, 0); g.input.locked = true; g.input.enabled = true; });
    let L0 = await loner(0);
    assert.ok(L0.n >= 8, 'в бухте ходят одиночки: ' + L0.n);
    // наживка в полутора метрах от рыбы: заметила
    let d = await dropAt(L0.x + 1.5, L0.z);
    assert.ok(d.land.big > 0 && !d.land.spooked && d.big > 0 && d.left <= 6.3, 'рыба заметила наживку, клюнет скоро: ' + JSON.stringify(d));
    assert.match(d.toast, /заметила наживку/);
    await page.waitForFunction(() => RYBAK.fauna.suitor.own, null, { timeout: 10000 });
    let st = await state(0);
    assert.ok(st.own && st.st === 'come' && st.shown === 0 && Math.abs(st.slen - L0.len) < 1e-6 && st.gone > 1000, 'к наживке идёт та самая рыба, на прежнем месте её нет: ' + JSON.stringify(st));
    // клюёт, подсекаем: улов «выслежен», рыба с этого места пропадает надолго
    await G(page, () => { RYBAK.fishing.biteLeft = 0.01; });
    await page.waitForFunction(() => RYBAK.fishing.state === 'bite', null, { timeout: 20000 });
    await G(page, () => RYBAK.input.pressed.add('Primary'));
    await page.waitForFunction(() => RYBAK.fishing.state === 'fight', null, { timeout: 20000 });
    const c = await G(page, () => { const f = RYBAK.fishing, fi = RYBAK.constructor; const c = f.catch; return { ...c, big: f.spot.big }; });
    assert.ok(c.stalked && !c.junk, 'улов выслежен: ' + JSON.stringify(c));
    st = await state(0);
    assert.ok(!st.own && st.gone > 150 && st.gone < 250, 'пойманная рыба вернётся на своё место не скоро: ' + JSON.stringify(st));
    await G(page, () => { const f = RYBAK.fishing; f.fight.p = 0.999; f.fight.T = 0.5; f.fight.boss = 0; RYBAK.input.primary = true; });
    await page.waitForFunction(() => RYBAK.fishing.state === 'landed', null, { timeout: 30000 });
    await G(page, () => { RYBAK.input.primary = false; });
    assert.match(await page.textContent('#catch'), /ВЫСЛЕЖЕНА/);
    await G(page, () => { RYBAK.fishing.toIdle(); RYBAK.ui.catchCard(null); });
    // плюхнули прямо на рыбу: испугалась, уходит, бонуса нет
    const L1 = await loner(1);
    d = await dropAt(L1.x + 0.3, L1.z + 0.2);
    assert.ok(d.land.spooked && !d.land.big && d.big === 0, JSON.stringify(d));
    assert.match(d.toast, /прямо на рыбу/);
    st = await state(1);
    assert.ok(st.flee > 0 && st.shown > 0 && !st.own, 'рыба убегает: ' + JSON.stringify(st));
    // пока она убегает, наживку не замечает
    const again = await G(page, ([x, z]) => RYBAK.fauna.notice(x + 1.5, z), [L1.x, L1.z]);
    assert.equal(again, null);
    await G(page, () => { RYBAK.fishing.toIdle(); });
    // далеко от рыбы — обычный заброс
    d = await dropAt(L0.x + 30, L0.z + 30);
    assert.ok(!d.land.big && !d.land.spooked && d.big === 0, JSON.stringify(d));
    await G(page, () => { RYBAK.fishing.toIdle(); });
    // топот у воды: бегом — рыба разбегается, шагом — нет
    const L2 = await loner(2);
    const steps = await G(page, ([x, z]) => {
      const g = RYBAK, p = g.player, o = g.fauna.loners.filter((o) => o.ok)[2];
      const keep = [p.x, p.z, p.run, p.wade];
      p.x = x + 1.5; p.z = z; p.wade = 0;
      p.run = 0; p.onStep(false); const walk = o.flee;
      p.run = 1; p.onStep(false); const run = o.flee;
      [p.x, p.z, p.run, p.wade] = keep;
      o.flee = 0;
      return { walk, run };
    }, [L2.x, L2.z]);
    assert.ok(steps.walk === 0 && steps.run > 0, 'шагом рыбу не пугаем, бегом — пугаем: ' + JSON.stringify(steps));
    console.log('  живая рыба: наживку у тени заметили, улов выслежен, плюхнули на рыбу — ушла, топот распугивает');
  }
  // ── дно и свет: водоросли и мелочь на дне, флаги по ветру, лучи низкого солнца ──
  {
    const w = await G(page, () => {
      const g = RYBAK, W = g.world, sb = W.seabed, m = sb.kelp.instanceMatrix.array;
      let top = -1e9, deep = 1e9;
      for (let i = 0; i < sb.total; i++) {
        const y = m[i * 16 + 13];
        top = Math.max(top, y + Math.hypot(m[i * 16 + 4], m[i * 16 + 5], m[i * 16 + 6])); // куст высотой 1, растянут по высоте
        deep = Math.min(deep, y);
      }
      sb.mesh.geometry.computeBoundingBox();
      const U = W.flags.U.uWind;
      const blow = (wind) => { for (let i = 0; i < 400; i++) W.flags.update(g.T || 0, wind); return +U.value.toFixed(3); };
      const keep = U.value;
      const wind = { storm: blow(1), calm: blow(0) };
      U.value = keep;
      return {
        stats: sb.stats(), top, deep, dressTop: sb.mesh.geometry.boundingBox.max.y,
        flags: W.flags.items.map((f) => ({ y: +f.position.y.toFixed(2), yaw: +f.rotation.y.toFixed(3), shadow: f.castShadow })), wind,
        raysOn: W.rays.on, hidden: [sb.mesh, sb.kelp, W.rays.mesh].every((o) => g.gfx.reflHide ? g.gfx.reflHide.includes(o) : true)
      };
    });
    assert.ok(w.stats.of > 300 && w.stats.tris > 1500, `дно обжито: ${JSON.stringify(w.stats)}`);
    assert.equal(w.stats.kelp, Math.round(w.stats.of * 0.3), 'на «низком» качестве водорослей — треть');
    assert.ok(w.top < -0.1 && w.deep > -4.4, `водоросли стоят под водой и там, где дно видно: верхушка ${w.top.toFixed(2)}, глубже всех ${w.deep.toFixed(2)}`);
    assert.ok(w.dressTop < -0.05, `камни, ракушки и затонувшая мелочь — под водой: ${w.dressTop.toFixed(2)}`);
    assert.equal(w.flags.length, 4);
    assert.ok(w.flags.every((f) => f.y > 0.3 && f.yaw === w.flags[0].yaw && !f.shadow), `флаги стоят на настилах и смотрят в одну сторону: ${JSON.stringify(w.flags)}`);
    assert.ok(w.wind.storm > 0.95 && w.wind.calm < 0.2, `полотнища вытягиваются по ветру и обвисают в штиль: ${JSON.stringify(w.wind)}`);
    assert.equal(w.raysOn, false, 'на «низком» качестве лучей солнца нет');
    assert.ok(w.hidden, 'дно, водоросли и лучи не попадают в отражение на воде');
    // лучи: только когда солнце низко и в кадре; отвернулись или солнце поднялось — гаснут. (Здесь качество «низкое»,
    // и сама игра их не включает — зовём расчёт напрямую, одним вызовом, чтобы кадры игры не вмешались.)
    const rays = await G(page, () => {
      const g = RYBAK, W = g.world, R = W.rays, cam = g.camera.clone();
      const sun = new g.camera.position.constructor(0.95, 0.11, 0.31).normalize();
      const run = (k, at) => { cam.lookAt(cam.position.clone().add(at)); cam.updateMatrixWorld(true); for (let i = 0; i < 120; i++) { R.on = true; R.update(cam, sun, W.sun.color, k, 1); } return { vis: R.mesh.visible, k: +R.U.uK.value.toFixed(3), sun: [+R.U.uSun.value.x.toFixed(2), +R.U.uSun.value.y.toFixed(2)], z: +R.U.uZ.value.toFixed(4) }; };
      const flat = sun.clone().setY(0).normalize();
      const out = { toSun: run(0.5, flat), away: run(0.5, flat.clone().negate()), noon: run(0, flat) };
      R.on = false; R.U.uK.value = 0; R.mesh.visible = false;
      return out;
    });
    assert.ok(rays.toSun.vis && rays.toSun.k > 0.45 && Math.abs(rays.toSun.sun[0]) < 0.1 && rays.toSun.sun[1] > 0 && rays.toSun.z > 0.9 && rays.toSun.z < 1, `лицом к низкому солнцу лучи видны: ${JSON.stringify(rays.toSun)}`);
    assert.ok(!rays.away.vis && !rays.noon.vis, `спиной к солнцу и днём лучей нет: ${JSON.stringify(rays)}`);
    console.log(`  дно и свет: водорослей ${w.stats.kelp} из ${w.stats.of}, мелочи на дне ${w.stats.tris} треугольников, флагов ${w.flags.length}, лучи по солнцу`);
  }
  if (process.env.UNTIL === 'fight') {
    // быстрый прогон только до вываживания: UNTIL=fight node test/play.cjs
    await browser.close();
    return console.log('Остановлено после проверки вываживания (UNTIL=fight).');
  }

  // рынок: подойти, продать, купить
  await G(page, () => { RYBAK.player.place(-5.4, 12.8, 1.4); });
  await G(page, () => { RYBAK.input.locked = true; });
  await page.waitForFunction(() => /РЫНОК/.test(document.querySelector('#prompt').textContent));
  await shot(page, '14-market-prompt', 200);
  await G(page, () => RYBAK.input.pressed.add('KeyE'));
  await page.waitForSelector('.sellside');
  await shot(page, '15-sell');
  const coins0 = await G(page, () => RYBAK.profile.coins);
  await page.locator('.grid .tile').first().click();
  await page.click('[data-a="sellall"]');
  const coins1 = await G(page, () => RYBAK.profile.coins);
  assert.ok(coins1 > coins0, 'монеты за улов');
  assert.equal(await G(page, () => RYBAK.profile.cooler.length), 0);
  await page.click('[data-p="shop"]');
  await page.waitForSelector('.panel .grid .tile');
  await G(page, () => { RYBAK.profile.coins += 2000; RYBAK.ui.rerender(); });
  await page.click('.tabs2 [data-id="rod"]');
  await page.click('.grid [data-id="rod2"]');
  await shot(page, '16-shop');
  await page.click('.detail [data-a="buy"]');
  assert.equal(await G(page, () => RYBAK.profile.equip.rod), 'rod2');
  await page.click('.tabs2 [data-id="tackle"]');
  await page.click('.grid [data-id="shrimp"]');
  await page.click('.detail [data-a="buy"]');
  assert.equal(await G(page, () => RYBAK.profile.tackle.shrimp), 10);
  await page.click('.tabs2 [data-id="lure"]');
  await page.click('.grid [data-id="spoon"]');
  await page.click('.detail [data-a="buy"]');
  assert.equal(await G(page, () => RYBAK.profile.equip.tackle), 'spoon');
  await page.keyboard.press('Escape');
  assert.equal(await G(page, () => RYBAK.ui.panel), null);
  assert.equal(await G(page, () => RYBAK.fishing.kit.cast), 24);

  // блесна: вести подмоткой
  await page.waitForTimeout(900);
  assert.equal(await G(page, () => RYBAK.ui.panel), null, 'после Esc не должна всплывать пауза');
  await G(page, () => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(0, -24.5, 0); g.player.pitch = -0.12; const i = g.input; i.primary = true; i.pressed.add('Primary'); });
  await page.waitForFunction(() => RYBAK.fishing.state === 'charge' && RYBAK.fishing.power > 0.95);
  await G(page, () => { RYBAK.input.primary = false; });
  await page.waitForFunction(() => RYBAK.fishing.state === 'wait', null, { timeout: 20000 });
  const d0 = await G(page, () => Math.hypot(RYBAK.fishing.bx - RYBAK.player.x, RYBAK.fishing.bz - RYBAK.player.z));
  assert.ok(d0 > 18, 'дальний заброс новой удочкой: ' + d0);
  await G(page, () => { RYBAK.input.primary = true; });
  await page.waitForTimeout(1200);
  const d1 = await G(page, () => Math.hypot(RYBAK.fishing.bx - RYBAK.player.x, RYBAK.fishing.bz - RYBAK.player.z));
  assert.ok(d1 < d0 - 1 || (await G(page, () => RYBAK.fishing.state)) !== 'wait', 'приманка идёт к берегу');
  await shot(page, '17-lure');
  await G(page, () => { RYBAK.input.primary = false; RYBAK.input.pressed.add('KeyR'); });
  await page.waitForFunction(() => ['idle', 'bite', 'fight'].includes(RYBAK.fishing.state));

  // пауза, настройки, ночь
  await G(page, () => { RYBAK.fishing.reelIn(true); RYBAK.ui.openPanel('pause'); });
  await shot(page, '18-pause');
  await page.click('[data-p="settings"]');
  await page.waitForSelector('.set');
  await shot(page, '19-settings');
  await page.click('.tog[data-id="near"]');
  assert.equal(await G(page, () => JSON.parse(localStorage.getItem('rybak.settings.v1')).near), true);
  await page.click('.center [data-a="close"]');
  await G(page, () => { RYBAK.fixedHour = 22.5; RYBAK.input.locked = true; RYBAK.player.place(0, -10, 0.5); });
  await shot(page, '20-night', 400);
  await G(page, () => { RYBAK.fixedHour = 19.2; RYBAK.player.place(-31, 8, 1.2); RYBAK.player.pitch = -0.1; });
  await shot(page, '21-dusk-backwater', 400);

  // ходим ногами, а не переносимся: от берега до края пирса, по мосткам на западный причал, с настила на берег и в воду
  {
    // готовые модели: предметы на причале, рыба в руках, значки
    const models = await G(page, () => fetch('models/manifest.json').then((r) => r.json()).then((m) => Object.keys(m.props || {}).length, () => 0));
    if (models) {
      const mp = await open(browser, 'q=low&norender&h=13', 'models');
      await mp.fill('#nm', 'Модели');
      await G(mp, () => { RYBAK.profile.seenIntro = true; RYBAK.saveLook({ hero: 'hero-pip' }); });
      await mp.click('[data-a="solo"]');
      await mp.waitForFunction(() => RYBAK.state === 'lobby');
      await mp.click('[data-a="start"]');
      await mp.waitForFunction(() => RYBAK.state === 'world');
      await mp.waitForFunction(() => { const st = RYBAK.world.scenery.propsState(); return !st.fallback && st.placed >= 20 && st.floaters >= 5; }, null, { timeout: 120000 });
      // руки от первого лица — руки героя
      await mp.waitForFunction(() => RYBAK.vm.arms && RYBAK.vm.arms.b.hR && RYBAK.vm.hands.every((h) => !h.visible), null, { timeout: 60000 });
      // рука героя рисуется целиком, до плеча: ключица идёт за плечом как приклеенная, а плечевой сустав — за кадром
      // (раньше у Пипа плечо отбрасывалось, и рука обрывалась у локтя прямо на экране)
      const armAt = () => G(mp, () => {
        const g = RYBAK; const a = g.vm.arms; g.scene.updateMatrixWorld(true);
        const V = a.b.aL.position.constructor; const out = {};
        for (const s of ['L', 'R']) {
          const p = a.b['a' + s].getWorldPosition(new V()); const q = a.b['a' + s].parent.getWorldPosition(new V());
          const n = p.clone().project(g.camera);
          out[s] = { d: p.distanceTo(q), off: n.z > 1 || Math.abs(n.x) > 1 || n.y < -1 };
        }
        return out;
      });
      const arm0 = await armAt();
      for (const sp of ['okun', 'skat', 'chest']) {
        await G(mp, (sp) => { RYBAK.ui.closePanel(); RYBAK.fishing.showCatch(sp, 0.5); }, sp);
        await mp.waitForFunction((id) => RYBAK.fishing.fish && (RYBAK.fishing.fish.userData.model === id || (RYBAK.fishing.fish.children[0] && RYBAK.fishing.fish.children[0].userData.model === id) || RYBAK.fishing.fish.userData.model === id), (sp === 'chest' ? 'junk-' : 'fish-') + sp, { timeout: 60000 });
        // рыба долетает до рук, за ней загорается сияние
        await mp.waitForFunction(() => !RYBAK.fishing.fly && RYBAK.fishing.fish.parent === RYBAK.vm.fishSlot && RYBAK.vm.auraMesh.visible, null, { timeout: 30000 });
        if (sp === 'okun') {
          await shot(mp, '22-model-fish', 400);
          const arm1 = await armAt();
          for (const sd of ['L', 'R']) {
            assert.ok(Math.abs(arm1[sd].d - arm0[sd].d) < 1e-3, `ключица ${sd} идёт за плечом: ${arm0[sd].d.toFixed(4)} → ${arm1[sd].d.toFixed(4)}`);
            assert.ok(arm0[sd].off && arm1[sd].off, `плечевой сустав ${sd} за кадром — обрыва руки не видно`);
          }
        }
        await G(mp, () => RYBAK.fishing.finish(false));
      }
      // угол обзора меняем как игрок — ползунком в настройках
      const setFov = async (fov) => {
        await G(mp, (fov) => { RYBAK.ui.openPanel('settings'); const r = document.querySelector('[data-set="fov"]'); r.value = fov; r.dispatchEvent(new Event('input', { bubbles: true })); RYBAK.ui.closePanel(); RYBAK.input.locked = true; RYBAK.input.enabled = true; }, fov);
        await mp.waitForFunction((fov) => Math.abs(RYBAK.camera.fov - fov) < 0.5 && Math.abs(RYBAK.vm.root.scale.x - Math.tan((fov * Math.PI) / 360) / Math.tan((62 * Math.PI) / 360)) < 0.02, fov, { timeout: 10000 });
      };
      // у каждого героя свой рост — и высота глаз; у здоровяка руки от первого лица уменьшены (кулаки закрывали катушку),
      // а плечи всё равно остаются за кадром, в том числе на самом широком угле обзора: у рук он свой, от настроек не зависит
      for (const [id, eye] of [['hero-bjorn', 1.76], ['hero-gosha', 1.48]]) {
        await G(mp, (id) => RYBAK.saveLook({ hero: id }), id);
        await mp.waitForFunction((id) => RYBAK.vm.arms && RYBAK.vm.arms.tpl.info.id === id, id, { timeout: 60000 });
        assert.equal(await G(mp, () => RYBAK.player.eye), eye, `${id}: высота глаз`);
        for (const fov of [90, 62]) {
          await setFov(fov);
          const arm = await armAt();
          for (const sd of ['L', 'R']) assert.ok(arm[sd].off, `${id}, угол ${fov}°: плечевой сустав ${sd} за кадром`);
        }
      }
      await G(mp, () => RYBAK.saveLook({ hero: 'hero-pip' }));
      // значки из готовых моделей — обычные картинки, которые действительно загружаются
      await G(mp, () => RYBAK.ui.openPanel('journal'));
      await mp.waitForFunction(() => { const im = [...document.querySelectorAll('.tile img')]; return im.length >= 25 && im.every((i) => /models\/icons\/fish-.*\.webp$/.test(i.getAttribute('src')) && i.complete && i.naturalWidth > 0); }, null, { timeout: 60000 });
      await shot(mp, '23-model-journal', 300);
      // модели локации: лес, пальмы, камни, маяк, будка проката, фонари, чайки — встали на место нарисованных кодом
      await G(mp, () => RYBAK.ui.closePanel());
      await mp.waitForFunction(() => { const e = RYBAK.world.scenery.envState(); return e.trees && e.palms && e.rocks && e.lighthouse && e.kiosk && e.lamps >= 5 && e.gulls >= 4 && e.singles >= 10 && e.arch && e.piles > 0; }, null, { timeout: 180000 });
      const env = await G(mp, () => RYBAK.world.scenery.envState());
      assert.ok(env.nHi + env.nLo > 600, `деревья, кусты и камни расставлены: ${env.nHi + env.nLo}`);
      assert.ok(env.nLo > env.nHi * 2, `вдали — грубые копии: подробных ${env.nHi}, дальних ${env.nLo}`);
      assert.ok(env.hi < 520000, `подробных треугольников в лесу и скалах немного: ${env.hi}`);
      // скалы и пирс моделями: кольцо утёсов вокруг острова и глыбы западного берега, арка, сваи причалов
      assert.ok(env.cliffs >= 30 && env.arch && env.piles >= 70, `утёсов ${env.cliffs}, арка ${env.arch}, свай ${env.piles}`);
      // цельная графика: рисованные текстуры земли и камня загружены, трава посажена, домик смотрителя — готовая модель
      const art = await G(mp, async () => {
        const w = RYBAK.world;
        const r = RYBAK.gfx.renderer;
        return { paint: await w.paint, grass: w.grass.stats(), tone: r.toneMapping, cottage: w.scenery.envState().cottage, lit: w.scenery.envState().lit };
      });
      assert.equal(art.paint, true, 'текстуры травы, камня, песка и тропы загрузились');
      assert.ok(art.grass.planted > 3000 && art.grass.plantedFlowers > 300, `трава и цветы посажены: ${art.grass.planted} и ${art.grass.plantedFlowers}`);
      assert.equal(art.grass.tufts, 0, 'на «низком» качестве траву не рисуем');
      assert.equal(art.tone, 5, 'своя тональная кривая (CustomToneMapping) вместо Neutral: тени не проваливаются в чёрное');
      assert.ok(art.cottage && art.lit >= 1, 'домик смотрителя на месте, окна умеют светиться');
      // ночью окна домика горят, днём — нет
      const glow = await G(mp, () => {
        const sc = RYBAK.world.scenery;
        sc.setNight(1, 0.2);
        const night = sc.envState().glowing;
        sc.setNight(0, 1);
        return { night, day: sc.envState().glowing };
      });
      assert.ok(glow.night > 1 && glow.day === 0, `окна домика: ночью горят (${glow.night}), днём нет (${glow.day})`);
      // у будки проката можно встать перед прилавком, а сквозь неё не пройти
      await G(mp, () => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(2.0, -6.4, -Math.PI / 2); g.input.keys.add('KeyW'); });
      await mp.waitForTimeout(1600);
      const kx = await G(mp, () => { RYBAK.input.keys.delete('KeyW'); return RYBAK.player.x; });
      assert.ok(kx > 2.2 && kx < 2.7, `будка не пускает сквозь себя и вплотную к прилавку: x = ${kx.toFixed(2)}`);
      // у прилавка лодку предлагают так же, как у самой лодки
      await mp.waitForFunction(() => /ЛОДКА НАПРОКАТ — ПЕРВЫЙ ВЫХОД БЕСПЛАТНО/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
      await G(mp, () => { RYBAK.player.yaw = -Math.PI / 2; RYBAK.player.pitch = 0.12; });
      await shot(mp, '23b-rental-kiosk', 300);
      // если модель догрузилась вокруг игрока (он стоял на её месте) — он не заперт: наружу выйти можно
      await G(mp, () => { const g = RYBAK; g.player.place(4.0, -6.4, Math.PI / 2); g.input.keys.add('KeyW'); });
      await mp.waitForTimeout(1500);
      const ox = await G(mp, () => { RYBAK.input.keys.delete('KeyW'); return RYBAK.player.x; });
      assert.ok(ox < 2.6, `из будки можно выйти: x = ${ox.toFixed(2)}`);
      assert.equal(mp.__err || 0, 0, 'ошибок на странице с моделями нет');
      await mp.close();
      console.log(`  модели: предметы расставлены, рыба и сундук в руках, значки в журнале; локация — ${env.nHi + env.nLo} деревьев и камней (подробных ${env.nHi}), будка проката на месте`);
    }
    const walker = await open(browser, 'q=low&norender&h=13', 'walk');
    await walker.fill('#nm', 'Ходок');
    await G(walker, () => { RYBAK.profile.seenIntro = true; });
    await walker.click('[data-a="solo"]');
    await walker.waitForFunction(() => RYBAK.state === 'lobby');
    await walker.click('[data-a="start"]');
    await walker.waitForFunction(() => RYBAK.state === 'world');
    const walk = async (from, yaw, done, what) => {
      await G(walker, ([x, z, yaw]) => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(x, z, yaw); g.input.keys.add('KeyW'); }, [...from, yaw]);
      const ok = await walker.waitForFunction(done, null, { timeout: 40000 }).then(() => true, () => false);
      const at = await G(walker, () => { RYBAK.input.keys.delete('KeyW'); const p = RYBAK.player; return [+p.x.toFixed(2), +p.z.toFixed(2), +p.y.toFixed(2), +p.wade.toFixed(2)]; });
      assert.ok(ok, `${what}: застряли в точке ${at}`);
      return at;
    };
    const head = await walk([0, 9], 0, () => RYBAK.player.z < -26.8, 'с настила по пирсу до его края');
    assert.ok(Math.abs(head[2] - 1.1) < 0.05, 'на краю пирса стоим на досках');
    await walk([-10, 9], Math.PI / 2, () => RYBAK.player.x < -34.8, 'по мосткам на западный причал');
    await walk([-5.5, -24.5], Math.PI / 2, () => RYBAK.player.x < -5.85, 'до бокового края площадки на конце пирса');
    const land = await walk([0, 14], Math.PI, () => RYBAK.player.z > 22, 'с настила на берег');
    assert.ok(land[2] > 1, 'на берегу стоим на земле');
    const wet = await walk([14, 18], 0, () => RYBAK.player.wade > 0.5, 'с берега в воду по колено');
    assert.ok(wet[3] <= 0.63, `глубже, чем по колено, не заходим: ${wet[3]}`);
    // бег: с зажатым Shift по пирсу проходим заметно больше, чем шагом, и поле зрения шире; пятясь, не бежим
    const dash = async (keys, yaw = 0) => {
      // шагаем кадрами сами, чтобы время было точным и не зависело от скорости машины
      return G(walker, ([keys, yaw]) => {
        const g = RYBAK;
        g.input.locked = true; g.input.enabled = true;
        g.player.place(0, 2, yaw);
        g.player.speed = 0; g.player.run = 0;
        for (const k of keys) g.input.keys.add(k);
        const raf = window.requestAnimationFrame;
        window.requestAnimationFrame = () => 0;
        let now = performance.now() + 5000;
        g.last = now;
        for (let i = 0; i < 120; i++) { now += 1000 / 60 / g.timeScale; g.frame(now); }
        const out = { dz: 2 - g.player.z, fov: g.camera.fov, base: JSON.parse(localStorage.getItem('rybak.settings.v1') || '{}').fov || 0, run: g.player.run };
        for (const k of keys) g.input.keys.delete(k);
        window.requestAnimationFrame = raf;
        raf((t) => g.frame(t));
        return out;
      }, [keys, yaw]);
    };
    const stepW = await dash(['KeyW']);
    const runW = await dash(['KeyW', 'ShiftLeft']);
    const backS = await dash(['KeyS', 'ShiftLeft']);
    assert.ok(stepW.dz > 6.5 && stepW.dz < 8.3, `шагом за две секунды около 7,8 м: ${stepW.dz.toFixed(2)}`);
    assert.ok(runW.dz > 12.5 && runW.dz < 14.8, `бегом за две секунды около 14 м: ${runW.dz.toFixed(2)}`);
    assert.ok(runW.fov > stepW.fov + 4, `на бегу поле зрения шире: ${stepW.fov.toFixed(1)} → ${runW.fov.toFixed(1)}`);
    assert.ok(backS.dz < -6 && backS.dz > -8.3 && backS.run < 0.05, `пятимся шагом: ${backS.dz.toFixed(2)}`);
    console.log(`  бег: шагом ${stepW.dz.toFixed(1)} м за 2 с, бегом ${runW.dz.toFixed(1)} м`);
    assert.ok(!walker.__err, 'ошибки на странице (ходьба)');
    await walker.close();
    console.log('  ходьба: пирс до края, мостки, берег и вода по колено');
  }

  // лодка: взять у пирса, выйти в открытое море, поймать место с борта, причалить у маяка, вернуться и сдать
  {
    const bp = await open(browser, 'q=low&norender&h=13', 'boat');
    await bp.fill('#nm', 'Капитан');
    await G(bp, () => { RYBAK.profile.seenIntro = true; });
    await bp.click('[data-a="solo"]');
    await bp.waitForFunction(() => RYBAK.state === 'lobby');
    await bp.click('[data-a="start"]');
    await bp.waitForFunction(() => RYBAK.state === 'world');
    await G(bp, () => {
      // кадры игры считаем сами: время точное и не зависит от скорости машины
      window.__run = (sec, each) => {
        const g = RYBAK;
        const raf = window.requestAnimationFrame;
        window.requestAnimationFrame = () => 0;
        let now = performance.now();
        g.last = now;
        let t = 0;
        while (t < sec) {
          if (each && each(t) === false) break;
          now += 1000 / 60;
          g.frame(now);
          t += 1 / 60;
        }
        window.requestAnimationFrame = raf;
        g.last = performance.now();
        return t;
      };
      // рулевой: держит курс на точки по очереди клавишами, как игрок; у последней сбавляет ход
      window.__sail = (pts, reach = 6, max = 150) => {
        const g = RYBAK;
        const b = g.boat;
        const k = g.input.keys;
        let n = 0;
        let bumps = 0;
        const ob = b.onBump;
        b.onBump = (...a) => { bumps++; ob(...a); };
        const t = window.__run(max, () => {
          const last = n === pts.length - 1;
          const d = Math.hypot(pts[n][0] - b.x, pts[n][1] - b.z);
          if (d < (last ? reach : 9) && ++n >= pts.length) return false;
          const [x, z] = pts[n];
          let da = Math.atan2(-(x - b.x), -(z - b.z)) - b.yaw;
          while (da > Math.PI) da -= 2 * Math.PI;
          while (da < -Math.PI) da += 2 * Math.PI;
          for (const c of ['KeyW', 'KeyS', 'KeyA', 'KeyD']) k.delete(c);
          // сбавляем ход перед последней точкой и на крутом повороте — как осторожный рулевой
          const slow = (n === pts.length - 1 && Math.hypot(x - b.x, z - b.z) < 24) || Math.abs(da) > 1;
          if (!slow || b.v < 4) k.add('KeyW');
          else if (b.v > 6) k.add('KeyS');
          if (da > 0.05) k.add('KeyA');
          else if (da < -0.05) k.add('KeyD');
        });
        for (const c of ['KeyW', 'KeyS', 'KeyA', 'KeyD']) k.delete(c);
        b.onBump = ob;
        return { t: +t.toFixed(1), bumps, done: n >= pts.length, x: +b.x.toFixed(1), z: +b.z.toFixed(1), v: +b.v.toFixed(1) };
      };
    });
    const prompt = (re) => bp.waitForFunction((src) => new RegExp(src).test(document.querySelector('#prompt').textContent), re.source, { timeout: 40000 });
    const use = () => G(bp, () => RYBAK.input.pressed.add('KeyE'));
    // идём по пирсу пешком — у лодки появляется подсказка; первый выход бесплатный
    await G(bp, () => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(0, 2, 0); g.input.keys.add('KeyW'); });
    await prompt(/ЛОДКА НАПРОКАТ — ПЕРВЫЙ ВЫХОД БЕСПЛАТНО/);
    await G(bp, () => RYBAK.input.keys.delete('KeyW'));
    await shot(bp, '24-boat-prompt', 200);
    await use();
    await bp.waitForFunction(() => RYBAK.boat.active && RYBAK.player.boat === RYBAK.boat && /Ход.*Руль/.test(document.querySelector('#hints').textContent));
    const b0 = await G(bp, () => { const g = RYBAK; return { coins: g.profile.coins, trips: g.profile.boatTrips, sit: g.player.sit && g.player.dangle, y: g.player.y, rented: g.boat.rented, net: g.boat.net }; });
    assert.equal(b0.coins, 40, 'первый выход бесплатный');
    assert.equal(b0.trips, 1);
    assert.ok(b0.sit && b0.rented && b0.net === 1 && b0.y > 0.35 && b0.y < 1, `сидим на банке над водой: ${b0.y}`);
    await bp.waitForFunction(() => RYBAK.boat.vis.model, null, { timeout: 60000 }).catch(() => {});
    await shot(bp, '25-boat-seat', 200);
    // сразу выйти обратно можно — прокат при этом не кончается
    await prompt(/ВЫЙТИ НА ПИРС/);
    await use();
    await bp.waitForFunction(() => !RYBAK.boat.active && !RYBAK.player.boat);
    assert.ok(await G(bp, () => RYBAK.boat.rented && RYBAK.player.onDeck && !RYBAK.player.sit), 'вышли на пирс, лодка за нами');
    await prompt(/СЕСТЬ В ЛОДКУ/);
    await use();
    await bp.waitForFunction(() => RYBAK.boat.active);
    // разгон по прямой
    const run = await G(bp, () => { const g = RYBAK; const b = g.boat; const x0 = b.x; const z0 = b.z; window.__run(0.5); const fov0 = g.camera.fov; g.input.keys.add('KeyW'); window.__run(4); g.input.keys.delete('KeyW'); return { d: Math.hypot(b.x - x0, b.z - z0), v: b.v, fov: g.camera.fov, fov0 }; });
    assert.ok(run.d > 28 && run.d < 42 && run.v > 11.3 && run.v <= 12.5, `за четыре секунды разогнались: ${run.d.toFixed(1)} м, ход ${run.v.toFixed(1)}`);
    assert.ok(run.fov > run.fov0 + 4, `на ходу поле зрения шире: ${run.fov0.toFixed(1)} → ${run.fov.toFixed(1)}`);
    // из бухты на простор; там проверяем руль: взгляд поворачивается вместе с лодкой
    const out1 = await G(bp, () => window.__sail([[0, -48], [-30, -62], [-40, -140]]));
    assert.ok(out1.done && out1.bumps === 0, 'вышли из бухты без столкновений: ' + JSON.stringify(out1));
    const steer = await G(bp, () => { const g = RYBAK; const b = g.boat; const k = g.input.keys; const y0 = b.yaw; k.add('KeyW'); k.add('KeyD'); window.__run(1); k.delete('KeyD'); const right = b.yaw - y0; k.add('KeyA'); window.__run(1.6); k.delete('KeyA'); k.delete('KeyW'); return { right, left: b.yaw - y0 - right, look: g.player.yaw - b.yaw }; });
    assert.ok(steer.right < -0.6 && steer.left > 1, `руль: вправо ${steer.right.toFixed(2)}, влево ${steer.left.toFixed(2)}`);
    assert.ok(Math.abs(steer.look) < 0.01, 'взгляд поворачивается вместе с лодкой');
    // в открытое море
    const sea = await G(bp, () => window.__sail([[-40, -200]]));
    assert.ok(sea.done && sea.bumps === 0, 'дошли до открытого моря без столкновений: ' + JSON.stringify(sea));
    await G(bp, () => window.__run(1.5));
    await bp.waitForFunction(() => document.querySelector('#locName').textContent === 'ОТКРЫТОЕ МОРЕ' && RYBAK.mapSea === true);
    assert.match(await bp.textContent('#toasts'), /Открытое море/);
    await shot(bp, '26-boat-sea', 200);
    // заброс с борта: поплавок в зоне «открытое море», не ближе носа; с леской в воде лодка стоит
    const cast = await G(bp, () => {
      const g = RYBAK; const i = g.input; const b = g.boat;
      window.__run(4);
      g.player.pitch = -0.2; g.player.yaw = b.yaw + Math.PI / 2;
      i.primary = true; i.pressed.add('Primary'); window.__run(1.3);
      i.primary = false; window.__run(2.5);
      const out = { st: g.fishing.state, zone: g.fishing.spot && g.fishing.spot.zone, d: Math.hypot(g.fishing.bx - g.player.x, g.fishing.bz - g.player.z) };
      const x0 = b.x; const z0 = b.z;
      i.keys.add('KeyW'); window.__run(2); i.keys.delete('KeyW');
      out.drift = Math.hypot(b.x - x0, b.z - z0);
      return out;
    });
    assert.ok(['wait', 'bite'].includes(cast.st) && cast.zone === 'sea' && cast.d >= 3.4, 'заброс с лодки: ' + JSON.stringify(cast));
    assert.ok(cast.drift < 0.3, 'с леской в воде лодка стоит: ' + cast.drift);
    await shot(bp, '27-boat-cast', 200);
    await G(bp, () => { RYBAK.input.pressed.add('KeyR'); window.__run(0.3); RYBAK.fishing.reelIn(true); });
    // к причалу у маяка
    const toLight = await G(bp, () => window.__sail([[-45, -80], [-18, -66]], 5));
    assert.ok(toLight.done, 'дошли до причала у маяка: ' + JSON.stringify(toLight));
    await G(bp, () => window.__run(1.2));
    await prompt(/ПРИЧАЛИТЬ — ПРИЧАЛ У МАЯКА/);
    await use();
    await bp.waitForFunction(() => !RYBAK.boat.active && document.querySelector('#locName').textContent === 'ОСТРОВ С МАЯКОМ');
    const jetty = await G(bp, () => { const g = RYBAK; const p = g.player; return { deck: p.onDeck, y: p.y, x: p.x, z: p.z, moor: g.boat.moor, rented: g.boat.rented, net: g.boat.net, sit: p.sit }; });
    assert.ok(jetty.deck && Math.abs(jetty.y - 1.1) < 0.05 && jetty.moor === 1 && jetty.rented && jetty.net === 3 && !jetty.sit, 'стоим на причале у маяка: ' + JSON.stringify(jetty));
    await shot(bp, '28-boat-jetty', 300);
    // по мосткам можно пройтись и вернуться к лодке
    const stroll = await G(bp, () => { const g = RYBAK; const p = g.player; const z0 = p.z; p.yaw = 0; g.input.keys.add('KeyW'); window.__run(1); g.input.keys.delete('KeyW'); const out = z0 - p.z; p.yaw = Math.PI; g.input.keys.add('KeyW'); window.__run(1.4); g.input.keys.delete('KeyW'); return out; });
    assert.ok(stroll > 2.5, 'прошлись по причалу: ' + stroll);
    await prompt(/СЕСТЬ В ЛОДКУ/);
    await use();
    await bp.waitForFunction(() => RYBAK.boat.active);
    // домой: лодка сдаётся
    const home = await G(bp, () => window.__sail([[-30, -58], [0, -42], [12, -30], [8.5, -18.5]], 4));
    assert.ok(home.done, 'вернулись к пирсу: ' + JSON.stringify(home));
    await G(bp, () => window.__run(1.2));
    await prompt(/ПРИЧАЛИТЬ И СДАТЬ ЛОДКУ — СОЛНЕЧНАЯ БУХТА/);
    await use();
    await bp.waitForFunction(() => !RYBAK.boat.active && !RYBAK.boat.rented && RYBAK.boat.net === 0 && document.querySelector('#locName').textContent === 'БУХТА' && RYBAK.mapSea === false);
    assert.ok(await G(bp, () => RYBAK.player.onDeck && Math.abs(RYBAK.player.z + 12) < 0.5), 'стоим на домашнем пирсе');
    // второй выход — за монеты; без монет лодку не дают
    await prompt(/ЛОДКА НАПРОКАТ — 30 МОНЕТ/);
    await use();
    await bp.waitForFunction(() => RYBAK.boat.active);
    assert.equal(await G(bp, () => RYBAK.profile.coins), 10, 'прокат стоит 30 монет');
    // из меню можно сразу вернуться в бухту
    await G(bp, () => RYBAK.ui.openPanel('pause'));
    await bp.click('[data-a="home"]');
    await bp.waitForFunction(() => !RYBAK.boat.active && !RYBAK.boat.rented && RYBAK.ui.panel === null && RYBAK.player.onDeck);
    await G(bp, () => { RYBAK.input.locked = true; RYBAK.input.enabled = true; });
    await prompt(/ЛОДКА НАПРОКАТ — 30 МОНЕТ/);
    await use();
    await bp.waitForFunction(() => /не хватает 20 монет/.test(document.querySelector('#toasts').textContent));
    assert.ok(await G(bp, () => !RYBAK.boat.active && !RYBAK.boat.rented && RYBAK.profile.coins === 10), 'без монет лодку не дают');
    assert.ok(!bp.__err, 'ошибки на странице (лодка)');
    await bp.close();
    console.log(`  лодка: разгон ${run.d.toFixed(0)} м за 4 с, из бухты в море за ${(out1.t + sea.t).toFixed(0)} с, к маяку за ${toLight.t} с, домой за ${home.t} с`);
  }

  // погода, задания дня и заплыв на время
  {
    const wp = await open(browser, 'q=low&norender&h=13&w=rain', 'weather');
    await wp.fill('#nm', 'Погода');
    await G(wp, () => { RYBAK.profile.seenIntro = true; });
    await wp.click('[data-a="solo"]');
    await wp.waitForFunction(() => RYBAK.state === 'lobby');
    // в лобби есть вкладка «Задания», в ней три задания на сегодня
    assert.match(await wp.textContent('.nav'), /ЗАДАНИЯ/);
    await wp.click('.nav [data-p="quests"]');
    assert.equal(await wp.locator('.qcard').count(), 3);
    await wp.keyboard.press('Escape');
    await G(wp, () => RYBAK.enterWorld());
    await wp.waitForFunction(() => RYBAK.state === 'world');
    await G(wp, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; });
    // дождь: струи идут, на воде круги, даль съедена, небо затянуто, клёв выше — и это написано рядом с часами
    await wp.waitForFunction(() => /дождь/i.test(document.querySelector('#wxName').textContent), null, { timeout: 10000 });
    const rain = await G(wp, () => { const g = RYBAK, w = g.world; return { kind: g.weather.kind, mesh: w.rain.mesh.visible, rings: w.water.uniforms.uRain.value, far: w.scene.fog.far, cover: w.skyU.uCover.value, bite: g.fishing.wx(), chip: document.querySelector('.hud-tl .loc').textContent, off: !document.querySelector('#wxIc svg') }; });
    assert.ok(rain.kind === 'rain' && rain.mesh && rain.rings > 0.95 && rain.far < 700 && rain.cover > 0.95 && !rain.off, JSON.stringify(rain));
    assert.equal(rain.bite, 1.3);
    assert.match(rain.chip, /дождь.*клёв \+30%/i);
    await shot(wp, '30-rain', 300);
    // туман ложится плавно; распогодилось — у часов снова «Ясно» со своим значком (погода у часов видна всегда)
    await G(wp, () => { RYBAK.forceWx = 'fog'; });
    await wp.waitForFunction(() => RYBAK.world.wx.fog > 0.9 && RYBAK.world.wx.rain < 0.1 && RYBAK.world.scene.fog.far < 260 && !RYBAK.world.rain.mesh.visible, null, { timeout: 30000 });
    await wp.waitForFunction(() => /туман/i.test(document.querySelector('#wxName').textContent));
    await shot(wp, '31-fog', 200);
    await G(wp, () => { RYBAK.forceWx = 'clear'; });
    await wp.waitForFunction(() => RYBAK.world.wx.fog < 0.05 && RYBAK.world.scene.fog.far > 1500 && /^Ясно$/.test(document.querySelector('#wxName').textContent) && !!document.querySelector('#wxIc svg'), null, { timeout: 30000 });

    // задания: улов и продажа двигают счёт, награда приходит сразу, в углу экрана видно, что осталось
    const q0 = await G(wp, () => {
      const g = RYBAK;
      g.profile.quests.list = [{ k: 'fish', n: 1, c: 0, tier: 0, done: false }, { k: 'sell', n: 5, c: 0, tier: 1, done: false }, { k: 'tour', n: 1, c: 0, tier: 2, done: false }];
      g.profile.quests.bonus = false;
      g.ui.questTracker();
      return { coins: g.profile.coins, rows: document.querySelectorAll('#quests .q').length };
    });
    assert.equal(q0.rows, 3);
    await G(wp, () => RYBAK.fishing.showCatch('okun', 0.5));
    await wp.waitForFunction(() => RYBAK.fishing.state === 'landed' && RYBAK.fishing.landT > 0.5);
    await G(wp, () => RYBAK.fishing.finish(false));
    await wp.waitForFunction(() => RYBAK.profile.quests.list[0].done && document.querySelectorAll('#quests .q').length === 2 && /Задание выполнено: Поймать 1 рыбу/.test(document.querySelector('#toasts').textContent));
    assert.equal(await G(wp, () => RYBAK.profile.coins), q0.coins + 25);
    await G(wp, () => RYBAK.sell(null));
    await wp.waitForFunction(() => RYBAK.profile.quests.list[1].done && document.querySelectorAll('#quests .q').length === 1);
    await G(wp, () => RYBAK.input.pressed.add('KeyK'));
    await wp.waitForSelector('.qcard.done');
    assert.equal(await wp.locator('.qcard.done').count(), 2);
    {
      const bars = await G(wp, () => [...document.querySelectorAll('.qcard')].map((c) => { const i = c.querySelector('.pbar i'); return +(i.getBoundingClientRect().width / i.parentElement.getBoundingClientRect().width).toFixed(2); }));
      assert.ok(bars.length === 3 && bars[0] > 0.95 && bars[1] > 0.95 && bars[2] < 0.05, `полосы заданий: выполненные — полные, остальное — по счёту: ${JSON.stringify(bars)}`);
    }
    await shot(wp, '32-quests', 200);
    await wp.keyboard.press('Escape');

    // заплыв на время: выбираем «больше всех рыб» на три минуты, ловим, получаем медаль и приз — и закрываем третье задание
    await G(wp, () => RYBAK.input.pressed.add('KeyT'));
    await wp.waitForSelector('[data-a="tstart"]');
    await wp.click('[data-a="tkind"][data-id="count"]');
    await wp.click('[data-a="tlen"][data-id="180"]');
    assert.match(await wp.textContent('.tourp'), /бронза — 2, серебро — 3, золото — 4/);
    await wp.click('[data-a="tstart"]');
    await wp.waitForFunction(() => RYBAK.tour && !document.querySelector('#tour').classList.contains('hidden') && /СТАРТ ЧЕРЕЗ/.test(document.querySelector('#tour').textContent));
    // до старта улов не считается
    await G(wp, () => RYBAK.tourCatch({ sp: 'okun', w: 0.4 }));
    assert.equal(await G(wp, () => RYBAK.tour.scores.size), 0);
    await wp.waitForFunction(() => RYBAK.tour.begun && /0[0-2]:\d\d/.test(document.querySelector('#tour .t').textContent), null, { timeout: 15000 });
    const coins1 = await G(wp, () => RYBAK.profile.coins);
    for (let k = 0; k < 3; k++) {
      await G(wp, () => RYBAK.fishing.showCatch('okun', 0.4));
      await wp.waitForFunction(() => RYBAK.fishing.state === 'landed' && RYBAK.fishing.landT > 0.5);
      await G(wp, () => RYBAK.fishing.finish(true));
    }
    await wp.waitForFunction(() => /Вы/.test(document.querySelector('#tour').textContent) && /3 рыбы/.test(document.querySelector('#tour').textContent));
    await G(wp, () => RYBAK.tourCatch({ sp: 'boot', w: 0.5, junk: true }));
    assert.equal(await G(wp, () => RYBAK.tour.scores.get(RYBAK.me.id).s.n), 3, 'хлам в зачёт не идёт');
    await shot(wp, '33-tour', 200);
    await G(wp, () => { RYBAK.tour.end = Date.now() - 1; });
    await wp.waitForFunction(() => !RYBAK.tour && RYBAK.lastTour && document.querySelector('.tres'));
    const res = await G(wp, () => ({ ...RYBAK.lastTour, table: RYBAK.lastTour.table.length, coins: RYBAK.profile.coins, stats: RYBAK.profile.stats, quests: RYBAK.profile.quests.list.map((q) => q.done), bonus: RYBAK.profile.quests.bonus, hud: document.querySelector('#tour').classList.contains('hidden'), text: document.querySelector('.tres').textContent }));
    assert.deepEqual([res.medal, res.prize, res.place, res.solo, res.hud], [2, 20, 1, true, true], JSON.stringify(res));
    assert.match(res.text, /СЕРЕБРО/);
    assert.ok(res.coins >= coins1 + 20 + 130 + 50, `приз, награда за третье задание и премия за все три: ${res.coins - coins1}`);
    assert.deepEqual([res.quests, res.bonus, res.stats.tours, res.stats.medals], [[true, true, true], true, 1, 1]);
    await shot(wp, '34-tour-result', 200);
    await wp.keyboard.press('Escape');
    await wp.waitForFunction(() => /все выполнены/i.test(document.querySelector('#quests').textContent));
    assert.ok(!wp.__err, 'ошибки на странице (погода, задания, заплыв)');
    await wp.close();
  }

  // вода и свет на «высоком» качестве: мир отражается в воде, в углах лежит мягкая тень; на «среднем» ничего этого нет — и ничего не ломается
  {
    const hp = await open(browser, 'q=high&norender&h=13', 'light');
    await hp.fill('#nm', 'Свет');
    await hp.click('[data-a="solo"]');
    await hp.waitForFunction(() => RYBAK.state === 'lobby');
    await G(hp, () => RYBAK.enterWorld());
    await hp.waitForFunction(() => RYBAK.state === 'world');
    await G(hp, () => RYBAK.ui.closePanel());
    await shot(hp, '29-light-high', 400);
    await shot(hp, '29-light-high', 100); // второй кадр: отражение уже снято, вода берёт его из буфера
    const lt = await G(hp, () => {
      const g = RYBAK.gfx, p = g.post, r = g.renderer, W = RYBAK.world.water.uniforms;
      const ao = new Uint8Array(p.aoB.width * p.aoB.height * 4);
      r.readRenderTargetPixels(p.aoB, 0, 0, p.aoB.width, p.aoB.height, ao);
      let dark = 0, lit = 0;
      for (let i = 0; i < ao.length; i += 4) { if (ao[i] < 236) dark++; if (ao[i] > 250) lit++; }
      const rf = new Uint16Array(p.refl.width * p.refl.height * 4);
      r.readRenderTargetPixels(p.refl, 0, 0, p.refl.width, p.refl.height, rf);
      let filled = 0;
      for (let i = 0; i < rf.length; i += 4) if (rf[i] || rf[i + 1] || rf[i + 2]) filled++;
      return { ok: g.reflOk, k: W.uReflK.value, same: W.uRefl.value === p.refl.texture, n: ao.length / 4, dark, lit, filled: filled / (rf.length / 4), half: p.refl.width * 2 - p.scene.width };
    });
    assert.ok(lt.ok && lt.k === 1 && lt.same, `вода берёт отражение из буфера: ${JSON.stringify(lt)}`);
    assert.ok(lt.filled > 0.9 && Math.abs(lt.half) <= 1, `буфер отражения в половину кадра и заполнен: ${lt.filled.toFixed(2)}`);
    assert.ok(lt.dark > lt.n * 0.002 && lt.lit > lt.n * 0.6, `тень лежит в углах, а не на всём кадре: тёмных точек ${lt.dark}, светлых ${lt.lit} из ${lt.n}`);
    // резкий разворот: отражение снимается заново сразу, а не через кадр
    const turn = await G(hp, () => {
      const g = RYBAK;
      const fresh = g.gfx.reflectionStale(g.camera);
      g.camera.rotateY(0.5);
      g.camera.updateMatrixWorld();
      return { fresh, turned: g.gfx.reflectionStale(g.camera) };
    });
    assert.ok(!turn.fresh && turn.turned, `только что снятое отражение годится, после разворота — нет: ${JSON.stringify(turn)}`);
    await G(hp, () => RYBAK.gfx.setQuality('medium'));
    await shot(hp, '29b-light-medium', 100);
    const md = await G(hp, () => ({ post: !!RYBAK.gfx.post, k: RYBAK.world.water.uniforms.uReflK.value, refl: RYBAK.world.water.uniforms.uRefl.value }));
    assert.ok(!md.post && md.k === 0 && md.refl === null, `на «среднем» отражений и буферов нет: ${JSON.stringify(md)}`);
    await G(hp, () => RYBAK.gfx.setQuality('high'));
    await shot(hp, '29c-light-high-again', 100);
    assert.ok(await G(hp, () => RYBAK.gfx.reflOk && RYBAK.world.water.uniforms.uReflK.value === 1), 'вернулись на «высокое» — отражения снова на месте');
    assert.ok(!hp.__err, 'ошибки на странице (вода и свет)');
    await hp.close();
  }

  // живой мир: мальки, рыба у свай и у наживки, всплески, насекомые, мокрые доски в дождь
  {
    const fp = await open(browser, 'q=medium&norender&h=13&ts=3', 'fauna');
    await fp.fill('#nm', 'Натуралист');
    await G(fp, () => { RYBAK.profile.seenIntro = true; });
    await fp.click('[data-a="solo"]');
    await fp.waitForFunction(() => RYBAK.state === 'lobby');
    await G(fp, () => RYBAK.enterWorld());
    await fp.waitForFunction(() => RYBAK.state === 'world');
    await G(fp, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; });
    const st = await G(fp, () => RYBAK.fauna.stats());
    assert.ok(st.shoals >= 12 && st.fry >= 400 && st.loners >= 8, `стайки, мальки и одиночки на месте: ${JSON.stringify(st)}`);
    assert.ok(st.bugs[0] >= 20 && st.bugs[1] >= 40 && st.bugs[2] >= 6, `бабочки, светлячки и стрекозы: ${st.bugs}`);
    // ни одна стайка и ни одна рыба не сидит в камнях, под настилом или на суше
    const bad = await G(fp, () => {
      const F = RYBAK.fauna, out = [];
      const h = (x, z) => { RYBAK.player.place(x, z, 0); return -RYBAK.player.y; }; // глубина; на настиле и на суше — отрицательная
      const keep = [RYBAK.player.x, RYBAK.player.z];
      for (const s of F.shoals) if (!(h(s.x, s.z) > 0.25)) out.push(['стайка', s.x, s.z]);
      for (const o of F.loners) if (o.ok && !(h(o.f.x, o.f.z) > 0.4)) out.push(['рыба', o.f.x, o.f.z]);
      RYBAK.player.place(keep[0], keep[1], 0);
      return out;
    });
    assert.deepEqual(bad, [], 'живность стоит в воде');
    // косяк — настоящая рыба, а не пятна: через полминуты общих часов она выросла в полный размер
    await fp.waitForFunction(() => RYBAK.fauna.list[0].len > 0.4, null, { timeout: 30000 });
    // испуг: что-то плюхнулось в стайку — она шарахается в сторону, потом возвращается
    const sc = await G(fp, async () => {
      const F = RYBAK.fauna, s = F.shoals[0];
      const home = () => [s.x + Math.sin(F.t * s.w1 + s.p1) * s.amp, s.z + Math.sin(F.t * s.w2 + s.p2) * s.amp];
      F.scare(s.cx + 0.6, s.cz, 2.4);
      const fear = s.fear;
      await new Promise((ok) => setTimeout(ok, 500));
      const h = home();
      return { fear, scared: F.stats().scared, away: Math.hypot(s.cx - h[0], s.cz - h[1]), vis: s.vis };
    });
    assert.ok(sc.fear === 1 && sc.scared >= 1 && sc.away > 0.8 && sc.vis > 0.2, `стайка шарахнулась: ${JSON.stringify(sc)}`);
    await fp.waitForFunction(() => RYBAK.fauna.shoals[0].fear === 0 && Math.hypot(RYBAK.fauna.shoals[0].fx, RYBAK.fauna.shoals[0].fz) < 0.6, null, { timeout: 30000 });
    // шаги по воде пугают мелочь так же
    assert.ok(await G(fp, () => { const F = RYBAK.fauna, s = F.shoals[0], p = RYBAK.player; const keep = [p.x, p.z]; p.place(s.cx, s.cz, 0); p.wade = 0.4; p.onStep(false); const f = s.fear; p.wade = 0; p.place(keep[0], keep[1], 0); return f; }) === 1, 'шаг по воде рядом со стайкой её пугает');

    // рыба подходит к наживке: за несколько секунд до поклёвки она уже кружит у поплавка, на поклёвке — у самого крючка
    await G(fp, () => { const g = RYBAK; g.player.place(0, -24.5, 0); g.player.pitch = -0.22; });
    await G(fp, () => {
      const g = RYBAK;
      window.__seen = { come: 0, far: 99, near: 99, bite: 99 };
      window.__fbot = setInterval(() => {
        const f = g.fishing, i = g.input, F = g.fauna, S = F.suitor;
        const d = Math.hypot(S.f.x - f.bx, S.f.z - f.bz);
        if (f.state === 'idle') { i.primary = true; i.pressed.add('Primary'); }
        else if (f.state === 'charge') { if (f.power > 0.9) i.primary = false; }
        else if (f.state === 'wait' && S.st === 'come') { window.__seen.come++; window.__seen.far = Math.min(window.__seen.far, f.biteLeft > 3 ? d : 99); if (f.biteLeft < 1) window.__seen.near = Math.min(window.__seen.near, d); }
        else if (f.state === 'bite') { window.__seen.bite = Math.min(window.__seen.bite, d); if (f.biteT < f.kit.hookWin * 0.45) i.pressed.add('Primary'); }
        else i.primary = false;
      }, 20);
    });
    await fp.waitForFunction(() => RYBAK.fishing.state === 'wait' && RYBAK.fauna.suitor.st === 'come' && RYBAK.fishing.biteLeft < 2.2, null, { timeout: 120000 });
    await shot(fp, '35-fauna-suitor');
    await fp.waitForFunction(() => RYBAK.fishing.state === 'fight' || RYBAK.fishing.state === 'landed', null, { timeout: 60000 });
    const su = await G(fp, () => { clearInterval(window.__fbot); RYBAK.input.primary = false; return { ...window.__seen, st: RYBAK.fauna.suitor.st, len: RYBAK.fauna.suitor.f.len }; });
    assert.ok(su.come > 3 && su.far > 1.2 && su.near < 1.4 && su.bite < 0.7, `рыба подошла издалека и взяла наживку: ${JSON.stringify(su)}`);
    assert.ok(su.st === 'none' && su.len === 0, 'после подсечки её рисует сама рыбалка');

    // рыба играет: расписание общее для комнаты — у двух игроков с одним числом комнаты всплески совпадают
    const jp = await G(fp, async () => {
      const F = RYBAK.fauna, cam = RYBAK.camera, cs = RYBAK.world.scenery.schools.centers;
      const plan = (seed) => { const out = []; for (let k = 0; k < 80; k++) { F.jk = -1; F.plan = null; F.stepJumps(0, seed, k * 11 + 0.001, cs, cam); out.push(F.plan ? +F.plan.at.toFixed(2) : 0); } return out; };
      const a = plan(777), b = plan(777), c = plan(778);
      // а теперь настоящий всплеск рядом с игроком
      let heard = 0;
      const on = F.onSplash; F.onSplash = (x, z, p) => { heard++; on(x, z, p); };
      const n0 = F.jumped;
      F.jk = Math.floor(1e6 / 11);
      F.plan = { at: 1e6, x: RYBAK.player.x - 4, z: RYBAK.player.z - 3, yaw: 1, len: 0.6, tint: 1 };
      F.stepJumps(0.016, 1, 1e6 + 0.01, cs, cam);
      const j = F.jumps.find((q) => q.on);
      let top = -9;
      for (let i = 0; i < 40 && j && j.on; i++) { F.stepJumps(0.02, 1, 1e6 + 0.02, cs, cam); top = Math.max(top, j.f.y); }
      F.jk = -1;
      return { n: a.filter(Boolean).length, same: JSON.stringify(a) === JSON.stringify(b), other: JSON.stringify(a) !== JSON.stringify(c), jumped: F.jumped - n0, top, heard, done: !!j && !j.on && j.f.len === 0 };
    });
    assert.ok(jp.n >= 12 && jp.n <= 60 && jp.same && jp.other, `расписание всплесков зависит только от числа комнаты и часов: ${JSON.stringify(jp)}`);
    assert.ok(jp.jumped === 1 && jp.top > 0.5 && jp.heard === 2 && jp.done, `рыба выпрыгнула, плюхнулась и ушла: ${JSON.stringify(jp)}`);

    // насекомые: днём бабочки и стрекозы, ночью светлячки, в дождь никого
    const bg = await G(fp, async () => {
      const g = RYBAK, u = g.fauna.bugU, w = (ms) => new Promise((ok) => setTimeout(ok, ms));
      const day = [u.uDay.value, u.uNight.value];
      g.fixedHour = 23.5; await w(400);
      const night = [u.uDay.value, u.uNight.value];
      g.fixedHour = 13; g.forceWx = 'rain'; await w(2500);
      return { day, night, dry: u.uDry.value, shown: g.fauna.bugs.visible, rain: g.world.wx.rain };
    });
    assert.ok(bg.day[0] === 1 && bg.day[1] === 0 && bg.night[0] === 0 && bg.night[1] > 0.5, `день и ночь у насекомых: ${JSON.stringify(bg)}`);
    assert.ok(bg.rain > 0.8 && bg.dry === 0 && !bg.shown, `в дождь насекомые прячутся: ${JSON.stringify(bg)}`);
    // дождь мочит доски: намокают быстро, сохнут медленно; под навесами лавки и будки сухо
    await fp.waitForFunction(() => RYBAK.world.wet > 0.6, null, { timeout: 60000 });
    await shot(fp, '36-fauna-wet');
    const wt = await G(fp, async () => {
      const g = RYBAK, w = (ms) => new Promise((ok) => setTimeout(ok, ms));
      const wet = g.world.wet;
      g.forceWx = 'clear'; await w(3000);
      return { wet, after: g.world.wet, rain: g.world.wx.rain, roofs: g.world.rain.uniforms.uRoof.value.length, roofY: g.world.rain.uniforms.uRoofY.value };
    });
    assert.ok(wt.rain < 0.1 && wt.after > wt.wet * 0.6 && wt.after < wt.wet, `дождь кончился, а доски ещё мокрые: ${JSON.stringify(wt)}`);
    assert.ok(wt.roofs === 2 && wt.roofY.every((y) => y > 3.5 && y < 6), 'навесы у дождя заданы');
    assert.ok(!fp.__err, 'ошибки на странице (живой мир)');
    await fp.close();
  }

  // загрузка и скорость: заставка, подбор качества под машину, плавное разрешение, счётчик кадров, проверка компьютера
  {
    const ctx = await browser.newContext({ viewport: { width: 480, height: 270 } });
    const bp = await ctx.newPage();
    bp.on('pageerror', (e) => { console.log('[boot] PAGEERROR', e.message.slice(0, 500)); bp.__err = (bp.__err || 0) + 1; });
    // первый запуск: пока идёт загрузка, на экране заставка с полосой; качество подбирается замером
    await bp.goto(`${BASE}/?norender&boot=full&h=13`);
    assert.ok(await G(bp, () => !!document.querySelector('#boot') && document.querySelector('#bootTxt').textContent.length > 3), 'заставка загрузки на экране');
    await bp.waitForFunction(() => window.RYBAK && window.__frames > 3 && !RYBAK.booting, null, { timeout: 240000 });
    await bp.waitForFunction(() => !document.querySelector('#boot'), null, { timeout: 5000 });
    const c1 = await G(bp, () => ({ calib: RYBAK.calib, q: RYBAK.gfx.quality, scale: RYBAK.gfx.scale, saved: JSON.parse(localStorage.getItem('rybak.settings.v1')).autoQ, gpu: RYBAK.perf.gpu, progs: RYBAK.gfx.renderer.info.programs.length }));
    // в проверке видеокарты нет (отрисовка программная): игра должна сама уйти на «низкое» и уменьшить разрешение
    assert.ok(c1.calib && c1.calib.from === 'measured' && c1.q === 'low' && c1.scale <= 0.75 && c1.calib.ms > 20, `качество подобрано замером: ${JSON.stringify(c1.calib)}`);
    assert.ok(c1.saved && c1.saved.tier === 'low' && c1.saved.gpu === c1.gpu && c1.gpu.length > 3, 'итог запомнен для этой видеокарты');
    // второй запуск: начинаем с запомненного и перепроверяем замером — в обе стороны
    await bp.goto(`${BASE}/?norender&boot=full&h=13`);
    await bp.waitForFunction(() => window.RYBAK && window.__frames > 3 && !RYBAK.booting, null, { timeout: 240000 });
    const c2 = await G(bp, () => ({ calib: RYBAK.calib, q: RYBAK.gfx.quality, scale: RYBAK.gfx.scale }));
    assert.ok(c2.calib.from === 'measured' && c2.calib.log.length === 1 && c2.calib.log[0][0] === 'low' && c2.q === 'low' && c2.scale <= 0.75, `второй запуск — замер с запомненной ступени: ${JSON.stringify(c2)}`);

    // окно ещё без настоящего размера (вкладка не показана): мерить нечего — подбор откладывается и ничего не запоминает
    {
      const zp = await ctx.newPage();
      zp.on('pageerror', (e) => { console.log('[zero] PAGEERROR', e.message.slice(0, 300)); bp.__err = (bp.__err || 0) + 1; });
      await zp.addInitScript(() => localStorage.removeItem('rybak.settings.v1'));
      await zp.setViewportSize({ width: 120, height: 90 }); // окно ещё не развернулось
      await zp.goto(`${BASE}/?norender&boot=full&h=13`);
      await zp.waitForFunction(() => window.RYBAK && window.__frames > 3 && !RYBAK.booting, null, { timeout: 240000 });
      const z = await G(zp, () => ({ calib: RYBAK.calib, saved: (JSON.parse(localStorage.getItem('rybak.settings.v1') || '{}')).autoQ || null }));
      assert.ok(z.calib && z.calib.from === 'skipped' && z.saved === null, `без размера окна замер не делается: ${JSON.stringify(z)}`);
      await zp.close();
    }

    // плавное разрешение на ходу: кадры долгие — буфер меньше; идёт ровно — возвращается
    await bp.setViewportSize({ width: 1280, height: 720 });
    await bp.waitForTimeout(300);
    const tn = await G(bp, async () => {
      const g = RYBAK, gf = g.gfx, cv = gf.renderer.domElement;
      // tune решает, а вниз идёт только после проверки настоящей цены кадра (в игре — на двух следующих кадрах); здесь применяем сразу.
      // Само разрешение игра меняет в начале следующего кадра, до отрисовки (иначе экран мигает пустым кадром, см. test/frames.cjs) —
      // здесь кадры не идут, поэтому делаем то же, что она делает в начале кадра.
      const feed = (ms, n) => {
        for (let i = 0; i < n; i++) {
          g.tune(ms);
          if (g.tunePlan) { g.applyTune(g.tunePlan.out); g.tunePlan = null; }
          if (g.scaleNext) { const k = g.scaleNext; g.scaleNext = 0; if (gf.setScale(k)) g.saveAuto(); }
        }
      };
      g.noRender = false; // в проверке кадры идут по команде — автоподбор включаем вручную
      gf.setScale(1);
      window.__render = true; await new Promise((ok) => setTimeout(ok, 100));
      const full = [cv.width, cv.height];
      feed(40, 200);
      const low = [cv.width, cv.height], sLow = gf.scale, saved = JSON.parse(localStorage.getItem('rybak.settings.v1')).autoQ.scale;
      feed(16, 4000);
      const back = gf.scale;
      g.noRender = true;
      return { full, low, sLow, saved, back, q: gf.quality };
    });
    assert.ok(tn.full[0] === 1280 && tn.low[0] < 1100 && tn.sLow <= 0.75 && tn.q === 'low', `кадры долгие — рисуем мельче: ${JSON.stringify(tn)}`);
    assert.ok(Math.abs(tn.saved - tn.sLow) < 0.02 && tn.back > tn.sLow + 0.1, `разрешение запомнено и возвращается, когда полегчало: ${JSON.stringify(tn)}`);
    // браузер сам держит 30 кадров в секунду (режим экономии), а кадр на деле лёгкий — картинку не трогаем
    const eco = await G(bp, async () => {
      const g = RYBAK, gf = g.gfx;
      gf.setScale(1);
      g.tuner.hold = 0;
      g.noRender = false;
      for (let i = 0; i < 40 && !g.tunePlan; i++) g.tune(34);
      g.noRender = true;
      const planned = !!g.tunePlan;
      // подменяем «цену кадра» на два кадра: часы стоят, видеокарту ждать не надо — кадр будто бы мгновенный
      const gl = gf.renderer.getContext(), rp = gl.readPixels, now = performance.now, t = now.call(performance);
      performance.now = () => t;
      gl.readPixels = function () {};
      await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
      performance.now = now;
      gl.readPixels = rp;
      return { planned, scale: gf.scale, hold: g.tuner.hold, plan: g.tunePlan };
    });
    assert.ok(eco.planned && eco.scale === 1 && eco.hold > 10 && eco.plan === null, `кадр лёгкий, а частота низкая — разрешение не трогаем: ${JSON.stringify(eco)}`);

    // счётчик кадров по F3 и строчка в настройках
    await bp.keyboard.press('F3');
    await bp.waitForSelector('#perfBox');
    assert.match(await bp.textContent('#perfBox'), /к\/с/);
    assert.ok(await G(bp, () => JSON.parse(localStorage.getItem('rybak.settings.v1')).fps === true));
    await bp.keyboard.press('F3');
    assert.equal(await bp.locator('#perfBox').count(), 0);
    await bp.click('.tfoot [data-a="settings"]');
    await bp.waitForSelector('.set');
    const setTxt = await bp.textContent('.center');
    assert.ok(/Плавное разрешение/.test(setTxt) && /Счётчик кадров/.test(setTxt) && /ПРОВЕРКА КОМПЬЮТЕРА/.test(setTxt) && /сейчас: низкая/.test(setTxt), 'в настройках — плавное разрешение, счётчик, проверка и что подобрано на «авто»');
    await shot(bp, '37-settings-perf');
    // выбрали качество сами — разрешение полное, автоподбор ступень не трогает
    await bp.selectOption('[data-set="quality"]', 'medium');
    assert.deepEqual(await G(bp, () => [RYBAK.gfx.quality, RYBAK.gfx.scale, RYBAK.auto]), ['medium', 1, false]);
    await bp.selectOption('[data-set="quality"]', 'auto');
    assert.equal(await G(bp, () => RYBAK.gfx.quality), 'low', 'вернулись на «авто» — к тому, что подобрано');
    await bp.keyboard.press('Escape');

    // проверка компьютера: четыре вида, цена кадра, отчёт текстом — его можно скопировать и прислать
    await bp.setViewportSize({ width: 480, height: 270 });
    const bn = await G(bp, async () => {
      const steps = [];
      const r = await RYBAK.bench((k, name) => steps.push(name), { frames: 2, warm: 1, pace: 3 });
      return { steps, rows: r.rows.map((x) => [x.name, x.cost > 0, x.calls, x.tris]), fps: r.fps, text: r.text, verdict: r.verdict, running: RYBAK.benchOn, manual: !!RYBAK.manual, cam: RYBAK.camOverride };
    });
    assert.deepEqual(bn.steps, ['пирс', 'берег', 'заводь', 'море']);
    assert.ok(bn.rows.length === 4 && bn.rows.every((x) => x[1] && x[2] > 20 && x[2] < 260 && x[3] > 1e5), `замер по четырём видам: ${JSON.stringify(bn.rows)}`);
    assert.ok(/Видеокарта: /.test(bn.text) && /Цена кадра, мс: пирс/.test(bn.text) && /Качество: низкое \(авто\)/.test(bn.text) && bn.verdict.length > 5 && bn.fps > 0, 'отчёт собран');
    assert.ok(/неровных кадров \d+%/.test(bn.text) && /Подбор при загрузке: низкое [\d.]+ мс/.test(bn.text), `в отчёте — ровность хода и чем кончился подбор при загрузке: ${bn.text}`);
    assert.ok(!bn.running && !bn.manual && bn.cam === null, 'после проверки игра идёт как раньше');
    await bp.waitForFunction((f) => window.__frames > f + 3, await G(bp, () => window.__frames), { timeout: 20000 });
    await bp.setViewportSize({ width: 1280, height: 720 });
    await G(bp, () => RYBAK.ui.openPanel('bench'));
    await bp.waitForSelector('.bench .report');
    assert.match(await bp.textContent('.bench .report'), /РЫБАК — проверка компьютера/);
    assert.ok((await bp.locator('.bench [data-a="benchcopy"]').count()) === 1 && (await bp.locator('.bench [data-a="recalib"]').count()) === 1);
    await shot(bp, '38-bench-report');
    await bp.keyboard.press('Escape');

    // мелочь мира: в отражении воды её нет, издали она не рисуется; чайки — один меш на всех
    await bp.fill('#nm', 'Механик');
    await G(bp, () => { RYBAK.profile.seenIntro = true; });
    await bp.click('[data-a="solo"]');
    await bp.waitForFunction(() => RYBAK.state === 'lobby');
    await G(bp, () => RYBAK.enterWorld());
    await bp.waitForFunction(() => RYBAK.state === 'world');
    await bp.waitForFunction(() => RYBAK.world.scenery.smallState().n > 15 && !RYBAK.world.scenery.propsState().fallback, null, { timeout: 120000 });
    const sm = await G(bp, async () => {
      const g = RYBAK, sc = g.world.scenery, w = (ms) => new Promise((ok) => setTimeout(ok, ms));
      g.ui.closePanel();
      const near = sc.smallState();
      g.player.place(-70, -150, 0);
      const up = g.player.update;
      g.player.update = function () { this.x = -70; this.z = -150; g.camera.position.set(-70, 2.3, -150); };
      await w(1500);
      const far = sc.smallState();
      g.player.update = up;
      g.player.place(-2, 9, 0);
      await w(1500);
      const gulls = g.scene.getObjectByName('gulls');
      let mirror = 0, both = 0;
      g.scene.traverse((o) => { if (o.isMesh) (o.layers.mask === 2 ? mirror++ : both++); });
      window.__render = true; await w(300);
      return { near, far, back: sc.smallState(), gulls: gulls && gulls.isInstancedMesh ? gulls.count : 0, mirror, both, cam: g.camera.layers.mask, calls: g.gfx.renderer.info.render.calls };
    });
    assert.ok(sm.near.n > 15 && sm.far.shown < sm.near.n * 0.5 && sm.back.shown > sm.far.shown, `издали мелочь не рисуется, вблизи возвращается: ${JSON.stringify(sm)}`);
    // чаек 22: пять над бухтой, три живут на Чаячьем камне и две стаи по семь над морскими косяками
    assert.ok(sm.gulls === 22 && sm.mirror > 15 && sm.both > 40 && sm.cam === 3, `чайки одним мешем, мелочь на своём слое: ${JSON.stringify(sm)}`);
    assert.ok(sm.calls > 20 && sm.calls < 230, `вызовов отрисовки на «низком» у причала: ${sm.calls}`);

    // открытое море: дальние острова — настоящая суша с лесом, над морскими косяками стаи чаек, по морю ходят дельфины
    await bp.waitForFunction(() => RYBAK.world.scenery.schools.sea.every((c) => c.on > 0.9), null, { timeout: 90000 });
    const sea = await G(bp, async () => {
      const g = RYBAK, sc = g.world.scenery, w = (ms) => new Promise((ok) => setTimeout(ok, ms));
      const names = ['far-crag', 'far-forest-crag', 'far-peak', 'dolphins'].map((n) => { const o = g.scene.getObjectByName(n); return o ? (o.isInstancedMesh ? o.count : o.geometry.attributes.position.count) : 0; });
      // стаи чаек: над каждым морским косяком птицы есть и держатся рядом с ним
      const gulls = g.scene.getObjectByName('gulls');
      const m = new (Object.getPrototypeOf(gulls.matrixWorld).constructor)();
      const flock = sc.schools.sea.map((c, k) => {
        let n = 0, far = 0;
        for (let j = 0; j < 7; j++) {
          gulls.getMatrixAt(8 + k * 7 + j, m);
          const e = m.elements;
          if (Math.hypot(e[0], e[1], e[2]) > 0.5) n++;
          far = Math.max(far, Math.hypot(e[12] - c.x, e[14] - c.z));
        }
        return { n, far, zone: g.areaAt(c.x, c.z) };
      });
      // дельфины: минуту общих часов идём рядом с первой стаей
      const D = g.fauna.dolphins;
      const keep = D.onLeap, leaps0 = D.state(0).leaps;
      let heard = 0, top = -9, low = 9, shown = 0;
      D.onLeap = () => heard++;
      const cam = { position: { x: 0, y: 2, z: 0 } };
      for (let T = 1000; T < 1060; T += 0.05) {
        const p = D.state(T).pods[0];
        cam.position.x = p.x + 20;
        cam.position.z = p.z;
        D.update(0.05, T, T, cam, () => 0, null);
        shown = Math.max(shown, D.state(T).shown);
        for (let i = 0; i < 4; i++) { const q = D.poseAt(i, T); top = Math.max(top, q.y); low = Math.min(low, q.y); }
      }
      D.onLeap = keep;
      const areas = [g.areaAt(96 + 30, -348), g.areaAt(338, 22 + 40), g.areaAt(-262 + 20, -52), g.areaAt(300, -300), g.areaAt(-2, -30)];
      await w(200);
      return { names, flock, dol: { n: D.state(0).n, shown, leaps: D.state(0).leaps - leaps0, heard, top, low }, areas };
    });
    assert.ok(sea.names.every((n) => n > 0) && sea.names[3] === 7, `дальние острова с лесом и дельфины стоят в сцене: ${JSON.stringify(sea.names)}`);
    // косяк ходит по морю и может оказаться у шхер (там место называется по камню, а не «открытое море») — важно, что он не в бухте
    assert.ok(sea.flock.length === 2 && sea.flock.every((f) => f.n === 7 && f.far < 25 && f.zone !== 'bay'), `над каждым морским косяком кружит стая: ${JSON.stringify(sea.flock)}`);
    assert.ok(sea.dol.shown >= 4 && sea.dol.leaps >= 3 && sea.dol.heard === sea.dol.leaps, `дельфины идут стаей и прыгают: ${JSON.stringify(sea.dol)}`);
    assert.ok(sea.dol.top > 1.2 && sea.dol.low < -0.9, `в прыжке дельфин целиком над водой, между выходами — на глубине: ${JSON.stringify(sea.dol)}`);
    assert.deepEqual(sea.areas, ['teeth', 'gullrock', 'westrocks', 'sea', 'bay'], 'у скал в море — свои названия мест');

    // экран игры по макетам (этап 19): место и погода, плашка улова и наживки, чип удочки, компас, мини-карта с маршрутом
    await bp.waitForFunction(() => RYBAK.navReady === true, null, { timeout: 60000 });
    const hud = await G(bp, async () => {
      const g = RYBAK, $ = (s) => document.querySelector(s);
      const frames = (n) => new Promise((ok) => { let k = 0; const f = () => (++k < n ? requestAnimationFrame(f) : ok()); f(); });
      const until = async (fn, ms = 20000) => { const t0 = performance.now(); while (!fn() && performance.now() - t0 < ms) await frames(2); return !!fn(); };
      const vis = (s) => { const e = $(s); return !!e && !e.closest('.hidden') && e.getClientRects().length > 0; };
      g.ui.closePanel();
      g.player.place(0.6, -20, 0);
      await frames(6);
      const out = {
        place: $('#placeName').textContent, loc: $('.hud-tl .loc').textContent, cap: $('#locName').textContent, bag: $('#bagN').textContent, bait: $('#baitN').textContent, rod: $('#rodName').textContent,
        solo: $('#onlineN').textContent, map: [$('#minimap').width, $('#minimap').height], rows: document.querySelectorAll('#hints span').length, keys: document.querySelectorAll('#hints kbd').length,
        font: getComputedStyle($('#placeName')).fontFamily, tilt: getComputedStyle($('#placeName')).fontStyle, body: getComputedStyle($('#clock')).fontFamily, bodyTilt: getComputedStyle($('#fstate')).fontStyle,
        pin: !!$('.place > .ic svg'), wxIcon: !!$('#wxIc svg'), glass: getComputedStyle($('.place')).backgroundImage,
        veil: [document.body.classList.contains('veil'), g.gfx.quality]
      };
      // карта — в правом верхнем углу (над ней — где мы, под ней — команда и кошелёк), плашка улова — слева внизу
      const box = (s) => { const r = $(s).getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
      out.lay = { inTr: !!$('.hud-tr .mapbox') && !!$('.hud-tr #locName'), map: box('.mapbox'), cap: box('#locName'), crew: box('.crewbox'), purse: box('.purse'), tally: box('.tally'), hints: box('#hints'), w: innerWidth, h: innerHeight };
      // прицел: пунктирное кольцо; подпись у точки заброса видна всегда и меняется, когда ведёшь взгляд
      {
        const keep = [g.input.grab, g.input.enabled, g.player.yaw, g.player.pitch];
        g.input.grab = g.input.enabled = true;
        out.aim = { ring: getComputedStyle($('#cross')).borderTopStyle, seen: [] };
        for (const pitch of [-0.5, -0.22, -0.03]) {
          g.player.pitch = pitch;
          await frames(6);
          const l = $('#castMark .lbl');
          out.aim.seen.push({ on: vis('#castMark') && getComputedStyle(l).display !== 'none', text: l.textContent, sub: $('#castMark .sub').textContent.length > 0 });
        }
        out.aim.ptr = getComputedStyle($('#castMark .ring')).borderBottomColor;
        [g.input.grab, g.input.enabled, g.player.yaw, g.player.pitch] = keep;
        await frames(3);
      }
      // палитра (palette.js): в игре — «Тропики»; смена на ходу доходит до воды, дна и дымки и возвращается обратно
      {
        const wat = () => [g.world.water.uniforms.uWat.value.x, g.world.water.uniforms.uWat2.value.x, g.world.scene.fog.far];
        out.pal = { a: [g.setPalette('нет такой'), ...wat()] };
        g.setPalette('now');
        await frames(4);
        out.pal.b = wat();
        out.pal.back = g.setPalette('tropic');
        await frames(4);
        out.pal.c = wat();
      }
      // компас с градусами на месте; в настройках его можно убрать и вернуть
      out.compass = [vis('#compass')];
      for (let i = 0; i < 2; i++) {
        g.ui.openPanel('settings');
        $('[data-a="tog"][data-id="compass"]').click();
        g.ui.closePanel();
        await frames(6);
        out.compass.push(vis('#compass'));
      }
      // маршрут. Пешком без улова идти некуда; с уловом — пунктир к торговцу
      out.none = g.navStep(0.02);
      g.profile.cooler.push({ sp: 'okun', w: 0.4, len: 20 });
      const m = g.navStep(0.02);
      out.market = m && { kind: m.kind, sail: m.sail, len: m.len, n: m.pts.length };
      await frames(4);
      out.distFoot = $('#mapDist').textContent;
      g.profile.cooler.length = 0;
      // в лодке в открытом море: без эхолота — домой, к причалу, и путь идёт по воде
      g.profile.coins = 999;
      g.rentBoat();
      await until(() => g.boat.active);
      const b = g.boat;
      Object.assign(b, { x: 150, z: -250, yaw: 0, v: 0 });
      await until(() => g.area === 'sea');
      g.navKey = '';
      const h = g.navStep(0.02);
      out.home = h && { kind: h.kind, sail: h.sail, len: h.len, n: h.pts.length, end: h.pts[h.pts.length - 1], direct: Math.hypot(150 - 4, -250 + 12) };
      await frames(4);
      out.distBoat = [$('#mapDist').textContent, vis('#mapDist')];
      // с эхолотом — к ближайшему косяку; с полным садком — снова домой
      g.profile.owned.sonar = true;
      g.fishing.refreshGear();
      const sc = g.navStep(0.02);
      out.school = sc && { kind: sc.kind, sail: sc.sail, len: sc.len };
      const cap = g.fishing.kit.bagCap;
      while (g.profile.cooler.length < cap) g.profile.cooler.push({ sp: 'okun', w: 0.4, len: 20 });
      g.ui.refreshHud();
      const full = g.navStep(0.02);
      out.full = full && { kind: full.kind, red: $('.tally .bag').classList.contains('full') };
      g.profile.cooler.length = 0;
      delete g.profile.owned.sonar;
      g.fishing.refreshGear();
      g.ui.refreshHud();
      return out;
    });
    assert.ok(hud.place === 'Солнечная бухта' && /^\d\d:\d\d/.test(hud.loc) && hud.cap === 'БУХТА', `место, время и погода — слева вверху, где мы — над картой: ${JSON.stringify(hud)}`);
    assert.ok(/^\d+ \/ \d+$/.test(hud.bag) && hud.bait.length > 0 && hud.rod.length > 2 && hud.solo === 'Одиночная рыбалка', `улов, наживка, удочка и команда на своих местах: ${JSON.stringify(hud)}`);
    assert.deepEqual(hud.map, [512, 276], 'мини-карта широкая');
    {
      const L = hud.lay;
      assert.ok(L.inTr && L.map.l > L.w * 0.6 && L.map.b < L.h * 0.45 && L.cap.b <= L.map.t + 2 && Math.abs(L.cap.l - L.map.l) < 2, `карта — в правом верхнем углу, подпись места — над ней: ${JSON.stringify(L)}`);
      assert.ok(L.crew.t >= L.map.b && L.purse.t >= L.crew.b && L.purse.b < L.hints.t, `команда и кошелёк — под картой и не доходят до подсказок: ${JSON.stringify(L)}`);
      assert.ok(L.tally.l < L.w * 0.2 && L.tally.t > L.h * 0.8, `плашка улова — слева внизу: ${JSON.stringify(L.tally)}`);
      const A = hud.aim;
      assert.equal(A.ring, 'dashed', 'прицел — пунктирное кольцо');
      assert.ok(A.seen.every((x) => x.on && x.text.length > 3), `подпись у точки заброса видна всегда: ${JSON.stringify(A.seen)}`);
      assert.ok(new Set(A.seen.map((x) => x.text)).size >= 2 && A.seen.some((x) => /не добросить/i.test(x.text)), `подпись меняется на ходу: ${JSON.stringify(A.seen)}`);
      assert.ok(/255,\s*255,\s*255/.test(A.ptr), `указатель над подписью белый, не голубой: ${A.ptr}`);
    }
    assert.ok(hud.rows >= 3 && hud.keys >= 3, `подсказки управления — по строке на действие, с клавишами: ${hud.rows}, ${hud.keys}`);
    // название места — наклонным шрифтом заголовков, с булавкой; время, погода (со значком) и состояние боя — прямым; плашка — из того же стекла, что меню
    assert.ok(/Fira Sans Condensed/.test(hud.font) && hud.tilt === 'italic' && /Onest/.test(hud.body) && hud.bodyTilt === 'normal' && hud.pin && hud.wxIcon && /rgba\((84, 88, 98|72, 76, 86)/.test(hud.glass), `экран игры: шрифты, значки и стекло: ${JSON.stringify({ font: hud.font, tilt: hud.tilt, body: hud.body, bodyTilt: hud.bodyTilt, pin: hud.pin, wxIcon: hud.wxIcon, glass: hud.glass.slice(-120) })}`);
    assert.equal(hud.veil[0], hud.veil[1] !== 'low', `под меню игра размыта везде, кроме «низкого» качества: ${hud.veil}`);
    assert.deepEqual(hud.compass, [true, false, true], 'компас с градусами на месте, убирается и возвращается настройкой');
    assert.ok(hud.pal.a[0] === 'tropic' && hud.pal.a[1] < 0.12 && hud.pal.a[2] > 20 && Math.abs(hud.pal.b[0] - 0.16) < 1e-6 && hud.pal.b[1] === 14 && hud.pal.back === 'tropic' && Math.abs(hud.pal.c[0] - hud.pal.a[1]) < 1e-6 && hud.pal.c[1] === hud.pal.a[2] && Math.abs(hud.pal.c[2] - hud.pal.a[3]) < 1, `палитра игры — «Тропики», меняется на ходу и возвращается: ${JSON.stringify(hud.pal)}`);
    assert.ok(hud.none === null && hud.market && hud.market.kind === 'market' && hud.market.sail === false && hud.market.n === 2 && hud.market.len > 20 && /^\d+ м$/.test(hud.distFoot), `пешком с уловом — к торговцу: ${JSON.stringify([hud.none, hud.market, hud.distFoot])}`);
    assert.ok(hud.home && hud.home.kind === 'home' && hud.home.sail && hud.home.n >= 2 && Math.abs(hud.home.end[0] - 4) < 0.01 && hud.home.len >= hud.home.direct - 1 && hud.home.len < hud.home.direct * 1.5, `из моря маршрут ведёт домой, по воде: ${JSON.stringify(hud.home)}`);
    assert.ok(/^\d+ м$/.test(hud.distBoat[0]) && hud.distBoat[1], `расстояние до цели — на карте: ${hud.distBoat}`);
    assert.ok(hud.school && hud.school.kind === 'school' && hud.school.sail && hud.full && hud.full.kind === 'home' && hud.full.red, `с эхолотом — к косяку, с полным садком — домой: ${JSON.stringify([hud.school, hud.full])}`);
    assert.ok(!bp.__err, 'ошибки на странице (загрузка и скорость)');
    await ctx.close();
  }

  // старое сохранение с персонажем «из частей»: такого персонажа больше нет — игрок получает героя, остальное на месте
  {
    const old = await browser.newPage({ viewport: { width: W, height: H } });
    old.on('pageerror', (e) => { console.log('[old] PAGEERROR', e.message.slice(0, 300)); old.__err = 1; });
    await old.addInitScript(() => { if (!localStorage.getItem('rybak.profile.v1')) localStorage.setItem('rybak.profile.v1', JSON.stringify({ name: 'Старожил', coins: 77, heroSeen: true, look: { body: 3, height: 1.1, hair: 7, hairC: '#e85d9a', hat: 0, top: 4, topC: '#22c55e', hero: '' } })); });
    await old.goto(`${BASE}/?q=low&norender`);
    await old.waitForFunction(() => window.RYBAK && RYBAK.profile.look.hero && RYBAK.meChar.hero, null, { timeout: 60000 });
    const o = await G(old, () => ({ look: RYBAK.profile.look, coins: RYBAK.profile.coins, name: RYBAK.profile.name, shown: RYBAK.meChar.hero.tpl.info.id, h: RYBAK.meChar.look.height }));
    assert.deepEqual(Object.keys(o.look), ['hero'], 'от персонажа из частей в сохранении ничего не осталось');
    assert.ok(heroIds.includes(o.look.hero) && o.shown === o.look.hero, 'вместо него — герой');
    assert.ok(o.coins === 77 && o.name === 'Старожил', 'монеты и имя на месте');
    await old.waitForFunction(() => { const p = JSON.parse(localStorage.getItem('rybak.profile.v1')); return p.look && p.look.hero && Object.keys(p.look).length === 1; }, null, { timeout: 5000 });
    assert.ok(!old.__err, 'ошибки на странице (старое сохранение)');
    await old.close();
  }

  // ── прогресс: своя лодка, открытка с уловом, сохранение в файл и из файла ──
  await progress();
  async function progress() {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
    const pp = await ctx.newPage();
    pp.on('pageerror', (e) => { console.log('[прогресс] PAGEERROR', e.message.slice(0, 300)); pp.__err = 1; });
    await pp.goto(`${BASE}/?q=low&norender&ts=3&h=13`);
    await pp.waitForFunction(() => window.RYBAK && window.__frames > 3, null, { timeout: 60000 });
    await pp.fill('#nm', 'Жамшид');
    await G(pp, () => { RYBAK.profile.seenIntro = true; });
    await pp.click('[data-a="solo"]');
    await pp.waitForFunction(() => RYBAK.state === 'lobby');
    await G(pp, () => RYBAK.enterWorld());
    await pp.waitForFunction(() => RYBAK.state === 'world');
    await G(pp, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; g.player.place(0.9, -12, -Math.PI / 2); });

    // своя лодка: до покупки — прокат за монеты; купили — вымпел на носу, выход без платы, сдавать не нужно
    await pp.waitForFunction(() => /ЛОДКА НАПРОКАТ/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
    const b0 = await G(pp, () => { const g = RYBAK; g.profile.coins = 5000; g.profile.boatTrips = 3; const before = g.boatPrice(); g.buy('boat'); return { before, own: g.ownBoat(), coins: g.profile.coins, rented: g.boat.rented, owner: g.boat.vis.owner, pennant: !!g.boat.vis.pennant, price: g.boatPrice() }; });
    assert.ok(b0.before === 30 && b0.own && b0.coins === 500 && b0.rented && b0.pennant && b0.price === 0 && /^#/.test(b0.owner), `лодка куплена: ${JSON.stringify(b0)}`);
    await pp.waitForFunction(() => /СВОЯ ЛОДКА — В ПУТЬ/.test(document.querySelector('#prompt').textContent), null, { timeout: 20000 });
    await G(pp, () => RYBAK.input.pressed.add('KeyE'));
    await pp.waitForFunction(() => RYBAK.boat.active);
    assert.equal(await G(pp, () => RYBAK.profile.coins), 500, 'за выход на своей лодке не платят');
    // вымпел: на полном ходу вытянут к корме, у причала смотрит по ветру, как флаги на берегу
    const pen = await G(pp, () => { const v = RYBAK.boat.vis, r = () => ({ y: +v.pennant.rotation.y.toFixed(4), w: +v.pennant.userData.wind.value.toFixed(3) }); v.pose(0, -40, 0.3, 1, 1, 0, 0.016); const go = r(); v.pose(0, -40, 0.3, 1, 0, 0, 0.016); return { go, still: r() }; });
    assert.ok(Math.abs(Math.sin(pen.go.y) + 1) < 1e-4 && pen.go.w === 1 && pen.still.w >= 0.75 && pen.still.w < 1 && Math.abs(Math.sin(pen.still.y) + 1) > 0.01, `вымпел на ходу и на стоянке: ${JSON.stringify(pen)}`);
    // ушли в море и вернулись: лодка остаётся своей, в паузе не предлагают её «сдать»
    await G(pp, () => { const g = RYBAK; g.boat.away = true; g.dock(0); });
    const b1 = await G(pp, () => { const g = RYBAK; g.ui.openPanel('pause'); const home = !!document.querySelector('[data-a="home"]'); g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; return { rented: g.boat.rented, away: g.boat.away, active: g.boat.active, toast: document.querySelector('#toasts').textContent, home }; });
    assert.ok(b1.rented && !b1.away && !b1.active && /на своём месте/.test(b1.toast) && !b1.home, `своя лодка дома: ${JSON.stringify(b1)}`);

    // открытка: с уловом в руках — кадр игры с подписью; скачивается файлом, улов при этом ждёт
    await G(pp, () => { const g = RYBAK, f = g.fishing; g.player.place(0, -24.5, 0); g.player.pitch = -0.1; f.kit.net = false; f.showCatch('shuka', 0.9); });
    await pp.waitForFunction(() => RYBAK.fishing.state === 'landed' && !RYBAK.fishing.fly, null, { timeout: 60000 });
    await G(pp, () => RYBAK.input.pressed.add('KeyP'));
    await pp.waitForSelector('.cardview .cardimg', { timeout: 60000 });
    await pp.waitForFunction(() => document.querySelector('.cardimg').naturalWidth > 0, null, { timeout: 20000 });
    const card = await G(pp, () => {
      const k = RYBAK.card, im = document.querySelector('.cardimg');
      // картинка не пустая: в верхней половине (небо, море, рыба) и в нижней (тёмная подложка с подписями) разные цвета
      const g2 = k.cv.getContext('2d'), px = (x, y) => [...g2.getImageData(x, y, 1, 1).data].slice(0, 3);
      const seen = new Set();
      for (let x = 100; x < 1600; x += 150) for (let y = 80; y < 880; y += 100) seen.add(px(x, y).map((v) => v >> 4).join());
      return { file: k.file, size: [k.cv.width, k.cv.height], kind: k.url.slice(0, 23), len: k.url.length, head: k.t.head, sub: k.t.sub, tags: k.t.tags, who: k.t.who, state: RYBAK.fishing.state, nat: [im.naturalWidth, im.naturalHeight], colors: seen.size, corner: px(30, 30), key: document.querySelector('#hints') ? document.querySelector('#hints').textContent : '' };
    });
    assert.deepEqual(card.size, [1600, 900]);
    assert.deepEqual(card.nat, [1600, 900]);
    assert.equal(card.kind, 'data:image/jpeg;base64,');
    assert.ok(card.len > 40000 && card.colors > 12, `открытка не пустая: ${card.len} знаков, цветов ${card.colors}`);
    assert.ok(card.head === 'Щука' && /кг · \d+ см/.test(card.sub) && card.tags.includes('НОВЫЙ ВИД') && card.tags.includes('ТРОФЕЙ') && /^Жамшид · уровень 1/.test(card.who), `подписи: ${JSON.stringify(card)}`);
    assert.match(card.file, /^rybak-щука-\d{4}-\d\d-\d\d\.jpg$/);
    const [dl] = await Promise.all([pp.waitForEvent('download'), pp.click('[data-a="cardsave"]')]);
    assert.equal(dl.suggestedFilename(), card.file);
    await dl.saveAs(`${out}/40-postcard.jpg`);
    assert.ok(fs.statSync(`${out}/40-postcard.jpg`).size > 30000);
    await pp.click('.cardview [data-a="close"]');
    assert.deepEqual(await G(pp, () => [RYBAK.fishing.state, RYBAK.card, RYBAK.ui.panel]), ['landed', null, null], 'после открытки улов всё ещё в руках');
    await G(pp, () => { RYBAK.fishing.finish(false); RYBAK.ui.catchCard(null); });
    // без улова — открытка с видом бухты
    await pp.waitForFunction(() => RYBAK.fishing.state === 'idle');
    await G(pp, () => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.input.pressed.add('KeyP'); });
    await pp.waitForSelector('.cardview .cardimg', { timeout: 60000 });
    assert.deepEqual(await G(pp, () => [RYBAK.card.t.head, RYBAK.card.t.sub, RYBAK.card.t.tags.length]), ['Солнечная бухта', '', 0]);
    await pp.click('.cardview [data-a="close"]');

    // сохранение — файлом: скачали, чужой файл не принят, свой (с другими монетами) заменяет прогресс после подтверждения
    await G(pp, () => RYBAK.ui.openPanel('settings'));
    await pp.click('.center [data-p="save"]');
    await pp.waitForSelector('.savep');
    const [sv] = await Promise.all([pp.waitForEvent('download'), pp.click('[data-a="savefile"]')]);
    assert.match(sv.suggestedFilename(), /^rybak-Жамшид-\d{4}-\d\d-\d\d\.json$/);
    const data = JSON.parse(fs.readFileSync(await sv.path(), 'utf8'));
    assert.ok(data.kind === 'rybak-save' && data.profile.name === 'Жамшид' && data.profile.owned.boat === 1 && data.profile.journal.shuka.n === 1 && data.profile.fresh === undefined, 'в файле — весь прогресс');
    await pp.setInputFiles('#savein', { name: 'чужой.json', mimeType: 'application/json', buffer: Buffer.from('{"привет":1}') });
    await pp.waitForFunction(() => /не файл сохранения/.test(document.querySelector('#toasts').textContent), null, { timeout: 10000 });
    assert.equal(await G(pp, () => RYBAK.pendingSave || null), null);
    data.profile.coins = 4321;
    data.profile.xp = 900;
    await pp.setInputFiles('#savein', { name: 'rybak.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
    await pp.waitForFunction(() => /ЗАМЕНИТЬ ПРОГРЕСС: ЖАМШИД, УРОВЕНЬ \d+\?/.test(document.querySelector('[data-a="loadfile"]').textContent), null, { timeout: 10000 });
    assert.equal(await G(pp, () => RYBAK.profile.coins), 500, 'до подтверждения прогресс прежний');
    await pp.click('[data-a="loadfile"]');
    // игра открывается заново уже с загруженным прогрессом
    await pp.waitForFunction(() => window.RYBAK && window.__frames > 3 && RYBAK.state === 'title' && RYBAK.profile.coins === 4321, null, { timeout: 60000 });
    assert.deepEqual(await G(pp, () => [RYBAK.profile.xp, RYBAK.profile.name, RYBAK.ownBoat(), RYBAK.profile.journal.shuka.n]), [900, 'Жамшид', true, 1]);
    assert.ok(!pp.__err, 'ошибки на странице (прогресс)');
    await ctx.close();
    console.log('  прогресс: своя лодка с вымпелом, открытка с уловом и с видом бухты, сохранение в файл и обратно');
  }

  // сохранение переживает перезагрузку
  await page.waitForTimeout(500);
  const saved = await G(page, () => JSON.parse(localStorage.getItem('rybak.profile.v1')));
  assert.equal(saved.equip.rod, 'rod2');
  assert.equal(saved.name, 'Жамшид');
  await page.reload();
  await page.waitForFunction(() => window.RYBAK && window.__frames > 3);
  assert.equal(await page.inputValue('#nm'), 'Жамшид');
  assert.equal(await G(page, () => RYBAK.profile.equip.rod), 'rod2');
  assert.ok(!page.__err, 'ошибки на странице');
  await browser.close();
  console.log('ОДИНОЧНАЯ ИГРА: всё в порядке');
})().catch((e) => { console.error('ПРОВАЛ:', e.message.split('\n').slice(0, 6).join('\n'), '\n', (e.stack || '').split('\n').filter((l) => l.includes('play.cjs')).slice(0, 2).join('\n')); process.exit(1); });
