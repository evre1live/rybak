// Готовит модели из бесплатных наборов (Quaternius, лицензия CC0) для локаций: у каждой локации — свой файл
// public/models/kit/<локация>.glb, в нём все её модели узлами (<id> и дальняя копия <id>-lod) с общими текстурами.
//
//   node tools/kit.js            — все локации из art/kit.json
//   node tools/kit.js lake keys  — только эти
//
// Сырые наборы лежат вне репозитория: art/kit/raw/ (ссылка на папку со скачанными наборами; откуда что взято —
// art/kit.json, «sources»). Результат: public/models/kit/<локация>.glb и записи в public/models/manifest.json
// ({ file, node, group: 'env', tris, size, lod: { file, node, tris } }) — игра грузит файл локации один раз
// и достаёт из него модели по имени узла (client/models.js).
//
// Что делается с моделью:
//   - узлы запекаются, модель приводится к наибольшему размеру 1: деревья и растения — с сохранением своей точки
//     опоры (низ ствола в начале координат), камни и постройки — серединой в начало координат и низом на y = 0;
//   - материалы: шероховатость и металл убираются (в игре всё матовое), листве — отсечение по прозрачности;
//     «mats» в описании модели меняет текстуру и цвет материала (белая маска листвы × свой цвет — так у каждой
//     локации своя листва из одних и тех же деревьев), «vc» — что делать с цветом вершин;
//   - непрозрачные части (ствол, камень) упрощаются до «tris», листва не трогается;
//   - дальняя копия: ствол упрощается грубо, листва та же — текстуры у копий общие, файл почти не растёт.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, textureCompress, meshopt, transformMesh, copyToDocument, compactPrimitive, cloneDocument } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { Geo, cabinLogs } from './kitgen.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'art/kit/raw');
const OUT = path.join(ROOT, 'public/models/kit');
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'art/kit.json'), 'utf8'));
const manPath = path.join(ROOT, 'public/models/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manPath, 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const triCount = (doc) => {
  let n = 0;
  for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) n += (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3;
  return Math.round(n);
};
const srcPath = (src) => {
  const [root, rest] = src.split(':');
  const dir = spec.roots[root];
  if (!dir) throw new Error('нет корня ' + root);
  return path.join(RAW, dir, rest + (rest.endsWith('.gltf') || rest.endsWith('.glb') ? '' : '.gltf'));
};
const texPath = (t) => (t.includes(':') ? path.join(RAW, spec.roots[t.split(':')[0]], t.split(':')[1]) : null);

/** Все сетки — в корень сцены, преобразования узлов запечены в вершины. */
function bake(doc) {
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
  for (const n of nodes) {
    n.setMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    n.setSkin(null);
    scene.addChild(n);
  }
  for (const c of scene.listChildren()) if (!nodes.includes(c)) c.dispose();
  for (const s of root.listSkins()) s.dispose();
  for (const a of root.listAnimations()) a.dispose();
  return [...done];
}
function bounds(meshes) {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  const v = [0, 0, 0];
  for (const mesh of meshes)
    for (const p of mesh.listPrimitives()) {
      const a = p.getAttribute('POSITION');
      for (let i = 0; i < a.getCount(); i++) {
        a.getElement(i, v);
        for (let k = 0; k < 3; k++) {
          if (v[k] < lo[k]) lo[k] = v[k];
          if (v[k] > hi[k]) hi[k] = v[k];
        }
      }
    }
  return { lo, hi, size: hi.map((h, k) => h - lo[k]), mid: hi.map((h, k) => (h + lo[k]) / 2) };
}

