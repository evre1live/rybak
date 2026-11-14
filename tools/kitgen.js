// Простые сетки для сборных моделей (tools/kit.js, «assemble»): брёвна, доски, стекло.
// Всё — треугольники с нормалями и развёрткой, в метрах; материал задаётся снаружи.

/** Набор вершин одного примитива. */
export class Geo {
  constructor() {
    this.p = [];
    this.n = [];
    this.uv = [];
    this.i = [];
  }
  v(x, y, z, nx, ny, nz, u, w) {
    this.p.push(x, y, z);
    this.n.push(nx, ny, nz);
    this.uv.push(u, w);
    return this.p.length / 3 - 1;
  }
  /**
   * Бревно вдоль оси axis ('x' или 'z'): середина (cx, cy, cz), длина len, радиус r, seg граней.
   * Развёртка: по кругу — ширина текстуры коры, вдоль — tile метров на повтор; торцы — светлый спил (uvCut — где он в текстуре).
   */
  log(axis, cx, cy, cz, len, r, { seg = 8, tile = 2.2, jitter = 0, seed = 0, uvCut = null } = {}) {
    const base = this.p.length / 3;
    const a2 = (t, rr) => [Math.cos(t) * rr, Math.sin(t) * rr];
    const at = (s, a, b) => (axis === 'x' ? [cx + s, cy + b, cz + a] : [cx + a, cy + b, cz + s]);
    const nrm = (a, b) => (axis === 'x' ? [0, b, a] : [a, b, 0]);
    // кольцо вершин на каждом конце; бревно чуть неровное (jitter) — иначе сруб выглядит отлитым
    const off = (k) => Math.sin(seed * 12.9898 + k * 78.233) * jitter;
    for (let e = 0; e < 2; e++) {
      const s = (e - 0.5) * len;
      for (let k = 0; k <= seg; k++) {
        const t = (k / seg) * Math.PI * 2;
        const rr = r * (1 + off(k % seg + e * 31));
        const [a, b] = a2(t, rr);
        const [x, y, z] = at(s, a, b);
        const [nx, ny, nz] = nrm(Math.cos(t), Math.sin(t));
        this.v(x, y, z, nx, ny, nz, k / seg, (s + len / 2) / tile + seed * 0.37);
      }
    }
    const ring = seg + 1;
    for (let k = 0; k < seg; k++) {
      const a = base + k;
      const b = base + k + 1;
      const c = base + ring + k;
      const d = base + ring + k + 1;
      this.i.push(a, c, b, b, c, d);
    }
    // торцы
    for (let e = 0; e < 2; e++) {
      const s = (e - 0.5) * len;
      const sg = e ? 1 : -1;
      const [nx, ny, nz] = axis === 'x' ? [sg, 0, 0] : [0, 0, sg];
      const [x0, y0, z0] = at(s, 0, 0);
      const cu = uvCut || [0.5, 0.5, 0.1];
      const c0 = this.v(x0, y0, z0, nx, ny, nz, cu[0], cu[1]);
      const first = this.p.length / 3;
      for (let k = 0; k <= seg; k++) {
        const t = (k / seg) * Math.PI * 2;
        const [a, b] = a2(t, r * (1 + off(k % seg + e * 31)));
        const [x, y, z] = at(s, a, b);
        this.v(x, y, z, nx, ny, nz, cu[0] + Math.cos(t) * cu[2], cu[1] + Math.sin(t) * cu[2]);
      }
      for (let k = 0; k < seg; k++) {
        if (e) this.i.push(c0, first + k, first + k + 1);
        else this.i.push(c0, first + k + 1, first + k);
      }
    }
  }
  /** Коробка: середина, размеры, поворот вокруг вертикали ry; развёртка — tile метров на повтор. */
  box(cx, cy, cz, sx, sy, sz, { ry = 0, tile = 1.5 } = {}) {
    const c = Math.cos(ry);
    const s = Math.sin(ry);
    const T = (x, y, z) => [cx + x * c + z * s, cy + y, cz - x * s + z * c];
    const R = (x, y, z) => [x * c + z * s, y, -x * s + z * c];
    const hx = sx / 2;
    const hy = sy / 2;
    const hz = sz / 2;
    const faces = [
      [[1, 0, 0], [0, 0, -1], [0, 1, 0], hz, hy, hx],
      [[-1, 0, 0], [0, 0, 1], [0, 1, 0], hz, hy, hx],
      [[0, 1, 0], [1, 0, 0], [0, 0, -1], hx, hz, hy],
      [[0, -1, 0], [1, 0, 0], [0, 0, 1], hx, hz, hy],
      [[0, 0, 1], [1, 0, 0], [0, 1, 0], hx, hy, hz],
      [[0, 0, -1], [-1, 0, 0], [0, 1, 0], hx, hy, hz]
    ];
    for (const [n, u, w, hu, hw, hn] of faces) {
      const base = this.p.length / 3;
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const x = n[0] * hn + u[0] * a * hu + w[0] * b * hw;
        const y = n[1] * hn + u[1] * a * hu + w[1] * b * hw;
        const z = n[2] * hn + u[2] * a * hu + w[2] * b * hw;
        const [px, py, pz] = T(x, y, z);
        const [nx, ny, nz] = R(...n);
        this.v(px, py, pz, nx, ny, nz, ((a + 1) * hu) / tile, ((b + 1) * hw) / tile);
      }
      this.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  /** Пишет примитив в документ glTF-Transform. */
  toPrimitive(doc, buffer, material) {
    const acc = (type, arr) => doc.createAccessor().setType(type).setArray(arr).setBuffer(buffer);
    return doc
      .createPrimitive()
      .setAttribute('POSITION', acc('VEC3', new Float32Array(this.p)))
      .setAttribute('NORMAL', acc('VEC3', new Float32Array(this.n)))
      .setAttribute('TEXCOORD_0', acc('VEC2', new Float32Array(this.uv)))
      .setIndices(acc('SCALAR', new Uint32Array(this.i)))
      .setMaterial(material);
  }
}

/**
 * Сруб: прямоугольник len × dep (длина вдоль X, фасад — сторона −Z), courses венцов бревном радиуса r; на торцах —
 * фронтоны из укорачивающихся брёвен (gable венцов). Брёвна длинных и коротких стен сдвинуты на полбревна —
 * на углах они перекрещиваются с выпуском over.
 */
export function cabinLogs({ len, dep, r, courses, gable, over = 0.28, seed = 1, roof = null }) {
  const g = new Geo();
  const d = 2 * r * 0.94; // брёвна чуть утоплены друг в друга
  let k = 0;
  for (let i = 0; i < courses; i++) {
    const y = r + i * d;
    for (const zz of [-dep / 2, dep / 2]) g.log('x', 0, y, zz, len + 2 * over, r * (0.96 + 0.08 * Math.sin(i * 1.7 + zz)), { jitter: 0.05, seed: seed + k++ });
    for (const xx of [-len / 2, len / 2]) g.log('z', xx, y + d / 2, 0, dep + 2 * over, r * (0.96 + 0.08 * Math.cos(i * 1.3 + xx)), { jitter: 0.05, seed: seed + k++ });
  }
  const top = r + courses * d;
  for (let j = 0; j < gable; j++) {
    const y = top + d / 2 + j * d;
    // фронтон — под скатами крыши: roof = { rise — конёк над стенами, drop — свес ниже стен, run — полуширина ската }
    const h = y + r - top;
    const l = roof ? Math.max(0.3, 2 * ((roof.rise - h) / (roof.rise + roof.drop)) * roof.run - 0.5) : (dep + 2 * over) * (1 - (j + 0.5) / (gable + 0.6));
    for (const xx of [-len / 2, len / 2]) g.log('z', xx, y, 0, l, r * 0.95, { jitter: 0.05, seed: seed + k++ });
  }
  return { geo: g, wallTop: top, ridge: top + gable * d };
}
