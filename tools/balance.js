// Проверка баланса: сколько монет в минуту приносит каждый набор снастей и как часто рвётся леска.
import { ITEMS, FISH_BY_ID, RARITY } from '../shared/data.js';
import { mulberry32, kitStats, newProfile, rollFish, biteDelay, botFight, fishValue, priceOf, xpFor } from '../shared/logic.js';

const TIERS = [
  { name: '1 старт, червь', eq: {}, tackle: 'worm', spots: [['pier', 2, 1], ['shallow', 1.5, 0], ['mid', 4, 0], ['backwater', 1.5, 0]] },
  { name: '1 старт, хлеб', eq: {}, tackle: 'bread', spots: [['shallow', 1.5, 0], ['backwater', 1.5, 0]] },
  { name: '2 рифовая+плетёнка, креветка', eq: { rod: 'rod2', line: 'line2', reel: 'reel2', hook: 'hook2' }, tackle: 'shrimp', spots: [['reef', 3, 0], ['mid', 5, 0], ['deep', 8, 0]] },
  { name: '2 рифовая, кукуруза в заводи', eq: { rod: 'rod2', line: 'line2', reel: 'reel2', hook: 'hook2' }, tackle: 'corn', spots: [['backwater', 2, 0]] },
  { name: '3 разведчик, блесна', eq: { rod: 'rod3', line: 'line2', reel: 'reel2', hook: 'hook2' }, tackle: 'spinner', spots: [['backwater', 2, 0], ['mid', 5, 0], ['deep', 8, 0]] },
  { name: '3 разведчик, живец', eq: { rod: 'rod3', line: 'line3', reel: 'reel3', hook: 'hook3' }, tackle: 'live', spots: [['backwater', 2, 0], ['deep', 9, 0]] },
  { name: '4 синь, креветка риф/водопад', eq: { rod: 'rod4', line: 'line3', reel: 'reel3', hook: 'hook3' }, tackle: 'shrimp', spots: [['reef', 3, 0], ['falls', 3, 0]] },
  { name: '5 закат, воблер водопад/глубь', eq: { rod: 'rod5', line: 'line3', reel: 'reel3', hook: 'hook3' }, tackle: 'wobbler', spots: [['falls', 3, 0], ['deep', 11, 0], ['reef', 4, 0]] },
  { name: '5 закат, кальмар глубь', eq: { rod: 'rod5', line: 'line4', reel: 'reel4', hook: 'hook4' }, tackle: 'squid', spots: [['deep', 12, 0]] },
  { name: '6 прилив, кальмар арка', eq: { rod: 'rod6', line: 'line4', reel: 'reel4', hook: 'hook4' }, tackle: 'squid', spots: [['arch', 10, 0]] },
  { name: '6 прилив, живец арка (косяк)', eq: { rod: 'rod6', line: 'line4', reel: 'reel4', hook: 'hook4' }, tackle: 'live', spots: [['arch', 10, 1]] },
  // ступени этапа 22
  { name: '6 прилив, краб арка', eq: { rod: 'rod6', line: 'line4', reel: 'reel4', hook: 'hook4' }, tackle: 'crab', spots: [['arch', 10, 0]] },
  { name: '7 звезда, краб арка', eq: { rod: 'rod7', line: 'line5', reel: 'reel5', hook: 'hook5' }, tackle: 'crab', spots: [['arch', 10, 0]] },
  { name: '8 волк, поппер море/арка', eq: { rod: 'rod8', line: 'line6', reel: 'reel6', hook: 'hook6' }, tackle: 'popper', spots: [['sea', 14, 0], ['arch', 10, 0]] },
  { name: '9 гроза, краб арка', eq: { rod: 'rod9', line: 'line6', reel: 'reel6', hook: 'hook6' }, tackle: 'crab', spots: [['arch', 10, 0]] },
  { name: '10 легенда, блесна мастера', eq: { rod: 'rod10', line: 'line7', reel: 'reel7', hook: 'hook6', float: 'float6' }, tackle: 'legendlure', spots: [['arch', 10, 0], ['sea', 14, 0]] },
  { name: '10 легенда, краб арка (косяк)', eq: { rod: 'rod10', line: 'line7', reel: 'reel7', hook: 'hook6', float: 'float6' }, tackle: 'crab', spots: [['arch', 10, 1]] },
  // Сосновое озеро
  { name: 'озеро 1 старт, червь', loc: 'lake', eq: {}, tackle: 'worm', spots: [['pier', 2, 0], ['shallow', 1.5, 0], ['deep', 9, 0]] },
  { name: 'озеро 2 рифовая, мотыль', loc: 'lake', eq: { rod: 'rod2', line: 'line2', reel: 'reel2', hook: 'hook2' }, tackle: 'bloodworm', spots: [['backwater', 2, 0], ['stones', 3, 0], ['deep', 9, 0]] },
  { name: 'озеро 3 разведчик, мушка', loc: 'lake', eq: { rod: 'rod3', line: 'line3', reel: 'reel3', hook: 'hook3' }, tackle: 'fly', spots: [['falls', 4, 0], ['stones', 3, 0]] },
  { name: 'озеро 5 закат, живец яма', loc: 'lake', eq: { rod: 'rod5', line: 'line4', reel: 'reel4', hook: 'hook4' }, tackle: 'live', spots: [['pit', 16, 0], ['falls', 4, 0]] },
  { name: 'озеро 10 легенда, блесна', loc: 'lake', eq: { rod: 'rod10', line: 'line7', reel: 'reel7', hook: 'hook6', float: 'float6' }, tackle: 'legendlure', spots: [['pit', 16, 0], ['falls', 4, 0], ['backwater', 2, 0]] },
  // Коралловые островки (с 5-го уровня)
  { name: 'остр. 1 старт, червь', loc: 'keys', eq: {}, tackle: 'worm', spots: [['pier', 3, 0], ['shallow', 1.5, 0], ['garden', 3, 0]] },
  { name: 'остр. 5 закат, креветка сад', loc: 'keys', eq: { rod: 'rod5', line: 'line3', reel: 'reel3', hook: 'hook3' }, tackle: 'shrimp', spots: [['garden', 3, 0], ['pier', 3, 0], ['mid', 4, 0]] },
  { name: 'остр. 6 прилив, живец протока/край', loc: 'keys', eq: { rod: 'rod6', line: 'line4', reel: 'reel4', hook: 'hook4' }, tackle: 'live', spots: [['channel', 6, 0], ['edge', 9, 0]] },
  { name: 'остр. 7 звезда, краб сад/край', loc: 'keys', eq: { rod: 'rod7', line: 'line5', reel: 'reel5', hook: 'hook5' }, tackle: 'crab', spots: [['garden', 3, 0], ['edge', 9, 0]] },
  { name: 'остр. 8 волк, поппер край/море', loc: 'keys', eq: { rod: 'rod8', line: 'line6', reel: 'reel6', hook: 'hook6' }, tackle: 'popper', spots: [['edge', 9, 0], ['sea', 14, 0]] },
  { name: 'остр. 10 легенда, блесна', loc: 'keys', eq: { rod: 'rod10', line: 'line7', reel: 'reel7', hook: 'hook6', float: 'float6' }, tackle: 'legendlure', spots: [['edge', 9, 0], ['sea', 14, 0], ['garden', 3, 0]] }
];
const N = Number(process.argv[2]) || 4000;
const rng = mulberry32(12345);
for (const tier of TIERS) {
  const p = newProfile();
  Object.assign(p.equip, tier.eq);
  for (const id of Object.values(tier.eq)) p.owned[id] = 1;
  const kit = kitStats(p);
  let time = 0, coins = 0, xp = 0, landed = 0, snap = 0, esc = 0, legends = 0, fightT = 0;
  const byRar = [0, 0, 0, 0, 0];
  for (let i = 0; i < N; i++) {
    const [zone, depth, hot] = tier.spots[i % tier.spots.length];
    const hour = 6 + ((i * 7) % 24) * 0.9;
    const spot = { zone, depth, pier: zone === 'pier', hot: !!hot };
    const d = biteDelay(spot, tier.tackle, hour % 24, kit, rng);
    const lure = ITEMS[tier.tackle].cat === 'lure';
    time += 2.5 + d.t * (lure ? 2 : 1) + 0.5;
    if (rng() < 0.12) { time += 1; if (!lure) coins -= ITEMS[tier.tackle].price; continue; } // прозевали
    const c = rollFish(spot, tier.tackle, hour % 24, rng, tier.loc, kit);
    if (!lure) coins -= ITEMS[tier.tackle].price;
    const r = botFight(c, kit, rng, 0.8);
    time += r.t + 3;
    fightT += r.t;
    if (r.result === 'landed') {
      landed++;
      coins += fishValue(c, null) * 1.03;
      xp += xpFor(c);
      if (!c.junk) { byRar[FISH_BY_ID[c.sp].rar]++; if (FISH_BY_ID[c.sp].rar === 4) legends++; }
    } else if (r.result === 'snap') { snap++; if (lure) coins -= priceOf(tier.tackle) * 0; } else esc++;
  }
  const min = time / 60;
  console.log(`${tier.name.padEnd(34)} ${String(Math.round(coins / min)).padStart(5)} мон/мин  ${String(Math.round(xp / min)).padStart(4)} оп/мин  заброс ${(time / N).toFixed(1)}с  бой ${(fightT / N).toFixed(1)}с  поймано ${Math.round((landed / N) * 100)}%  обрыв ${Math.round((snap / N) * 100)}%  сход ${Math.round((esc / N) * 100)}%  леска ${kit.lineKg.toFixed(1)}кг  [${byRar.map((n) => ((n / N) * 100).toFixed(1)).join(' ')}]`);
}

