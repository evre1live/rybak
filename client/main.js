// РЫБАК — сборка игры: состояния (меню → лобби → рыбалка), главный цикл, связь всех частей.
import * as THREE from 'three';
import { Gfx } from './gfx.js';
import { World, drawMinimap } from './world.js';
import { Character, PRESETS, fixLook } from './character.js';
import { buildRod, itemModel } from './gear3d.js';
import { ViewModel } from './viewmodel.js';
import { Input, Player } from './player.js';
import { Fishing } from './fishing.js';
import { Fx } from './fx.js';
import { Remote } from './remote.js';
import { Net } from './net.js';
import { createVoice } from './voice.js';
import { Audio2 } from './audio.js';
import { UI } from './ui.js';
import { loadProfile, saveProfile, settings, session } from './profile.js';
import { S, FLAG } from './proto.js';
import { DECK_Y, MARKET, standY } from './terrain.js';
import { ITEMS, FISH_BY_ID, JUNK_BY_ID, RARITY, ZONES, BAITS, LURES, clockHours, dayPart, fmtW, fmtCoins, isLure } from '../shared/data.js';
import { marketState, hashStr, buy, equip, sell, kitStats, levelInfo, tackleCount, fishValue, newProfile } from '../shared/logic.js';
import { $, esc, clamp, damp, isTouch } from './util.js';

const SPAWNS = [[-2, 9], [0.6, 9.4], [-4, 8.2], [2.6, 8.6], [-1, 11], [1.6, 11.4], [-3.6, 11], [3.6, 10.4]];
const LINE_Z = 7;
const lineX = (slot) => -5.0 + slot * 1.32;
const v3 = new THREE.Vector3();
/** Адрес комнаты в строке браузера; во встроенной рамке это может быть запрещено — тогда просто молчим. */
function setUrl(u) {
  try {
    history.replaceState(null, '', u);
  } catch {
    /* адрес не меняем */
  }
}
const VENDOR = ['Свежая рыба — хорошая цена. Показывай улов!', 'Клюёт сегодня? У меня глаз намётан: вижу — клюёт.', 'Старика под аркой видел кто? Сорок лет ловят — не поймали.', 'Бери плетёнку, не пожалеешь. Карп стартовую леску рвёт как нитку.', 'На рассвете в заводи, говорят, золотой кои ходит.', 'Ночью угорь под сваями берёт на червя. Проверено.'];

