// Рыбалка игрока: прицел и заброс, поплавок, поклёвка, подсечка, вываживание, улов.
import * as THREE from 'three';
import { ITEMS, FISH_BY_ID, isLure } from '../shared/data.js';
import { kitStats, biteDelay, rollFish, fightInit, fightStep, spendTackle, addCatch, recordCatch, activity, T_DANGER, T_LOW } from '../shared/logic.js';
import { spotAt } from './terrain.js';
import { waveH } from './water.js';
import { buildFloat, buildLure } from './gear3d.js';
import { buildFish, wiggleFish } from './fish3d.js';
import { FishLine } from './line.js';
import { clamp, damp, lerp, angDiff } from './util.js';
import { FS, FLAG } from './proto.js';

const tip = new THREE.Vector3();
const end = new THREE.Vector3();
const dir = new THREE.Vector3();
const CHARGE_TIME = 0.85;

export class Fishing {
  constructor({ scene, camera, vm, fx, schools, profile, hour, emit }) {
    Object.assign(this, { scene, camera, vm, fx, schools, profile, hour, emit });
    this.state = 'idle';
    this.kit = kitStats(profile);
    this.line = new FishLine(scene);
    this.bob = null;
    this.bobId = null;
    this.fish = null;
    this.aim = { ok: false, x: 0, z: 0, dist: 0, spot: null, clamped: false, act: 0 };
    this.power = 0;
    this.t = 0;
    this.castK = 0;
    this.target = { x: 0, z: 0 };
    this.bx = this.by = this.bz = 0;
    this.dip = 0;
    this.fight = null;
    this.catch = null;
    this.landT = 0;
    this.reeling = false;
    this.refreshGear();
  }

  /** Сменили снасти — пересобрать поплавок, леску, пересчитать набор. */
  refreshGear() {
    const p = this.profile;
    this.kit = kitStats(p);
    const lure = isLure(p.equip.tackle);
    const id = lure ? p.equip.tackle : p.equip.float;
    if (id !== this.bobId) {
      if (this.bob) this.scene.remove(this.bob);
      this.bob = lure ? buildLure(id) : buildFloat(id);
      if (lure) this.bob.scale.setScalar(0.42);
      this.bob.visible = false;
      this.scene.add(this.bob);
      this.bobId = id;
    }
    this.lure = lure;
    this.line.setColor((ITEMS[p.equip.line] || {}).col || '#e8f4ff');
    this.vm.setRod(p.equip.rod, p.equip.reel, p.equip.line);
  }
  get busy() {
    return this.state !== 'idle';
  }
  get lineOut() {
    return this.state !== 'idle' && this.state !== 'charge';
  }

  /** Куда смотрит прицел: точка на воде в пределах заброса. */
  updateAim(player) {
    const a = this.aim;
    // направление взгляда — прямо из углов игрока, без ожидания отрисовки кадра
    const cp = Math.cos(player.pitch);
    dir.set(-Math.sin(player.yaw) * cp, Math.sin(player.pitch), -Math.cos(player.yaw) * cp);
    const max = this.kit.cast;
    let d;
    if (dir.y < -0.03) {
      const tt = -this.camera.position.y / dir.y;
      d = Math.hypot(dir.x * tt, dir.z * tt);
    } else d = 999;
    const hx = dir.x / (Math.hypot(dir.x, dir.z) || 1);
    const hz = dir.z / (Math.hypot(dir.x, dir.z) || 1);
    a.clamped = d > max;
    d = clamp(d, 2.2, max);
    // если под прицелом берег или настил — отступаем дальше по лучу до воды
    let spot = null;
    for (let i = 0; i < 14 && !spot; i++) {
      const dd = d + i * 0.6;
      if (dd > max + 0.01) break;
      spot = spotAt(player.x + hx * dd, player.z + hz * dd);
      if (spot) d = dd;
    }
    a.ok = !!spot;
    a.dist = d;
    a.x = player.x + hx * d;
    a.z = player.z + hz * d;
    a.spot = spot;
    if (spot) {
      spot.hot = this.schools.isHot(a.x, a.z);
      a.act = this.kit.sonar ? activity(spot, this.profile.equip.tackle, this.hour(), this.kit) : 0;
    }
    return a;
  }

  startBite() {
    const d = biteDelay(this.spot, this.profile.equip.tackle, this.hour(), this.kit, Math.random);
    this.biteLeft = d.t;
    this.nibbles = [];
    let at = d.t;
    for (let i = 0; i < d.nibbles; i++) {
      at -= 0.7 + Math.random() * 1.1;
      if (at > 1) this.nibbles.push(at);
    }
  }
  toIdle() {
    this.state = 'idle';
    this.bob.visible = false;
    this.line.hide();
    this.fight = null;
    this.reeling = false;
    if (this.fish) {
      this.fish.parent && this.fish.parent.remove(this.fish);
      this.fish = null;
    }
  }
  /** Смотать леску (отмена). */
  reelIn(silent) {
    if (this.state === 'fight' || this.state === 'landed') return false;
    if (this.state !== 'idle' && !silent) this.emit('reelin');
    this.toIdle();
    return true;
  }

