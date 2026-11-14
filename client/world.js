// Мир «Солнечной бухты»: рельеф, небо, облака, свет по времени суток — и сборка всего остального.
import * as THREE from 'three';
import { clamp, lerp, sstep, damp, fbm2, canvasTex, rng, TAU, isTouch } from './util.js';
import { groundH, shoreZ, BOUNDS, WORLD, PALM, WRECK, palmR, capeDist, CAPE, ISLAND, islandR, MAP_VIEW, DECKS, DECK_Y, LIGHTHOUSE, ARCH, MOORINGS, SKERRIES, HAS, deckAt } from './terrain.js';
import { LOC_ID, LOC } from './loc/id.js';
import { lakeTint, buildLakeTerrain } from './loc/lake-world.js';
import { buildMist } from './loc/lake-nature.js';
import { createWater, createFoamRings, sea } from './water.js';
import { FAR_ISLES, farH, farWood } from './farisles.js';
import { buildScenery, FOAM_SPOTS } from './scenery.js';
import { patchSurface, surfaceU, detailTexture, loadPaint, detail } from './surface.js';
import { ENV } from './envmodels.js';
import { GrassField } from './grass.js';
import { Seabed } from './seabed.js';
import { Flags, SunRays } from './flags.js';
import { Rain } from './weather.js';
import { PAL } from './palette.js';
import { NightFx } from './nightfx.js';

// ключевые часы суток (цвета неба, солнца, воды) — в палитре: palette.js
const cur = { h: 0, sunI: 0, hemiI: 0, stars: 0, glit: 0, exp: 1 };
for (const k of ['zen', 'hor', 'sun', 'hemiS', 'hemiG', 'fog', 'wS', 'wD', 'cloud']) cur[k] = new THREE.Color();
const _ov = new THREE.Color();
const _c1 = new THREE.Color();
function sampleKeys(h) {
  h = ((h % 24) + 24) % 24;
  const KEYS = PAL.keys;
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
// Луна встаёт на востоке, когда садится солнце (21:00), идёт невысоко над морем на севере и к рассвету (5:00) садится
// на западе: с причала она видна над водой, и лунная дорожка тянется к ногам. Днём её не видно — она ждёт у горизонта.
const MOON = new THREE.Vector3(0, 0.29, -0.96).normalize();
export function moonDirection(h, out) {
  const hh = ((h % 24) + 24) % 24;
  const u = hh >= 21 ? (hh - 21) / 8 : hh < 5 ? (hh + 3) / 8 : hh < 13 ? 1 : 0;
  const phi = u * Math.PI;
  const [low, arc] = LOC.moon || [0.11, 0.13]; // над морем луна идёт низко; в горах — выше хребта
  return out.set(Math.cos(phi) * 0.82, low + arc * Math.sin(phi), -(0.38 + 0.42 * Math.sin(phi))).normalize();
}

const TERRAIN_MAT = patchSurface(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96 }), { terrain: true });
const C = (hex) => new THREE.Color(hex);
const sand = C('#f2e2b3');
const sandWet = C('#e6d6a6');
const sandWhite = C('#fbf3d6');
const seabed = C('#9db9ad');
// трава — жёлто-зелёная, в тон кронам и мху моделей (раньше была чисто зелёной и рядом с ними смотрелась кислотной)
const grassA = C('#88b752');
const grassB = C('#70a045');
const grassC = C('#a9cb66');
const dune = C('#b9d27a');
// камень рельефа — в тон утёсам-моделям: тёплый серый
const rockA = C('#827f79');
const rockB = C('#9a968e');
const path = C('#dccb93');
/**
 * Цвет земли в точке: песок, трава, камень, дно. ny — насколько склон пологий (1 — ровно).
 * w — что это за поверхность, для рисованных текстур (surface.js): [трава, камень, песок, тропа].
 */
