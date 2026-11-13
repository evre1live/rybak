// Сохранение игрока в браузере: монеты, снасти, улов, внешность, настройки.
import { newProfile, fixProfile } from '../shared/logic.js';
import { fixLook } from './character.js';

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
  p.look = fixLook(p.look); // герой; кому он ещё не выбран, тому его назначит игра, когда придёт список героев (main.js)
  p.fresh = !raw;
  return p;
}
let timer = null;
let locked = false;
// saved — вызывается при каждом сохранении профиля: по нему прогресс уходит ещё и на сервер (client/cloud.js)
export const hooks = { saved: null };
export function saveProfile(p) {
  if (locked) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const { fresh, ...rest } = p;
    store.set(KEY, rest);
  }, 300);
  if (hooks.saved) hooks.saved();
}
/** Записать профиль сразу, не дожидаясь паузы: перед перезагрузкой страницы (загрузка сохранения из файла или с сервера). */
export function saveProfileNow(p) {
  clearTimeout(timer);
  const { fresh, ...rest } = p;
  store.set(KEY, rest);
}
/**
 * Прогресс заменён другим сохранением, страница сейчас откроется заново. До тех пор профиль из памяти больше
 * не пишется: иначе игра, которая ещё идёт на экране, затёрла бы только что загруженное.
 */
export function lockProfile() {
  clearTimeout(timer);
  locked = true;
}
// drs — уменьшать разрешение, когда кадры проседают; fps — окошко со счётчиком кадров; autoQ — что подобрано на «авто» для этой видеокарты;
// follow — при вываживании взгляд сам держится на рыбе, пока игрок не ведёт мышью; music — громкость музыки, которую сочиняет игра
export const DEFAULT_SETTINGS = { sens: 1, invertY: false, quality: 'auto', fov: 62, master: 0.8, amb: 0.7, sfx: 0.85, voiceVol: 1, ptt: false, near: false, hints: true, drs: true, fps: false, autoQ: null, follow: true, music: 0.45, compass: true };
export const settings = Object.assign({}, DEFAULT_SETTINGS, store.get(SKEY) || {});
export const saveSettings = () => store.set(SKEY, settings);
export const session = {
  get: () => store.get('rybak.session') || null,
  set: (v) => store.set('rybak.session', v)
};
