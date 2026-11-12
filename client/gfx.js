// Отрисовка: рендерер, пост-обработка (свечение, цветокоррекция), уровни качества.
//
// «Высокое» качество устроено так, чтобы встроенная графика ноутбука держала 60 кадров:
//   1) сцена — один раз в буфер с запасом яркости и сглаживанием;
//   2) свечение — цепочка маленьких буферов (от четверти экрана и мельче);
//   3) один проход на экран: сцена + свечение, цвет, виньетка, тональная кривая.
// Каждый лишний проход во весь экран на таких видеокартах стоит дорого, поэтому он ровно один.
import * as THREE from 'three';
import { surfaceU, detail } from './surface.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
// яркие места сцены → четверть разрешения (4 выборки накрывают блок 4×4 точки)
const PRE = `uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThreshold; varying vec2 vUv;
  vec3 pick(vec2 o){ vec3 c = min(texture2D(tSrc, vUv + uTexel * o).rgb, vec3(12.0));
    return c * smoothstep(uThreshold, uThreshold + 0.12, dot(c, vec3(0.2126, 0.7152, 0.0722))); }
  void main(){ gl_FragColor = vec4((pick(vec2(-1.0, -1.0)) + pick(vec2(1.0, -1.0)) + pick(vec2(-1.0, 1.0)) + pick(vec2(1.0, 1.0))) * 0.25, 1.0); }`;
// уменьшение вдвое с размытием
const DOWN = `uniform sampler2D tSrc; uniform vec2 uTexel; varying vec2 vUv;
  void main(){ vec3 s = texture2D(tSrc, vUv).rgb * 4.0;
    s += texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb;
    s += texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
    gl_FragColor = vec4(s * 0.125, 1.0); }`;
// увеличение вдвое с размытием + слой того же размера
const UP = `uniform sampler2D tSrc; uniform sampler2D tAdd; uniform vec2 uTexel; varying vec2 vUv;
  void main(){ vec2 o = uTexel * 0.5;
    vec3 s = texture2D(tSrc, vUv + vec2(-2.0 * o.x, 0.0)).rgb + texture2D(tSrc, vUv + vec2(2.0 * o.x, 0.0)).rgb;
    s += texture2D(tSrc, vUv + vec2(0.0, -2.0 * o.y)).rgb + texture2D(tSrc, vUv + vec2(0.0, 2.0 * o.y)).rgb;
    s += (texture2D(tSrc, vUv + vec2(-o.x, o.y)).rgb + texture2D(tSrc, vUv + o).rgb + texture2D(tSrc, vUv - o).rgb + texture2D(tSrc, vUv + vec2(o.x, -o.y)).rgb) * 2.0;
    gl_FragColor = vec4(texture2D(tAdd, vUv).rgb + s / 12.0, 1.0); }`;
// итог: сцена + свечение → насыщенность, контраст, виньетка → тональная кривая и цветовое пространство экрана
const FINAL = `uniform sampler2D tScene; uniform sampler2D tBloom; uniform float uBloom, uSat, uCon, uVig; varying vec2 vUv;
  void main(){ vec3 c = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb * uBloom;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(l), c, uSat);
    c = max((c - 0.18) * uCon + 0.18, 0.0);
    c *= 1.0 - uVig * smoothstep(0.42, 0.95, distance(vUv, vec2(0.5)));
    gl_FragColor = vec4(c, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    // едва заметный шум: без него на небе видны полосы
    float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    gl_FragColor.rgb += (n - 0.5) / 255.0; }`;

const LEVELS = 6; // слоёв свечения: 1/4, 1/8 … 1/128 экрана — самые мелкие дают широкий мягкий ореол
const HIGH_PIXELS = 5.6e6; // на «высоком» рисуем не больше стольких точек: дальше глаз разницы не видит, а видеокарта — видит
const mk = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });

