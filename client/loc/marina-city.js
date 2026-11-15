// Город «Пальмовой марины»: каменные набережные, дома ар-деко с неоном и светящимися окнами, пальмы в гирляндах,
// фонари, арочный мост через канал с неоновой подсветкой, рыбацкий пирс, понтоны яхт-клуба с яхтами, мол с огнями
// у входа в гавань. Всё — код, кроме пальм, кустов и камней (готовые модели набора, kit.js) и яхт (модели Tripo).
//
// Окна домов не строятся по одному: их рисует шейдер фасада по клеткам этажей (днём — тёмное стекло, ночью большая
// часть загорается тёплым светом); неон — тонкие трубки, ночью ярче единицы (их подхватывает свечение кадра);
// огни фонарей, гирлянд и яхт, их дорожки на воде — nightfx.js.
import * as THREE from 'three';
import { Batch, M, G, BATCH_MAT } from '../batch.js';
import { ENV } from '../envmodels.js';
import { bush } from '../flora.js';
import { rng, shade, TAU, clamp, fbm2 } from '../util.js';
import { HARBOR, QUAY_Y, QUAY_END, CANAL, BRIDGE, FPIER, PONTOONS, YACHTS, MOLE, BEACONS, DECK_Y, groundH, waterD, moleD, shoreZ, cityK } from './marina.js';

// пастельные фасады, белая отделка, неон — розовый, бирюзовый, лиловый, жёлтый, мятный
const FACADE = ['#f7c6d8', '#fbe0c4', '#c9ede0', '#ddd3f6', '#fff2e0', '#c4e4f4', '#ffd6a4', '#f3efe8', '#f9cfe0', '#d3f1f0'];
const TRIM = ['#ffffff', '#fff6ea', '#f6efe4'];
const NEON = ['#ff2e98', '#22eeff', '#a35cff', '#ffd23a', '#47ffb0'];
const NEON_PAIR = [[0, 1], [1, 0], [0, 2], [2, 1], [1, 3], [0, 4], [3, 0], [4, 2]];
const BULBS = ['#ffd08a', '#ff8fc8', '#8ff0ff', '#ffe49a', '#c7a2ff'];

const _m = new THREE.Matrix4();
const _v = new THREE.Vector3();
/** Рамка дома: x' — вдоль фасада, y — вверх от мостовой, z' — из фасада наружу; ry — куда смотрит фасад. */
const frame = (x, y, z, ry) => new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z);
const L = (F, m) => F.clone().multiply(m);
const toWorld = (F, x, y, z) => _v.set(x, y, z).applyMatrix4(F).clone();

// ───── фасады: тот же склеенный меш, что Batch, плюс признак окон у каждой вершины ─────
const plain = new WeakMap();
class Facades {
  constructor() {
    this.pos = [];
    this.nor = [];
    this.col = [];
    this.win = [];
  }
  /** win: 0 — глухая стена, 1 — окна по этажам, 2 — ленточные окна (на закруглённых углах). */
  add(geo, color, matrix, win = 0) {
    let g = plain.get(geo);
    if (!g) plain.set(geo, (g = geo.index ? geo.toNonIndexed() : geo));
    const p = g.attributes.position;
    const n = g.attributes.normal;
    const c = new THREE.Color(color);
    const nm = new THREE.Matrix3().getNormalMatrix(matrix);
    for (let i = 0; i < p.count; i++) {
      _v.fromBufferAttribute(p, i).applyMatrix4(matrix);
      this.pos.push(_v.x, _v.y, _v.z);
      _v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize();
      this.nor.push(_v.x, _v.y, _v.z);
      this.col.push(c.r, c.g, c.b);
      this.win.push(win);
    }
  }
  build(material) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('aWin', new THREE.Float32BufferAttribute(this.win, 1));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, material);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
}

/**
 * Материал фасадов: окна — клетки этажей (3,4 м) по длине фасада; первый этаж — витрины. Днём стекло тёмное и
 * блестит, ночью большая часть окон горит тёплым светом, а низ фасадов подсвечен фонарями улицы.
 */
function facadeMaterial(U) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0, emissive: new THREE.Color('#ffc27a') });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uNightC = U.uNight;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aWin;\nvarying vec3 vWP;\nvarying vec3 vWN;\nvarying float vWin;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWN = normalize(mat3(modelMatrix) * objectNormal);\nvWin = aWin;');
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uNightC;
varying vec3 vWP;
varying vec3 vWN;
varying float vWin;
float cityHash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
float wGl = 0.0;
float wLit = 0.0;
float wTone = 0.0;
vec3 baseC = diffuseColor.rgb;
if (vWin > 0.5) {
  vec3 wn = normalize(vWN);
  if (abs(wn.y) < 0.5) {
    vec2 tg = normalize(vec2(-wn.z, wn.x));
    float u = dot(vWP.xz, tg);
    float v = vWP.y - ${QUAY_Y.toFixed(2)};
    float fl = floor(v / 3.4);
    float fv = fract(v / 3.4);
    float cw = vWin < 1.5 ? 2.7 : 6.0;
    float cu = floor(u / cw);
    float fu = fract(u / cw);
    float inV = step(0.34, fv) * step(fv, 0.8);
    float inU = vWin < 1.5 ? step(0.27, fu) * step(fu, 0.73) : step(0.02, fu) * step(fu, 0.98);
    if (fl < 0.5) {
      inV = step(0.1, fv) * step(fv, 0.78);
      inU = step(0.08, fu) * step(fu, 0.92);
    }
    wGl = inV * inU * step(0.0, v);
    float hh = cityHash(vec3(cu, fl, floor(vWP.x * 0.05) + floor(vWP.z * 0.05) * 7.0));
    wLit = wGl * (fl < 0.5 ? 1.15 : step(0.52, hh) * (0.6 + 0.6 * fract(hh * 13.7)));
    wTone = fract(hh * 7.31);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.1, 0.14, 0.22), wGl * 0.88);
  }
}`
      )
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.16, wGl);')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
vec3 warmW = mix(vec3(1.0, 0.66, 0.36), vec3(1.0, 0.88, 0.7), wTone);
totalEmissiveRadiance = warmW * wLit * uNightC * 0.95;
// фасады подсвечены снизу фонарями и витринами улицы: ночью видно, какого цвета дом
totalEmissiveRadiance += baseC * uNightC * (0.1 + 0.32 * (1.0 - smoothstep(0.5, 14.0, vWP.y - ${QUAY_Y.toFixed(2)}))) * (1.0 - wGl);`
      );
  };
  return m;
}