  update(dt, t, input, player) {
    const p = this.profile;
    this.t += dt;
    this.reeling = false;
    const st = this.state;
    if (st === 'idle' || st === 'charge') this.updateAim(player);

    if (st === 'idle') {
      if (input.hit('Primary') && input.enabled) {
        if (!this.aim.ok) this.emit('toast', 'Отсюда до воды не добросить — подойдите к краю');
        else if (player.sit && !player.dangle) this.emit('toast', 'Сидя на земле не забросить — встаньте или сядьте на край причала');
        else {
          this.state = 'charge';
          this.power = 0;
        }
      }
    } else if (st === 'charge') {
      this.power = Math.min(1, this.power + dt / CHARGE_TIME);
      if (!input.hold) {
        if (!this.aim.ok) this.toIdle();
        else {
          const need = this.aim.dist / this.kit.cast;
          const d = Math.max(2.2, Math.min(this.aim.dist, Math.max(this.power, 0.12) * this.kit.cast));
          const k = d / this.aim.dist;
          this.target.x = player.x + (this.aim.x - player.x) * k;
          this.target.z = player.z + (this.aim.z - player.z) * k;
          let spot = spotAt(this.target.x, this.target.z);
          if (!spot) {
            this.target.x = this.aim.x;
            this.target.z = this.aim.z;
            spot = this.aim.spot;
          }
          spot.hot = this.schools.isHot(this.target.x, this.target.z);
          this.spot = spot;
          this.short = this.power < need - 0.04;
          this.state = 'cast';
          this.castK = 0;
          this.castT = 0;
          this.flyT = 0.45 + d / 46;
          this.castDist = d;
          p.stats.casts++;
          this.emit('cast', { x: this.target.x, z: this.target.z, d, fly: this.flyT });
        }
      }
    } else if (st === 'cast') {
      this.castT += dt;
      this.castK = Math.min(1, this.castT / 0.26);
      const u = clamp((this.castT - 0.16) / this.flyT, 0, 1);
      this.vm.tipWorld(tip);
      if (this.castT > 0.16) {
        if (!this.bob.visible) {
          this.bob.visible = true;
          this.from = tip.clone();
        }
        const h = 1.1 + this.castDist * 0.11;
        this.bx = lerp(this.from.x, this.target.x, u);
        this.bz = lerp(this.from.z, this.target.z, u);
        this.by = lerp(this.from.y, 0, u) + Math.sin(Math.PI * u) * h;
        this.bob.position.set(this.bx, this.by, this.bz);
        this.bob.rotation.set(u * 9, 0, u * 5);
        this.line.set(tip, this.bob.position, 0.35 + Math.sin(Math.PI * u) * 1.2, -5);
      }
      if (u >= 1) {
        this.state = 'wait';
        this.bob.rotation.set(0, 0, 0);
        this.dip = -0.35;
        this.fx.splash(this.bx, this.bz, 0.45);
        this.startBite();
        this.emit('land', { x: this.bx, z: this.bz, zone: this.spot.zone, hot: this.spot.hot, short: this.short });
      }
    } else if (st === 'wait' || st === 'bite') {
      const dx = this.bx - player.x;
      const dz = this.bz - player.z;
      const dist = Math.hypot(dx, dz);
      // смотать: правая кнопка или R; приманку ведут подмоткой
      if (input.hit('Secondary') || input.hit('KeyR')) {
        this.reelIn();
        return;
      }
      let reel = false;
      if (st === 'wait') {
        if (this.lure && input.hold) {
          reel = true;
          const sp = 1.7 * dt;
          this.bx -= (dx / dist) * sp;
          this.bz -= (dz / dist) * sp;
          const s = spotAt(this.bx, this.bz);
          if (dist < 2.8 || !s) {
            this.emit('toast', 'Приманка у ног — забрасывайте снова');
            this.reelIn(true);
            return;
          }
          s.hot = this.schools.isHot(this.bx, this.bz);
          this.spot = s;
          if (Math.random() < dt * 5) this.fx.ripple(this.bx, this.bz, 0.35, 0.7);
        }
        if (!this.lure || reel) this.biteLeft -= dt;
        while (this.nibbles.length && this.biteLeft <= this.nibbles[0]) {
          this.nibbles.shift();
          this.dip = -0.09;
          this.fx.ripple(this.bx, this.bz, 0.45, 0.8);
          this.emit('nibble');
        }
        if (input.hit('Primary') && !this.lure && this.t - (this.lastEarly || 0) > 0.6) {
          this.lastEarly = this.t;
          this.emit('early');
        }
        if (this.biteLeft <= 0) {
          this.state = 'bite';
          this.biteT = this.kit.hookWin * (this.lure ? 1.5 : 1);
          this.dip = -0.42;
          this.fx.splash(this.bx, this.bz, 0.55);
          this.emit('bite', { win: this.biteT });
        }
      } else {
        this.biteT -= dt;
        if (input.hit('Primary')) {
          this.hook(dist);
          return;
        }
        if (this.biteT <= 0) {
          if (!this.lure) {
            const r = spendTackle(p);
            this.emit('missed', r);
            if (r.switched) this.refreshGear();
          } else this.emit('missed', { left: 1 });
          this.state = 'wait';
          this.startBite();
        }
      }
      this.reeling = reel;
      this.dip = damp(this.dip, st === 'bite' ? -0.4 + Math.sin(this.t * 30) * 0.05 : 0, st === 'bite' ? 20 : 5, dt);
      this.by = waveH(this.bx, this.bz, t) + this.dip + (this.lure ? -0.06 : 0);
      this.bob.position.set(this.bx, this.by, this.bz);
      this.bob.rotation.set(Math.sin(t * 1.7 + this.bx) * 0.12, this.lure ? Math.atan2(dx, dz) + Math.PI / 2 : 0, Math.cos(t * 1.3) * 0.12 + (st === 'bite' ? 0.5 : 0));
      this.vm.tipWorld(tip);
      end.copy(this.bob.position);
      if (!this.lure) end.y += 0.28;
      this.line.set(tip, end, reel || st === 'bite' ? 0.08 : Math.min(1.2, 0.25 + dist * 0.03));
    } else if (st === 'fight') {
      const f = this.fight;
      const evs = fightStep(f, { reel: input.hold, steer: input.steer }, dt, this.kit, Math.random);
      this.reeling = input.hold;
      // рыба ходит под водой: ближе по мере вываживания, в рывке уходит вбок
      const d = 2.4 + (this.startDist - 2.4) * (1 - f.p);
      this.side = damp(this.side, f.phase === 'run' ? f.dir * Math.min(4, d * 0.4) : Math.sin(this.t * 0.9) * 0.6, 2.2, dt);
      const fx = player.x + this.hx * d + -this.hz * this.side;
      const fz = player.z + this.hz * d + this.hx * this.side;
      let fy = -0.28;
      if (this.jumpT > 0) {
        this.jumpT -= dt;
        const u = 1 - this.jumpT / 0.75;
        fy = -0.28 + Math.sin(Math.PI * u) * (0.75 + this.fishLen * 0.35);
        this.fish.rotation.z = Math.cos(Math.PI * u) * 0.9;
        if (this.jumpT <= 0) this.fx.splash(fx, fz, 0.9);
      } else this.fish.rotation.z = damp(this.fish.rotation.z, 0, 6, dt);
      const pxp = this.bx;
      const pzp = this.bz;
      this.bx = fx;
      this.bz = fz;
      this.by = fy + waveH(fx, fz, t);
      this.fish.position.set(fx, this.by, fz);
      // голова модели смотрит в −X: поворачиваем по ходу движения
      if (Math.hypot(fx - pxp, fz - pzp) > 0.002) this.fish.rotation.y += angDiff(this.fish.rotation.y, Math.atan2(fz - pzp, -(fx - pxp))) * (1 - Math.exp(-6 * dt));
      wiggleFish(this.fish, this.t, f.phase === 'run' ? 1.6 : 0.9);
      this.wakeT -= dt;
      if (this.wakeT <= 0) {
        this.wakeT = f.phase === 'run' ? 0.12 : 0.4;
        this.fx.ripple(fx, fz, f.phase === 'run' ? 0.7 : 0.4, 0.9);
      }
      for (const e of evs) {
        if (e === 'jump') {
          this.jumpT = 0.75;
          this.fx.splash(fx, fz, 1);
          this.emit('jump', { x: fx, z: fz });
        } else if (e === 'run') {
          this.fx.splash(fx, fz, 0.6);
          this.emit('run', { dir: f.dir });
        } else if (e === 'warn') this.emit('warn');
        else if (e === 'calm') this.emit('calm');
        else if (e === 'landed') return this.land();
        else if (e === 'snap' || e === 'escape') {
          if (e === 'snap') p.stats.snaps++;
          else p.stats.escapes++;
          let lostLure = false;
          if (e === 'snap' && this.lure) {
            const r = spendTackle(p);
            lostLure = true;
            if (r.switched) this.bobId = null;
          }
          this.fx.splash(fx, fz, 0.8);
          this.emit('lost', { why: e, sp: this.catch.sp, w: this.catch.w, lostLure });
          this.toIdle();
          this.refreshGear();
          return;
        }
      }
      this.vm.tipWorld(tip);
      end.set(fx, Math.max(this.by + 0.05, -0.05), fz);
      this.line.set(tip, end, f.T < T_LOW ? 0.5 : 0.02, -5);
    } else if (st === 'landed') {
      this.landT += dt;
      const u = Math.min(1, this.landT / 0.5);
      this.fish.rotation.y += dt * 0.9;
      this.fish.position.y = -0.4 * (1 - u) * (1 - u) + Math.sin(this.t * 2) * 0.01;
      wiggleFish(this.fish, this.t, 0.5);
      if (this.landT > 0.4 && (input.hit('Primary') || input.hit('KeyE'))) return this.finish(false);
      if (this.landT > 0.4 && input.hit('KeyR')) return this.finish(true);
      if (this.landT > 9) return this.finish(false);
    }
  }

