// Лодка напрокат: модель с мотором, ход по воде, качка, след за кормой.
//
// Нос лодки смотрит туда же, куда «вперёд» у игрока (при yaw = 0 — на север, −Z). Рыбак сидит на банке у мотора.
// Лодка у каждого своя: её берут у домашнего пирса, она остаётся за игроком, пока тот не вернёт её обратно.
import * as THREE from 'three';
import { canSail, MOORINGS, WORLD } from './terrain.js';
import { waveH } from './water.js';
import { loadManifest } from './hero.js';
import { loadModel, spawn, modelInfo } from './models.js';
import { Batch, M, G, BATCH_MAT } from './batch.js';
import { GLOSS_MAT, METAL_MAT } from './env.js';
import { patchModel } from './surface.js';
import { clamp, damp, angDiff } from './util.js';
import { makePennant, wind } from './flags.js';

export const BOAT_PRICE = 30; // монет за выход; первый выход бесплатный
const LEN = 4.3; // длина корпуса, м
const DRAFT = 0.5; // осадка: настолько киль ниже воды
const BENCH = 1.14; // высота средней банки над килем
const SEAT_Z = 0.17; // банка чуть ближе к корме от середины
const RIM = 1.31; // высота борта над килем
const STERN = 1.5; // верх транца над килем
// Корпуса. Моторка — готовая модель локации: мотор у неё свой. Сидеть на её кормовой банке нельзя — колпак мотора
// оказывается у самого лица и закрывает вид назад, — поэтому посреди кокпита кладём свою доску-банку (thwart —
// её ширина), как на прежней лодке. Вёсельная лодка с приставным мотором — прежняя модель; она же (и корпус
// из кода) — запасные, пока моторка грузится.
// len — длина, draft — осадка, bench — высота банки над килем, seatX/seatZ — где сидит рыбак (вправо и к корме
// от середины), rot — как повернуть модель носом к −Z, motor — нужен ли приставной мотор.
// pass — места пассажиров (друзья садятся в чужую лодку): [вправо, к корме] от середины; оба — на передней банке,
// по бортам, так что хозяину между ними виден нос. passZ, passW — где лежит передняя банка и её ширина.
const HULLS = {
  'env-motorboat': { len: 4.6, draft: 0.34, bench: 1.0, seatX: 0, seatZ: 0.25, rot: Math.PI / 2, motor: false, thwart: 1.7, pass: [[-0.56, -0.9], [0.56, -0.9]], passZ: -0.9, passW: 1.56, bow: [1.12, -2.0] },
  'prop-boat': { len: LEN, draft: DRAFT, bench: BENCH, seatX: 0, seatZ: SEAT_Z, rot: -Math.PI / 2, motor: true, pass: [[-0.46, -1.05], [0.46, -1.05]], bow: [RIM - 0.04, -LEN / 2 + 0.35] }
};
// bow — где на носу стоит шест с вымпелом у своей (купленной) лодки: [высота над килем, к носу от середины]
export const BOAT_SEATS = 2; // сколько пассажиров берёт лодка
export const VMAX = 12.5; // полный ход, м/с
const VREV = 3.2; // задний ход
const BUMP_AT = 2.1; // от середины лодки до места, которым она ударяется о преграду, м

