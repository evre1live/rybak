// Склейка неподвижных деталей мира в один меш с цветами по вершинам — сотни досок и камней за один вызов отрисовки.
import * as THREE from 'three';
import { patchSurface } from './surface.js';

const _v = new THREE.Vector3();
const _n = new THREE.Vector3();
const _nm = new THREE.Matrix3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _c = new THREE.Color();
const _c2 = new THREE.Color();
const _hsl = { h: 0, s: 0, l: 0 };

export function M(x, y, z, sx = 1, sy = sx, sz = sx, rx = 0, ry = 0, rz = 0) {
  _e.set(rx, ry, rz, 'YXZ');
  _q.setFromEuler(_e);
  return _m.compose(_v.set(x, y, z), _q, _n.set(sx, sy, sz)).clone();
}

const geoCache = new Map();
/** Общие заготовки: куб, цилиндр, конус, шар, тор. */
export const G = {
  box: () => cached('box', () => new THREE.BoxGeometry(1, 1, 1)),
  cyl: (seg = 10, top = 1, bot = 1) => cached(`cyl${seg}|${top}|${bot}`, () => new THREE.CylinderGeometry(0.5 * top, 0.5 * bot, 1, seg)),
  cone: (seg = 8) => cached('cone' + seg, () => new THREE.ConeGeometry(0.5, 1, seg)),
  sph: (w = 12, h = 8) => cached(`sph${w}|${h}`, () => new THREE.SphereGeometry(0.5, w, h)),
  ico: (d = 1) => cached('ico' + d, () => new THREE.IcosahedronGeometry(0.5, d)),
  torus: (tube = 0.18, seg = 14, arc = Math.PI * 2) => cached(`tor${tube}|${seg}|${arc.toFixed(3)}`, () => new THREE.TorusGeometry(0.5, tube * 0.5, 6, seg, arc)),
  prism: () => cached('prism', () => {
    // двускатная крыша: треугольная призма шириной 1 (x), высотой 1 (y), длиной 1 (z)
    const s = new THREE.Shape();
    s.moveTo(-0.5, 0);
    s.lineTo(0.5, 0);
    s.lineTo(0, 1);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
    g.translate(0, 0, -0.5);
    return g;
  })
};
function cached(key, make) {
  let g = geoCache.get(key);
  if (!g) geoCache.set(key, (g = make()));
  return g;
}

const plain = new WeakMap();
const flats = new WeakMap();

export class Batch {
  constructor() {
    this.pos = [];
    this.nor = [];
    this.col = [];
    this.mid = []; // номер материала для фактуры (surface.js)
    this.tex = []; // координаты волокон: x — вдоль длинной стороны детали, в метрах
    this.mat = 0; // материал по умолчанию для следующих деталей
    this.auto = false; // подбирать материал по цвету детали
    this.hasMat = false;
    this.parts = 0;
  }
  /**
   * opts.grad: [k внизу, k вверху] — затемнение по высоте детали (ложная тень у основания);
   * opts.top: [цвет, порог] — верхние грани красим другим цветом (трава на камнях). У камня (материал 2) мох кладёт
   *   шейдер — по каждой точке, с рваной границей (surface.js): цвет вершин остаётся каменным, а порог уходит в aTex;
   * opts.soft: камень-валун — рисунок кладки на нём едва намечен (на гладком валуне резкие «плиты» смотрятся сеткой);
   * opts.flat: пересчитать нормали по граням;
   * opts.mat: материал этой детали (иначе — this.mat).
   */
  add(geo, color, matrix, opts = null) {
    let g = plain.get(geo);
    if (!g) plain.set(geo, (g = geo.index ? geo.toNonIndexed() : geo));
    const p = g.attributes.position;
    let nAttr = g.attributes.normal;
    if (opts && opts.flat) {
      let f = flats.get(geo);
      if (!f) {
        f = g.clone();
        f.computeVertexNormals();
        flats.set(geo, f);
      }
      nAttr = f.attributes.normal;
    }
    _c.set(color);
    _nm.getNormalMatrix(matrix);
    let y0 = Infinity;
    let y1 = -Infinity;
    if (opts && opts.grad) {
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
    if (opts && opts.top) _c2.set(opts.top[0]);
    let mat = opts && opts.mat !== undefined ? opts.mat : this.mat;
    if (this.auto && !mat && !(opts && opts.mat === 0)) {
      // материал по цвету: коричневое — дерево, светло-песочное — верёвка и холст; крашеное, металл и пластик — гладкие
      _c.getHSL(_hsl);
      const deg = _hsl.h * 360;
      if (deg > 14 && deg < 48 && _hsl.s > 0.2 && _hsl.s < 0.8 && _hsl.l > 0.14 && _hsl.l < 0.72) mat = 1;
      else if (deg >= 36 && deg < 60 && _hsl.l >= 0.72 && _hsl.l < 0.9 && _hsl.s > 0.3) mat = 5;
    }
    // оси детали по убыванию размера: волокна дерева идут вдоль самой длинной
    let ax = 0;
    let ay = 1;
    let az = 2;
    const e = matrix.elements;
    const sc = [Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10])];
    if (mat === 1 || mat === 5 || mat === 7) {
      const o = [0, 1, 2].sort((a, b) => sc[b] - sc[a]);
      ax = o[0];
      ay = o[1];
      az = o[2];
    }
    const off = mat ? ((++this.parts * 0.6180339887) % 1) * 9 : 0;
    if (mat) this.hasMat = true;
    const mossy = mat === 2 && opts && opts.top;
    for (let i = 0; i < p.count; i++) {
      _v.fromBufferAttribute(p, i);
      if (mat === 2) this.tex.push((mossy ? 1 : 0) + (opts && opts.soft ? 2 : 0), mossy ? opts.top[1] : 2, off);
      else if (mat) {
        const l = [_v.x * sc[0], _v.y * sc[1], _v.z * sc[2]];
        if (mat === 4) this.tex.push(l[0], l[1], l[2]);
        else this.tex.push(l[ax] + off, l[ay] + off * 0.37, l[az]);
      } else this.tex.push(0, 0, 0);
      this.mid.push(mat);
      let k = 1;
      if (opts && opts.grad) k = opts.grad[0] + ((opts.grad[1] - opts.grad[0]) * (_v.y - y0)) / Math.max(1e-6, y1 - y0);
      _v.applyMatrix4(matrix);
      this.pos.push(_v.x, _v.y, _v.z);
      _n.fromBufferAttribute(nAttr, i).applyMatrix3(_nm).normalize();
      this.nor.push(_n.x, _n.y, _n.z);
      if (opts && opts.top && !mossy && _n.y > opts.top[1]) this.col.push(_c2.r * k, _c2.g * k, _c2.b * k);
      else this.col.push(_c.r * k, _c.g * k, _c.b * k);
    }
    return this;
  }
  get empty() {
    return !this.pos.length;
  }
  build(material, shadow = true) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    if (this.hasMat) {
      g.setAttribute('aMat', new THREE.Float32BufferAttribute(this.mid, 1));
      g.setAttribute('aTex', new THREE.Float32BufferAttribute(this.tex, 3));
    }
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, material || BATCH_MAT);
    m.castShadow = shadow;
    m.receiveShadow = true;
    this.pos = this.nor = this.col = this.mid = this.tex = null;
    return m;
  }
}
export const BATCH_MAT = patchSurface(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 }));
export const BATCH_MAT_2S = patchSurface(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0, side: THREE.DoubleSide }));
