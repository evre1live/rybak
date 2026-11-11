// Модели из Tripo: картинка-образец → модель → скелет → анимации. Список и промпты — art/models.json.
//
//   node tools/tripo.js balance
//   node tools/tripo.js concept hero-yellow [--from файл.png]   картинка героя в Т-позе (по тексту или по картинке-образцу)
//   node tools/tripo.js model hero-yellow                       модель по картинке-образцу
//   node tools/tripo.js text prop-barrel                        модель сразу по тексту (предметы, рыба)
//   node tools/tripo.js rig hero-yellow                         скелет
//   node tools/tripo.js anim hero-yellow                        анимации из списка героя
//   node tools/tripo.js task '{"type":"…"}'                     любая задача как есть
//   node tools/tripo.js spent                                   сколько кредитов ушло и на что
//
// Ключ — в .env (TRIPO_API_KEY), в репозиторий не попадает. Сырые файлы — art/tripo/raw (тоже вне репозитория).
// Потолок расхода: --cap N или TRIPO_CAP; без него новая задача не запускается, если потрачено больше 150.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'art/tripo');
const RAW = path.join(DIR, 'raw');
const STATE = path.join(DIR, 'state.json');
const API = process.env.TRIPO_API || 'https://api.tripo3d.ai/v2/openapi';
fs.mkdirSync(RAW, { recursive: true });

const env = fs.existsSync(path.join(ROOT, '.env')) ? fs.readFileSync(path.join(ROOT, '.env'), 'utf8') : '';
const KEY = process.env.TRIPO_API_KEY || (env.match(/TRIPO_API_KEY=(\S+)/) || [])[1];
if (!KEY) {
  console.error('Нет TRIPO_API_KEY');
  process.exit(1);
}
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'art/models.json'), 'utf8'));
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { models: {}, ledger: [] };
// перед записью подмешиваем то, что успел записать соседний запуск (образы и модели можно гонять одновременно)
const save = () => {
  let disk = null;
  try {
    disk = JSON.parse(fs.readFileSync(STATE, 'utf8'));
  } catch {}
  if (disk) {
    const key = (x) => x.task || x.label + x.at;
    const seen = new Set(state.ledger.map(key));
    for (const x of disk.ledger || []) if (!seen.has(key(x))) state.ledger.push(x);
    state.ledger.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
    for (const [k, v] of Object.entries(disk.models || {})) if (!touched.has(k)) state.models[k] = v;
  }
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2));
};
const touched = new Set(); // модели, которые менял этот запуск
const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : def;
};
const CAP = Number(flag('cap', process.env.TRIPO_CAP || 150));
const spent = () => state.ledger.reduce((s, x) => s + (x.credits || 0), 0);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, p, body) {
  const r = await fetch(API + p, { method, headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({ code: r.status, message: r.statusText }));
  if (j.code !== 0) throw new Error(`${method} ${p}: ${j.code} ${j.message || ''} ${j.suggestion || ''}`.trim());
  return j.data;
}
/** Запускает задачу, ждёт её и записывает расход. cost — сколько она должна стоить (для проверки потолка). */
let reserved = 0; // кредиты под задачи, которые сейчас идут (при работе пачкой)
const QUIET = args.includes('--quiet');
async function run(label, body, cost = 0) {
  if (spent() + reserved + cost > CAP) throw new Error(`${label}: потолок ${CAP} кредитов (потрачено ${spent()}, в работе ${reserved}, задача стоит около ${cost}). Поднимите его: --cap N`);
  reserved += cost;
  try {
    let id;
    for (let tries = 0; ; tries++) {
      try {
        id = (await api('POST', '/task', body)).task_id;
        break;
      } catch (e) {
        // слишком много задач сразу — подождём и повторим
        if (tries < 8 && /\b(429|2000|2010)\b|too many|rate|concurren/i.test(e.message)) await sleep(15000);
        else throw e;
      }
    }
    console.log(`${label}: задача ${id}`);
    let last = '';
    for (;;) {
      let d;
      try {
        d = await api('GET', `/task/${id}`);
      } catch (e) {
        await sleep(6000); // сеть моргнула — задача никуда не делась
        continue;
      }
      const line = `${label}: ${d.status} ${d.progress ?? ''}%`;
      if (line !== last && !QUIET) console.log(line);
      last = line;
      if (d.status === 'success') {
        const credits = d.consumed_credit ?? d.credits_consumed ?? 0;
        state.ledger.push({ at: new Date().toISOString(), label, type: body.type, task: id, credits });
        save();
        console.log(`${label}: готово, ${credits} кредитов (всего ${spent()})`);
        return { id, ...d };
      }
      if (['failed', 'cancelled', 'unknown', 'banned', 'expired'].includes(d.status)) throw new Error(`${label}: задача ${id} — ${d.status}`);
      await sleep(4000);
    }
  } finally {
    reserved -= cost;
  }
}
async function download(url, file) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`скачивание ${r.status} ${url.slice(0, 80)}`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  console.log(`  → ${path.relative(ROOT, file)} (${(fs.statSync(file).size / 1024).toFixed(0)} КБ)`);
  return file;
}
const urlOf = (v) => (typeof v === 'string' ? v : v && v.url);
const pickModel = (out) => urlOf(out.pbr_model) || urlOf(out.model) || urlOf(out.base_model);
async function upload(file) {
  const fd = new FormData();
  const ext = path.extname(file).slice(1).toLowerCase();
  fd.append('file', new Blob([fs.readFileSync(file)], { type: ext === 'png' ? 'image/png' : 'image/jpeg' }), path.basename(file));
  const r = await fetch(API + '/upload', { method: 'POST', headers: { Authorization: `Bearer ${KEY}` }, body: fd });
  const j = await r.json();
  if (j.code !== 0) throw new Error(`upload: ${j.code} ${j.message || ''}`);
  return { type: ext === 'png' ? 'png' : 'jpg', file_token: j.data.image_token || j.data.file_token };
}
const find = (id) => {
  const m = spec.models.find((x) => x.id === id);
  if (!m) throw new Error(`в art/models.json нет модели ${id}`);
  return m;
};
const st = (id) => (touched.add(id), (state.models[id] ||= {}));
const imgExt = (url) => (/\.png(\?|$)/i.test(url) ? 'png' : /\.webp(\?|$)/i.test(url) ? 'webp' : 'jpg');

