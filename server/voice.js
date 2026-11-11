/* Голосовой чат на рыбалке — та же схема, что в «Диком Западе».
   Звук идёт напрямую между браузерами (WebRTC, каждый с каждым), сервер только передаёт приглашения.
   Если напрямую связаться не вышло (строгий роутер, мобильный интернет), включается ретранслятор: браузер режет
   голос на кусочки по 40 мс (16 кГц, μ-закон, ~640 байт) и шлёт их сюда двоичными сообщениями, а сервер раздаёт
   их собеседникам. Свой TURN можно подключить переменными окружения:
   TURN_URLS (через запятую) и TURN_USERNAME + TURN_CREDENTIAL или TURN_SECRET (общий секрет coturn). */
import crypto from 'node:crypto';

export const VOICE_MAX = 8;
const FRAME_MAX = 2048;
const TURN_URLS = String(process.env.TURN_URLS || '').split(',').map((s) => s.trim()).filter(Boolean);

export function iceServers() {
  const list = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];
  if (!TURN_URLS.length) return list;
  if (process.env.TURN_SECRET) {
    const username = `${Math.floor(Date.now() / 1000) + 12 * 3600}:rybak`;
    list.push({ urls: TURN_URLS, username, credential: crypto.createHmac('sha1', process.env.TURN_SECRET).update(username).digest('base64') });
  } else list.push({ urls: TURN_URLS, username: process.env.TURN_USERNAME || '', credential: process.env.TURN_CREDENTIAL || '' });
  return list;
}

// ведро с жетонами: не больше rate событий в секунду, запас до cap
export function bucket(rate, cap) {
  let tokens = cap;
  let last = Date.now();
  return () => {
    const t = Date.now();
    tokens = Math.min(cap, tokens + ((t - last) / 1000) * rate);
    last = t;
    if (tokens < 1) return false;
    tokens -= 1;
    return true;
  };
}

export class Voice {
  /** sendJson(ws, msg); sockets — Map(ws → { roomCode, playerId }) сервера игры */
  constructor({ sendJson, sockets }) {
    this.sendJson = sendJson;
    this.sockets = sockets;
    this.rooms = new Map(); // код комнаты → Map(ws → участник)
    this.byWs = new Map();
    this.nextVid = 1;
  }

  roster(code) {
    const vm = this.rooms.get(code);
    return vm ? [...vm.values()].map((m) => ({ vid: m.vid, pid: m.pid, muted: m.muted })) : [];
  }

  // состав чата видят все в комнате — и те, кто ещё не включил голос
  broadcastRoster(code) {
    const list = this.roster(code);
    for (const [ws, info] of this.sockets) if (info.roomCode === code && info.playerId) this.sendJson(ws, { t: 'vroster', list });
  }

  join(ws, code, pid, muted) {
    if (this.byWs.has(ws)) this.leave(ws, false);
    let vm = this.rooms.get(code);
    if (!vm) this.rooms.set(code, (vm = new Map()));
    if (vm.size >= VOICE_MAX) return { error: `В голосовом чате уже ${VOICE_MAX} человек` };
    for (const [ows, m] of vm) if (m.pid === pid) this.leave(ows); // тот же игрок с другой вкладки
    const m = { vid: this.nextVid++, pid, code, muted: !!muted, ws, frames: bucket(60, 120), signals: bucket(40, 400) };
    if (this.nextVid > 65000) this.nextVid = 1;
    const peers = [...vm.values()].map((p) => p.vid);
    vm.set(ws, m);
    this.byWs.set(ws, m);
    this.sendJson(ws, { t: 'vjoined', me: m.vid, peers, ice: iceServers() });
    this.broadcastRoster(code);
    return { ok: true };
  }

  leave(ws, announce = true) {
    const m = this.byWs.get(ws);
    if (!m) return;
    this.byWs.delete(ws);
    const vm = this.rooms.get(m.code);
    if (vm) {
      vm.delete(ws);
      for (const other of vm.keys()) this.sendJson(other, { t: 'vleft', vid: m.vid });
      if (!vm.size) this.rooms.delete(m.code);
    }
    if (announce) this.broadcastRoster(m.code);
  }

  dropRoom(code) {
    const vm = this.rooms.get(code);
    if (!vm) return;
    for (const ws of [...vm.keys()]) this.byWs.delete(ws);
    this.rooms.delete(code);
  }

  peer(m, vid) {
    const vm = this.rooms.get(m.code);
    if (!vm) return null;
    for (const p of vm.values()) if (p.vid === vid) return p;
    return null;
  }

  signal(ws, to, data) {
    const m = this.byWs.get(ws);
    if (!m || !data || typeof data !== 'object' || !m.signals()) return;
    const p = this.peer(m, Number(to));
    if (!p || p === m) return;
    this.sendJson(p.ws, { t: 'vsignal', from: m.vid, data });
  }

  mute(ws, muted) {
    const m = this.byWs.get(ws);
    if (!m) return;
    m.muted = !!muted;
    this.broadcastRoster(m.code);
  }

  /* ретранслятор. От браузера: [1][n][n × u16 кому][кусочек голоса]; к браузеру: [1][u16 от кого][кусочек] */
  frame(ws, buf) {
    const m = this.byWs.get(ws);
    if (!m || m.muted || !Buffer.isBuffer(buf) || buf.length < 4 || buf[0] !== 1) return;
    const n = buf[1];
    const head = 2 + n * 2;
    const len = buf.length - head;
    if (n < 1 || n > VOICE_MAX || len <= 0 || len > FRAME_MAX || !m.frames()) return;
    const out = Buffer.allocUnsafe(3 + len);
    out[0] = 1;
    out.writeUInt16BE(m.vid, 1);
    buf.copy(out, 3, head);
    for (let i = 0; i < n; i++) {
      const p = this.peer(m, buf.readUInt16BE(2 + i * 2));
      // голос не важнее игры: если у получателя забит канал, кусочек просто пропускаем
      if (p && p !== m && p.ws.readyState === 1 && p.ws.bufferedAmount < 64 * 1024) p.ws.send(out, { binary: true });
    }
  }
}
