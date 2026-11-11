// Всё, что стоит в бухте: причалы, лавка-рынок, маяк, водопады, арка, камни, деревья, лодка, буйки, чайки.
import * as THREE from 'three';
import { Batch, M, G, BATCH_MAT, BATCH_MAT_2S } from './batch.js';
import { rng, rockGeo, canvasTex, shade, sstep, TAU, fbm2 } from './util.js';
import { DECKS, DECK_Y, groundH, shoreZ, islandR, ISLAND, ARCH, REEF, CAPE, capeDist, FALLS, LIGHTHOUSE, BACKWATER, deckAt, SCHOOL_HOMES } from './terrain.js';
import { waveH } from './water.js';

const WOODS = ['#c58a4e', '#b97c42', '#d39a5d', '#a86f3a', '#c9945a'];
const DARK_WOOD = '#7a5230';
const ROPE = '#ead9a7';
export const LAMP_POSTS = [[1.92, -9, -1], [-6.18, -22.3, 1], [6.18, 4.3, -1], [-29.25, 12.7, -1], [-6.5, 9.7, 1]];

function buildDocks(B, r) {
  for (const d of DECKS) {
    const across = d.along === 'z';
    const L = across ? d.z1 - d.z0 : d.x1 - d.x0;
    const W = across ? d.x1 - d.x0 : d.z1 - d.z0;
    const rows = Math.round(L / 0.27);
    const step = L / rows;
    for (let i = 0; i < rows; i++) {
      const a = (across ? d.z0 : d.x0) + (i + 0.5) * step;
      const cuts = [-0.07];
      if (W > 5) {
        let c = 1.8 + r() * 2.8;
        while (c < W - 1.5) {
          cuts.push(c);
          c += 2.4 + r() * 3;
        }
      }
      cuts.push(W + 0.07);
      for (let s = 0; s < cuts.length - 1; s++) {
        const len = cuts[s + 1] - cuts[s] - 0.03;
        const mid = (across ? d.x0 : d.z0) + (cuts[s] + cuts[s + 1]) / 2;
        const color = shade(WOODS[Math.floor(r() * WOODS.length)], (r() - 0.5) * 0.18);
        const y = DECK_Y - 0.04 + (r() - 0.5) * 0.012;
        if (across) B.add(G.box(), color, M(mid, y, a, len, 0.08, step - 0.016, 0, (r() - 0.5) * 0.012, 0));
        else B.add(G.box(), color, M(a, y, mid, step - 0.016, 0.08, len, 0, (r() - 0.5) * 0.012, 0));
      }
    }
    // обвязка и лаги
    const cx = (d.x0 + d.x1) / 2;
    const cz = (d.z0 + d.z1) / 2;
    const y = DECK_Y - 0.2;
    B.add(G.box(), '#2a1c10', M(cx, DECK_Y - 0.1, cz, d.x1 - d.x0 - 0.06, 0.03, d.z1 - d.z0 - 0.06));
    B.add(G.box(), DARK_WOOD, M(cx, y, d.z0 + 0.05, d.x1 - d.x0, 0.24, 0.12));
    B.add(G.box(), DARK_WOOD, M(cx, y, d.z1 - 0.05, d.x1 - d.x0, 0.24, 0.12));
    B.add(G.box(), DARK_WOOD, M(d.x0 + 0.05, y, cz, 0.12, 0.24, d.z1 - d.z0));
    B.add(G.box(), DARK_WOOD, M(d.x1 - 0.05, y, cz, 0.12, 0.24, d.z1 - d.z0));
    const nj = Math.max(1, Math.round(L / 2.4));
    for (let i = 1; i < nj; i++) {
      const a = (across ? d.z0 : d.x0) + (i / nj) * L;
      if (across) B.add(G.box(), shade(DARK_WOOD, -0.2), M(cx, y - 0.05, a, W, 0.2, 0.14));
      else B.add(G.box(), shade(DARK_WOOD, -0.2), M(a, y - 0.05, cz, 0.14, 0.2, W));
    }
    // сваи по периметру
    const pts = [];
    const along = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const n = Math.max(1, Math.round(len / 3.3));
      for (let i = 0; i <= n; i++) pts.push([x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n]);
    };
    const o = 0.15;
    along(d.x0 - o, d.z0 - o, d.x1 + o, d.z0 - o);
    along(d.x0 - o, d.z1 + o, d.x1 + o, d.z1 + o);
    along(d.x0 - o, d.z0 - o, d.x0 - o, d.z1 + o);
    along(d.x1 + o, d.z0 - o, d.x1 + o, d.z1 + o);
    const seen = new Set();
    for (const [px, pz] of pts) {
      const key = px.toFixed(1) + '|' + pz.toFixed(1);
      if (seen.has(key)) continue;
      seen.add(key);
      const other = DECKS.some((q) => q !== d && px > q.x0 - 0.4 && px < q.x1 + 0.4 && pz > q.z0 - 0.4 && pz < q.z1 + 0.4);
      if (other) continue;
      const gh = groundH(px, pz);
      if (gh > DECK_Y - 0.25) continue;
      const tall = r() < 0.62;
      const top = DECK_Y + (tall ? 0.62 + r() * 0.3 : 0.1);
      const bot = Math.min(gh - 0.6, -1.2);
      B.add(G.cyl(9), shade('#8a5f3a', (r() - 0.5) * 0.14), M(px, (top + bot) / 2, pz, 0.34, top - bot, 0.34, 0, r() * 3, (r() - 0.5) * 0.03), { grad: [0.5, 1.05] });
      B.add(G.cyl(9), '#c79d6c', M(px, top + 0.012, pz, 0.3, 0.03, 0.3));
      if (tall && r() < 0.5) for (let k = 0; k < 3; k++) B.add(G.torus(0.2, 12), ROPE, M(px, DECK_Y + 0.3 + k * 0.066, pz, 0.46, 0.46, 0.46, Math.PI / 2, r() * 3, 0));
    }
  }
}

function crate(B, x, y, z, s, ry, color = '#c9975c') {
  B.add(G.box(), color, M(x, y + s / 2, z, s, s, s, 0, ry, 0), { grad: [0.82, 1.05] });
  for (const dy of [0.12, 0.88]) B.add(G.box(), shade(color, -0.22), M(x, y + s * dy, z, s * 1.04, s * 0.1, s * 1.04, 0, ry, 0));
}
function barrel(B, x, y, z, s = 1) {
  B.add(G.cyl(12), '#9b6b3e', M(x, y + 0.45 * s, z, 0.64 * s, 0.9 * s, 0.64 * s), { grad: [0.78, 1.06] });
  B.add(G.cyl(12), '#7d5330', M(x, y + 0.9 * s, z, 0.56 * s, 0.03, 0.56 * s));
  for (const h of [0.2, 0.7]) B.add(G.torus(0.1, 14), '#4a4f57', M(x, y + h * s, z, 0.67 * s, 0.67 * s, 0.67 * s, Math.PI / 2, 0, 0));
}
function cooler(B, x, y, z, ry, color = '#2f6fd6') {
  B.add(G.box(), color, M(x, y + 0.2, z, 0.78, 0.4, 0.46, 0, ry, 0), { grad: [0.82, 1.05] });
  B.add(G.box(), '#eef3f8', M(x, y + 0.45, z, 0.82, 0.1, 0.5, 0, ry, 0));
  B.add(G.box(), '#1f2937', M(x, y + 0.52, z, 0.3, 0.04, 0.08, 0, ry, 0));
}
function ropeCoil(B, x, y, z) {
  for (let k = 0; k < 3; k++) B.add(G.torus(0.22, 14), ROPE, M(x, y + 0.05 + k * 0.075, z, 0.6 - k * 0.04, 0.6 - k * 0.04, 0.5, Math.PI / 2, k, 0));
}

