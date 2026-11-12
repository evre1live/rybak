// РЫБАК — правила: клёв, выбор рыбы, вываживание, цены, рынок, профиль игрока.
import { FISH, FISH_BY_ID, JUNK, JUNK_BY_ID, RARITY, ZONES, ITEMS, RODS, LINES, REELS, HOOKS, FLOATS, BAGS, MARKET_PERIOD, dayPart, isLure } from './data.js';

export function mulberry32(a) {
  a >>>= 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ───── набор снастей → цифры ─────
export function kitStats(p) {
  const rod = ITEMS[p.equip.rod] || RODS[0];
  const line = ITEMS[p.equip.line] || LINES[0];
  const reel = ITEMS[p.equip.reel] || REELS[0];
  const hook = ITEMS[p.equip.hook] || HOOKS[0];
  const fl = ITEMS[p.equip.float] || FLOATS[0];
  const bag = ITEMS[p.equip.bag] || BAGS[0];
  return {
    cast: rod.cast,
    lineKg: rod.line * line.mult,
    reel: rod.reel * reel.mult,
    smooth: 1 + REELS.findIndex((r) => r.id === reel.id) * 0.13,
    hookWin: 0.95 * hook.win * fl.win,
    hold: hook.hold,
    biteMult: fl.bite || 1,
    nightMult: fl.night || 1,
    bagCap: bag.cap,
    net: !!(p.owned && p.owned.net),
    sonar: !!(p.owned && p.owned.sonar)
  };
}
// полоски в карточке удочки (0…1)
export const rodBars = (rod) => ({ cast: rod.cast / 60, line: Math.sqrt(rod.line / 22), reel: (rod.reel - 0.55) / 1.05 });

export function tackleInfo(id) {
  const it = ITEMS[id] || ITEMS.bread;
  if (it.cat === 'lure') return { id: it.id, lure: true, attract: 0.9 * Math.sqrt(it.power), power: it.power, rare: it.rare, size: it.size };
  return { id: it.id, lure: false, attract: it.attract, power: 0, rare: it.rare, size: it.size };
}

// ───── кто клюнет ─────
// spot: { zone, depth, pier, hot }
export function speciesWeights(spot, tackleId, hour) {
  const tk = tackleInfo(tackleId);
  const part = dayPart(hour);
  const out = [];
  for (const f of FISH) {
    let z = f.zones[spot.zone] || 0;
    if (spot.pier && spot.zone !== 'pier') z += (f.zones.pier || 0) * 0.8;
    if (!z) continue;
    if (f.minDepth && spot.depth < f.minDepth) continue;
    const aff = tk.lure ? f.lure * tk.power : f.baits[tk.id] ?? 0.3;
    if (!aff) continue;
    const boost = tk.rare * (spot.hot ? 1.5 : 1);
    const rar = RARITY[f.rar].mult * (f.rar >= 2 ? boost : f.rar === 1 ? Math.sqrt(boost) : 1);
    const w = z * aff * (f.time[part] ?? 1) * rar;
    if (w > 0) out.push({ f, w });
  }
  return out;
}
export function rollFish(spot, tackleId, hour, rng) {
  const tk = tackleInfo(tackleId);
  const junkChance = tk.lure ? 0.015 : { shallow: 0.07, pier: 0.07, backwater: 0.06, mid: 0.025 }[spot.zone] || 0.008;
  const list = speciesWeights(spot, tackleId, hour);
  if (!list.length || rng() < junkChance) {
    let j = JUNK[Math.floor(rng() * 4)];
    if (rng() < 0.05) j = JUNK_BY_ID.chest;
    return { sp: j.id, junk: true, w: round3(j.w[0] + (j.w[1] - j.w[0]) * rng()), len: 0, trophy: false };
  }
  let total = 0;
  for (const e of list) total += e.w;
  let r = rng() * total;
  let f = list[list.length - 1].f;
  for (const e of list) {
    r -= e.w;
    if (r <= 0) {
      f = e.f;
      break;
    }
  }
  const sizeBoost = tk.size * (spot.hot ? 1.15 : 1);
  const k = clamp(2.6 - (sizeBoost - 1) * 1.6, 1.3, 2.6);
  const u = Math.pow(rng(), k);
  const w = round3(f.w[0] + (f.w[1] - f.w[0]) * u);
  return { sp: f.id, w, len: Math.round(f.look.lenK * Math.cbrt(w)), trophy: u > 0.8, junk: false };
}
const round3 = (v) => Math.round(v * 1000) / 1000;

// сколько ждать поклёвку, сек (для приманки таймер идёт только во время подмотки)
export function biteDelay(spot, tackleId, hour, kit, rng) {
  const tk = tackleInfo(tackleId);
  const part = dayPart(hour);
  const partMult = { dawn: 1.2, day: 1, dusk: 1.2, night: 0.85 }[part];
  let rate = (1 / 10.5) * (ZONES[spot.zone] ? ZONES[spot.zone].act : 1) * tk.attract * kit.biteMult * partMult;
  if (spot.hot) rate *= 1.8;
  if (part === 'night') rate *= kit.nightMult;
  const t = clamp(-Math.log(1 - rng() * 0.999) / rate, 2.5, 28);
  return { t: tk.lure ? t * 0.5 : t, nibbles: tk.lure ? 0 : Math.floor(rng() * 3) };
}
// доля активности клёва 0…1 для эхолота
export function activity(spot, tackleId, hour, kit) {
  const tk = tackleInfo(tackleId);
  const part = dayPart(hour);
  let a = (ZONES[spot.zone] ? ZONES[spot.zone].act : 1) * tk.attract * kit.biteMult * { dawn: 1.2, day: 1, dusk: 1.2, night: 0.85 }[part];
  if (spot.hot) a *= 1.8;
  return clamp(a / 2.4, 0.05, 1);
}

// ───── цены и рынок ─────
export function marketState(seed, tSec) {
  const period = Math.floor(tSec / MARKET_PERIOD);
  const rng = mulberry32(hashStr(seed + ':' + period));
  const mult = {};
  for (const f of FISH) mult[f.id] = Math.round((0.85 + rng() * 0.35) * 100) / 100;
  const pick = (rars) => {
    const pool = FISH.filter((f) => rars.includes(f.rar));
    return pool[Math.floor(rng() * pool.length)].id;
  };
  const hot = [pick([0]), pick([1]), pick([2, 3])];
  for (const id of hot) mult[id] = 1.6;
  return { period, mult, hot, nextIn: MARKET_PERIOD - (tSec - period * MARKET_PERIOD) };
}
export function fishValue(c, market) {
  if (c.junk) {
    const j = JUNK_BY_ID[c.sp];
    return j ? (j.id === 'chest' ? Math.round(j.price * (0.7 + c.w / 10)) : j.price) : 1;
  }
  const f = FISH_BY_ID[c.sp];
  if (!f) return 1;
  const avg = f.w[0] + (f.w[1] - f.w[0]) * 0.28;
  let v = f.price * Math.pow(c.w / avg, 0.9);
  if (c.trophy) v *= 1.25;
  if (market && market.mult[c.sp]) v *= market.mult[c.sp];
  return Math.max(1, Math.round(v));
}

// ───── вываживание ─────
export const T_LOW = 0.22;
export const T_DANGER = 0.78;
export function fightInit(c, kit, rng) {
  const f = FISH_BY_ID[c.sp];
  const power = c.junk || !f ? 0.25 : f.str * Math.pow(c.w, 0.55);
  const rho = power / (kit.lineKg * 0.9);
  return {
    power, rho, junk: !!c.junk, temper: f ? f.str : 0.5,
    stamina: 1.7 + 2.9 * Math.pow(power, 0.75),
    T: 0.45, p: 0.06, strain: 0, slack: 0,
    phase: 'calm', phaseT: 1.2 + rng() * 1.2, pull: 0.35, dir: 0, t: 0, result: null, next: null, warned: false
  };
}
// input: { reel: boolean, steer: -1|0|1 } → список событий: 'run', 'calm', 'jump', 'landed', 'snap', 'escape'
export function fightStep(s, input, dt, kit, rng) {
  const ev = [];
  if (s.result) return ev;
  s.t += dt;
  s.phaseT -= dt;
  const rc = Math.min(1.6, s.rho);
  // следующая фаза решается заранее: за полсекунды до рывка рыба «предупреждает» всплеском
  if (s.next == null) s.next = nextPhase(s, rng);
  if (s.phase === 'calm' && s.next === 'run' && !s.warned && s.phaseT <= 0.5) {
    s.warned = true;
    ev.push('warn');
  }
  if (s.phaseT <= 0) {
    if (s.next === 'run') {
      s.phase = 'run';
      s.phaseT = 0.9 + rng() * 1.5 + 0.6 * Math.min(1, s.rho);
      s.pull = (0.9 + 0.5 * Math.min(1, s.rho) + rng() * 0.15) * (0.72 + 0.28 * tired(s));
      s.dir = rng() < 0.5 ? -1 : 1;
      ev.push('run');
      if (rng() < 0.4) ev.push('jump');
    } else {
      s.phase = 'calm';
      s.phaseT = (1.6 + rng() * 2.2) * (1.25 - 0.35 * Math.min(1, s.rho));
      s.pull = (0.25 + rng() * 0.25) * (s.p > 0.75 ? 0.8 : 1);
      s.dir = 0;
      ev.push('calm');
    }
    s.next = null;
    s.warned = false;
  }
  const run = s.phase === 'run';
  let dT;
  if (input.reel) dT = (0.1 + 0.55 * s.pull * (0.3 + rc)) / kit.smooth;
  else dT = -(0.5 - 0.38 * s.pull * Math.min(1.2, 0.2 + rc));
  if (run && s.dir) {
    if (input.steer === -s.dir) dT -= 0.22;
    else if (input.steer === s.dir) dT += 0.2;
  }
  s.T = clamp(s.T + dT * dt, 0, 1);

  if (s.T > T_DANGER) {
    s.strain += dt * clamp(s.rho * 1.1 + 0.3, 0.4, 1.6) * (1 + (2.5 * (s.T - T_DANGER)) / (1 - T_DANGER));
    if (s.strain >= 1) {
      s.result = 'snap';
      ev.push('snap');
      return ev;
    }
  } else s.strain = Math.max(0, s.strain - dt * 1.0);

  if (s.T < T_LOW) {
    s.slack += dt * (0.4 + 0.6 * s.pull) * kit.hold * (run ? 1.6 : 1);
    if (s.slack >= 1.6 && !s.junk) {
      s.result = 'escape';
      ev.push('escape');
      return ev;
    }
  } else s.slack = Math.max(0, s.slack - dt * 0.5);

  const eff = s.T < T_LOW ? 0.35 : s.T > T_DANGER ? 0.85 : 1;
  if (input.reel) s.p += (kit.reel * eff * (run ? (input.steer === -s.dir ? 0.75 : 0.35) : 1) * dt) / s.stamina;
  else s.p -= ((run ? 0.1 : 0.03) * (0.5 + Math.min(1.2, s.rho)) * tired(s) * dt) / Math.sqrt(s.stamina);
  s.p = clamp(s.p, 0, 1);
  if (s.p >= (kit.net ? 0.85 : 1)) {
    s.result = 'landed';
    ev.push('landed');
  }
  return ev;
}
// рыба устаёт: чем дольше борьба, тем слабее и реже рывки
const tired = (s) => 1 / (1 + s.t / 35);
function nextPhase(s, rng) {
  if (s.junk || s.phase === 'run') return 'calm';
  const runChance = clamp(0.35 + 0.5 * Math.min(1, s.rho) + (s.temper - 1) * 0.3, 0.15, 0.95);
  return rng() < runChance * (0.55 + 0.45 * tired(s)) ? 'run' : 'calm';
}
// насколько тяжёлой будет борьба — подсказка для карточки и ленты
export function fightGrade(rho) {
  return rho < 0.3 ? 'лёгкая' : rho < 0.7 ? 'упорная' : rho < 1.1 ? 'тяжёлая' : 'на пределе снасти';
}

// ───── опыт и звания ─────
export function xpFor(c) {
  if (c.junk) return 2;
  const f = FISH_BY_ID[c.sp];
  return Math.round(6 * Math.pow(f.rar + 1, 1.6) * (c.trophy ? 1.5 : 1) + 3 * Math.sqrt(c.w));
}
const TITLES = ['Новичок', 'Новичок', 'Любитель', 'Любитель', 'Рыбак', 'Рыбак', 'Бывалый', 'Бывалый', 'Знаток', 'Знаток', 'Мастер', 'Мастер', 'Капитан', 'Капитан', 'Морской волк'];
export function levelInfo(xp) {
  let lvl = 1;
  let need = 60;
  let left = xp;
  while (left >= need && lvl < 99) {
    left -= need;
    lvl++;
    need = Math.round(60 * Math.pow(lvl, 1.45));
  }
  return { lvl, cur: left, need, title: lvl >= 20 ? 'Легенда бухты' : TITLES[Math.min(TITLES.length - 1, lvl - 1)] };
}

// ───── профиль игрока ─────
export const PROFILE_VERSION = 1;
export function newProfile() {
  return {
    v: PROFILE_VERSION,
    name: '',
    look: null,
    coins: 40,
    xp: 0,
    owned: { rod1: 1, line1: 1, reel1: 1, hook1: 1, float1: 1, bag1: 1 },
    equip: { rod: 'rod1', line: 'line1', reel: 'reel1', hook: 'hook1', float: 'float1', bag: 'bag1', tackle: 'worm' },
    tackle: { worm: 20 },
    cooler: [],
    journal: {},
    stats: { casts: 0, caught: 0, sold: 0, earned: 0, snaps: 0, escapes: 0, best: null, legends: 0 },
    seenIntro: false,
    boatTrips: 0
  };
}
// подлатать сохранение из старой версии или с повреждениями
export function fixProfile(p) {
  const d = newProfile();
  if (!p || typeof p !== 'object') return d;
  for (const k of Object.keys(d)) if (p[k] === undefined || p[k] === null) p[k] = d[k];
  for (const k of ['owned', 'equip', 'tackle', 'journal', 'stats']) if (typeof p[k] !== 'object') p[k] = d[k];
  for (const k of Object.keys(d.owned)) p.owned[k] = 1;
  for (const k of Object.keys(d.equip)) if (!ITEMS[p.equip[k]] || (k !== 'tackle' && !p.owned[p.equip[k]])) p.equip[k] = d.equip[k];
  for (const k of Object.keys(d.stats)) if (p.stats[k] === undefined) p.stats[k] = d.stats[k];
  if (!Array.isArray(p.cooler)) p.cooler = [];
  p.cooler = p.cooler.filter((c) => c && (FISH_BY_ID[c.sp] || JUNK_BY_ID[c.sp]) && c.w > 0);
  p.coins = Math.max(0, Math.round(Number(p.coins) || 0));
  p.xp = Math.max(0, Math.round(Number(p.xp) || 0));
  p.boatTrips = Math.max(0, Math.round(Number(p.boatTrips) || 0));
  if (tackleCount(p, p.equip.tackle) <= 0) p.equip.tackle = 'bread';
  p.v = PROFILE_VERSION;
  return p;
}
export const tackleCount = (p, id) => (id === 'bread' ? Infinity : p.tackle[id] || 0);
export const owns = (p, id) => {
  const it = ITEMS[id];
  if (!it) return false;
  return it.count ? tackleCount(p, id) > 0 : !!p.owned[id];
};
export function priceOf(id) {
  const it = ITEMS[id];
  if (!it) return 0;
  return it.cat === 'tackle' ? it.price * it.pack : it.price;
}
export function buy(p, id) {
  const it = ITEMS[id];
  if (!it) return { ok: false, error: 'Такого товара нет' };
  if (id === 'bread') return { ok: false, error: 'Хлеб и так бесплатный' };
  if (!it.count && p.owned[id]) return { ok: false, error: 'Уже куплено' };
  const price = priceOf(id);
  if (p.coins < price) return { ok: false, error: `Не хватает ${price - p.coins} монет` };
  p.coins -= price;
  if (it.count) {
    p.tackle[id] = (p.tackle[id] || 0) + (it.cat === 'tackle' ? it.pack : 1);
    if (it.cat === 'lure' || p.equip.tackle === 'bread') p.equip.tackle = id;
  } else {
    p.owned[id] = 1;
    if (it.slot) p.equip[it.slot] = id;
  }
  return { ok: true, price };
}
export function equip(p, id) {
  const it = ITEMS[id];
  if (!it || !it.slot) return { ok: false, error: 'Это нельзя взять в руки' };
  if (!owns(p, id)) return { ok: false, error: 'Сначала купите это на рынке' };
  p.equip[it.slot] = id;
  return { ok: true };
}
// наживка съедена (или приманка потеряна): минус одна; кончилась — переходим на хлеб
export function spendTackle(p) {
  const id = p.equip.tackle;
  if (id === 'bread') return { left: Infinity, switched: false };
  p.tackle[id] = Math.max(0, (p.tackle[id] || 0) - 1);
  if (p.tackle[id] <= 0) {
    delete p.tackle[id];
    p.equip.tackle = 'bread';
    return { left: 0, switched: true };
  }
  return { left: p.tackle[id], switched: false };
}
export function addCatch(p, c, kit) {
  if (p.cooler.length >= kit.bagCap) return { ok: false, full: true };
  p.cooler.push({ sp: c.sp, w: c.w, len: c.len, trophy: !!c.trophy, junk: !!c.junk });
  return { ok: true };
}
// учёт пойманного в журнале и опыте — и для отпущенной рыбы тоже
export function recordCatch(p, c, released) {
  const xp = Math.round(xpFor(c) * (released ? 1.3 : 1));
  const before = levelInfo(p.xp).lvl;
  p.xp += xp;
  p.stats.caught++;
  let isNew = false;
  let record = false;
  if (!c.junk) {
    const j = p.journal[c.sp] || (p.journal[c.sp] = { n: 0, best: 0 });
    isNew = j.n === 0;
    j.n++;
    if (c.w > j.best) {
      record = !isNew;
      j.best = c.w;
    }
    if (FISH_BY_ID[c.sp].rar === 4) p.stats.legends++;
    if (!p.stats.best || c.w > p.stats.best.w) p.stats.best = { sp: c.sp, w: c.w };
  }
  return { xp, isNew, record, levelUp: levelInfo(p.xp).lvl > before ? levelInfo(p.xp).lvl : 0 };
}
export function sell(p, index, market) {
  const list = index == null ? p.cooler.slice() : [p.cooler[index]].filter(Boolean);
  if (!list.length) return { ok: false, error: 'Садок пуст' };
  let total = 0;
  for (const c of list) total += fishValue(c, market);
  if (index == null) p.cooler = [];
  else p.cooler.splice(index, 1);
  p.coins += total;
  p.stats.sold += list.length;
  p.stats.earned += total;
  return { ok: true, total, n: list.length };
}
export function coolerValue(p, market) {
  let t = 0;
  for (const c of p.cooler) t += fishValue(c, market);
  return t;
}

// ───── бот для проверки баланса (и для тестов) ─────
export function botFight(c, kit, rng, skill = 0.85) {
  const s = fightInit(c, kit, rng);
  let steer = 0;
  let react = 0;
  let reel = true;
  let think = 0;
  const lag = 0.08 + (1 - skill) * 0.55; // как быстро человек замечает перемену
  const dt = 1 / 30;
  for (let i = 0; i < 30 * 240 && !s.result; i++) {
    const run = s.phase === 'run';
    think -= dt;
    if (think <= 0) {
      think = lag * (0.6 + rng() * 0.8);
      const limit = (run ? 0.5 : s.warned ? 0.4 : 0.66) + (rng() - 0.5) * (1 - skill) * 0.3;
      reel = s.T < limit || s.T < 0.3;
    }
    if (run && s.dir) {
      react += dt;
      steer = react > 0.25 + (1 - skill) * 0.9 ? -s.dir : 0;
    } else {
      react = 0;
      steer = 0;
    }
    fightStep(s, { reel, steer }, dt, kit, rng);
  }
  return { result: s.result || 'timeout', t: s.t, rho: s.rho };
}
