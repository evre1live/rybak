// Мелкие помощники: математика, шум, текстуры на canvas.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const damp = (cur, target, k, dt) => cur + (target - cur) * (1 - Math.exp(-k * dt));
export const TAU = Math.PI * 2;
export function angDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(ix, iz) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export function noise2(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm2(x, z, oct = 4) {
  let s = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    s += amp * noise2(x * f, z * f);
    f *= 2.03;
    amp *= 0.5;
  }
  return s / (1 - Math.pow(0.5, oct));
}

export function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = opts.data ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (Array.isArray(opts.repeat)) t.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  t.anisotropy = opts.aniso || 4;
  if (opts.nearest) {
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  }
  return t;
}

const matCache = new Map();
/** Кэш простых материалов: один цвет — один материал. */
export function mat(color, rough = 0.85, metal = 0, extra = null) {
  const key = extra ? null : `${color}|${rough}|${metal}`;
  if (key && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...(extra || {}) });
  if (key) matCache.set(key, m);
  return m;
}
export const col = (hex) => new THREE.Color(hex);
export function shade(hex, k) {
  const c = new THREE.Color(hex);
  if (k >= 0) c.lerp(new THREE.Color('#ffffff'), k);
  else c.lerp(new THREE.Color('#000000'), -k);
  return '#' + c.getHexString();
}

/** Собрать меш и сразу поставить на место. */
export function mesh(geo, material, x = 0, y = 0, z = 0, parent = null, shadow = true) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  if (shadow) {
    m.castShadow = true;
    m.receiveShadow = true;
  }
  if (parent) parent.add(m);
  return m;
}

/**
 * Камень: глыба, «обтёсанная» случайными плоскостями, со скруглёнными рёбрами.
 * Берём частую сферу и прижимаем каждую вершину к ближайшей из плоскостей — получаются ровные грани,
 * а общие (сглаженные) нормали дают мягкий перелом на рёбрах вместо жёсткой гранёной «картошки».
 */
export function rockGeo(seed, detail = 2, rough = 0.38) {
  let g = new THREE.IcosahedronGeometry(1, detail + 1);
  g.deleteAttribute('uv');
  g.deleteAttribute('normal');
  g = mergeVertices(g, 1e-4);
  const p = g.attributes.position;
  const r = rng(seed);
  const planes = [];
  const n = 9 + Math.floor(r() * 6);
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3(r() * 2 - 1, (r() * 2 - 1) * 0.8, r() * 2 - 1).normalize();
    planes.push([v, 1 - r() * rough * 0.95]);
  }
  // верх и низ чуть приплюснуты — камень лежит, а не катится
  planes.push([new THREE.Vector3(0, 1, 0), 0.8 - r() * 0.12], [new THREE.Vector3(0, -1, 0), 0.72]);
  const ox = r() * 50;
  const oy = r() * 50;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let k = 1.18;
    for (const [pn, h] of planes) {
      const d = v.dot(pn);
      if (d > 0.05) k = Math.min(k, h / d);
    }
    k *= 1 + (fbm2(v.x * 2.1 + ox + v.z, v.y * 2.1 + oy - v.z, 2) - 0.5) * 0.07;
    p.setXYZ(i, v.x * k, v.y * k, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

/** Крона: пышный ком из «облачков» — сфера с крупными буграми и общими (мягкими) нормалями. */
export function blobGeo(seed, detail = 3, bump = 0.2) {
  let g = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('uv');
  g.deleteAttribute('normal');
  g = mergeVertices(g, 1e-4);
  const p = g.attributes.position;
  const r = rng(seed);
  // бугры: несколько случайных направлений, вокруг каждого крона выпирает
  const lumps = [];
  for (let i = 0; i < 9; i++) lumps.push([new THREE.Vector3(r() * 2 - 1, r() * 1.4 - 0.4, r() * 2 - 1).normalize(), 0.5 + r() * 0.5]);
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let k = 0;
    for (const [d, a] of lumps) k = Math.max(k, a * Math.max(0, (v.dot(d) - 0.55) / 0.45));
    const s = 1 - bump + bump * 2 * (k * k * (3 - 2 * k));
    p.setXYZ(i, v.x * s, v.y * s, v.z * s);
  }
  g.computeVertexNormals();
  return g;
}

export function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
  });
}

export const isTouch = () => 'ontouchstart' in window && matchMedia('(pointer: coarse)').matches;
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
