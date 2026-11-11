// Мир «Солнечной бухты»: рельеф, небо, облака, свет по времени суток — и сборка всего остального.
import * as THREE from 'three';
import { clamp, lerp, sstep, fbm2, canvasTex, rng, TAU, isTouch } from './util.js';
import { groundH, shoreZ, BOUNDS, capeDist, CAPE, ISLAND, islandR, MAP_VIEW, DECKS, LIGHTHOUSE, ARCH } from './terrain.js';
import { createWater, createFoamRings } from './water.js';
import { buildScenery, FOAM_SPOTS } from './scenery.js';
import { patchSurface, surfaceU, detailTexture } from './surface.js';

// ключевые часы суток: цвета неба, солнца, воды
const K = (h, zen, hor, sun, sunI, hemiS, hemiG, hemiI, fog, wS, wD, cloud, stars, glit, exp) => ({
  h, zen: new THREE.Color(zen), hor: new THREE.Color(hor), sun: new THREE.Color(sun), sunI, hemiS: new THREE.Color(hemiS), hemiG: new THREE.Color(hemiG), hemiI,
  fog: new THREE.Color(fog), wS: new THREE.Color(wS), wD: new THREE.Color(wD), cloud: new THREE.Color(cloud), stars, glit, exp
});
const KEYS = [
  K(0, '#070d24', '#14244a', '#8fa8ff', 0.9, '#33477f', '#141a28', 0.8, '#14244a', '#16506e', '#071b33', '#2b3a5e', 1, 0.3, 1.0),
  K(4.6, '#070d24', '#172850', '#8fa8ff', 0.9, '#33477f', '#141a28', 0.8, '#172850', '#16506e', '#071b33', '#2b3a5e', 1, 0.3, 1.0),
  K(5.7, '#2c4f96', '#ff9e7a', '#ffb98a', 1.5, '#8fa0d0', '#5a4a3a', 0.72, '#f0a890', '#3aa8b8', '#1a4a85', '#ffc9b0', 0.1, 0.8, 1.0),
  K(7.2, '#2a86ea', '#bfe3ff', '#fff0d6', 2.7, '#cfe8ff', '#c9b384', 1.25, '#bfe3ff', '#36ddd2', '#1273c4', '#ffffff', 0, 1, 1.0),
  K(12, '#1b78e2', '#a9dcff', '#fff6e6', 3.0, '#d6ecff', '#d2bc8c', 1.35, '#a9dcff', '#35e0d4', '#1070c4', '#ffffff', 0, 1, 1.0),
  K(17, '#2280e4', '#b4dcff', '#fff0d0', 2.9, '#d6ecff', '#d2bc8c', 1.3, '#b4dcff', '#38dccf', '#126ec0', '#fff8ee', 0, 1, 1.0),
  K(19, '#3a5cb0', '#ffb070', '#ffb060', 2.1, '#b0b8e0', '#8a6a4a', 1.0, '#ffb88a', '#48b8c4', '#244a90', '#ffc79a', 0, 1, 1.0),
  K(20.4, '#1f2c66', '#d86a5a', '#ff8a5a', 0.9, '#6a70a8', '#3a3040', 0.62, '#a8607a', '#2a7a98', '#142c5c', '#c9708a', 0.35, 0.6, 1.0),
  K(21.4, '#0b1430', '#23305e', '#8fa8ff', 0.85, '#33477f', '#141a28', 0.8, '#1c2a55', '#18587a', '#081d38', '#33426a', 0.9, 0.3, 1.0),
  K(24, '#070d24', '#14244a', '#8fa8ff', 0.9, '#33477f', '#141a28', 0.8, '#14244a', '#16506e', '#071b33', '#2b3a5e', 1, 0.3, 1.0)
];
const cur = K(0, '#000', '#000', '#000', 0, '#000', '#000', 0, '#000', '#000', '#000', '#000', 0, 0, 1);
function sampleKeys(h) {
  h = ((h % 24) + 24) % 24;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].h <= h) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = clamp((h - a.h) / (b.h - a.h), 0, 1);
  for (const k of ['zen', 'hor', 'sun', 'hemiS', 'hemiG', 'fog', 'wS', 'wD', 'cloud']) cur[k].lerpColors(a[k], b[k], t);
  for (const k of ['sunI', 'hemiI', 'stars', 'glit', 'exp']) cur[k] = lerp(a[k], b[k], t);
  return cur;
}
export function sunDirection(h, out) {
  const phi = ((h - 5) / 16) * Math.PI;
  return out.set(Math.cos(phi), Math.sin(phi) * 0.95, 0.42 * Math.sin(phi) + 0.28).normalize();
}
const MOON = new THREE.Vector3(-0.45, 0.62, -0.5).normalize();

