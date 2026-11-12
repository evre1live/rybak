// Вода бухты: бирюзовая на мели, синяя на глубине, с бликами, сеткой света и пеной у берега.
import * as THREE from 'three';
import { groundH, BOUNDS, WORLD, BACKWATER } from './terrain.js';
import { surfaceU } from './surface.js';

// три волны: направление (x, z), частота, высота, скорость
const WAVES = [
  [0.8, 0.6, 0.22, 0.09, 0.9],
  [-0.4, 0.92, 0.45, 0.05, 1.3],
  [0.95, -0.3, 0.9, 0.022, 1.9]
];
// у берега и в заводи волна гаснет
export const waveAmp = (x, z) => {
  const t = Math.max(0, Math.min(1, (-groundH(x, z) - 0.4) / 5.6));
  return 0.12 + 0.88 * t * t * (3 - 2 * t);
};
export function waveH(x, z, t) {
  let h = 0;
  for (const [dx, dz, k, a, w] of WAVES) h += a * Math.sin((x * dx + z * dz) * k + t * w);
  return h * waveAmp(x, z);
}

function tileNoise(x, y, period) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const h = (a, b) => {
    a = ((a % period) + period) % period;
    b = ((b % period) + period) % period;
    let n = Math.imul(a, 374761393) ^ Math.imul(b, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  return h(ix, iy) * (1 - u) * (1 - v) + h(ix + 1, iy) * u * (1 - v) + h(ix, iy + 1) * (1 - u) * v + h(ix + 1, iy + 1) * u * v;
}
function normalTexture(size = 256) {
  const hgt = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let s = 0;
      let amp = 1;
      for (const p of [4, 8, 16, 32]) {
        s += amp * tileNoise((x / size) * p, (y / size) * p, p);
        amp *= 0.55;
      }
      hgt[y * size + x] = s;
    }
  const data = new Uint8Array(size * size * 4);
  const at = (x, y) => hgt[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 3.2;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 3.2;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      data[i] = (-dx / l) * 127 + 128;
      data[i + 1] = (-dy / l) * 127 + 128;
      data[i + 2] = (1 / l) * 255;
      data[i + 3] = 255;
    }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}
// сетка света: границы ячеек Вороного, бесшовная
function causticTexture(size = 256, cells = 7) {
  const pts = [];
  let seed = 7;
  const r = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296);
  for (let i = 0; i < cells * cells; i++) pts.push([r(), r()]);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const px = (x / size) * cells;
      const py = (y / size) * cells;
      const cx = Math.floor(px);
      const cy = Math.floor(py);
      let f1 = 9;
      let f2 = 9;
      for (let j = -1; j <= 1; j++)
        for (let i = -1; i <= 1; i++) {
          const gx = cx + i;
          const gy = cy + j;
          const p = pts[(((gy % cells) + cells) % cells) * cells + (((gx % cells) + cells) % cells)];
          const d = Math.hypot(gx + p[0] - px, gy + p[1] - py);
          if (d < f1) {
            f2 = f1;
            f1 = d;
          } else if (d < f2) f2 = d;
        }
      const e = f2 - f1;
      const line = Math.max(0, 1 - e / 0.16);
      const v = Math.pow(line, 1.6) * 255;
      const i4 = (y * size + x) * 4;
      data[i4] = data[i4 + 1] = data[i4 + 2] = v;
      data[i4 + 3] = 255;
    }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}
// карта глубин: по ней вода знает, где мель, где берег
/** Карта глубин участка B: по ней вода знает, где мель, берег и пена. */
function depthTexture(B, w, h) {
  const data = new Uint8Array(w * h * 4);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const x = B.x0 + ((i + 0.5) / w) * (B.x1 - B.x0);
      const z = B.z0 + ((j + 0.5) / h) * (B.z1 - B.z0);
      const d = Math.max(0, Math.min(16, -groundH(x, z)));
      const k = (j * w + i) * 4;
      data[k] = data[k + 1] = data[k + 2] = Math.sqrt(d / 16) * 255;
      data[k + 3] = 255;
    }
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
}
// всё море — грубее: шаг около 2,5 м
const FAR = { x0: WORLD.x0 - 60, x1: WORLD.x1 + 60, z0: WORLD.z0 - 60, z1: WORLD.z1 + 60 };
const boundsVec = (B) => new THREE.Vector4(B.x0, B.z0, 1 / (B.x1 - B.x0), 1 / (B.z1 - B.z0));
// глубина в точке: в бухте — по подробной карте, дальше — по грубой, у границы плавный переход
const DEPTH_GLSL = /* glsl */ `
uniform sampler2D uDepth, uDepthFar;
uniform vec4 uBounds, uBoundsFar;
float depthAt(vec2 p) {
  vec2 uv = (p - uBounds.xy) * uBounds.zw;
  vec2 e = min(uv, 1.0 - uv) / uBounds.zw;
  float w = clamp(min(e.x, e.y) / 8.0, 0.0, 1.0);
  float far = texture2D(uDepthFar, (p - uBoundsFar.xy) * uBoundsFar.zw).r;
  float near = texture2D(uDepth, clamp(uv, 0.0, 1.0)).r;
  return mix(far, near, w);
}`;

