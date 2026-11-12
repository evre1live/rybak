// Друзья в бухте: персонаж, удочка, леска, поплавок и рыба на крючке — по данным с сервера.
import * as THREE from 'three';
import { Character } from './character.js';
import { buildRod, buildFloat, buildLure } from './gear3d.js';
import { buildFish, wiggleFish } from './fish3d.js';
import { FishLine } from './line.js';
import { BoatVisual, moorSpot, wake, VMAX } from './boat.js';
import { S, FS_NAME, FLAG, MARKS } from './proto.js';
import { ITEMS, FISH_BY_ID, isLure } from '../shared/data.js';
import { angDiff, lerp, clamp } from './util.js';

const tip = new THREE.Vector3();
const end = new THREE.Vector3();
const seat = new THREE.Vector3();
const spot = { x: 0, z: 0, yaw: 0 };
const DELAY = 0.14;

export class Remote {
  constructor(scene, p) {
    this.scene = scene;
    this.id = p.id;
    this.slot = p.slot;
    this.mode = p.mode;
    this.card = null;
    this.char = new Character(p.card.look);
    this.char.group.visible = false;
    scene.add(this.char.group);
    this.line = new FishLine(scene);
    this.bob = null;
    this.fish = null;
    this.a = null;
    this.b = null;
    this.cur = null;
    this.emote = null;
    this.emoteT = 0;
    this.say = '';
    this.sayT = 0;
    this.talk = 0;
    this.wake = 0;
    this.held = null;
    this.boat = null; // лодка друга: появляется, когда он её берёт
    this.setCard(p.card);
    if (p.st) this.push(p.st, performance.now() / 1000);
  }
  setCard(card) {
    const old = this.card || {};
    this.card = card;
    if (JSON.stringify(old.look) !== JSON.stringify(card.look)) this.char.setLook(card.look);
    if (old.rod !== card.rod || old.line !== card.line || !this.char.rod) {
      this.char.setRod(buildRod(card.rod || 'rod1', 'reel1', card.line || 'line1', 1));
      this.line.setColor((ITEMS[card.line] || {}).col || '#e8f4ff');
    }
    if (old.fl !== card.fl || !this.bob) {
      if (this.bob) this.scene.remove(this.bob);
      const lure = isLure(card.fl);
      this.bob = lure ? buildLure(card.fl) : buildFloat(card.fl || 'float1');
      if (lure) this.bob.scale.setScalar(0.42);
      this.bob.visible = false;
      this.scene.add(this.bob);
      this.lure = lure;
    }
  }
  push(st, now) {
    this.a = this.b || { t: now - 0.08, s: st };
    this.b = { t: now, s: st };
  }
  event(k, d, fx) {
    d = d || {};
    if (k === 'land' && fx) fx.splash(d.x, d.z, 0.45);
    else if (k === 'bite' && fx) fx.splash(d.x, d.z, 0.55);
    else if (k === 'jump' && fx) fx.splash(d.x, d.z, 1);
    else if (k === 'hook') {
      this.dropFish();
      if (FISH_BY_ID[d.sp]) {
        this.fish = buildFish(d.sp);
        this.fishLen = clamp((d.len || 30) / 100, 0.16, 2.6);
        this.fish.scale.setScalar(this.fishLen);
        this.scene.add(this.fish);
      }
    } else if (k === 'lost') this.dropFish();
    else if (k === 'catch') {
      // улов — в поднятую руку на несколько секунд
      if (this.fish) {
        this.scene.remove(this.fish);
        const s = clamp(0.2 + this.fishLen * 0.3, 0.26, 0.8);
        this.fish.scale.setScalar(s);
        this.fish.position.set(0, -0.3 - s * 0.5, 0.05);
        this.fish.rotation.set(0, 0, -Math.PI / 2);
        this.char.j.eL.add(this.fish);
        this.held = this.fish;
        this.fish = null;
        this.heldT = 6;
      }
    } else if (k === 'emote') {
      this.emote = d.k;
      this.emoteT = 2.6;
    }
  }
  dropBoat() {
    if (this.boat) {
      this.boat.dispose();
      this.boat = null;
    }
  }
  dropFish() {
    if (this.fish) {
      this.scene.remove(this.fish);
      this.fish = null;
    }
  }
  bubble(text, sec = 5) {
    this.say = text;
    this.sayT = sec;
  }
  /** ride — лодка, в которой друг сидит пассажиром (BoatVisual хозяина), если она сейчас видна. */
  update(dt, now, t, fx, visible, ride = null) {
    const g = this.char.group;
    this.bv = 0;
    if (!this.b || !visible) {
      g.visible = false;
      this.dropBoat();
      this.bob.visible = false;
      this.line.hide();
      if (this.fish) this.fish.visible = false;
      return;
    }
    const a = this.a.s;
    const b = this.b.s;
    const u = clamp((now - DELAY - this.a.t) / Math.max(0.03, this.b.t - this.a.t), 0, 1.25);
    const L = (i) => lerp(a[i] ?? 0, b[i] ?? 0, u);
    const x = L(S.X);
    const y = L(S.Y);
    const z = L(S.Z);
    const yaw = a[S.YAW] + angDiff(a[S.YAW], b[S.YAW]) * Math.min(1, u);
    g.visible = true;
    g.position.set(x, y, z);
    g.rotation.y = yaw + Math.PI;
    const fs = b[S.FS] | 0;
    const flags = b[S.FLAGS] | 0;
    // лодка: друг идёт на ней или оставил у причала
    const bs = b[S.BOAT] | 0;
    if (bs > 0) {
      if (!this.boat) this.boat = new BoatVisual(this.scene);
      this.boat.setOwner(flags & FLAG.own ? MARKS[this.slot % MARKS.length].color : null);
      if (bs === 1) {
        const y0 = a[S.BYAW] ?? b[S.BYAW] ?? 0;
        const byaw = y0 + angDiff(y0, b[S.BYAW] ?? y0) * Math.min(1, u);
        const v = (a[S.BOAT] | 0) === 1 ? L(S.SPEED) : 0;
        // друг присылает, где сидит; середину лодки считаем от банки
        const { x: cx, z: cz } = this.boat.centre(x, z, byaw, spot);
        this.boat.pose(cx, cz, byaw, t, clamp(v / VMAX, -1, 1), (b[S.STEER] || 0) * Math.min(1, Math.abs(v) / 6), dt);
        wake(this, fx, cx, cz, byaw, v, dt);
        g.position.copy(this.boat.seat(seat));
        this.bv = v;
      } else {
        moorSpot(bs - 2, this.slot, spot);
        this.boat.pose(spot.x, spot.z, spot.yaw, t, 0, 0, dt);
      }
    } else this.dropBoat();
    // пассажир: сидит на своём месте в лодке хозяина, а не там, откуда прислал положение (иначе его трясло бы на волне)
    const seatI = b[S.SEAT] | 0;
    if ((b[S.RIDE] | 0) > 0 && ride) g.position.copy(ride.seatAt(seatI || 1, seat));
    if (this.emoteT > 0) this.emoteT -= dt;
    if (this.sayT > 0) this.sayT -= dt;
    if (this.held) {
      this.heldT -= dt;
      this.held.rotation.x = Math.sin(t * 9) * 0.25;
      if (this.heldT <= 0 || fs !== 6 && fs !== 0) {
        this.held.parent && this.held.parent.remove(this.held);
        this.held = null;
      }
    }
    this.char.update(dt, {
      speed: bs === 1 || (b[S.RIDE] | 0) > 0 ? 0 : L(S.SPEED), mode: this.held ? 'landed' : FS_NAME[fs] || 'hold', castK: L(S.K), reel: !!(flags & FLAG.reel), steer: b[S.STEER] || 0,
      sit: !!(flags & FLAG.sit), dangle: !!(flags & FLAG.dangle), emote: this.emoteT > 0 ? this.emote : null, talk: this.talk, pitch: L(S.PITCH)
    });
    const rod = this.char.rod;
    const T = b[S.T] || 0;
    rod.setBend(fs === 5 ? 0.25 + 0.75 * T : fs === 4 ? 0.3 : 0.04, 0);
    // поплавок, рыба и леска
    const bx = L(S.BX);
    const by = L(S.BY);
    const bz = L(S.BZ);
    const out = fs >= 2 && fs <= 5;
    this.bob.visible = out && fs !== 5;
    if (fs === 5 && this.fish) {
      this.fish.visible = true;
      const px = this.fish.position.x;
      const pz = this.fish.position.z;
      this.fish.position.set(bx, by, bz);
      if (Math.hypot(bx - px, bz - pz) > 0.004) this.fish.rotation.y += angDiff(this.fish.rotation.y, Math.atan2(bz - pz, -(bx - px))) * Math.min(1, dt * 6);
      this.fish.rotation.z = by > 0.15 ? 0.6 : 0;
      wiggleFish(this.fish, t, 1.3);
      this.wake -= dt;
      if (this.wake <= 0 && fx) {
        this.wake = 0.3;
        fx.ripple(bx, bz, 0.5, 0.9);
      }
    } else if (this.fish) this.fish.visible = false;
    if (out) {
      rod.tip.getWorldPosition(tip);
      this.bob.position.set(bx, by, bz);
      end.set(bx, by + (this.lure || fs === 5 ? 0.02 : 0.28), bz);
      const dist = Math.hypot(bx - x, bz - z);
      this.line.set(tip, end, fs === 2 ? 0.8 : fs === 5 || fs === 4 ? 0.04 : Math.min(1.2, 0.25 + dist * 0.03), fs === 2 || fs === 5 ? -5 : 0.02);
      if (fs === 2) this.bob.rotation.set(t * 9, 0, t * 5);
      else this.bob.rotation.set(Math.sin(t * 1.7 + bx) * 0.12, 0, Math.cos(t * 1.3) * 0.12 + (fs === 4 ? 0.5 : 0));
    } else this.line.hide();
  }
  /** Игрок ещё в лобби: стоит на настиле в ряд с остальными. */
  lobbyPose(dt, x, y, z, variant) {
    const g = this.char.group;
    g.visible = true;
    g.position.set(x, y, z);
    g.rotation.y = 0;
    this.dropBoat();
    this.bob.visible = false;
    this.line.hide();
    if (this.fish) this.fish.visible = false;
    if (this.emoteT > 0) this.emoteT -= dt;
    if (this.sayT > 0) this.sayT -= dt;
    this.char.rod.setBend(0.04, 0);
    this.char.update(dt, { mode: 'hold', variant, talk: this.talk, emote: this.emoteT > 0 ? this.emote : null });
  }
  /** Точка над головой — для таблички с именем. */
  head(out) {
    return out.set(this.char.group.position.x, this.char.group.position.y + 1.98 * this.char.look.height, this.char.group.position.z);
  }
  dispose() {
    this.scene.remove(this.char.group);
    this.char.dispose();
    if (this.bob) this.scene.remove(this.bob);
    this.dropFish();
    this.dropBoat();
    this.line.dispose();
  }
}
