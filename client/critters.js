// Живность и суда этапа 30 (модели Tripo по образцам GPT Image):
//   ара парами кружат над джунглями (водопады, протока), туканы сидят на сваях;
//   черепахи плавают у рифа островков и у острова Синего простора, всплывают подышать;
//   фламинго стоят стайкой на отмели протоки; крабы бегают по берегу; лягушки сидят у воды и прыгают от рыбака;
//   кайман лежит у поверхности протоки и уходит под воду, когда к нему подплывают;
//   прогулочный катер ходит по каналу и гавани марины, у бухты стоит на якоре траулер, у причалов — ялики.
// Модели нет (пробная версия без моделей, не загрузилась) — нет и зверя: всё здесь — украшение, без него игра та же.
import * as THREE from 'three';
import { loadManifest } from './hero.js';
import { loadModel, spawn, modelInfo, modelGeometry } from './models.js';
import { patchModel } from './surface.js';
import { spot01 } from './scatter.js';
import { sstep, TAU } from './util.js';
import { groundH, canSail, deckAt, MOORINGS, SAIL_EXTRA } from './terrain.js';
import { waveH } from './water.js';
import { ENV } from './envmodels.js';
import { LOC_ID } from './loc/id.js';

const HOME = { x: 0, z: -30 }; // середина домашней бухты: вокруг неё ищем места

/** Детерминированный поиск n мест вокруг (cx, cz) в радиусе R, где test(x, z) истинно, не ближе gap друг к другу. */
function find(n, test, cx, cz, R, gap, seed, tries = 900) {
  const out = [];
  for (let i = 0; i < tries && out.length < n; i++) {
    const a = spot01(i * 1.7 + seed, seed * 3.1, 11) * TAU;
    const r = Math.sqrt(spot01(seed * 2.3, i * 2.9 + seed, 12)) * R;
    const x = cx + Math.cos(a) * r;
    const z = cz + Math.sin(a) * r;
    if (!test(x, z) || out.some((p) => Math.hypot(p[0] - x, p[1] - z) < gap)) continue;
    out.push([x, z]);
  }
  return out;
}
/** Далеко ли от причалов, где встают лодки игроков. */
const offMoor = (x, z, d) => MOORINGS.every((m) => Math.hypot(m.x - x, m.z - z) > d);

function patched(tpl) {
  if (!tpl.patched) {
    tpl.patched = true;
    tpl.scene.traverse((o) => o.isMesh && patchModel(o.material));
  }
  return tpl;
}
/** Копия модели: размер s — по самой длинной стороне модели (у нормированных моделей она равна 1), в метрах. */
function place(scene, tpl, x, y, z, s, ry = 0) {
  const o = spawn(patched(tpl));
  o.scale.setScalar(s);
  o.position.set(x, y, z);
  o.rotation.set(0, ry, 0, 'YXZ');
  scene.add(o);
  return o;
}

/**
 * Сетка «с крыльями» для стаи (как у чаек в scenery.js): крылья — вдоль X, голова — к −Z, середина тела — в начале
 * координат, размах — span метров. aWing: насколько вершина — крыло (у тела не гнётся, к концам — всё сильнее).
 */
