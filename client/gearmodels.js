// Готовые модели снастей (Tripo, по картинкам рынка) вместо частей из кода: рукоять удочки, катушка с крутящейся
// ручкой, поплавки и приманки. Пока модель грузится (и в пробной версии без моделей) видна заготовка из кода.
//
// Модели снастей лежат в осях своей картинки-образца (tools/optimize.js, группа gear): X — вправо, Y — вверх,
// Z — к зрителю, середина — в начале координат, наибольший размер — 1. Здесь они перекладываются в оси удочки
// (gear3d.js): +Y — к кончику, катушка висит со стороны +Z, ручка катушки — в +X.
import * as THREE from 'three';
import { loadModel, modelInfo } from './models.js';
import { loadManifest } from './hero.js';
import { addEnvMat } from './env.js';

const usable = (id) => !window.RYBAK_OFFLINE && !!modelInfo(id);

/** Сетка модели одним куском, развёрнутая из сжатого вида, в осях модели. */
function plain(tpl) {
  let src = null;
  tpl.scene.updateMatrixWorld(true);
  tpl.scene.traverse((o) => {
    if (o.isMesh && !src) src = o;
  });
  if (!src) return null;
  const g = new THREE.BufferGeometry();
  for (const name of ['position', 'normal', 'uv']) {
    const a = src.geometry.attributes[name];
    if (!a) continue;
    const n = a.itemSize;
    const arr = new Float32Array(a.count * n);
    const get = [a.getX, a.getY, a.getZ, a.getW];
    for (let i = 0; i < a.count; i++) for (let k = 0; k < n; k++) arr[i * n + k] = get[k].call(a, i);
    g.setAttribute(name, new THREE.BufferAttribute(arr, n));
  }
  g.setIndex(src.geometry.index ? Array.from(src.geometry.index.array) : [...Array(g.attributes.position.count).keys()]);
  g.applyMatrix4(src.matrixWorld);
  return { g, material: src.material };
}
/** Материал снасти: металл по карте Tripo и отражение неба (как у хрома из кода). Один на модель. */
function gearMat(tpl, m0) {
  if (tpl.gearMat) return tpl.gearMat;
  const m = m0.clone();
  if (m.roughnessMap) {
    m.metalnessMap = m.roughnessMap; // Tripo кладёт металл и шероховатость в одну текстуру
    m.metalness = 1;
  }
  m.side = THREE.FrontSide;
  addEnvMat(m, 0.7);
  tpl.gearMat = m;
  return m;
}
/** Строки — новые оси X, Y, Z, записанные в осях картинки. */
const basis = (rows) => new THREE.Matrix4().set(...rows[0], 0, ...rows[1], 0, ...rows[2], 0, 0, 0, 0, 1);
/** Сетка из части треугольников (по маске) с теми же вершинами. */
function subset(g, keep) {
  const idx = g.index.array;
  const out = [];
  for (let t = 0; t < idx.length; t += 3) if (keep[t / 3]) out.push(idx[t], idx[t + 1], idx[t + 2]);
  const h = new THREE.BufferGeometry();
  for (const k in g.attributes) h.setAttribute(k, g.attributes[k]);
  h.setIndex(out);
  h.computeBoundingSphere();
  return h;
}

// ── катушки ──
// rows — как повернуть из осей картинки в оси удочки; size — наибольший размер, м; cut — где кончается корпус и
// начинается ручка (доля размера модели по оси ручки); both — ручка сквозная (у модели ручки с обеих сторон: дальнюю убираем)
const SPIN = [[0, 0, 1], [-1, 0, 0], [0, -1, 0]]; // шпуля к −X картинки, лапка вверху, вал ручки вдоль Z
const MULT = [[-1, 0, 0], [0, 0, -1], [0, -1, 0]]; // мультипликатор: барабан вдоль X, ручка слева, лапка вверху
const REELS = {
  reel1: { rows: SPIN, size: 0.21, cut: 0.24, both: true },
  reel2: { rows: SPIN, size: 0.21, cut: 0.24, both: true },
  reel4: { rows: [[1, 0, 0], [0, 0, 1], [0, -1, 0]], size: 0.21, cut: 0.26, both: true },
  reel6: { rows: SPIN, size: 0.23, cut: 0.24, both: false },
  reel3: { rows: [[-1, 0, 0], [0, 0, 1], [0, 1, 0]], size: 0.2, cut: 0.17, both: false },
  reel5: { rows: MULT, size: 0.23, cut: 0.2, both: false },
  reel7: { rows: MULT, size: 0.24, cut: 0.2, both: false }
};
const reelCache = new Map();
/**
 * Модель катушки, разобранная на корпус и ручку, в осях удочки: лапка прижата к катушкодержателю (y = 0,036,
 * z = seatZ), ручка — отдельной сеткой вокруг своего вала (вал вдоль X, ручка-«грибок» смотрит в +Y, как у ручки из кода).
 */
