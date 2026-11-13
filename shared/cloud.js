// Сохранение на сервере и таблица рекордов: то, что одинаково нужно браузеру, серверу и тестам.
//
// У игры нет учётных записей и паролей. Сохранение на сервере открывает «код сохранения» — 16 знаков, которые
// игра сама придумывает на устройстве игрока. Кто знает код, тот и хозяин сохранения: с ним прогресс
// возвращается на любом устройстве. Сервер хранит не сам код, а его отпечаток (server/api.js).
import { FISH } from './data.js';
import { levelInfo } from './logic.js';

// те же знаки, что в кодах комнат: без 0, 1, I и O — их путают на слух и на глаз
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODE_LEN = 16; // 16 знаков по 5 бит — 80 бит: перебором не подобрать
/** Набранный или вставленный код — к виду «16 знаков подряд». Не похоже на код — пустая строка. */
export function cleanCode(text) {
  const s = String(text == null ? '' : text).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (s.length !== CODE_LEN) return '';
  for (const ch of s) if (!CODE_ALPHABET.includes(ch)) return '';
  return s;
}
/** Код для показа: четвёрками через дефис. */
export const showCode = (code) => String(code || '').replace(/(.{4})(?=.)/g, '$1-');
/** Новый код. bytes(n) — n случайных байт (в браузере crypto.getRandomValues, на сервере crypto.randomBytes). */
export function makeCode(bytes) {
  const b = bytes(CODE_LEN);
  let s = '';
  for (let i = 0; i < CODE_LEN; i++) s += CODE_ALPHABET[b[i] & 31];
  return s;
}

export const MAX_SAVE_BYTES = 48 * 1024; // сохранение весит несколько килобайт; больше — это не оно
export const MAX_XP = 3000000; // 99-й уровень — около двух миллионов опыта
export const cleanName = (v) => String(v == null ? '' : v).slice(0, 16).replace(/[\u0000-\u001f<>]/g, '').trim() || 'Рыбак';
const int = (v, max) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));

/**
 * Что из сохранения попадает в таблицу рекордов: имя, уровень, счётчики и лучший вес по каждому виду.
 * Сервер не считает рыбалку сам и верит сохранению, но в разумных пределах: рыба тяжелее, чем бывает
 * у её вида, или неизвестный вид в таблицу не идут.
 */
export function saveSummary(profile) {
  const p = profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {};
  const st = p.stats && typeof p.stats === 'object' ? p.stats : {};
  const j = p.journal && typeof p.journal === 'object' ? p.journal : {};
  const xp = int(p.xp, MAX_XP);
  const records = [];
  for (const f of FISH) {
    const e = j[f.id];
    if (!e || typeof e !== 'object') continue;
    const n = int(e.n, 999999);
    const w = Math.round(Number(e.best) * 1000) / 1000;
    if (n < 1 || !(w >= f.w[0] - 0.0006 && w <= f.w[1] + 0.0006)) continue;
    records.push({ sp: f.id, w, n });
  }
  return {
    name: cleanName(p.name), xp, lvl: levelInfo(xp).lvl, species: records.length,
    caught: int(st.caught, 9999999), legends: int(st.legends, 99999), medals: int(st.medals, 99999), tours: int(st.tours, 99999), records
  };
}
/** Есть ли в сохранении хоть что-то, ради чего его стоит держать на сервере. Пустые (только что открыл игру) не шлём. */
export const hasProgress = (sum) => sum.xp > 0 || sum.caught > 0;
/**
 * Отметка прогресса: по ней видно, играл ли человек с прошлой сверки с сервером. В неё входит то, что меняет
 * только сама игра — опыт, монеты, улов, покупки. Задания дня, которые игра раздаёт сама при входе, и выбранная
 * снасть в отметку не входят: иначе простое открытие игры на втором устройстве выглядело бы как «играл».
 */
export function markOf(profile) {
  const p = profile && typeof profile === 'object' ? profile : {};
  const st = p.stats && typeof p.stats === 'object' ? p.stats : {};
  const n = (v) => Math.round(Number(v) || 0);
  let tackle = 0;
  for (const v of Object.values(p.tackle && typeof p.tackle === 'object' ? p.tackle : {})) tackle += n(v);
  const owned = Object.keys(p.owned && typeof p.owned === 'object' ? p.owned : {}).length;
  return [n(p.xp), n(p.coins), n(st.caught), n(st.casts), n(st.sold), n(st.earned), Array.isArray(p.cooler) ? p.cooler.length : 0, owned, tackle, n(p.boatTrips), n(st.quests), n(st.medals)].join('.');
}

/** «Только что», «5 минут назад», «вчера в 21:40», «12 ноября» — когда сохранено. */
export function agoText(at, now = Date.now()) {
  const d = Math.max(0, now - at);
  if (!at) return '';
  if (d < 50 * 1000) return 'только что';
  if (d < 3600 * 1000) {
    const m = Math.max(1, Math.round(d / 60000));
    return `${m} ${plural(m, 'минуту', 'минуты', 'минут')} назад`;
  }
  const t = new Date(at);
  const hm = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  const day = (x) => Math.floor((x - new Date(x).getTimezoneOffset() * 60000) / 86400000);
  const dd = day(now) - day(at);
  if (dd === 0) return `сегодня в ${hm}`;
  if (dd === 1) return `вчера в ${hm}`;
  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${t.getDate()} ${MONTHS[t.getMonth()]}`;
}
export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
}
