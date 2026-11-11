// Запекает значки рыбы и предметов из их моделей и собирает проверочные листы.
// Игра должна быть запущена локально (PORT, по умолчанию 3111).
//   node tools/bake-icons.cjs                 — значки для всех моделей из manifest.json
//   node tools/bake-icons.cjs --sheet лист.png [id…]   — лист «сбоку / три четверти / сверху» для проверки, без записи значков
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/models');
const manPath = path.join(OUT, 'manifest.json');
const args = process.argv.slice(2);
const si = args.indexOf('--sheet');
const sheet = si >= 0 ? args[si + 1] : null;
const ids = args.filter((a, i) => !a.startsWith('--') && !(si >= 0 && i === si + 1));

(async () => {
  const manifest = JSON.parse(fs.readFileSync(manPath, 'utf8'));
  const list = (ids.length ? ids : Object.keys(manifest.props)).filter((id) => manifest.props[id]);
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 300)));
  await page.goto(`http://127.0.0.1:${process.env.PORT || 3111}/?q=low&norender`);
  await page.waitForFunction(() => window.RYBAK && window.RYBAK.modelShot, null, { timeout: 60000 });
  const shot = async (id, view) => Buffer.from((await page.evaluate(([id, view]) => RYBAK.modelShot(id, view), [id, view])).split(',')[1], 'base64');
  if (sheet) {
    const cell = 200;
    const views = ['side', 'three', 'top'];
    const comp = [];
    for (let i = 0; i < list.length; i++) {
      for (let k = 0; k < views.length; k++) comp.push({ input: await sharp(await shot(list[i], views[k])).resize(cell, cell).png().toBuffer(), left: k * cell, top: i * cell });
      const label = Buffer.from(`<svg width="${cell * 3}" height="22" xmlns="http://www.w3.org/2000/svg"><text x="4" y="16" font-family="sans-serif" font-size="14" fill="#fff">${list[i]} ${(manifest.props[list[i]].size || []).join(' × ')}</text></svg>`);
      comp.push({ input: label, left: 0, top: i * cell });
    }
    await sharp({ create: { width: cell * 3, height: cell * list.length, channels: 4, background: '#3b4a63' } }).composite(comp).png().toFile(sheet);
    console.log('лист:', sheet, list.length, 'моделей');
  } else {
    fs.mkdirSync(path.join(OUT, 'icons'), { recursive: true });
    for (const id of list) {
      const info = manifest.props[id];
      const png = await shot(id, info.group === "fish" ? (info.view === "top" ? "side" : "fish") : "three");
      await sharp(png).trim().resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 88, alphaQuality: 90 }).toFile(path.join(OUT, 'icons', `${id}.webp`));
      info.icon = `models/icons/${id}.webp`;
    }
    fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2));
    console.log('значки:', list.length);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
