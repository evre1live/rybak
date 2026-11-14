// РЫБАК — сборка игры: состояния (меню → лобби → рыбалка), главный цикл, связь всех частей.
import * as THREE from 'three';
import { Gfx, QUALITIES } from './gfx.js';
import { PAL, usePalette } from './palette.js';
import { loadManifest, loadHero, heroes, fpLook, heroEye, heroRim } from './hero.js';
import { loadModel, loadModels, modelInfo, modelReady, setWarmer } from './models.js';
import { setEnvLight } from './env.js';
import { adopt, buildFish, warmFish } from './fish3d.js';
import { modelShot, faceShot, fishIcon } from './icons.js';
import { World, drawMinimap, SEA_VIEW } from './world.js';
import { Character, VENDOR_PUPPET } from './character.js';
import { buildRod, itemModel } from './gear3d.js';
import { ViewModel } from './viewmodel.js';
import { Input, Player } from './player.js';
import { Fishing } from './fishing.js';
import { Fx } from './fx.js';
import { Boat, BOAT_PRICE, Ride, BOAT_SEATS, VMAX } from './boat.js';
import { Remote } from './remote.js';
import { Net } from './net.js';
import { createVoice } from './voice.js';
import { Audio2, MOTOR_FAR } from './audio.js';
import { UI } from './ui.js';
import { loadProfile, saveProfile, saveProfileNow, lockProfile, hooks as profileHooks, settings, saveSettings, session } from './profile.js';
import { Cloud } from './cloud.js';
import { S, FLAG, MARKS } from './proto.js';
import { cardText, cardFile, drawCard } from './postcard.js';
import { DECK_Y, MARKET, MOORINGS, RENT_DESK, MAP_VIEW, WORLD, canStand, FALLS, CAMPFIRE, AREAS, areaAt, HAS } from './terrain.js';
import { LOC_ID, LOC } from './loc/id.js';
import { DEFAULT_LOC, cleanLoc, canHost, locOf } from '../shared/locations.js';
import { route, routeReady } from './route.js';
import { ITEMS, FISH_BY_ID, JUNK, JUNK_BY_ID, RARITY, zoneInfo, BAITS, LURES, clockHours, dayPart, fmtW, fmtCoins, isLure } from '../shared/data.js';
import {
  marketState, hashStr, buy, equip, sell, kitStats, levelInfo, tackleCount, fishValue, newProfile, speciesWeights,
  weatherAt, WEATHER, syncQuests, questEvent, questText, questDay, claimMastery,
  TOURS, TOUR_COUNTDOWN, tourBlank, tourAdd, tourTable, tourPrize, tourMedal, medalPrize, tourScoreText, MEDALS,
  owns, assistBlock, fightAssist, recordAssist, assistXp, ASSIST_AT, ASSIST_GIANT, ASSIST_REACH, exportSave, importSave
} from '../shared/logic.js';
import { $, esc, clamp, damp, angDiff, isTouch } from './util.js';
import { Perf, isSoftware, newTuner, tuneStep, longShare, pickQuality, scaleFor, TARGET_MS, yieldNow } from './perf.js';
import { surfaceU } from './surface.js';
import { initCache, wakeServer } from './offline.js';

const SPAWNS = [[-2, 9], [0.6, 9.4], [-4, 8.2], [2.6, 8.6], [-1, 11], [1.6, 11.4], [-3.6, 11], [3.6, 10.4]];
const LINE_Z = 7;
const HOME_AREA = Object.keys(AREAS)[0]; // часть мира, где стоит база: там лавка и прокат (первая в списке локации)
const MENU_HOUR = 19.2; // который час на заставке и в лобби: золотой час (см. palette.js — ключ 19,3)
const BUMP_FAR = 80; // с какого расстояния слышен удар чужой лодки о преграду, м
const FLOCK_FAR = 130; // с какого расстояния слышны чайки над морским косяком, м
const DOLPHIN_FAR = 110; // с какого расстояния слышен всплеск дельфина после прыжка, м
const WARM_FISH = 'plotva'; // на этой модели собираются шейдеры для всей рыбы (у моделей рыб материалы устроены одинаково)
// почему рыбу друга сейчас не взять подсаком (ответ его игры на нашу просьбу; правила — assistBlock в logic.js)
const ASSIST_NO = {
  early: 'Рано: рыба ещё далеко от берега',
  far: 'Подойдите ближе к рыбаку — подсак не достаёт',
  boss: 'Легенда ещё не выдохлась — ждите её второго дыхания',
  stuck: 'Рыба залегла на дно — сначала её надо поднять',
  air: 'Рыба в воздухе — секунду!',
  late: 'Рыбу уже взяли'
};
const CALIB_V = 4; // версия правил подбора качества: сменились пороги — запомненный итог не годится, меряем заново
const lineX = (slot) => -5.0 + slot * 1.32;
const v3 = new THREE.Vector3();
/** Адрес страницы локации (и комнаты на ней): бухта — как раньше, без приставки; у остальных — ?loc=… */
const locUrl = (loc, code = '') => {
  const q = [];
  if (code) q.push('room=' + code);
  if (loc !== DEFAULT_LOC) q.push('loc=' + loc);
  return q.length ? '?' + q.join('&') : location.pathname;
};
/** Адрес комнаты в строке браузера; во встроенной рамке это может быть запрещено — тогда просто молчим. */
function setUrl(u) {
  try {
    history.replaceState(null, '', u);
  } catch {
    /* адрес не меняем */
  }
}
const VENDOR = LOC.vendor; // что говорит торговец — у каждой локации свои байки (shared/locations.js)