function reelParts(tpl, id, seatZ) {
  const key = id + '|' + seatZ.toFixed(4);
  if (reelCache.has(key)) return reelCache.get(key);
  const fit = REELS[id];
  const p = plain(tpl);
  if (!p) return null;
  const g = p.g;
  g.applyMatrix4(basis(fit.rows));
  g.computeBoundingBox();
  const bb = g.boundingBox;
  const k = fit.size / Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z);
  g.scale(k, k, k);
  const pos = g.attributes.position;
  const N = pos.count;
  const cut = fit.cut * k;
  // треугольники: 0 — корпус, 1 — ручка (+X), 2 — дальняя ручка (убрать)
  const idx = g.index.array;
  const T = idx.length / 3;
  const kind = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    const cx = (pos.getX(idx[t * 3]) + pos.getX(idx[t * 3 + 1]) + pos.getX(idx[t * 3 + 2])) / 3;
    kind[t] = cx > cut ? 1 : fit.both && cx < -cut ? 2 : 0;
  }
  g.computeBoundingBox();
  const b = g.boundingBox;
  // лапка — самый верх корпуса (к удочке, −Z): её середина встаёт на катушкодержатель
  let fx = 0, fy = 0, fn = 0;
  for (let i = 0; i < N; i++)
    if (pos.getZ(i) < b.min.z + 0.012 && Math.abs(pos.getX(i)) < cut) {
      fx += pos.getX(i);
      fy += pos.getY(i);
      fn++;
    }
  fx = fn ? fx / fn : 0;
  fy = fn ? fy / fn : 0;
  g.translate(-fx, 0.036 - fy, seatZ - b.min.z);
  // вал ручки: середина сечения ручки у самого корпуса
  const inHandle = new Uint8Array(N);
  for (let t = 0; t < T; t++) if (kind[t] === 1) for (let j = 0; j < 3; j++) inHandle[idx[t * 3 + j]] = 1;
  const cutX = cut - fx;
  let sy = 0, sz = 0, sn = 0;
  let hmaxX = cutX;
  for (let i = 0; i < N; i++) {
    if (!inHandle[i]) continue;
    const x = pos.getX(i);
    if (x > hmaxX) hmaxX = x;
    if (x < cutX + 0.012) {
      sy += pos.getY(i);
      sz += pos.getZ(i);
      sn++;
    }
  }
  if (!sn) return null;
  const shaft = new THREE.Vector3(cutX, sy / sn, sz / sn);
  // ручка-«грибок»: самые далёкие от вала точки ручки
  let dmax = 0;
  for (let i = 0; i < N; i++) if (inHandle[i]) dmax = Math.max(dmax, Math.hypot(pos.getY(i) - shaft.y, pos.getZ(i) - shaft.z));
  let kx = 0, ky = 0, kz = 0, kn = 0;
  for (let i = 0; i < N; i++) {
    if (!inHandle[i]) continue;
    const dy = pos.getY(i) - shaft.y;
    const dz = pos.getZ(i) - shaft.z;
    if (Math.hypot(dy, dz) > dmax * 0.78) {
      kx += pos.getX(i);
      ky += dy;
      kz += dz;
      kn++;
    }
  }
  kx /= kn;
  ky /= kn;
  kz /= kn;
  // откуда сходит леска: передний край шпули (барабана), ближе к удочке
  let ymax = -Infinity;
  for (let i = 0; i < N; i++) if (!inHandle[i] && Math.abs(pos.getX(i)) < cutX) ymax = Math.max(ymax, pos.getY(i));
  let lx = 0, ln = 0, lz = Infinity;
  for (let i = 0; i < N; i++) {
    if (inHandle[i] || Math.abs(pos.getX(i)) >= cutX || pos.getY(i) < ymax - 0.02) continue;
    lx += pos.getX(i);
    ln++;
    lz = Math.min(lz, pos.getZ(i));
  }
  const lineOut = new THREE.Vector3(ln ? lx / ln : 0, ymax - 0.012, (lz === Infinity ? 0.08 : lz) + 0.006);
  const body = subset(g, Array.from(kind, (v) => v === 0));
  // ручка: в оси вала, «грибком» вверх (+Y) — как ручка из кода в покое
  const hg = subset(g, Array.from(kind, (v) => v === 1)).clone();
  hg.translate(-shaft.x, -shaft.y, -shaft.z);
  const a = Math.atan2(kz, ky);
  hg.rotateX(-a);
  hg.computeBoundingSphere();
  const knob = new THREE.Vector3(kx - shaft.x, Math.hypot(ky, kz), 0);
  const out = { body, handle: hg, shaft, knob, lineOut, material: gearMat(tpl, p.material) };
  reelCache.set(key, out);
  return out;
}

