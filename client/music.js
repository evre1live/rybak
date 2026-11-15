// Музыка без файлов: её на ходу сочиняет сама игра — тихая, неторопливая, без конца и без заметных повторов.
//
// Строй — ре мажор. Аккорды идут по такту каждый (восемь тактов — круг, потом другой порядок); поверх них —
// «калимба»: случайная прогулка по пентатонике, которая на сильных долях держится нот аккорда, играет фразами
// и замолкает на такт-другой. Ночью нот меньше и они ниже, в дождь — ещё реже.
// При вываживании добавляется пульс: бас восьмыми и шейкер, а чем туже леска — тем слышнее тревожная нота.
// С легендой гармония уходит в си минор.
//
// Всё расписывается немного вперёд по часам звукового контекста (step → plan), поэтому тот же класс умеет
// «проиграть» музыку в файл без звуковой карты — так её проверяют, не слыша (test/music.cjs).

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
// аккорды: бас, три голоса подклада и ноты, к которым мелодия тянется на сильных долях (ноты MIDI)
const CH = {
  D: { bass: 50, pad: [57, 62, 66], tones: [62, 66, 69, 74] }, // ре — ля, ре, фа-диез
  Dadd9: { bass: 50, pad: [57, 64, 66], tones: [62, 64, 66, 69] },
  Bm: { bass: 47, pad: [54, 59, 62], tones: [59, 62, 66, 71] },
  G: { bass: 43, pad: [55, 59, 62], tones: [62, 67, 71, 74] },
  Gmaj7: { bass: 43, pad: [54, 59, 62], tones: [59, 62, 66, 71] },
  A: { bass: 45, pad: [57, 61, 64], tones: [61, 64, 69, 73] },
  Asus: { bass: 45, pad: [57, 62, 64], tones: [62, 64, 69, 74] },
  Em: { bass: 40, pad: [55, 59, 64], tones: [59, 64, 67, 71] },
  'F#m': { bass: 42, pad: [54, 57, 61], tones: [57, 61, 66, 69] },
  // ночная марина: аккорды с септимами и нонами — как в лаунже у воды
  Dmaj9: { bass: 50, pad: [57, 61, 64], tones: [61, 64, 66, 69] },
  Bm9: { bass: 47, pad: [54, 57, 61], tones: [57, 61, 62, 66] },
  Em9: { bass: 40, pad: [55, 59, 62, 66], tones: [59, 62, 66, 67] },
  A13: { bass: 45, pad: [55, 61, 66], tones: [61, 64, 66, 69] },
  Gmaj9: { bass: 43, pad: [54, 57, 59], tones: [57, 59, 62, 66] },
  'F#m7': { bass: 42, pad: [52, 57, 61], tones: [57, 61, 64, 66] }
};
// круги по восемь тактов: спокойные и «минорные» — для боя с легендой
const CALM = [
  ['Dadd9', 'Dadd9', 'Bm', 'Bm', 'Gmaj7', 'Gmaj7', 'Asus', 'A'],
  ['D', 'Gmaj7', 'Bm', 'Asus', 'D', 'Gmaj7', 'Em', 'A'],
  ['Gmaj7', 'D', 'Em', 'Asus', 'Gmaj7', 'D', 'Bm', 'A']
];
const MINOR = [['Bm', 'Bm', 'G', 'G', 'Em', 'Em', 'F#m', 'F#m'], ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'Em', 'F#m']];
const LOUNGE = [
  ['Dmaj9', 'Dmaj9', 'Bm9', 'Bm9', 'Em9', 'Em9', 'A13', 'A13'],
  ['Gmaj9', 'Gmaj9', 'F#m7', 'Bm9', 'Em9', 'A13', 'Dmaj9', 'Dmaj9'],
  ['Dmaj9', 'Gmaj9', 'Dmaj9', 'Gmaj9', 'Em9', 'A13', 'Bm9', 'A13']
];
/**
 * Манера музыки у каждой локации: tempo — во сколько раз быстрее, dens — сколько нот мелодии, low — как часто она
 * уходит на октаву вниз, echo — сколько эха, timbre — голос мелодии (калимба, маримба, электропиано), drum — мягкий
 * барабан-«бревно», swing — запаздывание слабых долей (свинг), brush — щётка по тарелке на 2 и 4, chords — свои круги.
 */
