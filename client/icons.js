// Иконки предметов, рыб и портреты игроков: маленький отдельный рендерер рисует 3D-модель в картинку.
import { heroes, heroOf, heroTemplate, loadHero } from './hero.js';
import * as THREE from 'three';
import { itemModel } from './gear3d.js';
import { buildFish } from './fish3d.js';
import { modelInfo } from './models.js';
import { Character } from './character.js';
import { ITEM_IMG } from './itemimg.js';

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
  renderer.toneMapping = THREE.CustomToneMapping; // та же кривая, что в игре (gfx.js)
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
  if (ITEM_IMG.has(id) && !window.RYBAK_OFFLINE) return `img/items/${id}.webp`; // нарисованный значок рынка (tools/icons.py); пробная версия одним файлом рисует кодом
  const baked = modelInfo('junk-' + id);
  if (baked && baked.icon) return baked.icon;
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
  const baked = modelInfo('fish-' + sp);
  if (baked && baked.icon) return baked.icon; // значок, запечённый из готовой модели
  const key = 'f:' + sp;
  if (cache.has(key)) return cache.get(key);
  setup();
  const f = buildFish(sp);
  f.rotation.set(0.12, 0.42, 0);
  const url = shoot(f, frame(f, 1.08));
  cache.set(key, url);
  return url;
}
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; // прозрачная точка
/** Портрет героя: для списка друзей и экрана «Персонаж». */
export function faceIcon(look) {
  const id = heroOf(look);
  const info = heroes.byId.get(id);
  // портреты запечены заранее (tools/bake-icons.cjs --faces): ради значка модель героя грузить не приходится
  if (info && info.face) return info.face;
  if (id && !heroTemplate(id)) {
    // запечённого портрета нет — снимем с модели, когда она загрузится (до тех пор значок пустой)
    loadHero(id).catch(() => {});
    return BLANK;
  }
  if (!id && !heroes.ready) return BLANK;
  const key = 'p:' + id;
  if (cache.has(key)) return cache.get(key);
  const url = faceShot(look);
  if (cache.size > 400) cache.clear();
  cache.set(key, url);
  return url;
}
/** Снимок лица с модели (герой должен быть загружен; нет героев вовсе — снимается запасная кукла). */
export function faceShot(look) {
  setup();
  const c = new Character(look);
  c.update(0.016, { mode: 'idle', snap: true });
  c.group.rotation.y = -0.22;
  // целимся в голову: у героя — по кости головы (шляпы и рост у всех разные), у куклы — по её росту
  const head = c.hero ? c.hero.tpl.at.head.y * c.look.height + 0.115 : (0.84 + 0.505 + 0.18) * c.look.height;
  persp.position.set(0, head + 0.04, 1.42);
  persp.lookAt(0, head + 0.035, 0);
  const url = shoot(c.group, persp);
  c.dispose();
  return url;
}

/**
 * Снимок готовой модели (рыба, предмет) — для запекания значков при сборке и для проверки моделей.
 * view: 'side' — строго сбоку, 'three' — три четверти сверху, 'top' — сверху.
 */
export function modelShot(tpl, view = 'side') {
  setup();
  const o = tpl.scene.clone(true);
  const g = new THREE.Group();
  g.add(o);
  if (view === 'three') g.rotation.set(0.42, -0.6, 0);
  else if (view === 'top') g.rotation.set(Math.PI / 2, 0, 0);
  else if (view === 'fish') g.rotation.set(0.1, 0.36, 0);
  else if (Array.isArray(view)) g.rotation.set(view[0], view[1], view[2]);
  return shoot(g, frame(g, 1.06));
}
