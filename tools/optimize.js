// Готовит сырые модели Tripo для игры.
// Герой: модель со скелетом + все его анимации в одном файле, сетка упрощена, текстуры в WebP, геометрия сжата.
//   node tools/optimize.js            — всё из art/tripo/raw, что есть в art/models.json
//   node tools/optimize.js hero-yellow
//   node tools/optimize.js --meta     — только обновить в manifest.json сведения о героях из art/models.json (имя, описание, рост…), модели не трогать
// Модель локации (деревья, камни, постройки): как предмет — наибольший размер 1, стоит на y = 0; плюс дальняя копия.
// Результат: public/models/<id>.glb и public/models/manifest.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, textureCompress, resample, meshopt, mergeDocuments, unpartition, transformMesh, compactPrimitive } from '@gltf-transform/functions';
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
const BUDGET = { gear: { tris: 7000, tex: [1024, 512] }, hero: { tris: 30000, tex: [2048, 2048] }, prop: { tris: 7000, tex: [1024, 512] }, fish: { tris: 8000, tex: [1024, 512] }, junk: { tris: 4000, tex: [512, 512] }, env: { tris: 6000, tex: [1024, 512] } };
// У модели локации в art/models.json можно задать: tris — сколько треугольников оставить, tex — размеры текстур,
// flat — без карты нормалей (деревья и кусты: их много, а рельеф листвы и так в сетке), lod — сколько треугольников
// в дальней копии (<id>.lod.glb: вместо текстуры — цвет вершин), gamma — высветлить тёмную текстуру (меньше 1),
// stretch — [y0, y1, k]: вытянуть по высоте только полосу от y0 до y1 в k раз (длинная свая из короткой модели),
// repaint — в какой цвет перекрасить чёрные детали, glow — где у модели стёкла окон, которые ночью светятся
// (коробки [x0, y0, z0, x1, y1, z1] в осях готовой модели; найти их помогает tools/dev/windows.mjs).

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
/** Произведение матриц 3×3 (строки). */
const mul = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
/** Поворот на [x, y, z] градусов: сначала вокруг X, потом Y, потом Z. */
function rotXYZ([ax, ay, az]) {
  const r = (d) => (d * Math.PI) / 180;
  const c = (d) => Math.cos(r(d));
  const sn = (d) => Math.sin(r(d));
  const X = [[1, 0, 0], [0, c(ax), -sn(ax)], [0, sn(ax), c(ax)]];
  const Y = [[c(ay), 0, sn(ay)], [0, 1, 0], [-sn(ay), 0, c(ay)]];
  const Z = [[c(az), -sn(az), 0], [sn(az), c(az), 0], [0, 0, 1]];
  return mul(Z, mul(Y, X));
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
  } else if (m.group === 'gear' && m.align) {
    // снасть (поплавок, приманка): оси картинки-образца — X вправо, Y вверх, Z к зрителю; потом поворот в плоскости
    // картинки, который кладёт главную ось предмета вдоль Y (align: 'y') или X (align: 'x') — самый короткий, так что
    // верх (или левый край) картинки остаётся верхом (левым краем); rot — довернуть руками [x, y, z] в градусах
    const R0 = [[0, 0, -1], [0, 1, 0], [1, 0, 0]];
    const f0 = (x, y, z) => R0.map((r) => r[0] * x + r[1] * y + r[2] * z);
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, n = 0;
    for (const mesh of meshes)
      for (const p of mesh.listPrimitives()) {
        const a = p.getAttribute('POSITION');
        const v = [0, 0, 0];
        for (let i = 0; i < a.getCount(); i++) {
          a.getElement(i, v);
          const [x, y] = f0(v[0], v[1], v[2]);
          sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; n++;
        }
      }
    const cxx = sxx / n - (sx / n) ** 2, cyy = syy / n - (sy / n) ** 2, cxy = sxy / n - (sx / n) * (sy / n);
    const th = 0.5 * Math.atan2(2 * cxy, cxx - cyy); // угол главной оси от X
    let phi = (m.align === 'y' ? Math.PI / 2 : 0) - th;
    while (phi > Math.PI / 2) phi -= Math.PI;
    while (phi < -Math.PI / 2) phi += Math.PI;
    R = mul(rotXYZ(m.rot || [0, 0, 0]), mul([[Math.cos(phi), -Math.sin(phi), 0], [Math.sin(phi), Math.cos(phi), 0], [0, 0, 1]], R0));
  } else if (m.group === 'gear' && m.rot) {
    R = mul(rotXYZ(m.rot), [[0, 0, -1], [0, 1, 0], [1, 0, 0]]);
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
  // рыба и снасти — серединой в начале координат, предметы локации стоят на y = 0
  const t = m.group === 'fish' || m.group === 'gear' ? q.mid.map((v) => -v * k) : [-q.mid[0] * k, -q.lo[1] * k, -q.mid[2] * k];
  const M = [R[0][0] * k, R[1][0] * k, R[2][0] * k, 0, R[0][1] * k, R[1][1] * k, R[2][1] * k, 0, R[0][2] * k, R[1][2] * k, R[2][2] * k, 0, t[0], t[1], t[2], 1];
  for (const mesh of meshes) transformMesh(mesh, M);
  return q.size.map((v) => +(v * k).toFixed(3));
}

