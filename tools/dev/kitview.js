// Просмотр моделей: сетка из узлов файла glTF/GLB (или списка файлов) при ровном свете.
//   сборка: npx esbuild tools/dev/kitview.js --bundle --format=iife --outfile=<папка>/kitview.js
//   страница: <папка>/index.html?f=<файл>[,<файл>…]&n=<узел>,<узел>&cols=6&yaw=0.6
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const q = new URLSearchParams(location.search);
const files = (q.get('f') || '').split(',').filter(Boolean);
const names = (q.get('n') || '').split(',').filter(Boolean);
const cols = +q.get('cols') || 5;
const yaw = +(q.get('yaw') || 0.6);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#9fc4e8');
scene.add(new THREE.HemisphereLight('#ffffff', '#6a7a60', 1.6));
const sun = new THREE.DirectionalLight('#fff4e0', 2.4);
sun.position.set(4, 8, 6);
scene.add(sun);
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const items = [];
const load = (f) => new Promise((res, rej) => loader.load(f, res, undefined, rej));
(async () => {
  for (const f of files) {
    const g = await load(f);
    if (names.length) {
      for (const n of names) {
        const o = g.scene.getObjectByName(n);
        if (o) items.push([n, o.clone(true)]);
      }
    } else if (files.length > 1) items.push([f.split('/').pop(), g.scene]);
    else for (const c of g.scene.children) items.push([c.name, c]);
  }
  const box = new THREE.Box3();
  let cell = 0;
  for (const [, o] of items) {
    o.position.set(0, 0, 0);
    box.setFromObject(o);
    const s = box.getSize(new THREE.Vector3());
    cell = Math.max(cell, s.x, s.z, s.y * 0.6);
  }
  cell *= 1.25;
  const rows = Math.ceil(items.length / cols);
  const labels = [];
  items.forEach(([n, o], i) => {
    const x = (i % cols) - (cols - 1) / 2;
    const z = Math.floor(i / cols) - (rows - 1) / 2;
    o.position.set(x * cell, 0, z * cell);
    o.rotation.y = yaw;
    scene.add(o);
    labels.push([n, o.position.clone()]);
  });
  const W = cols * cell;
  const cam = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.01, 1e4);
  const dist = Math.max(W * 0.9, rows * cell * 1.4) * 1.05;
  cam.position.set(0, dist * 0.42, dist);
  cam.lookAt(0, cell * 0.25, 0);
  renderer.render(scene, cam);
  const ctx = document.createElement('canvas');
  ctx.width = innerWidth;
  ctx.height = innerHeight;
  const g2 = ctx.getContext('2d');
  g2.drawImage(renderer.domElement, 0, 0);
  g2.font = '14px sans-serif';
  for (const [n, p] of labels) {
    const v = p.clone().project(cam);
    const sx = ((v.x + 1) / 2) * innerWidth;
    const sy = ((1 - v.y) / 2) * innerHeight + 16;
    g2.fillStyle = 'rgba(0,0,0,0.55)';
    g2.fillRect(sx - g2.measureText(n).width / 2 - 4, sy - 13, g2.measureText(n).width + 8, 18);
    g2.fillStyle = '#fff';
    g2.fillText(n, sx - g2.measureText(n).width / 2, sy);
  }
  window.__shot = ctx.toDataURL('image/png');
})().catch((e) => (window.__err = String(e)));
