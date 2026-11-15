// Общий бой с чудищем или китом в комнате. Сервер ведёт одну на всех шкалу сил, решает, на кого существо бросается,
// и засчитывает победу, когда двое ударили багром почти одновременно. Клиент только сообщает, что делает его рыбак.
//
// Фазы: call — приманка в логове, вода бурлит; bite — существо взяло, ждём второго; fight — вываживание;
// gaff — у борта, пора за багор; won — взяли (трофей участникам); gone — ушло. После won и gone через несколько
// секунд запись о бое пропадает.
import { BEASTS, BEAST_K as K } from '../shared/beasts.js';

const X = 0;
const Z = 2;

/** Что видят клиенты. */
export function pubBeast(b) {
  if (!b) return null;
  return {
    id: b.id, kind: b.kind, x: b.x, z: b.z, by: b.by, phase: b.phase, P: Math.round(b.P * 1000) / 1000,
    hooked: Object.keys(b.hooked).map(Number), until: b.until, lunge: b.lunge ? { to: b.lunge.to, until: b.lunge.until } : null,
    gaffs: Object.keys(b.gaffs).map(Number), win: b.win || null, why: b.why || null, t0: b.t0
  };
}

/** Игроки в мире рядом с точкой (x, z). */
function near(room, x, z, r) {
  const out = [];
  for (const p of room.players.values()) {
    if (!p.ws || p.mode !== 'world' || !p.st) continue;
    if (Math.hypot(p.st[X] - x, p.st[Z] - z) <= r) out.push(p);
  }
  return out;
}

/**
 * Сообщение игрока о бое. Возвращает текст ошибки (сказать только ему) или null.
 * a: 'call' — бросил особую приманку в логово (kind, x, z); 'hook' — подсёк рядом с существом; 'pull' — вытянул
 * долю шкалы g за последние доли секунды; 'snap' — у него лопнула леска; 'gaff' — ударил багром.
 */
export function beastMsg(room, p, msg, now) {
  const b = room.beast;
  const t = now / 1000;
  if (msg.a === 'call') {
    const def = BEASTS[msg.kind];
    if (!def || def.loc !== room.loc) return 'Здесь такое не водится';
    if (b && b.phase !== 'won' && b.phase !== 'gone') return `${BEASTS[b.kind].name} уже здесь`;
    const x = Number(msg.x);
    const z = Number(msg.z);
    if (!Number.isFinite(x) || !Number.isFinite(z)) return 'Нет места';
    const mates = near(room, p.st ? p.st[X] : x, p.st ? p.st[Z] : z, K.near).filter((o) => o.id !== p.id);
    if (!mates.length) return 'Одному не удержать — нужен второй рыбак рядом';
    room.beastN = (room.beastN || 0) + 1;
    room.beast = {
      id: room.beastN, kind: def.id, x, z, by: p.id, phase: 'call', t0: t, until: t + K.callT, P: 0,
      hooked: {}, lunge: null, nextLunge: 0, gaffs: {}, lastPull: t, win: null, why: null
    };
    return null;
  }
  if (!b || b.phase === 'won' || b.phase === 'gone') return null;
  if (msg.a === 'hook') {
    if (b.phase !== 'bite' && b.phase !== 'fight' && b.phase !== 'gaff') return null;
    if (b.hooked[p.id]) return null;
    const x = Number(msg.x);
    const z = Number(msg.z);
    if (!(Math.hypot(x - b.x, z - b.z) <= K.hookR)) return 'Далеко: забросьте ближе к существу';
    // сорвавшийся цепляется снова только в своё окно
    const lost = b.lost && b.lost[p.id];
    if (lost && t - lost > K.regain) return 'Поздно: существо ушло от вашей лески';
    b.hooked[p.id] = { since: t };
    if (b.lost) delete b.lost[p.id];
    if (b.phase === 'bite' && Object.keys(b.hooked).length >= 2) start(b, t);
    return null;
  }
  if (!b.hooked[p.id]) {
    if (msg.a === 'gaff' && b.phase === 'gaff') return gaff(room, b, p, t);
    return null;
  }
  if (msg.a === 'pull') {
    const g = Math.max(0, Math.min(0.05, Number(msg.g) || 0));
    if (b.phase === 'fight' && g > 0) {
      // во время рывка на этого рыбака его подмотка не в счёт: он должен отпускать, тянут остальные (и вдвое сильнее)
      const lungeOnMe = b.lunge && b.lunge.to === p.id;
      if (!lungeOnMe) b.P = Math.min(1, b.P + g * K.share * (b.lunge ? 2 : 1) * (BEASTS[b.kind].hp > 100 ? 100 / BEASTS[b.kind].hp : 1));
      b.lastPull = t;
      if (b.P >= K.gaffAt) {
        b.phase = 'gaff';
        b.until = t + K.gaffWait;
        b.lunge = null;
        b.gaffs = {};
      }
    }
    return null;
  }
  if (msg.a === 'snap') {
    delete b.hooked[p.id];
    b.lost = b.lost || {};
    b.lost[p.id] = t;
    if (b.lunge && b.lunge.to === p.id) b.lunge = null;
    if (!Object.keys(b.hooked).length) end(b, t, 'gone', 'Все лески лопнули — существо ушло');
    return null;
  }
  if (msg.a === 'gaff' && b.phase === 'gaff') return gaff(room, b, p, t);
  return null;
}

