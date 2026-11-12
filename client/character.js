// Персонаж. Игрок выбирает готового героя (hero.js) — других персонажей в игре нет.
// Кукла из частей, с которой игра начиналась, осталась «скелетом»: по её суставам считаются позы (заброс, вываживание,
// сидение, жесты), а герой их повторяет. Видно куклу только там, где готовых моделей нет вовсе (пробная версия одним файлом).
import { heroTemplate, loadHero, loadManifest, heroes, heroOf, heroTall, HeroBody } from './hero.js';
import * as THREE from 'three';
import { Batch, M, G, BATCH_MAT } from './batch.js';
import { loft } from './shapes.js';
import { shade, clamp, damp, rng, TAU } from './util.js';

// ───── настройки куклы: что значит каждое число ─────
const OPTIONS = {
  body: ['Стройное', 'Обычное', 'Крепкое', 'Плотное'],
  eyes: ['Круглые', 'Весёлые', 'Спокойные', 'Хитрые', 'Большие'],
  brows: ['Прямые', 'Домиком', 'Густые', 'Тонкие', 'Суровые'],
  mouth: ['Улыбка', 'Во весь рот', 'Ухмылка', 'Спокойный', 'Удивлён'],
  nose: ['Кнопка', 'Картошка', 'Острый'],
  cheeks: ['Чисто', 'Румянец', 'Веснушки'],
  hair: ['Лысый', 'Короткая', 'Лохматая', 'Чёлка', 'Хвост', 'Длинные', 'Каре', 'Кудри', 'Ирокез', 'Пучок', 'Косички'],
  beard: ['Нет', 'Щетина', 'Усы', 'Бородка', 'Борода', 'Бородища'],
  hat: ['Нет', 'Кепка', 'Кепка назад', 'Панама', 'Шапка', 'Соломенная', 'Капитанская', 'Бандана', 'Ковбойская'],
  glasses: ['Нет', 'Тёмные', 'Авиаторы', 'Круглые', 'Маска на лбу'],
  top: ['Худи', 'Куртка', 'Жилет рыбака', 'Футболка', 'Рубашка в клетку', 'Дождевик', 'Тельняшка'],
  bottom: ['Карго', 'Шорты', 'Джинсы', 'Вейдерсы', 'Юбка'],
  shoes: ['Ботинки', 'Сапоги', 'Кроссовки', 'Шлёпанцы'],
  gloves: ['Нет', 'Без пальцев', 'Перчатки'],
  pack: ['Нет', 'Рюкзак', 'Ящик на ремне', 'Тубус']
};
const DEFAULT_LOOK = {
  body: 1, height: 1, skin: '#f3c9a3', eyes: 0, eyeC: '#3b2a1a', brows: 0, mouth: 0, nose: 0, cheeks: 0,
  hair: 2, hairC: '#5a3a22', beard: 0, hat: 1, hatC: '#f6c21c', glasses: 4,
  top: 1, topC: '#f6c21c', topC2: '#2a2f3a', bottom: 0, botC: '#2a2f3a', shoes: 0, shoeC: '#f6c21c', gloves: 1, gloveC: '#2a2f3a', pack: 1, packC: '#2f6fd6'
};
/** Запасной вид скупщика (пока его модель не загрузилась или если моделей нет вовсе). */
export const VENDOR_PUPPET = { ...DEFAULT_LOOK, body: 3, hair: 1, hairC: '#f4ead0', beard: 5, hat: 5, hatC: '#f1efe6', glasses: 0, top: 4, topC: '#ef4444', topC2: '#f1efe6', bottom: 2, botC: '#2f6fd6', shoes: 1, shoeC: '#111827', gloves: 0, pack: 0, brows: 4, mouth: 2, skin: '#d99a6c' };
const HERO_ID = /^[a-z0-9-]{1,40}$/;
/**
 * Внешность игрока — это выбранный герой, и только он. Всё остальное, что может прийти
 * (старое сохранение с персонажем из частей, друг со старой версией игры), отбрасывается.
 */
export function fixLook(l) {
  return { hero: l && typeof l.hero === 'string' && HERO_ID.test(l.hero) ? l.hero : '' };
}
/** Настройки куклы-скелета (и запасного вида жителей бухты). */
function puppetLook(l) {
  const out = { ...DEFAULT_LOOK };
  if (!l || typeof l !== 'object') return out;
  for (const k of Object.keys(DEFAULT_LOOK)) {
    const v = l[k];
    if (OPTIONS[k]) out[k] = Number.isInteger(v) && v >= 0 && v < OPTIONS[k].length ? v : DEFAULT_LOOK[k];
    else if (k === 'height') out[k] = clamp(Number(v) || 1, 0.88, 1.12);
    else out[k] = typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : DEFAULT_LOOK[k];
  }
  return out;
}

const BODIES = [
  { sw: 0.93, chest: 0.165, waist: 0.142, depth: 0.104, belly: 0, limb: 0.88 },
  { sw: 1.0, chest: 0.186, waist: 0.16, depth: 0.118, belly: 0, limb: 1.0 },
  { sw: 1.13, chest: 0.216, waist: 0.172, depth: 0.128, belly: 0, limb: 1.14 },
  { sw: 1.06, chest: 0.206, waist: 0.212, depth: 0.15, belly: 0.05, limb: 1.1 }
];
const R = 0.2; // радиус головы
const HIP_Y = 0.84;

