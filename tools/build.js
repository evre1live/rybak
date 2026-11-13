// Сборка клиента: client/main.js + three.js → public/app.js. Готовый файл лежит в репозитории —
// Render ставит пакеты с --omit=dev и ничего не собирает.
import { build, context } from 'esbuild';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const watch = process.argv.includes('--watch');
const dev = watch || process.argv.includes('--dev');

// шрифты: копируем один раз из @fontsource
const FONTS = [
  ['onest', ['400-normal', '500-normal', '600-normal', '700-normal']],
  ['fira-sans-condensed', ['600-italic', '800-italic']] // заголовки, названия, кнопки
];
const fdir = path.join(root, 'public/fonts');
fs.mkdirSync(fdir, { recursive: true });
for (const [fam, vars] of FONTS)
  for (const v of vars)
    for (const sub of ['cyrillic', 'latin']) {
      const name = `${fam}-${sub}-${v}.woff2`;
      const src = path.join(root, 'node_modules/@fontsource', fam, 'files', name);
      const dst = path.join(fdir, name);
      if (!fs.existsSync(dst) && fs.existsSync(src)) fs.copyFileSync(src, dst);
    }

const opts = {
  entryPoints: [path.join(root, 'client/main.js')],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  minify: !dev,
  sourcemap: dev ? 'inline' : false,
  legalComments: 'none',
  outfile: path.join(root, 'public/app.js'),
  logLevel: 'info'
};
if (watch) {
  const ctx = await context(opts);
  await ctx.watch();
} else await build(opts);

// Кэш игры на устройстве (public/sw.js): список файлов с отпечатками содержимого. По ним видно, что изменилось
// с прошлой версии: остальное игрок заново не качает.
if (!watch) {
  const pub = path.join(root, 'public');
  const files = {};
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir).sort()) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else {
        const rel = '/' + path.relative(pub, full).split(path.sep).join('/');
        if (rel === '/sw.js') continue;
        files[rel] = crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex').slice(0, 12);
      }
    }
  };
  walk(pub);
  const version = crypto.createHash('sha1').update(JSON.stringify(files)).digest('hex').slice(0, 10);
  const src = fs.readFileSync(path.join(root, 'tools/sw.src.js'), 'utf8');
  fs.writeFileSync(path.join(pub, 'sw.js'), src.replace("'__VERSION__'", JSON.stringify(version)).replace('__FILES__', JSON.stringify(files)));
  console.log(`  public/sw.js  версия ${version}, файлов ${Object.keys(files).length}`);
}
