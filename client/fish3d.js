// Рыба в 3D: тело-лофт по профилю вида, плавники, раскраска на canvas. Голова смотрит влево (−X), длина тела — 1.
import * as THREE from 'three';
import { FISH_BY_ID } from '../shared/data.js';
import { loft, flat, tube } from './shapes.js';
import { canvasTex, rng, mat, shade } from './util.js';
import { G } from './batch.js';

// профиль: [t вдоль тела, полувысота, полуширина, смещение по высоте]
const PROFILES = {
  std: [[0, 0.012, 0.01, 0], [0.06, 0.07, 0.04, 0], [0.2, 0.13, 0.065, 0.005], [0.42, 0.15, 0.07, 0.01], [0.65, 0.115, 0.055, 0.005], [0.85, 0.055, 0.028, 0], [1, 0.03, 0.012, 0]],
  tall: [[0, 0.012, 0.01, 0], [0.06, 0.085, 0.04, 0], [0.2, 0.19, 0.065, 0.01], [0.42, 0.225, 0.07, 0.015], [0.65, 0.17, 0.055, 0.01], [0.85, 0.065, 0.028, 0], [1, 0.035, 0.012, 0]],
  carp: [[0, 0.02, 0.015, 0], [0.06, 0.085, 0.055, 0], [0.2, 0.15, 0.085, 0.01], [0.42, 0.175, 0.095, 0.015], [0.65, 0.135, 0.075, 0.01], [0.85, 0.065, 0.035, 0], [1, 0.04, 0.014, 0]],
  goby: [[0, 0.03, 0.03, 0], [0.05, 0.085, 0.075, 0], [0.18, 0.11, 0.085, 0], [0.4, 0.095, 0.065, 0], [0.65, 0.07, 0.045, 0], [0.85, 0.045, 0.025, 0], [1, 0.03, 0.012, 0]],
  slim: [[0, 0.01, 0.008, 0], [0.06, 0.05, 0.032, 0], [0.2, 0.09, 0.05, 0], [0.42, 0.1, 0.055, 0.004], [0.65, 0.08, 0.045, 0], [0.85, 0.04, 0.022, 0], [1, 0.022, 0.01, 0]],
  pike: [[0, 0.012, 0.02, -0.005], [0.08, 0.04, 0.04, -0.005], [0.2, 0.065, 0.05, 0], [0.45, 0.08, 0.055, 0], [0.7, 0.075, 0.048, 0], [0.86, 0.04, 0.025, 0], [1, 0.024, 0.01, 0]],
  needle: [[0, 0.004, 0.004, 0], [0.15, 0.012, 0.01, 0], [0.25, 0.03, 0.022, 0], [0.5, 0.035, 0.025, 0], [0.78, 0.03, 0.02, 0], [0.92, 0.016, 0.01, 0], [1, 0.012, 0.006, 0]],
  eel: [[0, 0.012, 0.012, 0], [0.04, 0.03, 0.028, 0], [0.12, 0.036, 0.032, 0], [0.5, 0.034, 0.03, 0], [0.8, 0.026, 0.02, 0], [0.95, 0.014, 0.008, 0], [1, 0.006, 0.004, 0]],
  tuna: [[0, 0.012, 0.012, 0], [0.06, 0.075, 0.06, 0], [0.2, 0.14, 0.105, 0], [0.4, 0.16, 0.115, 0], [0.62, 0.12, 0.085, 0], [0.82, 0.045, 0.03, 0], [0.94, 0.018, 0.022, 0], [1, 0.016, 0.01, 0]],
  sword: [[0, 0.012, 0.012, 0], [0.06, 0.06, 0.045, 0], [0.2, 0.105, 0.075, 0], [0.42, 0.115, 0.08, 0], [0.65, 0.085, 0.06, 0], [0.84, 0.035, 0.025, 0], [0.95, 0.016, 0.02, 0], [1, 0.014, 0.01, 0]],
  grouper: [[0, 0.04, 0.035, -0.01], [0.06, 0.11, 0.085, -0.005], [0.2, 0.19, 0.12, 0.005], [0.42, 0.21, 0.125, 0.01], [0.65, 0.165, 0.095, 0.005], [0.85, 0.08, 0.04, 0], [1, 0.05, 0.016, 0]],
  cat: [[0, 0.03, 0.05, -0.01], [0.05, 0.07, 0.1, -0.01], [0.16, 0.105, 0.115, 0], [0.35, 0.11, 0.095, 0], [0.6, 0.08, 0.06, 0], [0.82, 0.05, 0.03, 0], [1, 0.03, 0.01, 0]],
  flat: [[0, 0.012, 0.008, 0], [0.06, 0.1, 0.022, 0], [0.22, 0.2, 0.03, 0], [0.45, 0.23, 0.03, 0], [0.68, 0.17, 0.026, 0], [0.86, 0.06, 0.016, 0], [1, 0.035, 0.008, 0]]
};
// плавники: хвост, спинной [от, до, высота], анальный, второй спинной
const FINS = {
  std: { tail: 'fork', d: [0.3, 0.62, 0.1], a: [0.6, 0.78, 0.07] },
  tall: { tail: 'fork', d: [0.28, 0.68, 0.1], a: [0.58, 0.8, 0.08] },
  carp: { tail: 'fork', d: [0.3, 0.72, 0.09], a: [0.64, 0.8, 0.07] },
  goby: { tail: 'round', d: [0.25, 0.42, 0.08], d2: [0.48, 0.8, 0.075], a: [0.5, 0.8, 0.05] },
  slim: { tail: 'fork', d: [0.3, 0.5, 0.075], d2: [0.58, 0.76, 0.06], a: [0.6, 0.78, 0.055] },
  pike: { tail: 'fork', d: [0.68, 0.84, 0.085], a: [0.68, 0.84, 0.075] },
  needle: { tail: 'fork', d: [0.76, 0.9, 0.04], a: [0.74, 0.9, 0.04], tailK: 0.5 },
  eel: { tail: 'none', d: [0.3, 1.0, 0.03], a: [0.42, 1.0, 0.025] },
  tuna: { tail: 'cres', d: [0.26, 0.44, 0.11], d2: [0.55, 0.66, 0.13], a: [0.58, 0.69, 0.12] },
  sword: { tail: 'cres', d: [0.16, 0.36, 0.22], d2: [0.7, 0.78, 0.05], a: [0.62, 0.74, 0.08] },
  grouper: { tail: 'round', d: [0.24, 0.8, 0.09], a: [0.6, 0.8, 0.08] },
  cat: { tail: 'round', d: [0.26, 0.36, 0.08], a: [0.45, 0.95, 0.055], tailK: 0.75 },
  flat: { tail: 'round', d: [0.1, 0.9, 0.055], a: [0.12, 0.9, 0.055] }
};