async function concept(id) {
  const m = find(id);
  const from = flag('from', null);
  let body;
  if (from) body = { type: 'image_to_image', file: await upload(path.resolve(from)), prompt: `${m.prompt}. ${spec.pose}. ${spec.concept}`.slice(0, 1024), ...(spec.imageModel ? { model_version: spec.imageModel } : {}) };
  else if (m.group === 'hero') body = { type: 'text_to_image', prompt: `${spec.conceptLead} ${spec.pose}. ${m.prompt}. ${spec.style}. ${spec.concept}`.slice(0, 1024) };
  else {
    // рыба — строго сбоку головой влево (плоская — сверху), предметы — в три четверти: так модель выходит в известном положении
    const L = spec.leads[m.group === 'fish' ? 'fish' : 'prop'];
    const lead = m.view === 'top' ? L.top : L.lead;
    body = { type: 'text_to_image', prompt: `${lead} ${m.prompt[0].toUpperCase()}${m.prompt.slice(1)}. ${m.style || L.style}. ${L.concept}`.slice(0, 1024), ...(L.negative && args.includes('--neg') ? { negative_prompt: L.negative } : {}) };
  }
  const d = await run(`${id} образец`, body, 5);
  const url = urlOf(d.output.generated_image);
  const n = (st(id).concepts ||= []).length + 1;
  const file = await download(url, path.join(RAW, `${id}-concept${n}.${imgExt(url)}`));
  st(id).concepts.push({ task: d.id, file: path.relative(ROOT, file) });
  st(id).concept = d.id;
  save();
}
const quality = (m0) => {
  const m = { ...((spec.groupDefaults || {})[m0.group] || {}), ...m0 };
  return {
    model_version: spec.version,
    texture: true,
    pbr: true,
    texture_quality: m.textureQuality || 'detailed',
    ...(m.geometry === 'standard' ? {} : { geometry_quality: 'detailed' }),
    ...(m.faces ? { face_limit: m.faces } : {}),
    auto_size: false
  };
};
const modelCost = (m0) => {
  const q = quality(m0);
  return 30 + (q.texture_quality === 'detailed' ? 10 : 0) + (q.geometry_quality === 'detailed' ? 20 : 0);
};
async function model(id) {
  const m = find(id);
  const s = st(id);
  const file = flag('image', null);
  if (!file && !(s.concepts && s.concepts.length)) throw new Error(`${id}: сначала concept`);
  // модель строится по картинке-образцу: свой файл или последняя (либо выбранная через pick) картинка из concept
  const body = { type: 'image_to_model', ...quality(m), file: file ? await upload(path.resolve(file)) : await conceptFile(s) };
  const d = await run(`${id} модель`, body, modelCost(m));
  s.model = d.id;
  save();
  await download(pickModel(d.output), path.join(RAW, `${id}.glb`));
  const pic = urlOf(d.output.rendered_image);
  if (pic) await download(pic, path.join(RAW, `${id}-render.${imgExt(pic)}`)).catch(() => {});
}
/** Картинка-образец загружается в Tripo заново: так модель строится ровно по тому файлу, который мы посмотрели. */
async function conceptFile(s) {
  const last = s.concepts[s.pick != null ? s.pick : s.concepts.length - 1];
  return upload(path.join(ROOT, last.file));
}
async function text(id) {
  const m = find(id);
  const d = await run(`${id} модель`, { type: 'text_to_model', prompt: `${m.prompt}. ${spec.style}`.slice(0, 1024), negative_prompt: spec.negative.slice(0, 255), ...quality(m) }, 50);
  st(id).model = d.id;
  save();
  await download(pickModel(d.output), path.join(RAW, `${id}.glb`));
  const pic = urlOf(d.output.rendered_image);
  if (pic) await download(pic, path.join(RAW, `${id}-render.${imgExt(pic)}`)).catch(() => {});
}
async function rig(id) {
  const s = st(id);
  if (!s.model) throw new Error(`${id}: сначала model`);
  const check = await run(`${id} проверка скелета`, { type: 'animate_prerigcheck', original_model_task_id: s.model }, 0);
  console.log(`${id}: riggable=${check.output?.riggable} rig_type=${check.output?.rig_type}`);
  if (check.output && check.output.riggable === false) throw new Error(`${id}: Tripo считает, что скелет на эту модель не встанет`);
  const d = await run(`${id} скелет`, { type: 'animate_rig', original_model_task_id: s.model, out_format: 'glb', spec: flag('spec', spec.rigSpec || 'mixamo'), ...(spec.rigVersion ? { model_version: spec.rigVersion } : {}) }, 25);
  s.rig = d.id;
  save();
  await download(pickModel(d.output), path.join(RAW, `${id}-rig.glb`));
}
async function anim(id) {
  const m = find(id);
  const s = st(id);
  if (!s.rig) throw new Error(`${id}: сначала rig`);
  const list = (flag('only', '') || '').split(',').filter(Boolean);
  for (const name of list.length ? list : m.anims || spec.anims) {
    if (s.anims && s.anims[name] && !args.includes('--force')) continue;
    const d = await run(`${id} ${name}`, { type: 'animate_retarget', original_model_task_id: s.rig, out_format: 'glb', animation: spec.presets[name] || `preset:${name}`, bake_animation: true, animate_in_place: true }, 10);
    (s.anims ||= {})[name] = d.id;
    save();
    await download(pickModel(d.output), path.join(RAW, `${id}-${name}.glb`));
  }
}