/** Простое упрощение одного примитива до want треугольников (через швы: дальней копии развёртка почти не важна). */
function simplifyPrim(doc, prim, want, error, permissive) {
  const pos = prim.getAttribute('POSITION');
  const idx = prim.getIndices();
  if (!idx || idx.getCount() / 3 <= want) return;
  const positions = new Float32Array(pos.getCount() * 3);
  const v = [0, 0, 0];
  for (let i = 0; i < pos.getCount(); i++) {
    pos.getElement(i, v);
    positions.set(v, i * 3);
  }
  const indices = new Uint32Array(idx.getCount());
  for (let i = 0; i < indices.length; i++) indices[i] = idx.getScalar(i);
  const [res] = MeshoptSimplifier.simplify(indices, positions, 3, Math.max(12, want) * 3, error, permissive ? ['Permissive', 'Prune'] : ['Prune']);
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(res).setBuffer(doc.getRoot().listBuffers()[0]));
  compactPrimitive(prim);
}
const isCutout = (mat) => mat && mat.getAlphaMode() !== 'OPAQUE';

/**
 * Прореживает листву: карточки листьев (связные куски сетки) остаются через одну-две — крона вдали та же по форме,
 * но вдвое-втрое легче. keep — доля оставляемых карточек; выбор по номеру, всегда один и тот же.
 */
function thinCards(doc, prim, keep) {
  const idx = prim.getIndices();
  if (!idx) return;
  const n = idx.getCount() / 3;
  const parent = new Int32Array(prim.getAttribute('POSITION').getCount()).map((_, i) => i);
  const find = (a) => {
    while (parent[a] !== a) a = parent[a] = parent[parent[a]];
    return a;
  };
  const tri = [0, 0, 0];
  for (let t = 0; t < n; t++) {
    for (let k = 0; k < 3; k++) tri[k] = idx.getScalar(t * 3 + k);
    parent[find(tri[1])] = find(tri[0]);
    parent[find(tri[2])] = find(tri[0]);
  }
  const ids = new Map();
  const out = [];
  for (let t = 0; t < n; t++) {
    const r = find(idx.getScalar(t * 3));
    if (!ids.has(r)) ids.set(r, ids.size);
    const c = ids.get(r);
    // золотое сечение: доли разбросаны по кроне равномерно, а не срезаны с одного бока
    if ((c * 0.6180339887) % 1 < keep) for (let k = 0; k < 3; k++) out.push(idx.getScalar(t * 3 + k));
  }
  if (ids.size < 6) return; // одна-две большие карточки (пальма) — не трогаем
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(out)).setBuffer(doc.getRoot().listBuffers()[0]));
  compactPrimitive(prim);
}

/** Непрозрачные части модели (ствол, камень, стены) — до target треугольников всего; листва остаётся как есть. */
function simplifySolid(doc, target, error, permissive) {
  const prims = doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives()).filter((p) => !isCutout(p.getMaterial()) && p.getIndices());
  const total = prims.reduce((s, p) => s + p.getIndices().getCount() / 3, 0);
  if (total <= target) return;
  for (const p of prims) simplifyPrim(doc, p, Math.round((target * p.getIndices().getCount()) / 3 / total), error, permissive);
}