export const STYLES = {
  calm: {},
  pine: { tempo: 0.9, dens: 0.85, low: 0.3 },
  reef: { tempo: 1.12, dens: 1.1, timbre: 'marimba' },
  ocean: { tempo: 0.85, dens: 0.72, echo: 0.42 },
  jungle: { dens: 0.9, drum: 1, timbre: 'marimba' },
  swamp: { tempo: 0.92, dens: 0.82, low: 0.25, drum: 0.6 },
  lounge: { tempo: 0.94, dens: 0.8, swing: 0.34, chords: LOUNGE, timbre: 'epiano', brush: 1 }
};
const TIMBRE = {
  kalimba: [[1, 1, 0.26], [3, 0.22, 0.045], [2, 0.12, 0.11]],
  marimba: [[1, 1, 0.2], [4, 0.24, 0.03], [10, 0.05, 0.012]],
  epiano: [[1, 1, 0.55], [2, 0.24, 0.2], [3, 0.08, 0.07]]
};
const SCALE = [57, 59, 62, 64, 66, 69, 71, 74, 76, 78, 81]; // ре-мажорная пентатоника, от ля малой октавы
const STEP = 60 / 66 / 2; // восьмая при 66 ударах в минуту

export class Music {
  /** ctx — звуковой контекст (обычный или «в файл»), out — куда играть, rnd — случай (в проверке — с зерном). */
  constructor(ctx, out, rnd = Math.random) {
    this.ctx = ctx;
    this.rnd = rnd;
    this.mood = { fight: 0, tension: 0, run: 0, boss: 0, night: 0, rain: 0 };
    const c = ctx;
    this.out = c.createGain();
    this.out.gain.value = 2.3; // общий уровень: музыка тише звуков рыбалки, но не тонет в шуме моря
    this.out.connect(out);
    // общий «воздух»: эхо на голосе калимбы и зал на всём
    this.dry = c.createGain();
    this.dry.connect(this.out);
    const rev = c.createConvolver();
    rev.buffer = this.room(2.6);
    const wet = c.createGain();
    wet.gain.value = 0.3;
    this.dry.connect(rev);
    rev.connect(wet);
    wet.connect(this.out);
    this.echo = c.createDelay(1.5);
    this.echo.delayTime.value = STEP * 1.5;
    const fb = c.createGain();
    fb.gain.value = 0.33;
    const ef = c.createBiquadFilter();
    ef.type = 'lowpass';
    ef.frequency.value = 2200;
    this.echo.connect(ef);
    ef.connect(fb);
    fb.connect(this.echo);
    const eg = (this.echoG = c.createGain());
    eg.gain.value = 0.28;
    ef.connect(eg);
    eg.connect(this.dry);
    // подклад идёт через общий фильтр: ночью он глуше
    this.padF = c.createBiquadFilter();
    this.padF.type = 'lowpass';
    this.padF.frequency.value = 900;
    this.padF.Q.value = 0.3;
    this.padF.connect(this.dry);
    const n = c.sampleRate;
    this.noise = c.createBuffer(1, n, n);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = this.rnd() * 2 - 1;
    this.next = 0; // время следующей восьмой
    this.i = 0; // её номер
    this.prog = CALM[0];
    this.minor = false;
    this.mel = 4; // где мелодия на лесенке SCALE
    this.phrase = 0; // сколько восьмых ещё длится фраза (<0 — пауза)
    this.fightK = 0; // сглаженная «сила боя»
    this.log = null; // в проверке сюда пишется, что сыграно
    this.st = STYLES.calm;
    this.stName = 'calm';
  }
  /** Манера музыки (STYLES): у каждой локации своя. */
  style(name) {
    if (!STYLES[name] || name === this.stName) return;
    this.st = STYLES[name];
    this.stName = name;
    this.echoG.gain.value = this.st.echo ?? 0.28;
    this.bar0 = -1e9; // новый круг — с ближайшего такта
  }
  /** Отклик зала: затухающий шум, слева и справа разный. */
  room(sec) {
    const c = this.ctx;
    const n = Math.floor(c.sampleRate * sec);
    const b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        lp += (this.rnd() * 2 - 1 - lp) * (0.5 - 0.42 * t); // к хвосту — глуше
        d[i] = lp * Math.pow(1 - t, 2.6) * (i < 400 ? i / 400 : 1);
      }
    }
    return b;
  }
  /** Настроение: fight 0..1, tension 0..1 (натяжение лески), run (рывок), boss (легенда), night 0..1, rain 0..1. */
  set(m) {
    Object.assign(this.mood, m);
  }
  /** Расписать музыку до времени until (секунды контекста). Вызывать часто; в файл — один раз на всю длину. */
  plan(until) {
    const now = this.ctx.currentTime;
    if (this.next < now - 0.2 || !this.i) this.next = Math.max(this.next, now + 0.05); // вкладка спала — не догоняем пропущенное; первая нота — чуть погодя
    while (this.next < until) {
      this.step(this.next, this.i++);
      this.next += STEP / (this.st.tempo || 1);
    }
  }
  step(t, i) {
    const m = this.mood;
    const s = i % 8; // восьмая в такте
    const bar = Math.floor(i / 8);
    this.fightK += ((m.fight ? 1 : 0) - this.fightK) * 0.18;
    const fk = this.fightK;
    if (s === 0) {
      // новый такт: раз в восемь — новый круг; с легендой на крючке — минорный
      const wantMinor = fk > 0.5 && m.boss > 0;
      if (bar % 8 === 0 || wantMinor !== this.minor || bar - this.bar0 > 64) {
        this.minor = wantMinor;
        const set = wantMinor ? MINOR : this.st.chords || CALM;
        this.prog = set[Math.floor(this.rnd() * set.length)];
        this.bar0 = bar;
      }
      const name = this.prog[(bar - this.bar0) % 8];
      const prev = this.chord;
      this.chord = CH[name];
      this.padF.frequency.setTargetAtTime(m.night > 0.5 ? 620 : 900 + fk * 500, t, 0.8);
      if (this.chord !== prev) this.pad(t, this.chord, STEP * 8 * (this.prog[(bar - this.bar0 + 1) % 8] === name ? 2 : 1));
      this.bass(t, this.chord.bass, 0.07 * (1 - fk * 0.3));
      if (this.log) this.log.push({ t, bar, chord: name, fight: +fk.toFixed(2) });
    }
    // мелодия: фразы и паузы
    if (this.phrase === 0) this.phrase = this.rnd() < 0.72 ? 12 + Math.floor(this.rnd() * 3) * 4 : -(6 + Math.floor(this.rnd() * 2) * 4);
    const play = this.phrase > 0;
    this.phrase += play ? -1 : 1;
    const dens = ((0.56 - 0.26 * m.night - 0.16 * m.rain) * (s % 2 ? 0.6 : 1) + fk * 0.08) * (this.st.dens ?? 1);
    const sw = s % 2 ? (this.st.swing || 0) * (STEP / (this.st.tempo || 1)) : 0; // свинг: слабая доля чуть позже
    if (play && this.rnd() < dens) {
      const strong = s === 0 || s === 4;
      let k = this.mel + [-2, -1, -1, 0, 1, 1, 2][Math.floor(this.rnd() * 7)];
      k = Math.max(1, Math.min(SCALE.length - 2, k));
      let note = SCALE[k];
      if (strong) {
        // на сильной доле — ближайшая нота аккорда
        const tn = this.chord.tones;
        note = tn.reduce((a, b) => (Math.abs(b - note) < Math.abs(a - note) ? b : a));
        k = SCALE.reduce((a, b, j) => (Math.abs(b - note) < Math.abs(SCALE[a] - note) ? j : a), 0);
      }
      this.mel = k;
      if (m.night > 0.5 && this.rnd() < 0.5) note -= 12;
      else if (this.st.low && this.rnd() < this.st.low) note -= 12;
      this.pluck(Math.max(0, t + sw + (this.rnd() - 0.5) * 0.012), note, (strong ? 0.075 : 0.055) * (0.8 + this.rnd() * 0.4)); // чуть «не в сетку» — живее
      if (this.log) this.log.push({ t, note });
    }
    // барабан-«бревно» (джунгли, протока) и щётка по тарелке (лаунж) — тихо, под мелодией
    if (this.st.drum && fk < 0.5) {
      const dv = 0.05 * this.st.drum * (1 - 0.5 * m.night);
      if (s === 0) this.logdrum(t, 52, dv);
      else if (s === 3 && this.rnd() < 0.55) this.logdrum(t, 59, dv * 0.7);
      else if (s === 6 && this.rnd() < 0.6) this.logdrum(t, 55, dv * 0.8);
    }
    if (this.st.brush && (s === 2 || s === 6)) this.brush(t, 0.014 * this.st.brush);
    if (fk > 0.05) {
      // бой: бас восьмыми (тоника — квинта — октава) и шейкер на слабых долях; в рывке шейкер чаще
      const b = this.chord.bass;
      this.pulse(t, b + [0, 0, 7, 0, 12, 0, 7, 0][s], 0.1 * fk);
      if (s % 2 || m.run) this.shake(t, (s % 2 ? 0.03 : 0.016) * fk * (m.run ? 1.5 : 1));
      if (m.run) this.shake(t + STEP / 2, 0.016 * fk);
      // леска на пределе — высокая дрожащая квинта
      if (m.tension > 0.7 && s % 2 === 0) this.alarm(t, this.chord.bass + 31, 0.03 * fk * Math.min(1, (m.tension - 0.7) / 0.2));
    }
  }
  /** Огибающая щипка: быстрая атака за a секунд и затухание с постоянной времени tau. Возвращает, когда звук стих. */
  env(g, t, a, peak, tau) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(0, t + a, tau);
    return t + a + tau * 7;
  }
  /** Подклад: три голоса с медленной атакой, слегка расстроены — звук «дышит». */
  pad(t, ch, len) {
    const c = this.ctx;
    for (let j = 0; j < ch.pad.length; j++) {
      for (const det of [-5, 6]) {
        const o = c.createOscillator();
        o.type = 'triangle';
        o.frequency.value = hz(ch.pad[j]);
        o.detune.value = det;
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.018, t + 1.4);
        g.gain.setValueAtTime(0.018, t + len - 0.3);
        g.gain.linearRampToValueAtTime(0.0001, t + len + 2.2);
        o.connect(g);
        g.connect(this.padF);
        o.start(t);
        o.stop(t + len + 2.3);
      }
    }
  }
  bass(t, note, vol) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = hz(note);
    const g = c.createGain();
    const end = this.env(g, t, 0.03, vol, 0.6);
    o.connect(g);
    g.connect(this.dry);
    o.start(t);
    o.stop(end);
  }
  /** Калимба: основной тон и короткий призвук на дуодециму выше; чуть в сторону, с эхом. */
  pluck(t, note, vol) {
    const c = this.ctx;
    const pan = c.createStereoPanner ? c.createStereoPanner() : c.createGain();
    if (pan.pan) pan.pan.value = (this.rnd() - 0.5) * 0.9;
    pan.connect(this.dry);
    pan.connect(this.echo);
    const f = hz(note);
    for (const [mul, v, tau] of TIMBRE[this.st.timbre || 'kalimba']) {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * mul;
      const g = c.createGain();
      const end = this.env(g, t, 0.004, vol * v, tau);
      o.connect(g);
      g.connect(pan);
      o.start(t);
      o.stop(end);
    }
  }
  /** Бас боя: короткий глухой щипок. */
  pulse(t, note, vol) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.value = hz(note);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 520;
    const g = c.createGain();
    const end = this.env(g, t, 0.006, vol, 0.085);
    o.connect(f);
    f.connect(g);
    g.connect(this.dry);
    o.start(t);
    o.stop(end);
  }
  /** Барабан-«бревно»: глухой тон, который на миг проседает вниз. */
  logdrum(t, note, vol) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = 'sine';
    const f = hz(note);
    o.frequency.setValueAtTime(f * 1.5, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.03);
    const g = c.createGain();
    const end = this.env(g, t, 0.004, vol, 0.09);
    o.connect(g);
    g.connect(this.dry);
    o.start(t);
    o.stop(end);
  }
  /** Щётка по тарелке: мягкий шорох шума. */
  brush(t, vol) {
    const c = this.ctx;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 3800;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.setTargetAtTime(0, t + 0.02, 0.06);
    s.connect(f);
    f.connect(g);
    g.connect(this.dry);
    s.start(t, this.rnd() * 0.8);
    s.stop(t + 0.5);
  }
  shake(t, vol) {
    const c = this.ctx;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 6500;
    const g = c.createGain();
    const end = this.env(g, t, 0.003, vol, 0.014);
    s.connect(f);
    f.connect(g);
    g.connect(this.dry);
    s.start(t, this.rnd() * 0.8);
    s.stop(end);
  }
  alarm(t, note, vol) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = hz(note);
    const lfo = c.createOscillator();
    lfo.frequency.value = 9;
    const lg = c.createGain();
    lg.gain.value = vol * 0.5;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.06);
    g.gain.setValueAtTime(vol, t + STEP * 1.4);
    g.gain.linearRampToValueAtTime(0, t + STEP * 2);
    lfo.connect(lg);
    lg.connect(g.gain);
    o.connect(g);
    g.connect(this.dry);
    o.start(t);
    lfo.start(t);
    o.stop(t + STEP * 2 + 0.05);
    lfo.stop(t + STEP * 2 + 0.05);
  }
}
export const MUSIC_STEP = STEP;
