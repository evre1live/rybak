// Пробная версия одним файлом: вся игра (код, стили, шрифты, звуки, картинки мест) внутри одной страницы, без сервера.
// Нужна там, где страницу показывают в рамке без сети — например, как артефакт Claude.
// В ней только одиночная рыбалка: комнаты и голос живут на сервере.
// Запуск: node tools/artifact.js [куда положить]  → dist/rybak-solo.html
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const out = resolve(process.argv[2] || join(root, 'dist', 'rybak-solo.html'));
const read = (f) => readFileSync(join(pub, f), 'utf8');

// шрифты — прямо в стили
let fonts = 0;
const css = read('style.css').replace(/url\((fonts\/[^)]+\.woff2)\)/g, (_, f) => {
  fonts++;
  return `url(data:font/woff2;base64,${readFileSync(join(pub, f)).toString('base64')})`;
});
// код — прямо в страницу; закрывающий тег и начало комментария внутри него прячем от разборщика HTML
const js = read('app.js').replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const icon = `data:image/svg+xml;base64,${readFileSync(join(pub, 'favicon.svg')).toString('base64')}`;

let html = read('index.html');
const swap = (from, to) => {
  if (!html.includes(from)) throw new Error(`В index.html не нашлось: ${from}`);
  html = html.replace(from, () => to);
};
swap('<title>Рыбак — рыбалка с друзьями</title>', '<title>Рыбак — пробная рыбалка</title>');
swap('<link rel="icon" href="favicon.svg">', `<link rel="icon" href="${icon}">`);
swap('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`);
// пробная версия живёт одним файлом: ни значков приложения, ни кэша на устройстве у неё нет
swap('<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-192.png">\n', '');
// записи звуков (отдельные файлы, общая дорожка коротких звуков и петли) — тоже внутрь: из сети пробная версия ничего не берёт
const audio = {};
for (const f of readdirSync(join(pub, 'audio')).filter((f) => f.endsWith('.webm')).sort()) audio[f.replace(/\.webm$/, '')] = readFileSync(join(pub, 'audio', f)).toString('base64');
// картинки мест (вид сверху на карточке в лобби) — туда же
const img = {};
// значки рынка (img/items) не кладём: пробная версия рисует их кодом, как и рыбу без моделей
for (const f of readdirSync(join(pub, 'img'), { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name).sort()) img[`img/${f}`] = `data:image/${f.split('.').pop()};base64,${readFileSync(join(pub, 'img', f)).toString('base64')}`;
swap('<script src="app.js"></script>', `<script>window.RYBAK_OFFLINE = true; window.RYBAK_AUDIO = ${JSON.stringify(audio)}; window.RYBAK_IMG = ${JSON.stringify(img)};</script>\n<script>${js}</script>`);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`${out}: ${(Buffer.byteLength(html) / 1024).toFixed(0)} КБ, шрифтов внутри: ${fonts}, записей звука: ${Object.keys(audio).length}, картинок: ${Object.keys(img).length}`);
