// Фактура поверхностей мира: волокна дерева, рисованные трава, камень, песок и тропа, свет на дне под водой.
//
// Весь неподвижный мир склеен в несколько мешей с цветом по вершинам (batch.js) — развёрток у него нет.
// Поэтому фактура считается прямо в шейдере: у вершины есть номер материала и «координаты волокон»,
// узор дерева берётся из одной повторяющейся текстуры шума (с мип-уровнями — вдали не рябит),
// а земля и камень расписаны текстурами из public/tex (их рисует tools/paint-textures.js): они ложатся
// сверху вниз (земля) или с трёх сторон (скалы) и умножаются на цвет вершины — оттенок задаёт мир, рисунок — текстура.
// Так рельеф, утёсы и арка из кода выглядят сделанными той же рукой, что и модели Tripo.
import * as THREE from 'three';

export const MAT = { PLAIN: 0, WOOD: 1, ROCK: 2, LEAF: 3, RINGS: 4, CLOTH: 5, PAINT: 6, ROOF: 7 }; // PAINT — крашеные доски, ROOF — черепица рядами

/** Общие для всех материалов значения; обновляет мир раз в кадр. */
/** Насколько далеко рисовать подробные модели леса и камней: 1 — «высокое» качество, меньше — ближе (см. gfx.js). */
export const detail = { lod: 1, grass: 44 }; // grass — на сколько метров вокруг игрока растут пучки травы (0 — нет)
export const surfaceU = {
  uDet: { value: null },
  uCaust: { value: null },
  uDetail: { value: 1 },
  uTimeS: { value: 0 },
  uWet: { value: 0 }, // дождь намочил мир: 0 — сухо, 1 — льёт давно
  uWetSky: { value: new THREE.Color(0.5, 0.55, 0.6) }, // что отражает мокрое: небо у горизонта
  uCaustK: { value: 1 },
  uCloudK: { value: 1 },
  uSunC: { value: new THREE.Color('#fff4e0') },
  uWaterS: { value: new THREE.Color('#35e0d4') },
  uWaterD: { value: new THREE.Color('#1273c4') },
  // рисованные текстуры (множители вокруг 0,5); пока не загрузились — ровные
  uGrass: { value: null },
  uRock: { value: null },
  uSand: { value: null },
  uDirt: { value: null },
  uPaint: { value: 0 }, // 1 — текстуры на месте
  uWood: { value: null }, // рисованная доска: волокна вдоль u
  uRockC: { value: new THREE.Color('#85817a') }, // камень, проступающий на крутых склонах (в тон утёсам-моделям)
  uMossC: { value: new THREE.Color('#8fb436') } // мох и трава на камнях — в тон траве и мху моделей
};

/** Ровная текстура-заглушка: множитель 1 (значение 0,5). */
function flatTexture() {
  const t = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}
/**
 * Загружает рисованные текстуры земли и камня. lite — телефон: текстуры вдвое меньше.
 * В пробной версии одним файлом (без сети) текстур нет — мир остаётся с ровной заливкой.
 */
// картинки сервер отдаёт с недельным сроком хранения: перерисовал текстуры (tools/paint-textures.js) — прибавь номер
const TEX_V = 4;
export function loadPaint({ lite = false, offline = false } = {}) {
  const flat = flatTexture();
  for (const k of ['uGrass', 'uRock', 'uSand', 'uDirt', 'uWood']) surfaceU[k].value = flat;
  if (offline) return Promise.resolve(false);
  const loader = new THREE.TextureLoader();
  const one = (name) =>
    new Promise((res) => {
      loader.load(
        `tex/${name}.webp?v=${TEX_V}`,
        (t) => {
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.colorSpace = THREE.NoColorSpace;
          t.anisotropy = lite ? 2 : 8;
          t.generateMipmaps = true;
          t.minFilter = THREE.LinearMipmapLinearFilter;
          if (lite && t.image && t.image.width > 512) {
            // телефону — половинный размер: вчетверо меньше видеопамяти
            const c = document.createElement('canvas');
            c.width = c.height = t.image.width / 2;
            c.getContext('2d').drawImage(t.image, 0, 0, c.width, c.height);
            t.image = c;
          }
          t.needsUpdate = true;
          res(t);
        },
        undefined,
        () => res(null)
      );
    });
  return Promise.all(['grass', 'rock', 'sand', 'dirt', 'wood'].map(one)).then(([g, r, sd, d, w]) => {
    if (!g || !r || !sd || !d || !w) return false;
    surfaceU.uGrass.value = g;
    surfaceU.uRock.value = r;
    surfaceU.uSand.value = sd;
    surfaceU.uDirt.value = d;
    surfaceU.uWood.value = w;
    surfaceU.uPaint.value = 1;
    return true;
  });
}