function bayTint(c, x, y, z, ny, w) {
  const nz1 = fbm2(x * 0.11, z * 0.11, 3);
  const nz2 = fbm2(x * 0.5 + 9, z * 0.5 + 4, 2);
  const pr = palmR(x, z);
  w[0] = w[1] = w[3] = 0;
  w[2] = 1;
  if (pr < 3.4) {
    // Пальмовый остров: белый песок, в середине — редкая трава на дюне; под водой песок светлый — отмель бирюзовая
    if (y < -0.1) c.lerpColors(sandWhite, seabed, sstep(-2.5, -11, y)).multiplyScalar(0.95 + nz2 * 0.1);
    else {
      c.lerpColors(sandWet, sandWhite, sstep(-0.1, 0.5, y)).multiplyScalar(0.95 + nz2 * 0.08);
      const g = sstep(1.25, 2.2, y + (nz1 - 0.5) * 0.9) * 0.8;
      c.lerp(dune, g);
      w[0] = g;
      w[2] = 1 - g;
    }
    return;
  }
  const d = z - shoreZ(x);
  const isl = Math.hypot(x - ISLAND.x, z - ISLAND.z) < 40;
  const inBay = x > BOUNDS.x0 && x < BOUNDS.x1 && z > BOUNDS.z0 && z < BOUNDS.z1;
  if (y < -0.12 || !inBay) {
    c.lerpColors(sandWet, seabed, sstep(-0.3, -8, y));
    if (ny < 0.8) {
      const k = clamp((0.8 - ny) * 2.2, 0, 0.8);
      c.lerp(rockA, k);
      w[1] = k;
      w[2] = 1 - k;
    }
    c.multiplyScalar(0.93 + nz2 * 0.12);
  } else if (capeDist(x, z) < CAPE.r + 3.2 && d < 1) {
    c.lerpColors(rockA, rockB, nz2).multiplyScalar(0.92 + nz1 * 0.14);
    w[1] = 1;
    w[2] = 0;
  } else if (ny < (isl ? 0.74 : 0.5)) {
    c.lerpColors(rockA, rockB, nz2).multiplyScalar((0.84 + nz1 * 0.22) * (0.94 + 0.08 * Math.sin(y * 2.4 + nz1 * 5)));
    w[1] = 1;
    w[2] = 0;
  } else if (y < 0.85 + nz1 * 0.5 && !isl) {
    c.lerpColors(sand, sandWet, sstep(0.5, -0.1, y)).multiplyScalar(0.95 + nz2 * 0.08);
  } else {
    c.lerpColors(grassA, grassB, sstep(0.3, 0.7, nz1));
    c.lerp(grassC, sstep(0.55, 0.9, nz2) * 0.5);
    w[0] = 1;
    w[2] = 0;
    // на склонах камень проступает уже в шейдере — по каждой точке, с рваной границей; здесь цвет травы не трогаем
    if (x > -56 && x < 49 && d > 2.2 && d < 14) {
      const k = 0.8 * Math.exp(-(((d - 7.6) / 1.5) ** 2)) * (0.75 + 0.25 * nz2);
      c.lerp(path, k);
      w[3] = k;
      w[0] = 1 - k;
    }
    if (d > 0 && d < 4.2) {
      const k = sstep(4.2, 2.2, d) * 0.85;
      c.lerp(sand, k);
      w[2] = k;
      w[0] *= 1 - k;
      w[3] *= 1 - k;
    }
  }
}
/** Краски земли — у каждой локации свои. */
const groundTint = LOC_ID === 'lake' ? lakeTint : bayTint;
const _w = [0, 0, 1, 0];
/** Цвет земли в точке и сколько там травы (0…1) — для пучков травы (grass.js). На склонах, где проступает камень, травы нет. */
function grassTint(x, z, c) {
  const e = 0.7;
  const dx = groundH(x + e, z) - groundH(x - e, z);
  const dz = groundH(x, z + e) - groundH(x, z - e);
  const ny = (2 * e) / Math.hypot(dx, 2 * e, dz);
  if (ny < 0.78) return 0;
  groundTint(c, x, groundH(x, z), z, ny, _w);
  return _w[0];
}
/** Кусок рельефа: сетка по groundH с цветом по вершинам. */
function buildGround(x0, x1, z0, z1, nx, nz) {
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz);
  geo.rotateX(-Math.PI / 2);
  geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, groundH(p.getX(i), p.getZ(i)));
  geo.deleteAttribute('uv');
  geo.computeVertexNormals();
  const n = geo.attributes.normal;
  const colors = new Float32Array(p.count * 3);
  const ground = new Float32Array(p.count * 4);
  const c = new THREE.Color();
  const w = [0, 0, 1, 0];
  for (let i = 0; i < p.count; i++) {
    groundTint(c, p.getX(i), p.getY(i), p.getZ(i), n.getY(i), w);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    ground.set(w, i * 4);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aGround', new THREE.BufferAttribute(ground, 4));
  const m = new THREE.Mesh(geo, TERRAIN_MAT);
  m.receiveShadow = true;
  m.userData.grid = { x0, x1, z0, z1, nx, nz };
  return m;
}
/**
 * Тень-пятно под каждым деревом и кустом — прямо в цвете земли. У дальних деревьев настоящей тени нет,
 * и без пятна они «висят» над лугом, как наклейки; с пятном стоят на земле, а трава под кронами темнее, как и должна.
 */
