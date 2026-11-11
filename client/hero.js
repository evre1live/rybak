// Герои из готовых моделей (Tripo): загрузка, привязка костей к «кукле», анимации шага.
//
// Игра по-прежнему считает позу на простой кукле из суставов (character.js): заброс, вываживание, сидение, жесты.
// Герой повторяет её: у каждой кости есть «исходная» ориентация — та же стойка, что у куклы (руки вдоль тела),
// и поворот сустава куклы просто умножается на неё. Ноги и таз стоя берутся из анимаций модели (стойка, шаг, бег).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { clamp, sstep } from './util.js';

const HEIGHT = 1.76; // рост героя в метрах при росте 1 в настройках
const PUPPET_HIP = 0.84; // высота таза куклы
const NAMES = {
  hips: /Hips$/, spine: /Spine$/, spine1: /Spine1$/, spine2: /Spine2$/, neck: /Neck$/, head: /Head$/,
  shL: /LeftShoulder$/, aL: /LeftArm$/, eL: /LeftForeArm$/, hL: /LeftHand$/,
  shR: /RightShoulder$/, aR: /RightArm$/, eR: /RightForeArm$/, hR: /RightHand$/,
  lL: /LeftUpLeg$/, kL: /LeftLeg$/, fL: /LeftFoot$/, lR: /RightUpLeg$/, kR: /RightLeg$/, fR: /RightFoot$/
};
const NEED = ['hips', 'spine', 'head', 'aL', 'eL', 'hL', 'aR', 'eR', 'hR', 'lL', 'kL', 'fL', 'lR', 'kR', 'fR'];
const DOWN = new THREE.Vector3(0, -1, 0);

export const heroes = { list: [], byId: new Map(), ready: false, onLoad: () => {} };
const templates = new Map();
const pending = new Map();
let manifestP = null;
let loader = null;

