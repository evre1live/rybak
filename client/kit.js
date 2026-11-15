// Свой облик у каждой локации: какие модели из наборов (tools/kit.js, art/kit.json) встают на места,
// которые процедурный мир отметил в ENV. Одна запись процедурного мира («здесь сосна ростом 9 м») становится
// одной из нескольких моделей набора — по месту, всегда одной и той же (spot01), чтобы лес не был из клонов.
//
// use — модели и их доли; k — поправка роста (модели приведены к наибольшему размеру 1); opt — как рисовать
// (как у Scatter.add). Если хоть одной модели нет (набор не собран, пробная версия) — остаётся прежняя модель.
import { LOC_ID } from './loc/id.js';

const G = (k) => ({ r: k, g: k, b: k });
/**
 * Камни локации из готовых подробных моделей. small — валуны (env-rock1), tall — глыбы и столбы (env-rock2, env-rock3).
 * fit: каждому месту — та модель, которую под его размеры придётся растягивать меньше всего (среди близких — по доле).
 */
// Цвет и яркость у всех камней общие — камень локации (stone.js), здесь только какие модели где стоят.
const rocks = (small, tall) => ({
  'env-rock1': { use: small, fit: true, opt: { cell: 104, near: 60, vary: 0.2, rock: true } },
  'env-rock2': { use: tall, fit: true, opt: { cell: 400, near: 1e5, vary: 0.15, rock: true } },
  'env-rock3': { use: tall, fit: true, opt: { cell: 400, near: 1e5, vary: 0.15, rock: true } }
});

const SWAP = {
  // Сосновое озеро — горная тайга: ели разной формы, берёзы, лиственные у воды, папоротник, круглые серые валуны
  lake: {
    'env-pine': { use: [['kit-pine1', 1], ['kit-pine2', 1], ['kit-pine3', 1], ['kit-pine4', 0.8], ['kit-pine5', 0.6]], k: 1.0, opt: { near: 40, sway: 0.008, vary: 0.45, tint: { r: 0.92, g: 1.0, b: 0.96 } } },
    'env-birch': { use: [['kit-birch1', 1], ['kit-birch2', 1]], k: 1.05, opt: { near: 40, sway: 0.014, vary: 0.35 } },
    'env-oak': { use: [['kit-tree1', 1], ['kit-tree2', 1]], k: 1.0, opt: { near: 40, sway: 0.012, vary: 0.4 } },
    'env-bush': { use: [['kit-bush1', 1.3], ['kit-bush2', 0.4], ['kit-fern', 1.0], ['kit-lupine', 0.9, { k: 0.7 }]], k: 1.0, opt: { sway: 0.006, near: 22, vary: 0.4 } },
    ...rocks([['env-rock1', 1], ['env-granite', 0.5]], [['env-seastack', 1], ['env-rock1', 0.6]])
  },
  // Коралловые островки — атолл: пальмы четырёх видов, широколистные растения, цветущие кусты, светлый камень
  keys: {
    'env-palm': { use: [['kit-palm1', 1], ['kit-palm2', 1], ['kit-palm3', 1]], k: 1.0, opt: { cell: 90, near: 70, sway: 0.02, vary: 0.3 } },
    'env-bush': { use: [['kit-bushf', 0.8], ['kit-hibiscus', 1], ['kit-plant1', 1.2]], k: 1.0, opt: { sway: 0.008, near: 30, vary: 0.35 } },
    ...rocks([['env-coral', 1]], [['env-coral', 1], ['env-seastack', 0.6]])
  },
  // Солнечная бухта — южное море: оливы с серебристой листвой, светлые лиственные, цветущий кустарник, тёплый камень
  bay: {
    // сосны острова с маяком — наполовину «пинии» (корявый ствол, плоская тёмная крона), наполовину прежние
    'env-pine': { use: [['kit-pinia1', 1], ['kit-pinia2', 1], ['env-pine', 1.1, { near: 55, tint: { r: 1.28, g: 1.36, b: 1.34 }, sat: 0.92 }]], k: 1.0, opt: { near: 40, sway: 0.008, vary: 0.35 } },
    'env-oak': { use: [['kit-olive1', 1], ['kit-olive2', 1], ['kit-btree1', 0.5]], k: 1.0, opt: { near: 40, sway: 0.01, vary: 0.35 } },
    'env-birch': { use: [['kit-btree1', 1], ['kit-btree2', 1]], k: 1.0, opt: { near: 40, sway: 0.012, vary: 0.35 } },
    'env-bush': { use: [['kit-oleander', 1.2], ['kit-drygrass', 0.9], ['kit-lavender', 0.7, { k: 0.5 }]], k: 1.0, opt: { sway: 0.006, near: 22, vary: 0.35 } },
    // валуны и столбы — подробные модели; цвет — тёплый песчаник бухты (stone.js)
    ...rocks([['env-rock1', 1]], [['env-seastack', 1], ['env-rock1', 0.6]])
  },
  // Синий простор — вулканический остров в океане: рощи криптомерий (ели озера потемнее), кусты и папоротник,
  // тёмный базальт; гортензии у тропы — цветы поверх кустов (blue-nature.js)
  blue: {
    'env-pine': { use: [['kit-pine1', 1], ['kit-pine3', 1], ['kit-pine4', 0.8]], k: 1.05, opt: { near: 40, sway: 0.01, vary: 0.4, tint: { r: 0.82, g: 0.94, b: 0.9 } } },
    'env-bush': { use: [['kit-bush1', 1.3], ['kit-fern', 1.0], ['kit-bush2', 0.5]], k: 1.0, opt: { sway: 0.01, near: 22, vary: 0.4 } },
    ...rocks([['env-rock1', 1]], [['env-seastack', 1], ['env-rock1', 0.6]])
  },
  // Водопадная чаша — джунгли: лиственные великаны с тёмной сочной кроной, корявые деревья, пальмы у воды,
  // подлесок из широколистных растений, папоротника и цветущих геликоний; камень — тёмный мокрый базальт
  cascade: {
    'env-oak': { use: [['kit-jtree1', 1], ['kit-jtree3', 1], ['kit-jtwist1', 0.45], ['kit-jtwist2', 0.3]], k: 1.2, opt: { near: 40, sway: 0.012, vary: 0.4 } },
    'env-birch': { use: [['kit-jtree2', 1], ['kit-jtree3', 0.6]], k: 1.15, opt: { near: 40, sway: 0.014, vary: 0.35 } },
    'env-bush': { use: [['kit-heliconia', 0.6], ['kit-jplant7', 0.8], ['kit-plant1', 1.0], ['kit-fern', 1.0], ['kit-bushl', 0.8]], k: 1.0, opt: { sway: 0.008, near: 26, vary: 0.4 } },
    'env-palm': { use: [['kit-palm1', 1], ['kit-palm2', 1], ['kit-palm3', 1], ['kit-palm5', 0.5]], k: 1.0, opt: { cell: 90, near: 70, sway: 0.02, vary: 0.3 } },
    ...rocks([['env-rock1', 1], ['env-granite', 0.4]], [['env-seastack', 1], ['env-rock1', 0.6]])
  }
};

