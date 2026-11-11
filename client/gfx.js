// Отрисовка: рендерер, пост-обработка (свечение, цветокоррекция), уровни качества.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uSat: { value: 1.1 }, uCon: { value: 1.05 }, uVig: { value: 0.32 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uSat, uCon, uVig; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv); float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      c.rgb = mix(vec3(l), c.rgb, uSat); c.rgb = max((c.rgb - 0.18) * uCon + 0.18, 0.0);
      float d = distance(vUv, vec2(0.5)); c.rgb *= 1.0 - uVig * smoothstep(0.42, 0.95, d); gl_FragColor = c; }`
};

export const QUALITIES = ['low', 'medium', 'high'];
export class Gfx {
  constructor(canvas, quality) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', stencil: false }));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    this.composer = null;
    this.quality = null;
    this.w = this.h = 0;
    this.setQuality(quality || 'high');
  }
  setQuality(q) {
    if (!QUALITIES.includes(q)) q = 'high';
    if (q === this.quality) return;
    this.quality = q;
    const r = this.renderer;
    const dpr = window.devicePixelRatio || 1;
    r.setPixelRatio(q === 'high' ? Math.min(dpr, 2) : q === 'medium' ? Math.min(dpr, 1.5) : Math.min(dpr, 1));
    r.shadowMap.enabled = q !== 'low';
    r.shadowMap.needsUpdate = true;
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }
    this.w = 0;
    this.resize();
  }
  ensureComposer(scene, camera) {
    if (this.composer || this.quality !== 'high') return;
    const r = this.renderer;
    const size = r.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
    const c = (this.composer = new EffectComposer(r, rt));
    this.renderPass = new RenderPass(scene, camera);
    c.addPass(this.renderPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.2, 0.55, 1.0);
    c.addPass(this.bloom);
    this.grade = new ShaderPass(GradeShader);
    c.addPass(this.grade);
    c.addPass(new OutputPass());
  }
  resize() {
    const cv = this.renderer.domElement;
    const w = cv.clientWidth || window.innerWidth;
    const h = cv.clientHeight || window.innerHeight;
    if (w === this.w && h === this.h) return false;
    this.w = w;
    this.h = h;
    this.renderer.setSize(w, h, false);
    if (this.composer) {
      this.composer.setPixelRatio(this.renderer.getPixelRatio());
      this.composer.setSize(w, h);
    }
    return true;
  }
  render(scene, camera, exposure = 1) {
    this.renderer.toneMappingExposure = exposure;
    if (this.quality === 'high') {
      this.ensureComposer(scene, camera);
      this.renderPass.scene = scene;
      this.renderPass.camera = camera;
      this.composer.render();
    } else this.renderer.render(scene, camera);
  }
}
