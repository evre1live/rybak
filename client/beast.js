// Чудища и киты в мире: существо (модель Tripo с живым изгибом тела), знаки в воде, общая шкала боя на экране,
// подмотка своей лески и багор. Ход боя ведёт сервер (server/beast.js) — здесь только картинка и свои действия.
// Своя леска в бою — состояние 'beast' рыбалки (fishing.js): натяжение и рывки как у гиганта, а общий ход — сервер.
import * as THREE from 'three';
import { BEASTS, BEAST_K, BEAST_BY_BAIT, beastAwake } from '../shared/beasts.js';
import { loadModel, modelGeometry } from './models.js';
import { waveH } from './water.js';
import { LOC_ID } from './loc/id.js';
import { spotAt, groundH } from './terrain.js';
import { BEAST_LIST } from '../shared/beasts.js';
import { damp } from './util.js';

const X = 0;
const Z = 2;
// голова модели — к +X или −X (после выравнивания по длинной оси); у кракена длинной оси нет — он «круглый»
const SHAPE = {
  'beast-nessie': { head: 1, neck: true },
  'beast-serpent': { head: 1 },
  'beast-chudo': { head: -1 },
  'fauna-kit': { head: -1 },
  'beast-kraken': { round: true }
};
const esc = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);

/** Модель существа: выровнена по длинной оси (голова к −X), низ — у нуля, длина — len метров, тело изгибается волной. */
function beastMesh(tpl, def) {
  const src = modelGeometry(tpl);
  if (!src) return null;
  const g = src.g;
  const sh = SHAPE[def.model] || {};
  g.computeBoundingBox();
  const c = g.boundingBox.getCenter(new THREE.Vector3());
  g.translate(-c.x, -g.boundingBox.min.y, -c.z);
  if (!sh.round) {
    // длинная ось — по X
    const s = g.boundingBox.getSize(new THREE.Vector3());
    if (s.z > s.x) g.rotateY(Math.PI / 2);
    if (sh.head === 1) g.rotateY(Math.PI);
  }
  g.computeBoundingBox();
  const size = g.boundingBox.getSize(new THREE.Vector3());
  const k = def.len / Math.max(size.x, size.z);
  g.scale(k, k, k);
  g.computeBoundingBox();
  const half = Math.max(g.boundingBox.max.x, -g.boundingBox.min.x, 1);
  const mat = src.material.clone();
  const uT = { value: 0 };
  const uAmp = { value: 0.6 };
  mat.onBeforeCompile = (s) => {
    s.uniforms.uBT = uT;
    s.uniforms.uBAmp = uAmp;
    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uBT, uBAmp;\nvarying float vBU;')
      .replace(
        '#include <begin_vertex>',
        sh.round
          ? `#include <begin_vertex>
      { float r = length(transformed.xz); float w = sin(r * 0.9 - uBT * 1.7 + atan(transformed.z, transformed.x) * 2.0);
        transformed.y += w * uBAmp * 0.12 * r * r / ${(half * half).toFixed(2)} * ${half.toFixed(2)};
        transformed.xz *= 1.0 + 0.04 * uBAmp * sin(uBT * 1.3 + r); }`
          : `#include <begin_vertex>
      { float u = (transformed.x + ${half.toFixed(2)}) / ${(2 * half).toFixed(2)}; // 0 — голова, 1 — хвост
        float w = sin(u * 5.5 - uBT * 2.2) * (0.15 + 0.85 * u * u);
        transformed.z += w * uBAmp * ${(half * 0.16).toFixed(3)}; vBU = u; }`
      );
    s.vertexShader = s.vertexShader.replace('void main() {', 'void main() {\nvBU = 0.0;');
    if (def.tint === 'rainbow') {
      // Радужный змей: чешуя переливается всеми цветами — полосы цвета бегут от головы к хвосту и светятся
      s.fragmentShader = s.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uBT;\nvarying float vBU;')
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
        vec3 rbw = 0.5 + 0.5 * cos(6.2832 * (vBU * 1.7 - uBT * 0.07 + vec3(0.0, 0.33, 0.67)));
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.3 + rbw * 0.8, 0.78);`
        )
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += (0.5 + 0.5 * cos(6.2832 * (vBU * 1.7 - uBT * 0.07 + vec3(0.0, 0.33, 0.67)))) * 0.16;');
    } else s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vBU;');
  };
  mat.customProgramCacheKey = () => 'beast' + (sh.round ? 'R' : 'L') + half.toFixed(1) + (def.tint || '');
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  m.frustumCulled = false;
  return { mesh: m, uT, uAmp, half, height: g.boundingBox.max.y, neck: !!sh.neck, round: !!sh.round };
}

export class Beasts {
  constructor(game) {
    this.g = game;
    this.b = null; // состояние с сервера (pubBeast)
    this.view = null; // { kind, mesh, ... }
    this.models = new Map();
    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.sendT = 0;
    this.gaffT = 0;
    this.phaseSeen = '';
    this.signT = 0;
    this.lungeSeen = 0;
    const shadowMat = new THREE.MeshBasicMaterial({ color: '#04121c', transparent: true, opacity: 0, depthWrite: false });
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 40), shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.renderOrder = 19;
    this.shadow.visible = false;
    game.scene.add(this.shadow);
    this.hud = document.createElement('div');
    this.hud.id = 'beasthud';
    this.hud.style.display = 'none';
    document.body.appendChild(this.hud);
    const css = document.createElement('style');
    css.textContent = `#beasthud{position:fixed;left:50%;top:124px;transform:translateX(-50%);z-index:30;min-width:300px;max-width:min(560px,90vw);padding:10px 16px 12px;border-radius:16px;
background:rgba(10,28,52,.62);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#fff;font:600 14px/1.3 inherit;text-align:center;box-shadow:0 8px 28px rgba(0,0,0,.25);pointer-events:none}
#beasthud b{display:block;font-size:17px;letter-spacing:.02em;font-style:italic}
#beasthud .bar{height:9px;margin:7px 0 6px;border-radius:6px;background:rgba(255,255,255,.18);overflow:hidden}
#beasthud .bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#2dd4bf,#f472b6);transition:width .25s}
#beasthud small{display:block;opacity:.85;font-weight:500}
#beasthud em{display:block;margin-top:5px;font-style:normal;font-weight:800;color:#fde047}
#beasthud em.hot{color:#fb7185}`;
    document.head.appendChild(css);
  }
  get def() {
    return this.b && BEASTS[this.b.kind];
  }
  /** Кто я в бою. */
  meIn() {
    const me = this.g.me && this.g.me.id;
    return { hooked: !!(this.b && me && this.b.hooked.includes(me)), me };
  }
  nameOf(id) {
    if (this.g.me && id === this.g.me.id) return 'вас';
    const p = this.g.players.get(id);
    return p ? p.card.name : 'друга';
  }
  /** Где сейчас игрок id (свой — из player). */
  spotOf(id) {
    if (this.g.me && id === this.g.me.id) return [this.g.player.x, this.g.player.z];
    const p = this.g.players.get(id);
    return p && p.st ? [p.st[X], p.st[Z]] : null;
  }

  /** Ближайшая к (x, z) точка зоны zone (для проверок и подсказок): [x, z] или null. */
  zonePoint(zone, x, z, R = 160) {
    let best = null;
    let bd = Infinity;
    for (let dx = -R; dx <= R; dx += 4)
      for (let dz = -R; dz <= R; dz += 4) {
        const d = dx * dx + dz * dz;
        if (d >= bd) continue;
        const sp = spotAt(x + dx, z + dz);
        if (sp && sp.zone === zone) (bd = d), (best = [x + dx, z + dz]);
      }
    return best;
  }
  // ── своя приманка упала в воду ──
  /**
   * Снасть легла в воду в (x, z), зона spot. Особая приманка в логове — зовём существо; любая снасть рядом с
   * существом, которое уже взяло, — подсекаем вместе с остальными. Вернуть true — обычная поклёвка не нужна.
   */
  onLand(x, z, spot) {
    const g = this.g;
    const tk = g.profile.equip.tackle;
    const bait = BEAST_BY_BAIT[tk];
    const b = this.b;
    if (b && (b.phase === 'bite' || b.phase === 'fight' || b.phase === 'gaff') && !this.meIn().hooked) {
      if (Math.hypot(x - this.pos.x, z - this.pos.z) <= BEAST_K.hookR) {
        g.net.send({ t: 'beast', a: 'hook', x, z });
        return true;
      }
    }
    if (!bait) return false;
    const say = (t) => (g.ui.toast(t), true);
    if (bait.loc !== LOC_ID) return say(`${bait.name} здесь не водится: ${bait.place} — на другой локации`);
    if (spot.zone !== bait.zone) return say(`${bait.name} живёт не здесь — бросайте в зону «${bait.place}»`);
    if (!beastAwake(bait, g.hours, g.weather.kind)) return say(`${bait.name} выходит ${bait.whenText}. Приманка цела — попробуйте позже`);
    if (g.solo || !g.net.room) return say(`Одному не удержать: ${bait.name} ловят только вдвоём и больше — позовите друга`);
    if (b && b.phase !== 'won' && b.phase !== 'gone') return say(`${BEASTS[b.kind].name} уже здесь`);
    g.net.send({ t: 'beast', a: 'call', kind: bait.id, x, z });
    return true;
  }

  // ── состояние с сервера ──
  set(b) {
    const g = this.g;
    if (!b || b.phase === 'none') {
      this.drop();
      return;
    }
    const prev = this.b;
    const fresh = !prev || prev.id !== b.id;
    this.b = b;
    const def = BEASTS[b.kind];
    const { hooked, me } = this.meIn();
    if (fresh) {
      this.pos.set(b.x, -4, b.z);
      this.yaw = Math.random() * Math.PI * 2;
      this.lungeSeen = 0;
      this.phaseSeen = '';
      this.mount(def);
    }
    if (b.phase !== this.phaseSeen) {
      const was = this.phaseSeen;
      this.phaseSeen = b.phase;
      const who = this.nameOf(b.by);
      if (b.phase === 'call') {
        if (b.by === me) {
          // приманка ушла в дело
          const p = g.profile;
          p.tackle[def.bait] = Math.max(0, (p.tackle[def.bait] || 0) - 1);
          if (!p.tackle[def.bait]) {
            delete p.tackle[def.bait];
            p.equip.tackle = 'bread';
          }
        }
        g.ui.feed(`Вода у места «${def.place}» закипела: <b>${def.name}</b> идёт на приманку ${b.by === me ? 'вашу' : esc(who)}!`);
        g.audio.tone(46, 2.4, 'sine', 0.32, 38);
      } else if (b.phase === 'bite') {
        g.ui.toast(b.by === me ? `${def.name} взял(а)! Нужен второй: пусть забросит рядом и подсечёт — ${BEAST_K.biteWindow} с` : `${def.name} взял(а) у ${who}! Забросьте рядом — подсечёте вместе`, 'good');
        g.fx.splash(b.x, b.z, 2.4);
        g.audio.tone(70, 1.2, 'sawtooth', 0.12, 40);
      } else if (b.phase === 'fight' && was === 'bite') {
        g.ui.toast(`Держите вдвоём! Существо бросается то на одного, то на другого — на кого рывок, тот отпускает`, 'good');
      } else if (b.phase === 'gaff') {
        g.ui.toast(`${def.name} у борта! Багор — клавиша E, нужны двое разом`, 'good');
      } else if (b.phase === 'won') {
        this.win(def, b);
      } else if (b.phase === 'gone') {
        if (b.why) g.ui.toast(b.why);
        if (g.fishing.state === 'beast') g.fishing.beastEnd();
      }
    }
    // меня взяли в бой (подсёк или вернулся после обрыва) — своя леска переходит в общий бой
    if (hooked && (b.phase === 'bite' || b.phase === 'fight' || b.phase === 'gaff') && g.fishing.state !== 'beast') g.fishing.beastHook(this, def);
    if (!hooked && g.fishing.state === 'beast' && b.phase !== 'won') g.fishing.beastEnd();
    // рывок
    const lu = b.lunge;
    if (lu && lu.until !== this.lungeSeen) {
      this.lungeSeen = lu.until;
      this.lungeAt = lu.to;
      this.lungeT = BEAST_K.lungeT;
      if (lu.to === me) {
        g.fishing.beastLunge();
        g.audio.tone(90, 0.5, 'sawtooth', 0.14, 60);
      }
      const at = this.spotOf(lu.to);
      if (at) this.lungeDir = Math.atan2(this.pos.x - at[0], this.pos.z - at[1]);
      g.fx.splash(this.pos.x, this.pos.z, 2);
    }
    this.renderHud();
  }
  /** Победа: трофей каждому, кто держал или бил багром. */
  win(def, b) {
    const g = this.g;
    const me = g.me && g.me.id;
    const names = b.win.map((id) => (id === me ? g.profile.name || 'вы' : this.nameOf(id))).join(', ');
    if (me && b.win.includes(me)) {
      const p = g.profile;
      p.coins += def.coins;
      p.xp += def.xp;
      p.beasts = p.beasts && typeof p.beasts === 'object' ? p.beasts : {};
      p.beasts[def.id] = (p.beasts[def.id] || 0) + 1;
      p.stats.beasts = (p.stats.beasts || 0) + 1;
      g.ui.toast(`${def.name} — ваш общий трофей! +${def.coins.toLocaleString('ru')} монет, +${def.xp.toLocaleString('ru')} опыта. Существо отпускаете — нажмите P, чтобы сделать снимок`, 'good');
      g.afterBeast && g.afterBeast(def);
    }
    g.ui.feed(`<b>${esc(def.name)}</b> взят(а) вместе: ${esc(names)}. Существо отпустили`);
    g.audio.tone(523, 0.3, 'triangle', 0.14);
    g.audio.tone(659, 0.3, 'triangle', 0.14, null, 0.18);
    g.audio.tone(784, 0.5, 'triangle', 0.14, null, 0.36);
    if (g.fishing.state === 'beast') g.fishing.beastEnd(true);
  }
  mount(def) {
    if (this.view) {
      this.view.mesh.removeFromParent();
      this.view = null;
    }
    this.loadState = 'wait';
    loadModel(def.model).then(
      (tpl) => {
        this.loadState = 'got';
        if (!this.b || this.b.kind !== def.id) return;
        this.loadState = 'mesh';
        const v = beastMesh(tpl, def);
        if (!v) return;
        v.kind = def.id;
        this.view = v;
        v.mesh.visible = false;
        this.g.scene.add(v.mesh);
      },
      (e) => (this.loadErr = String(e && e.message))
    ).catch((e) => (this.loadErr = String(e && e.message)));
  }
  drop() {
    if (this.view) this.view.mesh.removeFromParent();
    this.view = null;
    this.b = null;
    this.shadow.visible = false;
    this.hud.style.display = 'none';
    if (this.g.fishing.state === 'beast') this.g.fishing.beastEnd();
  }

  /** Куда идёт леска: рот существа у поверхности. */
  lineEnd(out) {
    const v = this.view;
    const k = v ? v.half * 0.9 : 3;
    return out.set(this.pos.x - Math.cos(this.yaw) * k, Math.max(this.pos.y + (v && v.neck ? 2.5 : 0.3), 0.05), this.pos.z + Math.sin(this.yaw) * k);
  }

  /**
   * Следы: существо этой локации не спит (его время и погода), а рядом его логово — изредка по воде проходит
   * огромная тень, поднимаются пузыри. Видно и одному: так находят логово и узнают время.
   */
  signs(dt, t) {
    const g = this.g;
    this.trailT = (this.trailT ?? 6) - dt;
    if (this.trailT > 0) return;
    this.trailT = 14 + Math.random() * 14;
    const awake = BEAST_LIST.filter((d) => d.loc === LOC_ID && beastAwake(d, g.hours, g.weather.kind));
    if (!awake.length) return;
    const pl = g.player;
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 18 + Math.random() * 40;
      const x = pl.x + Math.cos(a) * r;
      const z = pl.z + Math.sin(a) * r;
      const sp = spotAt(x, z);
      const d = sp && awake.find((q) => q.zone === sp.zone);
      if (!d) continue;
      this.trail = { x, z, a: Math.random() * Math.PI * 2, t: 0, len: d.len };
      g.fx.ripple(x, z, 3.5, 3.2, 0.2);
      for (let k = 0; k < 14; k++) g.fx.drop(x + (Math.random() - 0.5) * 4, waveH(x, z, t), z + (Math.random() - 0.5) * 4, 0, 0.6 + Math.random(), 0, 0.035, 0.4);
      return;
    }
  }
  update(dt, t) {
    const b = this.b;
    const g = this.g;
    if (!b) {
      // с особой приманкой в руках модель существа загружаем заранее: к поклёвке она уже будет готова
      const bait = BEAST_BY_BAIT[g.profile.equip.tackle];
      if (bait && bait.loc === LOC_ID && this.preloaded !== bait.model) {
        this.preloaded = bait.model;
        loadModel(bait.model).catch(() => {});
      }
      // тень проходит под водой и тает
      this.signs(dt, t);
      const tr = this.trail;
      if (tr) {
        tr.t += dt;
        const k = tr.t / 6;
        this.shadow.visible = k < 1;
        if (k >= 1) this.trail = null;
        else {
          this.shadow.position.set(tr.x + Math.cos(tr.a) * tr.t * 2, waveH(tr.x, tr.z, t) - 0.12, tr.z + Math.sin(tr.a) * tr.t * 2);
          this.shadow.scale.set(tr.len * 0.42, tr.len * 0.2, 1);
          this.shadow.rotation.z = -tr.a;
          this.shadow.material.opacity = Math.sin(Math.PI * k) * 0.35;
        }
      }
      return;
    }
    const def = BEASTS[b.kind];
    const { hooked } = this.meIn();
    // куда плыть: в логове; в бою — от логова к тем, кто держит, по мере вываживания; в рывке — прочь от рыбака
    const hk = b.hooked.map((id) => this.spotOf(id)).filter(Boolean);
    const cx = hk.length ? hk.reduce((s, p) => s + p[0], 0) / hk.length : b.x;
    const cz = hk.length ? hk.reduce((s, p) => s + p[1], 0) / hk.length : b.z;
    const P = b.P || 0;
    let tx = b.x;
    let tz = b.z;
    let ty = -4;
    let speed = 1.2;
    if (b.phase === 'call') ty = -5 + Math.min(1, (t - (this.callT0 || (this.callT0 = t))) / BEAST_K.callT) * 2.5;
    else if (b.phase === 'bite' || b.phase === 'fight') {
      const k = Math.min(0.8, P * 0.85);
      const r = 7 - P * 3;
      const a = t * 0.18 + b.id;
      tx = b.x + (cx - b.x) * k + Math.cos(a) * r;
      tz = b.z + (cz - b.z) * k + Math.sin(a) * r;
      ty = b.phase === 'bite' ? -0.4 : -0.9 + Math.max(0, Math.sin(t * 0.35)) * 0.7;
      speed = 2;
      if (this.lungeT > 0) {
        this.lungeT -= dt;
        tx = this.pos.x + Math.sin(this.lungeDir || 0) * 9;
        tz = this.pos.z + Math.cos(this.lungeDir || 0) * 9;
        ty = -0.35;
        speed = 6;
        if (Math.random() < dt * 8) g.fx.wake(this.pos.x, this.pos.z, 1.2, 1.6);
      }
    } else if (b.phase === 'gaff') {
      const d = Math.hypot(b.x - cx, b.z - cz) || 1;
      tx = cx + ((b.x - cx) / d) * (4.5 + (this.view ? this.view.half * 0.6 : 3));
      tz = cz + ((b.z - cz) / d) * (4.5 + (this.view ? this.view.half * 0.6 : 3));
      ty = -0.25;
      speed = 1.4;
    } else if (b.phase === 'won' || b.phase === 'gone') {
      tx = this.pos.x + Math.sin(this.yaw) * 6;
      tz = this.pos.z + Math.cos(this.yaw) * 6;
      ty = b.phase === 'won' && t - (this.endT0 || (this.endT0 = t)) < 3 ? -0.2 : -9;
      speed = 1.5;
    }
    // существо держится глубины: цель на мели или на берегу — сдвигаем к логову, пока под ним не будет воды
    const deepAt = (x, z) => groundH(x, z) < -Math.max(1.6, (this.view ? this.view.height : 2) * 0.6);
    if (!deepAt(tx, tz)) {
      for (let i = 1; i <= 16; i++) {
        const k = i / 16;
        const x = tx + (b.x - tx) * k;
        const z = tz + (b.z - tz) * k;
        if (deepAt(x, z) || i === 16) {
          tx = x;
          tz = z;
          break;
        }
      }
    }
    if (b.phase !== 'won' && b.phase !== 'gone') this.endT0 = 0;
    if (b.phase !== 'call') this.callT0 = 0;
    const dx = tx - this.pos.x;
    const dz = tz - this.pos.z;
    const dd = Math.hypot(dx, dz);
    if (dd > 0.05) {
      const step = Math.min(dd, speed * dt);
      this.pos.x += (dx / dd) * step;
      this.pos.z += (dz / dd) * step;
      // голова (−X модели) смотрит по ходу
      const want = Math.atan2(dz, -dx);
      let da = want - this.yaw;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      this.yaw += da * Math.min(1, dt * 1.6);
    }
    this.pos.y = damp(this.pos.y, ty, 1.2, dt);
    const v = this.view;
    const surf = waveH(this.pos.x, this.pos.z, t);
    if (v) {
      v.mesh.visible = this.pos.y > -7.5;
      v.mesh.position.set(this.pos.x, this.pos.y + surf - (v.round ? v.height * 0.35 : v.height * 0.55), this.pos.z);
      v.mesh.rotation.set(0, this.yaw, Math.sin(t * 0.5) * 0.04);
      v.uT.value = t;
      v.uAmp.value = damp(v.uAmp.value, this.lungeT > 0 ? 1.6 : b.phase === 'gaff' ? 0.4 : 0.8, 2, dt);
    }
    // знаки: тень под водой, пузыри и круги, пока существо идёт к приманке; круги у бьющегося у поверхности
    const show = b.phase === 'call' || b.phase === 'bite';
    this.shadow.visible = show || b.phase === 'fight';
    const len = def.len;
    this.shadow.position.set(this.pos.x, surf - 0.12, this.pos.z);
    this.shadow.scale.set(len * 0.42, len * 0.22, 1);
    this.shadow.rotation.z = -this.yaw;
    this.shadow.material.opacity = damp(this.shadow.material.opacity, show ? 0.42 + Math.sin(t * 2) * 0.08 : 0.18, 2, dt);
    this.signT -= dt;
    if (this.signT <= 0 && b.phase !== 'won' && b.phase !== 'gone') {
      this.signT = show ? 0.35 : 1.1;
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * len * 0.3;
      g.fx.ripple(this.pos.x + Math.cos(a) * r, this.pos.z + Math.sin(a) * r, show ? 1.4 : 0.9, 1.6);
      if (show) for (let i = 0; i < 6; i++) g.fx.drop(this.pos.x + (Math.random() - 0.5) * 3, surf, this.pos.z + (Math.random() - 0.5) * 3, 0, 0.8 + Math.random() * 1.2, 0, 0.03 + Math.random() * 0.03, 0.4);
    }
    // своя подмотка — серверу четыре раза в секунду
    if (hooked) {
      this.sendT -= dt;
      if (this.sendT <= 0) {
        this.sendT = 0.25;
        const gain = g.fishing.beastTake();
        if (gain > 0) g.net.send({ t: 'beast', a: 'pull', g: +gain.toFixed(4) });
      }
    }
    // багор: у борта — E (держащим и тем, кто рядом)
    this.gaffT -= dt;
    if (b.phase === 'gaff' && this.gaffT <= 0 && g.input.enabled && g.input.hit('KeyE')) {
      const near = Math.hypot(g.player.x - this.pos.x, g.player.z - this.pos.z) < 30;
      if (hooked || near) {
        this.gaffT = 1;
        g.net.send({ t: 'beast', a: 'gaff' });
        g.fx.splash(this.pos.x, this.pos.z, 1.4);
        g.audio.tone(220, 0.15, 'square', 0.08);
      } else g.ui.toast('Далеко: подойдите ближе к существу');
    }
    this.renderHud();
  }
  renderHud() {
    const b = this.b;
    if (!b || b.phase === 'won' || b.phase === 'gone') {
      this.hud.style.display = 'none';
      return;
    }
    const def = BEASTS[b.kind];
    const { hooked, me } = this.meIn();
    const names = b.hooked.map((id) => (id === me ? 'вы' : this.nameOf(id)));
    let line = '';
    let hot = false;
    if (b.phase === 'call') line = 'Вода бурлит — существо идёт на приманку';
    else if (b.phase === 'bite') line = hooked ? 'Нужен второй: пусть забросит рядом' : 'Забросьте рядом с ним — и подсечёте вместе';
    else if (b.phase === 'gaff') line = 'У борта! Багор — E, нужны двое разом';
    else if (b.lunge) {
      hot = b.lunge.to === me;
      line = hot ? 'Рывок на вас — отпускайте!' : `Рывок на ${this.nameOf(b.lunge.to)} — тяните сильнее!`;
    } else if (!hooked) line = 'Забросьте рядом — подцепитесь к бою';
    const html = `<b>${esc(def.name)}</b><div class="bar"><i style="width:${Math.round((1 - (b.P || 0)) * 100)}%"></i></div><small>${b.phase === 'call' ? esc(def.place) : `Держат: ${esc(names.join(', ') || 'никто')}`}</small>${line ? `<em class="${hot ? 'hot' : ''}">${esc(line)}</em>` : ''}`;
    if (html !== this.hudHtml) {
      this.hudHtml = html;
      this.hud.innerHTML = html;
    }
    this.hud.style.display = '';
  }
}