// Скалы и утёсы, у которых нет замены, перекрашиваются под геологию места: в бухте тёплый известняк,
// на островках — светлый коралловый камень, на озере — холодный гранит, в океане — бурый базальт.
const kitOff = () => {
  try {
    return !!globalThis.location && new URLSearchParams(globalThis.location.search).get('kit') === '0';
  } catch {
    return false;
  }
};

// Одиночные модели: на озере вместо белого домика с красной крышей (он же стоит у маяка в бухте) — сруб
// с террасой, тёмной черепицей и каменной трубой. glows — окна фасада в долях модели (замеры по tools/kit.js).
const SINGLES = {
  lake: { 'env-cottage': { id: 'kit-cabin', s: 8.6, lit: { color: '#ffc56b', k: 1.9 }, glows: [[-0.247, 0.18, -0.27, 3.0], [0.234, 0.18, -0.27, 3.0]], smoke: [0.268, 0.66, 0.174] } }
};
/** Одиночная модель с учётом замены на этой локации. */
export function kitSingle(p) {
  const t = !kitOff() && SINGLES[LOC_ID];
  return t && t[p.id] ? { ...p, ...t[p.id] } : p;
}
/** Где у заменённого дома труба: [вдоль дома, высота, поперёк] в метрах при размере s, или null. */
export function kitChimney(id) {
  const t = !kitOff() && SINGLES[LOC_ID];
  const o = t && t[id];
  return o && o.smoke ? o.smoke.map((v) => v * o.s) : null;
}

/** Замена для модели id на этой локации или null. Выключить все замены — ?kit=0 (для сравнения «было / стало»). */
export function kitSwap(id) {
  if (kitOff()) return null;
  const t = SWAP[LOC_ID];
  return (t && t[id]) || null;
}

/** Делит записи между моделями замены по долям: у каждого места своя модель, и всегда одна и та же. */
export function splitItems(sw, items, pick) {
  const total = sw.use.reduce((s, [, w]) => s + w, 0);
  const out = new Map(sw.use.map(([id]) => [id, []]));
  for (const it of items) {
    let u = pick(it) * total;
    let id = sw.use[sw.use.length - 1][0];
    for (const [vid, w] of sw.use) {
      if (u < w) {
        id = vid;
        break;
      }
      u -= w;
    }
    out.get(id).push(it);
  }
  return out;
}

/**
 * Делит камни между моделями замены по форме: каждому месту {w, h, d} — модель, которую придётся растягивать
 * меньше всего; среди почти одинаково подходящих — по долям (у места всегда одна и та же). size(id) — размеры модели.
 */
export function fitItems(sw, items, size, pick) {
  const out = new Map(sw.use.map(([id]) => [id, []]));
  for (const it of items) {
    const cost = sw.use.map(([id]) => {
      const s = size(id);
      const a = it.w / s[0];
      const b = it.h / s[1];
      const c = it.d / s[2];
      return Math.abs(Math.log(a / b)) + Math.abs(Math.log(c / b)) + Math.abs(Math.log(a / c)) * 0.5;
    });
    const best = Math.min(...cost);
    const ok = sw.use.filter((_, i) => cost[i] <= best + 0.3);
    const total = ok.reduce((t, [, w]) => t + w, 0);
    let u = pick(it) * total;
    let id = ok[ok.length - 1][0];
    for (const [vid, w] of ok) {
      if (u < w) {
        id = vid;
        break;
      }
      u -= w;
    }
    out.get(id).push(it);
  }
  return out;
}