function profileAt(P, t) {
  let i = 0;
  while (i < P.length - 2 && P[i + 1][0] < t) i++;
  const a = P[i];
  const b = P[i + 1];
  const k = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
  const s = k * k * (3 - 2 * k);
  return [a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s, a[3] + (b[3] - a[3]) * s];
}

function skin(look, seed) {
  const W = 128;
  const H = 256;
  return canvasTex(W, H, (g) => {
    const r = rng(seed);
    // вокруг тела: брюхо (0) → бок → спина (0.5) → бок → брюхо (1)
    const gr = g.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, look.belly);
    gr.addColorStop(0.16, look.belly);
    gr.addColorStop(0.3, look.side);
    gr.addColorStop(0.4, look.back);
    gr.addColorStop(0.6, look.back);
    gr.addColorStop(0.7, look.side);
    gr.addColorStop(0.84, look.belly);
    gr.addColorStop(1, look.belly);
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    const pc = look.patC || shade(look.back, -0.4);
    // canvas y: 0 — хвост, H — голова (v растёт к хвосту, а картинка перевёрнута)
    const both = (fn) => {
      fn(1);
      fn(-1);
    };
    const X = (a, side) => W / 2 + side * a * (W / 2); // a: 0 спина … 1 брюхо
    if (look.band) {
      g.globalAlpha = 0.75;
      g.fillStyle = look.band;
      both((s) => g.fillRect(Math.min(X(0.42, s), X(0.58, s)), look.shape === 'tall' ? H * 0.8 : 0, Math.abs(X(0.58, s) - X(0.42, s)), look.shape === 'tall' ? H * 0.08 : H * 0.92));
      g.globalAlpha = 1;
    }
    if (look.pat === 'scales' || look.pat === 'koi') {
      g.strokeStyle = 'rgba(0,0,0,0.13)';
      g.lineWidth = 1;
      for (let y = 6; y < H * 0.88; y += 7)
        for (let x = (y / 7) % 2 ? 0 : 4; x < W; x += 8) {
          g.beginPath();
          g.arc(x, y, 4, 0.1, Math.PI - 0.1);
          g.stroke();
        }
    }
    if (look.pat === 'bars') {
      g.fillStyle = pc;
      for (let i = 0; i < 6; i++) {
        const y = H * (0.12 + i * 0.13);
        g.globalAlpha = 0.8;
        both((s) => {
          g.beginPath();
          g.moveTo(X(0, s), y - 7);
          g.lineTo(X(0, s), y + 7);
          g.lineTo(X(0.62, s), y + 2);
          g.lineTo(X(0.62, s), y - 2);
          g.fill();
        });
      }
      g.globalAlpha = 1;
    } else if (look.pat === 'spots' || look.pat === 'dots') {
      g.fillStyle = pc;
      const n = look.pat === 'dots' ? 90 : 46;
      for (let i = 0; i < n; i++) {
        const a = r() * 0.6;
        const y = r() * H * 0.9;
        const rad = look.pat === 'dots' ? 1.2 + r() * 1.3 : 2.5 + r() * 3;
        g.globalAlpha = 0.85;
        both((s) => {
          g.beginPath();
          g.ellipse(X(a, s), y, rad * 0.8, rad * 1.5, 0, 0, 7);
          g.fill();
        });
      }
      g.globalAlpha = 1;
    } else if (look.pat === 'line' || look.pat === 'lines') {
      g.fillStyle = pc;
      const rows = look.pat === 'lines' ? [0.3, 0.42, 0.54, 0.66] : [0.47];
      for (const a of rows) both((s) => g.fillRect(X(a, s) - (look.pat === 'line' ? 2 : 1), 0, look.pat === 'line' ? 4 : 2, H * 0.9));
    } else if (look.pat === 'tiger') {
      g.strokeStyle = pc;
      g.lineWidth = 3.5;
      for (let i = 0; i < 16; i++) {
        const y = H * (0.06 + i * 0.052);
        both((s) => {
          g.beginPath();
          g.moveTo(X(0, s), y);
          g.quadraticCurveTo(X(0.2, s), y + 9, X(0.42, s), y - 3);
          g.stroke();
        });
      }
    } else if (look.pat === 'marble' || look.pat === 'koi') {
      const n = look.pat === 'koi' ? 9 : 26;
      for (let i = 0; i < n; i++) {
        g.fillStyle = look.pat === 'koi' ? (i % 3 === 2 ? '#e2452f' : pc) : pc;
        g.globalAlpha = look.pat === 'koi' ? 0.95 : 0.5;
        const a = r() * 0.75;
        const y = r() * H * 0.9;
        const rad = look.pat === 'koi' ? 9 + r() * 14 : 4 + r() * 9;
        const side = r() < 0.5 ? 1 : -1;
        g.beginPath();
        g.ellipse(X(a, side), y, rad * 0.7, rad * 1.3, r() * 3, 0, 7);
        g.fill();
        if (look.pat === 'marble') {
          g.beginPath();
          g.ellipse(X(a, -side), y, rad * 0.7, rad * 1.3, r() * 3, 0, 7);
          g.fill();
        }
      }
      g.globalAlpha = 1;
    }
    // голова чуть темнее, жаберная крышка
    const hd = g.createLinearGradient(0, H * 0.84, 0, H);
    hd.addColorStop(0, 'rgba(0,0,0,0)');
    hd.addColorStop(1, 'rgba(0,0,0,0.16)');
    g.fillStyle = hd;
    g.fillRect(0, H * 0.84, W, H * 0.16);
    g.strokeStyle = 'rgba(0,0,0,0.22)';
    g.lineWidth = 2;
    both((s) => {
      g.beginPath();
      g.moveTo(X(0.12, s), H * 0.8);
      g.quadraticCurveTo(X(0.5, s), H * 0.74, X(0.85, s), H * 0.82);
      g.stroke();
    });
  });
}

