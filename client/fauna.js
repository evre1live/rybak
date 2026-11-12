// Живность бухты: стайки мальков, рыба покрупнее (косяки, одиночки, рыба у наживки, всплески), бабочки, стрекозы и светлячки.
// На всё — три вызова отрисовки. Мальки и насекомые движутся в шейдере (на стайку приходит один набор чисел),
// рыбу покрупнее ведёт код: её несколько десятков.
import * as THREE from 'three';
import { groundH, deckAt, inRocks, BACKWATER, PALM, REEF, ARCH, WRECK } from './terrain.js';
import { rng, TAU, clamp, damp, angDiff } from './util.js';
import { waveH } from './water.js';

const MAX_SHOALS = 24;
const PER_SHOAL = 40;
export const SCHOOL_FISH = 54; // первые места в общем меше — рыба косяков, её расставляет scenery.js
const LONERS = 12;
const SUITOR = SCHOOL_FISH + LONERS; // рыба, которая подходит к наживке
const JUMPERS = 2;
const MAX_FISH = SUITOR + 1 + JUMPERS;
const JUMP_SLOT = 11; // раз в столько секунд общих часов может сыграть рыба
const depthAt = (x, z) => -groundH(x, z);
// открытая вода: не под настилом и не в камнях
const open = (x, z, min = 0.4) => depthAt(x, z) > min && !inRocks(x, z) && !deckAt(x, z, -0.3); // отступ отрицательный: настил с запасом

// Рыба рисуется после воды и сама считает, сколько воды над ней: чем глубже и чем положе взгляд, тем она бледнее
// (у воды прозрачность берётся по глубине дна, и рыба у поверхности над ямой пропадала бы целиком).
const COMMON_F = /* glsl */ `
uniform vec3 uWater, uSunCol;
uniform float uLight, uSun, uFloor;
varying vec3 vWp;
vec4 underwater(vec3 c) {
  float d = max(-vWp.y, 0.0);
  float ndv = max(normalize(cameraPosition - vWp).y, 0.12);
  float path = d / ndv;
  // издали и на пологом взгляде от рыбы остаётся тёмная тень в воде (uFloor): по таким теням с пирса находят косяк
  float vis = max(exp(-path * 0.5) * (1.0 - 0.7 * pow(1.0 - ndv, 4.0)), uFloor);
  return vec4(mix(uWater * 0.2 * (0.3 + 0.7 * uLight), c, exp(-path * 0.3)), d > 0.0 ? vis : 1.0);
}
`;

// ───── мальки ─────
const FRY_V = /* glsl */ `
attribute vec4 aFry;   // номер стайки и три случайных числа
attribute float aShade;
uniform vec4 uShoal[${MAX_SHOALS}];  // середина стайки (x, z), куда плывёт, испуг
uniform vec4 uShoalB[${MAX_SHOALS}]; // глубина, размах стайки, видимость, размер малька
uniform float uTime;
varying float vShade, vGlint;
varying vec3 vWp;
#include <fog_pars_vertex>
void main() {
  int si = int(aFry.x + 0.5);
  vec4 S = uShoal[si];
  vec4 B = uShoalB[si];
  float sc = S.w;
  float t = uTime * (0.7 + aFry.y * 0.6);
  // место в стайке: вытянутое облако; мальки понемногу меняются местами, от испуга разлетаются
  vec3 o = vec3((aFry.y - 0.5) * 2.3, aFry.z - 0.5, (aFry.w - 0.5) * 1.25) * B.y;
  o.x += sin(t * 0.37 + aFry.w * 6.28) * 0.36 * B.y;
  o.z += sin(t * 0.53 + aFry.z * 6.28) * 0.24 * B.y;
  o.xz *= 1.0 + sc * 2.1;
  float hd = S.z + sin(t * 1.3 + aFry.w * 9.0) * 0.28 + sc * (aFry.z - 0.5) * 5.0;
  float ch = cos(S.z), sh = sin(S.z);
  vec2 c = S.xy + vec2(o.x * ch - o.z * sh, o.x * sh + o.z * ch);
  float dist = distance(vec3(c.x, 0.0, c.y), cameraPosition);
  float size = B.w * (0.75 + aFry.z * 0.5) * B.z * (1.0 - smoothstep(48.0, 62.0, dist));
  vec3 lp = position * size;
  lp.z += sin(position.x * 7.0 - t * (9.0 + 14.0 * sc) + aFry.w * 20.0) * 0.13 * size * (0.5 - position.x);
  float c2 = cos(hd), s2 = sin(hd);
  vec3 wp = vec3(c.x + lp.x * c2 - lp.z * s2, B.x + o.y * 0.3 + sin(t * 1.1 + aFry.w * 30.0) * 0.03 + lp.y, c.y + lp.x * s2 + lp.z * c2);
  vShade = aShade;
  vWp = wp;
  // малёк повернулся боком — блеснул
  vGlint = pow(max(sin(t * (1.9 + sc * 5.0) + aFry.w * 40.0), 0.0), 22.0);
  vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const FRY_F = /* glsl */ `