const texCache = new Map();
async function loadTex(doc, file) {
  if (!texCache.has(file)) texCache.set(file, fs.readFileSync(file));
  const ext = path.extname(file).slice(1).toLowerCase();
  return doc.createTexture(path.basename(file, path.extname(file))).setImage(texCache.get(file)).setMimeType(ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/' + ext);
}

let _white = null;
async function whiteTex(doc) {
  _white ||= await sharp({ create: { width: 4, height: 4, channels: 3, background: '#ffffff' } }).png().toBuffer();
  return doc.getRoot().listTextures().find((t) => t.getName() === 'white') || doc.createTexture('white').setImage(_white).setMimeType('image/png');
}

/** Матрица: масштаб (s — число или [x, y, z]), поворот ry градусов вокруг вертикали, сдвиг at. */
function placeM(at = [0, 0, 0], ry = 0, sc = 1) {
  const [sx, sy, sz] = Array.isArray(sc) ? sc : [sc, sc, sc];
  const a = (ry * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c * sx, 0, -s * sx, 0, 0, sy, 0, 0, s * sz, 0, c * sz, 0, at[0], at[1], at[2], 1];
}

/**
 * Сборная модель (assemble): детали из наборов на своих местах плюс простые сетки из кода (сруб, доски).
 * Каждая деталь: { src, at, ry, scale, mats } или { gen: 'cabin' | 'boxes', … }.
 */
async function assemble(m) {
  const doc = new Document();
  const buf = doc.createBuffer();
  const scene = doc.createScene();
  doc.getRoot().setDefaultScene(scene);
  const texMat = async (name, o) => {
    const mat = doc.createMaterial(name);
    if (o.tex) mat.setBaseColorTexture(await loadTex(doc, texPath(o.tex)));
    if (o.color) {
      const c = hex(o.color).map(lin);
      mat.setBaseColorFactor([c[0], c[1], c[2], 1]);
    }
    return mat;
  };
  for (const part of m.assemble) {
    if (part.gen === 'cabin') {
      const { geo } = cabinLogs(part);
      const mesh = doc.createMesh('logs').addPrimitive(geo.toPrimitive(doc, buf, await texMat('Logs', part)));
      scene.addChild(doc.createNode('logs').setMesh(mesh));
      continue;
    }
    if (part.gen === 'boxes') {
      const g = new Geo();
      for (const b of part.list) g.box(b[0], b[1], b[2], b[3], b[4], b[5], { ry: ((b[6] || 0) * Math.PI) / 180, tile: part.tile || 1.5 });
      const mesh = doc.createMesh(part.name || 'boxes').addPrimitive(g.toPrimitive(doc, buf, await texMat(part.name || 'Boards', part)));
      scene.addChild(doc.createNode(part.name || 'boxes').setMesh(mesh));
      continue;
    }
    const src = await io.read(srcPath(part.src));
    const meshes = bake(src);
    if (part.mats) await tuneMaterials(src, { id: m.id, mats: part.mats });
    const M = placeM(part.at, part.ry || 0, part.scale || 1);
    for (const mesh of meshes) transformMesh(mesh, M);
    const roots = src.getRoot().getDefaultScene().listChildren();
    const map = copyToDocument(doc, src, roots);
    for (const r of roots) scene.addChild(map.get(r));
  }
  for (const a of doc.getRoot().listAccessors()) a.setBuffer(buf);
  for (const b of doc.getRoot().listBuffers()) if (b !== buf) b.dispose();
  return doc;
}

/** Материалы модели: текстуры по описанию, матовость, отсечение листвы, цвет. */
async function tuneMaterials(doc, m) {
  const mats = m.mats || {};
  for (const mat of doc.getRoot().listMaterials()) {
    const name = mat.getName();
    const o = mats[name] || mats['*'] || {};
    // у набора без текстур в glTF (Ultimate Stylized Nature) — текстура по имени материала
    if (o.tex) {
      const file = texPath(o.tex);
      if (!file || !fs.existsSync(file)) throw new Error(`${m.id}: нет текстуры ${o.tex}`);
      mat.setBaseColorTexture(await loadTex(doc, file));
    } else if (!mat.getBaseColorTexture() && m.texDir) {
      const file = path.join(RAW, spec.roots[m.texDir.split(':')[0]], m.texDir.split(':')[1], name + '.png');
      if (fs.existsSync(file)) mat.setBaseColorTexture(await loadTex(doc, file));
    }
    // grey — текстура обесцвечивается (светлее среднего), цвет задаёт color: жёлтые цветы набора становятся
    // лиловыми люпинами, розовым гибискусом и т. п.
    if (o.grey && mat.getBaseColorTexture()) {
      const src = mat.getBaseColorTexture();
      const key = 'grey:' + (src.getName() || src.getURI());
      let t = doc.getRoot().listTextures().find((x) => x.getName() === key);
      if (!t) {
        const png = await sharp(Buffer.from(src.getImage())).modulate({ saturation: 0, brightness: 1.35 }).png().toBuffer();
        t = doc.createTexture(key).setImage(png).setMimeType('image/png');
      }
      mat.setBaseColorTexture(t);
    }
    if (o.normal === false || m.flat) mat.setNormalTexture(null);
    mat.setMetallicRoughnessTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);
    mat.setMetallicFactor(0).setRoughnessFactor(0.9);
    if (o.cut || (o.cut !== false && /leaf|leaves|flower|grass|petal/i.test(name) && mat.getBaseColorTexture())) {
      // листва — отсечение по прозрачности текстуры
      mat.setAlphaMode('MASK').setAlphaCutoff(o.cutoff || 0.42).setDoubleSided(true);
    } else mat.setAlphaMode('OPAQUE'); // кора и камень в наборе иногда помечены «с прозрачностью» — у нас они сплошные
    if (!isCutout(mat)) mat.setDoubleSided(!!o.twoSided);
    if (o.color) {
      const c = hex(o.color).map(lin);
      mat.setBaseColorFactor([c[0], c[1], c[2], 1]);
    }
    // стекло окон: тёмное днём, ночью игра зажигает его (envmodels.js, lit) — для этого нужна карта свечения
    if (o.glass) {
      const c = hex(o.glass).map(lin);
      mat.setBaseColorTexture(null).setBaseColorFactor([c[0], c[1], c[2], 1]).setRoughnessFactor(0.35);
      mat.setEmissiveTexture(await whiteTex(doc)).setEmissiveFactor([1, 1, 1]);
    }
  }
  // цвет вершин: в наборе в нём то затенение (ствол у земли темнее — оставляем), то градиент для ветра в своём
  // шейдере набора (трава, папоротник — с ним они выходят чёрными). vc: 'drop' — убрать, [a, b] — растянуть в a…b
  for (const mesh of doc.getRoot().listMeshes())
    for (const p of mesh.listPrimitives()) {
      const c = p.getAttribute('COLOR_0');
      if (!c) continue;
      const o = mats[p.getMaterial() && p.getMaterial().getName()] || {};
      const vc = o.vc !== undefined ? o.vc : m.vc;
      if (vc === 'drop') {
        p.setAttribute('COLOR_0', null);
        continue;
      }
      // белый цвет вершин ничего не даёт — только лишний поток
      const n = c.getCount();
      const e = [];
      let white = true;
      for (let i = 0; i < n && white; i++) {
        c.getElement(i, e);
        if (e[0] < 0.995 || e[1] < 0.995 || e[2] < 0.995) white = false;
      }
      if (white) {
        p.setAttribute('COLOR_0', null);
        continue;
      }
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        c.getElement(i, e);
        for (let k = 0; k < 3; k++) arr[i * 3 + k] = Array.isArray(vc) ? vc[0] + (vc[1] - vc[0]) * e[k] : e[k];
      }
      p.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(arr).setBuffer(doc.getRoot().listBuffers()[0]));
    }
}