function buildShack(B, scene, r) {
  const x0 = -13;
  const x1 = -7.2;
  const z0 = 10.4;
  const z1 = 15.4;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const by = DECK_Y;
  const H = 2.7;
  const TEAL = '#3fb0a8';
  const wall = (ax, az, bx, bz, ya, yb) => {
    const len = Math.hypot(bx - ax, bz - az);
    const ry = Math.atan2(-(bz - az), bx - ax);
    B.add(G.box(), TEAL, M((ax + bx) / 2, by + (ya + yb) / 2, (az + bz) / 2, len, yb - ya, 0.12, 0, ry, 0), { grad: [0.85, 1.04] });
    const n = Math.max(1, Math.round(len / 0.42));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      B.add(G.box(), shade(TEAL, -0.2), M(ax + (bx - ax) * t, by + (ya + yb) / 2, az + (bz - az) * t, 0.045, yb - ya, 0.17, 0, ry, 0));
    }
  };
  wall(x0, z0, x1, z0, 0, H);
  wall(x0, z1, x1, z1, 0, H);
  wall(x0, z0, x0, z1, 0, H);
  // восточная стена с окном прилавка
  wall(x1, z0, x1, z0 + 0.9, 0, H);
  wall(x1, z1 - 0.9, x1, z1, 0, H);
  wall(x1, z0 + 0.9, x1, z1 - 0.9, 0, 1.0);
  wall(x1, z0 + 0.9, x1, z1 - 0.9, 2.2, H);
  B.add(G.box(), '#f1efe6', M(x1 + 0.02, by + H / 2, z0 + 0.9, 0.16, H, 0.14));
  B.add(G.box(), '#f1efe6', M(x1 + 0.02, by + H / 2, z1 - 0.9, 0.16, H, 0.14));
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) B.add(G.box(), '#f1efe6', M(px, by + H / 2, pz, 0.2, H + 0.04, 0.2));
  // нутро лавки: тёмная глубина, полки с товаром
  B.add(G.box(), '#1b2430', M(x1 - 1.5, by + 1.6, cz, 0.1, 1.3, z1 - z0 - 1.9));
  B.add(G.box(), '#232e3c', M(x1 - 0.75, by + 0.95, cz, 1.5, 0.08, z1 - z0 - 1.9));
  for (const sy of [1.45, 1.85]) {
    B.add(G.box(), '#8a5f3a', M(x1 - 1.3, by + sy, cz, 0.34, 0.05, 3));
    for (let i = 0; i < 7; i++) {
      const c = ['#ef4444', '#fbbf24', '#22d3ee', '#a3e635', '#f97316', '#e2e8f0'][Math.floor(r() * 6)];
      const h = 0.14 + r() * 0.14;
      B.add(r() < 0.5 ? G.cyl(8) : G.box(), c, M(x1 - 1.28, by + sy + 0.03 + h / 2, cz - 1.3 + i * 0.43 + r() * 0.08, 0.15, h, 0.15));
    }
  }
  // прилавок с уловом на льду
  B.add(G.box(), '#d9a066', M(x1 + 0.2, by + 1.04, cz, 0.78, 0.09, z1 - z0 - 1.5));
  B.add(G.box(), '#b97c42', M(x1 + 0.5, by + 0.5, cz, 0.08, 1.0, z1 - z0 - 1.7), { grad: [0.8, 1.05] });
  for (const dz of [-0.95, 0.45]) {
    B.add(G.box(), '#a86f3a', M(x1 + 0.22, by + 1.15, cz + dz, 0.55, 0.14, 0.7));
    B.add(G.box(), '#e8f6ff', M(x1 + 0.22, by + 1.21, cz + dz, 0.47, 0.06, 0.62));
    for (let i = 0; i < 4; i++) B.add(G.sph(8, 6), ['#b9c7d1', '#e8643a', '#9fb04a', '#cfd9de'][i], M(x1 + 0.14 + (i % 2) * 0.16, by + 1.27, cz + dz - 0.2 + i * 0.13, 0.13, 0.07, 0.36, 0, 0.3 * (i - 1.5), 0));
  }
  B.add(G.box(), '#59636e', M(x1 + 0.25, by + 1.14, cz + 1.25, 0.3, 0.1, 0.3));
  B.add(G.cyl(12), '#cbd5e1', M(x1 + 0.25, by + 1.25, cz + 1.25, 0.36, 0.03, 0.36));
  // крыша
  const half = (x1 - x0) / 2 + 0.3;
  const rise = 1.45;
  const ang = Math.atan2(rise, half);
  const slab = Math.hypot(half, rise) + 0.35;
  for (const s of [-1, 1]) {
    B.add(G.box(), '#b5533c', M(cx + s * (half / 2 + 0.1), by + H + rise / 2 - 0.02, cz, slab, 0.12, z1 - z0 + 0.9, 0, 0, -s * ang), { grad: [0.9, 1.05] });
    for (let i = 1; i < 6; i++) B.add(G.box(), '#9c4532', M(cx + s * (half * (i / 6) + 0.05), by + H + rise * (1 - i / 6) + 0.05, cz, 0.05, 0.03, z1 - z0 + 0.92, 0, 0, -s * ang));
  }
  B.add(G.box(), '#8f3d2c', M(cx, by + H + rise + 0.06, cz, 0.22, 0.14, z1 - z0 + 1));
  for (const pz of [z0, z1]) B.add(G.prism(), TEAL, M(cx, by + H, pz, x1 - x0, rise, 0.12), { grad: [0.9, 1.02] });
  // спасательный круг на северной стене
  for (let i = 0; i < 8; i++) B.add(G.torus(0.3, 5, Math.PI / 4 + 0.02), i % 2 ? '#e2452f' : '#f8fafc', M(x0 + 1.4, by + 1.65, z0 - 0.1, 0.74, 0.74, 0.74, 0, 0, (i * Math.PI) / 4));
  // окно на север с ящиком цветов
  B.add(G.box(), '#f1efe6', M(cx + 0.9, by + 1.6, z0 - 0.04, 1.2, 0.95, 0.1));
  B.add(G.box(), '#24405c', M(cx + 0.9, by + 1.6, z0 - 0.08, 1.02, 0.78, 0.06));
  B.add(G.box(), '#f1efe6', M(cx + 0.9, by + 1.6, z0 - 0.1, 0.05, 0.78, 0.05));
  B.add(G.box(), '#a86f3a', M(cx + 0.9, by + 1.05, z0 - 0.18, 1.2, 0.18, 0.24));
  for (let i = 0; i < 7; i++) B.add(G.ico(0), ['#f472b6', '#fde047', '#fb7185', '#ffffff'][i % 4], M(cx + 0.4 + i * 0.17, by + 1.22 + r() * 0.06, z0 - 0.2, 0.14, 0.14, 0.14), { flat: true });
  // навес в красно-белую полоску
  const stripes = canvasTex(256, 64, (g, w, h) => {
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? '#f6f1e7' : '#e2452f';
      g.fillRect((i * w) / 8, 0, w / 8 + 1, h);
    }
    const sh = g.createLinearGradient(0, 0, 0, h);
    sh.addColorStop(0, 'rgba(0,0,0,0.18)');
    sh.addColorStop(0.5, 'rgba(0,0,0,0)');
    g.fillStyle = sh;
    g.fillRect(0, 0, w, h);
  });
  const awnMat = new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.9, side: THREE.DoubleSide });
  const aw = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0 - 0.6, 2.05), awnMat);
  aw.position.set(x1 + 0.98, by + 2.22, cz);
  aw.rotation.set(0, Math.PI / 2, 0);
  aw.rotateX(-Math.PI / 2 + 0.22);
  aw.castShadow = aw.receiveShadow = true;
  scene.add(aw);
  const val = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0 - 0.6, 0.24), awnMat);
  val.position.set(x1 + 1.98, by + 1.89, cz);
  val.rotation.y = Math.PI / 2;
  scene.add(val);
  for (const pz of [z0 + 0.36, z1 - 0.36]) B.add(G.cyl(8), '#f1efe6', M(x1 + 1.94, by + 1.0, pz, 0.07, 2.0, 0.07));
  // вывеска
  const sign = canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#7a4a26';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) {
      g.fillStyle = ['#a86a3a', '#b5763f', '#9c6032'][i];
      g.fillRect(6, 6 + i * 39, w - 12, 36);
    }
    g.fillStyle = '#fff7df';
    g.font = 'italic 900 92px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('РЫНОК', w / 2, h / 2 + 6);
  });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.62), new THREE.MeshStandardMaterial({ map: sign, roughness: 0.85 }));
  sg.position.set(x1 + 0.12, by + H + 0.42, cz);
  sg.rotation.y = Math.PI / 2;
  sg.castShadow = true;
  scene.add(sg);
  B.add(G.box(), '#5b3a1e', M(x1 + 0.07, by + H + 0.42, cz, 0.06, 0.7, 2.6));
  // грифельная доска «сегодня в цене»
  const bc = document.createElement('canvas');
  bc.width = 256;
  bc.height = 352;
  const btex = new THREE.CanvasTexture(bc);
  btex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.07), new THREE.MeshStandardMaterial({ map: btex, roughness: 0.95 }));
  board.position.set(-5.9, by + 0.62, 15.2);
  board.rotation.set(0, Math.PI / 2 - 0.55, 0);
  board.rotateX(-0.2);
  scene.add(board);
  B.add(G.box(), '#a86f3a', M(-5.93, by + 0.62, 15.22, 0.88, 1.17, 0.04, -0.2, Math.PI / 2 - 0.55, 0));
  B.add(G.box(), '#8a5f3a', M(-6.15, by + 0.55, 15.36, 0.8, 1.1, 0.04, 0.22, Math.PI / 2 - 0.55, 0));
  const setBoard = (lines) => {
    const g = bc.getContext('2d');
    g.fillStyle = '#1d2a26';
    g.fillRect(0, 0, 256, 352);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 40; i++) g.fillRect((i * 97) % 256, (i * 53) % 352, 30, 2);
    g.textAlign = 'center';
    g.fillStyle = '#fde68a';
    g.font = 'italic 900 40px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif';
    g.fillText('СЕГОДНЯ', 128, 50);
    g.fillText('В ЦЕНЕ', 128, 90);
    g.strokeStyle = '#fde68a';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(40, 106);
    g.lineTo(216, 106);
    g.stroke();
    g.fillStyle = '#f8fafc';
    g.font = 'italic 800 34px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif';
    lines.slice(0, 3).forEach((s, i) => g.fillText(s, 128, 158 + i * 54));
    g.fillStyle = '#7dd3fc';
    g.font = 'italic 900 38px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif';
    g.fillText('× 1,6', 128, 326);
    btex.needsUpdate = true;
  };
  setBoard(['…', '…', '…']);
  return { setBoard };
}

