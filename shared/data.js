// РЫБАК — игровые данные: рыба, снасти, зоны ловли. Общие для браузера, сервера и тестов.
import { locOf, DEFAULT_LOC } from './locations.js';

export const RARITY = [
  { key: 'common', name: 'Обычная', color: '#dbe4ee', mult: 1 },
  { key: 'uncommon', name: 'Необычная', color: '#4ade80', mult: 0.45 },
  { key: 'rare', name: 'Редкая', color: '#38bdf8', mult: 0.16 },
  { key: 'epic', name: 'Эпическая', color: '#c084fc', mult: 0.05 },
  { key: 'legend', name: 'Легендарная', color: '#fbbf24', mult: 0.012 }
];

export const ZONES = {
  pier: { name: 'У свай', hint: 'Под самым причалом', act: 1.1 },
  shallow: { name: 'Мелководье', hint: 'У берега, до 2,5 м', act: 1.0 },
  mid: { name: 'Средняя вода', hint: 'От 2,5 до 6 м', act: 1.0 },
  deep: { name: 'Глубина', hint: 'Глубже 6 м', act: 0.88 },
  backwater: { name: 'Заводь', hint: 'Тихая вода с кувшинками на западе', act: 1.0 },
  reef: { name: 'Риф', hint: 'Камни и берег острова', act: 1.1 },
  falls: { name: 'Водопад', hint: 'Пресная вода под скалами острова', act: 1.15 },
  arch: { name: 'Арка', hint: 'Каменная арка на востоке', act: 0.62 },
  // куда добираются на лодке
  sea: { name: 'Открытое море', hint: 'Далеко от берега — только на лодке', act: 0.9 },
  lagoon: { name: 'Лагуна', hint: 'Бирюзовая отмель у Пальмового острова', act: 1.15 },
  wreck: { name: 'Затонувший корабль', hint: 'Отмель с кораблём на северо-западе', act: 0.85 },
  // Сосновое озеро
  stones: { name: 'Каменная гряда', hint: 'Валуны у островка и на отмели', act: 1.1 },
  pit: { name: 'Яма', hint: 'Самое глубокое место озера — между пирсом и избушкой', act: 0.84 },
  // Коралловые островки
  garden: { name: 'Коралловый сад', hint: 'Кораллы на дне лагуны и за гребнем рифа', act: 1.15 },
  channel: { name: 'Протока', hint: 'Глубокая вода между садами и в проходах рифа', act: 0.95 },
  edge: { name: 'Край рифа', hint: 'За гребнем: стена рифа уходит в синеву', act: 1.0 },
  // Синий простор
  bank: { name: 'Банка', hint: 'Подводное плато среди океана — далеко на юго-востоке', act: 1.05 },
  current: { name: 'Течение', hint: 'Полоса плавучих водорослей поперёк океана', act: 0.95 }
};
/** Зона ловли так, как её зовут на локации: у локации могут быть свои подписи (shared/locations.js). */
export const zoneInfo = (id, loc = DEFAULT_LOC) => ({ ...(ZONES[id] || { name: '', hint: '', act: 1 }), ...(locOf(loc).zones[id] || {}) });

export const DAY_PARTS = { dawn: 'Рассвет', day: 'День', dusk: 'Закат', night: 'Ночь' };

const fish = (id, name, rar, wMin, wMax, price, str, zones, baits, lure, time, look, desc, extra = {}) => ({
  id, name, rar, w: [wMin, wMax], price, str, zones, baits, lure, time: time || {}, look, desc, ...extra
});

