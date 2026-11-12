// Флаги на шестах и лучи низкого солнца.
//
// Флаги показывают ветер: в ясную погоду полотнище лениво колышется и обвисает, в дождь — вытянуто и хлопает.
// Полотно — обычный освещаемый материал с волной в вершинном шейдере (одна программа на все флаги).
//
// Лучи — веер света от солнца, когда оно низко: на рассвете и на закате. Это один прямоугольник перед камерой
// на «средней» глубине (ближние предметы его перекрывают, дальние — нет), свет прибавляется к картинке.
import * as THREE from 'three';
import { groundH } from './terrain.js';

/** Материал полотнища: волна бежит от древка к свободному краю; uWind — сила ветра 0…1. */
function clothMaterial(U) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uFlagT = U.uT;
    sh.uniforms.uWind = U.uWind;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uFlagT, uWind;\nattribute float aWave;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          // aWave — расстояние от древка в долях длины (у шеста 0: он неподвижен)
          float x = aWave;
          float w = 0.25 + 0.75 * uWind;
          float ph = position.x * 5.5 - uFlagT * (3.0 + 5.0 * uWind);
          transformed.z += (sin(ph) * 0.11 + sin(ph * 2.3 + position.y * 4.0) * 0.04) * x * w;
          // слабый ветер — полотнище обвисает
          transformed.y -= (1.0 - uWind) * 0.55 * x * x + sin(ph * 0.7) * 0.02 * x;
          transformed.x -= (1.0 - uWind) * 0.22 * x * x;
        }`
      );
  };
  m.customProgramCacheKey = () => 'flag1';
  return m;
}

/** Флаг: шест высотой h и полотнище len × wide из полос цветов cols (сверху вниз); pennant — треугольный вымпел. */
function flagGeometry(h, len, wide, cols, pennant) {
  const pos = [];
  const col = [];
  const wave = [];
  const nor = [];
  const c = new THREE.Color();
  const tri = (a, b, d, color, wa, wb, wd, n = [0, 0, 1]) => {
    pos.push(...a, ...b, ...d);
    c.set(color);
    for (let i = 0; i < 3; i++) {
      col.push(c.r, c.g, c.b);
      nor.push(...n);
    }
    wave.push(wa, wb, wd);
  };
  // шест: тонкая четырёхгранная стойка и шарик-набалдашник
  const R = 0.035;
  for (let i = 0; i < 4; i++) {
    const a0 = (i / 4) * Math.PI * 2;
    const a1 = ((i + 1) / 4) * Math.PI * 2;
    const p0 = [Math.cos(a0) * R, 0, Math.sin(a0) * R];
    const p1 = [Math.cos(a1) * R, 0, Math.sin(a1) * R];
    const q0 = [p0[0], h, p0[2]];
    const q1 = [p1[0], h, p1[2]];
    const n = [Math.cos((a0 + a1) / 2), 0, Math.sin((a0 + a1) / 2)];
    tri(p0, q0, p1, '#e8e2d2', 0, 0, 0, n);
    tri(p1, q0, q1, '#e8e2d2', 0, 0, 0, n);
    tri(q0, [0, h + 0.12, 0], q1, '#ffd60a', 0, 0, 0, n);
  }
  // полотнище: сетка NX × полосы
  const NX = 10;
  const rows = cols.length;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < NX; i++) {
      const u0 = i / NX;
      const u1 = (i + 1) / NX;
      // у вымпела высота сходит на нет к свободному краю
      const top = (u) => h - 0.06 - (pennant ? (wide / 2) * u : 0);
      const bot = (u) => h - 0.06 - wide + (pennant ? (wide / 2) * u : 0);
      const y = (u, v) => top(u) + (bot(u) - top(u)) * v;
      const v0 = j / rows;
      const v1 = (j + 1) / rows;
      const a = [R + u0 * len, y(u0, v0), 0];
      const b = [R + u1 * len, y(u1, v0), 0];
      const d = [R + u0 * len, y(u0, v1), 0];
      const e = [R + u1 * len, y(u1, v1), 0];
      tri(a, d, b, cols[j], u0, u0, u1);
      tri(b, d, e, cols[j], u1, u0, u1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('aWave', new THREE.Float32BufferAttribute(wave, 1));
  return g;
}

const TIME = { value: 0 }; // общее время всех полотнищ
/** Куда смотрят флаги и насколько вытянуты (0…1) — чтобы вымпелы на лодках у причала вели себя так же. */
export const wind = { dir: 0.9, k: 0.3 };
/**
 * Вымпел на коротком шесте — для лодки. Материал свой (сила ветра у каждой лодки своя: на ходу вымпел вытянут),
 * но программа та же, что у флагов на берегу: новой сборки шейдера нет. Сила ветра — в mesh.userData.wind.value.
 */
export function makePennant(h, len, wide, cols) {
  const U = { uT: TIME, uWind: { value: 0.3 } };
  const m = new THREE.Mesh(flagGeometry(h, len, wide, cols, true), clothMaterial(U));
  m.castShadow = false;
  m.frustumCulled = false;
  m.name = 'pennant';
  m.userData.wind = U.uWind;
  return m;
}

export class Flags {
  /** list: [{ x, z, y?, h, len, wide, cols, pennant }] — где стоят шесты (y — высота основания; нет — по земле). */
  constructor(scene, list) {
    this.U = { uT: TIME, uWind: { value: 0.3 } };
    const mat = clothMaterial(this.U);
    this.items = list.map((f) => {
      const m = new THREE.Mesh(flagGeometry(f.h, f.len, f.wide, f.cols, !!f.pennant), mat);
      m.position.set(f.x, f.y ?? groundH(f.x, f.z), f.z);
      m.castShadow = false;
      m.frustumCulled = false; // волна выносит полотнище за исходные границы
      m.name = 'flag';
      scene.add(m);
      return m;
    });
    this.dir = 0.9;
  }
  /** t — время, force — сила ветра 0…1. Полотнища смотрят по ветру, он понемногу гуляет. */
  update(t, force) {
    this.U.uT.value = t;
    this.U.uWind.value += (Math.min(1, 0.15 + force) - this.U.uWind.value) * 0.02;
    const want = 0.9 + Math.sin(t * 0.021) * 0.5 + Math.sin(t * 0.13) * 0.08;
    this.dir = want;
    wind.dir = want;
    wind.k = this.U.uWind.value;
    for (const m of this.items) m.rotation.y = this.dir;
  }
}

const RAYS_V = /* glsl */ `
uniform float uZ;
varying vec2 vP;
void main() {
  vP = position.xy;
  gl_Position = vec4(position.xy, uZ, 1.0);
}`;
const RAYS_F = /* glsl */ `
uniform vec3 uCol;
uniform vec2 uSun;
uniform float uK, uT, uAspect;
varying vec2 vP;
void main() {
  vec2 d = vP - uSun;
  d.x *= uAspect;
  float r = length(d);
  float a = atan(d.y, d.x);
  // веер лучей: несколько гармоник по углу, медленно переливаются; у самого солнца и вдали — гаснут
  float rays = 0.55 + 0.45 * sin(a * 7.0 + uT * 0.05) * sin(a * 13.0 - uT * 0.08 + 1.7);
  rays *= 0.6 + 0.4 * sin(a * 29.0 + uT * 0.11 + 0.6);
  rays = pow(max(rays, 0.0), 1.6);
  float fall = exp(-r * 1.55) * smoothstep(0.02, 0.22, r);
  float glow = exp(-r * 4.2) * 0.35;
  float v = (rays * fall + glow) * uK;
  gl_FragColor = vec4(uCol * v, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class SunRays {
  constructor(scene) {
    this.U = { uCol: { value: new THREE.Color('#ffd9a0') }, uSun: { value: new THREE.Vector2() }, uK: { value: 0 }, uT: { value: 0 }, uAspect: { value: 1.78 }, uZ: { value: 0.99 } };
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); // один треугольник на весь кадр
    const m = (this.mesh = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: this.U, vertexShader: RAYS_V, fragmentShader: RAYS_F, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, fog: false })));
    m.frustumCulled = false;
    m.renderOrder = 4;
    m.visible = false;
    m.name = 'sunrays';
    scene.add(m);
    this.v = new THREE.Vector3();
    this.w = new THREE.Vector3();
    this.on = true;
  }
  /**
   * sunDir — куда светит солнце (единичный вектор от земли к солнцу), color — его цвет, k — сила 0…1 (0 — днём и ночью),
   * depth — на какой глубине (в метрах) стоит свет: ближе этого предметы лучи перекрывают.
   */
  update(camera, sunDir, color, k, t, depth = 55) {
    const U = this.U;
    let kk = 0;
    if (this.on && k > 0.01) {
      // где солнце на экране; за спиной или далеко за краем кадра — лучей нет
      const front = sunDir.dot(camera.getWorldDirection(this.w)) > 0.1;
      const v = this.v.copy(sunDir).multiplyScalar(1000).add(camera.position).project(camera);
      if (front && Math.abs(v.x) < 1.7 && Math.abs(v.y) < 1.5) {
        U.uSun.value.set(v.x, v.y);
        kk = k * (1 - Math.max(0, Math.abs(v.x) - 1) / 0.7) * (1 - Math.max(0, Math.abs(v.y) - 0.9) / 0.6);
      }
    }
    U.uK.value += (Math.max(0, kk) - U.uK.value) * 0.08;
    this.mesh.visible = U.uK.value > 0.004;
    if (!this.mesh.visible) return;
    U.uT.value = t;
    U.uCol.value.copy(color);
    U.uAspect.value = camera.aspect;
    // глубина в координатах кадра для расстояния depth
    const n = camera.near, f = camera.far;
    U.uZ.value = ((f + n) / (f - n) * depth - (2 * f * n) / (f - n)) / depth;
  }
}