function gaff(room, b, p, t) {
  b.gaffs[p.id] = t;
  const fresh = Object.entries(b.gaffs).filter(([, at]) => t - at <= K.gaffWin);
  if (fresh.length >= 2) {
    const who = new Set([...Object.keys(b.hooked).map(Number), ...fresh.map(([id]) => Number(id))]);
    b.win = [...who].filter((id) => room.players.has(id));
    end(b, t, 'won', null);
  }
  return null;
}

function start(b, t) {
  b.phase = 'fight';
  b.until = t + K.outT;
  b.nextLunge = t + K.lungeGap[0];
  b.lastPull = t;
}
function end(b, t, phase, why) {
  b.phase = phase;
  b.why = why;
  b.until = t + 8; // столько секунд запись ещё висит: клиенты успевают показать уход
  b.lunge = null;
}

/** Ход времени. Возвращает true, если клиентам надо разослать новое состояние. */
export function beastTick(room, now, rng = Math.random) {
  const b = room.beast;
  if (!b) return false;
  const t = now / 1000;
  const last = b.lastTick;
  b.lastTick = t;
  // ушедшие из комнаты больше не держат лесок
  for (const id of Object.keys(b.hooked)) {
    const p = room.players.get(Number(id));
    if (!p || !p.ws || p.mode !== 'world') delete b.hooked[id];
  }
  if (b.phase === 'won' || b.phase === 'gone') {
    if (t >= b.until) {
      room.beast = null;
      return true;
    }
    return false;
  }
  if (b.phase === 'call') {
    if (t >= b.until) {
      // берёт приманку бросившего
      b.phase = 'bite';
      b.until = t + K.biteWindow;
      if (room.players.has(b.by)) b.hooked[b.by] = { since: t };
      return true;
    }
    return false;
  }
  if (b.phase === 'bite') {
    if (!Object.keys(b.hooked).length) return end(b, t, 'gone', 'Приманку сорвали — существо ушло'), true;
    if (t >= b.until) return end(b, t, 'gone', 'Одна леска его не держит — нужен второй, кто подсечёт рядом'), true;
    return false;
  }
  if (b.phase === 'fight' || b.phase === 'gaff') {
    const ids = Object.keys(b.hooked).map(Number);
    if (!ids.length) return end(b, t, 'gone', 'Никто не держит — существо ушло'), true;
    if (t >= b.until && b.phase === 'fight') return end(b, t, 'gone', 'Существо устало ждать и ушло в глубину'), true;
    let changed = false;
    if (b.phase === 'gaff' && t >= b.until) {
      // не взяли багром — собралось с силами
      b.phase = 'fight';
      b.P = Math.max(0, b.P - K.gaffBack);
      b.until = t + K.outT;
      b.nextLunge = t + 1.5;
      b.gaffs = {};
      changed = true;
    }
    if (b.phase === 'fight') {
      // никто не тянет — существо отыгрывает шкалу
      if (t - b.lastPull > 1) b.P = Math.max(0, b.P - K.decay * Math.max(0, Math.min(0.5, t - (last || t))));
      if (b.lunge && t >= b.lunge.until) {
        b.lunge = null;
        changed = true;
      }
      if (!b.lunge && t >= b.nextLunge) {
        const to = ids[Math.floor(rng() * ids.length)];
        b.lunge = { to, until: t + K.lungeT };
        b.nextLunge = t + K.lungeT + K.lungeGap[0] + rng() * (K.lungeGap[1] - K.lungeGap[0]);
        changed = true;
      }
    }
    return changed;
  }
  return false;
}
