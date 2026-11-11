// Заготовки форм: «лофт» (тело вращения с овальным сечением) и трубка вдоль кривой.
import * as THREE from 'three';

const TAU = Math.PI * 2;
/**
 * Лофт вдоль оси Y. sections: [[y, rx, rz, ox = 0, oz = 0], …] снизу вверх.
 * pow — «квадратность» сечения: 2 — эллипс, больше — ближе к скруглённому прямоугольнику.
 * uv: u — вокруг, v — вдоль.
 */
export function loft(sections, seg = 16, pow = 2, caps = true) {
  const pos = [];
  const uv = [];
  const idx = [];
  const n = sections.length;
  const ring = seg + 1;
  for (let i = 0; i < n; i++) {
    const [y, rx, rz, ox = 0, oz = 0] = sections[i];
    for (let j = 0; j <= seg; j++) {
      const a = (j / seg) * TAU;
      let c = Math.cos(a);
      let s = Math.sin(a);
      if (pow !== 2) {
        c = Math.sign(c) * Math.pow(Math.abs(c), 2 / pow);
        s = Math.sign(s) * Math.pow(Math.abs(s), 2 / pow);
      }
      pos.push(ox + rx * c, y, oz + rz * s);
      uv.push(j / seg, i / (n - 1));
    }
  }
  for (let i = 0; i < n - 1; i++)
    for (let j = 0; j < seg; j++) {
      const a = i * ring + j;
      const b = a + ring;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  if (caps) {
    const [y0, , , ox0 = 0, oz0 = 0] = sections[0];
    const [y1, , , ox1 = 0, oz1 = 0] = sections[n - 1];
    const c0 = pos.length / 3;
    pos.push(ox0, y0, oz0);
    uv.push(0.5, 0);
    const c1 = c0 + 1;
    pos.push(ox1, y1, oz1);
    uv.push(0.5, 1);
    const top = (n - 1) * ring;
    for (let j = 0; j < seg; j++) {
      idx.push(c0, j, j + 1);
      idx.push(c1, top + j + 1, top + j);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // шов: первая и последняя вершины кольца совпадают — усредняем нормали
  const nor = g.attributes.normal;
  for (let i = 0; i < n; i++) {
    const a = i * ring;
    const b = a + seg;
    const x = nor.getX(a) + nor.getX(b);
    const y = nor.getY(a) + nor.getY(b);
    const z = nor.getZ(a) + nor.getZ(b);
    const l = Math.hypot(x, y, z) || 1;
    nor.setXYZ(a, x / l, y / l, z / l);
    nor.setXYZ(b, x / l, y / l, z / l);
  }
  return g;
}

/** Трубка вдоль точек [[x,y,z], …] радиуса r; taper(t) — множитель радиуса вдоль длины (сужение). */
export function tube(points, r = 0.01, seg = 6, taper = null) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  const n = Math.max(8, points.length * 5);
  const g = new THREE.TubeGeometry(curve, n, r, seg, false);
  if (taper) {
    const p = g.attributes.position;
    const c = new THREE.Vector3();
    const v = new THREE.Vector3();
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      curve.getPointAt(t, c);
      const k = taper(t);
      for (let j = 0; j <= seg; j++) {
        const id = i * (seg + 1) + j;
        v.fromBufferAttribute(p, id).sub(c).multiplyScalar(k).add(c);
        p.setXYZ(id, v.x, v.y, v.z);
      }
    }
    g.computeVertexNormals();
  }
  return g;
}

/** Плоская фигура по точкам [[x, y], …] в плоскости XY. */
export function flat(points) {
  const s = new THREE.Shape();
  points.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
  s.closePath();
  return new THREE.ShapeGeometry(s);
}
