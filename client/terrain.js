// Рельеф локации этой страницы: высота земли и дна, причалы, зоны ловли, где можно ходить и плыть.
//
// Сам рельеф живёт в модулях локаций (loc/bay.js — Солнечная бухта, loc/lake.js — Сосновое озеро); здесь выбирается
// тот, что нужен странице (loc/id.js: ?loc= в адресе), и отдаётся под общими именами. Остальной игре всё равно,
// какая локация: она спрашивает groundH, canStand, spotAt… Чего на локации нет (маяк, арка, Пальмовый остров),
// стоит далеко за краем мира, а что на ней есть из необязательного — сказано в HAS.
import * as bay from './loc/bay.js';
import * as lake from './loc/lake.js';
import { LOC_ID } from './loc/id.js';

const T = { bay, lake }[LOC_ID] || bay;

export const HAS = T.HAS;
export const DECK_Y = T.DECK_Y;
export const ISLAND = T.ISLAND;
export const ARCH = T.ARCH;
export const ARCH_LEGS = T.ARCH_LEGS;
export const BACKWATER = T.BACKWATER;
export const REEF = T.REEF;
export const CAPE = T.CAPE;
export const MARKET = T.MARKET;
export const SPAWN = T.SPAWN;
export const BOUNDS = T.BOUNDS;
export const WORLD = T.WORLD;
export const PALM = T.PALM;
export const WRECK = T.WRECK;
export const SEA = T.SEA;
export const MAP_VIEW = T.MAP_VIEW;
export const SKERRIES = T.SKERRIES;
export const DECKS = T.DECKS;
export const BOXES = T.BOXES;
export const CIRCLES = T.CIRCLES;
export const shoreZ = T.shoreZ;
export const islandR = T.islandR;
export const COTTAGE = T.COTTAGE;
export const cottageUV = T.cottageUV;
export const capeDist = T.capeDist;
export const palmR = T.palmR;
export const groundH = T.groundH;
export const FALLS = T.FALLS;
export const LIGHTHOUSE = T.LIGHTHOUSE;
export const CAMPFIRE = T.CAMPFIRE;
export const deckAt = T.deckAt;
export const standY = T.standY;
export const WADE = T.WADE;
export const blocksAt = T.blocksAt;
export const canStand = T.canStand;
export const MOORINGS = T.MOORINGS;
export const RENT_DESK = T.RENT_DESK;
export const BUOYS = T.BUOYS;
export const MARKS = T.MARKS;
export const canSail = T.canSail;
export const inRocks = T.inRocks;
export const spotAt = T.spotAt;
export const SCHOOL_HOMES = T.SCHOOL_HOMES;
export const SEA_HOMES = T.SEA_HOMES;
/** Части мира: подписи в углу экрана (ключ → [название, что там ловится]) и в какой из них точка. */
export const AREAS = T.AREAS;
export const areaAt = T.areaAt;
