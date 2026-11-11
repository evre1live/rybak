// Леска: провисающая линия от кончика удочки до поплавка или рыбы.
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

const N = 16;
export class FishLine {
  constructor(scene, color = '#e8f4ff') {
    const g = new LineGeometry();
    g.setPositions(new Float32Array((N + 1) * 3));
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
  /** a — кончик удочки, b — поплавок; sag — провис в метрах; floor — ниже воды не опускаться */
  set(a, b, sag = 0.3, floor = 0.02) {
    const arr = this.arr;
    let px = a.x;
    let py = a.y;
    let pz = a.z;
    for (let i = 0; i < N; i++) {
      const u = (i + 1) / N;
      const x = a.x + (b.x - a.x) * u;
      const z = a.z + (b.z - a.z) * u;
      let y = a.y + (b.y - a.y) * u - sag * 4 * u * (1 - u);
      if (u < 1 && y < floor) y = floor;
      const k = i * 6;
      arr[k] = px;
      arr[k + 1] = py;
      arr[k + 2] = pz;
      arr[k + 3] = x;
      arr[k + 4] = y;
      arr[k + 5] = z;
      px = x;
      py = y;
      pz = z;
    }
    this.buf.needsUpdate = true;
    this.line.visible = true;
  }
  dispose() {
    this.line.parent && this.line.parent.remove(this.line);
    this.line.geometry.dispose();
    this.mat.dispose();
  }
}