/**
 * Вытягивает модель по высоте только в полосе от y0 до y1 (в долях высоты готовой модели) в k раз: у сваи длинной
 * становится гладкая середина, а канат, обруч и обросший низ остаются как были. Потом модель снова приводится
 * к наибольшему размеру 1. Возвращает новые размеры.
 */
function stretchY(doc, [y0, y1, k], size) {
  const add = (y1 - y0) * (k - 1);
  const top = size[1] + add;
  const scale = 1 / Math.max(size[0], top, size[2]);
  for (const mesh of doc.getRoot().listMeshes())
    for (const prim of mesh.listPrimitives()) {
      const a = prim.getAttribute('POSITION');
      const v = [0, 0, 0];
      for (let i = 0; i < a.getCount(); i++) {
        a.getElement(i, v);
        if (v[1] > y1) v[1] += add;
        else if (v[1] > y0) v[1] = y0 + (v[1] - y0) * k;
        a.setElement(i, [v[0] * scale, v[1] * scale, v[2] * scale]);
      }
    }
  return [size[0] * scale, top * scale, size[2] * scale].map((x) => +x.toFixed(3));
}

/**
 * Правка текстуры цвета под свет игры. В игре нет отражений, а итоговая цветокоррекция тёмное делает ещё темнее,
 * поэтому тёмные модели Tripo выходят чёрными пятнами без формы.
 * gamma < 1 — высветлить тени и середину (заодно чуть гаснет чрезмерная насыщенность тёмных красок);
 * repaint — тёмные бесцветные места (чёрный пластик, резина) перекрасить в оттенки этого цвета; цветное
 * (дерево, краска) и светлое при этом не трогается.
 */
async function tuneTexture(doc, { gamma = 1, repaint = null }) {
  const c = repaint ? [1, 3, 5].map((i) => parseInt(repaint.slice(i, i + 2), 16) / 255) : null;
  const ss = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) lut[i] = Math.round(255 * Math.pow(i / 255, gamma));
  for (const mat of doc.getRoot().listMaterials()) {
    const tex = mat.getBaseColorTexture();
    if (!tex) continue;
    const { data, info } = await sharp(Buffer.from(tex.getImage())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 3) {
      if (c) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        const v = Math.max(r, g, b);
        const sat = v > 0 ? (v - Math.min(r, g, b)) / v : 0;
        const k = (1 - ss(0.18, 0.42, sat)) * (1 - ss(0.28, 0.5, v));
        if (k > 0) {
          // рисунок сохраняется: чем светлее было место, тем светлее оттенок
          const shade = Math.min(2.2, Math.max(0.45, v / 0.16));
          data[i] = Math.round(255 * Math.min(1, r + (c[0] * shade - r) * k));
          data[i + 1] = Math.round(255 * Math.min(1, g + (c[1] * shade - g) * k));
          data[i + 2] = Math.round(255 * Math.min(1, b + (c[2] * shade - b) * k));
          continue;
        }
      }
      if (gamma !== 1) {
        data[i] = lut[data[i]];
        data[i + 1] = lut[data[i + 1]];
        data[i + 2] = lut[data[i + 2]];
      }
    }
    tex.setImage(await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer()).setMimeType('image/png');
  }
}

/**
 * Карта свечения окон: белым — стёкла, чёрным — всё остальное. В игре она гаснет днём и загорается ночью.
 * Стекло ищется так: точка текстуры лежит на сетке внутри одной из коробок boxes и при этом тёмная — голубые
 * переплёты и рамы окна в карту не попадают и ночью остаются тёмным рисунком поверх света.
 */
