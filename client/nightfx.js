// Ночные огни бухты: лампочки гирлянд и дорожки света от фонарей на воде.
//
// Всё это — «наклейки» без источников света: число источников зашито в шейдеры всей сцены, новый стоил бы каждому
// кадру. Днём огни не выключаются (тогда их шейдеры собирались бы в первые же сумерки — рывком), а сжимаются в точку:
// рисовать нечего, а шейдеры собраны вместе со всеми при запуске. (Светлячки — в fauna.js, с прочими насекомыми.)
import * as THREE from 'three';

// ───── лампочки ─────
const DOT_VERT = /* glsl */ `
attribute vec3 aAt;   // где висит лампочка
attribute vec4 aLook; // цвет и поперечник свечения, м
attribute float aPh;  // фаза дрожания
uniform float uNight, uTime;
varying vec2 vQ;
varying vec3 vCol;
varying float vK;
void main() {
  vec4 mv = viewMatrix * vec4(aAt, 1.0);
  mv.xyz *= 1.0 - min(0.5, 0.12 / max(length(mv.xyz), 1e-3)); // чуть ближе к глазу: огонёк горит перед лампочкой, а не внутри неё
  // вдали огонёк не становится меньше точки на экране: иначе он мерцал бы от кадра к кадру
  float size = max(aLook.w, -mv.z * 0.0042);
  // зажигаются в сумерках; горят ровно, чуть подрагивая
  vK = smoothstep(0.12, 0.42, uNight) * (0.9 + 0.1 * sin(uTime * 2.7 + aPh * 31.0)) * mix(1.0, aLook.w / size, 0.55);
  vCol = aLook.rgb;
  vQ = position.xy;
  mv.xy += position.xy * (vK > 0.003 ? size : 0.0);
  gl_Position = projectionMatrix * mv;
}`;
const DOT_FRAG = /* glsl */ `
varying vec2 vQ;
varying vec3 vCol;
varying float vK;
void main() {
  float r = length(vQ) * 2.0;
  if (r >= 1.0) discard;
  // яркая сердцевина и широкий слабый ореол
  float core = 1.0 - smoothstep(0.0, 0.26, r);
  float halo = pow(1.0 - r, 2.6);
  vec3 c = vCol * (core * 2.4 + halo * 0.75) * vK;
  #ifdef TONE_MAPPING
  c *= 0.75;
  #endif
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

// ───── дорожки света на воде ─────
// Полоса лежит на воде от огня к смотрящему. Где в ней вспыхнет блик, решает то же, что и в жизни: рябь должна
// наклонить воду так, чтобы огонь отразился в глаз (нормаль — посередине между «на огонь» и «на глаз»).
// Рябь берётся та же, что у воды (water.js), поэтому блики лежат на её гребешках.
const WAKE_VERT = /* glsl */ `
attribute vec4 aL; // огонь: x, высота над водой, z и полуширина полосы
attribute vec4 aC; // цвет и сила
uniform float uNight;
varying vec3 vW;
varying vec4 vL;
varying vec3 vC;
varying vec2 vDir;
void main() {
  vec2 b = aL.xz;
  vec2 to = cameraPosition.xz - b;
  float D = length(to);
  vec2 dir = to / max(D, 1e-3);
  float H = aL.y;
  float E = max(cameraPosition.y, 0.3);
  // ближе к огню и к смотрящему, чем на две их высоты, отражению нужен слишком крутой наклон воды — там полосы нет
  float t0 = 1.9 * H;
  float t1 = D - 1.9 * E;
  float on = step(t0 + 0.5, t1) * step(0.004, uNight * aC.a);
  float t = mix(t0, t1, position.y);
  vec2 p = b + dir * t + vec2(-dir.y, dir.x) * position.x * aL.w * (1.0 + D * 0.004);
  vW = vec3(p.x, 0.0, p.y);
  vL = aL;
  vC = aC.rgb * aC.a;
  vDir = dir;
  gl_Position = on > 0.0 ? projectionMatrix * viewMatrix * vec4(p.x, 0.03, p.y, 1.0) : vec4(2.0, 2.0, 2.0, 1.0);
}`;
const WAKE_FRAG = /* glsl */ `
uniform sampler2D uNormal;
uniform float uTime, uNight, uFogNear, uFogFar;
varying vec3 vW;
varying vec4 vL;
varying vec3 vC;
varying vec2 vDir;
void main() {
  vec3 toL = vec3(vL.x, vL.y, vL.z) - vW;
  vec3 toE = cameraPosition - vW;
  float dL = length(toL);
  float dE = length(toE);
  vec3 hv = toL / dL + toE / dE;
  vec2 need = hv.xz / max(hv.y, 0.02); // какой наклон воды нужен, чтобы огонь отразился в глаз
  // поперёк полосы наклон «прощаем» вдвое: настоящая дорожка — в ладонь шириной, а нужна заметная издали
  float along = dot(need, vDir);
  vec2 side = need - vDir * along;
  need = vDir * along + side * 0.42;
  vec2 p = vW.xz;
  vec3 n1 = texture2D(uNormal, p * 0.045 + uTime * vec2(0.012, 0.008)).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D(uNormal, p * 0.13 + uTime * vec2(-0.017, 0.012)).xyz * 2.0 - 1.0;
  vec2 d = need + (n1.xy + n2.xy * 0.7) * 0.15;
  float glint = exp(-dot(d, d) * 420.0);
  float body = exp(-dot(need, need) * 60.0);
  float fog = 1.0 - smoothstep(uFogNear, uFogFar, dE);
  vec3 c = vC * (glint * 1.7 + body * 0.2) * uNight * fog;
  // Без общего прохода тональной кривой (ступени ниже «высокой») блик складывается с водой уже после кривой и
  // выгорает в жёлто-белое пятно — там он слабее и теплее.
  #ifdef TONE_MAPPING
  c *= vec3(0.46, 0.3, 0.16);
  #endif
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const _c = new THREE.Color();
const QUAD = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];

