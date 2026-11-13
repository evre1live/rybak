// Дельфины: две стаи ходят по открытому морю замкнутой дорогой — вдоль внешнего края моря и обратно ближе к бухте.
// Место стаи считается из общих часов комнаты, так что все игроки видят дельфинов в одной и той же точке.
// На всё — один вызов отрисовки: семь копий одной геометрии, хвостом машет шейдер.
import * as THREE from 'three';

/** Дорога стай: точки замкнутой петли по глубокой воде, в стороне от островов, скал, корабля и вех. */
export const DOLPHIN_WAY = [
  [382, -40], [395, -150], [378, -262], [250, -345], [165, -300], [40, -285], [-60, -275], [-190, -335], [-290, -250], [-300, -140],
  [-225, -130], [-150, -150], [-85, -181], [-30, -212], [40, -205], [150, -213], [173, -157], [215, -95], [300, -70]
];
export const DOLPHIN_SPEED = 5.6; // м/с
/** Стаи: сколько в ней дельфинов и где она на петле в нулевой момент (доля круга). */
export const PODS = [{ n: 4, at: 0 }, { n: 3, at: 0.52 }];
export const DOLPHINS = PODS.reduce((s, p) => s + p.n, 0);
const HOP = 17; // через столько метров пути дельфин показывается из воды
const SHOW = 0.46; // какую долю этого пути он над водой или у самой поверхности
const DEEP = -1.0; // на такой глубине идёт между выходами
const SEEN = 420; // дальше от камеры стаю не считаем и не рисуем
const SPLASH_FAR = 140; // дальше брызг и кругов от дельфинов не видно — не рисуем

