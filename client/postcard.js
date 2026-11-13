// Открытка: кадр игры с подписью — что поймано, сколько весит, кто и когда поймал. Её можно скачать или отправить друзьям.
//
// Подписи (cardText) собираются отдельно от рисования — их проверяют тесты без холста. Рисование (drawCard) кладёт
// кадр игры на холст 1600 × 900, затемняет низ и пишет поверх теми же шрифтами, что и вся игра: название, вес и отметки —
// наклонным, как заголовки меню; кто и где — прямым.
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

const BODY = '"Onest",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
const DISP = '"Fira Sans Condensed","Arial Narrow","Roboto Condensed",sans-serif'; // названия — тем же наклонным шрифтом, что в игре
const CREAM = '#fff4de';
/** Разрядка букв на холсте — где браузер её умеет (без неё подпись просто плотнее). */
const spaced = (g, px) => {
  if ('letterSpacing' in g) g.letterSpacing = `${px}px`;
};
function rrect(g, x0, y0, w, h, r) {
  g.beginPath();
  g.moveTo(x0 + r, y0);
  g.arcTo(x0 + w, y0, x0 + w, y0 + h, r);
  g.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
  g.arcTo(x0, y0 + h, x0, y0, r);
  g.arcTo(x0, y0, x0 + w, y0, r);
  g.closePath();
}
/** Две пальмы логотипа — те же, что в меню: розовые, большая и поменьше. x, y — левый верхний угол, s — размер. */
function palms(g, x, y, s) {
  const k = s / 40;
  g.save();
  g.translate(x, y);
  g.scale(k, k);
  // дальше — в клетках 40 × 40, как у значка в стилях
  const gr = g.createLinearGradient(0, 0, 40, 40);
  gr.addColorStop(0, '#ff2e93');
  gr.addColorStop(1, '#ff9a3c');
  g.strokeStyle = gr;
  g.lineCap = 'round';
  const tree = (cx, cy, fronds, trunk, w) => {
    g.lineWidth = w;
    for (const [qx, qy, ex, ey] of fronds.concat([trunk])) {
      g.beginPath();
      g.moveTo(cx, cy);
      g.quadraticCurveTo(qx, qy, ex, ey);
      g.stroke();
    }
  };
  tree(24, 14, [[18, 6, 8, 8], [16, 12, 9, 18.5], [28, 5, 37, 6], [32, 12, 38, 18.5], [24, 6, 20, 2]], [21, 26, 23, 38], 3.4);
  tree(10, 26, [[7, 21, 2, 22], [6, 25, 3, 29.5], [12, 21, 17, 21.5], [14, 25, 16.5, 28.5], [10, 21.5, 8, 19.5]], [8.5, 32, 9.5, 38], 2.4);
  g.restore();
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
  let gr = g.createLinearGradient(0, CARD_H * 0.46, 0, CARD_H);
  gr.addColorStop(0, 'rgba(10,11,14,0)');
  gr.addColorStop(0.55, 'rgba(10,11,14,0.5)');
  gr.addColorStop(1, 'rgba(10,11,14,0.88)');
  g.fillStyle = gr;
  g.fillRect(0, CARD_H * 0.46, CARD_W, CARD_H * 0.54);
  gr = g.createRadialGradient(170, 60, 20, 170, 60, 420);
  gr.addColorStop(0, 'rgba(10,11,14,0.42)');
  gr.addColorStop(1, 'rgba(10,11,14,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 640, 420);
  g.textBaseline = 'alphabetic';
  const shadow = (on) => {
    g.shadowColor = on ? 'rgba(0,0,0,0.6)' : 'transparent';
    g.shadowBlur = on ? 14 : 0;
    g.shadowOffsetY = on ? 3 : 0;
  };
  shadow(true);
  // название игры — с наклоном и пальмами, как в меню; под ним адрес
  g.save();
  g.translate(60, 124);
  g.rotate((-4 * Math.PI) / 180);
  palms(g, 0, -86, 84);
  g.fillStyle = CREAM;
  g.font = `italic 800 92px ${DISP}`;
  g.fillText('РЫБАК', 78, 0);
  g.restore();
  if (t.site) {
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.font = `500 24px ${BODY}`;
    g.fillText(t.site, 66, 168);
  }
  // улов: редкость, название, вес и длина, отметки
  const L = 66;
  let y = CARD_H - 62;
  if (t.tags.length) {
    // плашки отметок — нижней строкой: бирюзовые, как «выбрано» в меню
    g.font = `italic 800 27px ${DISP}`;
    spaced(g, 1.2);
    let x = L;
    for (const tag of t.tags) {
      const w = g.measureText(tag).width + 44;
      shadow(false);
      const tg = g.createLinearGradient(0, y - 38, 0, y + 10);
      tg.addColorStop(0, '#86fbee');
      tg.addColorStop(1, '#12cdbf');
      g.fillStyle = tg;
      rrect(g, x, y - 38, w, 48, 24);
      g.fill();
      g.fillStyle = '#042b2a';
      g.fillText(tag, x + 22, y - 5);
      x += w + 12;
    }
    spaced(g, 0);
    shadow(true);
    y -= 72;
  }
  if (t.sub) {
    g.fillStyle = '#ffc93c';
    g.font = `italic 800 60px ${DISP}`;
    g.fillText(t.sub, L, y);
    y -= 70;
  }
  g.fillStyle = CREAM;
  // длинное название ужимаем, чтобы не наехало на подпись справа
  let size = 124;
  g.font = `italic 800 ${size}px ${DISP}`;
  const room = CARD_W - L - 560;
  while (size > 56 && g.measureText(t.head).width > room) {
    size -= 4;
    g.font = `italic 800 ${size}px ${DISP}`;
  }
  g.fillText(t.head, L, y);
  y -= size * 0.86 + 10;
  if (t.rar) {
    g.fillStyle = t.rar.color;
    g.font = `italic 600 30px ${DISP}`;
    spaced(g, 7);
    g.fillText(t.rar.name.toUpperCase(), L + 4, y);
    spaced(g, 0);
  }
  // кто, когда и где — справа внизу; у места — булавка
  g.textAlign = 'right';
  g.fillStyle = '#ffffff';
  g.font = `700 32px ${BODY}`;
  g.fillText(t.who, CARD_W - 64, CARD_H - 106);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.font = `500 26px ${BODY}`;
  g.fillText(t.when, CARD_W - 64, CARD_H - 64);
  const wWhen = g.measureText(t.when).width;
  g.textAlign = 'left';
  try {
    const pin = new Path2D('M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2z');
    g.save();
    g.translate(CARD_W - 64 - wWhen - 40, CARD_H - 90);
    g.scale(1.3, 1.3);
    g.fillStyle = '#ff4f8a';
    g.fill(pin, 'evenodd');
    g.restore();
  } catch {
    /* без булавки */
  }
  shadow(false);
  // тонкая светлая рамка, как у открытки
  g.strokeStyle = 'rgba(255,255,255,0.92)';
  g.lineWidth = 6;
  rrect(g, 21, 21, CARD_W - 42, CARD_H - 42, 22);
  g.stroke();
  return cv;
}
