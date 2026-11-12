// Проверка музыки, которую сочиняет игра (client/music.js). Послушать её тут некому, поэтому музыка «играется» в файл
// без звуковой карты и проверяется по числам: громкость без перегруза и провалов, все ноты — в ре мажоре,
// в бою громче и ярче, с легендой — минорный круг, ночью нот меньше. Заодно — что записи звуков читаются.
// Запуск: node test/music.cjs [папка для файла music.wav]
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = process.argv[2] || '/tmp/rybak-music';
fs.mkdirSync(out, { recursive: true });
const root = path.join(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 400)));
  await page.goto('about:blank');
  const src = fs.readFileSync(path.join(root, 'client/music.js'), 'utf8').replace(/^export /gm, '');
  await page.addScriptTag({ content: src + '\nwindow.Music = Music; window.MUSIC_STEP = MUSIC_STEP;' });

  // Минута с четвертью: день → бой → бой с легендой и тугой леской → ночь. Случай — с зерном, чтобы прогон повторялся.
  const SEG = [
    { name: 'день', to: 20, mood: { fight: 0, tension: 0, run: 0, boss: 0, night: 0, rain: 0 } },
    { name: 'бой', to: 38, mood: { fight: 1, tension: 0.5, run: 1 } },
    { name: 'легенда', to: 56, mood: { fight: 1, tension: 0.9, run: 0, boss: 2 } },
    { name: 'ночь', to: 76, mood: { fight: 0, tension: 0, boss: 0, night: 1 } }
  ];
  const r = await page.evaluate(async (SEG) => {
    const render = async (seed) => {
      let a = seed >>> 0;
      const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const sr = 44100, len = SEG[SEG.length - 1].to;
      const ctx = new OfflineAudioContext(2, sr * len, sr);
      const m = new window.Music(ctx, ctx.destination, rnd);
      m.log = [];
      for (const s of SEG) { m.set(s.mood); m.plan(s.to); }
      const buf = await ctx.startRendering();
      return { buf, log: m.log, sr };
    };
    const { buf, log, sr } = await render(7);
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    let bad = 0, peak = 0;
    for (let i = 0; i < L.length; i++) { const v = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (!(v <= 4)) bad++; if (v > peak) peak = v; }
    // громкость по секундам и доля верхов (выше ~5 кГц) — по разности соседних отсчётов
    const sec = [];
    for (let s = 0; s + sr <= L.length; s += sr) {
      let e = 0, hi = 0;
      for (let i = s + 1; i < s + sr; i++) { const v = (L[i] + R[i]) / 2, d = v - (L[i - 1] + R[i - 1]) / 2; e += v * v; hi += d * d; }
      sec.push({ rms: Math.sqrt(e / sr), hi: Math.sqrt(hi / sr) });
    }
    const again = await render(7);
    let same = true;
    const L2 = again.buf.getChannelData(0);
    for (let i = 0; i < L.length; i += 997) if (Math.abs(L[i] - L2[i]) > 1e-6) { same = false; break; }
    // WAV 16 бит для разглядывания спектра
    const n = L.length, wav = new DataView(new ArrayBuffer(44 + n * 4));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) wav.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); wav.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); wav.setUint32(16, 16, true); wav.setUint16(20, 1, true); wav.setUint16(22, 2, true);
    wav.setUint32(24, sr, true); wav.setUint32(28, sr * 4, true); wav.setUint16(32, 4, true); wav.setUint16(34, 16, true); w(36, 'data'); wav.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { wav.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); wav.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
    let bin = '';
    const u8 = new Uint8Array(wav.buffer);
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    // сколько нот в секунду днём и ночью — на длинном отрезке, без проигрывания (только расписание)
    const rate = (mood) => {
      let a = 99;
      const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const ctx = new OfflineAudioContext(1, 4410, 44100);
      const m = new window.Music(ctx, ctx.destination, rnd);
      m.log = [];
      m.set(mood);
      m.plan(600);
      return m.log.filter((x) => x.note != null).length / 600;
    };
    return { bad, peak, sec, log, same, wav: btoa(bin), step: window.MUSIC_STEP, day: rate({ night: 0 }), night: rate({ night: 1 }), rain: rate({ night: 0, rain: 1 }) };
  }, SEG);
  fs.writeFileSync(path.join(out, 'music.wav'), Buffer.from(r.wav, 'base64'));

  const db = (v) => 20 * Math.log10(v + 1e-9);
  const seg = (name) => { const i = SEG.findIndex((s) => s.name === name); return [i ? SEG[i - 1].to : 0, SEG[i].to]; };
  const avg = (name, key, skip = 3) => { const [a, b] = seg(name); const xs = r.sec.slice(a + skip, b); return Math.sqrt(xs.reduce((s, x) => s + x[key] * x[key], 0) / xs.length); };
  const notes = (name) => { const [a, b] = seg(name); return r.log.filter((x) => x.note != null && x.t >= a && x.t < b); };
  const chords = (name) => { const [a, b] = seg(name); return r.log.filter((x) => x.chord && x.t >= a && x.t < b).map((x) => x.chord); };
  console.log('МУЗЫКА, проигранная в файл:', path.join(out, 'music.wav'));
  for (const s of SEG) console.log(`  ${s.name.padEnd(8)} громкость ${db(avg(s.name, 'rms')).toFixed(1)} дБ · верхи ${db(avg(s.name, 'hi')).toFixed(1)} дБ · нот ${notes(s.name).length} · аккорды ${[...new Set(chords(s.name))].join(' ')}`);
  console.log(`  пик ${r.peak.toFixed(3)} (${db(r.peak).toFixed(1)} дБ), восьмая ${r.step.toFixed(3)} с`);

  assert.equal(r.bad, 0, 'в звуке нет мусора (NaN, бесконечностей)');
  assert.ok(r.peak < 0.6, 'без перегруза: пик ' + r.peak.toFixed(3));
  assert.ok(r.same, 'одно зерно — одна и та же музыка');
  // не слишком тихо и не громко; нигде не обрывается в тишину (подклад тянется и в паузах мелодии)
  for (const s of SEG) { const v = db(avg(s.name, 'rms')); assert.ok(v > -40 && v < -19, `${s.name}: громкость ${v.toFixed(1)} дБ`); }
  const quiet = r.sec.slice(4).filter((x) => db(x.rms) < -52).length;
  assert.equal(quiet, 0, 'нет секунд тишины посреди музыки');
  // все ноты мелодии — из ре мажора (ре ми фа# соль ля си до#)
  const D_MAJOR = new Set([2, 4, 6, 7, 9, 11, 1]);
  const all = r.log.filter((x) => x.note != null);
  assert.ok(all.length > 30, 'мелодия играет: нот ' + all.length);
  assert.ok(all.every((x) => D_MAJOR.has(((x.note % 12) + 12) % 12)), 'ноты вне ре мажора: ' + all.filter((x) => !D_MAJOR.has(x.note % 12)).map((x) => x.note).join());
  // мелодия идёт плавно: между соседними нотами редко больше квинты
  let jumps = 0;
  for (let i = 1; i < all.length; i++) if (all[i].t - all[i - 1].t < 1 && Math.abs(all[i].note - all[i - 1].note) > 9) jumps++;
  assert.ok(jumps <= all.length * 0.12, 'скачков в мелодии: ' + jumps + ' из ' + all.length);
  // бой громче и ярче покоя (пульс баса и шейкер); с легендой — минорный круг; ночью нот меньше, чем днём
  assert.ok(avg('бой', 'rms') > avg('день', 'rms') * 1.04, 'бой громче покоя');
  assert.ok(avg('бой', 'hi') > avg('день', 'hi') * 1.6, 'в бою слышен шейкер');
  assert.ok(avg('ночь', 'hi') < avg('бой', 'hi') * 0.7, 'после боя пульс уходит');
  const MIN = new Set(['Bm', 'G', 'Em', 'F#m', 'D', 'A']);
  assert.ok(chords('легенда').slice(1).every((c) => MIN.has(c)) && chords('легенда').includes('Bm'), 'легенда — минорный круг: ' + chords('легенда').join(' '));
  assert.ok(chords('день').some((c) => /^D/.test(c)), 'днём — мажор: ' + chords('день').join(' '));
  console.log(`  нот в секунду: днём ${r.day.toFixed(2)}, ночью ${r.night.toFixed(2)}, в дождь ${r.rain.toFixed(2)}`);
  assert.ok(r.day > 0.45 && r.day < 1.2, 'днём мелодия не редкая и не суетливая: ' + r.day.toFixed(2));
  assert.ok(r.night < r.day * 0.75 && r.rain < r.day * 0.9, `ночью и в дождь нот меньше: ${r.night.toFixed(2)} и ${r.rain.toFixed(2)} против ${r.day.toFixed(2)}`);

  // записи звуков: читаются этим браузером, длина и громкость на месте
  const SAMPLES = { splash: [0.7, 0.9], plop: [0.4, 0.6], reel: [0.7, 0.9], snap: [0.25, 0.45] };
  for (const [name, [lo, hi]] of Object.entries(SAMPLES)) {
    const b64 = fs.readFileSync(path.join(root, 'public/audio', name + '.webm')).toString('base64');
    const s = await page.evaluate(async (b64) => {
      const bin = atob(b64), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const ctx = new OfflineAudioContext(1, 48000, 48000);
      const buf = await ctx.decodeAudioData(u8.buffer);
      const d = buf.getChannelData(0);
      let peak = 0, e = 0;
      for (let i = 0; i < d.length; i++) { peak = Math.max(peak, Math.abs(d[i])); e += d[i] * d[i]; }
      return { dur: buf.duration, ch: buf.numberOfChannels, peak, rms: Math.sqrt(e / d.length) };
    }, b64);
    console.log(`  запись ${name.padEnd(7)} ${s.dur.toFixed(2)} с · пик ${s.peak.toFixed(2)} · громкость ${db(s.rms).toFixed(1)} дБ · ${fs.statSync(path.join(root, 'public/audio', name + '.webm')).size} байт`);
    assert.ok(s.dur > lo && s.dur < hi && s.peak > 0.4 && s.peak <= 1.01 && db(s.rms) > -36, `${name}: ${JSON.stringify(s)}`);
  }
  await browser.close();
  console.log('МУЗЫКА И ЗАПИСИ: всё в порядке');
})().catch((e) => { console.error('ПРОВАЛ:', e.message.split('\n').slice(0, 6).join('\n')); process.exit(1); });
