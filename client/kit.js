// Свой облик у каждой локации: какие модели из наборов (tools/kit.js, art/kit.json) встают на места,
// которые процедурный мир отметил в ENV. Одна запись процедурного мира («здесь сосна ростом 9 м») становится
// одной из нескольких моделей набора — по месту, всегда одной и той же (spot01), чтобы лес не был из клонов.
//
// use — модели и их доли; k — поправка роста (модели приведены к наибольшему размеру 1); opt — как рисовать
// (как у Scatter.add). Если хоть одной модели нет (набор не собран, пробная версия) — остаётся прежняя модель.
import { LOC_ID } from './loc/id.js';

const G = (k) => ({ r: k, g: k, b: k });

const SWAP = {
  // Сосновое озеро — горная тайга: ели разной формы, берёзы, лиственные у воды, папоротник, круглые серые валуны
  lake: {
    'env-pine': { use: [['kit-pine1', 1], ['kit-pine2', 1], ['kit-pine3', 1], ['kit-pine4', 0.8], ['kit-pine5', 0.6]], k: 1.0, opt: { near: 40, sway: 0.008, vary: 0.45, tint: { r: 0.92, g: 1.0, b: 0.96 } } },
    'env-birch': { use: [['kit-birch1', 1], ['kit-birch2', 1]], k: 1.05, opt: { near: 40, sway: 0.014, vary: 0.35 } },
    'env-oak': { use: [['kit-tree1', 1], ['kit-tree2', 1]], k: 1.0, opt: { near: 40, sway: 0.012, vary: 0.4 } },
    'env-bush': { use: [['kit-bush1', 1.3], ['kit-bush2', 0.4], ['kit-fern', 1.0], ['kit-lupine', 0.9, { k: 0.7 }]], k: 1.0, opt: { sway: 0.006, near: 22, vary: 0.4 } },
    'env-rock1': { use: [['kit-rock1', 1], ['kit-rock3', 1]], opt: { cell: 104, near: 60, vary: 0.25, tint: G(1.05) } },
    'env-rock2': { use: [['kit-rock1', 1], ['kit-rock3', 1]], opt: { cell: 400, near: 1e5, vary: 0.2, tint: G(1.05) } },
    'env-rock3': { use: [['kit-rock2', 1], ['kit-rock3', 1]], opt: { cell: 400, near: 1e5, vary: 0.2, tint: G(1.05) } }
  },
  // Коралловые островки — атолл: пальмы четырёх видов, широколистные растения, цветущие кусты, светлый камень
  keys: {
    'env-palm': { use: [['kit-palm1', 1], ['kit-palm2', 1], ['kit-palm3', 1]], k: 1.0, opt: { cell: 90, near: 70, sway: 0.02, vary: 0.3 } },
    'env-bush': { use: [['kit-bushf', 0.8], ['kit-hibiscus', 1], ['kit-plant1', 1.2]], k: 1.0, opt: { sway: 0.008, near: 30, vary: 0.35 } },
    'env-rock1': { use: [['kit-krock1', 1], ['kit-krock3', 1]], opt: { cell: 104, near: 60, vary: 0.2 } },
    'env-rock2': { use: [['kit-krock1', 1], ['kit-krock3', 1]], opt: { cell: 400, near: 1e5, vary: 0.2 } },
    'env-rock3': { use: [['kit-krock2', 1], ['kit-krock3', 1]], opt: { cell: 400, near: 1e5, vary: 0.2 } }
  },
  // Солнечная бухта — южное море: оливы с серебристой листвой, светлые лиственные, цветущий кустарник, тёплый камень
  bay: {
    // сосны острова с маяком — наполовину «пинии» (корявый ствол, плоская тёмная крона), наполовину прежние
    'env-pine': { use: [['kit-pinia1', 1], ['kit-pinia2', 1], ['env-pine', 1.1, { near: 55, tint: { r: 1.28, g: 1.36, b: 1.34 }, sat: 0.92 }]], k: 1.0, opt: { near: 40, sway: 0.008, vary: 0.35 } },
    'env-oak': { use: [['kit-olive1', 1], ['kit-olive2', 1], ['kit-btree1', 0.5]], k: 1.0, opt: { near: 40, sway: 0.01, vary: 0.35 } },
    'env-birch': { use: [['kit-btree1', 1], ['kit-btree2', 1]], k: 1.0, opt: { near: 40, sway: 0.012, vary: 0.35 } },
    'env-bush': { use: [['kit-oleander', 1.2], ['kit-drygrass', 0.9], ['kit-lavender', 0.7, { k: 0.5 }]], k: 1.0, opt: { sway: 0.006, near: 22, vary: 0.35 } },
    // валуны — тёплый известняк (большие столбы в море остаются прежними, перекрашены в тёплый — stoneTint)
    'env-rock1': { use: [['kit-brock1', 1], ['kit-brock3', 1]], opt: { cell: 104, near: 60, vary: 0.25, sat: 0.5, tint: { r: 1.08, g: 1.04, b: 0.96 } } }
  },
  // Синий простор — вулканический остров в океане: рощи криптомерий (ели озера потемнее), кусты и папоротник,
  // тёмный базальт; гортензии у тропы — цветы поверх кустов (blue-nature.js)
  blue: {
    'env-pine': { use: [['kit-pine1', 1], ['kit-pine3', 1], ['kit-pine4', 0.8]], k: 1.05, opt: { near: 40, sway: 0.01, vary: 0.4, tint: { r: 0.82, g: 0.94, b: 0.9 } } },
    'env-bush': { use: [['kit-bush1', 1.3], ['kit-fern', 1.0], ['kit-bush2', 0.5]], k: 1.0, opt: { sway: 0.01, near: 22, vary: 0.4 } },
    'env-rock1': { use: [['kit-rock1', 1], ['kit-rock3', 1]], opt: { cell: 104, near: 60, vary: 0.25, sat: 0.6, tint: { r: 0.62, g: 0.58, b: 0.56 } } },
    'env-rock2': { use: [['kit-rock1', 1], ['kit-rock3', 1]], opt: { cell: 400, near: 1e5, vary: 0.2, sat: 0.6, tint: { r: 0.62, g: 0.58, b: 0.56 } } },
    'env-rock3': { use: [['kit-rock2', 1], ['kit-rock3', 1]], opt: { cell: 400, near: 1e5, vary: 0.2, sat: 0.6, tint: { r: 0.62, g: 0.58, b: 0.56 } } }
  }
};

// Скалы и утёсы, у которых нет замены, перекрашиваются под геологию места: в бухте тёплый известняк,
// на островках — светлый коралловый камень, на озере — холодный гранит, в океане — бурый базальт.
const STONE = { bay: { r: 1.14, g: 1.02, b: 0.84 }, keys: { r: 1.5, g: 1.45, b: 1.3 }, lake: { r: 0.94, g: 0.98, b: 1.03 }, blue: { r: 0.66, g: 0.6, b: 0.56 } };
/** Насыщенность камня без замены: светлый известняк островков почти без цвета. */
export const stoneSat = (s = 1) => (LOC_ID === 'keys' && !kitOff() ? s * 0.55 : s);
export function stoneTint(t) {
  const k = STONE[LOC_ID];
  if (!k || kitOff()) return t;
  const b = t || { r: 1, g: 1, b: 1 };
  return { r: b.r * k.r, g: b.g * k.g, b: b.b * k.b };
}
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
