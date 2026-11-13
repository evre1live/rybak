// Руки героя от первого лица.
//
// Берём ту же модель героя, что видят друзья, и оставляем от неё только руки: остальное отбрасывается в шейдере
// по весам костей. Кости рук ставим «от кисти к плечу»: кулак — на рукоять удилища (или на ручку катушки),
// предплечье уходит к локтю за нижний край кадра, плечо — ещё дальше. Так рукава, перчатки и кожа всегда те же,
// что у выбранного героя, без отдельных моделей рук.
//
// Рука рисуется целиком, до самого плечевого сустава. У героев Tripo плечо привязано не только к своей кости,
// но и к ключице (у Пипа — по всей длине, до локтя), поэтому ключица тоже входит в «руку» и жёстко идёт
// за плечом. Без этого плечо отбрасывалось, и рука обрывалась у локтя прямо в кадре.
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { HERO_TONE, addRim } from './hero.js';

const X = new THREE.Vector3();
const Y = new THREE.Vector3();
const Z = new THREE.Vector3();
const Y2 = new THREE.Vector3();
const Z2 = new THREE.Vector3();
const W = new THREE.Vector3();
const E = new THREE.Vector3();
const S = new THREE.Vector3();
const T = new THREE.Vector3();
const m4 = new THREE.Matrix4();
const mA = new THREE.Matrix4();
const qF = new THREE.Quaternion();
const qH = new THREE.Quaternion();
const qU = new THREE.Quaternion();
const q = new THREE.Quaternion();
const basis = (x, y, z, out) => out.setFromRotationMatrix(m4.makeBasis(x, y, z));

// плечи за кадром (в осях камеры: +X вправо, +Y вверх, −Z вперёд)
const SHOULDER = { R: new THREE.Vector3(0.3, -0.42, 0.22), L: new THREE.Vector3(-0.3, -0.44, 0.2) };

