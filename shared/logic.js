// РЫБАК — правила: клёв, выбор рыбы, вываживание, цены, рынок, профиль игрока.
import { FISH, FISH_BY_ID, JUNK, JUNK_BY_ID, RARITY, ZONES, ITEMS, RODS, LINES, REELS, HOOKS, FLOATS, BAGS, MARKET_PERIOD, dayPart, isLure, zonesOf, fishOf } from './data.js';
import { DEFAULT_LOC, locOf } from './locations.js';

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
// spot: { zone, depth, pier, hot }; loc — локация: у рыбы на каждой свои места (data.js: zones и at)
export function speciesWeights(spot, tackleId, hour, loc) {
  const tk = tackleInfo(tackleId);
  const part = dayPart(hour);
  const out = [];
  for (const f of FISH) {
    const zones = zonesOf(f, loc);
    let z = zones[spot.zone] || 0;
    if (spot.pier && spot.zone !== 'pier') z += (zones.pier || 0) * 0.8;
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
export function rollFish(spot, tackleId, hour, rng, loc) {
  const tk = tackleInfo(tackleId);
  // spot.big (0…1) — рыбу выследили: наживка легла рядом с крупной тенью в воде. Тогда это точно рыба, а не хлам,
  // и не мелочь: чем крупнее тень, тем выше нижняя граница веса.
  const junkChance = spot.big ? 0 : tk.lure ? 0.015 : { shallow: 0.07, pier: 0.07, backwater: 0.06, mid: 0.025 }[spot.zone] || 0.008;
  const list = speciesWeights(spot, tackleId, hour, loc);
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
  let u = Math.pow(rng(), k);
  if (spot.big) u = Math.min(1, Math.max(u, 0.35 + 0.4 * clamp(spot.big, 0, 1) + rng() * 0.1));
  const w = round3(f.w[0] + (f.w[1] - f.w[0]) * u);
  const c = { sp: f.id, w, len: Math.round(f.look.lenK * Math.cbrt(w)), trophy: u > 0.8, junk: false };
  if (spot.big) c.stalked = true; // «выслежена»: за такую дают больше опыта
  return c;
}
const round3 = (v) => Math.round(v * 1000) / 1000;

// сколько ждать поклёвку, сек (для приманки таймер идёт только во время подмотки)
export function biteDelay(spot, tackleId, hour, kit, rng) {
  const tk = tackleInfo(tackleId);
  const part = dayPart(hour);
  const partMult = { dawn: 1.2, day: 1, dusk: 1.2, night: 0.85 }[part];
  let rate = (1 / 10.5) * (ZONES[spot.zone] ? ZONES[spot.zone].act : 1) * tk.attract * kit.biteMult * partMult;
  if (spot.hot) rate *= 1.8;
  if (spot.big) rate *= 2.4; // крупная рыба рядом и уже заметила наживку
  if (spot.wx) rate *= spot.wx; // погода: в дождь и туман рыба берёт охотнее
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
  if (spot.wx) a *= spot.wx;
  return clamp(a / 2.4, 0.05, 1);
}

// ───── цены и рынок ─────
/**
 * Рынок комнаты на локации loc: цены на здешнюю рыбу и три вида «в цене» — из тех, что здесь ловятся. Привозная рыба
 * (с других локаций) тоже продаётся; её цены считаются отдельным счётом, чтобы здешние от неё не зависели:
 * в бухте всё осталось таким же, каким было до появления других локаций.
 */
export function marketState(seed, tSec, loc = DEFAULT_LOC) {
  const period = Math.floor(tSec / MARKET_PERIOD);
  const rng = mulberry32(hashStr(seed + ':' + period));
  const price = (r) => Math.round((0.85 + r() * 0.35) * 100) / 100;
  const here = fishOf(loc);
  const mult = {};
  for (const f of here) mult[f.id] = price(rng);
  const pick = (rars) => {
    const pool = here.filter((f) => rars.includes(f.rar));
    return pool[Math.floor(rng() * pool.length)].id;
  };
  const hot = [pick([0]), pick([1]), pick([2, 3])];
  for (const id of hot) mult[id] = 1.6;
  const far = mulberry32(hashStr(seed + ':' + period + ':far'));
  for (const f of FISH) if (!(f.id in mult)) mult[f.id] = price(far);
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
export const T_JUMP = 0.62; // пока рыба в прыжке, «опасно» начинается раньше: леску надо ослабить
export const T_LIFT = 0.6; // залёгшую рыбу отрывают от дна натяжением у верхней границы нормы
export const T_TIGHT = 0.5; // тяжеловес идёт к берегу, только пока леска внатяг
// Манера рыбы (FISH[].style): множители к общим правилам борьбы —
// runs: как часто рывки, len: их длина, pull: сила, jump: шанс свечи в рывке, calm: тяга между рывками.
// Таблицы открыты наружу только для подбора баланса и тестов: игра их не меняет.
export const STYLE_K = {
  plain: { runs: 1, len: 1, pull: 1, jump: 0.3, calm: 1 },
  runner: { runs: 1.2, len: 1.3, pull: 1, jump: 0.15, calm: 0.95 },
  jumper: { runs: 1.1, len: 0.9, pull: 1, jump: 0.9, calm: 1 },
  bulldog: { runs: 0.65, len: 1.15, pull: 1, jump: 0.05, calm: 1.15 },
  thrash: { runs: 1.2, len: 0.6, pull: 0.85, jump: 0.3, calm: 1 },
  snag: { runs: 1.05, len: 1, pull: 0.9, jump: 0.1, calm: 1 },
  flat: { runs: 0.8, len: 0.9, pull: 1, jump: 0, calm: 1.1 }
};
export const FIGHT_K = {
  leap: 0.35, // рыба в воздухе не держит отпущенную леску: та успевает ослабнуть
  slackBulldog: 0.6, // сколько хода теряет тяжеловес на вялой леске
  snagPush: 0.12, // прибавка натяжения, пока хитреца не увели от укрытия
  snagWrap: 1.1, // через столько секунд леска заходит за камни
  shake: 1, // размах тряски трясуна
  stick: 0.75, // шанс, что присоска заляжет в очередную передышку
  lift: 1.6, // сколько секунд держать натяжение в зоне отрыва (для рыбы в полную силу снасти)
  bossBack: 0.1, // сколько пути забирает легенда, собравшись с силами
  bossRest: 0.75, // какая доля усталости при этом остаётся
  bossLen: 1.3, // её рывок после этого длиннее
  bossPull: 1.1 // и сильнее
};
const JUMP_T = 0.75; // столько длится свеча (и у картинки тоже)
const JUMP_GRACE = 0.2; // первые доли секунды прыжка — время заметить и отпустить кнопку
/** Сколько секунд держать натяжение в зоне отрыва, чтобы залёгшая рыба подалась. */
export const liftNeed = (s) => (0.5 + 0.5 * Math.min(1, s.rho)) * FIGHT_K.lift;
/** Где сейчас начинается опасная зона шкалы натяжения: пока рыба в воздухе — раньше обычного. */
export const dangerAt = (s) => (s.jumpT > 0 && s.jumpT < JUMP_T - JUMP_GRACE ? T_JUMP : T_DANGER);
export function fightInit(c, kit, rng) {
  const f = FISH_BY_ID[c.sp];
  const power = c.junk || !f ? 0.25 : f.str * Math.pow(c.w, 0.55);
  const rho = power / (kit.lineKg * 0.9);
  return {
    power, rho, junk: !!c.junk, temper: f ? f.str : 0.5,
    stamina: 1.7 + 2.9 * Math.pow(power, 0.75),
    T: 0.45, p: 0.06, strain: 0, slack: 0,
    phase: 'calm', phaseT: 1.2 + rng() * 1.2, pull: 0.35, dir: 0, t: 0, fat: 0, result: null, next: null, warned: false,
    style: c.junk || !f ? 'plain' : f.style || 'plain',
    boss: f && !c.junk && f.rar >= 4 ? 2 : 0, // у легенды два «вторых дыхания»
    bossMax: f && !c.junk && f.rar >= 4 ? 2 : 0,
    rage: false, jumpT: 0, stuck: 0, stuckT: 0, lift: 0, stickCd: 0, wrapT: 0, wrapped: false
  };
}
// input: { reel: boolean, steer: -1|0|1 } → список событий:
// 'warn', 'run', 'calm', 'jump', 'landed', 'snap', 'escape' — у всех; 'rage' — легенда собралась с силами;
// 'stuck' / 'unstuck' — присоска залегла и оторвана; 'wrap' — хитрец завёл леску за камни.
export function fightStep(s, input, dt, kit, rng) {
  const ev = [];
  if (s.result) return ev;
  s.t += dt;
  s.fat += dt; // усталость рыбы: растёт со временем, у легенды частично сбрасывается
  s.phaseT -= dt;
  const K = STYLE_K[s.style] || STYLE_K.plain;
  const F = FIGHT_K;
  const rc = Math.min(1.6, s.rho);
  const k01 = Math.min(1, s.rho); // слабая для этой снасти рыба чудит вполсилы
  // легенда: на 45 % и на 80 % пути собирается с силами — часть лески уходит обратно, усталость сбрасывается, сразу рывок
  if (s.boss > 0 && s.p >= (s.boss === 2 ? 0.45 : 0.8)) {
    s.boss--;
    s.p = Math.max(0.02, s.p - F.bossBack);
    s.fat *= F.bossRest;
    s.rage = true;
    s.next = 'run';
    s.phase = 'calm';
    s.phaseT = 0.6; // рывок — через полсекунды: успеть ослабить
    s.warned = true;
    s.stuck = 0;
    ev.push('rage');
  }
  // следующая фаза решается заранее: за полсекунды до рывка рыба «предупреждает» всплеском
  if (s.next == null) s.next = nextPhase(s, rng, K);
  if (s.phase === 'calm' && s.next === 'run' && !s.warned && s.phaseT <= 0.5) {
    s.warned = true;
    ev.push('warn');
  }
  if (s.phaseT <= 0) {
    if (s.next === 'run') {
      const rage = s.rage;
      s.rage = false;
      s.phase = 'run';
      s.phaseT = (0.9 + rng() * 1.5 + 0.6 * k01) * K.len * (rage ? F.bossLen : 1);
      s.pull = (0.9 + 0.5 * k01 + rng() * 0.15) * (0.72 + 0.28 * tired(s)) * K.pull * (rage ? F.bossPull : 1);
      s.dir = rng() < 0.5 ? -1 : 1;
      s.wrapT = 0;
      s.wrapped = false;
      ev.push('run');
      if (rng() < K.jump) {
        s.jumpT = JUMP_T;
        s.phaseT += JUMP_T * (1 - F.leap); // свеча не съедает рывок: после неё рыба дотягивает своё
        ev.push('jump');
      }
    } else {
      s.phase = 'calm';
      s.phaseT = (1.6 + rng() * 2.2) * (1.25 - 0.35 * k01);
      s.pull = (0.25 + rng() * 0.25) * (s.p > 0.75 ? 0.8 : 1) * K.calm;
      s.dir = 0;
      ev.push('calm');
      // присоска залегает на дно: пока не оторвёшь — ни с места
      if (s.style === 'flat' && !s.stuck && s.stickCd <= 0 && s.p > 0.12 && s.p < 0.92 && rng() < F.stick) {
        s.stuck = 1;
        s.stuckT = 0;
        s.lift = 0;
        ev.push('stuck');
      }
    }
    s.next = null;
    s.warned = false;
  }
  const run = s.phase === 'run';
  const leap = s.jumpT > 0;
  // залёгшая рыба тянет слабее; рыба в воздухе не держит отпущенную леску — та быстро слабнет,
  // а вот подмотка в прыжке тянет в полную силу
  const pull = s.pull * (leap && !input.reel ? F.leap : s.stuck ? 0.6 : 1);
  let dT;
  if (input.reel) dT = (0.1 + 0.55 * pull * (0.3 + rc)) / kit.smooth;
  else dT = -(0.5 - 0.38 * pull * Math.min(1.2, 0.2 + rc));
  if (run && s.dir) {
    if (input.steer === -s.dir) dT -= 0.22;
    else if (input.steer === s.dir) dT += 0.2;
    // хитрец тянет в укрытие: не увёл — натяжение растёт, а через секунду леска заходит за камни
    if (s.style === 'snag') {
      if (input.steer === -s.dir) s.wrapT = Math.max(0, s.wrapT - dt * 2);
      else {
        dT += F.snagPush * k01;
        s.wrapT += dt;
        if (s.wrapT >= F.snagWrap && !s.wrapped) {
          s.wrapped = true;
          s.T = Math.min(1, s.T + 0.1 + 0.08 * k01);
          ev.push('wrap');
        }
      }
    }
  }
  // трясун мотает головой: стрелка дрожит (размах 1–3 % шкалы, в рывке в полтора раза шире)
  if (s.style === 'thrash') dT += Math.cos(s.t * 21) * 21 * (0.012 + 0.022 * k01) * (run ? 1.4 : 1) * F.shake;
  s.T = clamp(s.T + dT * dt, 0, 1);

  // пока рыба в прыжке, тугая леска — почти верный обрыв: опасная зона начинается раньше
  const danger = dangerAt(s);
  if (leap) s.jumpT -= dt;
  if (s.T > danger) {
    s.strain += dt * clamp(s.rho * 1.1 + 0.3, 0.4, 1.6) * (1 + (2.5 * (s.T - danger)) / (1 - danger));
    if (s.strain >= 1) {
      s.result = 'snap';
      ev.push('snap');
      return ev;
    }
  } else s.strain = Math.max(0, s.strain - dt * 1.0);

  if (s.T < T_LOW && !leap) {
    s.slack += dt * (0.4 + 0.6 * s.pull) * kit.hold * (run ? 1.6 : 1);
    if (s.slack >= 1.6 && !s.junk) {
      s.result = 'escape';
      ev.push('escape');
      return ev;
    }
  } else s.slack = Math.max(0, s.slack - dt * 0.5);

  let eff = s.T < T_LOW ? 0.35 : s.T > T_DANGER ? 0.85 : 1;
  // тяжеловес идёт к берегу, только пока леска внатяг
  if (s.style === 'bulldog' && s.T < T_TIGHT) eff *= 1 - F.slackBulldog * k01;
  if (s.stickCd > 0) s.stickCd -= dt;
  if (s.stuck) {
    // залегла: отрывают натяжением у верхней границы нормы; через шесть секунд снимется сама
    s.stuckT += dt;
    if (s.T >= T_LIFT && s.T <= T_DANGER) s.lift += dt;
    if (s.lift >= liftNeed(s) || s.stuckT > 9) {
      s.stuck = 0;
      s.stickCd = 6;
      s.p = Math.min(1, s.p + 0.03);
      ev.push('unstuck');
    }
  } else if (input.reel) s.p += (kit.reel * eff * (run ? (input.steer === -s.dir ? 0.75 : 0.35) : 1) * dt) / s.stamina;
  else s.p -= ((run ? 0.1 : 0.03) * (0.5 + Math.min(1.2, s.rho)) * tired(s) * dt) / Math.sqrt(s.stamina);
  s.p = clamp(s.p, 0, 1);
  if (s.p >= (kit.net ? 0.85 : 1)) {
    s.result = 'landed';
    ev.push('landed');
  }
  return ev;
}
// рыба устаёт: чем дольше борьба, тем слабее и реже рывки
const tired = (s) => 1 / (1 + s.fat / 35);
function nextPhase(s, rng, K) {
  if (s.junk || s.phase === 'run' || s.stuck) return 'calm';
  const runChance = Math.min(0.97, clamp(0.35 + 0.5 * Math.min(1, s.rho) + (s.temper - 1) * 0.3, 0.15, 0.95) * K.runs);
  return rng() < runChance * (0.55 + 0.45 * tired(s)) ? 'run' : 'calm';
}
// ───── помощь друга: подсачить чужую рыбу ─────
export const ASSIST_AT = 0.7; // друг берёт рыбу в подсак раньше, чем рыбак возьмёт её сам (свой подсачек — с 85 % пути)
export const ASSIST_REACH = 3.4; // …если стоит не дальше этого от рыбака, м
/**
 * Можно ли сейчас подсачить рыбу: '' — да, иначе причина. early — рыба ещё далеко; boss — у легенды впереди
 * «второе дыхание»; stuck — залегла на дно; air — в свече.
 */
export function assistBlock(s) {
  if (!s || s.result || !(s.p >= ASSIST_AT)) return 'early';
  if (s.boss > 0) return 'boss';
  if (s.stuck) return 'stuck';
  if (s.jumpT > 0) return 'air';
  return '';
}
/** Друг подсачил рыбу: бой окончен. Возвращает false, если брать ещё нельзя (assistBlock). */
export function fightAssist(s) {
  if (assistBlock(s)) return false;
  s.p = 1;
  s.assisted = true;
  s.result = 'landed';
  return true;
}
/** Опыт помощнику — четверть того, что рыба даёт рыбаку. */
export const assistXp = (c) => Math.max(2, Math.round(xpFor(c) * 0.25));
export function recordAssist(p, c) {
  const xp = assistXp(c);
  const before = levelInfo(p.xp).lvl;
  p.xp += xp;
  p.stats.assists++;
  return { xp, levelUp: levelInfo(p.xp).lvl > before ? levelInfo(p.xp).lvl : 0 };
}
// насколько тяжёлой будет борьба — подсказка для карточки и ленты
export function fightGrade(rho) {
  return rho < 0.3 ? 'лёгкая' : rho < 0.7 ? 'упорная' : rho < 1.1 ? 'тяжёлая' : 'на пределе снасти';
}

// ───── опыт и звания ─────
export function xpFor(c) {
  if (c.junk) return 2;
  const f = FISH_BY_ID[c.sp];
  return Math.round((6 * Math.pow(f.rar + 1, 1.6) * (c.trophy ? 1.5 : 1) + 3 * Math.sqrt(c.w)) * (c.stalked ? 1.2 : 1));
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
    stats: { casts: 0, caught: 0, sold: 0, earned: 0, snaps: 0, escapes: 0, best: null, legends: 0, quests: 0, tours: 0, medals: 0, stalked: 0, assists: 0 },
    seenIntro: false,
    boatTrips: 0,
    quests: null // задания на день: появляются при первом входе (syncQuests)
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
  for (const k of ['quests', 'tours', 'medals', 'stalked', 'assists']) p.stats[k] = Math.max(0, Math.round(Number(p.stats[k]) || 0));
  if (!validQuests(p.quests)) p.quests = null;
  if (tackleCount(p, p.equip.tackle) <= 0) p.equip.tackle = 'bread';
  p.v = PROFILE_VERSION;
  return p;
}
// ───── перенос сохранения: файл, который можно унести на другое устройство или положить про запас ─────
export const SAVE_KIND = 'rybak-save';
/** Текст файла сохранения. at — когда сделано (мс), для подписи. */
export function exportSave(p, at = 0) {
  const { fresh, ...profile } = p;
  return JSON.stringify({ kind: SAVE_KIND, v: PROFILE_VERSION, at, name: String(p.name || ''), lvl: levelInfo(p.xp).lvl, profile });
}
/** Разобрать файл сохранения: { ok, profile, name, lvl, at } или { ok: false, why }. Профиль проходит ту же починку, что и при загрузке. */
export function importSave(text) {
  let d;
  try {
    d = JSON.parse(String(text));
  } catch {
    return { ok: false, why: 'Это не файл сохранения «Рыбака»' };
  }
  if (!d || d.kind !== SAVE_KIND || !d.profile || typeof d.profile !== 'object' || Array.isArray(d.profile)) return { ok: false, why: 'Это не файл сохранения «Рыбака»' };
  if (Number(d.v) > PROFILE_VERSION) return { ok: false, why: 'Файл сделан в более новой версии игры — обновите страницу и попробуйте снова' };
  let profile;
  try {
    profile = fixProfile(JSON.parse(JSON.stringify(d.profile)));
  } catch {
    return { ok: false, why: 'Файл сохранения повреждён' };
  }
  profile.name = String(profile.name || '').slice(0, 16);
  return { ok: true, profile, name: profile.name, lvl: levelInfo(profile.xp).lvl, at: Number(d.at) || 0 };
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
  if (c.stalked) p.stats.stalked++; // выслежена: наживку положили рядом с тенью в воде
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

// ───── погода ─────
// Погода общая для всех в комнате: считается из зерна комнаты и часов бухты, сервер её не рассылает.
// cover — насколько небо затянуто, rain и fog — дождь и туман (0…1), wind — ветер, bite — множитель клёва.
export const WEATHER = {
  clear: { name: 'Ясно', bite: 1, cover: 0, rain: 0, fog: 0, wind: 0.2 },
  cloudy: { name: 'Пасмурно', bite: 1.12, cover: 0.8, rain: 0, fog: 0.1, wind: 0.5 },
  rain: { name: 'Дождь', bite: 1.3, cover: 1, rain: 1, fog: 0.3, wind: 0.8 },
  fog: { name: 'Туман', bite: 1.15, cover: 0.5, rain: 0, fog: 1, wind: 0.05 }
};
export const WEATHER_PERIOD = 300; // погода держится пять минут…
export const WEATHER_FADE = 50; // …и за последние 50 секунд плавно переходит в следующую
const WEATHER_ODDS = [['clear', 0.46], ['cloudy', 0.26], ['rain', 0.17], ['fog', 0.11]];
export function weatherKind(seed, period) {
  if (period <= 0) return 'clear'; // бухта встречает солнцем
  let r = mulberry32(hashStr(seed + ':w:' + period))();
  for (const [k, w] of WEATHER_ODDS) {
    r -= w;
    if (r < 0) return k;
  }
  return 'clear';
}
/** Погода в момент tSec от начала комнаты. force — вид погоды насильно (для проверок и снимков). */
export function weatherAt(seed, tSec, force = null) {
  const t = Math.max(0, tSec);
  const period = Math.floor(t / WEATHER_PERIOD);
  const into = t - period * WEATHER_PERIOD;
  const a = WEATHER[force] ? force : weatherKind(seed, period);
  const b = WEATHER[force] ? force : weatherKind(seed, period + 1);
  let k = clamp((into - (WEATHER_PERIOD - WEATHER_FADE)) / WEATHER_FADE, 0, 1);
  k = k * k * (3 - 2 * k);
  const A = WEATHER[a];
  const B = WEATHER[b];
  const mix = (key) => A[key] + (B[key] - A[key]) * k;
  return { kind: k < 0.5 ? a : b, from: a, to: b, k, cover: mix('cover'), rain: mix('rain'), fog: mix('fog'), wind: mix('wind'), bite: mix('bite'), nextIn: WEATHER_PERIOD - into };
}

// ───── задания на день ─────
// Три задания: лёгкое, среднее и трудное. Виды заданий у всех игроков в этот день одинаковые (зерно — номер дня),
// числа подстраиваются под уровень. За каждое — монеты и опыт, за все три — премия.
const plural = (n, a, b, c) => (n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c);
const num = (v) => String(Math.round(v * 10) / 10).replace('.', ',');
const fishWord = (n) => plural(n, 'рыбу', 'рыбы', 'рыб');
const Q_ZONE = {
  pier: 'у свай причала', shallow: 'на мелководье', backwater: 'в заводи', reef: 'у рифа', falls: 'у водопада',
  sea: 'в открытом море', lagoon: 'в лагуне Пальмового острова', wreck: 'у затонувшего корабля',
  stones: 'у камней', pit: 'над ямой'
};
const Q_SPECIES = [
  ['bychok', 'plotva', 'okun', 'kefal', 'karas', 'stavrida'],
  ['kambala', 'skumbria', 'lesh', 'morokun', 'sargan', 'karp']
];
// что бывает на каждом уровне трудности: [вид задания, сколько нужно (или список на выбор)]
const Q_POOL = [
  [['fish', 5], ['kinds', 3], ['sp', 0], ['zone', ['pier', 'shallow', 'backwater']], ['sell', 60], ['free', 2], ['tour', 1]],
  [['fish', 8], ['kinds', 4], ['sp', 1], ['zone', ['backwater', 'reef', 'sea', 'falls']], ['sell', 150], ['free', 4], ['kg', 3], ['big', 1], ['rare', 1], ['trophy', 1], ['boat', 3], ['wx', 3]],
  [['fish', 12], ['kinds', 5], ['zone', ['sea', 'lagoon', 'wreck', 'reef']], ['sell', 350], ['kg', 7], ['big', 2.5], ['rare', 2], ['trophy', 2], ['boat', 6]]
];
// Рыба и места у каждой локации свои: задания «поймать такую-то рыбу» и «поймать там-то» на другой локации
// берут вид и зону из её списков (вид задания и числа остаются теми же — их определяет день).
const Q_ELSEWHERE = {
  lake: {
    sp: [['plotva', 'okun', 'karas', 'ersh'], ['lesh', 'harius', 'sig']],
    zone: [['pier', 'shallow', 'backwater'], ['backwater', 'falls', 'stones'], ['pit', 'falls', 'stones']]
  }
};
const Q_REWARD = [{ coins: 25, xp: 20 }, { coins: 60, xp: 45 }, { coins: 130, xp: 90 }];
export const QUEST_BONUS = 50; // премия за все три задания дня (растёт с уровнем, как и награды)
const lvlK = (lvl, step, max) => Math.min(max, 1 + step * (Math.max(1, lvl) - 1));
/** Номер дня по местному времени игрока — задания меняются в полночь. */
export const questDay = (ms, tzOffsetMin = 0) => Math.floor((ms - tzOffsetMin * 60000) / 86400000);
export function makeQuests(day, lvl = 1, loc = DEFAULT_LOC) {
  const there = Q_ELSEWHERE[loc];
  const rng = mulberry32(hashStr('quests:' + day));
  const used = new Set();
  const list = [];
  for (let tier = 0; tier < 3; tier++) {
    const pool = Q_POOL[tier].filter(([k]) => !used.has(k));
    const [k, spec] = pool[Math.floor(rng() * pool.length)];
    used.add(k);
    const q = { k, tier, n: 1, c: 0, done: false };
    const pick = rng();
    if (k === 'sp') {
      const ids = (there ? there.sp : Q_SPECIES)[spec];
      q.a = ids[Math.floor(pick * ids.length)];
      q.n = spec === 0 ? 3 : 2;
      if (there) q.loc = loc;
    } else if (k === 'zone') {
      const zs = there ? there.zone[tier] : spec;
      q.a = zs[Math.floor(pick * zs.length)];
      q.n = 3 + tier;
      if (there) q.loc = loc;
    } else if (k === 'rare') {
      q.a = spec; // редкость не ниже этой: 1 — необычная, 2 — редкая
    } else if (k === 'big') q.n = Math.round(spec * lvlK(lvl, 0.25, 6) * 10) / 10;
    else if (k === 'kg') q.n = Math.round(spec * lvlK(lvl, 0.2, 5));
    else if (k === 'sell') q.n = Math.round((spec * lvlK(lvl, 0.35, 12)) / 10) * 10;
    else q.n = spec;
    if (k === 'kinds') q.s = [];
    list.push(q);
  }
  return list;
}
/** Можно ли выполнить задание на локации loc: «поймать такую-то рыбу» и «поймать там-то» привязаны к месту. */
export function questHere(q, loc = DEFAULT_LOC) {
  if (q.k === 'sp') return !!FISH_BY_ID[q.a] && Object.keys(zonesOf(FISH_BY_ID[q.a], loc)).length > 0;
  if (q.k === 'zone') return fishOf(loc).some((f) => zonesOf(f, loc)[q.a] > 0);
  return true;
}
/** Текст задания. here — локация, где его читают: задание, которое выполняется не здесь, подписано своей локацией. */
export function questText(q, here) {
  const n = q.n;
  const away = here && !q.done && !questHere(q, here) ? ` (${locOf(q.loc || DEFAULT_LOC).name})` : '';
  switch (q.k) {
    case 'fish': return `Поймать ${n} ${fishWord(n)}`;
    case 'kinds': return `Поймать рыбу ${n} разных видов`;
    case 'sp': return `Поймать: ${(FISH_BY_ID[q.a] || { name: '?' }).name.toLowerCase()} — ${n} шт.${away}`;
    case 'zone': return `Поймать ${n} ${fishWord(n)} ${Q_ZONE[q.a] || ''}${away}`;
    case 'sell': return `Продать улов на ${n} монет`;
    case 'free': return `Отпустить ${n} ${fishWord(n)}`;
    case 'kg': return `Наловить ${num(n)} кг рыбы`;
    case 'big': return `Поймать рыбу тяжелее ${num(n)} кг`;
    case 'rare': return q.a >= 2 ? 'Поймать редкую рыбу (или ещё реже)' : 'Поймать необычную рыбу (или реже)';
    case 'trophy': return n > 1 ? `Поймать ${n} трофейные рыбы` : 'Поймать трофейную рыбу';
    case 'boat': return `Поймать ${n} ${fishWord(n)} с лодки`;
    case 'wx': return `Поймать ${n} ${fishWord(n)} в непогоду: пасмурно, дождь или туман`;
    case 'tour': return 'Сыграть в турнир';
    default: return '';
  }
}
/** Сколько сделано — строкой: «3 / 5», «1,2 / 3 кг», «40 / 60». */
export function questCount(q) {
  if (q.done) return 'готово';
  if (q.k === 'kg') return `${num(q.c)} / ${num(q.n)} кг`;
  if (q.k === 'big') return q.c ? `пока ${num(q.c)} кг` : '';
  if (q.n === 1) return '';
  return `${Math.floor(q.c)} / ${q.n}`;
}
export function questReward(q, lvl = 1) {
  const r = Q_REWARD[q.tier] || Q_REWARD[0];
  return { coins: Math.round((r.coins * lvlK(lvl, 0.15, 6)) / 5) * 5, xp: Math.round(r.xp * lvlK(lvl, 0.1, 4)) };
}
function validQuests(qs) {
  return !!qs && typeof qs === 'object' && Number.isFinite(qs.day) && Array.isArray(qs.list) && qs.list.length === 3 &&
    qs.list.every((q) => q && typeof q.k === 'string' && Number.isFinite(q.n) && Number.isFinite(q.c) && (q.k !== 'kinds' || Array.isArray(q.s)));
}
/**
 * Задания на сегодня: если день сменился (или заданий ещё нет) — выдаём новые, под локацию loc. Возвращает true,
 * если выдали. В тот же день на другой локации задания остаются, но те, что здесь не выполнить («поймать кефаль»
 * на озере) и к которым ещё не приступали, подменяются здешними того же вида и трудности.
 */
export function syncQuests(p, day, loc = DEFAULT_LOC) {
  if (validQuests(p.quests) && p.quests.day === day) {
    let here = null;
    p.quests.list.forEach((q, i) => {
      if (q.done || q.c || questHere(q, loc)) return;
      here = here || makeQuests(day, levelInfo(p.xp).lvl, loc);
      if (here[i] && here[i].k === q.k) Object.assign(q, { a: here[i].a, n: here[i].n, loc });
    });
    return false;
  }
  p.quests = { day, list: makeQuests(day, levelInfo(p.xp).lvl, loc), bonus: false };
  return true;
}
/**
 * Событие игры → продвижение заданий. ev: { t: 'catch', c, zone, boat, released, wx } | { t: 'sell', total } | { t: 'tour' }.
 * Награды начисляются сразу. Возвращает { done: [задания, закрытые этим событием], coins, xp, bonus, levelUp }.
 */
export function questEvent(p, ev) {
  const out = { done: [], coins: 0, xp: 0, bonus: 0, levelUp: 0 };
  const qs = p.quests;
  if (!validQuests(qs)) return out;
  const c = ev.c;
  const f = c && !c.junk ? FISH_BY_ID[c.sp] : null;
  const before = levelInfo(p.xp).lvl;
  for (const q of qs.list) {
    if (q.done) continue;
    if (ev.t === 'catch' && f) {
      if (q.k === 'fish') q.c++;
      else if (q.k === 'kinds') {
        if (!q.s.includes(c.sp)) q.s.push(c.sp);
        q.c = q.s.length;
      } else if (q.k === 'sp') q.c += c.sp === q.a ? 1 : 0;
      else if (q.k === 'zone') q.c += ev.zone === q.a ? 1 : 0;
      else if (q.k === 'free') q.c += ev.released ? 1 : 0;
      else if (q.k === 'kg') q.c = Math.round((q.c + c.w) * 1000) / 1000;
      else if (q.k === 'big') q.c = Math.max(q.c, c.w);
      else if (q.k === 'rare') q.c += f.rar >= q.a ? 1 : 0;
      else if (q.k === 'trophy') q.c += c.trophy ? 1 : 0;
      else if (q.k === 'boat') q.c += ev.boat ? 1 : 0;
      else if (q.k === 'wx') q.c += ev.wx && ev.wx !== 'clear' ? 1 : 0;
    } else if (ev.t === 'sell' && q.k === 'sell') q.c += Math.max(0, Math.round(ev.total) || 0);
    else if (ev.t === 'tour' && q.k === 'tour') q.c++;
    if (q.c >= q.n) {
      q.done = true;
      const r = questReward(q, levelInfo(p.xp).lvl);
      p.coins += r.coins;
      p.xp += r.xp;
      p.stats.quests = (p.stats.quests || 0) + 1;
      out.coins += r.coins;
      out.xp += r.xp;
      out.done.push(q);
    }
  }
  if (out.done.length && !qs.bonus && qs.list.every((q) => q.done)) {
    qs.bonus = true;
    out.bonus = Math.round((QUEST_BONUS * lvlK(levelInfo(p.xp).lvl, 0.15, 6)) / 5) * 5;
    p.coins += out.bonus;
  }
  const after = levelInfo(p.xp).lvl;
  if (after > before) out.levelUp = after;
  return out;
}

// ───── турнир ─────
// В комнате турнир запускает хозяин, очки считает сервер по событиям улова. В одиночку — заплыв на время за медаль.
export const TOURS = {
  big: { name: 'Самая тяжёлая рыба', hint: 'Побеждает тот, кто вытащит самую тяжёлую рыбу' },
  sum: { name: 'Общий вес улова', hint: 'В зачёт идёт вес всей пойманной рыбы' },
  count: { name: 'Больше всех рыб', hint: 'В зачёт идёт число пойманных рыб' }
};
export const TOUR_LENS = [180, 300, 600]; // сколько длится, сек
export const TOUR_COUNTDOWN = 5; // от объявления до старта, сек
export const tourBlank = () => ({ n: 0, sum: 0, best: 0, sp: '', at: 0 });
/** Улов в зачёт: хлам не считается, вес — не больше, чем бывает у вида. at — когда поймано (при равенстве выше тот, кто раньше). */
export function tourAdd(s, c, at = 0, loc = null) {
  const f = c && !c.junk ? FISH_BY_ID[c.sp] : null;
  const w = f ? Math.round(clamp(Number(c.w) || 0, 0, f.w[1] * 1.02) * 1000) / 1000 : 0;
  if (!f || w <= 0) return false;
  if (loc && !Object.keys(zonesOf(f, loc)).length) return false; // такой рыбы на локации комнаты нет
  s.n++;
  s.sum = Math.round((s.sum + w) * 1000) / 1000;
  if (w > s.best) {
    s.best = w;
    s.sp = c.sp;
  }
  s.at = at;
  return true;
}
export const tourScore = (kind, s) => (kind === 'count' ? s.n : kind === 'sum' ? s.sum : s.best);
export const tourScoreText = (kind, s) => (kind === 'count' ? `${s.n} ${plural(s.n, 'рыба', 'рыбы', 'рыб')}` : `${num(Math.round(tourScore(kind, s) * 100) / 100)} кг`);
/** Таблица: rows — [{ id, name, slot, s }] → по убыванию очков; без улова — в конце, без места. */
export function tourTable(kind, rows) {
  const list = rows.map((r) => ({ id: r.id, name: r.name, slot: r.slot, s: r.s, score: tourScore(kind, r.s) }));
  list.sort((a, b) => b.score - a.score || a.s.at - b.s.at || a.id - b.id);
  let place = 0;
  for (const r of list) r.place = r.score > 0 ? ++place : 0;
  return list;
}
/** Приз за место в комнате: призовой фонд растёт с числом рыбаков и длиной турнира. Без улова приза нет. */
export function tourPrize(place, players, len) {
  if (!place || players < 2) return 0;
  const pool = 20 * players + 10 * (len / 60);
  const share = players === 2 ? [0.65, 0.25] : [0.5, 0.3, 0.2];
  const k = share[place - 1];
  return k ? Math.max(10, Math.round((pool * k) / 5) * 5) : 10; // остальным, кто что-то поймал, — утешительные 10 монет
}
/** Заплыв в одиночку: пороги медалей зависят от снасти (lineKg — какую рыбу она держит) и длины заплыва. */
export function tourTargets(kind, len, kit) {
  const m = len / 60;
  const line = kit ? kit.lineKg : 3;
  if (kind === 'count') return [Math.max(1, Math.round(m * 0.5)), Math.max(2, Math.round(m * 0.9)), Math.max(3, Math.round(m * 1.3))];
  const r1 = (v) => Math.max(0.1, Math.round(v * 10) / 10);
  if (kind === 'sum') return [r1(m * line * 0.035), r1(m * line * 0.07), r1(m * line * 0.12)];
  const t = 0.8 + 0.04 * m;
  return [r1(line * 0.12 * t), r1(line * 0.22 * t), r1(line * 0.38 * t)];
}
export const MEDALS = ['', 'бронза', 'серебро', 'золото'];
export function tourMedal(kind, len, kit, s) {
  const sc = tourScore(kind, s);
  const t = tourTargets(kind, len, kit);
  return sc >= t[2] ? 3 : sc >= t[1] ? 2 : sc >= t[0] ? 1 : 0;
}
export const medalPrize = (medal, len) => Math.round(([0, 15, 35, 70][medal] * Math.max(0.6, len / 300)) / 5) * 5;

// ───── бот для проверки баланса (и для тестов) ─────
export function botFight(c, kit, rng, skill = 0.85, maxT = 240) {
  const s = fightInit(c, kit, rng);
  let steer = 0;
  let react = 0;
  let reel = true;
  let think = 0;
  const lag = 0.08 + (1 - skill) * 0.55; // как быстро человек замечает перемену
  const dt = 1 / 30;
  const seen = {}; // что случилось за бой: сколько рывков, свечей, «вторых дыханий»…
  for (let i = 0; i < 30 * maxT && !s.result; i++) {
    const run = s.phase === 'run';
    think -= dt;
    if (think <= 0) {
      think = lag * (0.6 + rng() * 0.8);
      // человек читает подсказки: в прыжке ослабляет леску, залёгшую рыбу отрывает натяжением
      const base = s.jumpT > 0 ? 0.45 : s.stuck ? 0.72 : run ? 0.5 : s.warned ? 0.4 : 0.66;
      const limit = base + (rng() - 0.5) * (1 - skill) * 0.3;
      reel = s.T < limit || s.T < 0.3;
    }
    if (run && s.dir) {
      react += dt;
      steer = react > 0.25 + (1 - skill) * 0.9 ? -s.dir : 0;
    } else {
      react = 0;
      steer = 0;
    }
    for (const e of fightStep(s, { reel, steer }, dt, kit, rng)) seen[e] = (seen[e] || 0) + 1;
  }
  return { result: s.result || 'timeout', t: s.t, rho: s.rho, seen };
}