// price — монет за рыбу среднего размера; str — характер при вываживании.
// zones — где и как охотно рыба берёт в Солнечной бухте; at.<локация> — то же на других локациях
// (нет записи — рыба там не водится). Рыба озера и островков, которой в бухте нет, идёт в конце списка с пустыми zones.
export const FISH = [
  fish('bychok', 'Бычок', 0, 0.04, 0.28, 9, 0.6, { pier: 6, shallow: 5, reef: 2, mid: 1, lagoon: 2 }, { worm: 1.4, maggot: 1.2, shrimp: 1.3, bread: 0.7 }, 0, null,
    { shape: 'goby', back: '#6b5a3c', side: '#a08a5f', belly: '#e8dcc0', fin: '#7a6a48', pat: 'marble', patC: '#4a3d27', lenK: 31 },
    'Головастый житель свай. Клюёт на всё и всегда — первая рыба каждого рыбака.'),
  fish('plotva', 'Плотва', 0, 0.08, 0.6, 11, 0.7, { backwater: 5, shallow: 5, mid: 2, falls: 1 }, { bread: 1.3, maggot: 1.5, worm: 1.1, corn: 1.0 }, 0, null,
    { shape: 'std', back: '#5f7480', side: '#cfd9de', belly: '#f4f6f6', fin: '#e2572f', pat: 'scales', lenK: 34 },
    'Серебристая, с красными плавниками. Любит тихую воду и хлебный мякиш.'),
  fish('karas', 'Карась', 0, 0.15, 1.4, 16, 0.9, { backwater: 7, shallow: 1 }, { bread: 1.4, corn: 1.4, worm: 1.1, maggot: 1.1 }, 0, null,
    { shape: 'tall', back: '#7a6a2a', side: '#d9b14a', belly: '#f1e2a8', fin: '#a8742a', pat: 'scales', lenK: 29 },
    'Золотистый увалень из заводи. Берёт неторопливо, но упирается честно.'),
  fish('stavrida', 'Ставрида', 0, 0.08, 0.55, 13, 0.9, { mid: 6, deep: 3, shallow: 1, reef: 1, sea: 5, lagoon: 2 }, { shrimp: 1.4, worm: 0.8, maggot: 0.9 }, 1.0, null,
    { shape: 'slim', back: '#3f7d86', side: '#bcd3d6', belly: '#f2f6f6', fin: '#c9b458', pat: 'line', patC: '#e4d24a', lenK: 36 },
    'Ходит стаями на средней воде. Хорошо идёт на блесну.'),
  fish('okun', 'Окунь', 0, 0.1, 1.3, 18, 1.0, { pier: 5, reef: 4, shallow: 2, backwater: 2, mid: 1, falls: 2 }, { worm: 1.5, maggot: 1.1, live: 1.2, shrimp: 1.0 }, 1.2, null,
    { shape: 'std', back: '#4d6b2f', side: '#9fb04a', belly: '#f0ecc8', fin: '#e0522a', pat: 'bars', patC: '#26391a', lenK: 32 },
    'Полосатый разбойник. Держится у свай и камней, хватает червя с разгона.'),
  fish('kefal', 'Кефаль', 0, 0.25, 2.2, 24, 1.1, { shallow: 4, mid: 4, pier: 2, reef: 1, lagoon: 5 }, { bread: 1.5, corn: 1.1, maggot: 1.0, worm: 0.8 }, 0, null,
    { shape: 'slim', back: '#566673', side: '#c2ccd2', belly: '#f4f5f5', fin: '#7d8a94', pat: 'lines', patC: '#7c8c97', lenK: 37 },
    'Осторожная и быстрая. Лучше всего клюёт на хлеб у самого берега.'),

  fish('kambala', 'Камбала', 1, 0.25, 3.2, 46, 1.0, { deep: 5, mid: 3, shallow: 1, lagoon: 3, sea: 2 }, { worm: 1.3, shrimp: 1.5, squid: 1.3 }, 0, null,
    { shape: 'flat', back: '#6f5a3a', side: '#8b7347', belly: '#efe6d2', fin: '#7b6540', pat: 'spots', patC: '#e07b2c', lenK: 30 },
    'Плоская хитрюга с песчаного дна. Ищите её на глубине.'),
  fish('skumbria', 'Скумбрия', 1, 0.2, 1.6, 42, 1.4, { mid: 4, deep: 5, reef: 1, sea: 7 }, { shrimp: 1.2, squid: 1.2, live: 1.0 }, 1.6, null,
    { shape: 'slim', back: '#1f6f8a', side: '#b9d6d8', belly: '#f5f8f8', fin: '#3d6c7a', pat: 'tiger', patC: '#123c4d', lenK: 37 },
    'Стремительная, с тигровой спиной. Обожает блёсны.'),
  fish('lesh', 'Лещ', 1, 0.4, 3.5, 50, 1.1, { backwater: 5, mid: 2, deep: 1 }, { corn: 1.5, maggot: 1.4, worm: 1.2, bread: 1.0 }, 0, { dawn: 1.4, night: 1.2 },
    { shape: 'tall', back: '#5d5a4a', side: '#b9b39a', belly: '#ece8d8', fin: '#575248', pat: 'scales', lenK: 33 },
    'Широкий, как сковорода. Лучше всего берёт на рассвете.'),
  fish('morokun', 'Морской окунь', 1, 0.3, 3.0, 58, 1.3, { reef: 6, deep: 2, arch: 2, pier: 1, wreck: 7, lagoon: 2 }, { shrimp: 1.5, squid: 1.3, live: 1.2, worm: 0.7 }, 1.0, null,
    { shape: 'std', back: '#b53a22', side: '#e8643a', belly: '#f6c9a8', fin: '#d8492a', pat: 'marble', patC: '#8f2a18', lenK: 31, bigEye: true },
    'Красный колючий житель рифа. На рынке его разбирают первым.'),
  fish('sargan', 'Сарган', 1, 0.15, 1.1, 48, 1.2, { mid: 5, shallow: 2, deep: 2, lagoon: 4, sea: 3 }, { shrimp: 1.2, live: 1.3 }, 1.5, { dawn: 1.3, dusk: 1.3 },
    { shape: 'needle', back: '#2f8a6a', side: '#c9e0d6', belly: '#f6f9f7', fin: '#5a9a84', pat: 'line', patC: '#3fb7a0', lenK: 62 },
    'Рыба-стрела с длинным клювом. Гоняется за блесной у поверхности.'),
  fish('karp', 'Карп', 1, 1.0, 9, 95, 1.35, { backwater: 5, falls: 1 }, { corn: 1.7, bread: 1.2, worm: 1.0, maggot: 0.9 }, 0, { dawn: 1.3, dusk: 1.3, night: 1.1 },
    { shape: 'carp', back: '#5a4a22', side: '#c08f3a', belly: '#f0dfa6', fin: '#9a5a2a', pat: 'scales', lenK: 30 },
    'Силач из заводи. Без крепкой лески лучше не связываться.'),

  fish('shuka', 'Щука', 2, 0.8, 11, 170, 1.6, { backwater: 4, falls: 3, shallow: 1, mid: 1 }, { live: 1.8 }, 1.7, { dawn: 1.4, dusk: 1.3 },
    { shape: 'pike', back: '#3d5a2a', side: '#7f9a4a', belly: '#eef0d0', fin: '#a8672a', pat: 'spots', patC: '#d7e08a', lenK: 47 },
    'Зубастая хозяйка тихой воды. Берёт только живца и блесну.'),
  fish('sudak', 'Судак', 2, 0.6, 7.5, 190, 1.5, { deep: 5, mid: 2, backwater: 1 }, { live: 1.7, squid: 1.0, worm: 0.5 }, 1.5, { dusk: 1.6, night: 1.6, day: 0.6 },
    { shape: 'slim', back: '#56664a', side: '#aab592', belly: '#f0f0e0', fin: '#6b7558', pat: 'bars', patC: '#39452f', lenK: 42 },
    'Ночной охотник глубины. Днём почти не показывается.'),
  fish('forel', 'Форель', 2, 0.3, 4.5, 210, 1.5, { falls: 8, reef: 1 }, { maggot: 1.3, worm: 1.2, corn: 1.0, shrimp: 1.0 }, 1.5, { dawn: 1.4, dusk: 1.2, night: 0.6 },
    { shape: 'std', back: '#5b6b3a', side: '#c9b79a', belly: '#f3ead8', fin: '#b0703a', pat: 'dots', patC: '#2c2c22', band: '#e37a8c', lenK: 38 },
    'Живёт в пресной струе под водопадом. Красива и сильна.'),
  fish('dorado', 'Дорада', 2, 0.4, 4.5, 230, 1.5, { reef: 6, arch: 2, deep: 1, lagoon: 6, wreck: 3 }, { shrimp: 1.7, squid: 1.3, worm: 0.7 }, 0, null,
    { shape: 'tall', back: '#6f8794', side: '#d5dde0', belly: '#f6f7f7', fin: '#8795a0', pat: 'scales', band: '#e8b830', lenK: 31 },
    'Серебряная, с золотой бровью. Рифовая лакомка — подавай ей креветку.'),
  fish('sibas', 'Сибас', 2, 0.6, 8, 240, 1.7, { reef: 4, deep: 3, mid: 2, arch: 2, sea: 4, wreck: 4, lagoon: 2 }, { live: 1.6, shrimp: 1.3, squid: 1.2 }, 1.6, { dawn: 1.3, dusk: 1.4, night: 1.1 },
    { shape: 'std', back: '#4a5a66', side: '#c3ccd2', belly: '#f5f6f6', fin: '#5c6a75', pat: 'scales', lenK: 40 },
    'Морской волк. Бьётся до последнего и часто рвёт слабую леску.'),
  fish('ugor', 'Угорь', 2, 0.4, 4.5, 260, 1.6, { pier: 3, backwater: 3, deep: 2, reef: 2, wreck: 5 }, { worm: 1.6, live: 1.3, shrimp: 1.0 }, 0, { night: 2.2, dusk: 1.2, day: 0.25, dawn: 0.6 },
    { shape: 'eel', back: '#3a3d26', side: '#6f6b3a', belly: '#d9d2a0', fin: '#4a4a2c', pat: 'none', lenK: 78 },
    'Скользкий ночной гость. Днём его почти не поймать.'),

  fish('som', 'Сом', 3, 4, 45, 900, 1.7, { backwater: 3, deep: 2 }, { live: 1.8, squid: 1.5, worm: 0.8 }, 0.6, { night: 2.2, dusk: 1.5, day: 0.35, dawn: 0.8 },
    { shape: 'cat', back: '#2f3a2c', side: '#5c6648', belly: '#e6e0c4', fin: '#39422f', pat: 'marble', patC: '#1c241a', lenK: 44 },
    'Усатый великан. Выходит на охоту в темноте и тянет, как трактор.'),
  fish('tunec', 'Тунец', 3, 6, 70, 1500, 2.3, { deep: 3, arch: 2, sea: 6 }, { live: 1.5, squid: 1.6 }, 1.8, { dawn: 1.3, day: 1.1 },
    { shape: 'tuna', back: '#17335c', side: '#9fb3c4', belly: '#f0f3f5', fin: '#e8c62a', pat: 'none', lenK: 37 },
    'Торпеда открытого моря. В бухту заходит только на большую глубину — за ним лучше выйти на лодке.', { minDepth: 9 }),
  fish('losos', 'Лосось', 3, 1.5, 16, 800, 1.9, { falls: 4, reef: 1 }, { shrimp: 1.3, live: 1.3, maggot: 0.8 }, 1.7, { dawn: 1.7, dusk: 1.5, day: 0.7, night: 0.5 },
    { shape: 'std', back: '#4a5f6b', side: '#c9c4c8', belly: '#f6f1f1', fin: '#6a6f78', pat: 'dots', patC: '#22262b', band: '#e08a8a', lenK: 43 },
    'Король водопада. Приходит на заре и на закате.'),
  fish('skat', 'Скат', 3, 2.5, 28, 1000, 1.8, { deep: 4, reef: 1, arch: 1, sea: 2.5, wreck: 3 }, { squid: 1.7, shrimp: 1.4, live: 1.0 }, 0, { night: 1.4 },
    { shape: 'ray', back: '#8a744e', side: '#8a744e', belly: '#f1ead8', fin: '#6f5c3c', pat: 'spots', patC: '#3f8fd0', lenK: 34 },
    'Парит над песком на глубине. Поднять его со дна — отдельный труд.', { minDepth: 6 }),

  fish('mech', 'Рыба-меч', 4, 25, 160, 6500, 2.5, { arch: 0.8, deep: 0.3, sea: 1.6 }, { live: 1.5, squid: 1.7 }, 1.6, null,
    { shape: 'sword', back: '#2a3d6b', side: '#8fa0b8', belly: '#eef1f4', fin: '#24345c', pat: 'none', lenK: 52 },
    'Легенда бухты. Говорят, её видели у каменной арки и далеко в открытом море.', { minDepth: 9 }),
  fish('koi', 'Золотой кои', 4, 1.5, 11, 4200, 1.5, { backwater: 1.5, falls: 0.6 }, { corn: 1.6, bread: 1.2, maggot: 1.0 }, 0, { dawn: 1.8 },
    { shape: 'carp', back: '#f0a020', side: '#f7c948', belly: '#fff3c4', fin: '#f08a1c', pat: 'koi', patC: '#ffffff', lenK: 30 },
    'Приносит удачу. Показывается в заводи на рассвете — и то не каждому.'),
  fish('starik', 'Мероу «Старик»', 4, 35, 140, 8000, 2.4, { arch: 1.0, wreck: 1.6 }, { live: 1.6, squid: 1.6 }, 1.0, { dusk: 1.5, night: 1.3 },
    { shape: 'grouper', back: '#4a3a2a', side: '#8a6f4f', belly: '#d9c9a8', fin: '#5a4532', pat: 'marble', patC: '#cdb890', lenK: 31 },
    'Старожил арки. Смотрители маяка рассказывают о нём уже сорок лет — а кто-то видел его в трюме затонувшего корабля.'),

  // ── гиганты: берут только на морскую (тяжёлую) удочку, в подсак не влезают — их берут багром (logic.js, GAFF_AT) ──
  fish('mako', 'Акула-мако', 3, 60, 480, 9000, 2.4, { sea: 1.1, wreck: 0.5 }, { live: 1.6, squid: 1.8 }, 1.7, { dawn: 1.2, dusk: 1.3 },
    { shape: 'shark', back: '#24477f', side: '#557bb0', belly: '#eef2f6', fin: '#1f3d6c', pat: 'none', lenK: 50 },
    'Самая быстрая из акул: в свече взлетает над водой на высоту мачты. Заходит из открытого моря к затонувшему кораблю — на лёгкую снасть даже не смотрит.',
    { giant: true, minDepth: 12, at: { keys: { sea: 0.6 } } }),

  // ── Сосновое озеро ──
  fish('ersh', 'Ёрш', 0, 0.02, 0.2, 8, 0.6, {}, { worm: 1.5, maggot: 1.3, bread: 0.6 }, 0, { night: 1.2 },
    { shape: 'std', back: '#5d5a3a', side: '#a79c62', belly: '#ece6c4', fin: '#7f7a4c', pat: 'dots', patC: '#2d2a18', lenK: 30, bigEye: true },
    'Колючий сорванец озёрных свай. Червя не пропустит никогда — даже если вы ждали кого-то другого.',
    { at: { lake: { pier: 6, shallow: 4, stones: 3, mid: 2 } } }),
  fish('harius', 'Хариус', 1, 0.2, 1.9, 62, 1.3, {}, { maggot: 1.5, worm: 1.2, corn: 0.8 }, 1.4, { dawn: 1.4, dusk: 1.3, night: 0.6 },
    { shape: 'std', back: '#56646e', side: '#b9c1c6', belly: '#f0f1f0', fin: '#8f5aa6', pat: 'dots', patC: '#2b2f36', lenK: 37 },
    'Серебряный, с парусом-плавником. Живёт только в самой чистой и холодной воде — под водопадами.',
    { at: { lake: { falls: 7, stones: 2, mid: 1.5, shallow: 1 } } }),
  fish('sig', 'Сиг', 1, 0.3, 3.6, 56, 1.1, {}, { maggot: 1.4, worm: 1.0, corn: 0.9 }, 0.8, { dawn: 1.2, day: 1.1 },
    { shape: 'slim', back: '#5a7078', side: '#d3dadc', belly: '#f6f7f7', fin: '#7b8a90', pat: 'scales', lenK: 36 },
    'Ходит стаями над глубиной. Клюёт деликатно — подсекайте без промедления.',
    { at: { lake: { deep: 5, mid: 3.5, pit: 3 } } }),
  fish('nalim', 'Налим', 2, 0.4, 6.5, 205, 1.4, {}, { worm: 1.5, live: 1.5, maggot: 0.8 }, 0, { night: 2.3, dusk: 1.3, day: 0.25, dawn: 0.7 },
    { shape: 'cat', back: '#4a4630', side: '#7d7448', belly: '#e2dab4', fin: '#57512f', pat: 'marble', patC: '#2b2817', lenK: 46 },
    'Пятнистый ночной житель ямы. Днём лежит под камнями, а в темноте выходит на охоту.',
    { at: { lake: { pit: 5, deep: 4, stones: 3, pier: 1 } } }),
  fish('taimen', 'Таймень', 3, 3, 42, 1350, 2.1, {}, { live: 1.7, worm: 0.5 }, 1.8, { dawn: 1.6, dusk: 1.5, day: 0.7, night: 0.8 },
    { shape: 'slim', back: '#5a5f4a', side: '#b5a892', belly: '#f1e9da', fin: '#c0452e', pat: 'dots', patC: '#2a2a22', band: '#c9665a', lenK: 44 },
    'Красный хвост, пасть как у щуки, сила как у лосося. Выходит к водопадам на заре — и рвёт слабую леску.',
    { at: { lake: { falls: 3, pit: 2, deep: 1.5 } }, minDepth: 3 }),
  fish('zolforel', 'Золотая форель', 4, 0.8, 6.5, 5200, 1.7, {}, { maggot: 1.3, worm: 1.1 }, 1.5, { dawn: 1.9, dusk: 1.1 },
    { shape: 'std', back: '#c98a1c', side: '#f2c544', belly: '#fff0b8', fin: '#e0661c', pat: 'dots', patC: '#7a3a10', band: '#e8502a', lenK: 38 },
    'Легенда Соснового озера. Говорят, на рассвете она поднимается к самой струе водопада — и сияет, как монета.',
    { at: { lake: { falls: 1.3 } } }),
  fish('osetr', 'Осётр-великан', 3, 12, 160, 4800, 2.1, {}, { worm: 1.3, bloodworm: 1.4, live: 1.1 }, 0.3, { night: 1.4, dawn: 1.2, day: 0.7 },
    { shape: 'sturgeon', back: '#4b4e45', side: '#87877a', belly: '#ebe5cf', fin: '#54564b', pat: 'none', patC: '#dcd6bd', lenK: 52 },
    'Древняя рыба в костяных щитках, старше самого озера. Лежит на дне ямы, ночью берёт червя — и тащит лодку за собой, как буксир.',
    { at: { lake: { pit: 1.3, deep: 0.6 } }, giant: true, minDepth: 8 }),

  // ── Коралловые островки ──
  fish('klown', 'Рыба-клоун', 0, 0.02, 0.14, 30, 0.5, {}, { bloodworm: 1.5, shrimp: 1.3, maggot: 1.2, bread: 0.8 }, 0, null,
    { shape: 'std', back: '#e8641c', side: '#ff8a2a', belly: '#ffb25a', fin: '#f0701c', pat: 'clown', patC: '#ffffff', lenK: 30 },
    'Оранжевая, в трёх белых поясах. Живёт среди щупалец актинии и от дома далеко не отходит.',
    { at: { keys: { garden: 6, pier: 2.5, shallow: 1 } } }),
  fish('serzhant', 'Сержант', 0, 0.05, 0.32, 24, 0.7, {}, { bread: 1.4, maggot: 1.3, bloodworm: 1.3, shrimp: 1.1, worm: 1.0 }, 0, null,
    { shape: 'tall', back: '#c9c23a', side: '#dfe6e2', belly: '#f5f7f4', fin: '#3a4650', pat: 'bars', patC: '#1c2530', lenK: 29 },
    'Пять чёрных полос, как нашивки. Стайка сержантов встречает у причала каждого, кто бросит в воду хлеб.',
    { at: { keys: { pier: 6, shallow: 4, garden: 3, mid: 2, backwater: 2 } } }),
  fish('babochka', 'Рыба-бабочка', 0, 0.06, 0.4, 38, 0.7, {}, { bloodworm: 1.5, shrimp: 1.4, maggot: 1.0 }, 0, null,
    { shape: 'disc', back: '#f2c81e', side: '#fbe36a', belly: '#fff6c8', fin: '#f2b61e', pat: 'mask', patC: '#14181c', lenK: 26 },
    'Жёлтый диск с чёрной маской на глазах. Порхает над кораллами парами и берёт только мелкую наживку.',
    { at: { keys: { garden: 6, pier: 1.5, backwater: 1 } } }),
  fish('hirurg', 'Синий хирург', 0, 0.1, 0.7, 44, 0.9, {}, { bread: 1.3, bloodworm: 1.2, corn: 1.1, shrimp: 1.0 }, 0, null,
    { shape: 'disc', back: '#1d4fd0', side: '#2c6cf0', belly: '#5a8ff5', fin: '#f5d21e', pat: 'palette', patC: '#0b1640', lenK: 28 },
    'Синий, с жёлтым хвостом и чёрным росчерком по боку. У хвоста — шип острее скальпеля: берите подсачеком.',
    { at: { keys: { garden: 5, mid: 3, edge: 1.5, shallow: 1 } } }),
  fish('popugai', 'Рыба-попугай', 1, 0.4, 5, 92, 1.2, {}, { shrimp: 1.4, crab: 1.3, bread: 1.2, corn: 1.1 }, 0, { day: 1.2, night: 0.5 },
    { shape: 'carp', back: '#1fae9a', side: '#3fd0b0', belly: '#f59ac0', fin: '#f070a8', pat: 'parrot', patC: '#f5d04a', lenK: 30 },
    'Бирюзовая, с розовым брюхом и клювом, которым грызёт кораллы. Белый песок островков — её работа.',
    { at: { keys: { garden: 6, shallow: 2.5, edge: 2, mid: 1 } } }),
  fish('lucian', 'Луциан', 1, 0.3, 4.2, 105, 1.3, {}, { shrimp: 1.5, squid: 1.3, live: 1.2, worm: 0.8 }, 1.1, { dusk: 1.3, night: 1.2 },
    { shape: 'std', back: '#c8402c', side: '#f0705a', belly: '#fbd0c0', fin: '#f2c21e', pat: 'scales', lenK: 33 },
    'Красный, с жёлтыми плавниками. Ходит стаями по протоке и под аркой, после заката смелеет.',
    { at: { keys: { channel: 5, garden: 3, arch: 3, edge: 3, pier: 1 } } }),
  fish('krylatka', 'Крылатка', 1, 0.2, 1.5, 130, 1.0, {}, { shrimp: 1.5, live: 1.5, bloodworm: 0.9 }, 0.8, { night: 1.7, dusk: 1.5, day: 0.6 },
    { shape: 'lion', back: '#8a2a1c', side: '#e8d9c8', belly: '#f6efe6', fin: '#b0402c', pat: 'zebra', patC: '#8a2a1c', lenK: 30 },
    'Полосатая, в веере ядовитых лучей. Днём висит под кораллом, на охоту выходит в сумерках.',
    { at: { keys: { garden: 3.5, arch: 3, pier: 1.2, edge: 1 } } }),
  fish('barrakuda', 'Барракуда', 2, 1.5, 19, 330, 1.8, {}, { live: 1.8, squid: 1.1 }, 1.8, { dawn: 1.4, dusk: 1.3 },
    { shape: 'pike', back: '#4a5a66', side: '#c5cfd4', belly: '#f4f6f6', fin: '#3d4852', pat: 'tiger', patC: '#2c3640', lenK: 50 },
    'Серебряная торпеда с пастью, полной зубов. Стоит в протоке и бьёт блесну с разгона.',
    { at: { keys: { channel: 5, edge: 4, sea: 2, mid: 1, arch: 1 } }, minDepth: 3 }),
  fish('karanks', 'Каранкс', 2, 1.2, 16, 345, 1.75, {}, { live: 1.6, squid: 1.3, shrimp: 1.1 }, 2.0, { dawn: 1.5, dusk: 1.4 },
    { shape: 'jack', back: '#5a6a78', side: '#cfd6da', belly: '#f6f7f5', fin: '#2c3640', pat: 'none', lenK: 33 },
    'Лобастый силач края рифа. Гонит малька к самой поверхности — на поппер берёт так, что удилище гнётся в дугу.',
    { at: { keys: { edge: 5, channel: 3, sea: 3, arch: 1 } }, minDepth: 4 }),
  fish('murena', 'Мурена', 2, 0.8, 10, 320, 1.6, {}, { squid: 1.7, live: 1.4, crab: 1.3, shrimp: 1.2 }, 0, { night: 2.1, dusk: 1.4, day: 0.35, dawn: 0.7 },
    { shape: 'eel', back: '#5a4a22', side: '#8a742e', belly: '#d9c98a', fin: '#5a4a22', pat: 'spots', patC: '#f0d04a', lenK: 72 },
    'Пятнистая хозяйка расщелин под аркой. Днём из норы торчит одна голова, ночью выходит вся.',
    { at: { keys: { arch: 5, edge: 2.5, garden: 2, pier: 0.6 } } }),
  fish('napoleon', 'Рыба-наполеон', 3, 8, 65, 2200, 2.1, {}, { crab: 2.0, squid: 1.5, live: 1.3, shrimp: 0.8 }, 0.7, { dusk: 1.5, dawn: 1.3 },
    { shape: 'grouper', back: '#1f6a7a', side: '#3aa0a0', belly: '#a8d8c8', fin: '#2a7a8a', pat: 'marble', patC: '#16485a', lenK: 30 },
    'Губастый великан с шишкой на лбу. Поднимается из синевы к краю рифа и под арку — за крабом.',
    { at: { keys: { edge: 2.6, arch: 2.2, channel: 0.8 } }, minDepth: 5 }),
  fish('imperator', 'Императорский ангел', 4, 0.4, 3.2, 5000, 1.4, {}, { shrimp: 1.5, bloodworm: 1.4, crab: 1.2 }, 0, { dawn: 1.9, dusk: 1.2 },
    { shape: 'disc', back: '#16306a', side: '#1f4fb0', belly: '#f2c81e', fin: '#f2c81e', pat: 'lines', patC: '#f5d21e', lenK: 27 },
    'Легенда островков: синий, в золотых струнах. Говорят, на рассвете он обходит свой коралловый сад — и берёт у того, кто пришёл раньше солнца.',
    { at: { keys: { garden: 1.3, arch: 0.6 } } }),
  fish('rifakula', 'Рифовая акула', 3, 15, 95, 3600, 2.0, {}, { live: 1.6, squid: 1.6, crab: 1.3, shrimp: 0.6 }, 1.3, { dusk: 1.4, night: 1.3, day: 0.8 },
    { shape: 'shark', back: '#5f6b70', side: '#8d989c', belly: '#f1f3f2', fin: '#2a3034', pat: 'none', lenK: 47 },
    'Серая, с чёрными кончиками плавников. Патрулирует край рифа, а к вечеру заходит в протоки — за всем, что трепещет на крючке.',
    { at: { keys: { edge: 1.4, channel: 0.5, sea: 0.6 } }, giant: true, minDepth: 5 }),

  // ── Синий простор ──
  fish('letuchaya', 'Летучая рыба', 0, 0.08, 0.45, 34, 0.6, {}, { shrimp: 1.4, bread: 1.1, maggot: 1.0, bloodworm: 0.9 }, 0.6, { day: 1.2, night: 0.7 },
    { shape: 'wing', back: '#1d4f8f', side: '#9cc0e0', belly: '#f2f6f9', fin: '#8ab8e8', pat: 'none', lenK: 52 },
    'Синяя спинка и плавники-крылья: удирая от корифены, пролетает над волнами по сотне метров. Держится под водорослями Течения.',
    { at: { blue: { current: 6, sea: 3, mid: 2, pier: 1.5, shallow: 1 } } }),
  fish('korifena', 'Корифена', 1, 2, 24, 140, 1.6, {}, { live: 1.5, squid: 1.3, shrimp: 1.0 }, 1.7, { day: 1.2, night: 0.6 },
    { shape: 'mahi', back: '#1fa36a', side: '#e8d63a', belly: '#f6ec9a', fin: '#2a8fd0', pat: 'dots', patC: '#2a7fd0', lenK: 44 },
    'Золотисто-зелёная, с крутым лбом и плавником во всю спину. Ходит под плавучими водорослями и прыгает, как сумасшедшая.',
    { at: { blue: { current: 6, sea: 3, bank: 2, deep: 1 } }, minDepth: 6 }),
  fish('vahu', 'Ваху', 2, 5, 55, 520, 1.9, {}, { live: 1.6, squid: 1.2 }, 2.0, { dawn: 1.4, dusk: 1.3 },
    { shape: 'slim', back: '#1f3f6a', side: '#8fb0c8', belly: '#eef2f4', fin: '#1f3f6a', pat: 'tiger', patC: '#2a4f7a', lenK: 54 },
    'Узкая, полосатая, с зубастым клювом. Самая быстрая рыба Банки: блесну догоняет так, что катушка воет.',
    { at: { blue: { bank: 5, current: 3, sea: 2, deep: 1 } }, minDepth: 8 }),
  fish('zheltoper', 'Желтопёрый тунец', 2, 8, 110, 620, 2.0, {}, { live: 1.5, squid: 1.5, shrimp: 0.6 }, 1.7, { dawn: 1.3, day: 1.1 },
    { shape: 'tuna', back: '#1b3a6b', side: '#b8c6d4', belly: '#f2f4f6', fin: '#f2c81e', pat: 'none', band: '#f2c81e', lenK: 37 },
    'Тунец с золотой полосой и длинными жёлтыми плавниками. Стаей стоит над Банкой и рвёт поверхность, когда гонит малька.',
    { at: { blue: { bank: 6, sea: 3, current: 2 } }, minDepth: 8 }),
  fish('parusnik', 'Парусник', 3, 20, 95, 6200, 2.2, {}, { live: 1.7, squid: 1.3 }, 1.9, { dawn: 1.3, day: 1.1 },
    { shape: 'sail', back: '#1d2f6a', side: '#6f8fc0', belly: '#eef2f6', fin: '#2a4fa0', pat: 'bars', patC: '#7fb0e8', lenK: 60 },
    'Синий спинной плавник-парус выше роста рыбака. Загоняет косяк вдоль Течения, а на крючке ходит свечами одна за другой.',
    { at: { blue: { current: 1.4, sea: 0.6 } }, giant: true, minDepth: 15 }),
  fish('marlin', 'Синий марлин', 3, 80, 560, 15000, 2.5, {}, { live: 1.7, squid: 1.5 }, 1.9, { day: 1.2 },
    { shape: 'marlin', back: '#122a5c', side: '#5f86c0', belly: '#eef2f6', fin: '#1a3a7a', pat: 'bars', patC: '#8fb8ef', lenK: 55 },
    'Король океана: копьё вместо носа и полосы, вспыхивающие синим в азарте охоты. Бьётся часами — недаром о нём пишут книги.',
    { at: { blue: { current: 1.0, sea: 0.9 } }, giant: true, minDepth: 20 }),
  fish('gigantun', 'Тунец-гигант', 3, 150, 620, 17000, 2.5, {}, { live: 1.6, squid: 1.8 }, 1.5, { dawn: 1.3, dusk: 1.2 },
    { shape: 'tuna', back: '#0f2a55', side: '#9fb0c4', belly: '#eef1f4', fin: '#e8c62a', pat: 'none', lenK: 40 },
    'Синеперый великан весом с лодку. Поднимается к Банке за скумбрией — и уходит в глубину так, что леска поёт.',
    { at: { blue: { bank: 0.9, sea: 0.5 } }, giant: true, minDepth: 10 }),
  fish('belakula', 'Белая акула', 4, 400, 1500, 60000, 2.7, {}, { squid: 1.6, live: 1.4, crab: 1.0 }, 0.8, { dawn: 1.5, dusk: 1.5, night: 0.8 },
    { shape: 'shark', back: '#56606a', side: '#8c96a0', belly: '#f4f5f4', fin: '#4a535c', pat: 'none', lenK: 45 },
    'Легенда Синего простора. На рассвете и в сумерках поднимается к Тюленьим камням — смотрители маяка видели её плавник выше человеческого роста.',
    { at: { blue: { reef: 0.7, sea: 0.25 } }, giant: true, minDepth: 12 })
];
// рыба бухты, которая живёт и в озере: свои места там
const AT_LAKE = {
  plotva: { backwater: 5, shallow: 5, pier: 3, mid: 2 },
  okun: { pier: 5, stones: 5, shallow: 2, backwater: 2, mid: 1 },
  karas: { backwater: 6, shallow: 1 },
  lesh: { backwater: 4, mid: 3, deep: 2 },
  shuka: { backwater: 5, stones: 2.5, shallow: 2, mid: 1 },
  forel: { falls: 8, stones: 1, mid: 1 },
  sudak: { deep: 5, pit: 3.5, mid: 2 },
  som: { pit: 2, backwater: 2, deep: 1.5 }
};
for (const f of FISH) if (AT_LAKE[f.id]) f.at = { ...(f.at || {}), lake: AT_LAKE[f.id] };
// рыба бухты, которая живёт и у коралловых островков
const AT_KEYS = {
  kefal: { backwater: 5, shallow: 4, mid: 2 },
  stavrida: { sea: 5, mid: 4, channel: 3, edge: 2 },
  kambala: { mid: 3, backwater: 2, channel: 2 },
  skumbria: { sea: 7, edge: 3, channel: 1.5 },
  sargan: { mid: 5, backwater: 3, shallow: 2, channel: 2 },
  morokun: { arch: 3, edge: 3, garden: 1 },
  dorado: { garden: 3, mid: 2, edge: 2 },
  tunec: { sea: 6, edge: 1.5 },
  skat: { channel: 3, sea: 2, edge: 1, mid: 0.8 },
  mech: { sea: 1.6, edge: 0.3 }
};
for (const f of FISH) if (AT_KEYS[f.id]) f.at = { ...(f.at || {}), keys: AT_KEYS[f.id] };
// рыба, которая живёт и в «Синем просторе»: у причала и скал острова, на свале, в океане
const AT_BLUE = {
  bychok: { pier: 5, shallow: 4, backwater: 3 },
  stavrida: { pier: 4, mid: 5, deep: 4, sea: 4 },
  skumbria: { deep: 4, sea: 5, bank: 4, current: 3 },
  sargan: { mid: 3, current: 3, shallow: 2 },
  morokun: { reef: 5, deep: 3, shallow: 2, backwater: 1 },
  sibas: { shallow: 3, reef: 3, deep: 3, pier: 2, backwater: 2 },
  tunec: { bank: 3, sea: 3, current: 1.5 },
  mech: { sea: 1.2, current: 0.8 },
  mako: { sea: 0.8, current: 0.5, bank: 0.3 }
};
for (const f of FISH) if (AT_BLUE[f.id]) f.at = { ...(f.at || {}), blue: AT_BLUE[f.id] };
// Наживки этапа 22: кому они по вкусу (остальная рыба берёт на незнакомую наживку неохотно — 0,3, см. speciesWeights)
const BAIT_EXTRA = {
  bloodworm: { ersh: 1.7, plotva: 1.5, lesh: 1.5, karas: 1.3, okun: 1.3, bychok: 1.3, sig: 1.1, harius: 1.0, nalim: 0.9 },
  fly: { harius: 1.8, forel: 1.7, zolforel: 1.6, sig: 1.4, losos: 1.4, plotva: 1.0, kefal: 0.9, taimen: 0.7 },
  crab: { starik: 2.2, mech: 2.0, skat: 2.0, tunec: 1.8, som: 1.4, ugor: 1.3, morokun: 1.2, dorado: 1.2, sibas: 1.1 }
};
for (const [bait, list] of Object.entries(BAIT_EXTRA)) for (const f of FISH) if (list[f.id]) f.baits[bait] = list[f.id];
/** Где и как охотно рыба берёт на локации: { зона: вес }. Пусто — на этой локации её нет. */
export const zonesOf = (f, loc = DEFAULT_LOC) => (loc === DEFAULT_LOC ? f.zones : (f.at && f.at[loc]) || NO_ZONES);
const NO_ZONES = Object.freeze({});
/** Рыба локации — в том же порядке, что в общем списке. */
export const fishOf = (loc = DEFAULT_LOC) => FISH.filter((f) => Object.keys(zonesOf(f, loc)).length > 0);
/** На каких локациях водится рыба: ['bay', 'lake', 'keys']. */
export const locsOf = (f) => [...(Object.keys(f.zones).length ? [DEFAULT_LOC] : []), ...Object.keys(f.at || {})];