function wingGeometry(tpl, span) {
  const m = modelGeometry(tpl);
  if (!m) return null;
  const g = m.g;
  const P = g.attributes.position;
  let sx = 0, sz = 0, sxx = 0, szz = 0, sxz = 0;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), z = P.getZ(i);
    sx += x; sz += z; sxx += x * x; szz += z * z; sxz += x * z;
  }
  const n = P.count;
  const cxx = sxx / n - (sx / n) ** 2, czz = szz / n - (sz / n) ** 2, cxz = sxz / n - (sx / n) * (sz / n);
  g.rotateY(0.5 * Math.atan2(2 * cxz, cxx - czz));
  g.computeBoundingBox();
  const b = g.boundingBox;
  const w = b.max.x - b.min.x;
  const mx = (b.max.x + b.min.x) / 2;
  let zmin = 0, zmax = 0, ys = 0, zs = 0, cn = 0;
  for (let i = 0; i < n; i++) {
    if (Math.abs(P.getX(i) - mx) > w * 0.12) continue;
    zmin = Math.min(zmin, P.getZ(i));
    zmax = Math.max(zmax, P.getZ(i));
    ys += P.getY(i);
    zs += P.getZ(i);
    cn++;
  }
  const zc = cn ? zs / cn : 0;
  g.translate(-mx, -(cn ? ys / cn : 0), -zc);
  // у ара хвост длиннее клюва: голова там, где тело короче — с той стороны от крыльев, где вершин меньше уходит далеко
  if (zmax - zc < zc - zmin) g.rotateY(Math.PI);
  const k = span / w;
  g.scale(k, k, k);
  const wing = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = P.getX(i);
    wing[i] = Math.sign(x) * sstep(0.06, 0.5, Math.abs(x) / (span / 2));
  }
  g.setAttribute('aWing', new THREE.BufferAttribute(wing, 1));
  const mat = m.material.clone();
  mat.side = THREE.DoubleSide;
  mat.metalness = 0;
  mat.roughness = 0.85;
  return { g, mat };
}
/** Взмах крыльев в шейдере: вершина поворачивается вокруг оси тела на угол aFlap · aWing. */
function flapMaterial(mat, key) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aWing;\nattribute float aFlap;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n{ float a = aFlap * aWing; float c = cos(a), s = sin(a); transformed.xy = vec2(transformed.x * c - transformed.y * s, transformed.x * s + transformed.y * c); }');
  };
  mat.customProgramCacheKey = () => key;
  return mat;
}

