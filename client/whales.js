// Киты: пара горбатых китов ходит по океану замкнутой дорогой (только там, где у локации она есть — WHALE_WAY).
// Кит долго идёт на глубине, потом поднимается: над водой показывается спина, из дыхала бьёт фонтан, ещё пара
// вдохов — и он уходит вниз, подняв над водой хвост. Место считается из общих часов комнаты, так что все игроки
// видят китов в одной и той же точке. На обоих — один вызов отрисовки; фонтаны — спрайты.
import * as THREE from 'three';
import { WHALE_WAY } from './terrain.js';
import { canvasTex } from './util.js';

export const WHALE_SPEED = 2.4; // м/с
export const WHALES = [{ at: 0, size: 1.0 }, { at: 0.47, size: 0.86 }];
const CYCLE = 150; // столько метров пути от выхода до выхода
const SHOW = 34; // столько из них кит у поверхности (спина, фонтаны, хвост)
const DEEP = -9; // на такой глубине идёт между выходами
const SEEN = 1100; // дальше не рисуем
const BLOWS = [0.17, 0.42, 0.66]; // когда за выход бьёт фонтан (доля пути у поверхности): спина уже над водой

// дорога — гладкая кривая через точки, как у дельфинов
const pts = [];
const acc = [0];
if (WHALE_WAY && WHALE_WAY.length > 2) {
  const n = WHALE_WAY.length;
  const cr = (a, b, c, d, t) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
  for (let i = 0; i < n; i++) {
    const [a, b, c, d] = [-1, 0, 1, 2].map((k) => WHALE_WAY[(i + k + n) % n]);
    for (let j = 0; j < 12; j++) pts.push([cr(a[0], b[0], c[0], d[0], j / 12), cr(a[1], b[1], c[1], d[1], j / 12)]);
  }
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    acc.push(acc[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
}
const WAY_LEN = acc[acc.length - 1] || 1;
function wayAt(s, out) {
  s = ((s % WAY_LEN) + WAY_LEN) % WAY_LEN;
  let lo = 0, hi = pts.length;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (acc[mid] <= s) lo = mid;
    else hi = mid;
  }
  const a = pts[lo], b = pts[(lo + 1) % pts.length];
  const len = acc[lo + 1] - acc[lo] || 1;
  const k = (s - acc[lo]) / len;
  out.x = a[0] + (b[0] - a[0]) * k;
  out.z = a[1] + (b[1] - a[1]) * k;
  out.dx = (b[0] - a[0]) / len;
  out.dz = (b[1] - a[1]) / len;
  return out;
}

/** Горбатый кит: нос в +Z, спина вверх, длина 14 м. Спина тёмная, горло и брюхо в светлых складках. */
function whaleGeometry() {
  const back = new THREE.Color('#4a5868'), belly = new THREE.Color('#d2d8dc'), fin = new THREE.Color('#e6eaec'), fl = new THREE.Color('#3e4a58');
  // сечения от носа к хвосту: [z, полувысота, полуширина, сдвиг середины по высоте]
  const ST = [
    [7.0, 0.25, 0.45, -0.15], [6.4, 0.75, 1.0, -0.15], [5.2, 1.15, 1.35, -0.2], [3.4, 1.45, 1.55, -0.12], [1.2, 1.5, 1.5, 0],
    [-1.2, 1.3, 1.25, 0.05], [-3.4, 0.95, 0.85, 0.1], [-5.2, 0.5, 0.42, 0.12], [-6.4, 0.26, 0.18, 0.1], [-6.9, 0.16, 0.1, 0.08]
  ];
  const SEG = 12;
  const pos = [], col = [], idx = [];
  const c = new THREE.Color();
  for (const [z, ry, rx, yc] of ST) {
    for (let j = 0; j < SEG; j++) {
      const a = (j / SEG) * Math.PI * 2;
      const up = Math.cos(a);
      pos.push(Math.sin(a) * rx, yc + up * ry, z);
      c.copy(belly).lerp(back, THREE.MathUtils.smoothstep(up, -0.55, 0.05));
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < ST.length - 1; i++) {
    for (let j = 0; j < SEG; j++) {
      const a = i * SEG + j, b = i * SEG + ((j + 1) % SEG), d = a + SEG, e = b + SEG;
      idx.push(a, d, b, b, d, e);
    }
  }
  const body = new THREE.BufferGeometry();
  body.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  body.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  body.setIndex(idx);
  body.computeVertexNormals();
  const flat = body.toNonIndexed();
  const P = Array.from(flat.attributes.position.array), N = Array.from(flat.attributes.normal.array), C = Array.from(flat.attributes.color.array);
  const tri = (a, b, d, color) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), vd = new THREE.Vector3(...d);
    const n = vb.clone().sub(va).cross(vd.clone().sub(va)).normalize();
    for (const v of [va, vb, vd]) {
      P.push(v.x, v.y, v.z);
      N.push(n.x, n.y, n.z);
      C.push(color.r, color.g, color.b);
    }
  };
  // маленький горб-плавник на спине
  tri([-0.15, 1.2, -2.6], [0, 1.75, -3.4], [-0.15, 1.05, -3.9], back);
  tri([0.15, 1.2, -2.6], [0.15, 1.05, -3.9], [0, 1.75, -3.4], back);
  for (const s of [-1, 1]) {
    // длинные белые грудные плавники — по ним горбача узнают издалека
    tri([s * 1.3, -0.6, 3.6], [s * 1.35, -0.7, 2.4], [s * 4.6, -1.6, 0.4], fin);
    tri([s * 1.35, -0.7, 2.4], [s * 4.3, -1.7, -0.2], [s * 4.6, -1.6, 0.4], fin);
    // хвостовые лопасти — широкие, с выемкой посередине
    tri([0, 0.08, -6.6], [s * 2.6, 0.08, -8.4], [s * 0.3, 0.08, -7.6], fl);
    tri([s * 0.3, 0.08, -7.6], [s * 2.6, 0.08, -8.4], [s * 1.2, 0.08, -8.0], fl);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  return g;
}

/** Фонтан: мягкое белое облачко — столб брызг, который расплывается кверху. */
const spoutTex = () =>
  canvasTex(64, 128, (g) => {
    for (let i = 0; i < 9; i++) {
      const y = 120 - i * 13;
      const r = 6 + i * 2.6;
      const gr = g.createRadialGradient(32, y, 0, 32, y, r);
      gr.addColorStop(0, `rgba(255,255,255,${0.5 - i * 0.03})`);
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 128);
    }
  });