/** Список героев. Нет файла (например, в пробной версии одним файлом) — героев просто нет. */
export function loadManifest() {
  return (manifestP ||= (window.RYBAK_OFFLINE ? Promise.resolve({ ok: false }) : fetch('models/manifest.json'))
    .then((r) => (r.ok ? r.json() : { heroes: [] }))
    .catch(() => ({ heroes: [] }))
    .then((m) => {
      const all = Array.isArray(m.heroes) ? m.heroes : [];
      for (const h of all) heroes.byId.set(h.id, h);
      heroes.list = all.filter((h) => !h.npc); // скупщик и прочие жители бухты игроку не предлагаются
      heroes.ready = true;
      return heroes;
    }));
}
export const heroTemplate = (id) => templates.get(id) || null;
export function loadHero(id) {
  if (templates.has(id)) return Promise.resolve(templates.get(id));
  if (pending.has(id)) return pending.get(id);
  // распаковщик сжатых моделей подключаем только когда герой и правда нужен: он запускает WebAssembly,
  // а пробной версии одним файлом это и не нужно, и запрещено
  const p = loadManifest().then(() => {
    const info = heroes.byId.get(id);
    if (!info) throw new Error('нет героя ' + id);
    return import('three/addons/libs/meshopt_decoder.module.js').then(
      (lib) =>
        new Promise((res, rej) => {
          loader ||= new GLTFLoader().setMeshoptDecoder(lib.MeshoptDecoder);
          loader.load(
            info.file,
            (g) => {
              try {
                const t = prepare(g, info);
                templates.set(id, t);
                res(t);
                heroes.onLoad(id);
              } catch (e) {
                rej(e);
              }
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

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _qi = new THREE.Quaternion();
const IDENT = new THREE.Quaternion();

/** Разбирает загруженную модель: где какая кость, куда герой смотрит, какого он роста, исходные ориентации костей. */
function prepare(gltf, info) {
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);
  const names = {};
  let mesh = null;
  scene.traverse((o) => {
    if (o.isSkinnedMesh) mesh = mesh || o;
    if (o.isBone) for (const k in NAMES) if (!names[k] && NAMES[k].test(o.name)) names[k] = o.name;
  });
  for (const k of NEED) if (!names[k]) throw new Error(`у героя ${info.id} нет кости ${k}`);
  if (!mesh) throw new Error(`у героя ${info.id} нет сетки`);
  const node = (k) => scene.getObjectByName(names[k]);
  const pos = (k) => new THREE.Vector3().setFromMatrixPosition(node(k).matrixWorld);
  // лицом к +Z: «влево» × «вверх» = «вперёд»
  const left = pos('aL').sub(pos('aR')).setY(0).normalize();
  const fwd = left.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
  const fix = new THREE.Quaternion().setFromUnitVectors(fwd, new THREE.Vector3(0, 0, 1));
  // рост и подошвы — по сетке в исходной позе
  mesh.computeBoundingBox();
  const box = mesh.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
  const scale = HEIGHT / Math.max(1e-3, box.max.y - box.min.y);
  const lift = -box.min.y * scale;
  const rest = {}; // ориентации костей в исходной позе, в осях персонажа
  const at = {}; // положения суставов в осях персонажа, метры
  for (const k in names) {
    rest[k] = node(k).getWorldQuaternion(new THREE.Quaternion()).premultiply(fix);
    at[k] = pos(k).applyQuaternion(fix).multiplyScalar(scale).setY(pos(k).y * scale + lift);
  }
  // «исходная» стойка = как у куклы: руки и ноги прямо вниз. Для каждой кости — её ориентация в этой стойке.
  const canon = {};
  const swing = (a, b) => new THREE.Quaternion().setFromUnitVectors(at[b].clone().sub(at[a]).normalize(), DOWN);
  for (const k in names) canon[k] = rest[k].clone();
  for (const [a, b, hand] of [['aL', 'eL'], ['eL', 'hL', 'hL'], ['aR', 'eR'], ['eR', 'hR', 'hR'], ['lL', 'kL'], ['kL', 'fL', 'fL'], ['lR', 'kR'], ['kR', 'fR', 'fR']]) {
    const s = swing(a, b);
    canon[a] = s.clone().multiply(rest[a]);
    if (hand) canon[hand] = s.clone().multiply(rest[hand]);
  }
  mesh.frustumCulled = false; // кости уводят сетку далеко от исходных границ
  scene.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    // ткань и кожа — матовые: металл из текстуры без отражений окружения даёт чёрные пятна, а слишком гладкие штаны блестят как пластик
    const m = o.material;
    m.metalnessMap = null;
    m.metalness = 0;
    m.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace(
        '#include <roughnessmap_fragment>',
        'float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n  roughnessFactor *= mix(0.55, 1.0, texture2D(roughnessMap, vRoughnessMapUv).g);\n#endif'
      );
    };
    m.customProgramCacheKey = () => 'hero-matte';
    m.needsUpdate = true;
  });
  const clips = {};
  for (const c of gltf.animations || []) clips[c.name] = c;
  return { info, scene, names, fix, scale, lift, canon, at, clips, hipK: at.hips.y / PUPPET_HIP, forearm: at.eR.distanceTo(at.hR) };
}

export class HeroBody {
  constructor(tpl) {
    this.tpl = tpl;
    const wrap = (this.wrap = new THREE.Group());
    wrap.quaternion.copy(tpl.fix);
    wrap.scale.setScalar(tpl.scale);
    wrap.position.y = tpl.lift;
    const model = (this.model = cloneSkinned(tpl.scene));
    wrap.add(model);
    const bones = (this.bones = {});
    for (const k in tpl.names) bones[k] = model.getObjectByName(tpl.names[k]);
    this.hipRest = bones.hips.position.clone();
    // порядок обхода: родитель раньше ребёнка
    const key = new Map();
    for (const k in bones) key.set(bones[k], k);
    this.chain = [];
    const index = new Map();
    wrap.traverse((o) => {
      if (o.isMesh) return;
      index.set(o, this.chain.length);
      this.chain.push({ node: o, parent: o === wrap ? -1 : index.get(o.parent), key: key.get(o) || null, w: new THREE.Quaternion() });
    });
    // анимации модели: стойка, шаг, бег
    this.mixer = new THREE.AnimationMixer(model);
    this.act = {};
    for (const n of ['idle', 'walk', 'run']) {
      if (!tpl.clips[n]) continue;
      const a = (this.act[n] = this.mixer.clipAction(tpl.clips[n]));
      a.play();
      a.setEffectiveWeight(n === 'idle' ? 1 : 0);
    }
    this.legs = 0; // 0 — ноги и таз из анимаций модели, 1 — как у куклы (сидим, танцуем)
    this.up = 1; // корпус и левая рука: 0 — из анимаций модели (просто стоим или идём), 1 — поза куклы (жест, заброс, вываживание)
    this.right = 1; // правая рука: 0 — из анимаций (руки пустые), 1 — держит удочку, как у куклы
    // точка хвата: оси как у предплечья куклы, размер не зависит от масштаба модели
    const grip = (this.grip = new THREE.Group());
    const inv = tpl.canon.hR.clone().invert();
    grip.quaternion.copy(inv);
    grip.scale.setScalar(1 / tpl.scale);
    grip.position.copy(_v.set(0, -Math.min(0.09, tpl.forearm * 0.36), 0.018).applyQuaternion(inv)).divideScalar(tpl.scale);
    bones.hR.add(grip);
    this.pq = {};
    for (const k of ['hips', 'torso', 'head', 'aR', 'eR', 'aL', 'eL', 'lR', 'kR', 'lL', 'kL']) this.pq[k] = new THREE.Quaternion();
    this.want = {};
    for (const k in tpl.canon) this.want[k] = new THREE.Quaternion();
  }
  dispose() {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.model);
    if (this.wrap.parent) this.wrap.parent.remove(this.wrap);
  }
  /** J — суставы куклы с уже выставленной позой; st — то же состояние, что получает кукла. */
  update(dt, st, J) {
    const { canon, hipK, scale } = this.tpl;
    const sp = st.speed || 0;
    // 1) анимации модели
    const run = this.act.run ? sstep(3.6, 4.9, sp) : 0;
    const walk = this.act.walk ? sstep(0.2, 1.1, sp) * (1 - run) : 0;
    if (this.act.idle) this.act.idle.setEffectiveWeight(Math.max(0, 1 - walk - run));
    if (this.act.walk) {
      this.act.walk.setEffectiveWeight(walk);
      this.act.walk.timeScale = clamp(sp / 2.6, 0.7, 1.7);
    }
    if (this.act.run) {
      this.act.run.setEffectiveWeight(run);
      this.act.run.timeScale = clamp(sp / 5.2, 0.8, 1.3);
    }
    this.mixer.update(st.snap ? 0 : dt);
    const clips = !!this.act.idle;
    const legsWant = st.sit || st.emote === 'dance' || !clips ? 1 : 0;
    this.legs = st.snap ? legsWant : this.legs + (legsWant - this.legs) * Math.min(1, dt * 8);
    const L = this.legs;
    // пока руки ничем не заняты, корпус и рука живут анимацией модели: походка и стойка выходят естественнее
    const calm = clips && !legsWant && !st.emote && !st.variant;
    const upWant = calm && (st.mode === 'hold' || st.mode === 'idle') ? 0 : 1;
    const rightWant = calm && st.mode === 'idle' ? 0 : 1;
    const kf = st.snap ? 1 : Math.min(1, dt * 7);
    this.up += (upWant - this.up) * kf;
    this.right += (rightWant - this.right) * kf;
    const U = this.up;
    const R = this.right;
    // 2) повороты суставов куклы в осях персонажа
    const P = this.pq;
    P.hips.copy(J.hips.quaternion);
    P.torso.multiplyQuaternions(P.hips, J.torso.quaternion);
    P.head.multiplyQuaternions(P.torso, J.head.quaternion);
    P.aR.multiplyQuaternions(P.torso, J.aR.quaternion);
    P.eR.multiplyQuaternions(P.aR, J.eR.quaternion);
    P.aL.multiplyQuaternions(P.torso, J.aL.quaternion);
    P.eL.multiplyQuaternions(P.aL, J.eL.quaternion);
    P.lR.multiplyQuaternions(P.hips, J.lR.quaternion);
    P.kR.multiplyQuaternions(P.lR, J.kR.quaternion);
    P.lL.multiplyQuaternions(P.hips, J.lL.quaternion);
    P.kL.multiplyQuaternions(P.lL, J.kL.quaternion);
    // 3) чего хотим от каждой кости героя
    const W = this.want;
    const set = (k, q) => canon[k] && W[k].multiplyQuaternions(q, canon[k]);
    set('hips', P.hips);
    // наклон корпуса раскладываем по трём позвонкам
    _qi.copy(P.hips).invert();
    _q2.multiplyQuaternions(_qi, P.torso); // корпус относительно таза
    if (canon.spine1 && canon.spine2) {
      set('spine', _q.copy(IDENT).slerp(_q2, 0.34).premultiply(P.hips));
      set('spine1', _q.copy(IDENT).slerp(_q2, 0.68).premultiply(P.hips));
      set('spine2', P.torso);
    } else set('spine', P.torso);
    _qi.copy(P.torso).invert();
    _q2.multiplyQuaternions(_qi, P.head);
    if (canon.neck) set('neck', _q.copy(IDENT).slerp(_q2, 0.4).premultiply(P.torso));
    set('head', P.head);
    set('shL', P.torso);
    set('shR', P.torso);
    set('aL', P.aL);
    set('eL', P.eL);
    set('hL', P.eL);
    set('aR', P.aR);
    set('eR', P.eR);
    set('hR', P.eR);
    set('lL', P.lL);
    set('kL', P.kL);
    set('fL', P.kL);
    set('lR', P.lR);
    set('kR', P.kR);
    set('fR', P.kR);
    // 4) сверху вниз по скелету: мировая ориентация родителя известна — считаем свою локальную
    const chain = this.chain;
    for (let i = 0; i < chain.length; i++) {
      const c = chain[i];
      const k = c.key;
      if (c.parent < 0) {
        c.w.copy(c.node.quaternion);
        continue;
      }
      const pw = chain[c.parent].w;
      if (k && canon[k]) {
        const w = GROUP[k] === 1 ? L : GROUP[k] === 2 ? U : GROUP[k] === 3 ? R : 1;
        if (w > 0.001) {
          _q.copy(pw).invert().multiply(W[k]);
          if (w >= 0.999) c.node.quaternion.copy(_q);
          else c.node.quaternion.slerp(_q, w);
        }
        if (k === 'hips') {
          // таз: высота и смещение — от куклы, когда сидим; иначе на месте
          _v.set(J.hips.position.x, (J.hips.position.y - PUPPET_HIP) * hipK, J.hips.position.z).multiplyScalar(L / scale);
          _q.copy(pw).invert();
          c.node.position.copy(this.hipRest).add(_v.applyQuaternion(_q));
        }
      }
      c.w.multiplyQuaternions(pw, c.node.quaternion);
    }
  }
}

// чьей воле подчиняется кость: 1 — ноги и таз, 2 — корпус и левая рука, 3 — правая рука; голова всегда смотрит, куда кукла
const GROUP = { hips: 1, lL: 1, kL: 1, fL: 1, lR: 1, kR: 1, fR: 1, spine: 2, spine1: 2, spine2: 2, shL: 2, aL: 2, eL: 2, hL: 2, shR: 3, aR: 3, eR: 3, hR: 3 };

/** Цвета рук от первого лица под героя: рукав, перчатка, кожа. */
export function fpLook(look) {
  const h = look && look.hero && heroes.byId.get(look.hero);
  if (!h || !h.fp) return look;
  const f = h.fp;
  // bare — короткий рукав: предплечье голое; иначе рукав цвета куртки
  return { ...look, top: f.bare ? 3 : 1, topC: f.sleeve || look.topC, topC2: f.sleeve2 || f.sleeve || look.topC2, gloves: f.glove ? 1 : 0, gloveC: f.glove || look.gloveC, skin: f.skin || look.skin };
}
