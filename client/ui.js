// Интерфейс: HUD как на макетах, лобби, снасти и магазин, рынок, журнал, редактор персонажа, настройки.
import { CATS, ITEMS, FISH, FISH_BY_ID, JUNK_BY_ID, RARITY, ZONES, DAY_PARTS, RODS, MAX_PLAYERS, fmtW, fmtCoins, fmtClock, dayPart, isLure } from '../shared/data.js';
import { kitStats, rodBars, owns, tackleCount, priceOf, fishValue, coolerValue, levelInfo, fightGrade, T_LOW, T_DANGER } from '../shared/logic.js';
import { itemIcon, fishIcon, faceIcon } from './icons.js';
import { heroes } from './hero.js';
import { OPTIONS, COLOR_KEYS, PRESETS, randomLook, fixLook } from './character.js';
import { MARKS, markSvg } from './proto.js';
import { MAP_VIEW, MARKET } from './terrain.js';
import { settings, saveSettings } from './profile.js';
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
  rod: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 21L20 4M20 4v9"/><circle cx="8" cy="16" r="2.4" fill="currentColor"/></svg>'
};
const ic = (n, cls = '') => `<span class="ic ${cls}">${SVG[n] || ''}</span>`;
const coin = (n) => `${ic('coin')}${fmtCoins(n)}`;
const PART_ICON = { dawn: 'sun', day: 'sun', dusk: 'sun', night: 'moon' };

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
      release: pad ? ['B', 'b'] : ['R', 'b'], esc: pad ? ['B', 'b'] : ['ESC', 'b'], left: pad ? ['LS', 'g'] : ['A', 'g'], right: pad ? ['LS', 'g'] : ['D', 'g']
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
    $('#bagN').classList.toggle('y', p.cooler.length < kit.bagCap);
    $('#bagN').style.color = p.cooler.length >= kit.bagCap ? '#f04438' : '';
    const rod = ITEMS[p.equip.rod] || RODS[0];
    $('#rodName').textContent = rod.name;
    $('#rodIcon').src = itemIcon(rod.id);
    const tk = p.equip.tackle;
    const n = tackleCount(p, tk);
    $('#hotbar').innerHTML = `<div class="slot sel" data-k="rod"><img src="${itemIcon(rod.id)}" alt=""></div>
      <div class="slot" data-k="bait"><img src="${itemIcon(tk)}" alt=""><b>${n === Infinity ? '∞' : n}</b><kbd class="x">Q</kbd></div>
      <div class="slot" data-k="float"><img src="${itemIcon(isLure(tk) ? tk : p.equip.float)}" alt=""></div>`;
  }
  setCrew(list) {
    const key = JSON.stringify(list.map((p) => [p.id, p.name, p.slot, p.look, p.voice, p.muted, p.mode]));
    if (key !== this.crewKey) {
      this.crewKey = key;
      $('#crew').innerHTML = list.filter((p) => !p.me).map((p) => `<div class="crow" data-id="${p.id}"><div class="ava" style="border-color:${MARKS[p.slot % 8].color}"><img src="${faceIcon(p.look)}" alt=""></div><b>${esc(p.name)}</b>${p.mode === 'lobby' ? '<span class="st">в лобби</span>' : ''}${ic(p.voice && !p.muted ? 'mic' : 'micoff', p.voice && !p.muted ? 'mic' : 'off')}${markSvg(p.slot, 20)}</div>`).join('');
      $('#onlineN').textContent = this.g.solo ? 'ОДИНОЧНАЯ РЫБАЛКА' : `${list.length} / ${MAX_PLAYERS} В СЕТИ`;
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
    p.innerHTML = html ? `<div class="chip">${html}</div>` : '';
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
    if (!f) return;
    $('#tptr').style.left = clamp(f.T, 0, 1) * 100 + '%';
    $('#pfill').style.width = f.p * 100 + '%';
    $('#ppct').textContent = Math.round(f.p * 100) + '%';
    const st = $('#fstate');
    const run = f.phase === 'run';
    let txt = 'РОВНО';
    let cls = '';
    if (f.T > T_DANGER) {
      txt = 'ОПАСНО!';
      cls = 'bad';
    } else if (f.T < T_LOW) {
      txt = 'СЛАБИНА!';
      cls = 'warn';
    } else if (run) {
      txt = 'РЫВОК!';
      cls = 'warn';
    } else if (f.warned) {
      txt = 'ГОТОВИТСЯ…';
      cls = 'warn';
    }
    if (st.textContent !== txt) st.textContent = txt;
    st.className = cls;
    $('.fpanel').classList.toggle('shake', f.T > T_DANGER);
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
    const lbl = m.ok ? (m.hot ? 'КОСЯК РЫБЫ!' : m.clamped ? 'ДАЛЬШЕ НЕ ДОБРОСИТЬ' : 'ЗАБРОС СЮДА') : 'ТУТ НЕ ВОДА';
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
    const part = dayPart(h);
    if (part !== this.lastPart) {
      this.lastPart = part;
      $('#clockIc').innerHTML = SVG[PART_ICON[part]];
    }
  }
  compass(yaw) {
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
      g.font = lab ? 'italic 900 40px "Sofia X", sans-serif' : 'italic 800 21px "Sofia X", sans-serif';
      g.fillText(lab || String(d), x, lab ? 62 : 56);
    }
    g.globalAlpha = 1;
    g.fillStyle = '#22d3ee';
    g.beginPath();
    g.moveTo(W / 2 - 11, 2);
    g.lineTo(W / 2 + 11, 2);
    g.lineTo(W / 2, 17);
    g.fill();
  }
  minimap(me, others, schools) {
    const g = this.map;
    if (!this.mapBase) return;
    g.drawImage(this.mapBase, 0, 0);
    const X = (x) => ((x - MAP_VIEW.x0) / (MAP_VIEW.x1 - MAP_VIEW.x0)) * 256;
    const Z = (z) => ((z - MAP_VIEW.z0) / (MAP_VIEW.z1 - MAP_VIEW.z0)) * 256;
    if (schools) {
      g.fillStyle = 'rgba(8,40,70,.75)';
      for (const s of schools) {
        if (s.on < 0.5) continue;
        g.beginPath();
        g.ellipse(X(s.x), Z(s.z), 7, 4, 0, 0, 7);
        g.fill();
        g.beginPath();
        g.moveTo(X(s.x) + 6, Z(s.z));
        g.lineTo(X(s.x) + 12, Z(s.z) - 4);
        g.lineTo(X(s.x) + 12, Z(s.z) + 4);
        g.fill();
      }
    }
    g.fillStyle = '#ffd60a';
    g.strokeStyle = '#0a1a33';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(X(MARKET.x - 4), Z(MARKET.z), 5, 0, 7);
    g.fill();
    g.stroke();
    const shape = (x, y, m, r) => {
      g.fillStyle = m.color;
      g.strokeStyle = '#0a1a33';
      g.lineWidth = 2.5;
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
    for (const o of others) shape(X(o.x), Z(o.z), MARKS[o.slot % 8], 9);
    // я — белая стрелка по направлению взгляда
    g.save();
    g.translate(X(me.x), Z(me.z));
    g.rotate(-me.yaw);
    g.fillStyle = '#fff';
    g.strokeStyle = '#0a1a33';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, -12);
    g.lineTo(9, 10);
    g.lineTo(0, 5);
    g.lineTo(-9, 10);
    g.closePath();
    g.stroke();
    g.fill();
    g.restore();
  }
  /** Таблички над головами друзей: [{id, x, y, name, slot, talk, say, vis}] */
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
        e.innerHTML = `${t.say ? `<div class="say">${t.say}</div>` : ''}<div class="nm">${markSvg(t.slot, 16)}${esc(t.name)}</div>`;
      }
      e.style.display = t.vis ? '' : 'none';
      e.style.transform = `translate(${t.x.toFixed(1)}px,${t.y.toFixed(1)}px) translate(-50%,-100%) scale(${t.scale.toFixed(2)})`;
      e.classList.toggle('talk', !!t.talk);
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
      <div class="tfoot">${this.g.offline ? 'Прогресс хранится в этом браузере' : 'Голосовой чат включается в комнате · прогресс хранится в этом браузере'}<br><a data-a="help">Как играть</a> · <a data-a="settings">Настройки</a></div>
    </div>`;
    setTimeout(() => {
      const n = $('#nm');
      if (n && !n.value) n.focus();
    }, 50);
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
      <div class="nav"><button class="tab on" data-a="lobby">ИГРА</button><button class="tab" data-a="open" data-p="tackle">СНАСТИ</button><button class="tab" data-a="open" data-p="editor">ПЕРСОНАЖ</button><button class="tab" data-a="open" data-p="journal">ЖУРНАЛ</button></div>
      <div class="lcard">
        <h2>${ic('pin')}СОЛНЕЧНАЯ БУХТА</h2>
        <div class="mode">СВОБОДНАЯ РЫБАЛКА</div>
        <img class="shot" src="${g.shot || ''}" alt="">
        <div class="ready">${ic('users')}${n} ${word(n)}</div>
        <button class="btn pri big" data-a="start"><kbd class="g">↵</kbd><span>НАЧАТЬ РЫБАЛКУ</span></button>
        ${g.solo ? '' : `<div class="sub"><button class="btn ${v.on ? (v.muted ? 'ghost' : 'cy') : 'ghost'}" data-a="voice"><span>${ic(v.on && !v.muted ? 'mic' : 'micoff')} ${v.joining ? 'ПОДКЛЮЧАЮ…' : v.on ? (v.muted ? 'МИКРОФОН ВЫКЛ' : 'ГОЛОС ВКЛЮЧЁН') : 'ВКЛЮЧИТЬ ГОЛОС'}</span></button></div>
        <div class="hint">${v.on ? 'Друзья вас слышат. Клавиша M — выключить и включить микрофон.' : 'Нажмите «Включить голос» и разрешите микрофон — будете слышать друг друга прямо в игре.'}</div>`}
      </div>
      <div class="lob-bl"><button class="btn sm ghost" data-a="leave"><kbd class="b">ESC</kbd><span>${g.solo ? 'В МЕНЮ' : 'ВЫЙТИ ИЗ КОМНАТЫ'}</span></button></div>`;
  }

  openPanel(name, opts = {}) {
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
    this.g.onPanel(name);
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
      <div class="jstats"><div><b>${lv.lvl}</b>уровень · ${esc(lv.title)}</div><div><b>${got}/${FISH.length}</b>видов открыто</div><div><b>${s.caught}</b>поймано</div><div><b>${fmtCoins(s.earned)}</b>заработано</div><div><b>${s.best ? fmtW(s.best.w) : '—'}</b>${s.best ? esc(FISH_BY_ID[s.best.sp].name) + ' — рекорд' : 'самый тяжёлый улов'}</div><div><b>${s.snaps}</b>обрывов лески</div></div>
      <div class="grid" style="grid-template-columns:repeat(5,1fr)">${tiles}</div>
      <div class="detail" style="grid-row:3/4">
        <img class="big ${j ? '' : 'unk'}" src="${fishIcon(f.id)}" alt="" style="${j ? '' : 'filter:brightness(0) opacity(.5)'}">
        <div class="rarc" style="color:${RARITY[f.rar].color}">${RARITY[f.rar].name}</div>
        <h2 style="margin-top:-.1em">${j ? esc(f.name) : '???'}</h2>
        <p class="desc">${j ? esc(f.desc) : 'Эту рыбу вы ещё не ловили. Подсказки ниже помогут её найти.'}</p>
        <div class="kv" style="grid-column:1/-1"><span>Где</span><span>${zones}</span><span>На что</span><span>${baits || '—'}</span><span>Когда</span><span>${times}</span>
          <span>Вес</span><span>${fmtW(f.w[0])} – ${fmtW(f.w[1])}</span>${j ? `<span>Поймано</span><span>${j.n}</span><span>Рекорд</span><span class="y">${fmtW(j.best)}</span>` : ''}</div>
      </div>
      <div class="loadout"><span class="hd">ДО УРОВНЯ ${lv.lvl + 1}</span><div class="it" style="border:0;flex:1;max-width:30em"><div class="pbar" style="flex:1;height:1em"><i style="width:${Math.round((lv.cur / lv.need) * 100)}%;background:var(--ye)"></i></div>&nbsp;${lv.cur} / ${lv.need}</div>${this.footKeys('')}</div></div>`;
  }

  renderEditor(first) {
    const g = this.g;
    if (first) {
      this.ed = { look: { ...g.profile.look }, cat: 'body' };
      g.editLook(this.ed.look);
    }
    const E = this.ed;
    const L = E.look;
    const cats = [['presets', 'ОБРАЗЫ'], ['body', 'ТЕЛО'], ['face', 'ЛИЦО'], ['hair', 'ВОЛОСЫ'], ['head', 'ГОЛОВА'], ['top', 'ВЕРХ'], ['bottom', 'НИЗ'], ['shoes', 'ОБУВЬ'], ['hands', 'РУКИ'], ['back', 'СПИНА']];
    const GROUPS = {
      body: [['Телосложение', 'body'], ['Рост', 'height'], ['Кожа', 'skin']],
      face: [['Глаза', 'eyes'], ['Цвет глаз', 'eyeC'], ['Брови', 'brows'], ['Рот', 'mouth'], ['Нос', 'nose'], ['Щёки', 'cheeks']],
      hair: [['Причёска', 'hair'], ['Цвет волос', 'hairC'], ['Борода и усы', 'beard']],
      head: [['Головной убор', 'hat'], ['Цвет убора', 'hatC'], ['Очки', 'glasses']],
      top: [['Одежда', 'top'], ['Основной цвет', 'topC'], ['Второй цвет', 'topC2']],
      bottom: [['Одежда', 'bottom'], ['Цвет', 'botC']],
      shoes: [['Обувь', 'shoes'], ['Цвет', 'shoeC']],
      hands: [['Перчатки', 'gloves'], ['Цвет перчаток', 'gloveC']],
      back: [['За спиной', 'pack'], ['Цвет', 'packC']]
    };
    let body = '';
    if (E.cat === 'presets') {
      const hs = heroes.list;
      body = `${hs.length ? `<h3>Герои</h3><div class="hlist">${hs.map((h) => `<button class="${L.hero === h.id ? 'on' : ''}" data-a="hero" data-id="${h.id}"><img src="${faceIcon(fixLook({ hero: h.id }))}" alt=""><span>${esc(h.name)}</span></button>`).join('')}</div>` : ''}
        <h3>${hs.length ? 'Собрать своего из частей' : 'Готовые образы'}</h3><div class="olist">${PRESETS.map((p, i) => `<button data-a="preset" data-id="${i}">${esc(p.name)}</button>`).join('')}</div>
        <h3>Или доверьтесь случаю</h3><button class="btn cy sm" data-a="rnd" style="width:100%"><span>СЛУЧАЙНЫЙ РЫБАК</span></button>`;
    } else if (L.hero) {
      body = `<h3>Выбран готовый герой</h3><p class="ednote">Телосложение, лицо и одежда настраиваются у персонажа, собранного из частей. Герой — цельная модель.</p>
        <button class="btn cy sm" data-a="nohero" style="width:100%"><span>СОБРАТЬ СВОЕГО</span></button>`;
    } else {
      for (const [title, key] of GROUPS[E.cat]) {
        body += `<h3>${title}</h3>`;
        if (key === 'height') body += `<input type="range" min="0.88" max="1.12" step="0.01" value="${L.height}" data-k="height">`;
        else if (OPTIONS[key]) body += `<div class="olist">${OPTIONS[key].map((n, i) => `<button class="${L[key] === i ? 'on' : ''}" data-a="opt" data-k="${key}" data-id="${i}">${n}</button>`).join('')}</div>`;
        else body += `<div class="sw">${COLOR_KEYS[key].map((c) => `<button class="${L[key].toLowerCase() === c ? 'on' : ''}" style="background:${c}" data-a="col" data-k="${key}" data-id="${c}"></button>`).join('')}<label title="Свой цвет"><input type="color" value="${L[key]}" data-k="${key}"></label></div>`;
      }
    }
    this.screen.innerHTML = `<div class="editor">
      <div class="ptitle"><h1>ПЕРСОНАЖ</h1><span class="sp"></span><button class="btn sm cy" data-a="rnd"><span>СЛУЧАЙНО</span></button></div>
      <div class="cats">${cats.map(([k, n]) => `<button class="btn ${E.cat === k ? 'on' : ''}" data-a="ecat" data-id="${k}"><span>${n}</span></button>`).join('')}</div>
      <div class="edhint">${this.g.input.touch.on ? 'Ведите пальцем — персонаж повернётся' : 'Зажмите мышь и ведите — персонаж повернётся'}</div>
      <div class="opts">${body}</div>
      <div class="edfoot"><button class="btn ghost" data-a="edcancel"><kbd class="b">ESC</kbd><span>ОТМЕНА</span></button><span class="sp"></span><button class="btn pri big" data-a="edsave" style="height:2.2em"><span>ГОТОВО</span></button></div></div>`;
  }

  renderSettings() {
    const s = settings;
    const rng = (k, min, max, step) => `<input type="range" min="${min}" max="${max}" step="${step}" value="${s[k]}" data-set="${k}">`;
    const tog = (k) => `<span class="tog ${s[k] ? 'on' : ''} click" data-a="tog" data-id="${k}"></span>`;
    this.screen.innerHTML = `<div class="dim"></div><div class="center">
      <h1>НАСТРОЙКИ</h1>
      <div class="set">
        <span>Чувствительность мыши</span>${rng('sens', 0.3, 3, 0.05)}
        <span>Перевернуть мышь по вертикали</span>${tog('invertY')}
        <span>Угол обзора</span>${rng('fov', 50, 90, 1)}
        <span>Графика</span><select data-set="quality">${[['auto', 'Авто'], ['high', 'Высокая'], ['medium', 'Средняя'], ['low', 'Низкая']].map(([v, n]) => `<option value="${v}" ${s.quality === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <span>Общая громкость</span>${rng('master', 0, 1, 0.02)}
        <span>Море, чайки, ветер</span>${rng('amb', 0, 1, 0.02)}
        <span>Звуки рыбалки</span>${rng('sfx', 0, 1, 0.02)}
        <span>Громкость голосов друзей</span>${rng('voiceVol', 0, 1, 0.02)}
        <span>Говорить только с зажатой V</span>${tog('ptt')}
        <span>Голос тише с расстоянием</span>${tog('near')}
        <span>Подсказки клавиш внизу</span>${tog('hints')}
      </div>
      <button class="btn pri" data-a="close"><span>ГОТОВО</span></button>
      <button class="btn ghost sm" data-a="reset"><span>НАЧАТЬ ЗАНОВО — СТЕРЕТЬ ПРОГРЕСС</span></button></div>`;
  }
  renderPause() {
    const g = this.g;
    this.screen.innerHTML = `<div class="dim"></div><div class="center">
      <h1>ПАУЗА</h1>
      <button class="btn pri" data-a="close"><span>ВЕРНУТЬСЯ К РЫБАЛКЕ</span></button>
      <button class="btn" data-a="open" data-p="tackle"><span>СНАСТИ</span></button>
      <button class="btn" data-a="open" data-p="journal"><span>ЖУРНАЛ РЫБ</span></button>
      <button class="btn" data-a="open" data-p="editor"><span>ПЕРСОНАЖ</span></button>
      <button class="btn" data-a="open" data-p="help"><span>КАК ИГРАТЬ</span></button>
      <button class="btn" data-a="open" data-p="settings"><span>НАСТРОЙКИ</span></button>
      ${g.solo ? '' : `<button class="btn cy" data-a="copy"><span>${ic('link')} ССЫЛКА ДЛЯ ДРУЗЕЙ · ${esc(g.code)}</span></button>`}
      <button class="btn ghost" data-a="tolobby"><span>${g.solo ? 'В ЛОББИ' : 'В ЛОББИ К КОМАНДЕ'}</span></button></div>`;
  }
  renderHelp() {
    const k = (s, c = '') => `<kbd class="${c}">${s}</kbd>`;
    if (this.g.input.touch.on) {
      this.screen.innerHTML = `<div class="dim"></div><div class="center" style="width:min(44em,94vw)">
      <h1>КАК ИГРАТЬ</h1>
      <div class="help">
        <span>${k('ДЖОЙСТИК', 'g')}</span><span>Слева — ходить. Палец по экрану — смотреть по сторонам.</span>
        <span>${k('ЗАБРОС')}</span><span>Наведите прицел на воду, зажмите жёлтую кнопку — шкала силы растёт — и отпустите. Белая риска показывает, сколько силы нужно до метки.</span>
        <span>${k('ПОДСЕКАЙ')}</span><span>Поплавок нырнул и кнопка замигала — жмите сразу.</span>
        <span>${k('МОТАЙ')}</span><span><b>Вываживание:</b> держите кнопку — мотаете, отпускаете — леска слабеет. Стрелка натяжения должна быть в голубой зоне. Рыба рванула вбок — ведите джойстик в другую сторону.</span>
        <span>${k('СМОТАТЬ', 'g')}</span><span>Вернуть снасть. После улова рядом появится «ОТПУСТИТЬ» — за это дают больше опыта.</span>
        <span>${k('РЫНОК')}</span><span>Кнопка появляется у лавки на берегу: продать улов, купить удочки, леску, наживку.</span>
        <span>${k('СНАСТИ', 'x')}</span><span>Панель внизу экрана: нажмите на наживку — сменить её, на удочку — открыть все снасти.</span>
        <span>${k('☰', 'g')}</span><span>Меню: журнал рыб, персонаж, настройки. Плашка «ГОЛОС» справа сверху включает и выключает микрофон.</span>
      </div>
      <p>Чем лучше удочка — тем дальше заброс: до рифа, водопада и арки стартовой не достать. Тёмные тени под водой — косяки, там клюёт чаще и крупнее.</p>
      <button class="btn pri" data-a="${this.popts && this.popts.first ? 'close' : 'back'}"><span>ПОНЯТНО</span></button></div>`;
      return;
    }
    this.screen.innerHTML = `<div class="dim"></div><div class="center" style="width:min(44em,94vw)">
      <h1>КАК ИГРАТЬ</h1>
      <div class="help">
        <span>${k('W')}${k('A')}${k('S')}${k('D')}</span><span>Ходить. ${k('SHIFT', 'g')} — быстрее, ${k('ПРОБЕЛ', 'g')} — прыжок, ${k('X', 'g')} — сесть (на краю причала ноги свесятся).</span>
        <span>${k('ЛКМ')}</span><span><b>Заброс:</b> наведите прицел на воду, зажмите кнопку — шкала силы растёт — и отпустите. Белая риска на шкале показывает, сколько силы нужно до метки.</span>
        <span>${k('ЛКМ')}</span><span><b>Подсечка:</b> поплавок нырнул и появилось «КЛЮЁТ!» — жмите сразу.</span>
        <span>${k('ЛКМ')}${k('A', 'g')}${k('D', 'g')}</span><span><b>Вываживание:</b> держите кнопку — мотаете, отпускаете — леска слабеет. Стрелка натяжения должна быть в голубой зоне. В красной леска рвётся, в жёлтой рыба сходит. Рванула вбок — ведите удочку в другую сторону.</span>
        <span>${k('ПКМ', 'x')} / ${k('R', 'b')}</span><span>Смотать леску. После улова ${k('R', 'b')} — отпустить рыбу (за это дают больше опыта).</span>
        <span>${k('E')}</span><span>Говорить с торговцем у лавки «Рынок»: продать улов, купить удочки, леску, наживку.</span>
        <span>${k('TAB', 'x')} ${k('Q', 'x')}</span><span>Снасти и набор. ${k('Q', 'x')} — быстро сменить наживку.</span>
        <span>${k('J', 'g')} ${k('C', 'g')}</span><span>Журнал рыб и редактор персонажа.</span>
        <span>${k('M', 'g')} ${k('V', 'g')} ${k('ENTER', 'g')}</span><span>Микрофон вкл/выкл, говорить по кнопке, написать в чат.</span>
        <span>${k('1', 'g')}${k('2', 'g')}${k('3', 'g')}${k('4', 'g')}</span><span>Жесты: привет, класс, ура, танец.</span>
      </div>
      <p>Чем лучше удочка — тем дальше заброс: до рифа, водопада и арки стартовой не достать. Тёмные тени под водой — косяки, там клюёт чаще и крупнее.</p>
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
      case 'ecat':
        this.ed.cat = id;
        return this.renderEditor();
      case 'opt':
        this.ed.look[t.dataset.k] = Number(id);
        g.editLook(this.ed.look);
        return this.renderEditor();
      case 'col':
        this.ed.look[t.dataset.k] = id;
        g.editLook(this.ed.look);
        return this.renderEditor();
      case 'hero':
        this.ed.look = { ...this.ed.look, hero: id };
        g.editLook(this.ed.look);
        return this.renderEditor();
      case 'nohero':
        this.ed.look = { ...this.ed.look, hero: '' };
        g.editLook(this.ed.look);
        return this.renderEditor();
      case 'preset':
        this.ed.look = { ...PRESETS[Number(id)].look };
        g.editLook(this.ed.look);
        return this.renderEditor();
      case 'rnd':
        this.ed.look = randomLook();
        g.editLook(this.ed.look);
        return this.renderEditor();
      case 'edsave':
        g.saveLook(fixLook(this.ed.look));
        return this.closePanel();
      case 'edcancel': return this.closePanel();
      case 'tog':
        settings[id] = !settings[id];
        saveSettings();
        g.applySettings();
        return this.renderSettings();
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
    } else if (t.dataset.k && this.ed) {
      this.ed.look[t.dataset.k] = t.type === 'range' ? Number(t.value) : t.value;
      this.g.editLook(this.ed.look);
      if (t.type === 'color') for (const b of $$('.sw button.on', t.closest('.sw'))) b.classList.remove('on');
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
      g.saveLook(fixLook(this.ed.look));
      this.closePanel();
    } else if (this.panel === 'help' || this.panel === 'settings') this.closePanel();
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
    else if (this.view === 'lobby' && !this.panel) this.showLobby();
  }
}