const [cmd, ...rest] = args;
const ids = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--')));
try {
  if (cmd === 'balance') console.log(await api('GET', '/user/balance'));
  else if (cmd === 'spent') {
    for (const x of state.ledger) console.log(`${x.at.slice(0, 16)}  ${String(x.credits).padStart(4)}  ${x.label}`);
    console.log(`всего: ${spent()} кредитов`);
  } else if (cmd === 'task') {
    const d = await run('задача', JSON.parse(rest[0]), Number(flag('cost', 10)));
    console.log(JSON.stringify(d.output, null, 1).slice(0, 1500));
  } else if (cmd === 'upload') console.log(await upload(path.resolve(rest[0])));
  else if (cmd === 'batch') {
    // batch concept|model [ids…] [--group fish,prop] [--jobs 5] [--redo]: несколько задач сразу, готовое пропускается
    const what = ids[0];
    const fn = { concept, model }[what];
    if (!fn) throw new Error('batch concept|model …');
    const groups = flag('group', '').split(',').filter(Boolean);
    const redo = args.includes('--redo');
    let list = ids.slice(1);
    if (!list.length) list = spec.models.filter((m) => groups.includes(m.group)).map((m) => m.id);
    list = list.filter((id) => {
      if (redo) return true;
      const cur = state.models[id];
      if (what === 'concept') return !(cur && cur.concepts && cur.concepts.length);
      return !fs.existsSync(path.join(RAW, `${id}.glb`));
    });
    const jobs = Number(flag('jobs', 5));
    const failed = [];
    let next = 0;
    console.log(`пачка ${what}: ${list.length} шт., по ${jobs} сразу`);
    await Promise.all(
      Array.from({ length: Math.min(jobs, list.length) }, async () => {
        while (next < list.length) {
          const id = list[next++];
          try {
            await fn(id);
          } catch (e) {
            failed.push(id);
            console.error(`${id}: ${e.message}`);
          }
        }
      })
    );
    console.log(`пачка ${what} закончена: готово ${list.length - failed.length}, не вышло ${failed.length}${failed.length ? ' (' + failed.join(', ') + ')' : ''}; всего потрачено ${spent()}`);
  } else if ({ concept, model, text, rig, anim }[cmd]) for (const id of ids) await { concept, model, text, rig, anim }[cmd](id);
  else console.log('команды: balance | concept <id> [--from файл] | model <id> [--image файл] | text <id> | rig <id> | anim <id> [--only a,b] | task <json> | spent');
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