class Game {
  constructor() {
    const q = new URLSearchParams(location.search);
    this.params = q;
    this.urlCode = (q.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    // пробная версия без сервера (например, страница-витрина): только одиночная рыбалка
    this.offline = !!window.RYBAK_OFFLINE;
    this.profile = loadProfile();
    // сохранение на сервере: прогресс уходит туда вслед за каждым сохранением в браузере (client/cloud.js)
    this.cloud = new Cloud({
      enabled: !this.offline,
      profile: () => {
        const { fresh, ...rest } = this.profile;
        return rest;
      },
      apply: (save, sum, asked) => this.cloudApply(save, sum, asked),
      changed: () => this.cloudChanged(),
      notify: (kind) => this.cloudNotify(kind)
    });
    profileHooks.saved = () => this.cloud.touch();
    this.canvas = $('#view');
    const touch = isTouch();
    document.body.classList.toggle('touch', touch);
    this.auto = settings.quality === 'auto';
    // на «авто» начинаем с того, что подобрали на этой машине в прошлый раз (calibrate), а не с «высокого»
    const was = this.auto && settings.autoQ && settings.autoQ.v === CALIB_V && QUALITIES.includes(settings.autoQ.tier) ? settings.autoQ : null;
    this.gfx = new Gfx(this.canvas, q.get('q') || (this.auto ? (was ? was.tier : touch ? 'medium' : 'high') : settings.quality));
    setWarmer((root) => this.gfx.warm(root)); // текстуры загруженных моделей — видеокарте заранее и по одной (gfx.warm)
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
    // вода отражает мир; сама вода, пена у свай, руки с удочкой, трава и дорожки огней в отражение не попадают
    this.gfx.setReflection(this.world.water.uniforms, [this.world.water.mesh, this.world.rings, this.vm.root, this.world.grass.tufts, this.world.grass.flowers, this.world.rain.mesh, this.world.seabed.mesh, this.world.seabed.kelp, this.world.rays.mesh, this.world.nightfx.wakeMesh, ...this.world.scenery.fauna.under].filter(Boolean));
    // живность: рыба и мальки шарахаются от шагов по воде, поплавка и лодки; всплеск играющей рыбы слышен неподалёку
    this.fauna = this.world.scenery.fauna;
    this.fauna.onSplash = (x, z, pw) => {
      const d = Math.hypot(x - this.player.x, z - this.player.z);
      if (this.state === 'world' && d < 60) this.audio.splash(0.5 + pw * 0.5, clamp(1 - d / 60, 0, 1) * 0.7);
    };
    // мелочь плещется над морским косяком: вблизи слышны короткие лёгкие всплески
    this.fauna.onBoil = (x, z) => {
      const d = Math.hypot(x - this.player.x, z - this.player.z);
      if (this.state === 'world' && d < 45) this.audio.splash(0.2, clamp(1 - d / 45, 0, 1) * 0.4);
    };
    // дельфин после прыжка уходит в воду: тяжёлый всплеск слышен издалека
    this.fauna.dolphins.onLeap = (x, z) => {
      const d = Math.hypot(x - this.player.x, z - this.player.z);
      if (this.state === 'world' && d < DOLPHIN_FAR) this.audio.splash(1, clamp(1 - d / DOLPHIN_FAR, 0, 1) * 0.75);
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
    this.boat.onBump = (sp, edge, x, z) => {
      this.boatBump(sp, edge, x, z, true);
      if (edge) this.ui.toast('Дальше — только океан. Поворачиваем назад', '', 2600);
      // удар слышат и чувствуют пассажиры, слышат все, кто рядом
      this.ev('boat', { k: 'bump', s: Math.round(sp * 10) / 10, e: edge ? 1 : 0, x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10 });
    };
    // мягкий свет от камеры на экране команды и в редакторе: лица не должны тонуть в тени, когда солнце сзади
    // Погашенная, она остаётся среди источников света: набор источников у сцены один на всю игру (см. setNight в scenery.js)
    this.fill = new THREE.DirectionalLight('#fff1dc', 0);
    this.scene.add(this.fill, this.fill.target);
    this.audio = new Audio2();
    if (!HAS.sea) this.audio.site = { surf: 0.4, gulls: false, birds: true }; // озеро: волна у берега тише морского прибоя, чаек нет — в лесу поют птицы
    // шаги: доски причала, земля, вода по колено
    this.player.onStep = (land) => {
      const p = this.player;
      if (p.wade > 0.05) {
        this.audio.splash(0.3 + p.wade * 0.5, land ? 0.45 : 0.2);
        this.fx.ripple(p.x, p.z, 0.6 + p.wade, 0.9);
        this.fauna.scare(p.x, p.z, 2.8);
      } else {
        this.audio.step(p.onDeck, land);
        // топот у воды распугивает рыбу: к тени под причалом подходят шагом
        if (land || p.run > 0.5) this.fauna.scare(p.x, p.z, land ? 3.6 : 2.4, 0.6);
      }
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
    // крупная рыба в воде замечает наживку, которая легла рядом (fauna.notice)
    this.fishing.stalk = (x, z, R, soft) => this.fauna.notice(x, z, R, soft);
    this.fishing.makeJunk = (id) => {
      // готовая модель стоит на «полу» (y = 0) — опускаем на половину высоты, чтобы в руках она была по центру, как процедурная
      const g = new THREE.Group();
      g.add(itemModel(id));
      const info = modelInfo('junk-' + id);
      return info ? adopt(g, 'junk-' + id, false, -(info.size ? info.size[1] : 1) / 2) : g;
    };
    // Заготовки для сборки шейдеров: рыба (процедурная и готовая модель) и хлам невидимо лежат в сцене с самой загрузки.
    // Шейдеры собираются по всей сцене — за заставкой, при смене света и ступени качества; с ними соберутся и «рыбьи».
    // Иначе они собирались бы в момент первой подсечки (три сборки подряд) — рывок в самом начале вываживания.
    this.warmBox = new THREE.Group();
    this.warmBox.name = 'warm';
    this.warmBox.visible = false;
    this.warmBox.add(warmFish(WARM_FISH));
    this.scene.add(this.warmBox);
    this.warmDone = false;
    loadModels(['fish-' + WARM_FISH, 'junk-boot']).then(() => {
      this.warmBox.add(buildFish(WARM_FISH), this.fishing.makeJunk('boot'));
      this.warmDone = true;
      // заставка модели не дождалась (медленная сеть) — собираем их шейдеры в фоне сейчас
      if (this.prepared) this.gfx.shaders(this.scene, this.camera);
    });
    this.ui = new UI(this);
    this.ui.mapBase = drawMinimap(512, 276);
    // карта всего моря рисуется дольше — готовим её чуть позже, не в первый кадр
    setTimeout(() => this.seaMap(), 2500);
    this.meChar = new Character(this.profile.look);
    this.meChar.setRod(buildRod(this.profile.equip.rod, this.profile.equip.reel, this.profile.equip.line, 1));
    this.meChar.group.visible = false;
    this.scene.add(this.meChar.group);
    // торговец за прилавком
    this.vendor = new Character(VENDOR_PUPPET, { puppet: true });
    this.modelReady = (id) => !!modelReady(id); // для проверок: загружена ли модель (и её текстуры уже у видеокарты)
    /** Для подбора палитры на ходу (palette.js): сменить набор цветов и тональную кривую. */
    this.setPalette = (id) => {
      usePalette(id);
      this.gfx.retone();
      return PAL.id;
    };
    /** Снимок модели в картинку — им пользуются tools/bake-icons.cjs и проверочные листы. */
    this.modelShot = (id, view) => loadModel(id).then((t) => modelShot(t, view));
    this.fishShot = (sp) => fishIcon(sp); // значок рыбы — для проверок и листов (tools, test)
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
      if (ok) this.cloud.start();
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
      this._m = marketState(this.seed, t, LOC_ID);
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
  /**
   * Мир другой локации собирается заново: страница открывается с ?loc=…, а что делать после загрузки (go:
   * { a: 'solo' | 'create' | 'join', code? }) — запоминается до неё. Остальные параметры адреса сохраняются.
   */
  switchLoc(loc, go) {
    try {
      sessionStorage.setItem('rybak.go', JSON.stringify({ ...go, at: Date.now() }));
    } catch {
      /* без хранилища просто откроется заставка новой локации */
    }
    saveProfileNow(this.profile);
    this.net.closed = true; // связь оборвётся вместе со страницей — не пытаться её вернуть
    const q = new URLSearchParams(location.search);
    q.delete('loc');
    q.delete('room');
    if (go && go.code) q.set('room', go.code);
    if (loc !== DEFAULT_LOC) q.set('loc', loc);
    const str = q.toString().replace(/=(&|$)/g, '$1');
    this.ui.toast(`${locOf(loc).name}: собираем мир…`, 'gold', 8000);
    location.assign(str ? '?' + str : location.pathname);
  }
  /** Что просили сделать перед сменой локации (см. switchLoc): выполняется один раз, сразу после загрузки. */
  resumeGo() {
    let go = null;
    try {
      go = JSON.parse(sessionStorage.getItem('rybak.go'));
      sessionStorage.removeItem('rybak.go');
    } catch {
      go = null;
    }
    if (!go || !(Date.now() - go.at < 120000) || !this.profile.name) return;
    if (go.a === 'solo') this.startSolo();
    else if (go.a === 'create' && !this.offline) this.createRoom();
    else if (go.a === 'join' && go.code && !this.offline) this.joinRoom(String(go.code));
  }
  /** Может ли игрок сам открыть рыбалку на локации (по уровню); в гости к другу — всегда. */
  canOpen(loc) {
    return canHost(loc, levelInfo(this.profile.xp).lvl);
  }
  startSolo(loc = LOC_ID) {
    if (!this.canOpen(loc)) return this.ui.toast(`${locOf(loc).name} открывается с ${locOf(loc).level}-го уровня`, 'bad', 3200);
    if (loc !== LOC_ID) return this.switchLoc(loc, { a: 'solo' });
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
  createRoom(loc = LOC_ID) {
    if (!this.canOpen(loc)) return this.ui.toast(`${locOf(loc).name} открывается с ${locOf(loc).level}-го уровня`, 'bad', 3200);
    if (loc !== LOC_ID) return this.switchLoc(loc, { a: 'create' });
    this.goFullscreen();
    this.audio.start();
    this.solo = false;
    this.net.create(LOC_ID);
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
        // комната — на другой локации (вошли по коду или по старой ссылке): открываем её мир и входим заново —
        // место в комнате за нами уже записано, вернёмся на него по жетону
        const loc = cleanLoc(m.loc);
        if (loc !== LOC_ID) return this.switchLoc(loc, { a: 'join', code: m.code });
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
        setUrl(locUrl(LOC_ID, m.code));
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
          this.ui.feed(`<b>${esc(m.p.card.name)}</b> ${LOC.say.enter}`);
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
          // комнаты больше нет (в ней давно никого не было) или связь не вернуть — в меню, прогресс цел
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
      // n — какая это попытка вернуться подряд: говорим сразу и потом изредка, а не на каждую
      down: (n, restart) => {
        if (n % 5) return;
        this.ui.toast(restart ? (n ? 'Сервер ещё запускается — комната вернётся вместе с ним' : 'Сервер обновляется — через минуту вернёмся в ту же комнату') : n ? 'Связи всё ещё нет — пробую снова…' : 'Связь пропала — возвращаюсь…', restart ? '' : 'bad', 5000);
      },
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
    $('#voiceTxt').textContent = v.joining ? 'Подключаю…' : !v.joined ? 'Включить голос' : v.muted ? `Микрофон выключен${mk}` : `Голос включён${mk}`;
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
    const url = `${location.origin}/${locUrl(LOC_ID, this.code).replace(/^\//, '')}`; // у комнат не в бухте в ссылке есть локация: друг сразу откроет нужный мир
    const done = () => this.ui.toast(`Ссылка скопирована: ${url}`, 'good', 3500);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => this.ui.toast(url, '', 8000));
    else this.ui.toast(url, '', 8000);
  }
  sendChat(text) {
    if (this.solo) return this.ui.feed(`<b>${esc(this.profile.name)}:</b> ${esc(text)}`, 'chat');
    this.net.send({ t: 'chat', text });
  }

  // ───── переходы ─────
  /** Сменился вид (лобби ↔ бухта): первые секунды новые предметы впервые попадают в кадр — по ним о скорости не судим. */
  settle() {
    this.tuner.bad = this.tuner.good = 0;
    this.tuner.hold = Math.max(this.tuner.hold, 4);
    this.tunePlan = null;
  }
  toLobbyState() {
    this.state = 'lobby';
    this.inWorld = false;
    this.settle();
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
    if (this.checkMastery()) this.ui.showLobby(); // звёзды, заработанные раньше, — награда при первом же входе (и монеты в шапке сразу новые)
    if (!this.solo) this.net.send({ t: 'mode', m: 'lobby' });
  }
  toLobby() {
    if (this.fishing.state === 'fight') return this.ui.toast('Сначала вытащите рыбу', 'bad');
    this.ui.panel = null;
    this.toLobbyState();
  }
  enterWorld() {
    this.audio.start();
    if (this.state !== 'world') this.ui.dip(); // лобби стоит в золотом часе, бухта — в своём: смену света прячем
    this.state = 'world';
    this.inWorld = true;
    this.settle();
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
    setUrl(locUrl(LOC_ID));
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
      if (name !== was && (name === 'journal' || name === 'quests' || name === 'help' || name === 'top')) this.audio.page();
      return;
    }
    if (was === 'editor') this.endEdit();
    if (was === 'save') this.pendingSave = this.pendingCode = null; // выбранный, но не подтверждённый файл или код сохранения забываем
    if (was === 'card') this.card = null;
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
    return this._seaMap || (this._seaMap = drawMinimap(512, 276, SEA_VIEW));
  }
  /** Своя лодка куплена (лавка, «Прочее»): за выходы не платят, сдавать её не нужно, на носу — вымпел цвета игрока. */
  ownBoat() {
    return owns(this.profile, 'boat');
  }
  /** Вымпел на своей лодке — цвета метки игрока на карте; у прокатной его нет. */
  dressBoat() {
    const own = this.ownBoat();
    this.boat.vis.setOwner(own ? MARKS[this.me.slot % MARKS.length].color : null);
    if (own) this.boat.rented = true;
  }
  /** Первый выход бесплатный — чтобы новичок без монет тоже попробовал. */
  boatPrice() {
    return this.ownBoat() || !this.profile.boatTrips ? 0 : BOAT_PRICE;
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
      b.away = false;
      if (this.ownBoat()) this.ui.toast('Лодка на своём месте — выходите в море, когда захотите', 'good', 2600);
      else {
        b.rented = false;
        this.ui.toast('Лодка сдана. Захотите ещё — она ждёт у пирса', 'good', 3000);
      }
    } else if (!m.rent) this.ui.toast(`${m.name}. Лодка ждёт у причала`, '', 2600);
  }
  /** Лодка — на место у пирса, прокат закрыт: при входе в бухту и выходе из неё. */
  resetBoat() {
    this.boat.toMooring(0);
    this.boat.rented = false;
    this.boat.away = false;
    this.dressBoat();
    this.ride = null;
    this.player.boat = null;
    this.audio.motor(-1);
    this.audio.hush();
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
  /** Мотор чужой лодки слышен неподалёку — ближайшей из тех, где сидит хозяин; лодка, в которой едем сами, уже звучит. */
  hearBoats() {
    const pl = this.player;
    let bd = MOTOR_FAR, bx = 0, bz = 0, bk = -1;
    for (const p of this.players.values()) {
      const r = p.remote;
      if (p.mode !== 'world' || !p.st || !r.boat || (p.st[S.BOAT] | 0) !== 1 || (this.ride && this.ride.id === p.id)) continue;
      const g = r.boat.group.position;
      const d = Math.hypot(g.x - pl.x, g.z - pl.z);
      if (d < bd) {
        bd = d;
        bx = g.x - pl.x;
        bz = g.z - pl.z;
        bk = Math.abs(r.bv) / VMAX;
      }
    }
    this.audio.motorNear(bk, bd, bk >= 0 && bd > 0.01 ? (bx * Math.cos(pl.yaw) - bz * Math.sin(pl.yaw)) / bd : 0);
  }
  /**
   * Лодка ударилась о преграду: на ходу sp (м/с), местом x, z; edge — у края карты, где преграды нет, а лодку разворачивает волна.
   * aboard — мы в этой лодке, за рулём или пассажиром: удар в полную силу, камеру встряхивает, геймпад и телефон вздрагивают.
   * Со стороны он тем тише и глуше, чем дальше, и слышен с той стороны, где случился. from — чья лодка (0 — своя).
   */
  boatBump(sp, edge, x, z, aboard, from = 0) {
    // 1,2 м/с — порог удара, от 7 м/с и выше — в полную силу
    const p = edge ? 0 : clamp((sp - 1.2) / 6, 0, 1);
    const pl = this.player;
    const dx = x - pl.x, dz = z - pl.z;
    const d = Math.hypot(dx, dz);
    const o = { vol: 1, pan: 0, from };
    if (!aboard) {
      const k = clamp(1.1 - d / BUMP_FAR, 0, 1);
      o.vol = k * k;
      // взгляд игрока — вдоль (−sin yaw, −cos yaw); справа от него — (cos yaw, −sin yaw)
      o.pan = d > 0.01 ? ((dx * Math.cos(pl.yaw) - dz * Math.sin(pl.yaw)) / d) * Math.min(1, d / 6) * 0.75 : 0;
    }
    const hit = this.audio.thud(p, o);
    if (edge && hit && o.vol > 0.02) this.audio.splash(0.8, o.vol);
    // брызги от удара видны всем, кто смотрит: у края карты — от волны, у преграды — только от сильного удара
    if (hit && (edge || hit === 2) && d < 160) this.fx.splash(x, z, edge ? 0.8 : 0.35 + 0.5 * p);
    if (!aboard) return;
    pl.shake = Math.max(pl.shake, Math.min(1, sp / 8));
    this.rumble(120, 0.7);
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
    this.ui.toast(rode ? LOC.say.back : this.ownBoat() ? `${LOC.say.back}. Лодка — у пирса` : `${LOC.say.back}. Лодка сдана`, 'good', 3000);
  }
  /** В какой части мира точка. */
  areaAt(x, z) {
    return areaAt(x, z);
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
    if (id === 'boat') {
      // лодка у пирса теперь своя: с вымпелом, без платы и без сдачи
      this.dressBoat();
      this.ui.toast('Лодка ваша — ждёт у пирса под вывеской проката. Платить за выходы больше не нужно', 'gold', 5200);
    }
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
  // ───── открытка ─────
  /**
   * Открытка: кадр игры с подписью. С уловом в руках — про улов (вид, вес, отметки), без него — просто вид бухты.
   * Кадр рисуем сами и тут же забираем: у холста WebGL картинка живёт только до конца этого шага.
   */
  postcard() {
    if (this.state !== 'world' || this.ui.panel) return null;
    const f = this.fishing;
    const c = f.state === 'landed' ? f.catch : null;
    const lv = levelInfo(this.profile.xp);
    const jn = c && !c.junk ? this.profile.journal[c.sp] : null;
    const date = new Date();
    const t = cardText({
      c, name: this.profile.name, lvl: lv.lvl, title: lv.title, zone: c && f.spot ? f.spot.zone : '', date,
      isNew: !!c && !c.junk && (!jn || jn.n === 0), record: !!c && !c.junk && !!jn && jn.n > 0 && c.w > jn.best,
      site: /^https?:$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname) ? location.host : '',
      loc: LOC_ID
    });
    let cv;
    try {
      this.gfx.render(this.scene, this.camera, this.world.exposure);
      cv = drawCard(document.createElement('canvas'), this.gfx.renderer.domElement, t);
    } catch (e) {
      console.warn('открытка', e);
      return this.ui.toast('Не получилось сделать открытку', 'bad');
    }
    this.card = { cv, t, file: cardFile(t, date), url: cv.toDataURL('image/jpeg', 0.9) };
    this.audio.shutter();
    this.ui.flash('#ffffff');
    this.ui.openPanel('card');
    return this.card;
  }
  /** Скачать открытку файлом. */
  saveCard() {
    const k = this.card;
    if (!k) return;
    k.cv.toBlob((blob) => {
      if (!blob) return this.ui.toast('Не получилось сохранить открытку', 'bad');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = k.file;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      this.ui.toast(`Открытка скачана: ${k.file}`, 'good', 3200);
    }, 'image/jpeg', 0.9);
  }
  /** Отправить открытку через «Поделиться» устройства (телефон, Safari); где этого нет — скачиваем. */
  async shareCard() {
    const k = this.card;
    if (!k) return;
    try {
      const blob = await new Promise((ok) => k.cv.toBlob(ok, 'image/jpeg', 0.9));
      const file = new File([blob], k.file, { type: 'image/jpeg' });
      if (!navigator.canShare || !navigator.canShare({ files: [file] })) return this.saveCard();
      await navigator.share({ files: [file], title: 'Рыбак', text: k.t.sub ? `${k.t.head} — ${k.t.sub}` : k.t.head });
    } catch (e) {
      if (e && e.name !== 'AbortError') this.saveCard();
    }
  }

  /** Сохранение — файлом: перенести на другое устройство или оставить про запас. → { name, text } */
  saveToFile() {
    const p = this.profile;
    const text = exportSave(p, Date.now());
    const d = new Date();
    const who = String(p.name || '').replace(/[^\p{L}\p{N}_-]+/gu, '') || 'save';
    const name = `rybak-${who}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    this.ui.toast(`Файл сохранения скачан: ${name}`, 'good', 3600);
    return { name, text };
  }
  /** Выбран файл сохранения: проверяем и спрашиваем, заменить ли нынешний прогресс (кнопка в настройках). */
  async loadFromFile(file) {
    // после загрузки игра открывается заново — в общей комнате это разорвало бы связь с друзьями посреди рыбалки
    if (!this.solo && this.state !== 'title') return this.ui.toast('Загрузить сохранение можно в одиночной игре или с главного экрана', 'bad', 4200);
    let text = '';
    try {
      if (file.size > 2e6) throw new Error('big');
      text = await file.text();
    } catch {
      this.audio.error();
      return this.ui.toast('Файл не читается', 'bad');
    }
    const r = importSave(text);
    if (!r.ok) {
      this.audio.error();
      return this.ui.toast(r.why, 'bad', 4200);
    }
    if (this.fishing.state === 'fight' || this.fishing.state === 'landed') return this.ui.toast('Сначала вытащите рыбу', 'bad');
    this.pendingSave = r;
    if (this.ui.panel === 'save') this.ui.renderSave();
  }
  /** Заменить прогресс загруженным сохранением: пишем сразу и открываем игру заново — так всё встаёт на места. */
  applySave() {
    const r = this.pendingSave;
    if (!r) return;
    this.pendingSave = null;
    const look = r.profile.look || this.profile.look;
    saveProfileNow({ ...r.profile, look });
    lockProfile();
    // игрок сам заменил прогресс: на сервер он уйдёт, даже если там опыта больше, — но уже после перезапуска, из нового профиля
    this.cloud.touch({ force: true });
    this.cloud.hold();
    this.ui.toast('Сохранение загружено — открываем игру заново', 'good', 2000);
    if (!this.noReload) setTimeout(() => location.reload(), 700);
  }

  // ───── сохранение на сервере ─────
  /**
   * Принять сохранение с сервера: с другого устройства (само) или по коду (asked — игрок сам попросил).
   * Прогресс заменяется на месте, без перезапуска игры. false — сейчас нельзя: рыба на крючке или в руках.
   */
  cloudApply(save, sum, asked) {
    if (!this.fishing || !this.ui) return false; // игра ещё собирается
    if (this.fishing.state === 'fight' || this.fishing.state === 'landed') return false;
    const r = importSave(exportSave(save, 0));
    if (!r.ok) {
      this.ui.toast('Сохранение с сервера не читается — оставляем то, что на этом устройстве', 'bad', 6000);
      return true;
    }
    const p = this.profile;
    const look = r.profile.look && r.profile.look.hero ? r.profile.look : p.look;
    for (const k of Object.keys(p)) delete p[k];
    Object.assign(p, r.profile, { look });
    saveProfileNow(p);
    // всё, что в игре выведено из профиля: герой, снасть в руках, лодка, задания, цифры на экране
    this.vm.setLook(fpLook(look));
    this.player.eye = heroEye(look);
    this.fishing.reelIn(true);
    this.fishing.refreshGear();
    if (this.me) this.dressBoat();
    this.sendCard();
    if (this.state !== 'title') {
      this.syncQuests();
      this.ui.questTracker();
      this.rosterChanged();
    }
    this.ui.refreshHud();
    if (this.state === 'title' && !this.ui.panel) this.ui.showTitle();
    else this.ui.rerender();
    this.ui.toast(`${asked ? 'Сохранение загружено' : 'Прогресс обновлён — вы играли на другом устройстве'}: ${r.name || 'Рыбак'}, уровень ${r.lvl}`, 'good', 5200);
    return true;
  }
  cloudChanged() {
    const ui = this.ui;
    if (!ui) return;
    // панель «Сохранение» перерисовываем целиком, только если поменялось её устройство (появился выбор, выключили хранение);
    // иначе правим одни подписи: человек может в эту секунду набирать код или вести ползунок в настройках
    if (ui.panel === 'save' && ui.saveKey !== ui.saveShape()) ui.renderSave();
    else if (ui.panel === 'save' || ui.panel === 'settings') {
      const line = $('#saveLine');
      if (line) line.textContent = ui.saveLine();
      const note = $('#cloudNote');
      if (note && !note.classList.contains('warn')) note.textContent = ui.cloudNote();
    }
    const el = $('#saveNote');
    if (el) el.innerHTML = ui.saveNote();
  }
  cloudNotify(kind) {
    if (kind === 'clash' && this.ui) this.ui.toast('Сохранение на сервере и на этом устройстве разошлись. Откройте «Настройки → Сохранение и перенос» и выберите, какое оставить', 'bad', 9000);
  }
  /** Настройки → «Загрузить по коду»: смотрим, что лежит под кодом, и спрашиваем, заменить ли нынешний прогресс. */
  async cloudLookup(text) {
    if (this.fishing.state === 'fight' || this.fishing.state === 'landed') return this.ui.toast('Сначала вытащите рыбу', 'bad');
    this.pendingCode = null;
    const r = await this.cloud.lookup(text);
    if (!r.ok) {
      this.audio.error();
      const why = { BAD_CODE: 'В коде сохранения 16 букв и цифр — проверьте, всё ли набрано', SAME: 'Это код этого же устройства — прогресс уже здесь', NO_SAVE: 'Под таким кодом сохранения нет. Проверьте код', SLOW_DOWN: 'Слишком много попыток — подождите минуту', NO_DB: 'Сервер сейчас не хранит сохранения' }[r.why] || 'Сервер не отвечает — попробуйте чуть позже';
      return this.ui.toast(why, 'bad', 4600);
    }
    this.pendingCode = r;
    if (this.ui.panel === 'save') this.ui.renderSave();
  }
  cloudAdopt() {
    const r = this.pendingCode;
    if (!r) return;
    this.pendingCode = null;
    if (!this.cloud.adopt(r)) return this.ui.toast('Сейчас загрузить не получится — сначала вытащите рыбу', 'bad', 4200);
    const inp = $('#cloudcode');
    if (inp) inp.value = '';
    if (this.ui.panel === 'save') this.ui.renderSave();
  }
  resetProgress() {
    const name = this.profile.name;
    const look = this.profile.look;
    Object.assign(this.profile, newProfile(), { name, look, seenIntro: true });
    this.syncQuests();
    this.ui.questTracker();
    saveProfile(this.profile);
    this.cloud.touch({ force: true }); // игрок сам стёр прогресс — на сервере он тоже обнуляется
    this.fishing.reelIn(true);
    this.fishing.refreshGear();
    this.sendCard();
    this.ui.refreshHud();
    this.ui.closePanel();
    this.ui.toast('Начинаем с чистого листа', 'good');
  }
  /**
   * Сменить ступень качества без замирания. У ступени свои шейдеры: если просто переключить, они соберутся разом
   * в ближайшем кадре — на Apple M4 это три секунды неподвижной картинки. Поэтому сначала собираем их в фоне,
   * потом переключаем и сразу показываем всё спрятанное (rewarm). then — что сделать вместе с переключением.
   */
  switchTier(tier, then = () => {}) {
    const g = this.gfx;
    this.tierWant = tier;
    if (g.quality === tier) return then();
    if (!this.prepared || this.noRender) {
      // до конца загрузки и в проверках без отрисовки ждать нечего
      g.setQuality(tier);
      return then();
    }
    this.tierBusy = true;
    g.shaders(this.scene, this.camera, tier).then(() => {
      this.tierBusy = false;
      if (this.tierWant !== tier) return; // пока собирали, выбрали другую
      g.setQuality(tier);
      then();
      this.rewarm();
      if (this.ui.panel === 'settings') this.ui.rerender();
    });
  }
  applySettings() {
    this.camera.fov = settings.fov;
    this.camera.updateProjectionMatrix();
    this.audio.applyVolume();
    const auto = settings.quality === 'auto';
    if (!this.params.get('q')) {
      if (!auto) {
        const full = this.auto || settings.drs === false; // выбрали качество сами — разрешение полное
        this.switchTier(settings.quality, () => full && this.gfx.setScale(1));
      } else if (!this.auto && !this.booting) {
        // вернулись на «авто»: берём то, что подобрано для этой видеокарты
        const a = settings.autoQ;
        if (a && a.gpu === this.perf.gpu && QUALITIES.includes(a.tier)) this.switchTier(a.tier, () => this.gfx.setScale(a.scale || 1));
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
  /**
   * Пока поплавок на воде — подгружаем модели тех, кто здесь может клюнуть (от частых к редким), и хлама.
   * Кто именно клюнул, решается при подсечке; к этому времени модель и её текстуры уже у видеокарты,
   * и вываживание начинается без рывка. По две за раз: загрузка не должна мешать игре.
   */
  preloadCatch() {
    const f = this.fishing;
    if (!f.spot) return;
    const all = speciesWeights(f.spot, this.profile.equip.tackle, this.hours, LOC_ID, f.kit).sort((a, b) => b.w - a.w);
    // берём тех, на кого приходится девять поклёвок из десяти (на телефоне — не больше пяти видов: памяти мало);
    // редкий гость подгрузится при подсечке, как раньше, — шейдеры для него уже собраны
    const total = all.reduce((s, e) => s + e.w, 0);
    const fish = [];
    let acc = 0;
    for (const e of all) {
      if (fish.length >= (isTouch() ? 5 : 12) || acc >= total * 0.92) break;
      fish.push(e);
      acc += e.w;
    }
    this.preIds = [...fish.map((e) => 'fish-' + e.f.id), ...JUNK.map((j) => 'junk-' + j.id)].filter((id) => modelInfo(id));
    const q = (this.preQ = this.preIds.filter((id) => !modelReady(id)));
    const next = () => {
      if (this.preQ === q && q.length) loadModel(q.shift()).then(next, next);
    };
    next();
    next();
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
        a.plop();
        this.fauna.scare(d.x, d.z, 2.4);
        this.preloadCatch();
        if (d.short) ui.toast('Недолёт: держите кнопку дольше — до белой риски', '', 2200);
        else if (d.big) ui.toast(d.big > 0.6 ? 'Крупная тень заметила наживку!' : 'Рыба рядом заметила наживку', 'good', 2200);
        else if (d.spooked) ui.toast('Плюхнули прямо на рыбу — она ушла. Бросайте чуть в стороне', '', 2800);
        else if (d.hot) ui.toast('Прямо в косяк!', 'good', 1600);
        return this.ev('land', { x: +d.x.toFixed(1), z: +d.z.toFixed(1) });
      case 'stalk':
        return ui.toast('Хищник пошёл за блесной!', 'good', 1800);
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
        this.hookText = d.legend ? 'ЛЕГЕНДА НА КРЮЧКЕ!' : d.giant ? 'ГИГАНТ НА КРЮЧКЕ!' : 'НА КРЮЧКЕ!';
        ui.banner(this.hookText);
        // гиганта в подсак не взять: без багра его вываживают до самого конца
        if (d.giant) ui.toast(this.fishing.kit.gaff ? 'Гигант! У борта он соберётся с силами — с 90 % пути берите багром.' : 'Гигант! В подсак он не влезет, а багра нет — вываживайте до конца.', '', 4200);
        a.hook();
        this.rumble(120, 0.6);
        this.stopTime(0.07, 0.04);
        this.player.shake = Math.max(this.player.shake, 0.5);
        const c = this.fishing.catch;
        return this.ev('hook', { sp: c.sp, len: c.len });
      }
      case 'warn': return a.warn();
      case 'run':
        this.fauna.scare(this.fishing.bx, this.fishing.bz, 3);
        a.thrash(0.6);
        return this.rumble(180, 0.8);
      case 'jump':
        this.fauna.scare(d.x, d.z, 3.5);
        a.splash(1);
        a.leap();
        return this.ev('jump', { x: +d.x.toFixed(1), z: +d.z.toFixed(1) });
      case 'rage':
        // легенда собралась с силами: это видно, слышно и чувствуется в руке
        this.fauna.scare(d.x, d.z, 6);
        this.fightBanner(d.left ? 'ВТОРОЕ ДЫХАНИЕ!' : 'ПОСЛЕДНИЙ РЫВОК!', 1500);
        ui.flash('#f04438');
        a.rage();
        this.rumble(420, 1);
        this.stopTime(0.12, 0.2);
        this.player.shake = Math.max(this.player.shake, 1);
        return this.ev('jump', { x: +d.x.toFixed(1), z: +d.z.toFixed(1) });
      case 'stuck':
        a.stuck();
        return this.rumble(90, 0.5);
      case 'unstuck':
        a.unstuck();
        return this.rumble(120, 0.6);
      case 'wrap':
        this.fightBanner('ЛЕСКА ЗА КАМНЯМИ!', 1300);
        a.wrap();
        this.player.shake = Math.max(this.player.shake, 0.7);
        return this.rumble(220, 1);
      case 'lost': {
        ui.banner(d.why === 'snap' ? 'ОБРЫВ!' : 'СОШЛА!', 'red', 1600);
        a.strain(-1);
        if (d.why === 'snap') a.snap();
        else a.fail();
        this.player.shake = 1;
        const f = FISH_BY_ID[d.sp];
        const big = f && d.w > 2 ? ` Похоже, это была ${f.rar >= 3 ? 'настоящая громадина' : 'крупная рыба'}.` : '';
        // почему порвалась: обычная красная зона, свеча на тугой леске или камни
        const why = d.air ? 'в свече леску надо отпускать — рыба в воздухе рвёт тугую' : d.wrapped ? 'рыба завела её за камни — уводите против рывка' : 'держали в красной зоне';
        ui.toast(d.why === 'snap' ? `Леска лопнула: ${why}.${d.lostLure ? ' Приманка потеряна.' : ''}${big}` : `Рыба сошла: леска провисла.${big}`, 'bad', 4200);
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
        if (f) a.landed(this.fishing.kit.net && !f.giant);
        ui.catchCard(d);
        this.rumble(300, 0.5);
        this.stopTime(0.26, 0.45);
        this.lookUp = settings.follow !== false ? 1.1 : 0; // взгляд после вываживания смотрел в воду у ног — поднимаем к улову
        {
          // чем реже рыба, тем заметнее момент: встряска камеры и цветная вспышка
          const rar = f ? f.rar : c.sp === 'chest' ? 4 : 0;
          this.player.shake = Math.max(this.player.shake, 0.35 + rar * 0.28);
          if (rar >= 2) ui.flash(RARITY[rar].color);
        }
        this.tourCatch(c);
        if (c.help) ui.toast(`${c.help} подсачил вашу рыбу — спасибо другу!`, 'good', 3200);
        return this.ev('catch', { sp: c.sp, w: c.w, len: c.len, trophy: c.trophy, by: c.help ? this.helperId : undefined });
      }
      case 'kept': {
        ui.catchCard(null);
        const c = d.c;
        const f = FISH_BY_ID[c.sp];
        if (d.forced) ui.toast('Садок полон — рыбу пришлось отпустить. Продайте улов на рынке', 'bad', 3600);
        else if (d.released) ui.toast(`Отпущена. Опыт +${d.xp}`, 'good', 1800);
        else ui.toast(`В садок. Опыт +${d.xp}`, 'good', 1600);
        if (d.released) a.splash(0.45);
        else a.keep();
        if (d.isNew && f) ui.toast(`Новый вид в журнале: ${f.name}`, 'gold', 3200);
        if (d.levelUp) {
          a.level();
          ui.toast(`Уровень ${d.levelUp} — ${levelInfo(p.xp).title}!`, 'gold', 4000);
          this.sendCard();
        }
        this.questEv({ t: 'catch', c, zone: d.zone, boat: d.boat, released: d.released, wx: this.weather.kind });
        this.checkMastery();
        ui.refreshHud();
        return saveProfile(p);
      }
      case 'reelin': return a.reelTicks(5, 0.035);
      default:
    }
  }
  /**
   * Мастерство на локациях: новая звезда (половина видов, все виды, крупный экземпляр каждого) — награда, один раз.
   * Проверяется после каждого улова и при входе: старым игрокам уже заработанные звёзды засчитываются сразу.
   */
  checkMastery() {
    const p = this.profile;
    const got = claimMastery(p);
    if (!got.length) return false;
    for (const m of got) {
      const txt = `Мастерство: ${locOf(m.loc).name} ${'★'.repeat(m.stars)} — награда ${fmtCoins(m.coins)} монет`;
      this.ui.toast(txt, 'gold', 5200);
      if (this.state === 'world') this.ui.feed(`${'★'.repeat(m.stars)} <b>${esc(locOf(m.loc).name)}</b>: новая звезда мастерства, <b class="y">+${fmtCoins(m.coins)}</b> монет`);
    }
    this.audio.coin(3);
    this.audio.jingle();
    this.ui.refreshHud();
    saveProfile(p);
    return true;
  }
  /** Красная плашка посреди вываживания (легенда собралась, леска за камнями); потом возвращается обычная «НА КРЮЧКЕ!». */
  fightBanner(text, ms) {
    this.ui.banner(text, 'red');
    clearTimeout(this.fbT);
    this.fbT = setTimeout(() => {
      if (this.fishing.state === 'fight') this.ui.banner(this.hookText || 'НА КРЮЧКЕ!');
    }, ms);
  }
  /** Остановить или замедлить время игры: sec — на сколько настоящих секунд, k — во сколько раз медленнее (0.05 — почти стоп). */
  stopTime(sec, k) {
    if (this.noRender) return; // в проверках время идёт ровно
    this.hitT = sec;
    this.hitK = k;
  }
  onRemoteEvent(m) {
    const p = this.players.get(m.id);
    if (!p) return;
    const d = m.d || {};
    const name = `<b>${esc(p.card.name)}</b>`;
    p.remote.event(m.k, d, this.state === 'world' || this.state === 'lobby' ? this.fx : null);
    const near = p.st ? Math.hypot(p.st[S.X] - this.player.x, p.st[S.Z] - this.player.z) : 99;
    const vol = clamp(1.1 - near / 40, 0.1, 1);
    if ((m.k === 'land' || m.k === 'jump') && d.x != null) {
      this.fauna.scare(d.x, d.z, 2.6);
      // друг плюхнул снасть рядом с нашей наживкой — выслеженная рыба уходит
      const F = this.fishing;
      if (Math.hypot(d.x - F.bx, d.z - F.bz) < 2.6 && F.spook()) {
        this.fauna.spook();
        this.ui.toast('Рядом плюхнулась чужая снасть — крупная рыба ушла', '', 2600);
      }
    }
    if (m.k === 'land' || m.k === 'bite') this.audio.splash(0.4, vol);
    else if (m.k === 'jump') this.audio.splash(0.9, vol);
    else if (m.k === 'catch') {
      const f = FISH_BY_ID[d.sp];
      const j = JUNK_BY_ID[d.sp];
      const nm = f ? f.name : j ? j.name : '?';
      const col = f ? RARITY[f.rar].color : '#cbd5e1';
      const by = Number(d.by) || 0;
      const helper = by === this.me.id ? 'вы' : by && this.players.get(by) ? esc(this.players.get(by).card.name) : '';
      this.ui.feed(`${name} — <b style="color:${col}">${esc(nm)}</b>, ${fmtW(Number(d.w) || 0)}${d.trophy ? ' · трофей!' : ''}${helper ? ` · подсачил${helper === 'вы' ? 'и' : ''} ${helper}` : ''}`);
      if (by === this.me.id && this.assistAsk === p.id) this.assistDone(p, { sp: String(d.sp || ''), w: Number(d.w) || 0, trophy: !!d.trophy, junk: !f });
      p.remote.bubble(`${esc(nm)} · ${fmtW(Number(d.w) || 0)}`, 6);
      if (f && f.rar >= 3) {
        this.ui.toast(`${esc(p.card.name)} вытащил: ${f.name}, ${fmtW(d.w)}!`, 'gold', 5000);
        this.audio.catch(f.rar);
      }
    } else if (m.k === 'assist') {
      // друг просит подсачить нашу рыбу — или отвечает, почему нашу просьбу выполнить нельзя
      if (Number(d.to) !== this.me.id) return;
      if (d.no) this.ui.toast(ASSIST_NO[d.no] || ASSIST_NO.early, '', 2600);
      else this.onAssist(p);
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
    else if (m.k === 'boat' && d.k === 'bump' && this.state === 'world' && p.mode === 'world') {
      // чужая лодка ударилась о преграду: место берём из сообщения, а если его нет — там, где сейчас сама лодка
      const sp = clamp(Number(d.s) || 0, 0, VMAX);
      const g = p.remote.boat ? p.remote.boat.group.position : null;
      const x = Number.isFinite(d.x) ? clamp(d.x, WORLD.x0, WORLD.x1) : g ? g.x : null;
      const z = Number.isFinite(d.z) ? clamp(d.z, WORLD.z0, WORLD.z1) : g ? g.z : null;
      const aboard = !!this.ride && this.ride.id === p.id;
      if (sp > 1.2 && x != null && z != null) this.boatBump(sp, !!d.e, x, z, aboard, p.id);
      if (aboard && d.e) this.ui.toast('Дальше — только океан. Лодка поворачивает назад', '', 2600);
    }
  }

  // ───── помощь друга: подсачить чужую рыбу ─────
  /**
   * Кому сейчас можно помочь подсаком: друг рядом (не дальше ASSIST_REACH) вываживает рыбу, а у нас руки свободны.
   * → { p, ready, k } — игрок, дошла ли рыба (с ASSIST_AT пути) и сколько пройдено; или null.
   */
  assistTarget() {
    if (this.solo || this.fishing.state !== 'idle' || this.boat.active) return null;
    const pl = this.player;
    let best = null;
    let bd = ASSIST_REACH;
    for (const p of this.players.values()) {
      const st = p.st;
      if (p.mode !== 'world' || !st || (st[S.FS] | 0) !== 5) continue;
      const d = Math.hypot(st[S.X] - pl.x, st[S.Z] - pl.z);
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    if (!best) return null;
    const k = clamp(Number(best.st[S.K]) || 0, 0, 1);
    // на леске гигант: его берут багром и позже
    const giant = ((best.st[S.FLAGS] | 0) & FLAG.giant) !== 0;
    const at = giant ? ASSIST_GIANT : ASSIST_AT;
    return { p: best, k, ready: k >= at, at, giant };
  }
  /** Мы подсачиваем рыбу друга: просим его игру отдать улов (решает она — рыба на его леске). */
  assist(p) {
    const now = performance.now();
    if (now < (this.assistCd || 0)) return;
    this.assistCd = now + 1400;
    this.assistAsk = p.id;
    this.ev('assist', { to: p.id });
    this.audio.plop();
    this.fx.splash(p.st[S.BX], p.st[S.BZ], 0.7);
  }
  /** Друг подсачивает нашу рыбу. Не вышло — отвечаем ему, почему. */
  onAssist(p) {
    const f = this.fishing;
    const far = !p.st || Math.hypot(p.st[S.X] - this.player.x, p.st[S.Z] - this.player.z) > ASSIST_REACH + 1.5;
    const why = f.state === 'landed' ? 'late' : f.state !== 'fight' ? 'early' : far ? 'far' : assistBlock(f.fight);
    if (why) return this.ev('assist', { to: p.id, no: why });
    this.helperId = p.id;
    f.assist(p.card.name);
  }
  /** Рыба друга взята нашим подсаком: нам — четверть её опыта и отметка в журнале. */
  assistDone(p, c) {
    this.assistAsk = 0;
    const r = recordAssist(this.profile, c);
    const f = FISH_BY_ID[c.sp];
    this.audio.catch(f ? Math.min(2, f.rar) : 0);
    this.ui.toast(`Вы подсачили рыбу для ${p.card.name}${f ? `: ${f.name}, ${fmtW(c.w)}` : ''}. Опыт +${r.xp}`, 'good', 3600);
    if (r.levelUp) {
      this.audio.level();
      this.ui.toast(`Уровень ${r.levelUp} — ${levelInfo(this.profile.xp).title}!`, 'gold', 4000);
      this.sendCard();
    }
    this.ui.refreshHud();
    saveProfile(this.profile);
  }

  // ───── задания на день ─────
  /** Задания на сегодня (день — по часам игрока). Возвращает true, если выданы новые. */
  syncQuests() {
    const d = new Date();
    const p = this.profile;
    const was = p.quests ? p.quests.list.map((q) => q.a).join() : '';
    const fresh = syncQuests(p, questDay(d.getTime(), d.getTimezoneOffset()), LOC_ID);
    // на другой локации задания могли подмениться здешними (см. shared/logic.js) — это тоже нужно записать и показать
    if (!fresh && was === p.quests.list.map((q) => q.a).join()) return false;
    saveProfile(p);
    this.ui.questTracker();
    return fresh;
  }
  /** Событие игры (улов, продажа, турнир) → задания: счёт, награды, сообщения. */
  questEv(ev) {
    const p = this.profile;
    const r = questEvent(p, ev);
    if (r.done.length) {
      for (const q of r.done) this.ui.toast(`Задание выполнено: ${questText(q, LOC_ID)}`, 'gold', 4200);
      this.ui.toast(`Награда: +${fmtCoins(r.coins)} монет, опыт +${r.xp}`, 'good', 4200);
      if (r.bonus) this.ui.toast(`Все задания дня выполнены! Премия +${fmtCoins(r.bonus)} монет`, 'gold', 5200);
      this.audio.coin(3);
      if (!r.levelUp) this.audio.jingle();
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
    this.audio.bell();
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
      if (e.code === 'Enter' && document.activeElement.id === 'cloudcode') {
        const b = $('[data-a="cloudlink"]');
        if (b) b.click();
        return;
      }
      if (e.code === 'Enter' && this.state === 'title') {
        const b = $('.tcard .btn.pri');
        if (b) b.click();
      }
      // Esc в поле ввода на открытой панели — как обычно, закрывает панель
      if (!(e.code === 'Escape' && ui.panel)) return;
      document.activeElement.blur();
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
    if (i.hit('KeyP') && f.state !== 'fight') return this.postcard();
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
    const help = this.assistTarget();
    if (help) {
      // друг рядом вываживает рыбу: с 70 % пути её можно взять подсаком — это важнее причала и лавки
      const nm = help.p.card.name.toUpperCase();
      act = help.ready
        ? { text: help.giant ? `ВЗЯТЬ ГИГАНТА БАГРОМ — ${nm}` : `ПОДСАЧИТЬ РЫБУ — ${nm}`, short: help.giant ? 'БАГОР' : 'ПОДСАК', run: () => this.assist(help.p) }
        : { text: `${help.giant ? 'БАГОР' : 'ПОДСАК'} НАГОТОВЕ: РЫБА ${nm} ПОДОЙДЁТ — БЕРИТЕ (${Math.round(help.k * 100)} % ИЗ ${Math.round(help.at * 100)})`, short: '', run: () => {} };
    } else if (!f.lineOut && f.state !== 'charge') {
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
          act = m.rent && !boat.away ? { text: 'ВЫЙТИ НА ПИРС', short: 'НА ПИРС' } : { text: `${m.rent && !this.ownBoat() ? 'ПРИЧАЛИТЬ И СДАТЬ ЛОДКУ' : 'ПРИЧАЛИТЬ'} — ${m.name.toUpperCase()}`, short: 'ПРИЧАЛИТЬ' };
          act.run = () => this.dock(mi);
        }
      } else if (Math.hypot(pl.x - MARKET.x, pl.z - MARKET.z) < MARKET.r) act = { text: 'РЫНОК — ПРОДАТЬ УЛОВ, КУПИТЬ СНАСТИ', short: 'РЫНОК', run: () => ui.openPanel('sell') };
      // к лодке можно подойти самой, а дома — ещё и к прилавку будки проката
      else if (Math.hypot(pl.x - boat.x, pl.z - boat.z) < 3.6 || Math.hypot(pl.x - MOORINGS[boat.moor].sx, pl.z - MOORINGS[boat.moor].sz) < 2.6 || (boat.moor === 0 && Math.hypot(pl.x - RENT_DESK.x, pl.z - RENT_DESK.z) < RENT_DESK.r)) {
        const price = this.boatPrice();
        act = boat.rented ? { text: this.ownBoat() && boat.moor === 0 ? 'СВОЯ ЛОДКА — В ПУТЬ' : 'СЕСТЬ В ЛОДКУ', short: 'В ЛОДКУ', run: () => this.boardBoat() } : { text: `ЛОДКА НАПРОКАТ — ${price ? `${price} МОНЕТ` : 'ПЕРВЫЙ ВЫХОД БЕСПЛАТНО'}`, short: 'ЛОДКА', run: () => this.rentBoat() };
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
  /**
   * Маршрут на мини-карте: { pts, len, sail, kind } или null. В лодке: с эхолотом — к ближайшему косяку, с полным садком
   * или из открытого моря — домой, к причалу; пешком с уловом — к торговцу. Путь по воде считает route.js
   * (сетка проходимости готовится понемногу, по три миллисекунды за кадр), пересчёт — не чаще раза в полторы секунды.
   */
  navStep(dt) {
    if (!(this.navReady = routeReady(3))) return null;
    const pl = this.player;
    const p = this.profile;
    const kit = this.fishing.kit;
    if (this.boat.active || this.ride) {
      const full = p.cooler.length >= kit.bagCap;
      let goal = null;
      if (!full && kit.sonar) {
        let bd = Infinity;
        for (const c of this.world.scenery.schools.centers) {
          const d = Math.hypot(c.x - pl.x, c.z - pl.z);
          if (c.on > 0.5 && d < bd) {
            bd = d;
            goal = { x: c.x, z: c.z, kind: 'school' };
          }
        }
        if (goal && bd < 14) return null; // пришли: косяк под бортом
      }
      if (!goal && (full || this.area !== HOME_AREA)) goal = { x: MOORINGS[0].x, z: MOORINGS[0].z, kind: 'home' };
      if (!goal) return null;
      const key = `${goal.kind}|${Math.round(goal.x / 6)}|${Math.round(goal.z / 6)}`;
      this.navT = (this.navT || 0) - dt;
      if (key !== this.navKey || this.navT <= 0) {
        this.navKey = key;
        this.navT = 1.5;
        this.navPath = route(pl.x, pl.z, goal.x, goal.z);
      }
      const r = this.navPath;
      if (!r) return null;
      // между пересчётами линия начинается там, где мы сейчас: пройденные точки отбрасываем
      let i = 1;
      while (i < r.pts.length - 1 && Math.hypot(r.pts[i][0] - pl.x, r.pts[i][1] - pl.z) < 9) i++;
      const pts = [[pl.x, pl.z], ...r.pts.slice(i)];
      let len = 0;
      for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      return { pts, len, sail: true, kind: goal.kind };
    }
    this.navKey = '';
    if (p.cooler.length && this.area === HOME_AREA) {
      const d = Math.hypot(MARKET.x - pl.x, MARKET.z - pl.z);
      if (d > 7) return { pts: [[pl.x, pl.z], [MARKET.x, MARKET.z]], len: d, sail: false, kind: 'market' };
    }
    return null;
  }

  /** Подсказки управления справа внизу: по строке на действие — что сейчас можно сделать и чем. */
  hints() {
    const ui = this.ui;
    const f = this.fishing;
    const k = (a) => ui.key(a);
    const row = (...r) => r.filter(Boolean).map((t) => `<span>${t}</span>`).join('');
    const pad = this.input.device === 'pad';
    switch (f.state) {
      case 'idle':
        if (this.ride) return row('Вы пассажир', `${k('primary')} Удерживай — заброс, когда лодка стоит`);
        if (this.boat.active) return pad ? row(`${k('left')} Ход и руль`, `${k('primary')} Удерживай — заброс`) : row('<kbd class="g">W</kbd><kbd class="g">S</kbd> Ход', '<kbd class="g">A</kbd><kbd class="g">D</kbd> Руль', `${k('primary')} Удерживай — заброс`);
        return row(`${k('primary')} Удерживай — заброс`, `${k('tackle')} Снасти`, pad ? '' : '<kbd class="g">Q</kbd> Сменить наживку', `${k('run')} Бег`);
      case 'charge': return row('Отпусти — заброс', 'До белой риски — точно в метку');
      case 'cast': return row('Летит…');
      case 'wait': return f.lure ? row(`${k('primary')} Держи — веди приманку`, `${k('back')} Смотать`) : row('Ждём поклёвку', `${k('back')} Смотать`);
      case 'bite': return row(`${k('primary')} Подсекай!`);
      case 'fight': return row(`${k('primary')} Мотать`, 'Отпусти — ослабить', `${k('left')}${pad ? '' : k('right')} Вести`);
      case 'landed': return ''; // что делать с уловом и какими клавишами — написано на самой карточке улова
      default: return '';
    }
  }

  bindTouch() {
    const t = this.input.touch;
    const stick = $('#stick');
    const knob = stick.firstElementChild;
    // внизу слева живёт джойстик: плашка улова и наживки переезжает наверх, под название места (карта и так наверху справа)
    $('.hud-tl').insertBefore($('.tally'), $('#quests'));
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
    hold('#tP', () => this.input.pressed.add('KeyP'));
    hold('#tMenu', () => this.input.pressed.add('Escape'));
    hold('#tSit', () => this.input.pressed.add('KeyX'));
    hold('#tChat', () => this.input.pressed.add('Enter'));
    // чип удочки открывает снасти; наживка в плашке улова листается касанием
    $('#hotbar').addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.input.pressed.add('Tab');
    }, { passive: false });
    $('.tally .bait').addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.input.pressed.add('KeyQ');
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
    $('#tP').classList.toggle('hidden', st !== 'landed');
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
    // «стоп-кадр»: на подсечке время на миг замирает, а когда рыба выходит из воды — течёт медленнее
    let slow = 1;
    if (this.hitT > 0) {
      this.hitT -= Math.min(0.1, rawMs / 1000);
      slow = this.hitK;
    }
    const dt = Math.max(0, Math.min(0.1, rawMs / 1000)) * this.timeScale * slow;
    this.last = now;
    // стеклянные панели размывают картинку под собой только там, где на это есть запас: на «высоком» качестве и не на телефоне
    const blur = this.gfx.quality === 'high' && !this.input.touch.on;
    if (blur !== this.blurOn) document.body.classList.toggle('blur', (this.blurOn = blur));
    // под открытым меню игра размыта — надписи и панели читаются на любом фоне; на «низком» качестве размытия нет, фон там просто темнее
    const veil = this.gfx.quality !== 'low';
    if (veil !== this.veilOn) document.body.classList.toggle('veil', (this.veilOn = veil));
    if (this.scaleNext) {
      // Разрешение меняем здесь, до отрисовки. Смена размера стирает холст: если менять после отрисовки (так делал
      // автоподбор — в конце кадра), на экран уходит пустой кадр — чёрная вспышка.
      const k = this.scaleNext;
      this.scaleNext = 0;
      if (this.gfx.setScale(k)) this.saveAuto();
    }
    if (this.gfx.resize()) {
      this.camera.aspect = this.gfx.w / this.gfx.h;
      this.camera.updateProjectionMatrix();
      this.fishing.line.resize(this.gfx.w, this.gfx.h);
      this.vm.hangLine.resize(this.gfx.w, this.gfx.h);
      for (const p of this.players.values()) p.remote.line.resize(this.gfx.w, this.gfx.h);
    }
    const i = this.input;
    i.poll();
    this.frameNo++;
    const pnow = performance.now() / 1000;
    const T = this.nowSec();
    // Заставка и лобби — всегда в золотой час, как на макетах меню: низкое тёплое солнце, длинные тени. Часы самой
    // рыбалки идут своим чередом; смену света при входе в бухту прикрывает короткое затемнение (ui.dip).
    this.hours = this.fixedHour != null ? this.fixedHour : this.state === 'world' ? clockHours(T, 8) : MENU_HOUR + 0.12 * Math.sin(now * 0.00002);
    // погода: на заставке всегда ясно; при входе в бухту ставится сразу, дальше меняется плавно
    const wx = (this.weather = this.state === 'title' ? weatherAt('title', 0) : weatherAt(this.seed, Math.max(0, T), this.forceWx));
    this.world.setWeather(wx, this.wxSeed === this.seed ? dt : 0);
    this.wxSeed = this.seed;
    this.audio.rain(wx.rain, wx.wind);
    this.audio.wet = wx.rain;
    this.world.setClock(this.hours);
    heroRim.uRimCol.value.copy(this.world.rim);
    heroRim.uRimDir.value.copy(this.world.lightDir).transformDirection(this.camera.matrixWorldInverse);
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
      this.hearBoats();
      // в лодке время от времени поскрипывает дерево
      if (boat.active || this.ride) {
        this.creakT = (this.creakT || 4) - dt;
        if (this.creakT <= 0) {
          this.creakT = 5 + Math.random() * 10;
          this.audio.creak();
        }
      }
      // звуки мест: водопады на острове с маяком и костёр на Пальмовом — слышны вблизи, с той стороны, где они есть
      {
        const pl = this.player;
        const hear = (name, x, z, far, vol) => {
          const dx = x - pl.x, dz = z - pl.z;
          const d = Math.hypot(dx, dz);
          // взгляд игрока — вдоль (−sin yaw, −cos yaw); справа от него — (cos yaw, −sin yaw)
          this.audio.place(name, d, far, vol, d > 0.01 ? (dx * Math.cos(pl.yaw) - dz * Math.sin(pl.yaw)) / d : 0);
        };
        // (водопады есть не на каждой локации)
        if (FALLS.length) {
          const fall = FALLS.reduce((a, b) => (Math.hypot(a.bx - pl.x, a.bz - pl.z) < Math.hypot(b.bx - pl.x, b.bz - pl.z) ? a : b));
          hear('waterfall', fall.bx, fall.bz, 60, 0.55);
        }
        hear('fire', CAMPFIRE.x, CAMPFIRE.z, 16, 0.5);
        // чайки над морским косяком: чем ближе стая, тем чаще и громче крики — и с той стороны, где она кружит
        this.flockT = (this.flockT || 2) - dt;
        if (this.flockT <= 0) {
          let best = null, bd = FLOCK_FAR;
          for (const c of this.world.scenery.schools.sea) {
            const d = Math.hypot(c.x - pl.x, c.z - pl.z);
            if (c.on > 0.5 && d < bd) {
              bd = d;
              best = c;
            }
          }
          const k = best ? 1 - bd / FLOCK_FAR : 0;
          this.flockT = best ? 0.9 + Math.random() * 3.2 * (1.25 - k) : 1.5;
          if (best) this.audio.gullAt((0.05 + 0.2 * k * k) * (1 - 0.7 * this.world.night), bd > 0.01 ? (((best.x - pl.x) * Math.cos(pl.yaw) - (best.z - pl.z) * Math.sin(pl.yaw)) / bd) * 0.8 : 0);
          // дельфины рядом: скажем об этом один раз за игру
          if (!this.dolphinsSeen && this.fauna.dolphins.state(Math.max(0, T)).pods.some((q) => Math.hypot(q.x - pl.x, q.z - pl.z) < 75)) {
            this.dolphinsSeen = true;
            ui.toast('Рядом дельфины: стаи ходят по открытому морю своей дорогой', 'gold', 5200);
          }
        }
      }
      if (!ui.panel || !this.editing) {
        const noLook = !!ui.panel;
        if (noLook) i.lookDX = i.lookDY = 0;
        {
          // взгляд собирается на рыбе: при вываживании поле зрения чуть уже, в рывке — ещё; при замахе — тоже немного
          const ft = f.state === 'fight' ? f.fight : null;
          const want = ft ? 5 + (ft.phase === 'run' ? 3 : 0) + (ft.T > 0.78 ? 2 : 0) : f.state === 'charge' ? 3 * f.power : f.state === 'bite' ? 2 : 0;
          this.player.zoom = damp(this.player.zoom || 0, want, f.state === 'fight' ? 4 : 7, dt);
          // …и сам держится на ней, пока игрок не ведёт мышью: рыба — левее середины кадра, удилище с катушкой её не закрывают
          if (ft && settings.follow !== false && !noLook) {
            if (Math.abs(i.lookDX) + Math.abs(i.lookDY) > 0.6) this.followT = 1.3;
            else this.followT = Math.max(0, (this.followT || 0) - dt);
            if (!this.followT) {
              const pl = this.player;
              const dx = f.bx - pl.x;
              const dz = f.bz - pl.z;
              const k = 1 - Math.exp(-(ft.phase === 'run' ? 2.6 : 1.8) * dt);
              pl.yaw += angDiff(pl.yaw, Math.atan2(-dx, -dz) - 0.22) * k;
              pl.pitch += (clamp(-Math.atan2(cam.position.y, Math.hypot(dx, dz)), -0.85, 0.1) - pl.pitch) * k;
            }
          } else this.followT = 0.4; // после подсечки — короткая пауза, потом взгляд идёт к рыбе
          if (this.lookUp > 0) {
            // улов показываем на фоне моря и неба, а не досок под ногами; повёл мышью — дальше игрок смотрит сам
            this.lookUp = f.state !== 'landed' || Math.abs(i.lookDX) + Math.abs(i.lookDY) > 0.6 ? 0 : this.lookUp - dt;
            const pl = this.player;
            if (pl.pitch < -0.08) pl.pitch += (-0.05 - pl.pitch) * (1 - Math.exp(-5 * dt));
          }
        }
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
        ui.minimap(pl, [...this.players.values()].filter((p) => p.mode === 'world' && p.st).map((p) => ({ x: p.st[S.X], z: p.st[S.Z], slot: p.slot })), kit.sonar ? this.world.scenery.schools.centers : null, this.mapSea ? SEA_VIEW : MAP_VIEW, boat.rented && !boat.active ? boat : null, this.navStep(dt));
      }
      const aim = f.aim;
      if (!ui.panel && ((f.state === 'idle' && i.enabled && (i.grab || i.touch.on)) || f.state === 'charge')) {
        v3.set(aim.x, 0.05, aim.z).project(cam);
        ui.castMark({ x: (v3.x * 0.5 + 0.5) * this.gfx.w, y: (-v3.y * 0.5 + 0.5) * this.gfx.h, ok: aim.ok, hot: aim.spot && aim.spot.hot, clamped: aim.clamped, dist: aim.dist, zone: aim.spot ? zoneInfo(aim.spot.zone, LOC_ID).name : '', depth: aim.spot ? aim.spot.depth : 0, act: aim.act, who: aim.who });
      } else ui.castMark(null);
      ui.power(f.state === 'charge' ? f.power : null, aim.dist / kit.cast);
      $('#cross').className = !i.grab && !i.touch.on ? 'off' : f.state === 'idle' && !aim.ok ? 'bad' : '';
      // друг рядом с пустыми руками: на полосе пути — отметка «подсак с 70 %», и один раз за бой — подсказка
      if (f.state === 'fight' && !this.solo) {
        this.helpT = (this.helpT || 0) - dt;
        if (this.helpT <= 0) {
          this.helpT = 0.4;
          const me = this.player;
          let near = null;
          for (const p of this.players.values()) {
            const st = p.st;
            if (p.mode === 'world' && st && (st[S.FS] | 0) === 0 && (st[S.BOAT] | 0) !== 1 && Math.hypot(st[S.X] - me.x, st[S.Z] - me.z) < ASSIST_REACH) near = p;
          }
          this.helperNear = near;
          if (near && this.helpFight !== f.fight && !f.fight.junk) {
            this.helpFight = f.fight;
            ui.toast(f.fight.giant ? `${near.card.name} рядом — с ${Math.round(ASSIST_GIANT * 100)} % пути возьмёт гиганта багром` : `${near.card.name} рядом — с ${Math.round(ASSIST_AT * 100)} % пути возьмёт рыбу подсаком`, '', 3200);
          }
        }
      } else this.helperNear = null;
      ui.fight(f.state === 'fight' ? f.fight : null, i.steer);
      // музыка слушает игру: вываживание — пульс, тугая леска — тревога, легенда — минор, ночь и дождь — тише и реже
      this.audio.mood({ fight: f.state === 'fight' ? 1 : 0, tension: f.fight ? f.fight.T : 0, run: f.fight && f.fight.phase === 'run' ? 1 : 0, boss: f.fight ? f.fight.bossMax : 0, night: this.world.night, rain: wx.rain });
      // фрикцион трещит, когда рыба в рывке стягивает леску
      this.audio.drag(f.state === 'fight' && f.fight.phase === 'run' ? (i.hold ? 0.45 : 1) : 0);
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
        const flags = n.flags | (pl.sit ? FLAG.sit : 0) | (pl.dangle && pl.sit ? FLAG.dangle : 0) | (this.ownBoat() ? FLAG.own : 0);
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
        // фигурку друга видно издалека (по ней его и находят), имя — только вблизи
        const vis = v3.z < 1 && d < 170 && Math.abs(v3.x) < 1.1 && Math.abs(v3.y) < 1.1;
        tags.push({ id: p.id, x: (v3.x * 0.5 + 0.5) * this.gfx.w, y: (-v3.y * 0.5 + 0.5) * this.gfx.h, name: p.card.name, slot: p.slot, talk: r.talk > 0.08, say: r.sayT > 0 ? r.say : '', vis, far: d > 42, scale: clamp(1.25 - d / 40, 0.62, 1.1) });
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
      // табличка под ногами нужна, чтобы отличать своих в строю; когда рыбак один, она лишняя
      if (showPlates && !this.solo) {
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
          this.audio.horn();
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
        if (this.wxKind) ui.feed({ clear: 'Распогодилось — снова солнце', cloudy: `Небо затянуло. Рыба берёт охотнее: клёв <b class="y">+${add}%</b>`, rain: `Пошёл дождь. В дождь клюёт лучше всего: <b class="y">+${add}%</b>`, fog: `${LOC.say.fog}. Клёв <b class="y">+${add}%</b>` }[wx.kind]);
        this.wxKind = wx.kind;
      }
      if ((this.questT = (this.questT || 0) + 1) % 120 === 0 && this.syncQuests()) ui.toast('Новый день — новые задания (клавиша K)', 'gold', 4000);
      // где мы: подпись в углу и подсказка, чем место интересно (один раз)
      const area = this.areaAt(this.player.x, this.player.z);
      if (area !== this.area) {
        this.area = area;
        $('#locName').textContent = AREAS[area][0];
        this.areaSeen = this.areaSeen || new Set([HOME_AREA]);
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
    i.endFrame();
    window.__frames = (window.__frames || 0) + 1;
    this.frameMs = this.frameMs * 0.95 + rawMs * 0.05;
    const drawn = this.gfx.drawn;
    this.gfx.drawn = false;
    if (!this.manual) {
      this.perf.push(rawMs);
      if (this.tunePlan) {
        // Прежде чем упрощать картинку, проверяем, что кадры долгие из-за неё: ждём видеокарту и смотрим цену кадра.
        // Браузер в режиме экономии сам держит 30 кадров в секунду — тогда упрощать бесполезно, картинка станет хуже даром.
        // Смотрим два кадра подряд и берём дорогой: отражение в воде рисуется через кадр.
        const plan = this.tunePlan;
        const gl = this.gfx.renderer.getContext();
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, (this.px1 = this.px1 || new Uint8Array(4)));
        plan.work = Math.max(plan.work, performance.now() - frameT0);
        if (++plan.n >= 2) {
          this.tunePlan = null;
          this.lastWork = plan.work;
          if (plan.work > TARGET_MS * 0.6) this.applyTune(plan.out);
          else this.tuner.hold = 20; // десять секунд не трогаем: дело не в отрисовке
        }
      }
      this.tune(rawMs);
      if (this.perfOn && (this.perfT = (this.perfT || 0) + rawMs) > 500) {
        this.perfT = 0;
        this.ui.perfBox(this.perfLine());
      }
    }
    // Страховка: кадр был нарисован, а после этого холст стёрли (сменили его размер) — рисуем заново, иначе экран мигнёт чёрным
    if (drawn && this.gfx.wiped) this.gfx.render(this.scene, cam, this.world.exposure);
  }
  /**
   * Загрузка за заставкой: модели локации, шейдеры, текстуры и подбор качества. Всё, что иначе случилось бы
   * рывками уже в игре (первая отрисовка предмета — сборка его шейдера и отправка текстур), делается здесь.
   */
  async boot() {
    const el = $('#boot'), fill = $('#bootFill'), txt = $('#bootTxt');
    if (txt) txt.textContent = LOC.say.build; // в странице написано про бухту; у другой локации — своё слово
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
          // чего на локации нет (маяка на озере), того и не ждём — иначе заставка стояла бы все двенадцать секунд
          const got = [e.trees, e.palms, e.rocks, e.lighthouse || !HAS.lighthouse, e.kiosk, e.lamps > 0, !sc.propsState().fallback].filter(Boolean).length;
          say(0.3 + 0.3 * (got / 7));
          this.bootWaits = i; // сколько раз ждали модели (по 0,1 с) — для проверок
          // модель рыбы для сборки «рыбьих» шейдеров ждём не дольше четырёх секунд: не успела — соберутся в фоне
          if (got === 7 && (this.warmDone || i >= 40)) break;
          await wait(100);
        }
        // без видеокарты (программная отрисовка) «высокое» незачем даже собирать
        if (this.auto && !this.params.get('q') && !settings.autoQ && isSoftware(this.perf.gpu)) this.gfx.setQuality('low');
        say(0.6, 'Готовим видеокарту…');
        this.prepared = true;
        await this.gfx.prepare(this.scene, this.camera, (k) => say(0.6 + 0.26 * k), Object.values(surfaceU).map((u) => u.value));
        if (this.auto && !this.params.get('q')) {
          say(0.86, 'Подбираем качество…');
          // Мерить можно только то, что игрок увидит: вкладка в фоне или окно ещё без размера дали бы «всё летает».
          // Ждём до 15 секунд; не дождались — играем с тем, что есть, а замер сделаем при следующем запуске.
          const seen = () => !document.hidden && (this.gfx.resize(), this.gfx.w >= 200 && this.gfx.h >= 150);
          for (let i = 0; i < 60 && !seen(); i++) await wait(250);
          if (seen()) {
            this.camera.aspect = this.gfx.w / this.gfx.h;
            this.camera.updateProjectionMatrix();
            await this.calibrate();
          } else {
            // мерить нечего — берём запомненное как есть (ступень уже стоит с конструктора)
            const a = settings.autoQ;
            if (a && a.v === CALIB_V && a.gpu === this.perf.gpu) {
              this.gfx.setScale(a.scale || 1);
              if (a.refl != null) this.gfx.setRefl(+a.refl);
            }
            this.calib = { from: 'skipped' };
          }
        }
        say(0.94, 'Последние штрихи…');
        // Кадры за заставкой: обычный (всё встаёт на места) → «первый показ» всей сцены → снова обычный
        // (шейдеры теней, буферы) → снимок бухты для карточки места (он рисует мир с другой точки) → обычный.
        this.manual = true;
        const one = async () => {
          if (this.noRender) window.__render = true;
          this.frame(performance.now());
          await yieldNow();
        };
        await one();
        this.warmShown = this.warmDraw();
        await yieldNow();
        await one();
        // ждём видеокарту: всё начатое должно закончиться за заставкой, а не в первых кадрах игры
        const gl = this.gfx.renderer.getContext();
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
      } else if (this.auto && !this.params.get('q') && settings.autoQ && settings.autoQ.gpu === this.perf.gpu) {
        this.gfx.setScale(settings.autoQ.scale || 1);
        if (settings.autoQ.refl != null && settings.autoQ.v === CALIB_V) this.gfx.setRefl(+settings.autoQ.refl);
      }
    } catch (e) {
      console.warn('загрузка', e);
    }
    this.booting = false;
    this.prepared = true;
    this.gfx.warmFast = false; // заставка уходит: дальше текстуры новых моделей отдаём видеокарте по одной за кадр
    say(1);
    if (el) {
      el.classList.add('gone');
      setTimeout(() => el.remove(), 700);
    }
    this.manual = false;
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
    this.resumeGo(); // страницу открыли ради другой локации — продолжаем с того, что просил игрок
  }
  /**
   * Первый показ — за заставкой. Собранный шейдер видеокарта доводит до дела только при первой отрисовке с ним
   * (на Маке собирается «конвейер» Metal, на Windows — окончательный код под формат вершин), и предмет, впервые
   * попавший в кадр, давал рывок. Поэтому один кадр рисуем так, чтобы в него попало всё, что есть в сцене:
   * без отсечения по полю зрения и с показом спрятанного — героя, рук с удочкой, поплавка и лески, брызг и кругов,
   * лодки, дальних копий леса, заготовок рыбы и хлама. Источники света не трогаем: их набор у сцены один.
   * Картинку за заставкой никто не видит; следом идут обычные кадры.
   */
  warmDraw() {
    const uncull = [];
    const show = [];
    this.scene.traverse((o) => {
      if (o.isLight) return;
      if (!o.visible) {
        o.visible = true;
        show.push(o);
      }
      if (o.frustumCulled) {
        o.frustumCulled = false;
        uncull.push(o);
      }
    });
    try {
      this.gfx.render(this.scene, this.camera, this.world.exposure);
    } catch (e) {
      console.warn('первый показ', e);
    } finally {
      for (const o of uncull) o.frustumCulled = true;
      for (const o of show) o.visible = false;
    }
    return show.length;
  }
  /**
   * После смены ступени качества: у неё свои шейдеры и свои буферы, а значит — снова «первый показ» всего спрятанного
   * (иначе рыба, которой сейчас нет в кадре, собирала бы свой шейдер в момент подсечки). Следом сразу рисуем
   * обычный кадр: на экран должен попасть он, а не показ.
   */
  rewarm() {
    if (this.noRender || this.booting) return;
    this.warmDraw();
    this.gfx.render(this.scene, this.camera, this.world.exposure);
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
    // Берём тяжёлые кадры (верхнюю четверть без самого долгого): отражение в воде рисуется через кадр, и ровность хода
    // зависит от того, успевает ли к обновлению экрана именно кадр с отражением.
    return ms.sort((a, b) => a - b)[Math.min(ms.length - 1, Math.floor(ms.length * 0.75))];
  }
  /**
   * Подбор качества под машину (на «авто») — при каждой загрузке. Меряем цену кадра заставки, начиная с того,
   * что подобрано в прошлый раз: дорого — ступень ниже, большой запас — пробуем ступень выше (pickQuality в perf.js);
   * потом берём разрешение по цене кадра. Итог запоминается для этой видеокарты: с него начнёт следующий запуск.
   * force — забыть запомненное и начать с верхней ступени.
   */
  async calibrate(force = false) {
    const g = this.gfx;
    const gpu = this.perf.gpu;
    const saved = !force && settings.autoQ && settings.autoQ.v === CALIB_V && settings.autoQ.gpu === gpu && QUALITIES.includes(settings.autoQ.tier) ? settings.autoQ : null;
    const top = isSoftware(gpu) ? 'low' : isTouch() ? 'medium' : 'high';
    const refl = this.params.get('refl') === '0' ? 0 : 2; // наибольший разрешённый уровень отражений
    g.setScale(1);
    const set = async (tier, r) => {
      if (g.quality !== tier) {
        await g.shaders(this.scene, this.camera, tier); // у ступени свои шейдеры — собираем заранее, не подвешивая страницу
        g.setQuality(tier);
      }
      g.setRefl(tier === 'high' ? r : refl);
    };
    const start = saved ? { tier: saved.tier, refl: saved.refl === false ? 0 : saved.refl === true ? 2 : saved.refl } : { tier: top };
    const res = await pickQuality({ start, top, refl, cost: async (tier, r) => (await set(tier, r), this.frameCost(10, 4)) });
    await set(res.tier, res.refl);
    g.setScale(scaleFor(res.ms, res.tier));
    this.tuner = newTuner();
    settings.autoQ = { gpu, tier: res.tier, scale: g.scale, refl: g.reflLevel, ms: +res.ms.toFixed(1), v: CALIB_V, t: Date.now() };
    saveSettings();
    return (this.calib = { ...settings.autoQ, from: 'measured', log: res.log });
  }
  /** Автоподбор на ходу: кадры проседают — уменьшаем разрешение, не помогло — картинка проще; полегчало — возвращаем. */
  tune(ms) {
    const g = this.gfx;
    if (this.params.get('q') || this.noRender || this.booting || document.hidden || ms > 400) return;
    const A = (this.tuneAcc = this.tuneAcc || { sum: 0, n: 0, v: new Float32Array(160) });
    if (A.n < A.v.length) A.v[A.n] = ms;
    A.sum += ms;
    A.n++;
    if (A.sum < 500) return;
    const avg = A.sum / A.n;
    // средняя длительность не видит рывков: считаем ещё и долю кадров, пропустивших обновление экрана
    const jit = longShare(A.v.subarray(0, Math.min(A.n, A.v.length)));
    A.sum = A.n = 0;
    this.lastJit = jit;
    // во время заброса, поклёвки и вываживания картинку вверх не меняем: смена разрешения сама даёт рывок;
    // ступень качества в это время тоже не трогаем — её смена заметна, подождёт до конца вываживания
    const st = this.fishing.state;
    const busy = (st !== 'idle' && st !== 'wait') || !!this.benchOn;
    const out = tuneStep(this.tuner, avg, {
      scale: g.scale, floor: g.quality === 'low' ? 0.5 : 0.62, canDrop: this.auto && g.quality !== 'low' && !this.tierBusy && !busy, drs: settings.drs !== false,
      refl: this.auto && g.quality === 'high' && g.canPost ? g.reflLevel : 0, jit, busy
    });
    if (!out) return;
    // вверх — сразу; вниз — после проверки настоящей цены двух следующих кадров (см. frame)
    if (out.scale && out.scale > g.scale) this.applyTune(out);
    else this.tunePlan = { out, n: 0, work: 0 };
  }
  applyTune(out) {
    const g = this.gfx;
    if (out.refl != null) g.setRefl(out.refl); // отражения дешевле или совсем без них: меняется один небольшой буфер
    else if (out.scale) {
      this.scaleNext = out.scale; // холст трогаем только до отрисовки — в начале следующего кадра (см. frame)
      return;
    } else if (!this.tierBusy) {
      // Ступень ниже. Её шейдеры сначала собираются в фоне, и только потом картинка переключается — без рывка.
      const next = g.quality === 'high' ? 'medium' : 'low';
      this.tierBusy = true;
      g.shaders(this.scene, this.camera, next).then(() => {
        this.tierBusy = false;
        if (!this.auto || this.params.get('q')) return;
        g.setQuality(next);
        g.setScale(0.85);
        this.rewarm();
        this.tuner = newTuner();
        this.saveAuto();
      });
      return;
    }
    this.saveAuto();
  }
  saveAuto() {
    if (!this.auto) return;
    const g = this.gfx;
    settings.autoQ = { ...(settings.autoQ || {}), gpu: this.perf.gpu, tier: g.quality, scale: g.scale, refl: g.reflLevel, v: CALIB_V, t: (settings.autoQ && settings.autoQ.t) || Date.now() };
    saveSettings();
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
      this.rewarm();
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
    const rf = g.quality === 'high' && g.canPost ? [' · без отражений', ' · отражения ¼', ''][g.reflLevel] : '';
    return `${s.fps.toFixed(0)} к/с · ${s.avg.toFixed(1)} мс · худшие ${s.p99.toFixed(0)} мс · неровных ${Math.round(s.long * 100)}%<br>${qn}${this.auto ? ' (авто)' : ''}${rf} · ${r.domElement.width}×${r.domElement.height}${g.scale < 0.99 ? ` · ${Math.round(g.scale * 100)}%` : ''}<br>вызовов ${i.calls} · треугольников ${(i.triangles / 1000).toFixed(0)} тыс.`;
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
      med: deltas[deltas.length >> 1] || 0, long: longShare(deltas), refl: g.quality === 'high' && g.canPost ? g.reflLevel : -1,
      cores: navigator.hardwareConcurrency || 0, mem: navigator.deviceMemory || 0, ua: navigator.userAgent
    };
    const qn = { low: 'низкое', medium: 'среднее', high: 'высокое' }[res.quality] + (['', ', без отражений в воде', ', отражения в четверть кадра', ''][res.refl + 1] || '');
    // чем кончился подбор при загрузке: по этой строчке видно, с чего игра начала и что намерила
    const cb = this.calib;
    const ru = (n) => n.replace(/^(low|medium|high)/, (t) => ({ low: 'низкое', medium: 'среднее', high: 'высокое' })[t]);
    const cbLine = !cb ? '' : cb.from === 'measured' ? `Подбор при загрузке: ${(cb.log || []).map(([n, ms]) => `${ru(n)} ${ms} мс`).join(' → ')}` : 'Подбор при загрузке: не делался (окно было в фоне)';
    const worst = Math.max(...rows.map((x) => x.cost));
    res.verdict = res.fps >= 55 && worst < 14 ? 'Игра идёт плавно, запас есть.' : res.fps >= 50 ? 'Игра идёт плавно, но без запаса.' : res.fps >= 38 ? 'Тяжеловато: кадров меньше, чем хотелось бы.' : 'Этой машине тяжело.';
    res.text = [
      'РЫБАК — проверка компьютера',
      `Видеокарта: ${res.gpu || 'браузер не сообщил'}`,
      `Окно ${res.screen[0]}×${res.screen[1]} (×${res.dpr}), рисуется ${res.buf[0]}×${res.buf[1]}${res.scale < 0.99 ? `, разрешение ${Math.round(res.scale * 100)}%` : ''}`,
      `Качество: ${qn}${res.auto ? ' (авто)' : ''}`,
      `Цена кадра, мс: ${rows.map((x) => `${x.name} ${x.cost.toFixed(1)}`).join(', ')}`,
      `В игре: ${res.fps.toFixed(0)} к/с, обычный кадр ${res.med.toFixed(1)} мс, худшие кадры ${res.p99.toFixed(0)} мс, самый долгий ${res.max.toFixed(0)} мс, неровных кадров ${Math.round(res.long * 100)}%, рывков дольше 50 мс: ${hitches}`,
      ...(cbLine ? [cbLine] : []),
      `Вызовов отрисовки ${Math.min(...rows.map((x) => x.calls))}–${Math.max(...rows.map((x) => x.calls))}, треугольников ${(Math.min(...rows.map((x) => x.tris)) / 1e6).toFixed(2)}–${(Math.max(...rows.map((x) => x.tris)) / 1e6).toFixed(2)} млн`,
      `Процессор: потоков ${res.cores || '?'}, память ${res.mem ? res.mem + ' ГБ' : '?'}`,
      res.ua,
      res.verdict
    ].join('\n');
    return (this.lastBench = res);
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