export const QUALITIES = ['low', 'medium', 'high'];
export class Gfx {
  constructor(canvas, quality) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', stencil: false }));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    // буферы с запасом яркости умеют не все видеокарты; без них «высокое» рисуется напрямую, без свечения
    this.canPost = r.capabilities.isWebGL2 !== false && (r.extensions.has('EXT_color_buffer_float') || r.extensions.has('EXT_color_buffer_half_float'));
    this.post = null;
    this.quality = null;
    this.w = this.h = 0;
    this.ratio = 0;
    this.setQuality(quality || 'high');
  }
  setQuality(q) {
    if (!QUALITIES.includes(q)) q = 'high';
    if (q === this.quality) return;
    this.quality = q;
    const r = this.renderer;
    r.shadowMap.enabled = q !== 'low';
    r.shadowMap.needsUpdate = true;
    surfaceU.uDetail.value = q === 'low' ? 0 : 1; // на «низком» — без фактуры дерева и камня: экономим выборки из текстур
    detail.lod = q === 'high' ? 1 : q === 'medium' ? 0.7 : 0.45; // подробные деревья и камни — только вблизи
    this.dropPost();
    this.w = 0;
    this.resize();
  }
  /** Сколько точек буфера на одну точку экрана. */
  pixelRatio(w, h) {
    const dpr = window.devicePixelRatio || 1;
    if (this.quality === 'low') return Math.min(dpr, 1);
    if (this.quality === 'medium') return Math.min(dpr, 1.5);
    return Math.min(dpr, 2, Math.max(1, Math.sqrt(HIGH_PIXELS / Math.max(1, w * h))));
  }
  resize() {
    const cv = this.renderer.domElement;
    const w = cv.clientWidth || window.innerWidth;
    const h = cv.clientHeight || window.innerHeight;
    const ratio = this.pixelRatio(w, h);
    if (w === this.w && h === this.h && ratio === this.ratio) return false;
    const sized = w !== this.w || h !== this.h;
    this.w = w;
    this.h = h;
    this.ratio = ratio;
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(w, h, false);
    if (this.post) this.sizePost();
    return sized;
  }
  dropPost() {
    const p = this.post;
    if (!p) return;
    for (const t of [p.scene, ...p.down, ...p.up]) t.dispose();
    for (const m of [p.pre, p.downM, p.upM, p.final]) m.dispose();
    p.quad.dispose();
    this.post = null;
  }
  ensurePost() {
    if (this.post) return;
    const half = { type: THREE.HalfFloatType, depthBuffer: false };
    const p = (this.post = {
      scene: new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 }),
      down: Array.from({ length: LEVELS }, () => new THREE.WebGLRenderTarget(4, 4, half)),
      up: Array.from({ length: LEVELS - 1 }, () => new THREE.WebGLRenderTarget(4, 4, half)),
      pre: mk(PRE, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: 1.0 } }),
      downM: mk(DOWN, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } }),
      upM: mk(UP, { tSrc: { value: null }, tAdd: { value: null }, uTexel: { value: new THREE.Vector2() } }),
      final: mk(FINAL, { tScene: { value: null }, tBloom: { value: null }, uBloom: { value: 0.115 }, uSat: { value: 1.1 }, uCon: { value: 1.05 }, uVig: { value: 0.32 } }),
      quad: new FullScreenQuad(null)
    });
    p.final.uniforms.tScene.value = p.scene.texture;
    p.final.uniforms.tBloom.value = p.up[0].texture;
    this.sizePost();
  }
  sizePost() {
    const p = this.post;
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    p.scene.setSize(size.x, size.y);
    let w = Math.max(2, Math.round(size.x / 4));
    let h = Math.max(2, Math.round(size.y / 4));
    for (let i = 0; i < LEVELS; i++) {
      p.down[i].setSize(w, h);
      if (i < LEVELS - 1) p.up[i].setSize(w, h);
      w = Math.max(2, Math.round(w / 2));
      h = Math.max(2, Math.round(h / 2));
    }
  }
  render(scene, camera, exposure = 1) {
    const r = this.renderer;
    r.toneMappingExposure = exposure;
    if (this.quality !== 'high' || !this.canPost) return r.render(scene, camera);
    this.ensurePost();
    const p = this.post;
    const pass = (mat, target) => {
      p.quad.material = mat;
      r.setRenderTarget(target);
      p.quad.render(r);
    };
    // 1) сцена
    r.setRenderTarget(p.scene);
    r.render(scene, camera);
    // 2) свечение: яркое → вниз по слоям → обратно вверх, собирая слои
    p.pre.uniforms.tSrc.value = p.scene.texture;
    p.pre.uniforms.uTexel.value.set(1 / p.scene.width, 1 / p.scene.height);
    pass(p.pre, p.down[0]);
    for (let i = 1; i < LEVELS; i++) {
      p.downM.uniforms.tSrc.value = p.down[i - 1].texture;
      p.downM.uniforms.uTexel.value.set(1 / p.down[i - 1].width, 1 / p.down[i - 1].height);
      pass(p.downM, p.down[i]);
    }
    let src = p.down[LEVELS - 1];
    for (let i = LEVELS - 2; i >= 0; i--) {
      p.upM.uniforms.tSrc.value = src.texture;
      p.upM.uniforms.tAdd.value = p.down[i].texture;
      p.upM.uniforms.uTexel.value.set(1 / src.width, 1 / src.height);
      pass(p.upM, p.up[i]);
      src = p.up[i];
    }
    // 3) на экран
    pass(p.final, null);
  }
}