function buildProps(B, r) {
  const y = DECK_Y;
  crate(B, -12.6, y, 5.5, 0.82, 0.2);
  crate(B, -12.45, y + 0.82, 5.55, 0.62, 0.6, '#d3a56a');
  crate(B, -11.9, y, 6.2, 0.55, 1.1, '#b9854e');
  barrel(B, -11.15, y, 5.15);
  cooler(B, 4.5, y, 14.9, 0.2);
  cooler(B, 4.75, y + 0.5, 14.85, -0.15, '#3b82f6');
  cooler(B, 4.9, y, 14.1, 1.3, '#1e4fa8');
  barrel(B, 4.95, y, 5.15, 0.9);
  ropeCoil(B, 4.3, y, 6.1);
  crate(B, 5.25, y, -26.3, 0.5, 0.4);
  B.add(G.cyl(10, 1, 0.8), '#64748b', M(4.55, y + 0.17, -26.1, 0.34, 0.34, 0.34), { grad: [0.8, 1.05] });
  ropeCoil(B, -34.2, y, 11.6);
  crate(B, -34.3, y, 5.7, 0.6, 0.3);
  // скамейка у берега
  const bx = 1.4;
  const bz = 15.35;
  B.add(G.box(), '#c58a4e', M(bx, y + 0.46, bz, 1.9, 0.07, 0.42));
  B.add(G.box(), '#c58a4e', M(bx, y + 0.86, bz + 0.2, 1.9, 0.4, 0.06, -0.15, 0, 0));
  for (const s of [-0.8, 0.8]) B.add(G.box(), DARK_WOOD, M(bx + s, y + 0.23, bz + 0.02, 0.08, 0.46, 0.4));
  // кнехты
  for (const [cx2, cz2] of [[-1.3, -14], [1.3, -4], [-5.4, -26.6], [-34.6, 8.5], [5.6, 9]]) {
    B.add(G.cyl(8), '#3b424c', M(cx2, y + 0.08, cz2, 0.12, 0.16, 0.12));
    B.add(G.box(), '#3b424c', M(cx2, y + 0.17, cz2, 0.34, 0.06, 0.09, 0, r() * 3, 0));
  }
  // рыбацкие сети на свае, ведро
  B.add(G.cyl(10, 1, 0.82), '#e2452f', M(-2.6, y + 0.16, 5.0, 0.32, 0.32, 0.32), { grad: [0.8, 1.05] });
}

