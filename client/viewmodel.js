// Руки и удочка от первого лица: живут в пространстве камеры, двигаются по состоянию рыбалки.
import * as THREE from 'three';
import { buildRod, buildNet } from './gear3d.js';
import { ITEMS } from '../shared/data.js';
import { FishLine } from './line.js';
import { Batch, M, G, BATCH_MAT } from './batch.js';
import { loft } from './shapes.js';
import { shade, damp, clamp, lerp } from './util.js';
import { heroTemplate } from './hero.js';
import { FpArms } from './fparms.js';

const GRIP_HERO = new THREE.Vector3(0.17, -0.105, -0.55); // где в кадре катушкодержатель: катушка и обе кисти видны, середина экрана свободна
const ELBOW_R = new THREE.Vector3(0.44, -0.7, -0.08);
const ELBOW_L = new THREE.Vector3(-0.16, -0.72, -0.1);
const HAND_DY = -0.245; // процедурная кисть тоже держит заднюю рукоять, под катушкой
const WRIST_R = new THREE.Vector3(-0.058, 0.135 + HAND_DY, 0.012);
const GRIP_Y = -0.1; // где на рукояти лежит правый кулак: на задней рукояти, сразу под катушкой
const ROLL = 0.8; // удилище довёрнуто вокруг своей оси: катушка видна слева от кисти, как на макете
const qr = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ROLL);
const DEG = Math.PI / 180;
const qy = new THREE.Quaternion();
const qx = new THREE.Quaternion();
const qf = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
const AX = new THREE.Vector3(1, 0, 0);
const AY = new THREE.Vector3(0, 1, 0);
const AZ = new THREE.Vector3(0, 0, 1);
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const v3 = new THREE.Vector3();
const v4 = new THREE.Vector3();
const v5 = new THREE.Vector3();
const m4 = new THREE.Matrix4();
// левая рука героя: локоть (x, y, z), куда смотрит тыл кисти (x, y, z), на сколько пальцы дальше середины кулака
const LEFT = [-0.42, -0.62, -0.12, 0.1, 0.35, 1, 0.05];
// Подсак в кадре: где левый кулак на его рукояти, на сколько он опущен под кадр, пока сетка не поднята,
// куда от обруча идёт ручка (к кулаку у нижнего левого края) и куда смотрит обруч — вверх и к нам: в сетку заглядываем.
const NET_FIST = new THREE.Vector3(-0.42, -0.3, -0.6);
const NET_DROP = new THREE.Vector3(0.08, -0.9, 0.2);
const NET_AXIS = new THREE.Vector3(-0.598, -0.717, 0.359).normalize();
const NET_FACE = new THREE.Vector3(0, 0.552, 0.834);
const NET_ELBOW = new THREE.Vector3(-0.52, -0.78, -0.02);
// Улов на леске: поза удилища (кончик виден вверху, над левой половиной кадра) и во сколько раз рыба крупнее обычного показа —
// она висит в двух метрах от глаз, а не на расстоянии вытянутой руки.
export const HANG_K = 2.4;

