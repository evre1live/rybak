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
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const page = await open(browser, 'q=low&norender&ts=3&h=13', 'solo');
  await shot(page, '01-title');

  // меню: без имени нельзя
  await page.click('[data-a="solo"]');
  assert.match(await page.textContent('#terr'), /представьтесь/);
  await page.fill('#nm', 'Жамшид');
  await page.click('[data-a="solo"]');
  await page.waitForFunction(() => RYBAK.state === 'lobby');
  await shot(page, '02-lobby', 300);

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
  await shot(page, '04-journal');
  await page.keyboard.press('Escape');
  await page.click('.nav [data-p="editor"]');
  await page.waitForSelector('.editor .opts');
  await shot(page, '05-editor', 400);
  // готовые герои: новичку достаётся один из них, в редакторе можно выбрать другого или собрать своего из частей
  const heroIds = await G(page, () => fetch('models/manifest.json').then((r) => r.json()).then((m) => m.heroes.filter((h) => !h.npc).map((h) => h.id), () => []));
  if (heroIds.length) {
    assert.ok(heroIds.includes(await G(page, () => RYBAK.profile.look.hero)), 'новичок получает готового героя');
    await page.click('.cats [data-id="presets"]');
    assert.equal(await page.locator('.hlist button').count(), heroIds.length, 'все герои в списке');
    const pick = heroIds[heroIds.length - 1];
    await page.click(`.hlist [data-id="${pick}"]`);
    await page.waitForFunction((id) => RYBAK.ui.ed.look.hero === id && RYBAK.meChar.hero && RYBAK.meChar.look.hero === id, pick, { timeout: 60000 });
    assert.ok(await G(page, () => RYBAK.meChar.hero.act.idle && RYBAK.meChar.hero.act.walk && RYBAK.meChar.hero.bones.hR && RYBAK.meChar.j.rod.parent === RYBAK.meChar.hero.grip), 'герой со скелетом, анимациями и удочкой в руке');
    await shot(page, '05b-editor-hero', 400);
    await page.click('.cats [data-id="top"]');
    await page.click('[data-a="nohero"]');
    await page.waitForFunction(() => RYBAK.ui.ed.look.hero === '' && !RYBAK.meChar.hero);
  }
  for (const cat of ['presets', 'face', 'hair', 'head', 'top', 'bottom', 'shoes', 'hands', 'back']) {
    await page.click(`.cats [data-id="${cat}"]`);
    await page.locator(cat === 'presets' ? '.olist button' : '.opts button').nth(1).click();
  }
  await page.click('.cats [data-id="hair"]');
  await page.click('.opts [data-k="hair"][data-id="7"]');
  await shot(page, '06-editor-hair', 300);
  await page.click('[data-a="edsave"]');
  assert.equal(await G(page, () => RYBAK.profile.look.hair), 7);
  assert.equal(await G(page, () => RYBAK.profile.look.hero), '', 'собранный из частей остаётся собранным');

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
        i.primary = s.T < (run ? 0.5 : s.warned ? 0.42 : 0.64);
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
      await G(mp, () => { RYBAK.profile.seenIntro = true; });
      await mp.click('[data-a="solo"]');
      await mp.waitForFunction(() => RYBAK.state === 'lobby');
      await mp.click('[data-a="start"]');
      await mp.waitForFunction(() => RYBAK.state === 'world');
      await mp.waitForFunction(() => { const st = RYBAK.world.scenery.propsState(); return !st.fallback && st.placed >= 20 && st.floaters >= 5; }, null, { timeout: 120000 });
      for (const sp of ['okun', 'skat', 'chest']) {
        await G(mp, (sp) => { RYBAK.ui.closePanel(); RYBAK.fishing.showCatch(sp, 0.5); }, sp);
        await mp.waitForFunction((id) => RYBAK.fishing.fish && (RYBAK.fishing.fish.userData.model === id || (RYBAK.fishing.fish.children[0] && RYBAK.fishing.fish.children[0].userData.model === id) || RYBAK.fishing.fish.userData.model === id), (sp === 'chest' ? 'junk-' : 'fish-') + sp, { timeout: 60000 });
        if (sp === 'okun') await shot(mp, '22-model-fish', 400);
        await G(mp, () => RYBAK.fishing.finish(false));
      }
      // значки из готовых моделей — обычные картинки, которые действительно загружаются
      await G(mp, () => RYBAK.ui.openPanel('journal'));
      await mp.waitForFunction(() => { const im = [...document.querySelectorAll('.tile img')]; return im.length >= 25 && im.every((i) => /models\/icons\/fish-.*\.webp$/.test(i.getAttribute('src')) && i.complete && i.naturalWidth > 0); }, null, { timeout: 60000 });
      await shot(mp, '23-model-journal', 300);
      assert.equal(mp.__err || 0, 0, 'ошибок на странице с моделями нет');
      await mp.close();
      console.log('  модели: предметы расставлены, рыба и сундук в руках, значки в журнале');
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
    assert.ok(!walker.__err, 'ошибки на странице (ходьба)');
    await walker.close();
    console.log('  ходьба: пирс до края, мостки, берег и вода по колено');
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