// ───── лицо: рисуется на canvas и натягивается на голову ─────
function drawFace(g, l, blink, talk) {
  const W = 1024;
  const H = 512;
  g.fillStyle = l.skin;
  g.fillRect(0, 0, W, H);
  const cx = 256;
  const ey = 274;
  const dark = shade(l.hairC, -0.35);
  // румянец / веснушки / щетина
  if (l.cheeks === 1) {
    for (const s of [-1, 1]) {
      const gr = g.createRadialGradient(cx + s * 74, ey + 44, 2, cx + s * 74, ey + 44, 30);
      gr.addColorStop(0, 'rgba(240,110,110,0.5)');
      gr.addColorStop(1, 'rgba(240,110,110,0)');
      g.fillStyle = gr;
      g.fillRect(cx + s * 74 - 32, ey + 12, 64, 64);
    }
  } else if (l.cheeks === 2) {
    g.fillStyle = 'rgba(120,70,40,0.55)';
    const r = rng(11);
    for (let i = 0; i < 26; i++) {
      const s = i % 2 ? 1 : -1;
      g.beginPath();
      g.arc(cx + s * (38 + r() * 56), ey + 26 + r() * 30, 2.2 + r() * 1.5, 0, TAU);
      g.fill();
    }
  }
  if (l.beard === 1) {
    const gr = g.createRadialGradient(cx, ey + 96, 20, cx, ey + 90, 120);
    gr.addColorStop(0, 'rgba(40,30,25,0.34)');
    gr.addColorStop(0.7, 'rgba(40,30,25,0.26)');
    gr.addColorStop(1, 'rgba(40,30,25,0)');
    g.fillStyle = gr;
    g.fillRect(cx - 130, ey + 26, 260, 150);
  }
  // глаза
  const big = l.eyes === 4 ? 1.25 : 1;
  const ex = 50;
  for (const s of [-1, 1]) {
    const x = cx + s * ex;
    const ew = 27 * big;
    const eh = (l.eyes === 2 ? 24 : l.eyes === 3 ? 20 : 31) * big;
    if (blink || l.eyes === 1) {
      g.strokeStyle = '#2a1c14';
      g.lineWidth = 7;
      g.lineCap = 'round';
      g.beginPath();
      if (l.eyes === 1 && !blink) g.arc(x, ey + 8, ew * 0.85, Math.PI * 1.12, Math.PI * 1.88);
      else g.arc(x, ey - 10, ew * 0.85, Math.PI * 0.15, Math.PI * 0.85);
      g.stroke();
      continue;
    }
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.ellipse(x, ey, ew, eh, 0, 0, TAU);
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = l.eyeC;
    g.beginPath();
    g.arc(x + s * -2, ey + 2, 17.5 * big, 0, TAU);
    g.fill();
    g.fillStyle = '#0b0f14';
    g.beginPath();
    g.arc(x + s * -2, ey + 2, 9.5 * big, 0, TAU);
    g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(x + 6, ey - 7, 5.5 * big, 0, TAU);
    g.fill();
    if (l.eyes === 2 || l.eyes === 3) {
      // веко
      g.fillStyle = shade(l.skin, -0.08);
      g.beginPath();
      if (l.eyes === 2) g.rect(x - ew - 2, ey - eh - 2, ew * 2 + 4, eh * 0.62);
      else {
        g.moveTo(x - s * (ew + 2), ey - eh - 2);
        g.lineTo(x + s * (ew + 2), ey - eh - 2);
        g.lineTo(x + s * (ew + 2), ey - eh * 0.75);
        g.lineTo(x - s * (ew + 2), ey - eh * 0.05);
      }
      g.fill();
    }
    g.restore();
    g.strokeStyle = '#2a1c14';
    g.lineWidth = 5;
    g.beginPath();
    g.ellipse(x, ey, ew, eh, 0, Math.PI * 1.08, Math.PI * 1.92);
    g.stroke();
  }
  // брови
  g.strokeStyle = dark;
  g.lineCap = 'round';
  g.lineWidth = l.brows === 2 ? 13 : l.brows === 3 ? 5 : 9;
  for (const s of [-1, 1]) {
    const x = cx + s * ex;
    const by = ey - 50 * big;
    g.beginPath();
    if (l.brows === 1) {
      g.moveTo(x - s * 26, by + 4);
      g.quadraticCurveTo(x, by - 16, x + s * 26, by + 6);
    } else if (l.brows === 4) {
      g.moveTo(x - s * 26, by + 12);
      g.lineTo(x + s * 26, by - 8);
    } else {
      g.moveTo(x - s * 26, by + 2);
      g.quadraticCurveTo(x, by - 6, x + s * 26, by);
    }
    g.stroke();
  }
  // рот
  const my = ey + 82;
  g.lineWidth = 7;
  g.strokeStyle = '#5a2a22';
  if (talk > 0) {
    g.fillStyle = '#5a1f1f';
    g.beginPath();
    g.ellipse(cx, my + 2, 22, 8 + talk * 16, 0, 0, TAU);
    g.fill();
    g.fillStyle = '#e06a6a';
    g.beginPath();
    g.ellipse(cx, my + 8 + talk * 8, 13, 5 + talk * 5, 0, 0, TAU);
    g.fill();
  } else if (l.mouth === 1) {
    g.fillStyle = '#5a1f1f';
    g.beginPath();
    g.moveTo(cx - 40, my - 8);
    g.quadraticCurveTo(cx, my + 2, cx + 40, my - 8);
    g.quadraticCurveTo(cx, my + 44, cx - 40, my - 8);
    g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(cx - 34, my - 5);
    g.quadraticCurveTo(cx, my + 4, cx + 34, my - 5);
    g.quadraticCurveTo(cx, my + 14, cx - 34, my - 5);
    g.fill();
  } else {
    g.beginPath();
    if (l.mouth === 0) {
      g.moveTo(cx - 32, my - 4);
      g.quadraticCurveTo(cx, my + 24, cx + 32, my - 4);
    } else if (l.mouth === 2) {
      g.moveTo(cx - 26, my + 6);
      g.quadraticCurveTo(cx + 6, my + 12, cx + 34, my - 10);
    } else if (l.mouth === 3) {
      g.moveTo(cx - 22, my + 4);
      g.lineTo(cx + 22, my + 4);
    } else g.ellipse(cx, my + 6, 11, 14, 0, 0, TAU);
    g.stroke();
  }
  // усы (и у бород тоже)
  if (l.beard === 2 || l.beard >= 4) {
    g.fillStyle = l.hairC;
    g.beginPath();
    g.moveTo(cx, my - 30);
    g.quadraticCurveTo(cx + 34, my - 34, cx + 56, my - 6);
    g.quadraticCurveTo(cx + 26, my - 12, cx, my - 16);
    g.quadraticCurveTo(cx - 26, my - 12, cx - 56, my - 6);
    g.quadraticCurveTo(cx - 34, my - 34, cx, my - 30);
    g.fill();
  }
}

export class Character {
  /** look — { hero }. opts.puppet — житель бухты со своим запасным видом из частей (скупщик): тогда look — настройки куклы + hero. */
  constructor(look, opts = {}) {
    this.puppet = !!opts.puppet;
    this.group = new THREE.Group();
    this.rod = null;
    this.pose = {};
    this.t = Math.random() * 10;
    this.walk = 0;
    this.blinkT = 2 + Math.random() * 3;
    this.blink = false;
    this.talkQ = 0;
    this.faceCanvas = document.createElement('canvas');
    this.faceCanvas.width = 1024;
    this.faceCanvas.height = 512;
    this.faceTex = new THREE.CanvasTexture(this.faceCanvas);
    this.faceTex.colorSpace = THREE.SRGBColorSpace;
    this.faceTex.anisotropy = 4;
    this.faceMat = new THREE.MeshStandardMaterial({ map: this.faceTex, roughness: 0.7 });
    this.setLook(look);
  }

  dispose() {
    this.gone = true;
    clearTimeout(this.retryT);
    this.clear();
    this.faceTex.dispose();
    this.faceMat.dispose();
  }
  clear() {
    const rodGroup = this.rod ? this.rod.group : null;
    if (rodGroup && rodGroup.parent) rodGroup.parent.remove(rodGroup);
    if (this.hero) {
      this.hero.dispose();
      this.hero = null;
    }
    this.group.traverse((o) => {
      if (o.isMesh && o.geometry && o.userData.own) o.geometry.dispose();
    });
    this.group.clear();
    if (this.patTex) {
      this.patTex.dispose();
      this.patTex = null;
    }
  }