precision highp float;
${COMMON_F}
varying float vShade, vGlint;
#include <fog_pars_fragment>
void main() {
  vec3 c = mix(vec3(0.02, 0.04, 0.045), vec3(0.2, 0.27, 0.27), vShade) * (0.3 + 0.7 * uLight);
  c += uSunCol * vGlint * uSun * 0.6;
  gl_FragColor = underwater(c);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

function fryGeometry() {
  const n = [0.5, 0, 0], t = [0.08, 0.1, 0], b = [0.08, -0.08, 0], l = [0.08, 0, 0.07], r = [0.08, 0, -0.07], k = [-0.32, 0, 0], ku = [-0.5, 0.11, 0], kd = [-0.5, -0.11, 0];
  const sh = new Map([[n, 0.3], [t, 0], [b, 1], [l, 0.45], [r, 0.45], [k, 0.4], [ku, 0.3], [kd, 0.3]]);
  const faces = [[n, t, l], [n, l, b], [n, b, r], [n, r, t], [k, l, t], [k, b, l], [k, r, b], [k, t, r], [k, ku, kd]];
  const pos = [], shade = [];
  for (const f of faces) for (const v of f) { pos.push(...v); shade.push(sh.get(v)); }
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aShade', new THREE.Float32BufferAttribute(shade, 1));
  return g;
}

// ───── рыба покрупнее ─────
const FISH_V = /* glsl */ `
attribute float aShade;
attribute vec3 aTint;
attribute vec2 aSwim; // фаза изгиба и его размах
varying float vShade, vUp;
varying vec3 vTint, vWp;
#include <fog_pars_vertex>
void main() {
  vec3 p = position;
  // тело изгибается волной от головы к хвосту
  float w = clamp(0.36 - p.x, 0.0, 1.0);
  p.z += sin(p.x * 5.0 - aSwim.x) * aSwim.y * w * w * 1.25;
  vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
  vec3 N = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vShade = aShade;
  vTint = aTint;
  vWp = wp.xyz;
  vUp = N.y * 0.5 + 0.5;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const FISH_F = /* glsl */ `
precision highp float;
${COMMON_F}
varying float vShade, vUp;
varying vec3 vTint;
#include <fog_pars_fragment>
void main() {
  // цвета — в линейных величинах: спина должна быть почти чёрной, иначе рыба светлее воды
  vec3 c = mix(vTint * 0.07, vTint * 0.6 + 0.03, vShade) * (0.45 + 0.55 * vUp) * (0.3 + 0.7 * uLight);
  // над водой (рыба играет) мокрый бок блестит
  c += uSunCol * pow(vUp, 5.0) * 0.3 * uSun * step(0.0, vWp.y);
  gl_FragColor = underwater(c);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

function fishGeometry() {
  const RINGS = [[0.5, 0.004], [0.4, 0.045], [0.24, 0.092], [0.02, 0.105], [-0.2, 0.078], [-0.36, 0.036], [-0.44, 0.016]];
  const SEG = 6;
  const pos = [], shade = [], idx = [];
  for (const [x, r] of RINGS)
    for (let j = 0; j < SEG; j++) {
      const a = (j / SEG) * TAU;
      pos.push(x, r * 1.15 * Math.cos(a), r * 0.8 * Math.sin(a));
      shade.push(0.5 - 0.5 * Math.cos(a));
    }
  for (let i = 0; i < RINGS.length - 1; i++)
    for (let j = 0; j < SEG; j++) {
      const a = i * SEG + j, b = i * SEG + ((j + 1) % SEG), c = a + SEG, d = b + SEG;
      idx.push(a, b, c, b, d, c);
    }
  // хвост вилкой и спинной плавник
  const base = pos.length / 3;
  pos.push(-0.43, 0, 0, -0.62, 0.15, 0, -0.55, 0, 0, -0.62, -0.15, 0, 0.2, 0.1, 0, -0.14, 0.08, 0, -0.02, 0.19, 0);
  shade.push(0.35, 0.25, 0.35, 0.25, 0.1, 0.1, 0.05);
  idx.push(base, base + 1, base + 2, base, base + 2, base + 3, base + 4, base + 6, base + 5);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aShade', new THREE.Float32BufferAttribute(shade, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
const TINTS = [[0.3, 0.38, 0.2], [0.46, 0.54, 0.58], [0.6, 0.47, 0.2], [0.27, 0.33, 0.22], [0.55, 0.33, 0.24], [0.4, 0.44, 0.36]];
const SCHOOL_TINT = [0.1, 0.19, 0.25]; // косяк — тёмные спины: по ним игрок находит место, где клюёт

// ───── насекомые ─────
const BUG_V = /* glsl */ `
attribute vec3 aHome;
attribute vec4 aBug; // три случайных числа и вид: 0 бабочка, 1 светлячок, 2 стрекоза
uniform float uTime, uDay, uNight, uDry;
varying vec2 vUv;
varying vec4 vBug;
varying float vOn;
vec3 h3(float n) { return fract(sin(vec3(n, n + 17.3, n + 41.9)) * 43758.5453) - 0.5; }
void main() {
  float kind = aBug.w;
  float t = uTime * (0.6 + aBug.x * 0.8) + aBug.y * 50.0;
  vec3 p = aHome;
  vec2 size = vec2(0.1);
  float on, reach = 46.0;
  if (kind < 0.5) {
    // бабочка порхает по петле и подпрыгивает на каждом взмахе
    p += vec3(sin(t * 0.43) + 0.6 * sin(t * 1.1 + 1.7), 0.35 * sin(t * 1.9) + 0.12 * sin(t * 6.3), cos(t * 0.37 + 0.6) + 0.6 * sin(t * 0.9)) * vec3(1.9, 1.0, 1.9);
    size = vec2(0.17 * (0.22 + 0.78 * abs(sin(t * 15.0))), 0.13);
    on = uDay * uDry;
  } else if (kind < 1.5) {
    p += vec3(sin(t * 0.21 + aBug.z * 6.0), 0.4 * sin(t * 0.33), cos(t * 0.17)) * vec3(1.6, 0.7, 1.6);
    size = vec2(0.22);
    on = uNight * uDry * smoothstep(0.15, 0.9, sin(t * 1.3 + aBug.z * 20.0) * 0.5 + 0.5);
    reach = 85.0;
  } else {
    // стрекоза висит на месте и рывком перелетает
    float seg = t * 0.45, k = floor(seg), f = fract(seg);
    p += mix(h3(k + aBug.z * 31.0), h3(k + 1.0 + aBug.z * 31.0), smoothstep(0.72, 1.0, f)) * vec3(6.0, 0.6, 6.0) + vec3(0.0, 0.02 * sin(t * 31.0), 0.0);
    size = vec2(0.17);
    on = uDay * uDry;
  }
  vec4 mv = viewMatrix * vec4(p, 1.0);
  on *= 1.0 - smoothstep(reach * 0.72, reach, -mv.z);
  mv.xy += position.xy * size;
  vUv = position.xy;
  vBug = aBug;
  vOn = on;
  gl_Position = on > 0.01 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0);
}`;
const BUG_F = /* glsl */ `
precision highp float;
uniform float uLight;
varying vec2 vUv;
varying vec4 vBug;
varying float vOn;
void main() {
  vec2 u = vUv * 2.0;
  vec3 c; float a;
  if (vBug.w < 0.5) {
    // два крыла; расцветка — белянка, лимонница, крапивница или голубянка
    float wing = 1.0 - smoothstep(0.34, 0.46, length((vec2(abs(u.x), u.y) - vec2(0.5, 0.06)) * vec2(1.0, 0.82)));
    float body = (1.0 - smoothstep(0.03, 0.09, abs(u.x))) * (1.0 - smoothstep(0.45, 0.6, abs(u.y)));
    float pick = vBug.z * 4.0;
    vec3 col = pick < 1.0 ? vec3(0.95, 0.95, 0.9) : pick < 2.0 ? vec3(0.98, 0.86, 0.28) : pick < 3.0 ? vec3(0.9, 0.46, 0.16) : vec3(0.45, 0.62, 0.95);
    col *= 1.0 - 0.45 * smoothstep(0.22, 0.42, length(vec2(abs(u.x), u.y) - vec2(0.5, 0.06)));
    a = max(wing, body) * vOn;
    c = mix(col, vec3(0.12, 0.1, 0.08), body) * (0.35 + 0.65 * uLight) * a;
  } else if (vBug.w < 1.5) {
    float g = exp(-dot(u, u) * 9.0) + 0.35 * exp(-dot(u, u) * 2.2);
    c = vec3(0.75, 1.0, 0.3) * g * vOn * 2.6;
    a = 0.0; // свет прибавляется к картинке
  } else {
    // тонкое тело и две пары прозрачных крыльев, чуть отведённых назад
    float body = (1.0 - smoothstep(0.035, 0.08, abs(u.y))) * (1.0 - smoothstep(0.8, 0.95, abs(u.x)));
    vec2 w = vec2(u.x - 0.3 + abs(u.y) * 0.3, u.y);
    float wing = max(1.0 - smoothstep(0.7, 1.0, length(vec2(w.x / 0.13, w.y / 0.92))), 1.0 - smoothstep(0.7, 1.0, length(vec2((w.x + 0.24) / 0.12, w.y / 0.8))));
    a = max(body, wing * 0.4) * vOn;
    c = mix(vec3(0.85, 0.95, 1.0), vBug.z < 0.5 ? vec3(0.1, 0.5, 0.75) : vec3(0.75, 0.2, 0.15), body) * (0.35 + 0.65 * uLight) * a;
  }
  if (a < 0.01 && c.g < 0.004) discard;
  gl_FragColor = vec4(c, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class Fauna {
  /** piles — сваи в воде [x, z, …]: у них держатся мальки. */
  constructor(scene, piles = []) {
    this.t = 0;
    this.onSplash = null; // (x, z, сила) — рыба сыграла: звук ставит игра
    this.fx = null;
    this.light = { value: 1 };
    const shared = { uWater: { value: new THREE.Color('#2aa6b0') }, uSunCol: { value: new THREE.Color('#fff4d6') }, uLight: this.light, uSun: { value: 1 } };
    this.shared = shared;
    const fog = THREE.UniformsUtils.clone(THREE.UniformsLib.fog);
    this.buildFry(scene, piles, shared, fog);
    this.buildFish(scene, shared, fog);
    this.buildBugs(scene);
    this.meshes = [this.fry, this.fish, this.bugs];
    this.under = [this.fry, this.fish]; // в отражении воды их нет
  }

  // ───── мальки ─────
  buildFry(scene, piles, shared, fog) {
    const r = rng(9051);
    const homes = [];
    const far = (x, z, d) => homes.every((h) => (h.x - x) ** 2 + (h.z - z) ** 2 > d * d);
    // у свай: мальки держатся в тени причала
    for (const [px, pz] of piles) {
      if (homes.length >= 9) break;
      // рядом со сваей, но не под настилом: там их не видно
      const a0 = r() * TAU;
      for (let k = 0; k < 8; k++) {
        const x = px + Math.cos(a0 + (k / 8) * TAU) * 1.7, z = pz + Math.sin(a0 + (k / 8) * TAU) * 1.7;
        const d = depthAt(x, z);
        if (d > 0.5 && d < 3.8 && open(x, z) && !deckAt(x, z, -0.7) && far(x, z, 6.5)) { homes.push({ x, z, d, amp: 1.2 }); break; }
      }
    }
    // мелководье: бухта, заводь, причал у маяка, лагуна Пальмового острова
    const REG = [
      [-60, 60, -30, 9, 7], [BACKWATER.x - 12, BACKWATER.x + 12, BACKWATER.z - 12, BACKWATER.z + 10, 3],
      [-27, -2, -83, -65, 2], [PALM.x - 62, PALM.x + 30, PALM.z - 30, PALM.z + 30, 3]
    ];
    for (const [x0, x1, z0, z1, n] of REG) {
      let got = 0;
      for (let i = 0; i < 400 && got < n && homes.length < MAX_SHOALS; i++) {
        const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
        const d = depthAt(x, z);
        if (d > 0.4 && d < 1.9 && open(x, z) && far(x, z, 8)) { homes.push({ x, z, d, amp: 2.2 + r() * 1.8 }); got++; }
      }
    }
    this.shoals = homes.map((h, i) => {
      const s = { ...h, i, w1: 0.11 + r() * 0.07, w2: 0.09 + r() * 0.08, p1: r() * TAU, p2: r() * TAU, rad: 0.6 + r() * 0.4, size: 0.14 + r() * 0.07, y: -clamp(h.d * 0.45, 0.2, 0.42), hd: r() * TAU, fear: 0, vis: 0, fx: 0, fz: 0, ax: 0, az: 0, cx: h.x, cz: h.z };
      // петля, по которой ходит стайка, не должна выходить на сушу и на глубину
      for (let k = 0; k < 4; k++) {
        let ok = true;
        for (let a = 0; a < 16 && ok; a++) {
          const x = s.x + Math.sin((a / 16) * TAU) * s.amp, z = s.z + Math.sin((a / 16) * TAU * 2 + 1) * s.amp;
          ok = open(x, z, 0.3) && depthAt(x, z) < 4.2;
        }
        if (ok) break;
        s.amp *= 0.55;
      }
      return s;
    });
    const n = this.shoals.length * PER_SHOAL;
    const g = fryGeometry();
    const a = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) a.set([i % this.shoals.length, r(), r(), r()], i * 4); // вперемешку: урезая число мальков, редим все стайки поровну
    g.setAttribute('aFry', new THREE.InstancedBufferAttribute(a, 4));
    g.instanceCount = n;
    this.fryN = n;
    this.fryU = {
      ...fog, ...shared, uTime: { value: 0 }, uFloor: { value: 0.12 },
      uShoal: { value: Array.from({ length: MAX_SHOALS }, () => new THREE.Vector4()) },
      uShoalB: { value: Array.from({ length: MAX_SHOALS }, () => new THREE.Vector4()) }
    };
    const m = (this.fry = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: this.fryU, vertexShader: FRY_V, fragmentShader: FRY_F, side: THREE.DoubleSide, fog: true, transparent: true, depthWrite: false })));
    m.frustumCulled = false;
    m.renderOrder = 2.5; // после воды (2), до пены у свай (3)
    m.name = 'fauna-fry';
    scene.add(m);
  }

  // ───── рыба покрупнее ─────
  buildFish(scene, shared, fog) {
    const g = fishGeometry();
    this.fishU = { ...fog, ...shared, uFloor: { value: 0.42 } };
    const m = (this.fish = new THREE.InstancedMesh(g, new THREE.ShaderMaterial({ uniforms: this.fishU, vertexShader: FISH_V, fragmentShader: FISH_F, side: THREE.DoubleSide, fog: true, transparent: true, depthWrite: false }), MAX_FISH));
    m.frustumCulled = false;
    m.renderOrder = 2.5;
    m.name = 'fauna-fish';
    this.tint = new THREE.InstancedBufferAttribute(new Float32Array(MAX_FISH * 3), 3);
    this.swim = new THREE.InstancedBufferAttribute(new Float32Array(MAX_FISH * 2), 2);
    g.setAttribute('aTint', this.tint);
    g.setAttribute('aSwim', this.swim);
    this.list = Array.from({ length: MAX_FISH }, (_, i) => ({ x: 0, y: -5, z: 0, yaw: 0, pitch: 0, len: 0, ph: i * 1.7, amp: 0.1 }));
    for (let i = 0; i < MAX_FISH; i++) this.setTint(i, i < SCHOOL_FISH ? SCHOOL_TINT : TINTS[i % TINTS.length]);
    scene.add(m);
    // одиночки: ходят у свай, рифа, арки, в заводи и в лагуне
    const r = (this.rnd = rng(7733));
    const HOMES = [[0, -24, 7], [3, -14, 6], [-3, -6, 5], [REEF.x, REEF.z, 8], [9, -7, 6], [ARCH.x, ARCH.z, 9], [-17, -76, 7], [BACKWATER.x + 4, BACKWATER.z - 2, 7], [-14, -39, 8], [WRECK.x, WRECK.z, 12], [PALM.x - 56, PALM.z + 2, 9], [PALM.x - 42, PALM.z + 14, 9]];
    this.loners = HOMES.slice(0, LONERS).map(([hx, hz, hr], i) => {
      const f = this.list[SCHOOL_FISH + i];
      f.len = 0.32 + r() * 0.45;
      const o = { f, hx, hz, hr, tx: hx, tz: hz, v: 0.4, timer: 0, flee: 0, ok: true };
      // начальное место — где есть вода
      for (let k = 0; k < 30; k++) {
        const x = hx + (r() - 0.5) * 2 * hr, z = hz + (r() - 0.5) * 2 * hr;
        if (open(x, z, 0.8)) { f.x = x; f.z = z; o.tx = x; o.tz = z; break; }
        if (k === 29) o.ok = false;
      }
      f.yaw = r() * TAU;
      if (!o.ok) f.len = 0;
      return o;
    });
    this.suitor = { f: this.list[SUITOR], st: 'none', a: 0, r: 5, lunge: 0, t: 0 };
    this.jumps = Array.from({ length: JUMPERS }, (_, i) => ({ f: this.list[SUITOR + 1 + i], on: false, u: 0, x: 0, z: 0, yaw: 0 }));
    this.jk = -1;
    this.plan = null;
    this.jumped = 0;
    this.bobber = null;
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._q2 = new THREE.Quaternion();
    this._p = new THREE.Vector3();
    this._s = new THREE.Vector3();
  }
  setTint(i, c) {
    this.tint.setXYZ(i, c[0], c[1], c[2]);
    this.tint.needsUpdate = true;
  }
  /** Рыба косяка: место, куда смотрит (угол в плоскости воды, 0 — вдоль +X) и размер. Зовёт scenery.js каждый кадр. */
  schoolFish(i, x, y, z, yaw, s) {
    const f = this.list[i];
    const moved = Math.hypot(x - f.x, z - f.z);
    f.ph += Math.min(0.6, moved * 9);
    f.x = x; f.y = y; f.z = z; f.yaw = yaw; f.pitch = 0;
    f.len = 0.62 * s;
    f.amp = 0.11;
  }

  // ───── насекомые ─────
  buildBugs(scene) {
    const r = rng(4477);
    const home = [], bug = [];
    const add = (x, y, z, kind) => { home.push(x, y, z); bug.push(r(), r(), r(), kind); };
    const land = (x0, x1, z0, z1, n, kind, hMin, hMax, lift) => {
      let got = 0;
      for (let i = 0; i < n * 40 && got < n; i++) {
        const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
        const h = groundH(x, z);
        if (h > hMin && h < hMax && !deckAt(x, z, -0.5)) { add(x, Math.max(h, 0) + lift[0] + r() * lift[1], z, kind); got++; }
      }
    };
    // бабочки — над лугом за берегом и на Пальмовом острове
    land(-48, 48, 15, 46, 34, 0, 1.0, 14, [0.5, 0.9]);
    land(PALM.x - 26, PALM.x + 26, PALM.z - 18, PALM.z + 18, 8, 0, 0.8, 12, [0.5, 0.9]);
    // светлячки — по опушке, у заводи и на острове
    land(-62, 62, 12, 62, 58, 1, 0.6, 22, [0.4, 1.6]);
    land(BACKWATER.x - 22, BACKWATER.x + 22, BACKWATER.z - 20, BACKWATER.z + 22, 22, 1, 0.15, 3, [0.3, 1.2]);
    land(PALM.x - 28, PALM.x + 28, PALM.z - 20, PALM.z + 20, 14, 1, 0.5, 12, [0.4, 1.4]);
    // стрекозы — над тихой водой заводи и над лагуной
    land(BACKWATER.x - 12, BACKWATER.x + 12, BACKWATER.z - 12, BACKWATER.z + 10, 9, 2, -1.5, -0.1, [0.35, 0.5]);
    land(PALM.x - 60, PALM.x - 30, PALM.z - 16, PALM.z + 22, 4, 2, -1.2, -0.15, [0.35, 0.5]);
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    g.setAttribute('aHome', new THREE.InstancedBufferAttribute(new Float32Array(home), 3));
    g.setAttribute('aBug', new THREE.InstancedBufferAttribute(new Float32Array(bug), 4));
    g.instanceCount = this.bugN = home.length / 3;
    this.bugKinds = [0, 1, 2].map((k) => bug.filter((v, i) => i % 4 === 3 && v === k).length);
    this.bugU = { uTime: { value: 0 }, uDay: { value: 1 }, uNight: { value: 0 }, uDry: { value: 1 }, uLight: this.light };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.bugU, vertexShader: BUG_V, fragmentShader: BUG_F, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, premultipliedAlpha: true
    });
    const m = (this.bugs = new THREE.Mesh(g, mat));
    m.frustumCulled = false;
    m.renderOrder = 5;
    m.name = 'fauna-bugs';
    scene.add(m);
  }

  /** Что-то плюхнулось или идёт по воде: мальки разлетаются, рыба уходит. */
  scare(x, z, R = 2.6, power = 1) {
    for (const s of this.shoals) {
      const dx = s.cx - x, dz = s.cz - z, d = Math.hypot(dx, dz);
      if (!(d <= R + s.rad * 1.6)) continue;
      s.fear = Math.max(s.fear, power);
      s.ax = d > 0.05 ? dx / d : 1;
      s.az = d > 0.05 ? dz / d : 0;
    }
    for (const o of this.loners) {
      const dx = o.f.x - x, dz = o.f.z - z, d = Math.hypot(dx, dz);
      if (!o.ok || !(d <= R + 1.2)) continue;
      o.flee = 2.4;
      const k = 7 / Math.max(d, 0.2);
      o.tx = o.f.x + dx * k;
      o.tz = o.f.z + dz * k;
    }
  }
  /** Наживка в воде: { x, z, left — секунд до поклёвки, bite — клюёт } или null. */
  bait(b) {
    this.bobber = b;
  }
  /** Поплавок дрогнул: рыба ткнулась в наживку. */
  nibble() {
    if (this.suitor.st === 'come') this.suitor.lunge = 0.42;
  }
  /** Подсечка удалась: дальше рыбу на леске рисует сама рыбалка. */
  baitTaken() {
    this.suitor.st = 'none';
    this.suitor.f.len = 0;
    this.bobber = null;
  }

  stepSuitor(dt) {
    const S = this.suitor, f = S.f, b = this.bobber;
    if (S.st === 'none') {
      if (!b || b.bite || b.left > 4.6 || b.left < 0.4) return;
      // подходит с глубины
      let best = 0, bd = -1;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + this.rnd() * 0.5;
        const x = b.x + Math.cos(a) * 5, z = b.z + Math.sin(a) * 5;
        const d = open(x, z, 0.5) ? depthAt(x, z) : -1;
        if (d > bd) { bd = d; best = a; }
      }
      if (bd < 0.5) return;
      S.st = 'come';
      S.a = best;
      S.r = 5.2;
      S.turn = this.rnd() < 0.5 ? 1 : -1;
      f.len = 0.3 + this.rnd() * 0.4 + (bd > 3 ? 0.15 : 0);
      f.x = b.x + Math.cos(best) * S.r;
      f.z = b.z + Math.sin(best) * S.r;
      f.yaw = best + Math.PI;
      S.scale = 0;
      this.setTint(SUITOR, TINTS[Math.floor(this.rnd() * TINTS.length)]);
    }
    let tx, tz, speed;
    if (S.st === 'flee') {
      S.t -= dt;
      tx = f.x + Math.cos(S.a) * 6;
      tz = f.z + Math.sin(S.a) * 6;
      speed = 3.2;
      S.scale = Math.max(0, S.scale - dt * 0.9);
      if (S.t <= 0 || S.scale <= 0) { S.st = 'none'; f.len = 0; return; }
    } else if (!b || (!b.bite && b.left > 6)) {
      // наживку убрали, или рыба сорвалась и следующая поклёвка нескоро — уходит
      S.st = 'flee';
      S.t = 1.5;
      S.a = Math.atan2(f.z - S.bz, f.x - S.bx) + (this.rnd() - 0.5);
      this.bobber = b;
      return;
    } else {
      S.bx = b.x; S.bz = b.z;
      S.scale = Math.min(1, S.scale + dt * 1.4);
      S.lunge = Math.max(0, S.lunge - dt);
      const want = b.bite || S.lunge > 0.2 ? 0.1 : clamp(0.5 + (b.left - 1.2) * 1.25, 0.5, 5.2);
      S.r = damp(S.r, want, b.bite ? 9 : 2.2, dt);
      S.a += dt * S.turn * (0.35 + 1.1 / (S.r + 0.5));
      tx = b.x + Math.cos(S.a) * S.r;
      tz = b.z + Math.sin(S.a) * S.r;
      speed = b.bite ? 2.6 : 1.9;
    }
    const dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz);
    const step = Math.min(d, speed * dt);
    if (d > 0.01) {
      f.yaw += angDiff(f.yaw, Math.atan2(dz, dx)) * (1 - Math.exp(-7 * dt));
      f.x += (dx / d) * step;
      f.z += (dz / d) * step;
    }
    // у самой наживки рыба ходит под поверхностью и расходятся круги — их видно и с двадцати метров
    const close = S.st === 'come' && S.r < 1.7;
    f.y = (close ? -0.17 : -0.3) + waveH(f.x, f.z, this.t) * 0.5;
    if (close && this.fx && (S.rip = (S.rip || 0) - dt) <= 0) {
      S.rip = 0.7 + this.rnd() * 0.5;
      this.fx.ripple(f.x, f.z, 0.34, 1.0);
    }
    f.pitch = 0;
    f.amp = b && b.bite ? 0.22 : 0.12;
    f.ph += dt * (4 + (step / Math.max(dt, 1e-3)) * 5 + (b && b.bite ? 14 : 0));
    f.scale = S.scale;
  }

  stepLoners(dt) {
    for (const o of this.loners) {
      if (!o.ok) continue;
      const f = o.f;
      o.timer -= dt;
      o.flee = Math.max(0, o.flee - dt);
      const dx = o.tx - f.x, dz = o.tz - f.z, d = Math.hypot(dx, dz);
      if ((d < 0.7 || o.timer <= 0) && o.flee <= 0) {
        for (let k = 0; k < 6; k++) {
          const x = o.hx + (this.rnd() - 0.5) * 2 * o.hr, z = o.hz + (this.rnd() - 0.5) * 2 * o.hr;
          if (open(x, z, 0.8)) { o.tx = x; o.tz = z; break; }
        }
        o.timer = 6 + this.rnd() * 9;
        o.v = 0.25 + this.rnd() * 0.5;
      }
      const v = o.flee > 0 ? 2.6 : o.v;
      if (d > 0.05) f.yaw += angDiff(f.yaw, Math.atan2(dz, dx)) * (1 - Math.exp(-(o.flee > 0 ? 6 : 1.5) * dt));
      const nx = f.x + Math.cos(f.yaw) * v * dt, nz = f.z + Math.sin(f.yaw) * v * dt;
      const dep = depthAt(nx, nz);
      if (dep > 0.55 && !inRocks(nx, nz)) { f.x = nx; f.z = nz; } else { o.timer = 0; o.flee = 0; } // упёрлась в мель или камень — выбирает новый путь
      f.y = -clamp(Math.max(dep, 0.55) * 0.45, 0.28, 0.62) + Math.sin(this.t * 0.4 + f.ph * 0.01) * 0.04;
      f.amp = 0.1;
      f.ph += dt * (3 + v * 6);
    }
  }

  /** Рыба играет: расписание общее для всех в комнате (seed — число комнаты, T — общие часы), место — у одного из косяков. */
  stepJumps(dt, seed, T, centers, camera) {
    const k = Math.floor(T / JUMP_SLOT);
    if (k !== this.jk) {
      this.jk = k;
      const r = rng((seed ^ Math.imul(k + 7, 2246822519)) >>> 0);
      this.plan = null;
      const live = (centers || []).filter((c) => c.on > 0.5);
      if (live.length && r() < 0.45) {
        const c = live[Math.floor(r() * live.length)];
        const a = r() * TAU, d = r() * 2.6;
        this.plan = { at: k * JUMP_SLOT + 1 + r() * (JUMP_SLOT - 2.5), x: c.x + Math.cos(a) * d, z: c.z + Math.sin(a) * d, yaw: r() * TAU, len: 0.45 + r() * 0.4, tint: Math.floor(r() * TINTS.length) };
      }
    }
    const p = this.plan;
    if (p && T >= p.at) {
      this.plan = null;
      const j = this.jumps.find((q) => !q.on);
      // далёкий всплеск не виден и не слышен — пропускаем; на мели рыбе негде разогнаться
      if (j && T - p.at < 1 && depthAt(p.x, p.z) > 0.7 && Math.hypot(p.x - camera.position.x, p.z - camera.position.z) < 150) {
        Object.assign(j, { on: true, u: 0, x: p.x, z: p.z, yaw: p.yaw });
        j.f.len = p.len;
        this.setTint(this.list.indexOf(j.f), TINTS[p.tint]);
        this.splash(p.x, p.z, 0.55);
        this.jumped++;
      }
    }
    for (const j of this.jumps) {
      if (!j.on) continue;
      const f = j.f;
      j.u += dt / 0.72;
      const u = Math.min(1, j.u), run = (u - 0.5) * f.len * 2.4;
      f.x = j.x + Math.cos(j.yaw) * run;
      f.z = j.z + Math.sin(j.yaw) * run;
      f.y = -0.18 + Math.sin(Math.PI * u) * (0.6 + f.len * 0.9);
      f.yaw = j.yaw;
      f.pitch = Math.cos(Math.PI * u) * 1.0;
      f.amp = 0.2;
      f.ph += dt * 26;
      if (j.u >= 1) {
        j.on = false;
        f.len = 0;
        this.splash(f.x, f.z, 0.8);
        this.scare(f.x, f.z, 3, 0.8);
      }
    }
  }
  splash(x, z, p) {
    if (this.fx) this.fx.splash(x, z, p);
    if (this.onSplash) this.onSplash(x, z, p);
  }

  /**
   * t — время кадра, T и seed — общие часы и число комнаты (всплески у всех одни и те же), centers — косяки.
   * env: { light 0…1 — насколько светло, night 0…1, rain 0…1, sun 0…1 — прямое солнце, sunCol, water — цвет воды на мели, fx }
   */
  update(dt, t, T, seed, camera, env, centers) {
    this.t = t;
    this.fx = env.fx || this.fx;
    this.light.value = env.light;
    const sh = this.shared;
    sh.uSun.value = env.sun;
    if (env.sunCol) sh.uSunCol.value.copy(env.sunCol);
    if (env.water) sh.uWater.value.copy(env.water);
    // стайки: ходят по петле, от испуга шарахаются в сторону и возвращаются
    this.fryU.uTime.value = t;
    const A = this.fryU.uShoal.value, B = this.fryU.uShoalB.value;
    for (const s of this.shoals) {
      s.fear = Math.max(0, s.fear - dt / 3.2);
      s.vis = damp(s.vis, s.fear, s.fear > s.vis ? 14 : 2.5, dt);
      const px = s.x + Math.sin(t * s.w1 + s.p1) * s.amp, pz = s.z + Math.sin(t * s.w2 + s.p2) * s.amp;
      const vx = Math.cos(t * s.w1 + s.p1) * s.w1 * s.amp, vz = Math.cos(t * s.w2 + s.p2) * s.w2 * s.amp;
      let wx = 0, wz = 0;
      if (s.fear > 0.05) {
        let k = 4.5 * Math.min(1, s.fear * 1.5);
        for (let i = 0; i < 3 && k > 0.3 && !open(px + s.ax * k, pz + s.az * k, 0.35); i++) k *= 0.5;
        if (open(px + s.ax * k, pz + s.az * k, 0.35)) { wx = s.ax * k; wz = s.az * k; }
      }
      const kk = s.fear > 0.05 ? 3.5 : 0.5;
      s.fx = damp(s.fx, wx, kk, dt);
      s.fz = damp(s.fz, wz, kk, dt);
      s.cx = px + s.fx;
      s.cz = pz + s.fz;
      const want = s.fear > 0.3 ? Math.atan2(s.az, s.ax) : Math.atan2(vz, vx);
      s.hd += angDiff(s.hd, want) * (1 - Math.exp(-(s.fear > 0.3 ? 8 : 1.6) * dt));
      A[s.i].set(s.cx, s.cz, s.hd, s.vis);
      B[s.i].set(s.y, s.rad, 1, s.size);
    }
    this.stepLoners(dt);
    this.stepSuitor(dt);
    this.stepJumps(dt, seed, T, centers, camera);
    // всё в один буфер
    const m = this._m, q = this._q, q2 = this._q2, p = this._p, sv = this._s;
    for (let i = 0; i < MAX_FISH; i++) {
      const f = this.list[i];
      const s = Math.max(1e-4, f.len * (f.scale == null ? 1 : f.scale));
      q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, -f.yaw);
      if (f.pitch) q.multiply(q2.setFromAxisAngle(sv.set(0, 0, 1), f.pitch));
      m.compose(p.set(f.x, f.y, f.z), q, sv.set(s, s, s));
      this.fish.setMatrixAt(i, m);
      this.swim.setXY(i, f.ph, f.amp);
    }
    this.fish.instanceMatrix.needsUpdate = true;
    this.swim.needsUpdate = true;
    const u = this.bugU;
    u.uTime.value = t;
    u.uDay.value = clamp(1 - env.night * 2.2, 0, 1);
    u.uNight.value = clamp(env.night * 1.6 - 0.45, 0, 1);
    u.uDry.value = clamp(1 - env.rain * 2.5, 0, 1);
    this.bugs.visible = u.uDry.value > 0.01;
  }
  /** Слабой машине — вдвое меньше мальков. */
  setDetail(k) {
    this.fry.geometry.instanceCount = Math.round(this.fryN * clamp(k, 0.25, 1));
  }
  /** Для проверок. */
  stats() {
    return {
      shoals: this.shoals.length, fry: this.fry.geometry.instanceCount, fish: this.list.filter((f) => f.len > 0).length, loners: this.loners.filter((o) => o.ok).length,
      bugs: this.bugKinds, suitor: this.suitor.st, jumped: this.jumped, scared: this.shoals.filter((s) => s.fear > 0.3).length
    };
  }
}