async function glowMap(doc, boxes) {
  let lit = 0;
  for (const mat of doc.getRoot().listMaterials()) {
    const tex = mat.getBaseColorTexture();
    if (!tex) continue;
    const { data, info } = await sharp(Buffer.from(tex.getImage())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width;
    const H = info.height;
    const mask = Buffer.alloc(W * H);
    const inBox = (q) => boxes.some((b) => q[0] >= b[0] && q[0] <= b[3] && q[1] >= b[1] && q[1] <= b[4] && q[2] >= b[2] && q[2] <= b[5]);
    for (const mesh of doc.getRoot().listMeshes())
      for (const prim of mesh.listPrimitives()) {
        if (prim.getMaterial() !== mat) continue;
        const P = prim.getAttribute('POSITION');
        const UV = prim.getAttribute('TEXCOORD_0');
        const idx = prim.getIndices();
        if (!UV) continue;
        const n = idx ? idx.getCount() : P.getCount();
        for (let i = 0; i < n; i += 3) {
          const id = [0, 1, 2].map((k) => (idx ? idx.getScalar(i + k) : i + k));
          const p = id.map((j) => P.getElement(j, [0, 0, 0]));
          // треугольник целиком вне коробок — мимо
          const lo = [0, 1, 2].map((k) => Math.min(p[0][k], p[1][k], p[2][k]));
          const hi = [0, 1, 2].map((k) => Math.max(p[0][k], p[1][k], p[2][k]));
          if (!boxes.some((b) => hi[0] >= b[0] && lo[0] <= b[3] && hi[1] >= b[1] && lo[1] <= b[4] && hi[2] >= b[2] && lo[2] <= b[5])) continue;
          const t = id.map((j) => UV.getElement(j, [0, 0])).map(([u, v]) => [u * W, v * H]);
          const den = (t[1][1] - t[2][1]) * (t[0][0] - t[2][0]) + (t[2][0] - t[1][0]) * (t[0][1] - t[2][1]);
          if (Math.abs(den) < 1e-9) continue;
          const x0 = Math.max(0, Math.floor(Math.min(t[0][0], t[1][0], t[2][0])));
          const x1 = Math.min(W - 1, Math.ceil(Math.max(t[0][0], t[1][0], t[2][0])));
          const y0 = Math.max(0, Math.floor(Math.min(t[0][1], t[1][1], t[2][1])));
          const y1 = Math.min(H - 1, Math.ceil(Math.max(t[0][1], t[1][1], t[2][1])));
          for (let y = y0; y <= y1; y++)
            for (let x = x0; x <= x1; x++) {
              const a = ((t[1][1] - t[2][1]) * (x + 0.5 - t[2][0]) + (t[2][0] - t[1][0]) * (y + 0.5 - t[2][1])) / den;
              const b = ((t[2][1] - t[0][1]) * (x + 0.5 - t[2][0]) + (t[0][0] - t[2][0]) * (y + 0.5 - t[2][1])) / den;
              const c = 1 - a - b;
              if (a < -0.02 || b < -0.02 || c < -0.02) continue;
              if (!inBox([0, 1, 2].map((k) => p[0][k] * a + p[1][k] * b + p[2][k] * c))) continue;
              const o = (y * W + x) * 3;
              const r = data[o] / 255;
              const g = data[o + 1] / 255;
              const bl = data[o + 2] / 255;
              // стекло тёмное; яркое голубое (переплёт, рама, ставни) и светлое (стена) — не оно
              if (Math.max(r, g, bl) < 0.5 && !(bl > 0.5 && bl - r > 0.2)) mask[y * W + x] = 255;
            }
        }
      }
    for (let i = 0; i < mask.length; i++) if (mask[i]) lit++;
    if (!lit) continue;
    const png = await sharp(mask, { raw: { width: W, height: H, channels: 1 } }).blur(0.8).toColourspace('srgb').png().toBuffer();
    mat.setEmissiveTexture(doc.createTexture('glow').setImage(png).setMimeType('image/png')).setEmissiveFactor([1, 1, 1]);
  }
  return lit;
}

/** Цвет текстуры — в цвет вершин (усреднённый по соседству), развёртка убирается: дальней копии текстура не нужна. */
async function bakeVertexColors(doc) {
  const buffer = doc.getRoot().listBuffers()[0];
  const cache = new Map();
  for (const mesh of doc.getRoot().listMeshes())
    for (const prim of mesh.listPrimitives()) {
      const mat = prim.getMaterial();
      const tex = mat && mat.getBaseColorTexture();
      const uv = prim.getAttribute('TEXCOORD_0');
      if (!tex || !uv) continue;
      const N = 192;
      if (!cache.has(tex)) cache.set(tex, (await sharp(Buffer.from(tex.getImage())).resize(N, N, { fit: 'fill' }).removeAlpha().raw().toBuffer()));
      const px = cache.get(tex);
      const n = uv.getCount();
      const col = new Float32Array(n * 3);
      const t = [0, 0];
      const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      for (let i = 0; i < n; i++) {
        uv.getElement(i, t);
        const x = Math.min(N - 1, Math.max(0, Math.floor((t[0] - Math.floor(t[0])) * N)));
        const y = Math.min(N - 1, Math.max(0, Math.floor((t[1] - Math.floor(t[1])) * N)));
        for (let k = 0; k < 3; k++) col[i * 3 + k] = lin(px[(y * N + x) * 3 + k] / 255);
      }
      prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(col).setBuffer(buffer));
      prim.setAttribute('TEXCOORD_0', null);
    }
  for (const mat of doc.getRoot().listMaterials()) {
    mat.setBaseColorTexture(null);
    mat.setNormalTexture(null);
    mat.setEmissiveTexture(null);
  }
}
/** Грубое упрощение для дальней копии: схлопывает и через швы, мелкие обрывки выбрасывает. */
function hardSimplify(doc, target, error) {
  const buffer = doc.getRoot().listBuffers()[0];
  const prims = doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives());
  const total = prims.reduce((s, p) => s + p.getIndices().getCount() / 3, 0);
  for (const prim of prims) {
    const pos = prim.getAttribute('POSITION');
    const positions = new Float32Array(pos.getCount() * 3);
    const v = [0, 0, 0];
    for (let i = 0; i < pos.getCount(); i++) {
      pos.getElement(i, v);
      positions.set(v, i * 3);
    }
    const idx = prim.getIndices();
    const indices = new Uint32Array(idx.getCount());
    for (let i = 0; i < indices.length; i++) indices[i] = idx.getScalar(i);
    const want = Math.max(12, Math.round((target * (indices.length / 3)) / total)) * 3;
    const [res] = MeshoptSimplifier.simplify(indices, positions, 3, want, error, ['Permissive', 'Prune']);
    prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(res).setBuffer(buffer));
    compactPrimitive(prim);
  }
}

