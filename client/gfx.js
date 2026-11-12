// Отрисовка: рендерер, пост-обработка (свечение, цветокоррекция), уровни качества.
//
// «Высокое» качество устроено так, чтобы встроенная графика ноутбука держала 60 кадров:
//   0) через кадр — отражение мира в воде: сцена глазами зеркальной камеры в буфер половинного размера;
//   1) сцена — один раз в буфер с запасом яркости и сглаживанием;
//   2) свечение — цепочка маленьких буферов (от четверти экрана и мельче);
//   3) затенение в углах — два прохода в половину разрешения по глубине сцены;
//   4) один проход на экран: сцена × затенение + свечение, цвет, виньетка, тональная кривая.
// Каждый лишний проход во весь экран на таких видеокартах стоит дорого, поэтому он ровно один.
import * as THREE from 'three';
import { yieldNow } from './perf.js';
import { surfaceU, detail } from './surface.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

// Тональная кривая — своя, одна на все уровни качества: насыщенность → «подошва» и контраст по яркости → сжатие светов.
// Стандартная «нейтральная» кривая three.js вычитает из каждого канала одно и то же число (до 0,04): у насыщенных цветов
// наименьший канал уходит в ноль (трава становится кислотной, кожа — оранжевой), а тёмные краски моделей — в чёрное
// и меняют оттенок (чёрное худи выходило коричневым). Здесь то же самое делается по яркости: цвет темнеет, оттенок остаётся.
// Для подбора: ?tone=насыщенность,контраст,подошва
const toneQ = (typeof location !== 'undefined' ? new URLSearchParams(location.search).get('tone') || '' : '').split(',').map(Number);
export const TONE = { sat: toneQ[0] || 1.25, con: toneQ[1] || 1.08, toe: Number.isFinite(toneQ[2]) && toneQ.length > 2 ? toneQ[2] : 0.7 };
THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
  'vec3 CustomToneMapping( vec3 color ) { return color; }',
  /* glsl */ `vec3 CustomToneMapping( vec3 color ) {
	const vec3 W = vec3( 0.2126, 0.7152, 0.0722 );
	color *= toneMappingExposure;
	float l = dot( color, W );
	color = max( mix( vec3( l ), color, ${TONE.sat.toFixed(3)} ), 0.0 );
	l = max( dot( color, W ), 1e-5 );
	float toe = l < 0.08 ? l - 6.25 * l * l : 0.04;
	float l2 = max( l - ${TONE.toe.toFixed(3)} * toe, 0.0 );
	l2 = 0.18 * pow( l2 / 0.18, ${TONE.con.toFixed(3)} );
	color *= l2 / l;
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}`
);

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
// Мягкое затенение в углах — по буферу глубины, в половину разрешения. Для каждой точки восемь проб вокруг (в радиусе
// метра в мире): чем больше соседей «нависает» над поверхностью, тем темнее. Нормаль берётся из самой глубины.
// uProj: tg половины угла обзора по x и по y, ближняя и дальняя плоскости.
const AO = `uniform sampler2D tDepth; uniform vec2 uTexel; uniform vec4 uProj; uniform vec2 uRS; varying vec2 vUv;
  float viewZ(vec2 uv){ float d = texture2D(tDepth, uv).x; return uProj.z * uProj.w / (uProj.w - d * (uProj.w - uProj.z)); }
  vec3 posAt(vec2 uv){ float z = viewZ(uv); return vec3((uv * 2.0 - 1.0) * uProj.xy * z, -z); }
  void main(){
    float z0 = viewZ(vUv);
    if (z0 > 80.0) { gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0); return; }
    vec3 p = vec3((vUv * 2.0 - 1.0) * uProj.xy * z0, -z0);
    vec3 a1 = posAt(vUv + vec2(uTexel.x, 0.0)) - p; vec3 a2 = p - posAt(vUv - vec2(uTexel.x, 0.0));
    vec3 b1 = posAt(vUv + vec2(0.0, uTexel.y)) - p; vec3 b2 = p - posAt(vUv - vec2(0.0, uTexel.y));
    vec3 n = normalize(cross(abs(a1.z) < abs(a2.z) ? a1 : a2, abs(b1.z) < abs(b2.z) ? b1 : b2));
    float R = uRS.x;
    float rs = min(R / z0, 0.16);
    float ang = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) * 6.2831853;
    float occ = 0.0;
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      float a = ang + fi * 2.39996;
      vec3 q = posAt(vUv + vec2(cos(a), sin(a)) * ((fi + 0.5) / 8.0) * rs * 0.5 / uProj.xy) - p;
      float d2 = dot(q, q);
      occ += max(dot(n, q) * inversesqrt(d2 + 1e-5) - 0.14, 0.0) * (1.0 - smoothstep(R * R * 0.5, R * R * 2.2, d2));
    }
    float ao = 1.0 - occ * uRS.y;
    gl_FragColor = vec4(mix(clamp(ao, 0.0, 1.0), 1.0, smoothstep(40.0, 80.0, z0)), z0 / 80.0, 0.0, 1.0); }`;