/** Простой корпус, пока модель не загрузилась (и в пробной версии без моделей). */
function fallbackHull() {
  const g = new THREE.Group();
  const B = new Batch();
  B.auto = true;
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#efe7d2', roughness: 0.8, side: THREE.DoubleSide }));
  m.scale.set(1.1, RIM - 0.02, LEN / 2);
  m.position.y = RIM;
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  B.add(G.torus(0.05, 28), '#d9463b', M(0, RIM, 0, 2.2, LEN, 1.6, Math.PI / 2, 0, 0), { mat: 0 });
  B.add(G.box(), '#a8733f', M(0, 0.7, 0.1, 1.5, 0.05, 3.0)); // пайол
  B.add(G.box(), '#b97c42', M(0, BENCH - 0.03, SEAT_Z, 1.86, 0.06, 0.5));
  B.add(G.box(), '#b97c42', M(0, BENCH + 0.08, -1.45, 1.2, 0.06, 0.6));
  g.add(B.build(BATCH_MAT, true));
  return g;
}
/** Брусок со скруглёнными рёбрами (единичный): k — насколько он близок к шару. */
let _round = null;
function roundBox(k = 0.45) {
  if (_round) return _round;
  const g = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    n.copy(v).normalize().multiplyScalar(0.62);
    v.lerp(n, k);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return (_round = g);
}
/** Подвесной мотор. Начало координат — верх транца: колпак над ним, нога с винтом за кормой, румпель смотрит в лодку. */
function outboard() {
  const g = new THREE.Group();
  const gl = new Batch();
  const me = new Batch();
  const B = new Batch();
  // колпак: тёмно-синий, обтекаемый, с белой и красной полосой — в цвет борта
  gl.add(roundBox(), '#24405f', M(0, 0.4, 0.1, 0.31, 0.36, 0.54));
  gl.add(G.box(), '#f4f1e8', M(0, 0.27, 0.1, 0.3, 0.05, 0.52), { mat: 0 });
  gl.add(G.box(), '#d9463b', M(0, 0.22, 0.1, 0.3, 0.035, 0.52), { mat: 0 });
  gl.add(G.box(), '#1c2129', M(0, 0.12, 0.1, 0.24, 0.2, 0.38));
  // струбцина на транце, нога, плита над винтом, редуктор, перо
  B.add(G.box(), '#262b33', M(0, -0.05, 0.0, 0.26, 0.24, 0.14), { mat: 0 });
  B.add(G.box(), '#262b33', M(0, -0.62, 0.13, 0.09, 1.4, 0.17), { mat: 0 });
  B.add(G.box(), '#262b33', M(0, -1.2, 0.17, 0.24, 0.025, 0.4), { mat: 0 });
  B.add(G.sph(10, 8), '#262b33', M(0, -1.35, 0.15, 0.14, 0.14, 0.44), { mat: 0 });
  B.add(G.box(), '#262b33', M(0, -1.48, 0.15, 0.02, 0.16, 0.2), { mat: 0 });
  // румпель с рукояткой
  B.add(G.cyl(7), '#262b33', M(0, 0.22, -0.34, 0.05, 0.7, 0.05, Math.PI / 2 - 0.1, 0, 0), { mat: 0 });
  B.add(G.cyl(8), '#d9463b', M(0, 0.26, -0.72, 0.07, 0.18, 0.07, Math.PI / 2 - 0.1, 0, 0), { mat: 0 });
  g.add(gl.build(GLOSS_MAT, true), B.build(BATCH_MAT, true));
  // винт крутится отдельно
  for (let i = 0; i < 3; i++) me.add(G.box(), '#d5b25a', M(Math.cos((i / 3) * 6.283) * 0.08, Math.sin((i / 3) * 6.283) * 0.08, 0, 0.14, 0.06, 0.014, 0, 0, (i / 3) * 6.283));
  const prop = me.build(METAL_MAT, false);
  prop.position.set(0, -1.35, 0.39);
  g.add(prop);
  g.userData.prop = prop;
  return g;
}

const _v = new THREE.Vector3();