/** Ара парами кружат над лесом и водой: широкие круги, то машут, то парят; пара держится рядом. */
function buildParrots(scene, tpl, out) {
  const w = wingGeometry(tpl, 1.15);
  if (!w) return null;
  // пары кружат невысоко над водой у причала и над лесом: так видно, что они красные с синим, а не просто птицы
  const pairs = LOC_ID === 'cascade' ? [[-22, 13, -42, 22], [26, 11, -12, 17], [0, 17, -82, 30]] : [[-30, 12, -36, 24], [28, 10, -58, 19], [0, 16, 8, 28]];
  const N = pairs.length * 2;
  const flap = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
  w.g.setAttribute('aFlap', flap);
  const mesh = new THREE.InstancedMesh(w.g, flapMaterial(w.mat, 'parrot'), N);
  mesh.frustumCulled = false;
  mesh.name = 'parrots';
  mesh.layers.set(1);
  scene.add(mesh);
  const o = new THREE.Object3D();
  const list = pairs.map(([cx, cy, cz, r], i) => ({ cx, cy, cz, r, ph: i * 2.1, sp: 0.15 + i * 0.025, dir: i % 2 ? 1 : -1 }));
  out.parrots = N;
  return (t) => {
    list.forEach((b, i) => {
      for (let j = 0; j < 2; j++) {
        const a = b.ph + t * b.sp * b.dir - j * 0.08 * b.dir;
        const rr = b.r + j * 2.2;
        const x = b.cx + Math.cos(a) * rr;
        const z = b.cz + Math.sin(a) * rr;
        const y = b.cy + Math.sin(t * 0.25 + b.ph) * 3 + j * 0.8;
        // скорость — касательная к кругу: голова (−Z модели) смотрит по ходу, в повороте птица кренится внутрь
        const vx = -Math.sin(a) * b.dir;
        const vz = Math.cos(a) * b.dir;
        o.position.set(x, y, z);
        o.rotation.set(0, Math.atan2(-vx, -vz), -b.dir * 0.3, 'YXZ');
        o.updateMatrix();
        mesh.setMatrixAt(i * 2 + j, o.matrix);
        // машут сериями, между ними парят
        const work = 0.35 + 0.65 * Math.max(0, Math.sin(t * 0.5 + b.ph + j * 0.4));
        flap.setX(i * 2 + j, Math.sin(t * 7.5 + b.ph * 3 + j) * 0.6 * work);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    flap.needsUpdate = true;
  };
}

/** Туканы на сваях причала: сидят и вертят головой, как чайки в бухте. */
function buildToucans(scene, tpl, out) {
  const birds = [];
  const want = [[6.2, -24.6], [-6.2, -22.2], [1.8, -1.5], [-34.9, 9.2]];
  for (const [x, z] of want) {
    let best = null;
    let bd = 6;
    for (const p of ENV.piles) {
      const d = Math.hypot(p[0] - x, p[2] - z);
      if (d < bd && !birds.some((b) => b.pile === p) && offMoor(p[0], p[2], 3)) {
        bd = d;
        best = p;
      }
    }
    if (!best || birds.length >= 3) continue;
    const ry = spot01(best[0], best[2], 7) * TAU;
    birds.push({ o: place(scene, tpl, best[0], best[1], best[2], 0.55, ry), ry, pile: best, ph: ry * 3, turn: 0 });
  }
  out.toucans = birds.length;
  if (birds.length) out.toucanAt = birds[0].pile.slice();
  let last = 0;
  return (t) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    for (const b of birds) {
      const k = Math.sin(t * 0.31 + b.ph) + 0.6 * Math.sin(t * 0.77 + b.ph * 2);
      b.turn += (Math.round(k * 1.2) * 0.5 - b.turn) * Math.min(1, dt * 4);
      b.o.rotation.y = b.ry + b.turn;
    }
  };
}

/** Фламинго стайкой стоят на отмели: поворачиваются медленно, по одному. */
function buildFlamingos(scene, tpl, out) {
  const shallow = (x, z) => {
    const h = groundH(x, z);
    return h > -0.32 && h < -0.1 && offMoor(x, z, 12) && !deckAt(x, z, -0.3);
  };
  // стайка: сначала место, где отмели хватит на всех, потом птицы вокруг него
  const centre = find(1, (x, z) => shallow(x, z) && find(6, shallow, x, z, 8, 1.5, 3.3, 120).length >= 6, -50, -20, 45, 1, 4.2, 300)[0];
  if (!centre) return null;
  const c = centre;
  const near = [c, ...find(6, shallow, c[0], c[1], 8, 1.5, 3.3, 200)];
  const birds = near.map(([x, z], i) => {
    const ry = spot01(x, z, 8) * TAU;
    return { o: place(scene, tpl, x, groundH(x, z) - 0.03, z, 1.2 + (i % 3) * 0.06, ry), ry, ph: ry * 3 + i, turn: 0 };
  });
  out.flamingos = birds.length;
  out.flamingoAt = c;
  let last = 0;
  return (t) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    for (const b of birds) {
      const k = Math.sin(t * 0.11 + b.ph) + 0.5 * Math.sin(t * 0.23 + b.ph * 2);
      b.turn += (Math.round(k) * 0.7 - b.turn) * Math.min(1, dt * 1.2);
      b.o.rotation.y = b.ry + b.turn;
    }
  };
}

/**
 * Животное, что плавает по кругу у поверхности (черепаха): голова модели — к +X. Ласты машут в шейдере — как крылья,
 * поперёк тела. Раз в полминуты черепаха всплывает подышать.
 */
function buildTurtles(scene, tpl, out, cfg) {
  const m = modelGeometry(tpl);
  if (!m) return null;
  const g = m.g;
  g.computeBoundingBox();
  let b = g.boundingBox;
  g.translate(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, -(b.min.z + b.max.z) / 2);
  const L = b.max.x - b.min.x;
  const k = cfg.len / L;
  g.scale(k, k, k);
  g.computeBoundingBox();
  b = g.boundingBox;
  const half = Math.max(-b.min.z, b.max.z);
  const P = g.attributes.position;
  const wing = new Float32Array(P.count);
  // ласты — по бокам панциря; гнём их вокруг оси тела (X): поворот в плоскости Z-Y
  for (let i = 0; i < P.count; i++) wing[i] = Math.sign(P.getZ(i)) * sstep(0.32, 0.75, Math.abs(P.getZ(i)) / half);
  g.setAttribute('aWing', new THREE.BufferAttribute(wing, 1));
  const N = cfg.n;
  const flap = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
  g.setAttribute('aFlap', flap);
  const mat = m.material.clone();
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aWing;\nattribute float aFlap;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n{ float a = aFlap * aWing; float c = cos(a), s = sin(a); transformed.zy = vec2(transformed.z * c - transformed.y * s, transformed.z * s + transformed.y * c); }');
  };
  mat.customProgramCacheKey = () => 'turtle';
  const mesh = new THREE.InstancedMesh(g, mat, N);
  mesh.name = 'turtles';
  mesh.frustumCulled = false;
  scene.add(mesh);
  const homes = find(N, (x, z) => {
    const h = groundH(x, z);
    return h < -1.6 && h > -6 && canSail(x, z) && canSail(x + 6, z) && canSail(x - 6, z) && canSail(x, z + 6) && canSail(x, z - 6);
  }, cfg.cx, cfg.cz, cfg.R, 14, 5.5);
  const list = homes.map(([x, z], i) => ({ x, z, r: 5 + (i % 3) * 1.6, ph: i * 1.9, sp: 0.09 + (i % 2) * 0.03, dir: i % 2 ? 1 : -1, depth: -0.7 - (i % 3) * 0.35 }));
  out.turtles = list.length;
  if (list.length) out.turtleAt = [list[0].x, list[0].z];
  const o = new THREE.Object3D();
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = list.length; i < N; i++) mesh.setMatrixAt(i, hide);
  return (t) => {
    list.forEach((b, i) => {
      const a = b.ph + t * b.sp * b.dir;
      const x = b.x + Math.cos(a) * b.r;
      const z = b.z + Math.sin(a) * b.r;
      // раз в ~40 с — к поверхности: голова на миг над водой
      const up = sstep(0.82, 0.97, Math.sin(t * 0.16 + b.ph) * 0.5 + 0.5);
      const y = b.depth * (1 - up) - 0.12 * up + Math.sin(t * 0.7 + b.ph) * 0.08;
      const vx = -Math.sin(a) * b.dir;
      const vz = Math.cos(a) * b.dir;
      o.position.set(x, y, z);
      o.rotation.set(0, Math.atan2(-vz, vx), Math.sin(t * 1.1 + b.ph) * 0.06, 'YXZ');
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      flap.setX(i, Math.sin(t * 1.6 + b.ph) * 0.45);
    });
    mesh.instanceMatrix.needsUpdate = true;
    flap.needsUpdate = true;
  };
}