function hash(ix, iy, seed) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** Плавный шум, повторяющийся с периодами px и py (в клетках). */
function vnoise(x, y, px, py, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const xa = ((x0 % px) + px) % px;
  const xb = (xa + 1) % px;
  const ya = ((y0 % py) + py) % py;
  const yb = (ya + 1) % py;
  const a = hash(xa, ya, seed);
  const b = hash(xb, ya, seed);
  const c = hash(xa, yb, seed);
  const d = hash(xb, yb, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/**
 * Текстура шума, четыре узора в четырёх каналах:
 * R — крупные пятна, G — мелкое зерно, B — волокна вдоль оси U, A — вторые пятна (другой рисунок).
 */
export function detailTexture(size = 1024) {
  const data = new Uint8Array(size * size * 4);
  for (let j = 0; j < size; j++) {
    const v = j / size;
    for (let i = 0; i < size; i++) {
      const u = i / size;
      const r = vnoise(u * 4, v * 4, 4, 4, 1) * 0.46 + vnoise(u * 9, v * 9, 9, 9, 2) * 0.28 + vnoise(u * 21, v * 21, 21, 21, 3) * 0.16 + vnoise(u * 48, v * 48, 48, 48, 4) * 0.1;
      const g = vnoise(u * 96, v * 96, 96, 96, 5) * 0.5 + vnoise(u * 230, v * 230, 230, 230, 6) * 0.5;
      // волокна: шум, вытянутый вдоль U, слегка «гуляет» поперёк
      const wob = vnoise(u * 5, v * 6, 5, 6, 7) * 0.9;
      const b = vnoise(u * 7, (v + wob * 0.012) * 150, 7, 150, 8) * 0.55 + vnoise(u * 16, v * 330, 16, 330, 9) * 0.3 + vnoise(u * 3, v * 40, 3, 40, 10) * 0.15;
      const a = vnoise(u * 6, v * 6, 6, 6, 11) * 0.5 + vnoise(u * 14, v * 14, 14, 14, 12) * 0.3 + vnoise(u * 37, v * 37, 37, 37, 13) * 0.2;
      const k = (j * size + i) * 4;
      data[k] = r * 255;
      data[k + 1] = g * 255;
      data[k + 2] = b * 255;
      data[k + 3] = a * 255;
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 8;
  t.colorSpace = THREE.NoColorSpace;
  t.needsUpdate = true;
  return t;
}

const PARS_V = /* glsl */ `
attribute float aMat;
attribute vec3 aTex;
varying float vMat;
varying vec3 vTex;
varying vec3 vWp;
varying vec3 vNw;
#ifdef SURF_TERRAIN
attribute vec4 aGround;
varying vec4 vGround;
#endif
`;
const PARS_F = /* glsl */ `
uniform sampler2D uDet, uCaust, uGrass, uRock, uSand, uDirt;
uniform float uDetail, uTimeS, uCaustK, uCloudK, uPaint;
uniform vec3 uSunC, uWaterS, uWaterD, uRockC, uMossC;
uniform sampler2D uWood;
varying float vMat;
varying vec3 vTex;
varying vec3 vWp;
varying vec3 vNw;
#ifdef SURF_TERRAIN
varying vec4 vGround;
#endif
vec4 tri(vec3 p, vec3 w) { return texture2D(uDet, p.zy) * w.x + texture2D(uDet, p.xz) * w.y + texture2D(uDet, p.xy) * w.z; }
// рисованный камень с трёх сторон: на отвесных гранях пласты лежат горизонтально, сверху — та же кладка в плане
vec3 triRock(vec3 p, vec3 w) { return (texture2D(uRock, p.zy).rgb * w.x + texture2D(uRock, p.xz).rgb * w.y + texture2D(uRock, p.xy).rgb * w.z) * 2.0; }
vec3 paintRock(vec3 wp, vec3 n, float near) {
  vec3 w = abs(n); w = w * w * w * w; w /= (w.x + w.y + w.z);
  vec3 a = triRock(wp * 0.17, w);
  vec3 b = triRock(wp * 0.041 + 3.7, w);
  vec3 c = a * mix(vec3(1.0), b, 0.5);
  // вблизи — тот же рисунок мельче: камень в двух шагах не расплывается в пятно
  if (near > 0.01) c *= mix(vec3(1.0), triRock(wp * 0.62 + 1.3, w), 0.42 * near);
  return c;
}
vec3 paintGrass(vec2 p) {
  vec3 a = texture2D(uGrass, p * 0.2).rgb * 2.0;
  vec3 b = texture2D(uGrass, p * 0.047 + 0.37).rgb * 2.0;
  return a * mix(vec3(1.0), b, 0.5);
}
`;
// узор по номеру материала; diffuseColor уже несёт цвет вершины
const DETAIL_F = /* glsl */ `
vec3 nGeo = normalize(cross(dFdx(vWp), dFdy(vWp)));
vec3 nW = normalize(vNw);
float nearK = 1.0 - smoothstep(7.0, 20.0, length(vViewPosition));
#ifdef SURF_TERRAIN
{
  // что под ногами — из вершин: трава, камень, песок, тропа. Границу между ними ведёт шум, а не сетка в полтора метра.
  vec4 t = texture2D(uDet, vWp.xz * 0.043);
  vec4 f = texture2D(uDet, vWp.xz * 0.37);
  vec4 W = vGround;
  float land = clamp(W.x + W.y, 0.0, 1.0);
  // крутой склон — камень, даже если вершины «травяные»
  float steep = 1.0 - nW.y;
  // порог узкий: на склоне, который весь «около порога», камень проступает пятнами с чётким краем, а не полупрозрачной дымкой
  float crag = smoothstep(0.33, 0.356, steep + (f.r - 0.5) * 0.2 + (t.a - 0.5) * 0.1) * land;
  // трава ↔ песок и трава ↔ тропа: порог с шумом — край «рваный», как мазок
  float gk = W.x / max(W.x + W.z + W.w, 1e-3);
  float gEdge = smoothstep(0.38, 0.62, gk + (f.a - 0.5) * 0.5);
  // Камень, заданный вершинами (обрывы острова, мыс, скалистое дно), — тоже через порог с шумом. Между «каменной»
  // и «травяной» вершиной плавно меняется не только вес, но и цвет вершин: посередине трава выходила белёсой,
  // а камень зелёным — «дымка». Поэтому порог низкий: вся переходная полоса — камень (свой цвет он берёт из uRockC),
  // а трава начинается там, где её цвет уже чистый.
  float wRock = max(smoothstep(0.08, 0.22, W.y * (0.55 + f.r * 0.9)), crag);
  if (uDetail > 0.5) {
    vec3 gM = paintGrass(vWp.xz);
    vec3 sM = texture2D(uSand, vWp.xz * 0.27).rgb * 2.0;
    vec3 dM = texture2D(uDirt, vWp.xz * 0.31).rgb * 2.0;
    float sd = W.z / max(W.z + W.w, 1e-3);
    vec3 soft = mix(mix(dM, sM, sd), gM, gEdge);
    // крупные пятна света и тени по лугу; у кромки травы — тёмная «подводка»
    float k = mix(0.9, 1.1, t.r);
    k *= 1.0 - 0.14 * gEdge * (1.0 - gEdge) * 4.0;
    vec3 col = diffuseColor.rgb * soft * k;
    if (wRock > 0.003) {
      vec3 rM = paintRock(vWp, nW, nearK);
      // камень, проступивший на склоне, берёт свой цвет; заданный вершинами — их цвет
      vec3 rc = mix(uRockC * mix(0.88, 1.1, t.a), diffuseColor.rgb, clamp(W.y * 1.6, 0.0, 1.0)) * rM;
      // на отвесной стене — пласты: тёмный уступ по границе слоя, у каждого слоя свой тон (как у утёсов-моделей)
      float st = vWp.y * 0.4 + (t.r - 0.5) * 1.7 + (f.g - 0.5) * 0.22;
      float band = fract(st);
      float ledge = smoothstep(0.0, 0.05, band) * (1.0 - smoothstep(0.93, 1.0, band));
      float layer = 0.9 + 0.2 * fract(sin(floor(st) * 12.9898) * 43758.5453);
      rc *= mix(1.0, layer * mix(0.6, 1.0, ledge), smoothstep(0.3, 0.55, 1.0 - abs(nW.y)));
      // мха на таком камне нет: склон, который весь «около порога», он покрывал зелёной дымкой. Где полого — там
      // и так трава, граница с ней резкая и рваная
      col = mix(col, rc, wRock);
    }
    // прибой: полоса мокрого песка у воды. Её край ходит вместе с накатом волны (тот же ход, что у кромки пены в water.js)
    // и отстаёт на откате — песок «сохнет» не сразу
    float swPh = uTimeS * 0.9 + vWp.x * 0.35;
    float reach = 0.15 + 0.08 * max(sin(swPh), sin(swPh - 1.2) * 0.85);
    float wet = (1.0 - smoothstep(reach - 0.04, reach + 0.05, vWp.y + (f.a - 0.5) * 0.06)) * smoothstep(-0.55, -0.12, vWp.y);
    col = mix(col, col * vec3(0.64, 0.68, 0.73), wet * (1.0 - gEdge) * (1.0 - wRock) * 0.92);
    diffuseColor.rgb = col;
  } else {
    // «низкое» качество: без текстур, но границы и камень на склонах те же
    diffuseColor.rgb = mix(diffuseColor.rgb, mix(uRockC, diffuseColor.rgb, clamp(W.y * 1.6, 0.0, 1.0)), wRock) * mix(0.94, 1.06, t.r);
  }
}
#else
if (vMat > 1.5 && vMat < 2.5) {
  // камень: рисованная кладка с трёх сторон; на «замшелых» камнях сверху мох — граница по шуму, с тёмной подводкой
  // vTex: x — мох (1) и «валун» (+2: рисунок кладки едва намечен), y — с какого наклона начинается мох, z — свой сдвиг рисунка у камня
  float softK = step(1.5, vTex.x);
  float mossy = vTex.x - 2.0 * softK;
  vec4 f = texture2D(uDet, vWp.xz * 0.31 + vTex.z);
  float mossK = mossy * smoothstep(vTex.y - 0.1, vTex.y + 0.1, nW.y + (f.r - 0.5) * 0.36 + (f.g - 0.5) * 0.1) * smoothstep(0.05, 0.5, vWp.y);
  vec3 rc = diffuseColor.rgb;
  vec3 mc = uMossC * mix(0.86, 1.08, f.a);
  if (uDetail > 0.5) {
    vec3 rM = paintRock(vWp + vTex.z * 7.0, nW, nearK);
    // валун: вместо резких плит — мягкие пятна тона и редкие трещины
    rc *= mix(rM, mix(vec3(1.0), rM, 0.42) * mix(0.9, 1.1, tri(vWp * 0.21 + vTex.z, vec3(0.34, 0.33, 0.33)).r), softK);
    rc *= 1.0 - 0.3 * mossy * smoothstep(vTex.y - 0.34, vTex.y - 0.06, nW.y + (f.r - 0.5) * 0.36) * (1.0 - mossK);
    // у дальних островов мазки травы сливаются в ровную штриховку — за сотней метров рисунок мха гаснет
    mc *= mix(paintGrass(vWp.xz), vec3(1.0), smoothstep(120.0, 380.0, length(vViewPosition)));
  }
  diffuseColor.rgb = mix(rc, mc, mossK);
} else if (uDetail > 0.5) {
    if (vMat > 0.5 && vMat < 1.5) {
      // дерево: рисованная доска — волокна вдоль длинной стороны (2,5 м на плитку), поперёк 0,6 м; пока текстура
      // не загрузилась (и в пробной версии) — прежние волокна из шума
      vec2 q = vec2(vTex.x * 0.4, (vTex.y + vTex.z) * 1.7);
      vec4 a = texture2D(uDet, q);
      vec4 b = texture2D(uDet, q * vec2(0.31, 0.37) + 0.37);
      float k = mix(0.78, 1.1, a.b) * mix(0.9, 1.07, b.r);
      k *= 1.0 - 0.2 * smoothstep(0.6, 0.85, a.b * 0.55 + b.b * 0.65);
      k *= mix(0.97, 1.03, a.g);
      diffuseColor.rgb *= mix(vec3(k), texture2D(uWood, q).rgb * 2.0 * mix(0.93, 1.06, b.r), uPaint);
      // стёсанная кромка доски (фаска смотрит вверх наискось) светлее: вытертое дерево
      float bevel = smoothstep(0.3, 0.5, nGeo.y) * (1.0 - smoothstep(0.8, 0.93, nGeo.y));
      diffuseColor.rgb *= 1.0 + 0.3 * bevel;
    } else if (vMat > 2.5 && vMat < 3.5) {
      // листва: светлые и тёмные «листья», крупные пятна света
      vec4 t = texture2D(uDet, vWp.xz * 0.31 + vWp.y * 0.17);
      vec4 f = texture2D(uDet, vWp.xz * 1.3 + vWp.y * 0.71);
      diffuseColor.rgb *= mix(0.86, 1.1, t.r) * mix(0.8, 1.16, f.g);
    } else if (vMat > 3.5 && vMat < 4.5) {
      // торец бревна: годовые кольца
      float r = length(vTex.xz);
      float n = texture2D(uDet, vTex.xz * 1.3).r;
      float rings = sin(r * 170.0 + n * 9.0);
      diffuseColor.rgb *= (0.93 + 0.09 * rings) * mix(0.82, 1.0, smoothstep(0.0, 0.05, r)) * mix(0.94, 1.04, texture2D(uDet, vTex.xz * 6.0).g);
    } else if (vMat > 4.5 && vMat < 5.5) {
      // ткань и верёвка: мелкое плетение
      vec4 f = texture2D(uDet, vec2(vTex.x + vTex.y, vTex.z - vTex.y) * 2.2);
      diffuseColor.rgb *= mix(0.88, 1.08, f.g) * mix(0.94, 1.04, f.b);
    } else if (vMat > 5.5 && vMat < 6.5) {
      // крашеные доски: под краской видны волокна (сверху вниз), местами краска выгорела и облупилась до светлого дерева
      float h = vWp.x * 0.7 + vWp.z * 0.7;
      vec4 a = texture2D(uDet, vec2(vWp.y * 0.33, h * 1.6));
      vec4 b = texture2D(uDet, vec2(h, vWp.y) * 0.19);
      float k = mix(0.9, 1.07, a.b) * mix(0.93, 1.05, b.r);
      float worn = smoothstep(0.6, 0.78, a.b * 0.5 + b.a * 0.62);
      vec3 c = diffuseColor.rgb * k;
      float l = dot(c, vec3(0.3, 0.6, 0.1));
      diffuseColor.rgb = mix(c, mix(c, vec3(l) * vec3(1.25, 1.16, 0.98), 0.6), worn * 0.55);
    } else if (vMat > 6.5 && vMat < 7.5) {
      // черепица: ряды поперёк ската со сдвигом через один, у каждой плитки свой тон, под нижним краем ряда — тень
      vec2 q = vec2(vTex.x / 0.36, vTex.y / 0.3);
      float row = floor(q.y);
      q.x += mod(row, 2.0) * 0.5;
      vec2 cell = vec2(floor(q.x), row);
      vec2 fr = fract(q);
      float tone = texture2D(uDet, cell * 0.137 + 0.21).r;
      float k = mix(0.8, 1.16, tone);
      k *= 1.0 - 0.26 * smoothstep(0.78, 1.0, fr.y) - 0.2 * (1.0 - smoothstep(0.0, 0.07, fr.x)) - 0.12 * smoothstep(0.93, 1.0, fr.x);
      k *= 1.0 + 0.14 * (1.0 - smoothstep(0.0, 0.16, fr.y));
      k *= mix(0.94, 1.05, texture2D(uDet, vTex.xy * 1.7).g);
      diffuseColor.rgb *= k;
    }
}
#endif
`;
// под водой: сетка солнечного света на дне, вода «съедает» красный, глубина уходит в синеву
const UNDER_F = /* glsl */ `
// тени облаков медленно плывут по земле и причалу
outgoingLight *= 1.0 - uCloudK * 0.2 * smoothstep(0.5, 0.68, texture2D(uDet, vWp.xz * 0.0019 + uTimeS * vec2(0.0021, 0.0012)).r);
if (vWp.y < 0.0) {
  float dW = -vWp.y;
  vec2 cp = vWp.xz + nGeo.xz * dW * 0.35;
  cp += (texture2D(uDet, cp * 0.019 + uTimeS * 0.0035).ra - 0.5) * 3.0; // сетка «дышит»: ячейки кривые, а не по линейке
  float c1 = texture2D(uCaust, cp * 0.105 + uTimeS * vec2(0.013, 0.008)).r;
  float c2 = texture2D(uCaust, cp * 0.151 - uTimeS * vec2(0.010, 0.014)).r;
  float net = max(c1, c2 * 0.85);
  net = net * net * 1.7 + min(c1, c2) * 0.8;
  float lit = smoothstep(0.0, 0.3, dW) * exp(-dW * 0.13) * (0.35 + 0.65 * max(nGeo.y, 0.0));
  outgoingLight += (diffuseColor.rgb * 0.7 + 0.3) * uSunC * net * uCaustK * lit * 0.62;
  outgoingLight *= mix(vec3(1.0), uWaterS * 1.25 + 0.08, smoothstep(0.0, 2.2, dW) * 0.7);
  outgoingLight = mix(outgoingLight, uWaterD * 0.5, 1.0 - exp(-dW * 0.075));
} else if (uWet > 0.01) {
  // Дождь: мокрое темнее. Доски, камень и крашеное ещё и отсвечивают небом — сильнее всего то, что смотрит вверх;
  // на ровном настиле стоят лужи. Трава и листва не зеркалят: им только лёгкий отсвет.
  float upW = clamp(nGeo.y, 0.0, 1.0);
  float wetK = uWet * (0.45 + 0.55 * upW);
  float frW = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 4.0);
  outgoingLight *= 1.0 - 0.3 * wetK;
  #ifdef WET_GLOSS
    float pud = 0.0;
    #ifdef WET_PUDDLE
      pud = smoothstep(0.54, 0.68, texture2D(uDet, vWp.xz * 0.09).r) * smoothstep(0.9, 0.97, nGeo.y) * smoothstep(0.35, 0.9, uWet);
      outgoingLight *= 1.0 - 0.32 * pud;
    #endif
    outgoingLight += uWetSky * (wetK * (0.03 + 0.4 * frW) + pud * (0.04 + 0.42 * frW));
  #else
    outgoingLight += uWetSky * wetK * 0.22 * frW;
  #endif
}
`;
const WET_PARS = 'uniform float uWet;\nuniform vec3 uWetSky;\n';
const WET_ROUGH = '#include <roughnessmap_fragment>\n#ifdef WET_GLOSS\nroughnessFactor *= 1.0 - 0.5 * uWet;\n#endif';

/** Дополняет стандартный материал фактурой. terrain: true — рельеф (тип поверхности по цвету и уклону). */
export function patchSurface(material, { terrain = false } = {}) {
  material.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, surfaceU);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', (terrain ? '#define SURF_TERRAIN\n' : '') + '#include <common>\n' + PARS_V)
      .replace(
        '#include <project_vertex>',
        '#include <project_vertex>\nvMat = aMat; vTex = aTex; vWp = (modelMatrix * vec4(transformed, 1.0)).xyz; vNw = normalize(mat3(modelMatrix) * objectNormal);\n#ifdef SURF_TERRAIN\nvGround = aGround;\n#endif'
      );
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', (terrain ? '#define SURF_TERRAIN\n' : '#define WET_GLOSS\n#define WET_PUDDLE\n') + '#include <common>\n' + PARS_F + WET_PARS)
      .replace('#include <roughnessmap_fragment>', WET_ROUGH)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + DETAIL_F)
      .replace('#include <opaque_fragment>', UNDER_F + '\n#include <opaque_fragment>');
  };
  material.customProgramCacheKey = () => 'surf15' + (terrain ? 'T' : 'B');
  return material;
}

// ───── готовые модели (деревья, камни, постройки) ─────
// У них своя текстура, фактура из шума им не нужна. Но жить они должны в том же мире:
// по ним плывут тени облаков, под водой они уходят в бирюзу, а кроны покачиваются на ветру.
const MODEL_PARS_V = /* glsl */ `
uniform float uTimeS;
varying vec3 vWp;
`;
const MODEL_PARS_F = /* glsl */ `
uniform sampler2D uDet, uCaust;
uniform float uTimeS, uCaustK, uCloudK;
uniform vec3 uSunC, uWaterS, uWaterD;
varying vec3 vWp;
`;
const MODEL_WP_V = /* glsl */ `
{
  vec4 wp = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    wp = instanceMatrix * wp;
  #endif
  vWp = (modelMatrix * wp).xyz;
}
`;
// Скала-модель вблизи: поверх её текстуры — мелкий рисунок камня из общей рисованной текстуры, наложенный с трёх
// сторон по месту в мире. Модель растянута на десяток метров, и своя текстура в двух шагах расплывается; а рисунок
// от растяжения не зависит. На зелёном (трава и мох на макушке) его нет; на «низком» качестве — тоже.
const ROCK_DETAIL_F = /* glsl */ `
{
  float nearR = (1.0 - smoothstep(9.0, 26.0, length(vViewPosition))) * step(0.5, uDetail);
  if (nearR > 0.01) {
    vec3 nR = normalize(cross(dFdx(vWp), dFdy(vWp)));
    vec3 wR = abs(nR); wR = wR * wR * wR * wR; wR /= (wR.x + wR.y + wR.z);
    vec3 dR = (texture2D(uRock, vWp.zy * 0.55).rgb * wR.x + texture2D(uRock, vWp.xz * 0.55).rgb * wR.y + texture2D(uRock, vWp.xy * 0.55).rgb * wR.z) * 2.0;
    float green = clamp((diffuseColor.g - max(diffuseColor.r, diffuseColor.b)) * 8.0, 0.0, 1.0);
    diffuseColor.rgb *= mix(vec3(1.0), dR, 0.5 * nearR * (1.0 - green));
  }
}
`;
// качание: чем выше над землёй, тем сильнее; у каждого дерева своя фаза (по месту, где оно стоит)
const sway = (k) => /* glsl */ `
{
  vec4 o = vec4(0.0, 0.0, 0.0, 1.0);
  #ifdef USE_INSTANCING
    o = instanceMatrix * o;
  #endif
  o = modelMatrix * o;
  float ph = o.x * 0.35 + o.z * 0.27;
  float h = max(transformed.y - 0.2, 0.0);
  float a = (sin(uTimeS * 1.15 + ph) + 0.45 * sin(uTimeS * 2.7 + ph * 1.7)) * ${k.toFixed(4)} * h * h;
  transformed.x += a;
  transformed.z += a * 0.6;
}
`;
/**
 * Готовой модели — тени облаков и подводный цвет; sway > 0 — качание на ветру (доля высоты модели);
 * sat < 1 — приглушить краски (у крон и кустов Tripo в текстуре почти нет синего: рядом с травой они кислотные).
 */
export function patchModel(material, { sway: k = 0, sat = 1, rock = false } = {}) {
  material.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, surfaceU);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + MODEL_PARS_V)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + (k ? sway(k) : ''))
      .replace('#include <project_vertex>', '#include <project_vertex>\n' + MODEL_WP_V);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', (k ? '' : '#define WET_GLOSS\n') + '#include <common>\n' + MODEL_PARS_F + WET_PARS + (rock ? 'uniform sampler2D uRock;\nuniform float uDetail;\n' : ''))
      .replace('#include <roughnessmap_fragment>', WET_ROUGH)
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>' + (sat !== 1 ? `\ndiffuseColor.rgb = mix(vec3(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722))), diffuseColor.rgb, ${sat.toFixed(3)});` : '') + (rock ? ROCK_DETAIL_F : '')
      )
      .replace('#include <opaque_fragment>', 'vec3 nGeo = normalize(cross(dFdx(vWp), dFdy(vWp)));\n' + UNDER_F + '\n#include <opaque_fragment>');
  };
  material.customProgramCacheKey = () => 'model3' + k + '|' + sat + (rock ? 'R' : '');
  return material;
}

