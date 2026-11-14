// Локации в настоящем браузере: выбор на заставке, смена мира перезагрузкой, комната помнит локацию,
// друг по ссылке и по коду попадает в нужный мир, озеро собрано и на нём ловится озёрная рыба.
// Запуск: PORT=3111 node test/locations.cjs [папка для снимков]
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = process.argv[2] || '/tmp/rybak-shots';
fs.mkdirSync(out, { recursive: true });
const BASE = `http://127.0.0.1:${process.env.PORT || 3111}`;
const Q = 'q=low&norender&ts=3&h=13';

const ready = (page) => page.waitForFunction(() => window.RYBAK && window.__frames > 3 && !window.RYBAK.booting, null, { timeout: 120000 });
async function open(browser, url, name) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  // 429 — сервер придерживает новые сохранения с одного адреса (проверка открывает пять свежих профилей подряд): к локациям это не относится
  page.on('console', (m) => { if (m.type() === 'error' && !/429/.test(m.text())) console.log(`[${name}] console.error`, m.text().slice(0, 300)); });
  page.on('pageerror', (e) => { console.log(`[${name}] PAGEERROR`, e.message.slice(0, 500)); page.__err = (page.__err || 0) + 1; });
  await page.goto(url);
  await ready(page);
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
const cards = (page) => G(page, () => [...document.querySelectorAll('.locs .loc')].map((e) => [e.dataset.id, e.classList.contains('on'), e.classList.contains('lock')]));
const place = (page) => G(page, () => document.querySelector('#placeName').textContent);
/** Нажать кнопку заставки, после которой страница открывается заново (мир другой локации), и дождаться новой. */
async function clickAndReload(page, sel) {
  await Promise.all([page.waitForNavigation({ timeout: 60000 }), page.click(sel)]);
  await ready(page);
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

  // ── заставка: три карточки, выбрана бухта; новичку озеро и островки закрыты ──
  const a = await open(browser, `${BASE}/?${Q}`, 'А');
  assert.deepEqual(await cards(a), [['bay', true, false], ['lake', false, true], ['keys', false, true]]);
  assert.deepEqual(await G(a, () => [...document.querySelectorAll('.locs .loc b')].map((e) => e.textContent)), ['Солнечная бухта', 'Сосновое озеро', 'Коралловые островки']);
  assert.match(await a.textContent('.locs .lock .lk'), /С 3 УРОВНЯ/);
  assert.equal(await place(a), 'Солнечная бухта');
  const imgs = await G(a, () => [...document.querySelectorAll('.locs .loc img')].map((i) => [i.getAttribute('src'), i.complete && i.naturalWidth]));
  assert.deepEqual(imgs.map((i) => i[0]), ['img/place-bay.webp', 'img/place-lake.webp', 'img/place-keys.webp']);
  assert.ok(imgs.every((i) => i[1] > 300), `картинки локаций загрузились: ${JSON.stringify(imgs)}`);
  // подписи не вылезают за карточку и не наезжают на соседнюю (с тремя карточками названия длиннее карточки)
  const spill = await G(a, () =>
    [...document.querySelectorAll('.locs .loc')].flatMap((c) => {
      const r = c.getBoundingClientRect();
      return [...c.querySelectorAll('b, i')].map((t) => t.getBoundingClientRect()).filter((q) => q.left < r.left - 0.5 || q.right > r.right + 0.5).map((q) => `${c.dataset.id}: ${Math.round(q.left)}–${Math.round(q.right)} при карточке ${Math.round(r.left)}–${Math.round(r.right)}`);
    })
  );
  assert.deepEqual(spill, [], 'подписи карточек в своих границах');
  await a.fill('#nm', 'Жамшид');
  await a.click('.locs [data-id="lake"]');
  assert.match(await a.textContent('#terr'), /открывается с 3-го уровня/);
  await a.click('[data-a="solo"]');
  await a.waitForTimeout(500);
  assert.equal(await G(a, () => RYBAK.state), 'title', 'новичок рыбалку на озере не открывает');
  assert.ok(!/loc=lake/.test(a.url()));
  await a.click('[data-a="create"]');
  await a.waitForTimeout(500);
  assert.equal(await G(a, () => RYBAK.state), 'title', 'и комнату на озере не создаёт');
  assert.equal(await G(a, () => sessionStorage.getItem('rybak.go')), null);
  await shot(a, 'loc-01-title-locked');

  // ── третий уровень: озеро открыто. В одиночку — страница открывается заново, уже с озером, и сама начинает рыбалку ──
  await G(a, () => { RYBAK.profile.xp = 400; RYBAK.profile.seenIntro = true; RYBAK.ui.showTitle(); });
  assert.deepEqual(await cards(a), [['bay', false, false], ['lake', true, false], ['keys', false, true]], 'выбор карточки помнится, замка больше нет');
  assert.equal(await a.inputValue('#nm'), 'Жамшид');
  await a.click('.locs [data-id="bay"]');
  await a.click('.locs [data-id="lake"]');
  assert.equal(await a.textContent('#terr'), '');
  await shot(a, 'loc-02-title-pick');
  await clickAndReload(a, '[data-a="solo"]');
  await a.waitForFunction(() => RYBAK.state === 'lobby', null, { timeout: 60000 });
  assert.match(a.url(), /loc=lake/);
  assert.ok(/q=low/.test(a.url()) && /norender/.test(a.url()) && /h=13/.test(a.url()) && !/room=/.test(a.url()), `прочие параметры адреса целы: ${a.url()}`);
  const lk = await G(a, () => {
    const g = RYBAK, sc = g.scene;
    return {
      solo: g.solo, lvl: g.profile.xp, card: document.querySelector('.lcard h2').textContent, img: document.querySelector('.lcard .shot').getAttribute('src'),
      mist: !!sc.getObjectByName('lake-mist'), smoke: !!sc.getObjectByName('lake-smoke'), forest: !!sc.getObjectByName('lake-far-forest'), mountains: !!sc.getObjectByName('mountains'),
      gulls: !!sc.getObjectByName('gulls'), go: sessionStorage.getItem('rybak.go')
    };
  });
  assert.equal(await place(a), 'Сосновое озеро');
  assert.ok(lk.solo && lk.lvl === 400 && /Сосновое озеро/.test(lk.card) && lk.img === 'img/place-lake.webp', `лобби озера: ${JSON.stringify(lk)}`);
  assert.ok(lk.mist && lk.smoke && lk.forest && lk.mountains && !lk.gulls, `мир озера собран (туман, дым, лес, горы; чаек нет): ${JSON.stringify(lk)}`);
  assert.equal(lk.go, null, 'поручение «начать рыбалку» выполнено и забыто');
  await shot(a, 'loc-03-lake-lobby', 600);

  // ── на озере: свои места и своя рыба ──
  await a.click('[data-a="start"]');
  await a.waitForFunction(() => RYBAK.state === 'world');
  await a.waitForFunction(() => document.querySelector('#locName').textContent.length > 0);
  assert.equal(await G(a, () => document.querySelector('#locName').textContent.toUpperCase()), 'ОЗЕРО');
  // утро на озере: над водой туман — и в углу экрана так и написано; к полудню он тает
  await G(a, () => { RYBAK.fixedHour = 7; RYBAK.forceWx = 'clear'; });
  await a.waitForFunction(() => document.querySelector('#wxName').textContent === 'Утренний туман' && RYBAK.scene.getObjectByName('lake-mist').visible, null, { timeout: 20000 });
  await G(a, () => { RYBAK.fixedHour = 13; });
  await a.waitForFunction(() => document.querySelector('#wxName').textContent === 'Ясно' && !RYBAK.scene.getObjectByName('lake-mist').visible, null, { timeout: 20000 });
  // звук места: чаек нет, волна тише, в лесу поют птицы (синтез — три манеры, без ошибок)
  const snd = await G(a, () => { const A = RYBAK.audio; if (A.ctx) for (let i = 0; i < 40; i++) A.bird(A.ctx.currentTime + i * 0.05); return { ...A.site, ctx: !!A.ctx }; });
  assert.deepEqual([snd.gulls, snd.birds, snd.surf, snd.ctx], [false, true, 0.4, true], JSON.stringify(snd));
  const got = await G(a, () => {
    const g = RYBAK, f = g.fishing;
    const fish = new Set(), zones = {}, names = new Set();
    const keep = g.profile.equip.tackle;
    // точки по всему озеру: у свай пирса и мостков избушки, заводь, под водопадами, у камней гряды и островка, над ямой, плёсы
    const pts = [[2.4, -2], [-22, -99], [-40, 10], [-44, 6], [17, -108], [36, -101], [-34, -52], [-30, -44], [-4, -80], [0, -84], [54, -62], [70, -40], [-70, -60], [8, -48], [90, -60], [0.6, -34], [-36, -99], [60, -88]];
    for (const [x, z] of pts) {
      for (const tk of ['worm', 'maggot', 'bread', 'corn', 'live']) {
        g.profile.equip.tackle = tk;
        for (const hour of [6, 13, 20, 1]) {
          for (let i = 0; i < 12; i++) {
            const r = f.probe(x, z, hour);
            if (!r) continue;
            zones[r.spot.zone] = (zones[r.spot.zone] || 0) + 1;
            if (!r.c.junk) fish.add(r.c.sp);
          }
        }
      }
    }
    g.profile.equip.tackle = keep;
    return { fish: [...fish].sort(), zones, land: f.probe(0, 12) };
  });
  const LAKE = ['ersh', 'forel', 'harius', 'karas', 'lesh', 'nalim', 'okun', 'plotva', 'shuka', 'sig', 'som', 'sudak', 'taimen', 'zolforel'];
  assert.ok(got.fish.every((id) => LAKE.includes(id)), `на озере ловится только озёрная рыба: ${got.fish}`);
  assert.ok(got.fish.length >= 12, `почти весь список озера встречается за пару тысяч забросов: ${got.fish}`);
  for (const id of ['ersh', 'harius', 'sig', 'nalim', 'taimen']) assert.ok(got.fish.includes(id), `новый вид ${id} ловится`);
  for (const z of ['backwater', 'falls', 'stones', 'pit', 'pier', 'deep', 'mid', 'shallow']) assert.ok(got.zones[z] > 0, `место «${z}» на озере есть: ${JSON.stringify(got.zones)}`);
  assert.equal(got.land, null, 'на берегу не ловится');
  // рынок озера: в цене — здешняя рыба, торговец рассказывает здешние байки
  const mk = await G(a, () => { const g = RYBAK; const says = new Set(); const t0 = g.t0; for (let i = 0; i < 12; i++) { g.t0 = t0 - i * 40000; says.add(g.vendorLine()); } g.t0 = t0; return { hot: g.market().hot, says: [...says] }; });
  assert.ok(mk.hot.length === 3 && mk.hot.every((id) => LAKE.includes(id)), `в цене на озере: ${mk.hot}`);
  assert.ok(mk.says.length >= 5 && mk.says.some((x) => /Таймень/.test(x)) && !mk.says.some((x) => /арк|кои|угорь/i.test(x)), `торговец: ${mk.says.join(' | ')}`);
  console.log('  рыба озера:', got.fish.join(', '));
  console.log('  места:', JSON.stringify(got.zones));
  // поклёвка с головы пирса: под ней сразу глубина — горное озеро
  await G(a, () => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(0.6, -24, 0); window.__f0 = window.__frames; });
  await a.waitForFunction(() => window.__frames > window.__f0 + 2); // камера встаёт на новое место со следующим кадром
  await G(a, () => RYBAK.fishing.startFight('harius', 0.6, 10));
  await a.waitForFunction(() => RYBAK.fishing.state === 'fight');
  assert.equal(await G(a, () => RYBAK.fishing.spot.zone), 'deep');
  await G(a, () => RYBAK.fishing.toIdle());
  // мостки у избушки на том берегу: с них идём к крыльцу — по настилу, тропинке и поляне; дом и опушка не пускают дальше
  const walk = async (x, z, yaw, ms) => {
    await G(a, ([x, z, yaw]) => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(x, z, yaw); g.input.keys.add('KeyW'); }, [x, z, yaw]);
    await a.waitForTimeout(ms);
    return G(a, () => { const g = RYBAK; g.input.keys.delete('KeyW'); return { x: +g.player.x.toFixed(1), y: +g.player.y.toFixed(1), z: +g.player.z.toFixed(1), area: g.areaAt(g.player.x, g.player.z) }; });
  };
  const porch = await walk(-22, -98, 0, 5000);
  assert.ok(porch.z < -117 && porch.z > -123 && porch.y > 1.8 && porch.area === 'cabin', `от мостков дошли до крыльца избушки: ${JSON.stringify(porch)}`);
  const edge = await walk(-22, -116, Math.PI / 2, 5000);
  assert.ok(edge.x < -37 && edge.x > -42.5, `на запад — до опушки, в лес не пускают: ${JSON.stringify(edge)}`);
  assert.equal(await G(a, () => RYBAK.areaAt(0.6, -24)), 'lake');
  await G(a, () => { const g = RYBAK; g.player.place(-22, -99.5, 0); g.player.pitch = 0.08; });
  await shot(a, 'loc-04b-cabin', 500);
  await G(a, () => { const g = RYBAK; g.player.place(0.6, -24, 0); g.player.pitch = 0.03; });
  await shot(a, 'loc-04-lake-world', 500);
  // ── на лодке к избушке: от домашнего пирса через озеро, мимо ямы, к мосткам на том берегу ──
  await G(a, () => {
    // кадры игры считаем сами: время точное и не зависит от скорости машины (как в test/play.cjs)
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
    window.__sail = (pts, reach = 6, max = 150) => {
      const g = RYBAK;
      const b = g.boat;
      const k = g.input.keys;
      let n = 0;
      let bumps = 0;
      const ob = b.onBump;
      b.onBump = (...x) => { bumps++; ob(...x); };
      const t = window.__run(max, () => {
        const last = n === pts.length - 1;
        const d = Math.hypot(pts[n][0] - b.x, pts[n][1] - b.z);
        if (d < (last ? reach : 9) && ++n >= pts.length) return false;
        const [x, z] = pts[n];
        let da = Math.atan2(-(x - b.x), -(z - b.z)) - b.yaw;
        while (da > Math.PI) da -= 2 * Math.PI;
        while (da < -Math.PI) da += 2 * Math.PI;
        for (const c of ['KeyW', 'KeyS', 'KeyA', 'KeyD']) k.delete(c);
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
  const prompt = (re) => a.waitForFunction((src) => new RegExp(src).test(document.querySelector('#prompt').textContent), re.source, { timeout: 40000 });
  await G(a, () => { const g = RYBAK; g.input.locked = true; g.input.enabled = true; g.player.place(0.95, -12, -Math.PI / 2); });
  await prompt(/ЛОДКА НАПРОКАТ/);
  await G(a, () => RYBAK.input.pressed.add('KeyE'));
  await a.waitForFunction(() => RYBAK.boat.active && RYBAK.player.boat === RYBAK.boat, null, { timeout: 20000 });
  const sail = await G(a, () => window.__sail([[13, -21], [9, -42], [-10, -66], [-21, -91]], 5));
  assert.ok(sail.done && sail.bumps === 0, `дошли до избушки, ни разу не задев ни камня, ни буя: ${JSON.stringify(sail)}`);
  assert.equal(await G(a, () => RYBAK.areaAt(RYBAK.boat.x, RYBAK.boat.z)), 'cabin');
  await G(a, () => window.__run(1.2));
  await prompt(/ПРИЧАЛИТЬ — ИЗБУШКА РЫБАКА/);
  await shot(a, 'loc-04c-boat-cabin', 200);
  await G(a, () => RYBAK.input.pressed.add('KeyE'));
  await a.waitForFunction(() => !RYBAK.boat.active && document.querySelector('#locName').textContent === 'ИЗБУШКА', null, { timeout: 20000 });
  const jetty = await G(a, () => { const g = RYBAK; const p = g.player; return { deck: p.onDeck, y: +p.y.toFixed(2), x: +p.x.toFixed(1), z: +p.z.toFixed(1), moor: g.boat.moor, rented: g.boat.rented }; });
  assert.ok(jetty.deck && Math.abs(jetty.y - 1.1) < 0.05 && jetty.moor === 1 && jetty.rented && Math.abs(jetty.x + 22) < 0.5 && Math.abs(jetty.z + 97.2) < 0.5, `стоим на мостках у избушки: ${JSON.stringify(jetty)}`);
  // с мостков избушки удочкой за 450 монет добрасывают до ямы; с домашнего пирса до неё не достать и лучшей из первых трёх
  const reach = await G(a, () => {
    const f = RYBAK.fishing;
    let cabin = 99, home = 99;
    for (let x = -40; x <= 30; x += 1) for (let z = -110; z <= -50; z += 1) {
      const r = f.probe(x, z);
      if (!r || r.spot.zone !== 'pit') continue;
      cabin = Math.min(cabin, Math.hypot(x + 22, z + 96.5));
      home = Math.min(home, Math.hypot(x - 0.6, z + 27));
    }
    return { cabin: +cabin.toFixed(1), home: +home.toFixed(1) };
  });
  assert.ok(reach.cabin > 16 && reach.cabin < 24 && reach.home > 24, `до ямы: ${JSON.stringify(reach)}`);
  // обратно в лодку и домой
  await prompt(/В ЛОДКУ|ЛОДКА/);
  await G(a, () => RYBAK.input.pressed.add('KeyE'));
  await a.waitForFunction(() => RYBAK.boat.active, null, { timeout: 20000 });
  const back = await G(a, () => window.__sail([[-10, -66], [9, -42], [13, -22], [5.5, -13.5]], 5));
  assert.ok(back.done, `вернулись к домашнему пирсу: ${JSON.stringify(back)}`);
  await G(a, () => window.__run(1.2));
  await prompt(/ПРИЧАЛИТЬ|ВЕРНУТЬ/);
  await G(a, () => RYBAK.input.pressed.add('KeyE'));
  await a.waitForFunction(() => !RYBAK.boat.active, null, { timeout: 20000 });
  await G(a, () => { const g = RYBAK; g.player.place(0.6, -24, 0); g.player.pitch = 0.03; });

  // журнал: сначала рыба этого озера; на вкладке бухты у рыбы написано, где её искать; «вся рыба» — общий список
  await G(a, () => RYBAK.ui.openPanel('journal'));
  await a.waitForSelector('.jstats');
  assert.match(await a.textContent('.jtabs .tab.on'), /Сосновое озеро · 0\/14/);
  assert.equal(await a.locator('.panel .grid .tile').count(), 14);
  assert.match(await a.textContent('.jstats'), /\/43/);
  await a.click('.panel .tile[data-id="harius"]');
  assert.match(await a.textContent('.jdetail'), /водопад/i);
  assert.ok(!/Сосновое озеро —/.test(await a.textContent('.jdetail')), 'у здешней рыбы — просто места');
  await shot(a, 'loc-05-journal');
  await a.click('.jtabs [data-id="bay"]');
  assert.equal(await a.locator('.panel .grid .tile').count(), 25);
  await a.click('.panel .tile[data-id="tunec"]');
  assert.match(await a.textContent('.jdetail'), /Солнечная бухта —/);
  await a.click('.jtabs [data-id="all"]');
  assert.equal(await a.locator('.panel .grid .tile').count(), 43);
  assert.match(await a.textContent('.jtabs .tab.on'), /Вся рыба · 0\/43/);
  await G(a, () => RYBAK.ui.closePanel());

  // ── выйти в меню: страница остаётся на озере (адрес и выбранная карточка) ──
  await G(a, () => RYBAK.leaveRoom());
  await a.waitForFunction(() => RYBAK.state === 'title');
  assert.match(a.url(), /\?loc=lake$/);
  assert.deepEqual(await cards(a), [['bay', false, false], ['lake', true, false], ['keys', false, true]]);

  // ── комната на озере: создаётся с этой же страницы; в адресе код и локация ──
  await a.click('[data-a="create"]');
  await a.waitForFunction(() => RYBAK.state === 'lobby' && RYBAK.code.length === 4, null, { timeout: 30000 });
  const code = await G(a, () => RYBAK.code);
  assert.match(a.url(), new RegExp(`\\?room=${code}&loc=lake$`));
  console.log('  комната на озере', code);
  // сервер знает, где комната: об этом можно спросить, не входя в неё
  const peek = await G(a, (code) => new Promise((ok, bad) => {
    const ws = new WebSocket(`ws://${location.host}/ws`);
    ws.onopen = () => ws.send(JSON.stringify({ t: 'peek', code }));
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.t === 'peek') { ws.close(); ok(m); } };
    setTimeout(() => bad(new Error('сервер не ответил')), 8000);
  }), code);
  assert.deepEqual([peek.exists, peek.loc, peek.players], [true, 'lake', 1], JSON.stringify(peek));

  // друг-новичок открывает ссылку без локации (как старую): мир бухты, вход — и страница сама открывается с озером
  const b = await open(browser, `${BASE}/?room=${code}&${Q}`, 'Б');
  assert.equal(await place(b), 'Солнечная бухта');
  assert.match(await b.textContent('.tcard .btn.pri'), new RegExp(code));
  await b.fill('#nm', 'Нори');
  await G(b, () => { RYBAK.profile.seenIntro = true; });
  await clickAndReload(b, '[data-a="join"]');
  await b.waitForFunction(() => RYBAK.state === 'lobby' && RYBAK.players.size === 1, null, { timeout: 60000 });
  assert.match(b.url(), new RegExp(`room=${code}`));
  assert.match(b.url(), /loc=lake/);
  assert.ok(await G(b, () => RYBAK.noRender === true), 'страница открылась заново с теми же параметрами (в адресе после входа остаются только комната и локация)');
  assert.equal(await place(b), 'Сосновое озеро');
  assert.equal(await G(b, () => RYBAK.profile.xp), 0, 'в гости на озеро пускают с любым уровнем');
  await a.waitForFunction(() => RYBAK.players.size === 1 && [...RYBAK.players.values()][0].card.name === 'Нори' && [...RYBAK.players.values()][0].mode === 'lobby', null, { timeout: 30000 });
  await a.waitForTimeout(1500);
  assert.equal(await G(a, () => RYBAK.players.size), 1, 'у хозяина один гость, а не два: место вернулось по жетону');
  assert.match(await a.textContent('.codepill'), new RegExp(`КОД ${code}.*2/8`));
  await shot(a, 'loc-06-lake-coop-lobby', 600);

  // третий вводит код на обычной странице: тот же путь, что и по старой ссылке
  const c = await open(browser, `${BASE}/?${Q}`, 'В');
  await c.fill('#nm', 'Пип');
  await c.fill('#code', code);
  await clickAndReload(c, '[data-a="joincode"]');
  await c.waitForFunction(() => RYBAK.state === 'lobby' && RYBAK.players.size === 2, null, { timeout: 60000 });
  assert.equal(await place(c), 'Сосновое озеро');
  await a.waitForFunction(() => RYBAK.players.size === 2, null, { timeout: 30000 });
  // ссылка-приглашение у гостя — уже с локацией
  const link = await G(c, async () => { let text = ''; navigator.clipboard.writeText = async (t) => { text = t; }; RYBAK.copyLink(); await new Promise((ok) => setTimeout(ok, 150)); return text; });
  assert.match(link, new RegExp(`/\\?room=${code}&loc=lake$`), `ссылка-приглашение: ${link}`);
  await c.close();

  // четвёртый открывает ссылку с локацией: сразу нужный мир, без второй загрузки
  const d = await open(browser, `${BASE}/?room=${code}&loc=lake&${Q}`, 'Г');
  assert.equal(await place(d), 'Сосновое озеро');
  await d.fill('#nm', 'Тося');
  await d.click('[data-a="join"]');
  await d.waitForFunction(() => RYBAK.state === 'lobby' && RYBAK.players.size >= 2, null, { timeout: 30000 });
  assert.match(d.url(), new RegExp(`\\?room=${code}&loc=lake$`));

  // ── вдвоём на озере: друг виден на своём месте, улов друга приходит с названием рыбы озера ──
  await a.click('[data-a="start"]');
  await a.waitForFunction(() => RYBAK.state === 'world');
  await b.click('[data-a="start"]');
  await b.waitForFunction(() => RYBAK.state === 'world');
  await a.waitForFunction(() => { const p = [...RYBAK.players.values()].find((q) => q.card.name === 'Нори'); return p && p.mode === 'world' && p.st; }, null, { timeout: 30000 });
  await G(b, () => { const g = RYBAK; g.player.place(0.6, -24, 0); g.fishing.showCatch('taimen', 0.9); });
  await a.waitForFunction(() => /Нори/.test(document.querySelector('#feed').textContent) && /таймен/i.test(document.querySelector('#feed').textContent), null, { timeout: 20000 });
  await b.waitForFunction(() => RYBAK.fishing.state === 'landed' && RYBAK.fishing.landT > 0.5);
  await G(b, () => RYBAK.fishing.finish(false));
  assert.ok(await G(b, () => !!RYBAK.profile.journal.taimen), 'таймень записан в журнал');

  // ── с озера — в бухту: создать комнату там. Страница открывается заново уже без локации в адресе ──
  await d.close();
  const e = await open(browser, `${BASE}/?loc=lake&${Q}`, 'Д');
  await G(e, () => { RYBAK.profile.xp = 400; RYBAK.ui.showTitle(); });
  assert.deepEqual(await cards(e), [['bay', false, false], ['lake', true, false], ['keys', false, true]]);
  await e.fill('#nm', 'Мила');
  await e.click('.locs [data-id="bay"]');
  await clickAndReload(e, '[data-a="create"]');
  await e.waitForFunction(() => RYBAK.state === 'lobby' && RYBAK.code.length === 4, null, { timeout: 60000 });
  assert.ok(!/loc=/.test(e.url()) && /room=/.test(e.url()) && (await G(e, () => RYBAK.noRender === true)), `комната в бухте — адрес без локации: ${e.url()}`);
  assert.equal(await place(e), 'Солнечная бухта');
  assert.notEqual(await G(e, () => RYBAK.code), code);
  assert.ok(await G(e, () => !!RYBAK.scene.getObjectByName('gulls') && !RYBAK.scene.getObjectByName('lake-mist')), 'мир бухты: чайки на месте, озёрного тумана нет');

  for (const p of [a, b, e]) assert.ok(!p.__err, 'ошибок на страницах не было');
  // смена локации открывает страницу заново посреди отправки сохранения — оно не должно «разойтись» само с собой
  for (const p of [a, b, e]) assert.notEqual(await G(p, () => RYBAK.cloud.state), 'clash', 'сохранение на сервере не разошлось');
  await browser.close();
  console.log('ЛОКАЦИИ: всё в порядке');
})().catch((e) => {
  console.error('ПРОВАЛ:', e.message);
  process.exit(1);
});