// размытие затенения: соседи с другой глубины (за краем предмета) не подмешиваются
const AOBLUR = `uniform sampler2D tSrc; uniform vec2 uTexel; varying vec2 vUv;
  void main(){ vec2 c = texture2D(tSrc, vUv).rg; float s = c.r; float w = 1.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { if (i == 0 && j == 0) continue;
      vec2 t = texture2D(tSrc, vUv + uTexel * vec2(float(i), float(j)) * 1.5).rg;
      float k = 1.0 - smoothstep(0.0, 0.012 + c.g * 0.06, abs(t.g - c.g)); s += t.r * k; w += k; }
    gl_FragColor = vec4(s / w, c.g, 0.0, 1.0); }`;
// итог: сцена (с затенением в углах) + свечение → виньетка → тональная кривая (в ней же насыщенность и контраст) и цветовое пространство экрана
const FINAL = `uniform sampler2D tScene; uniform sampler2D tBloom; uniform sampler2D tAO; uniform float uBloom, uVig, uAO; varying vec2 vUv;
  void main(){ vec3 c = texture2D(tScene, vUv).rgb * mix(1.0, texture2D(tAO, vUv).r, uAO) + texture2D(tBloom, vUv).rgb * uBloom;
    c *= 1.0 - uVig * smoothstep(0.42, 0.95, distance(vUv, vec2(0.5)));
    gl_FragColor = vec4(c, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    // едва заметный шум: без него на небе видны полосы
    float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    gl_FragColor.rgb += (n - 0.5) / 255.0; }`;

// для подбора и проверок: ?ao=0…1[,радиус,сила] — затенение в углах, ?refl=0 — без отражений в воде
const urlQ = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new Map();
const aoQ = (urlQ.get('ao') || '').split(',').map(Number);
const AO_K = urlQ.get('ao') != null ? Math.max(0, Math.min(1, aoQ[0] || 0)) : 0.85;
const AO_RS = [aoQ[1] || 1.0, aoQ[2] || 0.45]; // радиус проб в метрах и сила
const REFLECT = urlQ.get('refl') !== '0';
const REFL_WIDE = 1.12; // отражение снимается с обзором на 12% шире экрана (по тангенсу): запас около 3° на поворот между кадрами
const REFL_TURN = Math.cos((6 * Math.PI) / 180); // развернулись сильнее — снимаем отражение заново, не дожидаясь очереди
const LEVELS = 6; // слоёв свечения: 1/4, 1/8 … 1/128 экрана — самые мелкие дают широкий мягкий ореол
const HIGH_PIXELS = 5.6e6; // на «высоком» рисуем не больше стольких точек: дальше глаз разницы не видит, а видеокарта — видит
const mk = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
const TEX_SLOTS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'alphaMap'];
/** На следующем кадре; вкладка в фоне кадров не получает — тогда по таймеру. */
const nextFrame = (fn) => {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    fn();
  };
  requestAnimationFrame(go);
  setTimeout(go, 250);
};