/** Крабы на берегу у воды: стоят, перебегают боком на полметра-метр; рыбак близко — удирают к воде и прячутся. */
function buildCrabs(scene, tpl, out, cfg) {
  const spots = find(cfg.n, (x, z) => {
    const h = groundH(x, z);
    return h > 0.04 && h < 0.5 && groundH(x + 1, z) < 0.7 && groundH(x - 1, z) < 0.7 && !deckAt(x, z, -0.3) && offMoor(x, z, 4);
  }, cfg.cx, cfg.cz, cfg.R, 3, 6.3);
  const crabs = spots.map(([x, z], i) => {
    const ry = spot01(x, z, 9) * TAU;
    return { o: place(scene, tpl, x, groundH(x, z), z, 0.3 + (i % 3) * 0.04, ry), x0: x, z0: z, ry, ph: i * 2.3, off: 0, goal: 0, hide: 0 };
  });
  out.crabs = crabs.length;
  if (crabs.length) out.crabAt = [crabs[0].x0, crabs[0].z0];
  let last = 0;
  return (t, cam) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    for (const c of crabs) {
      const o = c.o;
      const near = cam && Math.hypot(cam.x - o.position.x, cam.z - o.position.z) < 3.2;
      if (near && c.hide <= 0) c.hide = 14; // удрал и сидит в норке
      if (c.hide > 0) {
        c.hide -= dt;
        o.visible = c.hide < 0.4 || c.hide > 13.2;
        if (c.hide > 13.2) c.goal = c.off + Math.sign(Math.sin(c.ph) || 1) * 1.2; // рывок вбок перед тем, как скрыться
      } else {
        o.visible = true;
        // иногда — перебежка боком на новое место
        if (Math.abs(c.goal - c.off) < 0.02 && spot01(Math.floor(t / 3.5 + c.ph), c.ph, 4) > 0.7) c.goal = (spot01(Math.floor(t / 3.5), c.ph * 2, 5) - 0.5) * 1.6;
      }
      c.off += Math.sign(c.goal - c.off) * Math.min(Math.abs(c.goal - c.off), dt * (c.hide > 0 ? 2.6 : 0.9));
      const x = c.x0 + Math.cos(c.ry) * c.off;
      const z = c.z0 - Math.sin(c.ry) * c.off;
      o.position.set(x, Math.max(groundH(x, z), 0.02), z);
    }
  };
}

