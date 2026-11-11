// Всплески и круги на воде.
import * as THREE from 'three';
import { waveH } from './water.js';

const RINGS = 20;
const DROPS = 220;
export class Fx {
  constructor(scene) {
    const geo = new THREE.RingGeometry(0.84, 1, 40);
    geo.rotateX(-Math.PI / 2);
    this.rings = [];
    for (let i = 0; i < RINGS; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }));
      m.visible = false;
      m.renderOrder = 3;
      scene.add(m);
      this.rings.push({ m, t: 0, life: 0, size: 1 });
    }
    this.pos = new Float32Array(DROPS * 3);
    this.vel = new Float32Array(DROPS * 3);
    this.life = new Float32Array(DROPS);
    for (let i = 0; i < DROPS; i++) this.pos[i * 3 + 1] = -50;
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.points = new THREE.Points(pg, new THREE.PointsMaterial({ color: '#eafcff', size: 0.085, sizeAttenuation: true, transparent: true, opacity: 0.92, depthWrite: false }));
    this.points.frustumCulled = false;
    this.points.renderOrder = 4;
    scene.add(this.points);
    this.next = 0;
    this.nextRing = 0;
    this.time = 0;
  }
  ripple(x, z, size = 1, life = 1.3, delay = 0) {
    const r = this.rings[this.nextRing++ % RINGS];
    r.m.position.set(x, 0.04, z);
    r.t = -delay;
    r.life = life;
    r.size = size;
    r.m.visible = true;
    r.m.material.opacity = 0;
  }
  splash(x, z, power = 1) {
    const n = Math.round(10 + 22 * power);
    const y = waveH(x, z, this.time);
    for (let i = 0; i < n; i++) {
      const k = this.next++ % DROPS;
      const a = Math.random() * Math.PI * 2;
      const sp = (0.5 + Math.random() * 1.6) * (0.6 + power * 0.6);
      this.pos[k * 3] = x + Math.cos(a) * 0.08;
      this.pos[k * 3 + 1] = y + 0.05;
      this.pos[k * 3 + 2] = z + Math.sin(a) * 0.08;
      this.vel[k * 3] = Math.cos(a) * sp;
      this.vel[k * 3 + 1] = (1.8 + Math.random() * 2.6) * (0.6 + power * 0.5);
      this.vel[k * 3 + 2] = Math.sin(a) * sp;
      this.life[k] = 1.2;
    }
    this.ripple(x, z, 0.7 + power * 0.9, 1.1);
    this.ripple(x, z, 1.1 + power * 1.5, 1.6, 0.18);
  }
  update(dt, t) {
    this.time = t;
    for (const r of this.rings) {
      if (!r.m.visible) continue;
      r.t += dt;
      if (r.t < 0) continue;
      const k = r.t / r.life;
      if (k >= 1) {
        r.m.visible = false;
        continue;
      }
      const s = r.size * (0.15 + 0.85 * Math.sqrt(k));
      r.m.scale.set(s, 1, s);
      r.m.position.y = waveH(r.m.position.x, r.m.position.z, t) + 0.035;
      r.m.material.opacity = 0.75 * (1 - k) * (1 - k);
    }
    let any = false;
    for (let i = 0; i < DROPS; i++) {
      if (this.life[i] <= 0) continue;
      any = true;
      this.life[i] -= dt;
      this.vel[i * 3 + 1] -= 9.5 * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      if (this.pos[i * 3 + 1] < -0.05 || this.life[i] <= 0) {
        this.life[i] = 0;
        this.pos[i * 3 + 1] = -50;
      }
    }
    if (any || this.dirty) this.points.geometry.attributes.position.needsUpdate = true;
    this.dirty = any;
  }
}
