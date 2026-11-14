// Какая локация строится на этой странице. Решается один раз, до сборки мира: рельеф, причалы и зоны ловли
// (terrain.js) берутся из модуля этой локации. Сменить локацию — перезагрузить страницу с другим ?loc=.
import { LOC_BY_ID, DEFAULT_LOC } from '../../shared/locations.js';

function pick() {
  try {
    const g = globalThis;
    const id = g.RYBAK_LOC || (g.location && g.location.search ? new URLSearchParams(g.location.search).get('loc') : null);
    return LOC_BY_ID[id] ? id : DEFAULT_LOC;
  } catch {
    return DEFAULT_LOC;
  }
}
/** Локация этой страницы: 'bay' — Солнечная бухта, 'lake' — Сосновое озеро. */
export const LOC_ID = pick();
/** Её описание из общего списка (shared/locations.js): название, рыба, подписи зон. */
export const LOC = LOC_BY_ID[LOC_ID];