/** Лягушки сидят у самой воды; рыбак подошёл — прыжок в воду, а через полминуты лягушка снова на месте. */
function buildFrogs(scene, tpl, out, cfg) {
  const spots = find(cfg.n, (x, z) => {
    const h = groundH(x, z);
    return h > 0.02 && h < 0.35 && !deckAt(x, z, -0.3) && offMoor(x, z, 4) && groundH(x + 1.5, z) < 0.6;
  }, cfg.cx, cfg.cz, cfg.R, 2.5, 7.7);
  const frogs = spots.map(([x, z]) => {
    // смотрит к воде: в сторону, где земля ниже
    const gx = groundH(x + 0.6, z) - groundH(x - 0.6, z);
    const gz = groundH(x, z + 0.6) - groundH(x, z - 0.6);
    const ry = Math.atan2(gz, -gx); // голова модели — к −X
    return { o: place(scene, tpl, x, groundH(x, z), z, 0.16, ry), x, z, ry, jump: -1 };
  });
  out.frogs = frogs.length;
  if (frogs.length) out.frogAt = [frogs[0].x, frogs[0].z];
  let last = 0;
  return (t, cam) => {
    const dt = Math.min(0.1, Math.max(0, t - last));
    last = t;
    for (const f of frogs) {
      const o = f.o;
      if (f.jump < 0 && cam && Math.hypot(cam.x - f.x, cam.z - f.z) < 3) f.jump = 0;
      if (f.jump >= 0) {
        f.jump += dt;
        const u = Math.min(1, f.jump / 0.55);
        // прыжок вперёд, к воде, по дуге — и под воду
        const d = u * 1.4;
        const x = f.x - Math.cos(f.ry) * d;
        const z = f.z + Math.sin(f.ry) * d;
        o.position.set(x, groundH(f.x, f.z) + Math.sin(u * Math.PI) * 0.5 - u * 0.25, z);
        o.visible = u < 1;
        if (f.jump > 30) {
          f.jump = -1;
          o.visible = true;
          o.position.set(f.x, groundH(f.x, f.z), f.z);
        }
      }
    }
  };
}

/** Кайман лежит у поверхности: над водой — глаза и гребень спины; подплыли ближе 9 м — уходит под воду. */
function buildCaimans(scene, tpl, out, cfg) {
  const spots = find(cfg.n, (x, z) => {
    const h = groundH(x, z);
    return h < -0.9 && h > -3 && canSail(x, z) && offMoor(x, z, 20);
  }, cfg.cx, cfg.cz, cfg.R, 30, 8.8);
  const list = spots.map(([x, z], i) => ({ o: place(scene, tpl, x, -0.2, z, 2.6, spot01(x, z, 10) * TAU), x, z, ry: spot01(x, z, 10) * TAU, down: 0, ph: i * 3.1, gone: 0 }));
  out.caimans = list.length;
  if (list.length) out.caimanAt = [list[0].x, list[0].z];
  let last = 0;
  const api = {
    onDive: null,
    step(t, cam) {
      const dt = Math.min(0.1, Math.max(0, t - last));
      last = t;
      for (const c of list) {
        const near = cam && Math.hypot(cam.x - c.o.position.x, cam.z - c.o.position.z) < 9;
        if (near && c.gone <= 0) {
          c.gone = 28;
          if (api.onDive) api.onDive(c.o.position.x, c.o.position.z);
        }
        if (c.gone > 0) c.gone -= dt;
        c.down += ((c.gone > 2 ? 1 : 0) - c.down) * Math.min(1, dt * 1.4);
        // медленно дрейфует и чуть поворачивает
        const a = t * 0.02 + c.ph;
        const x = c.x + Math.cos(a) * 3;
        const z = c.z + Math.sin(a) * 3;
        c.o.position.set(x, -0.2 - c.down * 1.4 + waveH(x, z, t) * 0.8, z);
        c.o.rotation.y = c.ry + Math.sin(t * 0.05 + c.ph) * 0.4;
        c.o.visible = c.down < 0.97;
      }
    }
  };
  return api;
}

