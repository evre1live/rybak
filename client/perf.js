// Счётчик кадров и сведения о машине: для автоподбора качества, окошка F3 и отчёта «Проверка компьютера».

/** Название видеокарты, как его отдаёт браузер (может быть обезличенным). */
export function gpuName(renderer) {
  try {
    const gl = renderer.getContext();
    const e = gl.getExtension('WEBGL_debug_renderer_info');
    const s = e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return String(s || '').replace(/^ANGLE \((.*)\)$/, '$1').slice(0, 140);
  } catch {
    return '';
  }
}
/** Программная отрисовка: видеокарты нет или браузер ею не пользуется. */
export const isSoftware = (gpu) => /swiftshader|llvmpipe|software|basic render/i.test(gpu);

export class Perf {
  constructor(renderer) {
    this.gpu = gpuName(renderer);
    this.buf = new Float32Array(600); // длительности последних кадров, мс
    this.reset();
  }
  reset() {
    this.n = this.i = 0;
    this.hitches = 0;
  }
  /** Длительность кадра, мс. Кадр дольше секунды — вкладка была в фоне, не считаем. */
  push(ms) {
    if (!(ms > 0) || ms > 1000) return;
    this.buf[this.i] = ms;
    this.i = (this.i + 1) % this.buf.length;
    this.n = Math.min(this.n + 1, this.buf.length);
    if (ms > 50) this.hitches++;
  }
  /** Среднее, худший 1 % и самый долгий кадр из последних; hitches — сколько кадров шло дольше 50 мс; long — доля кадров, пропустивших обновление экрана. */
  stats() {
    const a = Array.from(this.buf.subarray(0, this.n)).sort((x, y) => x - y);
    if (!a.length) return { fps: 0, avg: 0, p99: 0, max: 0, n: 0, hitches: 0, long: 0 };
    const avg = a.reduce((s, v) => s + v, 0) / a.length;
    return { fps: 1000 / avg, avg, p99: a[Math.min(a.length - 1, Math.floor(a.length * 0.99))], max: a[a.length - 1], n: a.length, hitches: this.hitches, long: longShare(a) };
  }
}

/**
 * Доля «долгих» кадров в окне — тех, что шли заметно дольше обычного, то есть пропустили обновление экрана.
 * Средняя длительность этого не показывает: если каждый пятый кадр идёт вдвое дольше, в среднем выходит 50 кадров
 * в секунду, а на глаз игра дёргается — особенно стрелка натяжения, которая едет с постоянной скоростью.
 * Обычный кадр — срединный в окне, поэтому счёт не зависит от частоты экрана (60, 120, 144 Гц).
 */
export function longShare(ms) {
  const n = ms.length;
  if (n < 8) return 0;
  const a = Array.from(ms).sort((x, y) => x - y);
  const med = a[n >> 1];
  const lim = Math.max(med * 1.45, med + 5);
  let k = 0;
  for (let i = n - 1; i >= 0 && a[i] > lim; i--) k++;
  return k / n;
}
export const JIT_BAD = 0.085; // три долгих кадра из тридцати за полсекунды — уже рывки
export const JIT_OK = 0.04; // один из тридцати — случайность

/**
 * Автоподбор на ходу. Раз в полсекунды получает среднюю длительность кадра и долю долгих кадров и решает, что делать:
 * кадры долгие или идут неровно — уменьшить разрешение; оно уже на нижней границе — упростить картинку; идёт ровно — вернуть.
 * Чистая логика без отрисовки: её проверяет npm test.
 */
