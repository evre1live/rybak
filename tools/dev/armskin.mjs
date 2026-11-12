// Как привязано плечо героя к костям: node tools/dev/armskin.mjs <файл.glb> [L|R]
// По участкам плеча (от плечевого сустава к локтю) — какая доля веса у костей руки и у каких ещё костей.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const [file, side = 'L'] = process.argv.slice(2);
const S = side === 'L' ? 'Left' : 'Right';
const doc = await io.read(file);
const skin = doc.getRoot().listSkins()[0];
const joints = skin.listJoints();
const names = joints.map((j) => j.getName());
const idx = (re) => names.findIndex((n) => re.test(n));
const iSh = idx(new RegExp(S + 'Shoulder$')), iA = idx(new RegExp(S + 'Arm$')), iE = idx(new RegExp(S + 'ForeArm$')), iH = idx(new RegExp(S + 'Hand$'));
const wpos = (j) => { const m = j.getWorldMatrix(); return [m[12], m[13], m[14]]; };
const pA = wpos(joints[iA]), pE = wpos(joints[iE]), pSh = wpos(joints[iSh]);
const ax = pE.map((v, k) => v - pA[k]);
const L = Math.hypot(...ax);
const armSet = new Set();
for (let i = 0; i < joints.length; i++) { let n = joints[i]; while (n) { if (n === joints[iA]) { armSet.add(i); break; } n = n.getParentNode && n.getParentNode(); } }
console.log(file.split('/').pop(), side, 'костей', joints.length, '| плечо', names[iA], 'длина', L.toFixed(3), '| родитель', joints[iA].getParentNode().getName(), '| костей в руке', armSet.size);
// мировая матрица кости × обратная матрица привязки
const ibm = skin.getInverseBindMatrices();
const mul = (a, b) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; };
const bind = joints.map((jn, i) => { const e = new Array(16); ibm.getElement(i, e); return mul(jn.getWorldMatrix(), e); });
const bins = Array.from({ length: 12 }, () => ({ n: 0, arm: 0, sh: 0, full: 0, half: 0, other: new Map() }));
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh || !node.getSkin()) continue;
  for (const prim of mesh.listPrimitives()) {
    const P = prim.getAttribute('POSITION'), J = prim.getAttribute('JOINTS_0'), W = prim.getAttribute('WEIGHTS_0');
    const p = [0, 0, 0], j = [0, 0, 0, 0], w = [0, 0, 0, 0];
    for (let i = 0; i < P.getCount(); i++) {
      P.getElement(i, p); J.getElement(i, j); W.getElement(i, w);
      let a = 0, sh = 0;
      for (let k = 0; k < 4; k++) { if (armSet.has(j[k])) a += w[k]; if (j[k] === iSh) sh += w[k]; }
      if (a + sh < 0.05) continue;
      // положение вдоль плеча: 0 — плечевой сустав, 1 — локоть (меш в позе привязки, без матрицы узла — у героев она единичная с точностью до масштаба)
      // вершина в позе привязки: через кости (у сжатых моделей сетка лежит в своих единицах, их снимают обратные матрицы)
      const q = [0, 0, 0];
      for (let k = 0; k < 4; k++) {
        if (!w[k]) continue;
        const m = bind[j[k]];
        q[0] += w[k] * (m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]);
        q[1] += w[k] * (m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]);
        q[2] += w[k] * (m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]);
      }
      const t = ((q[0] - pA[0]) * ax[0] + (q[1] - pA[1]) * ax[1] + (q[2] - pA[2]) * ax[2]) / (L * L);
      // только то, что рядом с осью плеча: туловище сюда не попадает
      const rr = Math.hypot(q[0] - pA[0] - ax[0] * t, q[1] - pA[1] - ax[1] * t, q[2] - pA[2] - ax[2] * t);
      if (rr > L * 0.55) continue;
      const b = Math.floor((t + 0.5) * 6);
      if (b < 0 || b >= bins.length) continue;
      const B = bins[b];
      B.n++; B.arm += a; B.sh += sh; if (a >= 0.97) B.full++; if (a >= 0.5) B.half++;
      for (let k = 0; k < 4; k++) if (w[k] > 0.02 && !armSet.has(j[k]) && j[k] !== iSh) B.other.set(names[j[k]], (B.other.get(names[j[k]]) || 0) + w[k]);
    }
  }
}
bins.forEach((B, b) => { if (!B.n) return; const t0 = b / 6 - 0.5; console.log(`  t ${t0.toFixed(2)}…${(t0 + 1 / 6).toFixed(2)}: вершин ${String(B.n).padStart(4)}, вес руки ${(B.arm / B.n).toFixed(2)}, ключицы ${(B.sh / B.n).toFixed(2)}, ≥0,97: ${Math.round((100 * B.full) / B.n)}%, ≥0,5: ${Math.round((100 * B.half) / B.n)}%`, [...B.other.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n, v]) => n.replace(/^.*:/, '') + ' ' + (v / B.n).toFixed(2)).join(', ')); });