const waveGLSL = WAVES.map(([dx, dz, k, a, w], i) => `
  { float ph = dot(p, vec2(${dx.toFixed(3)}, ${dz.toFixed(3)})) * ${k.toFixed(3)} + uTime * ${w.toFixed(3)};
    h += ${a.toFixed(4)} * sin(ph); g += vec2(${dx.toFixed(3)}, ${dz.toFixed(3)}) * (${(a * k).toFixed(5)} * cos(ph)); }`).join('');

const VERT = /* glsl */ `
uniform float uTime;
${DEPTH_GLSL}
varying vec3 vWorld;
varying float vAmp;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec2 p = wp.xz; float h = 0.0; vec2 g = vec2(0.0);
  ${waveGLSL}
  float dv = depthAt(p);
  float t = clamp((dv * dv * 16.0 - 0.4) / 5.6, 0.0, 1.0);
  vAmp = 0.12 + 0.88 * t * t * (3.0 - 2.0 * t);
  wp.y += h * vAmp;
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const FRAG = /* glsl */ `
precision highp float;
uniform float uTime, uGlitter, uFogNear, uFogFar;
uniform sampler2D uNormal, uCaustic, uDet;
uniform float uCloudK;
${DEPTH_GLSL}
uniform vec3 uShallow, uDeep, uSkyZen, uSkyHor, uSunDir, uSunCol, uFogCol;
uniform sampler2D uRefl;
uniform mat4 uReflM;
uniform float uReflK;
uniform vec3 uCalm;
varying vec3 vWorld;
varying float vAmp;
float ss(float a, float b, float x) { float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
void main() {
  vec2 p = vWorld.xz; float h = 0.0; vec2 g = vec2(0.0);
  ${waveGLSL}
  g *= vAmp;
  float dv = depthAt(p);
  float depth = dv * dv * 16.0;
  vec3 n1 = texture2D(uNormal, p * 0.045 + uTime * vec2(0.012, 0.008)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uNormal, p * 0.13 + uTime * vec2(-0.017, 0.012)).xyz * 2.0 - 1.0;
  float dist = length(cameraPosition - vWorld);
  float calm = 1.0 / (1.0 + dist * 0.012);
  vec3 N = normalize(vec3(-g.x - (n1.x + n2.x * 0.7) * 0.2 * calm, 1.0, -g.y - (n1.y + n2.y * 0.7) * 0.2 * calm));
  vec3 V = normalize(cameraPosition - vWorld);
  float ndv = max(dot(N, V), 0.0);
  float fres = 0.025 + 0.975 * pow(1.0 - ndv, 5.0);

  // толща воды: чем длиннее путь взгляда сквозь неё, тем плотнее цвет; на мели и при взгляде сверху вниз видно дно
  float path = depth / max(ndv, 0.18);
  float body = 1.0 - exp(-path * 0.16);
  vec3 c = mix(uShallow, uDeep, ss(1.0, 14.0, depth));
  c = mix(uShallow * 1.1 + vec3(0.04, 0.06, 0.04), c, ss(0.0, 2.2, depth));

  // сетка света на поверхности — как на мелководье в ясный день
  vec2 warp = (texture2D(uNormal, p * 0.012 + uTime * 0.003).xy - 0.5) * 0.32;
  float c1 = texture2D(uCaustic, p * 0.075 + uTime * vec2(0.011, 0.007) + n1.xy * 0.035 + warp).r;
  float c2 = texture2D(uCaustic, p * 0.11 - uTime * vec2(0.009, 0.013) + n2.xy * 0.03 - warp * 1.3).r;
  float net = max(c1 * 0.75, c2 * 0.55) * (1.0 - 0.55 * ss(3.0, 12.0, depth));
  c += uSunCol * net * 0.27 * uGlitter * (0.35 + 0.65 * body) / (1.0 + dist * 0.016);

  vec3 R = reflect(-V, N);
  vec3 sky = mix(uSkyHor, uSkyZen, pow(max(R.y, 0.0), 0.55));
  if (uReflK > 0.001) {
    // отражение мира: точка воды → место в буфере, снятом зеркальной камерой; рябь сдвигает выборку
    vec4 rc = uReflM * vec4(vWorld.x, 0.0, vWorld.z, 1.0);
    vec2 ruv = rc.xy / max(rc.w, 1e-4) + N.xz * (0.05 * calm + 0.012);
    sky = mix(sky, texture2D(uRefl, clamp(ruv, 0.003, 0.997)).rgb, uReflK);
  }
  c = mix(c, sky, fres * 0.8);
  float rs = max(dot(R, uSunDir), 0.0);
  c += uSunCol * (pow(rs, 380.0) * 3.0 + pow(rs, 28.0) * 0.1) * uGlitter;

  // Прибой. Кромка воды «дышит»: волна накатывает на берег и отходит (тем же ходом темнеет мокрый песок — surface.js).
  // С глубины к берегу идут пенные валы: резкий передний край, за ним тающий след; на мели вал рассыпается в кружево.
  float swash = sin(uTime * 0.9 + p.x * 0.35 + n1.y * 2.0);
  float lap = 0.1 + 0.07 * swash;
  float edge = 1.0 - ss(0.0, lap + 0.1, depth + n1.x * 0.07);
  float ph = fract(depth * 0.95 + uTime * 0.17 + n2.x * 0.16 + n1.y * 0.1);
  float crest = ss(0.0, 0.035, ph) * pow(1.0 - ph, 8.0);
  float lace = ss(0.45, 0.85, n1.z * 0.45 + c1 * 0.8 + c2 * 0.35);
  // в тихой заводи прибоя нет: туда волна с моря не доходит
  float open = ss(uCalm.z, uCalm.z + 12.0, distance(p, uCalm.xy));
  float band = crest * mix(1.0, lace, ss(0.03, 0.3, ph)) * ss(0.05, 0.2, depth) * (1.0 - ss(1.0, 2.3, depth)) * open;
  // у самого берега после наката остаётся тонкое кружево пены — узкой полоской, без молочной каши на мели
  float wash = lace * (1.0 - ss(0.0, 0.13, depth)) * (0.5 + 0.4 * swash) * open;
  float foam = clamp(edge + band + wash * 0.35, 0.0, 1.0) * step(0.004, dv);
  vec3 foamCol = mix(vec3(1.0), uSkyHor, 0.25) * (0.35 + 0.65 * clamp(uGlitter + 0.25, 0.0, 1.0));
  c = mix(c, foamCol, foam * 0.85);

  float alpha = max(max(body, 0.1), max(fres * 0.92, foam));
  alpha = max(alpha, ss(70.0, 170.0, dist)); // вдали вода сплошная: дна всё равно не разглядеть
  c *= 1.0 - uCloudK * 0.2 * ss(0.5, 0.68, texture2D(uDet, p * 0.0019 + uTime * vec2(0.0021, 0.0012)).r); // тени облаков
  float fog = ss(uFogNear, uFogFar, dist);
  c = mix(c, uFogCol, fog);
  gl_FragColor = vec4(c, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function createWater() {
  // сетка густая в середине бухты и редкая к горизонту
  const n = 170;
  const pos = new Float32Array((n + 1) * (n + 1) * 3);
  const idx = [];
  const map = (u) => 190 * u + 1700 * u * u * u * u * u;
  for (let j = 0; j <= n; j++)
    for (let i = 0; i <= n; i++) {
      const k = (j * (n + 1) + i) * 3;
      pos[k] = map((i / n) * 2 - 1);
      pos[k + 1] = 0;
      pos[k + 2] = map((j / n) * 2 - 1);
    }
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i;
      idx.push(a, a + n + 1, a + 1, a + 1, a + n + 1, a + n + 2);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const uniforms = {
    uTime: { value: 0 }, uGlitter: { value: 1 }, uFogNear: { value: 150 }, uFogFar: { value: 1400 },
    uDepth: { value: depthTexture(BOUNDS, 400, 400) }, uDepthFar: { value: depthTexture(FAR, Math.round((FAR.x1 - FAR.x0) / 2.5), Math.round((FAR.z1 - FAR.z0) / 2.5)) },
    uNormal: { value: normalTexture() }, uCaustic: { value: causticTexture() }, uDet: surfaceU.uDet, uCloudK: surfaceU.uCloudK,
    uBounds: { value: boundsVec(BOUNDS) }, uBoundsFar: { value: boundsVec(FAR) },
    uShallow: { value: new THREE.Color('#35e0d4') }, uDeep: { value: new THREE.Color('#1273c4') },
    uSkyZen: { value: new THREE.Color('#1f7fe0') }, uSkyHor: { value: new THREE.Color('#a6dcff') },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color('#fff4e0') }, uFogCol: { value: new THREE.Color('#a6dcff') },
    // отражение мира (gfx.js): буфер, матрица «точка мира → место в буфере», сила (0 — отражается только небо)
    uRefl: { value: null }, uReflM: { value: new THREE.Matrix4() }, uReflK: { value: 0 },
    uCalm: { value: new THREE.Vector3(BACKWATER.x, BACKWATER.z, BACKWATER.r) } // тихая заводь: прибоя в ней нет
  };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false });
  const m = new THREE.Mesh(geo, material);
  m.position.set(5, 0, -40);
  m.frustumCulled = false;
  m.renderOrder = 2;
  // густая середина сетки следует за камерой (шагами в одну ячейку): волны под лодкой настоящие и далеко от бухты
  const CELL = (190 * 2) / n;
  const follow = (cam) => m.position.set(Math.round(cam.position.x / CELL) * CELL, 0, Math.round(cam.position.z / CELL) * CELL);
  return { mesh: m, uniforms, follow };
}

