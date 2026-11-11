// Вода в движении: брызги, круги, водяная пыль и пена от всплесков, капли с пойманной рыбы.
import * as THREE from 'three';
import { waveH } from './water.js';
import { canvasTex } from './util.js';

const RINGS = 24;
const DROPS = 520;
const PUFFS = 10;
const FOAMS = 8;

const DROP_VERT = /* glsl */ `
attribute float aSize;
attribute float aLife;
varying float vLife;
void main() {
  vLife = aLife;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (0.55 + 0.45 * min(1.0, aLife * 2.0)) * projectionMatrix[1][1] * 420.0 / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const DROP_FRAG = /* glsl */ `
uniform vec3 uCol;
varying float vLife;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r = dot(q, q);
  if (r > 1.0 || vLife <= 0.0) discard;
  // капля: светлый блик сверху-слева, прозрачнее к краю
  float hi = smoothstep(0.5, 0.0, length(q - vec2(-0.3, -0.35)));
  gl_FragColor = vec4(uCol * (0.82 + 0.5 * hi), (1.0 - r * r) * min(1.0, vLife * 3.0) * 0.9);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const puffTex = () =>
  canvasTex(128, 128, (g) => {
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * 6.283;
      const d = 14 + ((i * 37) % 23);
      const x = 64 + Math.cos(a) * d;
      const y = 64 + Math.sin(a) * d;
      const rr = 18 + ((i * 53) % 16);
      const gr = g.createRadialGradient(x, y, 0, x, y, rr);
      gr.addColorStop(0, 'rgba(255,255,255,0.5)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
  });
const foamTex = () =>
  canvasTex(256, 256, (g) => {
    // рваное кольцо пены с пузырями
    for (let i = 0; i < 150; i++) {
      const a = ((i * 2.399) % 6.283) + i * 0.01;
      const d = 44 + ((i * 71) % 70);
      const x = 128 + Math.cos(a) * d;
      const y = 128 + Math.sin(a) * d;
      const rr = 5 + ((i * 29) % 15);
      const gr = g.createRadialGradient(x, y, 0, x, y, rr);
      gr.addColorStop(0, 'rgba(255,255,255,0.85)');
      gr.addColorStop(0.6, 'rgba(255,255,255,0.35)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
  });

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
    // капли
    this.pos = new Float32Array(DROPS * 3);
    this.vel = new Float32Array(DROPS * 3);
    this.life = new Float32Array(DROPS);
    this.size = new Float32Array(DROPS);
    for (let i = 0; i < DROPS; i++) this.pos[i * 3 + 1] = -50;
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    pg.setAttribute('aLife', new THREE.BufferAttribute(this.life, 1));
    pg.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    this.dropU = { uCol: { value: new THREE.Color('#eafcff') } };
    this.points = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: this.dropU, vertexShader: DROP_VERT, fragmentShader: DROP_FRAG, transparent: true, depthWrite: false }));
    this.points.frustumCulled = false;
    this.points.renderOrder = 4;
    scene.add(this.points);
    // водяная пыль: мягкие клубы, смотрят на камеру
    const pt = puffTex();
    this.puffs = [];
    for (let i = 0; i < PUFFS; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: pt, transparent: true, opacity: 0, depthWrite: false, fog: false }));
      s.visible = false;
      s.renderOrder = 4;
      scene.add(s);
      this.puffs.push({ s, t: 0, life: 0, size: 1, vy: 0 });
    }
    // пена на воде после всплеска
    const ft = foamTex();
    const fg = new THREE.PlaneGeometry(2, 2);
    fg.rotateX(-Math.PI / 2);
    this.foams = [];
    for (let i = 0; i < FOAMS; i++) {
      const m = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ map: ft, transparent: true, opacity: 0, depthWrite: false }));
      m.visible = false;
      m.renderOrder = 3;
      m.rotation.y = i * 1.7;
      scene.add(m);
      this.foams.push({ m, t: 0, life: 0, size: 1 });
    }
    this.next = 0;
    this.nextRing = 0;
    this.nextPuff = 0;
    this.nextFoam = 0;
    this.time = 0;
  }
  /** Цвет капель и пены по освещению: днём белые, ночью синеватые. */
  setLight(k) {
    const v = 0.3 + 0.7 * k;
    this.dropU.uCol.value.setRGB(0.92 * v, 0.99 * v, v);
    for (const p of this.puffs) p.s.material.color.setScalar(v);
    for (const f of this.foams) f.m.material.color.setScalar(v);
    for (const r of this.rings) r.m.material.color.setScalar(v);
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
  drop(x, y, z, vx, vy, vz, size = 0.05, life = 1.2) {
    const k = this.next++ % DROPS;
    this.pos[k * 3] = x;
    this.pos[k * 3 + 1] = y;
    this.pos[k * 3 + 2] = z;
    this.vel[k * 3] = vx;
    this.vel[k * 3 + 1] = vy;
    this.vel[k * 3 + 2] = vz;
    this.life[k] = life;
    this.size[k] = size;
  }
  puff(x, y, z, size = 1, life = 0.7) {
    const p = this.puffs[this.nextPuff++ % PUFFS];
    p.s.position.set(x, y, z);
    p.t = 0;
    p.life = life;
    p.size = size;
    p.vy = 0.9 + size * 0.5;
    p.s.visible = true;
  }
  splash(x, z, power = 1) {
    const n = Math.round(14 + 34 * power);
    const y = waveH(x, z, this.time);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (0.5 + Math.random() * 1.7) * (0.6 + power * 0.6);
      // крупные капли летят ниже и ближе, мелкая взвесь — выше
      const big = Math.random() < 0.3;
      this.drop(x + Math.cos(a) * 0.08, y + 0.05, z + Math.sin(a) * 0.08, Math.cos(a) * sp, (1.8 + Math.random() * 2.8) * (0.6 + power * 0.5) * (big ? 0.8 : 1), Math.sin(a) * sp, big ? 0.075 + Math.random() * 0.03 : 0.03 + Math.random() * 0.025);
    }
    this.ripple(x, z, 0.7 + power * 0.9, 1.1);
    this.ripple(x, z, 1.1 + power * 1.5, 1.6, 0.18);
    if (power > 0.5) {
      this.puff(x, y + 0.15, z, 0.5 + power * 0.7, 0.55 + power * 0.15);
      const f = this.foams[this.nextFoam++ % FOAMS];
      f.m.position.set(x, y + 0.03, z);
      f.t = 0;
      f.life = 1.6 + power * 0.6;
      f.size = 0.35 + power * 0.55;
      f.m.visible = true;
    }
  }
  /** Капли с мокрой рыбы: n штук из точки, почти без скорости. */
  drip(x, y, z, n = 1, spread = 0.06) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * spread;
      this.drop(x + Math.cos(a) * r, y + (Math.random() - 0.5) * spread, z + Math.sin(a) * r, Math.cos(a) * 0.25, 0.2 + Math.random() * 0.5, Math.sin(a) * 0.25, 0.022 + Math.random() * 0.02, 0.9);
    }
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
    for (const p of this.puffs) {
      if (!p.s.visible) continue;
      p.t += dt;
      const k = p.t / p.life;
      if (k >= 1) {
        p.s.visible = false;
        continue;
      }
      p.s.position.y += p.vy * dt * (1 - k);
      const s = p.size * (0.5 + 1.3 * Math.sqrt(k));
      p.s.scale.set(s, s * 1.15, 1);
      p.s.material.opacity = 0.7 * (1 - k) * Math.min(1, k * 8);
    }
    for (const f of this.foams) {
      if (!f.m.visible) continue;
      f.t += dt;
      const k = f.t / f.life;
      if (k >= 1) {
        f.m.visible = false;
        continue;
      }
      const s = f.size * (0.4 + 0.9 * Math.sqrt(k));
      f.m.scale.set(s, 1, s);
      f.m.position.y = waveH(f.m.position.x, f.m.position.z, t) + 0.03;
      f.m.material.opacity = 0.8 * (1 - k) * Math.min(1, k * 6);
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
      if (this.life[i] <= 0) {
        this.life[i] = 0;
        this.pos[i * 3 + 1] = -50;
      } else if (this.pos[i * 3 + 1] < -0.04 && this.vel[i * 3 + 1] < 0) {
        // упала в воду; от крупной капли — маленький круг
        if (this.size[i] > 0.06 && Math.random() < 0.35) this.ripple(this.pos[i * 3], this.pos[i * 3 + 2], 0.22, 0.6);
        this.life[i] = 0;
        this.pos[i * 3 + 1] = -50;
      }
    }
    if (any || this.dirty) {
      const a = this.points.geometry.attributes;
      a.position.needsUpdate = true;
      a.aLife.needsUpdate = true;
      a.aSize.needsUpdate = true;
    }
    this.dirty = any;
  }
}
