// Трава и цветы вблизи: пучки травинок и луговые цветы вокруг игрока.
//
// Рисованная текстура даёт лугу рисунок, но вблизи земля всё равно плоская. Пучки добавляют объём там, где игрок
// стоит и ходит: на берегу, на острове с маяком, на дюне Пальмового острова. Места выбираются один раз (где трава,
// не тропа, не настил и не обрыв), а рисуются только ближайшие — двумя вызовами отрисовки на всё:
// один меш на пучки, один на цветы, в них подкладываются копии из ближних клеток.
import * as THREE from 'three';
import { fbm2, TAU } from './util.js';
import { groundH, shoreZ, deckAt, blocksAt, ISLAND, PALM, palmR } from './terrain.js';
import { surfaceU } from './surface.js';

const CELL = 12; // размер клетки, по которым разложены места
const STEP = 0.82; // шаг между пучками

function hash2(ix, iz, seed) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iz, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Пучок: семь травинок веером, каждая — узкий клин из трёх треугольников; высота пучка 1. */
function tuftGeometry() {
  const pos = [];
  const col = [];
  const tint = [];
  const BLADES = 7;
  for (let i = 0; i < BLADES; i++) {
    const a = (i / BLADES) * TAU + (i % 2) * 0.5;
    const lean = 0.22 + 0.5 * ((i * 0.618) % 1); // насколько травинка отклонена наружу
    const h = 0.62 + 0.38 * ((i * 0.37 + 0.2) % 1);
    const w = 0.07;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const px = -dz;
    const pz = dx; // поперёк травинки
    const at = (t, side) => {
      const out = lean * t * t * h + 0.06;
      const ww = w * (1 - t * 0.85) * side;
      return [dx * out + px * ww, t * h, dz * out + pz * ww];
    };
    const quad = [at(0, -1), at(0, 1), at(0.55, -1), at(0.55, 1), at(1, 0)];
    const shade = [0.66, 0.66, 0.93, 0.93, 1.12];
    for (const k of [0, 1, 2, 2, 1, 3, 2, 3, 4]) {
      pos.push(...quad[k]);
      col.push(shade[k], shade[k], shade[k] * 0.92);
      tint.push(1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aTint', new THREE.Float32BufferAttribute(tint, 1));
  // свет — как у земли под пучком: нормаль у всех вершин смотрит вверх, иначе травинки пестрят тёмными изнанками
  g.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(pos.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  return g;
}
/** Цветок: стебель, венчик из шести лепестков, серединка; высота 1. Лепестки красятся цветом копии, остальное — своим. */
function flowerGeometry() {
  const pos = [];
  const col = [];
  const tint = [];
  const tri = (a, b, c, color, t) => {
    pos.push(...a, ...b, ...c);
    for (let i = 0; i < 3; i++) {
      col.push(...color);
      tint.push(t);
    }
  };
  const STEM = [0.36, 0.62, 0.24];
  for (const [dx, dz] of [[1, 0], [0, 1]]) {
    const w = 0.035;
    tri([-dx * w, 0, -dz * w], [dx * w, 0, dz * w], [0.04, 0.86, 0.02], STEM, 0);
  }
  // пара листьев у основания
  tri([0, 0.05, 0], [0.22, 0.2, 0.05], [0.1, 0.3, -0.06], STEM, 0);
  tri([0, 0.05, 0], [-0.2, 0.22, -0.04], [-0.08, 0.3, 0.07], STEM, 0);
  const cy = 0.88;
  const R = 0.3;
  for (let i = 0; i < 6; i++) {
    const a0 = (i / 6) * TAU;
    const a1 = ((i + 0.5) / 6) * TAU;
    const a2 = ((i + 1) / 6) * TAU;
    const p0 = [0.04 + Math.cos(a0) * R * 0.3, cy, 0.02 + Math.sin(a0) * R * 0.3];
    const p1 = [0.04 + Math.cos(a1) * R, cy + 0.08, 0.02 + Math.sin(a1) * R];
    const p2 = [0.04 + Math.cos(a2) * R * 0.3, cy, 0.02 + Math.sin(a2) * R * 0.3];
    tri(p0, p1, p2, [1, 1, 1], 1);
    tri([0.04, cy + 0.03, 0.02], p0, p2, [1.0, 0.82, 0.2], 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aTint', new THREE.Float32BufferAttribute(tint, 1));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(pos.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  return g;
}

/** Материал травинок: качаются на ветру, у края видимости плавно уходят в землю. */
export function grassMaterial(U) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTimeS = surfaceU.uTimeS;
    sh.uniforms.uCloudK = surfaceU.uCloudK;
    sh.uniforms.uDet = surfaceU.uDet;
    sh.uniforms.uFar = U.uFar;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTimeS, uFar;\nattribute float aTint;\nvarying vec3 vWp;')
      .replace(
        '#include <color_vertex>',
        `#include <color_vertex>
        #ifdef USE_INSTANCING_COLOR
          vColor.rgb = mix(color.rgb, vColor.rgb, aTint);
        #endif`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          vec4 o = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float far = distance(o.xyz, cameraPosition);
          transformed *= 1.0 - smoothstep(uFar * 0.68, uFar * 0.97, far);
          float ph = o.x * 0.9 + o.z * 0.7;
          float h = position.y;
          float a = (sin(uTimeS * 1.7 + ph) + 0.5 * sin(uTimeS * 3.9 + ph * 1.9)) * 0.11 * h * h;
          transformed.x += a;
          transformed.z += a * 0.55;
          vWp = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
        }`
      );
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uDet;\nuniform float uTimeS, uCloudK;\nvarying vec3 vWp;')
      // изнанка травинки освещена так же, как лицо
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = normalize(vNormal);')
      // тени облаков — те же, что плывут по земле
      .replace('#include <opaque_fragment>', 'outgoingLight *= 1.0 - uCloudK * 0.2 * smoothstep(0.5, 0.68, texture2D(uDet, vWp.xz * 0.0019 + uTimeS * vec2(0.0021, 0.0012)).r);\n#include <opaque_fragment>');
  };
  m.customProgramCacheKey = () => 'grass1';
  return m;
}

export class GrassField {
  /**
   * tint(x, z, out) — цвет травы в точке (и сколько там травы, 0…1 — возвращает число): из world.js, чтобы пучки были
   * того же оттенка, что земля под ними.
   */
  constructor(scene, tint, { max = 9000, maxFlowers = 1400 } = {}) {
    this.cells = new Map(); // "ix,iz" → { tufts: Float32Array (x, y, z, размер, поворот, r, g, b), flowers: … }
    this.far = 0;
    this.last = null;
    this.U = { uFar: { value: 44 } };
    this.count = { tufts: 0, flowers: 0 };
    const mat = grassMaterial(this.U);
    this.tufts = new THREE.InstancedMesh(tuftGeometry(), mat, max);
    this.flowers = new THREE.InstancedMesh(flowerGeometry(), mat, maxFlowers);
    for (const m of [this.tufts, this.flowers]) {
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(m.instanceMatrix.count * 3), 3);
      m.instanceColor.setUsage(THREE.DynamicDrawUsage);
      m.count = 0;
      m.frustumCulled = false; // копии лежат вокруг камеры — всегда в кадре
      m.receiveShadow = true;
      m.castShadow = false;
      m.visible = false;
      scene.add(m);
    }
    this.plant(tint);
  }
  /** Один раз выбирает места: частая сетка со сдвигами, пучки растут куртинами, цветы — полянами одного цвета. */
  plant(tint) {
    const c = new THREE.Color();
    const FLOWERS = ['#ffffff', '#ffd84a', '#ff8fb5', '#b99cff', '#ff9d45'].map((h) => new THREE.Color(h));
    const tufts = new Map();
    const flowers = new Map();
    const push = (map, x, z, rec) => {
      const key = Math.floor(x / CELL) + ',' + Math.floor(z / CELL);
      let a = map.get(key);
      if (!a) map.set(key, (a = []));
      a.push(...rec);
    };
    const scan = (x0, x1, z0, z1, ok) => {
      for (let iz = Math.floor(z0 / STEP); iz <= z1 / STEP; iz++)
        for (let ix = Math.floor(x0 / STEP); ix <= x1 / STEP; ix++) {
          const x = (ix + hash2(ix, iz, 1)) * STEP;
          const z = (iz + hash2(ix, iz, 2)) * STEP;
          if (!ok(x, z)) continue;
          const clump = fbm2(x * 0.16 + 3, z * 0.16 + 8, 2);
          const r = hash2(ix, iz, 3);
          if (r > 0.42 + 1.3 * Math.max(0, clump - 0.3)) continue; // куртины: где-то густо, где-то почти пусто
          if (deckAt(x, z, 0.3) || blocksAt(x, z)) continue;
          const g = tint(x, z, c);
          if (g < 0.72) continue;
          const y = groundH(x, z);
          const k = 0.9 + hash2(ix, iz, 4) * 0.24;
          const patch = fbm2(x * 0.07 + 40, z * 0.07 + 11, 2);
          if (hash2(ix, iz, 5) < 0.02 + 0.22 * Math.max(0, patch - 0.56) * 4) {
            // цветок: у поляны свой цвет
            const fc = FLOWERS[Math.floor(fbm2(x * 0.045 + 7, z * 0.045 + 19, 2) * 2.2 * FLOWERS.length) % FLOWERS.length];
            push(flowers, x, z, [x, y, z, 0.26 + hash2(ix, iz, 6) * 0.2, hash2(ix, iz, 7) * TAU, fc.r, fc.g, fc.b]);
          } else push(tufts, x, z, [x, y - 0.02, z, (0.22 + 0.22 * hash2(ix, iz, 6)) * (0.75 + 0.6 * clump), hash2(ix, iz, 7) * TAU, c.r * k, c.g * k * 1.03, c.b * k]);
        }
    };
    // берег и ближние холмы большой бухты
    scan(-125, 115, -60, 80, (x, z) => {
      const d = z - shoreZ(x);
      return d > 1.5 && d < 62;
    });
    // остров с маяком
    scan(ISLAND.x - 40, ISLAND.x + 40, ISLAND.z - 40, ISLAND.z + 40, (x, z) => Math.hypot(x - ISLAND.x, z - ISLAND.z) < 40 && groundH(x, z) > 5);
    // дюна Пальмового острова
    scan(PALM.x - PALM.rx, PALM.x + PALM.rx, PALM.z - PALM.rz, PALM.z + PALM.rz, (x, z) => palmR(x, z) < 1);
    for (const [k, a] of tufts) this.cells.set(k, { tufts: new Float32Array(a), flowers: new Float32Array(flowers.get(k) || []) });
    for (const [k, a] of flowers) if (!this.cells.has(k)) this.cells.set(k, { tufts: new Float32Array(0), flowers: new Float32Array(a) });
    this.total = { tufts: [...tufts.values()].reduce((s, a) => s + a.length / 8, 0), flowers: [...flowers.values()].reduce((s, a) => s + a.length / 8, 0) };
  }
  /** far — на каком расстоянии от камеры растёт трава (0 — выключена: «низкое» качество). */
  setRange(far) {
    if (far === this.far) return;
    this.far = far;
    this.U.uFar.value = far || 1;
    this.last = null;
    this.tufts.visible = this.flowers.visible = far > 0;
  }
  update(camera) {
    if (!this.far) return;
    const p = camera.position;
    if (this.last && Math.hypot(p.x - this.last.x, p.z - this.last.z) < 3) return;
    this.last = { x: p.x, z: p.z };
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const v = new THREE.Vector3();
    const UP = new THREE.Vector3(0, 1, 0);
    const R = this.far + 3; // запас на шаг обновления
    const fill = (mesh, kind, tall) => {
      let n = 0;
      const max = mesh.instanceMatrix.count;
      const col = mesh.instanceColor.array;
      const c0 = Math.floor((p.x - R) / CELL);
      const c1 = Math.floor((p.x + R) / CELL);
      const d0 = Math.floor((p.z - R) / CELL);
      const d1 = Math.floor((p.z + R) / CELL);
      for (let iz = d0; iz <= d1 && n < max; iz++)
        for (let ix = c0; ix <= c1 && n < max; ix++) {
          const cell = this.cells.get(ix + ',' + iz);
          if (!cell) continue;
          const a = cell[kind];
          for (let i = 0; i < a.length && n < max; i += 8) {
            if ((a[i] - p.x) ** 2 + (a[i + 2] - p.z) ** 2 > R * R) continue;
            q.setFromAxisAngle(UP, a[i + 4]);
            s.set(a[i + 3] * (tall ? 1 : 1.25), a[i + 3], a[i + 3] * (tall ? 1 : 1.25));
            m4.compose(v.set(a[i], a[i + 1], a[i + 2]), q, s);
            m4.toArray(mesh.instanceMatrix.array, n * 16);
            col[n * 3] = a[i + 5];
            col[n * 3 + 1] = a[i + 6];
            col[n * 3 + 2] = a[i + 7];
            n++;
          }
        }
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
      return n;
    };
    this.count.tufts = fill(this.tufts, 'tufts', false);
    this.count.flowers = fill(this.flowers, 'flowers', true);
  }
  stats() {
    return { tufts: this.count.tufts, flowers: this.count.flowers, planted: this.total.tufts, plantedFlowers: this.total.flowers };
  }
}