class Game {
  constructor() {
    const q = new URLSearchParams(location.search);
    this.params = q;
    this.urlCode = (q.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    // пробная версия без сервера (например, страница-витрина): только одиночная рыбалка
    this.offline = !!window.RYBAK_OFFLINE;
    this.profile = loadProfile();
    this.canvas = $('#view');
    const touch = isTouch();
    document.body.classList.toggle('touch', touch);
    this.auto = settings.quality === 'auto';
    this.gfx = new Gfx(this.canvas, q.get('q') || (this.auto ? (touch ? 'medium' : 'high') : settings.quality));
    this.world = new World();
    this.scene = this.world.scene;
    this.camera = new THREE.PerspectiveCamera(settings.fov, 1, 0.07, 3400);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(this.camera);
    this.input = new Input(this.canvas);
    this.input.touch.on = touch;
    this.player = new Player(this.camera);
    this.vm = new ViewModel(this.camera);
    this.vm.setLook(this.profile.look);
    this.vm.setVisible(false);
    this.fx = new Fx(this.scene);
    this.audio = new Audio2();
    this.state = 'title';
    this.solo = false;
    this.code = '';
    this.seed = 'title';
    this.t0 = Date.now();
    this.players = new Map();
    this.me = { id: 0, slot: 0 };
    this.hostId = 0;
    this.sendT = 0;
    this.emote = null;
    this.emoteT = 0;
    this.editing = false;
    this.frameMs = 16;
    this.slowT = 0;
    this.fixedHour = q.has('h') ? Number(q.get('h')) : null;
    // для автопроверок: ускорение времени и игра без отрисовки
    this.timeScale = Number(q.get('ts')) || 1;
    this.noRender = q.has('norender');
    this.fishing = new Fishing({ scene: this.scene, camera: this.camera, vm: this.vm, fx: this.fx, schools: this.world.scenery.schools, profile: this.profile, hour: () => this.hours, emit: (t, d) => this.onFish(t, d) });
    this.fishing.makeJunk = (id) => itemModel(id);
    this.ui = new UI(this);
    this.ui.mapBase = drawMinimap(256);
    this.meChar = new Character(this.profile.look);
    this.meChar.setRod(buildRod(this.profile.equip.rod, this.profile.equip.reel, this.profile.equip.line, 1));
    this.meChar.group.visible = false;
    this.scene.add(this.meChar.group);
    // торговец за прилавком
    this.vendor = new Character(fixLook({ ...PRESETS[4].look, hat: 5, top: 4, topC: '#ef4444', topC2: '#f1efe6', beard: 5, hairC: '#f4ead0', body: 3 }));
    this.vendor.group.position.set(-8.35, DECK_Y, 12.9);
    this.vendor.group.rotation.y = Math.PI / 2;
    this.scene.add(this.vendor.group);
    this.net = new Net(this.netHandlers());
    this.net.getCard = () => this.card();
    this.voice = createVoice({
      send: (m) => this.net.send(m), sendBinary: (b) => this.net.sendBin(b), audioCtx: () => (this.audio.start(), this.audio.ctx),
      onChange: (k) => this.voiceChanged(k), onError: (m) => this.ui.toast(m, 'bad', 5000), getVolume: (vid) => this.voiceVolume(vid)
    });
    this.input.typing = () => this.ui.chatOpen || (document.activeElement && /INPUT|SELECT/.test(document.activeElement.tagName));
    this.input.onFree = () => this.ui.toast('Мышь захватить не удалось — смотрите движением мыши: у краёв экрана камера доворачивается', '', 6500);
    this.input.onLockChange = (locked) => {
      // Esc в игре — пауза. Но если захват мыши сорвался сразу после закрытия меню, паузу не навязываем
      if (!locked && this.state === 'world' && !this.ui.panel && !this.ui.chatOpen && !this.input.touch.on && performance.now() - this.input.lockedAt > 700) this.ui.openPanel('pause');
    };
    addEventListener('keydown', (e) => this.onKey(e));
    addEventListener('pointerdown', () => this.audio.start(), { passive: true });
    addEventListener('beforeunload', () => saveProfile(this.profile));
    this.bindEditorDrag();
    if (touch) this.bindTouch();
    this.applySettings();
    this.ui.refreshHud();
    this.ui.showTitle();
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
    setTimeout(() => $('#loading').classList.add('out'), 300);
    setTimeout(() => $('#loading').remove(), 1200);
  }

  // ───── время и рынок ─────
  nowSec() {
    return ((this.solo || !this.net.room ? Date.now() : this.net.now()) - this.t0) / 1000;
  }
  market() {
    const t = Math.max(0, this.nowSec());
    if (!this._m || this._m.period !== Math.floor(t / 600) || this._mseed !== this.seed) {
      this._m = marketState(this.seed, t);
      this._mseed = this.seed;
      this.world.scenery.setBoard(this._m.hot.map((id) => FISH_BY_ID[id].name));
      if (this._mAnnounced && this.state === 'world') this.ui.feed(`Рынок обновил цены. В цене: <b>${this._m.hot.map((id) => FISH_BY_ID[id].name).join(', ')}</b>`);
      this._mAnnounced = true;
    }
    this._m.nextIn = 600 - (t % 600);
    return this._m;
  }
  vendorLine() {
    return VENDOR[Math.floor(this.nowSec() / 40) % VENDOR.length];
  }

  // ───── комната ─────
  card() {
    const p = this.profile;
    return { name: p.name || 'Рыбак', look: p.look, rod: p.equip.rod, line: p.equip.line, fl: isLure(p.equip.tackle) ? p.equip.tackle : p.equip.float, lvl: levelInfo(p.xp).lvl };
  }
  sendCard() {
    if (!this.solo) this.net.send({ t: 'card', card: this.card() });
    this.meChar.setLook(this.profile.look);
    this.meChar.setRod(buildRod(this.profile.equip.rod, this.profile.equip.reel, this.profile.equip.line, 1));
  }
  setName(name) {
    this.profile.name = name.slice(0, 16);
    saveProfile(this.profile);
  }
  /** На телефоне с Android раскрываем игру на весь экран и кладём его на бок. Вызывать из обработчика нажатия. */
  goFullscreen() {
    if (!this.input.touch.on || document.fullscreenElement || !/Android/i.test(navigator.userAgent)) return;
    try {
      const el = document.documentElement;
      const p = el.requestFullscreen && el.requestFullscreen({ navigationUI: 'hide' });
      if (p && p.then) p.then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {});
    } catch {
      /* не дали — играем в окне */
    }
  }
  startSolo() {
    this.goFullscreen();
    this.audio.start();
    this.solo = true;
    this.code = '';
    this.seed = 'solo' + Math.floor(Math.random() * 1e9);
    this.t0 = Date.now();
    this.me = { id: 1, slot: 0 };
    this.hostId = 1;
    this.toLobbyState();
  }
  createRoom() {
    this.goFullscreen();
    this.audio.start();
    this.solo = false;
    this.net.create();
    this.ui.toast('Создаю комнату…');
  }
  joinRoom(code) {
    this.goFullscreen();
    this.audio.start();
    this.solo = false;
    const s = session.get();
    this.net.join(code, s && s.code === code ? s.token : undefined);
    this.ui.toast('Захожу в комнату…');
  }
  netHandlers() {
    return {
      joined: (m, back) => {
        this.code = m.code;
        this.seed = m.seed;
        this.t0 = m.t0;
        this.me = { id: m.id, slot: m.slot };
        this.hostId = m.host;
        for (const p of this.players.values()) p.remote.dispose();
        this.players.clear();
        for (const p of m.players) this.addPlayer(p);
        setUrl('?room=' + m.code);
        this.urlCode = m.code;
        if (back) {
          this.ui.toast('Связь вернулась', 'good');
          this.net.send({ t: 'mode', m: this.state === 'world' ? 'world' : 'lobby' });
          this.voice.reconnected();
        } else this.toLobbyState();
        this.rosterChanged();
      },
      in: (m) => {
        const had = this.players.has(m.p.id);
        this.addPlayer(m.p);
        if (!m.back && !had) {
          this.ui.feed(`<b>${esc(m.p.card.name)}</b> заходит в бухту`);
          this.audio.tone(660, 0.12, 'triangle', 0.1);
          this.audio.tone(880, 0.16, 'triangle', 0.1, null, 0.1);
        }
        this.rosterChanged();
      },
      out: (m) => {
        const p = this.players.get(m.id);
        if (!p) return;
        this.ui.feed(`<b>${esc(p.card.name)}</b> ${m.why === 'lost' ? 'потерял связь' : 'уходит домой'}`);
        p.remote.dispose();
        this.players.delete(m.id);
        this.rosterChanged();
      },
      card: (m) => {
        const p = this.players.get(m.id);
        if (!p) return;
        p.card = m.card;
        p.remote.setCard(m.card);
        this.rosterChanged();
      },
      mode: (m) => {
        const p = this.players.get(m.id);
        if (!p) return;
        p.mode = m.m;
        if (m.m === 'world' && this.state === 'world') this.ui.feed(`<b>${esc(p.card.name)}</b> берётся за удочку`);
        this.rosterChanged();
      },
      host: (m) => {
        this.hostId = m.id;
        this.rosterChanged();
      },
      sts: (m) => {
        const now = performance.now() / 1000;
        for (const [id, st] of m.a) {
          const p = this.players.get(id);
          if (p) {
            p.st = st;
            p.remote.push(st, now);
          }
        }
      },
      ev: (m) => this.onRemoteEvent(m),
      chat: (m) => {
        const mine = m.id === this.me.id;
        const p = this.players.get(m.id);
        const name = mine ? this.profile.name : p ? p.card.name : '?';
        this.ui.feed(`<b>${esc(name)}:</b> ${esc(m.text)}`, 'chat');
        if (p) p.remote.bubble(esc(m.text), 6);
        if (!mine) this.audio.tone(900, 0.06, 'sine', 0.08);
      },
      error: (m) => {
        if (m.req === 'vjoin') return this.voice.joinError(m.message);
        if (m.req === 'join' || m.req === 'create' || m.code === 'REPLACED' || m.code === 'NET') {
          // комнаты больше нет (сервер перезапускался) или связь не вернуть — в меню, прогресс цел
          const was = this.state !== 'title';
          this.voice.leave(true);
          for (const p of this.players.values()) p.remote.dispose();
          this.players.clear();
          this.backToTitle(was && m.code === 'NO_ROOM' ? 'Комната закрылась — создайте новую. Улов и снасти сохранены.' : m.message);
        } else this.ui.toast(m.message, 'bad', 4000);
      },
      down: () => this.ui.toast('Связь пропала — возвращаюсь…', 'bad', 4000),
      voice: (m) => this.voice.handle(m),
      bin: (b) => this.voice.handleBinary(b)
    };
  }
  addPlayer(p) {
    const old = this.players.get(p.id);
    if (old) old.remote.dispose();
    this.players.set(p.id, { id: p.id, slot: p.slot, card: p.card, mode: p.mode, st: p.st, remote: new Remote(this.scene, p) });
  }
  roster() {
    const v = this.voice.state;
    const voiceOf = (id) => v.roster.find((r) => r.pid === id);
    const list = [{ id: this.me.id, slot: this.me.slot, name: this.profile.name || 'Рыбак', look: this.profile.look, me: true, mode: this.state === 'world' ? 'world' : 'lobby', voice: v.joined, muted: v.muted, talk: v.selfSpeaking }];
    for (const p of this.players.values()) {
      const vr = voiceOf(p.id);
      list.push({ id: p.id, slot: p.slot, name: p.card.name, look: p.card.look, mode: p.mode, voice: !!vr, muted: vr ? vr.muted : true, talk: vr ? this.voice.isSpeaking(vr.vid) : false });
    }
    return list.sort((a, b) => a.slot - b.slot);
  }
  rosterChanged() {
    this.ui.setCrew(this.roster());
    if (this.ui.view === 'lobby' && !this.ui.panel) this.ui.showLobby();
  }
  voiceState() {
    const v = this.voice.state;
    return { on: v.joined, muted: v.muted, joining: v.joining };
  }
  voiceChanged(kind) {
    // кто-то заговорил или замолчал — только подсветка, без перерисовки экранов
    if (kind === 'speaking') return this.ui.setCrew(this.roster());
    const v = this.voice.state;
    const chip = $('#voiceChip');
    chip.classList.toggle('hidden', this.solo);
    chip.classList.toggle('off', !v.joined || v.muted);
    const mk = this.input.touch.on ? '' : ' · M';
    $('#voiceTxt').textContent = v.joining ? 'ПОДКЛЮЧАЮ…' : !v.joined ? 'ВКЛЮЧИТЬ ГОЛОС' : v.muted ? `МИКРОФОН ВЫКЛ${mk}` : `ГОЛОС ВКЛЮЧЁН${mk}`;
    $('#voiceChip .ic').innerHTML = (v.joined && !v.muted ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M3 3l18 18" stroke="#f04438" stroke-width="2.6" stroke-linecap="round"/></svg>');
    this.rosterChanged();
  }
  voiceVolume(vid) {
    let vol = settings.voiceVol;
    if (settings.near && this.state === 'world') {
      const pid = this.voice.pidOf(vid);
      const p = this.players.get(pid);
      if (p && p.mode === 'world' && p.st) vol *= clamp(1.25 - Math.hypot(p.st[S.X] - this.player.x, p.st[S.Z] - this.player.z) / 42, 0.1, 1);
    }
    return vol;
  }
  async toggleVoice() {
    if (this.solo) return;
    this.audio.start();
    const v = this.voice.state;
    if (v.joining) return;
    if (!v.joined) {
      const r = await this.voice.join();
      if (r.ok) {
        this.ui.toast('Голос включён — друзья вас слышат', 'good');
        if (settings.ptt) this.voice.setMuted(true);
      }
    } else {
      this.voice.setMuted(!v.muted);
      this.ui.toast(v.muted ? 'Микрофон выключен' : 'Микрофон включён', v.muted ? '' : 'good', 1400);
    }
  }
  copyLink() {
    const url = `${location.origin}/?room=${this.code}`;
    const done = () => this.ui.toast(`Ссылка скопирована: ${url}`, 'good', 3500);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => this.ui.toast(url, '', 8000));
    else this.ui.toast(url, '', 8000);
  }
  sendChat(text) {
    if (this.solo) return this.ui.feed(`<b>${esc(this.profile.name)}:</b> ${esc(text)}`, 'chat');
    this.net.send({ t: 'chat', text });
  }