/** Лодка на воде: только картинка. Ею пользуются и своя лодка, и лодки друзей. */
export class BoatVisual {
  constructor(scene) {
    this.scene = scene;
    const g = (this.group = new THREE.Group());
    g.rotation.order = 'YXZ';
    this.hull = fallbackHull();
    g.add(this.hull);
    this.motor = outboard();
    this.motor.rotation.x = 0.15; // нога чуть подвёрнута под корму, как на настоящем транце
    this.motor.position.set(0, RIM, LEN / 2 - 0.06);
    g.add(this.motor);
    scene.add(g);
    this.pitch = 0;
    this.roll = 0;
    this.y = 0;
    this.spin = 0;
    this.model = false;
    this.spec = HULLS['prop-boat'];
    // берём лучшую модель из тех, что есть; не загрузилась — следующую
    const tryHull = (ids) => {
      const id = ids.find((k) => modelInfo(k));
      if (!id || this.gone) return;
      loadModel(id).then(
        (tpl) => {
          if (this.gone) return;
          const spec = HULLS[id];
          if (!tpl.patched) {
            tpl.patched = true;
            tpl.scene.traverse((c) => c.isMesh && patchModel(c.material));
          }
          const o = spawn(tpl);
          o.rotation.y = spec.rot;
          o.scale.setScalar(spec.len);
          g.remove(this.hull);
          this.hull = o;
          g.add(o);
          if (spec.thwart) {
            const B = new Batch();
            B.add(G.box(), '#b5722f', M(0, spec.bench - 0.035, spec.seatZ, spec.thwart, 0.07, 0.36), { mat: 1 });
            if (spec.passW) B.add(G.box(), '#b5722f', M(0, spec.bench - 0.035, spec.passZ, spec.passW, 0.07, 0.34), { mat: 1 }); // банка для пассажиров
            o.userData.thwart = B.build(BATCH_MAT, true);
            g.add(o.userData.thwart);
          }
          this.spec = spec;
          this.motor.visible = spec.motor;
          if (spec.motor) this.motor.position.set(0, STERN - 0.02, LEN / 2 - 0.1);
          this.model = id;
          this.dress();
        },
        () => tryHull(ids.filter((k) => k !== id))
      );
    };
    loadManifest().then(() => tryHull(['env-motorboat', 'prop-boat']));
  }
  /**
   * Чья лодка. Прокатная — без примет (color = null). Своя — с вымпелом на носу и подушками на банках цвета хозяина
   * (цвет его метки на карте): друзья издалека видят, чья лодка идёт.
   */
  setOwner(color) {
    color = color || null;
    if (color === this.owner) return;
    this.owner = color;
    this.dress();
  }
  /** Вымпел и подушки — по нынешнему корпусу (он меняется, когда догружается модель). */
  dress() {
    const g = this.group;
    for (const k of ['pennant', 'cushion']) {
      const o = this[k];
      if (!o) continue;
      g.remove(o);
      o.geometry.dispose();
      if (k === 'pennant') o.material.dispose();
      this[k] = null;
    }
    const c = this.owner;
    if (!c) return;
    const s = this.spec;
    this.pennant = makePennant(0.78, 0.66, 0.36, [c, '#ffffff', c]);
    this.pennant.position.set(0, s.bow[0], s.bow[1]);
    g.add(this.pennant);
    if (s.thwart) {
      const B = new Batch();
      B.add(G.box(), c, M(0, s.bench + 0.025, s.seatZ, s.thwart * 0.42, 0.055, 0.31), { mat: 5 }); // ткань
      if (s.passW) for (const p of s.pass) B.add(G.box(), c, M(p[0], s.bench + 0.025, p[1], 0.42, 0.055, 0.29), { mat: 5 });
      this.cushion = B.build(BATCH_MAT, true);
      g.add(this.cushion);
    }
  }
  /** Ставит лодку: x, z — середина, yaw — куда смотрит нос; k — ход от −1 до 1, lean — руль от −1 до 1. */
  pose(x, z, yaw, t, k = 0, lean = 0, dt = 0.016) {
    const g = this.group;
    const sn = Math.sin(yaw);
    const cs = Math.cos(yaw);
    // качка: высота воды под носом, кормой и бортами
    const hb = waveH(x - sn * 1.6, z - cs * 1.6, t);
    const hs = waveH(x + sn * 1.6, z + cs * 1.6, t);
    const hl = waveH(x - cs * 0.8, z + sn * 0.8, t);
    const hr = waveH(x + cs * 0.8, z - sn * 0.8, t);
    const kk = Math.min(1, dt * 7);
    const sp = Math.abs(k);
    this.y += ((hb + hs + hl + hr) / 4 - this.y) * kk;
    // на ходу нос приподнят и лодку слегка потряхивает; в повороте она кренится внутрь
    this.pitch += ((hb - hs) / 3.2 + 0.06 * Math.max(0, k) + Math.sin(t * 9) * 0.01 * sp - this.pitch) * kk;
    this.roll += ((hr - hl) / 1.6 - lean * 0.15 + Math.sin(t * 1.3 + x) * 0.012 - this.roll) * kk;
    g.position.set(x, this.y - this.spec.draft + sp * 0.07, z);
    g.rotation.set(this.pitch, yaw, this.roll);
    this.motor.rotation.y = lean * 0.45;
    this.spin += dt * (6 + sp * 70) * (k < 0 ? -1 : 1);
    this.motor.userData.prop.rotation.z = this.spin;
    if (this.pennant) {
      // стоит — вымпел смотрит по ветру, как флаги на берегу; на ходу его вытягивает встречным потоком к корме
      const go = Math.min(1, sp * 3);
      const still = wind.dir - yaw;
      this.pennant.rotation.y = still + angDiff(still, k < 0 ? Math.PI / 2 : -Math.PI / 2) * go;
      // на воде всегда тянет ветерок: короткий вымпел в штиль не висит тряпочкой вдоль шеста, как большой флаг на берегу
      this.pennant.userData.wind.value = Math.max(wind.k, go, 0.75);
    }
  }
  /** Точка на банке, где сидит рыбак (в мире). */
  seat(out) {
    const s = this.spec;
    return out.set(s.seatX, s.bench, s.seatZ).applyQuaternion(this.group.quaternion).add(this.group.position);
  }
  /** Место в лодке: 0 — рыбак-хозяин, 1 и 2 — пассажиры. */
  seatAt(i, out) {
    if (!i) return this.seat(out);
    const s = this.spec;
    const p = s.pass[(i - 1) % s.pass.length];
    return out.set(p[0], s.bench, p[1]).applyQuaternion(this.group.quaternion).add(this.group.position);
  }
  /** Середина лодки по месту рыбака: друг присылает, где сидит, а лодку под ним ставим мы. */
  centre(x, z, yaw, out) {
    const s = this.spec;
    out.x = x - Math.cos(yaw) * s.seatX - Math.sin(yaw) * s.seatZ;
    out.z = z + Math.sin(yaw) * s.seatX - Math.cos(yaw) * s.seatZ;
    return out;
  }
  dispose() {
    this.gone = true;
    this.scene.remove(this.group);
  }
}