function buildTerrain() {
  const nx = 230;
  const nz = 190;
  const { x0, x1, z0, z1 } = BOUNDS;
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz);
  geo.rotateX(-Math.PI / 2);
  geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const p = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    let h = groundH(x, z);
    // края карты уходят под воду, чтобы земля не обрывалась в пустоту
    const taper = Math.min(sstep(x1 - 2, x1 - 45, x), sstep(x0 + 2, x0 + 30, x), sstep(z0 + 2, z0 + 20, z));
    if (h > -2) h = lerp(-2, h, taper);
    p.setY(i, h);
    uv.setXY(i, x / 6.5, z / 6.5);
  }
  geo.computeVertexNormals();
  const n = geo.attributes.normal;
  const colors = new Float32Array(p.count * 3);
  const C = (hex) => new THREE.Color(hex);
  const sand = C('#f2e2b3');
  const sandWet = C('#e6d6a6');
  const seabed = C('#9db9ad');
  const grassA = C('#74c44e');
  const grassB = C('#5aae44');
  const grassC = C('#96d466');
  const rockA = C('#8d95a1');
  const rockB = C('#a7adb7');
  const path = C('#dccb93');
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const ny = n.getY(i);
    const nz1 = fbm2(x * 0.11, z * 0.11, 3);
    const nz2 = fbm2(x * 0.5 + 9, z * 0.5 + 4, 2);
    const d = z - shoreZ(x);
    const isl = Math.hypot(x - ISLAND.x, z - ISLAND.z) < 40;
    if (y < -0.12) {
      c.lerpColors(sandWet, seabed, sstep(-0.3, -8, y));
      if (ny < 0.8) c.lerp(rockA, clamp((0.8 - ny) * 2.2, 0, 0.8));
      c.multiplyScalar(0.93 + nz2 * 0.12);
    } else if (capeDist(x, z) < CAPE.r + 3.2 && d < 1) {
      c.lerpColors(rockA, rockB, nz2).multiplyScalar(0.92 + nz1 * 0.14);
    } else if (ny < (isl ? 0.74 : 0.5)) {
      c.lerpColors(rockA, rockB, nz2).multiplyScalar((0.84 + nz1 * 0.22) * (0.94 + 0.08 * Math.sin(y * 2.4 + nz1 * 5)));
    } else if (y < 0.85 + nz1 * 0.5 && !isl) {
      c.lerpColors(sand, sandWet, sstep(0.5, -0.1, y)).multiplyScalar(0.95 + nz2 * 0.08);
    } else {
      c.lerpColors(grassA, grassB, sstep(0.3, 0.7, nz1));
      c.lerp(grassC, sstep(0.55, 0.9, nz2) * 0.5);
      if (isl && ny < 0.9) c.lerp(rockA, clamp((0.9 - ny) * 3, 0, 0.7));
      else if (!isl && ny < 0.64) c.lerp(rockA, clamp((0.64 - ny) * 4, 0, 0.6));
      if (x > -56 && x < 49 && d > 2.2 && d < 14) c.lerp(path, 0.8 * Math.exp(-(((d - 7.6) / 1.5) ** 2)) * (0.75 + 0.25 * nz2));
      if (d > 0 && d < 4.2) c.lerp(sand, sstep(4.2, 2.2, d) * 0.85);
    }
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const m = new THREE.Mesh(geo, patchSurface(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96 }), { terrain: true }));
  m.receiveShadow = true;
  return m;
}

