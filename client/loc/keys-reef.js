// Коралловые сады «Коралловых островков»: то, что видно сквозь прозрачную воду лагуны с причала и из лодки.
//
// Кораллы собраны кодом: ветвистые, столы, мозговики, столбики, трубчатые губки, актинии, грибы — жёсткие;
// веера и морские плети — мягкие, качаются на течении. Каждый вид — одна заготовка (несколько вариантов), а сад —
// тысячи её копий: один вызов отрисовки на заготовку, цвет у каждой копии свой. Растут они в садах на дне лагуны
// и кольцом за гребнем рифа (GARDENS и reefM в loc/keys.js); пятна одного цвета идут куртинами, как на рифе.
// В отражении воды их нет (слой 1). На слабых видеокартах кораллов меньше (setDetail).
import * as THREE from 'three';
import { patchModel } from '../surface.js';
import { rng, TAU, fbm2, isTouch } from '../util.js';
import { GARDENS, groundH, gardenK, reefM, passK, homeD, rimAt, inRocks, deckAt, ARCH, STACKS } from './keys.js';

// ── заготовки: высота 1, низ в нуле; цвет вершин — оттенок серого (тень у основания, светлые кончики) ──
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const norm = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
class Geo {
  constructor() {
    this.pos = [];
    this.col = [];
  }
  tri(a, b, c, ca, cb = ca, cc = ca) {
    this.pos.push(...a, ...b, ...c);
    this.col.push(ca, ca, ca, cb, cb, cb, cc, cc, cc);
  }
  /** Сужающаяся трубка от p к q: радиусы r0 и r1, n граней; c0, c1 — цвет у основания и на конце. cap — закрыть конец остриём. */
  tube(p, q, r0, r1, n, c0, c1, cap = 0) {
    const d = norm(sub(q, p));
    const u = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
    const v = cross(d, u);
    const ring = (o, r) => Array.from({ length: n }, (_, i) => {
      const a = (i / n) * TAU;
      return add(add(o, u, Math.cos(a) * r), v, Math.sin(a) * r);
    });
    const A = ring(p, r0);
    const B = ring(q, r1);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      this.tri(A[i], B[i], A[j], c0, c1, c0);
      this.tri(A[j], B[i], B[j], c0, c1, c1);
    }
    if (cap) {
      const tip = add(q, d, cap);
      for (let i = 0; i < n; i++) this.tri(B[i], tip, B[(i + 1) % n], c1, c1 * 1.12, c1);
    }
    return this;
  }
  /** Привести к высоте 1 (низ в нуле) и собрать геометрию с плоскими гранями. */
  build(fit = true) {
    const p = this.pos;
    if (fit) {
      let y0 = Infinity;
      let y1 = -Infinity;
      for (let i = 1; i < p.length; i += 3) {
        y0 = Math.min(y0, p[i]);
        y1 = Math.max(y1, p[i]);
      }
      const k = 1 / (y1 - y0);
      for (let i = 0; i < p.length; i += 3) {
        p[i] *= k;
        p[i + 1] = (p[i + 1] - y0) * k;
        p[i + 2] *= k;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeVertexNormals();
    return g;
  }
}
/** Ветвистый коралл («оленьи рога»): ствол, три ветви, от каждой — по две-три веточки. */
function branchGeo(seed) {
  const r = rng(seed);
  const g = new Geo();
  const grow = (p, d, len, rad, depth) => {
    const q = add(p, d, len);
    const last = depth === 2;
    g.tube(p, q, rad, rad * 0.64, last ? 3 : 4, 0.58 + depth * 0.16, 0.72 + depth * 0.18, last ? rad * 1.3 : 0);
    if (last) return;
    const n = depth === 0 ? 3 : 2 + (r() < 0.4 ? 1 : 0);
    const a0 = r() * TAU;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * TAU + (r() - 0.5) * 0.7;
      const out = 0.55 + r() * 0.45;
      grow(q, norm([d[0] * 0.5 + Math.cos(a) * out, d[1] * 0.5 + 0.55 + r() * 0.3, d[2] * 0.5 + Math.sin(a) * out]), len * (0.72 + r() * 0.2), rad * 0.64, depth + 1);
    }
  };
  grow([0, 0, 0], [0, 1, 0], 0.26, 0.075, 0);
  return g.build();
}
/** Стол: ножка и одна-две плоские тарелки с неровным краем. */
function tableGeo(seed, tiers = 1) {
  const r = rng(seed);
  const g = new Geo();
  g.tube([0, 0, 0], [0, 0.5, 0], 0.11, 0.16, 5, 0.5, 0.7);
  for (let t = 0; t < tiers; t++) {
    const y = 0.5 + t * 0.3;
    const R = 0.62 - t * 0.2;
    const ox = t ? (r() - 0.5) * 0.3 : 0;
    const oz = t ? (r() - 0.5) * 0.3 : 0;
    const n = 9;
    const rim = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * TAU;
      const k = R * (0.82 + r() * 0.3);
      return [ox + Math.cos(a) * k, y + (r() - 0.5) * 0.04, oz + Math.sin(a) * k];
    });
    const top = [ox, y - 0.05, oz];
    const bot = [ox, y - 0.16, oz];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      g.tri(top, rim[j], rim[i], 0.58, 1.0, 1.0);
      g.tri(bot, rim[i], rim[j], 0.42, 0.66, 0.66);
    }
    if (t) g.tube([0, 0.45, 0], [ox, y - 0.1, oz], 0.08, 0.1, 4, 0.6, 0.7);
  }
  return g.build();
}
/** Мозговик: приплюснутый бугристый купол. */
function brainGeo(seed) {
  const g = new Geo();
  const ico = new THREE.IcosahedronGeometry(1, 1).toNonIndexed();
  const p = ico.attributes.position;
  const v = [];
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    const k = 1 + 0.2 * (fbm2(x * 1.7 + seed, z * 1.7 + y * 1.3 + seed * 0.37, 2) - 0.5);
    x *= k;
    z *= k;
    y = Math.max(-0.12, y * k) * 0.66;
    v.push([x, y, z]);
  }
  for (let i = 0; i < v.length; i += 3) {
    const c = (a) => 0.52 + 0.5 * Math.max(0, a[1] / 0.66);
    if (v[i][1] <= -0.07 && v[i + 1][1] <= -0.07 && v[i + 2][1] <= -0.07) continue; // низ не виден
    g.tri(v[i], v[i + 1], v[i + 2], c(v[i]), c(v[i + 1]), c(v[i + 2]));
  }
  return g.build();
}
/** Столбики: тесная группа вертикальных пальцев с острыми макушками. */
function pillarGeo(seed) {
  const r = rng(seed);
  const g = new Geo();
  const n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + r() * 0.6;
    const d = i ? 0.13 + r() * 0.12 : 0;
    const h = 0.55 + r() * 0.45 - d * 0.6;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    const lean = 0.12;
    g.tube([x, 0, z], [x * (1 + lean), h, z * (1 + lean)], 0.085, 0.07, 5, 0.56, 0.98, 0.09);
  }
  return g.build();
}
/** Трубчатая губка: несколько открытых труб, внутри темно. */
function tubesGeo(seed) {
  const r = rng(seed);
  const g = new Geo();
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + r() * 0.8;
    const d = i ? 0.14 + r() * 0.1 : 0.02;
    const h = 0.5 + r() * 0.5;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    const top = [x * 1.9, h, z * 1.9];
    const R = 0.085 + r() * 0.03;
    g.tube([x, 0, z], top, R * 0.7, R, 5, 0.6, 1.08);
    // тёмное нутро: донце чуть ниже края
    const m = 5;
    const c = [top[0] * 0.97, h - 0.07, top[2] * 0.97];
    for (let k = 0; k < m; k++) {
      const a0 = (k / m) * TAU;
      const a1 = ((k + 1) / m) * TAU;
      g.tri(c, [c[0] + Math.cos(a1) * R * 0.9, c[1] + 0.05, c[2] + Math.sin(a1) * R * 0.9], [c[0] + Math.cos(a0) * R * 0.9, c[1] + 0.05, c[2] + Math.sin(a0) * R * 0.9], 0.2, 0.34, 0.34);
    }
  }
  return g.build();
}
/** Актиния: подушка с венцом щупалец — кончики светлые. */
function anemoneGeo(seed) {
  const r = rng(seed);
  const g = new Geo();
  const n = 7;
  const base = Array.from({ length: n }, (_, i) => [Math.cos((i / n) * TAU) * 0.42, 0, Math.sin((i / n) * TAU) * 0.42]);
  const mid = Array.from({ length: n }, (_, i) => [Math.cos((i / n) * TAU) * 0.36, 0.3, Math.sin((i / n) * TAU) * 0.36]);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    g.tri(base[i], mid[i], base[j], 0.5, 0.7, 0.5);
    g.tri(base[j], mid[i], mid[j], 0.5, 0.7, 0.7);
    g.tri([0, 0.36, 0], mid[j], mid[i], 0.8, 0.7, 0.7);
  }
  for (let i = 0; i < 13; i++) {
    const a = r() * TAU;
    const d = 0.08 + r() * 0.26;
    const p = [Math.cos(a) * d, 0.3, Math.sin(a) * d];
    const out = 0.25 + d * 1.5;
    g.tube(p, [p[0] + Math.cos(a) * out * (0.5 + r() * 0.5), 0.62 + r() * 0.38, p[2] + Math.sin(a) * out * (0.5 + r() * 0.5)], 0.045, 0.018, 3, 0.85, 1.7);
  }
  return g.build();
}
/** Гриб (кожистый коралл): короткая ножка и широкая волнистая шляпка. */
function mushroomGeo(seed) {
  const r = rng(seed);
  const g = new Geo();
  g.tube([0, 0, 0], [0, 0.42, 0], 0.16, 0.22, 5, 0.5, 0.72);
  const n = 8;
  const rim = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU;
    const k = 0.5 + r() * 0.16;
    return [Math.cos(a) * k, 0.4 + (i % 2 ? 0.07 : -0.03) + r() * 0.05, Math.sin(a) * k];
  });
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    g.tri([0, 0.62, 0], rim[j], rim[i], 1.08, 0.86, 0.86);
    g.tri([0, 0.36, 0], rim[i], rim[j], 0.5, 0.62, 0.62);
  }
  return g.build();
}
/** Веер (горгония): плоский лист на ножке, обе стороны. Стоит поперёк оси Z. */
function fanGeo(seed) {
  const r = rng(seed);
  const g = new Geo();
  g.tube([0, 0, 0], [0, 0.2, 0], 0.035, 0.03, 3, 0.5, 0.6);
  const n = 9;
  const rim = Array.from({ length: n + 1 }, (_, i) => {
    const a = Math.PI * (0.04 + 0.92 * (i / n));
    const k = 0.62 + r() * 0.3;
    return [Math.cos(a) * k * 0.9, 0.2 + Math.sin(a) * k, 0];
  });
  const o = [0, 0.2, 0];
  for (let i = 0; i < n; i++) {
    g.tri(o, rim[i], rim[i + 1], 0.62, 1.1, 1.1);
    g.tri(o, rim[i + 1], rim[i], 0.62, 1.1, 1.1);
  }
  return g.build();
}
/** Морская плеть: несколько тонких гибких прутьев. */
function whipGeo(seed) {
  const r = rng(seed);
  const g = new Geo();
  const n = 4 + Math.floor(r() * 2);
  for (let b = 0; b < n; b++) {
    const a = (b / n) * TAU + r();
    const lean = 0.12 + r() * 0.2;
    const h = 0.7 + r() * 0.3;
    let p = [Math.cos(a) * 0.04, 0, Math.sin(a) * 0.04];
    for (let s = 1; s <= 4; s++) {
      const t = s / 4;
      const q = [Math.cos(a) * (0.04 + lean * t * t), h * t, Math.sin(a) * (0.04 + lean * t * t)];
      g.tube(p, q, 0.03 * (1.15 - t * 0.5), 0.03 * (1.15 - (t + 0.25) * 0.5), 3, 0.55 + t * 0.4, 0.65 + t * 0.45, s === 4 ? 0.03 : 0);
      p = q;
    }
  }
  return g.build();
}

