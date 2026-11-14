// Готовые модели локации (Tripo): деревья, пальмы, кусты, камни и скалы, маяк, затонувший корабль, хижина,
// будка проката, фонарные столбы, скамейки, кранцы, указатель, чайки, костёр.
//
// Мир по-прежнему собирается кодом (scenery.js, places.js) — это запасной вид: он виден, пока модели грузятся,
// и в пробной версии одним файлом. Процедурный мир оставляет здесь записи «что где стоит» (ENV), а когда
// модели загрузились, они встают на те же места, и процедурные двойники убираются.
import * as THREE from 'three';
import { loadManifest } from './hero.js';
import { modelInfo, loadModel, spawn } from './models.js';
import { Scatter, spot01 } from './scatter.js';
import { patchModel } from './surface.js';
import { small } from './smalls.js';
import { canvasTex, isTouch, TAU } from './util.js';
import { BOXES, CIRCLES, DECK_Y, groundH, HAS } from './terrain.js';

/** Что процедурный мир сообщает о себе. */
export const ENV = {
  // деревья и кусты: { x, y, z, s — высота (у куста — ширина) в метрах, ry }
  flora: { 'env-pine': [], 'env-oak': [], 'env-birch': [], 'env-bush': [], 'env-palm': [] },
  // камни: { x, y — низ, z, w, h, d — размеры, ry, tilt }
  rocks: { 'env-rock1': [], 'env-rock2': [], 'env-rock3': [], 'env-cliff1': [], 'env-cliff2': [] },
  // процедурные меши, которые убираются, когда встают модели
  fallback: { trees: [], palms: [], rocks: [], arch: [], piles: [], lighthouse: [], cottage: [], wreck: [], hut: [], campfire: [], lamps: [], bench: [], sign: [] },
  lamps: [], // фонарные столбы: { x, y, z, side, glass, light }
  docks: [], // сваи причалов: { x, y — низ модели, z, s — высота, ry, rz }
  piles: [], // верхушки высоких свай — на них садятся чайки: [x, y, z]
  // одиночные модели: { id, key?, x, y, z, s, ry, rx?, rz?, block?, fire?, gain? — во сколько раз высветлить,
  //   lit? — { color, k }: ночью загораются окна (карта свечения модели), glows? — тёплые ореолы: [x, y, z в долях модели, поперечник в метрах],
  //   fit? — [ширина, высота, глубина] в метрах: модель растягивается под них, rock? — скала: вблизи поверх текстуры мелкий рисунок камня }
  singles: [],
  lighthouse: null, // { x, y, z, beam, face }
  signBlock: null
};

const state = { trees: false, palms: false, rocks: false, cliffs: 0, arch: false, piles: 0, singles: 0, lamps: 0, gulls: 0, lighthouse: false, cottage: false, kiosk: false };
/** Для проверок: что уже заменено готовыми моделями; lit — сколько материалов с окнами, которые загораются ночью, glowing — как ярко они горят сейчас. */
export const envState = () => ({ ...state, lit: lits.length, glowing: lits.reduce((m, l) => Math.max(m, l.m.emissiveIntensity), 0) });

const GREY = (k) => ({ r: k, g: k, b: k });
// как рисуются копии камней: rock — вблизи поверх текстуры мелкий рисунок камня (surface.js)
const ROCK_OPT = {
  'env-rock1': { cell: 104, near: 45, vary: 0.3, tint: GREY(1.25), rock: true },
  'env-rock2': { cell: 400, near: 1e5, vary: 0.2, tint: GREY(1.45), rock: true },
  'env-rock3': { cell: 400, near: 1e5, vary: 0.2, tint: GREY(1.42), rock: true },
  'env-cliff1': { cell: 130, near: 140, vary: 0.25, tint: GREY(1.0), rock: true },
  'env-cliff2': { cell: 130, near: 140, vary: 0.25, tint: GREY(1.15), rock: true }
};
const glows = []; // светящиеся пятна фонарей и маяка: { s, k, day }
const lits = []; // материалы с окнами, которые загораются ночью: { m, k }
const gulls = [];
let fire = null; // костёр: { glow, flames, pool }
let night = 0;

// маленькая яркая сердцевина и широкий слабый ореол: с ровным пятном свет выглядит наклейкой
const glowTex = () =>
  canvasTex(64, 64, (g) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)');
    gr.addColorStop(0.12, 'rgba(255,244,210,0.55)');
    gr.addColorStop(0.35, 'rgba(255,214,150,0.17)');
    gr.addColorStop(0.7, 'rgba(255,190,110,0.04)');
    gr.addColorStop(1, 'rgba(255,180,90,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
  });
