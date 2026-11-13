// Дорога для лодки по воде: сетка «где проходит лодка» (по canSail), поиск кратчайшего пути и сглаживание.
// Нужна мини-карте: линия маршрута до цели и расстояние по воде, а не по прямой через острова.
import { WORLD, canSail } from './terrain.js';

const CELL = 4; // шаг сетки, м: мельче — дольше считать, крупнее — пропадает проход между пирсом и рифом
const PAD = 1.2; // запас на корпус лодки вокруг середины клетки, м
const NX = Math.ceil((WORLD.x1 - WORLD.x0) / CELL);
const NZ = Math.ceil((WORLD.z1 - WORLD.z0) / CELL);
const N = NX * NZ;
const cellX = (i) => WORLD.x0 + (i + 0.5) * CELL;
const cellZ = (j) => WORLD.z0 + (j + 0.5) * CELL;
let grid = null; // 1 — лодка проходит
let corner = null; // 1 — в общем углу четырёх клеток (у клетки он справа-снизу) чистая вода: через него идут наискосок
let gs = null; // цена пути до клетки
let from = null; // откуда пришли
let mark = null; // номер поиска, в котором клетку трогали: массивы не чистим между поисками
let run = 0;
let rows = 0; // сколько строк сетки уже посчитано
let work = null;
let workC = null;

/** Считаем сетку по строкам, не дольше ms миллисекунд за раз. true — готова. */
function build(ms = Infinity) {
  if (!work) {
    work = new Uint8Array(N);
    workC = new Uint8Array(N);
  }
  const t0 = performance.now();
  for (; rows < NZ; rows++) {
    if (performance.now() - t0 > ms) return false;
    const j = rows;
    for (let i = 0; i < NX; i++) {
      const x = cellX(i), z = cellZ(j);
      work[j * NX + i] = canSail(x, z) && canSail(x + PAD, z) && canSail(x - PAD, z) && canSail(x, z + PAD) && canSail(x, z - PAD) ? 1 : 0;
      // буёк или камень может стоять ровно между серединами клеток — там, где проходит ход наискосок
      workC[j * NX + i] = canSail(x + CELL / 2, z + CELL / 2) ? 1 : 0;
    }
  }
  grid = work;
  corner = workC;
  gs = new Float32Array(N);
  from = new Int32Array(N);
  mark = new Uint32Array(N);
  return true;
}
/**
 * Готовим сетку проходимости. Весь расчёт — около трети секунды, поэтому в игре он идёт понемногу:
 * routeReady(4) зовут раз в кадр, пока не вернёт true. Без довода — считает всё сразу (для проверок).
 */
export function routeReady(ms = Infinity) {
  return grid ? true : build(ms);
}
/** Ближайшая проходимая клетка к точке (сама точка может стоять у причала или у самого берега). */
function near(x, z) {
  const i0 = Math.max(0, Math.min(NX - 1, Math.floor((x - WORLD.x0) / CELL)));
  const j0 = Math.max(0, Math.min(NZ - 1, Math.floor((z - WORLD.z0) / CELL)));
  // точка далеко за краем моря — не наша: туда лодке не доплыть
  if (Math.hypot(cellX(i0) - x, cellZ(j0) - z) > 36) return -1;
  if (grid[j0 * NX + i0]) return j0 * NX + i0;
  let best = -1, bd = Infinity;
  for (let r = 1; r <= 8 && best < 0; r++) {
    for (let j = j0 - r; j <= j0 + r; j++)
      for (let i = i0 - r; i <= i0 + r; i++) {
        if (i < 0 || j < 0 || i >= NX || j >= NZ || (Math.abs(i - i0) !== r && Math.abs(j - j0) !== r)) continue;
        if (!grid[j * NX + i]) continue;
        const d = (cellX(i) - x) ** 2 + (cellZ(j) - z) ** 2;
        if (d < bd) {
          bd = d;
          best = j * NX + i;
        }
      }
  }
  return best;
}
// концы пути — сама лодка и цель: они могут стоять вплотную к причалу или берегу, поэтому рядом с ними воду не проверяем
const ENDS = 5;
let ex0 = 0, ez0 = 0, ex1 = 0, ez1 = 0;
/** Между точками чистая вода? Проверяем каждый метр, с запасом на борта (side). */
function clear(ax, az, bx, bz, side = 1.5) {
  const d = Math.hypot(bx - ax, bz - az);
  const n = Math.max(1, Math.ceil(d));
  const nx = d > 0 ? -(bz - az) / d : 0, nz = d > 0 ? (bx - ax) / d : 0;
  for (let k = 0; k <= n; k++) {
    const x = ax + ((bx - ax) * k) / n, z = az + ((bz - az) * k) / n;
    if ((x - ex0) ** 2 + (z - ez0) ** 2 < ENDS * ENDS || (x - ex1) ** 2 + (z - ez1) ** 2 < ENDS * ENDS) continue;
    if (!canSail(x, z) || !canSail(x + nx * side, z + nz * side) || !canSail(x - nx * side, z - nz * side)) return false;
  }
  return true;
}

