// Леса и россыпи камней из готовых моделей: одна модель — сотни копий одним вызовом отрисовки.
//
// Копии режутся на куски по сетке: кусок, которого нет в кадре, не рисуется. Внутри куска каждая копия рисуется
// либо подробной моделью (рядом с камерой, с тенью), либо грубой дальней (<id>.lod.glb, без тени). Кто какой —
// решается по расстоянию до камеры, с запасом, чтобы на границе не мигало; пересчёт — когда камера сдвинулась.
import * as THREE from 'three';
import { loadModel, loadLod } from './models.js';
import { patchModel, detail } from './surface.js';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _sp = new THREE.Sphere();
const KEEP = 6; // подробная копия остаётся подробной ещё столько метров за границей
const STEP = 2; // пересчитываем, когда камера ушла на столько метров

/** Псевдослучайное число 0…1 по месту: у одной и той же точки всегда одно и то же. */
export function spot01(x, z, k = 0) {
  const v = Math.sin(x * 12.9898 + z * 78.233 + k * 37.719) * 43758.5453;
  return v - Math.floor(v);
}

function meshesOf(scene) {
  const out = [];
  scene.updateMatrixWorld(true);
  scene.traverse((o) => o.isMesh && out.push(o));
  return out;
}

export class Scatter {
  /** lite — слабое устройство (телефон): подробные копии только совсем рядом. */
  constructor(scene, { lite = false } = {}) {
    this.scene = scene;
    this.lite = lite;
    this.chunks = [];
    this.cx = this.cz = 1e9;
    this.k = 0;
  }
  /**
   * Расставить копии модели id. items: [{ x, y, z, s, ry, sx?, sy?, sz?, rx?, rz?, tint? }] — s общий масштаб
   * (модель приведена к наибольшему размеру 1), sx/sy/sz — растяжение по осям поверх него.
   * opts: cell — размер куска сетки, near — до какого расстояния рисовать подробную модель (на «высоком» качестве),
   * shadow — тени, sway — качание кроны, vary — разброс оттенка между копиями (0…1).
   * Возвращает обещание: готово, когда модели загружены и копии стоят в сцене.
   */
  add(id, items, { cell = 64, near = 55, shadow = true, sway = 0, vary = 0.5, tint = null } = {}) {
    if (!items.length) return Promise.resolve(false);
    return Promise.all([loadModel(id), loadLod(id).catch(() => null)]).then(([tpl, lod]) => {
      const src = meshesOf(tpl.scene);
      if (!src.length) return false;
      // общий материал на все копии модели: свой, чтобы не трогать одиночные копии той же модели
      const mats = src.map((m) => patchModel(m.material.clone(), { sway }));
      const lodSrc = lod ? meshesOf(lod.scene) : null;
      const lodMats = lodSrc ? lodSrc.map((m) => patchModel(m.material.clone(), { sway })) : null;
      const groups = new Map();
      for (const it of items) {
        const key = Math.floor(it.x / cell) + ':' + Math.floor(it.z / cell);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(it);
      }
      for (const list of groups.values()) {
        const n = list.length;
        // матрицы всех копий куска — из них набираются и подробные, и дальние
        const table = (meshes) =>
          meshes.map((m) => {
            const a = new Float32Array(n * 16);
            list.forEach((it, i) => {
              const s = it.s || 1;
              _e.set(it.rx || 0, it.ry || 0, it.rz || 0, 'YXZ');
              _m.compose(_p.set(it.x, it.y, it.z), _q.setFromEuler(_e), _s.set(s * (it.sx || 1), s * (it.sy || 1), s * (it.sz || 1))).multiply(m.matrixWorld);
              _m.toArray(a, i * 16);
            });
            return a;
          });
        const col = new Float32Array(n * 3);
        const px = new Float32Array(n);
        const pz = new Float32Array(n);
        list.forEach((it, i) => {
          px[i] = it.x;
          pz[i] = it.z;
          // оттенок: чуть светлее-темнее и теплее-холоднее — одинаковых деревьев в лесу не бывает
          const a = spot01(it.x, it.z, 1) - 0.5;
          const b = spot01(it.x, it.z, 2) - 0.5;
          const c = [1 + (a * 0.3 + b * 0.12) * vary, 1 + a * 0.3 * vary, 1 + (a * 0.3 - b * 0.16) * vary];
          for (const t of [tint, it.tint]) if (t) (c[0] *= t.r), (c[1] *= t.g), (c[2] *= t.b);
          col.set(c, i * 3);
        });
        const hiM = table(src);
        const loM = lodSrc ? table(lodSrc) : null;
        // шар, в который помещается весь кусок: один на подробные и дальние копии, чтобы не пересчитывать
        const sphere = new THREE.Sphere();
        src.forEach((m, k) => {
          if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
          for (let i = 0; i < n; i++) {
            _sp.copy(m.geometry.boundingSphere).applyMatrix4(_m.fromArray(hiM[k], i * 16));
            if (i === 0 && k === 0) sphere.copy(_sp);
            else sphere.union(_sp);
          }
        });
        sphere.radius += 0.5;
        const build = (meshes, use, cast) =>
          meshes.map((m, k) => {
            const im = new THREE.InstancedMesh(m.geometry, use[k], n);
            im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
            im.instanceColor.setUsage(THREE.DynamicDrawUsage);
            im.castShadow = cast;
            im.receiveShadow = true;
            im.boundingSphere = sphere;
            im.count = 0;
            im.visible = false;
            this.scene.add(im);
            return im;
          });
        this.chunks.push({
          x: sphere.center.x, z: sphere.center.z, r: sphere.radius, n, near, px, pz, col, hiM, loM,
          hi: build(src, mats, shadow), lo: lodSrc ? build(lodSrc, lodMats, false) : null,
          state: new Uint8Array(n), mode: -1, nHi: 0
        });
      }
      this.cx = 1e9; // новые копии — разобрать заново
      return true;
    });
  }
  /** Кто из копий куска рисуется подробно. */
  split(ch, cx, cz, near) {
    const far = near + KEEP;
    const d = Math.hypot(ch.x - cx, ch.z - cz);
    const n = ch.n;
    const st = ch.state;
    // 1 — весь кусок подробный, 0 — весь дальний, 2 — граница проходит по куску: смотрим каждую копию
    const mode = !ch.lo || d + ch.r < near ? 1 : d - ch.r > far ? 0 : 2;
    let changed = ch.mode < 0;
    if (mode !== 2) {
      if (ch.mode !== mode) {
        st.fill(mode);
        changed = true;
      }
    } else {
      const n2 = near * near;
      const f2 = far * far;
      for (let i = 0; i < n; i++) {
        const hi = (ch.px[i] - cx) ** 2 + (ch.pz[i] - cz) ** 2 < (st[i] ? f2 : n2) ? 1 : 0;
        if (hi !== st[i]) {
          st[i] = hi;
          changed = true;
        }
      }
    }
    ch.mode = mode;
    if (!changed) return;
    const fill = (meshes, tables, want) => {
      let c = 0;
      meshes.forEach((im, k) => {
        const from = tables[k];
        const to = im.instanceMatrix.array;
        const tc = im.instanceColor.array;
        c = 0;
        for (let i = 0; i < n; i++) {
          if (st[i] !== want) continue;
          for (let j = 0; j < 16; j++) to[c * 16 + j] = from[i * 16 + j];
          for (let j = 0; j < 3; j++) tc[c * 3 + j] = ch.col[i * 3 + j];
          c++;
        }
        im.count = c;
        im.visible = c > 0;
        im.instanceMatrix.needsUpdate = true;
        im.instanceColor.needsUpdate = true;
      });
      return c;
    };
    ch.nHi = fill(ch.hi, ch.hiM, 1);
    if (ch.lo) fill(ch.lo, ch.loM, 0);
  }
  /** Вызывать каждый кадр: пересчёт идёт, только когда камера сдвинулась или сменилось качество. */
  update(camera) {
    const cx = camera.position.x;
    const cz = camera.position.z;
    const k = detail.lod * (this.lite ? 0.75 : 1);
    if (k === this.k && (cx - this.cx) ** 2 + (cz - this.cz) ** 2 < STEP * STEP) return;
    this.k = k;
    this.cx = cx;
    this.cz = cz;
    for (const ch of this.chunks) this.split(ch, cx, cz, ch.near * k);
  }
  /** Сколько треугольников сейчас в подробных и дальних копиях — для отладки. */
  stats() {
    const tris = (list) => list.reduce((s, m) => s + ((m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3) * m.count, 0);
    let hi = 0;
    let lo = 0;
    let nHi = 0;
    let nLo = 0;
    for (const ch of this.chunks) {
      hi += tris(ch.hi);
      nHi += ch.nHi;
      if (ch.lo) {
        lo += tris(ch.lo);
        nLo += ch.n - ch.nHi;
      }
    }
    return { chunks: this.chunks.length, hi: Math.round(hi), lo: Math.round(lo), nHi, nLo };
  }
}
