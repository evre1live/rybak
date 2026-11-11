// Игрок от первого лица: ввод (клавиатура, мышь, геймпад, сенсор), ходьба по причалу и берегу, камера.
import { canStand, standY, deckAt, groundH, SPAWN } from './terrain.js';
import { clamp, damp } from './util.js';
import { settings } from './profile.js';

/** Единый ввод: что нажато и куда смотрим — независимо от устройства. */
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.lookDX = 0;
    this.lookDY = 0;
    this.primary = false;
    this.pressed = new Set(); // события «нажато в этом кадре»
    this.locked = false;
    this.lockedAt = 0;
    // запасной режим: браузер не даёт захватить мышь (игра встроена в чужую страницу) — смотрим движением мыши, у краёв экрана камера доворачивается
    this.free = false;
    this.everLocked = false;
    this.lockFails = 0;
    this.failAt = 0;
    this.mouse = { x: 0.5, y: 0.5, in: false };
    this.onFree = () => {};
    this.enabled = false; // игра принимает управление (не открыто меню)
    this.touch = { on: false, mx: 0, mz: 0, primary: false, run: false }; // run: стик отведён до упора
    this.pad = { on: false, last: {}, run: false }; // run: бег включён нажатием на левый стик, пока идём
    this.device = 'kb';
    this.onLockChange = () => {};
    this.typing = () => false;

    addEventListener('keydown', (e) => {
      if (this.typing()) return;
      if (e.code === 'Tab' || e.code === 'Space') e.preventDefault();
      if (!e.repeat) {
        this.keys.add(e.code);
        // пока открыто меню, клавиши достаются ему, а не игре
        if (this.enabled) this.pressed.add(e.code);
      }
      this.device = 'kb';
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => {
      this.keys.clear();
      this.primary = false;
    });
    canvas.addEventListener('mousedown', (e) => {
      if (!this.enabled) return;
      if (!this.locked && !this.free && !this.touch.on) return this.lock();
      if (e.button === 0) {
        this.primary = true;
        this.pressed.add('Primary');
      } else if (e.button === 2) this.pressed.add('Secondary');
    });
    addEventListener('mouseup', (e) => {
      if (e.button === 0) this.primary = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    addEventListener('mousemove', (e) => {
      if (this.free) {
        this.mouse.x = e.clientX / innerWidth;
        this.mouse.y = e.clientY / innerHeight;
        this.mouse.in = true;
        if (!this.enabled) return;
      } else if (!this.locked) return;
      this.lookDX += e.movementX;
      this.lookDY += e.movementY;
    });
    document.addEventListener('mouseleave', () => (this.mouse.in = false));
    document.addEventListener('pointerlockerror', () => this.lockFailed());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      if (this.locked) {
        this.lockedAt = performance.now();
        this.everLocked = true;
      } else this.primary = false;
      // мышь захватилась, когда уже открыто меню, — сразу отпускаем
      if (this.locked && !this.enabled) return document.exitPointerLock();
      this.onLockChange(this.locked);
    });
  }
  lock() {
    if (this.touch.on || this.locked || this.free || !this.enabled) return;
    this.lockedAt = performance.now();
    try {
      const p = this.canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => this.lockFailed());
    } catch {
      this.lockFailed();
    }
  }
  /** Мышь захватить не дали. Если так было с самого начала и дважды — играем без захвата. */
  lockFailed() {
    const now = performance.now();
    if (this.everLocked || this.free || now - this.failAt < 300) return;
    this.failAt = now;
    if (++this.lockFails < 2) return;
    this.free = true;
    this.canvas.style.cursor = 'crosshair';
    this.onFree();
  }
  /** Управление у игрока: мышь захвачена или работает запасной режим. */
  get grab() {
    return this.locked || this.free;
  }
  unlock() {
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }
  hit(code) {
    return this.pressed.has(code);
  }
  /** Опрос геймпада и сведение осей. Вызывать раз в кадр до чтения. */
  poll() {
    const gp = navigator.getGamepads ? [...navigator.getGamepads()].find((g) => g && g.connected) : null;
    this.pad.on = !!gp;
    let mx = 0;
    let mz = 0;
    let steer = 0;
    if (this.enabled) {
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) mz += 1;
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) mz -= 1;
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) mx += 1;
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) mx -= 1;
      steer = mx;
    }
    let primary = this.primary || this.touch.primary;
    if (this.free && this.enabled && this.mouse.in) {
      // курсор у края — камера продолжает поворачиваться
      this.lookDX += (this.mouse.x < 0.07 ? -1 : this.mouse.x > 0.93 ? 1 : 0) * 11;
      this.lookDY += (this.mouse.y < 0.06 ? -1 : this.mouse.y > 0.94 ? 1 : 0) * 6;
    }
    if (this.touch.on) {
      mx += this.touch.mx;
      mz += this.touch.mz;
      steer += this.touch.mx;
    }
    if (gp && this.enabled) {
      const dz = (v) => (Math.abs(v) < 0.18 ? 0 : v);
      const ax = dz(gp.axes[0] || 0);
      const ay = dz(gp.axes[1] || 0);
      mx += ax;
      mz -= ay;
      steer += ax;
      this.lookDX += dz(gp.axes[2] || 0) * 14;
      this.lookDY += dz(gp.axes[3] || 0) * 10;
      const b = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
      const map = { 7: 'Primary', 0: 'KeyE', 1: 'Secondary', 2: 'Tab', 3: 'KeyJ', 9: 'Escape', 10: 'PadRun', 4: 'KeyC', 5: 'KeyM' };
      for (const i in map) {
        const on = b(+i);
        if (on && !this.pad.last[i]) {
          this.pressed.add(map[i]);
          this.device = 'pad';
        }
        this.pad.last[i] = on;
      }
      if (b(7)) primary = true;
      if (Math.abs(ax) + Math.abs(ay) > 0.3) this.device = 'pad';
      // бег на геймпаде: нажать на левый стик — бежим, пока не остановимся
      if (this.pressed.has('PadRun')) this.pad.run = !this.pad.run;
      if (Math.abs(ax) + Math.abs(ay) < 0.2) this.pad.run = false;
    }
    this.moveX = clamp(mx, -1, 1);
    this.moveZ = clamp(mz, -1, 1);
    this.steer = Math.abs(steer) > 0.35 ? Math.sign(steer) : 0;
    this.hold = this.enabled && primary;
    this.sprint = this.enabled && (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || (this.touch.on && this.touch.run) || (this.pad.on && this.pad.run));
  }
  endFrame() {
    this.pressed.clear();
    this.lookDX = 0;
    this.lookDY = 0;
  }
}

