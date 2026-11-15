// Скальные выходы и мелочь природы из готовых моделей — по самому рельефу, а не по списку мест.
//
// Где земля каменная (крутой склон или «каменные» вершины сетки — то, что surface.js рисует текстурой камня),
// встают глыбы-утёсы: они закрывают рисованный камень настоящим объёмом. Чем круче и выше склон, тем крупнее глыба.
// Там, где уже стоят утёсы и камни мира (ENV.rocks, скалы у водопадов), новых не ставим.
// По тем же данным сетки — пучки травы на лугах, папоротник под соснами, рогоз у воды, цветущие кусты, галька на
// пляжах и плиты на каменистой кромке. Всё складывается в ENV.decor: { id, x, y — низ, z, s | w,h,d, ry, rx, rz }
// и встаёт россыпью копий (envmodels.js).
import { ENV } from './envmodels.js';
import { LOC_ID } from './loc/id.js';
import { groundH, FALLS, deckAt, ARCH, HAS, SPAWN, BACKWATER, WORLD } from './terrain.js';
import { spot01 } from './scatter.js';

// какие глыбы закрывают склоны на этой локации: [модель, доля]
const CRAG = {
  keys: [['env-coral', 1]]
}[LOC_ID] || [['env-cliff2', 1], ['env-cliff1', 1]]; // одна порода — два вида глыб из одной серии: пласты и уступы
// мелочь: что растёт на этой локации и как густо (доля клеток, где встанет)
const FLORA = {
  bay: { grass: 0.22, fern: 0, flowers: 0.05, reeds: 0.5, pebbles: 0.16, shore: 0.4 },
  lake: { grass: 0.26, fern: 0.4, flowers: 0.04, reeds: 0.55, pebbles: 0.18, shore: 0.4 },
  keys: { grass: 0.16, fern: 0, flowers: 0.07, reeds: 0, pebbles: 0.07, shore: 0 },
  blue: { grass: 0.2, fern: 0.3, flowers: 0.02, reeds: 0, pebbles: 0.14, shore: 0.45 },
  cascade: { grass: 0.16, fern: 0.6, flowers: 0.06, reeds: 0.25, pebbles: 0.07, shore: 0.3 },
  mangrove: { grass: 0.12, fern: 0.55, flowers: 0.05, reeds: 0.3, pebbles: 0.03, shore: 0.2 },
  marina: { grass: 0.14, fern: 0, flowers: 0.08, reeds: 0, pebbles: 0.04, shore: 0 }
}[LOC_ID] || { grass: 0.2, fern: 0, flowers: 0.03, reeds: 0, pebbles: 0.1, shore: 0.3 };

const pick = (list, u) => {
  const total = list.reduce((s, [, w]) => s + w, 0);
  let v = u * total;
  for (const [id, w] of list) {
    if (v < w) return id;
    v -= w;
  }
  return list[list.length - 1][0];
};
const CELL = 4.5; // клетка скальных выходов, м
const SMALL = 5; // клетка мелочи, м

/** До какой высоты место уже закрыто утёсом или камнем мира (или скалой у водопада); −∞ — ничем. */
function coverTop(x, z, pad) {
  let top = -Infinity;
  for (const id in ENV.rocks)
    for (const r of ENV.rocks[id]) {
      const R = Math.max(r.w, r.d) * 0.5 + pad;
      if ((r.x - x) ** 2 + (r.z - z) ** 2 < R * R) top = Math.max(top, r.y + r.h);
    }
  for (const p of ENV.singles) {
    if (!p.rock || !p.fit) continue;
    const R = Math.max(p.fit[0], p.fit[2]) * 0.5 + pad;
    if ((p.x - x) ** 2 + (p.z - z) ** 2 < R * R) top = Math.max(top, p.y + p.fit[1]);
  }
  return top;
}
const covered = (x, z, pad) => coverTop(x, z, pad) > -Infinity;
/** Где падает вода (сама струя и речка над ней) и где стоит арка — туда ни глыб, ни травы. */
function busy(x, z, pad = 0) {
  for (const f of FALLS) {
    const dx = x - f.x;
    const dz = z - f.z;
    const along = dx * f.nx + dz * f.nz; // + — к воде
    const lat = Math.abs(-dx * f.nz + dz * f.nx);
    if (along > -14 - pad && along < 12 + pad && lat < (f.w || 1.25) * 1.5 + 1.6 + pad) return true;
  }
  if (HAS.arch && (ARCH.x - x) ** 2 + (ARCH.z - z) ** 2 < (ARCH.w * 0.6) ** 2) return true;
  return !!deckAt(x, z, -1.5);
}

/**
 * Разобрать сетку рельефа (world.js: куски с userData.grid, атрибуты normal и aGround) и разложить ENV.decor.
 * Вызывать после buildScenery: утёсы и камни мира к этому времени уже в ENV.rocks.
 */