  // ───── переходы ─────
  toLobbyState() {
    this.state = 'lobby';
    this.inWorld = false;
    this.fishing.reelIn(true);
    this.vm.setVisible(false);
    this.input.enabled = false;
    this.input.unlock();
    this.ui.hudShow(false);
    this.ui.catchCard(null);
    this.ui.alert(null);
    this.ui.banner(null);
    this.ui.hideScreen();
    this.ui.showLobby();
    this.voiceChanged();
    this.market();
    if (!this.solo) this.net.send({ t: 'mode', m: 'lobby' });
  }
  toLobby() {
    if (this.fishing.state === 'fight') return this.ui.toast('Сначала вытащите рыбу', 'bad');
    this.ui.panel = null;
    this.toLobbyState();
  }
  enterWorld() {
    this.audio.start();
    this.state = 'world';
    this.inWorld = true;
    const sp = SPAWNS[this.me.slot % SPAWNS.length];
    this.player.place(sp[0], sp[1], 0);
    this.player.eye = 1.62 * this.profile.look.height;
    this.ui.hideScreen();
    this.ui.setPlates([]);
    this.ui.hudShow(true);
    this.ui.refreshHud();
    this.meChar.group.visible = false;
    this.vm.setVisible(true);
    this.fishing.refreshGear();
    this.rosterChanged();
    if (!this.solo) this.net.send({ t: 'mode', m: 'world' });
    if (!this.profile.seenIntro) {
      this.profile.seenIntro = true;
      saveProfile(this.profile);
      this.ui.openPanel('help', { first: true });
    } else {
      this.input.enabled = true;
      this.input.lock();
    }
  }
  leaveRoom() {
    this.voice.leave(true);
    if (!this.solo) this.net.leave();
    for (const p of this.players.values()) p.remote.dispose();
    this.players.clear();
    this.solo = false;
    setUrl(location.pathname);
    this.urlCode = '';
    this.backToTitle('');
  }
  backToTitle(err) {
    this.state = 'title';
    this.inWorld = false;
    this.fishing.reelIn(true);
    this.vm.setVisible(false);
    this.meChar.group.visible = false;
    this.input.enabled = false;
    this.input.unlock();
    this.ui.hudShow(false);
    this.ui.setPlates([]);
    this.ui.panel = null;
    this.ui.showTitle(err);
  }
  onPanel(name, was) {
    if (name) {
      this.input.enabled = false;
      this.input.unlock();
      if (name === 'editor') this.startEdit();
      return;
    }
    if (was === 'editor') this.endEdit();
    if (this.state === 'world') {
      this.ui.hideScreen();
      this.input.enabled = true;
      this.input.lock();
    } else if (this.state === 'lobby') this.ui.showLobby();
    else this.ui.showTitle();
  }