  setLook(look) {
    const hero = fixLook(look).hero;
    // у игрока кукла — только скелет нужного роста; у жителя бухты — ещё и запасной вид
    const l = (this.look = this.puppet ? { ...puppetLook(look), hero } : { ...DEFAULT_LOOK, height: heroTall(heroOf({ hero })), hero });
    this.clear();
    const b = BODIES[l.body];
    const lm = b.limb;
    const skin = l.skin;
    const root = (this.root = new THREE.Group());
    root.scale.setScalar(l.height);
    this.group.add(root);
    const J = (this.j = {});
    const grp = (parent, x, y, z) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      parent.add(g);
      return g;
    };
    J.hips = grp(root, 0, HIP_Y, 0);
    J.torso = grp(J.hips, 0, 0, 0);
    J.head = grp(J.torso, 0, 0.505 + R * 0.9, 0.012);
    const SX = b.chest + 0.028;
    J.aR = grp(J.torso, -SX, 0.415, 0);
    J.eR = grp(J.aR, 0, -0.26, 0);
    J.aL = grp(J.torso, SX, 0.415, 0);
    J.eL = grp(J.aL, 0, -0.26, 0);
    const LX = 0.092 * b.sw + (l.body === 3 ? 0.012 : 0);
    J.lR = grp(J.hips, -LX, -0.03, 0);
    J.kR = grp(J.lR, 0, -0.4, 0);
    J.lL = grp(J.hips, LX, -0.03, 0);
    J.kL = grp(J.lL, 0, -0.4, 0);
    J.rod = grp(J.eR, 0, -0.275, 0.02);
    J.rod.rotation.x = Math.PI / 2 + 0.6;
    const put = (parent, batch) => {
      if (batch.empty) return;
      const m = batch.build(BATCH_MAT);
      m.userData.own = true;
      parent.add(m);
    };

    // ── низ ──
    const longPants = l.bottom === 0 || l.bottom === 2 || l.bottom === 3;
    const thighC = l.bottom === 4 ? skin : l.botC;
    const shinC = longPants ? l.botC : skin;
    const tall = l.shoes === 1;
    for (const side of [-1, 1]) {
      const th = new Batch();
      const tr = 0.086 * lm * (l.bottom === 1 ? 1.1 : 1);
      th.add(G.sph(12, 8), thighC, M(0, 0, 0, tr * 2.1, tr * 2.1, tr * 2.1));
      th.add(loft([[-0.4, 0.068 * lm * (l.bottom === 1 ? 1.12 : 1), 0.068 * lm * (l.bottom === 1 ? 1.12 : 1)], [-0.2, 0.08 * lm, 0.08 * lm], [0, tr, tr]], 12), thighC, M(0, 0, 0));
      if (l.bottom === 1) th.add(G.cyl(12), shade(l.botC, -0.15), M(0, -0.385, 0, 0.165 * lm, 0.035, 0.165 * lm));
      if (l.bottom === 0) {
        th.add(G.box(), shade(l.botC, -0.12), M(side * 0.075 * lm, -0.2, 0.0, 0.035, 0.13, 0.11));
        th.add(G.box(), shade(l.botC, -0.22), M(side * 0.078 * lm, -0.15, 0.0, 0.035, 0.03, 0.115));
      }
      put(side < 0 ? J.lR : J.lL, th);
      const sh = new Batch();
      sh.add(G.sph(12, 8), longPants ? l.botC : skin, M(0, 0, 0, 0.14 * lm, 0.14 * lm, 0.14 * lm));
      sh.add(loft([[-0.36, 0.05 * lm, 0.05 * lm], [-0.14, 0.066 * lm, 0.07 * lm], [0, 0.066 * lm, 0.066 * lm]], 12), shinC, M(0, 0, 0));
      if (l.bottom === 2) sh.add(G.cyl(12), shade(l.botC, 0.25), M(0, -0.31, 0, 0.125 * lm, 0.05, 0.125 * lm));
      // обувь
      const sc = l.shoes === 3 ? skin : l.shoeC;
      sh.add(loft([[-0.1, 0.05, 0.035], [-0.04, 0.062, 0.05], [0.08, 0.066, 0.052], [0.17, 0.05, 0.036]], 12, 2.6), sc, M(0, -0.385, 0.02, lm, 1, 1.02, Math.PI / 2, 0, 0));
      if (l.shoes === 3) {
        sh.add(G.box(), l.shoeC, M(0, -0.43, 0.04, 0.12 * lm, 0.02, 0.3));
        sh.add(G.box(), l.shoeC, M(0, -0.385, 0.1, 0.11 * lm, 0.012, 0.02, 0.4, 0, 0));
      } else {
        sh.add(loft([[-0.105, 0.052, 0.02], [0, 0.068, 0.02], [0.175, 0.052, 0.02]], 12, 2.8), l.shoes === 2 ? '#f8fafc' : '#1c1917', M(0, -0.428, 0.02, lm, 1, 1, Math.PI / 2, 0, 0));
        if (l.shoes !== 2) sh.add(G.sph(10, 6), shade(sc, -0.25), M(0, -0.385, 0.165, 0.11 * lm, 0.075, 0.07));
        if (l.shoes === 2) sh.add(G.box(), '#f8fafc', M(0, -0.36, 0.09, 0.07, 0.012, 0.1, -0.5, 0, 0));
        const cuffH = tall ? 0.27 : l.shoes === 0 ? 0.1 : 0.04;
        sh.add(loft([[-0.36, 0.058 * lm, 0.06 * lm], [-0.36 + cuffH, (tall ? 0.074 : 0.062) * lm, (tall ? 0.078 : 0.064) * lm]], 12), sc, M(0, 0, 0));
        if (l.shoes === 0) for (let i = 0; i < 3; i++) sh.add(G.box(), '#f8fafc', M(0, -0.345 + i * 0.022, 0.06 * lm, 0.05, 0.008, 0.012));
      }
      put(side < 0 ? J.kR : J.kL, sh);
    }

