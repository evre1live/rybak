// Связь с сервером: комната, положения друзей, события, чат. Сама переподключается и возвращает место в комнате.
import { session } from './profile.js';

export class Net {
  constructor(on) {
    this.on = on; // { joined, in, out, card, mode, sts, ev, chat, host, error, down, up, voice(msg), bin(buf) }
    this.ws = null;
    this.room = null; // { code, id, token, seed, t0, host }
    this.offset = 0; // serverNow − clientNow
    this.rtt = 0;
    this.retry = 0;
    this.want = null; // что хотим: { t:'create'|'join', code, card }
    this.closed = true;
    this.pingT = null;
  }
  now() {
    return Date.now() + this.offset;
  }
  get open() {
    return this.ws && this.ws.readyState === 1;
  }
  send(msg) {
    if (this.open) this.ws.send(JSON.stringify(msg));
  }
  sendBin(buf) {
    if (this.open && this.ws.bufferedAmount < 128 * 1024) this.ws.send(buf);
  }
  connect() {
    this.closed = false;
    const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
    let ws;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      this.on.error({ code: 'NET', message: 'Не удалось связаться с сервером' });
      return;
    }
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    ws.onopen = () => {
      this.ping();
      clearInterval(this.pingT);
      this.pingT = setInterval(() => this.ping(), 5000);
      const w = this.want;
      if (w) this.send(w.t === 'create' ? { t: 'create', card: this.getCard() } : { t: 'join', code: w.code, token: w.token, card: this.getCard() });
    };
    ws.onmessage = (e) => {
      if (typeof e.data !== 'string') return this.on.bin(e.data);
      let m;
      try {
        m = JSON.parse(e.data);
      } catch {
        return;
      }
      this.handle(m);
    };
    ws.onclose = () => {
      clearInterval(this.pingT);
      if (this.ws !== ws) return;
      this.ws = null;
      if (this.closed) return;
      // связь оборвалась — пробуем вернуться на своё место
      if (this.room) {
        this.on.down();
        this.want = { t: 'join', code: this.room.code, token: this.room.token };
      }
      if (this.want && this.retry < 40) {
        this.retry++;
        setTimeout(() => !this.closed && this.connect(), Math.min(4000, 600 + this.retry * 350));
      } else if (this.want) this.on.error({ code: 'NET', message: 'Сервер не отвечает. Проверьте интернет и попробуйте ещё раз.' });
    };
    ws.onerror = () => {};
  }
  ping() {
    this.send({ t: 'ping', c: Date.now() });
  }
  handle(m) {
    switch (m.t) {
      case 'pong': {
        const rtt = Date.now() - m.c;
        const off = m.at - (m.c + rtt / 2);
        this.offset = this.rtt ? this.offset * 0.7 + off * 0.3 : off;
        this.rtt = rtt;
        return;
      }
      case 'joined': {
        const back = !!this.room && this.room.code === m.code;
        this.room = { code: m.code, id: m.id, token: m.token, seed: m.seed, t0: m.t0, host: m.host, slot: m.slot };
        this.offset = this.rtt ? this.offset : m.now - Date.now();
        this.retry = 0;
        this.want = null;
        session.set({ code: m.code, token: m.token, at: Date.now() });
        return this.on.joined(m, back);
      }
      case 'error':
        if (m.req === 'join' || m.req === 'create') {
          this.want = null;
          this.room = null;
          session.set(null);
        }
        return this.on.error(m);
      case 'replaced':
        this.closed = true;
        this.room = null;
        return this.on.error({ code: 'REPLACED', message: 'Игра открыта в другой вкладке — эта отключена.' });
      case 'left':
        return;
      case 'vroster': case 'vjoined': case 'vsignal': case 'vleft':
        return this.on.voice(m);
      default:
        if (this.on[m.t]) this.on[m.t](m);
    }
  }
  // getCard() задаёт игра: карточка игрока всегда свежая, в том числе при возвращении после обрыва
  create() {
    this.want = { t: 'create' };
    this.retry = 0;
    if (this.open) this.send({ t: 'create', card: this.getCard() });
    else this.connect();
  }
  join(code, token) {
    this.want = { t: 'join', code, token };
    this.retry = 0;
    if (this.open) this.send({ t: 'join', code, token, card: this.getCard() });
    else this.connect();
  }
  leave() {
    this.send({ t: 'leave' });
    this.room = null;
    this.want = null;
    this.closed = true;
    session.set(null);
    if (this.ws) this.ws.close();
  }
}