export function collectDecor(terrain) {
  const out = (ENV.decor = []);
  const crag = new Map(); // клетка → { n, nr, x, z, nx, ny, nz, y0, y1 }
  const soft = new Map(); // клетка мелочи → лучшие точки по видам
  const keyOf = (x, z, c) => Math.floor(x / c) + ':' + Math.floor(z / c);
  for (const m of terrain.children) {
    const g = m.userData.grid;
    if (!g || (g.x1 - g.x0) / g.nx > 3.2) continue; // грубые куски (горы, дальнее море) — без мелочи
    const p = m.geometry.attributes.position;
    const nA = m.geometry.attributes.normal;
    const wA = m.geometry.attributes.aGround;
    if (!wA) continue;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const ny = nA.getY(i);
      const wg = wA.getX(i);
      const wr = wA.getY(i);
      const ws = wA.getZ(i);
      const wp = wA.getW(i);
      // ── каменная земля над водой ──
      if (y > 0.35) {
        const k = keyOf(x, z, CELL);
        let c = crag.get(k);
        if (!c) crag.set(k, (c = { n: 0, nr: 0, x: 0, z: 0, nx: 0, ny: 0, nz: 0, y0: 1e9, y1: -1e9 }));
        c.n++;
        if (ny < 0.68 || wr > 0.5) {
          c.nr++;
          c.x += x;
          c.z += z;
          c.nx += nA.getX(i);
          c.ny += ny;
          c.nz += nA.getZ(i);
          c.y0 = Math.min(c.y0, y);
          c.y1 = Math.max(c.y1, y);
        }
      }
      // ── мелочь: в каждой клетке по виду одна точка — та, что подходит лучше ──
      const k2 = keyOf(x, z, SMALL);
      let s = soft.get(k2);
      if (!s) soft.set(k2, (s = {}));
      const best = (kind, score, extra) => {
        if (score <= 0) return;
        const b = s[kind];
        if (!b || score > b.score) s[kind] = { score, x, y, z, ny, ...extra };
      };
      if (y > 0.9 && y < 40 && ny > 0.86 && wg > 0.85 && wp < 0.1) best('grass', wg * ny + spot01(x, z, 21) * 0.3);
      if (y > -0.45 && y < 0.25 && ny > 0.8 && wr < 0.4) best('reeds', 1 - Math.abs(y + 0.1) + spot01(x, z, 22) * 0.3);
      if (y > -0.05 && y < 0.55 && ws > 0.7 && ny > 0.9) best('pebbles', ws + spot01(x, z, 23) * 0.3);
      if (y > -0.4 && y < 0.9 && (wr > 0.5 || ny < 0.8)) best('shore', wr + (1 - ny) + spot01(x, z, 24) * 0.3, { nx: nA.getX(i), nz: nA.getZ(i) });
    }
  }

  // ── скальные выходы ──
  let crags = 0;
  for (const c of crag.values()) {
    if (c.nr < 3 || c.nr < c.n * 0.45) continue;
    const x = c.x / c.nr;
    const z = c.z / c.nr;
    if (busy(x, z)) continue;
    const hl = Math.hypot(c.nx, c.nz);
    // Отвесная стена — сплошь глыбами. Склон умеренный (камень на нём лишь проступает пятнами) или ровная каменная
    // площадка — редкий валун: сплошной россыпью такой склон превращался в осыпь
    const steep = 1 - c.ny / c.nr;
    const flat = hl < c.ny * 0.25 || steep < 0.42;
    if (flat && spot01(x, z, 30) > 0.28) continue;
    const ox = flat ? 1 : c.nx / hl; // куда смотрит склон (наружу)
    const oz = flat ? 0 : c.nz / hl;
    const u = spot01(x, z, 31);
    const id = flat ? (LOC_ID === 'keys' ? 'env-coral' : 'env-rock1') : pick(CRAG, u);
    const w = CELL * (flat ? 0.55 + u * 0.4 : 1.55 + spot01(x, z, 32) * 0.45);
    const d = w * 0.72;
    // от подножия (ниже по склону) до бровки (выше): глыба закрывает весь камень клетки и чуть выступает над ним
    const yb = Math.min(groundH(x + ox * d * 0.5, z + oz * d * 0.5), c.y0) - 0.7;
    const yt = Math.max(groundH(x - ox * d * 0.5, z - oz * d * 0.5), c.y1) + 0.35 + w * 0.06;
    // ниже — уже утёс мира: начинаем над ним
    const ct = coverTop(x, z, 0.5);
    if (ct > yt - 0.6) continue;
    const base = flat ? Math.max(groundH(x, z), -0.6) - w * 0.17 : Math.max(yb, -1.6, ct - 1.0);
    const H = flat ? w * 0.5 : Math.max(yt - base, w * 0.45);
    // высокая стена — несколькими глыбами одна над другой: каждая на своей высоте склона, чуть выступает из него
    const levels = flat ? 1 : Math.max(1, Math.ceil(H / (w * 1.15)));
    for (let k = 0; k < levels; k++) {
      const lb = base + (k * H) / levels - (k ? 0.9 : 0);
      const lt = base + ((k + 1) * H) / levels + (k + 1 < levels ? 0.3 : 0);
      let px = x;
      let pz = z;
      if (levels > 1) {
        // точка склона на середине этого яруса: идём от клетки вверх по склону, пока земля не поднимется до неё
        const ym = (lb + lt) / 2;
        let t = -d;
        while (t < d * 5 && groundH(x - ox * t, z - oz * t) < ym) t += 0.3;
        px = x - ox * (t - d * 0.18);
        pz = z - oz * (t - d * 0.18);
      }
      const u2 = spot01(px, pz, 38);
      const kid = k ? pick(CRAG, u2) : id;
      const ry = flat ? spot01(x, z, 33) * Math.PI * 2 : Math.atan2(-ox, -oz) + (spot01(px, pz, 34) < 0.5 ? Math.PI : 0) + (spot01(px, pz, 35) - 0.5) * 0.35;
      // низкая и широкая глыба выходит приплюснутой «шляпкой» — такой делаем её уже
      const lw = Math.min(w * (k ? 0.92 + u2 * 0.2 : 1), Math.max((lt - lb) / 0.55, CELL * 0.9));
      out.push({ id: kid, x: px, y: lb, z: pz, w: lw, h: lt - lb, d: null, ry, rx: (spot01(px, pz, 36) - 0.5) * 0.12, rz: (spot01(px, pz, 37) - 0.5) * 0.12, crag: true });
      crags++;
    }
  }

  // ── мелочь ──
  const near = (x, z) => Math.hypot(x - SPAWN.x, z - SPAWN.z) < 9; // у лавки и пирса — чисто
  const inWorld = (x, z, m) => x > WORLD.x0 - m && x < WORLD.x1 + m && z > WORLD.z0 - m && z < WORLD.z1 + m;
  const pines = [...(ENV.flora['env-pine'] || []), ...(ENV.flora['env-birch'] || [])];
  for (const s of soft.values()) {
    for (const kind in s) {
      const b = s[kind];
      const { x, y, z } = b;
      if (busy(x, z, 1) || near(x, z)) continue;
      const u = spot01(x, z, 41);
      const ry = spot01(x, z, 42) * Math.PI * 2;
      if (kind === 'grass') {
        if (!inWorld(x, z, 70)) continue;
        // под соснами — папоротник, на открытом лугу — трава и изредка цветущий куст
        const tree = FLORA.fern && pines.some((t) => (t.x - x) ** 2 + (t.z - z) ** 2 < 4.5 * 4.5);
        if (tree && u < FLORA.fern) out.push({ id: 'env-fern', x, y: y - 0.05, z, s: 1.1 + spot01(x, z, 43) * 0.7, ry });
        else if (u < FLORA.flowers) out.push({ id: 'env-flowerbush', x, y: y - 0.08, z, s: 1.1 + spot01(x, z, 44) * 0.6, ry });
        else if (u < FLORA.flowers + FLORA.grass) out.push({ id: 'env-grass', x, y: y - 0.04, z, s: 0.75 + spot01(x, z, 45) * 0.55, ry });
      } else if (kind === 'reeds') {
        if (!FLORA.reeds || u > FLORA.reeds * (Math.hypot(x - BACKWATER.x, z - BACKWATER.z) < BACKWATER.r + 8 ? 1.6 : 1)) continue;
        if (covered(x, z, 0.3)) continue;
        out.push({ id: 'env-reeds', x, y: y - 0.1, z, s: 1.5 + spot01(x, z, 46) * 0.8, ry });
      } else if (kind === 'pebbles') {
        if (u > FLORA.pebbles || covered(x, z, 0.3)) continue;
        out.push({ id: 'env-pebbles', x, y: y - 0.05, z, s: 1.3 + spot01(x, z, 47) * 1.1, ry });
      } else if (kind === 'shore') {
        if (u > FLORA.shore || covered(x, z, 0.5)) continue;
        // плита лежит вдоль кромки: длинной стороной по берегу
        const hl = Math.hypot(b.nx, b.nz);
        const r2 = hl > 0.05 ? Math.atan2(-b.nx / hl, -b.nz / hl) : ry;
        out.push({ id: 'env-shore', x, y: Math.min(y, 0.2) - 0.35, z, s: 2.6 + spot01(x, z, 48) * 2.2, ry: r2 });
      }
    }
  }
  return { crags, decor: out.length - crags };
}