    // ── туловище ──
    const T = new Batch();
    const striped = l.top === 6;
    const plaid = l.top === 4;
    const torsoSec = [[-0.07, b.waist * 0.96, b.depth * 0.95], [0.04, b.waist * 1.04, b.depth * 1.02, 0, b.belly * 0.5], [0.17, b.waist, b.depth + b.belly, 0, b.belly * 0.7], [0.31, b.chest, b.depth * 1.05, 0, b.belly * 0.2], [0.41, b.chest * 1.04, b.depth], [0.465, b.chest * 0.82, b.depth * 0.82], [0.492, 0.07, 0.07]];
    const torsoGeo = loft(torsoSec, 18, 2.5);
    if (striped || plaid) {
      const tex = new THREE.CanvasTexture(patternCanvas(l, plaid));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      const m = new THREE.Mesh(torsoGeo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
      m.castShadow = m.receiveShadow = true;
      m.userData.own = true;
      J.torso.add(m);
      this.patTex = tex;
    } else T.add(torsoGeo, l.top === 2 ? l.topC2 : l.topC, M(0, 0, 0));
    // таз в цвет штанов, ремень
    const hipC = l.bottom === 4 ? l.botC : l.botC;
    T.add(loft([[-0.09, b.waist * 0.9, b.depth * 0.9], [-0.02, b.waist * 1.03, b.depth * 1.03], [0.055, b.waist * 1.07, b.depth * 1.06, 0, b.belly * 0.5]], 18, 2.5), hipC, M(0, 0, 0));
    if (l.bottom !== 3 && l.bottom !== 4 && l.top !== 5) {
      T.add(loft([[0.04, b.waist * 1.09, b.depth * 1.09, 0, b.belly * 0.5], [0.075, b.waist * 1.09, b.depth * 1.09 + b.belly * 0.4, 0, b.belly * 0.55]], 18, 2.5, false), '#3b2a1a', M(0, 0, 0));
      T.add(G.box(), '#fbbf24', M(0, 0.058, b.depth * 1.1 + b.belly * 0.95, 0.045, 0.04, 0.012));
    }
    if (l.bottom === 4) T.add(loft([[-0.3, b.waist * 1.5, b.depth * 1.75], [-0.1, b.waist * 1.22, b.depth * 1.3], [0.05, b.waist * 1.07, b.depth * 1.08]], 18, 2.3), l.botC, M(0, 0, 0), { grad: [0.8, 1.05] });
    if (l.bottom === 3) {
      // вейдерсы: полукомбинезон с лямками
      T.add(loft([[-0.02, b.waist * 1.07, b.depth * 1.07, 0, b.belly * 0.4], [0.17, b.waist * 1.05, b.depth * 1.06 + b.belly, 0, b.belly * 0.7], [0.3, b.chest * 1.05, b.depth * 1.1, 0, b.belly * 0.2]], 18, 2.5, false), l.botC, M(0, 0, 0));
      for (const s of [-1, 1]) {
        T.add(G.box(), shade(l.botC, -0.2), M(s * b.chest * 0.55, 0.39, b.depth * 0.92, 0.035, 0.2, 0.02, -0.18, 0, 0));
        T.add(G.box(), shade(l.botC, -0.2), M(s * b.chest * 0.55, 0.39, -b.depth * 0.92, 0.035, 0.2, 0.02, 0.18, 0, 0));
        T.add(G.cyl(8), '#fbbf24', M(s * b.chest * 0.55, 0.3, b.depth * 1.1, 0.03, 0.012, 0.03, Math.PI / 2, 0, 0));
      }
    }
    const zf = b.depth * 1.03 + b.belly * 0.5;
    if (l.top === 0 || l.top === 5) {
      // капюшон, шнурки, карман
      T.add(G.sph(14, 10), shade(l.topC, -0.06), M(0, 0.455, -b.depth * 0.75, b.chest * 1.5, 0.15, 0.17));
      if (l.top === 0) {
        for (const s of [-1, 1]) T.add(G.cyl(5), '#f8fafc', M(s * 0.035, 0.36, zf + 0.012, 0.01, 0.13, 0.01));
        T.add(loft([[0.08, b.waist * 0.62, 0.02], [0.2, b.waist * 0.5, 0.02]], 10, 3), shade(l.topC, -0.1), M(0, 0, zf + b.belly * 0.5));
      } else {
        T.add(loft([[-0.27, b.waist * 1.24, b.depth * 1.34], [-0.05, b.waist * 1.1, b.depth * 1.12, 0, b.belly * 0.4], [0.05, b.waist * 1.06, b.depth * 1.06, 0, b.belly * 0.5]], 18, 2.4, false), l.topC, M(0, 0, 0), { grad: [0.85, 1.03] });
        for (let i = 0; i < 4; i++) T.add(G.sph(8, 6), l.topC2, M(0, 0.36 - i * 0.11, zf + 0.01 + (i === 2 ? b.belly * 0.4 : 0), 0.03, 0.03, 0.016));
      }
    }
    if (l.top === 1) {
      // куртка: воротник, молния, плечи второго цвета, карман
      T.add(G.torus(0.34, 16), l.topC2, M(0, 0.478, 0, 0.19, 0.19, 0.22, Math.PI / 2, 0, 0));
      T.add(G.box(), l.topC2, M(0, 0.24, zf + 0.004 + b.belly * 0.3, 0.02, 0.44, 0.012));
      for (const s of [-1, 1]) {
        T.add(G.sph(12, 8), l.topC2, M(s * b.chest * 0.82, 0.425, 0, b.chest * 0.7, 0.1, b.depth * 1.9));
        T.add(G.box(), shade(l.topC, -0.12), M(s * b.chest * 0.5, 0.3, zf + 0.002, 0.085, 0.07, 0.012));
        T.add(G.box(), l.topC2, M(s * b.chest * 0.5, 0.335, zf + 0.006, 0.09, 0.016, 0.014));
      }
    }
    if (l.top === 2) {
      // жилет поверх футболки
      for (const s of [-1, 1]) {
        T.add(loft([[0.0, b.waist * 0.56, b.depth * 1.1, 0, b.belly * 0.5], [0.17, b.waist * 0.54, b.depth * 1.1 + b.belly, 0, b.belly * 0.7], [0.31, b.chest * 0.55, b.depth * 1.13], [0.43, b.chest * 0.5, b.depth * 1.06]], 12, 3, false), l.topC, M(s * b.chest * 0.52, 0, 0));
        T.add(G.box(), shade(l.topC, -0.14), M(s * b.chest * 0.55, 0.13, zf + 0.03 + b.belly * 0.6, 0.1, 0.09, 0.03));
        T.add(G.box(), shade(l.topC, -0.24), M(s * b.chest * 0.55, 0.18, zf + 0.034 + b.belly * 0.6, 0.105, 0.02, 0.034));
        T.add(G.box(), shade(l.topC, -0.14), M(s * b.chest * 0.55, 0.3, zf + 0.022, 0.085, 0.065, 0.026));
      }
    }
    if (l.top === 3 || l.top === 4 || l.top === 6) T.add(G.torus(0.3, 16), shade(l.top === 6 ? l.topC2 : l.topC, -0.15), M(0, 0.482, 0, 0.17, 0.17, 0.2, Math.PI / 2, 0, 0));
    if (l.top === 4) T.add(G.box(), shade(l.topC, 0.2), M(0, 0.25, zf + 0.004, 0.03, 0.42, 0.01));
    // шея
    T.add(G.cyl(10), skin, M(0, 0.5, 0, 0.115, 0.08, 0.115));
    // ноша за спиной
    const zb = -b.depth * 1.02;
    if (l.pack === 1) {
      T.add(loft([[0.06, 0.13, 0.075], [0.2, 0.15, 0.085], [0.38, 0.13, 0.075], [0.43, 0.09, 0.05]], 12, 3), l.packC, M(0, 0, zb - 0.07), { grad: [0.8, 1.05] });
      T.add(G.box(), shade(l.packC, -0.18), M(0, 0.14, zb - 0.15, 0.16, 0.11, 0.04));
      T.add(G.cyl(8), shade(l.packC, 0.25), M(0, 0.47, zb - 0.07, 0.07, 0.24, 0.07, 0, 0, Math.PI / 2));
      for (const s of [-1, 1]) T.add(loft([[0.08, 0.022, b.depth * 1.12], [0.3, 0.022, b.depth * 1.15], [0.455, 0.022, b.depth * 0.95]], 10, 2.4, false), shade(l.packC, -0.25), M(s * b.chest * 0.62, 0, -0.01));
    } else if (l.pack === 2) {
      T.add(G.box(), l.packC, M(-b.waist - 0.07, 0.02, 0.0, 0.11, 0.17, 0.24), { grad: [0.8, 1.05] });
      T.add(G.box(), shade(l.packC, -0.2), M(-b.waist - 0.07, 0.115, 0.0, 0.12, 0.03, 0.25));
      T.add(loft([[0, b.waist * 1.1, b.depth * 1.15, 0, b.belly * 0.5], [0.02, b.waist * 1.1, b.depth * 1.15, 0, b.belly * 0.5]], 16, 2.5, false), '#3b2a1a', M(0.02, 0.27, 0, 1, 1, 1, 0, 0, -0.62));
    } else if (l.pack === 3) {
      T.add(G.cyl(10), l.packC, M(0.03, 0.3, zb - 0.06, 0.11, 0.62, 0.11, 0, 0, 0.5), { grad: [0.8, 1.05] });
      T.add(G.cyl(10), shade(l.packC, -0.25), M(0.18, 0.572, zb - 0.06, 0.12, 0.04, 0.12, 0, 0, 0.5));
      T.add(loft([[0, b.waist * 1.08, b.depth * 1.12, 0, b.belly * 0.5], [0.022, b.waist * 1.08, b.depth * 1.12, 0, b.belly * 0.5]], 16, 2.5, false), '#3b2a1a', M(-0.02, 0.27, 0, 1, 1, 1, 0, 0, 0.62));
    }
    put(J.torso, T);

    // ── руки ──
    const sleeve = l.top === 3 ? 'short' : 'long';
    const sleeveC = l.top === 2 ? l.topC2 : striped ? l.topC : l.topC;
    for (const side of [-1, 1]) {
      const U = new Batch();
      const ru = 0.058 * lm;
      U.add(G.sph(12, 8), sleeveC, M(0, 0, 0, ru * 2.35, ru * 2.3, ru * 2.35));
      if (sleeve === 'short') {
        U.add(loft([[-0.13, ru * 1.08, ru * 1.08], [0, ru * 1.12, ru * 1.12]], 12), sleeveC, M(0, 0, 0));
        U.add(loft([[-0.26, ru * 0.84, ru * 0.84], [-0.12, ru * 0.92, ru * 0.92]], 12), skin, M(0, 0, 0));
      } else U.add(loft([[-0.26, ru * 0.9, ru * 0.9], [-0.12, ru * 1.02, ru * 1.02], [0, ru * 1.1, ru * 1.1]], 12), sleeveC, M(0, 0, 0));
      if (l.top === 1) U.add(G.cyl(10), l.topC2, M(0, -0.13, 0, ru * 2.12, 0.035, ru * 2.12));
      put(side < 0 ? J.aR : J.aL, U);
      const F = new Batch();
      const armC = sleeve === 'long' ? sleeveC : skin;
      F.add(G.sph(12, 8), armC, M(0, 0, 0, ru * 1.85, ru * 1.85, ru * 1.85));
      F.add(loft([[-0.225, ru * 0.74, ru * 0.74], [-0.08, ru * 0.9, ru * 0.9], [0, ru * 0.9, ru * 0.9]], 12), armC, M(0, 0, 0));
      if (sleeve === 'long') F.add(G.cyl(10), shade(sleeveC, -0.16), M(0, -0.212, 0, ru * 1.62, 0.035, ru * 1.62));
      // кисть: кулак с большим пальцем
      const gl = l.gloves;
      const hc = gl ? l.gloveC : skin;
      F.add(G.sph(12, 10), hc, M(0, -0.283, 0.005, 0.105 * lm, 0.12 * lm, 0.09 * lm));
      F.add(G.sph(10, 8), gl === 2 ? hc : skin, M(0, -0.325, 0.02, 0.085 * lm, 0.07 * lm, 0.085 * lm));
      F.add(G.sph(8, 6), gl === 2 ? hc : skin, M(-side * 0.04 * lm, -0.275, 0.035, 0.04, 0.07, 0.04, 0.5, 0, 0));
      if (gl) F.add(G.cyl(10), shade(hc, 0.3), M(0, -0.238, 0, 0.1 * lm, 0.022, 0.09 * lm));
      put(side < 0 ? J.eR : J.eL, F);
    }

    // ── голова ──
    const Hh = new Batch();
    const head = new THREE.Mesh(HEAD_GEO, this.faceMat);
    head.scale.set(1, 1.06, 0.98);
    head.castShadow = head.receiveShadow = true;
    J.head.add(head);
    for (const s of [-1, 1]) Hh.add(G.sph(10, 8), skin, M(s * R * 0.98, -0.025, -0.01, 0.05, 0.085, 0.07));
    const ny = -0.052;
    if (l.nose === 0) Hh.add(G.sph(10, 8), shade(skin, -0.04), M(0, ny, R * 0.98, 0.052, 0.045, 0.05));
    else if (l.nose === 1) Hh.add(G.sph(10, 8), shade(skin, -0.05), M(0, ny - 0.006, R * 0.985, 0.078, 0.062, 0.066));
    else Hh.add(G.cone(8), shade(skin, -0.04), M(0, ny, R * 1.02, 0.05, 0.085, 0.05, Math.PI / 2, 0, 0));
    this.buildHair(Hh, l);
    this.buildHat(Hh, l);
    this.buildBeard(Hh, l);
    this.buildGlasses(Hh, l);
    put(J.head, Hh);
    this.group.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
    if (l.hero || !this.puppet) this.useHero(l);
    if (this.rod) J.rod.add(this.rod.group);
    this.redrawFace(true);
    return this;
  }
  /**
   * Готовая модель вместо куклы: кукла остаётся невидимым «скелетом», который задаёт позу.
   * Пока модель грузится, персонажа не видно вовсе — кукла из частей игроку больше не показывается.
   */
  useHero(l) {
    const again = () => !this.gone && this.look === l && this.setLook(l);
    if (!heroes.ready) {
      // список героев ещё не пришёл
      this.root.visible = false;
      loadManifest().then(again);
      return;
    }
    const id = this.puppet ? l.hero : heroOf(l);
    if (!id || !heroes.byId.has(id)) return; // готовых моделей нет вовсе (пробная версия одним файлом) — остаётся кукла
    let tpl = heroTemplate(id);
    if (!tpl && this.failed === id) {
      // своя модель не загрузилась: показываем любого уже загруженного героя (у жителя бухты — его запасной вид)
      const other = this.puppet ? null : heroes.list.find((h) => heroTemplate(h.id));
      if (!other) return;
      tpl = heroTemplate(other.id);
    }
    if (!tpl) {
      this.root.visible = false;
      loadHero(id).then(again, () => {
        if (this.gone || this.look !== l) return;
        this.failed = id;
        this.setLook(l);
        // сеть могла моргнуть — пробуем ещё пару раз
        if ((this.tries = (this.tries || 0) + 1) > 3) return;
        clearTimeout(this.retryT);
        this.retryT = setTimeout(() => {
          if (this.gone || this.failed !== id) return;
          this.failed = null;
          this.setLook(this.look);
        }, 12000);
      });
      return;
    }
    if (tpl.info.id === id) this.failed = null; // своя модель на месте (а не чужая вместо неё)
    this.root.traverse((o) => {
      if (o.isMesh) o.visible = false;
    });
    const h = (this.hero = new HeroBody(tpl));
    this.root.add(h.wrap);
    // удочка — в руку героя
    h.grip.add(this.j.rod);
    this.j.rod.position.set(0, 0, 0);
  }

