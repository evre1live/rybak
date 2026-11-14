// Проверка «прогрева»: после заставки игра не должна собирать шейдеры на ходу — каждая сборка посреди игры это рывок.
// Идём по игре (заставка, лобби днём и ночью, бухта, заброс, подсечка, вываживание, рыба в руках, ночь, дождь, туман)
// и считаем, сколько шейдеров собрано и сколько текстур отправлено видеокарте на каждом шаге.
// Запуск: PORT=3111 node test/warm.cjs [low|medium|high] [локация]   (по умолчанию medium, бухта; локация — например lake)
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const BASE = `http://127.0.0.1:${process.env.PORT || 3111}`;
const tier = process.argv[2] || 'medium';
const loc = process.argv[3] || ''; // другая локация — свой мир и свои шейдеры (туман, дым, водяная пыль): их тоже собирают за заставкой

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await browser.newPage({ viewport: { width: 480, height: 270 } });
  let errors = 0;
  p.on('pageerror', (e) => { errors++; console.log('PAGEERROR', e.message.slice(0, 600)); });
  await p.goto(`${BASE}/?norender&boot=full&ts=3&q=${tier}&h=13${loc ? '&loc=' + loc : ''}`);
  await p.waitForFunction(() => window.RYBAK && window.__frames > 3 && !RYBAK.booting, null, { timeout: 600000 });
  const frame = async (n = 1) => {
    for (let i = 0; i < n; i++) {
      const before = await p.evaluate(() => { window.__render = true; return window.__rendered || 0; });
      await p.waitForFunction((x) => (window.__rendered || 0) > x, before, { timeout: 300000 });
    }
  };
  // считаем сборки шейдеров и отправки текстур
  await p.evaluate(() => {
    const gl = RYBAK.gfx.renderer.getContext();
    window.__made = 0;
    window.__tex = 0;
    const cp = gl.createProgram;
    gl.createProgram = function () { window.__made++; return cp.apply(this, arguments); };
    for (const k of ['texImage2D', 'texStorage2D']) {
      const f = gl[k];
      gl[k] = function () { window.__tex++; return f.apply(this, arguments); };
    }
  });
  const rows = [];
  const mark = async (label) => {
    const r = await p.evaluate(() => {
      const ps = RYBAK.gfx.renderer.info.programs;
      window.__seen = window.__seen || new Set();
      const fresh = [];
      for (const x of ps) if (!window.__seen.has(x.id)) { window.__seen.add(x.id); if (window.__first) fresh.push(x.type + (x.name ? ' ' + x.name.slice(0, 30) : '') + ' [' + String(x.cacheKey).split(',').pop().slice(0, 20) + ']'); }
      const o = { made: window.__made, tex: window.__tex, st: RYBAK.fishing.state, progs: ps.length, fresh };
      window.__first = true;
      window.__made = 0;
      window.__tex = 0;
      return o;
    });
    rows.push({ label, ...r });
    console.log(`  ${label.padEnd(30)} шейдеров ${String(r.made).padStart(2)} · текстур ${String(r.tex).padStart(2)} · всего программ ${r.progs}`);
    for (const f of r.fresh) console.log('        + ' + f);
    return r;
  };
  const row = (label) => rows.find((x) => x.label === label);
  console.log(`ПРОГРЕВ, качество «${tier}»${loc ? ', локация ' + loc : ''}`);
  // заставка ждёт модели, но не те, которых на локации нет: ожидание кончается само, а не по истечении двенадцати секунд
  const waits = await p.evaluate(() => RYBAK.bootWaits);
  console.log(`  заставка ждала модели ${(waits / 10).toFixed(1)} с`);
  assert.ok(waits < 115, `заставка дождалась моделей, а не истечения времени: ${waits}`);
  // предметы стоят на мостках или на земле, а не висят над водой (ящики маяка бухты однажды попали в море Синего простора)
  assert.deepEqual(await p.evaluate(() => RYBAK.world.scenery.strayProps()), [], 'нет предметов над водой');
  await mark('после заставки');
  await frame(2);
  await mark('заставка, два кадра');

  // Набор источников света у сцены один на всю игру: день, ночь, лобби и редактор рисуются одними шейдерами.
  // (Раньше погашенные фонари и подсветку героя убирали из набора — и каждая смена набора давала рывок.)
  const boot = await p.evaluate(() => { const L = []; RYBAK.scene.traverse((o) => { if (o.isLight) L.push(o.visible); }); return { lights: L.length, on: L.filter(Boolean).length, shown: RYBAK.warmShown, warm: RYBAK.warmBox.children.length }; });
  assert.ok(boot.lights >= 8 && boot.on === boot.lights, `все источники света всегда в наборе: ${JSON.stringify(boot)}`);
  assert.ok(boot.shown > 50 && boot.warm >= 3, `за заставкой был «первый показ» спрятанного, заготовки рыбы и хлама на месте: ${JSON.stringify(boot)}`);
  await p.waitForTimeout(3000);
  await frame(2);
  await mark('заставка, три секунды спустя');

  // лобби: днём и ночью
  await p.fill('#nm', 'Прогрев');
  if (loc) await p.evaluate(() => { RYBAK.profile.xp = 5000; }); // локации открываются по уровню
  await p.click('[data-a="solo"]');
  await p.waitForFunction(() => RYBAK.state === 'lobby');
  await p.waitForTimeout(900);
  await frame(3);
  await mark('лобби днём');
  await p.evaluate(() => { RYBAK.fixedHour = 23; });
  await p.waitForTimeout(700);
  await frame(3);
  await mark('лобби ночью');
  await p.evaluate(() => { RYBAK.fixedHour = 13; });
  await p.waitForTimeout(700);
  await frame(2);
  await mark('лобби, снова день');

  // бухта и рыбалка
  await p.click('[data-a="start"]');
  await p.waitForFunction(() => RYBAK.state === 'world');
  await p.click('.center [data-a="close"]').catch(() => {});
  await p.evaluate(() => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(0, -24.5, 0); g.player.pitch = -0.22; });
  await p.waitForTimeout(1200);
  await frame(3);
  await mark('бухта, удочка в руках');
  const bot = (hold) => p.evaluate((hold) => {
    const g = RYBAK;
    clearInterval(window.__bot);
    window.__hold = hold;
    window.__land = false;
    window.__hook = null;
    window.__bot = setInterval(() => {
      const f = g.fishing, i = g.input;
      if (f.state === 'bite') i.pressed.add('Primary');
      else if (f.state === 'fight') {
        const s = f.fight;
        // в миг подсечки: готовая модель уже на месте или пока процедурная рыба?
        if (!window.__hook) window.__hook = { sp: f.catch.sp, junk: !!f.catch.junk, model: f.fish.userData.model || null, pre: (g.preIds || []).slice(), left: g.preQ ? g.preQ.length : -1 };
        if (window.__hold) s.p = Math.min(s.p, 0.5);
        else if (window.__land) s.p = Math.max(s.p, 0.97); // к рукам: рывки и уходы рыбы назад сюда не пускаем — проверяется прогрев, а не вываживание
        // проверяем прогрев, а не умение вываживать: кадры здесь идут по секунде, и леска рвалась бы сама
        s.strain = 0;
        s.slack = 0;
        s.stuck = 0; // залёгшую рыбу здесь не отрываем — просто не даём залечь
        s.T = Math.min(0.7, Math.max(0.3, s.T));
        i.primary = s.T < 0.55;
      } else if (f.state !== 'wait') i.primary = false;
    }, 30);
  }, hold);
  const cast = async () => {
    await p.evaluate(() => { const i = RYBAK.input; i.primary = true; i.pressed.add('Primary'); });
    await p.waitForFunction(() => RYBAK.fishing.state === 'charge' && RYBAK.fishing.power > 0.7);
    await p.evaluate(() => { RYBAK.input.primary = false; });
    await p.waitForFunction(() => RYBAK.fishing.state === 'wait', null, { timeout: 20000 });
  };
  const fishOnce = async (n) => {
    await cast();
    await frame(2);
    await mark(`${n}: поплавок на воде`);
    // пока поплавок на воде, подгружаются модели тех, кто здесь клюёт
    const pre = await p.evaluate(() => ({ ids: RYBAK.preIds, left: RYBAK.preQ.length }));
    assert.ok(pre.ids.length >= 5 && pre.ids.some((x) => x.startsWith('fish-')) && pre.ids.includes('junk-boot'), `подгрузка назначена: ${JSON.stringify(pre)}`);
    await bot(true);
    await p.waitForFunction(() => RYBAK.fishing.state === 'fight', null, { timeout: 240000 });
    await mark(`${n}: ожидание и подгрузка`);
    await frame(3);
    await mark(`${n}: подсечка, рыба на леске`);
    await p.waitForTimeout(2000);
    await frame(3);
    await mark(`${n}: вываживание`);
    await p.evaluate(() => { window.__hold = false; window.__land = true; if (RYBAK.fishing.fight) RYBAK.fishing.fight.p = 0.97; });
    await p.waitForFunction(() => RYBAK.fishing.state === 'landed', null, { timeout: 120000 });
    await frame(2);
    await mark(`${n}: рыба летит к рукам`);
    await p.waitForTimeout(1500);
    await frame(2);
    await mark(`${n}: рыба в руках`);
    const hook = await p.evaluate(() => window.__hook);
    await p.evaluate(() => { clearInterval(window.__bot); RYBAK.input.pressed.add('Primary'); });
    await p.waitForFunction(() => RYBAK.fishing.state === 'idle', null, { timeout: 30000 });
    return hook;
  };
  const h1 = await fishOnce(1);
  const h2 = await fishOnce(2);
  console.log('  улов:', h1.sp, h1.model ? '(модель сразу)' : h1.junk ? '(хлам)' : '(сначала процедурная)', '·', h2.sp, h2.model ? '(модель сразу)' : h2.junk ? '(хлам)' : '(сначала процедурная)');
  // подгрузка: всё назначенное загружено; рыба из назначенных встаёт на леску сразу готовой моделью
  await p.waitForFunction(() => RYBAK.preQ.length === 0 && RYBAK.gfx.warmQ.length === 0, null, { timeout: 60000 });
  const ready = await p.evaluate(() => RYBAK.preIds.map((id) => [id, RYBAK.modelReady(id)]));
  assert.ok(ready.every((x) => x[1]), `назначенные модели загружены: ${JSON.stringify(ready)}`);
  const sp = ready.map((x) => x[0]).find((id) => id.startsWith('fish-')).slice(5);
  const inst = await p.evaluate((sp) => { RYBAK.fishing.showCatch(sp, 0.5); const m = RYBAK.fishing.fish.userData.model; RYBAK.fishing.finish(true); return m; }, sp);
  assert.equal(inst, 'fish-' + sp, 'загруженная модель встаёт сразу, без процедурной заглушки');
  await frame(2);
  await mark('показ улова из загруженных');
  // улов на леске (без подсака) и в подсаке: сетка, её рукоять и леска показа собраны заранее — новых шейдеров нет
  for (const net of [false, true]) {
    await p.evaluate(([sp, net]) => { const f = RYBAK.fishing; f.kit.net = net; f.showCatch(sp, 0.5); }, [sp, net]);
    await p.waitForFunction(() => !RYBAK.fishing.fly, null, { timeout: 60000 });
    await frame(3);
    const on = await p.evaluate(() => ({ net: RYBAK.vm.net.group.visible, line: RYBAK.vm.hangLine.line.visible }));
    assert.deepEqual(on, { net, line: !net }, `показ улова ${net ? 'в подсаке' : 'на леске'}: ${JSON.stringify(on)}`);
    await mark(net ? 'улов в подсаке' : 'улов на леске');
    await p.evaluate(() => { RYBAK.fishing.toIdle(); RYBAK.ui.catchCard(null); RYBAK.fishing.refreshGear(); });
    await frame(2);
  }

  // ночь в бухте, непогода
  await p.evaluate(() => { RYBAK.fixedHour = 23; });
  await p.waitForTimeout(700);
  await frame(3);
  await mark('ночь в бухте');
  await p.evaluate(() => { RYBAK.fixedHour = 13; RYBAK.forceWx = 'rain'; });
  await p.waitForTimeout(1500);
  await frame(3);
  await mark('дождь');
  await p.evaluate(() => { RYBAK.forceWx = 'fog'; });
  await p.waitForTimeout(1500);
  await frame(3);
  await mark('туман');
  await p.evaluate(() => { RYBAK.forceWx = 'clear'; });
  await p.waitForTimeout(800);
  await frame(2);
  await mark('снова ясно');
  // рассвет: низкое солнце в кадре — веер лучей (на «низком» качестве их нет); флаги на шестах уже в кадре с первой минуты
  await p.evaluate(() => { const g = RYBAK; g.fixedHour = 5.7; g.player.yaw = Math.atan2(-0.95, -0.31); g.player.pitch = 0.05; });
  await p.waitForTimeout(1500);
  await frame(4);
  const dawn = await p.evaluate(() => { const W = RYBAK.world; return { rays: W.rays.mesh.visible, k: +W.rays.U.uK.value.toFixed(3), sunY: +W.sunDir.y.toFixed(3), flags: W.flags.items.filter((f) => f.visible).length, kelp: W.seabed.stats() }; });
  await mark('рассвет, лучи солнца');
  await p.evaluate(() => { RYBAK.fixedHour = 13; });
  await frame(2);
  await mark('снова день');

  await browser.close();

  // ── что должно быть правдой ──
  const after = rows.slice(rows.findIndex((x) => x.label === 'заставка, два кадра'));
  const made = after.filter((x) => x.made > 0);
  assert.equal(made.length, 0, `после заставки шейдеры не собираются: ${made.map((x) => `${x.label} — ${x.made} (${x.fresh.join('; ')})`).join(' | ')}`);
  for (const n of [1, 2]) {
    for (const step of ['подсечка, рыба на леске', 'вываживание', 'рыба летит к рукам', 'рыба в руках']) {
      const r = row(`${n}: ${step}`);
      const h = n === 1 ? h1 : h2;
      // текстуры: если клюнул тот, кого подгружали (или хлам), к подсечке всё уже у видеокарты
      if (h.junk || h.pre.includes('fish-' + h.sp)) assert.ok(r.tex <= 1, `${r.label}: текстуры уже у видеокарты (отправлено ${r.tex}, улов ${h.sp})`);
    }
  }
  // лучи низкого солнца: на «среднем» и «высоком» видны на рассвете, на «низком» их нет; водорослей — по ступени качества
  assert.equal(dawn.rays, tier !== 'low', `лучи на рассвете: ${JSON.stringify(dawn)}`);
  assert.ok(loc ? dawn.flags >= 2 : dawn.flags === 4, `флаги на месте: ${dawn.flags}`);
  assert.equal(dawn.kelp.kelp, Math.round(dawn.kelp.of * { high: 1, medium: 0.6, low: 0.3 }[tier]), `водорослей по качеству: ${JSON.stringify(dawn.kelp)}`);
  assert.equal(errors, 0, 'ошибок на странице нет');
  console.log(`ПРОГРЕВ «${tier}»${loc ? ' (' + loc + ')' : ''}: всё в порядке — после заставки не собрано ни одного шейдера`);
})().catch((e) => { console.error('ПРОВАЛ:', e.message.split('\n').slice(0, 8).join('\n')); process.exit(1); });
