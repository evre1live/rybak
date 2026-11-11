// Готовые модели рыбы и предметов (Tripo): загрузка по требованию и раздача копий.
// Модели заранее приведены к общему виду (tools/optimize.js): рыба — длина 1, голова к −X, спина к +Y;
// предмет — наибольший размер 1, стоит на y = 0, длинная сторона вдоль X.
import * as THREE from 'three';
import { heroes, loadManifest, gltfLoader } from './hero.js';

const ready = new Map();
const pending = new Map();

export const modelInfo = (id) => heroes.props[id] || null;
export const modelReady = (id) => ready.get(id) || null;

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

export function loadModel(id) {
  if (ready.has(id)) return Promise.resolve(ready.get(id));
  if (pending.has(id)) return pending.get(id);
  const p = loadManifest().then(() => {
    const info = modelInfo(id);
    if (!info) throw new Error('нет модели ' + id);
    return gltfLoader().then(
      (loader) =>
        new Promise((res, rej) => {
          loader.load(
            info.file,
            (g) => {
              tune(g.scene, info);
              const tpl = { id, info, scene: g.scene };
              ready.set(id, tpl);
              res(tpl);
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
