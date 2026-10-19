// Ювелирное дело (v131): огранка камней, кольца и шеи из слитков, ремесленные аксессуары. Учит ювелир Златан в Ювелирной мастерской
// (Столица, Ремесленный квартал), бесплатно. Делать можно где угодно, инструмента не нужно. Навык 1–150, цвета как у остальных профессий.
// Рецепты: k — что выходит ('gem' — огранённый камень в стопку, 'item' — кольцо/шея по классу героя, 'trinket' — аксессуар);
// mats — [вид стопки, что, сколько]; req — навык; у 'item' — slot, ilvl, rar; у 'trinket' — trinket (id из TRINKETS), ilvl.
export const JEWEL = {
  cap: 150,
  colors: [[25, 'orange', 1], [50, 'yellow', 0.6], [75, 'green', 0.25], [Infinity, 'gray', 0]],
};
export const JEWEL_RECIPES = {
  // огранка (v132): один камень и много слитков → камень сильнее (решение Василия 19.10: камней по минимуму, слитков больше)
  cut_tiger:  { k: 'gem', out: 'tiger_cut',  name: 'Огранённый тигровый глаз', req: 1,   mats: [['gem', 'tigerseye', 1], ['bar', 'copper', 5]], d: '+5 к главной характеристике в гнезде' },
  cut_ameth:  { k: 'gem', out: 'ameth_cut',  name: 'Огранённый аметист',       req: 20,  mats: [['gem', 'amethyst', 1], ['bar', 'tin', 4]],    d: '+10 к выносливости в гнезде' },
  sunstone:   { k: 'gem', out: 'sunstone',   name: 'Солнечный камень',         req: 50,  mats: [['gem', 'tigerseye', 1], ['bar', 'tin', 5], ['bar', 'copper', 5]], d: '+3 к главной характеристике и +5 к выносливости' },
  cut_emer:   { k: 'gem', out: 'emer_cut',   name: 'Огранённый изумруд',       req: 60,  mats: [['gem', 'emerald', 1], ['bar', 'iron', 4]],   d: '+3% к криту в гнезде' },
  stormgem:   { k: 'gem', out: 'stormgem',   name: 'Грозовой камень',          req: 75,  mats: [['gem', 'emerald', 1], ['bar', 'tin', 6], ['bar', 'iron', 2]], d: '+2% к криту и +2% к скорости удара' },
  bloodstone: { k: 'gem', out: 'bloodstone', name: 'Кровавик',                 req: 100, mats: [['gem', 'emerald', 1], ['gem', 'amethyst', 1], ['bar', 'iron', 8]], d: '+6 к главной характеристике и +6 к выносливости' },
  // украшения: из слитков, по классу героя; не лучше того, что продают торговцы, зато своё и сразу
  ring_copper: { k: 'item', slot: 'ring', ilvl: 6,  rar: 'good', name: 'Медное кольцо',       req: 1,   mats: [['bar', 'copper', 6]], d: 'Зелёное кольцо 6-го уровня' },
  neck_copper: { k: 'item', slot: 'neck', ilvl: 7,  rar: 'good', name: 'Медное ожерелье',     req: 10,  mats: [['bar', 'copper', 8], ['gem', 'tigerseye', 1]], d: 'Зелёная шея 7-го уровня' },
  ring_tin:    { k: 'item', slot: 'ring', ilvl: 11, rar: 'good', name: 'Оловянное кольцо',    req: 30,  mats: [['bar', 'tin', 6], ['gem', 'tigerseye', 1]], d: 'Зелёное кольцо 11-го уровня' },
  neck_tin:    { k: 'item', slot: 'neck', ilvl: 12, rar: 'good', name: 'Оловянное ожерелье',  req: 45,  mats: [['bar', 'tin', 8], ['gem', 'amethyst', 1]], d: 'Зелёная шея 12-го уровня' },
  ring_iron:   { k: 'item', slot: 'ring', ilvl: 15, rar: 'rare', name: 'Железное кольцо',     req: 90,  mats: [['bar', 'iron', 8], ['gem', 'emerald', 1]], d: 'Синее кольцо 15-го уровня' },
  neck_iron:   { k: 'item', slot: 'neck', ilvl: 16, rar: 'rare', name: 'Железное ожерелье',   req: 110, mats: [['bar', 'iron', 10], ['gem', 'emerald', 1]], d: 'Синяя шея 16-го уровня, с гнездом' },
  // аксессуары ювелира (синие, только отсюда)
  amber:    { k: 'trinket', trinket: 'amber',    ilvl: 12, name: 'Янтарный талисман',      req: 80,  mats: [['bar', 'tin', 10], ['gem', 'tiger_cut', 1]], d: 'Лечит за убийство врага' },
  bell:     { k: 'trinket', trinket: 'bell',     ilvl: 14, name: 'Серебряный колокольчик', req: 110, mats: [['bar', 'iron', 10], ['gem', 'stormgem', 1]], d: 'Звон замедляет врагов вокруг' },
  obsidian: { k: 'trinket', trinket: 'obsidian', ilvl: 16, name: 'Обсидиановый глаз',      req: 130, mats: [['bar', 'iron', 14], ['gem', 'bloodstone', 1]], d: 'После умения — удары быстрее' },
};
/** Сколько секунд делается одна штука (v112, как у других профессий). */
export const JEWEL_TIME = { gem: 3, item: 5, trinket: 8 };