function shadeUnderTrees(terrain) {
  const CROWN = { 'env-pine': 0.25, 'env-oak': 0.42, 'env-birch': 0.3, 'env-bush': 0.6, 'env-palm': 0.3 }; // радиус кроны в долях высоты
  for (const m of terrain.children) {
    const g = m.userData.grid;
    if (!g) continue;
    const col = m.geometry.attributes.color;
    const k = new Float32Array(col.count).fill(1);
    const dx = (g.x1 - g.x0) / g.nx;
    const dz = (g.z1 - g.z0) / g.nz;
    for (const id in CROWN)
      for (const t of ENV.flora[id] || []) {
        if (t.x < g.x0 || t.x > g.x1 || t.z < g.z0 || t.z > g.z1) continue;
        const R = Math.max(1.6, CROWN[id] * t.s * 1.3);
        const i0 = Math.max(0, Math.floor((t.x - R - g.x0) / dx));
        const i1 = Math.min(g.nx, Math.ceil((t.x + R - g.x0) / dx));
        const j0 = Math.max(0, Math.floor((t.z - R - g.z0) / dz));
        const j1 = Math.min(g.nz, Math.ceil((t.z + R - g.z0) / dz));
        for (let j = j0; j <= j1; j++)
          for (let i = i0; i <= i1; i++) {
            const d = Math.hypot(g.x0 + i * dx - t.x, g.z0 + j * dz - t.z) / R;
            if (d >= 1) continue;
            const v = 1 - (id === 'env-bush' ? 0.2 : 0.3) * (1 - d * d) ** 1.5;
            const n = j * (g.nx + 1) + i;
            if (v < k[n]) k[n] = v;
          }
      }
    for (let i = 0; i < col.count; i++) if (k[i] < 1) col.setXYZ(i, col.getX(i) * k[i], col.getY(i) * k[i], col.getZ(i) * k[i]);
    col.needsUpdate = true;
  }
}
const forestFloor = C('#5f9440');
/**
 * Дальний остров (farisles.js) тем же материалом, что и большой: трава, камень на крутых склонах, песок у воды.
 * Сетка — квадрат вокруг острова; то, что целиком под водой глубже двух метров, не рисуется: вдали вода непрозрачна.
 */
function buildFarIsle(I) {
  const R = I.R * 1.38;
  const n = Math.ceil((2 * R) / I.cell);
  const geo = new THREE.PlaneGeometry(2 * R, 2 * R, n, n);
  geo.rotateX(-Math.PI / 2);
  geo.translate(I.x, 0, I.z);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, Math.max(-5, farH(p.getX(i), p.getZ(i))));
  geo.deleteAttribute('uv');
  geo.computeVertexNormals();
  const nor = geo.attributes.normal;
  const colors = new Float32Array(p.count * 3);
  const ground = new Float32Array(p.count * 4);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ny = nor.getY(i);
    // пятна крупнее, чем на большом острове: сетка здесь в шесть–восемь метров, мелкий шум на ней рябит
    const n1 = fbm2(x * 0.021 + I.seed, z * 0.021, 3);
    const n2 = fbm2(x * 0.06 + 9, z * 0.06 + 4 + I.seed, 2);
    let w0 = 0, w1 = 0, w2 = 1;
    if (y < -0.1) c.lerpColors(sandWet, seabed, sstep(-0.3, -4.5, y)).multiplyScalar(0.94 + n2 * 0.1);
    else if (ny < 0.62) {
      c.lerpColors(rockA, rockB, n2).multiplyScalar(0.86 + n1 * 0.22);
      w1 = 1;
      w2 = 0;
    } else if (y < 0.9 + n1 * 0.9 && ny > 0.84) c.lerpColors(sandWet, sandWhite, sstep(-0.1, 0.6, y)).multiplyScalar(0.95 + n2 * 0.08);
    else {
      // луга дальних островов чуть темнее и спокойнее, чем у большого: издали сплошной яркий луг смотрелся кислотным
      c.lerpColors(grassA, grassB, sstep(0.25, 0.65, n1)).multiplyScalar(0.9);
      c.lerp(grassC, sstep(0.6, 0.9, n2) * 0.3);
      // под лесом трава темнее: кроны стоят не на ярком лугу, а на своей тени
      c.lerp(forestFloor, 0.2 + farWood(I, x, z) * 0.6);
      w0 = 1;
      w2 = 0;
    }
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    ground[i * 4] = w0;
    ground[i * 4 + 1] = w1;
    ground[i * 4 + 2] = w2;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aGround', new THREE.BufferAttribute(ground, 4));
  const idx = geo.index.array;
  const keep = [];
  for (let t = 0; t < idx.length; t += 3) if (p.getY(idx[t]) > -2 || p.getY(idx[t + 1]) > -2 || p.getY(idx[t + 2]) > -2) keep.push(idx[t], idx[t + 1], idx[t + 2]);
  geo.setIndex(keep);
  geo.computeBoundingSphere();
  const m = new THREE.Mesh(geo, TERRAIN_MAT);
  m.name = 'far-' + I.id;
  return m;
}
function buildTerrain() {
  const { x0, x1, z0, z1 } = BOUNDS;
  const g = new THREE.Group();
  // большой остров с бухтой — подробно
  g.add(buildGround(x0, x1, z0, z1, 230, 230));
  // Пальмовый остров с отмелью и отмель с кораблём — отдельными кусками (без нахлёста на большой остров)
  g.add(buildGround(BOUNDS.x1, PALM.x + 126, PALM.z - 90, PALM.z + 90, 142, 112));
  g.add(buildGround(WRECK.x - 60, WRECK.x + 60, WRECK.z - 60, BOUNDS.z0, 50, 44));
  // отмели под скалами в открытом море
  for (const s of SKERRIES) g.add(buildGround(s.x - s.r * 2.3, s.x + s.r * 2.3, s.z - s.r * 2.3, s.z + s.r * 2.3, 44, 44));
  // ровное дно под всем остальным морем: без него сквозь воду за краем подробного рельефа просвечивает пустота
  const far = new THREE.PlaneGeometry(4000, 4000);
  far.rotateX(-Math.PI / 2);
  far.translate(0, -14.75, 0);
  const col = new Float32Array(12);
  const c = new THREE.Color().copy(seabed).multiplyScalar(0.98);
  for (let i = 0; i < 4; i++) col.set([c.r, c.g, c.b], i * 3);
  far.setAttribute('color', new THREE.BufferAttribute(col, 3));
  far.setAttribute('aGround', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]), 4));
  far.deleteAttribute('uv');
  g.add(new THREE.Mesh(far, TERRAIN_MAT));
  // дальние острова за краем моря
  for (const I of FAR_ISLES) g.add(buildFarIsle(I));
  return g;
}

