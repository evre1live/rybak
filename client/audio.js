// Звук игры: записи (сделаны в ElevenLabs, обработаны tools/sounds.py) и синтез в браузере.
//
// Записи лежат в public/audio: четыре отдельных файла (всплеск, поплавок на воде, трещотка катушки, обрыв лески),
// общая дорожка коротких звуков sfx.webm (шаги, поклёвка, подсечка, монеты, щелчки…) и петли loop-*.webm
// (море, дождь, ветер, сверчки, мотор, водопад, костёр). Где в дорожке лежит какой звук и откуда докуда крутить
// петлю, записано в sounds.json — он попадает в сборку. Записи догружаются после первого нажатия, петли — когда
// впервые понадобятся. Пока записи нет (не успела, браузер не умеет её читать, её нет в этой сборке) — играет
// синтез: каждый звук сначала пробует запись и только потом синтезирует. Сигналы игроку — поклёвка, опасность,
// удача — остаются синтезом: они в тон музыке, которую сочиняет сама игра (music.js).
import { settings } from './profile.js';
import { Music } from './music.js';
import SOUNDS from '../public/audio/sounds.json';

const SFX = SOUNDS.sfx || {}; // имя → [[начало, длина], …] в общей дорожке; несколько пар — варианты одного звука
const LOOPS = SOUNDS.loops || {}; // имя → { file, start, end }
const SAMPLES = { splash: 'audio/splash.webm', plop: 'audio/plop.webm', reel: 'audio/reel.webm', snap: 'audio/snap.webm' };
if (Object.keys(SFX).length) SAMPLES.sfx = 'audio/sfx.webm';
const rnd = (a, b) => a + Math.random() * (b - a);
// где в записи трещотки начинаются отдельные щелчки (секунды) — из неё же берутся одиночные щелчки подмотки
const REEL_CLICKS = [0.021, 0.064, 0.107, 0.16, 0.213, 0.267, 0.32, 0.373, 0.416, 0.48, 0.565, 0.629, 0.704];