/** Приводит модель к наибольшему размеру 1. Возвращает размеры [x, y, z]. */
function normalize(doc, m, meshes) {
  const b = bounds(meshes);
  const k = (m.scale || 1) / Math.max(...b.size);
  const center = m.pivot === 'center';
  const t = center ? [-b.mid[0] * k, -b.lo[1] * k, -b.mid[2] * k] : [0, (m.lift || 0) * k, 0];
  const a = ((m.yaw || 0) * Math.PI) / 180;
  const c = Math.cos(a) * k;
  const s = Math.sin(a) * k;
  // поворот вокруг вертикали, потом масштаб и сдвиг
  const M = [c, 0, -s, 0, 0, k, 0, 0, s, 0, c, 0, t[0] * Math.cos(a) + t[2] * Math.sin(a), t[1], -t[0] * Math.sin(a) + t[2] * Math.cos(a), 1];
  for (const mesh of meshes) transformMesh(mesh, M);
  const q = bounds(meshes);
  return { size: q.size.map((v) => +v.toFixed(3)), lo: q.lo.map((v) => +v.toFixed(3)) };
}

async function prepare(m) {
  const doc = m.assemble ? await assemble(m) : await io.read(srcPath(m.src));
  const before = triCount(doc);
  const meshes = bake(doc);
  await tuneMaterials(doc, m);
  const geo = normalize(doc, m, meshes);
  await doc.transform(weld());
  if (m.tris) simplifySolid(doc, m.tris, m.err || 0.03, m.permissive !== false);
  // дальняя копия есть у всех, кроме построек (lod: false): без неё копия рисуется подробной на любом расстоянии
  let lodDoc = null;
  const solid = doc.getRoot().listMeshes().flatMap((x) => x.listPrimitives()).filter((p) => !isCutout(p.getMaterial()) && p.getIndices()).reduce((n, p) => n + p.getIndices().getCount() / 3, 0);
  const lodT = m.lod === false ? 0 : m.lod || Math.max(40, Math.round(solid * 0.25));
  const lodLeaves = m.lodLeaves || (m.lod === undefined ? 0.5 : 0);
  if (lodT) {
    lodDoc = cloneDocument(doc);
    simplifySolid(lodDoc, lodT, 0.2, true);
    // листва вдали — тоже реже, если задано (доля оставляемых треугольников)
    if (lodLeaves) for (const p of lodDoc.getRoot().listMeshes().flatMap((x) => x.listPrimitives())) if (isCutout(p.getMaterial())) thinCards(lodDoc, p, lodLeaves);
  }
  return { doc, lodDoc, before, geo };
}