// язык пламени: капля, светлая в середине и рыжая по краям (слоями — края выходят мягкими)
const flameTex = () =>
  canvasTex(64, 128, (g) => {
    const N = 7;
    for (let i = 0; i < N; i++) {
      const k = 1 - (i / N) * 0.72; // слой за слоем капля сжимается к основанию
      const a = 0.14 + (i / (N - 1)) * 0.76;
      g.fillStyle = `rgba(255,${Math.round(120 + (i / (N - 1)) * 125)},${Math.round(20 + (i / (N - 1)) * 150)},${a})`;
      g.beginPath();
      g.moveTo(32, 124 - 118 * k);
      g.bezierCurveTo(32 + 30 * k, 124 - 62 * k, 32 + 30 * k, 124, 32, 124);
      g.bezierCurveTo(32 - 30 * k, 124, 32 - 30 * k, 124 - 62 * k, 32, 124 - 118 * k);
      g.fill();
    }
  });
let _glow = null;
/**
 * Мягкое свечение в точке: ночью — свет фонаря, днём не видно. day — насколько оно заметно и днём (огонь костра).
 * pull — на сколько метров свечение выдвинуто к смотрящему: пятно висит перед фонарём, а не внутри него, иначе
 * стекло и решётка закрывают самую яркую его часть и фонарь выглядит погасшим.
 */
function glow(scene, x, y, z, size, color = '#ffc37a', day = 0, pull = 0) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: (_glow ||= glowTex()), color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  s.position.set(x, y, z);
  s.scale.setScalar(size);
  s.visible = false;
  scene.add(s);
  const rec = { s, k: 1, day, pull, home: pull ? new THREE.Vector3(x, y, z) : null };
  glows.push(rec);
  return rec;
}
/** Ночь от 0 до 1: зажигает свечение у фонарей, маяка и костра. */
export function envNight(n) {
  night = n;
  for (const g of glows) {
    const o = Math.min(1, Math.max(g.day, n * 1.2)) * g.k;
    g.s.material.opacity = o;
    g.s.visible = o > 0.01;
  }
  for (const l of lits) l.m.emissiveIntensity = n * l.k;
}

/**
 * Живой огонь поверх нарисованного на модели: языки пламени, ореол и пятно света на земле (ночью).
 * at — середина пламени, s — масштаб кострища.
 */
