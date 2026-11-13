// Записи звуков в настоящем браузере: общая дорожка коротких звуков и петли (public/audio, опись — sounds.json).
// Послушать их тут некому, поэтому проверяется то, что видно по числам: браузер читает файлы; каждый звук лежит там,
// где сказано в описи, и не задевает соседей; у петель нет шва; игра на каждое событие играет нужный кусок дорожки,
// а чего в описи нет — играет синтезом и не падает.
// Запуск: PORT=3111 node test/sound.cjs
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/npm-tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const BASE = `http://127.0.0.1:${process.env.PORT || 3111}`;
const man = JSON.parse(fs.readFileSync(path.join(root, 'public/audio/sounds.json'), 'utf8'));
const db = (v) => 20 * Math.log10(v + 1e-9);

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => { console.log('PAGEERROR', e.message.slice(0, 400)); page.__err = (page.__err || 0) + 1; });
  const names = Object.keys(man.sfx);
  const loops = Object.keys(man.loops);
  console.log(`в описи: коротких звуков ${names.length} (с вариантами — ${names.reduce((n, k) => n + man.sfx[k].length, 0)}), петель ${loops.length}`);

  // ───── файлы: читаются браузером, звуки на своих местах ─────
  await page.goto(`${BASE}/?q=low&norender&h=13`);
  await page.waitForFunction(() => window.RYBAK && window.__frames > 3, null, { timeout: 90000 });
  const decode = (file) => page.evaluate(async (file) => {
    const r = await fetch(file);
    if (!r.ok) return { ok: false, http: r.status };
    const ctx = new OfflineAudioContext(2, 48000, 48000);
    const buf = await ctx.decodeAudioData(await r.arrayBuffer());
    const ch = [];
    for (let c = 0; c < buf.numberOfChannels; c++) ch.push(buf.getChannelData(c));
    window.__dec = window.__dec || {};
    window.__dec[file] = { buf, ch };
    return { ok: true, dur: buf.duration, ch: buf.numberOfChannels, type: r.headers.get('content-type') };
  }, file);
  // громкость куска [a, b) в секундах: пик и средняя
  const level = (file, a, b) => page.evaluate(({ file, a, b }) => {
    const { buf, ch } = window.__dec[file];
    const i0 = Math.max(0, Math.round(a * buf.sampleRate)), i1 = Math.min(buf.length, Math.round(b * buf.sampleRate));
    let peak = 0, e = 0;
    for (let i = i0; i < i1; i++) { let v = 0; for (const c of ch) v += c[i]; v /= ch.length; peak = Math.max(peak, Math.abs(v)); e += v * v; }
    return { peak, rms: Math.sqrt(e / Math.max(1, i1 - i0)) };
  }, { file, a, b });

  if (names.length) {
    const f = await decode('audio/sfx.webm');
    assert.ok(f.ok && f.ch === 1 && /audio\/webm/.test(f.type), `общая дорожка читается: ${JSON.stringify(f)}`);
    assert.ok(Math.abs(f.dur - man.sfxLen) < 0.08, `длина дорожки ${f.dur.toFixed(3)} с, в описи ${man.sfxLen}`);
    const all = names.flatMap((k) => man.sfx[k].map(([a, d], i) => ({ k, i, a, d }))).sort((x, y) => x.a - y.a);
    for (let n = 0; n < all.length; n++) {
      const s = all[n];
      assert.ok(s.a >= 0.04 && s.d > 0.05 && s.a + s.d <= f.dur + 0.01, `${s.k}: место в дорожке ${s.a}+${s.d}`);
      if (n) assert.ok(s.a - (all[n - 1].a + all[n - 1].d) >= 0.06, `${s.k}: между звуками есть тишина`);
      const body = await level('audio/sfx.webm', s.a, s.a + s.d);
      const before = await level('audio/sfx.webm', s.a - 0.03, s.a - 0.012);
      const after = await level('audio/sfx.webm', s.a + s.d + 0.004, s.a + s.d + 0.03);
      // звук слышен, не перегружен; перед ним и за ним — тишина: при игре с другой скоростью соседа не зацепить
      assert.ok(body.peak > 0.35 && body.peak <= 1.02 && db(body.rms) > -34, `${s.k}${s.i + 1}: громкость ${JSON.stringify(body)}`);
      assert.ok(db(before.peak) < -30 && db(after.peak) < -40, `${s.k}${s.i + 1}: тишина по краям — до ${db(before.peak).toFixed(0)} дБ, после ${db(after.peak).toFixed(0)} дБ`);
    }
    console.log(`  общая дорожка: ${f.dur.toFixed(2)} с, ${fs.statSync(path.join(root, 'public/audio/sfx.webm')).size} байт — все ${all.length} звуков на своих местах, слышны, с тишиной по краям`);
  }
  for (const k of loops) {
    const m = man.loops[k];
    const f = await decode('audio/' + m.file);
    assert.ok(f.ok && f.ch === m.ch, `петля ${k} читается: ${JSON.stringify(f)}`);
    assert.ok(m.start >= 0.2 && m.end - m.start > 2 && m.end + 0.2 <= f.dur + 0.03, `петля ${k}: точки ${m.start}…${m.end} внутри записи ${f.dur.toFixed(2)} с`);
    // шов: 40 мс вокруг стыка против таких же кусков по всей петле — не тише и не громче обычного
    const lv = [];
    for (let t = m.start; t + 0.04 <= m.end; t += 0.04) lv.push((await level('audio/' + m.file, t, t + 0.04)).rms);
    const wrapA = await level('audio/' + m.file, m.end - 0.02, m.end);
    const wrapB = await level('audio/' + m.file, m.start, m.start + 0.02);
    const seam = Math.sqrt((wrapA.rms ** 2 + wrapB.rms ** 2) / 2);
    const lo = Math.min(...lv), hi = Math.max(...lv);
    assert.ok(seam > lo * 0.5 && seam < hi * 2, `петля ${k}: шов ${db(seam).toFixed(1)} дБ при обычных ${db(lo).toFixed(1)}…${db(hi).toFixed(1)} дБ`);
    // запас за краями петли повторяет её начало и конец: по нему кодек и браузер не слышат обрыва
    const tail = await level('audio/' + m.file, m.end, m.end + 0.15);
    const head = await level('audio/' + m.file, m.start, m.start + 0.15);
    assert.ok(Math.abs(db(tail.rms) - db(head.rms)) < 1.5, `петля ${k}: за концом — её же начало (${db(tail.rms).toFixed(1)} и ${db(head.rms).toFixed(1)} дБ)`);
    console.log(`  петля ${k.padEnd(10)} ${(m.end - m.start).toFixed(2)} с · ${f.ch} кан. · ${fs.statSync(path.join(root, 'public/audio', m.file)).size} байт · шов ${db(seam).toFixed(1)} дБ (обычно ${db(lo).toFixed(1)}…${db(hi).toFixed(1)})`);
  }

  // ───── игра: на события играют нужные куски дорожки ─────
  await page.evaluate(() => {
    window.__plays = [];
    const orig = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (when, offset, duration) {
      window.__plays.push({ buf: this.buffer, offset: offset || 0, duration: duration || 0, rate: this.playbackRate.value, loop: this.loop, ls: this.loopStart, le: this.loopEnd });
      return orig.apply(this, arguments);
    };
  });
  await page.fill('#nm', 'Звук');
  await page.evaluate(() => { RYBAK.profile.seenIntro = true; });
  await page.click('[data-a="solo"]');
  await page.waitForFunction(() => RYBAK.state === 'lobby');
  await page.evaluate(() => RYBAK.enterWorld());
  await page.waitForFunction(() => RYBAK.state === 'world' && RYBAK.audio.ctx);
  await page.waitForFunction((want) => Object.keys(RYBAK.audio.buf).length >= want, names.length ? 5 : 4, { timeout: 30000 });
  const got = await page.evaluate(() => Object.fromEntries(Object.entries(RYBAK.audio.buf).map(([k, b]) => [k, b ? +b.duration.toFixed(2) : null])));
  assert.ok(got.splash && got.plop && got.reel && got.snap, `прежние записи загружены: ${JSON.stringify(got)}`);
  if (names.length) assert.ok(got.sfx, `общая дорожка загружена игрой: ${JSON.stringify(got)}`);
  // что сыграло из общей дорожки с прошлого вызова: имена звуков по месту в ней
  const played = (fn, arg) => page.evaluate(({ fn, arg, sfx }) => {
    const a = RYBAK.audio;
    window.__plays.length = 0;
    const synth = { tone: 0, burst: 0 };
    const ones = []; // что просили у общей дорожки: [имя, настройки]
    const t0 = a.tone, b0 = a.burst, o0 = a.one;
    a.tone = function () { synth.tone++; return t0.apply(this, arguments); };
    a.burst = function () { synth.burst++; return b0.apply(this, arguments); };
    a.one = function (name, o) { ones.push([name, { ...(o || {}) }]); return o0.apply(this, arguments); };
    let ret;
    try {
      ret = new Function('a', 'arg', fn)(a, arg);
    } finally {
      a.tone = t0;
      a.burst = b0;
      a.one = o0;
    }
    const out = [], rates = [];
    let noise = 0;
    for (const p of window.__plays) {
      if (p.buf === a.noise) { noise++; continue; } // шум синтеза идёт тем же способом, но это не запись
      rates.push(+p.rate.toFixed(3));
      if (p.buf !== a.buf.sfx) { out.push(p.loop ? 'loop' : Object.keys(a.buf).find((k) => a.buf[k] === p.buf) || '?'); continue; }
      let hit = '?';
      for (const [k, list] of Object.entries(sfx)) list.forEach(([at, d], i) => { if (Math.abs(p.offset - at) < 1e-6 && Math.abs(p.duration - d) < 1e-6) hit = list.length > 1 ? `${k}#${i}` : k; });
      out.push(hit);
    }
    return { out, synth, noise, ones, ret: ret === undefined ? null : ret, rates };
  }, { fn, arg, sfx: man.sfx });
  const has = (k) => !!man.sfx[k];
  const base = (x) => x.replace(/#\d+$/, '');
  // [что вызвать, какой звук дорожки должен сыграть, играет ли при записи ещё и синтез]
  const CASES = [
    ['a.ui()', 'ui', false], ['a.error()', 'error', false], ['a.buy()', 'buy', false], ['a.shutter()', 'shutter', false], ['a.page()', 'page', false],
    ['a.nibble()', 'nibble', false], ['a.bite()', 'bite', true], ['a.hook()', 'hook', true], ['a.keep()', 'keep', false], ['a.wrap()', 'scrape', false],
    ['a.thrash(0.6)', 'thrash', false], ['a.landed(true)', 'net', false], ['a.stuck()', 'bubbles', true],
    ['a.step(true, false)', 'step_wood', false], ['a.step(false, false)', 'step_sand', false], ['a.step(true, true)', 'land', false],
    ['a.jingle()', 'jingle', false], ['a.bell()', 'bell', false], ['a.horn()', 'horn', false], ['a.creak()', 'creak', false]
  ];
  let rec = 0, syn = 0;
  for (const [fn, name, alsoSynth] of CASES) {
    const r = await played(fn);
    const fromTape = r.out.filter((x) => x !== 'loop' && !['splash', 'plop', 'reel', 'snap'].includes(x)).map(base);
    if (has(name)) {
      rec++;
      assert.deepEqual(fromTape, [name], `${fn}: играет запись «${name}» — ${JSON.stringify(r)}`);
      if (!alsoSynth) assert.equal(r.synth.tone + r.synth.burst, 0, `${fn}: при записи синтез молчит — ${JSON.stringify(r.synth)}`);
    } else {
      syn++;
      assert.deepEqual(fromTape, [], `${fn}: записи «${name}» нет — из дорожки ничего не играет: ${JSON.stringify(r)}`);
    }
  }
  // удар лодки о преграду. В самой записи удар один: несколько ударов подряд слышатся как стук в дверь (так было).
  // В игре: сильный удар — запись в полную силу, под ней низкий толчок, следом брызги и откат волны, море и музыка
  // на миг отступают; пока лодка упирается в ту же преграду, удары редкие, глухие и тихие; слабый удар — тоже глухой;
  // варианты записи чередуются.
  if (has('bump')) {
    const hits = (at, d) => page.evaluate(({ at, d }) => {
      const { buf, ch } = window.__dec['audio/sfx.webm'];
      const sr = buf.sampleRate, i0 = Math.round(at * sr), n = Math.round(d * sr);
      const win = Math.round(sr * 0.005), hop = Math.round(sr * 0.0025), pad = Math.round(sr * 0.05); // перед звуком — тишина: удару в самом начале есть с чем сравниться
      const e = [];
      for (let i = -pad; i + win <= n; i += hop) { let q = 0; for (let k = 0; k < win; k++) { const v = i + k < 0 ? 0 : ch[0][i0 + i + k]; q += v * v; } e.push(Math.sqrt(q / win)); }
      const top = Math.max(...e);
      const out = [];
      for (let i = 4; i < e.length; i++) {
        let m = 0, c = 0;
        for (let k = Math.max(0, i - 6); k < i - 1; k++) { m += e[k]; c++; }
        // удар: громкость за сотую долю секунды выросла больше чем на 9 дБ и поднялась выше −22 дБ от самого громкого места
        if (e[i] > top * 0.0794 && e[i] / Math.max(m / c, top * 0.004) > 2.818 && (!out.length || ((i - out[out.length - 1]) * hop) / sr > 0.06)) out.push(i);
      }
      return out.map((i) => +((i * hop - pad) / sr).toFixed(3));
    }, { at, d });
    for (const [i, [at, d]] of man.sfx.bump.entries()) {
      const h = await hits(at, d);
      assert.ok(h.length === 1 && h[0] < 0.03, `удар лодки, вариант ${i + 1}: в записи один удар, в самом начале — ${JSON.stringify(h)}`);
      assert.ok(d > 0.5 && d < 1.2, `удар лодки, вариант ${i + 1}: длина ${d} с`);
    }
    const reset = () => page.evaluate(() => { RYBAK.audio.thudAt = -9; });
    await reset();
    const hard = await played('a.thud(0.9)');
    assert.deepEqual(hard.out.map(base), ['bump', 'splash', 'splash'], `сильный удар: запись, брызги и откат волны — ${JSON.stringify(hard)}`);
    assert.ok(hard.rates[2] < hard.rates[1] - 0.1, `откат волны ниже и медленнее брызг — ${JSON.stringify(hard.rates)}`);
    assert.ok(hard.synth.tone === 1 && hard.synth.burst === 0, `сильный удар: под записью один низкий толчок — ${JSON.stringify(hard.synth)}`);
    assert.ok(hard.ones[0][0] === 'bump' && hard.ones[0][1].vol > 0.9 && !hard.ones[0][1].lp, `сильный удар: запись в полную силу, без среза верхов — ${JSON.stringify(hard.ones)}`);
    const dip = await page.evaluate(() => new Promise((ok) => setTimeout(() => ok(RYBAK.audio.back.gain.value), 80)));
    assert.ok(dip > 0.4 && dip < 0.75, `сильный удар: море и музыка на миг отступают — ${dip}`);
    const at0 = await played('a.thud(0.9)');
    assert.ok(at0.out.length === 0 && at0.synth.tone + at0.synth.burst === 0, `удар сразу за ударом не слышен: лодка всё ещё упирается — ${JSON.stringify(at0)}`);
    await page.evaluate(() => { RYBAK.audio.thudHeard -= 1.2; }); // прошло больше секунды, а лодку всё толкают в ту же преграду
    const again = await played('a.thud(0.9)');
    assert.deepEqual(again.out.map(base), ['bump'], `удар подряд: только сам удар — ${JSON.stringify(again)}`);
    assert.ok(again.ones[0][1].lp > 0 && again.ones[0][1].vol < 0.5 && again.synth.tone + again.synth.burst === 0, `удар подряд: глухо и тихо — ${JSON.stringify(again.ones)}`);
    await reset();
    const light = await played('a.thud(0.1)');
    assert.deepEqual(light.out.map(base), ['bump'], `слабый удар: только сам удар — ${JSON.stringify(light)}`);
    assert.ok(light.ones[0][1].lp > 400 && light.ones[0][1].lp < 520 && light.ones[0][1].vol < 0.3, `слабый удар: глухо и тихо — ${JSON.stringify(light.ones)}`);
    await reset();
    const h1 = (await played('a.thud(1)')).out[0];
    await reset();
    const h2 = (await played('a.thud(1)')).out[0];
    if (man.sfx.bump.length > 1) assert.notEqual(h1, h2, `два сильных удара — разные записи: ${h1}, ${h2}`);
    await page.waitForTimeout(1800);
    const back = await page.evaluate(() => RYBAK.audio.back.gain.value);
    assert.ok(back > 0.97, `после удара море и музыка возвращаются — ${back}`);
    // удар чужой лодки: со стороны он тише, глуше и слышен с той стороны, где случился; удары подряд у каждой лодки считаются отдельно
    const vias = () => page.evaluate(() => {
      const a = RYBAK.audio;
      if (!a.__vias) {
        a.__vias = [];
        const v0 = a.via;
        a.via = function (vol, pan, lp) { a.__vias.push([vol, pan, lp]); return v0.apply(this, arguments); };
      }
      return a.__vias.splice(0);
    });
    const backNow = (ms) => page.evaluate((ms) => new Promise((ok) => setTimeout(() => ok(RYBAK.audio.back.gain.value), ms)), ms);
    await reset();
    await page.evaluate(() => { RYBAK.audio.thudFrom = {}; });
    await vias();
    const far = await played('return a.thud(0.9, { vol: 0.25, pan: -0.6, from: 7 })');
    const farVia = await vias();
    assert.equal(far.ret, 2, `чужая лодка: первый сильный удар — сильный: ${JSON.stringify(far)}`);
    assert.deepEqual(far.out.map(base), ['bump', 'splash', 'splash'], `чужая лодка: тот же состав звука — ${JSON.stringify(far)}`);
    assert.ok(far.synth.tone === 1 && far.ones[0][1].dest, `чужая лодка: всё играет в отдельный выход — ${JSON.stringify(far)}`);
    assert.deepEqual(farVia, [[0.25, -0.6, 2850]], `чужая лодка: выход тише, левее и глуше — ${JSON.stringify(farVia)}`);
    const farDip = await backNow(80);
    assert.ok(farDip > 0.97, `дальний удар не заслоняет море и музыку — ${farDip}`);
    const own = await played('return a.thud(0.9)');
    assert.ok(own.ret === 2 && !own.ones[0][1].dest && (await vias()).length === 0, `свой удар сразу за чужим — в полную силу и в общий выход: ${JSON.stringify(own)}`);
    const far2 = await played('return a.thud(0.9, { vol: 0.25, pan: -0.6, from: 7 })');
    assert.ok(far2.ret === 0 && far2.out.length === 0 && far2.synth.tone + far2.synth.burst === 0, `та же чужая лодка упирается: удар сразу за ударом не слышен — ${JSON.stringify(far2)}`);
    const far3 = await played('return a.thud(0.9, { vol: 0.25, pan: 0.4, from: 8 })');
    assert.equal(far3.ret, 2, `другая лодка — свой счёт ударов: ${JSON.stringify(far3)}`);
    await page.evaluate(() => { RYBAK.audio.thudFrom[7].thudHeard -= 1.2; });
    const far4 = await played('return a.thud(0.9, { vol: 0.25, pan: -0.6, from: 7 })');
    assert.ok(far4.ret === 1 && far4.ones[0][1].lp > 0 && far4.ones[0][1].dest, `чужая лодка упирается дальше: редкий глухой толчок — ${JSON.stringify(far4)}`);
    await vias();
    const none = await played('return a.thud(0.9, { vol: 0.002, pan: 0.5, from: 9 })');
    assert.ok(none.ret === 0 && none.out.length === 0 && (await vias()).length === 0, `удар за пределами слышимости не играет ничего — ${JSON.stringify(none)}`);
    await page.waitForTimeout(1800);
    const near = await played('return a.thud(0.9, { vol: 0.6, pan: 0, from: 10 })');
    const nearVia = await vias();
    const nearDip = await backNow(80);
    assert.ok(near.ret === 2 && nearVia.length === 1 && nearVia[0][2] === 6000, `удар неподалёку: чуть глуше — ${JSON.stringify(nearVia)}`);
    assert.ok(nearDip > 0.62 && nearDip < 0.9, `удар неподалёку заслоняет море слабее своего — ${nearDip}`);
    const ride = await played('return a.thud(0.9, { vol: 1, pan: 0, from: 11 })');
    assert.ok(ride.ret === 2 && !ride.ones[0][1].dest && (await vias()).length === 0, `пассажиру удар слышен как рулевому: в полную силу, без отдельного выхода — ${JSON.stringify(ride)}`);
    await page.waitForTimeout(1800);
    console.log(`  удар лодки: в каждой из ${man.sfx.bump.length} записей один удар; сильный — с низким толчком, брызгами и откатом волны, повторный и слабый — глухие`);
    console.log('  удар чужой лодки: со стороны — тише, глуше и с нужной стороны; счёт ударов подряд у каждой лодки свой; пассажиру — в полную силу');
  }
  // составные: заброс (запись и щелчки катушки), монеты горстью, улов без подсака (два шлепка), чайка
  const cast = await played('a.cast()');
  assert.equal(cast.out.filter((x) => x === 'reel').length, 6, 'заброс: шесть щелчков катушки');
  if (has('cast')) assert.ok(cast.out.includes('cast') && cast.synth.burst === 0, `заброс: запись вместо синтеза — ${JSON.stringify(cast)}`);
  const coins = await played('a.coin(4)');
  if (has('coin')) assert.ok(coins.out.length === 4 && coins.out.every((x) => x === 'coin') && coins.rates[3] > coins.rates[0] && coins.synth.tone === 0, `монеты: четыре звона, каждый выше — ${JSON.stringify(coins)}`);
  else assert.equal(coins.synth.tone, 8, 'монеты синтезом');
  const flop = await played('a.landed(false)');
  if (has('flop')) assert.deepEqual(flop.out.map(base), ['flop', 'flop'], `улов без подсака: два шлепка — ${JSON.stringify(flop)}`);
  const gull = await played('a.gull(a.ctx.currentTime)');
  if (has('gull')) assert.ok(gull.out.length >= 1 && gull.out.every((x) => base(x) === 'gull'), JSON.stringify(gull));
  else assert.ok(gull.out.length === 0, 'чайка — синтезом');
  // варианты одного звука не повторяются подряд
  if (has('step_wood')) {
    const seq = [];
    for (let i = 0; i < 24; i++) seq.push((await played('a.step(true, false)')).out[0]);
    assert.ok(seq.every((x, i) => !i || x !== seq[i - 1]), `шаги по доскам: соседние разные — ${seq.join(' ')}`);
    assert.ok(new Set(seq).size >= Math.min(4, man.sfx.step_wood.length), `шаги по доскам: в ходу разные варианты — ${[...new Set(seq)].join(' ')}`);
  }
  console.log(`  игра: из ${CASES.length} звуков записью играют ${rec}, синтезом (записи пока нет) — ${syn}; заброс, монеты, шаги без повторов — как задумано`);

  // ───── петли: есть запись — крутится она, нет — синтез; ничего не падает ─────
  const bedState = (k) => page.evaluate((k) => { const L = RYBAK.audio.beds[k]; return L ? { st: L.st, on: !!L.src } : null; }, k);
  await page.evaluate(() => { const a = RYBAK.audio; a.motor(0.6); a.rain(0.9, 0.8); a.place('waterfall', 5, 60, 0.55, 0.3); a.place('fire', 2, 16, 0.5, -0.2); a.night = 1; });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const a = RYBAK.audio; a.motor(0.6); a.rain(0.9, 0.8); a.place('waterfall', 5, 60, 0.55, 0.3); a.place('fire', 2, 16, 0.5, -0.2); });
  const eng = await page.evaluate(() => ({ synthMotor: !!RYBAK.audio.eng, synthRain: !!RYBAK.audio.rainN }));
  for (const k of ['motor', 'rain', 'wind', 'waterfall', 'fire', 'waves']) {
    const s = await bedState(k);
    if (man.loops[k]) assert.deepEqual(s, { st: 2, on: true }, `петля ${k} загружена и крутится: ${JSON.stringify(s)}`);
    else assert.equal(s, null, `петли ${k} в описи нет — её и не ищут`);
  }
  assert.equal(eng.synthMotor, !man.loops.motor, 'мотор: запись либо синтез, не оба сразу');
  if (man.loops.motor) {
    const p = await page.evaluate(() => { const s = RYBAK.audio.beds.motor.src; return { loop: s.loop, ls: s.loopStart, le: s.loopEnd }; });
    assert.deepEqual(p, { loop: true, ls: man.loops.motor.start, le: man.loops.motor.end }, 'у петли мотора — точки из описи');
  }
  // мотор чужой лодки: вторая такая же петля — играет сама по себе, рядом со своим мотором, запись у них одна
  if (man.loops.motor) {
    await page.evaluate(() => { RYBAK.hearBoats = () => {}; RYBAK.audio.motorNear(0.5, 14, 1); }); // игра сама зовёт motorNear каждый кадр — на время проверки отключаем
    await page.waitForFunction(() => RYBAK.audio.beds.motor2 && RYBAK.audio.beds.motor2.st === 2, null, { timeout: 15000 });
    await page.evaluate(() => RYBAK.audio.motorNear(0.5, 14, 1));
    await page.waitForTimeout(1500);
    const m2 = await page.evaluate(() => { const a = RYBAK.audio; const L = a.beds.motor2; return { on: !!L.src, own: !!a.beds.motor.src, same: L.buf === a.beds.motor.buf, two: L.src !== a.beds.motor.src, gain: L.g.gain.value, pan: L.pan ? L.pan.pan.value : null, rate: L.src.playbackRate.value, loop: L.src.loop, files: Object.keys(a.loopBuf).length, beds: Object.keys(a.beds).length }; });
    // 14 м из 70: (1 − 0,2)² × (0,3 + 0,45 × 0,5) = 0,336; справа, дальше шести метров — 0,75
    assert.ok(m2.on && m2.own && m2.same && m2.two && m2.loop, `мотор чужой лодки — отдельная петля из той же записи: ${JSON.stringify(m2)}`);
    assert.ok(Math.abs(m2.gain - 0.336) < 0.02 && Math.abs(m2.pan - 0.75) < 0.02 && Math.abs(m2.rate - 1.03) < 0.02, `мотор чужой лодки: громкость по расстоянию, сторона и высота по ходу — ${JSON.stringify(m2)}`);
    assert.ok(m2.files < m2.beds, `две петли из одного файла грузят его один раз: файлов ${m2.files}, петель ${m2.beds}`);
    await page.evaluate(() => RYBAK.audio.motorNear(1, 69, -1));
    await page.waitForTimeout(1500);
    const edge = await page.evaluate(() => RYBAK.audio.beds.motor2.g.gain.value);
    assert.ok(edge < 0.002, `на краю слышимости чужой мотор почти не слышен — ${edge}`);
    await page.evaluate(() => RYBAK.audio.motorNear(0.5, 14, 1));
    await page.waitForTimeout(1200);
    await page.evaluate(() => RYBAK.audio.hush());
    await page.waitForTimeout(1500);
    const hush = await page.evaluate(() => { const a = RYBAK.audio; return { m2: a.beds.motor2.g.gain.value, fall: a.beds.waterfall ? a.beds.waterfall.g.gain.value : 0, fire: a.beds.fire ? a.beds.fire.g.gain.value : 0 }; });
    assert.ok(hush.m2 < 0.01 && hush.fall < 0.01 && hush.fire < 0.01, `ушли из мира — чужой мотор и звуки мест смолкли: ${JSON.stringify(hush)}`);
    console.log('  мотор чужой лодки: отдельная петля из той же записи, громкость по расстоянию, смолкает при выходе из мира');
  }
  await page.evaluate(() => { const a = RYBAK.audio; a.motor(-1); a.rain(0, 0.2); a.night = 0; });
  assert.ok(!page.__err, 'ошибок на странице нет');
  console.log(`  петли: записью — ${loops.length ? loops.join(', ') : 'пока ни одной'}; остальное — синтез, как раньше`);
  await browser.close();
  console.log('ЗАПИСИ ЗВУКОВ: всё в порядке');
})().catch((e) => { console.error('ПРОВАЛ:', e.message.split('\n').slice(0, 8).join('\n'), '\n', (e.stack || '').split('\n').filter((l) => l.includes('sound.cjs')).slice(0, 3).join('\n')); process.exit(1); });