const cache = new Map();
function parts(sp) {
  if (cache.has(sp)) return cache.get(sp);
  const f = FISH_BY_ID[sp];
  const look = f.look;
  const shape = PROFILES[look.shape] ? look.shape : 'std';
  const P = PROFILES[shape];
  const fins = FINS[shape];
  const out = { look, shape, fins, P };
  if (shape === 'ray') {
    cache.set(sp, out);
    return out;
  }
  const N = 26;
  const sec = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [hh, hw, yo] = profileAt(P, t);
    const bend = shape === 'eel' ? Math.sin(t * Math.PI * 2.6) * 0.035 * t : 0;
    sec.push([t - 0.5, hh, hw, -yo, bend]);
  }
  const body = loft(sec, 18, shape === 'flat' ? 2 : 2.2, true);
  body.rotateZ(-Math.PI / 2);
  out.body = body;
  out.tex = skin(look, sp.length * 77 + sp.charCodeAt(0));
  out.bodyMat = new THREE.MeshStandardMaterial({ map: out.tex, roughness: 0.42, metalness: 0.08 });
  out.finMat = new THREE.MeshStandardMaterial({ color: look.fin, roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
  cache.set(sp, out);
  return out;
}

function finShape(P, range, h, up) {
  const [t0, t1] = range;
  const pts = [];
  const n = 6;
  const s = up ? 1 : -1;
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const [hh, , yo] = profileAt(P, t);
    pts.push([t - 0.5, yo + s * (hh - 0.012)]);
  }
  for (let i = n; i >= 0; i--) {
    const k = i / n;
    const t = t0 + (t1 - t0) * k + 0.03;
    const [hh, , yo] = profileAt(P, Math.min(1, t));
    const lift = h * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, k * 1.25 + 0.12)));
    pts.push([t - 0.5, yo + s * (hh + lift)]);
  }
  return flat(pts);
}

