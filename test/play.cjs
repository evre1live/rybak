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
    await bp.waitForFunction(() => RYBAK.boat.active && RYBAK.player.boat === RYBAK.boat && /ХОД.*РУЛЬ/.test(document.querySelector('#hints').textContent));
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
    await bp.waitForFunction(() => !RYBAK.boat.active && !RYBAK.boat.rented && RYBAK.boat.net === 0 && document.querySelector('#locName').textContent === 'СОЛНЕЧНАЯ БУХТА' && RYBAK.mapSea === false);
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
    const rain = await G(wp, () => { const g = RYBAK, w = g.world; return { kind: g.weather.kind, mesh: w.rain.mesh.visible, rings: w.water.uniforms.uRain.value, far: w.scene.fog.far, cover: w.skyU.uCover.value, bite: g.fishing.wx(), chip: document.querySelector('.chip.loc').textContent, off: document.querySelector('.chip.loc').classList.contains('wx-off') }; });
    assert.ok(rain.kind === 'rain' && rain.mesh && rain.rings > 0.95 && rain.far < 700 && rain.cover > 0.95 && !rain.off, JSON.stringify(rain));
    assert.equal(rain.bite, 1.3);
    assert.match(rain.chip, /дождь.*клёв \+30%/i);
    await shot(wp, '30-rain', 300);
    // туман ложится плавно; распогодилось — надпись у часов пропадает
    await G(wp, () => { RYBAK.forceWx = 'fog'; });
    await wp.waitForFunction(() => RYBAK.world.wx.fog > 0.9 && RYBAK.world.wx.rain < 0.1 && RYBAK.world.scene.fog.far < 260 && !RYBAK.world.rain.mesh.visible, null, { timeout: 30000 });
    await wp.waitForFunction(() => /туман/i.test(document.querySelector('#wxName').textContent));
    await shot(wp, '31-fog', 200);
    await G(wp, () => { RYBAK.forceWx = 'clear'; });
    await wp.waitForFunction(() => RYBAK.world.wx.fog < 0.05 && RYBAK.world.scene.fog.far > 1500 && document.querySelector('.chip.loc').classList.contains('wx-off'), null, { timeout: 30000 });

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
    await wp.waitForFunction(() => /ВСЕ ВЫПОЛНЕНЫ/.test(document.querySelector('#quests').textContent));
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
    // запомненное годится неделю: потом (и после смены правил подбора) игра меряет заново
    assert.ok(c1.progs > 20, `шейдеры собраны до первого кадра: ${c1.progs}`);
    // второй запуск: берём запомненное, не меряя заново
    await bp.goto(`${BASE}/?norender&boot=full&h=13`);
    await bp.waitForFunction(() => window.RYBAK && window.__frames > 3 && !RYBAK.booting, null, { timeout: 240000 });
    const c2 = await G(bp, () => ({ from: RYBAK.calib && RYBAK.calib.from, q: RYBAK.gfx.quality, scale: RYBAK.gfx.scale }));
    assert.ok(c2.from === 'saved' && c2.q === 'low' && Math.abs(c2.scale - c1.scale) < 0.01, `второй запуск — из запомненного: ${JSON.stringify(c2)}`);
    await G(bp, () => { const k = 'rybak.settings.v1', s = JSON.parse(localStorage.getItem(k)); s.autoQ.t = Date.now() - 8 * 864e5; localStorage.setItem(k, JSON.stringify(s)); });
    await bp.goto(`${BASE}/?norender&boot=full&h=13`);
    await bp.waitForFunction(() => window.RYBAK && window.__frames > 3 && !RYBAK.booting, null, { timeout: 240000 });
    assert.equal(await G(bp, () => RYBAK.calib && RYBAK.calib.from), 'measured', 'запомненному больше недели — замер заново');

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
      // tune решает, а вниз идёт только после проверки настоящей цены кадра (в игре — на следующем кадре); здесь применяем сразу
      const feed = (ms, n) => { for (let i = 0; i < n; i++) { g.tune(ms); if (g.tunePlan) { g.applyTune(g.tunePlan); g.tunePlan = null; } } };
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
    assert.ok(sm.gulls === 5 && sm.mirror > 15 && sm.both > 40 && sm.cam === 3, `чайки одним мешем, мелочь на своём слое: ${JSON.stringify(sm)}`);
    assert.ok(sm.calls > 20 && sm.calls < 230, `вызовов отрисовки на «низком» у причала: ${sm.calls}`);
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
