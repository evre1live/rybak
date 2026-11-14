// «Синий простор»: Течение — полоса плавучих водорослей (саргассы) поперёк океана. Пятна лежат на воде и
// качаются вместе с зыбью; рисуются только те, что рядом с камерой (одна сетка на все, копии переставляются
// по мере того, как рыбак плывёт вдоль полосы).
import * as THREE from 'three';
import { CURRENT, currentD } from './blue.js';
import { rng } from '../util.js';

const N = 320; // столько пятен рисуем одновременно
const SEEN = 300; // в этом радиусе от камеры
const STEP = 7; // шаг вдоль полосы, м

/** Пятно саргассов: рваный плоский круг из веточек, поперечник 1. */
function patchGeometry() {
  const r = rng(240701);
  const pos = [], col = [], idx = [];
  const C = [new THREE.Color('#b8902c'), new THREE.Color('#9a7424'), new THREE.Color('#c9a640'), new THREE.Color('#7d6a22')];
  const SEG = 14;
  pos.push(0, 0, 0);
  col.push(C[0].r, C[0].g, C[0].b);
  for (let i = 0; i < SEG; i++) {
    const a = (i / SEG) * Math.PI * 2;
    const k = 0.32 + r() * 0.2;
    pos.push(Math.cos(a) * k, 0, Math.sin(a) * k);
    const c = C[Math.floor(r() * C.length)];
    col.push(c.r, c.g, c.b);
  }
  for (let i = 0; i < SEG; i++) idx.push(0, 1 + ((i + 1) % SEG), 1 + i);
  // отростки-веточки
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2;
    const l = 0.42 + r() * 0.2;
    const b = pos.length / 3;
    const w = 0.05;
    pos.push(Math.cos(a) * 0.2 - Math.sin(a) * w, 0.004, Math.sin(a) * 0.2 + Math.cos(a) * w, Math.cos(a) * l, 0.004, Math.sin(a) * l, Math.cos(a) * 0.2 + Math.sin(a) * w, 0.004, Math.sin(a) * 0.2 - Math.cos(a) * w);
    const c = C[1 + Math.floor(r() * 3)];
    for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b);
    idx.push(b, b + 1, b + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const hash = (a, b) => {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Течение в сцене: update(camera, t, waveH) раскладывает пятна вокруг камеры. */
export function buildCurrent(scene) {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0, side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(patchGeometry(), mat, N);
  mesh.frustumCulled = false;
  mesh.name = 'current-weed';
  mesh.receiveShadow = true;
  scene.add(mesh);
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < N; i++) mesh.setMatrixAt(i, hide);
  const ax = CURRENT.ax, az = CURRENT.az;
  const L = Math.hypot(CURRENT.bx - ax, CURRENT.bz - az);
  const ux = (CURRENT.bx - ax) / L, uz = (CURRENT.bz - az) / L;
  const o = new THREE.Object3D();
  let last = -1e9;
  let list = [];
  const st = { shown: 0 };
  return {
    mesh,
    state: () => ({ shown: st.shown }),
    update(camera, t, waveH) {
      const p = camera.position;
      // какие пятна рядом: раз в несколько метров пути камеры пересобираем список
      const along = (p.x - ax) * ux + (p.z - az) * uz;
      if (Math.abs(along - last) > 6 || !list.length) {
        last = along;
        list = [];
        const s0 = Math.floor((along - SEEN) / STEP);
        const s1 = Math.ceil((along + SEEN) / STEP);
        for (let s = s0; s <= s1 && list.length < N; s++) {
          for (let k = 0; k < 3 && list.length < N; k++) {
            if (hash(s, k + 7) > 0.72) continue;
            const off = (hash(s, k) - 0.5) * CURRENT.w * 2.2;
            const sx = ax + ux * (s * STEP + hash(s, k + 3) * STEP) - uz * off;
            let sz = az + uz * (s * STEP + hash(s, k + 3) * STEP) + ux * off;
            // полоса извивается так же, как в зонах ловли (blue.js, currentD)
            sz += 22 * Math.sin(sx * 0.011 + 1.3) + 12 * Math.sin(sx * 0.027 + 0.4);
            if (currentD(sx, sz) > CURRENT.w * 1.3) continue;
            if (Math.hypot(sx - p.x, sz - p.z) > SEEN) continue;
            list.push({ x: sx, z: sz, s: 1.6 + hash(s, k + 11) * 3.4, ry: hash(s, k + 13) * 6.28 });
          }
        }
      }
      st.shown = list.length;
      for (let i = 0; i < N; i++) {
        const e = list[i];
        if (!e) {
          mesh.setMatrixAt(i, hide);
          continue;
        }
        o.position.set(e.x, waveH(e.x, e.z, t) + 0.05, e.z);
        o.rotation.set(0, e.ry + Math.sin(t * 0.3 + e.x) * 0.06, 0);
        o.scale.set(e.s, 1, e.s * 0.8);
        o.updateMatrix();
        mesh.setMatrixAt(i, o.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  };
}
