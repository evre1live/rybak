// Открытка: кадр игры с подписью — что поймано, сколько весит, кто и когда поймал. Её можно скачать или отправить друзьям.
//
// Подписи (cardText) собираются отдельно от рисования — их проверяют тесты без холста. Рисование (drawCard) кладёт
// кадр игры на холст 1600 × 900, затемняет низ и пишет поверх теми же шрифтами, что и вся игра.
import { FISH_BY_ID, JUNK_BY_ID, RARITY, ZONES, fmtW } from '../shared/data.js';

export const CARD_W = 1600;
export const CARD_H = 900;
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
/** «13 ноября 2026» — сами, без Intl: в пробной версии и в старых браузерах подпись должна быть той же. */
export const cardDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/**
 * Что написать на открытке.
 * c — улов ({ sp, w, len, trophy, stalked, help }) или null (тогда это просто вид бухты);
 * name, lvl, title — рыбак; zone — зона ловли (ключ ZONES); date — Date; record, isNew — личный рекорд и новый вид;
 * site — адрес игры (пусто — не пишем).
 */
export function cardText({ c = null, name = '', lvl = 1, title = '', zone = '', date = new Date(), record = false, isNew = false, site = '' } = {}) {
  const who = String(name || 'Рыбак').slice(0, 16);
  const place = ZONES[zone] ? ZONES[zone].name : 'Солнечная бухта';
  const out = { who: `${who} · уровень ${lvl}${title ? `, ${title}` : ''}`, when: `${cardDate(date)} · ${place}`, site: String(site || ''), tags: [], rar: null, head: 'Солнечная бухта', sub: '' };
  if (!c) return out;
  const f = FISH_BY_ID[c.sp];
  const j = JUNK_BY_ID[c.sp];
  if (!f && !j) return out;
  out.head = (f || j).name;
  out.sub = fmtW(c.w) + (c.len ? ` · ${c.len} см` : '');
  out.rar = f ? { name: RARITY[f.rar].name, color: RARITY[f.rar].color } : { name: 'Находка', color: '#cbd5e1' };
  if (isNew && f) out.tags.push('НОВЫЙ ВИД');
  else if (record && f) out.tags.push('ЛИЧНЫЙ РЕКОРД');
  if (c.trophy) out.tags.push('ТРОФЕЙ');
  if (c.stalked) out.tags.push('ВЫСЛЕЖЕНА');
  if (c.help) out.tags.push(`ПОДСАЧИЛ: ${String(c.help).slice(0, 16).toUpperCase()}`);
  return out;
}
/** Имя файла открытки: без пробелов и знаков, которые не любят файловые системы. */
export function cardFile(t, date = new Date()) {
  const slug = String(t.head || 'rybak').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'rybak';
  const p2 = (n) => String(n).padStart(2, '0');
  return `rybak-${slug}-${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}.jpg`;
}

const DISP = '"Sofia X","Arial Narrow",Impact,sans-serif';
const BODY = '"Onest",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
function rrect(g, x0, y0, w, h, r) {
  g.beginPath();
  g.moveTo(x0 + r, y0);
  g.arcTo(x0 + w, y0, x0 + w, y0 + h, r);
  g.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
  g.arcTo(x0, y0 + h, x0, y0, r);
  g.arcTo(x0, y0, x0 + w, y0, r);
  g.closePath();
}
/**
 * Нарисовать открытку. cv — холст (станет 1600 × 900), src — кадр игры (холст WebGL или картинка; нет — фон заливкой),
 * t — подписи из cardText.
 */
