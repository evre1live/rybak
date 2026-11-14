// Дно бухты: то, что видно сквозь воду с причала и из лодки, — водоросли, камни, ракушки, морские звёзды,
// кораллы у рифа и затонувшая мелочь у причала и у остова.
//
// Статика собрана в один меш с цветом в вершинах (тот же материал, что у причалов). Водоросли — копии одной заготовки,
// качаются тем же шейдером, что трава на берегу. Новых шейдеров нет: на сборку и прогрев это не влияет.
// Всё лежит там, где дно видно (до четырёх метров глубины), и рисуется до воды: вода сама приглушает его по глубине.
import * as THREE from 'three';
import { Batch, M, G, BATCH_MAT } from './batch.js';
import { groundH, inRocks, REEF, WRECK, BACKWATER, PALM, HAS } from './terrain.js';
import { rng, TAU, shade, fbm2 } from './util.js';
import { grassMaterial } from './grass.js';

const depthAt = (x, z) => -groundH(x, z);

/** Куст водорослей высотой 1: четыре ленты, каждая изогнута по-своему; к верхушке светлее и уже. */
function kelpGeometry() {
  const pos = [];
  const col = [];
  const SEG = 5;
  for (let b = 0; b < 4; b++) {
    const a = (b / 4) * TAU + 0.6 * b;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const lean = 0.1 + 0.16 * ((b * 0.618) % 1);
    const h = 0.7 + 0.3 * ((b * 0.37 + 0.3) % 1);
    const wig = 0.05 + 0.04 * (b % 2);
    const at = (t, side) => {
      const out = 0.05 + lean * t * t + Math.sin(t * 5 + b) * wig * t;
      const w = (0.075 * (1 - t * 0.7) + 0.012) * side;
      return [dx * out - dz * w, t * h, dz * out + dx * w];
    };
    for (let s = 0; s < SEG; s++) {
      const t0 = s / SEG;
      const t1 = (s + 1) / SEG;
      const q = [at(t0, -1), at(t0, 1), at(t1, -1), at(t1, 1)];
      const c0 = 0.55 + 0.5 * t0;
      const c1 = 0.55 + 0.5 * t1;
      for (const k of [0, 1, 2, 2, 1, 3]) {
        pos.push(...q[k]);
        const c = k < 2 ? c0 : c1;
        col.push(c, c, c * 0.9);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aTint', new THREE.Float32BufferAttribute(new Float32Array(pos.length / 3).fill(1), 1));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(pos.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  return g;
}

export class Seabed {
  constructor(scene) {
    const r = rng(40417);
    // где искать места: [x0, x1, z0, z1, попыток] — бухта у причалов, заводь, лагуна Пальмового острова, остов
    const AREAS = [
      [-48, 48, -64, -2, 3600],
      [BACKWATER.x - 15, BACKWATER.x + 15, BACKWATER.z - 13, BACKWATER.z + 13, 600],
      ...(HAS.palm ? [[PALM.x - 72, PALM.x - 28, PALM.z - 16, PALM.z + 26, 900]] : []),
      ...(HAS.wreck ? [[WRECK.x - 15, WRECK.x + 15, WRECK.z - 15, WRECK.z + 15, 500]] : [])
    ];
    const kelp = [];
    const B = new Batch();
    const STONE = ['#7d7a72', '#6b6f73', '#8a8375', '#5f6a62', '#93897a'];
    const SHELL = ['#f3e3cf', '#f6c9b8', '#e9d8a6', '#ffffff', '#d9b8d6'];
    const STAR = ['#ff7a3d', '#e8452c', '#ffb02e', '#b05bd6', '#ff6f91'];
    for (const [x0, x1, z0, z1, tries] of AREAS) {
      for (let i = 0; i < tries; i++) {
        const x = x0 + r() * (x1 - x0);
        const z = z0 + r() * (z1 - z0);
        const d = depthAt(x, z);
        const kind = r();
        const yaw = r() * TAU;
        const k = r();
        if (!(d > 0.45 && d < 4.2) || inRocks(x, z)) continue;
        const y = -d;
        const patch = fbm2(x * 0.085 + 7, z * 0.085 - 3); // заросли идут пятнами
        if (kind < 0.42) {
          // водоросли: только там, где вода глубже колена, и не выше трёх четвертей глубины
          if (d < 0.9 || patch < 0.5) continue;
          const tint = Math.floor(r() * 5);
          // куртина: несколько кустов рядом, один цвет
          const n = 2 + Math.floor(r() * 3);
          for (let j = 0; j < n; j++) {
            const kx = x + (j ? (r() - 0.5) * 1.1 : 0);
            const kz = z + (j ? (r() - 0.5) * 1.1 : 0);
            const kd = depthAt(kx, kz);
            if (kd < 0.9 || inRocks(kx, kz)) continue;
            const h = Math.min(kd * 0.72, 0.55 + r() * 1.25) * (0.8 + patch * 0.4);
            kelp.push([kx, -kd - 0.03, kz, h, 0.8 + r() * 0.8, r() * TAU, tint]);
          }
        } else if (kind < 0.8) {
          // камни: чаще мелкие, иногда валун; сверху тронуты зеленью
          // …и целиком под водой: на мелководье валун меньше (верхушка не ближе 12 см к поверхности)
          const s = Math.min(k < 0.85 ? 0.12 + k * 0.3 : 0.5 + k * 0.5, (d - 0.12) / 0.64);
          B.add(G.ico(0), shade(STONE[Math.floor(r() * STONE.length)], (r() - 0.5) * 0.2), M(x, y + s * 0.18, z, s * (0.9 + r() * 0.6), s * (0.5 + r() * 0.3), s, (r() - 0.5) * 0.5, yaw, (r() - 0.5) * 0.5), { top: ['#5d7a4a', 0.75], grad: [0.7, 1.05], soft: true });
        } else if (kind < 0.92) {
          // ракушки: на песке мелководья
          if (d > 2.6) continue;
          const s = 0.09 + k * 0.1;
          B.add(G.cone(6), SHELL[Math.floor(r() * SHELL.length)], M(x, y + s * 0.2, z, s * 1.5, s * 0.8, s, 1.2 + r() * 0.5, yaw, 0));
        } else {
          // морская звезда: пять лучей на дне (в пресной воде их не бывает)
          if (d > 3.2 || !HAS.sea) continue;
          const s = 0.2 + k * 0.2;
          const c = STAR[Math.floor(r() * STAR.length)];
          for (let j = 0; j < 5; j++) {
            const a = yaw + (j / 5) * TAU;
            B.add(G.cone(5), c, M(x + Math.cos(a) * s * 0.42, y + 0.035, z + Math.sin(a) * s * 0.42, s * 0.14, s * 0.9, s * 0.34, 0, -a, -Math.PI / 2));
          }
          B.add(G.sph(6, 4), shade(c, 0.12), M(x, y + 0.04, z, s * 0.42, s * 0.16, s * 0.42));
        }
      }
    }
    // кораллы и губки на рифе у причала
    const CORAL = ['#ff7f6e', '#ffa64d', '#e35d9f', '#c9a0ff', '#ffd166'];
    for (let i = 0; i < 46; i++) {
      const a = r() * TAU;
      const rad = 1.5 + r() * 8.5;
      const x = REEF.x + Math.cos(a) * rad;
      const z = REEF.z + Math.sin(a) * rad * 0.8;
      const d = depthAt(x, z);
      if (!(d > 0.5 && d < 4)) continue;
      const c = CORAL[Math.floor(r() * CORAL.length)];
      const s = Math.min(0.22 + r() * 0.3, (d - 0.15) / 1.35); // самый высокий «палец» не достаёт до поверхности
      if (r() < 0.5) {
        // «пальцы»: пучок столбиков
        for (let j = 0; j < 5; j++) B.add(G.cyl(6, 0.6, 1), shade(c, (r() - 0.5) * 0.15), M(x + (r() - 0.5) * s, -d + s * 0.5, z + (r() - 0.5) * s, s * 0.22, s * (0.8 + r() * 0.9), s * 0.22, (r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5));
      } else {
        // «мозговик»: приплюснутые шары
        for (let j = 0; j < 3; j++) B.add(G.sph(8, 5), shade(c, (r() - 0.5) * 0.15), M(x + (r() - 0.5) * s * 1.2, -d + s * 0.2, z + (r() - 0.5) * s * 1.2, s * (0.7 + r() * 0.6), s * 0.5, s * (0.7 + r() * 0.6)));
      }
    }
    // затонувшая мелочь: бочки, ящик, якорь, покрышка — у конца причала и у остова
    const WOOD = '#6e5238';
    const IRON = '#3c4148';
    const junk = (x, z, what, yaw) => {
      const d = depthAt(x, z);
      if (!(d > 0.9 && d < 4.4) || inRocks(x, z)) return;
      const y = -d;
      if (what === 'barrel') {
        B.add(G.cyl(10), WOOD, M(x, y + 0.24, z, 0.5, 0.74, 0.5, 0, yaw, Math.PI / 2 - 0.25));
        for (const o of [-0.22, 0.22]) B.add(G.cyl(10), IRON, M(x - Math.cos(yaw) * 0.969 * o, y + 0.24 + 0.247 * o, z + Math.sin(yaw) * 0.969 * o, 0.53, 0.05, 0.53, 0, yaw, Math.PI / 2 - 0.25));
      } else if (what === 'crate') {
        B.add(G.box(), WOOD, M(x, y + 0.2, z, 0.6, 0.5, 0.6, 0.22, yaw, 0.12));
        B.add(G.box(), shade(WOOD, -0.18), M(x, y + 0.2, z, 0.64, 0.08, 0.64, 0.22, yaw, 0.12));
      } else if (what === 'anchor') {
        B.add(G.cyl(8), IRON, M(x, y + 0.1, z, 0.08, 1.1, 0.08, 0, yaw, Math.PI / 2 - 0.12));
        B.add(G.torus(0.22, 12, Math.PI), IRON, M(x + Math.cos(yaw) * 0.5, y + 0.07, z - Math.sin(yaw) * 0.5, 0.8, 0.8, 0.8, Math.PI / 2, yaw + Math.PI / 2, 0));
        B.add(G.torus(0.3, 10), IRON, M(x - Math.cos(yaw) * 0.6, y + 0.16, z + Math.sin(yaw) * 0.6, 0.22, 0.22, 0.22, 0, yaw, 0));
      } else {
        B.add(G.torus(0.42, 14), '#22262b', M(x, y + 0.09, z, 0.62, 0.62, 0.62, Math.PI / 2 - 0.2, yaw, 0));
      }
    };
    junk(2.6, -27.5, 'barrel', 0.4);
    junk(-2.8, -23, 'crate', 1.1);
    junk(3.4, -19, 'tyre', 0);
    junk(-3.6, -30, 'anchor', 2.2);
    junk(1.5, -33.5, 'barrel', 2.6);
    junk(WRECK.x + 5, WRECK.z + 3, 'barrel', 1.0);
    junk(WRECK.x - 4, WRECK.z + 5, 'crate', 0.3);
    junk(WRECK.x + 2, WRECK.z - 6, 'anchor', 0.9);

    this.mesh = B.build(BATCH_MAT, false);
    this.mesh.name = 'seabed';
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // водоросли: зелёные, оливковые и бурые
    const TINT = ['#2f7a2a', '#4d8f1e', '#1f6a40', '#6d7f1c', '#7a4a20'].map((h) => new THREE.Color(h));
    this.U = { uFar: { value: 70 } };
    const n = kelp.length;
    const m = (this.kelp = new THREE.InstancedMesh(kelpGeometry(), grassMaterial(this.U), Math.max(1, n)));
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, n) * 3), 3);
    const o = new THREE.Object3D();
    // вперемешку, чтобы при меньшем числе (setDetail) заросли редели равномерно, а не пропадали целыми местами
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [kelp[i], kelp[j]] = [kelp[j], kelp[i]];
    }
    kelp.forEach(([x, y, z, h, w, yaw, tint], i) => {
      o.position.set(x, y, z);
      o.rotation.set(0, yaw, 0);
      o.scale.set(w, h, w);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, TINT[tint]);
    });
    m.count = n;
    m.frustumCulled = false;
    m.castShadow = false;
    m.receiveShadow = true;
    m.name = 'kelp';
    scene.add(m);
    this.total = n;
  }
  /** Сколько водорослей рисовать: k от 0 до 1 (на слабых видеокартах — реже). */
  setDetail(k) {
    this.kelp.count = Math.max(1, Math.round(this.total * k));
  }
  stats() {
    return { kelp: this.kelp.count, of: this.total, tris: this.mesh.geometry.attributes.position.count / 3 };
  }
}