/** Собрать рыбу вида sp. Возвращает группу длиной 1 (масштабируйте сами) и хвост для анимации. */
export function buildFish(sp) {
  const pr = parts(sp);
  const { look, shape, fins, P } = pr;
  const g = new THREE.Group();
  const eyeW = mat('#f8fafc', 0.3);
  const eyeB = mat('#0b0f14', 0.2);
  if (look.shape === 'ray') {
    const top = new THREE.Mesh(G.sph(20, 12), new THREE.MeshStandardMaterial({ map: raySkin(look), roughness: 0.5 }));
    top.scale.set(0.86, 0.1, 1.0);
    g.add(top);
    const tail = new THREE.Mesh(tube([[0.36, 0, 0], [0.7, 0.01, 0.03], [1.0, 0, -0.02]], 0.016, 6, (t) => 1 - t * 0.8), mat(look.back, 0.6));
    g.add(tail);
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(G.sph(8, 6), eyeB);
      e.scale.setScalar(0.035);
      e.position.set(-0.26, 0.045, s * 0.09);
      g.add(e);
    }
    g.rotation.x = 0.95;
    const wrap = new THREE.Group();
    wrap.add(g);
    wrap.userData = { tail, shape: 'ray' };
    return wrap;
  }
  g.add(new THREE.Mesh(pr.body, pr.bodyMat));
  const finMat = pr.finMat;
  // хвост — отдельной группой: машет
  const tail = new THREE.Group();
  tail.position.x = 0.49;
  const k = fins.tailK || 1;
  let tg = null;
  if (fins.tail === 'fork') tg = flat([[0, 0.02], [0.2 * k, 0.17 * k], [0.24 * k, 0.16 * k], [0.14 * k, 0], [0.24 * k, -0.16 * k], [0.2 * k, -0.17 * k], [0, -0.02]]);
  else if (fins.tail === 'cres') tg = flat([[0, 0.015], [0.1, 0.2], [0.2, 0.3], [0.17, 0.2], [0.1, 0], [0.17, -0.2], [0.2, -0.3], [0.1, -0.2], [0, -0.015]]);
  else if (fins.tail === 'round') tg = flat([[0, 0.03], [0.1 * k, 0.12 * k], [0.2 * k, 0.11 * k], [0.25 * k, 0], [0.2 * k, -0.11 * k], [0.1 * k, -0.12 * k], [0, -0.03]]);
  if (tg) tail.add(new THREE.Mesh(tg, finMat));
  g.add(tail);
  g.add(new THREE.Mesh(finShape(P, fins.d, fins.d[2], true), finMat));
  if (fins.d2) g.add(new THREE.Mesh(finShape(P, fins.d2, fins.d2[2], true), finMat));
  if (fins.a) g.add(new THREE.Mesh(finShape(P, fins.a, fins.a[2], false), finMat));
  // грудные и брюшные
  if (shape !== 'eel' && shape !== 'flat') {
    const [hh, hw, yo] = profileAt(P, 0.26);
    for (const s of [-1, 1]) {
      const pf = new THREE.Mesh(flat([[0, 0], [0.13, 0.035], [0.15, -0.03], [0.04, -0.05]]), finMat);
      pf.position.set(-0.24, yo - hh * 0.35, s * hw * 0.95);
      pf.rotation.set(0.2 * s, -0.55 * s, -0.5);
      g.add(pf);
    }
    const [h2, , y2] = profileAt(P, 0.42);
    const pv = new THREE.Mesh(flat([[0, 0], [0.1, -0.02], [0.1, -0.075], [0.02, -0.04]]), finMat);
    pv.position.set(-0.1, y2 - h2 + 0.012, 0);
    g.add(pv);
  }
  // глаза
  const [eh, ew, ey] = profileAt(P, shape === 'pike' || shape === 'needle' ? 0.2 : shape === 'sword' ? 0.07 : 0.1);
  const er = (look.bigEye ? 0.034 : shape === 'needle' || shape === 'eel' ? 0.013 : 0.023) * (shape === 'grouper' || shape === 'cat' ? 0.8 : 1);
  const ex = (shape === 'pike' || shape === 'needle' ? 0.2 : shape === 'sword' ? 0.07 : 0.1) - 0.5;
  const sides = shape === 'flat' ? [1] : [-1, 1];
  for (const s of sides) {
    const e = new THREE.Mesh(G.sph(10, 8), eyeW);
    e.scale.set(er * 2, er * 2, er * 0.9);
    e.position.set(ex, ey + eh * 0.3, s * ew * 0.93);
    g.add(e);
    const p = new THREE.Mesh(G.sph(8, 6), eyeB);
    p.scale.set(er * 1.15, er * 1.15, er * 0.7);
    p.position.set(ex - er * 0.2, ey + eh * 0.3, s * (ew * 0.93 + er * 0.25));
    g.add(p);
  }
  if (shape === 'flat') {
    const e = new THREE.Mesh(G.sph(10, 8), eyeB);
    e.scale.set(0.04, 0.04, 0.03);
    e.position.set(-0.36, 0.09, 0.03);
    g.add(e);
  }
  if (shape === 'sword') {
    const bill = new THREE.Mesh(G.cone(6), mat(look.back, 0.5));
    bill.scale.set(0.03, 0.36, 0.02);
    bill.rotation.z = Math.PI / 2;
    bill.position.set(-0.66, 0, 0);
    g.add(bill);
  }
  if (shape === 'cat') {
    const wm = mat(look.back, 0.7);
    for (const s of [-1, 1]) {
      g.add(new THREE.Mesh(tube([[-0.47, -0.02, s * 0.04], [-0.56, 0.0, s * 0.14], [-0.5, 0.05, s * 0.26]], 0.005, 4), wm));
      g.add(new THREE.Mesh(tube([[-0.46, -0.04, s * 0.03], [-0.5, -0.1, s * 0.07], [-0.44, -0.16, s * 0.1]], 0.004, 4), wm));
    }
  }
  if (shape === 'needle') {
    const bk = new THREE.Mesh(G.cone(5), mat(look.back, 0.5));
    bk.scale.set(0.014, 0.16, 0.012);
    bk.rotation.z = Math.PI / 2;
    bk.position.set(-0.57, 0, 0);
    g.add(bk);
  }
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  const wrap = new THREE.Group();
  wrap.add(g);
  wrap.userData = { tail, shape };
  return wrap;
}
function raySkin(look) {
  return canvasTex(128, 128, (g) => {
    g.fillStyle = look.back;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = look.belly;
    g.fillRect(0, 64, 128, 64);
    const r = rng(9);
    g.fillStyle = look.patC;
    for (let i = 0; i < 60; i++) {
      g.beginPath();
      g.arc(r() * 128, r() * 60, 1.5 + r() * 2.5, 0, 7);
      g.fill();
    }
  });
}
/** Шевеление хвостом и телом: вызывать каждый кадр. */
export function wiggleFish(fish, t, amp = 1) {
  const u = fish.userData;
  if (!u || !u.shape || !fish.children[0]) return; // хлам на крючке не шевелится
  if (u.tail && u.shape !== 'ray') u.tail.rotation.y = Math.sin(t * 9) * 0.5 * amp;
  fish.children[0].rotation.y = Math.sin(t * 9 + 1) * 0.12 * amp;
}