function buildLamps(B, scene) {
  const lamps = [];
  const glassMat = new THREE.MeshStandardMaterial({ color: '#ffe2a8', emissive: '#ffb347', emissiveIntensity: 0, roughness: 0.4 });
  for (const [x, z, side] of LAMP_POSTS) {
    const y = DECK_Y;
    B.add(G.cyl(8, 0.8, 1), '#5b3a1e', M(x, y + 1.35, z, 0.16, 2.9, 0.16), { grad: [0.8, 1.05] });
    B.add(G.box(), '#5b3a1e', M(x + side * 0.32, y + 2.7, z, 0.72, 0.07, 0.07));
    B.add(G.box(), '#5b3a1e', M(x + side * 0.2, y + 2.48, z, 0.5, 0.05, 0.05, 0, 0, side * 0.75));
    const lx = x + side * 0.6;
    B.add(G.cyl(6), '#2b2f36', M(lx, y + 2.6, z, 0.02, 0.18, 0.02));
    B.add(G.cone(6), '#2b2f36', M(lx, y + 2.5, z, 0.3, 0.12, 0.3));
    B.add(G.box(), '#2b2f36', M(lx, y + 2.18, z, 0.2, 0.04, 0.2));
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B.add(G.box(), '#2b2f36', M(lx + dx * 0.09, y + 2.32, z + dz * 0.09, 0.02, 0.28, 0.02));
    const glass = new THREE.Mesh(G.box(), glassMat);
    glass.position.set(lx, y + 2.32, z);
    glass.scale.set(0.16, 0.24, 0.16);
    scene.add(glass);
    const light = new THREE.PointLight('#ffc58a', 0, 14, 1.5);
    light.position.set(lx, y + 2.3, z);
    scene.add(light);
    lamps.push(light);
  }
  // гирлянда флажков от лавки к фонарю
  const fb = new Batch();
  const a = new THREE.Vector3(-7.2, DECK_Y + 2.75, 10.4);
  const b = new THREE.Vector3(-6.5, DECK_Y + 2.72, 9.7);
  const c = new THREE.Vector3(1.9, DECK_Y + 2.75, -9);
  const flags = ['#fbbf24', '#22d3ee', '#ef4444', '#f8fafc', '#a3e635', '#f97316'];
  const tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0, -1, 0], 3));
  tri.computeVertexNormals();
  const span = (p0, p1, n, sag) => {
    const dir = Math.atan2(-(p1.z - p0.z), p1.x - p0.x);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = p0.x + (p1.x - p0.x) * t;
      const z = p0.z + (p1.z - p0.z) * t;
      const y = p0.y + (p1.y - p0.y) * t - sag * Math.sin(Math.PI * t);
      if (i < n) {
        const t2 = (i + 1) / n;
        const x2 = p0.x + (p1.x - p0.x) * t2;
        const z2 = p0.z + (p1.z - p0.z) * t2;
        const y2 = p0.y + (p1.y - p0.y) * t2 - sag * Math.sin(Math.PI * t2);
        const len = Math.hypot(x2 - x, y2 - y, z2 - z);
        fb.add(G.box(), '#3b2a1a', M((x + x2) / 2, (y + y2) / 2, (z + z2) / 2, len, 0.015, 0.015, 0, dir, Math.atan2(y2 - y, Math.hypot(x2 - x, z2 - z))));
        fb.add(tri, flags[i % flags.length], M((x + x2) / 2, (y + y2) / 2 - 0.01, (z + z2) / 2, len * 0.8, 0.34, 1, 0, dir, 0));
      }
    }
  };
  span(a, b, 3, 0.05);
  span(b, c, 34, 0.9);
  scene.add(fb.build(BATCH_MAT_2S, false));
  return { lamps, glassMat };
}

function pine(B, x, y, z, s, r) {
  B.add(G.cyl(6, 0.6, 1), '#7a5230', M(x, y + 0.7 * s, z, 0.34 * s, 1.5 * s, 0.34 * s), { grad: [0.7, 1] });
  const tiers = 3 + (r() < 0.5 ? 1 : 0);
  const base = ['#2f8f4e', '#2a8246', '#37a058'][Math.floor(r() * 3)];
  for (let i = 0; i < tiers; i++) {
    const k = i / tiers;
    const rad = (1.5 - k * 0.95) * s;
    B.add(G.cone(8), shade(base, i * 0.07), M(x, y + (1.25 + i * 1.02) * s, z, rad * 2, 1.75 * s, rad * 2, 0, r() * 3, 0), { grad: [0.62, 1.12] });
  }
}
function roundTree(B, x, y, z, s, r) {
  B.add(G.cyl(6, 0.7, 1), '#8a5f3a', M(x, y + 0.9 * s, z, 0.36 * s, 1.9 * s, 0.36 * s, 0, 0, (r() - 0.5) * 0.12), { grad: [0.7, 1] });
  const base = ['#62b84e', '#74c75a', '#57a947', '#86cf63'][Math.floor(r() * 4)];
  const n = 3 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const a = r() * TAU;
    const d = i ? (0.55 + r() * 0.4) * s : 0;
    const rad = (i ? 1.0 + r() * 0.5 : 1.55) * s;
    B.add(G.ico(1), shade(base, (r() - 0.5) * 0.12), M(x + Math.cos(a) * d, y + (2.25 + (i ? r() * 0.7 : 0.35)) * s, z + Math.sin(a) * d, rad * 2, rad * 1.7, rad * 2, r(), r() * 3, 0), { flat: true, grad: [0.6, 1.14] });
  }
}
function bush(B, x, y, z, s, r) {
  const base = ['#58b848', '#4aa63f', '#6cc956'][Math.floor(r() * 3)];
  for (let i = 0; i < 2; i++) B.add(G.ico(1), shade(base, (r() - 0.5) * 0.1), M(x + (r() - 0.5) * s, y + 0.3 * s, z + (r() - 0.5) * s, (1 + r() * 0.5) * s, 0.8 * s, (1 + r() * 0.5) * s, 0, r() * 3, 0), { flat: true, grad: [0.6, 1.12] });
}

