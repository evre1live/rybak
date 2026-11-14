// Леска: от катушки через кольца удочки к кончику (pre) и дальше провисающей линией до поплавка или рыбы.
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

const N = 16;
const MAXP = 12; // точек внутри удочки: катушка и кольца
export class FishLine {
  /** through — функция, которая отдаёт точки лески внутри удочки (катушка и кольца); без неё леска начинается у кончика. */
  constructor(scene, color = '#e8f4ff', through = null) {
    this.through = through;
    const g = new LineGeometry();
    g.setPositions(new Float32Array((N + MAXP + 1) * 3));
    this.mat = new LineMaterial({ color, linewidth: 1.6, transparent: true, opacity: 0.9, depthWrite: false });
    this.line = new Line2(g, this.mat);
    this.line.frustumCulled = false;
    this.line.visible = false;
    this.line.renderOrder = 5;
    scene.add(this.line);
    this.arr = g.attributes.instanceStart.data.array;
    this.buf = g.attributes.instanceStart.data;
  }
  setColor(c) {
    this.mat.color.set(c);
  }
  resize(w, h) {
    this.mat.resolution.set(w, h);
  }
  hide() {
    this.line.visible = false;
  }
  /**
   * a — кончик удочки, b — поплавок; sag — провис в метрах; floor — ниже воды не опускаться; wob — дрожь натянутой лески (метры), t — время.
   * pre — точки до кончика (катушка и кольца, см. buildRod().path()): леска идёт через них прямыми отрезками.
   */
  set(a, b, sag = 0.3, floor = 0.02, wob = 0, t = 0, pre = null) {
    const arr = this.arr;
    let k = 0;
    const seg = (x0, y0, z0, x1, y1, z1) => {
      arr[k] = x0;
      arr[k + 1] = y0;
      arr[k + 2] = z0;
      arr[k + 3] = x1;
      arr[k + 4] = y1;
      arr[k + 5] = z1;
      k += 6;
    };
    if (!pre && this.through) pre = this.through();
    const np = pre ? Math.min(pre.length, MAXP) : 0;
    for (let i = 0; i < np; i++) {
      const p = pre[i];
      const q = i + 1 < np ? pre[i + 1] : a;
      seg(p.x, p.y, p.z, q.x, q.y, q.z);
    }
    let px = a.x;
    let py = a.y;
    let pz = a.z;
    for (let i = 0; i < N; i++) {
      const u = (i + 1) / N;
      const x = a.x + (b.x - a.x) * u;
      const z = a.z + (b.z - a.z) * u;
      let y = a.y + (b.y - a.y) * u - sag * 4 * u * (1 - u);
      if (wob) y += Math.sin(u * 12.6 + t * 58) * Math.sin(Math.PI * u) * wob;
      if (u < 1 && y < floor) y = floor;
      seg(px, py, pz, x, y, z);
      px = x;
      py = y;
      pz = z;
    }
    this.line.geometry.instanceCount = k / 6;
    this.buf.needsUpdate = true;
    this.line.visible = true;
  }
  dispose() {
    this.line.parent && this.line.parent.remove(this.line);
    this.line.geometry.dispose();
    this.mat.dispose();
  }
}

const UP = new THREE.Vector3(0, 1, 0);
const QZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
const dv = new THREE.Vector3();
/**
 * Снасть без заброса: из кольца на кончике свисает леска, на ней маятником качается поплавок или приманка.
 * step() двигает точку подвеса (отстаёт, когда кончик дёргается, и успокаивается), place() вешает на неё снасть.
 */
export class Dangle {
  constructor() {
    this.h = new THREE.Vector3();
    this.p = new THREE.Vector3();
    this.on = false;
  }
  reset() {
    this.on = false;
  }
  /** tip — кончик (мир), L — длина свободной лески; возвращает точку подвеса */
  step(tip, L, dt) {
    const h = this.h;
    const p = this.p;
    if (!this.on || h.distanceTo(tip) > L * 4) {
      h.copy(tip).y -= L;
      p.copy(h);
      this.on = true;
    }
    const k = Math.pow(0.9, dt * 60); // затухание
    dv.subVectors(h, p).multiplyScalar(k);
    p.copy(h);
    h.add(dv);
    h.y -= 9.8 * dt * dt;
    dv.subVectors(h, tip);
    const d = dv.length() || 1;
    h.copy(tip).addScaledVector(dv, L / d);
    return h;
  }
  /** Повесить снасть: верх (там, где привязана леска) — в точке подвеса, сама — вдоль лески. attach — от начала координат снасти до узла. */
  place(bob, tip, attach, horiz) {
    dv.subVectors(tip, this.h).normalize();
    bob.quaternion.setFromUnitVectors(UP, dv);
    if (horiz) bob.quaternion.multiply(QZ); // воблер, поппер, джиг висят носом вверх
    bob.position.copy(this.h).addScaledVector(dv, -attach);
  }
}
