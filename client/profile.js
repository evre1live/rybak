// Сохранение игрока в браузере: монеты, снасти, улов, внешность, настройки.
import { newProfile, fixProfile } from '../shared/logic.js';
import { fixLook, PRESETS } from './character.js';

const KEY = 'rybak.profile.v1';
const SKEY = 'rybak.settings.v1';
const store = {
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* личный режим или переполнение — играем без сохранения */
    }
  }
};
export function loadProfile() {
  const raw = store.get(KEY);
  const p = fixProfile(raw || newProfile());
  p.look = fixLook(p.look || PRESETS[Math.floor(Math.random() * 4)].look);
  p.fresh = !raw;
  return p;
}
let timer = null;
export function saveProfile(p) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const { fresh, ...rest } = p;
    store.set(KEY, rest);
  }, 300);
}
export const DEFAULT_SETTINGS = { sens: 1, invertY: false, quality: 'auto', fov: 62, master: 0.8, amb: 0.7, sfx: 0.85, voiceVol: 1, ptt: false, near: false, hints: true };
export const settings = Object.assign({}, DEFAULT_SETTINGS, store.get(SKEY) || {});
export const saveSettings = () => store.set(SKEY, settings);
export const session = {
  get: () => store.get('rybak.session') || null,
  set: (v) => store.set('rybak.session', v)
};