function makeFire(scene, at, s) {
  const tex = flameTex();
  const flames = [];
  for (const [dx, dz, w, h] of [[0, 0, 0.3, 0.52], [-0.11, 0.05, 0.2, 0.34], [0.1, -0.06, 0.22, 0.4]]) {
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    f.center.set(0.5, 0.04); // растёт от основания вверх
    f.position.set(at.x + dx * s, at.y - 0.16 * s, at.z + dz * s);
    scene.add(f);
    flames.push({ f, w: w * s, h: h * s, x: f.position.x, ph: dx * 31 + dz * 17 });
  }
  // пятно света на песке: лежит по склону, чтобы край не уходил под землю
  const gy = groundH(at.x, at.z);
  const n = new THREE.Vector3(groundH(at.x - 0.5, at.z) - groundH(at.x + 0.5, at.z), 1, groundH(at.x, at.z - 0.5) - groundH(at.x, at.z + 0.5)).normalize();
  const pool = new THREE.Mesh(new THREE.CircleGeometry(3.4, 28), new THREE.MeshBasicMaterial({ map: (_glow ||= glowTex()), color: '#ffa040', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
  pool.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  pool.position.set(at.x, gy + 0.04, at.z);
  pool.visible = false;
  scene.add(pool);
  return { glow: glow(scene, at.x, at.y + 0.12 * s, at.z, 1.5 * s, '#ff9a3c', 0.35), flames, pool };
}

/** Надпись на прозрачном фоне — на готовую вывеску или стрелку указателя. Ширина w, высота h (в единицах родителя). */
function label(text, w, h, color = '#fff4d6') {
  const cw = 512;
  const ch = Math.max(32, Math.round((cw * h) / w));
  const tex = canvasTex(cw, ch, (g) => {
    g.clearRect(0, 0, cw, ch);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    let px = Math.round(ch * 0.82);
    const font = (p) => `italic 900 ${p}px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif`;
    g.font = font(px);
    // длинная надпись ужимается, чтобы поместиться в доску
    const tw = g.measureText(text).width;
    if (tw > cw * 0.94) g.font = font((px = Math.floor((px * cw * 0.94) / tw)));
    g.lineJoin = 'round';
    g.lineWidth = Math.max(3, px * 0.14);
    g.strokeStyle = 'rgba(46,26,10,0.9)';
    g.strokeText(text, cw / 2, ch * 0.54);
    g.fillStyle = color;
    g.fillText(text, cw / 2, ch * 0.54);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.08, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.receiveShadow = true;
  return m;
}

/** Готовой модели — тени облаков и подводный цвет (один раз на шаблон: копии делят материал). */
function patched(tpl, opts) {
  if (!tpl.patched) {
    tpl.patched = true;
    tpl.scene.traverse((o) => o.isMesh && patchModel(o.material, opts));
  }
  return tpl;
}
/** size — наибольший размер в метрах, если предмет мелкий: такой не отражается в воде и не рисуется издали (smalls.js). */
function put(scene, tpl, p, size = 0) {
  const o = spawn(patched(tpl, p.rock ? { rock: true } : undefined));
  if (size) small(o, p.x, p.z, size);
  if (p.fit) {
    const size = modelInfo(p.id).size;
    o.scale.set(p.fit[0] / size[0], p.fit[1] / size[1], p.fit[2] / size[2]);
  } else o.scale.setScalar(p.s);
  o.position.set(p.x, p.y, p.z);
  o.rotation.set(p.rx || 0, p.ry || 0, p.rz || 0, 'YXZ');
  scene.add(o);
  return o;
}
function drop(scene, key) {
  for (const m of ENV.fallback[key]) {
    scene.remove(m);
    if (m.geometry) m.geometry.dispose();
  }
  ENV.fallback[key].length = 0;
}

// ── замеры моделей (tools/dev/measure.mjs, tools/dev/boards.mjs): доли от размера модели ──
const LAMP = { post: -0.097, lantern: 0.108, y: 0.74, h: 3.3 }; // столб смещён от середины модели, фонарь висит на выносе
const TOWER = { h: 17, lamp: 0.855 }; // высота маяка в метрах и где у него фонарь
const KIOSK = { s: 3.3, x: 3.95, z: -6.4, board: { y: 0.895, zf: -0.314, zb: -0.238, w: 0.74, h: 0.125 } };
// доски указателя: середина, угол в плане (от X к Z), длина, с какой стороны остриё. Доски прибиты к столбу
// со стороны −Z модели: оттуда надпись видна целиком, а с изнанки её перекрывает столб — там не пишем.
// Указатель стоит лицом на запад: верхняя стрелка смотрит на север, вдоль пирса, две нижние — на берег.
const ARROWS = [
  { y: 0.51, x: -0.036, z: -0.016, a: 0.32, len: 0.51, tip: -1, text: 'ЛАВКА' },
  { y: 0.67, x: -0.059, z: 0.0, a: -0.46, len: 0.54, tip: -1, text: 'ПЛЯЖ' },
  { y: 0.85, x: 0.046, z: 0.012, a: 0.4, len: 0.58, tip: 1, text: 'ПРОКАТ ЛОДОК' }
];

/**
 * Загружает модели локации и расставляет их вместо процедурных. Возвращает то, что нужно обновлять каждый кадр.
 * Если моделей нет (пробная версия одним файлом) — ничего не делает: мир остаётся процедурным.
 */
export function upgradeEnv(scene) {
  const scatter = new Scatter(scene, { lite: isTouch() });
  const has = (id) => !!modelInfo(id);
  const fail = () => {};
  loadManifest().then(() => {
    // ── деревья и кусты: лес целиком меняется, когда загрузились все породы ──
    const trees = ['env-pine', 'env-oak', 'env-birch', 'env-bush'];
    if (trees.every(has)) {
      // подробные — те, чья тень может попасть в кадр (тени рисуются на 44 м вокруг игрока); дальше — грубые копии
      // Листва у моделей темнее, чем мир игры: без высветления тень на сосне выходила чёрной. Текстуры уже
      // высветлены при подготовке (gamma в art/models.json), здесь — общий множитель; оба подобраны по замерам
      // снимков, а не на глаз.
      // множители цвета подобраны под тональную кривую игры (gfx.js): у дуба и куста убавлен красный —
      // стволы были рыжими, а кусты кислотно-жёлтыми рядом с травой
      const opt = {
        'env-pine': { sway: 0.01, tint: { r: 1.28, g: 1.36, b: 1.34 }, sat: 0.92 },
        'env-oak': { sway: 0.012, tint: { r: 1.0, g: 1.1, b: 1.1 }, sat: 0.86 },
        'env-birch': { sway: 0.016, tint: { r: 1.05, g: 1.2, b: 1.15 }, sat: 0.82 },
        // (на Коралловых островках кусты светлее и сочнее: там это тропическая зелень под пальмами, а не подлесок)
        'env-bush': HAS.keys ? { sway: 0.006, near: 22, tint: { r: 0.88, g: 1.14, b: 0.9 }, sat: 0.92 } : { sway: 0.006, near: 22, tint: { r: 0.74, g: 0.94, b: 0.9 }, sat: 0.78 }
      };
      Promise.all(trees.map((id) => loadModel(id)))
        .then(() => Promise.all(trees.map((id) => scatter.add(id, ENV.flora[id], { cell: 104, near: 55, vary: 0.55, ...opt[id] }))))
        .then(() => {
          drop(scene, 'trees');
          state.trees = true;
        }, fail);
    }
    if (has('env-palm'))
      scatter.add('env-palm', ENV.flora['env-palm'], { cell: 90, near: 60, sway: 0.02, vary: 0.4, tint: GREY(1.1) }).then(() => {
        drop(scene, 'palms');
        state.palms = true;
      }, fail);
    // ── камни: процедурный камень задан размерами, модель растягивается под них ──
    const rocks = ['env-rock1', 'env-rock2', 'env-rock3', 'env-cliff1', 'env-cliff2'];
    let turned = 0; // сколько утёсов встало «боком»
    if (rocks.every(has)) {
      const items = (id) => {
        const size = modelInfo(id).size;
        return ENV.rocks[id].map((r) => {
          let { w, d, ry } = r;
          if (r.turn) {
            // «боком»: наружу смотрит другая грань той же модели. Только если её не придётся растягивать заметно сильнее обычного
            const fit = (a, b) => Math.max(a, b) / Math.min(a, b);
            if (fit(d / size[0], w / size[2]) < Math.max(1.6, fit(w / size[0], d / size[2]) * 1.2)) {
              [w, d] = [d, w];
              ry += Math.PI / 2;
              turned++;
            }
          }
          return {
            x: r.x, y: r.y, z: r.z, s: 1, sx: w / size[0], sy: r.h / size[1], sz: d / size[2], ry,
            rx: r.tilt ? (spot01(r.x, r.z, 8) - 0.5) * 0.3 : 0, rz: r.tilt ? (spot01(r.x, r.z, 9) - 0.5) * 0.3 : 0
          };
        });
      };
      Promise.all(rocks.map((id) => loadModel(id)))
        // скал в море немного, и они большие — всегда подробные; валуны вдали рисуются грубо.
        // Камень у моделей тёмный, а мир игры светлый — высветляем (и текстуру, и множителем), иначе скалы
        // стоят чёрными столбами
        // утёсы (env-cliff*) — кольцо вокруг острова с маяком и глыбы западного берега: подробные издалека, это главный вид бухты
        .then(() => Promise.all(rocks.map((id) => scatter.add(id, items(id), ROCK_OPT[id]))))
        .then(() => {
          drop(scene, 'rocks');
          state.rocks = true;
          state.cliffs = ENV.rocks['env-cliff1'].length + ENV.rocks['env-cliff2'].length;
          state.turned = turned;
        }, fail);
    }
    // ── сваи причалов: рядом подробные, дальше — грубые копии ──
    if (has('env-pile'))
      scatter.add('env-pile', ENV.docks, { cell: 72, near: 30, vary: 0.35 }).then(() => {
        drop(scene, 'piles');
        state.piles = ENV.docks.length;
      }, fail);
    // ── одиночные модели на местах процедурных ──
    for (const p of ENV.singles) {
      if (!has(p.id)) continue;
      loadModel(p.id).then((tpl) => {
        if (p.gain && !tpl.gained) {
          tpl.gained = true;
          tpl.scene.traverse((c) => c.isMesh && c.material.color.multiplyScalar(p.gain));
        }
        // мелкие одиночные модели (не фонари: их отражение в воде заметно) — в «мелочь»
        const sz = modelInfo(p.id) && modelInfo(p.id).size ? Math.max(...modelInfo(p.id).size) * (p.s || 1) : 9;
        const o = put(scene, tpl, p, !p.fit && !p.lit && !p.glows && !p.fire && sz < 3.2 ? sz : 0);
        if (p.key) drop(scene, p.key);
        if (p.key && p.key in state) state[p.key] = true;
        if (p.block) CIRCLES.push({ x: p.x, z: p.z, r: p.block });
        if (p.fire) fire = makeFire(scene, new THREE.Vector3(...p.fire).multiplyScalar(p.s).applyEuler(o.rotation).add(o.position), p.s);
        if (p.lit)
          o.traverse((c) => {
            if (!c.isMesh || !c.material.emissiveMap) return;
            c.material.emissive.set(p.lit.color);
            lits.push({ m: c.material, k: p.lit.k });
          });
        for (const [gx, gy, gz, size] of p.glows || []) {
          const at = new THREE.Vector3(gx, gy, gz).multiplyScalar(p.s).applyEuler(o.rotation).add(o.position);
          glow(scene, at.x, at.y, at.z, size).k = 0.55;
        }
        if (p.lit || p.glows) envNight(night);
        state.singles++;
      }, fail);
    }
    // ── маяк ──
    if (has('env-lighthouse') && ENV.lighthouse)
      loadModel('env-lighthouse').then((tpl) => {
        const L = ENV.lighthouse;
        const y = L.y - 0.25;
        put(scene, tpl, { x: L.x, y, z: L.z, s: TOWER.h, ry: L.face });
        drop(scene, 'lighthouse');
        // луч и свет — на высоту фонаря готовой башни
        L.beam.position.y = y + TOWER.h * TOWER.lamp;
        glow(scene, L.x, y + TOWER.h * TOWER.lamp, L.z, 9, '#ffe2a0');
        envNight(night);
        state.lighthouse = true;
      }, fail);
    // ── фонарные столбы: модель встаёт столбом на место процедурного, свет — в её фонарь ──
    if (has('env-lamppost'))
      loadModel('env-lamppost').then((tpl) => {
        for (const l of ENV.lamps) {
          const s = LAMP.h;
          put(scene, tpl, { x: l.x - l.side * LAMP.post * s, y: l.y - 0.05, z: l.z, s, ry: l.side > 0 ? 0 : Math.PI });
          const lx = l.x + l.side * (LAMP.lantern - LAMP.post) * s;
          const ly = l.y - 0.05 + LAMP.y * s;
          if (l.glass) l.glass.visible = false;
          if (l.light) l.light.position.set(lx, ly, l.z);
          if (l.wake) Object.assign(l.wake, { x: lx, y: ly }); // дорожка света на воде — от нового места фонаря
          glow(scene, lx, ly, l.z, 1.9, '#ffc37a', 0, 0.3);
          state.lamps++;
        }
        drop(scene, 'lamps');
        envNight(night);
      }, fail);
    // ── будка проката на своей площадке: с ней столб с доской у пирса не нужен ──
    if (has('env-rental'))
      loadModel('env-rental').then((tpl) => {
        // прилавок с навесом (у модели он на −Z) смотрит на пирс
        const o = put(scene, tpl, { x: KIOSK.x, y: DECK_Y, z: KIOSK.z, s: KIOSK.s, ry: Math.PI / 2 });
        const b = KIOSK.board;
        const front = label('ПРОКАТ ЛОДОК', b.w, b.h);
        front.position.set(0.003, b.y, b.zf);
        front.rotation.y = Math.PI;
        const back = label('ПРОКАТ ЛОДОК', b.w, b.h);
        back.position.set(0.003, b.y, b.zb);
        o.add(front, back);
        drop(scene, 'sign');
        if (ENV.signBlock) ENV.signBlock.r = 0;
        // будка занимает всю площадку, кроме полосы перед прилавком: вплотную к нему (и под навес) не подойти,
        // а обойти будку и оказаться запертым за ней — негде
        BOXES.push({ x0: KIOSK.x - 1.45, x1: 5.8, z0: -8.8, z1: -4.0 });
        state.kiosk = true;
      }, fail);
    // ── указатель у начала пирса: стрелки подписаны с обеих сторон ──
    if (has('env-signpost'))
      loadModel('env-signpost').then((tpl) => {
        const o = put(scene, tpl, { x: 2.75, y: DECK_Y - 0.02, z: 4.8, s: 2.7, ry: Math.PI / 2 });
        for (const a of ARROWS) {
          const t = label(a.text, a.len - 0.17, 0.086);
          // сдвиг от острия к хвосту и на полтолщины доски наружу, к зрителю
          const along = -a.tip * 0.035;
          t.position.set(a.x + Math.cos(a.a) * along + Math.sin(a.a) * 0.036, a.y, a.z + Math.sin(a.a) * along - Math.cos(a.a) * 0.036);
          t.rotation.y = Math.PI - a.a;
          o.add(t);
        }
        CIRCLES.push({ x: 2.75, z: 4.8, r: 0.25 });
        state.singles++;
      }, fail);
    // ── кранцы у причалов: шина висит на верёвке, плоской стороной к воде ──
    if (has('env-fender'))
      loadModel('env-fender').then((tpl) => {
        const s = 1.05;
        for (const [x, z, ry] of [[1.76, -10.9, Math.PI / 2], [1.76, -13.3, Math.PI / 2], [-17.1, -69.86, 0], [-18.6, -69.86, 0], [211.0, -185.36, 0], [212.4, -185.36, 0]]) {
          put(scene, tpl, { x, y: DECK_Y + 0.1 - s * 0.988, z, s, ry }, 1.05);
          state.singles++;
        }
      }, fail);
    // ── скамейка на причале у маяка ──
    if (has('env-bench'))
      loadModel('env-bench').then((tpl) => {
        put(scene, tpl, { x: -17.8, y: DECK_Y, z: -78.0, s: 1.62, ry: Math.PI }, 1.62);
        CIRCLES.push({ x: -17.8, z: -78.0, r: 0.65 });
        state.singles++;
      }, fail);
    // ── чайки на сваях: сидят и вертят головой ──
    if (has('env-seagull'))
      loadModel('env-seagull').then((tpl) => {
        for (const [x, z] of [[6.2, -24.6], [-6.2, -22.2], [1.8, -1.5], [-34.9, 9.2], [-20.2, -74.3], [208.9, -190.2]]) {
          let best = null;
          let bd = 4.5;
          for (const p of ENV.piles) {
            const d = Math.hypot(p[0] - x, p[2] - z);
            if (d < bd && !gulls.some((g) => g.pile === p)) {
              bd = d;
              best = p;
            }
          }
          if (!best) continue;
          const ry = spot01(best[0], best[2], 6) * TAU;
          const o = put(scene, tpl, { x: best[0], y: best[1], z: best[2], s: 0.5, ry }, 0.8);
          gulls.push({ o, ry, pile: best, ph: ry * 3, turn: 0 });
          state.gulls++;
        }
      }, fail);
  }, fail);
  let last = 0;
  return {
    scatter,
    update(camera, t = performance.now() / 1000) {
      scatter.update(camera);
      // свечение фонарей держится перед фонарём со стороны смотрящего
      if (night > 0.01)
        for (const g of glows) {
          if (!g.home) continue;
          const p = g.s.position.copy(camera.position).sub(g.home);
          const d = p.length();
          p.multiplyScalar(Math.min(g.pull, d * 0.5) / Math.max(d, 1e-3)).add(g.home);
        }
      // чайка то и дело поворачивается: посмотрела в одну сторону, замерла, потом в другую
      const dt = Math.min(0.1, Math.max(0, t - last));
      last = t;
      for (const g of gulls) {
        const k = Math.sin(t * 0.37 + g.ph) + 0.6 * Math.sin(t * 0.83 + g.ph * 2);
        g.turn += (Math.round(k * 1.2) * 0.42 - g.turn) * Math.min(1, dt * 5);
        g.o.rotation.y = g.ry + g.turn;
      }
      if (fire) {
        // огонь дрожит: языки тянутся и опадают вразнобой, свет на песке мигает вместе с ними
        const k = 0.78 + 0.22 * Math.sin(t * 9 + Math.sin(t * 23) * 1.3);
        for (const fl of fire.flames) {
          const a = 0.8 + 0.26 * Math.sin(t * (8.5 + fl.ph * 0.07) + fl.ph) + 0.12 * Math.sin(t * 21 + fl.ph * 3);
          fl.f.scale.set(fl.w * (0.92 + 0.14 * Math.sin(t * 6.3 + fl.ph * 2)), fl.h * a, 1);
          fl.f.position.x = fl.x + Math.sin(t * 4.7 + fl.ph) * 0.02;
        }
        const g = fire.glow;
        g.k = k;
        g.s.material.opacity = Math.min(1, Math.max(g.day, night)) * k * 0.8;
        g.s.visible = true;
        fire.pool.material.opacity = night * (0.34 + 0.2 * k);
        fire.pool.visible = night > 0.03;
      }
    }
  };
}
