// РЫБАК — игровые данные: рыба, снасти, зоны бухты. Общие для браузера, сервера и тестов.

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
  wreck: { name: 'Затонувший корабль', hint: 'Отмель с кораблём на северо-западе', act: 0.85 }
};

export const DAY_PARTS = { dawn: 'Рассвет', day: 'День', dusk: 'Закат', night: 'Ночь' };

const fish = (id, name, rar, wMin, wMax, price, str, zones, baits, lure, time, look, desc, extra = {}) => ({
  id, name, rar, w: [wMin, wMax], price, str, zones, baits, lure, time: time || {}, look, desc, ...extra
});

// price — монет за рыбу среднего размера; str — характер при вываживании
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
    'Старожил арки. Смотрители маяка рассказывают о нём уже сорок лет — а кто-то видел его в трюме затонувшего корабля.')
];
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
export const RODS = [
  { id: 'rod1', name: 'Стартовая', price: 0, cast: 16, line: 3, reel: 1.0, col: ['#1f3f8f', '#ffc928', '#2a2f3a', '#ffc928'], desc: 'Надёжная удочка на все случаи.' },
  { id: 'rod2', name: 'Рифовая', price: 450, cast: 24, line: 4.5, reel: 1.1, col: ['#2a3340', '#22d3ee', '#3b4656', '#22d3ee'], desc: 'Достаёт до камней. Первая серьёзная покупка.' },
  { id: 'rod3', name: 'Речной разведчик', price: 1600, cast: 32, line: 7, reel: 1.2, col: ['#3d4a2a', '#a3e635', '#c9a26b', '#84cc16'], desc: 'Пробковая рукоять, упругий бланк. Для щуки и карпа.' },
  { id: 'rod4', name: 'Глубокая синь', price: 5200, cast: 41, line: 10.5, reel: 1.32, col: ['#1d4ed8', '#e2e8f0', '#1e40af', '#60a5fa'], desc: 'Дальний заброс и мощная катушка — для глубины.' },
  { id: 'rod5', name: 'Закат Про', price: 12000, cast: 50, line: 15, reel: 1.45, col: ['#33343c', '#fb923c', '#27272a', '#f97316'], desc: 'Выбор тех, кто ходит за сибасом и лососем.' },
  { id: 'rod6', name: 'Повелитель приливов', price: 30000, cast: 60, line: 22, reel: 1.6, col: ['#5b21b6', '#fbbf24', '#3b0764', '#f59e0b'], desc: 'Достаёт до арки и держит рыбу-меч.' }
];
export const LINES = [
  { id: 'line1', name: 'Монолеска', price: 0, mult: 1, col: '#e8f4ff', desc: 'Обычная леска из набора.' },
  { id: 'line2', name: 'Плетёнка', price: 320, mult: 1.2, col: '#fde047', desc: 'Прочность лески +20%.' },
  { id: 'line3', name: 'Флюорокарбон', price: 1700, mult: 1.45, col: '#a7f3d0', desc: 'Прочность лески +45%. Почти не видна в воде.' },
  { id: 'line4', name: 'Титановый шнур', price: 7500, mult: 1.7, col: '#cbd5e1', desc: 'Прочность лески +70%. Для великанов.' }
];
export const REELS = [
  { id: 'reel1', name: 'Простая катушка', price: 0, mult: 1, col: '#ffc928', desc: 'Крутит — и ладно.' },
  { id: 'reel2', name: 'Быстрая катушка', price: 380, mult: 1.15, col: '#22d3ee', desc: 'Скорость подмотки +15%.' },
  { id: 'reel3', name: 'Мультипликатор', price: 2400, mult: 1.3, col: '#f97316', desc: 'Скорость подмотки +30%, натяжение растёт плавнее.' },
  { id: 'reel4', name: 'Турбо', price: 9500, mult: 1.45, col: '#a855f7', desc: 'Скорость подмотки +45%, самый мягкий фрикцион.' }
];
export const HOOKS = [
  { id: 'hook1', name: 'Обычные крючки', price: 0, win: 1, hold: 1, desc: 'Из коробки со стартовым набором.' },
  { id: 'hook2', name: 'Острые крючки', price: 220, win: 1.3, hold: 0.8, desc: 'На подсечку больше времени, рыба сходит реже.' },
  { id: 'hook3', name: 'Тройник', price: 1300, win: 1.6, hold: 0.6, desc: 'Три жала: подсечь легко, сорваться трудно.' },
  { id: 'hook4', name: 'Кованые крючки', price: 4800, win: 2.0, hold: 0.4, desc: 'Ручная работа. Рыба почти не сходит.' }
];
export const FLOATS = [
  { id: 'float1', name: 'Классика', price: 0, win: 1, bite: 1, col: ['#ef4444', '#ffffff', '#111827'], desc: 'Красно-белый поплавок, знакомый с детства.' },
  { id: 'float2', name: 'Гусиное перо', price: 180, win: 1.2, bite: 1, col: ['#f8fafc', '#fb923c', '#1f2937'], desc: 'Чуткий: на подсечку больше времени.' },
  { id: 'float3', name: 'Светлячок', price: 750, win: 1.1, bite: 1, night: 1.25, glow: true, col: ['#a3e635', '#fef9c3', '#14532d'], desc: 'Светится в темноте. Ночью клюёт чаще.' },
  { id: 'float4', name: 'Чемпион', price: 2800, win: 1.25, bite: 1.12, col: ['#22d3ee', '#fde047', '#0f172a'], desc: 'Клюёт чаще, подсекать проще.' }
];
// наживка расходуется при каждой поклёвке; хлеб бесплатный и не кончается
export const BAITS = [
  { id: 'bread', name: 'Хлебный мякиш', price: 0, pack: 0, attract: 0.75, rare: 1, size: 1, desc: 'Бесплатно и без счёта. Мирная рыба его любит.' },
  { id: 'worm', name: 'Червь', price: 3, pack: 10, attract: 1.0, rare: 1, size: 1, desc: 'Универсальная наживка. Окунь от неё без ума.' },
  { id: 'maggot', name: 'Опарыш', price: 4, pack: 10, attract: 1.1, rare: 1, size: 1, desc: 'Клюёт чаще. Плотва, лещ и форель.' },
  { id: 'corn', name: 'Кукуруза', price: 5, pack: 10, attract: 1.0, rare: 1.1, size: 1.1, desc: 'Сладкая. Карп, карась и лещ.' },
  { id: 'shrimp', name: 'Креветка', price: 12, pack: 10, attract: 1.15, rare: 1.3, size: 1.1, desc: 'Морская рыба и риф. Редкая рыба берёт охотнее.' },
  { id: 'live', name: 'Живец', price: 28, pack: 5, attract: 0.8, rare: 1.7, size: 1.35, desc: 'Ждать дольше, зато приходит хищник — и крупный.' },
  { id: 'squid', name: 'Кальмар', price: 40, pack: 5, attract: 0.9, rare: 1.9, size: 1.45, desc: 'Для глубины и арки. На него выходят великаны.' }
];
// приманки не расходуются, но теряются при обрыве лески; играть ими надо подмоткой
export const LURES = [
  { id: 'spoon', name: 'Блесна-колебалка', price: 260, power: 1.0, rare: 1.2, size: 1.1, col: ['#d9dee6', '#ef4444'], desc: 'Простая и уловистая. Подматывайте — хищник догонит.' },
  { id: 'spinner', name: 'Вертушка', price: 700, power: 1.25, rare: 1.35, size: 1.15, col: ['#fbbf24', '#1f2937'], desc: 'Лепесток играет на медленной подмотке.' },
  { id: 'wobbler', name: 'Воблер', price: 1900, power: 1.5, rare: 1.5, size: 1.25, col: ['#22c55e', '#f97316'], desc: 'Похож на малька. Щука и судак не пройдут мимо.' },
  { id: 'jig', name: 'Джиг', price: 4200, power: 1.7, rare: 1.7, size: 1.35, col: ['#a855f7', '#fde047'], desc: 'Работает у дна на глубине.' },
  { id: 'goldspoon', name: 'Золотая блесна', price: 12000, power: 2.0, rare: 2.2, size: 1.5, col: ['#fbbf24', '#fde68a'], desc: 'На неё выходят только те, о ком рассказывают истории.' }
];
export const BAGS = [
  { id: 'bag1', name: 'Садок', price: 0, cap: 8, desc: 'Помещается 8 рыб.' },
  { id: 'bag2', name: 'Ведро', price: 280, cap: 14, desc: 'Помещается 14 рыб.' },
  { id: 'bag3', name: 'Кулер', price: 1400, cap: 22, desc: 'Помещается 22 рыбы.' },
  { id: 'bag4', name: 'Большой кулер', price: 5500, cap: 34, desc: 'Помещается 34 рыбы.' },
  { id: 'bag5', name: 'Рыбацкий ящик', price: 16000, cap: 50, desc: 'Помещается 50 рыб — можно не ходить на рынок полдня.' }
];
export const EXTRAS = [
  { id: 'net', name: 'Подсачек', price: 900, desc: 'Рыбу можно брать, когда вываживание дошло до 85%.' },
  { id: 'sonar', name: 'Эхолот', price: 3000, desc: 'Показывает на карте косяки рыбы, а у точки заброса — активность клёва.' }
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
