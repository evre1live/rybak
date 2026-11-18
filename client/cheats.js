// Коды. Окно ввода открывается на рынке: десять нажатий подряд на «ТОРГОВЕЦ» (client/ui.js, cheatBox).
//
// Код включает свою хитрость, повторный ввод того же кода — выключает. Всё живёт только в памяти страницы:
// перезагрузили страницу или зашли в игру заново — коды выключены. Исключение — переезд на другую локацию
// (страница открывается заново, но игра та же): switchLoc отдаёт коды новой странице через sessionStorage,
// и та забирает их, если переезд был не дольше минуты назад.
//
//   424242 «Моби Дик»   — клюёт только крупное: гиганты, эпические и легендарные рыбы, всегда трофейного веса
//                          (shared/logic.js: bigWeights, rollFish — kit.moby);
//   818181 «Богатейший» — +9 999 999 монет до конца сессии: в сохранение (браузер, сервер, файл) они не попадают,
//                          тратятся первыми, а при выключении кода остаток забирается обратно;
//   636363 «Бог Улова»  — рыба не сходит и ждёт подсечки сколько угодно, леска не рвётся, вываживание — кликами
//                          (shared/logic.js: fightStep — kit.god; client/fishing.js).
import { fmtCoins } from '../shared/data.js';

export const CODES = [
  { code: '424242', id: 'moby', name: 'Моби Дик', about: 'клюёт только крупная рыба — гиганты, эпические и легендарные, всегда трофейного веса' },
  { code: '818181', id: 'rich', name: 'Богатейший', about: `+${fmtCoins(9999999)} монет до конца сессии` },
  { code: '636363', id: 'god', name: 'Бог Улова', about: 'рыба не сходит и не рвёт леску — вываживайте кликами' }
];
export const RICH = 9999999;
const HANDOFF = 'rybak.cheats';
const HANDOFF_TTL = 60000; // переезд на другую локацию дольше минуты — уже не переезд

export class Cheats {
  /** profile() — нынешний профиль игрока (монеты «Богатейшего» прибавляются к нему и убираются из сохранений). */
  constructor(profile) {
    this.profile = profile;
    this.on = new Set();
    this.bonus = 0; // сколько монет «Богатейшего» ещё не потрачено
    this.last = 0; // монеты на прошлой сверке: по убыли видно, что потрачено
  }
  has(id) {
    return this.on.has(id);
  }
  /** Ввод кода → { ok: false } для неверного, иначе { ok, id, name, about, on } — включён код или выключен. */
  enter(code) {
    const c = CODES.find((x) => x.code === String(code).trim());
    if (!c) return { ok: false };
    const on = !this.on.has(c.id);
    if (on) this.on.add(c.id);
    else this.on.delete(c.id);
    if (c.id === 'rich') this.setRich(on);
    return { ok: true, id: c.id, name: c.name, about: c.about, on };
  }
  /** Названия включённых кодов — для окна ввода. */
  list() {
    return CODES.filter((c) => this.on.has(c.id)).map((c) => c.name);
  }
  setRich(on, bonus = RICH) {
    const p = this.profile();
    this.sync();
    if (on) {
      p.coins += bonus;
      this.bonus = bonus;
    } else {
      p.coins = Math.max(0, p.coins - this.bonus);
      this.bonus = 0;
    }
    this.last = p.coins;
  }
  /**
   * Сверка монет: убыль — это покупки, и платятся они сперва монетами «Богатейшего». Прибыль (продажа улова,
   * награды) — настоящие монеты, их никто не заберёт. Зовётся каждый кадр и перед каждым сохранением.
   */
  sync() {
    const p = this.profile();
    if (this.bonus > 0 && p.coins < this.last) this.bonus = Math.max(0, this.bonus - (this.last - p.coins));
    this.last = p.coins;
  }
  /** Что сохранять вместо профиля: без непотраченных монет «Богатейшего». Чужой профиль (загруженный) — как есть. */
  saveView(p) {
    if (!this.bonus || p !== this.profile()) return p;
    this.sync();
    return { ...p, coins: Math.max(0, p.coins - this.bonus) };
  }
  /** Профиль заменили другим сохранением (с сервера): монеты в нём настоящие — «Богатейший» выключается без вычета. */
  forgetCoins() {
    this.on.delete('rich');
    this.bonus = 0;
    this.last = this.profile().coins;
  }
  /** Перед переездом на другую локацию: коды — новой странице (профиль уже сохранён без монет «Богатейшего»). */
  handoff() {
    if (!this.on.size) return;
    this.sync();
    try {
      sessionStorage.setItem(HANDOFF, JSON.stringify({ on: [...this.on], bonus: this.bonus, at: Date.now() }));
    } catch {
      /* без хранилища коды просто выключатся */
    }
  }
  /** Сразу после загрузки: забрать коды, если страница открылась переездом на другую локацию. */
  resume() {
    let h = null;
    try {
      h = JSON.parse(sessionStorage.getItem(HANDOFF));
      sessionStorage.removeItem(HANDOFF);
    } catch {
      h = null;
    }
    if (!h || !Array.isArray(h.on) || !(Date.now() - Number(h.at) < HANDOFF_TTL)) return;
    const ids = new Set(CODES.map((c) => c.id));
    for (const id of h.on) if (ids.has(id)) this.on.add(id);
    this.last = this.profile().coins;
    if (this.on.has('rich')) this.setRich(true, Math.max(0, Math.min(RICH, Math.round(Number(h.bonus) || 0))));
  }
}