const SKY_VERT = /* glsl */ `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`;
const SKY_FRAG = /* glsl */ `
uniform vec3 uZen, uHor, uSunDir, uSunCol, uMoonDir, uFogC; uniform float uStars, uTime, uCover, uFogK; uniform sampler2D uDet; varying vec3 vDir;
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
void main(){
  vec3 d = normalize(vDir);
  float y = max(d.y, 0.0);
  vec3 c = mix(uHor, uZen, pow(y, 0.5));
  c = mix(c, uHor * 1.06, exp(-y * 11.0) * 0.6);
  float sd = max(dot(d, uSunDir), 0.0);
  float up = smoothstep(-0.06, 0.03, uSunDir.y);
  // за сплошными облаками диска не видно — только светлое пятно там, где солнце
  c += uSunCol * ((smoothstep(0.9994, 0.9997, sd) * 9.0 + pow(sd, 220.0) * 0.9) * (1.0 - uCover) * (1.0 - uCover) + pow(sd, 9.0) * 0.16 * (1.0 - 0.6 * uCover)) * up;
  // перистые облака высоко в небе: тонкие вытянутые полосы, подсвеченные у солнца
  if (d.y > 0.02) {
    vec2 cu = d.xz / (d.y + 0.18);
    float w1 = texture2D(uDet, cu * vec2(0.05, 0.11) + uTime * vec2(0.0011, 0.0004)).r;
    float w2 = texture2D(uDet, cu * vec2(0.13, 0.31) - uTime * vec2(0.0007, 0.0002)).a;
    float cir = smoothstep(0.5, 0.78, w1 * 0.62 + w2 * 0.5) * smoothstep(0.02, 0.3, d.y) * (0.5 + 0.5 * w2);
    vec3 cc = mix(uHor, vec3(1.0), 0.75) + uSunCol * pow(sd, 6.0) * 0.5 * up;
    c = mix(c, cc, cir * 0.42 * (1.0 - 0.75 * uStars) * (1.0 - uCover));
    // пасмурно: небо затянуто — серый слой с тёмными и светлыми разводами, которые медленно плывут
    if (uCover > 0.002) {
      float l1 = texture2D(uDet, cu * 0.021 + uTime * vec2(0.0019, 0.0008)).r;
      float l2 = texture2D(uDet, cu * 0.058 - uTime * vec2(0.0013, 0.0005)).a;
      float lay = 0.74 + 0.5 * (l1 * 0.62 + l2 * 0.38);
      c *= mix(1.0, lay, uCover * smoothstep(0.02, 0.22, d.y));
    }
  }
  // месяц: диск с тенью сбоку, тесный ореол и широкое мягкое свечение вокруг
  float md = max(dot(d, uMoonDir), 0.0);
  float moon = pow(md, 900.0) * 0.3 + pow(md, 70.0) * 0.13;
  if (md > 0.995) {
    vec3 mr = normalize(cross(vec3(0.0, 1.0, 0.0), uMoonDir));
    vec2 q = vec2(dot(d, mr), dot(d, cross(uMoonDir, mr))) / 0.046;
    float disc = 1.0 - smoothstep(0.9, 1.0, length(q));
    moon += disc * mix(0.06, 1.0, smoothstep(0.84, 0.97, length(q - vec2(0.44, 0.2)))) * 2.1;
  }
  c += vec3(0.86, 0.92, 1.0) * moon * uStars * (1.0 - uCover);
  // звёзды: мелкие — россыпью, крупные — редкие, мерцают каждая в своём ритме
  vec3 gp = d * 330.0; vec3 g = floor(gp);
  float sh = hash(g);
  float st = step(0.9945, sh) * smoothstep(0.42, 0.08, length(fract(gp) - 0.5)) * (0.6 + 0.4 * sin(uTime * 2.0 + hash(g + 3.0) * 30.0)) * (0.7 + 260.0 * max(sh - 0.9965, 0.0));
  c += mix(vec3(0.82, 0.88, 1.0), vec3(1.0, 0.93, 0.82), hash(g + 7.0)) * st * uStars * smoothstep(0.02, 0.25, d.y) * (1.0 - uCover);
  if (d.y < 0.0) c = mix(c, uHor * 0.9, min(1.0, -d.y * 6.0));
  // туман: у горизонта небо тонет в нём целиком, над головой — наполовину
  c = mix(c, uFogC, uFogK * mix(0.96, 0.5, smoothstep(0.0, 0.75, max(d.y, 0.0))));
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
    this.terrain = LOC_ID === 'lake' ? buildLakeTerrain(buildGround) : buildTerrain();
    scene.add(this.terrain);
    this.water = createWater();
    scene.add(this.water.mesh);
    // фактура поверхностей и свет на дне — общие для рельефа и всех построек
    surfaceU.uDet.value = detailTexture(isTouch() ? 512 : 1024);
    this.paint = loadPaint({ lite: isTouch(), offline: !!window.RYBAK_OFFLINE });
    surfaceU.uCaust.value = this.water.uniforms.uCaustic.value;

    this.skyU = {
      uZen: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color() },
      uMoonDir: { value: MOON.clone() }, uStars: { value: 0 }, uTime: { value: 0 }, uDet: surfaceU.uDet,
      uCover: { value: 0 }, uFogK: { value: 0 }, uFogC: { value: new THREE.Color() }
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
      mat.userData.op = mat.opacity;
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

    // ночные огни: лампочки гирлянд, светлячки, дорожки света на воде — их расставляет окружение
    this.nightfx = new NightFx(scene, this.water.uniforms);
    this.scenery = buildScenery(scene, this.nightfx);
    this.nightfx.build();
    shadeUnderTrees(this.terrain);
    this.grass = new GrassField(scene, grassTint, isTouch() ? { max: 3000, maxFlowers: 500 } : {});
    // дно, флаги на шестах (показывают ветер) и лучи низкого солнца
    this.seabed = new Seabed(scene);
    const STRIPES = (a, b) => [a, b, a, b, a];
    this.flags = new Flags(scene, [
      { x: -5.4, z: -26.4, y: DECK_Y, h: 3.4, len: 1.5, wide: 0.9, cols: ['#f04438', '#ffffff', '#f04438'], pennant: true }, // вымпел на конце главного пирса
      { x: -12.6, z: 5.0, y: DECK_Y, h: 3.8, len: 1.7, wide: 1.05, cols: STRIPES('#22d3ee', '#ffffff') }, // у лавки на берегу
      { x: -19.4, z: -77.6, y: DECK_Y, h: 3.2, len: 1.3, wide: 0.8, cols: ['#ffd60a', '#0e2140'], pennant: true }, // причал у маяка
      { x: 209.8, z: -193.6, y: DECK_Y, h: 3.2, len: 1.3, wide: 0.8, cols: ['#ff8a3d', '#ffffff', '#ff8a3d'], pennant: true } // Пальмовый остров
    ].filter((f) => deckAt(f.x, f.z, -0.8))); // флаг стоит только там, где на этой локации есть причал
    this.rays = new SunRays(scene);
    // утренний туман над водой — там, где он бывает (озеро)
    this.mist = LOC.wx && LOC.wx.mist ? buildMist(scene, surfaceU.uDet) : null;
    this.rings = FOAM_SPOTS.length ? createFoamRings(FOAM_SPOTS, this.water.uniforms) : null;
    if (this.rings) scene.add(this.rings);
    this.sunDir = new THREE.Vector3(0, 1, 0);
    this.rim = new THREE.Color(0, 0, 0); // кромочный свет героев: цвет и сила на этот час (hero.js)
    this.night = 0;
    this.hours = 12;
    this.exposure = 1;
    // погода: насколько затянуто небо, дождь, туман, ветер (0…1) — меняются плавно
    this.wx = { cover: 0, rain: 0, fog: 0, wind: 0.2 };
    this.wet = 0;
    this.rain = new Rain(scene);
    this.setClock(12);
  }

  /** Погода: w — { cover, rain, fog, wind } от 0 до 1. Значения подтягиваются плавно; dt = 0 — поставить сразу. */
  setWeather(w, dt = 0) {
    const c = this.wx;
    for (const k of ['cover', 'rain', 'fog', 'wind']) c[k] = dt > 0 ? damp(c[k], w[k] || 0, 0.9, dt) : w[k] || 0;
    // доски и камни намокают за четверть минуты, а сохнут больше минуты
    this.wet = dt > 0 ? damp(this.wet, c.rain, c.rain > this.wet ? 0.07 : 0.014, dt) : c.rain;
  }

  /** Утренняя дымка локации в этот час: 0…k (LOC.wx.mist в shared/locations.js). */
  mistAt(h) {
    const m = LOC.wx && LOC.wx.mist;
    if (!m) return 0;
    return m.k * sstep(m.from, m.from + 1, h) * (1 - sstep(m.to - 1.4, m.to, h));
  }
  /** Освещение на заданный час суток. */
  setClock(h) {
    this.hours = h;
    const k = sampleKeys(h);
    const kStars = k.stars; // «ночь» — по часам, а не по тому, видны ли звёзды сквозь облака
    const dayLight = h >= 5 && h < 21;
    sunDirection(h, this.sunDir);
    moonDirection(h, MOON);
    const dir = dayLight ? this.sunDir : MOON;
    // низкое светило светит слабее: солнце у горизонта, луна — пока не поднялась над островами
    const fadeLow = dayLight ? sstep(0.0, 0.12, this.sunDir.y) : sstep(0.03, 0.2, MOON.y);
    // Погода. Пасмурное небо — серое с синевой, яркость берём от неба этого часа; солнце за облаками светит вполсилы,
    // блики на воде и сетка света на дне гаснут; туман и дождь съедают даль.
    const W = this.wx;
    const cov = W.cover;
    // утренняя дымка локации складывается с погодой: над озером до девятого часа стоит туман
    const mist = this.mistAt(h);
    const fogK = Math.max(W.fog, mist);
    const lum = k.hor.r * 0.3 + k.hor.g * 0.5 + k.hor.b * 0.2;
    _ov.setRGB(lum * 0.72, lum * 0.77, lum * 0.84);
    if (cov > 0.001 || fogK > 0.001) {
      k.zen.lerp(_c1.copy(_ov).multiplyScalar(0.66), cov * 0.93);
      k.hor.lerp(_ov, cov * 0.88);
      k.fog.lerp(_c1.copy(_ov).multiplyScalar(1 + 0.12 * fogK), Math.max(cov * 0.88, fogK));
      k.sun.lerp(_c1.copy(_ov).multiplyScalar(1.25), cov * 0.55);
      k.hemiS.lerp(_ov, cov * 0.6);
      k.cloud.lerp(_c1.copy(_ov).multiplyScalar(0.92), cov * 0.85);
      _c1.setRGB(lum * 0.42, lum * 0.52, lum * 0.56);
      // вода под серым небом и в тумане теряет бирюзу
      const wk = Math.min(0.78, cov * 0.62 + fogK * 0.3);
      k.wS.lerp(_c1, wk);
      k.wD.lerp(_c1.multiplyScalar(0.62), wk * 0.9);
      k.sunI *= 1 - 0.62 * cov;
      k.hemiI *= 1 - 0.1 * cov + 0.06 * fogK;
      k.glit *= 1 - 0.86 * cov;
      k.stars *= 1 - 0.95 * Math.max(cov, fogK);
      k.exp *= 1 - 0.07 * W.rain;
    }
    this.sun.color.copy(k.sun);
    this.sun.intensity = k.sunI * (0.25 + 0.75 * fadeLow);
    this.lightDir = dir;
    // кромочный свет героев: в полдень едва заметен, при низком солнце — тёплая кайма, ночью — холодная от луны
    const lowSun = dayLight ? 1 - sstep(0.22, 0.6, this.sunDir.y) : 1;
    this.rim.copy(k.sun).multiplyScalar((dayLight ? 0.3 + 0.42 * lowSun : 0.44) * (1 - 0.6 * cov) * (1 - 0.7 * fogK) * (0.3 + 0.7 * fadeLow));
    this.hemi.color.copy(k.hemiS);
    this.hemi.groundColor.copy(k.hemiG);
    this.hemi.intensity = k.hemiI;
    this.scene.fog.color.copy(k.fog);
    // даль: ясно — 1,7 км; пасмурно чуть ближе; дождь — полкилометра; туман — полторы сотни метров
    const fk = fogK * fogK * (3 - 2 * fogK);
    this.scene.fog.near = lerp(lerp(PAL.fog.near, 30, W.rain), 3, fk);
    this.scene.fog.far = lerp(lerp(PAL.fog.far - 350 * cov, 560, W.rain), 150, fk);
    const s = this.skyU;
    s.uZen.value.copy(k.zen);
    s.uHor.value.copy(k.hor);
    s.uSunDir.value.copy(this.sunDir);
    s.uSunCol.value.copy(k.sun);
    s.uMoonDir.value.copy(MOON);
    s.uStars.value = k.stars;
    s.uCover.value = cov;
    s.uFogK.value = fogK;
    s.uFogC.value.copy(k.fog);
    const w = this.water.uniforms;
    w.uRain.value = W.rain;
    w.uLight.value = clamp(k.sunI / 2.7, 0, 1);
    w.uShallow.value.copy(k.wS);
    w.uDeep.value.copy(k.wD);
    w.uSkyZen.value.copy(k.zen);
    w.uSkyHor.value.copy(k.hor);
    w.uSunDir.value.copy(dir);
    w.uSunCol.value.copy(k.sun);
    w.uFogCol.value.copy(k.fog);
    w.uGlitter.value = k.glit;
    {
      // лунная дорожка ярче, чем дал бы ночной свет сам по себе: и блики, и мягкая полоса света под луной до горизонта
      const nk = clamp(kStars * 1.15, 0, 1);
      const [sharp, soft] = PAL.water.moonPath || [4, 42];
      w.uPath.value.set(lerp(1, sharp, nk), lerp(1, soft, nk));
    }
    const PW = PAL.water;
    w.uWat.value.set(PW.clear, PW.pathMin, PW.fres, PW.net);
    w.uWat2.value.set(PW.deepAt, PW.netDeep, PW.netTint, PW.seaDeep);
    surfaceU.uBed.value.set(PW.bedNet, PW.bedTint, PW.bedFog, PW.bedDeep);
    surfaceU.uSunC.value.copy(k.sun);
    surfaceU.uWaterS.value.copy(k.wS);
    surfaceU.uWaterD.value.copy(k.wD);
    surfaceU.uCaustK.value = k.glit * (dayLight ? 1 : 0.35);
    surfaceU.uWet.value = this.wet;
    surfaceU.uWetSky.value.copy(k.hor);
    w.uFogNear.value = this.scene.fog.near;
    w.uFogFar.value = this.scene.fog.far;
    // зыбь в открытом море — по ветру: в ясный день пологая, в дождь лодку качает всерьёз. Одно число и для картинки,
    // и для лодки с поплавком (waveH)
    sea.k = 0.55 + W.wind;
    w.uSwell.value = sea.k;
    w.uWind.value = W.wind;
    for (const m of this.cloudMat) {
      m.color.copy(k.cloud);
      m.opacity = m.userData.op * (1 - 0.45 * cov) * (1 - fogK);
    }
    // рисунок облака отражаем так, чтобы светлый бок смотрел на солнце (или луну)
    for (const c of this.cloudList) {
      c.updateWorldMatrix(true, false);
      const e = c.matrixWorld.elements; // первый столбец — «вправо» у облака
      const flip = e[0] * dir.x + e[2] * dir.z > 0;
      const map = c.material.map;
      map.repeat.x = flip ? -1 : 1;
      map.offset.x = flip ? 1 : 0;
    }
    surfaceU.uCloudK.value = (dayLight ? 1 : 0.35) * (1 - cov); // под сплошными облаками отдельных теней нет
    this.night = clamp(kStars * 1.15, 0, 1);
    this.exposure = k.exp;
    this.scenery.setNight(this.night, 1 - this.night);
    if (this.mist) this.mist.set(Math.min(1, mist * 3.8 + W.fog * 0.6) * (1 - 0.5 * W.rain), _c1.copy(k.fog).lerp(_ov.setRGB(1, 1, 1), 0.5));
    this.nightfx.setNight(this.night * (1 - 0.7 * fogK)); // в тумане огни тонут
  }

  update(dt, t, camera) {
    this.grass.setRange(detail.grass);
    this.grass.update(camera);
    if (this.kelpK !== detail.kelp) this.seabed.setDetail((this.kelpK = detail.kelp));
    this.flags.update(t, this.wx.wind);
    {
      // лучи — только когда солнце низко: на рассвете и на закате; в пасмурную погоду и в тумане их нет
      const y = this.sunDir.y;
      const day = this.hours >= 5 && this.hours < 21;
      const low = day ? sstep(0.005, 0.07, y) * (1 - sstep(0.2, 0.42, y)) : 0;
      this.rays.on = detail.rays;
      this.rays.update(camera, this.sunDir, this.sun.color, low * 0.55 * (1 - this.wx.cover * 0.85) * (1 - this.wx.fog), t);
    }
    this.water.uniforms.uTime.value = t;
    this.water.follow(camera);
    this.nightfx.update();
    if (this.mist) this.mist.update(t);
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
    this.scenery.update(dt, t, camera);
    this.rain.update(t, camera, this.wx.rain, this.wx.wind, 1 - this.night);
  }
}

/**
 * Прямоугольник той же формы, что карта бухты, в который помещается всё море: для карты, когда игрок в лодке.
 * Юг большого острова (куда лодке не доплыть) в него не входит — так море на карте крупнее.
 */
export const SEA_VIEW = (() => {
  if (!HAS.sea) return MAP_VIEW; // моря нет — карта одна
  const k = (MAP_VIEW.x1 - MAP_VIEW.x0) / (MAP_VIEW.z1 - MAP_VIEW.z0);
  const z0 = WORLD.z0 - 20;
  const z1 = 130;
  const w = Math.max((z1 - z0) * k, WORLD.x1 - WORLD.x0 + 40);
  const cx = (WORLD.x0 + WORLD.x1) / 2;
  const cz = (z0 + z1) / 2;
  return { x0: cx - w / 2, x1: cx + w / 2, z0: cz - w / k / 2, z1: cz + w / k / 2 };
})();
/**
 * Мини-карта: вид сверху, рисуется один раз. view — какой прямоугольник мира показать (по умолчанию бухта).
 * Краски мягкие, как на макетах: светлая бирюза на мели, синева на глубине, песок, зелень.
 */
export function drawMinimap(w = 512, h = 276, view = MAP_VIEW) {
  const sea = view !== MAP_VIEW;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  const { x0, x1, z0, z1 } = view;
  const px = (x1 - x0) / w; // метров в точке
  const col = (r, gg, b, i) => {
    img.data[i] = r;
    img.data[i + 1] = gg;
    img.data[i + 2] = b;
    img.data[i + 3] = 255;
  };
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const x = x0 + ((i + 0.5) / w) * (x1 - x0);
      const z = z0 + ((j + 0.5) / h) * (z1 - z0);
      // за краем моря — дальние острова: на карте моря они видны у рамки
      const far = sea && (x < WORLD.x0 || x > WORLD.x1 || z < WORLD.z0);
      const hh = far ? Math.max(groundH(x, z), farH(x, z)) : groundH(x, z);
      const k = (j * w + i) * 4;
      const n = fbm2(x * 0.2, z * 0.2, 2);
      if (hh < -0.1) {
        const t = sstep(-0.1, -11, hh);
        col(lerp(160, 70, t), lerp(228, 166, t), lerp(224, 198, t), k);
      } else if (hh < 0.8) col(245, 236, 208, k);
      else if (far) col(140 + n * 22, 198 + n * 16, 132 + n * 12, k);
      else if (palmR(x, z) < 1) col(240 - n * 14, 232 - n * 10, 196, k);
      else {
        const e = Math.max(1.2, px);
        const hx = groundH(x + e, z) - hh;
        const hz = groundH(x, z + e) - hh;
        const steep = Math.hypot(hx, hz) / e;
        if (steep > 1.08) col(178 + n * 16, 186 + n * 16, 194 + n * 16, k);
        else col(130 + n * 26 + (hx / e) * 26, 198 + n * 20 + (hx / e) * 26, 122 + n * 16, k);
      }
    }
  g.putImageData(img, 0, 0);
  const X = (x) => ((x - x0) / (x1 - x0)) * w;
  const Z = (z) => ((z - z0) / (z1 - z0)) * h;
  g.fillStyle = '#d9b48a';
  g.strokeStyle = '#8a6a4a';
  g.lineWidth = 1;
  for (const d of DECKS) {
    g.fillRect(X(d.x0), Z(d.z0), Math.max(1.5, X(d.x1) - X(d.x0)), Math.max(1.5, Z(d.z1) - Z(d.z0)));
    if (!sea) g.strokeRect(X(d.x0), Z(d.z0), X(d.x1) - X(d.x0), Z(d.z1) - Z(d.z0));
  }
  if (!sea) {
    g.fillStyle = '#e07a5f';
    g.fillRect(X(-13), Z(10.4), X(-7.2) - X(-13), Z(15.4) - Z(10.4));
  }
  if (HAS.lighthouse) {
    g.fillStyle = '#fff';
    g.strokeStyle = '#e05a4a';
    g.lineWidth = sea ? 1.6 : 2.5;
    g.beginPath();
    g.arc(X(LIGHTHOUSE.x), Z(LIGHTHOUSE.z), sea ? 2.6 : 4.5, 0, TAU);
    g.fill();
    g.stroke();
  }
  if (HAS.arch) {
    g.fillStyle = '#9aa3ae';
    g.beginPath();
    const ak = sea ? 0.45 : 1;
    g.ellipse(X(ARCH.x), Z(ARCH.z), 4 * ak, 9 * ak, -0.35, 0, TAU);
    g.fill();
  }
  if (sea && HAS.wreck) {
    // затонувший корабль: тёмный корпус с мачтой
    const wx = X(WRECK.x);
    const wz = Z(WRECK.z);
    g.fillStyle = '#5b4330';
    g.strokeStyle = '#f6efdc';
    g.lineWidth = 1.2;
    g.beginPath();
    g.ellipse(wx, wz, 6, 2.6, -0.5, 0, TAU);
    g.fill();
    g.stroke();
  }
  // причалы для лодки — белые точки с тёмной каймой
  for (const m of MOORINGS) {
    g.fillStyle = '#fff';
    g.strokeStyle = '#16284a';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(X(m.x), Z(m.z), sea ? 3.6 : 4.4, 0, TAU);
    g.fill();
    g.stroke();
  }
  return c;
}