export class Audio2 {
  constructor() {
    this.ctx = null;
    this.night = 0;
    this.tension = null;
  }
  /** Запуск по первому нажатию — раньше браузер не разрешит. */
  start() {
    if (this.ctx) {
      if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = (this.ctx = new AC());
    this.master = c.createGain();
    // предохранитель: несколько громких звуков разом не должны хрипеть
    const lim = c.createDynamicsCompressor();
    lim.threshold.value = -9;
    lim.knee.value = 8;
    lim.ratio.value = 12;
    lim.attack.value = 0.003;
    lim.release.value = 0.2;
    this.master.connect(lim);
    lim.connect(c.destination);
    this.sfx = c.createGain();
    this.sfx.connect(this.master);
    this.amb = c.createGain();
    this.amb.connect(this.master);
    this.mus = c.createGain();
    this.mus.connect(this.master);
    this.buf = {};
    this.beds = {}; // петли: имя → { st, buf, src, g, pan, idle }
    this.lastV = {}; // какой вариант звука играл в прошлый раз — чтобы не повторять подряд
    this.loadSamples();
    const len = c.sampleRate * 2;
    this.noise = c.createBuffer(1, len, c.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.applyVolume();
    this.startAmbient();
    // музыка расписывается на полсекунды вперёд; вкладка скрыта или громкость на нуле — молчит
    this.music = new Music(c, this.mus);
    setInterval(() => {
      if (!document.hidden && c.state === 'running' && settings.music > 0.01) this.music.plan(c.currentTime + 0.6);
    }, 140);
  }
  applyVolume() {
    if (!this.ctx) return;
    this.master.gain.value = settings.master;
    this.sfx.gain.value = settings.sfx;
    this.amb.gain.value = settings.amb;
    this.mus.gain.value = settings.music;
  }
  /** Настроение музыки: { fight, tension, run, boss, night, rain } — см. music.js. */
  mood(m) {
    if (this.music) this.music.set(m);
  }
  /** Запись по адресу url → звук, готовый к игре, или null (нет файла, нет сети, браузер не умеет читать). */
  fetchBuf(url) {
    const c = this.ctx;
    // в пробной версии одним файлом записи лежат прямо в странице (window.RYBAK_AUDIO: имя файла без расширения → base64): сети у неё нет
    const inl = typeof window !== 'undefined' && window.RYBAK_AUDIO;
    let bytes;
    if (inl) {
      const b64 = inl[url.replace(/^.*\//, '').replace(/\.webm$/, '')];
      if (!b64) return Promise.resolve(null);
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      bytes = Promise.resolve(u8.buffer);
    } else bytes = fetch(url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))));
    return bytes
      .then((ab) => new Promise((ok, no) => {
        const p = c.decodeAudioData(ab, ok, no); // старые браузеры понимают только обратные вызовы
        if (p && p.catch) p.catch(no);
      }))
      .catch(() => null);
  }
  loadSamples() {
    for (const [name, url] of Object.entries(SAMPLES)) {
      this.fetchBuf(url).then((b) => {
        this.buf[name] = b; // null — записи нет, останется синтез
      });
    }
  }
  /**
   * Короткий звук name из общей дорожки. vol — громкость, rate — скорость (и высота), delay — через сколько, pan — левее (−1)
   * или правее (1), amb — играть как звук окружения (его громкость — ползунок «Море, чайки, ветер»), v — номер варианта.
   * Вариантов несколько — берётся случайный, но не тот, что в прошлый раз. Нет записи — false: тогда вызывающий играет синтез.
   */
  one(name, { vol = 1, rate = 1, delay = 0, pan = 0, amb = false, v = -1 } = {}) {
    const list = SFX[name];
    const b = this.ctx && this.buf.sfx;
    if (!list || !b) return false;
    let i = v;
    if (i < 0 || i >= list.length) {
      i = Math.floor(Math.random() * list.length);
      if (list.length > 1 && i === this.lastV[name]) i = (i + 1) % list.length;
      this.lastV[name] = i;
    }
    const [at, dur] = list[i];
    const c = this.ctx;
    const s = c.createBufferSource();
    s.buffer = b;
    s.playbackRate.value = rate;
    const g = c.createGain();
    g.gain.value = vol;
    s.connect(g);
    let out = g;
    if (pan && c.createStereoPanner) {
      out = c.createStereoPanner();
      out.pan.value = pan;
      g.connect(out);
    }
    out.connect(amb ? this.amb : this.sfx);
    s.start(c.currentTime + delay, at, dur);
    return true;
  }
  /**
   * Петля name: vol — громкость (0 — молчит), rate — скорость, pan — левее или правее, sfx — играть как звук рыбалки
   * (иначе — как звук окружения), tc — за сколько секунд громкость дойдёт до заданной. Запись подгружается, когда петля
   * впервые понадобилась. Пока записи нет (или её нет вовсе) — false: тогда вызывающий играет синтез.
   */
  bed(name, vol, { rate = 1, pan = 0, sfx = false, tc = 0.4 } = {}) {
    const m = LOOPS[name];
    if (!m || !this.ctx) return false;
    const L = this.beds[name] || (this.beds[name] = { st: 0, buf: null, src: null, g: null, pan: null, idle: 0 });
    if (L.st === 0) {
      if (vol <= 0.001) return false;
      L.st = 1;
      this.fetchBuf('audio/' + m.file).then((b) => {
        L.buf = b;
        L.st = b ? 2 : 3;
      });
    }
    if (L.st !== 2) return false;
    const c = this.ctx;
    const t = c.currentTime;
    if (!L.src) {
      if (vol <= 0.001) return true;
      const s = c.createBufferSource();
      s.buffer = L.buf;
      s.loop = true;
      s.loopStart = m.start;
      s.loopEnd = m.end;
      const g = c.createGain();
      g.gain.value = 0;
      s.connect(g);
      let out = g;
      if (c.createStereoPanner && m.ch === 1) {
        out = L.pan = c.createStereoPanner();
        g.connect(out);
      }
      out.connect(sfx ? this.sfx : this.amb);
      s.start(0, m.start + Math.random() * (m.end - m.start)); // каждый раз с другого места: начало петли не узнаётся
      L.src = s;
      L.g = g;
      L.idle = 0;
    }
    L.g.gain.setTargetAtTime(vol, t, tc);
    L.src.playbackRate.setTargetAtTime(rate, t, 0.12);
    if (L.pan) L.pan.pan.setTargetAtTime(pan, t, 0.15);
    // давно молчит — убираем источник, чтобы не крутился зря
    L.idle = vol > 0.001 ? 0 : L.idle + 1;
    if (L.idle > 600) {
      L.src.stop();
      L.g.disconnect();
      if (L.pan) L.pan.disconnect();
      L.src = L.g = L.pan = null;
    }
    return true;
  }
  /**
   * Сыграть запись name. vol — громкость, rate — скорость (и высота), at/dur — кусок записи (секунды), delay — через сколько.
   * Нет записи — false: тогда вызывающий играет синтез.
   */
  play(name, { vol = 1, rate = 1, at = 0, dur = 0, delay = 0 } = {}) {
    const b = this.ctx && this.buf[name];
    if (!b) return false;
    const c = this.ctx;
    const t = c.currentTime + delay;
    const s = c.createBufferSource();
    s.buffer = b;
    s.playbackRate.value = rate;
    const g = c.createGain();
    g.gain.value = vol;
    s.connect(g);
    g.connect(this.sfx);
    if (dur) {
      g.gain.setValueAtTime(vol, t + (dur * 0.6) / rate);
      g.gain.linearRampToValueAtTime(0.0001, t + dur / rate);
      s.start(t, at, dur);
    } else s.start(t, at);
    return true;
  }
  src(loop = false) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise;
    s.loop = loop;
    return s;
  }
  startAmbient() {
    const c = this.ctx;
    // прибой: шум через фильтр, громкость дышит
    const mk = (type, freq, q, gain, lfoHz, depth) => {
      const s = this.src(true);
      const f = c.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = c.createGain();
      g.gain.value = gain;
      const lfo = c.createOscillator();
      lfo.frequency.value = lfoHz;
      const lg = c.createGain();
      lg.gain.value = depth;
      lfo.connect(lg);
      lg.connect(g.gain);
      s.connect(f);
      f.connect(g);
      g.connect(this.amb);
      s.start();
      lfo.start();
      return { s, g, lfo, lg };
    };
    let surf = [mk('lowpass', 420, 0.5, 0.2, 0.09, 0.09), mk('bandpass', 1300, 0.7, 0.045, 0.23, 0.035), mk('bandpass', 260, 0.4, 0.05, 0.05, 0.03)];
    this.bed('waves', 0.4); // запись прибоя начинает грузиться сразу
    const loop = () => {
      if (!this.ctx) return;
      const t = c.currentTime;
      // море: как только запись прибоя загрузилась, она сменяет синтез
      if (surf && this.bed('waves', 0.4, { tc: 1.5 })) {
        const old = surf;
        surf = null;
        for (const n of old) {
          n.g.gain.setTargetAtTime(0, t, 1);
          n.lg.gain.setTargetAtTime(0, t, 1);
        }
        setTimeout(() => old.forEach((n) => (n.s.stop(), n.lfo.stop(), n.g.disconnect())), 6000);
      }
      if (this.night < 0.5 && Math.random() < 0.5 * (1 - (this.wet || 0))) this.gull(t);
      // сверчки: ночью — запись, а пока её нет — синтез
      const crickets = this.bed('crickets', this.night > 0.4 ? 0.075 * this.night * (1 - 0.7 * (this.wet || 0)) : 0, { tc: 2.5 });
      if (this.night > 0.4 && !crickets) this.cricket(t);
      setTimeout(loop, this.night > 0.4 ? 700 + Math.random() * 900 : 3500 + Math.random() * 7000);
    };
    setTimeout(loop, 2500);
  }
  gull(t) {
    const c = this.ctx;
    // запись: один-два крика где-то в стороне, каждый раз чуть другой высоты
    const side = rnd(-0.8, 0.8);
    if (this.one('gull', { vol: rnd(0.1, 0.22), rate: rnd(0.92, 1.1), pan: side, amb: true })) {
      if (Math.random() < 0.45) this.one('gull', { vol: rnd(0.08, 0.16), rate: rnd(0.92, 1.1), pan: side, amb: true, delay: rnd(0.55, 1.1) });
      return;
    }
    const n = 2 + Math.floor(Math.random() * 3);
    const pan = c.createStereoPanner ? c.createStereoPanner() : null;
    if (pan) {
      pan.pan.value = Math.random() * 1.6 - 0.8;
      pan.connect(this.amb);
    }
    for (let i = 0; i < n; i++) {
      const o = c.createOscillator();
      const g = c.createGain();
      const t0 = t + i * 0.32;
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(1500, t0);
      o.frequency.exponentialRampToValueAtTime(2100, t0 + 0.07);
      o.frequency.exponentialRampToValueAtTime(1250, t0 + 0.26);
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 2000;
      f.Q.value = 3;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.03, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.27);
      o.connect(f);
      f.connect(g);
      g.connect(pan || this.amb);
      o.start(t0);
      o.stop(t0 + 0.3);
    }
  }
  cricket(t) {
    const c = this.ctx;
    for (let i = 0; i < 4; i++) {
      const o = c.createOscillator();
      const g = c.createGain();
      const t0 = t + i * 0.055;
      o.frequency.value = 4300 + Math.random() * 300;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.012 * this.night, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04);
      o.connect(g);
      g.connect(this.amb);
      o.start(t0);
      o.stop(t0 + 0.05);
    }
  }
  // короткий тон
  tone(freq, dur, type = 'sine', vol = 0.2, to = null, delay = 0) {
    if (!this.ctx) return;
    const c = this.ctx;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  burst(dur, type, f0, f1, vol = 0.3, q = 1, delay = 0) {
    if (!this.ctx) return;
    const c = this.ctx;
    const t = c.currentTime + delay;
    const s = this.src();
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(this.sfx);
    s.start(t, Math.random());
    s.stop(t + dur + 0.02);
  }
  ui() {
    if (!this.one('ui', { v: 0, vol: 0.3, rate: rnd(0.96, 1.05) })) this.tone(720, 0.05, 'triangle', 0.07);
  }
  /** Открыли журнал, задания, справку — шелест страницы. */
  page() {
    this.one('page', { vol: 0.32, rate: rnd(0.95, 1.08) });
  }
  /** Снимок на открытку. */
  shutter() {
    if (!this.one('shutter', { vol: 0.6 })) this.burst(0.03, 'highpass', 3000, 2000, 0.14);
  }
  cast() {
    if (!this.one('cast', { vol: 0.5, rate: rnd(0.95, 1.06) })) this.burst(0.3, 'bandpass', 500, 2800, 0.22, 1.2);
    this.reelTicks(6, 0.03);
  }
  reelTicks(n, gap) {
    for (let i = 0; i < n; i++) this.tick(i * gap);
  }
  /** Один щелчок катушки: случайный щелчок из записи трещотки, чуть разной высоты. */
  tick(delay = 0) {
    const k = REEL_CLICKS[Math.floor(Math.random() * REEL_CLICKS.length)];
    if (!this.play('reel', { vol: 0.34, rate: 0.9 + Math.random() * 0.24, at: Math.max(0, k - 0.004), dur: 0.042, delay })) this.burst(0.012, 'highpass', 3000, 3000, 0.09, 1, delay);
  }
  /** Трещотка фрикциона: рыба стягивает леску. k — сила от 0 до 1 (0 — тихо). Без записи звука нет. */
  drag(k) {
    if (!this.ctx) return;
    const c = this.ctx;
    if (!this.dragN) {
      const b = this.buf.reel;
      if (!b || k <= 0) return;
      const s = c.createBufferSource();
      s.buffer = b;
      s.loop = true;
      s.loopStart = REEL_CLICKS[0];
      s.loopEnd = REEL_CLICKS[REEL_CLICKS.length - 1];
      const g = c.createGain();
      g.gain.value = 0;
      s.connect(g);
      g.connect(this.sfx);
      s.start(0, s.loopStart);
      this.dragN = { s, g, idle: 0 };
    }
    const d = this.dragN;
    d.g.gain.setTargetAtTime(k * 0.3, c.currentTime, 0.04);
    d.s.playbackRate.setTargetAtTime(0.85 + k * 0.45, c.currentTime, 0.08);
    // долго молчит — убираем источник, чтобы не крутился зря
    d.idle = k > 0 ? 0 : d.idle + 1;
    if (d.idle > 240) {
      d.s.stop();
      this.dragN = null;
    }
  }
  splash(p = 1, vol = 1) {
    // запись всплеска: крупный — ниже и громче, мелкий — выше и тише; каждый раз чуть другой
    const pp = Math.min(1.3, p);
    if (this.play('splash', { vol: (0.2 + 0.55 * pp) * vol, rate: (1.32 - 0.4 * pp) * (0.94 + Math.random() * 0.12) })) {
      if (p > 0.7) this.tone(120, 0.2, 'sine', 0.14 * p * vol, 55);
      return;
    }
    this.burst(0.35 + p * 0.25, 'bandpass', 2200, 500, 0.28 * p * vol, 0.8);
    this.tone(150, 0.16, 'sine', 0.2 * p * vol, 60);
  }
  /** Поплавок или приманка упали на воду. */
  plop() {
    if (!this.play('plop', { vol: 0.75, rate: 0.94 + Math.random() * 0.12 })) this.splash(0.5);
  }
  nibble() {
    if (!this.one('nibble', { vol: 0.42, rate: rnd(0.94, 1.08) })) this.tone(640, 0.05, 'sine', 0.09, 420);
  }
  bite() {
    // сигнал поклёвки — синтез: его надо узнавать сразу; под ним — запись: поплавок ушёл под воду
    this.tone(880, 0.28, 'sine', 0.26);
    this.tone(1320, 0.35, 'sine', 0.2, null, 0.08);
    if (!this.one('bite', { vol: 0.6 })) this.splash(0.5);
  }
  hook() {
    if (this.one('hook', { vol: 0.62, rate: rnd(0.96, 1.05) })) return this.tone(330, 0.12, 'triangle', 0.09, 660);
    this.burst(0.14, 'bandpass', 900, 2600, 0.22, 2);
    this.tone(330, 0.12, 'triangle', 0.16, 660);
  }
  /** Рыба рванула или забилась у поверхности. p — сила от 0 до 1. */
  thrash(p = 0.6) {
    if (!this.one('thrash', { vol: 0.3 + 0.35 * p, rate: rnd(0.92, 1.08) })) this.splash(p);
  }
  /** Рыба вытащена: подсак из воды или, если подсака нет, хвостом по доскам. */
  landed(net) {
    if (net) return this.one('net', { vol: 0.5, rate: rnd(0.96, 1.05) });
    if (this.one('flop', { vol: 0.42 })) this.one('flop', { vol: 0.3, delay: rnd(0.22, 0.34) });
  }
  /** Улов лёг в садок. */
  keep() {
    this.one('keep', { vol: 0.5, rate: rnd(0.96, 1.05) });
  }
  warn() {
    this.tone(554, 0.09, 'square', 0.07); // до-диез: в ре мажоре звучит настороженно, но не фальшиво
    this.tone(554, 0.09, 'square', 0.07, null, 0.13);
  }
  /** Легенда собралась с силами: низкий гул и всплеск. */
  rage() {
    this.play('splash', { vol: 0.85, rate: 0.6 }); // тот же всплеск, но ниже и тяжелее
    this.tone(70, 0.7, 'sawtooth', 0.22, 38);
    this.tone(140, 0.5, 'triangle', 0.16, 60, 0.04);
    this.burst(0.7, 'lowpass', 900, 200, 0.3, 0.7);
  }
  /** Рыба залегла на дно: глухой удар. */
  stuck() {
    this.tone(95, 0.22, 'sine', 0.24, 55);
    this.burst(0.12, 'lowpass', 400, 160, 0.16);
    this.one('bubbles', { vol: 0.36, rate: rnd(0.9, 1.05), delay: 0.08 });
  }
  /** Оторвали от дна. */
  unstuck() {
    this.tone(260, 0.12, 'triangle', 0.14, 520);
    this.splash(0.5);
  }
  /** Леска зашла за камни: скрежет и звон. */
  wrap() {
    if (this.one('scrape', { vol: 0.5, rate: rnd(0.95, 1.08) })) return;
    this.burst(0.22, 'bandpass', 1800, 700, 0.2, 6);
    this.tone(740, 0.2, 'sawtooth', 0.1, 520);
  }
  /** Свеча: короткий сигнал «отпусти». */
  leap() {
    this.tone(980, 0.07, 'square', 0.08);
    this.tone(740, 0.12, 'square', 0.08, null, 0.08);
  }
  snap() {
    if (this.play('snap', { vol: 0.8 })) return this.tone(180, 0.3, 'sine', 0.2, 70, 0.04);
    this.tone(1100, 0.16, 'sawtooth', 0.22, 160);
    this.burst(0.12, 'highpass', 2000, 800, 0.2);
    this.tone(180, 0.3, 'sine', 0.2, 70, 0.05);
  }
  fail() {
    this.tone(330, 0.18, 'triangle', 0.16, 220);
    this.tone(220, 0.3, 'triangle', 0.14, 150, 0.16);
  }
  catch(rar = 0) {
    const notes = [587.3, 740, 880, 1174.7, 1480, 1760, 2349.3]; // ре мажор — в тон музыке
    const n = 3 + Math.min(4, rar);
    for (let i = 0; i < n; i++) this.tone(notes[i], 0.22 + (i === n - 1 ? 0.3 : 0), 'triangle', 0.16, null, i * 0.085);
    if (rar >= 3) for (let i = 0; i < 6; i++) this.tone(2000 + Math.random() * 2000, 0.12, 'sine', 0.05, null, 0.5 + i * 0.07);
  }
  coin(n = 1) {
    for (let i = 0; i < Math.min(5, n); i++) {
      // запись звона монеты: несколько подряд, каждая чуть выше — горсть
      if (this.one('coin', { vol: 0.3, rate: 0.96 + i * 0.05 + Math.random() * 0.04, delay: i * 0.075 })) continue;
      this.tone(1319, 0.07, 'square', 0.06, null, i * 0.07);
      this.tone(1760, 0.16, 'square', 0.06, null, i * 0.07 + 0.05);
    }
  }
  buy() {
    if (this.one('buy', { vol: 0.5 })) return;
    this.tone(660, 0.08, 'triangle', 0.14);
    this.tone(990, 0.2, 'triangle', 0.14, null, 0.08);
    this.burst(0.06, 'highpass', 4000, 4000, 0.1, 1, 0.02);
  }
  /** Задание выполнено: колокольчики. Запись звучит в до мажоре — играем её на тон выше, в ре мажоре, в тон музыке. */
  jingle() {
    this.one('jingle', { vol: 0.34, rate: 1.1225 });
  }
  /** Турнир объявлен: рында. Чуть ниже записи — главный тон приходится на си, в ре мажоре он на месте. */
  bell() {
    if (this.one('bell', { vol: 0.45, rate: 0.956 })) return;
    this.tone(523, 0.12, 'triangle', 0.14);
    this.tone(784, 0.2, 'triangle', 0.14, null, 0.14);
  }
  /** Турнир начался: гудок. Запись настроена на фа-диез (на пятую долю тона выше — опускаем). */
  horn() {
    if (!this.one('horn', { vol: 0.42, rate: 0.9874 })) this.tone(880, 0.3, 'triangle', 0.16);
  }
  /** Лодка покачивается: скрип дерева. */
  creak() {
    this.one('creak', { vol: rnd(0.16, 0.28), rate: rnd(0.9, 1.1), pan: rnd(-0.3, 0.3) });
  }
  level() {
    [587.3, 740, 880, 1174.7, 880, 1174.7, 1480].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.15, null, i * 0.09)); // ре мажор — в тон музыке
  }
  error() {
    if (!this.one('error', { vol: 0.42 })) this.tone(170, 0.14, 'sawtooth', 0.08);
  }
  step(wood, heavy) {
    if (!this.ctx) return;
    // записи: доски причала и песок, по нескольку разных шагов; heavy — спрыгнул или шагнул в лодку
    const side = rnd(-0.12, 0.12);
    if (wood && heavy && this.one('land', { vol: 0.5, rate: rnd(0.92, 1.06) })) return;
    if (wood && !heavy && this.one('step_wood', { vol: 0.3, rate: rnd(0.93, 1.08), pan: side })) return;
    if (!wood && this.one('step_sand', { vol: heavy ? 0.5 : 0.24, rate: heavy ? rnd(0.78, 0.88) : rnd(0.94, 1.1), pan: side })) return;
    if (wood) {
      this.burst(0.07, 'lowpass', 300, 140, heavy ? 0.5 : 0.28, 1.5);
      this.burst(0.02, 'bandpass', 1500, 900, 0.05, 2);
    } else this.burst(0.09, 'bandpass', 900, 500, heavy ? 0.16 : 0.09, 0.7);
  }
  /** Лодка ткнулась в берег или камень. */
  thud(p = 1) {
    if (this.one('bump', { vol: 0.25 + 0.5 * p, rate: 1.12 - 0.22 * p })) return;
    this.burst(0.14, 'lowpass', 240, 90, 0.5 * p, 1.2);
    this.tone(95, 0.2, 'sine', 0.3 * p, 48);
  }
  /** Подвесной мотор: k от 0 (холостой ход) до 1 (полный); k < 0 — заглушить. */
  motor(k) {
    if (!this.ctx) return;
    const c = this.ctx;
    const t = c.currentTime;
    // запись мотора: на холостом ходу — ниже и тише, на полном — выше и громче. Пока её нет — синтез
    const rec = this.bed('motor', k < 0 ? 0 : 0.3 + 0.45 * k, { rate: 0.78 + 0.5 * Math.max(0, k), sfx: true, tc: 0.15 });
    if (k < 0 || rec) {
      const e = this.eng;
      if (!e) return;
      this.eng = null;
      e.g.gain.setTargetAtTime(0, t, 0.12);
      e.lg.gain.setTargetAtTime(0, t, 0.08);
      e.ng.gain.setTargetAtTime(0, t, 0.12);
      setTimeout(() => {
        for (const n of [e.o, e.o2, e.lfo, e.n]) n.stop();
      }, 700);
      return;
    }
    if (!this.eng) {
      // два генератора через фильтр — гул; громкость дрожит с частотой вспышек — «тарахтение»; шум — вода за кормой
      const o = c.createOscillator();
      o.type = 'sawtooth';
      const o2 = c.createOscillator();
      o2.type = 'square';
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.Q.value = 1.4;
      const g = c.createGain();
      g.gain.value = 0;
      const lfo = c.createOscillator();
      lfo.type = 'square';
      const lg = c.createGain();
      lfo.connect(lg);
      lg.connect(g.gain);
      o.connect(f);
      o2.connect(f);
      f.connect(g);
      g.connect(this.sfx);
      const n = this.src(true);
      const nf = c.createBiquadFilter();
      nf.type = 'bandpass';
      nf.frequency.value = 700;
      nf.Q.value = 0.6;
      const ng = c.createGain();
      ng.gain.value = 0;
      n.connect(nf);
      nf.connect(ng);
      ng.connect(this.sfx);
      for (const x of [o, o2, lfo, n]) x.start();
      this.eng = { o, o2, f, g, lfo, lg, n, ng };
    }
    const e = this.eng;
    const hz = 34 + k * 58;
    e.o.frequency.setTargetAtTime(hz, t, 0.12);
    e.o2.frequency.setTargetAtTime(hz * 0.5, t, 0.12);
    e.lfo.frequency.setTargetAtTime(9 + k * 30, t, 0.12);
    e.f.frequency.setTargetAtTime(240 + k * 820, t, 0.12);
    e.g.gain.setTargetAtTime(0.045 + k * 0.07, t, 0.1);
    e.lg.gain.setTargetAtTime(0.022 + k * 0.012, t, 0.1);
    e.ng.gain.setTargetAtTime(k * k * 0.1, t, 0.15);
  }
  /** Шум дождя: k — сила от 0 до 1 (0 — тихо). Шелест капель и глухой гул под ним; ветер добавляет свист. */
  rain(k, wind = 0) {
    if (!this.ctx) return;
    const c = this.ctx;
    const t = c.currentTime;
    // записи: дождь и ветер. Ветер слышен и без дождя, когда дует заметно
    const recRain = this.bed('rain', k < 0.02 ? 0 : k * 0.62, { tc: 0.6 });
    const recWind = this.bed('wind', Math.max(0, wind - 0.25) * 0.55, { tc: 1.5 });
    // гром: в сильный дождь, где-то вдалеке, каждый раз на другом расстоянии. Без записи грома нет
    if (k > 0.55) {
      if (!this.thunderAt) this.thunderAt = t + rnd(8, 30);
      else if (t > this.thunderAt) {
        this.thunderAt = t + rnd(28, 75);
        this.one('thunder', { vol: rnd(0.3, 0.8), rate: rnd(0.82, 1.08), pan: rnd(-0.6, 0.6), amb: true });
      }
    } else this.thunderAt = 0;
    if (recRain) {
      const r = this.rainN;
      if (!r) return;
      // запись дождя загрузилась — синтез уходит (свист ветра остаётся, пока нет записи ветра)
      for (const g of [r.hi, r.mid, r.low]) g.gain.setTargetAtTime(0, t, 0.5);
      r.wind.gain.setTargetAtTime(recWind ? 0 : Math.max(0, wind - 0.3) * 0.05, t, 1.2);
      return;
    }
    if (!this.rainN) {
      if (k < 0.02) return;
      const mk = (type, freq, q) => {
        const s = this.src(true);
        const f = c.createBiquadFilter();
        f.type = type;
        f.frequency.value = freq;
        f.Q.value = q;
        const g = c.createGain();
        g.gain.value = 0;
        s.connect(f);
        f.connect(g);
        g.connect(this.amb);
        s.start(0, Math.random() * 1.5);
        return g;
      };
      this.rainN = { hi: mk('highpass', 2600, 0.4), mid: mk('bandpass', 900, 0.5), low: mk('lowpass', 220, 0.6), wind: mk('bandpass', 520, 2.2) };
    }
    const r = this.rainN;
    r.hi.gain.setTargetAtTime(k * 0.085, t, 0.5);
    r.mid.gain.setTargetAtTime(k * 0.11, t, 0.5);
    r.low.gain.setTargetAtTime(k * 0.14, t, 0.5);
    r.wind.gain.setTargetAtTime(recWind ? 0 : Math.max(0, wind - 0.3) * 0.05, t, 1.2);
  }
  /**
   * Звук места: водопад, костёр. d — расстояние до него, far — откуда он уже слышен, side — левее (−1) или правее (1)
   * от взгляда. Без записи такого звука нет.
   */
  place(name, d, far, vol, side = 0) {
    const k = Math.max(0, 1 - d / far);
    this.bed(name, vol * k * k, { pan: side * Math.min(1, d / 6) * 0.75, tc: 0.3 });
  }
  /** Скрип лески: громче и выше с натяжением. T < 0 — выключить. */
  strain(T) {
    if (!this.ctx) return;
    const c = this.ctx;
    if (T < 0) {
      if (this.tension) {
        this.tension.g.gain.setTargetAtTime(0, c.currentTime, 0.05);
        const o = this.tension.o;
        setTimeout(() => o.stop(), 300);
        this.tension = null;
      }
      return;
    }
    if (!this.tension) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 6;
      const g = c.createGain();
      g.gain.value = 0;
      o.connect(f);
      f.connect(g);
      g.connect(this.sfx);
      o.start();
      this.tension = { o, f, g };
    }
    const k = Math.max(0, (T - 0.55) / 0.45);
    this.tension.o.frequency.setTargetAtTime(70 + T * 150, c.currentTime, 0.05);
    this.tension.f.frequency.setTargetAtTime(500 + T * 1600, c.currentTime, 0.05);
    this.tension.g.gain.setTargetAtTime(k * k * 0.11, c.currentTime, 0.05);
  }
}