/**
 * Путь по воде от (ax, az) до (bx, bz): { pts: [[x, z], …], len } или null, если пути нет.
 * Первая и последняя точки — сами концы (лодка и цель), между ними — сглаженная ломаная.
 */
export function route(ax, az, bx, bz) {
  if (!grid) return null;
  const a = near(ax, az), b = near(bx, bz);
  if (a < 0 || b < 0) return null;
  ex0 = ax;
  ez0 = az;
  ex1 = bx;
  ez1 = bz;
  run++;
  // куча: пары (оценка, клетка) в двух массивах
  const hf = [], hi = [];
  const push = (f, i) => {
    let k = hf.length;
    hf.push(f);
    hi.push(i);
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (hf[p] <= hf[k]) break;
      [hf[p], hf[k]] = [hf[k], hf[p]];
      [hi[p], hi[k]] = [hi[k], hi[p]];
      k = p;
    }
  };
  const pop = () => {
    const top = hi[0];
    const lf = hf.pop(), li = hi.pop();
    if (hf.length) {
      hf[0] = lf;
      hi[0] = li;
      let k = 0;
      for (;;) {
        const l = k * 2 + 1, r = l + 1;
        let m = k;
        if (l < hf.length && hf[l] < hf[m]) m = l;
        if (r < hf.length && hf[r] < hf[m]) m = r;
        if (m === k) break;
        [hf[m], hf[k]] = [hf[k], hf[m]];
        [hi[m], hi[k]] = [hi[k], hi[m]];
        k = m;
      }
    }
    return top;
  };
  const bi = b % NX, bj = (b / NX) | 0;
  const h = (i, j) => {
    const dx = Math.abs(i - bi), dz = Math.abs(j - bj);
    return (Math.max(dx, dz) + 0.4142 * Math.min(dx, dz)) * CELL;
  };
  gs[a] = 0;
  from[a] = -1;
  mark[a] = run;
  push(h(a % NX, (a / NX) | 0), a);
  let found = false;
  while (hf.length) {
    const c = pop();
    if (c === b) {
      found = true;
      break;
    }
    const ci = c % NX, cj = (c / NX) | 0;
    for (let dj = -1; dj <= 1; dj++)
      for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const i = ci + di, j = cj + dj;
        if (i < 0 || j < 0 || i >= NX || j >= NZ) continue;
        const n = j * NX + i;
        if (!grid[n]) continue;
        // по диагонали — только если оба соседа по сторонам свободны (углы островов не срезаем) и в общем углу клеток вода
        if (di && dj && (!grid[cj * NX + i] || !grid[j * NX + ci] || !corner[Math.min(cj, j) * NX + Math.min(ci, i)])) continue;
        const g = gs[c] + (di && dj ? 1.4142 : 1) * CELL;
        if (mark[n] === run && g >= gs[n]) continue;
        gs[n] = g;
        from[n] = c;
        mark[n] = run;
        push(g + h(i, j), n);
      }
  }
  if (!found) return null;
  // клетки пути → точки; концы — настоящие лодка и цель
  let pts = [];
  for (let c = b; c >= 0; c = from[c]) pts.push([cellX(c % NX), cellZ((c / NX) | 0)]);
  pts.reverse();
  pts[0] = [ax, az];
  pts[pts.length - 1] = [bx, bz];
  // выпрямляем: из каждой точки идём к самой дальней, до которой чистая вода (ищем её делением пополам)
  const cut = [pts[0]];
  for (let i = 0; i < pts.length - 1; ) {
    let j = pts.length - 1;
    if (j > i + 1 && !clear(pts[i][0], pts[i][1], pts[j][0], pts[j][1])) {
      let lo = i + 1;
      while (j - lo > 1) {
        const mid = (lo + j) >> 1;
        if (clear(pts[i][0], pts[i][1], pts[mid][0], pts[mid][1])) lo = mid;
        else j = mid;
      }
      j = lo;
    }
    cut.push(pts[j]);
    i = j;
  }
  pts = cut;
  // скругляем углы (дважды), но только там, где срезанный угол тоже идёт по воде: срез смотрит внутрь поворота — на преграду
  for (let k = 0; k < 2 && pts.length > 2; k++) {
    const s = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, z] = pts[i], [xa, za] = pts[i - 1], [xb, zb] = pts[i + 1];
      const da = Math.hypot(xa - x, za - z), db = Math.hypot(xb - x, zb - z);
      const ta = Math.min(0.3, 14 / (da || 1)), tb = Math.min(0.3, 14 / (db || 1));
      const q = [x + (xa - x) * ta, z + (za - z) * ta], r = [x + (xb - x) * tb, z + (zb - z) * tb];
      if (clear(q[0], q[1], r[0], r[1], 1.2)) s.push(q, r);
      else s.push(pts[i]);
    }
    s.push(pts[pts.length - 1]);
    pts = s;
  }
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { pts, len };
}