export const QUALITIES = ['low', 'medium', 'high'];
export class Gfx {
  constructor(canvas, quality) {
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', stencil: false }));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.CustomToneMapping;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    // буферы с запасом яркости умеют не все видеокарты; без них «высокое» рисуется напрямую, без свечения
    this.canPost = r.capabilities.isWebGL2 !== false && (r.extensions.has('EXT_color_buffer_float') || r.extensions.has('EXT_color_buffer_half_float'));
    this.post = null;
    // затенение в углах и отражения в воде можно выключить на ходу — для замеров, во что они обходятся
    this.aoK = AO_K;
    this.reflLevel = REFLECT ? 2 : 0; // отражения в воде: 2 — буфер в полкадра, 1 — в четверть (дешевле), 0 — нет
    r.info.autoReset = false; // счёт вызовов отрисовки — за весь кадр (тени, отражение, сцена), а не за последний проход
    this.scale = 1; // доля от разрешения ступени качества: её уменьшает автоподбор, когда кадры проседают
    this.warmQ = []; // модели, чьи текстуры ждут очереди к видеокарте (warm)
    this.warmFast = true; // за заставкой текстуры уходят без оглядки на кадры; игра выключает (main.js, boot)
    this.warmed = 0;
    this.quality = null;
    this.w = this.h = 0;
    this.ratio = 0;
    this.setQuality(quality || 'high');
  }
  /** Отражения в воде включены? (уровень — reflLevel, меняется через setRefl) */
  get reflect() {
    return this.reflLevel > 0;
  }
  set reflect(v) {
    this.setRefl(v ? this.reflLevel || 2 : 0);
  }
  /** Уровень отражений: 2 — в полкадра, 1 — в четверть, 0 — выключены. Меняется только буфер отражения — это дёшево. */
  setRefl(level) {
    level = Math.max(0, Math.min(2, level | 0));
    if (level === this.reflLevel) return;
    this.reflLevel = level;
    if (this.post) this.sizeRefl();
  }
  sizeRefl() {
    const p = this.post;
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const div = this.reflLevel === 1 ? 4 : 2;
    p.refl.setSize(Math.max(2, Math.round(size.x / div)), Math.max(2, Math.round(size.y / div)));
    this.reflOk = false; // буфер отражения очищен — в ближайшем кадре снимаем заново
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
    detail.grass = q === 'high' ? 44 : q === 'medium' ? 30 : 0; // пучки травы вокруг игрока; на «низком» их нет
    detail.far = q === 'high' ? 170 : q === 'medium' ? 125 : 85; // с какого расстояния видна мелочь размером в метр (ящик, бочка)
    this.dropPost();
    this.w = 0;
    this.resize();
  }
  /** Сколько точек буфера на одну точку экрана. */
  pixelRatio(w, h) {
    const dpr = window.devicePixelRatio || 1;
    const base = this.quality === 'low' ? Math.min(dpr, 1) : this.quality === 'medium' ? Math.min(dpr, 1.5) : Math.min(dpr, 2, Math.max(1, Math.sqrt(HIGH_PIXELS / Math.max(1, w * h))));
    // мельче 540 строк не рисуем: дальше картинка разваливается (надписи и меню от этого не зависят — они поверх)
    return Math.min(base, Math.max(base * this.scale, 540 / Math.max(1, h)));
  }
  /** Разрешение: доля от положенного ступени качества (0,4…1). Меняется шагами не мельче 1,5 %. */
  setScale(k) {
    k = Math.max(0.4, Math.min(1, k));
    if (Math.abs(k - this.scale) < 0.015) return false;
    this.scale = k;
    this.resize();
    return true;
  }
  /**
   * Собрать шейдеры сцены под ступень качества tier, не подвешивая страницу. У «высокого» они свои (сцена рисуется
   * в буфер с запасом яркости, тональная кривая — отдельным проходом), у «низкого» — без теней. Собранное three.js
   * держит по материалу, так что потом ступень (или набор источников света) переключается без рывка.
   * Возвращает обещание: готово, когда видеокарта всё собрала.
   */
  shaders(scene, camera, tier = this.quality) {
    const r = this.renderer;
    const was = r.shadowMap.enabled;
    let done;
    try {
      r.shadowMap.enabled = tier !== 'low';
      if (tier === 'high' && this.canPost) {
        this.ensurePost();
        r.setRenderTarget(this.post.scene);
      }
      done = r.compileAsync(scene, camera); // сама сборка уходит в фон; что именно собирать, решается здесь, сразу
    } finally {
      r.setRenderTarget(null);
      r.shadowMap.enabled = was;
      if (tier === 'high' && this.quality !== 'high') this.dropPost(); // буферы «высокого» нужны были только чтобы назвать шейдеры
    }
    return Promise.race([done, new Promise((ok) => setTimeout(ok, 30000))]).catch(() => {});
  }
  /**
   * Отдать видеокарте текстуры модели заранее. Иначе они уходят все разом в том кадре, где модель впервые показалась
   * (у рыбы их три), и этот кадр выходит долгим — рывок в самом начале вываживания. В игре — по одной текстуре за кадр;
   * за заставкой (warmFast) и в фоновой вкладке спешить можно: сколько успеем за 10 мс, потом уступаем странице.
   * Возвращает обещание: готово, когда все текстуры модели у видеокарты.
   */
  warm(root) {
    const list = [];
    const seen = new Set();
    root.traverse((o) => {
      for (const m of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) {
        for (const k of TEX_SLOTS) {
          const t = m[k];
          if (t && t.isTexture && !t.isRenderTargetTexture && t.image && (t.image.width || t.image.data) && !seen.has(t)) {
            seen.add(t);
            list.push(t);
          }
        }
      }
    });
    if (!list.length) return Promise.resolve(0);
    return new Promise((ok) => {
      this.warmQ.push({ list, ok, n: list.length });
      this.pump();
    });
  }
  pump() {
    if (this.pumping) return;
    this.pumping = true;
    const fast = () => this.warmFast || document.hidden;
    const again = () => (fast() ? yieldNow().then(tick) : nextFrame(tick));
    const tick = () => {
      const t0 = performance.now();
      do {
        const job = this.warmQ[0];
        if (!job) {
          this.pumping = false;
          return;
        }
        try {
          this.renderer.initTexture(job.list.pop());
        } catch (e) {
          /* эта текстура загрузится при первом показе */
        }
        this.warmed++;
        if (!job.list.length) {
          this.warmQ.shift();
          job.ok(job.n);
        }
      } while (fast() && performance.now() - t0 < 10);
      again();
    };
    again();
  }
  /**
   * Перед первым кадром: собрать шейдеры всей сцены (shaders) и отдать текстуры видеокарте — иначе всё это случится
   * рывками уже в игре, когда предмет впервые попадёт в кадр. onStep(доля) — для полосы загрузки.
   */
  async prepare(scene, camera, onStep = () => {}, extra = []) {
    const r = this.renderer;
    await this.shaders(scene, camera);
    onStep(0.5);
    const seen = new Set();
    const take = (t) => {
      if (t && t.isTexture && !t.isRenderTargetTexture && t.image && (t.image.width || t.image.data)) seen.add(t);
    };
    for (const t of extra) take(t);
    scene.traverse((o) => {
      for (const m of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) {
        for (const k of TEX_SLOTS) take(m[k]);
        if (m.uniforms) for (const u of Object.values(m.uniforms)) take(u && u.value);
      }
    });
    let i = 0;
    for (const t of seen) {
      try {
        r.initTexture(t);
      } catch (e) {
        /* эта текстура загрузится при первом показе */
      }
      if (++i % 6 === 0) {
        onStep(0.5 + (0.5 * i) / seen.size);
        await yieldNow();
      }
    }
    onStep(1);
    return seen.size;
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
    for (const t of [p.scene, ...p.down, ...p.up, p.ao, p.aoB, p.refl]) t.dispose();
    p.scene.depthTexture.dispose();
    for (const m of [p.pre, p.downM, p.upM, p.final, p.aoM, p.aoBlurM]) m.dispose();
    p.quad.dispose();
    this.post = null;
    this.reflOk = false;
    if (this.water) {
      this.water.uRefl.value = null;
      this.water.uReflK.value = 0;
    }
  }
  ensurePost() {
    if (this.post) return;
    const half = { type: THREE.HalfFloatType, depthBuffer: false };
    const one = { format: THREE.RGBAFormat, type: THREE.UnsignedByteType, depthBuffer: false };
    const p = (this.post = {
      // сцена со сглаживанием; её глубина нужна затенению в углах
      scene: new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4, depthTexture: new THREE.DepthTexture(4, 4, THREE.UnsignedIntType) }),
      ao: new THREE.WebGLRenderTarget(4, 4, one),
      aoB: new THREE.WebGLRenderTarget(4, 4, one),
      aoM: mk(AO, { tDepth: { value: null }, uTexel: { value: new THREE.Vector2() }, uProj: { value: new THREE.Vector4() }, uRS: { value: new THREE.Vector2(AO_RS[0], AO_RS[1]) } }),
      aoBlurM: mk(AOBLUR, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } }),
      // отражение мира в воде: половина разрешения, без сглаживания
      refl: new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType }),
      down: Array.from({ length: LEVELS }, () => new THREE.WebGLRenderTarget(4, 4, half)),
      up: Array.from({ length: LEVELS - 1 }, () => new THREE.WebGLRenderTarget(4, 4, half)),
      pre: mk(PRE, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: 1.0 } }),
      downM: mk(DOWN, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } }),
      upM: mk(UP, { tSrc: { value: null }, tAdd: { value: null }, uTexel: { value: new THREE.Vector2() } }),
      final: mk(FINAL, { tScene: { value: null }, tBloom: { value: null }, tAO: { value: null }, uBloom: { value: 0.115 }, uVig: { value: 0.32 }, uAO: { value: AO_K } }),
      quad: new FullScreenQuad(null)
    });
    p.final.uniforms.tScene.value = p.scene.texture;
    p.final.uniforms.tBloom.value = p.up[0].texture;
    p.final.uniforms.tAO.value = p.aoB.texture;
    p.aoM.uniforms.tDepth.value = p.scene.depthTexture;
    p.aoBlurM.uniforms.tSrc.value = p.ao.texture;
    for (const t of [p.ao, p.aoB]) t.texture.minFilter = t.texture.magFilter = THREE.LinearFilter;
    this.sizePost();
  }
  sizePost() {
    const p = this.post;
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    p.scene.setSize(size.x, size.y);
    const hw = Math.max(2, Math.round(size.x / 2));
    const hh = Math.max(2, Math.round(size.y / 2));
    for (const t of [p.ao, p.aoB]) t.setSize(hw, hh);
    this.sizeRefl();
    p.aoM.uniforms.uTexel.value.set(1 / hw, 1 / hh);
    p.aoBlurM.uniforms.uTexel.value.set(1 / hw, 1 / hh);
    let w = Math.max(2, Math.round(size.x / 4));
    let h = Math.max(2, Math.round(size.y / 4));
    for (let i = 0; i < LEVELS; i++) {
      p.down[i].setSize(w, h);
      if (i < LEVELS - 1) p.up[i].setSize(w, h);
      w = Math.max(2, Math.round(w / 2));
      h = Math.max(2, Math.round(h / 2));
    }
  }
  /**
   * Вода отражает мир: water — её униформы (uRefl, uReflM, uReflK), hide — что в отражении рисовать не надо
   * (сама вода, пена, руки с удочкой, трава).
   */
  setReflection(water, hide = []) {
    this.water = water;
    this.reflHide = hide;
  }
  /**
   * Отражение: сцена глазами камеры, отражённой в плоскости воды (y = 0), в буфер половинного размера.
   * Математика — как у Reflector из three.js: зеркальная камера, матрица для выборки из буфера и «косая» ближняя
   * плоскость по воде (всё, что под водой, в отражение не попадает). Тени берутся готовые, из основного кадра.
   */
  mirrorState() {
    return (this.mirror ||= {
      cam: new THREE.PerspectiveCamera(), n: new THREE.Vector3(0, 1, 0), v: new THREE.Vector3(), t: new THREE.Vector3(), cw: new THREE.Vector3(),
      rot: new THREE.Matrix4(), plane: new THREE.Plane(), at: new THREE.Vector3(0, -0.06, 0), clip: new THREE.Vector4(), q: new THREE.Vector4(),
      dir: new THREE.Vector3(), pos: new THREE.Vector3(), fwd: new THREE.Vector3(0, 0, -1)
    });
  }
  /** Отражение снято из другого места или под другим углом (игрока перенесло, резкий разворот) — ждать своей очереди нельзя. */
  reflectionStale(camera) {
    const M = this.mirrorState();
    M.cw.setFromMatrixPosition(camera.matrixWorld);
    M.dir.set(0, 0, -1).transformDirection(camera.matrixWorld);
    return M.dir.dot(M.fwd) < REFL_TURN || M.cw.distanceToSquared(M.pos) > 2.25;
  }
  renderReflection(scene, camera) {
    const r = this.renderer;
    const p = this.post;
    const M = this.mirrorState();
    const c = M.cam;
    M.cw.setFromMatrixPosition(camera.matrixWorld);
    if (M.cw.y < 0.05) return false; // камера у самой воды или под ней — отражать нечего
    M.v.copy(M.cw).negate().reflect(M.n).negate(); // точка камеры, отражённая в плоскости y = 0
    M.rot.extractRotation(camera.matrixWorld);
    M.dir.set(0, 0, -1).applyMatrix4(M.rot);
    M.t.copy(M.dir).add(M.cw).negate().reflect(M.n).negate();
    M.pos.copy(M.cw); // откуда и куда смотрели, когда снимали отражение: по ним видно, не устарело ли оно
    M.fwd.copy(M.dir);
    c.position.copy(M.v);
    c.up.set(0, 1, 0).applyMatrix4(M.rot).reflect(M.n);
    c.lookAt(M.t);
    c.near = camera.near;
    c.far = camera.far;
    c.updateMatrixWorld();
    // обзор чуть шире, чем у игрока: отражение снимается через кадр, и при повороте головы у края экрана нужен запас
    c.projectionMatrix.copy(camera.projectionMatrix);
    for (const i of [0, 5, 8, 9]) c.projectionMatrix.elements[i] /= REFL_WIDE;
    c.projectionMatrixInverse.copy(c.projectionMatrix).invert();
    const tm = this.water.uReflM.value;
    tm.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(c.projectionMatrix).multiply(c.matrixWorldInverse);
    // ближняя плоскость — по воде (чуть ниже, чтобы у кромки не было щели)
    M.plane.setFromNormalAndCoplanarPoint(M.n, M.at).applyMatrix4(c.matrixWorldInverse);
    M.clip.set(M.plane.normal.x, M.plane.normal.y, M.plane.normal.z, M.plane.constant);
    const e = c.projectionMatrix.elements;
    M.q.set((Math.sign(M.clip.x) + e[8]) / e[0], (Math.sign(M.clip.y) + e[9]) / e[5], -1, (1 + e[10]) / e[14]);
    M.clip.multiplyScalar(2 / M.clip.dot(M.q));
    e[2] = M.clip.x;
    e[6] = M.clip.y;
    e[10] = M.clip.z + 1 - 0.003;
    e[14] = M.clip.w;
    const was = this.reflHide.map((o) => o.visible);
    for (const o of this.reflHide) o.visible = false;
    const auto = r.shadowMap.autoUpdate;
    r.shadowMap.autoUpdate = false;
    r.setRenderTarget(p.refl);
    r.render(scene, c);
    r.shadowMap.autoUpdate = auto;
    this.reflHide.forEach((o, i) => (o.visible = was[i]));
    return true;
  }
  render(scene, camera, exposure = 1) {
    const r = this.renderer;
    r.info.reset();
    r.toneMappingExposure = exposure;
    const W = this.water;
    if (this.quality !== 'high' || !this.canPost) {
      if (W) W.uReflK.value = 0;
      this.holdRefl = false;
      return r.render(scene, camera);
    }
    this.ensurePost();
    const p = this.post;
    // 0) отражение в воде — через кадр: мир в нём почти не меняется, а рисовать сцену второй раз дорого.
    // Выборка идёт по матрице того кадра, в котором отражение снято, так что при повороте камеры оно не «плывёт».
    this.frame = (this.frame || 0) + 1;
    camera.updateWorldMatrix(true, false);
    if (W && !this.reflect) W.uReflK.value = 0;
    else if (this.holdRefl) this.holdRefl = false; // этот кадр — без нового отражения (см. lightSets в main.js): вода покажет прошлое
    else if (W && (this.frame & 1 || !this.reflOk || this.reflectionStale(camera))) {
      this.reflOk = this.renderReflection(scene, camera);
      W.uRefl.value = p.refl.texture;
      W.uReflK.value = this.reflOk ? 1 : 0;
    }
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
    // 3) затенение в углах: глубина сцены → половинный буфер → размытие
    p.final.uniforms.uAO.value = this.aoK;
    if (this.aoK > 0) {
      const e = camera.projectionMatrix.elements;
      p.aoM.uniforms.uProj.value.set(1 / e[0], 1 / e[5], camera.near, camera.far);
      pass(p.aoM, p.ao);
      pass(p.aoBlurM, p.aoB);
    }
    // 4) на экран
    pass(p.final, null);
  }
}