/** Переносит модель из своего документа в общий файл локации узлом с именем name. */
function moveInto(pack, scene, src, name) {
  const roots = src.getRoot().getDefaultScene().listChildren();
  const map = copyToDocument(pack, src, roots);
  const holder = pack.createNode(name);
  for (const r of roots) holder.addChild(map.get(r));
  scene.addChild(holder);
}

const want = process.argv.slice(2);
for (const [loc, list] of Object.entries(spec.packs)) {
  if (want.length && !want.includes(loc)) continue;
  const P = new Document();
  P.createBuffer();
  const scene = P.createScene('kit');
  P.getRoot().setDefaultScene(scene);
  const info = [];
  for (const m of list) {
    const { doc: d, lodDoc, before, geo } = await prepare(m);
    const tris = triCount(d);
    moveInto(P, scene, d, m.id);
    let lod = null;
    if (lodDoc) {
      lod = triCount(lodDoc);
      moveInto(P, scene, lodDoc, m.id + '-lod');
    }
    info.push({ m, tris, lod, before, geo });
  }
  // все буферы — в один, одинаковые текстуры и материалы — общие
  const buf = P.getRoot().listBuffers()[0];
  for (const a of P.getRoot().listAccessors()) a.setBuffer(buf);
  for (const b of P.getRoot().listBuffers()) if (b !== buf) b.dispose();
  await P.transform(
    dedup(),
    prune({ keepLeaves: true }),
    // цвет: по умолчанию 512 (на телефоне игра ужимает ещё вдвое); крупным моделям — больше
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^baseColorTexture$/, resize: [spec.tex || 512, spec.tex || 512], quality: 86 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^normalTexture$/, resize: [256, 256], quality: 84 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' })
  );
  const out = path.join(OUT, `${loc}.glb`);
  await io.write(out, P);
  const kb = Math.round(fs.statSync(out).size / 1024);
  for (const { m, tris, lod, before, geo } of info) {
    manifest.props[m.id] = {
      file: `models/kit/${loc}.glb`, node: m.id, group: 'env', kit: loc, tris, size: geo.size,
      ...(lod ? { lod: { file: `models/kit/${loc}.glb`, node: m.id + '-lod', tris: lod } } : {})
    };
    console.log(`  ${m.id.padEnd(18)} ${String(before).padStart(6)} → ${String(tris).padStart(5)} треуг.${lod ? ` (вдали ${lod})` : ''}  ${geo.size.join('×')}`);
  }
  const texN = P.getRoot().listTextures().length;
  console.log(`${loc}: ${list.length} моделей, ${texN} текстур, ${kb} КБ → ${path.relative(ROOT, out)}`);
}
fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2));