// ── рукояти удочек ──
// образец — рукоять сбоку, торец слева, кольца снизу: X картинки → +Y удочки, низ картинки → +Z (сторона катушки)
const HANDLE_ROWS = [[0, 0, -1], [1, 0, 0], [0, -1, 0]];
const handleCache = new Map();
function handleGeo(tpl, spec) {
  if (handleCache.has(tpl.id)) return handleCache.get(tpl.id);
  const p = plain(tpl);
  if (!p) return null;
  const g = p.g;
  g.applyMatrix4(basis(HANDLE_ROWS));
  g.computeBoundingBox();
  const b = g.boundingBox;
  const k = spec.hlen / (b.max.y - b.min.y);
  g.scale(k, k, k);
  // ось рукояти — середина её сечения (ручки круглые): по всем вершинам
  const pos = g.attributes.position;
  let mx = 0, mz = 0;
  for (let i = 0; i < pos.count; i++) {
    mx += pos.getX(i);
    mz += pos.getZ(i);
  }
  g.computeBoundingBox();
  g.translate(-mx / pos.count, spec.butt - g.boundingBox.min.y, -mz / pos.count);
  g.computeBoundingSphere();
  const out = { geometry: g, material: gearMat(tpl, p.material) };
  handleCache.set(tpl.id, out);
  return out;
}

/** Поставить на удочку модели её рукояти и катушки (buildRod зовёт сам). */
export function mountRodModels(rod, rodId, reelId) {
  // сколько моделей ещё грузится: заставка ждёт, пока все встанут (шейдеры собираются за ней);
  // удочку собирают и до того, как пришёл список моделей, — тогда сначала ждём его
  if (window.RYBAK_OFFLINE) return;
  rod.pending = 1;
  loadManifest().then(
    () => {
      rod.pending--;
      mountNow(rod, rodId, reelId);
    },
    () => rod.pending--
  );
}
function mountNow(rod, rodId, reelId) {
  const spec = rod.spec;
  const hid = 'gear-' + rodId;
  const done = () => rod.pending--;
  if (spec && spec.hlen && usable(hid)) {
    rod.pending++;
    loadModel(hid).then(
      (tpl) => {
        done();
        const h = handleGeo(tpl, spec);
        if (!h || rod.gone) return;
        const m = new THREE.Mesh(h.geometry, h.material);
        m.name = 'handle-model';
        rod.group.add(m);
        rod.parts.handleProc.visible = false;
        rod.handleModel = m;
      },
      done
    );
  }
  const rid = 'gear-' + reelId;
  if (REELS[reelId] && usable(rid)) {
    rod.pending++;
    loadModel(rid).then(
      (tpl) => {
        done();
        if (rod.gone) return;
        const seatZ = spec && spec.seatR ? spec.seatR * 0.9 : 0.018;
        const r = reelParts(tpl, reelId, seatZ);
        if (!r) return;
        const body = new THREE.Mesh(r.body, r.material);
        body.name = 'reel-model';
        rod.group.add(body);
        rod.parts.reelProc.visible = false;
        rod.parts.handleKnob.visible = false;
        const hm = new THREE.Mesh(r.handle, r.material);
        rod.handle.add(hm);
        rod.handle.position.copy(r.shaft);
        rod.knob.copy(r.knob);
        rod.lineOut.position.copy(r.lineOut);
        rod.reelModel = body;
      },
      done
    );
  }
}

// ── поплавки и приманки ──
/**
 * Модель поплавка или приманки встаёт в рамку заготовки из кода: поплавок — от низа корпуса до верха антенны
 * (киль под водой не нужен), приманка — по наибольшему размеру; середины совпадают.
 */
export function mountBobModel(group, id, float) {
  if (window.RYBAK_OFFLINE) return;
  group.userData.pending = 1;
  loadManifest().then(() => bobNow(group, id, float), () => (group.userData.pending = 0));
}
function bobNow(group, id, float) {
  const mid = 'gear-' + id;
  if (!usable(mid)) return (group.userData.pending = 0);
  loadModel(mid).then(
    (tpl) => {
      group.userData.pending = 0;
      if (group.userData.gone) return;
      const p = plain(tpl);
      if (!p) return;
      const g = p.g;
      g.computeBoundingBox();
      const b = g.boundingBox;
      const box = new THREE.Box3();
      for (const c of group.children) box.expandByObject(c);
      if (float) {
        // от −0,18 (под водой) до верха антенны
        const top = box.max.y;
        const bot = -0.18;
        const k = (top - bot) / (b.max.y - b.min.y);
        g.scale(k, k, k);
        g.computeBoundingBox();
        const c = g.boundingBox;
        g.translate(-(c.min.x + c.max.x) / 2, bot - c.min.y, -(c.min.z + c.max.z) / 2);
      } else {
        const s = box.getSize(new THREE.Vector3());
        const k = Math.max(s.x, s.y, s.z) / Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z);
        g.scale(k, k, k);
        g.computeBoundingBox();
        const c = g.boundingBox.getCenter(new THREE.Vector3());
        const want = box.getCenter(new THREE.Vector3());
        g.translate(want.x - c.x, want.y - c.y, want.z - c.z);
      }
      g.computeBoundingSphere();
      const m = new THREE.Mesh(g, gearMat(tpl, p.material));
      m.castShadow = true;
      for (const c of group.children) c.visible = false;
      group.add(m);
      group.userData.model = m;
    },
    () => (group.userData.pending = 0)
  );
}
