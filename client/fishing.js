// Рыбалка игрока: прицел и заброс, поплавок, поклёвка, подсечка, вываживание, улов.
import * as THREE from 'three';
import { ITEMS, FISH_BY_ID, JUNK_BY_ID, RARITY, isLure } from '../shared/data.js';
import { kitStats, biteDelay, rollFish, fightInit, fightStep, fightAssist, dangerAt, spendTackle, addCatch, recordCatch, activity, T_DANGER, T_LOW } from '../shared/logic.js';
import { spotAt } from './terrain.js';
import { waveH } from './water.js';
import { buildFloat, buildLure } from './gear3d.js';
import { buildFish, wiggleFish } from './fish3d.js';
import { FishLine } from './line.js';
import { HANG_K } from './viewmodel.js';
import { clamp, damp, lerp, angDiff } from './util.js';
import { FS, FLAG } from './proto.js';

const tip = new THREE.Vector3();
const end = new THREE.Vector3();
const dir = new THREE.Vector3();
const CHARGE_TIME = 0.85;

export class Fishing {
  constructor({ scene, camera, vm, fx, schools, profile, hour, emit, wx = () => 1 }) {
    Object.assign(this, { scene, camera, vm, fx, schools, profile, hour, emit, wx });
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
    this.minD = 2.2; // ближе этого поплавок не кладём; из лодки — дальше, чтобы не упал на нос
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
    d = clamp(d, this.minD, max);
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
      spot.wx = this.wx();
      a.act = this.kit.sonar ? activity(spot, this.profile.equip.tackle, this.hour(), this.kit) : 0;
    }
    return a;
  }

  startBite() {
    this.spot.wx = this.wx(); // погода: в дождь и туман ждать поклёвку меньше
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
    this.fly = null;
    this.shown = null;
    this.drip = 0;
    this.kick = 0;
    this.big = 0;
    this.vm.setAura(null);
    this.vm.present(null);
  }
  /** Шум у самой наживки (рядом плюхнулась чужая снасть): выслеженная рыба уходит, клюнет теперь нескоро и кто придётся. */
  spook() {
    if (this.state !== 'wait' || !this.big) return false;
    this.big = 0;
    this.spot.big = 0;
    this.biteLeft += 3 + Math.random() * 3;
    return true;
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
    this.minD = player.boat ? 3.4 : 2.2;
    this.inBoat = !!player.boat;
    const st = this.state;
    if (st === 'idle' || st === 'charge') this.updateAim(player);

    if (st === 'idle') {
      if (input.hit('Primary') && input.enabled) {
        if (!this.aim.ok) this.emit('toast', 'Отсюда до воды не добросить — подойдите к краю');
        else if (player.sit && !player.dangle) this.emit('toast', 'Сидя на земле не забросить — встаньте или сядьте на край причала');
        else if (player.boat && player.boat.rider && Math.abs(player.boat.v) > 2.5) this.emit('toast', 'На ходу не забросить — попросите остановить лодку');
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
          const d = Math.max(this.minD, Math.min(this.aim.dist, Math.max(this.power, 0.12) * this.kit.cast));
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
        // Рядом ходит крупная рыба (тень в воде)? Заметит наживку — дальше подойдёт и клюнет именно она, скоро и не мелкая.
        // Плюхнули прямо на неё — испугается и уйдёт.
        const seen = this.stalk ? this.stalk(this.bx, this.bz) : null;
        this.big = seen && !seen.spooked ? Math.max(0.05, seen.big) : 0;
        this.spot.big = this.big;
        this.startBite();
        if (this.big) this.biteLeft = Math.min(this.biteLeft, 3.2 + Math.random() * 3);
        this.emit('land', { x: this.bx, z: this.bz, zone: this.spot.zone, hot: this.spot.hot, short: this.short, big: this.big, spooked: !!(seen && seen.spooked) });
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
          if (dist < this.minD + 0.6 || !s) {
            this.emit('toast', 'Приманка у ног — забрасывайте снова');
            this.reelIn(true);
            return;
          }
          s.hot = this.schools.isHot(this.bx, this.bz);
          // блесна прошла мимо крупной рыбы — та бросается следом
          this.stalkT = (this.stalkT || 0) - dt;
          if (!this.big && this.stalk && this.stalkT <= 0) {
            this.stalkT = 0.25;
            const seen = this.stalk(this.bx, this.bz, 2.6, true);
            if (seen) {
              this.big = Math.max(0.05, seen.big);
              this.biteLeft = Math.min(this.biteLeft, 0.9 + Math.random() * 1.2);
              this.emit('stalk', { big: this.big });
            }
          }
          s.big = this.big;
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
      const sty = f.style;
      const run = f.phase === 'run';
      const wide = sty === 'runner' || sty === 'snag';
      // Рыба ходит под водой: ближе по мере вываживания, в рывке уходит вбок. Путь для картинки сглажен:
      // когда легенда собралась с силами и забрала часть лески, она уносится назад броском, а не перескакивает.
      this.fp = damp(this.fp, f.p, 5, dt);
      const near = this.minD + 0.2;
      const d = near + (this.startDist - near) * (1 - this.fp);
      // вбок: бегун и хитрец уходят дальше и быстрее, тяжеловес ходит медленными дугами, залёгшая стоит на месте
      const sway = f.stuck ? this.side : run ? f.dir * Math.min(wide ? 6 : 4, d * (wide ? 0.55 : 0.4)) : Math.sin(this.t * (sty === 'bulldog' ? 0.5 : 0.9)) * (sty === 'bulldog' ? 1.1 : 0.6);
      this.side = damp(this.side, sway, wide && run ? 3 : 2.2, dt);
      const jit = sty === 'thrash' ? Math.sin(this.t * 21) * 0.06 * (run ? 1.6 : 1) : 0; // трясун мотает головой
      const fx = player.x + this.hx * d - this.hz * (this.side + jit);
      const fz = player.z + this.hz * d + this.hx * (this.side + jit);
      // глубина: залёгшая лежит на дне, тяжеловес ходит низом, в рывке рыба идёт под самой поверхностью
      this.deep = damp(this.deep, f.stuck ? -0.8 : sty === 'bulldog' && !run ? -0.5 : run ? -0.18 : -0.28, 4, dt);
      let fy = this.deep;
      const air = this.jumpT > 0;
      if (air) {
        this.jumpT -= dt;
        const u = 1 - this.jumpT / 0.75;
        fy = this.deep + Math.sin(Math.PI * u) * (0.75 + this.fishLen * 0.35) * (sty === 'jumper' ? 1.3 : 1);
        this.fish.rotation.z = Math.cos(Math.PI * u) * 0.9;
        this.fish.rotation.x = sty === 'jumper' ? Math.sin(Math.PI * u) * 1.2 : 0; // прыгун в воздухе ложится на бок
        if (Math.random() < dt * 40) this.fx.drip(fx, fy + waveH(fx, fz, t), fz, 1, 0.1 + this.fishLen * 0.15);
        if (this.jumpT <= 0) {
          this.fish.rotation.x = 0;
          this.fx.splash(fx, fz, 0.9 + Math.min(0.6, this.fishLen * 0.3));
        }
      } else this.fish.rotation.z = damp(this.fish.rotation.z, 0, 6, dt);
      const pxp = this.bx;
      const pzp = this.bz;
      this.bx = fx;
      this.bz = fz;
      this.by = fy + waveH(fx, fz, t);
      this.fish.position.set(fx, this.by, fz);
      // голова модели смотрит в −X: поворачиваем по ходу движения
      const step = Math.hypot(fx - pxp, fz - pzp);
      if (step > 0.002) this.fish.rotation.y += angDiff(this.fish.rotation.y, Math.atan2(fz - pzp, -(fx - pxp))) * (1 - Math.exp(-6 * dt));
      wiggleFish(this.fish, this.t, f.stuck ? 0.25 : run ? 1.6 : sty === 'thrash' ? 1.3 : 0.9);
      this.vm.tipWorld(tip);
      if (!air) {
        this.wakeT -= dt;
        if (this.wakeT <= 0) {
          this.wakeT = run ? 0.1 : f.stuck ? 0.8 : 0.4;
          this.fx.ripple(fx, fz, run ? 0.7 : f.stuck ? 0.22 : 0.4, 0.9);
          // в рывке рыба идёт под самой поверхностью — за ней остаётся пенный след
          if (run) this.fx.wake(fx, fz, 0.2 + this.fishLen * 0.2, 1.3);
        }
        // леска режет воду: у точки входа летят брызги, назад по ходу рыбы
        if (run && step > 0.004 && Math.random() < dt * 34) {
          const k = Math.min(3, step / Math.max(dt, 0.004)) * 0.35;
          this.fx.drop(fx, 0.04, fz, (-(fx - pxp) / step) * k + (Math.random() - 0.5) * 0.5, 0.7 + Math.random() * 0.9, (-(fz - pzp) / step) * k + (Math.random() - 0.5) * 0.5, 0.028 + Math.random() * 0.02, 0.6);
        }
      }
      const hot = f.T > dangerAt(f);
      // леска на пределе: с неё срывает капли
      if (hot && Math.random() < dt * 26) {
        const u = 0.25 + Math.random() * 0.7;
        this.fx.drop(lerp(tip.x, fx, u), lerp(tip.y, 0.05, u), lerp(tip.z, fz, u), (Math.random() - 0.5) * 0.9, 0.3 + Math.random() * 0.8, (Math.random() - 0.5) * 0.9, 0.018 + Math.random() * 0.014, 0.5);
      }
      this.kick -= Math.sign(this.kick) * Math.min(Math.abs(this.kick), dt * 3.2);
      for (const e of evs) {
        if (e === 'jump') {
          this.jumpT = 0.75;
          this.fx.splash(fx, fz, 1);
          this.emit('jump', { x: fx, z: fz });
        } else if (e === 'run') {
          this.fx.splash(fx, fz, 0.6);
          this.kick = Math.max(this.kick, 0.55);
          this.emit('run', { dir: f.dir });
        } else if (e === 'warn') this.emit('warn');
        else if (e === 'calm') this.emit('calm');
        else if (e === 'rage') {
          // легенда собралась с силами: вода вскипает, леска уходит обратно
          this.fx.splash(fx, fz, 1.6);
          this.fx.ripple(fx, fz, 3.4, 2.2, 0.25);
          this.fx.ripple(fx, fz, 4.6, 2.8, 0.5);
          this.kick = 1;
          this.emit('rage', { left: f.boss, x: fx, z: fz });
        } else if (e === 'stuck') {
          this.fx.ripple(fx, fz, 0.9, 1.6);
          this.emit('stuck');
        } else if (e === 'unstuck') {
          this.fx.splash(fx, fz, 0.7);
          this.kick = Math.max(this.kick, 0.4);
          this.emit('unstuck');
        } else if (e === 'wrap') {
          this.fx.splash(fx, fz, 0.5);
          this.kick = Math.max(this.kick, 0.8);
          this.emit('wrap');
        } else if (e === 'landed') return this.land();
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
          this.emit('lost', { why: e, sp: this.catch.sp, w: this.catch.w, lostLure, style: sty, air: f.jumpT > 0, wrapped: f.wrapped });
          this.toIdle();
          this.refreshGear();
          return;
        }
      }
      end.set(fx, Math.max(this.by + 0.05, -0.05), fz);
      this.line.set(tip, end, f.T < T_LOW ? 0.5 : 0.02, -5, hot ? 0.014 : sty === 'thrash' ? 0.007 : 0, this.t);
    } else if (st === 'landed') {
      this.landT += dt;
      const sh = this.shown;
      const fish = this.fish;
      if (this.fly) {
        const fl = this.fly;
        fl.t += dt;
        const pos = fish.position;
        this.vm.tipWorld(tip);
        if (sh.net) {
          // С подсаком: последняя подмотка — рыба скользит по воде к ногам, там её подхватывают сеткой.
          const e = Math.min(1, fl.t / 0.34);
          const k = e * e;
          const tx = player.x + this.hx * 1.1;
          const tz = player.z + this.hz * 1.1;
          pos.set(lerp(fl.from.x, tx, k), 0, lerp(fl.from.z, tz, k));
          pos.y = waveH(pos.x, pos.z, t) - 0.07;
          fish.rotation.set(0, Math.atan2(-this.hz, this.hx), 0); // головой к рыбаку
          wiggleFish(fish, this.t, 1.8);
          this.fx.drop(pos.x, 0.05, pos.z, this.hx * 1.2 + (Math.random() - 0.5), 0.8 + Math.random(), this.hz * 1.2 + (Math.random() - 0.5), 0.03 + Math.random() * 0.02, 0.6);
          if (Math.random() < dt * 22) this.fx.wake(pos.x, pos.z, 0.2 + this.fishLen * 0.2, 1.1);
          end.set(pos.x, 0, pos.z);
          this.line.set(tip, end, 0.02, -5);
          if (e >= 1) {
            this.fx.splash(tx, tz, 0.9);
            this.present();
          }
        } else {
          // Без подсака: рыбу выдёргивают из воды, она по дуге прилетает под кончик удилища и повисает на леске.
          const e = Math.min(1, fl.t / 0.5);
          const k = e * e * (3 - 2 * e);
          this.vm.fishSlot.getWorldPosition(end);
          end.y -= fl.s1 * 0.5; // в гнезде — рот рыбы, сама она на полдлины ниже
          pos.lerpVectors(fl.from, end, k);
          pos.y += Math.sin(e * Math.PI) * (0.5 + fl.from.distanceTo(end) * 0.05);
          const s = fl.s0 + (fl.s1 - fl.s0) * k;
          fish.scale.setScalar(s);
          fish.rotation.set(0, this.camera.rotation.y + (1 - k) * 2.2, -Math.PI / 2 * Math.min(1, e * 1.6)); // голова — вверх, к леске
          this.fx.drip(pos.x, pos.y, pos.z, 2, 0.08);
          wiggleFish(fish, this.t, 1.6);
          end.set(pos.x, pos.y + s * 0.5 * Math.min(1, e * 1.6), pos.z);
          this.line.set(tip, end, 0.01, -5);
          if (e >= 1) this.present();
        }
      } else {
        // рыба в руках: на леске медленно поворачивается, в подсаке бьёт хвостом; первое время с неё течёт
        const flap = Math.max(0, Math.sin(this.landT * 2.3 + 1)) ** 6; // раз в пару секунд — взмах хвостом
        if (sh.net) {
          // в сетке рыба лежит на боку, спиной от ручки; время от времени бьёт хвостом
          fish.rotation.set(-Math.PI / 2 + flap * 0.1, Math.sin(this.t * 1.1) * 0.03, 0.05);
          wiggleFish(fish, this.t, 0.2 + flap * 1.6);
        } else {
          this.spin += dt * 0.55;
          fish.rotation.set(0, this.spin, -Math.PI / 2);
          wiggleFish(fish, this.t, 0.2 + flap * 1.3);
        }
        if (this.drip > 0) {
          this.drip -= dt;
          if (Math.random() < dt * 26 * this.drip) {
            (sh.net ? this.vm.netSlot : fish).getWorldPosition(tip);
            this.fx.drip(tip.x, tip.y - (sh.net ? 0.1 : sh.s * 0.45), tip.z, 1, sh.net ? sh.hoop * 0.4 : 0.05);
          }
        }
      }
      if (this.landT > 0.4 && (input.hit('Primary') || input.hit('KeyE'))) return this.finish(false);
      if (this.landT > 0.4 && input.hit('KeyR')) return this.finish(true);
      if (this.landT > 9) return this.finish(false);
    }
  }

  /** Рыба долетела: теперь она в кадре у рыбака — висит на леске под кончиком удилища или лежит в подсаке. */
  present() {
    const sh = this.shown;
    const fish = this.fish;
    this.scene.remove(fish);
    this.line.hide();
    fish.scale.setScalar(sh.s);
    if (sh.net) {
      fish.position.set(0, sh.dy, 0);
      fish.rotation.set(-Math.PI / 2, 0, 0.05);
      this.vm.netSlot.add(fish);
    } else {
      fish.position.set(0, -sh.s * 0.5, 0);
      this.spin = 0.35;
      fish.rotation.set(0, this.spin, -Math.PI / 2);
      this.vm.fishSlot.add(fish);
    }
    this.vm.present(sh);
    if (sh.rar >= 0) this.vm.setAura(RARITY[sh.rar].color, sh.rar);
    this.drip = 1.8;
    this.fly = null;
  }

  hook(dist) {
    const p = this.profile;
    const c = this.rollOnce || rollFish(this.spot, p.equip.tackle, this.hour(), Math.random);
    const forced = !!this.rollOnce; // проверки и снимки: рыба задана заранее, наживка не тратится
    this.rollOnce = null;
    if (!this.lure && !forced) {
      const r = spendTackle(p);
      if (r.switched) this.pendingGear = true;
      this.emit('bait', r);
    }
    this.catch = c;
    this.catchAt = { zone: this.spot.zone, boat: !!this.inBoat }; // где поймано — для заданий
    this.fight = fightInit(c, this.kit, Math.random);
    this.state = 'fight';
    this.startDist = Math.max(this.minD + 0.8, dist);
    const dx = this.bx - this.camera.position.x;
    const dz = this.bz - this.camera.position.z;
    const l = Math.hypot(dx, dz) || 1;
    this.hx = dx / l;
    this.hz = dz / l;
    this.side = 0;
    this.jumpT = 0;
    this.wakeT = 0;
    this.fp = this.fight.p;
    this.deep = -0.3;
    this.kick = -1; // подсечка: удилище рывком идёт вверх
    this.bob.visible = false;
    const f = FISH_BY_ID[c.sp];
    this.fishLen = c.junk ? 0.3 : clamp(c.len / 100, 0.16, 2.6);
    this.fish = c.junk ? new THREE.Group() : buildFish(c.sp);
    this.fish.scale.setScalar(this.fishLen);
    this.fish.position.set(this.bx, -0.3, this.bz);
    this.scene.add(this.fish);
    this.fx.splash(this.bx, this.bz, 0.8);
    this.emit('hook', { rho: this.fight.rho, rar: f ? f.rar : 0, style: this.fight.style, boss: this.fight.boss });
  }

  land() {
    const c = this.catch;
    this.state = 'landed';
    this.landT = 0;
    if (c.junk) {
      this.scene.remove(this.fish);
      this.fish = this.junkModel(c.sp);
      this.scene.add(this.fish);
    }
    const f0 = FISH_BY_ID[c.sp];
    const rar = f0 ? f0.rar : c.sp === 'chest' ? 4 : -1;
    // Как показываем улов. Без подсака рыба висит на леске под кончиком удилища — в двух метрах от глаз, поэтому крупнее.
    // С подсаком — лежит в сетке, которую держит левая рука; длинная рыба стоит в ней наискось, головой над обручем.
    const net = !!this.kit.net;
    const base = c.junk ? 0.3 : clamp(0.2 + this.fishLen * 0.22, 0.24, 0.62);
    const s = base * (net ? 1.08 : HANG_K);
    const hoop = clamp(s * 1.02, 0.38, 0.6); // поперечник обруча: под рыбу
    const over = clamp((s - hoop * 0.92) / (hoop * 0.3), 0, 1); // рыба длиннее сетки — лежит поверх обруча, а не в мешке
    this.shown = {
      net, s, rar, junk: !!c.junk, hoop,
      heavy: c.junk ? 0.3 : clamp(Math.log10(1 + c.w * 3) / 2.2, 0.12, 1), // насколько гнёт удилище
      dy: -0.07 * hoop / 0.45 + over * 0.09 // середина рыбы относительно плоскости обруча
    };
    this.fly = { t: 0, from: new THREE.Vector3(this.bx, -0.1, this.bz), s0: c.junk ? 0.3 : this.fishLen, s1: s, rar };
    this.fish.position.copy(this.fly.from);
    this.fish.rotation.x = 0;
    this.fx.splash(this.bx, this.bz, 1.2 + Math.max(0, rar) * 0.15);
    const full = this.profile.cooler.length >= this.kit.bagCap;
    this.emit('caught', { c, full });
  }
  /** Друг рядом подсачил рыбу (правила — assistBlock в logic.js). name — кто помог. → взята ли рыба */
  assist(name) {
    if (this.state !== 'fight' || !fightAssist(this.fight)) return false;
    this.catch.help = String(name || 'друг');
    this.land();
    return true;
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
    this.emit('kept', { c, released, forced: released && !release, ...(this.catchAt || {}), ...rec });
    this.toIdle();
    if (this.pendingGear) {
      this.pendingGear = false;
      this.refreshGear();
    }
  }
  /** Для проверок и снимков: сразу начать вываживание рыбы sp (u — размер от 0 до 1) в dist метрах перед собой. */
  startFight(sp, u = 0.5, dist = 9) {
    if (this.fish) (this.fish.parent || this.scene).remove(this.fish);
    this.vm.setAura(null);
    this.vm.present(null);
    const f = FISH_BY_ID[sp];
    const w = Math.round((f.w[0] + (f.w[1] - f.w[0]) * u) * 1000) / 1000;
    const yaw = this.camera.rotation.y;
    this.bx = this.camera.position.x - Math.sin(yaw) * dist;
    this.bz = this.camera.position.z - Math.cos(yaw) * dist;
    this.spot = spotAt(this.bx, this.bz) || { zone: 'bay', depth: 4 };
    const roll = { sp, w, len: Math.round(f.look.lenK * Math.cbrt(w)), trophy: u > 0.8, junk: false };
    this.rollOnce = roll;
    this.hook(dist);
    return this.fight;
  }
  /** Для проверок и снимков: сразу показать улов в руках, минуя заброс и вываживание. u — размер от 0 до 1. */
  showCatch(sp, u = 0.5) {
    const f = FISH_BY_ID[sp];
    const j = f || JUNK_BY_ID[sp];
    if (!j) return;
    if (this.fish) (this.fish.parent || this.scene).remove(this.fish);
    this.vm.setAura(null);
    this.vm.present(null);
    const w = Math.round((j.w[0] + (j.w[1] - j.w[0]) * u) * 1000) / 1000;
    const c = (this.catch = { sp, w, len: f ? Math.round(f.look.lenK * Math.cbrt(w)) : 0, trophy: u > 0.8, junk: !f });
    this.fishLen = c.junk ? 0.3 : clamp(c.len / 100, 0.16, 2.6);
    this.fish = c.junk ? new THREE.Group() : buildFish(sp);
    this.scene.add(this.fish);
    const yaw = this.camera.rotation.y;
    this.hx = -Math.sin(yaw);
    this.hz = -Math.cos(yaw);
    this.bx = this.camera.position.x + this.hx * 3;
    this.bz = this.camera.position.z + this.hz * 3;
    this.land();
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
    out.k = s === 'cast' ? this.castK : s === 'charge' ? this.power : s === 'fight' ? this.fight.p : 0; // в бою — пройденный путь: друг видит, когда можно подсачить
    out.flags = (this.reeling ? FLAG.reel : 0) | (this.lure ? FLAG.lure : 0);
    return out;
  }
  /** Что показывать рукам от первого лица. */
  view() {
    const s = this.state;
    const f = this.fight;
    const sh = this.shown;
    return {
      mode: s, power: this.power, castK: this.castK, tension: f ? f.T : 0, pull: f && f.phase === 'run' ? f.dir : 0, reel: this.reeling,
      kick: this.kick || 0, // толчок: подсечка, начало рывка, «второе дыхание»
      shake: f && f.style === 'thrash' ? (f.phase === 'run' ? 1 : 0.6) : f && f.stuck ? 0.25 : 0, // дрожь удилища
      net: s === 'landed' && sh ? sh.net : false, held: s === 'landed' && !this.fly, landT: this.landT
    };
  }
}
export { T_DANGER, T_LOW };
