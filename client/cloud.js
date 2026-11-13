// Сохранение на сервере: прогресс лежит не только в браузере, но и в базе игры — его не унесёт чистка
// браузера, и его можно открыть на другом устройстве по коду сохранения (см. shared/cloud.js).
//
// Главным остаётся сохранение в браузере: игра работает и без сервера. Сюда оно уходит через несколько секунд
// после каждого изменения и при сворачивании страницы. У сохранения на сервере есть номер версии: запись
// проходит, только если устройство шло от последней. Опередило другое устройство — берём его сохранение
// (если своё не менялось) либо спрашиваем игрока, какое оставить (если менялись оба): молча ничего не теряется.
import { cleanCode, makeCode, saveSummary, hasProgress, markOf } from '../shared/cloud.js';

const KEY = 'rybak.cloud.v1';
const PUSH_AFTER = 12000; // после изменения ждём столько: несколько изменений подряд уходят одной записью
const AGAIN = [6000, 20000, 60000, 180000]; // сервер не ответил — через сколько пробовать снова

function read() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    return d && typeof d === 'object' ? d : {};
  } catch {
    return {};
  }
}
function randomBytes(n) {
  const b = new Uint8Array(n);
  (globalThis.crypto || window.msCrypto).getRandomValues(b);
  return b;
}

