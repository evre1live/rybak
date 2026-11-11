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
import { dedup, prune, weld, simplify, textureCompress, resample, meshopt, mergeDocuments, unpartition, transformMesh } from '@gltf-transform/functions';
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
const BUDGET = { hero: { tris: 30000, tex: [2048, 2048] }, prop: { tris: 7000, tex: [1024, 512] }, fish: { tris: 8000, tex: [1024, 512] }, junk: { tris: 4000, tex: [512, 512] } };

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

/** Все вершины модели в мировых осях (матрицы узлов «впекаются» в сетку), одним списком. */
function bakeAndCollect(doc) {
  const root = doc.getRoot();
  const scene = root.getDefaultScene() || root.listScenes()[0];
  const nodes = [];
  scene.traverse((n) => n.getMesh() && nodes.push(n));
  const done = new Set();
  for (const n of nodes) {
    const mesh = n.getMesh();
    if (!done.has(mesh)) transformMesh(mesh, n.getWorldMatrix());
    done.add(mesh);
  }
  // узлы — в корень сцены, без собственных поворотов
  for (const n of nodes) {
    n.setMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    scene.addChild(n);
  }
  for (const c of scene.listChildren()) if (!nodes.includes(c)) c.dispose();
  return [...done];
}
function bounds(meshes, f = (x, y, z) => [x, y, z]) {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (const mesh of meshes)
    for (const p of mesh.listPrimitives()) {
      const a = p.getAttribute('POSITION');
      const v = [0, 0, 0];
      for (let i = 0; i < a.getCount(); i++) {
        a.getElement(i, v);
        const q = f(v[0], v[1], v[2]);
        for (let k = 0; k < 3; k++) {
          if (q[k] < lo[k]) lo[k] = q[k];
          if (q[k] > hi[k]) hi[k] = q[k];
        }
      }
    }
  return { lo, hi, size: hi.map((h, k) => h - lo[k]), mid: hi.map((h, k) => (h + lo[k]) / 2) };
}
/**
 * Приводит модель к общему виду, чтобы игре не гадать, где у неё что.
 *   рыба:    длина 1, голова к −X, спина к +Y, середина в начале координат;
 *   предмет: наибольший размер 1, стоит на y = 0, стороны вдоль осей, длинная сторона вдоль X.
 * Tripo отдаёт модель так: зритель картинки-образца стоит на +X, верх картинки — +Y, левый край картинки — +Z.
 */
function normalize(doc, m) {
  const meshes = bakeAndCollect(doc);
  const b = bounds(meshes);
  let R; // строки — новые оси X, Y, Z, записанные в старых
  if (m.group === 'fish') {
    const ax = [0, 1, 2];
    const L = ax.reduce((a, k) => (b.size[k] > b.size[a] ? k : a), 0); // ось длины — самая длинная
    const rest = ax.filter((k) => k !== L);
    // верх — верх картинки-образца (Y). Плоская рыба снята сверху, так что к зрителю она тоже встаёт «лицом» — узорной стороной
    const U = rest.includes(1) ? 1 : b.size[rest[0]] > b.size[rest[1]] ? rest[0] : rest[1];
    const unit = (k, sgn) => ax.map((i) => (i === k ? sgn : 0));
    // голова на картинке слева: это +Z (или +X/+Y, если ось длины вышла другой); flip — если модель легла наоборот
    const head = unit(L, m.flip ? -1 : 1);
    const x = head.map((v) => -v);
    const y = unit(U, m.upDown ? -1 : 1);
    const z = [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
    R = [x, y, z];
  } else {
    // поворот вокруг вертикали, при котором описанный прямоугольник в плане самый тесный
    let best = [Infinity, 0];
    for (let d = 0; d < 90; d += 1) {
      const c = Math.cos((d * Math.PI) / 180);
      const sn = Math.sin((d * Math.PI) / 180);
      const q = bounds(meshes, (x, y, z) => [c * x + sn * z, y, -sn * x + c * z]);
      const area = q.size[0] * q.size[2];
      if (area < best[0] - 1e-9) best = [area, d, q.size[0] < q.size[2]];
    }
    let a = (best[1] * Math.PI) / 180 + (best[2] ? Math.PI / 2 : 0) + ((m.yaw || 0) * Math.PI) / 180;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    R = [[c, 0, sn], [0, 1, 0], [-sn, 0, c]];
  }
  const rot = (x, y, z) => R.map((r) => r[0] * x + r[1] * y + r[2] * z);
  const q = bounds(meshes, rot);
  const k = 1 / Math.max(...(m.group === 'fish' ? [q.size[0]] : q.size));
  const t = m.group === 'fish' ? q.mid.map((v) => -v * k) : [-q.mid[0] * k, -q.lo[1] * k, -q.mid[2] * k];
  const M = [R[0][0] * k, R[1][0] * k, R[2][0] * k, 0, R[0][1] * k, R[1][1] * k, R[2][1] * k, 0, R[0][2] * k, R[1][2] * k, R[2][2] * k, 0, t[0], t[1], t[2], 1];
  for (const mesh of meshes) transformMesh(mesh, M);
  return q.size.map((v) => +(v * k).toFixed(3));
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
  const size = m.group === 'hero' ? null : normalize(doc, m);
  if (m.group === 'prop' || m.group === 'junk') {
    // предметы в игре матовые: карта блеска им не нужна — минус файл и выборка из текстуры
    for (const mat of doc.getRoot().listMaterials()) {
      mat.setMetallicRoughnessTexture(null);
      mat.setOcclusionTexture(null);
      mat.setMetallicFactor(0);
      mat.setRoughnessFactor(0.9);
    }
  }
  const ratio = Math.min(1, (m.tris || budget.tris) / Math.max(1, before));
  await doc.transform(
    unpartition(),
    dedup(),
    prune(),
    weld(),
    ...(ratio < 0.98 ? [simplify({ simplifier: MeshoptSimplifier, ratio, error: m.group === 'hero' ? 0.0015 : m.group === 'fish' ? 0.003 : 0.006, lockBorder: false })] : []),
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
  } else {
    const prev = manifest.props[m.id] || {};
    manifest.props[m.id] = { file: `models/${m.id}.glb`, group: m.group, tris, kb, size, ...(m.view ? { view: m.view } : {}), ...(prev.icon ? { icon: prev.icon } : {}) };
  }
  console.log(`${m.id}: ${before} → ${tris} треуг., ${kb} КБ${lite ? ` (для телефонов: ${lite.tris} треуг., ${lite.kb} КБ)` : ''}${Object.keys(clips).length ? ', анимации: ' + Object.entries(clips).map(([k, v]) => `${k} ${v.dur} с (${v.tracks} дорожек)`).join(', ') : ''}`);
}
fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2));
console.log('manifest:', manifest.heroes.length, 'героев,', Object.keys(manifest.props).length, 'предметов');
