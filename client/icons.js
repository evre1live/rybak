// Иконки предметов, рыб и портреты игроков: маленький отдельный рендерер рисует 3D-модель в картинку.
import { heroTemplate, loadHero } from './hero.js';
import * as THREE from 'three';
import { itemModel } from './gear3d.js';
import { buildFish } from './fish3d.js';
import { Character } from './character.js';

const SIZE = 256;
let renderer = null;
let scene = null;
const ortho = new THREE.OrthographicCamera(-0.6, 0.6, 0.6, -0.6, 0.01, 20);
const persp = new THREE.PerspectiveCamera(26, 1, 0.02, 20);
const cache = new Map();
const box = new THREE.Box3();
const v = new THREE.Vector3();
const sz = new THREE.Vector3();

function setup() {
  if (renderer) return;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(SIZE, SIZE, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);
  scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight('#ffffff', '#8aa0c0', 1.5));
  const key = new THREE.DirectionalLight('#fff4e0', 2.6);
  key.position.set(-1.2, 2, 2.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#9fdcff', 1.2);
  rim.position.set(2, 1, -2);
  scene.add(rim);
}
function shoot(obj, cam) {
  scene.add(obj);
  renderer.render(scene, cam);
  scene.remove(obj);
  return renderer.domElement.toDataURL('image/png');
}
function frame(obj, pad = 1.12) {
  box.setFromObject(obj);
  box.getCenter(v);
  box.getSize(sz);
  const h = (Math.max(sz.x, sz.y) / 2) * pad || 0.5;
  ortho.left = -h;
  ortho.right = h;
  ortho.top = h;
  ortho.bottom = -h;
  ortho.position.set(v.x, v.y, v.z + 6);
  ortho.lookAt(v);
  ortho.updateProjectionMatrix();
  return ortho;
}
function free(obj) {
  obj.traverse((o) => {
    if (o.isMesh && o.geometry && o.userData.own) o.geometry.dispose();
  });
}

export function itemIcon(id) {
  const key = 'i:' + id;
  if (cache.has(key)) return cache.get(key);
  setup();
  const m = itemModel(id);
  let url;
  if (m.userData.rod) {
    // катушка — вниз и к зрителю, бланк уходит вправо вверх и вдаль
    m.children[0].rotation.y = 1.0;
    m.rotation.set(-0.62, 0, -0.95);
    m.position.set(-0.2, -0.16, 0);
    persp.position.set(0, 0, 0.92);
    persp.lookAt(0, 0, 0);
    url = shoot(m, persp);
  } else url = shoot(m, frame(m));
  cache.set(key, url);
  return url;
}
export function fishIcon(sp) {
  const key = 'f:' + sp;
  if (cache.has(key)) return cache.get(key);
  setup();
  const f = buildFish(sp);
  f.rotation.set(0.12, 0.42, 0);
  const url = shoot(f, frame(f, 1.08));
  cache.set(key, url);
  return url;
}
/** Портрет игрока для списка друзей. */
export function faceIcon(look) {
  // портрет героя снимаем, когда его модель загрузилась; до тех пор — кукла, и в запас она не кладётся
  const heroReady = !look.hero || !!heroTemplate(look.hero);
  if (!heroReady) loadHero(look.hero).catch(() => {});
  const key = 'p:' + JSON.stringify(look);
  if (cache.has(key)) return cache.get(key);
  setup();
  const c = new Character(look);
  c.update(0.016, { mode: 'idle', snap: true });
  c.group.rotation.y = -0.22;
  const hy = (0.84 + 0.505 + 0.18) * c.look.height;
  persp.position.set(0, hy + 0.04, 1.42);
  persp.lookAt(0, hy + 0.035, 0);
  const url = shoot(c.group, persp);
  c.dispose();
  if (cache.size > 400) cache.clear();
  if (heroReady) cache.set(key, url);
  return url;
}