/** Судно, что стоит на воде: качается на волне; ночью на мачте горит огонь. */
function moored(scene, tpl, o, x, z, ry, len, draft, light) {
  const obj = place(scene, tpl, x, -draft, z, len, ry);
  SAIL_EXTRA.push({ x, z, r: len * 0.42 });
  const s = { o: obj, x, z, ry, draft, len, ph: x * 0.3 + z * 0.17 };
  if (light) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff3d0').multiplyScalar(3), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat);
    bulb.position.set(light[0], light[1], light[2]); // в долях модели: модель нормирована по длине
    bulb.scale.setScalar(1 / len);
    obj.add(bulb);
    s.bulb = mat;
  }
  o.push(s);
  return s;
}

/**
 * Прогулочный катер марины: идёт по кругу — из канала под мостом в гавань, вдоль пирсов яхт-клуба к молу и обратно.
 * Нос модели — к −X. Ночью на тенте горят лампочки.
 */
function buildTourBoat(scene, tpl, out) {
  const way = [
    [-286, -166], [-262, -138], [-226, -116], [-180, -106], [-130, -104], [-96, -98], [-60, -78], [-10, -70], [40, -66], [92, -62], [112, -48],
    [96, -40], [40, -50], [-10, -56], [-60, -64], [-96, -92], [-132, -108], [-180, -110], [-228, -121], [-266, -144], [-292, -176]
  ];
  // путь — сплайн по точкам, замкнутый
  const curve = new THREE.CatmullRomCurve3(way.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
  const L = curve.getLength();
  const len = 10;
  const boat = place(scene, tpl, 0, -0.45, 0, len, 0);
  // лампочки по краю тента: в осях модели (длина 1)
  // яркость лампочек выше единицы и без тонального сжатия — их подхватывает свечение ночного кадра
  const bulbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a0').multiplyScalar(2.6), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 8, 6), bulbMat, 20);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 20; i++) {
    const side = i < 10 ? 1 : -1;
    const u = (i % 10) / 9;
    m4.makeTranslation((-0.12 + u * 0.56) * len, 0.355 * len, side * 0.165 * len);
    bulbs.setMatrixAt(i, m4);
  }
  bulbs.scale.setScalar(1 / len);
  boat.add(bulbs);
  out.tour = true;
  const p = new THREE.Vector3();
  const q = new THREE.Vector3();
  return {
    bulbs: bulbs.material,
    step(t) {
      const u = ((t * 3.2) / L) % 1; // 3,2 м/с
      curve.getPointAt(u, p);
      curve.getPointAt((u + 0.002) % 1, q);
      const vx = q.x - p.x;
      const vz = q.z - p.z;
      boat.position.set(p.x, -0.45 + waveH(p.x, p.z, t) * 0.7, p.z);
      out.tourAt = [p.x, p.z];
      boat.rotation.set(Math.sin(t * 0.8) * 0.01, Math.atan2(vz, -vx), Math.sin(t * 0.6 + 1) * 0.015, 'YXZ');
    }
  };
}

