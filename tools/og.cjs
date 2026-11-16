// Картинка для ссылок (og:image) 1200×630: арт из GPT Image (этап 30) и надпись шрифтами игры.
//   node tools/og.cjs <арт.png> public/img/og.jpg
// Нужен playwright с Chrome (PLAYWRIGHT — путь к модулю, CHROME — к браузеру).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const [src, out] = process.argv.slice(2);
const F = require('path').join(__dirname, '..', 'public', 'fonts') + '/';
const b64 = (f) => fs.readFileSync(f).toString('base64');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:D;font-weight:800;font-style:italic;src:url(data:font/woff2;base64,${b64(F + 'fira-sans-condensed-cyrillic-800-italic.woff2')}) format("woff2");unicode-range:U+0400-052F}
@font-face{font-family:D;font-weight:800;font-style:italic;src:url(data:font/woff2;base64,${b64(F + 'fira-sans-condensed-latin-800-italic.woff2')}) format("woff2");unicode-range:U+0000-024F,U+2000-206F}
@font-face{font-family:B;font-weight:700;src:url(data:font/woff2;base64,${b64(F + 'onest-cyrillic-700-normal.woff2')}) format("woff2");unicode-range:U+0400-052F}
@font-face{font-family:B;font-weight:700;src:url(data:font/woff2;base64,${b64(F + 'onest-latin-700-normal.woff2')}) format("woff2");unicode-range:U+0000-024F,U+2000-206F}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#123}
.art{position:absolute;inset:0;background:url(data:image/png;base64,${b64(src)}) center 58%/cover no-repeat}
.shade{position:absolute;inset:0;background:linear-gradient(100deg,rgba(8,12,22,.62) 0%,rgba(8,12,22,.34) 34%,rgba(8,12,22,0) 58%),linear-gradient(180deg,rgba(8,12,22,.25),rgba(8,12,22,0) 40%)}
.t{position:absolute;left:64px;top:70px;font:italic 800 168px/0.9 D;letter-spacing:.01em;color:#fff6e8;transform:rotate(-4deg);transform-origin:0 100%;text-shadow:0 5px 0 rgba(0,0,0,.35),0 12px 34px rgba(0,0,0,.55)}
.s{position:absolute;left:72px;top:262px;font:italic 800 46px/1.05 D;color:#ffc93c;transform:rotate(-4deg);transform-origin:0 100%;text-shadow:0 3px 0 rgba(0,0,0,.35),0 8px 22px rgba(0,0,0,.6)}
.p{position:absolute;left:76px;top:356px;display:flex;gap:12px}
.p span{font:700 21px/1 B;color:#fff;background:rgba(10,14,24,.58);border:2px solid rgba(255,255,255,.35);border-radius:999px;padding:10px 18px;letter-spacing:.04em;text-transform:uppercase}
</style></head><body><div class="art"></div><div class="shade"></div>
<div class="t">РЫБАК</div><div class="s">рыбалка с друзьями</div>
<div class="p"><span>от первого лица</span><span>голос в игре</span><span>7 мест</span></div></body></html>`;
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: out, type: 'jpeg', quality: 86 });
  await browser.close();
})();
