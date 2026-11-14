// Что игрок рассылает о себе 12 раз в секунду: индексы в массиве состояния.
export const S = { X: 0, Y: 1, Z: 2, YAW: 3, PITCH: 4, SPEED: 5, FS: 6, BX: 7, BY: 8, BZ: 9, T: 10, FLAGS: 11, K: 12, STEER: 13, TALK: 14, BYAW: 15, BOAT: 16, RIDE: 17, SEAT: 18 };
// BOAT: 0 — лодки нет, 1 — игрок идёт на ней (BYAW — куда смотрит нос, SPEED — её ход), 2 + i — стоит у причала i
// RIDE: в чьей лодке игрок сидит пассажиром (номер игрока-хозяина; 0 — ни в чьей), SEAT — на каком месте (1 или 2)
export const FS = { idle: 0, charge: 1, cast: 2, wait: 3, bite: 4, fight: 5, landed: 6 };
export const FS_NAME = ['hold', 'charge', 'cast', 'wait', 'wait', 'fight', 'landed'];
export const FLAG = { sit: 1, reel: 2, dangle: 4, lure: 8, own: 16, giant: 32 }; // own — лодка у игрока своя, а не прокатная (вымпел его цвета); giant — на леске гигант (друг берёт его багром и позже)
// метки игроков на карте и в списке: форма и цвет по номеру места
export const MARKS = [
  { shape: 'circle', color: '#3fe3d5' }, { shape: 'diamond', color: '#ff5fa8' }, { shape: 'tri', color: '#b79cff' }, { shape: 'square', color: '#ffd166' },
  { shape: 'circle', color: '#6ee787' }, { shape: 'diamond', color: '#ff9f5a' }, { shape: 'tri', color: '#f4f7fb' }, { shape: 'square', color: '#ff7b7b' }
];
/** Фигурка игрока. fill = false — контуром (список команды), true — залитая, с тёмной каймой (над головой в мире: её видно на любом фоне). */
export function markSvg(slot, size = 18, fill = false) {
  const m = MARKS[slot % MARKS.length];
  const p = m.shape === 'tri' ? '<path d="M12 4.2l8.6 15.3H3.4z"/>' : m.shape === 'diamond' ? '<path d="M12 3l9 9-9 9-9-9z"/>' : m.shape === 'circle' ? '<circle cx="12" cy="12" r="8.4"/>' : '<rect x="4" y="4" width="16" height="16" rx="3"/>';
  const paint = fill ? `fill="${m.color}" stroke="#0d1b33" stroke-width="2.2"` : `fill="none" stroke="${m.color}" stroke-width="3"`;
  return `<svg class="mark" viewBox="0 0 24 24" width="${size}" height="${size}" ${paint} stroke-linejoin="round">${p}</svg>`;
}
