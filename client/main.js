// РЫБАК — сборка игры: состояния (меню → лобби → рыбалка), главный цикл, связь всех частей.
import * as THREE from 'three';
import { Gfx, QUALITIES } from './gfx.js';
import { loadManifest, loadHero, heroes, fpLook, heroEye } from './hero.js';
import { loadModel, modelInfo } from './models.js';
import { setEnvLight } from './env.js';
import { adopt } from './fish3d.js';
import { modelShot, faceShot } from './icons.js';
import { World, drawMinimap, SEA_VIEW } from './world.js';
import { Character, VENDOR_PUPPET } from './character.js';
import { buildRod, itemModel } from './gear3d.js';
import { ViewModel } from './viewmodel.js';
import { Input, Player } from './player.js';
import { Fishing } from './fishing.js';
import { Fx } from './fx.js';
import { Boat, BOAT_PRICE, Ride, BOAT_SEATS } from './boat.js';
import { Remote } from './remote.js';
import { Net } from './net.js';
import { createVoice } from './voice.js';
import { Audio2 } from './audio.js';
import { UI } from './ui.js';
import { loadProfile, saveProfile, settings, saveSettings, session } from './profile.js';
import { S, FLAG } from './proto.js';
import { DECK_Y, MARKET, MOORINGS, RENT_DESK, MAP_VIEW, WRECK, SEA, ISLAND, palmR, canStand } from './terrain.js';
import { ITEMS, FISH_BY_ID, JUNK_BY_ID, RARITY, ZONES, BAITS, LURES, clockHours, dayPart, fmtW, fmtCoins, isLure } from '../shared/data.js';
import {
  marketState, hashStr, buy, equip, sell, kitStats, levelInfo, tackleCount, fishValue, newProfile,
  weatherAt, WEATHER, syncQuests, questEvent, questText, questDay,
  TOURS, TOUR_COUNTDOWN, tourBlank, tourAdd, tourTable, tourPrize, tourMedal, medalPrize, tourScoreText, MEDALS
} from '../shared/logic.js';
import { $, esc, clamp, damp, isTouch } from './util.js';
import { Perf, isSoftware, newTuner, tuneStep, needDrop, scaleFor, TARGET_MS, yieldNow } from './perf.js';
import { surfaceU } from './surface.js';
import { initCache, wakeServer } from './offline.js';

