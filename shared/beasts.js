// Чудища и киты: их ловят только вдвоём и больше. Общий бой ведёт сервер (server/beast.js), чтобы все видели одно и то же.
//
// У каждого существа своя локация, своё логово (зона ловли), своё время и погода и своя особая приманка.
// Приманку бросают в логово; одному её не бросить — рядом должен быть второй рыбак. Существо берёт приманку,
// за BITE_WINDOW секунд второй должен забросить рядом и тоже подсечь: одна леска его не держит.
// Дальше — общая шкала сил: каждый вываживает свою леску, а существо бросается то на одного, то на другого.
// В конце двое одновременно берут его багром: общий снимок, трофей каждому, существо уходит.

/** when: часы суток [от, до) (может переходить через полночь) — или погода wx (fog, rain, storm). Подходит любое. */
export const BEASTS = {
  nessie: {
    id: 'nessie', name: 'Несси', loc: 'lake', zone: 'pit', bait: 'nessiebait', model: 'beast-nessie',
    when: { hours: [4, 8.5], wx: ['fog'] }, whenText: 'на рассвете или в тумане', place: 'Яма',
    len: 11, kg: 2400, power: 1.25, hp: 95, coins: 60000, xp: 9000,
    clue: 'Говорят, на рассвете над Ямой поднимаются пузыри, а в тумане видна длинная шея.'
  },
  kraken: {
    id: 'kraken', name: 'Кракен', loc: 'blue', zone: 'sea', bait: 'krakenbait', model: 'beast-kraken',
    when: { hours: [21.5, 4.5], wx: ['rain'] }, whenText: 'ночью или в дождь', place: 'Синева',
    len: 14, kg: 3800, power: 1.4, hp: 120, coins: 90000, xp: 13000,
    clue: 'Ночные моряки видели в Синеве щупальца толще мачты.'
  },
  whale: {
    id: 'whale', name: 'Горбатый кит', loc: 'blue', zone: 'current', bait: 'whalebait', model: 'fauna-kit',
    when: { hours: [8, 17] }, whenText: 'днём', place: 'Течение',
    len: 15, kg: 30000, power: 1.3, hp: 105, coins: 70000, xp: 10000, gentle: true,
    clue: 'Днём киты кормятся у Течения: там, где плавают водоросли.'
  },
  serpent: {
    id: 'serpent', name: 'Морской змей', loc: 'keys', zone: 'arch', bait: 'serpentbait', model: 'beast-serpent',
    when: { hours: [17, 21] }, whenText: 'на закате', place: 'Арка',
    len: 13, kg: 1800, power: 1.2, hp: 90, coins: 55000, xp: 8000,
    clue: 'На закате у Арки вода закручивается кольцами — это он.'
  },
  rainbow: {
    id: 'rainbow', name: 'Радужный змей', loc: 'cascade', zone: 'pit', bait: 'rainbowbait', model: 'beast-serpent', tint: 'rainbow',
    when: { hours: [15, 18.5], wx: ['rain'] }, whenText: 'в дождь или под вечер, когда над Котлом стоит радуга', place: 'Котёл',
    len: 13, kg: 2100, power: 1.28, hp: 100, coins: 80000, xp: 12000,
    clue: 'Говорят, после дождя под радугой вода в Котле светится всеми цветами — это его чешуя.'
  },
  hozyain: {
    id: 'hozyain', name: 'Хозяин протоки', loc: 'mangrove', zone: 'pit', bait: 'hozyainbait', model: 'beast-som',
    when: { hours: [20, 3], wx: ['fog'] }, whenText: 'ночью, когда над протокой горят светлячки, или в тумане', place: 'Омут',
    len: 9, kg: 1500, power: 1.22, hp: 95, coins: 65000, xp: 9500,
    clue: 'Ночью в Омуте кто-то вздыхает так, что качает каноэ, и пускает пузыри размером с таз. Старики говорят — сом старше самих мангров.'
  },
  luna: {
    id: 'luna', name: 'Лунный призрак', loc: 'marina', zone: 'sea', bait: 'lunabait', model: 'beast-luna', tint: 'ghost',
    when: { hours: [22, 4.5] }, whenText: 'ночью, когда на море лежит лунная дорожка', place: 'Открытое море',
    len: 4.6, kg: 2000, power: 1.3, hp: 105, coins: 85000, xp: 12500,
    clue: 'Ночные яхтсмены рассказывают: за молом из воды поднимается круглая белая тень, большая, как луна, и светится изнутри.'
  },
  chudo: {
    id: 'chudo', name: 'Чудо-юдо рыба-кит', loc: 'bay', zone: 'sea', bait: 'chudobait', model: 'beast-chudo',
    when: { hours: [22, 4], wx: ['rain'] }, whenText: 'ночью или в дождь', place: 'Открытое море',
    len: 16, kg: 9000, power: 1.35, hp: 110, coins: 75000, xp: 11000,
    clue: 'Старики говорят: ночью и в дождь за островом из моря поднимается спина величиной с остров.'
  }
};
export const BEAST_LIST = Object.values(BEASTS);
/** Особые приманки: продаются на рынке, бросаются только в логово существа, тратятся за попытку. */
export const BEAST_BAITS = BEAST_LIST.map((b) => ({
  id: b.bait,
  name: `Приманка: ${b.name}`,
  price: Math.round(b.coins / 4 / 500) * 500,
  pack: 1,
  attract: 0,
  rare: 1,
  size: 1,
  beast: b.id,
  desc: `${b.place} (${locName(b.loc)}), ${b.whenText}. Бросать вдвоём: одному не удержать. ${b.clue}`
}));
function locName(id) {
  return { bay: 'Солнечная бухта', lake: 'Сосновое озеро', keys: 'Коралловые островки', blue: 'Синий простор', cascade: 'Водопадная чаша', mangrove: 'Мангровая протока', marina: 'Пальмовая марина' }[id] || id;
}
export const BEAST_BY_BAIT = Object.fromEntries(BEAST_LIST.map((b) => [b.bait, b]));

/** Подходит ли время и погода: h — часы (0…24), wx — погода (clear, cloudy, rain, fog). */
export function beastAwake(b, h, wx) {
  if (b.when.wx && b.when.wx.includes(wx)) return true;
  const [a, z] = b.when.hours;
  return a < z ? h >= a && h < z : h >= a || h < z;
}

// ── общий бой: числа для сервера и клиента ──
export const BEAST_K = {
  near: 60, // второй рыбак должен быть не дальше стольких метров от бросившего
  callT: 7, // столько секунд вода бурлит, прежде чем существо возьмёт приманку
  biteWindow: 12, // за столько секунд второй должен подсечь рядом
  hookR: 16, // на таком расстоянии от существа заброс считается «рядом»
  regain: 25, // сорвавшийся может подцепиться снова за столько секунд
  share: 0.5, // вклад одного рыбака: двое вместе тянут как один в обычном бою
  decay: 0.006, // доля шкалы в секунду, которую существо отыгрывает, когда никто не тянет
  lungeGap: [7, 11], // между рывками на одного из рыбаков
  lungeT: 2.6, // сколько длится рывок
  gaffAt: 0.93, // с этой доли — к борту, пора за багор
  gaffWin: 4, // двое должны ударить багром в пределах стольких секунд
  gaffWait: 30, // если за столько секунд не взяли — существо собирается с силами
  gaffBack: 0.25, // и отыгрывает столько шкалы
  outT: 900 // бой длиннее 15 минут — существо уходит само
};