/**
 * Киты в сцене (null — на этой локации их нет). update(dt, t, T, camera, waveH, fx) двигает их; onBlow(x, z) —
 * кит выпустил фонтан (звук ставит игра).
 */
export function buildWhales(scene) {
  if (pts.length < 3) return null;
  const geo = whaleGeometry();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0, side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(geo, mat, WHALES.length);
  mesh.frustumCulled = false;
  mesh.name = 'whales';
  mesh.layers.set(1); // в отражении воды их нет
  scene.add(mesh);
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < WHALES.length; i++) mesh.setMatrixAt(i, hide);
  const tex = spoutTex();
  const spouts = WHALES.map(() => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, fog: true }));
    s.center.set(0.5, 0);
    s.renderOrder = 20; // после воды: иначе прозрачная вода, нарисованная позже, затирает фонтан
    s.visible = false;
    scene.add(s);
    return { s, t: 9 };
  });
  const o = new THREE.Object3D();
  o.rotation.order = 'YXZ';
  const w = {};
  const st = { blows: 0, shown: 0 };
  /** Где кит i в момент T: место, высота, наклон (нос вниз — положительный) и доля пути у поверхности (−1 — на глубине). */
  const pose = (i, T, out = {}) => {
    const wh = WHALES[i];
    const s = wh.at * WAY_LEN + T * WHALE_SPEED;
    wayAt(s, w);
    out.x = w.x;
    out.z = w.z;
    out.dx = w.dx;
    out.dz = w.dz;
    const u = (s + i * 61) % CYCLE;
    const q = u / SHOW; // 0…1 — пока кит у поверхности
    out.q = q < 1 ? q : -1;
    out.y = DEEP;
    out.pitch = 0;
    if (q < 1) {
      // выход: за первые 15 % пути — вверх, потом идёт у поверхности, в конце — нырок с хвостом над водой
      const rise = Math.min(1, q / 0.15);
      out.y = DEEP + (-0.75 - DEEP) * rise * rise * (3 - 2 * rise);
      if (q > 0.78) {
        const k = (q - 0.78) / 0.22;
        out.pitch = 0.95 * Math.sin(Math.min(1, k * 1.2) * Math.PI * 0.5);
        out.y = -0.75 - 2.4 * k * k;
      }
    }
    return out;
  };
  const P = {};
  return {
    mesh,
    onBlow: null,
    /** Для проверок: где киты и сколько было фонтанов. */
    state: (T) => ({ n: WHALES.length, shown: st.shown, blows: st.blows, at: WHALES.map((_, i) => { const q = pose(i, T, {}); return { x: q.x, z: q.z, up: q.q >= 0 }; }) }),
    update(dt, t, T, camera, waveH) {
      st.shown = 0;
      WHALES.forEach((wh, i) => {
        pose(i, T, P);
        const far = Math.hypot(P.x - camera.position.x, P.z - camera.position.z);
        const sp = spouts[i];
        if (far > SEEN || P.q < 0) {
          mesh.setMatrixAt(i, hide);
          sp.s.visible = false;
          sp.q = -1;
          return;
        }
        st.shown++;
        o.position.set(P.x, P.y * wh.size + waveH(P.x, P.z, t) * 0.6, P.z);
        o.rotation.set(P.pitch, Math.atan2(P.dx, P.dz), 0);
        o.scale.setScalar(wh.size);
        o.updateMatrix();
        mesh.setMatrixAt(i, o.matrix);
        // фонтан: в начале выхода и ещё пару раз, пока кит у поверхности
        const prev = sp.q ?? -1;
        if (BLOWS.some((b) => prev < b && P.q >= b)) {
          sp.t = 0;
          st.blows++;
          if (this.onBlow) this.onBlow(P.x, P.z);
        }
        sp.q = P.q;
        sp.t += dt;
        const life = 3.2;
        if (sp.t < life) {
          const k = sp.t / life;
          const hx = P.x + P.dx * 4.6 * wh.size;
          const hz = P.z + P.dz * 4.6 * wh.size;
          sp.s.position.set(hx, waveH(hx, hz, t) + 0.4, hz);
          const hgt = (2 + 6.5 * Math.min(1, k * 3)) * wh.size;
          sp.s.scale.set(hgt * 0.62 * (1 + k * 0.9), hgt, 1);
          sp.s.material.opacity = 0.85 * (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85);
          sp.s.visible = true;
        } else sp.s.visible = false;
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
  };
}