// Петля — гладкая кривая через точки; заранее режем её на короткие отрезки и помним длину пути до каждого.
const STEPS = 14;
const pts = [];
{
  const n = DOLPHIN_WAY.length;
  const cr = (a, b, c, d, t) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
  for (let i = 0; i < n; i++) {
    const [a, b, c, d] = [-1, 0, 1, 2].map((k) => DOLPHIN_WAY[(i + k + n) % n]);
    for (let j = 0; j < STEPS; j++) pts.push([cr(a[0], b[0], c[0], d[0], j / STEPS), cr(a[1], b[1], c[1], d[1], j / STEPS)]);
  }
}
const acc = [0];
for (let i = 0; i < pts.length; i++) {
  const a = pts[i], b = pts[(i + 1) % pts.length];
  acc.push(acc[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
}
/** Длина петли, м. */
export const WAY_LEN = acc[pts.length];
/** Точка дороги на пути s метров от начала и куда там плыть: { x, z, dx, dz }. */
export function wayAt(s, out = {}) {
  s = ((s % WAY_LEN) + WAY_LEN) % WAY_LEN;
  let lo = 0, hi = pts.length;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (acc[mid] <= s) lo = mid;
    else hi = mid;
  }
  const a = pts[lo], b = pts[(lo + 1) % pts.length];
  const len = acc[lo + 1] - acc[lo] || 1;
  const k = (s - acc[lo]) / len;
  out.x = a[0] + (b[0] - a[0]) * k;
  out.z = a[1] + (b[1] - a[1]) * k;
  out.dx = (b[0] - a[0]) / len;
  out.dz = (b[1] - a[1]) / len;
  return out;
}
/** Где стая в момент T общих часов: путь по петле в метрах. */
export const podS = (pod, T) => (pod.at * WAY_LEN + T * DOLPHIN_SPEED) % WAY_LEN;

const hash = (a, b) => {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Геометрия дельфина: нос смотрит в +Z, спина вверх; длина два с половиной метра. */
function dolphinGeometry() {
  const back = new THREE.Color('#45658a'), belly = new THREE.Color('#e9f2f6'), fin = new THREE.Color('#3b5878');
  // сечения от кончика клюва к хвосту: [z, полувысота, полуширина, сдвиг середины по высоте]
  const ST = [
    [1.25, 0.018, 0.018, -0.03], [1.1, 0.055, 0.06, -0.03], [0.97, 0.075, 0.082, -0.02], [0.9, 0.165, 0.14, 0.02], [0.7, 0.25, 0.21, 0.03],
    [0.35, 0.31, 0.25, 0.03], [0, 0.31, 0.24, 0.02], [-0.4, 0.25, 0.18, 0], [-0.75, 0.16, 0.1, 0], [-1.0, 0.09, 0.052, 0], [-1.16, 0.05, 0.034, 0]
  ];
  const SEG = 10;
  const pos = [], col = [], idx = [];
  const c = new THREE.Color();
  for (const [z, ry, rx, yc] of ST) {
    for (let j = 0; j < SEG; j++) {
      const a = (j / SEG) * Math.PI * 2;
      const up = Math.cos(a);
      pos.push(Math.sin(a) * rx, yc + up * ry, z);
      // спина тёмная, брюхо светлое, граница по бокам мягкая
      c.copy(belly).lerp(back, THREE.MathUtils.smoothstep(up, -0.45, 0.15));
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < ST.length - 1; i++) {
    for (let j = 0; j < SEG; j++) {
      const a = i * SEG + j, b = i * SEG + ((j + 1) % SEG), d = a + SEG, e = b + SEG;
      idx.push(a, d, b, b, d, e);
    }
  }
  const body = new THREE.BufferGeometry();
  body.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  body.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  body.setIndex(idx);
  body.computeVertexNormals();
  const flat = body.toNonIndexed();
  const P = Array.from(flat.attributes.position.array), N = Array.from(flat.attributes.normal.array), C = Array.from(flat.attributes.color.array);
  // плавники — плоские треугольники (материал двусторонний): спинной, два грудных и хвост
  const tri = (a, b, d, color = fin) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), vd = new THREE.Vector3(...d);
    const n = vb.clone().sub(va).cross(vd.clone().sub(va)).normalize();
    for (const v of [va, vb, vd]) {
      P.push(v.x, v.y, v.z);
      N.push(n.x, n.y, n.z);
      C.push(color.r, color.g, color.b);
    }
  };
  // спинной: клин со скосом назад, у основания толще
  const T = [0, 0.64, -0.36];
  tri([-0.04, 0.3, 0.16], [-0.02, 0.29, -0.26], T);
  tri([0.04, 0.3, 0.16], T, [0.02, 0.29, -0.26]);
  tri([-0.04, 0.3, 0.16], T, [0.04, 0.3, 0.16]);
  tri([-0.02, 0.29, -0.26], [0.02, 0.29, -0.26], T);
  for (const s of [-1, 1]) {
    tri([s * 0.19, -0.13, 0.56], [s * 0.2, -0.16, 0.3], [s * 0.52, -0.36, 0.16]);
    // лопасть хвоста: лежит плашмя
    tri([0, 0.0, -1.06], [s * 0.44, 0.0, -1.4], [0, 0.0, -1.27]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  return g;
}

/**
 * Дельфины в сцене. update(dt, t, T, camera, waveH, fx) двигает стаи; onLeap(x, z, сила) — дельфин ушёл в воду
 * после прыжка (звук ставит игра).
 */
export function buildDolphins(scene) {
  const geo = dolphinGeometry();
  const beat = new THREE.InstancedBufferAttribute(new Float32Array(DOLPHINS), 1);
  geo.setAttribute('aBeat', beat);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0, side: THREE.DoubleSide });
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aBeat;')
      // хвост ходит вверх-вниз: чем ближе к лопастям, тем сильнее; голова чуть кивает в противоход
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n{ float k = clamp((0.25 - transformed.z) / 1.6, 0.0, 1.0); transformed.y += aBeat * (k * k * 0.34 - 0.03 * clamp(transformed.z, 0.0, 1.0)); }');
  };
  mat.customProgramCacheKey = () => 'dolphin1';
  const mesh = new THREE.InstancedMesh(geo, mat, DOLPHINS);
  mesh.frustumCulled = false; // стаи ходят по всему морю
  mesh.name = 'dolphins';
  mesh.layers.set(1); // в отражении воды их нет
  scene.add(mesh);
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < DOLPHINS; i++) mesh.setMatrixAt(i, hide);
  // у каждого своё место в стае (позади вожака и сбоку), свой размер и свой сдвиг выхода из воды
  const list = [];
  PODS.forEach((pod, p) => {
    for (let j = 0; j < pod.n; j++) {
      list.push({ pod, p, j, back: j * 3.3 + (j % 2) * 0.8, side: j ? (j % 2 ? 1 : -1) * (1.5 + j * 0.55) : 0, shift: hash(p + 3, j + 11) * HOP, size: 1.0 + hash(p + 5, j) * 0.3, up: false, x: 0, z: 0 });
    }
  });
  const o = new THREE.Object3D();
  o.rotation.order = 'YXZ';
  const w = {}, P = {};
  const st = { leaps: 0, shown: 0 };
  /** Где дельфин d в момент T: место, высота над спокойной водой, наклон пути, прыжок ли это и какая часть дуги пройдена. */
  const pose = (d, T, out = {}) => {
    const s = podS(d.pod, T) - d.back;
    wayAt(s, w);
    out.x = w.x - w.dz * d.side;
    out.z = w.z + w.dx * d.side;
    out.dx = w.dx;
    out.dz = w.dz;
    // выход из воды: раз в HOP метров пути; каждый четвёртый-пятый выход — прыжок целиком
    const run = s + d.shift;
    const n = Math.floor(run / HOP);
    const u = run / HOP - n;
    out.leap = hash(n * 7 + d.p * 131, d.j) < 0.23;
    const H = out.leap ? 2.5 : 1.12;
    const q = (u - (1 - SHOW) / 2) / SHOW; // 0…1 — пока идёт дуга
    out.q = q;
    out.y = DEEP;
    out.slope = 0;
    if (q > 0 && q < 1) {
      out.y = DEEP + H * Math.sin(Math.PI * q);
      out.slope = (H * Math.PI * Math.cos(Math.PI * q)) / (SHOW * HOP);
    }
    return out;
  };
  return {
    mesh,
    onLeap: null,
    /** Для проверок: где стаи, сколько дельфинов сейчас считается и сколько было прыжков. */
    state: (T) => ({ n: DOLPHINS, shown: st.shown, leaps: st.leaps, pods: PODS.map((pod) => { const q = wayAt(podS(pod, T)); return { x: q.x, z: q.z }; }) }),
    /** Для проверок: поза дельфина i в момент T. */
    poseAt: (i, T) => pose(list[i], T, {}),
    update(dt, t, T, camera, waveH, fx) {
      st.shown = 0;
      list.forEach((d, i) => {
        pose(d, T, P);
        const { x, z } = P;
        const far = Math.hypot(x - camera.position.x, z - camera.position.z);
        if (far > SEEN) {
          mesh.setMatrixAt(i, hide);
          d.up = false;
          return;
        }
        st.shown++;
        // под самой лодкой не выныривают: рядом с камерой дуга прижимается к глубине
        const near = Math.min(1, Math.max(0, (far - 4.5) / 5));
        P.y = DEEP + (P.y - DEEP) * near;
        P.slope *= near;
        const up = P.y > 0.05;
        if (up !== d.up) {
          d.up = up;
          // нос рвёт воду на выходе и поднимает брызги на входе
          const nx = x + P.dx * 0.9, nz = z + P.dz * 0.9;
          // брызги — только там, где их видно: запас капель и кругов общий с поплавком и рыбой
          if (fx && far < SPLASH_FAR) {
            if (P.leap) fx.splash(nx, nz, up ? 0.55 : 1.15);
            else if (far < 60) fx.splash(nx, nz, up ? 0.2 : 0.28);
            else fx.ripple(nx, nz, up ? 0.9 : 1.2, 1.2);
          }
          if (!up && P.leap) {
            st.leaps++;
            if (this.onLeap) this.onLeap(nx, nz, 1);
          }
        }
        o.position.set(x, P.y * d.size + waveH(x, z, t), z);
        o.rotation.set(-Math.atan(P.slope), Math.atan2(P.dx, P.dz), 0);
        o.scale.setScalar(d.size);
        o.updateMatrix();
        mesh.setMatrixAt(i, o.matrix);
        beat.setX(i, Math.sin(T * 8.5 + i * 1.9));
      });
      mesh.instanceMatrix.needsUpdate = true;
      beat.needsUpdate = true;
    }
  };
}