/**
 * Ночные огни. water — униформы воды (рябь, время, туман): дорожки на воде берут их оттуда.
 * Собираются в два меша: лампочки и дорожки. После всех bulb… и wake… — build().
 */
export class NightFx {
  constructor(scene, water) {
    this.scene = scene;
    this.dots = [];
    this.wakes = [];
    this.uNight = { value: 0 };
    this.uTime = water.uTime;
    this.water = water;
    this.dotMesh = null;
    this.wakeMesh = null;
    this.tick = 0;
  }
  /** Лампочка гирлянды: горит от сумерек до рассвета. */
  bulb(x, y, z, color = '#ffd49a', size = 0.46) {
    this.dots.push({ x, y, z, color, size, ph: this.dots.length * 0.618 });
  }
  /**
   * Дорожка света на воде от огня. src — { x, y, z } (y — высота над водой); его можно двигать после (фонарь
   * встал на готовую модель) — положение перечитывается. power — сила, half — полуширина полосы в метрах.
   */
  wake(src, color = '#ffb866', power = 1, half = 1.5) {
    this.wakes.push({ src, color, power, half, x: NaN, y: NaN, z: NaN });
  }
  build() {
    const mk = (vert, frag, uniforms) =>
      new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    if (this.dots.length) {
      const n = this.dots.length;
      const pos = new Float32Array(n * 12);
      const at = new Float32Array(n * 12);
      const look = new Float32Array(n * 16);
      const ph = new Float32Array(n * 4);
      const idx = [];
      this.dots.forEach((d, i) => {
        _c.set(d.color);
        for (let k = 0; k < 4; k++) {
          const v = i * 4 + k;
          pos.set([QUAD[k][0], QUAD[k][1], 0], v * 3);
          at.set([d.x, d.y, d.z], v * 3);
          look.set([_c.r, _c.g, _c.b, d.size], v * 4);
          ph[v] = d.ph;
        }
        idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aAt', new THREE.BufferAttribute(at, 3));
      g.setAttribute('aLook', new THREE.BufferAttribute(look, 4));
      g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));
      g.setIndex(idx);
      const m = (this.dotMesh = new THREE.Mesh(g, mk(DOT_VERT, DOT_FRAG, { uNight: this.uNight, uTime: this.uTime })));
      m.frustumCulled = false;
      m.renderOrder = 4;
      this.scene.add(m);
    }
    if (this.wakes.length) {
      const n = this.wakes.length;
      const pos = new Float32Array(n * 12);
      const idx = [];
      for (let i = 0; i < n; i++) {
        pos.set([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0], i * 12);
        idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aL', new THREE.BufferAttribute(new Float32Array(n * 16), 4));
      g.setAttribute('aC', new THREE.BufferAttribute(new Float32Array(n * 16), 4));
      g.setIndex(idx);
      const W = this.water;
      const mat = mk(WAKE_VERT, WAKE_FRAG, { uNight: this.uNight, uTime: this.uTime, uNormal: W.uNormal, uFogNear: W.uFogNear, uFogFar: W.uFogFar });
      mat.side = THREE.DoubleSide;
      const m = (this.wakeMesh = new THREE.Mesh(g, mat));
      m.frustumCulled = false;
      m.renderOrder = 3; // поверх воды (у неё 2)
      this.scene.add(m);
      this.sync(true);
    }
    return this;
  }
  /** Перечитать, где стоят огни (их двигают готовые модели, когда догружаются). */
  sync(force = false) {
    const m = this.wakeMesh;
    if (!m) return;
    const L = m.geometry.attributes.aL;
    const C = m.geometry.attributes.aC;
    let moved = false;
    this.wakes.forEach((w, i) => {
      const s = w.src;
      if (!force && s.x === w.x && s.y === w.y && s.z === w.z && (s.power ?? w.power) === w.pw) return;
      w.x = s.x;
      w.y = s.y;
      w.z = s.z;
      w.pw = s.power ?? w.power;
      _c.set(w.color);
      for (let k = 0; k < 4; k++) {
        L.setXYZW(i * 4 + k, s.x, s.y, s.z, w.half);
        C.setXYZW(i * 4 + k, _c.r, _c.g, _c.b, w.pw);
      }
      moved = true;
    });
    if (moved) L.needsUpdate = C.needsUpdate = true;
  }
  /** night: 0 днём … 1 ночью. */
  setNight(night) {
    this.uNight.value = night;
  }
  update() {
    if (this.tick++ % 30 === 0) this.sync();
  }
  /** Для проверок: сколько лампочек и дорожек и насколько они сейчас горят. */
  state() {
    return { bulbs: this.dots.length, wakes: this.wakes.length, night: this.uNight.value };
  }
}