const RING_VERT = /* glsl */ `
uniform float uTime;
${DEPTH_GLSL}
attribute float aSeed;
varying vec2 vUv;
varying float vSeed;
varying float vDist;
void main() {
  vec4 wp = vec4(position, 1.0);
  vec2 p = wp.xz; float h = 0.0; vec2 g = vec2(0.0);
  ${waveGLSL}
  float dv = depthAt(p);
  float t = clamp((dv * dv * 16.0 - 0.4) / 5.6, 0.0, 1.0);
  wp.y += h * (0.12 + 0.88 * t * t * (3.0 - 2.0 * t)) + 0.012;
  vUv = uv; vSeed = aSeed;
  vDist = length(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const RING_FRAG = /* glsl */ `
precision highp float;
uniform float uTime, uGlitter;
uniform sampler2D uNormal;
uniform vec3 uSkyHor;
varying vec2 vUv;
varying float vSeed;
varying float vDist;
void main() {
  float d = length(vUv); // 1.0 — край сваи
  float n = texture2D(uNormal, vUv * 0.09 + vSeed * 7.0 + uTime * 0.015).x;
  // рваная кромка пены у самой сваи
  float foam = smoothstep(1.7 + n * 0.9, 1.08, d) * smoothstep(0.92, 1.04, d);
  // два расходящихся круга
  float ring = 0.0;
  for (int i = 0; i < 2; i++) {
    float ph = fract(uTime * 0.19 + vSeed + float(i) * 0.5);
    ring += smoothstep(0.2, 0.0, abs(d - (1.25 + ph * 2.7) - n * 0.25)) * (1.0 - ph) * (1.0 - ph);
  }
  float a = clamp(foam * 0.85 + ring * 0.42, 0.0, 1.0) * smoothstep(4.1, 3.3, d) * smoothstep(60.0, 25.0, vDist);
  if (a < 0.01) discard;
  vec3 c = mix(vec3(1.0), uSkyHor, 0.25) * (0.35 + 0.65 * clamp(uGlitter + 0.25, 0.0, 1.0));
  gl_FragColor = vec4(c, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
/** Пена и расходящиеся круги вокруг свай: плоские кольца, которые качаются вместе с водой. spots: [[x, z, радиус], …] */
export function createFoamRings(spots, wU) {
  const n = spots.length;
  const pos = new Float32Array(n * 12);
  const uv = new Float32Array(n * 8);
  const seed = new Float32Array(n * 4);
  const idx = [];
  const Q = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
  spots.forEach(([x, z, r], i) => {
    const K = 4.2;
    Q.forEach(([a, b], k) => {
      pos.set([x + a * r * K, 0, z + b * r * K], (i * 4 + k) * 3);
      uv.set([a * K, b * K], (i * 4 + k) * 2);
      seed[i * 4 + k] = (i * 0.6180339887) % 1;
    });
    idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setIndex(idx);
  const uniforms = { uTime: wU.uTime, uDepth: wU.uDepth, uBounds: wU.uBounds, uDepthFar: wU.uDepthFar, uBoundsFar: wU.uBoundsFar, uNormal: wU.uNormal, uGlitter: wU.uGlitter, uSkyHor: wU.uSkyHor };
  const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms, vertexShader: RING_VERT, fragmentShader: RING_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
  m.frustumCulled = false;
  m.renderOrder = 3;
  return m;
}
