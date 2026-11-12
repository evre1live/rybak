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
  /** Среднее, худший 1 % и самый долгий кадр из последних; hitches — сколько кадров шло дольше 50 мс. */
  stats() {
    const a = Array.from(this.buf.subarray(0, this.n)).sort((x, y) => x - y);
    if (!a.length) return { fps: 0, avg: 0, p99: 0, max: 0, n: 0, hitches: 0 };
    const avg = a.reduce((s, v) => s + v, 0) / a.length;
    return { fps: 1000 / avg, avg, p99: a[Math.min(a.length - 1, Math.floor(a.length * 0.99))], max: a[a.length - 1], n: a.length, hitches: this.hitches };
  }
}

/**
 * Автоподбор на ходу. Раз в полсекунды получает среднюю длительность кадра и решает, что делать:
 * кадры долгие — уменьшить разрешение; оно уже на нижней границе — упростить картинку; идёт ровно — вернуть.
 * Чистая логика без отрисовки: её проверяет npm test.
 *   st — состояние (создаёт newTuner), avg — средний кадр за окно, мс;
 *   q — { scale, floor, canDrop — можно ли опустить ступень качества, drs — разрешено ли менять разрешение }.
 * Возвращает null или { scale } / { drop: true }.
 */
export const TARGET_MS = 18.7; // держим не меньше 53 кадров в секунду
// wait — сколько ровных окон нужно, чтобы снова попробовать разрешение повыше; since — окон с последнего подъёма
export const newTuner = () => ({ bad: 0, good: 0, low: 0, hold: 0, ceil: 1, wait: 30, since: 99 });
export function tuneStep(st, avg, q) {
  st.since++;
  if (st.hold > 0) {
    st.hold--; // только что меняли — пусть устоится
    return null;
  }
  if (avg > TARGET_MS * 1.2) {
    st.bad++;
    st.good = 0;
  } else if (avg < TARGET_MS) {
    st.good++;
    st.bad = 0;
  } else st.bad = st.good = 0;
  if (st.bad >= (q.drs ? 2 : 8)) {
    st.bad = 0;
    if (q.drs && q.scale > q.floor + 0.02) {
      st.ceil = Math.max(q.floor, q.scale * 0.97); // выше того, на чём просело, пока не поднимаемся
      // просело сразу после подъёма — значит, выше этой машине не по силам: следующую попытку откладываем вдвое
      st.wait = st.since < 20 ? Math.min(240, st.wait * 2) : 30;
      st.hold = 2;
      st.low = 0;
      return { scale: Math.max(q.floor, q.scale * Math.max(0.75, Math.min(0.94, TARGET_MS / avg))) };
    }
    if (q.canDrop && (!q.drs || ++st.low >= 3)) {
      st.low = 0;
      st.hold = 4;
      st.ceil = 1;
      return { drop: true };
    }
    return null;
  }
  if (q.drs && st.good >= 8 && q.scale < Math.min(1, st.ceil) - 0.02) {
    st.good = 0;
    st.hold = 2;
    st.since = 0;
    return { scale: Math.min(1, st.ceil, q.scale * 1.06) };
  }
  if (st.good >= st.wait && st.ceil < 1) {
    // четверть минуты ровно (после неудачной попытки — дольше) — можно попробовать разрешение повыше
    st.ceil = Math.min(1, st.ceil * 1.1);
    st.good = 0;
  }
  return null;
}
/** Замер перед игрой: по цене кадра (мс, с ожиданием видеокарты) — нужна ли ступень ниже и какое взять разрешение. */
export const BUDGET_MS = 12;
// «Высокое» дорого не числом точек (отражение мира, тени, свечение): уменьшение разрешения ему помогает слабо
// (на Apple M4: 15,4 мс при 100 % и 13–14 мс при 88 %), поэтому с него уходим раньше — уже с 21 мс.
export const DROP_MS = { high: 21, medium: BUDGET_MS * 2.2 };
export const needDrop = (ms, tier) => tier !== 'low' && ms > DROP_MS[tier];
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