  // ───── редактор персонажа ─────
  startEdit() {
    this.editing = true;
    this.editYaw = 0.35;
    if (this.state === 'world') {
      this.meChar.group.position.set(this.player.x, this.player.y, this.player.z);
      this.editBase = this.player.yaw;
    }
    this.vm.setVisible(false);
  }
  endEdit() {
    this.editing = false;
    this.meChar.setLook(this.profile.look);
    if (this.state === 'world') {
      this.meChar.group.visible = false;
      this.vm.setVisible(true);
    }
  }
  editLook(look) {
    this.meChar.setLook(look);
  }
  saveLook(look) {
    this.profile.look = look;
    saveProfile(this.profile);
    this.vm.setLook(look);
    this.player.eye = 1.62 * look.height;
    this.sendCard();
    this.rosterChanged();
    this.ui.toast('Образ сохранён', 'good');
  }
  bindEditorDrag() {
    let drag = null;
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.editing) drag = e.clientX;
    });
    addEventListener('pointermove', (e) => {
      if (drag == null || !this.editing) return;
      this.editYaw += (e.clientX - drag) * 0.012;
      drag = e.clientX;
    });
    addEventListener('pointerup', () => (drag = null));
    addEventListener('pointercancel', () => (drag = null));
  }

  // ───── покупки ─────
  buy(id) {
    const r = buy(this.profile, id);
    if (!r.ok) {
      this.audio.error();
      return this.ui.toast(r.error, 'bad');
    }
    this.audio.buy();
    this.ui.toast(`Куплено: ${ITEMS[id].name}`, 'good');
    if (!ITEMS[id].count && !this.solo) this.net.send({ t: 'ev', k: 'buy', d: { id } });
    this.afterGear();
  }
  equip(id) {
    const r = equip(this.profile, id);
    if (!r.ok) return this.ui.toast(r.error, 'bad');
    this.audio.tick();
    this.afterGear();
  }
  afterGear() {
    saveProfile(this.profile);
    if (this.fishing.state !== 'fight' && this.fishing.state !== 'landed') {
      this.fishing.reelIn(true);
      this.fishing.refreshGear();
    } else this.fishing.pendingGear = true;
    this.sendCard();
    this.ui.refreshHud();
    this.ui.rerender();
  }
  sell(index) {
    const m = this.market();
    const r = sell(this.profile, index, m);
    if (!r.ok) return this.ui.toast(r.error, 'bad');
    this.audio.coin(index == null ? 4 : 1);
    this.ui.toast(`+${fmtCoins(r.total)} монет`, 'gold');
    if (!this.solo && r.total >= 50) this.net.send({ t: 'ev', k: 'sold', d: { n: r.n, total: r.total } });
    saveProfile(this.profile);
    this.ui.refreshHud();
    this.ui.rerender();
  }
  cycleTackle() {
    const p = this.profile;
    const list = [...BAITS, ...LURES].map((i) => i.id).filter((id) => tackleCount(p, id) > 0);
    const i = list.indexOf(p.equip.tackle);
    const next = list[(i + 1) % list.length];
    if (next === p.equip.tackle) return this.ui.toast('Другой наживки нет — купите на рынке');
    this.equip(next);
    this.ui.toast(`На крючке: ${ITEMS[next].name}`, '', 1400);
  }
  resetProgress() {
    const name = this.profile.name;
    const look = this.profile.look;
    Object.assign(this.profile, newProfile(), { name, look, seenIntro: true });
    saveProfile(this.profile);
    this.fishing.reelIn(true);
    this.fishing.refreshGear();
    this.sendCard();
    this.ui.refreshHud();
    this.ui.closePanel();
    this.ui.toast('Начинаем с чистого листа', 'good');
  }
  applySettings() {
    this.camera.fov = settings.fov;
    this.camera.updateProjectionMatrix();
    this.audio.applyVolume();
    this.auto = settings.quality === 'auto';
    if (!this.auto && !this.params.get('q')) this.gfx.setQuality(settings.quality);
    this.ui.hintKey = '';
  }

  // ───── события рыбалки ─────
  ev(k, d) {
    if (!this.solo) this.net.send({ t: 'ev', k, d });
  }
  rumble(ms, strong) {
    const gp = navigator.getGamepads ? [...navigator.getGamepads()].find((g) => g && g.vibrationActuator) : null;
    if (gp) gp.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: strong * 0.6 }).catch(() => {});
    else if (navigator.vibrate && this.input.touch.on) navigator.vibrate(ms);
  }
  onFish(type, d) {
    const ui = this.ui;
    const a = this.audio;
    const p = this.profile;
    switch (type) {
      case 'toast': return ui.toast(d);
      case 'cast':
        a.cast();
        return this.ev('cast', { x: +d.x.toFixed(1), z: +d.z.toFixed(1) });
      case 'land':
        a.splash(0.5);
        if (d.short) ui.toast('Недолёт: держите кнопку дольше — до белой риски', '', 2200);
        else if (d.hot) ui.toast('Прямо в косяк!', 'good', 1600);
        return this.ev('land', { x: +d.x.toFixed(1), z: +d.z.toFixed(1) });
      case 'nibble': return a.nibble();
      case 'early':
        return ui.toast('Рано! Ждите, пока поплавок нырнёт', '', 1500);
      case 'bite':
        a.bite();
        this.rumble(250, 1);
        ui.alert('КЛЮЁТ!', `${ui.key('primary')} ПОДСЕКАЙ`);
        return this.ev('bite', { x: +this.fishing.bx.toFixed(1), z: +this.fishing.bz.toFixed(1) });
      case 'missed':
        ui.alert(null);
        a.fail();
        ui.toast(d.switched ? 'Сорвалась. Наживка кончилась — на крючке хлеб' : 'Не успели — рыба ушла с наживкой', 'bad', 2000);
        ui.refreshHud();
        return saveProfile(p);
      case 'bait':
        ui.refreshHud();
        if (d.switched) ui.toast('Это была последняя наживка — дальше на хлеб', '', 2600);
        return;
      case 'hook': {
        ui.alert(null);
        ui.banner('НА КРЮЧКЕ!');
        a.hook();
        this.rumble(120, 0.6);
        const c = this.fishing.catch;
        return this.ev('hook', { sp: c.sp, len: c.len });
      }
      case 'warn': return a.warn();
      case 'run':
        a.splash(0.6);
        return this.rumble(180, 0.8);
      case 'jump':
        a.splash(1);
        return this.ev('jump', { x: +d.x.toFixed(1), z: +d.z.toFixed(1) });
      case 'lost': {
        ui.banner(d.why === 'snap' ? 'ОБРЫВ!' : 'СОШЛА!', 'red', 1600);
        a.strain(-1);
        if (d.why === 'snap') a.snap();
        else a.fail();
        this.player.shake = 1;
        const f = FISH_BY_ID[d.sp];
        const big = f && d.w > 2 ? ` Похоже, это была ${f.rar >= 3 ? 'настоящая громадина' : 'крупная рыба'}.` : '';
        ui.toast(d.why === 'snap' ? `Леска лопнула: держали в красной зоне.${d.lostLure ? ' Приманка потеряна.' : ''}${big}` : `Рыба сошла: леска провисла.${big}`, 'bad', 3600);
        ui.refreshHud();
        saveProfile(p);
        return this.ev('lost', { why: d.why });
      }
      case 'caught': {
        const c = d.c;
        const f = FISH_BY_ID[c.sp];
        ui.banner(null);
        a.strain(-1);
        a.catch(f ? f.rar : 0);
        ui.catchCard(d);
        this.rumble(300, 0.5);
        return this.ev('catch', { sp: c.sp, w: c.w, len: c.len, trophy: c.trophy });
      }
      case 'kept': {
        ui.catchCard(null);
        const c = d.c;
        const f = FISH_BY_ID[c.sp];
        if (d.forced) ui.toast('Садок полон — рыбу пришлось отпустить. Продайте улов на рынке', 'bad', 3600);
        else if (d.released) ui.toast(`Отпущена. Опыт +${d.xp}`, 'good', 1800);
        else ui.toast(`В садок. Опыт +${d.xp}`, 'good', 1600);
        if (d.isNew && f) ui.toast(`Новый вид в журнале: ${f.name}`, 'gold', 3200);
        if (d.levelUp) {
          a.level();
          ui.toast(`Уровень ${d.levelUp} — ${levelInfo(p.xp).title}!`, 'gold', 4000);
          this.sendCard();
        }
        ui.refreshHud();
        return saveProfile(p);
      }
      case 'reelin': return a.reelTicks(5, 0.035);
      default:
    }
  }
  onRemoteEvent(m) {
    const p = this.players.get(m.id);
    if (!p) return;
    const d = m.d || {};
    const name = `<b>${esc(p.card.name)}</b>`;
    p.remote.event(m.k, d, this.state === 'world' || this.state === 'lobby' ? this.fx : null);
    const near = p.st ? Math.hypot(p.st[S.X] - this.player.x, p.st[S.Z] - this.player.z) : 99;
    const vol = clamp(1.1 - near / 40, 0.1, 1);
    if (m.k === 'land' || m.k === 'bite') this.audio.splash(0.4, vol);
    else if (m.k === 'jump') this.audio.splash(0.9, vol);
    else if (m.k === 'catch') {
      const f = FISH_BY_ID[d.sp];
      const j = JUNK_BY_ID[d.sp];
      const nm = f ? f.name : j ? j.name : '?';
      const col = f ? RARITY[f.rar].color : '#cbd5e1';
      this.ui.feed(`${name} — <b style="color:${col}">${esc(nm)}</b>, ${fmtW(Number(d.w) || 0)}${d.trophy ? ' · трофей!' : ''}`);
      p.remote.bubble(`${esc(nm)} · ${fmtW(Number(d.w) || 0)}`, 6);
      if (f && f.rar >= 3) {
        this.ui.toast(`${esc(p.card.name)} вытащил: ${f.name}, ${fmtW(d.w)}!`, 'gold', 5000);
        this.audio.catch(f.rar);
      }
    } else if (m.k === 'lost') p.remote.bubble(d.why === 'snap' ? 'Обрыв!' : 'Сошла…', 3);
    else if (m.k === 'sold') this.ui.feed(`${name} продал улов на <b class="y">${fmtCoins(Number(d.total) || 0)}</b> монет`);
    else if (m.k === 'buy' && ITEMS[d.id]) this.ui.feed(`${name} купил: <b>${esc(ITEMS[d.id].name)}</b>`);
  }

  // ───── клавиши вне игрового цикла ─────
  onKey(e) {
    const ui = this.ui;
    if (ui.chatOpen) {
      if (e.code === 'Escape') {
        this.input.lockedAt = performance.now(); // Esc заодно отпускает мышь — паузу из-за этого не открываем
        ui.chat(false);
      }
      return;
    }
    if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.type !== 'range') {
      if (e.code === 'Enter' && this.state === 'title') {
        const b = $('.tcard .btn.pri');
        if (b) b.click();
      }
      return;
    }
    if (e.code === 'KeyM') return this.toggleVoice();
    if (ui.panel) {
      if (e.code === 'Escape' || e.code === 'Tab' && (ui.panel === 'tackle' || ui.panel === 'shop')) {
        e.preventDefault();
        if (ui.panel !== 'pause' && this.state === 'world' && ui.popts && ui.popts.fromPause) return ui.openPanel('pause');
        return ui.closePanel();
      }
      if (e.code === 'KeyE' || e.code === 'Enter') return ui.doAction();
      return;
    }
    if (this.state === 'lobby') {
      if (e.code === 'Enter' || e.code === 'Space') this.enterWorld();
      else if (e.code === 'Escape') this.leaveRoom();
      else if (e.code === 'Tab') {
        e.preventDefault();
        ui.openPanel('tackle');
      } else if (e.code === 'KeyC') ui.openPanel('editor');
      else if (e.code === 'KeyJ') ui.openPanel('journal');
    }
  }
  worldKeys() {
    const i = this.input;
    const ui = this.ui;
    const f = this.fishing;
    if (ui.panel) return ui.prompt('');
    if (i.hit('Enter') && !this.solo) return ui.chat(true);
    if (i.hit('Escape')) return ui.openPanel('pause');
    const busy = f.state === 'fight' || f.state === 'landed';
    if (i.hit('Tab')) return busy ? ui.toast('Сначала вытащите рыбу') : ui.openPanel('tackle');
    if (i.hit('KeyJ') && !busy) return ui.openPanel('journal');
    if (i.hit('KeyC') && !busy) return ui.openPanel('editor');
    if (i.hit('KeyQ') && !busy) this.cycleTackle();
    if (i.hit('KeyX') && !f.lineOut) this.player.toggleSit();
    for (const [k, em] of [['Digit1', 'wave'], ['Digit2', 'thumb'], ['Digit3', 'cheer'], ['Digit4', 'dance']]) {
      if (i.hit(k)) {
        this.emote = em;
        this.emoteT = 2.6;
        this.ev('emote', { k: em });
        ui.toast({ wave: 'Привет!', thumb: 'Класс!', cheer: 'Ура!', dance: 'Танцуем' }[em], '', 900);
      }
    }
    if (settings.ptt && this.voice.state.joined) {
      const hold = i.keys.has('KeyV');
      if (hold === this.voice.state.muted) this.voice.setMuted(!hold);
    }
    // рынок
    const near = Math.hypot(this.player.x - MARKET.x, this.player.z - MARKET.z) < MARKET.r && !f.lineOut;
    const noMouse = !i.grab && !i.touch.on && i.device !== 'pad';
    ui.prompt(noMouse ? 'КЛИКНИТЕ ПО ИГРЕ — ВЗЯТЬ УПРАВЛЕНИЕ' : near ? (i.touch.on ? 'РЫНОК — ПРОДАТЬ УЛОВ, КУПИТЬ СНАСТИ' : `${ui.key('use')} РЫНОК — ПРОДАТЬ УЛОВ, КУПИТЬ СНАСТИ`) : '');
    this.nearMarket = near;
    if (near && i.hit('KeyE')) ui.openPanel('sell');
  }
  hints() {
    const ui = this.ui;
    const f = this.fishing;
    const k = (a) => ui.key(a);
    const sep = '<i class="sep"></i>';
    switch (f.state) {
      case 'idle': return `<span>${k('primary')} УДЕРЖИВАЙ — ЗАБРОС</span>${sep}<span>${k('tackle')} СНАСТИ</span>`;
      case 'charge': return `<span>ОТПУСТИ — ЗАБРОС</span>${sep}<span>ДО БЕЛОЙ РИСКИ — ТОЧНО В МЕТКУ</span>`;
      case 'cast': return '<span>ЛЕТИТ…</span>';
      case 'wait': return f.lure ? `<span>${k('primary')} ДЕРЖИ — ВЕДИ ПРИМАНКУ</span>${sep}<span>${k('back')} СМОТАТЬ</span>` : `<span>ЖДЁМ ПОКЛЁВКУ</span>${sep}<span>${k('back')} СМОТАТЬ</span>`;
      case 'bite': return `<span>${k('primary')} ПОДСЕКАЙ!</span>`;
      case 'fight': return `<span>${k('primary')} МОТАТЬ</span>${sep}<span>ОТПУСТИ — ОСЛАБИТЬ</span>${sep}<span>${k('left')}${k('right')} ВЕСТИ</span>`;
      case 'landed': return `<span>${k('primary')} В САДОК</span>${sep}<span>${k('release')} ОТПУСТИТЬ</span>`;
      default: return '';
    }
  }

  bindTouch() {
    const t = this.input.touch;
    const stick = $('#stick');
    const knob = stick.firstElementChild;
    // садок — наверх, к названию места: внизу слева живёт джойстик
    $('.hud-tl').insertBefore($('.chip.bag'), $('#crew'));
    let sid = null;
    let lid = null;
    let lx = 0;
    let ly = 0;
    const move = (e) => {
      for (const c of e.changedTouches) {
        if (c.identifier === sid) {
          const r = stick.getBoundingClientRect();
          let dx = (c.clientX - r.left - r.width / 2) / (r.width / 2);
          let dy = (c.clientY - r.top - r.height / 2) / (r.height / 2);
          const l = Math.hypot(dx, dy);
          if (l > 1) {
            dx /= l;
            dy /= l;
          }
          t.mx = dx;
          t.mz = -dy;
          knob.style.transform = `translate(${dx * 2.6}em,${dy * 2.6}em)`;
        } else if (c.identifier === lid) {
          this.input.lookDX += (c.clientX - lx) * 2.4;
          this.input.lookDY += (c.clientY - ly) * 2.4;
          lx = c.clientX;
          ly = c.clientY;
        }
      }
    };
    const drop = (e) => {
      for (const c of e.changedTouches) {
        if (c.identifier === sid) {
          sid = null;
          t.mx = t.mz = 0;
          knob.style.transform = '';
        } else if (c.identifier === lid) lid = null;
      }
    };
    this.touchReset = () => {
      sid = lid = null;
      t.mx = t.mz = 0;
      t.primary = false;
      knob.style.transform = '';
    };
    stick.addEventListener('touchstart', (e) => {
      sid = e.changedTouches[0].identifier;
      move(e);
      e.preventDefault();
    }, { passive: false });
    this.canvas.addEventListener('touchstart', (e) => {
      const c = e.changedTouches[0];
      lid = c.identifier;
      lx = c.clientX;
      ly = c.clientY;
    }, { passive: true });
    addEventListener('touchmove', move, { passive: true });
    addEventListener('touchend', drop);
    addEventListener('touchcancel', drop);
    const hold = (id, down, up) => {
      const b = $(id);
      b.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.audio.start();
        down();
      }, { passive: false });
      const end = (e) => {
        e.preventDefault();
        up && up();
      };
      b.addEventListener('touchend', end, { passive: false });
      b.addEventListener('touchcancel', end, { passive: false });
    };
    hold('#tAct', () => {
      t.primary = true;
      this.input.pressed.add('Primary');
    }, () => (t.primary = false));
    hold('#tE', () => this.input.pressed.add('KeyE'));
    hold('#tR', () => this.input.pressed.add('KeyR'));
    hold('#tMenu', () => this.input.pressed.add('Escape'));
    hold('#tSit', () => this.input.pressed.add('KeyX'));
    hold('#tChat', () => this.input.pressed.add('Enter'));
    // панель снастей: касание наживки листает её, остальное открывает снасти
    $('#hotbar').addEventListener('touchstart', (e) => {
      e.preventDefault();
      const slot = e.target.closest('.slot');
      this.input.pressed.add(slot && slot.dataset.k === 'bait' ? 'KeyQ' : 'Tab');
    }, { passive: false });
    $('#rotate button').addEventListener('click', () => document.body.classList.add('anyway'));
  }
  /** Сенсорные кнопки: только в бухте и только те, что сейчас нужны. */
  touchUi() {
    const f = this.fishing;
    const ui = this.ui;
    const show = this.state === 'world' && !ui.panel && !ui.chatOpen;
    const st = show ? f.state : 'off';
    const key = `${st}|${f.lure ? 1 : 0}|${this.nearMarket ? 1 : 0}|${this.solo ? 1 : 0}|${this.player.sit ? 1 : 0}`;
    if (key === this.touchKey) return;
    this.touchKey = key;
    $('#touch').classList.toggle('hidden', !show);
    if (!show) return this.touchReset();
    $('#tAct').textContent = { idle: 'ЗАБРОС', charge: 'ОТПУСТИ', cast: '…', wait: f.lure ? 'ВЕДИ' : 'ЖДЁМ', bite: 'ПОДСЕКАЙ', fight: 'МОТАЙ', landed: 'В САДОК' }[st] || 'ЗАБРОС';
    $('#tAct').classList.toggle('dim', st === 'cast' || (st === 'wait' && !f.lure));
    $('#tAct').classList.toggle('go', st === 'bite');
    $('#tR').textContent = st === 'landed' ? 'ОТПУСТИТЬ' : 'СМОТАТЬ';
    $('#tR').classList.toggle('hidden', st !== 'landed' && st !== 'wait');
    $('#tE').classList.toggle('hidden', !(this.nearMarket && st === 'idle'));
    $('#tSit').classList.toggle('hidden', st !== 'idle' || this.nearMarket);
    $('#tSit').textContent = this.player.sit ? 'ВСТАТЬ' : 'СЕСТЬ';
    $('#tChat').classList.toggle('hidden', this.solo || st === 'fight' || st === 'landed');
    $('#hotbar').classList.toggle('hidden', st === 'fight' || st === 'charge');
    $('#stick').classList.toggle('steer', st === 'fight');
  }

  // ───── главный цикл ─────
  frame(now) {
    requestAnimationFrame((t) => this.frame(t));
    const dt = Math.min(0.1, (now - this.last) / 1000) * this.timeScale;
    this.last = now;
    if (this.gfx.resize()) {
      this.camera.aspect = this.gfx.w / this.gfx.h;
      this.camera.updateProjectionMatrix();
      this.fishing.line.resize(this.gfx.w, this.gfx.h);
      for (const p of this.players.values()) p.remote.line.resize(this.gfx.w, this.gfx.h);
    }
    const i = this.input;
    i.poll();
    const T = this.nowSec();
    this.hours = this.fixedHour != null ? this.fixedHour : this.state === 'title' ? 10.5 + Math.sin(T * 0.01) : clockHours(T, 8);
    this.world.setClock(this.hours);
    this.audio.night = this.world.night;
    const tw = this.state === 'title' ? now / 1000 : T;
    const cam = this.camera;
    const ui = this.ui;

    if (this.state === 'world') {
      this.worldKeys();
      const f = this.fishing;
      const free = !f.lineOut && !ui.panel;
      if (!ui.panel || !this.editing) {
        const noLook = !!ui.panel;
        if (noLook) i.lookDX = i.lookDY = 0;
        this.player.update(dt, i, free);
        f.update(dt, tw, i, this.player);
        const v = f.view();
        v.speed = this.player.speed;
        v.steer = i.steer;
        v.lookDX = i.lookDX;
        v.lookDY = i.lookDY;
        this.vm.update(dt, v);
      }
      // HUD
      ui.setHints(this.hints());
      ui.clock(this.hours);
      ui.compass(this.player.yaw);
      const kit = f.kit;
      ui.minimap(this.player, [...this.players.values()].filter((p) => p.mode === 'world' && p.st).map((p) => ({ x: p.st[S.X], z: p.st[S.Z], slot: p.slot })), kit.sonar ? this.world.scenery.schools.centers : null);
      const aim = f.aim;
      if (!ui.panel && ((f.state === 'idle' && i.enabled && (i.grab || i.touch.on)) || f.state === 'charge')) {
        v3.set(aim.x, 0.05, aim.z).project(cam);
        ui.castMark({ x: (v3.x * 0.5 + 0.5) * this.gfx.w, y: (-v3.y * 0.5 + 0.5) * this.gfx.h, ok: aim.ok, hot: aim.spot && aim.spot.hot, clamped: aim.clamped, dist: aim.dist, zone: aim.spot ? ZONES[aim.spot.zone].name : '', depth: aim.spot ? aim.spot.depth : 0, act: aim.act });
      } else ui.castMark(null);
      ui.power(f.state === 'charge' ? f.power : null, aim.dist / kit.cast);
      $('#cross').className = !i.grab && !i.touch.on ? 'off' : f.state === 'idle' && !aim.ok ? 'bad' : '';
      ui.fight(f.state === 'fight' ? f.fight : null, i.steer);
      if (f.state === 'fight') {
        this.audio.strain(f.fight.T);
        if (f.fight.T > 0.78) this.player.shake = Math.max(this.player.shake, 0.5);
        if (i.hold) {
          this.tickT = (this.tickT || 0) - dt;
          if (this.tickT <= 0) {
            this.tickT = 0.07;
            this.audio.tick();
          }
        }
      } else if (f.state === 'wait' && f.reeling) {
        this.tickT = (this.tickT || 0) - dt;
        if (this.tickT <= 0) {
          this.tickT = 0.11;
          this.audio.tick();
        }
      }
      if (this.emoteT > 0) this.emoteT -= dt;
      // рассылка своего состояния
      this.sendT -= dt;
      if (this.sendT <= 0 && !this.solo && this.net.open) {
        this.sendT = 1 / 12;
        const n = f.net(this.netOut || (this.netOut = {}));
        const pl = this.player;
        const flags = n.flags | (pl.sit ? FLAG.sit : 0) | (pl.dangle && pl.sit ? FLAG.dangle : 0);
        this.net.send({ t: 'st', s: [pl.x, pl.y + pl.jump, pl.z, pl.yaw, pl.pitch, pl.speed, n.fs, n.bx, n.by, n.bz, n.t, flags, n.k, i.steer, 0] });
      }
    } else if (this.state === 'lobby' || this.state === 'title') {
      if (this.state === 'title' || !this.editing) this.lobbyCamera(dt, now / 1000);
    }
    if (this.editing) this.editCamera(dt);

    // друзья
    const pnow = performance.now() / 1000;
    const tags = [];
    const plates = [];
    const showPlates = this.state === 'lobby' && !ui.panel;
    for (const p of this.players.values()) {
      const r = p.remote;
      const vid = this.voice.vidOf(p.id);
      r.talk = vid != null ? this.voice.level(vid) : 0;
      if (p.mode === 'world') r.update(dt, pnow, tw, this.fx, !!p.st);
      else r.lobbyPose(dt, lineX(p.slot), DECK_Y, LINE_Z, (p.slot % 3) + 1);
      if (this.state === 'world' && r.char.group.visible) {
        r.head(v3);
        const d = v3.distanceTo(cam.position);
        v3.project(cam);
        const vis = v3.z < 1 && d < 70 && Math.abs(v3.x) < 1.1 && Math.abs(v3.y) < 1.1;
        tags.push({ id: p.id, x: (v3.x * 0.5 + 0.5) * this.gfx.w, y: (-v3.y * 0.5 + 0.5) * this.gfx.h, name: p.card.name, slot: p.slot, talk: r.talk > 0.08, say: r.sayT > 0 ? r.say : '', vis, scale: clamp(1.25 - d / 40, 0.62, 1.1) });
      } else if (showPlates && p.mode !== 'world') {
        v3.set(lineX(p.slot), DECK_Y - 0.04, LINE_Z).project(cam);
        plates.push({ id: p.id, x: (v3.x * 0.5 + 0.5) * this.gfx.w, y: (-v3.y * 0.5 + 0.5) * this.gfx.h, name: p.card.name, slot: p.slot, host: p.id === this.hostId, mode: p.mode, talk: r.talk > 0.08 });
      }
    }
    if (this.state === 'world') ui.setTags(tags);
    if (i.touch.on) this.touchUi();
    // свой персонаж: в лобби и в редакторе
    const showMe = this.state === 'lobby' || !!this.editing;
    this.meChar.group.visible = showMe;
    if (showMe) {
      if (this.state === 'lobby') this.meChar.group.position.set(lineX(this.me.slot), DECK_Y, LINE_Z);
      this.meChar.group.rotation.y = this.editing ? this.editYaw + (this.state === 'world' ? this.editBase + Math.PI : 0) : 0;
      // в редакторе удочку убираем, чтобы не закрывала лицо
      if (this.meChar.rod) this.meChar.rod.group.visible = !this.editing;
      this.meChar.update(dt, { mode: this.editing ? 'idle' : 'hold', variant: this.editing ? 0 : 1, talk: this.voice.state.selfSpeaking ? 0.5 : 0 });
      if (showPlates) {
        v3.set(lineX(this.me.slot), DECK_Y - 0.04, LINE_Z).project(cam);
        plates.push({ id: 0, x: (v3.x * 0.5 + 0.5) * this.gfx.w, y: (-v3.y * 0.5 + 0.5) * this.gfx.h, name: this.profile.name, slot: this.me.slot, host: this.me.id === this.hostId && !this.solo, me: true, mode: 'lobby', talk: this.voice.state.selfSpeaking });
      }
    }
    ui.setPlates(showPlates ? plates : []);
    if (this.state === 'world' && (this.crewT = (this.crewT || 0) - dt) <= 0) {
      this.crewT = 0.25;
      ui.setCrew(this.roster());
      this.market();
    }
    this.vendor.update(dt, { mode: 'idle', variant: ui.panel === 'sell' || ui.panel === 'shop' ? 1 : 0, talk: ui.panel === 'sell' ? 0.3 : 0 });

    this.world.scenery.schools.update(hashStr(this.seed), Math.max(0, T));
    this.world.update(dt, tw, cam);
    this.fx.update(dt, tw);
    if (!this.noRender || window.__render) {
      window.__render = false;
      this.gfx.render(this.scene, cam, this.world.exposure);
      window.__rendered = (window.__rendered || 0) + 1;
    }
    if (!this.shot && this.state === 'title' && !this.noRender) this.takeShot();
    i.endFrame();
    window.__frames = (window.__frames || 0) + 1;
    // автоподбор качества: если кадры долгие — упрощаем картинку
    this.frameMs = this.frameMs * 0.95 + dt * 1000 * 0.05;
    if (this.auto && this.state === 'world' && !this.params.get('q')) {
      this.slowT = this.frameMs > 30 ? this.slowT + dt : Math.max(0, this.slowT - dt);
      if (this.slowT > 4) {
        this.slowT = 0;
        const q = this.gfx.quality === 'high' ? 'medium' : this.gfx.quality === 'medium' ? 'low' : null;
        if (q) this.gfx.setQuality(q);
      }
    }
  }
  /** Картинка бухты для карточки места в лобби — снимаем один раз с готового кадра. */
  takeShot() {
    const c = document.createElement('canvas');
    c.width = 560;
    c.height = 350;
    const cam = this.camera;
    const keep = [cam.position.clone(), cam.rotation.clone(), cam.fov];
    cam.position.set(-9, 3.4, 1.5);
    cam.rotation.set(0.02, -0.36, 0, 'YXZ');
    cam.fov = 50;
    cam.aspect = 1.6;
    cam.updateProjectionMatrix();
    this.world.update(0, performance.now() / 1000, cam);
    this.gfx.renderer.render(this.scene, cam);
    try {
      const src = this.gfx.renderer.domElement;
      const k = Math.max(c.width / src.width, c.height / src.height);
      c.getContext('2d').drawImage(src, (c.width - src.width * k) / 2, (c.height - src.height * k) / 2, src.width * k, src.height * k);
      this.shot = c.toDataURL('image/jpeg', 0.86);
    } catch {
      this.shot = 'data:,';
    }
    cam.position.copy(keep[0]);
    cam.rotation.copy(keep[1]);
    cam.fov = keep[2];
    cam.aspect = this.gfx.w / this.gfx.h;
    cam.updateProjectionMatrix();
  }
  lobbyCamera(dt, t) {
    const cam = this.camera;
    if (this.state === 'title') {
      // медленный облёт бухты
      const a = t * 0.035;
      cam.position.set(-10 + Math.sin(a) * 9, 4.2 + Math.sin(a * 0.7) * 0.8, 3 + Math.cos(a) * 5);
      cam.lookAt(14 + Math.sin(a) * 6, 6, -70);
      cam.fov = 52;
    } else {
      const xs = [lineX(this.me.slot), ...[...this.players.values()].filter((p) => p.mode !== 'world').map((p) => lineX(p.slot))];
      const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
      const wide = Math.max(...xs) - Math.min(...xs);
      const aspect = this.gfx.w / this.gfx.h;
      const dist = clamp(5.2 + wide * 0.62, 5.2, 11) * (aspect < 1.3 ? 1.5 : 1);
      this.lobX = damp(this.lobX ?? mid, mid, 3, dt);
      cam.position.set(this.lobX + dist * 0.2, DECK_Y + 1.32, LINE_Z + dist);
      cam.lookAt(this.lobX + dist * 0.2, DECK_Y + 1.0, LINE_Z);
      cam.fov = 40;
    }
    cam.updateProjectionMatrix();
  }
  editCamera() {
    const cam = this.camera;
    const g = this.meChar.group.position;
    const h = this.profile.look.height;
    if (this.state === 'world') {
      const fx = -Math.sin(this.editBase);
      const fz = -Math.cos(this.editBase);
      cam.position.set(g.x + fx * 3.1, g.y + 1.15 * h, g.z + fz * 3.1);
      cam.lookAt(g.x, g.y + 0.98 * h, g.z);
    } else {
      cam.position.set(g.x, g.y + 1.15 * h, g.z + 3.2);
      cam.lookAt(g.x, g.y + 0.98 * h, g.z);
    }
    cam.fov = 38;
    cam.updateProjectionMatrix();
  }
}

window.RYBAK = new Game();