/** Сведения о герое, которые игра берёт из manifest.json: tag — девиз под именем на экране «Персонаж», about — строка о герое там же, tall — рост относительно обычного, eye — высота глаз (м). */
const heroMeta = (m) => ({ ...(m.fp ? { fp: m.fp } : {}), ...(m.tint ? { tint: m.tint } : {}), ...(m.npc ? { npc: true } : {}), ...(m.hands ? { hands: m.hands } : {}), ...(m.tall ? { tall: m.tall } : {}), ...(m.eye ? { eye: m.eye } : {}) });
const META = process.argv.includes('--meta');
const want = process.argv.slice(2).filter((a) => !a.startsWith('--'));
for (const m of spec.models) {
  if (want.length && !want.includes(m.id)) continue;
  if (m.skip && !want.includes(m.id)) continue; // модель есть, но в игру не пошла (в skip — почему)
  if (META) {
    const i = manifest.heroes.findIndex((h) => h.id === m.id);
    if (m.group !== 'hero' || i < 0) continue;
    const h = manifest.heroes[i];
    manifest.heroes[i] = { id: h.id, name: m.name, ...(m.tag ? { tag: m.tag } : {}), ...(m.about ? { about: m.about } : {}), file: h.file, lite: h.lite, tris: h.tris, kb: h.kb, clips: h.clips, ...heroMeta(m), ...(h.face ? { face: h.face } : {}) };
    continue;
  }
  const base = path.join(RAW, m.group === 'hero' ? `${m.id}-rig.glb` : `${m.id}.glb`);
  if (!fs.existsSync(base)) continue;
  const budget = { ...(BUDGET[m.group] || BUDGET.prop), ...(m.tex ? { tex: m.tex } : {}) };
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
  let size = m.group === 'hero' ? null : normalize(doc, m);
  if (m.stretch) size = stretchY(doc, m.stretch, size);
  if (m.nudge) {
    // сдвинуть отставшую часть модели (у катера моторы висели в паре сантиметров за транцем): [ниже какой x, на сколько]
    const [below, dx] = m.nudge;
    for (const mesh of doc.getRoot().listMeshes())
      for (const prim of mesh.listPrimitives()) {
        const a = prim.getAttribute('POSITION');
        const v = [0, 0, 0];
        for (let i = 0; i < a.getCount(); i++) {
          a.getElement(i, v);
          if (v[0] < below) a.setElement(i, [v[0] + dx, v[1], v[2]]);
        }
      }
  }
  if (m.group === 'prop' || m.group === 'junk' || m.group === 'env') {
    // предметы в игре матовые: карта блеска им не нужна — минус файл и выборка из текстуры
    for (const mat of doc.getRoot().listMaterials()) {
      mat.setMetallicRoughnessTexture(null);
      mat.setOcclusionTexture(null);
      mat.setMetallicFactor(0);
      mat.setRoughnessFactor(0.9);
      if (m.flat) mat.setNormalTexture(null);
    }
  }
  if (m.repaint || m.gamma) await tuneTexture(doc, { gamma: m.gamma || 1, repaint: m.repaint || null });
  const glowPx = m.glow ? await glowMap(doc, m.glow) : 0;
  const ratio = Math.min(1, (m.tris || budget.tris) / Math.max(1, before));
  await doc.transform(
    unpartition(),
    dedup(),
    prune(),
    weld(),
    ...(ratio < 0.98 ? [simplify({ simplifier: MeshoptSimplifier, ratio, error: m.err || (m.group === 'hero' ? 0.0015 : m.group === 'fish' || m.group === 'gear' ? 0.003 : m.group === 'env' ? 0.05 : 0.008), lockBorder: false })] : []),
    resample(),
    prune(),
    // карта свечения окон — того же размера, что и цвет: стёкла в ней мелкие, а весит она почти ничего
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^(baseColorTexture|emissiveTexture)$/, resize: [budget.tex[0], budget.tex[0]], quality: 86 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^(normalTexture|metallicRoughnessTexture|occlusionTexture)$/, resize: [budget.tex[1], budget.tex[1]], quality: 84 }),
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
  // дальняя копия модели локации: грубая сетка без текстур
  let lod = null;
  if (m.group === 'env' && m.lod) {
    // текстуру — в цвет вершин: без развёртки сетку можно упрощать смело, цвета при этом не «плывут»
    await bakeVertexColors(doc);
    await doc.transform(weld());
    hardSimplify(doc, m.lod, 0.3);
    await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
    const lo = path.join(OUT, `${m.id}.lod.glb`);
    await io.write(lo, doc);
    lod = { file: `models/${m.id}.lod.glb`, tris: triCount(doc), kb: Math.round(fs.statSync(lo).size / 1024) };
  }
  if (m.group === 'hero') {
    const i = manifest.heroes.findIndex((h) => h.id === m.id);
    const prev = i >= 0 ? manifest.heroes[i] : {};
    // face — запечённый портрет (tools/bake-icons.cjs --faces)
    const entry = { id: m.id, name: m.name, ...(m.tag ? { tag: m.tag } : {}), ...(m.about ? { about: m.about } : {}), file: `models/${m.id}.glb`, lite: lite.file, tris, kb, clips: Object.keys(clips), ...heroMeta(m), ...(prev.face ? { face: prev.face } : {}) };
    if (i >= 0) manifest.heroes[i] = entry;
    else manifest.heroes.push(entry);
  } else {
    const prev = manifest.props[m.id] || {};
    manifest.props[m.id] = { file: `models/${m.id}.glb`, group: m.group, tris, kb, size, ...(m.view ? { view: m.view } : {}), ...(prev.icon ? { icon: prev.icon } : {}), ...(lod ? { lod } : {}) };
  }
  console.log(`${m.id}: ${before} → ${tris} треуг., ${kb} КБ${glowPx ? `, стёкла: ${glowPx} точек` : ''}${lod ? ` (вдали: ${lod.tris} треуг., ${lod.kb} КБ)` : ''}${lite ? ` (для телефонов: ${lite.tris} треуг., ${lite.kb} КБ)` : ''}${Object.keys(clips).length ? ', анимации: ' + Object.entries(clips).map(([k, v]) => `${k} ${v.dur} с (${v.tracks} дорожек)`).join(', ') : ''}`);
}
// герои идут в том же порядке, что и в art/models.json: так они выстроены на экране «Персонаж»
const order = (id) => {
  const i = spec.models.findIndex((x) => x.id === id);
  return i < 0 ? 1e6 : i;
};
manifest.heroes.sort((a, b) => order(a.id) - order(b.id));
fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2));
console.log('manifest:', manifest.heroes.length, 'героев,', Object.keys(manifest.props).length, 'предметов');