export const TARGET_MS = 18.7; // держим не меньше 53 кадров в секунду
// wait — сколько ровных окон нужно, чтобы снова попробовать разрешение повыше; since — окон с последнего подъёма
export const newTuner = () => ({ bad: 0, good: 0, low: 0, hold: 0, ceil: 1, wait: 30, since: 99 });
/**
 *   st — состояние (создаёт newTuner), avg — средний кадр за окно, мс;
 *   q — { scale, floor, canDrop — можно ли опустить ступень качества, drs — разрешено ли менять разрешение,
 *       refl — уровень отражений в воде (2 — в полкадра, 1 — в четверть, 0 — нет; 0, если ими распоряжается игрок),
 *       jit — доля долгих кадров в окне (longShare; нет — считаем, что ход ровный),
 *       busy — игрок занят (заброс, поклёвка, вываживание): в это время картинку вверх не меняем — смена разрешения сама даёт рывок }.
 * Возвращает null, { refl }, { scale } или { drop: true }.
 */
export function tuneStep(st, avg, q) {
  st.since++;
  if (st.hold > 0) {
    st.hold--; // только что меняли — пусть устоится
    return null;
  }
  const jit = q.jit || 0;
  if (avg > TARGET_MS * 1.2 || jit > JIT_BAD) {
    st.bad++;
    st.good = 0;
  } else if (avg < TARGET_MS && jit <= JIT_OK) {
    st.good++;
    st.bad = 0;
  } else st.bad = st.good = 0;
  if (st.bad >= (q.drs || q.refl > 0 ? 2 : 8)) {
    st.bad = 0;
    if (q.refl > 0) {
      // первым делом — отражения: ради них сцена рисуется второй раз, и тяжёлые кадры идут через один
      st.hold = 2;
      return { refl: q.refl - 1 };
    }
    if (q.drs && q.scale > q.floor + 0.02) {
      st.ceil = Math.max(q.floor, q.scale * 0.97); // выше того, на чём просело, пока не поднимаемся
      // просело сразу после подъёма — значит, выше этой машине не по силам: следующую попытку откладываем вдвое
      st.wait = st.since < 20 ? Math.min(240, st.wait * 2) : 30;
      st.hold = 2;
      st.low = 0;
      return { scale: Math.max(q.floor, q.scale * Math.max(0.75, Math.min(0.9, TARGET_MS / avg))) };
    }
    if (q.canDrop && (!q.drs || ++st.low >= 3)) {
      st.low = 0;
      st.hold = 6;
      st.ceil = 1;
      return { drop: true };
    }
    return null;
  }
  if (q.busy) return null;
  if (q.drs && st.good >= 16 && q.scale < Math.min(1, st.ceil) - 0.04) {
    st.good = 0;
    st.hold = 2;
    st.since = 0;
    return { scale: Math.min(1, st.ceil, q.scale * 1.1) };
  }
  if (st.good >= st.wait && st.ceil < 1) {
    // четверть минуты ровно (после неудачной попытки — дольше) — можно попробовать разрешение повыше
    st.ceil = Math.min(1, st.ceil * 1.12);
    st.good = 0;
  }
  return null;
}
/** Замер перед игрой: по цене кадра (мс, с ожиданием видеокарты) — нужна ли ступень ниже и какое взять разрешение. */
export const BUDGET_MS = 12;
// Цена кадра здесь — цена тяжёлых кадров (верхняя четверть замера): отражение рисуется через кадр, и на ровность
// хода влияют именно они. Чтобы успевать к обновлению экрана 60 раз в секунду, кадр должен стоить меньше 16,7 мс.
export const FIT_MS = 15; // с отражениями тяжёлый кадр должен укладываться в это время — иначе ход идёт рывками
// «Высокое» дорого не числом точек (тени, свечение, сглаживание): уменьшение разрешения ему помогает слабо
// (на Apple M4: 15,4 мс при 100 % и 13–14 мс при 88 %), поэтому с него уходим раньше, чем со «среднего».
export const DROP_MS = { high: 18, medium: BUDGET_MS * 2.2 };
export const needDrop = (ms, tier) => tier !== 'low' && ms > DROP_MS[tier];
// Запас, при котором стоит попробовать ступень выше (или отражения подороже): цена кадра на нынешней, мс.
// По замерам на Apple M4 «высокое» в 1,4–2,5 раза дороже «среднего», «среднее» — в 1,3 раза дороже «низкого».
export const UP_MS = { low: 9, medium: 7, high: 11 };
const ORDER = ['low', 'medium', 'high'];
const REFL_NAME = [' без отражений', ' с отражениями в четверть', ''];
/**
 * Подбор ступени качества замерами — при каждой загрузке, в обе стороны.
 *   start — с чего начать: { tier, refl } — что подобрано в прошлый раз (слабой машине незачем начинать с «высокого»);
 *   top — выше какой ступени не подниматься; refl — наибольший разрешённый уровень отражений (2, 1 или 0);
 *   cost(tier, refl) — обещание цены кадра, мс (тот, кто зовёт, сам переключает качество и собирает шейдеры).
 * Вниз: отражения в полкадра → в четверть → без них → «среднее» → «низкое», пока кадр не укладывается.
 * Вверх: если начали не с верхней ступени, а запас большой, — пробуем ступень выше; не потянула — остаёмся.
 * Так неудачный замер (машина была занята) не закрепляется: следующий запуск всё перепроверит.
 */