// Сияние за пойманной рыбой: мягкое свечение, вращающиеся лучи, искры и расходящееся кольцо. Цвет и сила — по редкости.
const AURA_FRAG = /* glsl */ `
uniform vec3 uCol;
uniform float uK, uRays, uT, uPulse;
varying vec2 vUv;
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
void main() {
  vec2 q = vUv * 2.0 - 1.0;
  float r = length(q);
  float a = atan(q.y, q.x);
  float glow = exp(-r * 4.6) * 0.5 + exp(-r * 11.0) * 0.5;
  // два слоя лучей, вращаются навстречу
  float r1 = pow(abs(sin(a * 7.0 + uT * 0.5)), 6.0);
  float r2 = pow(abs(sin(a * 11.0 - uT * 0.33 + 1.3)), 10.0);
  float rays = (r1 * 0.7 + r2 * 0.5) * smoothstep(1.0, 0.15, r) * smoothstep(0.02, 0.3, r) * uRays;
  // кольцо-вспышка в момент, когда рыба оказалась в руках
  float ring = smoothstep(0.09, 0.0, abs(r - uPulse * 0.95)) * (1.0 - uPulse) * 1.6;
  // искры: редкие мерцающие точки
  vec2 g = q * 9.0;
  vec2 id = floor(g);
  float rnd = h21(id);
  float tw = pow(max(0.0, sin(uT * (2.0 + rnd * 3.0) + rnd * 40.0)), 8.0);
  float sp = step(0.72, rnd) * smoothstep(0.34, 0.0, length(fract(g) - 0.5 - (vec2(h21(id + 3.1), h21(id + 7.7)) - 0.5) * 0.5)) * tw * smoothstep(1.0, 0.3, r) * (0.4 + uRays);
  float v = (glow * 0.42 + rays * 0.62 + ring + sp * 1.5) * uK;
  gl_FragColor = vec4(mix(uCol, vec3(1.0), clamp(glow * 0.35 + sp, 0.0, 0.8)) * v, v * 0.6);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const VM_TAN = Math.tan((62 * Math.PI) / 360); // угол обзора, под который поставлены руки

export class ViewModel {
  constructor(camera) {
    this.camera = camera;
    this.root = new THREE.Group();
    camera.add(this.root);
    this.pivot = new THREE.Group();
    this.root.add(this.pivot);
    this.fishSlot = new THREE.Group();
    this.fishSlot.position.set(-0.2, -0.1, -0.78);
    this.root.add(this.fishSlot);
    this.auraU = { uCol: { value: new THREE.Color('#ffffff') }, uK: { value: 0 }, uRays: { value: 0 }, uT: { value: 0 }, uPulse: { value: 1 } };
    this.auraMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.7),
      new THREE.ShaderMaterial({
        uniforms: this.auraU,
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: AURA_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        premultipliedAlpha: true
      })
    );
    this.auraMesh.position.set(0, 0.02, -0.35);
    this.auraMesh.renderOrder = 5;
    this.auraMesh.visible = false;
    this.fishSlot.add(this.auraMesh);
    this.auraK = 0;
    // подсак (его держит левая рука) и гнездо для рыбы в нём; леска, на которой улов висит под кончиком удилища
    this.net = buildNet();
    this.net.group.visible = false;
    this.root.add(this.net.group);
    this.netSlot = new THREE.Group();
    this.root.add(this.netSlot);
    this.netK = 0; // 0 — подсак под кадром, 1 — поднят
    this.handK = 0; // 0 — левая рука на катушке, 1 — на ручке подсака
    this.hangLine = new FishLine(this.root);
    this.show = null; // что сейчас показываем: { net, s, hoop, heavy } — см. Fishing.land
    this.swX = 0;
    this.swV = 0;
    this.rod = null;
    this.hands = [];
    this.arms = null; // руки готового героя (fparms.js)
    this.p = { th: 54, be: 0.24, ox: 0, oy: 0, oz: 0, bend: 0.03, side: 0 };
    this.t = 0;
    this.walk = 0;
    this.crank = 2.4; // в покое ручка катушки внизу — кисть не закрывает шпулю
    this.swayX = 0;
    this.swayY = 0;
  }
  setVisible(v) {
    this.root.visible = v;
  }
  /** Сияние за уловом. color: цвет редкости, power: 0 — обычная рыба … 4 — легендарная; null — погасить. */
  setAura(color, power = 0) {
    if (!color) {
      this.auraK = 0;
      return;
    }
    this.auraU.uCol.value.set(color);
    this.auraK = [0.34, 0.55, 0.78, 1.0, 1.3][power] ?? 0.34;
    this.auraU.uRays.value = [0, 0.3, 0.6, 0.85, 1.1][power] ?? 0;
    this.auraU.uPulse.value = 0;
    this.auraMesh.visible = true;
  }

  /** Показ улова: sh — как в Fishing.land ({ net, s, hoop, heavy, … }); null — убрать. */
  present(sh) {
    this.show = sh;
    this.hangLine.hide();
    this.fishSlot.position.set(-0.2, -0.1, -0.78);
    const hang = sh && !sh.net;
    // сияние стоит за рыбой: на леске она в двух метрах и крупнее, в подсаке — ближе
    this.auraMesh.position.set(0, hang ? -sh.s * 0.5 : 0.02, hang ? -0.6 : -0.35);
    this.auraMesh.scale.setScalar(hang ? 2.3 : 1.15);
    if (hang) {
      this.swX = -0.16; // прилетела по дуге — качнулась
      this.swV = 0.5;
    }
    if (sh && sh.net) this.net.setSize(sh.hoop);
  }

  setLook(look) {
    for (const h of this.hands) {
      h.parent.remove(h);
      if (h.geometry) h.geometry.dispose();
    }
    this.hands = [];
    const gl = look.gloves;
    const sk = look.skin;
    const cBack = gl ? look.gloveC : sk;
    const cTip = gl === 2 ? look.gloveC : sk;
    const long = look.top !== 3;
    const sleeve = look.top === 2 ? look.topC2 : look.topC;
    const add = (parent, batch) => {
      const m = batch.build(BATCH_MAT, false);
      parent.add(m);
      this.hands.push(m);
      return m;
    };
    // правая кисть обхватывает рукоять над катушкой
    const R = new Batch();
    for (let i = 0; i < 4; i++) {
      const y = 0.144 + i * 0.0265;
      const s = 0.054 - (i === 3 ? 0.004 : 0);
      R.add(G.torus(0.44, 10, Math.PI), cBack, M(0, y, 0, s, s, s, Math.PI / 2, -Math.PI / 2, 0));
      R.add(G.torus(0.44, 10, Math.PI), cTip, M(0, y, 0, s, s, s, Math.PI / 2, Math.PI / 2, 0));
    }
    R.add(G.sph(14, 10), cBack, M(-0.036, 0.182, -0.004, 0.064, 0.122, 0.08));
    R.add(G.sph(10, 8), cBack, M(-0.026, 0.2, -0.028, 0.044, 0.064, 0.04));
    R.add(G.sph(10, 8), cTip, M(-0.004, 0.232, -0.03, 0.031, 0.062, 0.03, 0.25, 0, 0));
    if (gl) R.add(G.box(), shade(look.gloveC, 0.45), M(-0.066, 0.186, -0.02, 0.01, 0.06, 0.04, 0, 0, 0.1));
    add(this.pivot, R).position.y = HAND_DY;
    // предплечья: от запястья к локтю за кадром
    const fore = (color, cuff) => {
      const B = new Batch();
      const g = loft([[0, 0.036, 0.034], [0.07, 0.04, 0.038], [0.5, 0.052, 0.05], [1, 0.06, 0.058]], 14);
      g.rotateX(Math.PI / 2);
      B.add(g, color, M(0, 0, 0));
      const c = loft([[0.0, 0.043, 0.041], [0.075, 0.046, 0.044]], 14, 2, false);
      c.rotateX(Math.PI / 2);
      B.add(c, cuff, M(0, 0, 0));
      return add(this.root, B);
    };
    const armC = long ? sleeve : sk;
    const cuffC = long ? shade(sleeve, -0.2) : gl ? shade(look.gloveC, 0.3) : sk;
    this.foreR = fore(armC, cuffC);
    this.foreL = fore(armC, cuffC);
    // левая кисть держит ручку катушки
    const L = new Batch();
    L.add(G.sph(14, 10), cBack, M(0, 0, 0, 0.078, 0.068, 0.09));
    for (let i = 0; i < 4; i++) L.add(G.sph(8, 6), cTip, M(0.02, -0.014, -0.034 + i * 0.022, 0.032, 0.036, 0.026));
    L.add(G.sph(8, 6), cTip, M(0.028, 0.02, -0.02, 0.03, 0.03, 0.06, 0, 0.3, 0));
    this.handL = add(this.root, L);
    this.look = look;
    // у готового героя — его собственные руки; процедурные остаются запасными (свой персонаж из частей, модель ещё грузится)
    if (this.arms) {
      this.root.remove(this.arms.space);
      this.arms = null;
    }
    const tpl = look.hero ? heroTemplate(look.hero) : null;
    if (tpl) {
      this.arms = new FpArms(tpl);
      this.root.add(this.arms.space);
      for (const h of this.hands) h.visible = false;
    }
  }

  setRod(rodId, reelId, lineId) {
    if (this.rod) {
      this.pivot.remove(this.rod.group);
      this.rod.group.traverse((o) => o.isMesh && o.geometry && o.geometry.dispose && o.userData.own && o.geometry.dispose());
    }
    this.hangLine.setColor((ITEMS[lineId] || {}).col || '#e8f4ff');
    this.rod = buildRod(rodId, reelId, lineId, 1);
    this.rod.group.traverse((o) => {
      if (o.isMesh) o.castShadow = false;
    });
    this.pivot.add(this.rod.group);
  }

  /** st: { mode, power, castK, tension, steer, reel, speed, lookDX, lookDY, pull } */
  update(dt, st) {
    if (!this.rod || !this.handL) return;
    this.t += dt;
    // У рук и удочки «свой» угол обзора: какой бы ни был выбран в настройках, в кадре они такие же, как при обычном.
    // Иначе широкий угол отодвигал руки от камеры и показывал, где они кончаются у плеча.
    const fk = Math.tan((this.camera.fov * Math.PI) / 360) / VM_TAN;
    this.root.scale.set(fk, fk, 1);
    if (this.auraMesh.visible) {
      const u = this.auraU;
      u.uT.value += dt;
      u.uPulse.value = Math.min(1, u.uPulse.value + dt * 1.7);
      u.uK.value = damp(u.uK.value, this.auraK, this.auraK ? 9 : 7, dt);
      if (!this.auraK && u.uK.value < 0.01) this.auraMesh.visible = false;
    }
    const t = this.t;
    const P = { th: 54, be: 0.24, ox: 0, oy: 0, oz: 0, bend: 0.04, side: 0 };
    let fast = false;
    switch (st.mode) {
      case 'charge': {
        const k = clamp(st.power, 0, 1);
        P.th = 54 - 64 * k;
        P.be = 0.24 - 0.1 * k;
        P.ox = 0.05 * k;
        P.oy = 0.03 * k;
        P.oz = 0.06 * k;
        break;
      }
      case 'cast': {
        const k = clamp(st.castK, 0, 1);
        const e = 1 - (1 - k) * (1 - k);
        P.th = -10 + 96 * e;
        P.be = 0.12;
        P.oy = 0.03 * (1 - e);
        P.bend = -0.25 * Math.sin(k * Math.PI);
        fast = true;
        break;
      }
      case 'wait':
        P.th = 64 + Math.sin(t * 0.9) * 0.8;
        P.be = 0.1;
        break;
      case 'bite':
        P.th = 61 + Math.sin(t * 40) * 1.5;
        P.be = 0.1;
        P.bend = 0.3;
        break;
      case 'fight': {
        const T = st.tension || 0;
        P.th = 46 - 16 * T + Math.sin(t * 31) * T * 0.9;
        P.be = 0.1 - (st.steer || 0) * 0.3;
        P.oy = 0.03 + T * 0.02;
        P.bend = 0.28 + 0.72 * T;
        P.side = -(st.steer || 0) * 0.6 - (st.pull || 0) * 0.5;
        // при вываживании руки опускаем, чтобы середина экрана оставалась свободной
        P.ox += 0.05;
        P.oy -= 0.075;
        // толчок: на подсечке удилище идёт вверх, на рывке рыба дёргает его к воде; трясун мелко бьёт кончиком
        if (st.kick) {
          P.th += st.kick * 10;
          P.bend += Math.abs(st.kick) * 0.3;
        }
        if (st.shake) {
          P.th += Math.sin(t * 43) * 1.3 * st.shake;
          P.side += Math.sin(t * 37) * 0.4 * st.shake;
        }
        fast = !!st.kick && Math.abs(st.kick) > 0.5;
        break;
      }
      case 'landed':
        if (st.net) {
          // улов в подсаке: удилище отведено вправо, чтобы не мешать
          P.th = 36;
          P.be = -0.5;
          P.ox = 0.1;
          P.oy = -0.05;
        } else {
          // улов на леске: удилище поднято вперёд, кончик согнут весом и виден вверху кадра
          const hv = this.show ? this.show.heavy : 0.4;
          P.th = 44;
          P.be = 0.3;
          P.ox = 0.04;
          P.oy = -0.07; // руки ниже: левая кисть на катушке не закрывает рыбу
          P.bend = 0.55 + 0.45 * hv + Math.abs(this.swX) * 0.5;
          P.side = -this.swX * 1.2;
        }
        break;
      default:
        break;
    }
    const sp = Math.min(1, (st.speed || 0) / 3);
    if (sp > 0.02) this.walk += dt * (5 + sp * 5);
    P.ox += Math.sin(this.walk) * 0.007 * sp;
    P.oy += Math.abs(Math.cos(this.walk)) * 0.009 * sp + Math.sin(t * 1.5) * 0.002;
    // лёгкое отставание удочки при повороте головы
    this.swayX = damp(this.swayX, clamp((st.lookDX || 0) * 0.02, -0.06, 0.06), 10, dt);
    this.swayY = damp(this.swayY, clamp((st.lookDY || 0) * 0.02, -0.05, 0.05), 10, dt);
    const p = this.p;
    const k = fast ? 40 : 14;
    for (const key in P) p[key] = damp(p[key], P[key], key === 'bend' || key === 'side' ? 18 : k, dt);
    const GP = GRIP_HERO;
    this.pivot.position.set(GP.x + p.ox - this.swayX * 0.3, GP.y + p.oy + this.swayY * 0.3, GP.z + p.oz);
    qy.setFromAxisAngle(AY, p.be + this.swayX);
    qx.setFromAxisAngle(AX, -p.th * DEG + this.swayY);
    this.pivot.quaternion.copy(qy).multiply(qx).multiply(qf).multiply(qr);
    this.rod.setBend(p.bend, p.side);
    if (st.reel) this.crank += dt * (st.mode === 'fight' ? 13 : 9);
    this.rod.handle.rotation.x = this.crank;
    // предплечья
    v1.copy(WRIST_R).applyQuaternion(this.pivot.quaternion).add(this.pivot.position);
    this.foreR.position.copy(v1);
    this.foreR.lookAt(v2.copy(ELBOW_R).applyMatrix4(this.root.matrixWorld));
    this.foreR.scale.set(1, 1, v1.distanceTo(ELBOW_R));
    // левая рука — на ручке катушки
    v1.copy(this.rod.knob).applyAxisAngle(AX, this.crank).add(this.rod.handle.position);
    v1.applyQuaternion(this.pivot.quaternion).add(this.pivot.position);
    v1.x -= 0.03;
    v1.y -= 0.012;
    this.handL.position.copy(v1);
    this.handL.rotation.set(0.2, 0.5, -0.5);
    v2.set(v1.x - 0.02, v1.y - 0.028, v1.z + 0.04);
    this.foreL.position.copy(v2);
    this.foreL.lookAt(v1.copy(ELBOW_L).applyMatrix4(this.root.matrixWorld));
    this.foreL.scale.set(1, 1, v2.distanceTo(ELBOW_L));
    // ── показ улова ──
    const sh = this.show;
    const landed = st.mode === 'landed';
    const wantNet = landed && !!st.net;
    this.handK = damp(this.handK, wantNet ? 1 : 0, wantNet ? 10 : 14, dt);
    this.netK = damp(this.netK, wantNet && st.held ? 1 : 0, wantNet ? 6.5 : 12, dt);
    const netOn = this.netK > 0.004 || this.handK > 0.02;
    const net = this.net.group;
    net.visible = netOn;
    this.netSlot.visible = netOn;
    let fist = null; // где левый кулак, если он на ручке подсака
    if (netOn) {
      const e = this.netK * this.netK * (3 - 2 * this.netK);
      // оси сетки: Z — вдоль ручки к кулаку, Y — из обруча наружу (вверх и к нам), X — поперёк
      v2.copy(NET_AXIS);
      v3.copy(NET_FACE).addScaledVector(v2, -NET_FACE.dot(v2)).normalize();
      v5.crossVectors(v3, v2);
      net.quaternion.setFromRotationMatrix(m4.makeBasis(v5, v3, v2));
      // сетка поднимается из-под кадра; с рыбой её чуть водит
      v4.copy(NET_FIST).addScaledVector(NET_DROP, 1 - e).addScaledVector(v2, -this.net.grip());
      v4.y += Math.sin(t * 2.1) * 0.006 * e;
      v4.x += Math.sin(t * 1.3) * 0.004 * e;
      net.position.copy(v4);
      // гнездо для рыбы: та же плоскость обруча, но рыба лежит в ней поперёк кадра, а не поперёк ручки
      v1.set(1, 0, 0).addScaledVector(v3, -v3.x).normalize();
      v5.crossVectors(v1, v3);
      this.netSlot.quaternion.setFromRotationMatrix(m4.makeBasis(v1, v3, v5));
      this.netSlot.position.copy(v4);
      if (landed && st.held && sh && sh.net) this.fishSlot.position.copy(v4).addScaledVector(v3, -0.1); // сияние — за сеткой
      fist = v4.addScaledVector(v2, this.net.grip()); // v4 теперь — кулак на рукояти
    }
    if (landed && !st.net && sh && !sh.net) {
      // Рыба на леске: гнездо (рот рыбы) — под кончиком удилища, качается маятником и откликается на поворот головы.
      this.rod.tip.getWorldPosition(v1);
      this.root.worldToLocal(v1);
      const acc = -8.5 * this.swX - 1.5 * this.swV - clamp((st.lookDX || 0) * 0.05, -3, 3);
      this.swV += acc * dt;
      this.swX = clamp(this.swX + this.swV * dt, -0.3, 0.3);
      const mouthY = Math.min(v1.y - 0.2, -0.1 + sh.s * 0.5);
      if (st.held) {
        this.fishSlot.position.set(v1.x + this.swX, mouthY + Math.abs(this.swX) * 0.12, v1.z);
        this.hangLine.set(v1, this.fishSlot.position, 0, -99);
      } else this.fishSlot.position.set(v1.x, mouthY, v1.z); // сюда рыба прилетит
    }
    if (fist) {
      // процедурная левая кисть — тоже на ручке подсака
      const k = this.handK;
      this.handL.position.lerp(fist, k);
      v2.set(this.handL.position.x - 0.02, this.handL.position.y - 0.028, this.handL.position.z + 0.04);
      this.foreL.position.copy(v2);
      this.foreL.lookAt(v1.copy(ELBOW_L).applyMatrix4(this.root.matrixWorld));
      this.foreL.scale.set(1, 1, v2.distanceTo(ELBOW_L));
    }
    if (this.arms) {
      // правый кулак — на рукояти над катушкой, большой палец к кончику удилища
      v1.set(0, GRIP_Y, 0).applyQuaternion(this.pivot.quaternion).add(this.pivot.position);
      v2.copy(AY).applyQuaternion(this.pivot.quaternion);
      this.arms.arm('R', v1, v2, ELBOW_R);
      // левый — на ручке катушки, ходит по кругу вместе с ней…
      v1.copy(this.rod.knob).applyAxisAngle(AX, this.crank).add(this.rod.handle.position).applyQuaternion(this.pivot.quaternion).add(this.pivot.position);
      const lh = LEFT;
      if (fist && this.handK > 0.5) {
        // …а с подсаком — сжат на его рукояти, большой палец к обручу
        const k = (this.handK - 0.5) * 2;
        v1.lerp(fist, k);
        this.arms.arm('L', v1, v2.copy(NET_AXIS).negate(), v3.set(lh[0], lh[1], lh[2]).lerp(NET_ELBOW, k));
      } else {
        if (fist) v1.lerp(v3.copy(v1).setY(v1.y - 0.5), this.handK * 2); // рука уходит вниз за подсаком
        this.arms.arm('L', v1, v2.set(lh[3], lh[4], lh[5]), v3.set(lh[0], lh[1], lh[2]), lh[6]); // ручку держим пальцами снизу, тыл кисти — к нам
      }
    }
  }

  tipWorld(out) {
    return this.rod.tip.getWorldPosition(out);
  }
}
