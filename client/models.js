// Готовые модели рыбы, предметов и локации (Tripo): загрузка по требованию и раздача копий.
// Модели заранее приведены к общему виду (tools/optimize.js): рыба — длина 1, голова к −X, спина к +Y;
// предмет — наибольший размер 1, стоит на y = 0, длинная сторона вдоль X.
import * as THREE from 'three';
import { heroes, loadManifest, gltfLoader } from './hero.js';
import { isTouch } from './util.js';

const ready = new Map();
const pending = new Map();

export const modelInfo = (id) => heroes.props[id] || null;
export const modelReady = (id) => ready.get(id) || null;
// Кто отдаёт текстуры загруженной модели видеокарте (gfx.warm). Модель считается готовой, когда они уже там:
// иначе все текстуры ушли бы разом в том кадре, где модель впервые показалась, — рывок посреди игры.
let warmer = null;
export const setWarmer = (fn) => {
  warmer = fn;
};

function tune(scene, info) {
  const fish = info.group === 'fish';
  scene.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = !fish;
    const m = o.material;
    // без карты окружения «металл» из текстуры Tripo выходит чёрным — оставляем только шероховатость:
    // рыба блестит, как мокрая, предметы матовые
    m.metalnessMap = null;
    m.metalness = 0;
    m.roughness = fish ? 0.62 : m.roughnessMap ? 1 : 0.9;
    if (m.roughnessMap && !fish) {
      m.onBeforeCompile = (sh) => {
        sh.fragmentShader = sh.fragmentShader.replace('#include <roughnessmap_fragment>', 'float roughnessFactor = roughness * mix(0.6, 1.0, texture2D(roughnessMap, vRoughnessMapUv).g);');
      };
      m.customProgramCacheKey = () => 'prop-matte';
    }
    if (m.map) m.map.anisotropy = 4;
  });
}

/** На телефонах текстуры моделей локации уменьшаем вдвое-вчетверо: их два десятка, а видеопамяти мало. */
function shrink(tex, max) {
  const im = tex && tex.image;
  if (!im || Math.max(im.width, im.height) <= max) return;
  const k = max / Math.max(im.width, im.height);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(im.width * k));
  c.height = Math.max(1, Math.round(im.height * k));
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  if (im.close) im.close();
  tex.image = c;
  tex.needsUpdate = true;
}
const LITE_TEX = { 'env-motorboat': 1024 }; // лодка всегда перед глазами — ей побольше

// Файлы-наборы локаций (tools/kit.js): в одном файле все модели локации узлами с общими текстурами.
// Файл грузится один раз, модель — его узел по имени (info.node).
const packs = new Map();
function loadPack(file) {
  if (!packs.has(file)) {
    const p = gltfLoader().then((loader) => new Promise((res, rej) => loader.load(file, res, undefined, rej)));
    packs.set(file, p);
    p.catch(() => packs.delete(file));
  }
  return packs.get(file);
}
/** Узел name из набора — отдельной сценой: в начале координат, со своими сетками (геометрия и текстуры общие). */
function fromPack(file, name) {
  return loadPack(file).then((g) => {
    const node = g.scene.getObjectByName(name);
    if (!node) throw new Error('в наборе ' + file + ' нет ' + name);
    const scene = new THREE.Group();
    const c = node.clone(true);
    c.position.set(0, 0, 0);
    c.rotation.set(0, 0, 0);
    c.scale.set(1, 1, 1);
    scene.add(c);
    // материалы — свои у каждой модели: patchModel и подкраска не должны задевать соседей по набору
    scene.traverse((o) => {
      if (o.isMesh) o.material = o.material.clone();
    });
    return scene;
  });
}

export function loadModel(id) {
  if (ready.has(id)) return Promise.resolve(ready.get(id));
  if (pending.has(id)) return pending.get(id);
  const p = loadManifest().then(() => {
    const info = modelInfo(id);
    if (!info) throw new Error('нет модели ' + id);
    if (info.node)
      return fromPack(info.file, info.node).then(
        (scene) =>
          new Promise((res) => {
            tune(scene, info);
            if (isTouch()) scene.traverse((o) => o.isMesh && shrink(o.material.map, 256));
            const tpl = { id, info, scene };
            const done = () => {
              ready.set(id, tpl);
              res(tpl);
            };
            if (warmer) Promise.resolve(warmer(scene)).then(done, done);
            else done();
          })
      );
    return gltfLoader().then(
      (loader) =>
        new Promise((res, rej) => {
          loader.load(
            info.file,
            (g) => {
              tune(g.scene, info);
              if (info.group === 'env' && isTouch())
                g.scene.traverse((o) => {
                  if (!o.isMesh) return;
                  shrink(o.material.map, LITE_TEX[id] || 512);
                  shrink(o.material.normalMap, 256);
                });
              const tpl = { id, info, scene: g.scene };
              const done = () => {
                ready.set(id, tpl);
                res(tpl);
              };
              if (warmer) Promise.resolve(warmer(g.scene)).then(done, done);
              else done();
            },
            undefined,
            rej
          );
        })
    );
  });
  pending.set(id, p);
  p.catch(() => pending.delete(id));
  return p;
}

const lods = new Map();
/** Дальняя (грубая) копия модели локации: вместо текстуры — цвет вершин. */
export function loadLod(id) {
  if (lods.has(id)) return lods.get(id);
  const p = loadManifest().then(() => {
    const info = modelInfo(id);
    if (!info || !info.lod) throw new Error('нет дальней копии ' + id);
    if (info.lod.node)
      return fromPack(info.lod.file, info.lod.node).then((scene) => {
        tune(scene, info);
        scene.traverse((o) => {
          if (o.isMesh) o.castShadow = false;
        });
        return { id, info, scene };
      });
    return gltfLoader().then(
      (loader) =>
        new Promise((res, rej) =>
          loader.load(
            info.lod.file,
            (g) => {
              g.scene.traverse((o) => {
                if (!o.isMesh) return;
                o.material.metalness = 0;
                o.material.roughness = 0.92;
              });
              res({ id, info, scene: g.scene });
            },
            undefined,
            rej
          )
        )
    );
  });
  lods.set(id, p);
  p.catch(() => lods.delete(id));
  return p;
}

/** Копия модели: геометрия и текстуры общие. own: true — свои материалы (нужны, когда у копии своя анимация в шейдере). */
export function spawn(tpl, own = false) {
  const o = tpl.scene.clone(true);
  if (own)
    o.traverse((c) => {
      if (c.isMesh) c.material = c.material.clone();
    });
  return o;
}

/** Загрузить набор моделей разом; вернёт только те, что удалось. */
export function loadModels(ids) {
  return Promise.all(ids.map((id) => loadModel(id).then((t) => [id, t], () => null))).then((list) => new Map(list.filter(Boolean)));
}
