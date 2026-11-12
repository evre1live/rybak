// Дождь: струи вокруг камеры. Каждая струя — узкая полоска, повёрнутая к камере; всё движение считается в шейдере.
import * as THREE from 'three';
import { isTouch } from './util.js';
import { DECK_Y } from './terrain.js';

const BOX = [30, 17, 30]; // коробка вокруг камеры, в которой идёт дождь, м
// навесы, под которыми сухо: лавка скупщика и будка проката (x0, z0, x1, z1, высота кромки)
export const ROOFS = [[-13.7, 9.7, -5.7, 16.0, DECK_Y + 3.3], [2.5, -8.9, 5.9, -3.9, DECK_Y + 3.1]];
const VERT = /* glsl */ `
attribute vec3 aSeed;
uniform float uTime, uK;
uniform vec3 uCam, uBox;
uniform vec2 uWind;
uniform vec4 uRoof[2]; // навесы: x0, z0, x1, z1
uniform float uRoofY[2]; // и высота их кромки
varying float vA;
void main() {
  float sp = 13.0 + aSeed.x * 7.0; // скорость падения, м/с
  // место капли в коробке: падает и сносится ветром, вышла за край — входит с другого
  float tt = mod(uTime, 480.0); // время по кругу: на больших числах движение теряло бы точность
  vec3 q = aSeed * uBox;
  q.y -= tt * sp;
  q.xz += uWind * tt;
  vec3 c = mod(q - uCam, uBox) - uBox * 0.5 + uCam;
  vec3 dir = normalize(vec3(uWind.x, -sp, uWind.y));
  float len = 0.42 + aSeed.z * 0.4;
  vec3 view = normalize(c - cameraPosition);
  vec3 side = normalize(cross(dir, view));
  float d = distance(c, cameraPosition);
  // вблизи струя шире: иначе у самого лица она тоньше точки экрана и мерцает
  float w = 0.006 + 0.0011 * d;
  vec3 p = c - dir * len * position.y + side * position.x * w;
  // густота: чем слабее дождь, тем меньше капель видно; у краёв коробки и у самой камеры они тают
  float on = step(fract(aSeed.x * 7.13 + aSeed.z * 3.71), uK);
  vA = on * (1.0 - position.y * 0.75) * smoothstep(1.6, 5.5, d) * (1.0 - smoothstep(uBox.x * 0.36, uBox.x * 0.5, d));
  // под крышей лавки и будки проката сухо
  for (int i = 0; i < 2; i++) { vec4 R = uRoof[i]; if (c.x > R.x && c.x < R.z && c.z > R.y && c.z < R.w && c.y < uRoofY[i]) vA = 0.0; }
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;
const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uCol;
uniform float uA;
varying float vA;
void main() {
  if (vA < 0.01) discard;
  gl_FragColor = vec4(uCol, vA * uA);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class Rain {
  constructor(scene, n = isTouch() ? 900 : 2200) {
    const quad = new THREE.InstancedBufferGeometry();
    quad.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0]), 3));
    quad.setIndex([0, 1, 2, 0, 2, 3]);
    const seed = new Float32Array(n * 3);
    let s = 12345;
    const r = () => ((s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296);
    for (let i = 0; i < seed.length; i++) seed[i] = r();
    quad.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 3));
    quad.instanceCount = n;
    this.uniforms = {
      uTime: { value: 0 }, uK: { value: 0 }, uA: { value: 0.4 }, uCam: { value: new THREE.Vector3() }, uBox: { value: new THREE.Vector3(...BOX) },
      uWind: { value: new THREE.Vector2(2, 1) }, uCol: { value: new THREE.Color('#dfeaf5') },
      uRoof: { value: ROOFS.map((r) => new THREE.Vector4(r[0], r[1], r[2], r[3])) }, uRoofY: { value: ROOFS.map((r) => r[4]) }
    };
    const mat = new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const m = (this.mesh = new THREE.Mesh(quad, mat));
    m.frustumCulled = false;
    m.renderOrder = 6;
    m.visible = false;
    scene.add(m);
  }
  /** k — сила дождя 0…1, wind — ветер 0…1, light — насколько светло (ночью струи темнее). */
  update(t, camera, k, wind, light = 1) {
    const u = this.uniforms;
    this.mesh.visible = k > 0.02;
    if (!this.mesh.visible) return;
    u.uTime.value = t;
    u.uK.value = Math.min(1, k * 1.05);
    u.uA.value = 0.16 + 0.26 * light;
    u.uCam.value.copy(camera.position);
    u.uWind.value.set(1.2 + wind * 4.2, 0.6 + wind * 2.1);
    u.uCol.value.setScalar(0.35 + 0.6 * light);
  }
}