// Краски рифа. Куртина растёт одного тона (палитра), внутри неё кораллы чуть разнятся.
// (цвета взяты глубже и гуще, чем хочется видеть: свет сквозь воду и сетка бликов высветляют их)
const PALETTES = [
  ['#ff5c9a', '#f0468a', '#ff78ac', '#e84f96'], // розовая
  ['#a05cf0', '#8c48e0', '#b478f8', '#9450dc'], // лиловая
  ['#f0c020', '#b4cc30', '#e0a818', '#98c040'], // жёлто-зелёная
  ['#ff5a3c', '#ff8830', '#f04c38', '#ff6c40'], // коралловая с оранжевым
  ['#18c0a8', '#2c90e8', '#20ccb8', '#4078e8'], // бирюзовая с голубым
  ['#e040c0', '#ff509c', '#c848d8', '#f060c8'] // пурпурная
];
const CREAM = '#e6d2aa';

/**
 * Собрать сады. Возвращает { meshes, setDetail(k), stats() }: k от 0 до 1 — доля кораллов (на слабых видеокартах меньше).
 */
export function buildReef(scene) {
  const lite = isTouch();
  // виды: [имя, заготовки, мягкий ли]
  const KINDS = {
    branch: [branchGeo(11), branchGeo(29), branchGeo(47)],
    table: [tableGeo(5), tableGeo(13, 2)],
    brain: [brainGeo(3), brainGeo(17)],
    pillar: [pillarGeo(7), pillarGeo(23)],
    tubes: [tubesGeo(9), tubesGeo(31)],
    anemone: [anemoneGeo(2)],
    mushroom: [mushroomGeo(6)],
    fan: [fanGeo(4), fanGeo(19)],
    whip: [whipGeo(8)]
  };
  const SOFT = { fan: 0.045, whip: 0.11 };
  const lists = {}; // имя заготовки → [x, y, z, sx, sy, sz, yaw, цвет]
  const put = (kind, v, rec) => (lists[kind + v] ||= []).push(rec);
  const r = rng(230420);
  const c = new THREE.Color();
  const hsl = { h: 0, s: 0, l: 0 };
  const tone = (hex, dl, ds = 0) => {
    c.set(hex).getHSL(hsl);
    c.setHSL(hsl.h, Math.min(1, hsl.s * (1 + ds)), Math.min(0.9, Math.max(0.1, hsl.l + dl)));
    // темнее, чем краска: кораллы стоят под ярким солнцем, и светлое выгорает в белёсое
    return [c.r * 0.86, c.g * 0.86, c.b * 0.86];
  };
  /** Один коралл в точке: вид — по глубине и случаю, цвет — по куртине. dense — насколько густо (0…1). */
  const plant = (x, z, dense) => {
    const d = -groundH(x, z);
    if (d < 0.75 || d > 6.6 || inRocks(x, z) || deckAt(x, z, -1.2)) return false;
    const room = d - 0.28; // выше нельзя: макушка должна остаться под водой
    const pal = PALETTES[Math.floor(fbm2(x * 0.045 + 3, z * 0.045 + 9, 2) * 2.3 * PALETTES.length) % PALETTES.length];
    const col = () => tone(r() < 0.08 ? CREAM : pal[Math.floor(r() * pal.length)], (r() - 0.6) * 0.08, 0.1);
    const k = r();
    const yaw = r() * TAU;
    const y = -d - 0.04;
    let kind;
    let h;
    let w;
    if (d < 1.5) {
      // у самой поверхности — низкое и плотное
      kind = k < 0.4 ? 'brain' : k < 0.62 ? 'mushroom' : k < 0.8 ? 'anemone' : k < 0.92 ? 'table' : 'pillar';
    } else if (d < 3.6) {
      kind = k < 0.36 ? 'branch' : k < 0.47 ? 'table' : k < 0.62 ? 'brain' : k < 0.76 ? 'pillar' : k < 0.84 ? 'tubes' : k < 0.88 ? 'fan' : k < 0.94 ? 'anemone' : k < 0.97 ? 'mushroom' : 'whip';
    } else {
      kind = k < 0.28 ? 'branch' : k < 0.46 ? 'brain' : k < 0.58 ? 'fan' : k < 0.76 ? 'tubes' : k < 0.9 ? 'whip' : 'pillar';
    }
    const big = r() < 0.12 ? 1.3 + r() * 0.45 : 1;
    switch (kind) {
      case 'branch': h = (0.55 + r() * 0.75) * big; w = h * (1.0 + r() * 0.35); break;
      case 'table': h = 0.3 + r() * 0.3; w = h * (1.3 + r() * 0.7); break;
      case 'brain': h = (0.3 + r() * 0.42) * big; w = h * (1.3 + r() * 0.45); break;
      case 'pillar': h = (0.6 + r() * 0.8) * big; w = h * (0.8 + r() * 0.3); break;
      case 'tubes': h = 0.5 + r() * 0.7; w = h * (0.85 + r() * 0.3); break;
      case 'anemone': h = 0.28 + r() * 0.22; w = h * (1.5 + r() * 0.5); break;
      case 'mushroom': h = 0.3 + r() * 0.3; w = h * (1.5 + r() * 0.5); break;
      case 'fan': h = 0.5 + r() * 0.65; w = h * (0.8 + r() * 0.25); break;
      default: h = 0.9 + r() * 1.1; w = h * 0.6;
    }
    if (h > room) {
      w *= room / h;
      h = room;
    }
    if (h < 0.2) return false;
    const list = KINDS[kind];
    put(kind, Math.floor(r() * list.length), [x, y, z, w, h, w * (kind === 'fan' ? 1 : 0.85 + r() * 0.3), yaw, col()]);
    // вокруг крупного — мелочь того же цвета: риф растёт гроздьями
    if (dense > 0.5 && r() < 0.35) {
      const n = 1 + Math.floor(r() * 2);
      for (let i = 0; i < n; i++) {
        const a = r() * TAU;
        const px = x + Math.cos(a) * (0.5 + r() * 0.7);
        const pz = z + Math.sin(a) * (0.5 + r() * 0.7);
        const pd = -groundH(px, pz);
        if (pd < 0.8) continue;
        const hh = Math.min(pd - 0.3, 0.22 + r() * 0.25);
        if (hh < 0.15) continue;
        const kk = r() < 0.5 ? 'brain' : r() < 0.5 ? 'mushroom' : 'anemone';
        put(kk, Math.floor(r() * KINDS[kk].length), [px, -pd - 0.03, pz, hh * 1.6, hh, hh * 1.6, r() * TAU, col()]);
      }
    }
    return true;
  };
  // сады: густо в середине, реже к краю
  const DENS = lite ? 0.2 : 0.3; // кораллов на квадратный метр сада
  for (const g of GARDENS) {
    const n = Math.round(Math.PI * g.r * g.r * DENS);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU;
      const d = Math.sqrt(r()) * g.r;
      const x = g.x + Math.cos(a) * d;
      const z = g.z + Math.sin(a) * d;
      const k = gardenK(x, z);
      if (k < 0.12 || r() > 0.35 + k) continue;
      plant(x, z, k);
    }
  }
  // кольцо за гребнем рифа: полоса в два десятка метров по всей лагуне, кроме проходов и берега домашнего островка
  const RING_N = lite ? 900 : 1700;
  for (let i = 0; i < RING_N; i++) {
    const [x, z] = rimAt(r() * TAU, 5 + r() * 21);
    if (passK(x, z) > 0.22 || homeD(x, z) > -15) continue;
    const m = reefM(x, z);
    if (m < 4 || m > 28) continue;
    if (fbm2(x * 0.06 + 40, z * 0.06 + 7, 2) < 0.42) continue; // пятнами
    plant(x, z, 0.6);
  }
  // у опор арки и под столбами: веера и губки на камне
  for (const [cx, cz, rr] of [[ARCH.x - 6.9, ARCH.z, 7], [ARCH.x + 6.9, ARCH.z, 7], ...STACKS.map((s) => [s[0], s[1], s[2] + 3])]) {
    for (let i = 0; i < 26; i++) {
      const a = r() * TAU;
      const d = 3 + r() * rr;
      plant(cx + Math.cos(a) * d, cz + Math.sin(a) * d, 0.4);
    }
  }

  const hard = patchModel(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 }));
  const softs = {};
  const meshes = [];
  const o = new THREE.Object3D();
  let total = 0;
  for (const kind in KINDS)
    KINDS[kind].forEach((geo, v) => {
      const list = lists[kind + v];
      if (!list || !list.length) return;
      // вперемешку: при меньшем числе (setDetail) сады редеют равномерно, а не пропадают целыми местами
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      let mat = hard;
      if (SOFT[kind]) mat = softs[kind] ||= patchModel(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0, side: kind === 'fan' ? THREE.FrontSide : THREE.FrontSide }), { sway: SOFT[kind] });
      const m = new THREE.InstancedMesh(geo, mat, list.length);
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(list.length * 3), 3);
      list.forEach(([x, y, z, sx, sy, sz, yaw, col], i) => {
        o.position.set(x, y, z);
        o.rotation.set(0, yaw, 0);
        o.scale.set(sx, sy, sz);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
        m.instanceColor.setXYZ(i, col[0], col[1], col[2]);
      });
      m.userData.total = list.length;
      m.frustumCulled = false;
      m.castShadow = false;
      m.receiveShadow = true;
      m.layers.set(1); // в отражении воды кораллов нет
      m.name = 'reef-' + kind + v;
      scene.add(m);
      meshes.push(m);
      total += list.length;
    });
  return {
    meshes,
    total,
    /** Сколько кораллов рисовать: k от 0 до 1. */
    setDetail(k) {
      for (const m of meshes) m.count = Math.max(1, Math.round(m.userData.total * (0.45 + 0.55 * k)));
    },
    stats() {
      return { corals: meshes.reduce((s, m) => s + m.count, 0), of: total, kinds: meshes.length, tris: meshes.reduce((s, m) => s + (m.count * m.geometry.attributes.position.count) / 3, 0) };
    }
  };
}
