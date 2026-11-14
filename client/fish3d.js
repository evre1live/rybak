// Рыба в 3D: тело-лофт по профилю вида, плавники, раскраска на canvas. Голова смотрит влево (−X), длина тела — 1.
import * as THREE from 'three';
import { modelInfo, modelReady, loadModel, spawn } from './models.js';
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
  flat: [[0, 0.012, 0.008, 0], [0.06, 0.1, 0.022, 0], [0.22, 0.2, 0.03, 0], [0.45, 0.23, 0.03, 0], [0.68, 0.17, 0.026, 0], [0.86, 0.06, 0.016, 0], [1, 0.035, 0.008, 0]],
  // рифовая рыба: диск (бабочка, ангел, хирург), крылатка с большой головой, лобастый каранкс с тонким хвостовым стеблем
  disc: [[0, 0.014, 0.008, 0], [0.06, 0.1, 0.03, 0], [0.2, 0.24, 0.046, 0.005], [0.42, 0.3, 0.05, 0.01], [0.65, 0.25, 0.042, 0.005], [0.85, 0.08, 0.022, 0], [1, 0.04, 0.01, 0]],
  lion: [[0, 0.03, 0.025, 0], [0.06, 0.1, 0.07, 0], [0.2, 0.16, 0.09, 0.005], [0.42, 0.16, 0.08, 0.01], [0.65, 0.115, 0.055, 0.005], [0.85, 0.055, 0.028, 0], [1, 0.03, 0.012, 0]],
  jack: [[0, 0.03, 0.02, 0], [0.06, 0.115, 0.046, 0.005], [0.2, 0.2, 0.066, 0.012], [0.4, 0.22, 0.07, 0.012], [0.62, 0.15, 0.055, 0.005], [0.82, 0.045, 0.026, 0], [0.94, 0.02, 0.02, 0], [1, 0.018, 0.01, 0]],
  // гиганты: акула — острое рыло, толстое тело и тонкий хвостовой стебель; осётр — длинный, с плоским брюхом
  shark: [[0, 0.006, 0.008, -0.004], [0.05, 0.034, 0.04, -0.008], [0.14, 0.072, 0.078, -0.004], [0.3, 0.112, 0.1, 0.002], [0.5, 0.11, 0.092, 0.006], [0.72, 0.064, 0.052, 0.01], [0.9, 0.024, 0.02, 0.012], [1, 0.016, 0.01, 0.014]],
  // океан: летучая рыба (тупая голова, узкое тело), корифена (крутой лоб), парусник и марлин (копьё, как у рыбы-меч)
  wing: [[0, 0.02, 0.018, 0], [0.06, 0.06, 0.045, 0], [0.2, 0.085, 0.06, 0], [0.42, 0.085, 0.058, 0.002], [0.65, 0.065, 0.045, 0], [0.85, 0.035, 0.022, 0], [1, 0.02, 0.01, 0]],
  mahi: [[0, 0.05, 0.02, 0.02], [0.04, 0.16, 0.04, 0.03], [0.15, 0.19, 0.055, 0.02], [0.35, 0.165, 0.055, 0.01], [0.6, 0.115, 0.045, 0], [0.82, 0.05, 0.025, 0], [1, 0.025, 0.01, 0]],
  sail: [[0, 0.012, 0.012, 0], [0.06, 0.05, 0.04, 0], [0.2, 0.085, 0.06, 0], [0.42, 0.095, 0.065, 0], [0.65, 0.07, 0.05, 0], [0.84, 0.03, 0.022, 0], [0.95, 0.015, 0.018, 0], [1, 0.013, 0.01, 0]],
  marlin: [[0, 0.014, 0.014, 0], [0.06, 0.065, 0.05, 0], [0.2, 0.115, 0.085, 0], [0.42, 0.125, 0.09, 0], [0.65, 0.09, 0.065, 0], [0.84, 0.036, 0.026, 0], [0.95, 0.016, 0.02, 0], [1, 0.014, 0.01, 0]],
  sturgeon: [[0, 0.007, 0.012, -0.014], [0.06, 0.032, 0.044, -0.012], [0.18, 0.068, 0.072, -0.002], [0.4, 0.085, 0.082, 0.004], [0.65, 0.066, 0.058, 0.005], [0.85, 0.032, 0.028, 0.008], [1, 0.015, 0.01, 0.012]]
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
  flat: { tail: 'round', d: [0.1, 0.9, 0.055], a: [0.12, 0.9, 0.055] },
  disc: { tail: 'fork', d: [0.2, 0.8, 0.07], a: [0.5, 0.82, 0.07], tailK: 0.8 },
  lion: { tail: 'round', d: [0.14, 0.72, 0.17], a: [0.56, 0.8, 0.1] },
  jack: { tail: 'cres', d: [0.3, 0.46, 0.1], d2: [0.5, 0.82, 0.06], a: [0.52, 0.82, 0.055] },
  // у акулы и осётра хвост несимметричный (верхняя лопасть длиннее), спинной плавник акулы — треугольник (рисуется отдельно)
  shark: { tail: 'shark', d: null, d2: [0.74, 0.79, 0.045], a: [0.75, 0.8, 0.04], tailK: 0.72 },
  sturgeon: { tail: 'shark', d: [0.73, 0.81, 0.06], a: [0.73, 0.8, 0.05], tailK: 0.58 },
  wing: { tail: 'fork', d: [0.6, 0.72, 0.05], a: [0.62, 0.74, 0.04], tailK: 1.1 },
  mahi: { tail: 'fork', d: [0.04, 0.84, 0.075], a: [0.5, 0.84, 0.06] },
  sail: { tail: 'cres', d: [0.1, 0.64, 0.4], d2: [0.74, 0.79, 0.04], a: [0.62, 0.74, 0.07] },
  marlin: { tail: 'cres', d: [0.13, 0.3, 0.27], d2: [0.74, 0.79, 0.04], a: [0.62, 0.74, 0.08] }
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
    } else if (look.pat === 'clown') {
      // рыба-клоун: три белых пояса в чёрной кайме — за головой, посередине и у хвоста
      for (const [at, wd] of [[0.76, 0.085], [0.47, 0.1], [0.15, 0.07]]) {
        g.fillStyle = '#16181c';
        g.fillRect(0, H * (at - wd / 2) - 3, W, H * wd + 6);
        g.fillStyle = pc;
        g.fillRect(0, H * (at - wd / 2), W, H * wd);
      }
    } else if (look.pat === 'zebra') {
      // крылатка: частые поперечные полосы, через одну широкие
      g.fillStyle = pc;
      for (let i = 0; i < 15; i++) {
        const y = H * (0.03 + i * 0.062);
        g.globalAlpha = 0.9;
        g.fillRect(0, y, W, i % 2 ? 4 : 8);
      }
      g.globalAlpha = 1;
    } else if (look.pat === 'mask') {
      // рыба-бабочка: чёрная повязка через глаз, тёмная кайма у хвоста и «ложный глаз» на боку
      g.fillStyle = pc;
      g.fillRect(0, H * 0.87, W, H * 0.055);
      g.fillRect(0, H * 0.08, W, H * 0.035);
      both((s) => {
        g.beginPath();
        g.ellipse(X(0.22, s), H * 0.24, 7, 10, 0, 0, 7);
        g.fill();
      });
      g.strokeStyle = 'rgba(255,255,255,0.85)';
      g.lineWidth = 1.5;
      both((s) => {
        g.beginPath();
        g.ellipse(X(0.22, s), H * 0.24, 8.5, 11.5, 0, 0, 7);
        g.stroke();
      });
    } else if (look.pat === 'palette') {
      // синий хирург: чёрный росчерк от глаза к хвосту с просветом посередине
      g.strokeStyle = pc;
      g.lineCap = 'round';
      g.lineWidth = 15;
      both((s) => {
        g.beginPath();
        g.moveTo(X(0.2, s), H * 0.84);
        g.quadraticCurveTo(X(0.02, s), H * 0.5, X(0.26, s), H * 0.14);
        g.stroke();
        g.beginPath();
        g.moveTo(X(0.34, s), H * 0.7);
        g.quadraticCurveTo(X(0.5, s), H * 0.5, X(0.36, s), H * 0.3);
        g.stroke();
      });
      g.lineCap = 'butt';
    } else if (look.pat === 'parrot') {
      // рыба-попугай: крупная чешуя и цветные мазки — жёлтые и розовые; у рта — «клюв»
      g.strokeStyle = 'rgba(0,60,70,0.28)';
      g.lineWidth = 1.2;
      for (let y = 8; y < H * 0.86; y += 10)
        for (let x = (y / 10) % 2 ? 0 : 6; x < W; x += 12) {
          g.beginPath();
          g.arc(x, y, 6, 0.1, Math.PI - 0.1);
          g.stroke();
        }
      for (let i = 0; i < 18; i++) {
        g.fillStyle = i % 3 === 0 ? '#ff7fb5' : pc;
        g.globalAlpha = 0.55;
        const a = r() * 0.7;
        const y = H * (0.08 + r() * 0.74);
        both((s) => {
          g.beginPath();
          g.ellipse(X(a, s), y, 4 + (i % 4), 9 + (i % 5), 0.3, 0, 7);
          g.fill();
        });
      }
      g.globalAlpha = 1;
      g.fillStyle = '#f5e9c8';
      g.fillRect(0, H * 0.965, W, H * 0.035);
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
function proceduralFish(sp) {
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
  else if (fins.tail === 'shark') tg = flat([[0, 0.022], [0.12 * k, 0.12 * k], [0.29 * k, 0.33 * k], [0.25 * k, 0.31 * k], [0.13 * k, 0.07 * k], [0.17 * k, -0.12 * k], [0.12 * k, -0.135 * k], [0, -0.025]]);
  if (tg) tail.add(new THREE.Mesh(tg, finMat));
  g.add(tail);
  if (fins.d) g.add(new THREE.Mesh(finShape(P, fins.d, fins.d[2], true), finMat));
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
  const billed = shape === 'sword' || shape === 'sail' || shape === 'marlin';
  const [eh, ew, ey] = profileAt(P, shape === 'pike' || shape === 'needle' ? 0.2 : billed ? 0.07 : 0.1);
  const er = (look.bigEye ? 0.034 : shape === 'needle' || shape === 'eel' ? 0.013 : 0.023) * (shape === 'grouper' || shape === 'cat' ? 0.8 : 1);
  const ex = (shape === 'pike' || shape === 'needle' ? 0.2 : billed ? 0.07 : 0.1) - 0.5;
  const sides = shape === 'flat' ? [1] : [-1, 1];
  for (const s of shape === 'shark' || shape === 'sturgeon' ? [] : sides) {
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
  if (shape === 'shark' || shape === 'sturgeon') {
    // маленький тёмный глаз без белка
    const [h0, w0, y0] = profileAt(P, 0.08);
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(G.sph(8, 6), eyeB);
      e.scale.set(0.022, 0.018, 0.012);
      e.position.set(0.08 - 0.5, y0 + h0 * 0.25, s * w0 * 0.92);
      g.add(e);
    }
  }
  if (shape === 'shark') {
    // треугольный спинной плавник и широкие грудные «крылья»; жаберные щели
    const [hh, , yo] = profileAt(P, 0.36);
    const dorsal = new THREE.Mesh(flat([[-0.09, 0], [0.0, 0.17], [0.035, 0.165], [0.06, 0.12], [0.07, 0]]), finMat);
    dorsal.position.set(0.34 - 0.5, yo + hh - 0.012, 0);
    g.add(dorsal);
    const [h2, w2, y2] = profileAt(P, 0.27);
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(flat([[0, 0.02], [0.08, 0.01], [0.24, -0.15], [0.2, -0.165], [0.02, -0.05]]), finMat);
      wing.position.set(0.25 - 0.5, y2 - h2 * 0.55, s * w2 * 0.8);
      wing.rotation.set(s * 1.05, 0, 0);
      g.add(wing);
      for (let i = 0; i < 4; i++) {
        const gill = new THREE.Mesh(G.box(), mat(shade(look.side, -0.35), 0.6));
        gill.scale.set(0.004, h2 * 0.75, 0.004);
        gill.position.set(0.19 - 0.5 + i * 0.018, y2 + h2 * 0.05, s * w2 * 0.99);
        g.add(gill);
      }
    }
  }
  if (shape === 'sturgeon') {
    // костяные щитки рядами по спине и бокам, рыло и усики
    const sc = mat(look.patC || '#dcd6bd', 0.5);
    for (let t = 0.16; t <= 0.74; t += 0.045) {
      const [hh, hw, yo] = profileAt(P, t);
      const top = new THREE.Mesh(G.cone(4), sc);
      top.scale.set(0.018, 0.02, 0.012);
      top.position.set(t - 0.5, yo + hh, 0);
      g.add(top);
      for (const s of [-1, 1]) {
        const side = new THREE.Mesh(G.cone(4), sc);
        side.scale.set(0.014, 0.016, 0.01);
        side.rotation.x = s * Math.PI / 2;
        side.position.set(t - 0.5, yo + hh * 0.15, s * hw * 0.98);
        g.add(side);
      }
    }
    const bm = mat(look.belly, 0.7);
    for (const s of [-1, 1])
      for (const dz of [0.012, 0.03]) g.add(new THREE.Mesh(tube([[-0.47, -0.02, s * dz], [-0.47, -0.05, s * dz * 1.2], [-0.46, -0.07, s * dz * 1.3]], 0.003, 4), bm));
  }
  if (shape === 'wing') {
    // плавники-крылья: длинные, почти прозрачные, раскинуты в стороны
    const [hh, hw, yo] = profileAt(P, 0.22);
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(flat([[0, 0.01], [0.16, 0.06], [0.46, 0.05], [0.52, -0.01], [0.24, -0.05], [0.02, -0.02]]), finMat);
      wing.position.set(0.22 - 0.5, yo + hh * 0.2, s * hw * 0.9);
      wing.rotation.set(s * 1.32, 0, -0.1);
      g.add(wing);
    }
  }
  if (shape === 'sail' || shape === 'marlin') {
    // копьё: у марлина толще и короче, у парусника — тоньше и длиннее
    const sp = new THREE.Mesh(G.cone(6), mat(look.back, 0.5));
    sp.scale.set(shape === 'marlin' ? 0.03 : 0.02, shape === 'marlin' ? 0.3 : 0.34, shape === 'marlin' ? 0.022 : 0.016);
    sp.rotation.z = Math.PI / 2;
    sp.position.set(-0.64, -0.005, 0);
    g.add(sp);
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
  if (shape === 'lion') {
    // лучи над спиной и веера грудных плавников — по ним крылатку узнают издалека
    const ray = mat(look.fin, 0.6);
    for (let i = 0; i < 9; i++) {
      const t = 0.16 + i * 0.062;
      const [hh, , yo] = profileAt(P, t);
      const sp = new THREE.Mesh(G.cone(4), ray);
      const len = 0.2 + 0.1 * Math.sin((i / 8) * Math.PI);
      sp.scale.set(0.012, len, 0.012);
      sp.position.set(t - 0.5 + 0.02, yo + hh + len * 0.42, 0);
      sp.rotation.z = -0.35 + i * 0.03;
      g.add(sp);
    }
    const [hh, hw, yo] = profileAt(P, 0.28);
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(flat([[0, 0], [0.1, 0.16], [0.2, 0.2], [0.27, 0.12], [0.3, 0.0], [0.26, -0.1], [0.16, -0.16], [0.06, -0.1]]), finMat);
      wing.position.set(-0.2, yo - hh * 0.2, s * hw * 0.9);
      wing.rotation.set(0.35 * s, -0.95 * s, -0.25);
      g.add(wing);
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
/**
 * Рыба вида sp длиной 1: голова к −X, спина к +Y. Готовая модель уже загружена — берём сразу её (так бывает почти всегда:
 * модели тех, кто здесь клюёт, подгружаются, пока поплавок на воде). Нет — пока показываем процедурную рыбу,
 * а модель встаёт на её место, как только загрузится.
 */
export function buildFish(sp) {
  const id = 'fish-' + sp;
  if (modelReady(id)) {
    const wrap = new THREE.Group();
    wrap.userData = { tail: null, shape: FISH_BY_ID[sp].look.shape || 'std' };
    return adopt(wrap, id, true);
  }
  return adopt(proceduralFish(sp), id, true);
}
/**
 * Заготовки для сборки шейдеров: процедурная рыба и, если модель sp уже загружена, готовая. Они невидимо лежат в сцене,
 * и шейдеры «рыбьих» материалов собираются вместе со всеми — за заставкой, при смене света и ступени качества.
 * Иначе они собирались бы в момент подсечки: три сборки подряд — рывок в самом начале вываживания.
 */
export function warmFish(sp) {
  const g = new THREE.Group();
  g.add(proceduralFish(sp));
  if (modelReady('fish-' + sp)) g.add(buildFish(sp));
  return g;
}
const WIG_KEY = () => 'fishwig';
/**
 * Подменяет содержимое wrap готовой моделью id (сразу или когда та загрузится). Нет модели — wrap остаётся как был.
 * fish: модель гнётся в шейдере (волна от головы к хвосту), у каждой копии своя фаза; y — сдвиг модели по высоте.
 */
export function adopt(wrap, id, fish = false, y = 0) {
  if (!modelInfo(id)) return wrap;
  const put = (tpl) => {
    const o = spawn(tpl, fish);
    o.position.y = y;
    for (const c of [...wrap.children]) wrap.remove(c);
    wrap.add(o);
    wrap.userData.model = id;
    if (!fish) return;
    wrap.userData.tail = null;
    const wig = (wrap.userData.wig = []);
    o.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(o.matrixWorld).invert();
    o.traverse((c) => {
      if (!c.isMesh) return;
      // вершины хранятся сжатыми: переводим в «рыбьи» координаты (x от −0,5 у головы до +0,5 у хвоста) и обратно
      const e = new THREE.Matrix4().multiplyMatrices(inv, c.matrixWorld).elements;
      const u = { value: new THREE.Vector2(0, 0) };
      const k = { value: new THREE.Vector3(e[0], e[12], 1 / (e[10] || 1)) };
      wig.push(u);
      c.material.onBeforeCompile = (sh) => {
        sh.uniforms.uWig = u;
        sh.uniforms.uWigK = k;
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nuniform vec2 uWig; uniform vec3 uWigK;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat fx = position.x * uWigK.x + uWigK.y; transformed.z += sin(fx * 5.2 - uWig.x) * 0.075 * uWig.y * smoothstep(-0.32, 0.5, fx) * uWigK.z;');
      };
      c.material.customProgramCacheKey = WIG_KEY;
    });
  };
  const tpl = modelReady(id);
  if (tpl) put(tpl);
  else loadModel(id).then(put, () => {});
  return wrap;
}
/** Шевеление хвостом и телом: вызывать каждый кадр. */
export function wiggleFish(fish, t, amp = 1) {
  const u = fish.userData;
  if (!u || !u.shape || !fish.children[0]) return; // хлам на крючке не шевелится
  if (u.wig) {
    for (const w of u.wig) w.value.set(t * 9, amp);
    fish.children[0].rotation.y = Math.sin(t * 9 + 1) * 0.08 * amp;
    return;
  }
  if (u.tail && u.shape !== 'ray') u.tail.rotation.y = Math.sin(t * 9) * 0.5 * amp;
  fish.children[0].rotation.y = Math.sin(t * 9 + 1) * 0.12 * amp;
}
