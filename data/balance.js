// Баланс: кривая опыта, рост героя и мобов, добыча, таймеры.
// Все числа игры, которые хочется крутить, — здесь.

export const MAX_LVL = 50;

// Множитель трудности по десяткам уровней: 1–9 легко, 10–19 заметно тяжелее и т.д.
const SEG = [1, 2.5, 5, 9, 15];

/** Сколько опыта нужно, чтобы с уровня L перейти на L+1. */
export function xpNeed(L) {
  if (L >= MAX_LVL) return Infinity;
  return Math.round(130 * Math.pow(L, 1.7) * SEG[Math.min(4, Math.floor(L / 10))]);
}

/** Цвет уровня моба относительно героя (как в WoW). */
export function lvlColor(mobL, heroL) {
  const d = mobL - heroL;
  if (d >= 5) return '#ff3b30';      // красный — очень опасно
  if (d >= 3) return '#ff8a2a';      // оранжевый
  if (d >= -2) return '#f5e05a';     // жёлтый — по силам
  if (d >= grayGap(heroL)) return '#5fd35f'; // зелёный — легко
  return '#9a9a9a';                  // серый — опыта нет
}
const grayGap = L => -(L < 10 ? 5 : L < 20 ? 6 : 8);

/** Опыт за убийство моба. Серые мобы опыта не дают, мобы выше уровнем — больше. */
export function xpKill(mobL, heroL, mul = 1) {
  const d = mobL - heroL;
  if (d < grayGap(heroL)) return 0;
  const base = 8 + 6 * mobL;
  const k = d >= 0 ? 1 + 0.08 * Math.min(d, 5) : Math.max(0.2, 1 + d * 0.15);
  return Math.max(1, Math.round(base * k * mul));
}

// --- герой
export const HERO = {
  hp: L => 90 + 18 * (L - 1),           // здоровье без вещей
  power: L => 6 + 1.6 * (L - 1),        // сила удара без оружия
  speed: 190,                           // бег, единиц в секунду
  regenOut: 0.012,                      // доля здоровья в секунду вне боя (через 5 с)
  regenCity: 0.06,                      // в столице
  outOfCombat: 5,                       // через сколько секунд без боя начинается отдых
  deathWeak: 30,                        // секунд слабости после возрождения
  deathWeakMul: 0.7,                    // урон во время слабости
};

/** Снижение урона от брони: 0..0.75 */
export const armorCut = (armor, L) => Math.min(0.75, armor / (armor + 45 + 12 * L));

// --- мобы: база по уровню, умножается на коэффициенты вида
export const MOBL = {
  hp: L => 66 * Math.pow(1.22, L - 1),     // v55: +20%
  dmg: L => 5.76 * Math.pow(1.17, L - 1),  // v55: +20%
  armor: L => 4 * L,
};

// --- возрождение мобов, секунды
export const RESPAWN = { normal: 360, rare: 1200 };
export const LEASH = 650;       // дальше этого от дома моб бросает погоню
export const AGGRO = 170;       // радиус, на котором моб замечает героя (того же уровня)

// --- добыча
export const LOOT = {
  goldMin: 0.25, goldMax: 0.7,                 // монеты (в меди) = уровень моба × случайно
  corpseT: 180,                                // сколько лежит тело с добычей, секунд
  lootR: 70,                                   // с какого расстояния можно обыскать тело
  // какие вещи падают — задаёт зона (zones.js → loot), здесь только запас на случай, если зона не задала
  itemChance: 0.07,
  rarity: [['common', 1]],
  rareMobRarity: [['good', 80], ['rare', 20]],
  bag: 24,                                     // мест в сумке
  potionHeal: 0.4, potionCd: 20,
  sitRegen: 0.04,                              // доля здоровья в секунду сидя (X)
};
export const RAR_MUL = { start: 0.8, common: 1, good: 1.15, rare: 1.32, epic: 1.55 };
export const RAR_IDX = { start: 0, common: 1, good: 2, rare: 3, epic: 4 };
export const RAR_COL = { start: '#c8b898', common: '#e9dfc8', good: '#5fd35f', rare: '#4a9eff', epic: '#b46aff' };
export const RAR_NAME = { start: 'Начальная', common: 'Обычная', good: 'Необычная', rare: 'Редкая', epic: 'Эпическая' };