export const WALK = 3.9; // шаг, м/с
export const RUN = 7.2; // бег, м/с

export class Player {
  constructor(camera) {
    this.camera = camera;
    this.x = SPAWN.x;
    this.z = SPAWN.z;
    this.y = standY(this.x, this.z);
    this.yaw = 0;
    this.pitch = -0.06;
    this.speed = 0;
    this.jump = 0;
    this.vy = 0;
    this.sit = false;
    this.wade = 0; // глубина воды под ногами, м
    this.dangle = false;
    this.walk = 0;
    this.eye = 1.62;
    this.eyeNow = 1.62;
    this.onStep = () => {};
    this.shake = 0;
    this.run = 0; // 0 — шаг, 1 — бег (плавно)
  }
  place(x, z, yaw = 0) {
    this.x = x;
    this.z = z;
    this.y = standY(x, z);
    this.yaw = yaw;
    this.pitch = -0.06;
    this.sit = false;
  }
  /** canMove: false, когда леска в воде — стоим на месте, только смотрим. */
  update(dt, input, canMove) {
    const sens = 0.0022 * settings.sens;
    this.yaw -= input.lookDX * sens;
    this.pitch = clamp(this.pitch - input.lookDY * sens * (settings.invertY ? -1 : 1), -1.45, 1.45);
    let mx = canMove ? input.moveX : 0;
    let mz = canMove ? input.moveZ : 0;
    const len = Math.hypot(mx, mz);
    if (len > 1) {
      mx /= len;
      mz /= len;
    }
    if (this.sit && len > 0.1 && canMove) this.sit = false;
    // по колено в воде идём медленнее
    this.wade = this.onDeck ? 0 : Math.max(0, -groundH(this.x, this.z));
    // бежим только вперёд и вбок; пятясь — шагом
    const running = input.sprint && !this.sit && mz > 0.3 && len > 0.5;
    const max = (this.sit ? 0 : running ? RUN : WALK) * (1 - Math.min(0.55, this.wade * 0.9));
    this.run = damp(this.run, running && canMove ? 1 : 0, 7, dt);
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    const vx = (mx * cos - mz * sin) * max;
    const vz = (-mx * sin - mz * cos) * max;
    let moved = false;
    if (len > 0.01 && !this.sit) {
      // шаг целиком; упёрлись — доходим вплотную к краю (деление пополам), остаток шага скользим вдоль преграды.
      // Так до самого края пирса доходишь при любой частоте кадров, а не останавливаешься за шаг до него.
      const x0 = this.x;
      const z0 = this.z;
      const step = (ax, az) => {
        if (canStand(this.x + ax, this.z + az)) {
          this.x += ax;
          this.z += az;
          return 1;
        }
        let lo = 0;
        let hi = 1;
        for (let i = 0; i < 5; i++) {
          const k = (lo + hi) * 0.5;
          if (canStand(this.x + ax * k, this.z + az * k)) lo = k;
          else hi = k;
        }
        this.x += ax * lo;
        this.z += az * lo;
        return lo;
      };
      const dx = vx * dt;
      const dz = vz * dt;
      const k = step(dx, dz);
      if (k < 1) {
        const r = 1 - k;
        if (Math.abs(dx) > 1e-6) step(dx * r, 0);
        if (Math.abs(dz) > 1e-6) step(0, dz * r);
      }
      moved = Math.hypot(this.x - x0, this.z - z0) > Math.hypot(dx, dz) * 0.2;
    }
    this.speed = damp(this.speed, moved ? Math.hypot(vx, vz) : 0, 12, dt);
    const ground = standY(this.x, this.z);
    this.y = damp(this.y, ground, ground > this.y ? 16 : 11, dt);
    if (input.hit('Space') && this.jump <= 0.001 && canMove && !this.sit) this.vy = 3.4;
    if (this.vy !== 0 || this.jump > 0) {
      this.jump += this.vy * dt;
      this.vy -= 10.5 * dt;
      if (this.jump <= 0) {
        this.jump = 0;
        this.vy = 0;
        this.onStep(true);
      }
    }
    if (this.speed > 0.4 && this.jump === 0) {
      const before = Math.floor(this.walk / Math.PI);
      this.walk += dt * (4.6 + (this.speed / 2.4) * 5.2);
      if (Math.floor(this.walk / Math.PI) !== before) this.onStep(false);
    }
    this.eyeNow = damp(this.eyeNow, this.sit ? (this.dangle ? 0.86 : 0.8) : this.eye, 9, dt);
    const bob = this.speed > 0.4 ? Math.abs(Math.cos(this.walk)) * (0.035 + 0.03 * this.run) * Math.min(1, this.speed / 3) : 0;
    this.shake = Math.max(0, this.shake - dt * 3);
    const sh = this.shake * 0.012;
    this.camera.position.set(this.x + (Math.random() - 0.5) * sh, this.y + this.eyeNow + this.jump - bob + (Math.random() - 0.5) * sh, this.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    // на бегу поле зрения чуть шире — скорость чувствуется
    const fov = settings.fov + 7 * this.run * Math.min(1, this.speed / RUN);
    if (Math.abs(this.camera.fov - fov) > 0.02) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }
  toggleSit() {
    this.sit = !this.sit;
    if (this.sit) {
      // у края настила ноги свешиваются
      const fx = this.x - Math.sin(this.yaw) * 0.7;
      const fz = this.z - Math.cos(this.yaw) * 0.7;
      this.dangle = !!deckAt(this.x, this.z, 0) && !canStand(fx, fz);
    }
    return this.sit;
  }
  get onDeck() {
    return !!deckAt(this.x, this.z, -0.05);
  }
}
