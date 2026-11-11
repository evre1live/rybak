// Что игрок рассылает о себе 12 раз в секунду: индексы в массиве состояния.
export const S = { X: 0, Y: 1, Z: 2, YAW: 3, PITCH: 4, SPEED: 5, FS: 6, BX: 7, BY: 8, BZ: 9, T: 10, FLAGS: 11, K: 12, STEER: 13, TALK: 14 };
export const FS = { idle: 0, charge: 1, cast: 2, wait: 3, bite: 4, fight: 5, landed: 6 };
export const FS_NAME = ['hold', 'charge', 'cast', 'wait', 'wait', 'fight', 'landed'];
export const FLAG = { sit: 1, reel: 2, dangle: 4, lure: 8 };
// метки игроков на карте и в списке: форма и цвет по номеру места
export const MARKS = [
  { shape: 'tri', color: '#22d3ee' }, { shape: 'diamond', color: '#ffd60a' }, { shape: 'circle', color: '#a78bfa' }, { shape: 'square', color: '#f472b6' },
  { shape: 'tri', color: '#4ade80' }, { shape: 'diamond', color: '#fb923c' }, { shape: 'circle', color: '#f8fafc' }, { shape: 'square', color: '#f87171' }
];
export function markSvg(slot, size = 18) {
  const m = MARKS[slot % MARKS.length];
  const p = m.shape === 'tri' ? '<path d="M12 3l9.5 17h-19z"/>' : m.shape === 'diamond' ? '<path d="M12 2l10 10-10 10L2 12z"/>' : m.shape === 'circle' ? '<circle cx="12" cy="12" r="9.5"/>' : '<rect x="3" y="3" width="18" height="18" rx="3"/>';
  return `<svg class="mark" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${m.color}">${p}</svg>`;
}
