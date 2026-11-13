// Интерфейс: экран игры (HUD) по макетам этапа 19 — стеклянные панели, команда с фигурками, мини-карта с маршрутом;
// лобби, снасти и магазин, рынок, журнал, выбор героя, настройки.
import { CATS, ITEMS, FISH, FISH_BY_ID, FIGHT_STYLES, JUNK_BY_ID, RARITY, ZONES, DAY_PARTS, RODS, MAX_PLAYERS, fmtW, fmtCoins, fmtClock } from '../shared/data.js';
import {
  kitStats, rodBars, owns, tackleCount, priceOf, fishValue, coolerValue, levelInfo, fightGrade, T_LOW, T_DANGER, T_TIGHT, dangerAt, liftNeed,
  WEATHER, questText, questCount, questReward, QUEST_BONUS, TOURS, TOUR_LENS, tourTable, tourScoreText, tourTargets, tourPrize, medalPrize, MEDALS
} from '../shared/logic.js';
import { itemIcon, fishIcon, faceIcon } from './icons.js';
import { heroes, heroOf, heroTemplate } from './hero.js';
import { MARKS, markSvg } from './proto.js';
import { MAP_VIEW, MARKET, MOORINGS, WRECK } from './terrain.js';
import { settings, saveSettings } from './profile.js';
import { showCode, saveSummary, agoText, plural } from '../shared/cloud.js';
import { $, $$, el, esc, clamp } from './util.js';

const SVG = {
  pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8" r="3.6"/><circle cx="16.8" cy="8.6" r="3"/><path d="M1.5 20c0-4 2.9-6.4 6.5-6.4s6.5 2.4 6.5 6.4zM15.6 20c0-2-.6-3.8-1.7-5.1a6 6 0 0 1 2.9-.7c3.1 0 5.7 2 5.7 5.8z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 9V7A5 5 0 0 0 7 7v2H5v12h14V9zm-8-2a3 3 0 0 1 6 0v2H9zm3 9.5a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2z"/></svg>',
  coin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="12" cy="12" r="7" fill="none" stroke="#0a1a33" stroke-opacity=".35" stroke-width="1.6"/><path d="M9 16l3-8 3 8M10 13.4h4" stroke="#0a1a33" stroke-opacity=".6" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 12c4-6 11-7 16-3l3-2-1 5 1 5-3-2c-5 4-12 3-16-3zm5.5-1.4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  micoff: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M3 3l18 18" stroke="#f04438" stroke-width="2.6" stroke-linecap="round"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M12 2L1 21h22z" fill="currentColor"/><path d="M12 9v6M12 17.5v1" stroke="#0a1a33" stroke-width="2.4" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6.5"/></svg>',
  crown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 8l5 4 5-7 5 7 5-4-2 11H4z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  rod: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 21L20 4M20 4v9"/><circle cx="8" cy="16" r="2.4" fill="currentColor"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 19a5 5 0 0 1-.6-9.96A6.5 6.5 0 0 1 19 10.2 4.4 4.4 0 0 1 18.5 19z"/></svg>',
  rain: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 15a4.5 4.5 0 0 1-.5-8.97A6 6 0 0 1 18 7.2 4 4 0 0 1 17.6 15z"/><path d="M8 18l-1.2 3M12.5 18l-1.2 3M17 18l-1.2 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
  fog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 8h12M8 12h13M3 16h14M9 20h9"/></svg>',
  cup: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h10v2h4v3a5 5 0 0 1-4.4 4.96A5.5 5.5 0 0 1 13 15.9V18h3.5v3h-9v-3H11v-2.1a5.5 5.5 0 0 1-3.6-2.94A5 5 0 0 1 3 8V5h4zm10 4v3.7A3 3 0 0 0 19 8V7zM5 7v1a3 3 0 0 0 2 2.7V7z"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 6.5l1.6 1.6L8 5M3.5 12.5l1.6 1.6L8 11M3.5 18.5l1.6 1.6L8 17M11.5 7h9M11.5 13h9M11.5 19h9"/></svg>'
};
const WX_ICON = { clear: 'sun', cloudy: 'cloud', rain: 'rain', fog: 'fog' };
const TIER = ['ЛЁГКОЕ', 'СРЕДНЕЕ', 'ТРУДНОЕ'];
const mmss = (sec) => `${String(Math.floor(Math.max(0, sec) / 60)).padStart(2, '0')}:${String(Math.max(0, sec) % 60).padStart(2, '0')}`;
const ic = (n, cls = '') => `<span class="ic ${cls}">${SVG[n] || ''}</span>`;
const coin = (n) => `${ic('coin')}${fmtCoins(n)}`;