export class FpArms {
  constructor(tpl) {
    this.tpl = tpl;
    // «оси персонажа»: лицом к +Z, как у куклы; камера смотрит в −Z — отсюда разворот
    const space = (this.space = new THREE.Group());
    space.rotation.y = Math.PI;
    const wrap = new THREE.Group();
    wrap.quaternion.copy(tpl.fix);
    // руки чуть меньше настоящих: у героев крупные кисти, во весь размер они закрывают катушку;
    // у здоровяка с кулаками-кувалдами — ещё меньше (fp.k в art/models.json)
    const k = (this.k = 0.84 * ((tpl.info.fp && tpl.info.fp.k) || 1));
    wrap.scale.setScalar(tpl.scale * k);
    const model = cloneSkinned(tpl.scene);
    wrap.add(model);
    space.add(wrap);
    this.L1 = tpl.at.aR.distanceTo(tpl.at.eR) * k;
    this.L2 = tpl.at.eR.distanceTo(tpl.at.hR) * k;
    const b = (this.b = {});
    for (const k of ['aL', 'eL', 'hL', 'aR', 'eR', 'hR']) b[k] = model.getObjectByName(tpl.names[k]);
    // Ключица (родитель плечевой кости) идёт за плечом как приклеенная: плечо относительно неё стоит как в исходной
    // позе. Всё, что выше ключицы, остаётся на месте — запоминаем, как из осей персонажа попасть в оси её родителя.
    space.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(space.matrixWorld).invert();
    this.par = {};
    for (const s of ['L', 'R']) {
      const a = b['a' + s];
      const sh = a.parent;
      const up = sh.parent ? new THREE.Matrix4().multiplyMatrices(inv, sh.parent.matrixWorld) : new THREE.Matrix4();
      const scale = new THREE.Vector3();
      new THREE.Matrix4().multiplyMatrices(inv, a.matrixWorld).decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);
      this.par[s] = { sh, upInv: up.invert(), aInv: new THREE.Matrix4().compose(a.position, a.quaternion, a.scale).invert(), scale };
    }
    // От модели оставляем только руки. Вес ключицы засчитывается руке (у героев Tripo плечо привязано и к ней),
    // но только там, где есть и вес самой руки: иначе вместе с плечом рисовался бы кусок груди и воротника.
    const mask = new Float32Array(64);
    const maskSh = new Float32Array(64);
    model.traverse((o) => {
      if (!o.isSkinnedMesh) return;
      const bones = o.skeleton.bones;
      const arm = new Set([b.aL, b.eL, b.hL, b.aR, b.eR, b.hR]);
      // пальцы и прочие потомки кистей, если они есть у скелета
      for (let i = 0; i < bones.length && i < 64; i++) {
        let n = bones[i];
        while (n && !arm.has(n)) n = n.parent && n.parent.isBone ? n.parent : null;
        mask[i] = n ? 1 : 0;
        maskSh[i] = bones[i] === b.aL.parent || bones[i] === b.aR.parent ? 1 : 0;
      }
      o.frustumCulled = false;
      o.castShadow = false;
      const src = o.material;
      const m = (o.material = src.clone());
      m.onBeforeCompile = (sh) => {
        sh.uniforms.uArmMask = { value: mask };
        sh.uniforms.uShMask = { value: maskSh };
        // Вершина руки привязывается только к костям руки и ключицы (веса пересчитываются на них): доля туловища,
        // которое осталось стоять где-то в стороне, растягивала бы плечо в клочья.
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nuniform float uArmMask[64];\nuniform float uShMask[64];\nvarying float vArm;')
          .replace(
            '#include <skinbase_vertex>',
            `#include <skinbase_vertex>
            ivec4 armI = ivec4(skinIndex);
            vec4 armM = vec4(uArmMask[armI.x], uArmMask[armI.y], uArmMask[armI.z], uArmMask[armI.w]);
            vec4 armK = armM + vec4(uShMask[armI.x], uShMask[armI.y], uShMask[armI.z], uShMask[armI.w]);
            float armW = dot(skinWeight, armM);
            float armA = dot(skinWeight, armK);
            vec4 armSW = skinWeight * armK / max(armA, 1e-4);
            vArm = armA * smoothstep(0.22, 0.34, armW);`
          )
          .replace(
            '#include <skinnormal_vertex>',
            `mat4 skinMatrix = bindMatrixInverse * (armSW.x * boneMatX + armSW.y * boneMatY + armSW.z * boneMatZ + armSW.w * boneMatW) * bindMatrix;
            objectNormal = vec4(skinMatrix * vec4(objectNormal, 0.0)).xyz;
            #ifdef USE_TANGENT
              objectTangent = vec4(skinMatrix * vec4(objectTangent, 0.0)).xyz;
            #endif`
          )
          .replace(
            '#include <skinning_vertex>',
            `vec4 skinVertex = bindMatrix * vec4(transformed, 1.0);
            vec4 skinned = boneMatX * skinVertex * armSW.x + boneMatY * skinVertex * armSW.y + boneMatZ * skinVertex * armSW.z + boneMatW * skinVertex * armSW.w;
            transformed = (bindMatrixInverse * skinned).xyz;`
          );
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', '#include <common>\nvarying float vArm;')
          .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vArm < 0.6) discard;')
          .replace(
            '#include <roughnessmap_fragment>',
            'float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n  roughnessFactor *= mix(0.55, 1.0, texture2D(roughnessMap, vRoughnessMapUv).g);\n#endif'
          )
          .replace('#include <color_fragment>', '#include <color_fragment>\n' + HERO_TONE);
        addRim(sh);
      };
      m.customProgramCacheKey = () => 'hero-fp6';
    });
  }

  /**
   * Ставит одну руку. Всё в осях камеры.
   *   grip — где середина кулака; along — вдоль чего кулак сжат (ось рукояти), от мизинца к большому пальцу;
   *   elbow — куда примерно уходит локоть;
   *   tip — если не 0: предмет держим кончиками пальцев (на столько метров дальше середины кулака), а along — куда смотрит тыл кисти.
   */
  arm(s, grip, along, elbow, tip = 0) {
    const { b, tpl, L1, L2 } = this;
    const c = tpl.canon;
    // в оси персонажа: x и z меняют знак
    const cs = (v, out) => out.set(-v.x, v.y, -v.z);
    cs(grip, T);
    cs(along, Z2).normalize();
    cs(elbow, E);
    // предплечье: от запястья к локтю — ось +Y сустава (у куклы рука смотрит вдоль −Y)
    Y.copy(E).sub(T).normalize();
    let d = 0;
    if (tip) {
      // берём предмет «кончиками пальцев»: along — куда смотрит тыльная сторона кисти
      X.copy(Z2).addScaledVector(Y, -Z2.dot(Y)).normalize().multiplyScalar(s === 'L' ? 1 : -1);
      Z.crossVectors(X, Y);
      Z2.copy(Z);
      Y2.copy(Y);
    } else {
      Z.copy(Z2).addScaledVector(Y, -Z2.dot(Y)).normalize();
      X.crossVectors(Y, Z);
      // кисть доворачивается в запястье, чтобы кулак лёг вдоль рукояти (не больше ~50°)
      d = THREE.MathUtils.clamp(Math.atan2(-Z2.dot(Y), Z2.dot(Z)), -0.9, 0.9);
      Z2.copy(Z).multiplyScalar(Math.cos(d)).addScaledVector(Y, -Math.sin(d));
      Y2.copy(Y).multiplyScalar(Math.cos(d)).addScaledVector(Z, Math.sin(d));
    }
    basis(X, Y, Z, qF);
    basis(X, Y2, Z2, qH);
    const f = tpl.fist[s];
    const k = this.k;
    // tip: точка хвата — не середина кулака, а его дальний от запястья край
    W.copy(T).addScaledVector(X, -f.x * k * (tip ? 0.3 : 1)).addScaledVector(Y2, (-f.y + tip) * k).addScaledVector(Z2, -f.z * k * (tip ? 0.3 : 1));
    E.copy(W).addScaledVector(Y, L2);
    cs(SHOULDER[s], S);
    S.sub(E).normalize();
    // плечо: от локтя к плечу
    Y2.copy(S);
    S.multiplyScalar(L1).add(E);
    Z2.copy(X).addScaledVector(Y2, -X.dot(Y2)).normalize(); // временно: ось сгиба, выровненная по плечу
    Z.crossVectors(Z2, Y2);
    basis(Z2, Y2, Z, qU);
    // мировые (в осях персонажа) ориентации костей → локальные
    const par = this.par[s];
    const e = b['e' + s];
    const h = b['h' + s];
    qU.multiply(c['a' + s]);
    // ключица встаёт так, чтобы плечо (оно при ней в исходной позе) оказалось где нужно
    mA.compose(S, qU, par.scale).multiply(par.aInv).premultiply(par.upInv);
    mA.decompose(par.sh.position, par.sh.quaternion, par.sh.scale);
    qF.multiply(c['e' + s]);
    e.quaternion.copy(q.copy(qU).invert()).multiply(qF);
    qH.multiply(c['h' + s]);
    h.quaternion.copy(q.copy(qF).invert()).multiply(qH);
  }
}