/** Корпус лодки (моторка 4,6 × 2,1 м) помещается: нос, середина, корма и оба борта на воде. */
export function hullFits(x, z, yaw) {
  const sn = Math.sin(yaw);
  const cs = Math.cos(yaw);
  return canSail(x, z) && canSail(x - sn * 2.1, z - cs * 2.1) && canSail(x + sn * 2.1, z + cs * 2.1) && canSail(x - cs * 0.9, z + sn * 0.9) && canSail(x + cs * 0.9, z - sn * 0.9);
}

/** Куда встаёт у причала чужая лодка: рядом со своей, борт к борту, дальше от настила. n — место игрока в комнате. */
export function moorSpot(i, n, out) {
  const m = MOORINGS[i] || MOORINGS[0];
  const dx = m.x - m.sx;
  const dz = m.z - m.sz;
  const l = Math.hypot(dx, dz) || 1;
  const k = 2.5 * (1 + (n % 4));
  out.x = m.x + (dx / l) * k;
  out.z = m.z + (dz / l) * k;
  out.yaw = m.yaw;
  return out;
}

/**
 * Место пассажира в лодке друга. Для игрока (player.js) это «лодка, в которой сидим»: где сиденье, куда смотрит нос,
 * насколько она повернула за кадр, её ход и качка. Саму лодку ведёт хозяин — мы видим её с задержкой сети.
 */
export class Ride {
  constructor(id, vis, seat) {
    this.id = id; // чья лодка (номер игрока)
    this.vis = vis;
    this.seatI = seat;
    this.rider = true;
    this.yaw = vis.group.rotation.y;
    this.dyaw = 0;
    this.v = 0;
    this.k = 0;
  }
  /** После того как лодку хозяина поставили в этом кадре: v — её ход. */
  sync(vis, v) {
    this.vis = vis;
    const y = vis.group.rotation.y;
    let d = y - this.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    this.dyaw = d;
    this.yaw = y;
    this.v = v;
    this.k = clamp(v / VMAX, -1, 1);
  }
  seat(out) {
    return this.vis.seatAt(this.seatI, out);
  }
}