function buildVegetation(scene, r) {
  const near = new Batch();
  const far = new Batch();
  const isl = new Batch();
  // остров
  let placed = 0;
  for (let i = 0; i < 400 && placed < 46; i++) {
    const a = r() * TAU;
    const R = islandR(a);
    const d = Math.sqrt(r()) * (R - 6);
    const x = ISLAND.x + Math.cos(a) * d;
    const z = ISLAND.z + Math.sin(a) * d;
    if (Math.hypot(x - LIGHTHOUSE.x, z - LIGHTHOUSE.z) < 5.5 || Math.hypot(x - LIGHTHOUSE.x + 7.5, z - LIGHTHOUSE.z - 2) < 5) continue;
    const y = groundH(x, z);
    if (y < 8) continue;
    const s = 0.85 + r() * 0.75;
    if (r() < 0.62) pine(isl, x, y - 0.15, z, s, r);
    else roundTree(isl, x, y - 0.15, z, s * 0.9, r);
    placed++;
  }
  for (let i = 0; i < 26; i++) {
    const a = r() * TAU;
    const d = Math.sqrt(r()) * (islandR(a) - 5);
    const x = ISLAND.x + Math.cos(a) * d;
    const z = ISLAND.z + Math.sin(a) * d;
    const y = groundH(x, z);
    if (y > 8) bush(isl, x, y, z, 0.7 + r() * 0.6, r);
  }
  // берег и холмы
  placed = 0;
  for (let i = 0; i < 3000 && placed < 230; i++) {
    const x = -165 + r() * 320;
    const z = -150 + r() * 235;
    const d = z - shoreZ(x);
    if (d < 6.5 || d > 78) continue;
    const walk = x > -56 && x < 49;
    if (walk && d < 15.5) continue;
    const y = groundH(x, z);
    if (y < 1) continue;
    const s = (0.9 + r() * 0.9) * (d > 30 ? 1.25 : 1);
    const B = d < 40 ? near : far;
    if (r() < 0.5) pine(B, x, y - 0.2, z, s, r);
    else roundTree(B, x, y - 0.2, z, s, r);
    placed++;
  }
  for (let i = 0; i < 400; i++) {
    const x = -56 + r() * 105;
    const d = 3.6 + r() * 16;
    const z = shoreZ(x) + d;
    if (d < 14 && r() < 0.8) continue;
    if (deckAt(x, z, -1.5)) continue;
    bush(near, x, groundH(x, z), z, 0.5 + r() * 0.6, r);
  }
  // цветы и трава у тропинки
  for (let i = 0; i < 260; i++) {
    const x = -52 + r() * 96;
    const d = 3.4 + r() * 10;
    const z = shoreZ(x) + d;
    const y = groundH(x, z);
    if (deckAt(x, z, -0.6) || y < 1) continue;
    if (r() < 0.45) continue;
    {
      near.add(G.cyl(4), '#3f9a3a', M(x, y + 0.12, z, 0.025, 0.26, 0.025));
      near.add(G.ico(0), ['#fde047', '#f8fafc', '#f472b6', '#fb923c'][Math.floor(r() * 4)], M(x, y + 0.27, z, 0.11, 0.08, 0.11), { flat: true });
    }
  }
  // забор вдоль тропы
  let prev = null;
  for (let x = -53.5; x <= 47; x += 2.3) {
    const z = shoreZ(x) + 14.1;
    const y = groundH(x, z);
    near.add(G.box(), '#b98a58', M(x, y + 0.45, z, 0.11, 1.0, 0.11), { grad: [0.8, 1.05] });
    if (prev) {
      const len = Math.hypot(x - prev[0], z - prev[2], y - prev[1]);
      const ry = Math.atan2(-(z - prev[2]), x - prev[0]);
      const rz = Math.atan2(y - prev[1], Math.hypot(x - prev[0], z - prev[2]));
      for (const h of [0.38, 0.75]) near.add(G.box(), '#c79d6c', M((x + prev[0]) / 2, (y + prev[1]) / 2 + h, (z + prev[2]) / 2, len, 0.07, 0.04, 0, ry, rz));
    }
    prev = [x, y, z];
  }
  // камыш и кувшинки в заводи
  for (let i = 0; i < 520; i++) {
    const x = BACKWATER.x - 17 + r() * 34;
    const z = BACKWATER.z - 14 + r() * 28;
    const dep = -groundH(x, z);
    if (deckAt(x, z, -0.8)) continue;
    if (dep > 0.05 && dep < 0.75 && r() < 0.75) {
      const h = 0.9 + r() * 0.9;
      const lean = (r() - 0.5) * 0.25;
      near.add(G.cyl(4, 0.5, 1), shade('#6fae3c', (r() - 0.5) * 0.2), M(x, h / 2 - 0.3, z, 0.035, h + 0.6, 0.035, lean, r() * 3, lean));
      if (r() < 0.55) near.add(G.cyl(6), '#6b4226', M(x + lean * 0.4, h - 0.02, z + lean * 0.4, 0.07, 0.24, 0.07, lean, 0, lean));
    } else if (dep > 0.6 && dep < 2.4 && r() < 0.16) {
      const s = 0.5 + r() * 0.5;
      near.add(G.cyl(9), shade('#3fa34d', (r() - 0.5) * 0.16), M(x, 0.07, z, s, 0.035, s, 0, r() * 6, 0));
      if (r() < 0.3) {
        near.add(G.cone(6), '#f9a8d4', M(x, 0.15, z, 0.2, 0.14, 0.2, Math.PI, 0, 0));
        near.add(G.ico(0), '#fde047', M(x, 0.16, z, 0.07, 0.07, 0.07));
      }
    }
  }
  const mNear = near.build();
  const mFar = far.build(BATCH_MAT, false);
  const mIsl = isl.build();
  scene.add(mNear, mFar, mIsl);
}