// Манера при вываживании: у каждого вида своя. Подпись и совет видит игрок, правила — в shared/logic.js (STYLE_K).
export const FIGHT_STYLES = {
  plain: { name: 'Без затей', tip: 'Держите натяжение в норме' },
  runner: { name: 'Бегун', tip: 'Рывки длинные и частые — ведите против рывка' },
  jumper: { name: 'Прыгун', tip: 'Делает свечи: в прыжке ослабьте леску' },
  bulldog: { name: 'Тяжеловес', tip: 'Упирается: идёт, только пока леска внатяг' },
  thrash: { name: 'Трясун', tip: 'Мотает головой — не жмитесь к краю шкалы' },
  snag: { name: 'Хитрец', tip: 'Тянет в укрытие: не увели — заведёт леску за камни' },
  flat: { name: 'Присоска', tip: 'Залегает на дно — подорвите, держа стрелку в рамке' }
};
const STYLE_OF = {
  bychok: 'thrash', plotva: 'plain', karas: 'bulldog', stavrida: 'runner', okun: 'thrash', kefal: 'jumper',
  kambala: 'flat', skumbria: 'runner', lesh: 'bulldog', morokun: 'snag', sargan: 'jumper', karp: 'bulldog',
  shuka: 'jumper', sudak: 'plain', forel: 'jumper', dorado: 'runner', sibas: 'runner', ugor: 'snag',
  som: 'bulldog', tunec: 'runner', losos: 'jumper', skat: 'flat',
  mech: 'jumper', koi: 'snag', starik: 'bulldog',
  ersh: 'thrash', harius: 'jumper', sig: 'plain', nalim: 'snag', taimen: 'runner', zolforel: 'jumper',
  klown: 'thrash', serzhant: 'plain', babochka: 'plain', hirurg: 'thrash', popugai: 'bulldog', lucian: 'runner', krylatka: 'thrash',
  barrakuda: 'jumper', karanks: 'runner', murena: 'snag', napoleon: 'bulldog', imperator: 'snag',
  mako: 'jumper', osetr: 'bulldog', rifakula: 'runner',
  letuchaya: 'jumper', korifena: 'jumper', vahu: 'runner', zheltoper: 'runner', parusnik: 'jumper', marlin: 'jumper', gigantun: 'runner', belakula: 'bulldog'
};
for (const f of FISH) f.style = STYLE_OF[f.id] || 'plain';