export class Cloud {
  /**
   * profile() — нынешний профиль игрока (объект, как он лежит в браузере);
   * apply(save, sum, asked) — принять сохранение с сервера (заменить профиль на месте): вернуть false, если сейчас нельзя (рыба на крючке);
   * changed() — состояние сменилось (перерисовать настройки); notify(kind) — сказать игроку: 'clash' | 'taken'.
   */
  constructor({ profile, apply, changed = () => {}, notify = () => {}, enabled = true }) {
    this.profile = profile;
    this.apply = apply;
    this.changed = changed;
    this.notify = notify;
    this.enabled = enabled; // в пробной версии одним файлом сервера нет вовсе
    const d = read();
    // code — код сохранения; rev — версия на сервере, от которой идёт это устройство; mark — отметка прогресса на ту минуту
    // (shared/cloud.js); dirty — есть что отправить; force — игрок сам заменил прогресс; sent — метка записи, ответа на которую не дождались
    this.s = {
      code: cleanCode(d.code), rev: Math.max(0, Math.round(Number(d.rev) || 0)), pub: String(d.pub || '').slice(0, 12), at: Number(d.at) || 0,
      on: d.on !== false, listed: d.listed !== false, dirty: !!d.dirty, force: !!d.force, mark: String(d.mark || ''), sent: String(d.sent || '')
    };
    this.held = false; // прогресс заменён и страница вот-вот откроется заново: с этой минуты ничего не шлём
    this.db = null; // хранит ли сервер сохранения: null — ещё не знаем
    this.busy = false;
    this.err = ''; // почему не удалась последняя попытка: '' | 'net' | 'busy'
    this.clash = null; // { rev, at, sum } — на сервере сохранение, которое разошлось с нашим
    this.incoming = null; // сохранение с сервера, которое ждёт удобного момента
    this.seq = 0;
    this.fails = 0;
    this.timer = null;
    if (!enabled) return;
    if (!this.s.code) {
      this.s.code = makeCode(randomBytes);
      this.s.rev = 0;
      this.write();
    }
    addEventListener('pagehide', () => this.flush());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.hiddenAt = Date.now();
        this.flush();
      } else if (this.db && this.s.on && this.s.rev > 0 && Date.now() - (this.hiddenAt || 0) > 60000) this.check(); // вернулись ко вкладке: вдруг играли на другом устройстве
    });
    setInterval(() => this.settle(), 3000);
  }
  write() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.s));
    } catch {
      /* личный режим или переполнение — живём без записи */
    }
  }
  get code() {
    return this.s.code;
  }
  /** Играл ли человек на этом устройстве с прошлой сверки с сервером (а не просто открыл игру). */
  moved() {
    return markOf(this.profile()) !== this.s.mark;
  }
  /** Прогресс заменён, страница сейчас откроется заново: старый профиль из памяти на сервер уйти не должен. */
  hold() {
    this.held = true;
    clearTimeout(this.timer);
    clearTimeout(this.retry);
    this.timer = null;
  }
  /** Одним словом — что сейчас с сохранением на сервере (для подписи в настройках). */
  get state() {
    if (!this.enabled) return 'none';
    if (!this.s.on) return 'off';
    if (this.clash) return 'clash';
    if (this.db === false) return 'nodb';
    if (this.db === null) return 'wake';
    if (this.err) return this.err === 'busy' ? 'busy' : 'net';
    if (this.s.rev > 0) return this.s.dirty ? 'pending' : 'ok';
    return 'empty';
  }

  async call(path, body, keepalive = false) {
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = ctl && setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), keepalive, signal: ctl ? ctl.signal : undefined, cache: 'no-store' } : { cache: 'no-store', signal: ctl ? ctl.signal : undefined });
      let d = null;
      try {
        d = await r.json();
      } catch {
        d = null;
      }
      return { http: r.status, ...(d && typeof d === 'object' ? d : { ok: false }) };
    } catch {
      return { http: 0, ok: false };
    } finally {
      clearTimeout(t);
    }
  }
  later(fn) {
    clearTimeout(this.retry);
    this.retry = setTimeout(fn, AGAIN[Math.min(this.fails, AGAIN.length - 1)]);
    this.fails++;
  }
  fine() {
    this.fails = 0;
    this.err = '';
  }

  /** Сервер ответил — узнаём, хранит ли он сохранения, и сверяемся. Вызывать, когда сервер проснулся. */
  async start() {
    if (!this.enabled || !this.s.on || this.starting) return;
    this.starting = true;
    const st = await this.call('/api/status');
    this.starting = false;
    if (!st.ok) {
      this.err = 'net';
      this.changed();
      return this.later(() => this.start());
    }
    this.fine();
    this.db = !!st.db;
    this.changed();
    if (!this.db) return;
    if (this.s.rev > 0) return this.check();
    if (this.s.dirty || hasProgress(saveSummary(this.profile()))) this.push();
  }
  /** Что на сервере: то же, что у нас, новее или уже ничего. */
  async check() {
    if (!this.db || !this.s.on || this.busy || this.clash) return;
    this.busy = true;
    const r = await this.call('/api/load', { code: this.s.code });
    this.busy = false;
    if (r.http === 404 && r.why === 'NO_SAVE') {
      // на сервере пусто (сохранение стёрли с другого устройства) — заводим заново из того, что есть здесь
      this.fine();
      this.s.rev = 0;
      this.s.dirty = true;
      this.write();
      return this.push();
    }
    if (!r.ok) {
      this.err = r.http === 429 ? 'busy' : 'net';
      this.changed();
      return this.later(() => this.check());
    }
    this.fine();
    if (r.pub) this.s.pub = r.pub;
    if (r.rev !== this.s.rev && this.s.sent && r.tag === this.s.sent) {
      // на сервере наша же запись: она дошла, а ответ — нет (страницу закрыли раньше)
      this.s.rev = r.rev;
      this.s.mark = markOf(r.save);
    }
    this.s.sent = '';
    if (r.rev === this.s.rev) {
      this.s.at = r.at || this.s.at;
      this.write();
      this.changed();
      if (this.s.dirty) this.push();
      return;
    }
    if (r.rev < this.s.rev && !(r.at > this.s.at)) {
      // версия на сервере меньше нашей, и записана она раньше нашей последней сверки: базу восстанавливали
      // из запаса. Наше новее — шлём его
      this.s.rev = r.rev;
      this.s.dirty = true;
      this.write();
      return this.push();
    }
    // на сервере сохранение новее нашего: играли на другом устройстве (версия больше) либо сохранение там стёрли
    // и завели заново (версия меньше, но записано позже нашей сверки)
    this.incoming = { rev: r.rev, at: r.at, sum: r.sum, save: r.save };
    this.settle();
  }
  /** Принять сохранение с сервера, когда можно; на этом устройстве тоже успели поиграть — уже не принять, а спросить игрока. */
  settle() {
    const r = this.incoming;
    if (!r || this.held) return;
    if (!r.chosen && this.moved()) {
      this.incoming = null;
      this.setClash({ rev: r.rev, at: r.at, sum: r.sum });
      return;
    }
    if (this.apply(r.save, r.sum, !!r.chosen) === false) return; // сейчас нельзя — попробуем через три секунды
    this.incoming = null;
    this.s.rev = r.rev;
    this.s.at = r.at;
    this.s.mark = markOf(this.profile()); // отметка — по тому, что получилось на устройстве после починки сохранения
    this.s.dirty = false;
    this.s.force = false;
    this.s.sent = '';
    this.write();
    this.changed();
  }
  setClash(c) {
    const was = this.clash;
    this.clash = c;
    this.changed();
    if (!was) this.notify('clash');
  }

  /** Профиль изменился (вызывается при каждом сохранении в браузере). force — игрок сам заменил прогресс: начал заново или загрузил файл. */
  touch({ force = false } = {}) {
    if (!this.enabled || this.held) return;
    this.seq++;
    const was = this.s.dirty;
    this.s.dirty = true;
    if (force) this.s.force = true;
    if (!was || force) this.write();
    if (!this.timer && this.db && this.s.on) {
      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.s.dirty) this.push();
      }, PUSH_AFTER);
    }
  }
  /** Страницу сворачивают или закрывают — шлём сразу, не дожидаясь паузы. */
  flush() {
    if (!this.s.dirty || this.held) return;
    clearTimeout(this.timer);
    this.timer = null;
    this.push({ keepalive: true });
  }
  /** Отправить сохранение на сервер. → true, если записалось. */
  async push({ keepalive = false, force = false } = {}) {
    if (!this.enabled || this.held || !this.db || !this.s.on || this.busy || this.clash || this.incoming) return false;
    const p = this.profile();
    const sum = saveSummary(p);
    if (!this.s.rev && !hasProgress(sum)) return false; // новичку хранить ещё нечего
    const seq = this.seq;
    const mark = markOf(p);
    const tag = Math.random().toString(36).slice(2, 12);
    // отложенная отправка больше не нужна: уходит то же самое (иначе, например, после открытия таблицы рекордов сохранение ушло бы дважды)
    clearTimeout(this.timer);
    this.timer = null;
    this.busy = true;
    this.s.sent = tag;
    this.write();
    const r = await this.call('/api/save', { code: this.s.code, base: this.s.rev, at: Date.now(), listed: this.s.listed, force: force || this.s.force || undefined, tag, save: p }, keepalive);
    this.busy = false;
    if (r.ok) {
      this.fine();
      if (r.rev) {
        this.s.rev = r.rev;
        this.s.at = r.at || Date.now();
        this.s.mark = mark;
      }
      if (r.pub) this.s.pub = r.pub;
      this.s.force = false;
      this.s.sent = '';
      this.s.dirty = this.seq !== seq;
      this.write();
      this.changed();
      if (this.s.dirty) this.touch();
      return true;
    }
    if (r.http) this.s.sent = ''; // сервер ответил отказом — записи не было
    if (r.http === 409 && r.why === 'CONFLICT') {
      this.fine();
      // на сервере другое сохранение. Здесь не играли (изменилось только то, что игра делает сама при входе) — берём серверное молча
      if (r.now && r.now.rev !== this.s.rev && !this.moved() && !force && !this.s.force) {
        this.write();
        this.check();
      } else if (r.now) this.setClash(r.now);
      else {
        // запись на сервере пропала, пока мы играли, — заводим заново
        this.s.rev = 0;
        this.write();
        this.later(() => this.push());
      }
      return false;
    }
    if (r.http === 503 && r.why === 'NO_DB') {
      this.db = false;
      this.changed();
      this.later(() => ((this.db = null), this.start()));
      return false;
    }
    this.err = r.http === 429 ? 'busy' : 'net';
    this.changed();
    this.later(() => this.push());
    return false;
  }

  // ───── сохранения разошлись: игрок выбирает ─────
  /** Оставить то, что на сервере: сохранение с этого устройства заменяется. */
  async keepServer() {
    if (!this.clash || this.busy) return false;
    this.busy = true;
    const r = await this.call('/api/load', { code: this.s.code });
    this.busy = false;
    if (!r.ok) return false;
    this.clash = null;
    this.incoming = { rev: r.rev, at: r.at, sum: r.sum, save: r.save, chosen: true };
    this.settle();
    return true;
  }
  /** Оставить то, что на этом устройстве: сохранение на сервере заменяется. */
  async keepMine() {
    const c = this.clash;
    if (!c || this.busy) return false;
    this.clash = null;
    this.s.rev = c.rev;
    this.s.dirty = true;
    this.write();
    const ok = await this.push({ force: true });
    if (!ok && !this.clash) this.clash = c; // не дошло — выбор остаётся за игроком
    this.changed();
    return ok;
  }

  // ───── другое устройство: войти по коду ─────
  /** Что лежит на сервере под этим кодом: { ok, code, rev, at, sum, save, pub, listed } или { ok: false, why }. */
  async lookup(text) {
    const code = cleanCode(text);
    if (!code) return { ok: false, why: 'BAD_CODE' };
    if (code === this.s.code) return { ok: false, why: 'SAME' };
    const r = await this.call('/api/load', { code });
    if (!r.ok) return { ok: false, why: r.why || (r.http === 429 ? 'SLOW_DOWN' : 'NET') };
    return { ok: true, code, rev: r.rev, at: r.at, sum: r.sum, save: r.save, pub: r.pub, listed: r.listed };
  }
  /** Перейти на найденное сохранение: дальше это устройство ведёт его вместе с остальными. */
  adopt(found) {
    if (this.held || this.apply(found.save, found.sum, true) === false) return false;
    clearTimeout(this.timer);
    this.timer = null;
    this.clash = null;
    this.incoming = null;
    this.s = { ...this.s, code: found.code, rev: found.rev, pub: found.pub || '', at: found.at, listed: found.listed !== false, on: true, dirty: false, force: false, mark: markOf(this.profile()), sent: '' };
    this.write();
    this.changed();
    return true;
  }

  // ───── настройки ─────
  /** Включить или выключить хранение на сервере. Выключение стирает сохранение с сервера. → true, если получилось. */
  async setOn(on) {
    if (on) {
      this.s.on = true;
      this.s.dirty = true;
      this.write();
      this.changed();
      this.db = null;
      this.start();
      return true;
    }
    if (this.s.rev > 0 || this.db) {
      const r = await this.call('/api/forget', { code: this.s.code });
      if (!r.ok && !(r.http === 503 && r.why === 'NO_DB')) return false;
    }
    clearTimeout(this.timer);
    clearTimeout(this.retry);
    this.timer = null;
    this.clash = null;
    this.incoming = null;
    this.s = { ...this.s, on: false, rev: 0, at: 0, dirty: false, force: false, mark: '', sent: '' };
    this.write();
    this.changed();
    return true;
  }
  /** Показывать ли игрока в таблице рекордов. */
  setListed(listed) {
    this.s.listed = !!listed;
    this.s.dirty = true;
    this.write();
    this.changed();
    clearTimeout(this.timer);
    this.timer = null;
    return this.push();
  }
  /** Таблица рекордов: { ok, anglers, records, total, me } или { ok: false, why }. */
  async top() {
    const r = await this.call(`/api/top${this.s.pub && this.s.on ? `?me=${this.s.pub}` : ''}`);
    return r.ok ? r : { ok: false, why: r.why || 'NET' };
  }
}