const SPAWNS = [[-2, 9], [0.6, 9.4], [-4, 8.2], [2.6, 8.6], [-1, 11], [1.6, 11.4], [-3.6, 11], [3.6, 10.4]];
const LINE_Z = 7;
const CALIB_V = 2; // версия правил подбора качества: сменились пороги — запомненный итог не годится, меряем заново
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
// части мира: что написать в углу экрана и чем место интересно рыбаку
const AREAS = {
  bay: ['СОЛНЕЧНАЯ БУХТА', ''],
  light: ['ОСТРОВ С МАЯКОМ', 'Остров с маяком: у водопадов берут форель и лосось, а с причала — глубина: судак, скумбрия, скат'],
  palm: ['ПАЛЬМОВЫЙ ОСТРОВ', 'Пальмовый остров: в бирюзовой лагуне ходят дорада, кефаль и сарган'],
  wreck: ['ЗАТОНУВШИЙ КОРАБЛЬ', 'Затонувший корабль: морской окунь, угорь — а в трюме, говорят, живёт Старик'],
  sea: ['ОТКРЫТОЕ МОРЕ', 'Открытое море: скумбрия, тунец, а если повезёт — рыба-меч']
};
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
    // на «авто» начинаем с того, что подобрали на этой машине в прошлый раз (calibrate), а не с «высокого»
    const was = this.auto && settings.autoQ && settings.autoQ.v === CALIB_V && QUALITIES.includes(settings.autoQ.tier) ? settings.autoQ : null;
    this.gfx = new Gfx(this.canvas, q.get('q') || (this.auto ? (was ? was.tier : touch ? 'medium' : 'high') : settings.quality));
    this.perf = new Perf(this.gfx.renderer);
    this.tuner = newTuner();
    this.perfOn = false; // окошко со счётчиком кадров (F3)
    this.calib = null; // чем кончился подбор качества при загрузке
    this.world = new World();
    this.scene = this.world.scene;
    this.camera = new THREE.PerspectiveCamera(settings.fov, this.gfx.w / Math.max(1, this.gfx.h), 0.07, 3400);
    this.camera.rotation.order = 'YXZ';
    this.camera.layers.enable(1); // слой 1 — мелочь, которой нет в отражении воды: игрок её видит, зеркальная камера — нет
    this.scene.add(this.camera);
    this.input = new Input(this.canvas);
    this.input.touch.on = touch;
    this.player = new Player(this.camera);
    this.vm = new ViewModel(this.camera);
    this.vm.setLook(fpLook(this.profile.look));
    this.vm.setVisible(false);
    // вода отражает мир; сама вода, пена у свай, руки с удочкой и трава в отражение не попадают
    this.gfx.setReflection(this.world.water.uniforms, [this.world.water.mesh, this.world.rings, this.vm.root, this.world.grass.tufts, this.world.grass.flowers, this.world.rain.mesh, ...this.world.scenery.fauna.under].filter(Boolean));
    // живность: рыба и мальки шарахаются от шагов по воде, поплавка и лодки; всплеск играющей рыбы слышен неподалёку
    this.fauna = this.world.scenery.fauna;
    this.fauna.onSplash = (x, z, pw) => {
      const d = Math.hypot(x - this.player.x, z - this.player.z);
      if (this.state === 'world' && d < 60) this.audio.splash(0.5 + pw * 0.5, clamp(1 - d / 60, 0, 1) * 0.7);
    };
    // погода: общая для комнаты, считается из её зерна и часов; ?w=rain|fog|cloudy|clear — насильно (для проверок)
    this.forceWx = WEATHER[q.get('w')] ? q.get('w') : null;
    this.weather = weatherAt('title', 0);
    this.tour = null; // идущий турнир
    this.lastTour = null; // итоги прошлого
    this.ride = null; // сидим пассажиром в лодке друга (Ride)
    this.frameNo = 0;
    this.fx = new Fx(this.scene);
    // лодка напрокат: стоит у пирса, пока её не возьмут
    this.boat = new Boat(this.scene, this.fx);
    this.boat.onBump = (sp, edge) => {
      this.audio.thud(Math.min(1, 0.4 + sp / 10));
      this.player.shake = Math.max(this.player.shake, Math.min(1, sp / 8));
      this.rumble(120, 0.7);
      if (edge) this.ui.toast('Дальше — только океан. Поворачиваем назад', '', 2600);
    };
    // мягкий свет от камеры на экране команды и в редакторе: лица не должны тонуть в тени, когда солнце сзади
    this.fill = new THREE.DirectionalLight('#fff1dc', 0);
    this.fill.visible = false; // погашена — значит, её нет: иначе она считалась бы в шейдерах всей сцены
    this.scene.add(this.fill, this.fill.target);
    this.audio = new Audio2();
    // шаги: доски причала, земля, вода по колено
    this.player.onStep = (land) => {
      const p = this.player;
      if (p.wade > 0.05) {
        this.audio.splash(0.3 + p.wade * 0.5, land ? 0.45 : 0.2);
        this.fx.ripple(p.x, p.z, 0.6 + p.wade, 0.9);
        this.fauna.scare(p.x, p.z, 2.8);
      } else this.audio.step(p.onDeck, land);
    };
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
    this.fishing = new Fishing({ scene: this.scene, camera: this.camera, vm: this.vm, fx: this.fx, schools: this.world.scenery.schools, profile: this.profile, hour: () => this.hours, wx: () => this.weather.bite, emit: (t, d) => this.onFish(t, d) });
    this.fishing.makeJunk = (id) => {
      // готовая модель стоит на «полу» (y = 0) — опускаем на половину высоты, чтобы в руках она была по центру, как процедурная
      const g = new THREE.Group();
      g.add(itemModel(id));
      const info = modelInfo('junk-' + id);
      return info ? adopt(g, 'junk-' + id, false, -(info.size ? info.size[1] : 1) / 2) : g;
    };
    this.ui = new UI(this);
    this.ui.mapBase = drawMinimap(256);
    // карта всего моря рисуется дольше — готовим её чуть позже, не в первый кадр
    setTimeout(() => this.seaMap(), 2500);
    this.meChar = new Character(this.profile.look);
    this.meChar.setRod(buildRod(this.profile.equip.rod, this.profile.equip.reel, this.profile.equip.line, 1));
    this.meChar.group.visible = false;
    this.scene.add(this.meChar.group);
    // торговец за прилавком
    this.vendor = new Character(VENDOR_PUPPET, { puppet: true });
    /** Снимок модели в картинку — им пользуются tools/bake-icons.cjs и проверочные листы. */
    this.modelShot = (id, view) => loadModel(id).then((t) => modelShot(t, view));
    /** Портрет героя — для tools/bake-icons.cjs --faces. */
    this.faceShot = (id) => loadHero(id).then(() => faceShot({ hero: id }));
    heroes.onLoad = () => {
      this.vm.setLook(fpLook(this.profile.look));
      this.ui.rerender();
    };
    // герои: список приходит отдельным файлом. У кого герой не выбран (новичок) или в сохранении остался
    // персонаж из частей (их в игре больше нет) — тому достаётся случайный герой, сменить можно на экране «Персонаж»
    loadManifest().then(() => {
      if (heroes.byId.has('npc-vendor')) this.vendor.setLook({ ...this.vendor.look, hero: 'npc-vendor' });
      const p = this.profile;
      if (!heroes.list.length) return;
      if (!heroes.list.some((h) => h.id === p.look.hero)) {
        p.look = { hero: heroes.list[Math.floor(Math.random() * heroes.list.length)].id };
        saveProfile(p);
        if (!this.solo && this.net.room) this.net.send({ t: 'card', card: this.card() });
      }
      this.meChar.setLook(p.look);
      this.vm.setLook(fpLook(p.look));
      this.player.eye = heroEye(p.look);
      this.ui.rerender();
    });
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
    // кэш игры на устройстве и сервер: из кэша игра открывается раньше, чем проснётся сервер, — говорим об этом на заставке
    this.serverUp = null;
    initCache(this);
    wakeServer((ok) => {
      if (this.serverUp === ok) return;
      this.serverUp = ok;
      const el = $('#srvNote');
      if (el) el.classList.toggle('hidden', ok || this.state !== 'title');
    });
    this.boot();
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
        this.tour = null;
        if (m.tour) this.setTour(m.tour, true);
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
      tour: (m) => this.setTour(m.tour),
      tscore: (m) => {
        if (!this.tour || this.tour.id !== m.id) return;
        this.tour.scores.set(m.row.id, m.row);
        this.tourKey = '';
      },
      tend: (m) => this.endTour(m),
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
        } else {
          this.ui.toast(m.message, 'bad', 4000);
          if (m.req === 'tour') this.ui.rerender();
        }
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
    this.resetBoat();
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
    this.syncQuests();
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
    this.resetBoat();
    this.player.place(sp[0], sp[1], 0);
    this.player.eye = heroEye(this.profile.look);
    this.ui.hideScreen();
    this.ui.setPlates([]);
    this.ui.hudShow(true);
    this.ui.refreshHud();
    this.meChar.group.visible = false;
    this.vm.setVisible(true);
    this.fishing.refreshGear();
    this.rosterChanged();
    this.syncQuests();
    this.ui.questTracker();
    this.wxKind = null;
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
    this.tour = null;
    this.ui.tourHud(null);
    setUrl(location.pathname);
    this.urlCode = '';
    this.backToTitle('');
  }
  backToTitle(err) {
    this.state = 'title';
    this.inWorld = false;
    this.tour = null;
    this.ui.tourHud(null);
    this.resetBoat();
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
    this.editH = null;
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
    this.vm.setLook(fpLook(look));
    this.player.eye = heroEye(look);
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

  // ───── лодка ─────
  seaMap() {
    return this._seaMap || (this._seaMap = drawMinimap(256, SEA_VIEW));
  }
  /** Первый выход бесплатный — чтобы новичок без монет тоже попробовал. */
  boatPrice() {
    return this.profile.boatTrips ? BOAT_PRICE : 0;
  }
  rentBoat() {
    const p = this.profile;
    const price = this.boatPrice();
    if (p.coins < price) {
      this.audio.error();
      return this.ui.toast(`На прокат не хватает ${fmtCoins(price - p.coins)} монет — продайте улов на рынке`, 'bad', 3400);
    }
    p.coins -= price;
    p.boatTrips = (p.boatTrips || 0) + 1;
    saveProfile(p);
    this.boat.rented = true;
    this.boat.away = false;
    this.audio.buy();
    this.ui.refreshHud();
    this.ui.toast(price ? `Лодка ваша: −${price} монет. Вернёте её к этому пирсу` : 'Первый выход — бесплатно. Лодку вернёте к этому пирсу', 'good', 3800);
    this.ev('boat', { k: 'rent' });
    this.boardBoat();
  }
  boardBoat() {
    const b = this.boat;
    this.fishing.reelIn(true);
    b.board();
    this.player.boat = b;
    this.player.yaw = b.yaw;
    this.player.pitch = -0.1;
    this.audio.step(true, true);
    if (!this.boatHinted) {
      this.boatHinted = true;
      this.ui.toast(this.input.touch.on ? 'Джойстик вперёд — ход, в стороны — руль. Рыбачить можно прямо с борта' : this.input.device === 'pad' ? 'Левый стик — ход и руль. Рыбачить можно прямо с борта' : 'W — ход, S — назад, A и D — руль. Рыбачить можно прямо с борта', '', 6000);
    }
  }
  /** Причалить и выйти на настил. Дома после выхода в море лодка сдаётся. */
  dock(mi) {
    const b = this.boat;
    const m = MOORINGS[mi];
    b.toMooring(mi);
    this.player.boat = null;
    this.player.place(m.sx, m.sz, m.syaw);
    this.audio.motor(-1);
    this.audio.step(true, true);
    if (m.rent && b.away) {
      b.rented = false;
      this.ui.toast('Лодка сдана. Захотите ещё — она ждёт у пирса', 'good', 3000);
    } else if (!m.rent) this.ui.toast(`${m.name}. Лодка ждёт у причала`, '', 2600);
  }
  /** Лодка — на место у пирса, прокат закрыт: при входе в бухту и выходе из неё. */
  resetBoat() {
    this.boat.toMooring(0);
    this.boat.rented = false;
    this.ride = null;
    this.player.boat = null;
    this.audio.motor(-1);
  }

  // ───── общая лодка: друг берёт пассажиров ─────
  /** Чья лодка: своя (если она в прокате) или друга — её картинка (BoatVisual), пока она видна. */
  rideBoat(id) {
    if (id === this.me.id) return this.boat.rented ? this.boat.vis : null;
    const p = this.players.get(id);
    return p ? p.remote.boat : null;
  }
  /**
   * Лодка друга, в которую сейчас можно сесть: стоит рядом (или у причала, на который мы вышли) и не на ходу.
   * aboard: true — только лодки, в которых сидит хозяин. Возвращает { p, seat }; seat = 0 — свободных мест нет.
   */
  rideTarget(aboard = false) {
    const pl = this.player;
    let best = null;
    let bd = 1e9;
    for (const p of this.players.values()) {
      const r = p.remote;
      if (p.mode !== 'world' || !p.st || !r.boat) continue;
      const bs = p.st[S.BOAT] | 0;
      if (!bs || (aboard && bs !== 1) || (bs === 1 && Math.abs(r.bv) > 2.5)) continue; // на ходу в лодку не запрыгнуть
      const g = r.boat.group.position;
      let d = Math.hypot(pl.x - g.x, pl.z - g.z);
      // у причала чужая лодка стоит борт к борту со своей, дальше от настила — садятся в неё с того же места
      if (bs >= 2 && MOORINGS[bs - 2] && Math.hypot(pl.x - MOORINGS[bs - 2].sx, pl.z - MOORINGS[bs - 2].sz) < 2.6) d = Math.min(d, 2);
      if (d < 4.6 && d < bd) {
        bd = d;
        best = p;
      }
    }
    if (!best) return null;
    const taken = new Set();
    for (const o of this.players.values()) if (o.mode === 'world' && o.st && (o.st[S.RIDE] | 0) === best.id) taken.add(o.st[S.SEAT] | 0);
    let seat = 0;
    for (let k = BOAT_SEATS; k >= 1; k--) if (!taken.has(k)) seat = k;
    return { p: best, seat };
  }
  boardRide(p, seat) {
    if (!p.remote.boat) return;
    this.fishing.reelIn(true);
    const ride = (this.ride = new Ride(p.id, p.remote.boat, seat));
    this.player.boat = ride;
    this.player.yaw = ride.yaw;
    this.player.pitch = -0.1;
    this.audio.step(true, true);
    this.ev('boat', { k: 'ride', to: p.id });
    this.ui.toast(`Вы в лодке у ${p.card.name}. Забрасывать можно, когда лодка стоит`, 'good', 4200);
  }
  nearMooring(x, z) {
    let best = 0;
    let bd = 1e9;
    MOORINGS.forEach((m, k) => {
      const d = Math.hypot(m.x - x, m.z - z);
      if (d < bd) {
        bd = d;
        best = k;
      }
    });
    return best;
  }
  /** Сойти с лодки друга на причал mi. forced — лодки больше нет: хозяин сдал её, ушёл в лобби или потерял связь. */
  leaveRide(mi, forced = false) {
    const ride = this.ride;
    if (!ride) return;
    this.ride = null;
    this.player.boat = null;
    this.fishing.reelIn(true);
    const m = MOORINGS[mi] || MOORINGS[0];
    // на шаг в сторону от места, куда выходит хозяин, — чтобы не встать друг в друга
    const side = ride.seatI === 1 ? 1 : -1;
    let x = m.sx + Math.cos(m.syaw) * 0.9 * side;
    let z = m.sz - Math.sin(m.syaw) * 0.9 * side;
    if (!canStand(x, z)) {
      x = m.sx;
      z = m.sz;
    }
    this.player.place(x, z, m.syaw);
    this.audio.motor(-1);
    this.audio.step(true, true);
    this.ev('boat', { k: 'off' });
    this.ui.toast(forced ? `Лодка ушла из-под вас — вы на причале: ${m.name}` : `${m.name}. Вы на причале`, forced ? '' : 'good', 3200);
  }
  /** Каждый кадр, пока мы пассажир: лодку хозяина ставим раньше своей камеры, чтобы сидеть в ней без отставания. */
  rideStep(dt, pnow, tw) {
    const ride = this.ride;
    const o = this.players.get(ride.id);
    const bs = o && o.mode === 'world' && o.st ? o.st[S.BOAT] | 0 : 0;
    if (bs) {
      o.remote.update(dt, pnow, tw, this.fx, true);
      o.remote.stamp = this.frameNo;
    }
    if (!bs || !o.remote.boat) return this.leaveRide(this.nearMooring(this.player.x, this.player.z), true);
    ride.sync(o.remote.boat, o.remote.bv);
    ride.moored = bs >= 2 ? bs - 2 : -1;
    const f = this.fishing;
    if (Math.abs(ride.v) > 4 && f.lineOut && f.state !== 'fight' && f.state !== 'landed') {
      f.reelIn(true);
      this.ui.toast('Лодка пошла — леска смотана', '', 2200);
    }
  }
  /** Из меню: сразу домой, откуда бы ни было. Лодка при этом сдаётся. */
  goHome() {
    if (this.fishing.state === 'fight' || this.fishing.state === 'landed') return this.ui.toast('Сначала вытащите рыбу', 'bad');
    this.fishing.reelIn(true);
    const rode = !!this.ride;
    if (rode) this.ev('boat', { k: 'off' });
    this.resetBoat();
    const m = MOORINGS[0];
    this.player.place(m.sx, m.sz, m.syaw);
    this.ui.closePanel();
    this.ui.toast(rode ? 'Вы снова в Солнечной бухте' : 'Вы снова в Солнечной бухте. Лодка сдана', 'good', 3000);
  }
  /** В какой части мира точка. */
  areaAt(x, z) {
    if (palmR(x, z) < 2.6) return 'palm';
    if (Math.hypot(x - WRECK.x, z - WRECK.z) < WRECK.r + 14) return 'wreck';
    // остров с маяком и его причал, вынесенный на запад
    if (Math.hypot(x - ISLAND.x, z - ISLAND.z) < 44 || (x > -24 && x < -2 && z > -82 && z < -62)) return 'light';
    return Math.hypot(x - SEA.x, z - SEA.z) > SEA.r ? 'sea' : 'bay';
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
    this.questEv({ t: 'sell', total: r.total });
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
    this.syncQuests();
    this.ui.questTracker();
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
    const auto = settings.quality === 'auto';
    if (!this.params.get('q')) {
      if (!auto) {
        this.gfx.setQuality(settings.quality);
        if (this.auto || settings.drs === false) this.gfx.setScale(1); // выбрали качество сами — разрешение полное
      } else if (!this.auto && !this.booting) {
        // вернулись на «авто»: берём то, что подобрано для этой видеокарты
        const a = settings.autoQ;
        if (a && a.gpu === this.perf.gpu && QUALITIES.includes(a.tier)) {
          this.gfx.setQuality(a.tier);
          this.gfx.setScale(a.scale || 1);
        }
      }
    }
    this.auto = auto;
    this.tuner = newTuner();
    if (this.perfOn !== !!settings.fps) this.togglePerf(!!settings.fps);
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
        this.fauna.scare(d.x, d.z, 2.4);
        if (d.short) ui.toast('Недолёт: держите кнопку дольше — до белой риски', '', 2200);
        else if (d.hot) ui.toast('Прямо в косяк!', 'good', 1600);
        return this.ev('land', { x: +d.x.toFixed(1), z: +d.z.toFixed(1) });
      case 'nibble':
        this.fauna.nibble();
        return a.nibble();
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
        this.fauna.baitTaken();
        ui.alert(null);
        ui.banner('НА КРЮЧКЕ!');
        a.hook();
        this.rumble(120, 0.6);
        const c = this.fishing.catch;
        return this.ev('hook', { sp: c.sp, len: c.len });
      }
      case 'warn': return a.warn();
      case 'run':
        this.fauna.scare(this.fishing.bx, this.fishing.bz, 3);
        a.splash(0.6);
        return this.rumble(180, 0.8);
      case 'jump':
        this.fauna.scare(d.x, d.z, 3.5);
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
        {
          // чем реже рыба, тем заметнее момент: встряска камеры и цветная вспышка
          const rar = f ? f.rar : c.sp === 'chest' ? 4 : 0;
          this.player.shake = Math.max(this.player.shake, 0.35 + rar * 0.28);
          if (rar >= 2) ui.flash(RARITY[rar].color);
        }
        this.tourCatch(c);
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
        this.questEv({ t: 'catch', c, zone: d.zone, boat: d.boat, released: d.released, wx: this.weather.kind });
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
    if ((m.k === 'land' || m.k === 'jump') && d.x != null) this.fauna.scare(d.x, d.z, 2.6);
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
    else if (m.k === 'boat' && d.k === 'rent') this.ui.feed(`${name} берёт лодку и выходит в море`);
    else if (m.k === 'boat' && d.k === 'ride') {
      const to = Number(d.to);
      const host = this.players.get(to);
      if (to === this.me.id) {
        this.ui.feed(`${name} садится к вам в лодку`);
        this.audio.step(true, true);
      } else if (host) this.ui.feed(`${name} садится в лодку к <b>${esc(host.card.name)}</b>`);
    } else if (m.k === 'boat' && d.k === 'off') this.ui.feed(`${name} сходит на причал`);
  }

  // ───── задания на день ─────
  /** Задания на сегодня (день — по часам игрока). Возвращает true, если выданы новые. */
  syncQuests() {
    const d = new Date();
    if (!syncQuests(this.profile, questDay(d.getTime(), d.getTimezoneOffset()))) return false;
    saveProfile(this.profile);
    this.ui.questTracker();
    return true;
  }
  /** Событие игры (улов, продажа, турнир) → задания: счёт, награды, сообщения. */
  questEv(ev) {
    const p = this.profile;
    const r = questEvent(p, ev);
    if (r.done.length) {
      for (const q of r.done) this.ui.toast(`Задание выполнено: ${questText(q)}`, 'gold', 4200);
      this.ui.toast(`Награда: +${fmtCoins(r.coins)} монет, опыт +${r.xp}`, 'good', 4200);
      if (r.bonus) this.ui.toast(`Все задания дня выполнены! Премия +${fmtCoins(r.bonus)} монет`, 'gold', 5200);
      this.audio.coin(3);
      if (r.levelUp) {
        this.audio.level();
        this.ui.toast(`Уровень ${r.levelUp} — ${levelInfo(p.xp).title}!`, 'gold', 4000);
        this.sendCard();
      }
      saveProfile(p);
      this.ui.refreshHud();
      if (this.ui.panel === 'quests') this.ui.rerender();
    }
    this.ui.questTracker();
    return r;
  }

  // ───── турнир ─────
  tourNow() {
    return this.solo || !this.net.room ? Date.now() : this.net.now();
  }
  /** Хозяин комнаты (или игрок в одиночку) запускает турнир. */
  startTour(kind, len) {
    if (this.tour) return this.ui.toast('Турнир уже идёт', 'bad');
    if (this.state !== 'world') return this.ui.toast('Сначала выйдите на рыбалку', 'bad');
    this.ui.closePanel();
    if (!this.solo) return this.net.send({ t: 'tour', a: 'start', kind, len });
    const now = Date.now();
    this.setTour({ id: now, kind, len, start: now + TOUR_COUNTDOWN * 1000, end: now + (TOUR_COUNTDOWN + len) * 1000, by: this.me.id, scores: [], solo: true });
  }
  stopTour() {
    if (!this.tour) return;
    this.ui.closePanel();
    if (this.tour.solo) this.endTour(null, true);
    else this.net.send({ t: 'tour', a: 'stop' });
  }
  /** Турнир объявлен (или мы вошли в комнату, где он уже идёт). */
  setTour(t, late = false) {
    this.tour = { ...t, scores: new Map((t.scores || []).map((r) => [r.id, r])), begun: late && this.tourNow() >= t.start };
    this.tourKey = '';
    const by = t.by === this.me.id ? '' : (this.players.get(t.by) || { card: { name: '' } }).card.name;
    const name = TOURS[t.kind].name;
    if (late) return this.ui.feed(`Идёт турнир: <b>${name}</b>`);
    this.ui.feed(t.solo ? `Заплыв на время: <b>${name}</b>` : `${by ? `<b>${esc(by)}</b> объявляет турнир` : 'Турнир объявлен'}: <b>${name}</b>, ${Math.round(t.len / 60)} мин`);
    this.audio.tone(523, 0.12, 'triangle', 0.14);
    this.audio.tone(784, 0.2, 'triangle', 0.14, null, 0.14);
    if (this.ui.panel === 'tour') this.ui.rerender();
  }
  /** Свой улов во время заплыва в одиночку (в комнате очки считает сервер). */
  tourCatch(c) {
    const t = this.tour;
    if (!t || !t.solo) return;
    const now = this.tourNow();
    if (now < t.start || now >= t.end) return;
    const row = t.scores.get(this.me.id) || { id: this.me.id, name: this.profile.name || 'Рыбак', slot: this.me.slot, s: tourBlank() };
    if (tourAdd(row.s, c, now - t.start)) t.scores.set(this.me.id, row);
    this.tourKey = '';
  }
  /** Турнир кончился: m — итоги от сервера; в одиночку считаем сами. */
  endTour(m, early = false) {
    const t = this.tour;
    if (!t || (m && m.id !== t.id)) return;
    this.tour = null;
    this.ui.tourHud(null);
    const p = this.profile;
    const table = m ? m.table : tourTable(t.kind, [...t.scores.values()]);
    const players = m ? Math.max(m.n || 0, table.length) : 1;
    const mine = table.find((r) => r.id === this.me.id);
    const res = { kind: t.kind, len: t.len, solo: !!t.solo, early: !!(m ? m.early : early), table, players, me: this.me.id, place: mine ? mine.place : 0, score: mine ? tourScoreText(t.kind, mine.s) : '', prize: 0, medal: 0 };
    if (mine && mine.place) {
      if (t.solo) {
        res.medal = tourMedal(t.kind, t.len, this.fishing.kit, mine.s);
        res.prize = medalPrize(res.medal, t.len);
      } else res.prize = tourPrize(mine.place, players, t.len);
      p.stats.tours = (p.stats.tours || 0) + 1;
      if (res.medal || (!t.solo && players >= 2 && mine.place <= 3)) p.stats.medals = (p.stats.medals || 0) + 1;
      p.coins += res.prize;
    }
    this.lastTour = res;
    const head = t.solo ? (res.medal ? `Заплыв окончен — ${MEDALS[res.medal]}!` : 'Заплыв окончен') : res.place === 1 && players >= 2 ? 'Турнир окончен — вы победили!' : res.place ? `Турнир окончен — ваше место: ${res.place}` : 'Турнир окончен';
    this.ui.toast(`${head}${res.score ? ` · ${res.score}` : ''}${res.prize ? ` · +${fmtCoins(res.prize)} монет` : ''}`, res.prize ? 'gold' : '', 6000);
    if (res.prize) this.audio.coin(4);
    if (res.medal === 3 || (res.place === 1 && players >= 2)) this.audio.level();
    if (mine && mine.place) this.questEv({ t: 'tour' });
    saveProfile(p);
    this.ui.refreshHud();
    // итоги — на весь экран, если руки свободны; иначе они ждут в меню «Турнир»
    const f = this.fishing;
    if (this.state === 'world' && (!this.ui.panel || this.ui.panel === 'tour') && !this.ui.chatOpen && (f.state === 'idle' || f.state === 'wait')) this.ui.openPanel('tour', { result: true });
    else if (this.ui.panel === 'tour') this.ui.rerender();
  }

  // ───── клавиши вне игрового цикла ─────
  onKey(e) {
    const ui = this.ui;
    if (e.code === 'F3') {
      e.preventDefault();
      return this.togglePerf();
    }
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
      else if (e.code === 'KeyK') ui.openPanel('quests');
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
    if (i.hit('KeyK') && !busy) return ui.openPanel('quests');
    if (i.hit('KeyT') && !busy) return ui.openPanel('tour');
    const boat = this.boat;
    const ride = this.ride;
    if (i.hit('KeyC') && !busy) return boat.active || ride ? ui.toast('В лодке не переодеться — сначала причальте') : ui.openPanel('editor');
    if (i.hit('KeyQ') && !busy) this.cycleTackle();
    if (i.hit('KeyX') && !f.lineOut && !boat.active && !ride) this.player.toggleSit();
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
    // что сейчас делает кнопка «действие»: рынок, лодка, причал
    const pl = this.player;
    let act = null;
    if (!f.lineOut && f.state !== 'charge') {
      // друг сидит в своей лодке у настила и ждёт — садимся к нему (свою лодку берут у прилавка будки или когда он отойдёт)
      const rt = ride || boat.active ? null : this.rideTarget(true);
      if (ride) {
        // пассажир: сойти можно у любого причала — когда лодка стоит у него или подошла и не спешит
        let mi = ride.moored;
        if (mi < 0 && Math.abs(ride.v) < 6) {
          const g = ride.vis.group.position;
          MOORINGS.forEach((m, k) => {
            if (Math.hypot(m.x - g.x, m.z - g.z) < 9) mi = k;
          });
        }
        if (mi >= 0) act = { text: `СОЙТИ НА ПРИЧАЛ — ${MOORINGS[mi].name.toUpperCase()}`, short: 'СОЙТИ', run: () => this.leaveRide(mi) };
      } else if (rt && rt.seat) act = { text: `СЕСТЬ В ЛОДКУ — ${rt.p.card.name.toUpperCase()}`, short: 'К ДРУГУ', run: () => this.boardRide(rt.p, rt.seat) };
      else if (boat.active) {
        const mi = boat.mooringNear();
        if (mi >= 0) {
          const m = MOORINGS[mi];
          act = m.rent && !boat.away ? { text: 'ВЫЙТИ НА ПИРС', short: 'НА ПИРС' } : { text: `${m.rent ? 'ПРИЧАЛИТЬ И СДАТЬ ЛОДКУ' : 'ПРИЧАЛИТЬ'} — ${m.name.toUpperCase()}`, short: 'ПРИЧАЛИТЬ' };
          act.run = () => this.dock(mi);
        }
      } else if (Math.hypot(pl.x - MARKET.x, pl.z - MARKET.z) < MARKET.r) act = { text: 'РЫНОК — ПРОДАТЬ УЛОВ, КУПИТЬ СНАСТИ', short: 'РЫНОК', run: () => ui.openPanel('sell') };
      // к лодке можно подойти самой, а дома — ещё и к прилавку будки проката
      else if (Math.hypot(pl.x - boat.x, pl.z - boat.z) < 3.6 || Math.hypot(pl.x - MOORINGS[boat.moor].sx, pl.z - MOORINGS[boat.moor].sz) < 2.6 || (boat.moor === 0 && Math.hypot(pl.x - RENT_DESK.x, pl.z - RENT_DESK.z) < RENT_DESK.r)) {
        const price = this.boatPrice();
        act = boat.rented ? { text: 'СЕСТЬ В ЛОДКУ', short: 'В ЛОДКУ', run: () => this.boardBoat() } : { text: `ЛОДКА НАПРОКАТ — ${price ? `${price} МОНЕТ` : 'ПЕРВЫЙ ВЫХОД БЕСПЛАТНО'}`, short: 'ЛОДКА', run: () => this.rentBoat() };
      } else {
        // лодка друга, оставленная у причала (или стоящая у берега): можно сесть и подождать хозяина
        const any = this.rideTarget();
        if (any) act = any.seat ? { text: `СЕСТЬ В ЛОДКУ — ${any.p.card.name.toUpperCase()}`, short: 'К ДРУГУ', run: () => this.boardRide(any.p, any.seat) } : { text: `В ЛОДКЕ НЕТ МЕСТА — ${any.p.card.name.toUpperCase()}`, short: '', run: () => {} };
      }
    }
    const noMouse = !i.grab && !i.touch.on && i.device !== 'pad';
    ui.prompt(noMouse ? 'КЛИКНИТЕ ПО ИГРЕ — ВЗЯТЬ УПРАВЛЕНИЕ' : act ? (i.touch.on ? act.text : `${ui.key('use')} ${act.text}`) : '');
    this.useAct = act;
    if (act && i.hit('KeyE')) act.run();
  }
  hints() {
    const ui = this.ui;
    const f = this.fishing;
    const k = (a) => ui.key(a);
    const sep = '<i class="sep"></i>';
    switch (f.state) {
      case 'idle':
        if (this.ride) return `<span>ВЫ ПАССАЖИР</span>${sep}<span>${k('primary')} УДЕРЖИВАЙ — ЗАБРОС, КОГДА ЛОДКА СТОИТ</span>`;
        if (this.boat.active) return this.input.device === 'pad' ? `<span>${k('left')} ХОД И РУЛЬ</span>${sep}<span>${k('primary')} УДЕРЖИВАЙ — ЗАБРОС</span>` : `<span><kbd class="g">W</kbd><kbd class="g">S</kbd> ХОД</span>${sep}<span><kbd class="g">A</kbd><kbd class="g">D</kbd> РУЛЬ</span>${sep}<span>${k('primary')} УДЕРЖИВАЙ — ЗАБРОС</span>`;
        return `<span>${k('primary')} УДЕРЖИВАЙ — ЗАБРОС</span>${sep}<span>${k('tackle')} СНАСТИ</span>${sep}<span>${k('run')} БЕГ</span>`;
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
          t.run = l > 0.92; // стик до упора — бежим
          stick.classList.toggle('run', t.run);
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
          t.run = false;
          stick.classList.remove('run');
          knob.style.transform = '';
        } else if (c.identifier === lid) lid = null;
      }
    };
    this.touchReset = () => {
      sid = lid = null;
      t.mx = t.mz = 0;
      t.primary = false;
      t.run = false;
      stick.classList.remove('run');
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
    const act = show && this.useAct ? this.useAct.short : '';
    const inBoat = this.boat.active || !!this.ride;
    const key = `${st}|${f.lure ? 1 : 0}|${act}|${this.solo ? 1 : 0}|${this.player.sit ? 1 : 0}|${inBoat ? 1 : 0}`;
    if (key === this.touchKey) return;
    this.touchKey = key;
    $('#touch').classList.toggle('hidden', !show);
    if (!show) return this.touchReset();
    $('#tAct').textContent = { idle: 'ЗАБРОС', charge: 'ОТПУСТИ', cast: '…', wait: f.lure ? 'ВЕДИ' : 'ЖДЁМ', bite: 'ПОДСЕКАЙ', fight: 'МОТАЙ', landed: 'В САДОК' }[st] || 'ЗАБРОС';
    $('#tAct').classList.toggle('dim', st === 'cast' || (st === 'wait' && !f.lure));
    $('#tAct').classList.toggle('go', st === 'bite');
    $('#tR').textContent = st === 'landed' ? 'ОТПУСТИТЬ' : 'СМОТАТЬ';
    $('#tR').classList.toggle('hidden', st !== 'landed' && st !== 'wait');
    $('#tE').classList.toggle('hidden', !(act && st === 'idle'));
    if (act) $('#tE').textContent = act;
    $('#tSit').classList.toggle('hidden', st !== 'idle' || !!act || inBoat);
    $('#tSit').textContent = this.player.sit ? 'ВСТАТЬ' : 'СЕСТЬ';
    $('#tChat').classList.toggle('hidden', this.solo || st === 'fight' || st === 'landed');
    $('#hotbar').classList.toggle('hidden', st === 'fight' || st === 'charge');
    $('#stick').classList.toggle('steer', st === 'fight');
  }

  // ───── главный цикл ─────
  frame(now) {
    if (!this.manual) requestAnimationFrame((t) => this.frame(t)); // при замерах кадры идут по команде, а не по часам экрана
    const frameT0 = performance.now();
    const rawMs = now - this.last;
    const dt = Math.max(0, Math.min(0.1, rawMs / 1000)) * this.timeScale;
    this.last = now;
    if (this.gfx.resize()) {
      this.camera.aspect = this.gfx.w / this.gfx.h;
      this.camera.updateProjectionMatrix();
      this.fishing.line.resize(this.gfx.w, this.gfx.h);
      for (const p of this.players.values()) p.remote.line.resize(this.gfx.w, this.gfx.h);
    }
    const i = this.input;
    i.poll();
    this.frameNo++;
    const pnow = performance.now() / 1000;
    const T = this.nowSec();
    this.hours = this.fixedHour != null ? this.fixedHour : this.state === 'title' ? 10.5 + Math.sin(T * 0.01) : clockHours(T, 8);
    // погода: на заставке всегда ясно; при входе в бухту ставится сразу, дальше меняется плавно
    const wx = (this.weather = this.state === 'title' ? weatherAt('title', 0) : weatherAt(this.seed, Math.max(0, T), this.forceWx));
    this.world.setWeather(wx, this.wxSeed === this.seed ? dt : 0);
    this.wxSeed = this.seed;
    this.audio.rain(wx.rain, wx.wind);
    this.audio.wet = wx.rain;
    this.world.setClock(this.hours);
    this.fx.setLight(1 - this.world.night); // ночью брызги и пена не светятся белым
    setEnvLight(0.22 + 0.78 * (1 - this.world.night));
    this.audio.night = this.world.night;
    const tw = this.state === 'title' ? now / 1000 : T;
    const cam = this.camera;
    const ui = this.ui;

    const boat = this.boat;
    if (this.state === 'world') {
      this.worldKeys();
      const f = this.fishing;
      const free = !f.lineOut && !ui.panel;
      // лодка: сначала ход и качка, потом камера садится на банку
      if (boat.active) {
        boat.drive(dt, free ? i.moveZ : 0, free ? i.moveX : 0, f.lineOut);
        if (!boat.away && Math.hypot(boat.x - MOORINGS[0].x, boat.z - MOORINGS[0].z) > 14) boat.away = true;
      }
      boat.update(dt, tw);
      if (this.ride) this.rideStep(dt, pnow, tw);
      // мотор слышно и пассажиру — пока хозяин в лодке
      this.audio.motor(boat.active ? Math.abs(boat.k) : this.ride && this.ride.moored < 0 ? Math.abs(this.ride.k) : -1);
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
      {
        // вышли за край карты бухты — показываем всё море; обратно переключаемся с запасом, чтобы карта не мигала на границе
        const pl = this.player;
        const mg = this.mapSea ? 8 : 0;
        this.mapSea = pl.x < MAP_VIEW.x0 + mg || pl.x > MAP_VIEW.x1 - mg || pl.z < MAP_VIEW.z0 + mg || pl.z > MAP_VIEW.z1 - mg;
        ui.minimap(pl, [...this.players.values()].filter((p) => p.mode === 'world' && p.st).map((p) => ({ x: p.st[S.X], z: p.st[S.Z], slot: p.slot })), kit.sonar ? this.world.scenery.schools.centers : null, this.mapSea ? SEA_VIEW : MAP_VIEW, boat.rented && !boat.active ? boat : null);
      }
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
        const rd = this.ride;
        this.net.send({ t: 'st', s: [pl.x, pl.y + pl.jump, pl.z, pl.yaw, pl.pitch, boat.active ? boat.v : pl.speed, n.fs, n.bx, n.by, n.bz, n.t, flags, n.k, i.steer, 0, boat.yaw, boat.net, rd ? rd.id : 0, rd ? rd.seatI : 0] });
      }
    } else {
      boat.update(dt, tw);
      if (this.state === 'title' || !this.editing) this.lobbyCamera(dt, now / 1000);
    }
    if (this.editing) this.editCamera(dt);

    // друзья: сначала те, кто сам по себе, потом пассажиры — их сажают в уже поставленную лодку хозяина
    const tags = [];
    const plates = [];
    const showPlates = this.state === 'lobby' && !ui.panel;
    const rideOf = (p) => (p.mode === 'world' && p.st ? p.st[S.RIDE] | 0 : 0);
    const crew = [...this.players.values()];
    if (crew.some(rideOf)) crew.sort((a, b) => (rideOf(a) ? 1 : 0) - (rideOf(b) ? 1 : 0));
    for (const p of crew) {
      const r = p.remote;
      const vid = this.voice.vidOf(p.id);
      r.talk = vid != null ? this.voice.level(vid) : 0;
      if (p.mode === 'world') {
        const rid = rideOf(p);
        if (r.stamp !== this.frameNo) r.update(dt, pnow, tw, this.fx, !!p.st, rid ? this.rideBoat(rid) : null);
      } else r.lobbyPose(dt, lineX(p.slot), DECK_Y, LINE_Z, (p.slot % 3) + 1);
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
    this.fill.intensity = damp(this.fill.intensity, showMe ? (this.world.night > 0.5 ? 0.55 : 1.0) : 0, 6, dt);
    this.fill.visible = this.fill.intensity > 0.01; // погашенная подсветка не должна считаться в шейдерах всей сцены
    if (this.fill.intensity > 0.01) {
      this.fill.position.copy(this.camera.position);
      this.camera.getWorldDirection(this.fill.target.position).multiplyScalar(6).add(this.camera.position);
    }
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
    // турнир: отсчёт, табло, конец заплыва в одиночку
    if (this.tour) {
      const t = this.tour;
      const tn = this.tourNow();
      if (!t.begun && tn >= t.start) {
        t.begun = true;
        if (this.state === 'world') {
          ui.banner('ТУРНИР НАЧАЛСЯ!', 'cy', 1800);
          this.audio.tone(880, 0.3, 'triangle', 0.16);
        }
      }
      if (t.solo && tn >= t.end) this.endTour(null);
      else if (this.state === 'world') {
        const left = Math.ceil((tn < t.start ? t.start - tn : t.end - tn) / 1000);
        const key = `${t.id}|${tn < t.start ? 'pre' : 'on'}|${left}`;
        if (key !== this.tourKey) {
          this.tourKey = key;
          ui.tourHud(t, tn, this.me.id);
        }
      }
    }
    if (this.state === 'world' && (this.crewT = (this.crewT || 0) - dt) <= 0) {
      this.crewT = 0.25;
      ui.setCrew(this.roster());
      this.market();
      // погода в углу экрана и в ленте; новые задания, если наступила полночь
      ui.weather(wx);
      if (wx.kind !== this.wxKind) {
        const add = Math.round((WEATHER[wx.kind].bite - 1) * 100);
        if (this.wxKind) ui.feed({ clear: 'Распогодилось — снова солнце', cloudy: `Небо затянуло. Рыба берёт охотнее: клёв <b class="y">+${add}%</b>`, rain: `Пошёл дождь. В дождь клюёт лучше всего: <b class="y">+${add}%</b>`, fog: `На бухту лёг туман. Клёв <b class="y">+${add}%</b>` }[wx.kind]);
        this.wxKind = wx.kind;
      }
      if ((this.questT = (this.questT || 0) + 1) % 120 === 0 && this.syncQuests()) ui.toast('Новый день — новые задания (клавиша K)', 'gold', 4000);
      // где мы: подпись в углу и подсказка, чем место интересно (один раз)
      const area = this.areaAt(this.player.x, this.player.z);
      if (area !== this.area) {
        this.area = area;
        $('#locName').textContent = AREAS[area][0];
        this.areaSeen = this.areaSeen || new Set(['bay']);
        if (!this.areaSeen.has(area)) {
          this.areaSeen.add(area);
          ui.toast(AREAS[area][1], 'gold', 5200);
        }
      }
    }
    this.vendor.update(dt, { mode: 'idle', variant: ui.panel === 'sell' || ui.panel === 'shop' ? 1 : 0, talk: ui.panel === 'sell' ? 0.3 : 0 });

    if (this.camOverride) {
      // проверка компьютера: вид задан, игрок и меню не при чём
      cam.position.set(...this.camOverride.p);
      cam.lookAt(...this.camOverride.t);
      cam.fov = 60;
      cam.updateProjectionMatrix();
    }
    const schools = this.world.scenery.schools;
    schools.update(hashStr(this.seed), Math.max(0, T));
    {
      // живность: рыба подходит к наживке за несколько секунд до поклёвки; лодка на ходу распугивает мелочь
      const F = this.fishing, wu = this.world.water.uniforms, bt = this.player.boat;
      this.fauna.bait(this.state === 'world' && (F.state === 'wait' || F.state === 'bite') ? { x: F.bx, z: F.bz, left: F.biteLeft, bite: F.state === 'bite' } : null);
      if (bt && Math.abs(bt.v) > 0.8 && (this.scareT = (this.scareT || 0) - dt) <= 0) {
        this.scareT = 0.3;
        this.fauna.scare(this.player.x, this.player.z, 4.5, 0.9);
      }
      this.fauna.update(dt, tw, Math.max(0, T), hashStr(this.seed), cam, { light: wu.uLight.value, night: this.world.night, rain: this.world.wx.rain, sun: clamp(wu.uGlitter.value, 0, 1), sunCol: wu.uSunCol.value, water: wu.uShallow.value, fx: this.fx }, schools.centers);
    }
    this.world.update(dt, tw, cam);
    this.fx.update(dt, tw);
    if (!this.noRender || window.__render) {
      window.__render = false;
      this.gfx.render(this.scene, cam, this.world.exposure);
      window.__rendered = (window.__rendered || 0) + 1;
    }
    if (!this.shot && (this.state === 'title' || this.state === 'lobby') && !this.noRender && (this.shotTries = (this.shotTries || 0) + 1) < 40) {
      this.takeShot();
      if (this.shot) {
        // снимок делался с другой точки — возвращаем кадр на место, чтобы картинка не мигнула
        this.world.update(0, tw, cam);
        this.gfx.render(this.scene, cam, this.world.exposure);
      }
    }
    i.endFrame();
    window.__frames = (window.__frames || 0) + 1;
    this.frameMs = this.frameMs * 0.95 + rawMs * 0.05;
    if (!this.manual) {
      this.perf.push(rawMs);
      if (this.tunePlan) {
        // Прежде чем упрощать картинку, проверяем, что кадры долгие из-за неё: ждём видеокарту и смотрим цену этого кадра.
        // Браузер в режиме экономии сам держит 30 кадров в секунду — тогда упрощать бесполезно, картинка станет хуже даром.
        const plan = this.tunePlan;
        this.tunePlan = null;
        const gl = this.gfx.renderer.getContext();
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, (this.px1 = this.px1 || new Uint8Array(4)));
        const work = performance.now() - frameT0;
        this.lastWork = work;
        if (work > TARGET_MS * 0.6) this.applyTune(plan);
        else this.tuner.hold = 20; // десять секунд не трогаем: дело не в отрисовке
      }
      this.tune(rawMs);
      if (this.perfOn && (this.perfT = (this.perfT || 0) + rawMs) > 500) {
        this.perfT = 0;
        this.ui.perfBox(this.perfLine());
      }
    }
  }
  /**
   * Загрузка за заставкой: модели локации, шейдеры, текстуры и подбор качества. Всё, что иначе случилось бы
   * рывками уже в игре (первая отрисовка предмета — сборка его шейдера и отправка текстур), делается здесь.
   */
  async boot() {
    const el = $('#boot'), fill = $('#bootFill'), txt = $('#bootTxt');
    const say = (k, text) => {
      if (fill) fill.style.transform = `scaleX(${k.toFixed(3)})`;
      if (txt && text) txt.textContent = text;
    };
    const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
    // проверкам (?norender) ждать нечего; ?boot=full — пройти загрузку целиком и в них
    const quick = (this.noRender || this.offline) && this.params.get('boot') !== 'full';
    this.booting = true;
    try {
      if (!quick) {
        say(0.3, 'Загружаем модели…');
        const sc = this.world.scenery;
        for (let i = 0; i < 120; i++) {
          // не дольше 12 секунд: на медленной сети остальное догрузится уже на заставке
          const e = sc.envState();
          const got = [e.trees, e.palms, e.rocks, e.lighthouse, e.kiosk, e.lamps > 0, !sc.propsState().fallback].filter(Boolean).length;
          say(0.3 + 0.3 * (got / 7));
          if (got === 7) break;
          await wait(100);
        }
        // без видеокарты (программная отрисовка) «высокое» незачем даже собирать
        if (this.auto && !this.params.get('q') && !settings.autoQ && isSoftware(this.perf.gpu)) this.gfx.setQuality('low');
        say(0.6, 'Готовим видеокарту…');
        await this.gfx.prepare(this.scene, this.camera, (k) => say(0.6 + 0.26 * k), Object.values(surfaceU).map((u) => u.value));
        if (this.auto && !this.params.get('q')) {
          say(0.86, 'Подбираем качество…');
          await this.calibrate();
        }
        say(0.94, 'Зажигаем фонари…');
        await this.prelight();
        // один кадр за заставкой: соберётся то, что собирается только при отрисовке (шейдеры теней), и уйдут буферы
        this.manual = true;
        if (this.noRender) window.__render = true;
        this.frame(performance.now());
        await yieldNow();
      } else if (this.auto && !this.params.get('q') && settings.autoQ && settings.autoQ.gpu === this.perf.gpu) {
        this.gfx.setScale(settings.autoQ.scale || 1);
        if (settings.autoQ.refl === false) this.gfx.reflect = false;
      }
    } catch (e) {
      console.warn('загрузка', e);
    }
    this.booting = false;
    say(1);
    if (el) {
      el.classList.add('gone');
      setTimeout(() => el.remove(), 700);
    }
    this.manual = false;
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }
  /**
   * Ночью горят фонари, в лобби героя подсвечивает лампа у камеры — а число источников света зашито в шейдеры всей сцены.
   * Собираем оба набора заранее (браузер делает это в фоне): на закате и при входе в лобби рывка не будет.
   */
  async prelight() {
    const lamps = this.world.scenery.lampLights;
    const r = this.gfx.renderer;
    const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
    const withLights = (L, F, fn) => {
      const keep = [lamps.map((l) => l.visible), this.fill.visible];
      lamps.forEach((l) => (l.visible = L));
      this.fill.visible = F;
      try {
        return fn();
      } finally {
        lamps.forEach((l, i) => (l.visible = keep[0][i]));
        this.fill.visible = keep[1];
      }
    };
    // лобби понадобится через несколько секунд — ждём его шейдеры за заставкой (кадры в это время не рисуются)
    try {
      await withLights(false, true, () => Promise.race([r.compileAsync(this.scene, this.camera), wait(20000)]));
    } catch (e) {
      /* соберутся, когда понадобятся */
    }
    // ночь наступит не скоро: её шейдеры отдаём собирать в фоне, когда заставка уже ушла
    setTimeout(() => {
      try {
        withLights(true, false, () => r.compile(this.scene, this.camera));
      } catch (e) {
        /* соберутся на закате */
      }
    }, 2500);
  }
  /** Цена кадра, мс: рисуем кадр и ждём, пока видеокарта его закончит, — так видно настоящее время, а не частоту экрана. */
  async frameCost(n = 8, warm = 3) {
    const gl = this.gfx.renderer.getContext();
    const px = new Uint8Array(4);
    const ms = [];
    const manual = this.manual;
    this.manual = true;
    for (let i = 0; i < n + warm; i++) {
      const t = performance.now();
      if (this.noRender) window.__render = true;
      this.frame(t);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      if (i >= warm) ms.push(performance.now() - t);
      if (i % 4 === 3) await yieldNow(); // заставка и страница должны дышать
    }
    this.manual = manual;
    return ms.sort((a, b) => a - b)[ms.length >> 1];
  }
  /**
   * Подбор качества под машину (на «авто»). Меряем цену кадра заставки: дорого — ступень ниже и новый замер;
   * укладываемся с небольшим превышением — берём разрешение поменьше. Итог запоминается для этой видеокарты,
   * в следующий раз игра начнёт сразу с него. force — мерить заново.
   */
  async calibrate(force = false) {
    const g = this.gfx;
    const gpu = this.perf.gpu;
    const saved = settings.autoQ;
    // запомненное годится неделю: машину могли замерить в неудачный момент, а сама вверх по ступеням игра не идёт
    const fresh = saved && saved.v === CALIB_V && Date.now() - (saved.t || 0) < 7 * 864e5;
    if (!force && fresh && saved.gpu === gpu && QUALITIES.includes(saved.tier)) {
      g.setQuality(saved.tier);
      g.setScale(saved.scale || 1);
      if (saved.refl === false) g.reflect = false; // от отражений в воде на этой машине уже отказывались
      return (this.calib = { ...saved, from: 'saved' });
    }
    g.reflect = this.params.get('refl') !== '0';
    g.setScale(1);
    let tier = isSoftware(gpu) ? 'low' : isTouch() ? 'medium' : 'high';
    g.setQuality(tier);
    const log = [];
    let ms = await this.frameCost();
    log.push([tier, +ms.toFixed(1)]);
    if (tier === 'high' && g.reflect && needDrop(ms, tier)) {
      // сначала пробуем без отражений в воде: ради них сцена рисуется второй раз, а остальная красота остаётся
      g.reflect = false;
      ms = await this.frameCost();
      log.push(['high без отражений', +ms.toFixed(1)]);
    }
    while (needDrop(ms, tier)) {
      tier = tier === 'high' ? 'medium' : 'low';
      g.reflect = this.params.get('refl') !== '0';
      g.setQuality(tier);
      // на «низком» нет теней — у всех материалов другие шейдеры: собираем их заранее, не подвешивая страницу
      await g.prepare(this.scene, this.camera);
      ms = await this.frameCost();
      log.push([tier, +ms.toFixed(1)]);
    }
    g.setScale(scaleFor(ms, tier));
    this.tuner = newTuner();
    settings.autoQ = { gpu, tier, scale: g.scale, refl: g.reflect, ms: +ms.toFixed(1), v: CALIB_V, t: Date.now() };
    saveSettings();
    return (this.calib = { ...settings.autoQ, from: 'measured', log });
  }
  /** Автоподбор на ходу: кадры проседают — уменьшаем разрешение, не помогло — картинка проще; полегчало — возвращаем. */
  tune(ms) {
    const g = this.gfx;
    if (this.params.get('q') || this.noRender || this.booting || document.hidden || ms > 400) return;
    const A = (this.tuneAcc = this.tuneAcc || { sum: 0, n: 0 });
    A.sum += ms;
    A.n++;
    if (A.sum < 500) return;
    const avg = A.sum / A.n;
    A.sum = A.n = 0;
    const out = tuneStep(this.tuner, avg, { scale: g.scale, floor: g.quality === 'low' ? 0.5 : 0.62, canDrop: this.auto && g.quality !== 'low', drs: settings.drs !== false });
    if (!out) return;
    // вверх — сразу; вниз — после проверки настоящей цены следующего кадра (см. frame)
    if (out.scale && out.scale > g.scale) this.applyTune(out);
    else this.tunePlan = out;
  }
  applyTune(out) {
    const g = this.gfx;
    if (out.scale) g.setScale(out.scale);
    else if (g.quality === 'high' && g.canPost && g.reflect) g.reflect = false; // сначала отказываемся от самого дорогого — отражений (ради них сцена рисуется второй раз)
    else {
      g.setQuality(g.quality === 'high' ? 'medium' : 'low');
      g.setScale(0.85);
    }
    if (this.auto) {
      settings.autoQ = { ...(settings.autoQ || {}), gpu: this.perf.gpu, tier: g.quality, scale: g.scale, refl: g.reflect, v: CALIB_V, t: (settings.autoQ && settings.autoQ.t) || Date.now() };
      saveSettings();
    }
  }
  /** Подбор качества заново (кнопка в «Проверке компьютера»): кадры на время замера идут по команде. */
  async recalibrate() {
    if (this.benchOn || !this.auto) return this.calib;
    this.benchOn = true;
    this.manual = true;
    await new Promise((ok) => setTimeout(ok, 60));
    const keep = [this.fixedHour, this.forceWx];
    this.fixedHour = 14.5;
    this.forceWx = 'clear';
    this.camOverride = { p: [0.5, 3, -26], t: [-6, 2.5, 30] };
    try {
      await this.calibrate(true);
    } finally {
      this.camOverride = null;
      [this.fixedHour, this.forceWx] = keep;
      this.manual = false;
      this.benchOn = false;
      this.last = performance.now();
      requestAnimationFrame((t) => this.frame(t));
    }
    return this.calib;
  }
  /** Строка для окошка F3. */
  perfLine() {
    const s = this.perf.stats(), g = this.gfx, r = g.renderer, i = r.info.render;
    const qn = { low: 'низкое', medium: 'среднее', high: 'высокое' }[g.quality];
    return `${s.fps.toFixed(0)} к/с · ${s.avg.toFixed(1)} мс · худшие ${s.p99.toFixed(0)} мс<br>${qn}${this.auto ? ' (авто)' : ''} · ${r.domElement.width}×${r.domElement.height}${g.scale < 0.99 ? ` · ${Math.round(g.scale * 100)}%` : ''}<br>вызовов ${i.calls} · треугольников ${(i.triangles / 1000).toFixed(0)} тыс.`;
  }
  togglePerf(on = !this.perfOn) {
    this.perfOn = on;
    settings.fps = on;
    saveSettings();
    this.perf.reset();
    this.ui.perfBox(on ? this.perfLine() : null);
  }
  /**
   * «Проверка компьютера»: четыре вида бухты, на каждом — цена кадра (с ожиданием видеокарты) и обычный ход по часам экрана.
   * Итог — текст, который можно скопировать и прислать: по нему видно, что на этой машине тормозит.
   */
  async bench(onStep = () => {}, { frames = 14, warm = 4, pace = 70 } = {}) {
    if (this.benchOn) return null;
    this.benchOn = true;
    const VIEWS = [['пирс', [0.5, 3, -26], [-6, 2.5, 30]], ['берег', [-22, 2.9, 13], [40, 3, 6]], ['заводь', [-28, 2.9, 4], [-44, 0.5, 15]], ['море', [-70, 2.3, -150], [10, 12, 30]]];
    const g = this.gfx, r = g.renderer;
    const keepHour = this.fixedHour, keepWx = this.forceWx;
    this.fixedHour = 14.5;
    this.forceWx = 'clear';
    this.manual = true;
    await new Promise((ok) => setTimeout(ok, 60)); // очередной кадр по часам экрана пройдёт и больше не назначится
    const rows = [];
    const deltas = [];
    let hitches = 0;
    for (let v = 0; v < VIEWS.length; v++) {
      const [name, p, t] = VIEWS[v];
      onStep(v / VIEWS.length, name);
      this.camOverride = { p, t };
      const cost = await this.frameCost(frames, warm);
      const info = { calls: r.info.render.calls, tris: r.info.render.triangles };
      // обычный ход: кадры по часам экрана, как в игре
      let last = 0;
      for (let i = 0; i < pace; i++) {
        const now = await new Promise((ok) => requestAnimationFrame(ok));
        if (this.noRender) window.__render = true;
        this.frame(now);
        if (i > Math.min(5, pace >> 1) && last) {
          deltas.push(now - last);
          if (now - last > 50) hitches++;
        }
        last = now;
      }
      rows.push({ name, cost, ...info });
    }
    this.camOverride = null;
    this.fixedHour = keepHour;
    this.forceWx = keepWx;
    this.manual = false;
    this.benchOn = false;
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
    deltas.sort((a, b) => a - b);
    const avg = deltas.reduce((s, x) => s + x, 0) / Math.max(1, deltas.length);
    const res = {
      gpu: this.perf.gpu, quality: g.quality, auto: this.auto, scale: g.scale, buf: [r.domElement.width, r.domElement.height], screen: [g.w, g.h], dpr: window.devicePixelRatio || 1,
      rows, fps: 1000 / Math.max(avg, 0.1), p99: deltas[Math.floor(deltas.length * 0.99)] || 0, max: deltas[deltas.length - 1] || 0, hitches,
      cores: navigator.hardwareConcurrency || 0, mem: navigator.deviceMemory || 0, ua: navigator.userAgent
    };
    const qn = { low: 'низкое', medium: 'среднее', high: 'высокое' }[res.quality];
    const worst = Math.max(...rows.map((x) => x.cost));
    res.verdict = res.fps >= 55 && worst < 14 ? 'Игра идёт плавно, запас есть.' : res.fps >= 50 ? 'Игра идёт плавно, но без запаса.' : res.fps >= 38 ? 'Тяжеловато: кадров меньше, чем хотелось бы.' : 'Этой машине тяжело.';
    res.text = [
      'РЫБАК — проверка компьютера',
      `Видеокарта: ${res.gpu || 'браузер не сообщил'}`,
      `Окно ${res.screen[0]}×${res.screen[1]} (×${res.dpr}), рисуется ${res.buf[0]}×${res.buf[1]}${res.scale < 0.99 ? `, разрешение ${Math.round(res.scale * 100)}%` : ''}`,
      `Качество: ${qn}${res.auto ? ' (авто)' : ''}`,
      `Цена кадра, мс: ${rows.map((x) => `${x.name} ${x.cost.toFixed(1)}`).join(', ')}`,
      `В игре: ${res.fps.toFixed(0)} к/с, худшие кадры ${res.p99.toFixed(0)} мс, самый долгий ${res.max.toFixed(0)} мс, рывков дольше 50 мс: ${hitches}`,
      `Вызовов отрисовки ${Math.min(...rows.map((x) => x.calls))}–${Math.max(...rows.map((x) => x.calls))}, треугольников ${(Math.min(...rows.map((x) => x.tris)) / 1e6).toFixed(2)}–${(Math.max(...rows.map((x) => x.tris)) / 1e6).toFixed(2)} млн`,
      `Процессор: потоков ${res.cores || '?'}, память ${res.mem ? res.mem + ' ГБ' : '?'}`,
      res.ua,
      res.verdict
    ].join('\n');
    return (this.lastBench = res);
  }
  /** Картинка бухты для карточки места в лобби — снимаем один раз с готового кадра. */
  takeShot() {
    // окно ещё не получило размер (страница открыта в фоне) — снимем на следующем кадре
    if (this.gfx.renderer.domElement.width < 64 || this.gfx.renderer.domElement.height < 64) return;
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
    // снимок идёт мимо обычного конвейера: отражение снято для другой камеры — на этот кадр вода отражает только небо
    const reflK = this.world.water.uniforms.uReflK.value;
    this.world.water.uniforms.uReflK.value = 0;
    this.gfx.renderer.render(this.scene, cam);
    this.world.water.uniforms.uReflK.value = reflK;
    try {
      const src = this.gfx.renderer.domElement;
      const k = Math.max(c.width / src.width, c.height / src.height);
      c.getContext('2d').drawImage(src, (c.width - src.width * k) / 2, (c.height - src.height * k) / 2, src.width * k, src.height * k);
      this.shot = c.toDataURL('image/jpeg', 0.86);
    } catch {
      this.shot = null; // попробуем ещё раз на следующем кадре
    }
    if (this.shot && this.state === 'lobby') this.ui.rerender();
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
  editCamera(dt = 0.016) {
    const cam = this.camera;
    const g = this.meChar.group.position;
    // по росту героя, которого сейчас примеряют: высокого снимаем с большего расстояния, чтобы он помещался с головы до пят
    const h = this.meChar.look.height;
    this.editH = damp(this.editH ?? h, h, 8, dt);
    const k = this.editH;
    // экран стоймя (планшет): список героев занимает низ экрана — героя ставим в верхнюю его часть и снимаем издалека
    const tall = cam.aspect < 1;
    const d = k * (tall ? 2 : 1.04);
    const look = (tall ? 0.26 : 0.9) * k; // чуть ниже пояса: ноги героя встают над нижней строкой с кнопками
    if (this.state === 'world') {
      const fx = -Math.sin(this.editBase);
      const fz = -Math.cos(this.editBase);
      cam.position.set(g.x + fx * 3.1 * d, g.y + 1.15 * k, g.z + fz * 3.1 * d);
      cam.lookAt(g.x, g.y + look, g.z);
    } else {
      cam.position.set(g.x, g.y + 1.15 * k, g.z + 3.2 * d);
      cam.lookAt(g.x, g.y + look, g.z);
    }
    cam.fov = 38;
    cam.updateProjectionMatrix();
  }
}

// Мир строится одним куском и занимает страницу на несколько секунд: сначала даём браузеру нарисовать заставку.
let started = false;
const start = () => {
  if (started) return;
  started = true;
  window.RYBAK = new Game();
};
if (new URLSearchParams(location.search).has('norender')) start();
else {
  requestAnimationFrame(() => setTimeout(start, 30));
  setTimeout(start, 500); // вкладка открыта в фоне: кадра не будет, строим мир и так
}