export const FISH_BY_ID = Object.fromEntries(FISH.map((f) => [f.id, f]));

// хлам и находки: попадаются у берега вместо рыбы
export const JUNK = [
  { id: 'boot', name: 'Старый ботинок', price: 2, w: [0.4, 0.9], desc: 'Левый. Правый, говорят, поймали ещё в прошлом году.' },
  { id: 'can', name: 'Консервная банка', price: 1, w: [0.05, 0.12], desc: 'Шпроты. Были.' },
  { id: 'weed', name: 'Пучок водорослей', price: 1, w: [0.1, 0.5], desc: 'Тянул как карп. Оказался салат.' },
  { id: 'bottle', name: 'Бутылка с запиской', price: 60, w: [0.3, 0.5], desc: '«Кто нашёл — тому 60 монет у торговца».' },
  { id: 'chest', name: 'Сундучок', price: 450, w: [3, 6], desc: 'Кто-то уронил с лодки. Торговец даст хорошую цену.', rare: true }
];
export const JUNK_BY_ID = Object.fromEntries(JUNK.map((j) => [j.id, j]));

// ───── снасти ─────
// У дорогих удочек есть особенности (perk): night — во сколько раз чаще клюёт ночью; tough — как быстро леска копит
// износ в опасной зоне (меньше единицы — дольше держит); size — рыба попадается крупнее; rare — редкая рыба берёт
// охотнее. heavy — тяжёлый морской класс (под гигантов), myth — «чудо-класс» (без него к мифическим существам не подойти).
export const RODS = [
  { id: 'rod1', name: 'Стартовая', price: 0, cast: 16, line: 3, reel: 1.0, col: ['#1f3f8f', '#ffc928', '#2a2f3a', '#ffc928'], desc: 'Надёжная удочка на все случаи.' },
  { id: 'rod2', name: 'Рифовая', price: 450, cast: 24, line: 4.5, reel: 1.1, col: ['#2a3340', '#22d3ee', '#3b4656', '#22d3ee'], desc: 'Достаёт до камней. Первая серьёзная покупка.' },
  { id: 'rod3', name: 'Речной разведчик', price: 1600, cast: 32, line: 7, reel: 1.2, col: ['#3d4a2a', '#a3e635', '#c9a26b', '#84cc16'], desc: 'Пробковая рукоять, упругий бланк. Для щуки и карпа.' },
  { id: 'rod4', name: 'Глубокая синь', price: 5200, cast: 41, line: 10.5, reel: 1.32, col: ['#1d4ed8', '#e2e8f0', '#1e40af', '#60a5fa'], desc: 'Дальний заброс и мощная катушка — для глубины.' },
  { id: 'rod5', name: 'Закат Про', price: 12000, cast: 50, line: 15, reel: 1.45, col: ['#33343c', '#fb923c', '#27272a', '#f97316'], desc: 'Выбор тех, кто ходит за сибасом и лососем.' },
  { id: 'rod6', name: 'Повелитель приливов', price: 30000, cast: 60, line: 22, reel: 1.6, col: ['#5b21b6', '#fbbf24', '#3b0764', '#f59e0b'], desc: 'Достаёт до арки и держит рыбу-меч.' },
  { id: 'rod7', name: 'Полярная звезда', price: 70000, cast: 66, line: 30, reel: 1.72, col: ['#0f172a', '#67e8f9', '#1e293b', '#a5f3fc'], perk: { night: 1.25 }, desc: 'Для ночной рыбалки: в темноте клюёт на четверть чаще.' },
  { id: 'rod8', name: 'Морской волк', price: 160000, cast: 72, line: 42, reel: 1.84, col: ['#7f1d1d', '#f8fafc', '#450a0a', '#ef4444'], heavy: true, perk: { tough: 0.75 }, desc: 'Тяжёлый морской бланк. В опасной зоне леска держится на треть дольше.' },
  { id: 'rod9', name: 'Гроза глубин', price: 380000, cast: 79, line: 58, reel: 1.96, col: ['#064e3b', '#fbbf24', '#022c22', '#34d399'], heavy: true, perk: { size: 1.25, tough: 0.85 }, desc: 'Чует крупную рыбу: трофеи попадаются заметно чаще.' },
  { id: 'rod10', name: 'Легенда', price: 900000, cast: 86, line: 80, reel: 2.1, col: ['#f6c54a', '#ffffff', '#5b3a12', '#fde68a'], heavy: true, myth: true, perk: { night: 1.2, tough: 0.7, size: 1.2, rare: 1.3 }, desc: 'Удочка, о которой рассказывают у костра. Редкая рыба сама идёт на неё — днём и ночью.' }
];
export const LINES = [
  { id: 'line1', name: 'Монолеска', price: 0, mult: 1, col: '#e8f4ff', desc: 'Обычная леска из набора.' },
  { id: 'line2', name: 'Плетёнка', price: 320, mult: 1.2, col: '#fde047', desc: 'Прочность лески +20%.' },
  { id: 'line3', name: 'Флюорокарбон', price: 1700, mult: 1.45, col: '#a7f3d0', desc: 'Прочность лески +45%. Почти не видна в воде.' },
  { id: 'line4', name: 'Титановый шнур', price: 7500, mult: 1.7, col: '#cbd5e1', desc: 'Прочность лески +70%. Для великанов.' },
  { id: 'line5', name: 'Кевларовый шнур', price: 22000, mult: 2.0, col: '#f59e0b', desc: 'Прочность лески вдвое выше обычной.' },
  { id: 'line6', name: 'Морской шнур', price: 60000, mult: 2.35, col: '#38bdf8', desc: 'Прочность лески +135%. Такой держит акулу.' },
  { id: 'line7', name: 'Нить судьбы', price: 160000, mult: 2.75, col: '#e879f9', desc: 'Прочность лески +175%. Говорят, её ещё никто не порвал.' }
];
export const REELS = [
  { id: 'reel1', name: 'Простая катушка', price: 0, mult: 1, col: '#ffc928', desc: 'Крутит — и ладно.' },
  { id: 'reel2', name: 'Быстрая катушка', price: 380, mult: 1.15, col: '#22d3ee', desc: 'Скорость подмотки +15%.' },
  { id: 'reel3', name: 'Мультипликатор', price: 2400, mult: 1.3, col: '#f97316', desc: 'Скорость подмотки +30%, натяжение растёт плавнее.' },
  { id: 'reel4', name: 'Турбо', price: 9500, mult: 1.45, col: '#a855f7', desc: 'Скорость подмотки +45%, самый мягкий фрикцион.' },
  // smooth — насколько плавнее растёт натяжение (у первых четырёх считается по порядку: 1, 1,13, 1,26, 1,39)
  { id: 'reel5', name: 'Морской мультипликатор', price: 26000, mult: 1.6, smooth: 1.48, col: '#0ea5e9', desc: 'Скорость подмотки +60%. Создан для долгих заплывов.' },
  { id: 'reel6', name: 'Титан', price: 70000, mult: 1.78, smooth: 1.56, col: '#94a3b8', desc: 'Скорость подмотки +78%. Титановый корпус, фрикцион как шёлк.' },
  { id: 'reel7', name: 'Золотой ход', price: 190000, mult: 1.95, smooth: 1.64, col: '#f6c54a', desc: 'Скорость подмотки +95%. Лучшая катушка, какую делают.' }
];
export const HOOKS = [
  { id: 'hook1', name: 'Обычные крючки', price: 0, win: 1, hold: 1, desc: 'Из коробки со стартовым набором.' },
  { id: 'hook2', name: 'Острые крючки', price: 220, win: 1.3, hold: 0.8, desc: 'На подсечку больше времени, рыба сходит реже.' },
  { id: 'hook3', name: 'Тройник', price: 1300, win: 1.6, hold: 0.6, desc: 'Три жала: подсечь легко, сорваться трудно.' },
  { id: 'hook4', name: 'Кованые крючки', price: 4800, win: 2.0, hold: 0.4, desc: 'Ручная работа. Рыба почти не сходит.' },
  { id: 'hook5', name: 'Якорёк', price: 14000, win: 2.3, hold: 0.3, desc: 'Четыре жала: рыба садится сама, сход — редкость.' },
  { id: 'hook6', name: 'Алмазная заточка', price: 40000, win: 2.6, hold: 0.2, desc: 'Острее не бывает. Подсечь успеет и новичок.' }
];
export const FLOATS = [
  { id: 'float1', name: 'Классика', price: 0, win: 1, bite: 1, col: ['#ef4444', '#ffffff', '#111827'], desc: 'Красно-белый поплавок, знакомый с детства.' },
  { id: 'float2', name: 'Гусиное перо', price: 180, win: 1.2, bite: 1, col: ['#f8fafc', '#fb923c', '#1f2937'], desc: 'Чуткий: на подсечку больше времени.' },
  { id: 'float3', name: 'Светлячок', price: 750, win: 1.1, bite: 1, night: 1.25, glow: true, col: ['#a3e635', '#fef9c3', '#14532d'], desc: 'Светится в темноте. Ночью клюёт чаще.' },
  { id: 'float4', name: 'Чемпион', price: 2800, win: 1.25, bite: 1.12, col: ['#22d3ee', '#fde047', '#0f172a'], desc: 'Клюёт чаще, подсекать проще.' },
  { id: 'float5', name: 'Северное сияние', price: 9000, win: 1.3, bite: 1.15, night: 1.35, glow: true, col: ['#22d3ee', '#a78bfa', '#0f172a'], desc: 'Светится в темноте и манит рыбу: ночью клюёт на треть чаще.' },
  { id: 'float6', name: 'Золотой поплавок', price: 26000, win: 1.4, bite: 1.25, col: ['#f6c54a', '#fef3c7', '#78350f'], desc: 'Клюёт на четверть чаще, подсекать проще простого.' }
];
// наживка расходуется при каждой поклёвке; хлеб бесплатный и не кончается
export const BAITS = [
  { id: 'bread', name: 'Хлебный мякиш', price: 0, pack: 0, attract: 0.75, rare: 1, size: 1, desc: 'Бесплатно и без счёта. Мирная рыба его любит.' },
  { id: 'worm', name: 'Червь', price: 3, pack: 10, attract: 1.0, rare: 1, size: 1, desc: 'Универсальная наживка. Окунь от неё без ума.' },
  { id: 'maggot', name: 'Опарыш', price: 4, pack: 10, attract: 1.1, rare: 1, size: 1, desc: 'Клюёт чаще. Плотва, лещ и форель.' },
  { id: 'corn', name: 'Кукуруза', price: 5, pack: 10, attract: 1.0, rare: 1.1, size: 1.1, desc: 'Сладкая. Карп, карась и лещ.' },
  { id: 'shrimp', name: 'Креветка', price: 12, pack: 10, attract: 1.15, rare: 1.3, size: 1.1, desc: 'Морская рыба и риф. Редкая рыба берёт охотнее.' },
  { id: 'live', name: 'Живец', price: 28, pack: 5, attract: 0.8, rare: 1.7, size: 1.35, desc: 'Ждать дольше, зато приходит хищник — и крупный.' },
  { id: 'squid', name: 'Кальмар', price: 40, pack: 5, attract: 0.9, rare: 1.9, size: 1.45, desc: 'Для глубины и арки. На него выходят великаны.' },
  { id: 'bloodworm', name: 'Мотыль', price: 5, pack: 10, attract: 1.25, rare: 1, size: 1, desc: 'Пресноводная классика: ёрш, плотва и лещ берут не раздумывая.' },
  { id: 'fly', name: 'Мушка', price: 9, pack: 10, attract: 1.1, rare: 1.3, size: 1.05, desc: 'Для чистой горной воды: хариус, сиг и форель.' },
  { id: 'crab', name: 'Краб', price: 60, pack: 5, attract: 0.95, rare: 2.6, size: 1.7, desc: 'Лакомство для самых крупных — у рифа, арки и затонувшего корабля.' }
];
// приманки не расходуются, но теряются при обрыве лески; играть ими надо подмоткой
export const LURES = [
  { id: 'spoon', name: 'Блесна-колебалка', price: 260, power: 1.0, rare: 1.2, size: 1.1, col: ['#d9dee6', '#ef4444'], desc: 'Простая и уловистая. Подматывайте — хищник догонит.' },
  { id: 'spinner', name: 'Вертушка', price: 700, power: 1.25, rare: 1.35, size: 1.15, col: ['#fbbf24', '#1f2937'], desc: 'Лепесток играет на медленной подмотке.' },
  { id: 'wobbler', name: 'Воблер', price: 1900, power: 1.5, rare: 1.5, size: 1.25, col: ['#22c55e', '#f97316'], desc: 'Похож на малька. Щука и судак не пройдут мимо.' },
  { id: 'jig', name: 'Джиг', price: 4200, power: 1.7, rare: 1.7, size: 1.35, col: ['#a855f7', '#fde047'], desc: 'Работает у дна на глубине.' },
  { id: 'goldspoon', name: 'Золотая блесна', price: 12000, power: 2.0, rare: 2.2, size: 1.5, col: ['#fbbf24', '#fde68a'], desc: 'На неё выходят только те, о ком рассказывают истории.' },
  { id: 'popper', name: 'Поппер', price: 30000, power: 2.25, rare: 2.5, size: 1.6, col: ['#ef4444', '#fde047'], desc: 'Шумит и брызгает по поверхности — крупный хищник не выдерживает.' },
  { id: 'legendlure', name: 'Блесна мастера', price: 80000, power: 2.5, rare: 2.9, size: 1.75, col: ['#e879f9', '#f6c54a'], desc: 'Ручная работа старого мастера. На неё выходят великаны.' }
];
export const BAGS = [
  { id: 'bag1', name: 'Садок', price: 0, cap: 8, desc: 'Помещается 8 рыб.' },
  { id: 'bag2', name: 'Ведро', price: 280, cap: 14, desc: 'Помещается 14 рыб.' },
  { id: 'bag3', name: 'Кулер', price: 1400, cap: 22, desc: 'Помещается 22 рыбы.' },
  { id: 'bag4', name: 'Большой кулер', price: 5500, cap: 34, desc: 'Помещается 34 рыбы.' },
  { id: 'bag5', name: 'Рыбацкий ящик', price: 16000, cap: 50, desc: 'Помещается 50 рыб — можно не ходить на рынок полдня.' },
  { id: 'bag6', name: 'Трюм', price: 45000, cap: 80, desc: 'Помещается 80 рыб — целая лодка улова.' },
  { id: 'bag7', name: 'Рефрижератор', price: 120000, cap: 130, desc: 'Помещается 130 рыб. На рынок — раз в день.' }
];
export const EXTRAS = [
  { id: 'net', name: 'Подсачек', price: 900, desc: 'Рыбу можно брать, когда вываживание дошло до 85%.' },
  { id: 'sonar', name: 'Эхолот', price: 3000, desc: 'Показывает на карте косяки рыбы, а у точки заброса — активность клёва.' },
  { id: 'boat', name: 'Своя лодка', price: 4500, desc: 'Выходы в море без платы за прокат, и сдавать лодку не нужно. На носу — вымпел вашего цвета.' },
  { id: 'lantern', name: 'Фонарь рыбака', price: 12000, desc: 'Свет приманивает рыбу: ночью клюёт на 20% чаще. Складывается со светящимся поплавком.' },
  { id: 'sonar2', name: 'Эхолот-профи', price: 28000, desc: 'Всё, что умеет эхолот, и главное — у точки заброса видно, кто здесь сейчас клюёт.' },
  { id: 'belt', name: 'Пояс рыболова', price: 35000, desc: 'Упор для удилища: натяжение растёт плавнее, рывки переносить легче.' },
  { id: 'bignet', name: 'Большой подсак', price: 60000, desc: 'Рыбу можно брать, когда вываживание дошло до 75% (обычный подсачек — с 85%).' },
  { id: 'gaff', name: 'Багор', price: 25000, desc: 'Гиганта в подсак не взять. С багром его берут у борта, когда вываживание дошло до 90%, — без багра тянут до конца.' }
];

