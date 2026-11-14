// Запекает вид места сверху — картинку для карточки места в лобби (public/img/place-<id>.webp).
// Игра должна быть запущена локально (PORT, по умолчанию 3111). Картинку снимает сама игра: на «высоком» качестве, в ясный день.
//   node tools/bake-place.cjs            — все места
//   node tools/bake-place.cjs bay --try  — без записи в игру: кадр ложится в /tmp, чтобы подобрать точку съёмки
// В конце печатает, где на картинке булавка (в процентах): эти числа стоят в client/ui.js, в описании места (PLACE.pin).
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/img');
// откуда и куда смотрит камера (метры мира), угол обзора, который час; pin — точка мира, куда встаёт булавка (причал, с которого рыбачат)
// loc — локация (?loc=): по умолчанию бухта
const PLACES = {
  bay: { p: [-70, 62, 46], t: [18, 0, -52], fov: 38, hour: 13, pin: [0.6, 1.2, -20] },
  lake: { loc: 'lake', p: [-88, 74, 72], t: [8, 2, -58], fov: 40, hour: 13, pin: [0.6, 1.2, -20] },
  keys: { loc: 'keys', p: [-104, 84, 96], t: [4, 0, -66], fov: 40, hour: 13, pin: [0.6, 1.2, -20] }
};
const W = 1120;
const H = 600;
const args = process.argv.slice(2);
const dry = args.includes('--try');
const ids = args.filter((a) => !a.startsWith('--'));

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 300)));
  fs.mkdirSync(OUT, { recursive: true });
  for (const id of ids.length ? ids : Object.keys(PLACES)) {
    const c = PLACES[id];
    if (!c) {
      console.log('нет такого места:', id);
      continue;
    }
    await page.goto(`http://127.0.0.1:${process.env.PORT || 3111}/?q=high&norender&h=${c.hour}&w=clear${c.loc ? '&loc=' + c.loc : ''}`);
    await page.waitForFunction(() => window.RYBAK && window.__frames > 3, null, { timeout: 120000 });
    await page.fill('#nm', 'Рыбак');
    await page.evaluate(() => { window.RYBAK.profile.xp = 1e6; }); // локации открываются по уровню — снимку это не помеха
    await page.click('[data-a="solo"]');
    await page.waitForFunction(() => window.RYBAK.state === 'lobby');
    // лес и скалы — готовые модели: ждём, пока встанут
    await page.waitForFunction(() => { const e = window.RYBAK.world.scenery.envState(); return e.trees && e.rocks; }, null, { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const r = await page.evaluate(async (c) => {
      const g = window.RYBAK;
      g.manual = true; // кадры — только по нашей команде
      await new Promise((ok) => setTimeout(ok, 80));
      const cam = g.camera;
      cam.position.set(...c.p);
      cam.lookAt(...c.t);
      cam.fov = c.fov;
      cam.updateProjectionMatrix();
      g.world.update(0, g.nowSec(), cam);
      // два кадра: отражение в воде для новой точки снимается на первом
      g.gfx.render(g.scene, cam, g.world.exposure);
      g.gfx.render(g.scene, cam, g.world.exposure);
      const url = g.gfx.renderer.domElement.toDataURL('image/png');
      const v = cam.position.clone().set(...c.pin).project(cam);
      return { url, pin: [(v.x * 0.5 + 0.5) * 100, (-v.y * 0.5 + 0.5) * 100] };
    }, c);
    const png = Buffer.from(r.url.split(',')[1], 'base64');
    const file = dry ? `/tmp/place-${id}.webp` : path.join(OUT, `place-${id}.webp`);
    await sharp(png).resize(960, 514, { fit: 'cover' }).webp({ quality: 84 }).toFile(file);
    console.log(`${id}: ${file} — ${Math.round(fs.statSync(file).size / 1024)} КБ; булавка: [${r.pin.map((x) => x.toFixed(1)).join(', ')}]`);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
