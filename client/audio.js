// Звук без файлов: всё синтезируется в браузере — море, чайки, сверчки, всплески, катушка, удачи и неудачи.
import { settings } from './profile.js';

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
    this.master.connect(c.destination);
    this.sfx = c.createGain();
    this.sfx.connect(this.master);
    this.amb = c.createGain();
    this.amb.connect(this.master);
    const len = c.sampleRate * 2;
    this.noise = c.createBuffer(1, len, c.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.applyVolume();
    this.startAmbient();
  }
  applyVolume() {
    if (!this.ctx) return;
    this.master.gain.value = settings.master;
    this.sfx.gain.value = settings.sfx;
    this.amb.gain.value = settings.amb;
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
      return g;
    };
    mk('lowpass', 420, 0.5, 0.2, 0.09, 0.09);
    mk('bandpass', 1300, 0.7, 0.045, 0.23, 0.035);
    mk('bandpass', 260, 0.4, 0.05, 0.05, 0.03);
    this.cricketG = c.createGain();
    this.cricketG.gain.value = 0;
    this.cricketG.connect(this.amb);
    const loop = () => {
      if (!this.ctx) return;
      const t = c.currentTime;
      if (this.night < 0.5 && Math.random() < 0.5 * (1 - (this.wet || 0))) this.gull(t);
      if (this.night > 0.4) this.cricket(t);
      setTimeout(loop, this.night > 0.4 ? 700 + Math.random() * 900 : 3500 + Math.random() * 7000);
    };
    setTimeout(loop, 2500);
  }
  gull(t) {
    const c = this.ctx;
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
    this.tone(720, 0.05, 'triangle', 0.07);
  }
  cast() {
    this.burst(0.3, 'bandpass', 500, 2800, 0.22, 1.2);
    this.reelTicks(6, 0.03);
  }
  reelTicks(n, gap) {
    for (let i = 0; i < n; i++) this.burst(0.012, 'highpass', 3200, 3200, 0.1, 1, i * gap);
  }
  tick() {
    this.burst(0.012, 'highpass', 3000, 3000, 0.09);
  }
  splash(p = 1, vol = 1) {
    this.burst(0.35 + p * 0.25, 'bandpass', 2200, 500, 0.28 * p * vol, 0.8);
    this.tone(150, 0.16, 'sine', 0.2 * p * vol, 60);
  }
  nibble() {
    this.tone(640, 0.05, 'sine', 0.09, 420);
  }
  bite() {
    this.tone(880, 0.28, 'sine', 0.26);
    this.tone(1320, 0.35, 'sine', 0.2, null, 0.08);
    this.splash(0.5);
  }
  hook() {
    this.burst(0.14, 'bandpass', 900, 2600, 0.22, 2);
    this.tone(330, 0.12, 'triangle', 0.16, 660);
  }
  warn() {
    this.tone(520, 0.09, 'square', 0.07);
    this.tone(520, 0.09, 'square', 0.07, null, 0.13);
  }
  snap() {
    this.tone(1100, 0.16, 'sawtooth', 0.22, 160);
    this.burst(0.12, 'highpass', 2000, 800, 0.2);
    this.tone(180, 0.3, 'sine', 0.2, 70, 0.05);
  }
  fail() {
    this.tone(330, 0.18, 'triangle', 0.16, 220);
    this.tone(220, 0.3, 'triangle', 0.14, 150, 0.16);
  }
  catch(rar = 0) {
    const notes = [523, 659, 784, 1047, 1319, 1568, 2093];
    const n = 3 + Math.min(4, rar);
    for (let i = 0; i < n; i++) this.tone(notes[i], 0.22 + (i === n - 1 ? 0.3 : 0), 'triangle', 0.16, null, i * 0.085);
    if (rar >= 3) for (let i = 0; i < 6; i++) this.tone(2000 + Math.random() * 2000, 0.12, 'sine', 0.05, null, 0.5 + i * 0.07);
  }
  coin(n = 1) {
    for (let i = 0; i < Math.min(5, n); i++) {
      this.tone(1319, 0.07, 'square', 0.06, null, i * 0.07);
      this.tone(1760, 0.16, 'square', 0.06, null, i * 0.07 + 0.05);
    }
  }
  buy() {
    this.tone(660, 0.08, 'triangle', 0.14);
    this.tone(990, 0.2, 'triangle', 0.14, null, 0.08);
    this.burst(0.06, 'highpass', 4000, 4000, 0.1, 1, 0.02);
  }
  level() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.15, null, i * 0.09));
  }
  error() {
    this.tone(170, 0.14, 'sawtooth', 0.08);
  }
  step(wood, heavy) {
    if (!this.ctx) return;
    if (wood) {
      this.burst(0.07, 'lowpass', 300, 140, heavy ? 0.5 : 0.28, 1.5);
      this.burst(0.02, 'bandpass', 1500, 900, 0.05, 2);
    } else this.burst(0.09, 'bandpass', 900, 500, heavy ? 0.16 : 0.09, 0.7);
  }
  /** Лодка ткнулась в берег или камень. */
  thud(p = 1) {
    this.burst(0.14, 'lowpass', 240, 90, 0.5 * p, 1.2);
    this.tone(95, 0.2, 'sine', 0.3 * p, 48);
  }
  /** Подвесной мотор: k от 0 (холостой ход) до 1 (полный); k < 0 — заглушить. */
  motor(k) {
    if (!this.ctx) return;
    const c = this.ctx;
    const t = c.currentTime;
    if (k < 0) {
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
    r.wind.gain.setTargetAtTime(Math.max(0, wind - 0.3) * 0.05, t, 1.2);
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