// отдельные поединки: рыба × набор × мастерство
console.log('\nПоединки (поймано% / обрыв% / сход% / сек) при мастерстве 0.5 и 0.85');
const DUELS = [
  ['bychok', 0.15, {}], ['okun', 0.6, {}], ['kefal', 1.6, {}], ['karp', 3, {}], ['karp', 6, {}], ['shuka', 5, {}],
  ['karp', 6, { rod: 'rod2', line: 'line2' }], ['shuka', 6, { rod: 'rod3', line: 'line2' }], ['som', 15, { rod: 'rod3', line: 'line3' }], ['som', 30, { rod: 'rod4', line: 'line3', reel: 'reel3' }],
  ['tunec', 30, { rod: 'rod5', line: 'line3', reel: 'reel3' }], ['tunec', 60, { rod: 'rod6', line: 'line4', reel: 'reel4' }], ['mech', 90, { rod: 'rod6', line: 'line4', reel: 'reel4' }], ['starik', 130, { rod: 'rod6', line: 'line4', reel: 'reel4' }], ['mech', 90, { rod: 'rod5', line: 'line3', reel: 'reel3' }]
];
for (const [sp, w, eq] of DUELS) {
  const p = newProfile();
  Object.assign(p.equip, eq);
  const kit = kitStats(p);
  const row = [];
  let rho = 0;
  for (const skill of [0.5, 0.85]) {
    let L = 0, S = 0, E = 0, T = 0;
    const M = 400;
    for (let i = 0; i < M; i++) {
      const r = botFight({ sp, w }, kit, rng, skill);
      rho = r.rho;
      T += r.t;
      if (r.result === 'landed') L++; else if (r.result === 'snap') S++; else E++;
    }
    row.push(`${Math.round((L / M) * 100)}/${Math.round((S / M) * 100)}/${Math.round((E / M) * 100)} ${(T / M).toFixed(1)}с`);
  }
  console.log(`${(FISH_BY_ID[sp].name + ' ' + w + 'кг').padEnd(22)} ${(eq.rod || 'rod1').padEnd(5)} леска ${kit.lineKg.toFixed(1).padStart(5)}  rho ${rho.toFixed(2)}   ${row.join('   |   ')}`);
}