export function drawCard(cv, src, t) {
  cv.width = CARD_W;
  cv.height = CARD_H;
  const g = cv.getContext('2d');
  g.fillStyle = '#0e2140';
  g.fillRect(0, 0, CARD_W, CARD_H);
  if (src && src.width && src.height) {
    // кадр ложится «с обрезкой по краям», без искажений
    const k = Math.max(CARD_W / src.width, CARD_H / src.height);
    const w = src.width * k;
    const h = src.height * k;
    g.imageSmoothingQuality = 'high';
    g.drawImage(src, (CARD_W - w) / 2, (CARD_H - h) / 2, w, h);
  }
  // низ темнее — под подписи; верхний левый угол чуть темнее — под название игры
  let gr = g.createLinearGradient(0, CARD_H * 0.5, 0, CARD_H);
  gr.addColorStop(0, 'rgba(6,18,36,0)');
  gr.addColorStop(0.55, 'rgba(6,18,36,0.55)');
  gr.addColorStop(1, 'rgba(6,18,36,0.9)');
  g.fillStyle = gr;
  g.fillRect(0, CARD_H * 0.5, CARD_W, CARD_H * 0.5);
  gr = g.createLinearGradient(0, 0, 0, 170);
  gr.addColorStop(0, 'rgba(6,18,36,0.5)');
  gr.addColorStop(1, 'rgba(6,18,36,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, CARD_W, 170);
  g.textBaseline = 'alphabetic';
  g.shadowColor = 'rgba(0,0,0,0.45)';
  g.shadowBlur = 12;
  g.shadowOffsetY = 2;
  // название игры и адрес
  g.fillStyle = '#ffd60a';
  g.font = `italic 900 64px ${DISP}`;
  g.fillText('РЫБАК', 64, 100);
  if (t.site) {
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.font = `500 24px ${BODY}`;
    g.fillText(t.site, 66, 134);
  }
  // улов: редкость, название, вес и длина
  const L = 64;
  let y = CARD_H - 64;
  if (t.tags.length) {
    // плашки отметок — нижней строкой
    g.font = `800 30px ${DISP}`;
    let x = L;
    for (const tag of t.tags) {
      const w = g.measureText(tag).width + 28;
      g.shadowColor = 'transparent';
      g.fillStyle = 'rgba(255,214,10,0.95)';
      rrect(g, x, y - 34, w, 44, 8);
      g.fill();
      g.fillStyle = '#0a1a33';
      g.fillText(tag, x + 14, y - 2);
      x += w + 12;
    }
    g.shadowColor = 'rgba(0,0,0,0.45)';
    y -= 66;
  }
  if (t.sub) {
    g.fillStyle = '#ffd60a';
    g.font = `800 62px ${DISP}`;
    g.fillText(t.sub, L, y);
    y -= 70;
  }
  g.fillStyle = '#ffffff';
  // длинное название ужимаем, чтобы не наехало на подпись справа
  let size = 118;
  g.font = `italic 900 ${size}px ${DISP}`;
  const room = CARD_W - L - 560;
  while (size > 64 && g.measureText(t.head.toUpperCase()).width > room) {
    size -= 6;
    g.font = `italic 900 ${size}px ${DISP}`;
  }
  g.fillText(t.head.toUpperCase(), L, y);
  y -= size * 0.86 + 6;
  if (t.rar) {
    g.fillStyle = t.rar.color;
    g.font = `800 34px ${DISP}`;
    g.fillText(t.rar.name.toUpperCase(), L + 2, y);
  }
  // кто и когда — справа внизу
  g.textAlign = 'right';
  g.fillStyle = '#ffffff';
  g.font = `700 32px ${BODY}`;
  g.fillText(t.who, CARD_W - 64, CARD_H - 104);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.font = `500 26px ${BODY}`;
  g.fillText(t.when, CARD_W - 64, CARD_H - 64);
  g.textAlign = 'left';
  g.shadowColor = 'transparent';
  // тонкая светлая рамка, как у открытки
  g.strokeStyle = 'rgba(255,255,255,0.9)';
  g.lineWidth = 6;
  rrect(g, 21, 21, CARD_W - 42, CARD_H - 42, 18);
  g.stroke();
  return cv;
}
