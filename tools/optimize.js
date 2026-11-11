// Готовит сырые модели Tripo для игры.
// Герой: модель со скелетом + все его анимации в одном файле, сетка упрощена, текстуры в WebP, геометрия сжата.
//   node tools/optimize.js            — всё из art/tripo/raw, что есть в art/models.json
//   node tools/optimize.js hero-yellow
// Результат: public/models/<id>.glb и public/models/manifest.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, textureCompress, resample, meshopt, mergeDocuments, unpartition } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'art/tripo/raw');
const OUT = path.join(ROOT, 'public/models');
fs.mkdirSync(OUT, { recursive: true });
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'art/models.json'), 'utf8'));
const manPath = path.join(OUT, 'manifest.json');
const manifest = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : { heroes: [], props: {} };

// сколько треугольников оставить и какого размера текстуры: [цвет, нормали и блеск]
const BUDGET = { hero: { tris: 30000, tex: [2048, 2048] }, prop: { tris: 12000, tex: [1024, 512] }, fish: { tris: 6000, tex: [1024, 512] } };

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

function triCount(doc) {
  let n = 0;
  for (const mesh of doc.getRoot().listMeshes()) for (const p of mesh.listPrimitives()) n += (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3;
  return Math.round(n);
}

/** Переносит анимацию из файла-близнеца (та же модель, одна анимация) в основной документ, привязывая дорожки к его костям по именам. */
async function addClip(doc, file, name) {
  const src = await io.read(file);
  const before = new Set(doc.getRoot().listAnimations());
  const scenesBefore = new Set(doc.getRoot().listScenes());
  const byName = new Map();
  for (const n of doc.getRoot().listNodes()) byName.set(n.getName(), n);
  mergeDocuments(doc, src);
  const added = doc.getRoot().listAnimations().filter((a) => !before.has(a));
  let moved = 0;
  for (const a of added) {
    a.setName(name);
    for (const ch of a.listChannels()) {
      const target = ch.getTargetNode();
      const own = target && byName.get(target.getName());
      // кости на месте: идём шагом сами, смещения из анимации не берём (кроме покачивания таза по высоте — оно в повороте ног)
      if (!own || ch.getTargetPath() !== 'rotation') {
        a.removeChannel(ch);
        ch.dispose();
        continue;
      }
      ch.setTargetNode(own);
      moved++;
    }
  }
  // всё остальное, что приехало вместе с анимацией (вторая копия модели), убираем
  for (const s of doc.getRoot().listScenes()) {
    if (scenesBefore.has(s)) continue;
    const all = [];
    for (const n of s.listChildren()) n.traverse((x) => all.push(x));
    for (const x of all) x.dispose();
    s.dispose();
  }
  const dur = Math.max(...added.flatMap((a) => a.listSamplers().map((s) => s.getInput().getMax([])[0])));
  return { tracks: moved, dur: +dur.toFixed(2) };
}

const want = process.argv.slice(2);
for (const m of spec.models) {
  if (want.length && !want.includes(m.id)) continue;
  const base = path.join(RAW, m.group === 'hero' ? `${m.id}-rig.glb` : `${m.id}.glb`);
  if (!fs.existsSync(base)) continue;
  const budget = BUDGET[m.group] || BUDGET.prop;
  const doc = await io.read(base);
  const before = triCount(doc);
  const clips = {};
  if (m.group === 'hero') {
    for (const f of fs.readdirSync(RAW)) {
      const mm = f.match(new RegExp(`^${m.id}-([a-z0-9_]+)\\.glb$`));
      if (!mm || mm[1] === 'rig' || mm[1].startsWith('rig-')) continue;
      clips[mm[1]] = await addClip(doc, path.join(RAW, f), mm[1]);
    }
  }
  const ratio = Math.min(1, budget.tris / Math.max(1, before));
  await doc.transform(
    unpartition(),
    dedup(),
    prune(),
    weld(),
    ...(ratio < 0.98 ? [simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.0015, lockBorder: false })] : []),
    resample(),
    prune(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^baseColorTexture$/, resize: [budget.tex[0], budget.tex[0]], quality: 86 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^(normalTexture|metallicRoughnessTexture|occlusionTexture|emissiveTexture)$/, resize: [budget.tex[1], budget.tex[1]], quality: 84 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' })
  );
  const out = path.join(OUT, `${m.id}.glb`);
  await io.write(out, doc);
  const tris = triCount(doc);
  const kb = Math.round(fs.statSync(out).size / 1024);
  // облегчённая копия для телефонов: вдвое меньше треугольников и текстуры 1K — в четыре раза меньше видеопамяти
  let lite = null;
  if (m.group === 'hero') {
    await doc.transform(
      simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.003, lockBorder: false }),
      prune(),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 82 }),
      meshopt({ encoder: MeshoptEncoder, level: 'medium' })
    );
    const lo = path.join(OUT, `${m.id}.lite.glb`);
    await io.write(lo, doc);
    lite = { file: `models/${m.id}.lite.glb`, tris: triCount(doc), kb: Math.round(fs.statSync(lo).size / 1024) };
  }
  if (m.group === 'hero') {
    const entry = { id: m.id, name: m.name, file: `models/${m.id}.glb`, lite: lite.file, tris, kb, clips: Object.keys(clips), ...(m.fp ? { fp: m.fp } : {}), ...(m.tint ? { tint: m.tint } : {}), ...(m.npc ? { npc: true } : {}) };
    const i = manifest.heroes.findIndex((h) => h.id === m.id);
    if (i >= 0) manifest.heroes[i] = entry;
    else manifest.heroes.push(entry);
  } else manifest.props[m.id] = { file: `models/${m.id}.glb`, group: m.group, tris, kb };
  console.log(`${m.id}: ${before} → ${tris} треуг., ${kb} КБ${lite ? ` (для телефонов: ${lite.tris} треуг., ${lite.kb} КБ)` : ''}${Object.keys(clips).length ? ', анимации: ' + Object.entries(clips).map(([k, v]) => `${k} ${v.dur} с (${v.tracks} дорожек)`).join(', ') : ''}`);
}
fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2));
console.log('manifest:', manifest.heroes.length, 'героев,', Object.keys(manifest.props).length, 'предметов');
