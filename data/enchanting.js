// Зачарование (v107): распыление вещей на материалы и чары за материалы — как в WoW.
// Распылять и зачаровывать можно где угодно; нужен жезл чародея в сумке (делают в Мастерской чар из медных слитков).
// Материалы — стопками. Ярус по уровню вещи: 1 — до 10-го, 2 — с 11-го. Белые вещи не распыляются (их продают).

/** Материалы: name, price (медь за штуку у торговца), col — цвет искры и значка. */
export const ENCH_MATS = {
  dust1:   { name: 'Тусклая пыль',          price: 6,  rar: 'common', col: '#c8a8e8', d: 'Пыль от зелёных вещей до 10-го уровня' },
  dust2:   { name: 'Мерцающая пыль',        price: 14, rar: 'common', col: '#8ab8ff', d: 'Пыль от зелёных вещей с 11-го уровня' },
  shard1:  { name: 'Малый осколок сияния',  price: 30, rar: 'good',   col: '#d070ff', d: 'Осколок от синих вещей до 10-го уровня' },
  shard2:  { name: 'Осколок сияния',        price: 60, rar: 'rare',   col: '#6ad0ff', d: 'Осколок от синих вещей с 11-го уровня' },
  crystal: { name: 'Кристалл бездны',       price: 200, rar: 'epic',  col: '#b46aff', d: 'Кристалл от фиолетовых вещей' },
};

/** Что выходит при распылении: по цвету вещи и ярусу (T — 1 или 2). [материал, от, до, шанс]. */
export const DISENCHANT = {
  good: T => [[`dust${T}`, 2, 4, 1], [`shard${T}`, 1, 1, 0.08]],
  rare: T => [[`shard${T}`, 1, 1, 1], [`dust${T}`, 1, 2, 0.5]],
  epic: T => [['crystal', 1, 1, 1], [`shard${T}`, 1, 2, 1]],
};
/** Распыление тоже растит навык: «нужный навык» вещи — 1 для яруса 1 и 50 для яруса 2 (цвет — как у рецептов). */
export const DE_REQ = { 1: 1, 2: 50 };

/** Рецепты чар. slot — куда; req — навык; mats; bonus — что даёт (main — главная характеристика, stam — выносливость,
 *  crit/haste/regen/dodge — как свойства вещей). На вещи одни чары: новые заменяют прежние. */
export const ENCHANTS = {
  w_power1: { name: 'Малая сила удара',     slot: 'weapon', req: 1,   mats: { dust1: 2 },                bonus: { main: 2 } },
  c_hp1:    { name: 'Малое здоровье',       slot: 'chest',  req: 1,   mats: { dust1: 2 },                bonus: { stam: 4 } },
  l_main1:  { name: 'Малая мощь',           slot: 'legs',   req: 15,  mats: { dust1: 3 },                bonus: { main: 2 } },
  h_hp1:    { name: 'Малая стойкость',      slot: 'head',   req: 25,  mats: { dust1: 3 },                bonus: { stam: 4 } },
  n_crit1:  { name: 'Меткость',             slot: 'neck',   req: 40,  mats: { dust1: 2, shard1: 1 },     bonus: { crit: 1 } },
  r_haste1: { name: 'Проворство',           slot: 'ring',   req: 40,  mats: { dust1: 2, shard1: 1 },     bonus: { haste: 1.5 } },
  w_power2: { name: 'Сила удара',           slot: 'weapon', req: 60,  mats: { dust1: 4, shard1: 1 },     bonus: { main: 4 } },
  c_hp2:    { name: 'Здоровье',             slot: 'chest',  req: 70,  mats: { dust2: 2 },                bonus: { stam: 8 } },
  l_main2:  { name: 'Мощь',                 slot: 'legs',   req: 85,  mats: { dust2: 3 },                bonus: { main: 4 } },
  h_hp2:    { name: 'Стойкость',            slot: 'head',   req: 90,  mats: { dust2: 3 },                bonus: { stam: 7 } },
  c_regen:  { name: 'Живучесть',            slot: 'chest',  req: 100, mats: { dust2: 2, shard2: 1 },     bonus: { regen: 1.5 } },
  w_fury:   { name: 'Ярость',               slot: 'weapon', req: 100, mats: { dust2: 4, shard2: 1 },     bonus: { main: 3, crit: 2 } },
  n_crit2:  { name: 'Зоркость',             slot: 'neck',   req: 110, mats: { dust2: 2, shard2: 1 },     bonus: { crit: 2 } },
  r_haste2: { name: 'Стремительность',      slot: 'ring',   req: 110, mats: { dust2: 2, shard2: 1 },     bonus: { haste: 3 } },
  l_dodge:  { name: 'Ловкость ног',         slot: 'legs',   req: 120, mats: { dust2: 4, shard2: 1 },     bonus: { main: 3, dodge: 1.5 } },
  c_hp3:    { name: 'Могучее здоровье',     slot: 'chest',  req: 130, mats: { dust2: 4, shard2: 2 },     bonus: { stam: 13 } },
  w_abyss:  { name: 'Мощь бездны',          slot: 'weapon', req: 140, mats: { crystal: 1, shard2: 2 },   bonus: { main: 8 } },
};
export const ENCH = {
  cap: 150,
  rodBars: 10,                // жезл чародея: столько медных слитков
  colors: [[25, 'orange', 1], [50, 'yellow', 0.6], [75, 'green', 0.25], [Infinity, 'gray', 0]],
  slots: ['weapon', 'head', 'chest', 'legs', 'neck', 'ring'],
};