export const CATS = [
  { key: 'rod', name: 'Удочки', items: RODS, slot: 'rod' },
  { key: 'tackle', name: 'Наживка', items: BAITS, slot: 'tackle', count: true },
  { key: 'lure', name: 'Приманки', items: LURES, slot: 'tackle', count: true },
  { key: 'reel', name: 'Катушки', items: REELS, slot: 'reel' },
  { key: 'line', name: 'Леска', items: LINES, slot: 'line' },
  { key: 'hook', name: 'Крючки', items: HOOKS, slot: 'hook' },
  { key: 'float', name: 'Поплавки', items: FLOATS, slot: 'float' },
  { key: 'bag', name: 'Садки', items: BAGS, slot: 'bag' },
  { key: 'extra', name: 'Разное', items: EXTRAS, slot: null }
];
export const ITEMS = {};
for (const c of CATS) for (const it of c.items) ITEMS[it.id] = { ...it, cat: c.key, slot: c.slot, count: !!c.count };
export const isLure = (id) => !!ITEMS[id] && ITEMS[id].cat === 'lure';
export const isBait = (id) => !!ITEMS[id] && ITEMS[id].cat === 'tackle';

// ───── часы бухты: игровые сутки идут 48 минут, ночь короче дня ─────
export const DAY_REAL_SEC = 48 * 60;
const DAY_SHARE = 0.78; // доля реального времени на светлую часть (5:00–21:00)
export function clockHours(tSec, startHour = 8) {
  // обратное к realFromHour: светлые 16 часов занимают 78% цикла
  const off = realFromHour(startHour);
  let u = ((tSec / DAY_REAL_SEC + off) % 1 + 1) % 1;
  if (u < DAY_SHARE) return 5 + (u / DAY_SHARE) * 16;
  return (21 + ((u - DAY_SHARE) / (1 - DAY_SHARE)) * 8) % 24;
}
function realFromHour(h) {
  h = ((h % 24) + 24) % 24;
  if (h >= 5 && h < 21) return ((h - 5) / 16) * DAY_SHARE;
  const n = h >= 21 ? h - 21 : h + 3;
  return DAY_SHARE + (n / 8) * (1 - DAY_SHARE);
}
export function dayPart(h) {
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 18) return 'day';
  if (h >= 18 && h < 21) return 'dusk';
  return 'night';
}
export const fmtClock = (h) => {
  const hh = Math.floor(h) % 24;
  const mm = Math.floor((h - Math.floor(h)) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

export const MAX_PLAYERS = 8;
export const MARKET_PERIOD = 600; // секунд: раз в 10 минут рынок меняет цены
export const fmtKg = (w) => (w >= 10 ? w.toFixed(1) : w >= 1 ? w.toFixed(2) : w.toFixed(3)).replace('.', ',') + ' кг';
export const fmtW = (w) => (w < 1 ? Math.round(w * 1000) + ' г' : (w >= 10 ? w.toFixed(1) : w.toFixed(2)).replace('.', ',') + ' кг');
export const fmtCoins = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