const SKY_VERT = /* glsl */ `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`;
const SKY_FRAG = /* glsl */ `
uniform vec3 uZen, uHor, uSunDir, uSunCol, uMoonDir; uniform float uStars, uTime; uniform sampler2D uDet; varying vec3 vDir;
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
void main(){
  vec3 d = normalize(vDir);
  float y = max(d.y, 0.0);
  vec3 c = mix(uHor, uZen, pow(y, 0.5));
  c = mix(c, uHor * 1.06, exp(-y * 11.0) * 0.6);
  float sd = max(dot(d, uSunDir), 0.0);
  float up = smoothstep(-0.06, 0.03, uSunDir.y);
  c += uSunCol * (smoothstep(0.9994, 0.9997, sd) * 9.0 + pow(sd, 220.0) * 0.9 + pow(sd, 9.0) * 0.16) * up;
  // перистые облака высоко в небе: тонкие вытянутые полосы, подсвеченные у солнца
  if (d.y > 0.02) {
    vec2 cu = d.xz / (d.y + 0.18);
    float w1 = texture2D(uDet, cu * vec2(0.05, 0.11) + uTime * vec2(0.0011, 0.0004)).r;
    float w2 = texture2D(uDet, cu * vec2(0.13, 0.31) - uTime * vec2(0.0007, 0.0002)).a;
    float cir = smoothstep(0.5, 0.78, w1 * 0.62 + w2 * 0.5) * smoothstep(0.02, 0.3, d.y) * (0.5 + 0.5 * w2);
    vec3 cc = mix(uHor, vec3(1.0), 0.75) + uSunCol * pow(sd, 6.0) * 0.5 * up;
    c = mix(c, cc, cir * 0.42 * (1.0 - 0.75 * uStars));
  }
  float md = max(dot(d, uMoonDir), 0.0);
  c += vec3(0.85, 0.9, 1.0) * (smoothstep(0.9990, 0.9993, md) * 1.6 + pow(md, 60.0) * 0.12) * uStars;
  vec3 gp = d * 330.0; vec3 g = floor(gp);
  float st = step(0.9965, hash(g)) * smoothstep(0.42, 0.08, length(fract(gp) - 0.5)) * (0.65 + 0.35 * sin(uTime * 2.0 + hash(g + 3.0) * 30.0)) * 1.6;
  c += vec3(st) * uStars * smoothstep(0.02, 0.25, d.y);
  if (d.y < 0.0) c = mix(c, uHor * 0.9, min(1.0, -d.y * 6.0));
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/**
 * Кучевое облако с объёмом: купол из шаров, свет слева-сверху, холодная тень снизу, плоское дно.
 * Высота купола считается в массив, из неё — нормали и свет; так облако выглядит лепным, а не плоским пятном.
 */
function cloudTexture(seed) {
  const W = 512;
  const H = 256;
  return canvasTex(W, H, (g) => {
    const r = rng(seed);
    const base = H - 52;
    const puffs = [];
    const n = 15 + Math.floor(r() * 9);
    for (let i = 0; i < n; i++) {
      const t = r();
      const k = Math.sin(t * Math.PI);
      const rad = 22 + k * (28 + r() * 36) + r() * 10;
      puffs.push([70 + t * (W - 140), base - rad * (0.3 + r() * 0.5) - k * r() * 50, rad]);
    }
    const hf = new Float32Array(W * H);
    for (const [px, py, pr] of puffs) {
      const x0 = Math.max(0, Math.floor(px - pr));
      const x1 = Math.min(W - 1, Math.ceil(px + pr));
      const y0 = Math.max(0, Math.floor(py - pr));
      const y1 = Math.min(base, Math.ceil(py + pr));
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          const q = pr * pr - (x - px) * (x - px) - (y - py) * (y - py);
          if (q <= 0) continue;
          const v = Math.sqrt(q) * (0.9 + 0.2 * fbm2(x * 0.045 + seed, y * 0.045, 2));
          if (v > hf[y * W + x]) hf[y * W + x] = v;
        }
    }
    const img = g.createImageData(W, H);
    const d = img.data;
    for (let y = 2; y < H - 2; y++)
      for (let x = 2; x < W - 2; x++) {
        const h = hf[y * W + x];
        if (h <= 0) continue;
        let nx = -(hf[y * W + x + 2] - hf[y * W + x - 2]) / 4;
        let ny = -(hf[(y + 2) * W + x] - hf[(y - 2) * W + x]) / 4;
        const l = Math.hypot(nx, ny, 1);
        nx /= l;
        ny /= l;
        const lit = clamp(nx * -0.5 + ny * -0.66 + 0.56 / l, 0, 1);
        const up = clamp((base - y) / 80, 0, 1);
        const v = (0.42 + 0.58 * lit) * (0.66 + 0.34 * up);
        const k4 = (y * W + x) * 4;
        // свет — чуть тёплый белый, тень — голубовато-серая
        d[k4] = 255 * (0.56 + 0.44 * v);
        d[k4 + 1] = 255 * (0.64 + 0.36 * v);
        d[k4 + 2] = 255 * (0.78 + 0.22 * v);
        d[k4 + 3] = 255 * clamp(h / 9, 0, 1) * clamp((base - y) / 6, 0, 1);
      }
    g.putImageData(img, 0, 0);
    // лёгкая дымка по краям: тот же рисунок, размытый, под низ
    g.globalCompositeOperation = 'destination-over';
    g.globalAlpha = 0.55;
    g.filter = 'blur(7px)';
    g.drawImage(g.canvas, 0, 0);
    g.filter = 'none';
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  });
}

export class World {
  constructor() {
    const scene = (this.scene = new THREE.Scene());
    scene.fog = new THREE.Fog('#a9dcff', 170, 1700);
    this.terrain = buildTerrain();
    scene.add(this.terrain);
    this.water = createWater();
    scene.add(this.water.mesh);
    // фактура поверхностей и свет на дне — общие для рельефа и всех построек
    surfaceU.uDet.value = detailTexture(isTouch() ? 512 : 1024);
    surfaceU.uCaust.value = this.water.uniforms.uCaustic.value;

    this.skyU = {
      uZen: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color() },
      uMoonDir: { value: MOON.clone() }, uStars: { value: 0 }, uTime: { value: 0 }, uDet: surfaceU.uDet
    };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.ShaderMaterial({ uniforms: this.skyU, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false }));
    sky.frustumCulled = false;
    sky.renderOrder = -10;
    scene.add(sky);
    this.sky = sky;

    // облака в два кольца: ближние крупные и дальние у горизонта, плывут с разной скоростью
    this.clouds = new THREE.Group();
    this.cloudsFar = new THREE.Group();
    this.cloudMat = [];
    this.cloudList = [];
    const cr = rng(77);
    const texs = [1, 2, 3, 4, 5].map((n) => cloudTexture(n));
    const N1 = 9;
    const N2 = 12;
    for (let i = 0; i < N1 + N2; i++) {
      const far = i >= N1;
      const map = texs[i % texs.length].clone(); // у каждого облака свой разворот рисунка: свет — со стороны солнца
      map.needsUpdate = true;
      const mat = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, fog: false, opacity: far ? 0.9 : 0.97 });
      const a = (i / (far ? N2 : N1)) * TAU + cr() * 0.4;
      const dist = far ? 1500 + cr() * 300 : 820 + cr() * 420;
      const w = far ? 300 + cr() * 260 : 400 + cr() * 380;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.5), mat);
      m.position.set(Math.cos(a) * dist, far ? 100 + cr() * 110 : 200 + cr() * 330, Math.sin(a) * dist);
      m.lookAt(0, m.position.y * 0.35, 0);
      m.renderOrder = far ? -6 : -5;
      (far ? this.cloudsFar : this.clouds).add(m);
      this.cloudMat.push(mat);
      this.cloudList.push(m);
    }
    scene.add(this.cloudsFar, this.clouds);

    this.hemi = new THREE.HemisphereLight('#d6ecff', '#c4a873', 1);
    scene.add(this.hemi);
    const sun = (this.sun = new THREE.DirectionalLight('#fff6e6', 3));
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -44;
    sc.right = sc.top = 44;
    sc.near = 1;
    sc.far = 260;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.05;
    scene.add(sun, sun.target);

    this.scenery = buildScenery(scene);
    if (FOAM_SPOTS.length) scene.add(createFoamRings(FOAM_SPOTS, this.water.uniforms));
    this.sunDir = new THREE.Vector3(0, 1, 0);
    this.night = 0;
    this.hours = 12;
    this.exposure = 1;
    this.setClock(12);
  }

  /** Освещение на заданный час суток. */
  setClock(h) {
    this.hours = h;
    const k = sampleKeys(h);
    const dayLight = h >= 5 && h < 21;
    sunDirection(h, this.sunDir);
    const dir = dayLight ? this.sunDir : MOON;
    const fadeLow = dayLight ? sstep(0.0, 0.12, this.sunDir.y) : 1;
    this.sun.color.copy(k.sun);
    this.sun.intensity = k.sunI * (0.25 + 0.75 * fadeLow);
    this.lightDir = dir;
    this.hemi.color.copy(k.hemiS);
    this.hemi.groundColor.copy(k.hemiG);
    this.hemi.intensity = k.hemiI;
    this.scene.fog.color.copy(k.fog);
    const s = this.skyU;
    s.uZen.value.copy(k.zen);
    s.uHor.value.copy(k.hor);
    s.uSunDir.value.copy(this.sunDir);
    s.uSunCol.value.copy(k.sun);
    s.uStars.value = k.stars;
    const w = this.water.uniforms;
    w.uShallow.value.copy(k.wS);
    w.uDeep.value.copy(k.wD);
    w.uSkyZen.value.copy(k.zen);
    w.uSkyHor.value.copy(k.hor);
    w.uSunDir.value.copy(dir);
    w.uSunCol.value.copy(k.sun);
    w.uFogCol.value.copy(k.fog);
    w.uGlitter.value = k.glit;
    surfaceU.uSunC.value.copy(k.sun);
    surfaceU.uWaterS.value.copy(k.wS);
    surfaceU.uWaterD.value.copy(k.wD);
    surfaceU.uCaustK.value = k.glit * (dayLight ? 1 : 0.35);
    w.uFogNear.value = this.scene.fog.near;
    w.uFogFar.value = this.scene.fog.far;
    for (const m of this.cloudMat) m.color.copy(k.cloud);
    // рисунок облака отражаем так, чтобы светлый бок смотрел на солнце (или луну)
    for (const c of this.cloudList) {
      c.updateWorldMatrix(true, false);
      const e = c.matrixWorld.elements; // первый столбец — «вправо» у облака
      const flip = e[0] * dir.x + e[2] * dir.z > 0;
      const map = c.material.map;
      map.repeat.x = flip ? -1 : 1;
      map.offset.x = flip ? 1 : 0;
    }
    surfaceU.uCloudK.value = dayLight ? 1 : 0.35;
    this.night = clamp(k.stars * 1.15, 0, 1);
    this.exposure = k.exp;
    this.scenery.setNight(this.night, 1 - this.night);
  }

  update(dt, t, camera) {
    this.water.uniforms.uTime.value = t;
    surfaceU.uTimeS.value = t;
    this.skyU.uTime.value = t;
    this.sky.position.copy(camera.position);
    this.sky.scale.setScalar(2500);
    this.clouds.rotation.y = t * 0.0019;
    this.clouds.position.set(camera.position.x, 0, camera.position.z);
    this.cloudsFar.rotation.y = t * 0.0008;
    this.cloudsFar.position.set(camera.position.x, 0, camera.position.z);
    // тени следуют за игроком, шагом в 2 метра — чтобы не «плыли»
    const tx = Math.round(camera.position.x / 2) * 2;
    const tz = Math.round((camera.position.z - 8) / 2) * 2;
    this.sun.target.position.set(tx, 0, tz);
    this.sun.position.set(tx + this.lightDir.x * 120, this.lightDir.y * 120, tz + this.lightDir.z * 120);
    this.scenery.update(dt, t);
  }
}

/** Мини-карта: вид бухты сверху, рисуется один раз. */
export function drawMinimap(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  const { x0, x1, z0, z1 } = MAP_VIEW;
  const col = (r, gg, b, i) => {
    img.data[i] = r;
    img.data[i + 1] = gg;
    img.data[i + 2] = b;
    img.data[i + 3] = 255;
  };
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      const x = x0 + ((i + 0.5) / size) * (x1 - x0);
      const z = z0 + ((j + 0.5) / size) * (z1 - z0);
      const h = groundH(x, z);
      const k = (j * size + i) * 4;
      const n = fbm2(x * 0.2, z * 0.2, 2);
      if (h < -0.1) {
        const t = sstep(-0.1, -11, h);
        col(lerp(72, 16, t), lerp(224, 112, t), lerp(214, 196, t), k);
      } else if (h < 0.8) col(240, 224, 176, k);
      else {
        const hx = groundH(x + 1.2, z) - h;
        const hz = groundH(x, z + 1.2) - h;
        const steep = Math.hypot(hx, hz);
        if (steep > 1.3) col(150 + n * 20, 158 + n * 20, 170 + n * 20, k);
        else col(96 + n * 36 + hx * 30, 188 + n * 30 + hx * 30, 78 + n * 20, k);
      }
    }
  g.putImageData(img, 0, 0);
  const X = (x) => ((x - x0) / (x1 - x0)) * size;
  const Z = (z) => ((z - z0) / (z1 - z0)) * size;
  g.fillStyle = '#c58a4e';
  g.strokeStyle = '#7a5230';
  g.lineWidth = 1;
  for (const d of DECKS) {
    g.fillRect(X(d.x0), Z(d.z0), X(d.x1) - X(d.x0), Z(d.z1) - Z(d.z0));
    g.strokeRect(X(d.x0), Z(d.z0), X(d.x1) - X(d.x0), Z(d.z1) - Z(d.z0));
  }
  g.fillStyle = '#b5533c';
  g.fillRect(X(-13), Z(10.4), X(-7.2) - X(-13), Z(15.4) - Z(10.4));
  g.fillStyle = '#fff';
  g.strokeStyle = '#d8402f';
  g.lineWidth = 2.5;
  g.beginPath();
  g.arc(X(LIGHTHOUSE.x), Z(LIGHTHOUSE.z), 4.5, 0, TAU);
  g.fill();
  g.stroke();
  g.fillStyle = '#8d95a1';
  g.beginPath();
  g.ellipse(X(ARCH.x), Z(ARCH.z), 4, 9, -0.35, 0, TAU);
  g.fill();
  return c;
}