export async function pickQuality({ start, top, refl = 2, cost }) {
  const log = [];
  const done = new Map(); // что уже мерили в этот раз — второй раз не меряем
  const at = async (tier, r) => {
    const key = tier + r;
    if (done.has(key)) return done.get(key);
    const ms = await cost(tier, r);
    done.set(key, ms);
    log.push([tier + (tier === 'high' ? REFL_NAME[r] : ''), +ms.toFixed(1)]);
    return ms;
  };
  // «высокое»: с каким уровнем отражений тяжёлый кадр укладывается; r0 — с какого начать
  const high = async (r0) => {
    let r = r0, ms = await at('high', r);
    while (r > 0 && ms > FIT_MS) ms = await at('high', --r);
    return [r, ms];
  };
  let tier = ORDER.includes(start.tier) && ORDER.indexOf(start.tier) <= ORDER.indexOf(top) ? start.tier : top;
  let r = 0, ms;
  if (tier === 'high') [r, ms] = await high(Math.min(refl, start.refl == null ? refl : +start.refl));
  else ms = await at(tier, 0);
  while (needDrop(ms, tier)) {
    tier = ORDER[ORDER.indexOf(tier) - 1];
    r = 0;
    ms = await at(tier, 0);
  }
  for (let i = 0; i < 3; i++) {
    if (tier === 'high') {
      // запас есть — возвращаем отражения по уровню, пока тяжёлый кадр укладывается
      while (r < refl && ms < UP_MS.high) {
        const m2 = await at('high', r + 1);
        if (m2 > FIT_MS) break;
        r++;
        ms = m2;
      }
      break;
    }
    const next = ORDER[ORDER.indexOf(tier) + 1];
    if (ORDER.indexOf(next) > ORDER.indexOf(top) || ms >= UP_MS[tier]) break;
    let r2 = 0, m2;
    if (next === 'high') [r2, m2] = await high(refl);
    else m2 = await at(next, 0);
    if (needDrop(m2, next)) break; // не потянула — остаёмся на прежней
    tier = next;
    r = r2;
    ms = m2;
  }
  return { tier, refl: tier === 'high' ? r : refl, ms, log };
}
export const scaleFor = (ms, tier) => {
  const s = Math.max(tier === 'low' ? 0.5 : 0.62, Math.min(1, Math.sqrt(BUDGET_MS / Math.max(ms, 0.1))));
  return s > 0.95 ? 1 : +s.toFixed(2);
};

/** Уступить очередь странице, не дожидаясь часов: в фоновой вкладке setTimeout срабатывает раз в секунду, а это — сразу. */
export const yieldNow = () =>
  new Promise((ok) => {
    const c = new MessageChannel();
    c.port1.onmessage = () => ok();
    c.port2.postMessage(0);
  });