  buildHair(B, l) {
    const c = l.hairC;
    const hat = l.hat !== 0;
    const style = l.hair;
    if (style === 0) return;
    const tilt = -0.46;
    const cap = (th0, th1, k = 1.045) => B.add(new THREE.SphereGeometry(R * k, 22, 12, 0, TAU, th0, th1 - th0), c, M(0, 0.006, -0.004, 1, 1.06, 1, tilt, 0, 0));
    if (style === 8) {
      if (!hat) for (let i = 0; i < 7; i++) {
        const a = -0.9 + i * 0.36;
        B.add(G.cone(6), c, M(0, Math.cos(a) * R * 1.12, -Math.sin(a) * R * 1.02 - 0.01, 0.07, 0.17, 0.11, -a, 0, 0));
      }
      cap(1.25, 1.75, 1.02);
      return;
    }
    if (style === 7) {
      const r = rng(31);
      for (let i = 0; i < 34; i++) {
        const th = Math.acos(1 - r() * 1.0);
        const ph = r() * TAU;
        if (hat && th < 1.05) continue;
        const d = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)).applyAxisAngle(new THREE.Vector3(1, 0, 0), tilt);
        const s = 0.085 + r() * 0.035;
        B.add(G.ico(1), shade(c, (r() - 0.5) * 0.12), M(d.x * R * 1.02, d.y * R * 1.06, d.z * R * 1.0, s, s, s));
      }
      return;
    }
    if (hat) cap(0.95, 1.86);
    else cap(0, 1.62);
    if (hat && style !== 4 && style !== 5 && style !== 6 && style !== 10) return;
    if (style === 2 && !hat) {
      const r = rng(7);
      for (let i = 0; i < 9; i++) {
        const a = r() * TAU;
        const d = 0.35 + r() * 0.55;
        B.add(G.cone(5), shade(c, (r() - 0.5) * 0.1), M(Math.cos(a) * d * R * 0.8, R * (1.0 + 0.1 * (1 - d)), Math.sin(a) * d * R * 0.8 - 0.03, 0.09, 0.1 + r() * 0.05, 0.09, Math.sin(a) * d * 0.9, 0, -Math.cos(a) * d * 0.9));
      }
    } else if (style === 3 && !hat) {
      B.add(G.sph(12, 8), c, M(0.045, R * 0.72, R * 0.72, 0.27, 0.11, 0.15, 0.5, 0, -0.3));
    } else if (style === 4) {
      B.add(G.sph(10, 8), c, M(0, 0.05, -R * 1.04, 0.1, 0.1, 0.1));
      B.add(loft([[-0.24, 0.02, 0.02], [-0.12, 0.05, 0.045], [0, 0.04, 0.04]], 10), c, M(0, 0.03, -R * 1.22, 1, 1, 1, -0.3, 0, 0));
    } else if (style === 5) {
      B.add(G.sph(14, 10), c, M(0, -0.13, -R * 0.62, 0.37, 0.48, 0.17));
      for (const s of [-1, 1]) B.add(G.sph(10, 8), c, M(s * R * 0.9, -0.14, -0.02, 0.085, 0.38, 0.15));
    } else if (style === 6) {
      B.add(G.sph(14, 10), c, M(0, -0.07, -R * 0.6, 0.39, 0.34, 0.18));
      for (const s of [-1, 1]) B.add(G.sph(10, 8), c, M(s * R * 0.93, -0.07, 0.0, 0.09, 0.29, 0.21));
      if (!hat) B.add(G.sph(12, 8), c, M(0, R * 0.74, R * 0.7, 0.3, 0.09, 0.12, 0.5, 0, 0));
    } else if (style === 9 && !hat) {
      B.add(G.sph(12, 10), c, M(0, R * 1.02, -R * 0.5, 0.15, 0.14, 0.15));
    } else if (style === 10) {
      for (const s of [-1, 1]) {
        for (let i = 0; i < 5; i++) B.add(G.sph(8, 6), c, M(s * (R * 0.86 - i * 0.004), -0.07 - i * 0.055, 0.075 + i * 0.006, 0.075 - i * 0.006, 0.07, 0.075 - i * 0.006));
        B.add(G.sph(8, 6), '#ef4444', M(s * (R * 0.84), -0.36, 0.105, 0.045, 0.04, 0.045));
      }
    }
  }

  buildHat(B, l) {
    const c = l.hatC;
    const h = l.hat;
    if (!h) return;
    const dk = shade(c, -0.22);
    if (h === 1 || h === 2) {
      const ry = h === 2 ? Math.PI : 0;
      const f = h === 2 ? -1 : 1;
      B.add(new THREE.SphereGeometry(R * 1.1, 22, 12, 0, TAU, 0, 1.36), c, M(0, 0.012, -0.004, 1, 1.02, 1, -0.14 * f, ry, 0));
      B.add(new THREE.CylinderGeometry(0.155, 0.155, 0.016, 20, 1, false, -Math.PI / 2, Math.PI), dk, M(0, 0.075, f * R * 0.86, 1, 1, 1.25, 0.16 * f, ry, 0));
      B.add(G.sph(8, 6), dk, M(0, R * 1.13, -0.03 * f, 0.04, 0.025, 0.04));
      B.add(G.box(), '#f8fafc', M(0, 0.145, f * R * 1.005, 0.11, 0.06, 0.012, -0.5 * f, ry, 0));
    } else if (h === 3) {
      B.add(loft([[0.05, R * 1.08, R * 1.08], [0.17, R * 0.98, R * 0.98], [0.215, R * 0.8, R * 0.8]], 20), c, M(0, 0, 0));
      B.add(new THREE.CylinderGeometry(R * 1.08, R * 1.62, 0.085, 22, 1, true), c, M(0, 0.03, 0), null);
      B.add(new THREE.CylinderGeometry(R * 1.07, R * 1.6, 0.08, 22, 1, true).scale(-1, 1, 1), dk, M(0, 0.027, 0), null);
      B.add(loft([[0.07, R * 1.09, R * 1.09], [0.095, R * 1.08, R * 1.08]], 20, 2, false), dk, M(0, 0, 0));
    } else if (h === 4) {
      B.add(new THREE.SphereGeometry(R * 1.1, 22, 12, 0, TAU, 0, 1.5), c, M(0, 0.01, -0.004, 1, 1.08, 1, -0.2, 0, 0));
      B.add(G.torus(0.3, 22), dk, M(0, 0.05, -0.02, R * 2.24, R * 2.24, 0.2, Math.PI / 2 - 0.2, 0, 0));
      B.add(G.ico(1), '#f8fafc', M(0, R * 1.22, -0.05, 0.1, 0.1, 0.1));
    } else if (h === 5) {
      B.add(G.cyl(24), '#e3c57a', M(0, 0.092, 0, R * 3.5, 0.014, R * 3.5));
      B.add(loft([[0.09, R * 1.06, R * 1.06], [0.2, R * 0.92, R * 0.92], [0.225, R * 0.7, R * 0.7]], 20), '#e3c57a', M(0, 0, 0), { grad: [0.9, 1.05] });
      B.add(loft([[0.1, R * 1.08, R * 1.08], [0.132, R * 1.05, R * 1.05]], 20, 2, false), c, M(0, 0, 0));
    } else if (h === 6) {
      B.add(loft([[0.07, R * 1.04, R * 1.04], [0.13, R * 1.08, R * 1.08], [0.19, R * 1.3, R * 1.3], [0.215, R * 1.2, R * 1.2]], 22), c, M(0, 0, 0));
      B.add(loft([[0.07, R * 1.06, R * 1.06], [0.115, R * 1.07, R * 1.07]], 22, 2, false), '#1e2a44', M(0, 0, 0));
      B.add(new THREE.CylinderGeometry(0.15, 0.15, 0.014, 20, 1, false, -Math.PI / 2, Math.PI), '#111827', M(0, 0.072, R * 0.9, 1, 1, 1.05, 0.22, 0, 0));
      B.add(G.sph(8, 6), '#fbbf24', M(0, 0.13, R * 1.1, 0.055, 0.055, 0.02));
    } else if (h === 7) {
      B.add(new THREE.SphereGeometry(R * 1.075, 22, 12, 0, TAU, 0, 1.42), c, M(0, 0.008, -0.004, 1, 1.05, 1, -0.3, 0, 0));
      B.add(G.sph(8, 6), dk, M(0, 0.0, -R * 1.08, 0.07, 0.06, 0.06));
      for (const s of [-1, 1]) B.add(G.cone(5), c, M(s * 0.04, -0.07, -R * 1.12, 0.07, 0.16, 0.03, 0.3, 0, s * 0.35));
    } else if (h === 8) {
      B.add(G.cyl(24), c, M(0, 0.095, 0, R * 3.4, 0.016, R * 3.0));
      B.add(G.torus(0.1, 24), c, M(0, 0.105, 0, R * 3.4, R * 3.0, 0.3, Math.PI / 2, 0, 0));
      B.add(loft([[0.09, R * 1.06, R * 1.06], [0.2, R * 0.9, R * 0.98], [0.245, R * 0.55, R * 0.86]], 20), c, M(0, 0, 0), { grad: [0.88, 1.05] });
      B.add(loft([[0.1, R * 1.08, R * 1.08], [0.128, R * 1.06, R * 1.06]], 20, 2, false), dk, M(0, 0, 0));
    }
  }

  buildBeard(B, l) {
    const c = l.hairC;
    if (l.beard === 3) B.add(G.sph(10, 8), c, M(0, -0.168, R * 0.72, 0.085, 0.095, 0.075));
    if (l.beard >= 4) {
      const k = l.beard === 5 ? 1.1 : 1.05;
      B.add(new THREE.SphereGeometry(R * k, 20, 10, Math.PI / 2 - 1.5, 3.0, 2.3, 0.84), c, M(0, 0.0, 0, 1, 1.06, 1));
      for (const s of [-1, 1]) B.add(G.sph(8, 6), c, M(s * R * 0.9, -0.09, 0.03, 0.06, 0.17, 0.12));
      if (l.beard === 5) B.add(G.sph(12, 10), c, M(0, -0.275, R * 0.46, 0.26, 0.2, 0.2));
    }
  }

  buildGlasses(B, l) {
    const t = l.glasses;
    if (!t) return;
    const y = -0.026;
    const z = R * 0.965;
    const x = 0.066;
    if (t === 4) {
      const up = l.hat === 1 || l.hat === 3 || l.hat === 4 || l.hat === 7;
      const gy = up ? 0.105 : 0.075;
      const gz = up ? R * 1.0 : R * 0.93;
      B.add(G.torus(0.09, 24), '#1f2937', M(0, gy, 0, R * 2.24, R * 2.24, 0.26, Math.PI / 2 - (up ? 0.25 : 0.12), 0, 0));
      for (const s of [-1, 1]) {
        B.add(G.cyl(12), '#1f2937', M(s * 0.058, gy + 0.004, gz, 0.092, 0.03, 0.074, Math.PI / 2 - 0.45, 0, 0));
        B.add(G.cyl(12), '#7dd3fc', M(s * 0.058, gy + 0.006, gz + 0.014, 0.074, 0.012, 0.058, Math.PI / 2 - 0.45, 0, 0));
      }
      return;
    }
    const frame = t === 2 ? '#d4a017' : '#111827';
    for (const s of [-1, 1]) {
      if (t === 1) B.add(G.box(), '#0b0f14', M(s * x, y, z + 0.012, 0.092, 0.058, 0.016, 0, s * 0.3, 0));
      else if (t === 2) {
        B.add(G.sph(12, 8), '#3b2f12', M(s * x, y - 0.004, z + 0.01, 0.098, 0.084, 0.02, 0, s * 0.3, 0));
        B.add(G.torus(0.06, 16), frame, M(s * x, y - 0.004, z + 0.012, 0.098, 0.084, 0.1, 0, s * 0.3, 0));
      } else B.add(G.torus(0.07, 16), frame, M(s * x, y, z + 0.012, 0.086, 0.086, 0.1, 0, s * 0.3, 0));
      B.add(G.box(), frame, M(s * (R * 0.82), y + 0.008, R * 0.42, 0.012, 0.014, R * 1.05, 0, s * 0.16, 0));
    }
    B.add(G.box(), frame, M(0, y + 0.012, z + 0.022, 0.05, 0.012, 0.012));
  }

  redrawFace(force) {
    const q = this.talkQ;
    const key = (this.blink ? 1 : 0) + q * 2;
    if (!force && key === this.faceKey) return;
    this.faceKey = key;
    drawFace(this.faceCanvas.getContext('2d'), this.look, this.blink, q / 2);
    this.faceTex.needsUpdate = true;
  }

  /** Дать в руки удочку (объект из buildRod) или убрать (null). */
  setRod(rod) {
    if (this.rod && this.rod.group.parent) this.rod.group.parent.remove(this.rod.group);
    this.rod = rod;
    if (rod) this.j.rod.add(rod.group);
  }

  /**
   * st: { speed, mode: 'idle'|'hold'|'charge'|'cast'|'wait'|'fight'|'landed', castK, reel, steer, sit, dangle, emote, talk, pitch, variant }
   */
  update(dt, st) {
    const J = this.j;
    this.t += dt;
    const t = this.t;
    const P = {
      hy: 0, hrx: 0, hry: 0, trx: 0, try: 0, trz: 0, headX: 0, headY: 0,
      aRx: 0.06, aRz: -0.14, eR: -0.22, aLx: 0.06, aLz: 0.14, eL: -0.22,
      lRx: 0, kR: 0, lLx: 0, kL: 0, lRz: -0.03, lLz: 0.03, rod: 0.6
    };
    const mode = st.mode || 'idle';
    const breath = Math.sin(t * 1.7) * 0.012;
    P.trx += breath;
    P.hrz = Math.sin(t * 0.6) * 0.015;
    // ходьба
    const sp = Math.min(1.25, (st.speed || 0) / 2.4);
    if (sp > 0.03 && !st.sit) {
      this.walk += dt * (4.6 + sp * 5.2);
      const s = Math.sin(this.walk);
      const c = Math.cos(this.walk);
      const A = 0.62 * Math.min(1, sp);
      P.lRx = -A * s;
      P.lLx = A * s;
      P.kR = A * 1.25 * Math.max(0, c);
      P.kL = A * 1.25 * Math.max(0, -c);
      P.hy -= Math.abs(c) * 0.03 * Math.min(1, sp);
      P.aLx = 0.06 - A * 0.75 * s;
      P.aRx = 0.06 + A * 0.75 * s;
      P.eL = -0.3 - A * 0.3;
      P.eR = -0.3 - A * 0.3;
      P.trx += 0.07 * Math.min(1, sp);
      P.try = s * 0.06 * Math.min(1, sp);
    }
    if (mode !== 'idle') {
      // правая рука держит удочку
      P.aRx = -0.42 + (sp > 0.03 ? Math.sin(this.walk) * 0.06 : 0);
      P.aRz = -0.1;
      P.eR = -1.2;
      P.rod = 0.6;
    }
    if (mode === 'charge') {
      const k = clamp(st.castK ?? 1, 0, 1);
      P.aRx = -0.42 - 1.75 * k;
      P.aRz = -0.28 * k;
      P.eR = -1.2 - 0.35 * k;
      P.rod = 0.6 - 0.45 * k;
      P.trx -= 0.14 * k;
      P.try = -0.25 * k;
    } else if (mode === 'cast') {
      const k = clamp(st.castK ?? 0, 0, 1);
      P.aRx = -2.17 + 1.3 * k;
      P.eR = -1.55 + 1.1 * k;
      P.rod = 0.15 + 0.9 * k;
      P.trx += 0.22 * k - 0.1;
      P.try = -0.25 + 0.4 * k;
    } else if (mode === 'wait') {
      P.aRx = -0.52;
      P.aRz = 0.02;
      P.eR = -1.02;
      P.rod = 0.96 + Math.sin(t * 0.8) * 0.02;
      P.aLx = -0.66;
      P.aLz = -0.42;
      P.eL = -1.32;
      if (st.reel) {
        P.aLx += Math.sin(t * 11) * 0.07;
        P.eL += Math.cos(t * 11) * 0.1;
      }
    } else if (mode === 'fight') {
      const pull = Math.sin(t * 13) * 0.02;
      P.aRx = -0.8 + pull;
      P.aRz = 0.02;
      P.eR = -1.52;
      P.rod = 0.5;
      P.trx -= 0.17;
      P.hrx = -0.05;
      P.try = -(st.steer || 0) * 0.3;
      P.aLx = -0.72 + (st.reel ? Math.sin(t * 14) * 0.09 : 0);
      P.aLz = -0.42;
      P.eL = -1.5 + (st.reel ? Math.cos(t * 14) * 0.12 : 0);
      P.lRx = -0.18;
      P.lLx = 0.2;
      P.kL = 0.25;
    } else if (mode === 'landed') {
      const hop = Math.abs(Math.sin(t * 7)) * 0.05;
      P.hy += hop;
      P.aLx = -2.7;
      P.aLz = 0.25;
      P.eL = -0.25 + Math.sin(t * 9) * 0.15;
      P.aRx = -0.9;
      P.eR = -1.35;
      P.rod = 0.3;
      P.trx -= 0.08;
    }
    // жесты левой рукой
    if (st.emote === 'wave') {
      P.aLx = -0.3;
      P.aLz = 2.5;
      P.eL = -0.5 + Math.sin(t * 11) * 0.45;
      P.headY = 0.1;
    } else if (st.emote === 'thumb') {
      P.aLx = -1.25;
      P.aLz = 0.1;
      P.eL = -1.35;
      P.trz = -0.05;
    } else if (st.emote === 'cheer') {
      P.hy += Math.abs(Math.sin(t * 8)) * 0.1;
      P.aLx = -2.8;
      P.aLz = 0.3;
      P.eL = -0.2;
      if (mode === 'idle') {
        P.aRx = -2.8;
        P.aRz = -0.3;
        P.eR = -0.2;
      }
    } else if (st.emote === 'dance') {
      const d = Math.sin(t * 7);
      P.hy += Math.abs(d) * 0.04 - 0.03;
      P.hrz = d * 0.12;
      P.trz = -d * 0.14;
      P.try = d * 0.25;
      P.aLx = -1.2 + d * 0.5;
      P.eL = -1.3;
      P.kR = 0.25 + d * 0.15;
      P.kL = 0.25 - d * 0.15;
      P.lRx = -0.15;
      P.lLx = -0.15;
    }
    // варианты стойки в лобби
    if (st.variant && mode !== 'charge' && mode !== 'cast' && !st.emote) {
      if (st.variant === 1) {
        // рука поднята сбоку от лица: «привет» — лицо остаётся открытым под любым углом камеры
        P.aLx = -0.9;
        P.aLz = 0.6;
        P.eL = -1.2;
      } else if (st.variant === 2) {
        P.aLx = 0.25;
        P.aLz = 0.75;
        P.eL = -1.75;
        P.hrz = 0.05;
      } else if (st.variant === 3) {
        P.aLx = -0.2;
        P.aLz = 2.3;
        P.eL = -0.7 + Math.sin(t * 6) * 0.3;
      }
    }
    if (st.P) Object.assign(P, st.P); // подбор поз в тестах
    if (st.sit) {
      P.hy = -HIP_Y + (st.dangle ? 0.1 : 0.12);
      P.lRx = P.lLx = -1.52;
      P.kR = P.kL = st.dangle ? 1.45 + Math.sin(t * 1.6) * 0.12 : 0.12;
      if (st.dangle) P.kL = 1.45 - Math.sin(t * 1.6) * 0.12;
      P.lRz = -0.08;
      P.lLz = 0.08;
      P.trx += 0.06;
    }
    P.headX = clamp(-(st.pitch || 0) * 0.55, -0.5, 0.5) + (mode === 'fight' ? 0.1 : 0);
    // плавно тянемся к целевой позе
    const p = this.pose;
    const k = st.snap ? 1e6 : 13;
    for (const key in P) p[key] = p[key] === undefined ? P[key] : damp(p[key], P[key], key === 'aRx' || key === 'eR' || key === 'rod' ? 20 : k, dt);
    J.hips.position.y = HIP_Y + p.hy;
    J.hips.rotation.set(p.hrx, p.hry, p.hrz);
    J.torso.rotation.set(p.trx, p.try, p.trz);
    J.head.rotation.set(p.headX, p.headY, 0);
    J.aR.rotation.set(p.aRx, 0, p.aRz);
    J.eR.rotation.x = p.eR;
    J.aL.rotation.set(p.aLx, 0, p.aLz);
    J.eL.rotation.x = p.eL;
    J.lR.rotation.set(p.lRx, 0, p.lRz);
    J.kR.rotation.x = p.kR;
    J.lL.rotation.set(p.lLx, 0, p.lLz);
    J.kL.rotation.x = p.kL;
    J.rod.rotation.x = Math.PI / 2 + p.rod;
    if (this.hero) {
      this.hero.update(dt, st, J);
      return; // лицо куклы не видно — моргать нечему
    }
    // лицо: моргание и разговор
    this.blinkT -= dt;
    if (this.blinkT <= 0) {
      this.blink = !this.blink;
      this.blinkT = this.blink ? 0.12 : 2.2 + Math.random() * 3.5;
    }
    const talk = st.talk || 0;
    this.talkQ = talk > 0.08 ? (Math.sin(t * 17) > 0 ? 2 : 1) : 0;
    this.redrawFace(false);
  }
}
const HEAD_GEO = new THREE.SphereGeometry(R, 32, 24);

function patternCanvas(l, plaid) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = l.topC;
  g.fillRect(0, 0, 128, 128);
  if (plaid) {
    g.globalAlpha = 0.55;
    g.fillStyle = l.topC2;
    for (let i = 0; i < 8; i++) {
      g.fillRect(i * 16 + 2, 0, 5, 128);
      g.fillRect(0, i * 16 + 2, 128, 5);
    }
    g.globalAlpha = 0.5;
    g.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      g.fillRect(i * 16 + 11, 0, 1.5, 128);
      g.fillRect(0, i * 16 + 11, 128, 1.5);
    }
  } else {
    g.fillStyle = l.topC2;
    for (let i = 0; i < 8; i++) g.fillRect(0, i * 16 + 3, 128, 7);
  }
  return c;
}
