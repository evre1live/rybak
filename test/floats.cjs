// Поплавки настоящего размера (client/gear3d.js: FLOAT_FIT, floatScale; client/gearmodels.js: mountBobModel).
// Каждая модель: стоит стоймя, длина — как в FLOAT_FIT, над водой — своя доля; под кончиком удилища — настоящий
// размер; на воде вблизи — тоже, вдали растёт, чтобы оставаться заметным, но не больше чем втрое; на поклёвке
// уходит под воду. Запуск: PORT=3111 node test/floats.cjs [папка для снимков]
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = process.argv[2] || '/tmp/rybak-floats';
fs.mkdirSync(out, { recursive: true });
const BASE = `http://127.0.0.1:${process.env.PORT || 3111}`;
const G = (page, fn, arg) => page.evaluate(fn, arg);
const near = (a, b, tol) => Math.abs(a - b) <= tol;

(async () => {
  const browser = await chromium.launch({ env: { ...process.env, LC_ALL: 'C.UTF-8', LANG: 'C.UTF-8' }, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  let errors = 0;
  page.on('pageerror', (e) => { console.log('PAGEERROR', e.message.slice(0, 400)); errors++; });
  await page.goto(`${BASE}/?q=low&norender&ts=3&h=12`);
  await page.waitForFunction(() => window.RYBAK && window.__frames > 3 && RYBAK.state === 'title', null, { timeout: 90000 });
  await page.fill('#nm', 'Поплавок');
  await G(page, () => { RYBAK.profile.seenIntro = true; });
  await page.click('[data-a="solo"]');
  await page.waitForFunction(() => RYBAK.state === 'lobby', null, { timeout: 30000 });
  await G(page, () => RYBAK.enterWorld());
  await page.waitForFunction(() => RYBAK.state === 'world');
  await G(page, () => { const g = RYBAK; g.ui.closePanel(); g.input.locked = true; g.input.enabled = true; g.player.place(0, -24.5, 0.32); g.player.pitch = -0.2; });
  await page.waitForTimeout(800);

  const FIT = { float1: [0.065, 0.47], float2: [0.18, 0.76], float3: [0.14, 0.6], float4: [0.14, 0.6], float5: [0.15, 0.56], float6: [0.11, 0.6] };
  for (const [id, [len, wl]] of Object.entries(FIT)) {
    await G(page, (id) => { const f = RYBAK.fishing; if (f.state !== 'idle') f.reelIn(true); RYBAK.profile.equip.float = id; RYBAK.profile.equip.tackle = 'worm'; f.bobId = null; f.refreshGear(); }, id);
    await page.waitForFunction(() => RYBAK.fishing.bob.userData.model && RYBAK.fishing.state === 'idle', null, { timeout: 60000 });
    // модель: размеры в настоящем масштабе, ось — вверх
    const m = await G(page, () => {
      const b = RYBAK.fishing.bob, s = b.userData.real, g = b.userData.model.geometry;
      g.computeBoundingBox();
      const bb = g.boundingBox, P = g.attributes.position;
      // главная ось точек: степенным методом
      let mx = 0, my = 0, mz = 0;
      for (let i = 0; i < P.count; i++) { mx += P.getX(i); my += P.getY(i); mz += P.getZ(i); }
      mx /= P.count; my /= P.count; mz /= P.count;
      const C = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < P.count; i++) {
        const x = P.getX(i) - mx, y = P.getY(i) - my, z = P.getZ(i) - mz;
        C[0] += x * x; C[1] += x * y; C[2] += x * z; C[3] += y * y; C[4] += y * z; C[5] += z * z;
      }
      let v = [0, 1, 0];
      for (let k = 0; k < 40; k++) {
        const n = [C[0] * v[0] + C[1] * v[1] + C[2] * v[2], C[1] * v[0] + C[3] * v[1] + C[4] * v[2], C[2] * v[0] + C[4] * v[1] + C[5] * v[2]];
        const l = Math.hypot(...n);
        v = n.map((a) => a / l);
      }
      return { len: (bb.max.y - bb.min.y) * s, above: bb.max.y * s, wide: Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) * s, tilt: (Math.acos(Math.min(1, Math.abs(v[1]))) * 180) / Math.PI, top: b.userData.top * s };
    });
    assert.ok(near(m.len, len, len * 0.04), `${id}: длина ${m.len.toFixed(3)} м, а надо ${len}`);
    assert.ok(near(m.above, len * (1 - wl), len * 0.04) && near(m.top, m.above, 0.002), `${id}: над водой ${m.above.toFixed(3)} м`);
    assert.ok(m.wide < 0.06, `${id}: толщина ${m.wide.toFixed(3)} м — не шар-буй`);
    assert.ok(m.tilt < 6, `${id}: стоит стоймя (наклон ${m.tilt.toFixed(1)}°)`);
    // под кончиком удилища — настоящий размер
    await page.waitForTimeout(300);
    const hang = await G(page, () => +RYBAK.fishing.bob.scale.x.toFixed(4) === +RYBAK.fishing.bob.userData.real.toFixed(4));
    assert.ok(hang, `${id}: под кончиком — настоящего размера`);
    console.log(`  ${id}: ${(m.len * 100).toFixed(1)} см, над водой ${(m.above * 100).toFixed(1)} см, толщина ${(m.wide * 100).toFixed(1)} см`);
  }

  // заброс: вблизи — настоящий (с небольшой прибавкой, не больше нужного), вдали — крупнее, но не больше втрое; на поклёвке — под водой
  for (const [power, what] of [[0.3, 'вблизи'], [1, 'вдали']]) {
    await G(page, () => { const f = RYBAK.fishing; if (f.state !== 'idle') f.reelIn(true); RYBAK.profile.equip.float = 'float6'; f.bobId = null; f.refreshGear(); });
    await page.waitForFunction(() => RYBAK.fishing.bob.userData.model && RYBAK.fishing.state === 'idle', null, { timeout: 60000 });
    await G(page, () => { const i = RYBAK.input; i.primary = true; i.pressed.add('Primary'); });
    await page.waitForFunction((p) => RYBAK.fishing.state === 'charge' && RYBAK.fishing.power >= p, power, { timeout: 20000 });
    await G(page, () => { RYBAK.input.primary = false; });
    await page.waitForFunction(() => RYBAK.fishing.state === 'wait', null, { timeout: 20000 });
    await G(page, () => { RYBAK.fishing.biteLeft = 999; RYBAK.fishing.nibbles = []; });
    await page.waitForTimeout(1500);
    const w = await G(page, () => {
      const f = RYBAK.fishing, b = f.bob, s = b.scale.x, real = b.userData.real;
      const d = Math.hypot(f.bx - RYBAK.player.x, f.bz - RYBAK.player.z);
      return { d, k: s / real, above: b.userData.top * s, ang: (b.userData.top * s) / d };
    });
    assert.ok(w.k >= 1 && w.k <= 3.0001, `${what}: прибавка ×${w.k.toFixed(2)} — от 1 до 3`);
    assert.ok(w.k === 1 || Math.abs(w.ang - 0.011) < 0.0013 || w.k > 2.99, `${what}: прибавка ровно до заметного размера (${w.ang.toFixed(4)} рад)`);
    console.log(`  заброс ${what}: ${w.d.toFixed(1)} м, ×${w.k.toFixed(2)}, над водой ${(w.above * 100).toFixed(1)} см`);
    await G(page, () => { RYBAK.fishing.biteLeft = 0.05; });
    await page.waitForFunction(() => RYBAK.fishing.state === 'bite', null, { timeout: 20000 });
    await page.waitForFunction(() => { const f = RYBAK.fishing; return f.state !== 'bite' || f.dip < -0.35; }, null, { timeout: 5000 });
    const sub = await G(page, () => { const f = RYBAK.fishing, b = f.bob; return { st: f.state, sunk: f.dip * b.scale.x + b.userData.top * b.scale.x }; });
    assert.ok(sub.st !== 'bite' || sub.sunk < 0, `${what}: на поклёвке поплавок уходит под воду (${sub.sunk.toFixed(3)})`);
  }
  assert.equal(errors, 0, 'ошибок на странице нет');
  await browser.close();
  console.log('ОК: поплавки');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