function buildRocks(scene, r) {
  const B = new Batch();
  const geos = [rockGeo(11), rockGeo(23), rockGeo(37), rockGeo(51), rockGeo(64, 2, 0.3)];
  const GREYS = ['#8d95a1', '#7f8793', '#9aa2ad', '#868f9c', '#a3a9b3'];
  const GRASS = '#6dbd50';
  const rock = (x, y, z, sx, sy, sz, grass = false, tone = 0) => {
    const c = shade(GREYS[Math.floor(r() * GREYS.length)], tone + (r() - 0.5) * 0.1);
    B.add(geos[Math.floor(r() * geos.length)], c, M(x, y, z, sx, sy, sz, (r() - 0.5) * 0.5, r() * TAU, (r() - 0.5) * 0.5), grass ? { top: [shade(GRASS, (r() - 0.5) * 0.12), 0.72], grad: [0.72, 1.05] } : { grad: [0.72, 1.05] });
  };
  // риф у причала
  for (let i = 0; i < 11; i++) {
    const a = r() * TAU;
    const d = r() * 6.5;
    const s = 0.7 + r() * 1.5;
    rock(REEF.x + Math.cos(a) * d, -0.35 + r() * 0.5 - d * 0.05, REEF.z + Math.sin(a) * d * 0.8, s * 1.2, s * 0.8, s);
  }
  // остров: кромка воды и уступы обрыва
  for (let i = 0; i < 56; i++) {
    const a = r() * TAU;
    const R = islandR(a) + 0.5 + r() * 4.5;
    const s = 1 + r() * 2.4;
    rock(ISLAND.x + Math.cos(a) * R, -0.3 + r() * 0.7, ISLAND.z + Math.sin(a) * R, s * 1.2, s * 0.8, s, false, -0.06);
  }
  for (let i = 0; i < 120; i++) {
    const a = r() * TAU;
    const R = islandR(a) - 0.4 - r() * 3.8;
    const x = ISLAND.x + Math.cos(a) * R;
    const z = ISLAND.z + Math.sin(a) * R;
    const h = groundH(x, z);
    const s = 2.3 + r() * 2.9;
    rock(x, h - s * 0.3, z, s, s * (0.8 + r() * 0.5), s, h > 7);
  }
  // мыс
  for (let i = 0; i < 34; i++) {
    const t = r();
    const x = CAPE.ax + (CAPE.bx - CAPE.ax) * t + (r() - 0.5) * 9.5;
    const z = CAPE.az + (CAPE.bz - CAPE.az) * t + (r() - 0.5) * 6;
    const dc = capeDist(x, z);
    if (dc < CAPE.r - 0.2 || dc > CAPE.r + 2.6) continue;
    const s = 0.9 + r() * 1.6;
    rock(x, groundH(x, z) - 0.1, z, s * 1.2, s * 0.8, s);
  }
  for (let i = 0; i < 5; i++) rock(CAPE.bx + (r() - 0.5) * 6, -0.2, CAPE.bz - 3 - r() * 4, 1.4 + r(), 1 + r(), 1.4 + r());
  // берег
  for (let i = 0; i < 70; i++) {
    const x = -60 + r() * 115;
    const z = shoreZ(x) - 1.5 + r() * 3.4;
    if (deckAt(x, z, -1.2)) continue;
    const s = 0.3 + r() * 0.75;
    rock(x, groundH(x, z) + s * 0.12, z, s * 1.3, s * 0.75, s, false, 0.05);
  }
  // западный мыс и скалы в море
  for (let i = 0; i < 46; i++) {
    const x = -62 - r() * 80;
    const z = shoreZ(x) - 2 + r() * 5;
    const s = 2 + r() * 3.4;
    rock(x, groundH(x, z) + r() * 2, z, s * 1.2, s, s, r() < 0.5);
  }
  for (const [x, z, s, tall] of [[98, -72, 7, 2.6], [112, -40, 5, 2.2], [90, -104, 6, 3], [126, -98, 9, 2], [-58, -96, 5, 2.4], [-76, -122, 7, 2.2], [140, -20, 5, 2.4]]) {
    rock(x, s * tall * 0.3, z, s, s * tall, s, true);
    for (let k = 0; k < 4; k++) rock(x + (r() - 0.5) * s * 2.2, -0.2, z + (r() - 0.5) * s * 2.2, 1.5 + r() * 2, 1 + r(), 1.5 + r() * 2);
  }
  // арка: половина тора, помятая шумом
  const ag = new THREE.TorusGeometry(8.6, 2.7, 7, 13, Math.PI).toNonIndexed();
  const p = ag.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = fbm2(v.x * 0.35 + 5 + v.z * 0.3, v.y * 0.35 + 9 - v.z * 0.2, 3);
    const k = 1 + (n - 0.5) * 0.55;
    const foot = 1 + 0.45 * sstep(4, 0, v.y);
    p.setXYZ(i, v.x * k * (0.94 + 0.06 * foot), v.y * 1.12 * k, v.z * k * foot * 1.25);
  }
  ag.computeVertexNormals();
  B.add(ag, '#8d95a1', M(ARCH.x, -1.4, ARCH.z, 1, 1, 1, 0, 1.92, 0), { top: [GRASS, 0.8], grad: [0.72, 1.05] });
  for (let i = 0; i < 9; i++) {
    const s = i < 5 ? -1 : 1;
    rock(ARCH.x + Math.cos(1.92) * s * (8.6 + (r() - 0.5) * 4) + (r() - 0.5) * 3, -0.2, ARCH.z - Math.sin(1.92) * s * (8.6 + (r() - 0.5) * 4) + (r() - 0.5) * 3, 1.6 + r() * 2.2, 1.2 + r() * 1.6, 1.6 + r() * 2.2, r() < 0.3);
  }
  const tb = new Batch();
  roundTree(tb, ARCH.x + 0.4, 9.6, ARCH.z - 0.2, 0.8, r);
  pine(tb, ARCH.x - 1.6, 9.2, ARCH.z + 0.9, 0.7, r);
  bush(tb, ARCH.x + 1.8, 9.2, ARCH.z + 0.4, 0.8, r);
  scene.add(B.build(), tb.build());
  // дальние острова на горизонте
  const fb = new Batch();
  for (const [x, z, sx, sy, sz] of [[-420, -560, 130, 46, 90], [260, -720, 170, 60, 110], [640, -330, 120, 40, 150], [-700, -150, 150, 70, 180], [40, -980, 220, 50, 120]]) {
    fb.add(geos[4], '#5f8f7a', M(x, sy * 0.25, z, sx, sy, sz, 0, r() * 3, 0), { top: ['#4f9a5a', 0.6] });
  }
  scene.add(fb.build(BATCH_MAT, false));
}

function buildLighthouse(scene, r) {
  const B = new Batch();
  const { x, z } = LIGHTHOUSE;
  const y = groundH(x, z) - 0.3;
  B.add(G.cyl(16), '#a3a9b3', M(x, y + 0.5, z, 5.6, 1.2, 5.6), { grad: [0.8, 1.05] });
  const hs = 3.25;
  const rad = [2.35, 2.12, 1.9, 1.7, 1.52];
  for (let i = 0; i < 4; i++) {
    B.add(G.cyl(18, rad[i + 1] / rad[i], 1), i % 2 ? '#d8402f' : '#f6f2ea', M(x, y + 1.1 + hs * (i + 0.5), z, rad[i] * 2, hs, rad[i] * 2), { grad: [0.9, 1.04] });
  }
  const gy = y + 1.1 + hs * 4;
  B.add(G.cyl(18), '#4b5563', M(x, gy + 0.1, z, 4.5, 0.22, 4.5));
  B.add(G.torus(0.035, 22), '#f6f2ea', M(x, gy + 1.0, z, 4.3, 4.3, 4.3, Math.PI / 2, 0, 0));
  for (let i = 0; i < 12; i++) B.add(G.cyl(5), '#f6f2ea', M(x + Math.cos((i / 12) * TAU) * 2.15, gy + 0.6, z + Math.sin((i / 12) * TAU) * 2.15, 0.07, 0.85, 0.07));
  for (let i = 0; i < 8; i++) B.add(G.box(), '#374151', M(x + Math.cos((i / 8) * TAU) * 1.2, gy + 1.05, z + Math.sin((i / 8) * TAU) * 1.2, 0.09, 1.7, 0.09));
  B.add(G.cyl(16), '#374151', M(x, gy + 1.95, z, 2.7, 0.16, 2.7));
  B.add(G.cone(16), '#d8402f', M(x, gy + 2.7, z, 3.0, 1.4, 3.0), { grad: [0.85, 1.05] });
  B.add(G.sph(10, 8), '#fbbf24', M(x, gy + 3.5, z, 0.4, 0.4, 0.4));
  // дверь и окна — смотрят на причал
  const face = Math.atan2(-22 - x, 0 - z);
  const fx = Math.sin(face);
  const fz = Math.cos(face);
  B.add(G.box(), '#3b2a1a', M(x + fx * 2.28, y + 2.1, z + fz * 2.28, 1.0, 2.0, 0.2, 0, face, 0));
  for (const [h, rr] of [[6, 2.02], [9.6, 1.8]]) B.add(G.box(), '#1f3350', M(x + fx * rr, y + h, z + fz * rr, 0.55, 0.9, 0.2, 0, face, 0));
  // домик смотрителя
  const hx = x - 7.5;
  const hz = z + 2;
  const hy = groundH(hx, hz) - 0.2;
  B.add(G.box(), '#f6f2ea', M(hx, hy + 1.5, hz, 5.2, 3.0, 4.0), { grad: [0.88, 1.04] });
  B.add(G.prism(), '#d8402f', M(hx, hy + 3.0, hz, 5.9, 1.9, 4.6), { grad: [0.9, 1.06] });
  B.add(G.box(), '#a3a9b3', M(hx + 1.4, hy + 4.3, hz - 0.8, 0.6, 1.4, 0.6));
  B.add(G.box(), '#7a4a26', M(hx - 0.2, hy + 1.0, hz + 2.02, 0.9, 1.9, 0.1));
  const winMat = new THREE.MeshStandardMaterial({ color: '#25405f', emissive: '#ffc56b', emissiveIntensity: 0, roughness: 0.4 });
  for (const wx of [-1.7, 1.4]) {
    const w = new THREE.Mesh(G.box(), winMat);
    w.position.set(hx + wx, hy + 1.7, hz + 2.03);
    w.scale.set(0.8, 0.8, 0.08);
    scene.add(w);
  }
  // белый заборчик
  for (let i = 0; i < 26; i++) {
    const a = 0.4 + (i / 26) * 3.6;
    const px = x - 3.5 + Math.cos(a) * 11;
    const pz = z + 1 + Math.sin(a) * 8.5;
    const py = groundH(px, pz);
    if (py < 9) continue;
    B.add(G.box(), '#f6f2ea', M(px, py + 0.4, pz, 0.12, 0.9, 0.12));
  }
  scene.add(B.build());
  // фонарь маяка и луч
  const lampMat = new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffd36b', emissiveIntensity: 0.25, roughness: 0.3, transparent: true, opacity: 0.92 });
  const lamp = new THREE.Mesh(G.cyl(14), lampMat);
  lamp.position.set(x, gy + 1.05, z);
  lamp.scale.set(2.2, 1.6, 2.2);
  scene.add(lamp);
  // луч: мягкий по краям и гаснет с расстоянием
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { opacity: { value: 0 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vT; void main(){ vT = uv.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float opacity; varying vec3 vN; varying vec3 vV; varying float vT; void main(){ float e = pow(abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(vec3(1.0, 0.93, 0.7) * e * vT * vT * opacity, 1.0); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false
  });
  const beam = new THREE.Group();
  beam.position.set(x, gy + 1.05, z);
  for (const s of [-1, 1]) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.4, 90, 14, 1, true), beamMat);
    cone.rotation.z = (-s * Math.PI) / 2;
    cone.position.x = -s * 45;
    beam.add(cone);
  }
  scene.add(beam);
  return { lampMat, beamMat, beam, winMat };
}