/** Своя лодка: управление и состояние проката. */
export class Boat {
  constructor(scene, fx) {
    this.vis = new BoatVisual(scene);
    this.fx = fx;
    this.x = 0;
    this.z = 0;
    this.yaw = 0;
    this.v = 0;
    this.k = 0; // ход от −1 до 1 — для картинки и звука
    this.lean = 0;
    this.dyaw = 0; // на сколько повернули за кадр — на столько же поворачивается взгляд рыбака
    this.rented = false;
    this.away = false; // успели отойти от домашнего пирса: вернёмся — лодка сдаётся
    this.active = false; // рыбак в лодке
    this.moor = 0; // у какого причала стоит; −1 — в море
    this.bump = 0;
    this.onBump = () => {};
    this.toMooring(0);
  }
  toMooring(i) {
    const m = MOORINGS[i];
    this.moor = i;
    this.x = m.x;
    this.z = m.z;
    this.yaw = m.yaw;
    this.v = 0;
    this.dyaw = 0;
    this.active = false;
  }
  /** Отчалить: рыбак в лодке. */
  board() {
    this.active = true;
    this.moor = -1;
    this.v = 0;
    this.dyaw = 0;
  }
  /** Ближайший причал, к которому сейчас можно пристать (−1 — нет такого). */
  mooringNear() {
    if (Math.abs(this.v) > 6) return -1;
    let best = -1;
    let bd = 9;
    MOORINGS.forEach((m, i) => {
      const d = Math.hypot(m.x - this.x, m.z - this.z);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  }
  /** Корпус помещается: нос, середина, корма и оба борта на воде. */
  fits(x, z, yaw) {
    return hullFits(x, z, yaw);
  }
  /** Шаг управления. throttle: 1 — вперёд, −1 — назад; steer: 1 — вправо; brake — леска в воде, глушим ход. */
  drive(dt, throttle, steer, brake = false) {
    const target = throttle > 0 ? VMAX * throttle : VREV * throttle;
    // разгон за пару секунд; без газа лодка ещё катится, но недолго
    const turning = throttle && this.v && Math.sign(target) !== Math.sign(this.v);
    this.v += (target - this.v) * (1 - Math.exp(-dt * (brake ? 1.5 : throttle ? (turning ? 1.7 : 0.75) : 0.5)));
    if (!throttle) {
      const d = (brake ? 1.6 : 0.6) * dt;
      this.v = Math.abs(this.v) <= d ? 0 : this.v - Math.sign(this.v) * d;
    }
    const sp = Math.abs(this.v);
    // руль действует только на ходу; на заднем ходу — наоборот
    const turn = -steer * (0.2 + 0.8 * Math.min(1, sp / 4.5)) * 0.95 * (this.v < -0.1 ? -1 : 1) * Math.min(1, sp / 0.5);
    const yaw = this.yaw + turn * dt;
    const nx = this.x - Math.sin(yaw) * this.v * dt;
    const nz = this.z - Math.cos(yaw) * this.v * dt;
    this.dyaw = 0;
    if (this.fits(nx, nz, yaw)) {
      this.dyaw = yaw - this.yaw;
      this.x = nx;
      this.z = nz;
      this.yaw = yaw;
    } else if (sp < 2 && this.fits(this.x, this.z, yaw)) {
      // стоим у преграды: разворачиваемся на месте
      this.dyaw = yaw - this.yaw;
      this.yaw = yaw;
      this.v *= 0.9;
    } else {
      // упёрлись: удар и отскок
      const edge = nx < WORLD.x0 + 4 || nx > WORLD.x1 - 4 || nz < WORLD.z0 + 4 || nz > WORLD.z1 - 4;
      if (sp > 1.2 && this.bump <= 0) {
        this.bump = 0.6;
        // куда пришёлся удар: носом на переднем ходу, кормой — на заднем
        const s = Math.sign(this.v) * BUMP_AT;
        this.onBump(sp, edge, this.x - Math.sin(this.yaw) * s, this.z - Math.cos(this.yaw) * s);
      }
      this.v = -this.v * 0.3;
    }
    if (this.bump > 0) this.bump -= dt;
    this.k = clamp(this.v / VMAX, -1, 1);
    this.lean = damp(this.lean, steer * Math.min(1, sp / 6), 5, dt);
  }
  /** Картинка, след и брызги. Вызывать каждый кадр, в том числе когда лодка стоит у причала. */
  update(dt, t) {
    if (!this.active) {
      this.v = 0;
      this.k = damp(this.k, 0, 4, dt);
      this.lean = damp(this.lean, 0, 4, dt);
    }
    this.vis.pose(this.x, this.z, this.yaw, t, this.k, this.lean, dt);
    wake(this, this.fx, this.x, this.z, this.yaw, this.v, dt);
  }
  seat(out) {
    return this.vis.seat(out);
  }
  /** Что рассылаем друзьям: 0 — лодки нет, 1 — идём на ней, 2 + i — стоит у причала i. */
  get net() {
    return this.active ? 1 : this.rented ? 2 + this.moor : 0;
  }
}

/** След за кормой и брызги из-под носа. state хранит пройденный путь (поле wakeD). */
export function wake(state, fx, x, z, yaw, v, dt) {
  const sp = Math.abs(v);
  if (!fx || sp < 1) return;
  state.wakeD = (state.wakeD || 0) + sp * dt;
  const sn = Math.sin(yaw);
  const cs = Math.cos(yaw);
  if (state.wakeD > 1.5) {
    state.wakeD = 0;
    const back = v > 0 ? 2.5 : -2.3;
    fx.wake(x + sn * back, z + cs * back, 0.8 + sp * 0.1);
  }
  if (sp > 4.5 && Math.random() < dt * sp * 2.4) {
    // брызги из-под скул
    const side = Math.random() < 0.5 ? -1 : 1;
    const f = Math.sign(v);
    _v.set(x - sn * 1.5 * f + cs * side * 0.7, 0.2, z - cs * 1.5 * f - sn * side * 0.7);
    fx.drop(_v.x, _v.y, _v.z, cs * side * (1.2 + Math.random() * 2) - sn * sp * 0.4 * f, 1.2 + Math.random() * 1.8, -sn * side * (1.2 + Math.random() * 2) - cs * sp * 0.4 * f, 0.035 + Math.random() * 0.035, 0.8);
  }
}