export class UI {
  constructor(game) {
    this.g = game;
    this.panel = null;
    this.screen = $('#screen');
    this.hud = $('#hud');
    for (const e of $$('[data-ic]')) e.innerHTML = SVG[e.dataset.ic] || '';
    this.cmp = $('#compass').getContext('2d');
    this.map = $('#minimap').getContext('2d');
    this.mapBase = null;
    this.tags = new Map();
    this.plates = new Map();
    this.hintKey = '';
    this.lastClock = '';
    this.screen.addEventListener('click', (e) => this.onClick(e));
    this.screen.addEventListener('input', (e) => this.onInput(e));
    $('#voiceChip').addEventListener('click', () => game.toggleVoice());
    $('#chat').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('#chatIn').value.trim();
      if (v) game.sendChat(v);
      this.chat(false);
    });
  }
  // подпись клавиши под текущее устройство
  key(a) {
    const pad = this.g.input.device === 'pad';
    const m = {
      primary: pad ? ['RT', ''] : ['ЛКМ', ''], back: pad ? ['B', 'b'] : ['ПКМ', 'x'], use: pad ? ['A', ''] : ['E', ''], tackle: pad ? ['X', 'x'] : ['TAB', 'x'],
      release: pad ? ['B', 'b'] : ['R', 'b'], esc: pad ? ['B', 'b'] : ['ESC', 'b'], left: pad ? ['LS', 'g'] : ['A', 'g'], right: pad ? ['LS', 'g'] : ['D', 'g'], run: pad ? ['L3', 'g'] : ['SHIFT', 'g']
    }[a] || [a, 'g'];
    return `<kbd class="${m[1]}">${m[0]}</kbd>`;
  }

  // ───── HUD ─────
  hudShow(v) {
    this.hud.classList.toggle('hidden', !v);
    if (!v) this.clearTags();
  }
  refreshHud() {
    const p = this.g.profile;
    const kit = kitStats(p);
    const lv = levelInfo(p.xp);
    $('#coins').textContent = fmtCoins(p.coins);
    $('#lvl').textContent = lv.lvl;
    $('#bagN').textContent = `${p.cooler.length} / ${kit.bagCap}`;
    $('.tally .bag').classList.toggle('full', p.cooler.length >= kit.bagCap);
    const rod = ITEMS[p.equip.rod] || RODS[0];
    // наживка или приманка на крючке и сколько её осталось — в плашке под картой; удочка — отдельным чипом справа
    const tk = p.equip.tackle;
    const n = tackleCount(p, tk);
    $('#baitIcon').src = itemIcon(tk);
    $('#baitN').textContent = n === Infinity ? '∞' : n;
    $('#hotbar').innerHTML = `<div class="slot rodchip sel" data-k="rod"><img src="${itemIcon(rod.id)}" alt=""><b id="rodName">${esc(rod.name)}</b></div>`;
  }
  setCrew(list) {
    const key = JSON.stringify(list.map((p) => [p.id, p.name, p.slot, p.voice, p.muted, p.mode]));
    if (key !== this.crewKey) {
      this.crewKey = key;
      // у каждого своя фигурка и цвет — те же, что над головой в мире и на карте; огонёк горит, когда человек говорит
      const mic = (p) => (p.voice && !p.muted ? ic('mic', 'mic') : ic('micoff', 'mic off'));
      $('#crew').innerHTML = list.filter((p) => !p.me).map((p) => `<div class="crow${p.mode === 'lobby' ? ' away' : ''}" data-id="${p.id}">${markSvg(p.slot, 22)}<b>${esc(p.name)}</b>${p.mode === 'lobby' ? '<span class="st">в лобби</span>' : ''}<i class="dot"></i>${mic(p)}</div>`).join('');
      $('#onlineN').textContent = this.g.solo ? 'Одиночная рыбалка' : `Команда ${list.length}/${MAX_PLAYERS}`;
      $('.crewbox').classList.toggle('solo', !!this.g.solo);
    }
    for (const p of list) {
      const row = $(`.crow[data-id="${p.id}"]`);
      if (row) row.classList.toggle('talk', !!p.talk);
    }
  }
  setHints(html) {
    if (html === this.hintKey) return;
    this.hintKey = html;
    $('#hints').innerHTML = settings.hints ? html : '';
  }
  toast(text, cls = '', ms = 2600) {
    const t = el('div', 'toast ' + cls, text);
    const box = $('#toasts');
    box.append(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => t.classList.add('out'), ms);
    setTimeout(() => t.remove(), ms + 450);
  }
  feed(html, cls = '') {
    const d = el('div', cls, html);
    const box = $('#feed');
    box.append(d);
    while (box.children.length > 5) box.firstChild.remove();
    setTimeout(() => d.classList.add('out'), 9000);
    setTimeout(() => d.remove(), 9700);
  }
  banner(text, cls = '', ms = 0) {
    const b = $('#banner');
    clearTimeout(this.bannerT);
    if (!text) return b.classList.add('hidden');
    b.className = cls;
    b.textContent = text;
    if (ms) this.bannerT = setTimeout(() => b.classList.add('hidden'), ms);
  }
  alert(text, sub = '') {
    const a = $('#alert');
    a.classList.toggle('hidden', !text);
    if (text) a.innerHTML = `${esc(text)}${sub ? `<small>${sub}</small>` : ''}`;
  }
  prompt(html) {
    const p = $('#prompt');
    if (html === this.promptKey) return;
    this.promptKey = html;
    p.classList.toggle('hidden', !html);
    p.innerHTML = html ? `<div class="hintp gl">${html}</div>` : '';
  }
  /** Погода рядом с часами: название, а в непогоду — ещё и прибавка к клёву. */
  weather(wx) {
    const add = Math.round((wx.bite - 1) * 100);
    const key = wx.kind + '|' + add;
    if (key === this.wxKey) return;
    this.wxKey = key;
    $('.hud-tl .loc').classList.toggle('wx-off', wx.kind === 'clear');
    $('#wxName').innerHTML = `${WEATHER[wx.kind].name}${add > 0 ? `<em>клёв +${add}%</em>` : ''}`;
  }
  /** Задания дня в углу экрана: что осталось и сколько сделано. */
  questTracker() {
    const qs = this.g.profile.quests;
    const box = $('#quests');
    const left = qs ? qs.list.filter((q) => !q.done).length : 0;
    box.classList.toggle('hidden', !qs);
    if (!qs) return;
    const html = `<div class="qh"><span class="cap">Задания дня</span><kbd class="g">K</kbd>${left ? '' : '<span class="ok">все выполнены</span>'}</div>` +
      qs.list.filter((q) => !q.done).map((q) => `<div class="q"><span>${esc(questText(q))}</span><b>${esc(questCount(q))}</b></div>`).join('');
    if (html !== this.questKey) {
      this.questKey = html;
      box.innerHTML = html;
    }
  }
  /** Табло турнира под компасом: отсчёт до старта, время, первые места и своя строка. t = null — убрать. */
  tourHud(t, now = 0, me = 0) {
    const box = $('#tour');
    box.classList.toggle('hidden', !t);
    if (!t) return;
    const name = TOURS[t.kind].name;
    if (now < t.start) {
      box.innerHTML = `<div class="th">${ic('cup')}${t.solo ? 'ЗАПЛЫВ' : 'ТУРНИР'} · ${name}<span class="t">СТАРТ ЧЕРЕЗ ${Math.ceil((t.start - now) / 1000)}</span></div><div class="tn">${esc(TOURS[t.kind].hint)}</div>`;
      return;
    }
    const table = tourTable(t.kind, [...t.scores.values()]);
    const rows = table.filter((r, i) => r.place && (i < 3 || r.id === me));
    let foot = '';
    if (t.solo) {
      const tg = tourTargets(t.kind, t.len, this.g.fishing.kit);
      const unit = t.kind === 'count' ? '' : ' кг';
      foot = `<div class="tn">бронза ${String(tg[0]).replace('.', ',')} · серебро ${String(tg[1]).replace('.', ',')} · золото ${String(tg[2]).replace('.', ',')}${unit}</div>`;
    } else if (!rows.length) foot = '<div class="tn">Пока никто ничего не поймал</div>';
    box.innerHTML = `<div class="th">${ic('cup')}${t.solo ? 'ЗАПЛЫВ' : 'ТУРНИР'} · ${name}<span class="t">${mmss(Math.ceil((t.end - now) / 1000))}</span></div>` +
      rows.map((r) => `<div class="tr ${r.id === me ? 'me' : ''}"><i>${r.place}</i><span>${esc(r.id === me ? 'Вы' : r.name)}</span><b>${tourScoreText(t.kind, r.s)}</b></div>`).join('') + foot;
  }
  chat(open) {
    $('#chat').classList.toggle('hidden', !open);
    if (open) {
      $('#chatIn').value = '';
      $('#chatIn').focus();
    } else $('#chatIn').blur();
    this.chatOpen = open;
  }
  catchCard(d) {
    const box = $('#catch');
    if (!d) return box.classList.add('hidden');
    const c = d.c;
    const f = FISH_BY_ID[c.sp];
    const j = JUNK_BY_ID[c.sp];
    const rar = f ? RARITY[f.rar] : { name: 'Находка', color: '#cbd5e1' };
    const val = fishValue(c, this.g.market());
    const bd = [];
    const jn = this.g.profile.journal[c.sp];
    if (f && (!jn || jn.n === 0)) bd.push('<span class="bd cy">НОВЫЙ ВИД!</span>');
    else if (f && jn && c.w > jn.best) bd.push('<span class="bd gr">ЛИЧНЫЙ РЕКОРД!</span>');
    if (c.trophy) bd.push('<span class="bd">ТРОФЕЙ</span>');
    if (c.stalked) bd.push('<span class="bd gr">ВЫСЛЕЖЕНА</span>');
    if (c.help) bd.push(`<span class="bd cy">ПОДСАЧИЛ: ${esc(String(c.help).toUpperCase())}</span>`);
    if (f && this.g.market().hot.includes(c.sp)) bd.push('<span class="bd">В ЦЕНЕ ×1,6</span>');
    box.style.setProperty('--rc', rar.color);
    box.innerHTML = `<div class="rar">${rar.name}</div><h2>${esc((f || j).name)}</h2>
      <div class="w">${fmtW(c.w)}${c.len ? `<small>${c.len} см</small>` : ''}</div>
      <div class="badges">${bd.join('')}</div>
      <p>${esc((f || j).desc)}</p>
      <div class="val">${coin(val)} <span style="font-size:.6em;opacity:.7;margin-left:.4em">НА РЫНКЕ</span></div>
      <div class="acts">${d.full ? `<span class="bd red" style="font-size:1em">САДОК ПОЛОН</span><span>${this.key('primary')} ОТПУСТИТЬ</span>` : `<span>${this.key('primary')} В САДОК</span><span>${this.key('release')} ОТПУСТИТЬ</span>`}</div>`;
    box.classList.remove('hidden');
  }
  /** Счётчики вываживания. f — состояние боя или null. */
  fight(f, steer) {
    const box = $('#fight');
    box.classList.toggle('hidden', !f);
    if (!f) {
      this.fNow = null;
      return;
    }
    // что за бой не меняется — манера рыбы и отметки легенды — пишем один раз, в его начале
    if (this.fNow !== f) {
      this.fNow = f;
      this.fMode = this.fBoss = this.fHelp = null;
      const S = FIGHT_STYLES[f.style] || FIGHT_STYLES.plain;
      $('#ftip').innerHTML = f.junk ? '' : `<b>${esc(S.name.toUpperCase())}</b>${esc(S.tip)}`;
      $('#tok').textContent = f.style === 'bulldog' ? 'ВНАТЯГ' : 'НОРМА';
      $('#pbar').classList.toggle('boss', f.bossMax > 0);
      $('#fboss').classList.toggle('on', f.bossMax > 0);
    }
    // стрелка и полоса двигаются сдвигом и растяжением (transform): страница при этом не пересчитывается
    $('#tptr').style.transform = `translateX(${(clamp(f.T, 0, 1) * 100).toFixed(2)}%)`;
    $('#pfill').style.transform = `scaleX(${clamp(f.p, 0, 1).toFixed(4)})`;
    const pct = Math.round(f.p * 100) + '%';
    if (this.pctShown !== pct) $('#ppct').textContent = this.pctShown = pct;
    // особые зоны шкалы: свеча, залёгшая рыба, тяжеловес — классы меняем только при смене режима
    const air = f.jumpT > 0;
    const mode = (air ? 'air ' : '') + (f.stuck ? 'stuck ' : '') + (f.style === 'bulldog' ? 'bull' : '');
    if (this.fMode !== mode) {
      this.fMode = mode;
      $('#tbar').className = 'tbar ' + mode;
    }
    // друг рядом с подсаком — на полосе пути видно, откуда он возьмёт рыбу
    const help = !!this.g.helperNear;
    if (this.fHelp !== help) $('#pbar').classList.toggle('help', (this.fHelp = help));
    if (f.stuck) $('#tzLiftK').style.transform = `scaleX(${clamp(f.lift / liftNeed(f), 0, 1).toFixed(3)})`;
    if (f.bossMax && this.fBoss !== f.boss) {
      this.fBoss = f.boss;
      const used = f.bossMax - f.boss;
      $('#fboss').innerHTML = Array.from({ length: f.bossMax }, (_, i) => `<i${i < f.boss ? '' : ' class="used"'}></i>`).join('');
      $$('#pbar .pm').forEach((m, i) => m.classList.toggle('used', i < used));
    }
    const st = $('#fstate');
    const run = f.phase === 'run';
    const danger = dangerAt(f);
    let txt = 'РОВНО';
    let cls = '';
    if (f.T > danger) {
      txt = air ? 'ОТПУСТИ!' : 'ОПАСНО!';
      cls = 'bad';
    } else if (air) {
      txt = 'СВЕЧА — ОСЛАБЬ!';
      cls = 'warn';
    } else if (f.T < T_LOW) {
      txt = 'СЛАБИНА!';
      cls = 'warn';
    } else if (f.stuck) {
      txt = 'ЗАЛЕГЛА — ПОДОРВИ!';
      cls = 'warn';
    } else if (f.wrapped) {
      txt = 'ЗА КАМНЯМИ!';
      cls = 'bad';
    } else if (run && f.style === 'snag' && steer !== -f.dir) {
      txt = 'УВОДИ ОТ КАМНЕЙ!';
      cls = 'warn';
    } else if (run) {
      txt = 'РЫВОК!';
      cls = 'warn';
    } else if (f.warned) {
      txt = 'ГОТОВИТСЯ…';
      cls = 'warn';
    } else if (f.style === 'bulldog' && f.T < T_TIGHT) {
      txt = 'ТЯНИ ВНАТЯГ';
    }
    if (this.fTxt !== txt) st.textContent = this.fTxt = txt;
    if (st.className !== cls) st.className = cls;
    $('.fpanel').classList.toggle('shake', f.T > danger);
    // куда вести: против рывка
    const need = run ? -f.dir : 0;
    const L = $('#steer .l');
    const Rr = $('#steer .r');
    L.className = 'st l' + (need < 0 ? (steer < 0 ? ' hit' : ' on') : '');
    Rr.className = 'st r' + (need > 0 ? (steer > 0 ? ' hit' : ' on') : '');
  }
  power(v, need) {
    const box = $('#power');
    box.classList.toggle('hidden', v == null);
    if (v == null) return;
    $('#pwfill').style.width = v * 100 + '%';
    $('#pwneed').style.left = clamp(need, 0, 1) * 100 + '%';
  }
  /** Метка «заброс сюда»: экранные координаты и подпись. */
  castMark(m) {
    const e = $('#castMark');
    e.classList.toggle('hidden', !m);
    if (!m) return;
    e.style.transform = `translate(${m.x}px,${m.y}px) translate(-50%,-2.6em)`;
    e.classList.toggle('bad', !m.ok);
    e.classList.toggle('hot', !!m.hot);
    // подпись видна всегда и меняется на ходу: куда упадёт поплавок, добросим ли, есть ли здесь косяк
    const lbl = m.ok ? (m.hot ? 'Косяк рыбы!' : m.clamped ? 'Дальше не добросить' : 'Заброс сюда') : 'Тут не вода';
    const l = e.querySelector('.lbl');
    if (l.textContent !== lbl) l.textContent = lbl;
    const sub = m.ok ? `${m.zone} · ${m.dist.toFixed(0)} м от вас · дно ${m.depth.toFixed(1).replace('.', ',')} м${m.act ? ` · клёв ${'●'.repeat(Math.max(1, Math.round(m.act * 5)))}` : ''}` : '';
    const s = e.querySelector('.sub');
    if (s.textContent !== sub) s.textContent = sub;
  }
  clock(h) {
    const s = fmtClock(h);
    if (s === this.lastClock) return;
    this.lastClock = s;
    $('#clock').textContent = s;
  }
  /** Лента компаса вверху экрана: стороны света и градусы. В настройках её можно убрать. */
  compass(yaw) {
    const on = !!settings.compass;
    if (on !== this.cmpOn) $('#compass').classList.toggle('hidden', !(this.cmpOn = on));
    if (!on) return;
    const g = this.cmp;
    const W = 760;
    const H = 64;
    const head = (((-yaw * 180) / Math.PI) % 360 + 360) % 360;
    if (Math.abs(head - (this.lastHead ?? -99)) < 0.15) return;
    this.lastHead = head;
    g.clearRect(0, 0, W, H);
    const span = 150;
    g.textAlign = 'center';
    g.lineCap = 'round';
    for (let a = Math.floor((head - span / 2) / 15) * 15; a <= head + span / 2; a += 15) {
      const x = W / 2 + ((a - head) / span) * W;
      const d = ((a % 360) + 360) % 360;
      const fade = clamp(1.25 - Math.abs(a - head) / (span / 2), 0, 1);
      g.globalAlpha = fade;
      g.strokeStyle = '#fff';
      g.fillStyle = '#fff';
      const major = d % 45 === 0;
      g.lineWidth = major ? 4 : 3;
      g.beginPath();
      g.moveTo(x, 20);
      g.lineTo(x, major ? 32 : 29);
      g.stroke();
      const lab = { 0: 'С', 90: 'В', 180: 'Ю', 270: 'З' }[d];
      g.font = lab ? '700 34px "Onest", sans-serif' : '500 19px "Onest", sans-serif';
      g.fillText(lab || String(d), x, lab ? 62 : 56);
    }
    g.globalAlpha = 1;
    g.fillStyle = '#3fe3d5';
    g.beginPath();
    g.moveTo(W / 2 - 11, 2);
    g.lineTo(W / 2 + 11, 2);
    g.lineTo(W / 2, 17);
    g.fill();
  }
  /**
   * Мини-карта. view — какой прямоугольник мира на ней: бухта или всё море; boat — где ждёт своя лодка (если мы не в ней);
   * nav — маршрут до цели: { pts: [[x, z], …], len, sail } (sail — по воде, сплошной линией; пешком — пунктиром) или null.
   */
  minimap(me, others, schools, view = MAP_VIEW, boat = null, nav = null) {
    const g = this.map;
    const W = 512;
    const H = 276;
    const sea = view !== MAP_VIEW;
    const base = sea ? this.g.seaMap() : this.mapBase;
    if (!base) return;
    g.drawImage(base, 0, 0);
    const X = (x) => ((x - view.x0) / (view.x1 - view.x0)) * W;
    const Z = (z) => ((z - view.z0) / (view.z1 - view.z0)) * H;
    // что за краем карты — прижимается к рамке: видно, в какой оно стороне
    const inX = (v) => Math.max(11, Math.min(W - 11, v));
    const inZ = (v) => Math.max(11, Math.min(H - 11, v));
    const INK = '#12233f';
    if (schools) {
      const k = sea ? 0.7 : 1.1;
      g.fillStyle = 'rgba(18,35,63,.72)';
      for (const s of schools) {
        if (s.on < 0.5) continue;
        g.beginPath();
        g.ellipse(X(s.x), Z(s.z), 7 * k, 4 * k, 0, 0, 7);
        g.fill();
        g.beginPath();
        g.moveTo(X(s.x) + 6 * k, Z(s.z));
        g.lineTo(X(s.x) + 12 * k, Z(s.z) - 4 * k);
        g.lineTo(X(s.x) + 12 * k, Z(s.z) + 4 * k);
        g.fill();
      }
    }
    // маршрут: розовая линия от нас до цели, цель — точка в белом кольце
    if (nav && nav.pts.length > 1) {
      g.lineCap = g.lineJoin = 'round';
      g.beginPath();
      nav.pts.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
      if (!nav.sail) g.setLineDash([1, 13]);
      g.strokeStyle = 'rgba(18,35,63,.3)';
      g.lineWidth = 10;
      g.stroke();
      g.strokeStyle = '#ff5fa8';
      g.lineWidth = 6;
      g.stroke();
      g.setLineDash([]);
      const [tx, tz] = nav.pts[nav.pts.length - 1];
      g.fillStyle = '#ff5fa8';
      g.strokeStyle = '#fff';
      g.lineWidth = 3.5;
      g.beginPath();
      g.arc(inX(X(tx)), inZ(Z(tz)), 8.5, 0, 7);
      g.fill();
      g.stroke();
    }
    const txt = nav ? (nav.len >= 995 ? `${(nav.len / 1000).toFixed(1).replace('.', ',')} км` : `${Math.max(5, Math.round(nav.len / 5) * 5)} м`) : '';
    if (txt !== this.distTxt) {
      this.distTxt = txt;
      const e = $('#mapDist');
      e.textContent = txt;
      e.classList.toggle('hidden', !txt);
    }
    g.strokeStyle = INK;
    g.lineWidth = 2.5;
    if (!sea) {
      // торговец — золотая точка
      g.fillStyle = '#ffd166';
      g.beginPath();
      g.arc(X(MARKET.x - 4), Z(MARKET.z), 6, 0, 7);
      g.fill();
      g.stroke();
      // куда можно доплыть: причалы и корабль за краем карты — белые стрелки у рамки
      for (const m of [...MOORINGS, WRECK]) {
        const mx = X(m.x);
        const mz = Z(m.z);
        if (mx > 0 && mx < W && mz > 0 && mz < H) continue;
        const a = Math.atan2(mz - H / 2, mx - W / 2);
        g.save();
        g.translate(inX(mx), inZ(mz));
        g.rotate(a);
        g.fillStyle = '#fff';
        g.beginPath();
        g.moveTo(9, 0);
        g.lineTo(-6, -7);
        g.lineTo(-6, 7);
        g.closePath();
        g.stroke();
        g.fill();
        g.restore();
      }
    }
    if (boat) {
      // своя лодка ждёт у причала
      g.save();
      g.translate(X(boat.x), Z(boat.z));
      g.rotate(-boat.yaw);
      g.fillStyle = '#fff';
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(0, 0, sea ? 3.4 : 4.4, sea ? 6.5 : 9, 0, 0, 7);
      g.fill();
      g.stroke();
      g.restore();
    }
    const shape = (x, y, m, r) => {
      g.fillStyle = m.color;
      g.strokeStyle = INK;
      g.lineWidth = 3;
      g.beginPath();
      if (m.shape === 'tri') {
        g.moveTo(x, y - r);
        g.lineTo(x + r, y + r * 0.8);
        g.lineTo(x - r, y + r * 0.8);
      } else if (m.shape === 'diamond') {
        g.moveTo(x, y - r);
        g.lineTo(x + r, y);
        g.lineTo(x, y + r);
        g.lineTo(x - r, y);
      } else if (m.shape === 'circle') g.arc(x, y, r * 0.9, 0, 7);
      else g.rect(x - r * 0.8, y - r * 0.8, r * 1.6, r * 1.6);
      g.closePath();
      g.stroke();
      g.fill();
    };
    for (const o of others) shape(inX(X(o.x)), inZ(Z(o.z)), MARKS[o.slot % 8], sea ? 11 : 12.5);
    // я — белая стрелка в тёмном круге, смотрит туда же, куда я
    g.save();
    g.translate(inX(X(me.x)), inZ(Z(me.z)));
    g.fillStyle = INK;
    g.beginPath();
    g.arc(0, 0, 16.5, 0, 7);
    g.fill();
    g.rotate(-me.yaw);
    g.fillStyle = '#fff';
    g.beginPath();
    g.moveTo(0, -11);
    g.lineTo(8, 8);
    g.lineTo(0, 3.8);
    g.lineTo(-8, 8);
    g.closePath();
    g.fill();
    g.restore();
  }
  /** Метки над головами друзей — фигурка и имя: [{id, x, y, name, slot, talk, say, vis, far}]; у далёких — только фигурка. */
  setTags(list) {
    const box = $('#tags');
    const seen = new Set();
    for (const t of list) {
      seen.add(t.id);
      let e = this.tags.get(t.id);
      if (!e) {
        e = el('div', 'tag');
        box.append(e);
        this.tags.set(t.id, e);
      }
      const key = t.name + '|' + t.slot + '|' + (t.say || '');
      if (e.dataset.k !== key) {
        e.dataset.k = key;
        e.innerHTML = `${t.say ? `<div class="say">${t.say}</div>` : ''}<div class="nm">${markSvg(t.slot, 30, true)}<span>${esc(t.name)}</span></div>`;
      }
      e.style.display = t.vis ? '' : 'none';
      e.style.transform = `translate(${t.x.toFixed(1)}px,${t.y.toFixed(1)}px) translate(-50%,-100%) scale(${t.scale.toFixed(2)})`;
      e.classList.toggle('talk', !!t.talk);
      e.classList.toggle('far', !!t.far);
    }
    for (const [id, e] of this.tags) if (!seen.has(id)) {
      e.remove();
      this.tags.delete(id);
    }
  }
  clearTags() {
    for (const e of this.tags.values()) e.remove();
    this.tags.clear();
  }
  setPlates(list) {
    const box = $('#plates');
    const seen = new Set();
    for (const t of list) {
      seen.add(t.id);
      let e = this.plates.get(t.id);
      if (!e) {
        e = el('div', 'plate');
        box.append(e);
        this.plates.set(t.id, e);
      }
      const key = [t.name, t.slot, t.host, t.me, t.mode].join('|');
      if (e.dataset.k !== key) {
        e.dataset.k = key;
        e.style.borderLeftColor = MARKS[t.slot % 8].color;
        e.innerHTML = `<div class="n">${t.me ? ic('crown') : markSvg(t.slot, 20)}${t.me ? 'ТЫ' : esc(t.name)}${t.host ? '<span class="host">ХОЗЯИН</span>' : ''}</div><div class="s ${t.mode === 'world' ? 'fish' : ''}">${t.mode === 'world' ? ic('bag') + 'РЫБАЧИТ' : ic('check') + 'ГОТОВ'}</div>`;
      }
      e.style.transform = `translate(${t.x.toFixed(1)}px,${t.y.toFixed(1)}px) translate(-50%,0)`;
      e.classList.toggle('talk', !!t.talk);
    }
    for (const [id, e] of this.plates) if (!seen.has(id)) {
      e.remove();
      this.plates.delete(id);
    }
  }

  // ───── экраны ─────
  hideScreen() {
    this.screen.innerHTML = '';
    this.panel = null;
    this.view = null;
  }
  showTitle(err = '') {
    this.view = 'title';
    this.panel = null;
    const p = this.g.profile;
    const code = this.g.urlCode || '';
    this.screen.innerHTML = `<div class="title">
      <div class="logo">РЫБАК<small>РЫБАЛКА С ДРУЗЬЯМИ</small></div>
      <div class="tcard">
        <label for="nm">Как вас зовут</label>
        <input class="in" id="nm" maxlength="16" placeholder="Имя" value="${esc(p.name || '')}" autocomplete="off">
        <div class="err" id="terr">${esc(err)}</div>
        ${this.g.offline ? `<button class="btn pri" data-a="solo"><span>НАЧАТЬ РЫБАЛКУ</span></button>
        <div class="note">Пробная версия для одного. Комнаты для друзей и голосовой чат работают в полной игре на сервере.</div>` : `${code ? `<button class="btn pri" data-a="join"><span>ВОЙТИ В КОМНАТУ ${esc(code)}</span></button>` : '<button class="btn pri" data-a="create"><span>СОЗДАТЬ КОМНАТУ ДЛЯ ДРУЗЕЙ</span></button>'}
        <div class="row"><input class="in code" id="code" maxlength="4" placeholder="КОД" value="${esc(code)}" autocomplete="off"><button class="btn cy" data-a="joincode"><span>ВОЙТИ ПО КОДУ</span></button></div>
        <div class="or">или</div>
        <button class="btn ghost" data-a="solo"><span>РЫБАЧИТЬ В ОДИНОЧКУ</span></button>`}
      </div>
      <div class="tnote${this.g.serverUp === false ? '' : ' hidden'}" id="srvNote">Сервер просыпается — комнаты заработают через минуту. В одиночку можно рыбачить уже сейчас.</div>
      <div class="tfoot">${this.g.offline ? 'Прогресс хранится в этом браузере' : `Голосовой чат включается в комнате · <span id="saveNote">${this.saveNote()}</span>`}<br><a data-a="help">Как играть</a>${this.g.offline ? '' : ' · <a data-a="open" data-p="top">Рекорды</a>'} · <a data-a="settings">Настройки</a></div>
    </div>`;
    setTimeout(() => {
      const n = $('#nm');
      if (n && !n.value) n.focus();
    }, 50);
  }
  /** Одна строка на заставке: где сейчас лежит прогресс. */
  saveNote() {
    const st = this.g.cloud.state;
    if (st === 'clash') return '<a data-a="open" data-p="save" class="warnlink">сохранения разошлись — выберите, какое оставить</a>';
    if (st === 'ok' || st === 'pending') return 'прогресс хранится в браузере и на сервере';
    return 'прогресс хранится в этом браузере';
  }
  showLobby() {
    this.view = 'lobby';
    this.panel = null;
    const g = this.g;
    const n = g.roster().length;
    const word = (k) => (k % 10 === 1 && k % 100 !== 11 ? 'РЫБАК ГОТОВ' : k % 10 >= 2 && k % 10 <= 4 && (k % 100 < 10 || k % 100 >= 20) ? 'РЫБАКА ГОТОВЫ' : 'РЫБАКОВ ГОТОВЫ');
    const v = g.voiceState();
    this.screen.innerHTML = `
      <div class="lob-tl"><div class="chip">${ic('users')}<b>ТВОЯ КОМАНДА</b><i class="sep"></i><small>${g.solo ? 'ОДИНОЧНАЯ РЫБАЛКА' : `${ic('lock')}КОД · <span class="y">${esc(g.code)}</span> · ${n}/${MAX_PLAYERS}`}</small></div>
        ${g.solo ? '' : `<button class="btn sm cy" data-a="copy"><span>${ic('link')} ССЫЛКА ДЛЯ ДРУЗЕЙ</span></button>`}</div>
      <div class="nav"><button class="tab on" data-a="lobby">ИГРА</button><button class="tab" data-a="open" data-p="tackle">СНАСТИ</button><button class="tab" data-a="open" data-p="editor">ПЕРСОНАЖ</button><button class="tab" data-a="open" data-p="journal">ЖУРНАЛ</button><button class="tab" data-a="open" data-p="quests">ЗАДАНИЯ${(() => { const qs = g.profile.quests; const n = qs ? qs.list.filter((q) => !q.done).length : 0; return n ? `<em class="dot">${n}</em>` : ''; })()}</button></div>
      <div class="lcard">
        <h2>${ic('pin')}СОЛНЕЧНАЯ БУХТА</h2>
        <div class="mode">СВОБОДНАЯ РЫБАЛКА</div>
        ${g.shot ? `<img class="shot" src="${g.shot}" alt="">` : '<div class="shot"></div>'}
        <div class="ready">${ic('users')}${n} ${word(n)}</div>
        <button class="btn pri big" data-a="start"><kbd class="g">↵</kbd><span>НАЧАТЬ РЫБАЛКУ</span></button>
        ${g.solo ? '' : `<div class="sub"><button class="btn ${v.on ? (v.muted ? 'ghost' : 'cy') : 'ghost'}" data-a="voice"><span>${ic(v.on && !v.muted ? 'mic' : 'micoff')} ${v.joining ? 'ПОДКЛЮЧАЮ…' : v.on ? (v.muted ? 'МИКРОФОН ВЫКЛ' : 'ГОЛОС ВКЛЮЧЁН') : 'ВКЛЮЧИТЬ ГОЛОС'}</span></button></div>
        <div class="hint">${v.on ? 'Друзья вас слышат. Клавиша M — выключить и включить микрофон.' : 'Нажмите «Включить голос» и разрешите микрофон — будете слышать друг друга прямо в игре.'}</div>`}
      </div>
      <div class="lob-bl"><button class="btn sm ghost" data-a="leave"><kbd class="b">ESC</kbd><span>${g.solo ? 'В МЕНЮ' : 'ВЫЙТИ ИЗ КОМНАТЫ'}</span></button></div>`;
  }

  openPanel(name, opts = {}) {
    const prev = this.panel;
    this.panel = name;
    this.popts = opts;
    if (name === 'tackle' || name === 'shop') {
      this.tk = this.tk || { cat: 'rod', sel: null };
      this.tk.shop = name === 'shop';
      this.renderTackle();
    } else if (name === 'sell') this.renderSell();
    else if (name === 'journal') this.renderJournal();
    else if (name === 'editor') this.renderEditor(true);
    else if (name === 'settings') this.renderSettings();
    else if (name === 'pause') this.renderPause();
    else if (name === 'help') this.renderHelp();
    else if (name === 'quests') this.renderQuests();
    else if (name === 'tour') this.renderTour();
    else if (name === 'bench') this.renderBench();
    else if (name === 'card') this.renderCard();
    else if (name === 'top') this.openTop();
    else if (name === 'save') this.renderSave();
    this.g.onPanel(name, prev);
  }
  closePanel() {
    if (!this.panel) return;
    const was = this.panel;
    this.panel = null;
    this.g.onPanel(null, was);
  }
  footKeys(act) {
    return `<span class="sp"></span><div class="keys">${act ? `<span>${this.key('use')} ${act}</span>` : ''}<span>${this.key('esc')} НАЗАД</span></div>`;
  }

  renderTackle() {
    const p = this.g.profile;
    const t = this.tk;
    const cat = CATS.find((c) => c.key === t.cat) || CATS[0];
    if (!t.sel || !cat.items.some((i) => i.id === t.sel)) t.sel = (cat.items.find((i) => p.equip[cat.slot] === i.id) || cat.items[0]).id;
    const it = ITEMS[t.sel];
    const tiles = cat.items.map((i) => {
      const own = owns(p, i.id);
      const eq = i.cat !== 'extra' && p.equip[ITEMS[i.id].slot] === i.id;
      const cnt = ITEMS[i.id].count ? tackleCount(p, i.id) : 0;
      let tag = '';
      if (eq) tag = `<span class="tg">${ic('check')}ВЫБРАНО</span>`;
      if (ITEMS[i.id].count && cnt > 0) tag += `<span class="tg cnt">${cnt === Infinity ? '∞' : '×' + cnt}</span>`;
      else if (!own) tag += `<span class="tg price">${coin(priceOf(i.id))}</span>`;
      else if (i.cat === 'extra' || (own && !eq && !ITEMS[i.id].slot)) tag += `<span class="tg">${ic('check')}ЕСТЬ</span>`;
      return `<div class="tile ${i.id === t.sel ? 'sel' : ''} ${own ? '' : 'lock'}" data-a="pick" data-id="${i.id}">${tag}<img src="${itemIcon(i.id)}" alt=""><div class="nm">${esc(i.name)}</div></div>`;
    }).join('');
    const kit = kitStats(p);
    this.screen.innerHTML = `<div class="dim"></div><div class="panel">
      <div class="ptitle"><h1>${t.shop ? 'МАГАЗИН' : 'СНАСТИ'}</h1>${t.shop ? '<button class="btn sm cy" data-a="open" data-p="sell"><span>← ПРОДАТЬ УЛОВ</span></button>' : ''}<span class="sp"></span><div class="coinbox">${coin(p.coins)}</div><button class="xbtn" data-a="close">×</button></div>
      <div class="tabs2">${CATS.map((c) => `<button class="tab ${c.key === cat.key ? 'on' : ''}" data-a="cat" data-id="${c.key}">${c.name}</button>`).join('')}</div>
      <div class="grid">${tiles}</div>
      <div class="detail">${this.itemDetail(it)}</div>
      <div class="loadout"><span class="hd">ТЕКУЩИЙ НАБОР</span>
        <div class="it"><img src="${itemIcon(p.equip.rod)}" alt="">${esc(ITEMS[p.equip.rod].name)}</div>
        <div class="it"><img src="${itemIcon(p.equip.tackle)}" alt="">${esc(ITEMS[p.equip.tackle].name)} <span class="y">${tackleCount(p, p.equip.tackle) === Infinity ? '∞' : tackleCount(p, p.equip.tackle)}</span></div>
        <div class="it">ЗАБРОС <span class="y">${kit.cast} М</span></div><div class="it">ЛЕСКА <span class="y">${kit.lineKg.toFixed(1).replace('.', ',')} КГ</span></div><div class="it">САДОК <span class="y">${p.cooler.length}/${kit.bagCap}</span></div>
        ${this.footKeys(this.actionOf(it).label)}</div></div>`;
  }
  actionOf(it) {
    const p = this.g.profile;
    const own = owns(p, it.id);
    const eq = it.slot && p.equip[it.slot] === it.id;
    const price = priceOf(it.id);
    if (it.count) {
      if (this.tk.shop && it.id !== 'bread') return { a: 'buy', label: `КУПИТЬ ${it.cat === 'tackle' ? '×' + it.pack : ''} ЗА ${fmtCoins(price)}`, dis: p.coins < price, also: own && !eq ? 'equip' : null };
      if (own && !eq) return { a: 'equip', label: 'ВЗЯТЬ' };
      return { a: null, label: '' };
    }
    if (own) return eq || !it.slot ? { a: null, label: '' } : { a: 'equip', label: 'ВЗЯТЬ' };
    if (this.tk.shop) return { a: 'buy', label: `КУПИТЬ ЗА ${fmtCoins(price)}`, dis: p.coins < price };
    return { a: null, label: '' };
  }
  itemDetail(it) {
    const p = this.g.profile;
    const own = owns(p, it.id);
    const eq = it.slot && p.equip[it.slot] === it.id;
    const act = this.actionOf(it);
    let body = '';
    if (it.cat === 'rod') {
      const b = rodBars(it);
      const row = (name, v, txt) => `<div class="stat"><span>${name}<em>${txt}</em></span><div class="bar"><i style="width:${Math.round(clamp(v, 0.04, 1) * 100)}%"></i></div></div>`;
      body = `<div class="stats">${row('ДАЛЬНОСТЬ ЗАБРОСА', b.cast, it.cast + ' м')}${row('ПРОЧНОСТЬ ЛЕСКИ', b.line, String(it.line).replace('.', ',') + ' кг')}${row('СКОРОСТЬ КАТУШКИ', b.reel, '×' + it.reel.toFixed(2).replace('.', ','))}</div>`;
    } else {
      const fx = [];
      if (it.cat === 'tackle' || it.cat === 'lure') {
        const likes = FISH.filter((f) => (it.cat === 'lure' ? f.lure >= 1.2 : (f.baits[it.id] || 0) >= 1.25)).sort((a, b) => b.rar - a.rar).slice(0, 6).map((f) => f.name);
        if (likes.length) fx.push('Любят: ' + likes.join(', ').toLowerCase());
        if (it.rare > 1) fx.push(`Редкая рыба клюёт охотнее: ×${String(it.rare).replace('.', ',')}`);
        if (it.size > 1) fx.push('Рыба попадается крупнее');
        if (it.cat === 'lure') fx.push('Не расходуется, но теряется при обрыве лески', 'После заброса удерживайте кнопку — приманка должна двигаться');
        else if (it.id !== 'bread') fx.push('Расходуется при каждой поклёвке');
      }
      if (it.cat === 'bag') fx.push(`Вместимость: ${it.cap} рыб`);
      body = fx.length ? `<ul class="fx">${fx.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : '<div></div>';
    }
    let actHtml = '';
    if (act.a === 'buy') actHtml = `<button class="btn pri" data-a="buy" data-id="${it.id}" ${act.dis ? 'disabled' : ''}><span>${act.label}</span></button>${act.also ? `<button class="btn cy" data-a="equip" data-id="${it.id}"><span>ВЗЯТЬ</span></button>` : ''}${act.dis ? `<small>Не хватает ${fmtCoins(priceOf(it.id) - p.coins)} монет — продайте улов</small>` : ''}`;
    else if (act.a === 'equip') actHtml = `<button class="btn pri" data-a="equip" data-id="${it.id}"><span>ВЗЯТЬ</span></button>`;
    else if (eq) actHtml = `${ic('check')}ВЫБРАНО`;
    else if (own) actHtml = `${ic('check')}КУПЛЕНО`;
    else actHtml = `<span class="y" style="display:inline-flex;gap:.3em;align-items:center">${coin(priceOf(it.id))}</span><small>Продаётся на рынке — лавка с полосатым навесом у берега</small>`;
    return `<img class="big" src="${itemIcon(it.id)}" alt=""><h2>${esc(it.name)}</h2><p class="desc">${esc(it.desc)}</p>${body}<div class="act">${actHtml}</div>`;
  }

  renderSell() {
    const g = this.g;
    const p = g.profile;
    const m = g.market();
    const kit = kitStats(p);
    const tiles = p.cooler.map((c, i) => {
      const f = FISH_BY_ID[c.sp];
      const v = fishValue(c, m);
      const k = f ? m.mult[c.sp] : 1;
      return `<div class="tile" data-a="sell1" data-id="${i}" title="Продать"><span class="pr ${k >= 1.15 ? 'up' : k <= 0.92 ? 'dn' : ''}">${coin(v)}</span>${c.trophy ? '<span class="tg">ТРОФЕЙ</span>' : ''}<img src="${f ? fishIcon(c.sp) : itemIcon(c.sp)}" alt=""><div class="nm" style="color:${f ? RARITY[f.rar].color : '#fff'}">${esc((f || JUNK_BY_ID[c.sp]).name)}</div><div class="wt">${fmtW(c.w)}</div></div>`;
    }).join('');
    const total = coolerValue(p, m);
    const mins = Math.max(1, Math.ceil(m.nextIn / 60));
    this.screen.innerHTML = `<div class="dim"></div><div class="panel">
      <div class="ptitle"><h1>РЫНОК</h1><button class="btn sm cy" data-a="open" data-p="shop"><span>МАГАЗИН СНАСТЕЙ →</span></button><span class="sp"></span><div class="coinbox">${coin(p.coins)}</div><button class="xbtn" data-a="close">×</button></div>
      <div class="tabs2"><button class="tab on">ТВОЙ УЛОВ · ${p.cooler.length}/${kit.bagCap}</button></div>
      <div class="grid">${tiles || '<div class="empty">Садок пуст.<br>Поймайте что-нибудь — торговец купит всё, даже старый ботинок.</div>'}</div>
      <div class="sellside">
        <h2>СЕГОДНЯ В ЦЕНЕ</h2>
        <div class="hotlist">${m.hot.map((id) => `<div><img src="${fishIcon(id)}" alt="">${esc(FISH_BY_ID[id].name)}<em>×1,6</em></div>`).join('')}</div>
        <p>Цены меняются каждые 10 минут — следующая смена через ${mins} мин. Стрелка у цены показывает, дороже рыба обычного или дешевле. Нажмите на рыбу, чтобы продать только её.</p>
        <div class="total"><span>ЗА ВЕСЬ УЛОВ</span><b>${coin(total)}</b></div>
        <button class="btn pri big" data-a="sellall" ${p.cooler.length ? '' : 'disabled'}><span>ПРОДАТЬ ВСЁ</span></button>
      </div>
      <div class="loadout"><span class="hd">ТОРГОВЕЦ</span><div class="it" style="border:0;text-transform:none;font-family:var(--body);font-style:normal;font-weight:500">«${esc(g.vendorLine())}»</div>${this.footKeys(p.cooler.length ? 'ПРОДАТЬ ВСЁ' : '')}</div></div>`;
  }

  renderJournal() {
    const p = this.g.profile;
    this.js = this.js || FISH[0].id;
    const f = FISH_BY_ID[this.js];
    const j = p.journal[f.id];
    const got = Object.keys(p.journal).length;
    const tiles = FISH.map((x) => {
      const jj = p.journal[x.id];
      return `<div class="tile ${x.id === this.js ? 'sel' : ''} ${jj ? '' : 'unk lock'}" data-a="jpick" data-id="${x.id}">${jj ? `<span class="tg cnt">×${jj.n}</span>` : ''}<img src="${fishIcon(x.id)}" alt=""><div class="nm" style="color:${jj ? RARITY[x.rar].color : '#9fb4d3'}">${jj ? esc(x.name) : '???'}</div></div>`;
    }).join('');
    const zones = Object.entries(f.zones).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([z]) => ZONES[z].name.toLowerCase()).join(', ');
    const baits = [...Object.entries(f.baits).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([b]) => ITEMS[b].name.toLowerCase()), ...(f.lure >= 1 ? ['блёсны и воблеры'] : [])].join(', ');
    const times = Object.entries(f.time).filter(([, v]) => v > 1.1).map(([t]) => DAY_PARTS[t].toLowerCase()).join(', ') || 'в любое время';
    const lv = levelInfo(p.xp);
    const s = p.stats;
    this.screen.innerHTML = `<div class="dim"></div><div class="panel">
      <div class="ptitle"><h1>ЖУРНАЛ</h1><span class="sp"></span><div class="coinbox">${coin(p.coins)}</div><button class="xbtn" data-a="close">×</button></div>
      <div class="jstats"><div><b>${lv.lvl}</b>уровень · ${esc(lv.title)}</div><div><b>${got}/${FISH.length}</b>видов открыто</div><div><b>${s.caught}</b>поймано</div><div><b>${fmtCoins(s.earned)}</b>заработано</div><div><b>${s.best ? fmtW(s.best.w) : '—'}</b>${s.best ? esc(FISH_BY_ID[s.best.sp].name) + ' — рекорд' : 'самый тяжёлый улов'}</div><div><b>${s.snaps}</b>обрывов лески</div>${s.stalked ? `<div><b>${s.stalked}</b>выслежено</div>` : ''}${s.assists ? `<div><b>${s.assists}</b>подсачено друзьям</div>` : ''}</div>
      <div class="grid" style="grid-template-columns:repeat(5,1fr)">${tiles}</div>
      <div class="detail" style="grid-row:3/4">
        <img class="big ${j ? '' : 'unk'}" src="${fishIcon(f.id)}" alt="" style="${j ? '' : 'filter:brightness(0) opacity(.5)'}">
        <div class="rarc" style="color:${RARITY[f.rar].color}">${RARITY[f.rar].name}</div>
        <h2 style="margin-top:-.1em">${j ? esc(f.name) : '???'}</h2>
        <p class="desc">${j ? esc(f.desc) : 'Эту рыбу вы ещё не ловили. Подсказки ниже помогут её найти.'}</p>
        <div class="kv" style="grid-column:1/-1"><span>Где</span><span>${zones}</span><span>На что</span><span>${baits || '—'}</span><span>Когда</span><span>${times}</span>
          <span>Манера</span><span>${esc(FIGHT_STYLES[f.style].name)}: ${esc(FIGHT_STYLES[f.style].tip.charAt(0).toLowerCase() + FIGHT_STYLES[f.style].tip.slice(1))}${f.rar >= 4 ? '. Легенда: дважды собирается с силами' : ''}</span>
          <span>Вес</span><span>${fmtW(f.w[0])} – ${fmtW(f.w[1])}</span>${j ? `<span>Поймано</span><span>${j.n}</span><span>Рекорд</span><span class="y">${fmtW(j.best)}</span>` : ''}</div>
      </div>
      <div class="loadout"><span class="hd">ДО УРОВНЯ ${lv.lvl + 1}</span><div class="it" style="border:0;flex:1;max-width:30em"><div class="pbar" style="flex:1;height:1em"><i style="width:${Math.round((lv.cur / lv.need) * 100)}%;background:var(--ye)"></i></div>&nbsp;${lv.cur} / ${lv.need}</div>${this.footKeys('')}</div></div>`;
  }

  /** Экран «Персонаж»: выбор героя. Других персонажей в игре нет — собрать своего из частей больше нельзя. */
  renderEditor(first) {
    const g = this.g;
    if (first) {
      this.ed = { look: { hero: heroOf(g.profile.look) } };
      g.editLook(this.ed.look);
    }
    const hs = heroes.list;
    const cur = heroes.byId.get(heroOf(this.ed.look));
    const list = hs.length
      ? `<div class="hlist">${hs.map((h) => `<button class="${cur && cur.id === h.id ? 'on' : ''}" data-a="hero" data-id="${h.id}"><img src="${faceIcon({ hero: h.id })}" alt=""><span>${esc(h.name)}</span></button>`).join('')}</div>`
      : `<p class="ednote">${heroes.ready ? 'В этой версии игры готовых героев нет.' : 'Герои загружаются…'}</p>`;
    this.screen.innerHTML = `<div class="editor">
      <div class="ptitle"><h1>ПЕРСОНАЖ</h1></div>
      <div class="hinfo">${cur ? `<h2>${esc(cur.name)}</h2>${cur.about ? `<p>${esc(cur.about)}</p>` : ''}${heroTemplate(cur.id) ? '' : '<p class="load">Модель загружается…</p>'}` : ''}</div>
      <div class="opts"><h3>Выберите героя</h3>${list}</div>
      <div class="edfoot"><button class="btn ghost" data-a="edcancel"><kbd class="b">ESC</kbd><span>ОТМЕНА</span></button><span class="sp"></span><span class="edhint">${this.g.input.touch.on ? 'Ведите пальцем — герой повернётся' : 'Зажмите мышь и ведите — герой повернётся'}</span><span class="sp"></span><button class="btn pri big" data-a="edsave" style="height:2.2em"><span>ГОТОВО</span></button></div></div>`;
  }

  renderSettings() {
    const s = settings;
    const rng = (k, min, max, step) => `<input type="range" min="${min}" max="${max}" step="${step}" value="${s[k]}" data-set="${k}">`;
    const tog = (k) => `<span class="tog ${s[k] ? 'on' : ''} click" data-a="tog" data-id="${k}"></span>`;
    this.screen.innerHTML = `<div class="dim"></div><div class="center wide">
      <h1>НАСТРОЙКИ</h1>
      <div class="set">
        <span>Чувствительность мыши</span>${rng('sens', 0.3, 3, 0.05)}
        <span>Перевернуть мышь по вертикали</span>${tog('invertY')}
        <span>Угол обзора</span>${rng('fov', 50, 90, 1)}
        <span>Взгляд сам держится на рыбе<small class="sub">при вываживании, пока вы не ведёте мышью</small></span>${tog('follow')}
        <span>Графика${s.quality === 'auto' ? `<small class="sub">сейчас: ${{ low: 'низкая', medium: 'средняя', high: 'высокая' }[this.g.gfx.quality]}${this.g.gfx.scale < 0.99 ? `, разрешение ${Math.round(this.g.gfx.scale * 100)}%` : ''}</small>` : ''}</span><select data-set="quality">${[['auto', 'Авто'], ['high', 'Высокая'], ['medium', 'Средняя'], ['low', 'Низкая']].map(([v, n]) => `<option value="${v}" ${s.quality === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <span>Плавное разрешение<small class="sub">кадры проседают — картинка чуть мельче</small></span>${tog('drs')}
        <span>Счётчик кадров (F3)</span>${tog('fps')}
        <span>Компас вверху экрана<small class="sub">лента со сторонами света и градусами</small></span>${tog('compass')}
        <span>Общая громкость</span>${rng('master', 0, 1, 0.02)}
        <span>Море, чайки, ветер</span>${rng('amb', 0, 1, 0.02)}
        <span>Звуки рыбалки</span>${rng('sfx', 0, 1, 0.02)}
        <span>Музыка<small class="sub">её сочиняет сама игра; на нуле — выключена</small></span>${rng('music', 0, 1, 0.02)}
        <span>Громкость голосов друзей</span>${rng('voiceVol', 0, 1, 0.02)}
        <span>Говорить только с зажатой V</span>${tog('ptt')}
        <span>Голос тише с расстоянием</span>${tog('near')}
        <span>Подсказки клавиш внизу</span>${tog('hints')}
      </div>
      ${this.g.cache && this.g.cache.on ? `<div class="hint cachenote">Игра сохранена на этом устройстве${this.g.cache.total ? `: ${this.g.cache.done} из ${this.g.cache.total} файлов` : ''} — открывается сразу и не ждёт сервер.</div>` : ''}
      <button class="btn pri" data-a="close"><span>ГОТОВО</span></button>
      <div class="row2">${this.g.installPrompt ? '<button class="btn sm" data-a="install"><span>УСТАНОВИТЬ КАК ПРИЛОЖЕНИЕ</span></button>' : ''}<button class="btn sm" data-a="bench"><span>ПРОВЕРКА КОМПЬЮТЕРА</span></button><button class="btn sm ${this.g.cloud.clash ? 'red' : ''}" data-a="open" data-p="save"><span>СОХРАНЕНИЕ И ПЕРЕНОС</span></button></div>
      <div class="hint savenote" id="saveLine">${this.saveLine()}</div></div>`;
  }
  /** Одна строка: где сейчас лежит прогресс и когда он в последний раз ушёл на сервер. */
  saveLine() {
    const c = this.g.cloud;
    return {
      none: 'Прогресс хранится в этом браузере.',
      off: 'Прогресс хранится только в этом браузере: сохранение на сервере выключено.',
      wake: 'Прогресс хранится в этом браузере. Сервер просыпается…',
      nodb: 'Прогресс хранится в этом браузере: сервер сейчас сохранений не принимает.',
      net: 'Прогресс хранится в этом браузере. С сервером нет связи — отправим, как появится.',
      busy: 'Прогресс хранится в этом браузере. Сервер занят — отправим чуть позже.',
      clash: 'Сохранения на сервере и на этом устройстве разошлись — выберите, какое оставить.',
      empty: 'Прогресс хранится в этом браузере, а после первого улова — ещё и на сервере.',
      pending: `Прогресс хранится в браузере и на сервере: сохранено ${agoText(c.s.at)}, новое уйдёт через несколько секунд.`,
      ok: `Прогресс хранится в браузере и на сервере: сохранено ${agoText(c.s.at)}.`
    }[c.state];
  }
  /** От чего зависит устройство панели «Сохранение» (а не только подписи в ней). */
  saveShape() {
    const c = this.g.cloud;
    return `${c.state === 'none'}|${!!c.clash}|${c.s.on}|${c.s.listed}|${c.code}`;
  }
  /** Сохранение и перенос: сервер (код сохранения, вход по коду, выбор при расхождении), файл, сброс. */
  renderSave() {
    const g = this.g;
    this.saveKey = this.saveShape();
    const typed = (this.screen.querySelector('#cloudcode') || {}).value || '';
    this.screen.innerHTML = `<div class="dim"></div><div class="center wide savep">
      <h1>СОХРАНЕНИЕ</h1>
      <div class="hint savenote" id="saveLine">${this.saveLine()}</div>
      ${this.cloudBlock()}
      <h3>ФАЙЛ СОХРАНЕНИЯ</h3>
      <div class="hint savenote">Запасная копия прогресса одним файлом: её можно убрать в надёжное место или открыть на другом устройстве.</div>
      <div class="row2"><button class="btn sm" data-a="savefile"><span>СОХРАНИТЬ В ФАЙЛ</span></button><button class="btn sm" data-a="loadfile"><span>ЗАГРУЗИТЬ ИЗ ФАЙЛА</span></button><button class="btn ghost sm" data-a="reset"><span>НАЧАТЬ ЗАНОВО — СТЕРЕТЬ ПРОГРЕСС</span></button></div>
      <input type="file" id="savein" accept=".json,application/json" hidden>
      <button class="btn pri" data-a="open" data-p="settings"><span>ГОТОВО</span></button></div>`;
    const inp0 = this.screen.querySelector('#cloudcode');
    if (inp0 && typed) inp0.value = typed;
    const found = g.pendingCode;
    if (found) {
      // под кодом нашлось сохранение: показываем чьё и спрашиваем, заменить ли нынешний прогресс
      const b = this.screen.querySelector('[data-a="cloudlink"]');
      if (b) {
        b.dataset.sure = '1';
        b.classList.add('red');
        b.innerHTML = `<span>ЗАМЕНИТЬ ПРОГРЕСС: ${esc(found.sum.name.toUpperCase())}, УРОВЕНЬ ${found.sum.lvl}? НАЖМИТЕ ЕЩЁ РАЗ</span>`;
        const inp = this.screen.querySelector('#cloudcode');
        if (inp) inp.value = showCode(found.code);
      }
    }
    const pick = this.g.pendingSave;
    if (pick) {
      // файл выбран: показываем, что в нём, и спрашиваем, заменить ли нынешний прогресс
      const b = this.screen.querySelector('[data-a="loadfile"]');
      b.dataset.sure = '1';
      b.classList.add('red');
      b.innerHTML = `<span>ЗАМЕНИТЬ ПРОГРЕСС: ${esc((pick.name || 'РЫБАК').toUpperCase())}, УРОВЕНЬ ${pick.lvl}? НАЖМИТЕ ЕЩЁ РАЗ</span>`;
    }
    this.screen.querySelector('#savein').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) this.g.loadFromFile(f);
    });
  }
  /** Подпись под переключателем «Хранить прогресс на сервере». */
  cloudNote() {
    const c = this.g.cloud;
    return {
      off: 'выключено',
      wake: 'сервер просыпается…',
      nodb: 'сервер сейчас сохранений не принимает',
      net: 'нет связи с сервером — отправим позже',
      busy: 'сервер занят — отправим чуть позже',
      clash: 'сохранения разошлись — выберите ниже',
      empty: 'появится на сервере после первого улова',
      pending: `сохранено ${agoText(c.s.at)}`,
      ok: `сохранено ${agoText(c.s.at)}`
    }[c.state] || '';
  }
  /** Панель «Сохранение»: сервер — состояние, код, вход по коду с другого устройства, выбор при расхождении. */
  cloudBlock() {
    const c = this.g.cloud;
    const st = c.state;
    if (st === 'none') return '';
    const tog = (a, on) => `<span class="tog ${on ? 'on' : ''} click" data-a="${a}"></span>`;
    const me = saveSummary(this.g.profile);
    const what = (m) => `уровень ${m.lvl}, ${m.species} ${plural(m.species, 'вид', 'вида', 'видов')} рыб, поймано ${m.caught}`;
    const note = this.cloudNote();
    const clash = c.clash
      ? `<div class="clash"><b>Сохранения разошлись.</b> На сервере — ${esc(c.clash.sum.name)}: ${what(c.clash.sum)}; сохранено ${agoText(c.clash.at)} с другого устройства. На этом устройстве — ${what(me)}.
        <div class="row2"><button class="btn sm" data-a="cloudserver"><span>ВЗЯТЬ С СЕРВЕРА</span></button><button class="btn sm" data-a="cloudmine"><span>ОСТАВИТЬ С ЭТОГО УСТРОЙСТВА</span></button></div>
        <small>Второе сохранение при этом пропадёт. Не уверены — сначала «Сохранить в файл».</small></div>`
      : '';
    const shown = this.codeShown;
    const code = showCode(c.code);
    return `<div class="cloudbox">
      <h3>СОХРАНЕНИЕ НА СЕРВЕРЕ</h3>
      <div class="set">
        <span>Хранить прогресс на сервере<small class="sub" id="cloudNote">${note}</small></span>${tog('cloudtog', c.s.on)}
        <span>Показывать меня в таблице рекордов<small class="sub">имя, уровень и лучший улов видят все игроки</small></span>${tog('cloudlisted', c.s.on && c.s.listed)}
      </div>
      ${clash}
      ${c.s.on ? `<div class="codebox"><span>Код сохранения</span><code id="cloudmy">${shown ? code : code.slice(0, 4) + '-••••-••••-' + code.slice(-4)}</code><button class="btn sm ghost" data-a="cloudshow"><span>${shown ? 'СКРЫТЬ' : 'ПОКАЗАТЬ'}</span></button><button class="btn sm" data-a="cloudcopy"><span>СКОПИРОВАТЬ</span></button></div>
      <div class="hint savenote">С этим кодом прогресс откроется на любом устройстве — даже если очистить браузер. Запишите его и никому не показывайте: кто знает код, тот распоряжается сохранением.</div>
      <div class="codebox"><span>Есть код с другого устройства?</span><input class="in" id="cloudcode" maxlength="24" placeholder="XXXX-XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="btn sm" data-a="cloudlink"><span>ЗАГРУЗИТЬ ПО КОДУ</span></button></div>` : ''}
    </div>`;
  }
  // ───── таблица рекордов ─────
  openTop() {
    this.top = { tab: (this.top && this.top.tab) || 'anglers', data: null, why: '' };
    this.renderTop();
    const run = this.top;
    // своё последнее — сначала на сервер, чтобы увидеть себя в таблице с только что пойманным
    Promise.resolve(this.g.cloud.s.dirty ? this.g.cloud.push() : null)
      .then(() => this.g.cloud.top())
      .then((r) => {
        if (this.top !== run) return;
        if (r.ok) run.data = r;
        else run.why = r.why || 'NET';
        if (this.panel === 'top') this.renderTop();
      });
  }
  renderTop() {
    const g = this.g;
    const t = this.top;
    const d = t.data;
    const mine = g.cloud.s.on ? g.cloud.s.pub : '';
    const p = g.profile;
    let body = '';
    if (!d) {
      body = `<p class="topnote">${t.why ? ({ NO_DB: 'Сервер сейчас не ведёт таблицу рекордов.', SLOW_DOWN: 'Слишком часто — подождите несколько секунд и откройте снова.' }[t.why] || 'Сервер не отвечает: он просыпается или нет связи. Попробуйте через минуту.') : 'Загружаю таблицу…'}</p>`;
    } else if (t.tab === 'anglers') {
      const rows = d.anglers.map((r, i) => {
        const lv = levelInfo(r.xp);
        return `<div class="trow ${r.pub === mine ? 'me' : ''}"><i>${i + 1}</i><span class="nm">${esc(r.name)}${r.pub === mine ? ' <em>вы</em>' : ''}</span><span class="lv"><b>${lv.lvl}</b> ${esc(lv.title)}</span><span>${r.species}/${FISH.length}</span><span>${r.legends || '—'}</span><span>${r.medals || '—'}</span><span>${r.caught}</span></div>`;
      }).join('');
      const out = d.me && !d.anglers.some((r) => r.pub === mine);
      body = d.anglers.length
        ? `<div class="ttable"><div class="trow hd"><i>№</i><span class="nm">Рыбак</span><span class="lv">Уровень</span><span>Видов</span><span>Легенд</span><span>Медалей</span><span>Улов</span></div>${rows}</div>
          ${out ? `<p class="topnote">Ваше место — <b class="y">${d.me.place}</b> из ${d.total}.</p>` : ''}`
        : '<p class="topnote">Таблица пока пуста. Поймайте первую рыбу — и откроете её собой.</p>';
    } else {
      const rec = new Map(d.records.map((r) => [r.sp, r]));
      const rows = FISH.map((f) => {
        const r = rec.get(f.id);
        const j = p.journal[f.id];
        const hold = r && r.pub === mine;
        return `<div class="trow ${hold ? 'me' : ''}"><img class="${j ? '' : 'unk'}" src="${fishIcon(f.id)}" alt=""><span class="nm" style="color:${j ? RARITY[f.rar].color : '#9fb4d3'}">${j ? esc(f.name) : '???'}</span><span class="w">${r ? fmtW(r.w) : '—'}</span><span class="who">${r ? `${esc(r.name)}${hold ? ' <em>вы</em>' : ''}` : 'ещё никто не поймал'}</span><span class="my">${j ? fmtW(j.best) : '—'}</span></div>`;
      }).join('');
      body = `<div class="ttable rec"><div class="trow hd"><i></i><span class="nm">Рыба</span><span class="w">Рекорд</span><span class="who">Чей</span><span class="my">Ваш вес</span></div>${rows}</div>`;
    }
    const c = g.cloud;
    const foot = c.state === 'off' ? 'Вас в таблице нет: сохранение на сервере выключено (Настройки → Сохранение и перенос).' : !c.s.listed ? 'Вас в таблице нет: вы скрыли себя (Настройки → Сохранение и перенос).' : c.s.rev > 0 ? 'Таблицу видят все игроки. Скрыть себя можно в настройках: «Сохранение и перенос».' : 'Вы появитесь в таблице после первого улова. Таблицу видят все игроки.';
    this.screen.innerHTML = `<div class="dim"></div><div class="center toppanel">
      <div class="tophead"><h1>РЕКОРДЫ БУХТЫ</h1>${d ? `<span class="cnt">${d.total} ${plural(d.total, 'рыбак', 'рыбака', 'рыбаков')}</span>` : ''}</div>
      <div class="opt3"><button class="btn sm ${t.tab === 'anglers' ? 'pri' : 'ghost'}" data-a="toptab" data-id="anglers"><span>РЫБАКИ</span></button><button class="btn sm ${t.tab === 'records' ? 'pri' : 'ghost'}" data-a="toptab" data-id="records"><span>РЕКОРДЫ ПО ВИДАМ</span></button></div>
      ${body}
      <div class="hint savenote">${foot}</div>
      <button class="btn ${g.inWorld ? 'ghost' : 'pri'}" data-a="${g.inWorld ? 'back' : 'close'}"><span>НАЗАД</span></button></div>`;
  }
  /** Открытка с уловом (или с видом бухты): картинка и что с ней сделать. */
  renderCard() {
    const k = this.g.card;
    if (!k) return this.closePanel();
    const share = typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
    this.screen.innerHTML = `<div class="dim"></div><div class="center cardview">
      <h1>ОТКРЫТКА</h1>
      <img class="cardimg" src="${k.url}" alt="Открытка: ${esc(k.t.head)}${k.t.sub ? ', ' + esc(k.t.sub) : ''}">
      <div class="row2"><button class="btn pri" data-a="cardsave"><span>СКАЧАТЬ</span></button>${share ? '<button class="btn cy" data-a="cardshare"><span>ПОДЕЛИТЬСЯ</span></button>' : ''}<button class="btn ghost" data-a="close"><span>НАЗАД</span></button></div>
      <div class="hint">Отправьте друзьям — пусть завидуют.${this.g.fishing.state === 'landed' ? ' Рыба подождёт: решить, в садок её или отпустить, можно после.' : ''}</div></div>`;
  }
  /** Проверка компьютера: идёт замер — полоса, кончился — итог, который можно скопировать и прислать. */
  renderBench() {
    const r = this.g.lastBench;
    const run = this.benchRun;
    this.screen.innerHTML = `<div class="dim${run ? ' clear' : ''}"></div><div class="center bench">
      <h1>ПРОВЕРКА КОМПЬЮТЕРА</h1>
      ${run ? `<div class="hint">Смотрим четыре вида бухты: ${esc(run.name || '…')}</div><div class="bbar"><i style="transform:scaleX(${(run.k || 0).toFixed(2)})"></i></div>`
        : r ? `<div class="verdict">${esc(r.verdict)}</div><pre class="report">${esc(r.text)}</pre>
      <div class="hint">Если игра тормозит — скопируйте этот текст и пришлите: по нему видно, что именно мешает.</div>
      <button class="btn pri" data-a="benchcopy"><span>СКОПИРОВАТЬ</span></button>
      ${settings.quality === 'auto' ? '<button class="btn sm" data-a="recalib"><span>ПОДОБРАТЬ КАЧЕСТВО ЗАНОВО</span></button>' : ''}` : ''}
      ${run ? '' : '<button class="btn ghost sm" data-a="open" data-p="settings"><span>НАЗАД</span></button>'}</div>`;
  }
  async runBench(recalib = false) {
    if (this.benchRun) return;
    this.benchRun = { k: 0, name: '' };
    this.openPanel('bench');
    if (recalib) {
      this.benchRun.name = 'подбираем качество';
      this.renderBench();
      await this.g.recalibrate();
    }
    await this.g.bench((k, name) => {
      this.benchRun = { k, name };
      if (this.panel === 'bench') this.renderBench();
    });
    this.benchRun = null;
    if (this.panel === 'bench') this.renderBench();
  }
  /** Окошко со счётчиком кадров (F3): html — что показать, null — убрать. */
  perfBox(html) {
    let el = $('#perfBox');
    if (html == null) return el && el.remove();
    if (!el) {
      el = document.createElement('div');
      el.id = 'perfBox';
      document.body.appendChild(el);
    }
    el.innerHTML = html;
  }
  renderPause() {
    const g = this.g;
    this.screen.innerHTML = `<div class="dim"></div><div class="center">
      <h1>ПАУЗА</h1>
      <button class="btn pri" data-a="close"><span>ВЕРНУТЬСЯ К РЫБАЛКЕ</span></button>
      <button class="btn" data-a="open" data-p="tackle"><span>СНАСТИ</span></button>
      <div class="row2"><button class="btn" data-a="open" data-p="journal"><span>ЖУРНАЛ РЫБ</span></button>${g.offline ? '' : `<button class="btn" data-a="open" data-p="top"><span>${ic('crown')} РЕКОРДЫ</span></button>`}</div>
      <div class="row2"><button class="btn" data-a="open" data-p="quests"><span>${ic('list')} ЗАДАНИЯ ДНЯ</span></button><button class="btn" data-a="open" data-p="tour"><span>${ic('cup')} ТУРНИР</span></button></div>
      <button class="btn" data-a="open" data-p="editor"><span>ПЕРСОНАЖ</span></button>
      <button class="btn" data-a="open" data-p="help"><span>КАК ИГРАТЬ</span></button>
      <button class="btn" data-a="open" data-p="settings"><span>НАСТРОЙКИ</span></button>
      ${g.solo ? '' : `<button class="btn cy" data-a="copy"><span>${ic('link')} ССЫЛКА ДЛЯ ДРУЗЕЙ · ${esc(g.code)}</span></button>`}
      ${g.ride ? '<button class="btn" data-a="home"><span>СОЙТИ И ВЕРНУТЬСЯ В БУХТУ</span></button>' : g.ownBoat() ? (g.boat.active || g.boat.moor !== 0 ? '<button class="btn" data-a="home"><span>ВЕРНУТЬСЯ В БУХТУ ВМЕСТЕ С ЛОДКОЙ</span></button>' : '') : g.boat.rented ? '<button class="btn" data-a="home"><span>ВЕРНУТЬСЯ В БУХТУ · СДАТЬ ЛОДКУ</span></button>' : ''}
      <button class="btn ghost" data-a="tolobby"><span>${g.solo ? 'В ЛОББИ' : 'В ЛОББИ К КОМАНДЕ'}</span></button></div>`;
  }
  renderQuests() {
    const g = this.g;
    const p = g.profile;
    const lv = levelInfo(p.xp).lvl;
    const qs = p.quests;
    const cards = (qs ? qs.list : []).map((q) => {
      const r = questReward(q, lv);
      const k = q.done ? 1 : clamp(q.c / q.n, 0, 1);
      return `<div class="qcard ${q.done ? 'done' : ''}"><div class="qt"><span class="tier t${q.tier}">${TIER[q.tier] || ''}</span><b>${esc(questText(q))}</b>${q.done ? ic('check') : ''}</div>
        <div class="pbar"><i style="width:${Math.round(k * 100)}%"></i></div>
        <div class="qr"><span>${esc(questCount(q)) || (q.done ? 'готово' : 'ещё не сделано')}</span><span class="rw">${coin(r.coins)}<i class="sep"></i>ОПЫТ +${r.xp}</span></div></div>`;
    }).join('');
    const all = qs && qs.list.every((q) => q.done);
    this.screen.innerHTML = `<div class="dim"></div><div class="center" style="width:min(41em,94vw)">
      <h1>ЗАДАНИЯ ДНЯ</h1>
      ${cards || '<p>Задания появятся, как только вы выйдете на рыбалку.</p>'}
      <p>${all ? 'Все три выполнены — премия получена. ' : `За все три — премия: <b class="y">${fmtCoins(Math.round((QUEST_BONUS * Math.min(6, 1 + 0.15 * (lv - 1))) / 5) * 5)} монет</b>. `}Задания у всех рыбаков в этот день одинаковые — их удобно делать вместе. Новые появятся в полночь.</p>
      <button class="btn pri" data-a="close"><span>ПОНЯТНО</span></button></div>`;
  }
  renderTour() {
    const g = this.g;
    const t = g.tour;
    const sel = (this.tr = this.tr || { kind: 'big', len: 300 });
    const res = g.lastTour;
    const unit = (kind) => (kind === 'count' ? '' : ' кг');
    const n1 = (v) => String(v).replace('.', ',');
    const rowsOf = (kind, table, me) => table.map((r) => `<div class="tr ${r.id === me ? 'me' : ''}"><i>${r.place || '—'}</i><span>${esc(r.name)}${r.id === me ? ' (вы)' : ''}</span><b>${r.place ? tourScoreText(kind, r.s) : 'без улова'}</b></div>`).join('');
    let body = '';
    if (res && (this.popts.result || !t)) {
      body += `<div class="tres"><h2>${res.solo ? 'ИТОГИ ЗАПЛЫВА' : 'ИТОГИ ТУРНИРА'} · ${TOURS[res.kind].name}</h2>
        ${rowsOf(res.kind, res.table, res.me) || '<p>Никто ничего не поймал.</p>'}
        ${res.place ? `<div class="tprize">${res.solo ? (res.medal ? `МЕДАЛЬ: ${MEDALS[res.medal].toUpperCase()}` : 'БЕЗ МЕДАЛИ') : `ВАШЕ МЕСТО: ${res.place}`}${res.prize ? `<i class="sep"></i>ПРИЗ ${coin(res.prize)}` : ''}</div>` : ''}</div>`;
    }
    if (t) {
      const now = g.tourNow();
      const table = tourTable(t.kind, [...t.scores.values()]);
      const mine = t.solo || t.by === g.me.id;
      body += `<h3>${now < t.start ? 'СТАРТ ЧЕРЕЗ НЕСКОЛЬКО СЕКУНД' : `ИДЁТ · ОСТАЛОСЬ ${mmss(Math.ceil((t.end - now) / 1000))}`}</h3>
        <p><b>${TOURS[t.kind].name}.</b> ${TOURS[t.kind].hint}.</p>
        ${rowsOf(t.kind, table, g.me.id) || '<p>Пока никто ничего не поймал.</p>'}
        ${mine ? '<button class="btn" data-a="tstop"><span>ЗАВЕРШИТЬ ДОСРОЧНО</span></button>' : ''}`;
    } else if (!this.popts.result) {
      const host = g.solo || g.me.id === g.hostId;
      const hostName = host ? '' : (g.players.get(g.hostId) || { card: { name: 'хозяин комнаты' } }).card.name;
      const tg = tourTargets(sel.kind, sel.len, g.fishing.kit);
      const n = Math.max(2, g.roster().length);
      body += `<p>${g.solo ? 'Заплыв на время: наловите на медаль, пока идут часы. Пороги зависят от вашей снасти.' : 'Соревнование для всей комнаты: кто больше наловит за отведённое время. Очки считаются сами, по улову.'}</p>
        <h3>ВО ЧТО ИГРАЕМ</h3>
        <div class="opt3">${Object.keys(TOURS).map((k) => `<button class="btn sm ${k === sel.kind ? 'pri' : 'ghost'}" data-a="tkind" data-id="${k}"><span>${TOURS[k].name}</span></button>`).join('')}</div>
        <p>${TOURS[sel.kind].hint}. Хлам не считается.</p>
        <h3>СКОЛЬКО ВРЕМЕНИ</h3>
        <div class="opt3">${TOUR_LENS.map((l) => `<button class="btn sm ${l === sel.len ? 'pri' : 'ghost'}" data-a="tlen" data-id="${l}"><span>${l / 60} МИН</span></button>`).join('')}</div>
        <p>${g.solo ? `Медали: бронза — ${n1(tg[0])}${unit(sel.kind)}, серебро — ${n1(tg[1])}${unit(sel.kind)}, золото — ${n1(tg[2])}${unit(sel.kind)}. Призы: ${[1, 2, 3].map((m) => medalPrize(m, sel.len)).join(', ')} монет.` : `Призы на ${n} рыбаков: первое место — ${tourPrize(1, n, sel.len)} монет, второе — ${tourPrize(2, n, sel.len)}${n > 2 ? `, третье — ${tourPrize(3, n, sel.len)}` : ''}. Остальным, кто что-то поймал, — по 10.`}</p>
        ${g.state !== 'world' ? '<p class="y">Турнир запускается на рыбалке: начните её и откройте это меню клавишей T.</p>' : host ? `<button class="btn pri" data-a="tstart"><span>${ic('cup')} ${g.solo ? 'НАЧАТЬ ЗАПЛЫВ' : 'ОБЪЯВИТЬ ТУРНИР'}</span></button>` : `<p class="y">Турнир запускает хозяин комнаты — ${esc(hostName)}.</p>`}`;
    }
    this.screen.innerHTML = `<div class="dim"></div><div class="center tourp" style="width:min(43em,94vw)">
      <h1>${g.solo ? 'ЗАПЛЫВ НА ВРЕМЯ' : 'ТУРНИР'}</h1>${body}
      <button class="btn ${t || this.popts.result ? 'pri' : 'ghost'}" data-a="close"><span>${t ? 'К РЫБАЛКЕ' : this.popts.result ? 'ПОНЯТНО' : 'НАЗАД'}</span></button></div>`;
  }
  renderHelp() {
    const k = (s, c = '') => `<kbd class="${c}">${s}</kbd>`;
    if (this.g.input.touch.on) {
      this.screen.innerHTML = `<div class="dim"></div><div class="center" style="width:min(44em,94vw)">
      <h1>КАК ИГРАТЬ</h1>
      <div class="help">
        <span>${k('ДЖОЙСТИК', 'g')}</span><span>Слева — ходить; отведите до упора — бег. Палец по экрану — смотреть по сторонам.</span>
        <span>${k('ЗАБРОС')}</span><span>Наведите прицел на воду, зажмите жёлтую кнопку — шкала силы растёт — и отпустите. Белая риска показывает, сколько силы нужно до метки.</span>
        <span>${k('ПОДСЕКАЙ')}</span><span>Поплавок нырнул и кнопка замигала — жмите сразу.</span>
        <span>${k('МОТАЙ')}</span><span><b>Вываживание:</b> держите кнопку — мотаете, отпускаете — леска слабеет. Стрелка натяжения должна быть в голубой зоне. Рыба рванула вбок — ведите джойстик в другую сторону. У каждой рыбы своя манера — подсказка под шкалой: прыгнула свечой — отпустите кнопку, залегла на дно — держите стрелку в рамке.</span>
        <span>${k('СМОТАТЬ', 'g')}</span><span>Вернуть снасть. После улова рядом появится «ОТПУСТИТЬ» — за это дают больше опыта.</span>
        <span>${k('РЫНОК')}</span><span>Кнопка появляется у лавки на берегу: продать улов, купить удочки, леску, наживку.</span>
        <span>${k('ЛОДКА')}</span><span>Подойдите к лодке у пирса — её дают напрокат. Джойстик вперёд — ход, в стороны — руль. Рыбачить можно прямо с борта: в открытом море, у затонувшего корабля, в лагуне Пальмового острова. К другу в лодку можно сесть пассажиром.</span>
        <span>${k('СНАСТИ', 'x')}</span><span>Панель внизу экрана: нажмите на наживку — сменить её, на удочку — открыть все снасти.</span>
        <span>${k('☰', 'g')}</span><span>Меню: журнал рыб, задания дня, турнир, персонаж, настройки. Плашка «ГОЛОС» справа сверху включает и выключает микрофон.</span>
        <span>${k('ОТКРЫТКА', 'g')}</span><span>Появляется с уловом в руках: кадр с подписью, который можно сохранить и отправить друзьям.</span>
        <span>${k('ПОДСАК')}</span><span>Друг рядом вываживает рыбу — подойдите: когда она пройдёт 70 % пути, кнопка даст взять её подсаком. Рыбаку — улов, вам — четверть опыта.</span>
      </div>
      <p>Чем лучше удочка — тем дальше заброс: до рифа, водопада и арки стартовой не достать. Тёмные тени под водой — косяки, там клюёт чаще и крупнее.</p>
      ${this.g.offline ? '' : '<p>Прогресс сохраняется сам — в этом браузере и на сервере игры. Чтобы открыть его на другом устройстве, возьмите код в «Настройках → Сохранение и перенос».</p>'}
      <button class="btn pri" data-a="${this.popts && this.popts.first ? 'close' : 'back'}"><span>ПОНЯТНО</span></button></div>`;
      return;
    }
    this.screen.innerHTML = `<div class="dim"></div><div class="center" style="width:min(44em,94vw)">
      <h1>КАК ИГРАТЬ</h1>
      <div class="help">
        <span>${k('W')}${k('A')}${k('S')}${k('D')}</span><span>Ходить. ${k('SHIFT', 'g')} — бег, ${k('ПРОБЕЛ', 'g')} — прыжок, ${k('X', 'g')} — сесть (на краю причала ноги свесятся).</span>
        <span>${k('ЛКМ')}</span><span><b>Заброс:</b> наведите прицел на воду, зажмите кнопку — шкала силы растёт — и отпустите. Белая риска на шкале показывает, сколько силы нужно до метки.</span>
        <span>${k('ЛКМ')}</span><span><b>Подсечка:</b> поплавок нырнул и появилось «КЛЮЁТ!» — жмите сразу.</span>
        <span>${k('ЛКМ')}${k('A', 'g')}${k('D', 'g')}</span><span><b>Вываживание:</b> держите кнопку — мотаете, отпускаете — леска слабеет. Стрелка натяжения должна быть в голубой зоне. В красной леска рвётся, в жёлтой рыба сходит. Рванула вбок — ведите удочку в другую сторону. У каждой рыбы своя манера — подсказка под шкалой: прыгнула свечой — отпустите кнопку, залегла на дно — держите стрелку в рамке.</span>
        <span>${k('ПКМ', 'x')} / ${k('R', 'b')}</span><span>Смотать леску. После улова ${k('R', 'b')} — отпустить рыбу (за это дают больше опыта).</span>
        <span>${k('E')}</span><span>Говорить с торговцем у лавки «Рынок»: продать улов, купить удочки, леску, наживку.</span>
        <span>${k('E')}</span><span><b>Лодка:</b> подойдите к лодке у пирса — её дают напрокат (а в лавке, в «Прочем», продаётся своя). ${k('W', 'g')}${k('S', 'g')} — ход, ${k('A', 'g')}${k('D', 'g')} — руль. Рыбачить можно прямо с борта: в открытом море, у затонувшего корабля, в лагуне Пальмового острова. Причалить можно у маяка и на острове. В лодку друга тоже можно сесть — в ней два места для пассажиров.</span>
        <span>${k('TAB', 'x')} ${k('Q', 'x')}</span><span>Снасти и набор. ${k('Q', 'x')} — быстро сменить наживку.</span>
        <span>${k('J', 'g')} ${k('C', 'g')} ${k('K', 'g')} ${k('T', 'g')}</span><span>Журнал рыб, выбор героя, задания дня (за них дают монеты и опыт) и турнир — в одиночку это заплыв на медаль.</span>
        <span>${k('M', 'g')} ${k('V', 'g')} ${k('ENTER', 'g')}</span><span>Микрофон вкл/выкл, говорить по кнопке, написать в чат.</span>
        <span>${k('1', 'g')}${k('2', 'g')}${k('3', 'g')}${k('4', 'g')}</span><span>Жесты: привет, класс, ура, танец.</span>
        <span>${k('P', 'g')}</span><span><b>Открытка:</b> кадр с подписью — с уловом в руках на ней будут вид, вес и ваше имя. Её можно скачать и отправить друзьям.</span>
        <span>${k('E')}</span><span><b>Вдвоём:</b> друг рядом вываживает рыбу — подойдите: когда она пройдёт 70 % пути, её можно взять подсаком. Рыбаку — улов, вам — четверть опыта.</span>
      </div>
      <p>Чем лучше удочка — тем дальше заброс: до рифа, водопада и арки стартовой не достать. Тёмные тени под водой — косяки, там клюёт чаще и крупнее. В непогоду, особенно в дождь, рыба берёт охотнее.</p>
      ${this.g.offline ? '' : '<p>Прогресс сохраняется сам — в этом браузере и на сервере игры. Чтобы открыть его на другом устройстве, возьмите код в «Настройках → Сохранение и перенос».</p>'}
      <button class="btn pri" data-a="${this.popts && this.popts.first ? 'close' : 'back'}"><span>ПОНЯТНО</span></button></div>`;
  }

  // ───── обработка нажатий ─────
  onClick(e) {
    const t = e.target.closest('[data-a]');
    if (!t) return;
    const a = t.dataset.a;
    const id = t.dataset.id;
    const g = this.g;
    g.audio.ui();
    switch (a) {
      case 'create': case 'join': case 'joincode': case 'solo': {
        const name = ($('#nm').value || '').trim();
        const code = (($('#code') || {}).value || '').trim().toUpperCase();
        if (!name) {
          $('#terr').textContent = 'Сначала представьтесь — друзья увидят это имя';
          $('#nm').focus();
          return;
        }
        if (a === 'joincode' && code.length !== 4) {
          $('#terr').textContent = 'В коде комнаты четыре символа';
          $('#code').focus();
          return;
        }
        g.setName(name);
        if (a === 'solo') g.startSolo();
        else if (a === 'create') g.createRoom();
        else g.joinRoom(a === 'join' ? g.urlCode : code);
        return;
      }
      case 'help': return this.openPanel('help');
      case 'settings': return this.openPanel('settings');
      case 'open': return this.openPanel(t.dataset.p);
      case 'close': return this.closePanel();
      case 'back': return g.inWorld ? this.openPanel('pause') : this.closePanel();
      case 'lobby': return;
      case 'start': return g.enterWorld();
      case 'leave': return g.leaveRoom();
      case 'tolobby': return g.toLobby();
      case 'home': return g.goHome();
      case 'voice': return g.toggleVoice();
      case 'copy': return g.copyLink();
      case 'cat':
        this.tk.cat = id;
        this.tk.sel = null;
        return this.renderTackle();
      case 'pick':
        if (this.tk.sel === id) return this.doAction();
        this.tk.sel = id;
        return this.renderTackle();
      case 'buy': return g.buy(id);
      case 'equip': return g.equip(id);
      case 'sell1': return g.sell(Number(id));
      case 'sellall': return g.sell(null);
      case 'jpick':
        this.js = id;
        return this.renderJournal();
      case 'tkind':
        this.tr.kind = id;
        return this.renderTour();
      case 'tlen':
        this.tr.len = Number(id);
        return this.renderTour();
      case 'tstart': return g.startTour(this.tr.kind, this.tr.len);
      case 'tstop': return g.stopTour();
      case 'hero':
        this.ed.look = { hero: id };
        g.editLook(this.ed.look);
        return this.renderEditor();
      case 'edsave':
        g.saveLook({ hero: this.ed.look.hero });
        return this.closePanel();
      case 'edcancel': return this.closePanel();
      case 'install': {
        const pr = g.installPrompt;
        if (!pr) return;
        g.installPrompt = null;
        pr.prompt();
        return this.renderSettings();
      }
      case 'bench': return this.runBench();
      case 'recalib': return this.runBench(true);
      case 'benchcopy': {
        const r = g.lastBench;
        if (!r) return;
        const done = () => this.toast('Отчёт скопирован — вставьте его в сообщение', 'good', 2600);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(r.text).then(done, () => this.toast('Не вышло скопировать — выделите текст мышью', '', 3000));
        else this.toast('Выделите текст мышью и скопируйте', '', 3000);
        return;
      }
      case 'tog':
        settings[id] = !settings[id];
        saveSettings();
        g.applySettings();
        return this.renderSettings();
      case 'cardsave': return g.saveCard();
      case 'cardshare': return g.shareCard();
      case 'toptab':
        this.top.tab = id;
        return this.renderTop();
      case 'cloudshow':
        this.codeShown = !this.codeShown;
        return this.renderSave();
      case 'cloudcopy': {
        const text = showCode(g.cloud.code);
        const done = () => this.toast('Код сохранения скопирован. Храните его там, где не потеряете', 'good', 3600);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => ((this.codeShown = true), this.renderSave(), this.toast('Не вышло скопировать — перепишите код с экрана', '', 3600)));
        else {
          this.codeShown = true;
          this.renderSave();
          this.toast('Перепишите код с экрана', '', 3000);
        }
        return;
      }
      case 'cloudlink': {
        if (t.dataset.sure) return g.cloudAdopt();
        const inp = this.screen.querySelector('#cloudcode');
        return g.cloudLookup(inp ? inp.value : '');
      }
      case 'cloudserver':
        return g.cloud.keepServer().then((ok) => ok || this.toast('Сервер не отвечает — попробуйте чуть позже', 'bad', 4000));
      case 'cloudmine':
        return g.cloud.keepMine().then((ok) => this.toast(ok ? 'На сервере теперь сохранение с этого устройства' : 'Сервер не отвечает — попробуйте чуть позже', ok ? 'good' : 'bad', 4000));
      case 'cloudlisted':
        if (!g.cloud.s.on) return;
        return g.cloud.setListed(!g.cloud.s.listed);
      case 'cloudtog':
        if (!g.cloud.s.on) return g.cloud.setOn(true);
        if (!t.dataset.sure && g.cloud.s.rev > 0) {
          // выключение стирает сохранение с сервера — спрашиваем
          t.dataset.sure = '1';
          const n = this.screen.querySelector('#cloudNote');
          if (n) {
            n.classList.add('warn');
            n.textContent = 'Выключить и стереть сохранение с сервера? Нажмите переключатель ещё раз';
          }
          return;
        }
        return g.cloud.setOn(false).then((ok) => ok || this.toast('Нет связи с сервером — стереть сохранение не получилось, попробуйте позже', 'bad', 5000));
      case 'savefile': return g.saveToFile();
      case 'loadfile':
        if (t.dataset.sure) return g.applySave();
        return this.screen.querySelector('#savein').click();
      case 'reset':
        if (t.dataset.sure) return g.resetProgress();
        t.dataset.sure = '1';
        t.classList.add('red');
        t.innerHTML = '<span>ТОЧНО СТЕРЕТЬ? НАЖМИТЕ ЕЩЁ РАЗ</span>';
        return;
      default:
    }
  }
  onInput(e) {
    const t = e.target;
    if (t.dataset.set) {
      settings[t.dataset.set] = t.type === 'range' ? Number(t.value) : t.value;
      saveSettings();
      this.g.applySettings();
    }
  }
  /** Главное действие панели по клавише E / Enter. */
  doAction() {
    const g = this.g;
    if (this.panel === 'tackle' || this.panel === 'shop') {
      const it = ITEMS[this.tk.sel];
      const act = this.actionOf(it);
      if (act.a === 'buy' && !act.dis) g.buy(it.id);
      else if (act.a === 'equip' || act.also === 'equip') g.equip(it.id);
    } else if (this.panel === 'sell') g.sell(null);
    else if (this.panel === 'editor') {
      g.saveLook({ hero: this.ed.look.hero });
      this.closePanel();
    } else if (this.panel === 'card') g.saveCard();
    else if (this.panel === 'help' || this.panel === 'settings' || this.panel === 'quests' || this.panel === 'top') this.closePanel();
    else if (this.panel === 'save') this.openPanel('settings');
    else if (this.panel === 'tour') {
      if (!this.g.tour && !this.popts.result && this.g.state === 'world' && (this.g.solo || this.g.me.id === this.g.hostId)) this.g.startTour(this.tr.kind, this.tr.len);
      else this.closePanel();
    }
  }
  /** Перерисовать открытую панель после покупки, продажи и т. п. */
  /** Короткая цветная вспышка по экрану — редкий улов. */
  flash(color) {
    const d = document.createElement('div');
    d.className = 'flash';
    d.style.background = `radial-gradient(circle at 38% 56%, ${color}88, ${color}22 45%, transparent 72%)`;
    $('#ui').appendChild(d);
    setTimeout(() => d.remove(), 800);
  }
  rerender() {
    if (this.panel === 'tackle' || this.panel === 'shop') this.renderTackle();
    else if (this.panel === 'sell') this.renderSell();
    else if (this.panel === 'journal') this.renderJournal();
    else if (this.panel === 'editor') this.renderEditor();
    else if (this.panel === 'quests') this.renderQuests();
    else if (this.panel === 'tour') this.renderTour();
    else if (this.view === 'lobby' && !this.panel) this.showLobby();
  }
}
