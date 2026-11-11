// Сборка клиента: client/main.js + three.js → public/app.js. Готовый файл лежит в репозитории —
// Render ставит пакеты с --omit=dev и ничего не собирает.
import { build, context } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const watch = process.argv.includes('--watch');
const dev = watch || process.argv.includes('--dev');

// шрифты: копируем один раз из @fontsource
const FONTS = [
  ['sofia-sans-extra-condensed', ['800-italic', '900-italic', '800-normal']],
  ['onest', ['400-normal', '500-normal', '700-normal']]
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