/** Строит всё, что есть у локации. Возвращает { update(dt, t, camera), setNight(n), state(), onSound }. */
export function buildCritters(scene) {
  const out = {};
  const steps = [];
  const ships = [];
  let tour = null;
  let caimans = null;
  let night = 0;
  const api = {
    /** Звук от живности: (имя звука, x, z). Игра вешает сюда свои звуки. */
    onSound: null,
    state: () => ({ ...out }),
    setNight(n) {
      night = n;
      for (const s of ships) if (s.bulb) s.bulb.opacity = Math.max(0, n - 0.15) * 1.1;
      if (tour) tour.bulbs.opacity = Math.max(0, n - 0.1) * 1.2;
    },
    update(dt, t, camera) {
      const cam = camera ? camera.position : null;
      for (const f of steps) f(t, cam);
      if (caimans) caimans.step(t, cam);
      if (tour) tour.step(t);
      for (const s of ships) {
        const y = waveH(s.x, s.z, t);
        s.o.position.y = y - s.draft;
        s.o.rotation.x = Math.sin(t * 0.55 + s.ph) * 0.02;
        s.o.rotation.z = Math.sin(t * 0.43 + s.ph * 2) * 0.03;
      }
    }
  };
  if (window.RYBAK_OFFLINE) return api;
  const has = (id) => !!modelInfo(id);
  const fail = () => {};
  loadManifest().then(() => {
    const L = LOC_ID;
    if ((L === 'cascade' || L === 'mangrove') && has('fauna-ara')) loadModel('fauna-ara').then((tpl) => { const f = buildParrots(scene, tpl, out); if (f) steps.push(f); }, fail);
    if ((L === 'cascade' || L === 'mangrove') && has('fauna-tukan')) loadModel('fauna-tukan').then((tpl) => steps.push(buildToucans(scene, tpl, out)), fail);
    if (L === 'mangrove' && has('fauna-flamingo')) loadModel('fauna-flamingo').then((tpl) => { const f = buildFlamingos(scene, tpl, out); if (f) steps.push(f); }, fail);
    if ((L === 'keys' || L === 'blue') && has('fauna-turtle'))
      loadModel('fauna-turtle').then((tpl) => {
        const f = buildTurtles(scene, tpl, out, L === 'keys' ? { n: 5, len: 1.1, cx: 0, cz: -40, R: 75 } : { n: 3, len: 1.2, cx: 0, cz: -40, R: 70 });
        if (f) steps.push(f);
      }, fail);
    if ((L === 'bay' || L === 'keys' || L === 'mangrove') && has('fauna-crab'))
      loadModel('fauna-crab').then((tpl) => steps.push(buildCrabs(scene, tpl, out, { n: L === 'mangrove' ? 6 : 8, cx: HOME.x, cz: HOME.z + 30, R: 70 })), fail);
    if ((L === 'cascade' || L === 'mangrove') && has('fauna-frog')) loadModel('fauna-frog').then((tpl) => steps.push(buildFrogs(scene, tpl, out, { n: 6, cx: -20, cz: 0, R: 60 })), fail);
    if (L === 'mangrove' && has('fauna-caiman'))
      loadModel('fauna-caiman').then((tpl) => {
        caimans = buildCaimans(scene, tpl, out, { n: 2, cx: -10, cz: -60, R: 70 });
        caimans.onDive = (x, z) => api.onSound && api.onSound('caiman', x, z);
      }, fail);
    if (L === 'marina' && has('boat-tour')) loadModel('boat-tour').then((tpl) => (tour = buildTourBoat(scene, tpl, out)), fail);
    if (L === 'bay' && has('boat-trawler'))
      loadModel('boat-trawler').then((tpl) => {
        moored(scene, tpl, ships, -27, -44, 2.3, 14, 1.1, [0.06, 0.47, 0]);
        out.trawler = true;
        api.setNight(night);
      }, fail);
    if ((L === 'bay' || L === 'keys') && has('boat-skiff'))
      loadModel('boat-skiff').then((tpl) => {
        const spots = L === 'bay' ? [[-3.6, -7.5, 0], [-3.6, -15.5, 0.06]] : [[-3.6, -9.5, 0.04]];
        for (const [x, z, ry] of spots) if (canSail(x, z) || groundH(x, z) < -0.4) moored(scene, tpl, ships, x, z, Math.PI / 2 + ry, 4.4, 0.32, null);
        out.skiffs = ships.filter((s) => s.len < 5).length;
      }, fail);
  });
  return api;
}