const FALL_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FALL_FRAG = /* glsl */ `
uniform float uTime, uLight, uDisc; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec3 c; float a;
  if (uDisc > 0.5) {
    vec2 q = vUv * 2.0 - 1.0; float r = length(q);
    float s = n(vec2(atan(q.y, q.x) * 3.0, r * 6.0 - uTime * 2.0)) * 0.6 + n(q * 9.0 + uTime) * 0.4;
    a = (1.0 - smoothstep(0.35, 1.0, r)) * smoothstep(0.25, 0.75, s + (1.0 - r) * 0.5);
    c = vec3(1.0);
  } else {
    float s = n(vec2(vUv.x * 13.0, vUv.y * 4.0 + uTime * 2.4)) * 0.6 + n(vec2(vUv.x * 31.0, vUv.y * 9.0 + uTime * 3.6)) * 0.4;
    float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
    c = mix(vec3(0.5, 0.82, 0.95), vec3(1.0), smoothstep(0.35, 0.78, s));
    a = edge * (0.78 + 0.22 * s) * smoothstep(1.0, 0.94, vUv.y);
  }
  gl_FragColor = vec4(c * uLight, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
function buildFalls(scene) {
  const uTime = { value: 0 };
  const uLight = { value: 1 };
  for (const f of FALLS) {
    const tx = -f.nz;
    const tz = f.nx;
    const R0 = Math.hypot(f.x - ISLAND.x, f.z - ISLAND.z) + 0.6;
    const pos = [];
    const uv = [];
    const idx = [];
    const N = 14;
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const rr = R0 + 2.3 - t * 8.2;
      const px = ISLAND.x + f.nx * rr;
      const pz = ISLAND.z + f.nz * rr;
      const y = Math.max(0.02, groundH(px, pz)) + 0.32;
      const w = 1.25 + 0.5 * (1 - t);
      pos.push(px - tx * w + f.nx * 0.35, y, pz - tz * w + f.nz * 0.35, px + tx * w + f.nx * 0.35, y, pz + tz * w + f.nz * 0.35);
      uv.push(0, t, 1, t);
      if (k < N) idx.push(k * 2, k * 2 + 1, k * 2 + 2, k * 2 + 1, k * 2 + 3, k * 2 + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: { uTime, uLight, uDisc: { value: 0 } }, vertexShader: FALL_VERT, fragmentShader: FALL_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    m.renderOrder = 3;
    scene.add(m);
    const d = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.ShaderMaterial({ uniforms: { uTime, uLight, uDisc: { value: 1 } }, vertexShader: FALL_VERT, fragmentShader: FALL_FRAG, transparent: true, depthWrite: false }));
    d.rotation.x = -Math.PI / 2;
    d.position.set(f.bx, 0.12, f.bz);
    d.renderOrder = 3;
    scene.add(d);
  }
  return { uTime, uLight };
}

function buildFloaters(scene) {
  const list = [];
  // лодка у западного мостка
  const boat = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: '#efe7d2', roughness: 0.8, side: THREE.DoubleSide });
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10, 0, TAU, Math.PI / 2, Math.PI / 2), hullMat);
  hull.scale.set(2.0, 0.62, 0.78);
  hull.castShadow = true;
  boat.add(hull);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 28), new THREE.MeshStandardMaterial({ color: '#d9463b', roughness: 0.7 }));
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(2.0, 0.78, 1);
  boat.add(rim);
  const seatMat = new THREE.MeshStandardMaterial({ color: '#b97c42', roughness: 0.9 });
  for (const sx of [-0.7, 0.55]) {
    const s = new THREE.Mesh(G.box(), seatMat);
    s.scale.set(0.3, 0.05, 1.3);
    s.position.set(sx, -0.14, 0);
    boat.add(s);
  }
  boat.position.set(-32, 0, 3.3);
  boat.rotation.y = 0.25;
  scene.add(boat);
  list.push({ o: boat, y: 0.08, roll: 0.06 });
  // буйки
  const red = new THREE.MeshStandardMaterial({ color: '#e2452f', roughness: 0.6 });
  const white = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.6 });
  for (const [x, z] of [[-12, -43], [15, -37], [45, -31], [-27, -12]]) {
    const b = new THREE.Group();
    const body = new THREE.Mesh(G.sph(12, 8), red);
    body.scale.set(0.9, 0.7, 0.9);
    const band = new THREE.Mesh(G.cyl(12), white);
    band.scale.set(0.92, 0.16, 0.92);
    const top = new THREE.Mesh(G.cone(10), red);
    top.scale.set(0.5, 0.9, 0.5);
    top.position.y = 0.6;
    const pole = new THREE.Mesh(G.cyl(6), white);
    pole.scale.set(0.05, 0.7, 0.05);
    pole.position.y = 1.3;
    b.add(body, band, top, pole);
    b.position.set(x, 0, z);
    b.traverse((o) => (o.castShadow = true));
    scene.add(b);
    list.push({ o: b, y: 0.05, roll: 0.12 });
  }
  return list;
}

function buildGulls(scene) {
  const mat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9, side: THREE.DoubleSide });
  const tip = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9, side: THREE.DoubleSide });
  const gulls = [];
  const wingG = new THREE.BufferGeometry();
  wingG.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.16, 0, 0, 0.16, 0.75, 0, 0.1, 0, 0, -0.16, 0.75, 0, 0.1, 0.8, 0, -0.08], 3));
  wingG.computeVertexNormals();
  const centers = [[20, 34, -98, 28], [0, 16, -20, 20], [-30, 22, -40, 30], [50, 26, -50, 24], [5, 13, 4, 14]];
  centers.forEach(([cx, cy, cz, rad], i) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(G.sph(8, 6), mat);
    body.scale.set(0.22, 0.2, 0.62);
    g.add(body);
    const wings = [];
    for (const s of [-1, 1]) {
      const w = new THREE.Group();
      const a = new THREE.Mesh(wingG, mat);
      const b = new THREE.Mesh(wingG, tip);
      b.scale.set(0.5, 1, 0.7);
      b.position.x = 0.72;
      a.add(b);
      w.add(a);
      w.scale.x = s;
      g.add(w);
      wings.push(w);
    }
    scene.add(g);
    gulls.push({ g, wings, cx, cy, cz, rad, ph: i * 1.7, sp: 0.16 + i * 0.03, dir: i % 2 ? 1 : -1 });
  });
  return gulls;
}

// косяки: тёмные силуэты под водой, от них клёв лучше
function buildSchools(scene) {
  const tex = canvasTex(64, 32, (g) => {
    g.fillStyle = '#fff';
    g.beginPath();
    g.ellipse(26, 16, 20, 8, 0, 0, TAU);
    g.fill();
    g.beginPath();
    g.moveTo(44, 16);
    g.lineTo(62, 5);
    g.lineTo(62, 27);
    g.closePath();
    g.fill();
  });
  const geo = new THREE.PlaneGeometry(0.62, 0.3);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: '#0a3350', map: tex, transparent: true, opacity: 0.5, depthWrite: false });
  const PER = 9;
  const N = 6;
  const inst = new THREE.InstancedMesh(geo, mat, PER * N);
  inst.frustumCulled = false;
  inst.renderOrder = 1;
  scene.add(inst);
  const centers = [];
  for (let i = 0; i < N; i++) centers.push({ x: 0, z: 0, on: 0 });
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const pv = new THREE.Vector3();
  const sv = new THREE.Vector3();
  return {
    centers,
    /** seed — число комнаты, t — секунды общих часов */
    update(seed, t) {
      const period = 240;
      const k = Math.floor(t / period);
      const ph = (t - k * period) / period;
      const fade = Math.min(1, ph * 12, (1 - ph) * 12);
      for (let i = 0; i < N; i++) {
        const rr = rng((seed ^ Math.imul(k + 1, 2654435761) ^ Math.imul(i + 1, 40503)) >>> 0);
        const home = SCHOOL_HOMES[Math.floor(rr() * SCHOOL_HOMES.length)];
        const a = rr() * TAU;
        const c = centers[i];
        c.x = home[0] + Math.sin(t / 37 + a) * 4;
        c.z = home[1] + Math.cos(t / 43 + a * 2) * 4;
        c.on = fade;
        for (let j = 0; j < PER; j++) {
          const sp = 0.5 + rr() * 0.35;
          const ang = (j / PER) * TAU + t * sp * (i % 2 ? 1 : -1) + rr() * 0.8;
          const rad = 1.1 + rr() * 1.6 + Math.sin(t * 0.7 + j) * 0.25;
          pv.set(c.x + Math.cos(ang) * rad, -0.32 - rr() * 0.25, c.z + Math.sin(ang) * rad);
          q.setFromAxisAngle(up, -ang + (i % 2 ? -Math.PI / 2 : Math.PI / 2) + Math.PI / 2);
          const s = (0.8 + rr() * 0.7) * (0.001 + fade);
          m4.compose(pv, q, sv.set(s, s, s));
          inst.setMatrixAt(i * PER + j, m4);
        }
      }
      inst.instanceMatrix.needsUpdate = true;
    },
    isHot(x, z) {
      for (const c of centers) if (c.on > 0.5 && (x - c.x) ** 2 + (z - c.z) ** 2 < 22) return true;
      return false;
    }
  };
}

export function buildScenery(scene) {
  const r = rng(20261111);
  const B = new Batch();
  buildDocks(B, r);
  const shack = buildShack(B, scene, r);
  buildProps(B, r);
  const lamps = buildLamps(B, scene);
  scene.add(B.build());
  buildVegetation(scene, r);
  buildRocks(scene, r);
  const lh = buildLighthouse(scene, r);
  const falls = buildFalls(scene);
  const floaters = buildFloaters(scene);
  const gulls = buildGulls(scene);
  const schools = buildSchools(scene);
  return {
    setBoard: shack.setBoard,
    schools,
    /** night: 0 днём … 1 ночью; light — общая яркость дня */
    setNight(night, light) {
      for (const l of lamps.lamps) l.intensity = night * 9;
      lamps.glassMat.emissiveIntensity = 0.05 + night * 1.9;
      lh.lampMat.emissiveIntensity = 0.25 + night * 2.4;
      lh.beamMat.uniforms.opacity.value = Math.max(0, night - 0.4) * 0.9;
      lh.winMat.emissiveIntensity = night * 1.6;
      falls.uLight.value = 0.14 + 0.86 * light;
    },
    update(dt, t) {
      falls.uTime.value = t;
      lh.beam.rotation.y = t * 0.45;
      for (const f of floaters) {
        const p = f.o.position;
        p.y = f.y + waveH(p.x, p.z, t);
        f.o.rotation.z = Math.sin(t * 0.9 + p.x) * f.roll;
        f.o.rotation.x = Math.cos(t * 0.7 + p.z) * f.roll * 0.7;
      }
      for (const b of gulls) {
        const a = b.ph + t * b.sp * b.dir;
        b.g.position.set(b.cx + Math.cos(a) * b.rad, b.cy + Math.sin(t * 0.3 + b.ph) * 2.5, b.cz + Math.sin(a) * b.rad);
        b.g.rotation.set(0, -a + (b.dir > 0 ? Math.PI : 0), -b.dir * 0.25);
        const flap = Math.sin(t * 5.5 + b.ph * 3) * 0.55 * (0.4 + 0.6 * Math.max(0, Math.sin(t * 0.4 + b.ph)));
        b.wings[0].rotation.z = -flap;
        b.wings[1].rotation.z = flap;
      }
    }
  };
}
