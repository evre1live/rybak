// Доски указателя: середина, направление и размер каждой. node tools/dev/boards.mjs <файл.glb> y [y …] — высоты середин досок
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const [file, ...ys] = process.argv.slice(2);
const doc = await io.read(file);
const T = [];
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  for (const prim of mesh.listPrimitives()) {
    const a = prim.getAttribute('POSITION');
    const idx = prim.getIndices();
    const v = [0, 0, 0];
    const P = [];
    const m = node.getWorldMatrix(); // координаты в файле сжаты, настоящие — после матрицы узла
    for (let i = 0; i < a.getCount(); i++) { a.getElement(i, v); P.push([m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12], m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13], m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14]]); }
    for (let i = 0; i < idx.getCount(); i += 3) T.push([P[idx.getScalar(i)], P[idx.getScalar(i + 1)], P[idx.getScalar(i + 2)]]);
  }
}
// сечение модели горизонтальной плоскостью: точки пересечения рёбер треугольников
function cut(y) {
  const pts = [];
  for (const t of T) for (let k = 0; k < 3; k++) {
    const a = t[k], b = t[(k + 1) % 3];
    if ((a[1] - y) * (b[1] - y) < 0) { const f = (y - a[1]) / (b[1] - a[1]); pts.push([a[0] + (b[0] - a[0]) * f, a[2] + (b[2] - a[2]) * f]); }
  }
  return pts;
}
const post = cut(0.25);
const px = post.reduce((s, p) => s + p[0], 0) / post.length, pz = post.reduce((s, p) => s + p[1], 0) / post.length;
console.log('столб: x', px.toFixed(3), 'z', pz.toFixed(3), 'толщина', (Math.max(...post.map((p) => p[0])) - Math.min(...post.map((p) => p[0]))).toFixed(3));
for (const ys0 of ys) {
  const y = +ys0;
  const pts = cut(y).filter((p) => Math.hypot(p[0] - px, p[1] - pz) > 0.06);
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cz = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  let sxx = 0, sxz = 0, szz = 0;
  for (const p of pts) { sxx += (p[0] - cx) ** 2; sxz += (p[0] - cx) * (p[1] - cz); szz += (p[1] - cz) ** 2; }
  const ang = 0.5 * Math.atan2(2 * sxz, sxx - szz);
  const ux = Math.cos(ang), uz = Math.sin(ang);
  let a0 = 9, a1 = -9, n0 = 9, n1 = -9;
  for (const p of pts) { const a = (p[0] - cx) * ux + (p[1] - cz) * uz; const n = -(p[0] - cx) * uz + (p[1] - cz) * ux; a0 = Math.min(a0, a); a1 = Math.max(a1, a); n0 = Math.min(n0, n); n1 = Math.max(n1, n); }
  const mid = [(a0 + a1) / 2 * ux - (n0 + n1) / 2 * uz + cx, (a0 + a1) / 2 * uz + (n0 + n1) / 2 * ux + cz];
  console.log(`y ${y}: точек ${pts.length}, середина x ${mid[0].toFixed(3)} z ${mid[1].toFixed(3)}, угол ${ang.toFixed(3)} рад (${(ang * 57.3).toFixed(0)}°), длина ${(a1 - a0).toFixed(3)}, толщина ${(n1 - n0).toFixed(3)}, концы: (${(mid[0] + ux * (a0 - a1) / 2).toFixed(3)}, ${(mid[1] + uz * (a0 - a1) / 2).toFixed(3)}) … (${(mid[0] + ux * (a1 - a0) / 2).toFixed(3)}, ${(mid[1] + uz * (a1 - a0) / 2).toFixed(3)})`);
}