  hook(dist) {
    const p = this.profile;
    const c = rollFish(this.spot, p.equip.tackle, this.hour(), Math.random);
    if (!this.lure) {
      const r = spendTackle(p);
      if (r.switched) this.pendingGear = true;
      this.emit('bait', r);
    }
    this.catch = c;
    this.fight = fightInit(c, this.kit, Math.random);
    this.state = 'fight';
    this.startDist = Math.max(3, dist);
    const dx = this.bx - this.camera.position.x;
    const dz = this.bz - this.camera.position.z;
    const l = Math.hypot(dx, dz) || 1;
    this.hx = dx / l;
    this.hz = dz / l;
    this.side = 0;
    this.jumpT = 0;
    this.wakeT = 0;
    this.bob.visible = false;
    const f = FISH_BY_ID[c.sp];
    this.fishLen = c.junk ? 0.3 : clamp(c.len / 100, 0.16, 2.6);
    this.fish = c.junk ? new THREE.Group() : buildFish(c.sp);
    this.fish.scale.setScalar(this.fishLen);
    this.fish.position.set(this.bx, -0.3, this.bz);
    this.scene.add(this.fish);
    this.fx.splash(this.bx, this.bz, 0.8);
    this.emit('hook', { rho: this.fight.rho, rar: f ? f.rar : 0 });
  }