/** Неон: днём — бледные стеклянные трубки, ночью горят ярче единицы — их подхватывает свечение кадра. */
function neonMaterial(U) {
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uNight: { value: 0 } }]),
    vertexShader: /* glsl */ `
      #include <common>
      #include <fog_pars_vertex>
      attribute vec3 color;
      varying vec3 vC;
      void main() {
        vC = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <fog_pars_fragment>
      uniform float uNight;
      varying vec3 vC;
      void main() {
        float k = smoothstep(0.02, 0.38, uNight);
        vec3 day = mix(vec3(0.8, 0.82, 0.85), vC, 0.32);
        vec3 c = mix(day, vC * 3.0, k);
        #ifdef TONE_MAPPING
        c = mix(day, vC * 1.6, k);
        #endif
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
    fog: true
  });
  m.uniforms.uNight = U.uNight;
  return m;
}

/** Трубка неона из отрезков: pts — точки в рамке F; closed — замкнуть. */
function neonLine(BN, F, pts, color, r = 0.07, closed = false) {
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = toWorld(F, ...pts[i]);
    const b = toWorld(F, ...pts[(i + 1) % pts.length]);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-4) continue;
    const ry = Math.atan2(-dz, dx);
    const rz = Math.asin(clamp(dy / len, -1, 1));
    BN.add(G.box(), color, M((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, len + r * 1.4, r * 2, r * 2, 0, ry, rz));
  }
}
/** Неоновые вывески без слов: рыба, волна, пальма, звезда, кольцо — точки в плоскости фасада (x', y). */
const SIGNS = {
  ring: (s) => Array.from({ length: 28 }, (_, i) => [Math.cos((i / 28) * TAU) * s, Math.sin((i / 28) * TAU) * s]),
  star: (s) => Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI / 2 + (i / 10) * TAU;
    const r = i % 2 ? s * 0.42 : s;
    return [Math.cos(a) * r, Math.sin(a) * r];
  }),
  fish: (s) => {
    const p = [];
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * TAU;
      p.push([Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.45]);
    }
    p.push([s * 0.9, 0], [s * 1.45, s * 0.42], [s * 1.45, -s * 0.42], [s * 0.9, 0]);
    return p;
  },
  wave: (s) => Array.from({ length: 25 }, (_, i) => [(-1 + (i / 24) * 2) * s * 1.6, Math.sin((i / 24) * TAU * 1.5) * s * 0.3]),
  palm: (s) => [[0, -s], [s * 0.08, -s * 0.2], [s * 0.05, s * 0.5], [-s * 0.6, s * 0.2], [s * 0.05, s * 0.5], [s * 0.7, s * 0.25], [s * 0.05, s * 0.5], [-s * 0.4, s * 0.9], [s * 0.05, s * 0.5], [s * 0.5, s * 0.95]]
};

/**
 * Дом ар-деко в рамке F (x' от 0 до W вдоль фасада, z' от −D до 0 вглубь): витрины первого этажа, «брови» над
 * окнами, белый парапет, ступенчатые надстройки, иногда — закруглённый угол с ленточными окнами и вертикальный
 * «плавник» над входом; по верху и над витринами — неон; над витринами — полосатые маркизы.
 */
function decoHouse(Fc, BN, F, W, D, H, st, wakes) {
  const col = st.color;
  const trim = st.trim;
  const R0 = st.round ? Math.min(3, W * 0.22) : 0;
  const x0 = st.round < 0 ? R0 : 0;
  const x1 = st.round > 0 ? W - R0 : W;
  // корпус: первый этаж чуть темнее, выше — основной цвет; закруглённый угол — цилиндр с лентами окон
  Fc.add(G.box(), shade(col, -0.05), L(F, M((x0 + x1) / 2, 1.7, -D / 2, x1 - x0, 3.4, D)), 1);
  Fc.add(G.box(), col, L(F, M((x0 + x1) / 2, 3.4 + (H - 3.4) / 2, -D / 2, x1 - x0, H - 3.4, D)), st.ribbon ? 2 : 1);
  if (st.round) {
    const cx = st.round < 0 ? R0 : W - R0;
    const fx = st.round < 0 ? R0 / 2 : W - R0 / 2;
    Fc.add(G.box(), col, L(F, M(fx, H / 2, -(D + R0) / 2, R0, H, D - R0)), 1);
    Fc.add(G.cyl(24), col, L(F, M(cx, H / 2, -R0, R0 * 2, H, R0 * 2)), 2);
    Fc.add(G.cyl(24), trim, L(F, M(cx, H + 0.25, -R0, R0 * 2 + 0.3, 0.5, R0 * 2 + 0.3)), 0);
    // кольца неона по закруглению: сверху и над витринами
    const ring = (y, c) => neonLine(BN, F, Array.from({ length: 13 }, (_, i) => {
      const a = (st.round < 0 ? Math.PI / 2 : 0) + (i / 12) * (Math.PI / 2);
      return [cx + Math.cos(a) * (R0 + 0.12), y, -R0 + Math.sin(a) * (R0 + 0.12)];
    }), c);
    ring(H + 0.58, st.neonA);
  }
  // парапет и «брови» над окнами
  Fc.add(G.box(), trim, L(F, M((x0 + x1) / 2, H + 0.25, -D / 2, x1 - x0 + 0.3, 0.5, D + 0.3)), 0);
  const floors = Math.floor((H - 3.4) / 3.4) + 1;
  for (let f = 1; f < floors; f++) Fc.add(G.box(), trim, L(F, M((x0 + x1) / 2, 3.4 * f + 2.95, 0.22, x1 - x0 - 0.3, 0.12, 0.44)), 0);
  // ступенчатые надстройки на крыше
  let top = H + 0.5;
  for (let k = 0; k < st.steps; k++) {
    const w = W * (0.56 - k * 0.2);
    const h = 3.4 - k * 0.9;
    const d = D * (0.6 - k * 0.18);
    Fc.add(G.box(), k ? trim : col, L(F, M(W / 2, top + h / 2, -D / 2, w, h, d)), k ? 0 : 1);
    Fc.add(G.box(), trim, L(F, M(W / 2, top + h + 0.18, -D / 2, w + 0.25, 0.36, d + 0.25)), 0);
    neonLine(BN, F, [[W / 2 - w / 2, top + h + 0.42, -D / 2 + d / 2 + 0.14], [W / 2 + w / 2, top + h + 0.42, -D / 2 + d / 2 + 0.14]], k ? st.neonB : st.neonA);
    top += h + 0.36;
  }
  // плавник над входом: вертикальная пластина выше крыши с неоном по передней кромке
  if (st.fin) {
    const fh = H + st.fin;
    Fc.add(G.box(), trim, L(F, M(W / 2, (fh + 3.6) / 2, -0.5, 1.0, fh - 3.6, 2.6)), 0);
    neonLine(BN, F, [[W / 2 - 0.42, 3.8, 0.84], [W / 2 - 0.42, fh - 0.3, 0.84]], st.neonA, 0.09);
    neonLine(BN, F, [[W / 2 + 0.42, 3.8, 0.84], [W / 2 + 0.42, fh - 0.3, 0.84]], st.neonB, 0.09);
    for (let y = 6; y < fh - 1; y += 2.4) neonLine(BN, F, [[W / 2 - 0.5, y, 0.84], [W / 2 + 0.5, y, 0.84]], st.neonA, 0.07);
  }
  // неон: по верху фасада и над витринами
  neonLine(BN, F, [[x0 + 0.2, H + 0.6, 0.22], [x1 - 0.2, H + 0.6, 0.22]], st.neonA, 0.1);
  neonLine(BN, F, [[x0 + 0.3, 3.5, 0.34], [x1 - 0.3, 3.5, 0.34]], st.neonB, 0.08);
  if (st.edges) {
    neonLine(BN, F, [[x0 + 0.15, 3.8, 0.2], [x0 + 0.15, H, 0.2]], st.neonB, 0.08);
    neonLine(BN, F, [[x1 - 0.15, 3.8, 0.2], [x1 - 0.15, H, 0.2]], st.neonB, 0.08);
  }
  // вывеска без слов
  if (st.sign) {
    const s = Math.min(2.2, (H - 4) * 0.22);
    const cx = st.fin ? (st.signLeft ? W * 0.25 : W * 0.75) : W / 2;
    const cy = H - s - 1.4;
    neonLine(BN, F, SIGNS[st.sign](s).map(([a, b]) => [cx + a, cy + b, 0.25]), st.neonSign, 0.1, st.sign !== 'wave' && st.sign !== 'palm');
  }
  // маркизы над витринами: полосатые, наклонные
  if (st.awn) {
    const bay = 4.2;
    const n = Math.max(1, Math.floor((x1 - x0 - 0.6) / bay));
    const start = (x0 + x1) / 2 - (n * bay) / 2;
    for (let i = 0; i < n; i++) {
      const cx = start + bay * (i + 0.5);
      for (let k = 0; k < 7; k++) {
        const w = 3.4 / 7;
        Fc.add(G.box(), k % 2 ? '#fbf7f0' : st.awn, L(F, M(cx - 1.7 + w * (k + 0.5), 3.05, 0.75, w, 0.06, 1.6, 0.42, 0, 0)), 0);
      }
    }
  }
  // отблески неона на воде (для домов у воды)
  if (wakes) {
    const a = toWorld(F, W / 2, H + 0.6, 0.2);
    wakes.push({ x: a.x, y: a.y, z: a.z, c: st.neonA, p: 0.42, h: Math.max(1.2, W * 0.12) });
  }
}

/** Стиль дома по номеру: цвет, неон, что есть на фасаде. */
function houseStyle(r, opts = {}) {
  const [a, b] = NEON_PAIR[Math.floor(r() * NEON_PAIR.length)];
  return {
    color: FACADE[Math.floor(r() * FACADE.length)],
    trim: TRIM[Math.floor(r() * TRIM.length)],
    neonA: NEON[a],
    neonB: NEON[b],
    neonSign: NEON[Math.floor(r() * NEON.length)],
    round: opts.round ?? (r() < 0.35 ? (r() < 0.5 ? -1 : 1) : 0),
    ribbon: r() < 0.25,
    fin: opts.fin ?? (r() < 0.4 ? 4 + r() * 5 : 0),
    steps: opts.steps ?? (r() < 0.6 ? 1 + Math.floor(r() * 2) : 0),
    edges: r() < 0.4,
    awn: opts.awn === false ? null : r() < 0.7 ? ['#ff5fa8', '#26c6d8', '#ffb43a', '#8f6bff', '#ff7a59'][Math.floor(r() * 5)] : null,
    sign: opts.sign === false ? null : r() < 0.45 ? ['ring', 'star', 'fish', 'wave', 'palm'][Math.floor(r() * 5)] : null,
    signLeft: r() < 0.5
  };
}

/** Ряд домов вдоль прямой: от (ax, az) к (bx, bz), фасадом в сторону face (ry). */
function houseRow(Fc, BN, r, ax, az, bx, bz, ry, opt) {
  const len = Math.hypot(bx - ax, bz - az);
  const ux = (bx - ax) / len;
  const uz = (bz - az) / len;
  let s = opt.gap0 ?? 0;
  while (s < len - 8) {
    const W = Math.min(len - s, opt.w[0] + r() * (opt.w[1] - opt.w[0]));
    if (W < 8) break;
    const D = opt.d[0] + r() * (opt.d[1] - opt.d[0]);
    const H = opt.h[0] + r() * (opt.h[1] - opt.h[0]);
    const x = ax + ux * s;
    const z = az + uz * s;
    const st = houseStyle(r, opt.style || {});
    decoHouse(Fc, BN, frame(x, QUAY_Y, z, ry), W, D, H, st, opt.wakes);
    if (opt.onHouse) opt.onHouse(x, z, W, D, H, st);
    s += W + opt.gap[0] + r() * (opt.gap[1] - opt.gap[0]);
  }
}

/** Башня отеля дальнего ряда: простой объём с окнами, неоновый «венец» наверху. */
function tower(Fc, BN, r, x, z, ry) {
  const W = 14 + r() * 10;
  const D = 12 + r() * 8;
  const H = 24 + r() * 22;
  const F = frame(x, groundH(x, z) - 0.3, z, ry);
  const st = houseStyle(r, { awn: false, sign: false, steps: r() < 0.5 ? 1 : 0 });
  Fc.add(G.box(), st.color, L(F, M(W / 2, H / 2, -D / 2, W, H, D)), st.ribbon ? 2 : 1);
  Fc.add(G.box(), st.trim, L(F, M(W / 2, H + 0.3, -D / 2, W + 0.4, 0.6, D + 0.4)), 0);
  if (r() < 0.75) {
    neonLine(BN, F, [[0.2, H + 0.7, 0.25], [W - 0.2, H + 0.7, 0.25]], st.neonA, 0.16);
    neonLine(BN, F, [[W + 0.25, H + 0.7, -0.2], [W + 0.25, H + 0.7, -D + 0.2]], st.neonA, 0.16);
  }
  if (r() < 0.4) neonLine(BN, F, [[W / 2, H - 1, 0.25], [W / 2, 4, 0.25]], st.neonB, 0.16);
}

// ───── набережные: каменная стенка с плитами сверху ─────
function wallLine(BS, pts, rnd) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.05) continue;
    const ux = (bx - ax) / len;
    const uz = (bz - az) / len;
    // лицо стенки — в сторону воды
    let nx = -uz;
    let nz = ux;
    const mx = (ax + bx) / 2;
    const mz = (az + bz) / 2;
    if (waterD(mx + nx * 2, mz + nz * 2) < waterD(mx - nx * 2, mz - nz * 2)) {
      nx = -nx;
      nz = -nz;
    }
    const ry = Math.atan2(-uz, ux);
    const n = Math.max(1, Math.round(len / 2.4));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const x = ax + (bx - ax) * t - nx * 0.25;
      const z = az + (bz - az) * t - nz * 0.25; // лицо стенки — в 0,3 м от кромки в сторону воды
      const c = shade('#b8a98f', (rnd() - 0.5) * 0.1);
      BS.add(G.box(), c, M(x, (QUAY_Y - 7.8) / 2, z, len / n + 0.02, QUAY_Y + 7.8, 1.1, 0, ry, 0), { mat: 2, grad: [0.45, 1.0] });
      BS.add(G.box(), shade('#e6dac4', (rnd() - 0.5) * 0.06), M(x - nx * 0.05, QUAY_Y + 0.12, z - nz * 0.05, len / n + 0.02, 0.26, 1.5, 0, ry, 0), { mat: 2, soft: true });
    }
  }
}
/** Берег канала: точки вдоль его середины, отступ off в сторону side (1 — правый по ходу, −1 — левый). */
function canalBank(side, off, xMax = HARBOR.x0 + 0.5) {
  const out = [];
  const p = CANAL.p;
  for (let i = 0; i < p.length; i++) {
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(p.length - 1, i + 1)];
    const tx = b[0] - a[0];
    const tz = b[1] - a[1];
    const tl = Math.hypot(tx, tz);
    const x = p[i][0] + (-tz / tl) * off * side;
    const z = p[i][1] + (tx / tl) * off * side;
    if (p[i][0] < xMax) out.push([x, z]);
  }
  return out;
}

// ───── фонари, скамейки, пальмы в гирляндах ─────
function lampPost(B, nfx, x, y, z, wake = true) {
  B.add(G.cyl(8), '#1d3f45', M(x, y + 0.2, z, 0.34, 0.4, 0.34));
  B.add(G.cyl(8, 0.7, 1), '#1d3f45', M(x, y + 2.3, z, 0.15, 4.0, 0.15));
  B.add(G.sph(10, 8), '#fff5e0', M(x, y + 4.45, z, 0.46, 0.5, 0.46));
  B.add(G.cyl(8), '#1d3f45', M(x, y + 4.15, z, 0.3, 0.1, 0.3));
  if (nfx) {
    nfx.bulb(x, y + 4.45, z, '#ffe0aa', 0.9);
    if (wake) nfx.wake({ x, y: y + 4.45, z }, '#ffc781', 0.6, 1.3);
  }
  return y + 4.2;
}
function bench(B, x, y, z, ry) {
  B.add(G.box(), '#9a6a40', M(x, y + 0.46, z, 1.8, 0.07, 0.5, 0, ry, 0), { mat: 1 });
  const bx = Math.sin(ry) * 0.24;
  const bz = Math.cos(ry) * 0.24;
  B.add(G.box(), '#9a6a40', M(x - bx, y + 0.78, z - bz, 1.8, 0.36, 0.06, -0.15, ry, 0), { mat: 1 });
  for (const s of [-0.75, 0.75]) B.add(G.box(), '#2a3a40', M(x + Math.cos(ry) * s, y + 0.23, z - Math.sin(ry) * s, 0.08, 0.46, 0.5, 0, ry, 0));
}
/** Гирлянда между двумя точками: провисает, лампочки через ~0,85 м. */
function festoon(nfx, a, b, sag, k0 = 0) {
  const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const n = Math.max(3, Math.round(len / 0.85));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    nfx.bulb(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t, BULBS[(i + k0) % BULBS.length], 0.3);
  }
}
/**
 * Пальма набережной: готовая модель набора (запись env-palm), пока её нет — пальма из кода; ствол до половины
 * высоты обвит гирляндой.
 */
function promenadePalm(P, nfx, x, y, z, h, r) {
  if (!P) return;
  const ry = r() * TAU;
  ENV.flora['env-palm'].push({ x, y: y - 0.3, z, s: h, ry });
  // запасная пальма: прямой ствол и крона из листьев-плашек
  P.add(G.cyl(8, 0.62, 1), '#a07a50', M(x, y + h * 0.42, z, 0.36, h * 0.84, 0.36), { mat: 1 });
  for (let i = 0; i < 8; i++) P.add(G.box(), '#3f9a3c', M(x + Math.cos((i / 8) * TAU) * 1.3, y + h * 0.84, z + Math.sin((i / 8) * TAU) * 1.3, 2.8, 0.08, 0.7, 0, -(i / 8) * TAU, -0.35));
  if (!nfx) return;
  // гирлянда спиралью по нижней половине ствола: тёплые лампочки часто-часто, как на набережных курортов
  const turns = 9;
  const n = 64;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = t * turns * TAU + ry;
    const yy = y + 0.5 + t * h * 0.46;
    const rad = 0.36 - 0.12 * t;
    nfx.bulb(x + Math.cos(a) * rad, yy, z + Math.sin(a) * rad, i % 4 === 3 ? '#fff4d6' : '#ffc874', 0.34);
  }
}

/**
 * Город марины. scene — куда класть меши, nfx — ночные огни (лампочки, дорожки на воде). Возвращает
 * { setNight(n), update(dt, t) } — неон, окна и мигание огней у входа в гавань.
 */
export function buildMarinaCity(scene, nfx) {
  const U = { uNight: { value: 0 } };
  const r = rng(280128);
  const Fc = new Facades(); // фасады домов
  const BN = new Batch(); // неон
  const BS = new Batch(); // камень: набережные, мост
  const BW = new Batch(); // дерево, металл, мелочь улиц
  BW.auto = true;
  const BP = new Batch(); // запасные пальмы: прячутся, когда встанут модели набора
  const BT = new Batch(); // запасные кусты
  const wakes = [];
  const lamps = []; // где стоят фонари набережной: между ними — гирлянды

  // ── набережные ──
  const nBank = canalBank(-1, CANAL.w);
  const sBank = canalBank(1, CANAL.w);
  wallLine(BS, [[QUAY_END.x, HARBOR.z0], [HARBOR.x0, HARBOR.z0]], r); // северная: вода к югу
  wallLine(BS, [[QUAY_END.x + 0.62 * 120, HARBOR.z0 - 120], [QUAY_END.x, HARBOR.z0]], r); // морская стенка города к северо-востоку
  // западная стенка гавани: от угла до канала и от канала до пляжа
  const [zN, zS] = [nBank[0][1], sBank[0][1]].sort((a, b) => a - b);
  wallLine(BS, [[HARBOR.x0, HARBOR.z0], [HARBOR.x0, zN]], r);
  wallLine(BS, [[HARBOR.x0, zS], [HARBOR.x0, -26]], r);
  // берега канала: обход так, чтобы вода была слева
  wallLine(BS, nBank.slice().reverse(), r);
  wallLine(BS, sBank, r);

  // ── северная набережная: перила, фонари, пальмы, скамейки ──
  const zEdge = HARBOR.z0 - 0.55;
  const gaps = [...PONTOONS.map((p) => [p.x - 1.7, p.x + 1.7]), [FPIER.x - 2, FPIER.x + 2]];
  const open = (x) => !gaps.some(([a, b]) => x > a && x < b);
  for (let x = HARBOR.x0 + 1; x < QUAY_END.x - 1; x += 1.1) if (open(x)) BW.add(G.box(), '#f4efe6', M(x, QUAY_Y + 0.5, zEdge, 0.13, 0.8, 0.13), { mat: 0 });
  {
    // перила кусками между проходами
    let a = HARBOR.x0 + 1;
    const edges = [...gaps.flat(), QUAY_END.x - 1].sort((p, q) => p - q);
    for (const e of edges) {
      if (e - a > 0.6 && open((a + e) / 2)) {
        BW.add(G.box(), '#f7f3ec', M((a + e) / 2, QUAY_Y + 0.92, zEdge, e - a, 0.1, 0.2), { mat: 0 });
        BW.add(G.box(), '#f7f3ec', M((a + e) / 2, QUAY_Y + 0.3, zEdge, e - a, 0.07, 0.12), { mat: 0 });
      }
      a = e;
    }
  }
  for (let x = HARBOR.x0 + 6; x < QUAY_END.x - 3; x += 13) {
    if (!open(x)) x += 3;
    lamps.push([x, lampPost(BW, nfx, x, QUAY_Y, HARBOR.z0 - 1.4), HARBOR.z0 - 1.4]);
    promenadePalm(BP, nfx, x + 6.5, QUAY_Y, HARBOR.z0 - 6.2, 8.5 + r() * 3.5, r);
    if (r() < 0.7) bench(BW, x + 3.2, QUAY_Y, HARBOR.z0 - 8.1, 0);
  }
  for (let i = 0; i < lamps.length - 1; i++) {
    const [ax, ay, az] = lamps[i];
    const [bx, by, bz] = lamps[i + 1];
    if (bx - ax < 20) festoon(nfx, [ax, ay, az], [bx, by, bz], 0.9, i);
  }

  // ── дома: первый ряд у воды, за ним — второй, вдали — башни отелей ──
  const cafes = [];
  houseRow(Fc, BN, r, HARBOR.x0 + 2, HARBOR.z0 - 11, QUAY_END.x - 2, HARBOR.z0 - 11, 0, {
    w: [13, 22], d: [12, 16], h: [8.5, 15.5], gap: [3, 6], wakes,
    onHouse: (x, z, W, D, H, st) => {
      if (st.awn && r() < 0.6) cafes.push([x + W / 2, z + 1.6, W]);
      // кусты с цветами у фасада
      for (let k = 0; k < 2; k++) bush(BT, x + 1 + r() * (W - 2), QUAY_Y, z + 0.9, 0.9 + r() * 0.4, r);
    }
  });
  houseRow(Fc, BN, r, HARBOR.x0 - 6, HARBOR.z0 - 36, QUAY_END.x + 4, HARBOR.z0 - 36, 0, { w: [15, 24], d: [14, 18], h: [14, 24], gap: [8, 18], style: { awn: false } });
  // вдали — редкие башни отелей: между ними видно небо
  for (let i = 0; i < 11; i++) {
    const x = -190 + i * 33 + (r() - 0.5) * 12;
    const z = HARBOR.z0 - 85 - r() * 120;
    if (waterD(x, z) > -24 || waterD(x + 20, z - 20) > -4) continue;
    tower(Fc, BN, r, x, z, (r() - 0.5) * 0.3);
  }
  // морская сторона города к северо-востоку от входа в гавань: отели лицом к морю
  {
    const ln = Math.hypot(0.62, 1);
    const [ux, uz] = [0.62 / ln, -1 / ln]; // вдоль берега
    const [nx, nz] = [-uz, ux]; // в сторону моря
    const ry = Math.atan2(nx, nz);
    for (let i = 0; i < 5; i++) {
      const t = 14 + i * 24;
      const x = QUAY_END.x + 0.62 * t - nx * 8;
      const z = HARBOR.z0 - t - nz * 8;
      tower(Fc, BN, r, x, z, ry);
    }
    void ux;
  }
  // кафе: зонтики и столики перед домами
  for (const [cx, cz, W] of cafes) {
    const n = Math.max(1, Math.floor(W / 5));
    for (let k = 0; k < n; k++) {
      const x = cx - (n - 1) * 2.5 + k * 5;
      const z = cz + 0.8;
      BW.add(G.cyl(6), '#e9e4dc', M(x, QUAY_Y + 1.15, z, 0.07, 2.3, 0.07), { mat: 0 });
      BW.add(G.cone(10), k % 2 ? '#fbf6ee' : '#ff74b4', M(x, QUAY_Y + 2.45, z, 2.7, 0.6, 2.7), { mat: 0 });
      BW.add(G.cyl(10), '#f2efe8', M(x, QUAY_Y + 0.74, z, 0.8, 0.05, 0.8), { mat: 0 });
      BW.add(G.cyl(6), '#2e3a40', M(x, QUAY_Y + 0.37, z, 0.08, 0.74, 0.08), { mat: 0 });
      if (nfx) nfx.bulb(x, QUAY_Y + 2.05, z, '#ffd9a0', 0.32);
    }
  }

  // ── вдоль канала: дома на обоих берегах, фонари и пальмы у стенки ──
  const rowAlong = (side, off) => {
    const pts = canalBank(side, CANAL.w + off);
    for (let i = 0; i + 2 < pts.length; i += 3) {
      const [ax, az] = pts[i];
      const [bx, bz] = pts[Math.min(pts.length - 1, i + 3)];
      const dx = bx - ax;
      const dz = bz - az;
      // фасад смотрит на воду: нормаль к берегу в сторону середины канала
      const fx = dz * side;
      const fz = -dx * side;
      const ry = Math.atan2(fx, fz);
      // в рамке дома x' идёт вдоль (cos ry, −sin ry): если это против обхода — начинаем с другого конца
      const along = Math.cos(ry) * dx - Math.sin(ry) * dz > 0;
      const [sx, sz] = along ? [ax, az] : [bx, bz];
      const W = Math.hypot(dx, dz) - 3;
      if (W < 8) continue;
      const st = houseStyle(r);
      decoHouse(Fc, BN, frame(sx, QUAY_Y, sz, ry), W, 12 + r() * 5, 9 + r() * 9, st, i < 9 ? wakes : null);
    }
  };
  rowAlong(-1, 8);
  rowAlong(1, 8);
  for (const side of [-1, 1]) {
    const edge = canalBank(side, CANAL.w + 1.5);
    const inner = canalBank(side, CANAL.w + 4.5);
    for (let i = 1; i < edge.length; i += 2) {
      const [x, z] = edge[i];
      if (x > HARBOR.x0 - 4 || Math.abs(x - BRIDGE.x) < BRIDGE.w / 2 + 2) continue;
      if (i % 4 === 1) lampPost(BW, nfx, x, QUAY_Y, z, i < 14);
      else promenadePalm(BP, nfx, inner[i][0], QUAY_Y, inner[i][1], 7.5 + r() * 3, r);
    }
  }
  // западная набережная гавани: дома лицом на восток
  houseRow(Fc, BN, r, HARBOR.x0 - 10, -30, HARBOR.x0 - 10, HARBOR.z0 + 56, Math.PI / 2, { w: [13, 20], d: [12, 16], h: [8.5, 14], gap: [3, 5], wakes });
  for (let z = -34; z > HARBOR.z0 + 40; z -= 13) {
    lampPost(BW, nfx, HARBOR.x0 - 1.4, QUAY_Y, z);
    promenadePalm(BP, nfx, HARBOR.x0 - 5.5, QUAY_Y, z - 6.5, 8 + r() * 3, r);
  }

  // ── мост через канал: арка, перила, фонари, неон под аркой ──
  {
    const { x, z, len, w, y } = BRIDGE;
    // боковой профиль (z, y) с аркой; выдавливается вдоль x на ширину моста. Настил — дугой от набережной до
    // верха y посередине, свод арки — на 1,4 м ниже, пяты арки уходят под воду у стенок канала
    const sh = new THREE.Shape();
    const z0 = -len / 2;
    const z1 = len / 2;
    const yc = 2 * y - QUAY_Y; // опорная точка дуги настила
    const deckY = (t) => QUAY_Y + 2 * t * (1 - t) * (yc - QUAY_Y);
    const span = CANAL.w * 2 + 1;
    const archY = (a) => -1.0 + Math.sin(a) * (y - 1.4 + 1.0);
    sh.moveTo(z0, -2);
    sh.lineTo(z0, QUAY_Y);
    sh.quadraticCurveTo(0, yc, z1, QUAY_Y);
    sh.lineTo(z1, -2);
    const hole = new THREE.Path();
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI - (i / n) * Math.PI;
      const hz = (Math.cos(a) * span) / 2;
      if (i === 0) hole.moveTo(hz, archY(a));
      else hole.lineTo(hz, archY(a));
    }
    sh.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 16 });
    geo.translate(0, 0, -w / 2);
    geo.rotateY(Math.PI / 2); // профиль лёг поперёк канала: длина моста — вдоль z
    BS.add(geo, '#e9dfcd', M(x, 0, z), { mat: 2, soft: true });
    // перила: столбики и поручень по обоим краям, по горбу моста
    for (const side of [-1, 1]) {
      const px = x + side * (w / 2 - 0.2);
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        BS.add(G.box(), '#fbf6ec', M(px, deckY(t) + 0.5, z + z0 + t * len, 0.18, 1.0, 0.18), { mat: 2, soft: true });
        if (i < 30) {
          const t2 = (i + 0.5) / 30;
          BS.add(G.box(), '#fbf6ec', M(px, deckY(t2) + 1.05, z + z0 + t2 * len, 0.26, 0.14, len / 30 + 0.05, -Math.atan2(2 * (1 - 2 * t2) * (yc - QUAY_Y), len), 0, 0), { mat: 2, soft: true });
        }
      }
      // фонари на мосту
      for (const t of [0.12, 0.88]) lampPost(BW, nfx, px, deckY(t), z + z0 + t * len);
    }
    // неон под аркой: с обеих сторон моста
    for (const side of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 28; i++) {
        const a = Math.PI - (i / 28) * Math.PI;
        pts.push([x + side * (w / 2 + 0.06), archY(a) - 0.06, z + (Math.cos(a) * span) / 2]);
      }
      neonLine(BN, new THREE.Matrix4(), pts.filter((p) => p[1] > 0.15), '#22eeff', 0.09);
      wakes.push({ x: x + side * (w / 2), y: y - 1.4, z, c: '#22eeff', p: 1.1, h: 4.5 });
      wakes.push({ x: x + side * (w / 2), y: 3.2, z: z - span * 0.3, c: '#22eeff', p: 0.6, h: 2.5 });
      wakes.push({ x: x + side * (w / 2), y: 3.2, z: z + span * 0.3, c: '#22eeff', p: 0.6, h: 2.5 });
    }
  }

  // ── рыбацкий пирс у моста: настил на сваях, перила, фонари на площадке ──
  {
    const { x, z0, z1, w: pw, hw, hd } = FPIER;
    const deck = (ax, bx, az, bz, along) => {
      if (along === 'z') for (let px = ax + 0.14; px < bx; px += 0.29) BW.add(G.plank('z'), '#a57a52', M(px, DECK_Y - 0.06, (az + bz) / 2, 0.26, 0.12, bz - az), { mat: 1 });
      else for (let pz = az + 0.14; pz < bz; pz += 0.29) BW.add(G.plank('x'), '#a57a52', M((ax + bx) / 2, DECK_Y - 0.06, pz, bx - ax, 0.12, 0.26), { mat: 1 });
    };
    deck(x - pw / 2, x + pw / 2, z0 + 0.5, z1, 'z');
    deck(x - hw, x + hw, z1, z1 + hd, 'x');
    for (let pz = z0 + 3; pz < z1 + hd; pz += 3.2)
      for (const s of [-1, 1]) {
        const px = pz > z1 ? x + s * (hw - 0.3) : x + s * (pw / 2 - 0.12);
        BW.add(G.cyl(8), '#5a4632', M(px, -3, pz, 0.3, 8.2, 0.3), { mat: 1 });
      }
    for (let px = x - hw + 1.8; px < x + hw - 1; px += 3) BW.add(G.cyl(8), '#5a4632', M(px, -3, z1 + hd - 0.2, 0.3, 8.2, 0.3), { mat: 1 });
    // перила по краю площадки (кроме причальной стороны) и вдоль мостков
    for (const s of [-1, 1]) {
      BW.add(G.box(), '#f4efe6', M(x + s * (pw / 2 - 0.05), DECK_Y + 0.95, (z0 + z1) / 2, 0.08, 0.08, z1 - z0 - 1), { mat: 0 });
      BW.add(G.box(), '#f4efe6', M(x + s * (hw - 0.05), DECK_Y + 0.95, z1 + hd / 2, 0.08, 0.08, hd), { mat: 0 });
      for (let pz = z0 + 1.5; pz < z1; pz += 1.6) BW.add(G.box(), '#f4efe6', M(x + s * (pw / 2 - 0.05), DECK_Y + 0.48, pz, 0.08, 0.95, 0.08), { mat: 0 });
    }
    for (const s of [-1, 1]) {
      const lx = x + s * (hw - 0.4);
      lampPost(BW, nfx, lx, DECK_Y, z1 + hd - 0.4);
    }
    bench(BW, x - 3.2, DECK_Y, z1 + 0.7, Math.PI);
    bench(BW, x + 3.2, DECK_Y, z1 + 0.7, Math.PI);
    // сходни с набережной
    BW.add(G.box(), '#a57a52', M(x, (QUAY_Y + DECK_Y) / 2, z0 + 0.6, pw, 0.12, 2.2, 0.42, 0, 0), { mat: 1 });
  }

  // ── понтоны яхт-клуба: плавучий настил, сходни, утки и низкие огни ──
  for (const p of PONTOONS) {
    const y = 0.42;
    for (let pz = p.z0 + 1.5; pz < p.z1; pz += 0.3) BW.add(G.plank('x'), '#b08a62', M(p.x, y, pz + 0.15, p.w, 0.12, 0.27), { mat: 1 });
    for (const s of [-1, 1]) {
      BW.add(G.box(), '#e8e4dc', M(p.x + s * (p.w / 2 + 0.1), y - 0.2, (p.z0 + p.z1) / 2 + 0.75, 0.22, 0.42, p.z1 - p.z0 - 1.5), { mat: 0 });
      for (let pz = p.z0 + 4; pz < p.z1; pz += 6) {
        BW.add(G.cyl(8), '#d8d4ca', M(p.x + s * (p.w / 2 - 0.25), y + 0.32, pz, 0.16, 0.5, 0.16), { mat: 0 });
        if (nfx) nfx.bulb(p.x + s * (p.w / 2 - 0.25), y + 0.62, pz, '#bfe9ff', 0.22);
      }
    }
    BW.add(G.box(), '#b08a62', M(p.x, (QUAY_Y + y) / 2 + 0.05, p.z0 + 0.8, 1.6, 0.1, 3.2, Math.atan2(QUAY_Y - y, 3.0), 0, 0), { mat: 1 });
    if (nfx) nfx.wake({ x: p.x, y: 0.62, z: p.z1 - 1 }, '#bfe9ff', 0.35, 0.9);
  }

  // ── яхты: модели Tripo (запись в ENV), ночью — огни на палубе и подводная подсветка ──
  const glows = [];
  for (const [i, y] of YACHTS.entries()) {
    const sail = y.kind === 'sail';
    ENV.singles.push({ id: sail ? 'boat-sail' : 'boat-yacht', x: y.x, y: sail ? -1.2 : -0.85, z: y.z, s: y.len, ry: y.ry + Math.PI / 2 });
    if (!nfx) continue;
    const ax = Math.sin(y.ry);
    const az = Math.cos(y.ry);
    nfx.bulb(y.x + ax * y.len * 0.42, sail ? 1.6 : 2.6, y.z + az * y.len * 0.42, '#fff4d8', 0.26);
    nfx.bulb(y.x - ax * y.len * 0.45, sail ? 1.4 : 2.0, y.z - az * y.len * 0.45, '#fff4d8', 0.26);
    // огоньки вдоль лееров по обоим бортам и тёплый свет в окнах рубки
    for (const side of [-1, 1])
      for (let k = 0; k < 7; k++) {
        const u = -0.36 + (k / 6) * 0.72;
        const w = y.half * (1 - Math.abs(u) * 0.9) * 0.82;
        nfx.bulb(y.x + ax * y.len * u + az * w * side, sail ? 1.25 : 1.9, y.z + az * y.len * u - ax * w * side, k % 2 ? '#e8f4ff' : '#fff2d4', 0.16);
      }
    if (!sail) nfx.wake({ x: y.x, y: 3.0, z: y.z }, '#ffd9a0', 0.35, 1.2);
    if (sail) nfx.bulb(y.x, 13.5, y.z, '#ffffff', 0.3); // огонь на топе мачты
    if (!sail || i % 3 === 0) {
      // подводная подсветка у кормы: бирюзовое пятно в воде и дорожка от него
      const gx = y.x - ax * y.len * 0.36;
      const gz = y.z - az * y.len * 0.36;
      glows.push([gx, gz, sail ? 2.2 : 3.4]);
      nfx.wake({ x: gx, y: 0.4, z: gz }, '#36f0ff', 0.55, 1.6);
    }
  }
  const underwater = (() => {
    if (!glows.length) return null;
    const mat = new THREE.ShaderMaterial({
      uniforms: { uNight: U.uNight },
      vertexShader: 'varying vec2 vQ; void main(){ vQ = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform float uNight; varying vec2 vQ; void main(){ float r = length(vQ); float k = smoothstep(1.0, 0.0, r); k *= k; gl_FragColor = vec4(vec3(0.1, 0.85, 1.0) * k * 0.9 * smoothstep(0.1, 0.5, uNight), 1.0); }',
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const g = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const im = new THREE.InstancedMesh(g, mat, glows.length);
    glows.forEach(([x, z, s], k) => im.setMatrixAt(k, M(x, -0.25, z, s * 2, 1, s * 2)));
    im.renderOrder = 3;
    im.frustumCulled = false;
    scene.add(im);
    return im;
  })();

  // ── мол: глыбы по откосам, огни у входа в гавань ──
  for (let z = MOLE.z1 + 2; z < 14; z += 3.2)
    for (const s of [-1, 1]) {
      const x = MOLE.x + s * (MOLE.w + 0.5 + r() * 2);
      const zz = z + (r() - 0.5) * 2;
      const sz = 2 + r() * 2.2;
      ENV.rocks['env-rock1'].push({ x, y: groundH(x, zz) - sz * 0.45, z: zz, w: sz * 1.2, h: sz, d: sz, ry: r() * TAU, tilt: true });
    }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    const x = MOLE.x + Math.cos(a) * (MOLE.w + 1.5);
    const z = MOLE.z1 + Math.sin(a) * (MOLE.w + 1.5) - 1;
    if (z > MOLE.z1 + 2) continue;
    const sz = 2.4 + r() * 2;
    ENV.rocks['env-rock1'].push({ x, y: groundH(x, z) - sz * 0.45, z, w: sz * 1.2, h: sz, d: sz, ry: r() * TAU, tilt: true });
  }
  // бетонная дорожка по гребню мола
  BS.add(G.box(), '#cfc8bb', M(MOLE.x, MOLE.y + 0.05, (MOLE.z0 + MOLE.z1) / 2, 3.2, 0.3, MOLE.z0 - MOLE.z1), { mat: 2, soft: true });
  const beaconMats = [];
  for (const b of BEACONS) {
    const y0 = groundH(b.x, b.z);
    const base = Math.max(y0, QUAY_Y);
    BS.add(G.cyl(16), '#f4f1ea', M(b.x, base + 2.4, b.z, 1.5, 4.8, 1.5), { mat: 0 });
    BS.add(G.cyl(16), b.c === '#ff3b3b' ? '#d8352e' : '#2fa35a', M(b.x, base + 3.4, b.z, 1.56, 1.1, 1.56), { mat: 0 });
    BS.add(G.cyl(12), '#2a2f33', M(b.x, base + 5.0, b.z, 0.9, 0.4, 0.9), { mat: 0 });
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(b.c).multiplyScalar(2.2), toneMapped: false });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), m);
    lamp.position.set(b.x, base + 5.5, b.z);
    scene.add(lamp);
    beaconMats.push({ m, c: new THREE.Color(b.c), ph: beaconMats.length * 1.7 });
    if (nfx) {
      nfx.bulb(b.x, base + 5.5, b.z, b.c, 0.9);
      nfx.wake({ x: b.x, y: base + 5.5, z: b.z }, b.c, 0.9, 1.4);
    }
  }

  // ── берег у базы: пальмы и фонари вдоль тропы, гирлянда над площадкой ──
  for (let x = -96; x < 122; x += 11 + r() * 5) {
    if (x > -60 && x < 50) continue; // у самой базы — свои фонари и лавка
    const z = shoreZ(x) + 6 + r() * 3;
    if (waterD(x, z) > -2 || cityK(x, z) > 0.3) continue;
    promenadePalm(BP, nfx, x, groundH(x, z), z, 7.5 + r() * 3, r);
  }

  // ── огни города на холмах вдали ──
  if (nfx)
    for (let i = 0; i < 260; i++) {
      const x = -320 + r() * 640;
      const z = HARBOR.z0 - 120 - r() * 380;
      const h = groundH(x, z);
      nfx.bulb(x, h + 1.5 + r() * 8, z, ['#ffd69a', '#ffe8c4', '#ffc77a', '#ff9ccf'][i % 4], 0.5 + r() * 0.4);
    }

  // дорожки света от неона на воде
  if (nfx) for (const w of wakes) nfx.wake({ x: w.x, y: w.y, z: w.z }, w.c, w.p, w.h);

  const facade = Fc.build(facadeMaterial(U));
  facade.name = 'city';
  scene.add(facade);
  const neon = BN.build(neonMaterial(U), false);
  neon.name = 'neon';
  scene.add(neon);
  const stone = BS.build(BATCH_MAT);
  stone.name = 'quays';
  scene.add(stone);
  const street = BW.build(BATCH_MAT);
  street.name = 'street';
  scene.add(street);
  if (!BP.empty) {
    const m = BP.build(BATCH_MAT);
    scene.add(m);
    ENV.fallback.palms.push(m);
  }
  if (!BT.empty) {
    const m = BT.build(BATCH_MAT);
    scene.add(m);
    ENV.fallback.trees.push(m);
  }

  return {
    /** Для проверок: сколько чего построено. */
    stats: () => ({ facadeVerts: facade.geometry.attributes.position.count, neonVerts: neon.geometry.attributes.position.count, yachts: YACHTS.length, glows: glows.length, wakes: wakes.length }),
    setNight(n) {
      U.uNight.value = n;
    },
    update(dt, t) {
      // огни у входа в гавань: красный и зелёный мигают по-своему, ночью ярче
      const n = U.uNight.value;
      for (const b of beaconMats) {
        const on = Math.sin(t * 2.2 + b.ph) > 0.35 ? 1 : 0.12;
        b.m.color.copy(b.c).multiplyScalar((0.6 + 1.8 * n) * on);
      }
    }
  };
}
