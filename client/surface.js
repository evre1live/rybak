// Фактура поверхностей мира: волокна дерева, слои камня, трава и песок, свет на дне под водой.
//
// Весь неподвижный мир склеен в несколько мешей с цветом по вершинам (batch.js) — развёрток у него нет.
// Поэтому фактура считается прямо в шейдере: у вершины есть номер материала и «координаты волокон»,
// а узор берётся из одной повторяющейся текстуры шума (с мип-уровнями — вдали не рябит).
import * as THREE from 'three';

export const MAT = { PLAIN: 0, WOOD: 1, ROCK: 2, LEAF: 3, RINGS: 4, CLOTH: 5 };

/** Общие для всех материалов значения; обновляет мир раз в кадр. */
export const surfaceU = {
  uDet: { value: null },
  uCaust: { value: null },
  uDetail: { value: 1 },
  uTimeS: { value: 0 },
  uCaustK: { value: 1 },
  uSunC: { value: new THREE.Color('#fff4e0') },
  uWaterS: { value: new THREE.Color('#35e0d4') },
  uWaterD: { value: new THREE.Color('#1273c4') }
};

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
`;
const PARS_F = /* glsl */ `
uniform sampler2D uDet, uCaust;
uniform float uDetail, uTimeS, uCaustK;
uniform vec3 uSunC, uWaterS, uWaterD;
varying float vMat;
varying vec3 vTex;
varying vec3 vWp;
vec4 tri(vec3 p, vec3 w) { return texture2D(uDet, p.zy) * w.x + texture2D(uDet, p.xz) * w.y + texture2D(uDet, p.xy) * w.z; }
`;
// узор по номеру материала; diffuseColor уже несёт цвет вершины
const DETAIL_F = /* glsl */ `
vec3 nGeo = normalize(cross(dFdx(vWp), dFdy(vWp)));
if (uDetail > 0.5) {
  #ifdef SURF_TERRAIN
    vec4 t = texture2D(uDet, vWp.xz * 0.043);
    vec4 f = texture2D(uDet, vWp.xz * 0.37);
    vec4 ff = texture2D(uDet, vWp.xz * 1.9);
    float green = clamp((diffuseColor.g - max(diffuseColor.r, diffuseColor.b)) * 7.0, 0.0, 1.0);
    float k = mix(0.88, 1.1, t.r) * mix(0.95, 1.05, f.a);
    // трава: мелкие «травинки» и светлые проплешины; песок и дно — зерно
    k *= mix(mix(0.95, 1.05, ff.g), mix(0.76, 1.2, ff.g) * mix(0.9, 1.12, f.r), green);
    // крутые склоны — слоистый камень
    float steep = smoothstep(0.25, 0.6, 1.0 - nGeo.y);
    float strata = sin(vWp.y * 3.4 + t.a * 8.0);
    k *= 1.0 - steep * (0.1 * smoothstep(0.45, 0.95, strata) + 0.12 * (1.0 - f.b));
    diffuseColor.rgb *= k;
  #else
    if (vMat > 0.5 && vMat < 1.5) {
      // дерево: волокна вдоль длинной стороны, редкие тёмные прожилки
      vec2 q = vec2(vTex.x * 0.4, (vTex.y + vTex.z) * 1.7);
      vec4 a = texture2D(uDet, q);
      vec4 b = texture2D(uDet, q * vec2(0.31, 0.37) + 0.37);
      float k = mix(0.78, 1.1, a.b) * mix(0.9, 1.07, b.r);
      k *= 1.0 - 0.2 * smoothstep(0.6, 0.85, a.b * 0.55 + b.b * 0.65);
      k *= mix(0.97, 1.03, a.g);
      diffuseColor.rgb *= k;
    } else if (vMat > 1.5 && vMat < 2.5) {
      // камень: пятна, потёки сверху вниз и горизонтальные слои на отвесных гранях
      vec3 w = abs(nGeo); w *= w; w /= (w.x + w.y + w.z);
      vec4 t = tri(vWp * 0.085, w);
      vec4 f = tri(vWp * 0.47, w);
      float side = 1.0 - w.y;
      float streak = texture2D(uDet, vec2(vWp.y * 0.07, (vWp.x + vWp.z) * 0.33)).b;
      float strata = sin(vWp.y * 2.6 + t.a * 9.0);
      float k = mix(0.8, 1.14, t.r) * mix(0.93, 1.06, f.g);
      k *= 1.0 - side * (0.12 * smoothstep(0.5, 0.95, strata) + 0.16 * smoothstep(0.55, 0.8, streak));
      diffuseColor.rgb *= k;
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
    }
  #endif
}
`;
// под водой: сетка солнечного света на дне, вода «съедает» красный, глубина уходит в синеву
const UNDER_F = /* glsl */ `
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
}
`;

/** Дополняет стандартный материал фактурой. terrain: true — рельеф (тип поверхности по цвету и уклону). */
export function patchSurface(material, { terrain = false } = {}) {
  material.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, surfaceU);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + PARS_V)
      .replace('#include <project_vertex>', '#include <project_vertex>\nvMat = aMat; vTex = aTex; vWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', (terrain ? '#define SURF_TERRAIN\n' : '') + '#include <common>\n' + PARS_F)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + DETAIL_F)
      .replace('#include <opaque_fragment>', UNDER_F + '\n#include <opaque_fragment>');
  };
  material.customProgramCacheKey = () => 'surf' + (terrain ? 'T' : 'B');
  return material;
}