  land() {
    const c = this.catch;
    this.state = 'landed';
    this.landT = 0;
    this.line.hide();
    this.fx.splash(this.bx, this.bz, 0.7);
    // рыба — в руки: показываем перед камерой
    this.scene.remove(this.fish);
    if (c.junk) this.fish = this.junkModel(c.sp);
    const show = c.junk ? 0.3 : clamp(0.2 + this.fishLen * 0.22, 0.24, 0.62);
    this.fish.scale.setScalar(show);
    this.fish.position.set(0, -0.4, 0);
    this.fish.rotation.set(0, 0, 0);
    this.vm.fishSlot.add(this.fish);
    const full = this.profile.cooler.length >= this.kit.bagCap;
    this.emit('caught', { c, full });
  }
  /** Решение по улову: в садок или отпустить. */
  finish(release) {
    if (this.state !== 'landed') return;
    const p = this.profile;
    const c = this.catch;
    let released = release;
    if (!released) {
      const r = addCatch(p, c, this.kit);
      if (!r.ok) released = true;
    }
    const rec = recordCatch(p, c, released);
    this.emit('kept', { c, released, forced: released && !release, ...rec });
    this.toIdle();
    if (this.pendingGear) {
      this.pendingGear = false;
      this.refreshGear();
    }
  }
  junkModel(id) {
    return this.makeJunk ? this.makeJunk(id) : new THREE.Group();
  }

  /** Данные для друзей: состояние и где поплавок. */
  net(out) {
    const s = this.state;
    out.fs = FS[s] ?? 0;
    out.bx = this.bx;
    out.by = this.by;
    out.bz = this.bz;
    out.t = s === 'fight' ? this.fight.T : s === 'charge' ? this.power : 0;
    out.k = s === 'cast' ? this.castK : s === 'charge' ? this.power : 0;
    out.flags = (this.reeling ? FLAG.reel : 0) | (this.lure ? FLAG.lure : 0);
    return out;
  }
  /** Что показывать рукам от первого лица. */
  view() {
    const s = this.state;
    return { mode: s, power: this.power, castK: this.castK, tension: this.fight ? this.fight.T : 0, pull: this.fight && this.fight.phase === 'run' ? this.fight.dir : 0, reel: this.reeling };
  }
}
export { T_DANGER, T_LOW };
