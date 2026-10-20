// Алхимия (v84): рецепты зелий из трав и пустой склянки. Навык по цветам как у трав (цвет рецепта — по навыку).
// Зелья двух родов: боевое (`battle`) и защитное (`guard`) — действует по одному каждого рода, новое заменяет прежнее.
// Лечебное зелье варится в обычные зелья здоровья (клавиша Q). Продать зелье можно дешевле, чем стоят травы, — варят для себя.
export const POTIONS = {
  heal:     { name: 'Зелье здоровья', req: 1, mats: { silverleaf: 1 }, heal: true, col: '#d8323a', d: 'Такое же, как на рынке: +40% здоровья, снимает яд. Идёт в запас зелий (Q).' },
  strength: { name: 'Зелье силы', req: 1, mats: { silverleaf: 2 }, kind: 'battle', dur: 300, dmg: 0.10, price: 6, col: '#e05030', d: 'Удары и умения на 10% сильнее. 5 минут.' },
  stone:    { name: 'Зелье стойкости', req: 25, mats: { silverleaf: 3 }, kind: 'guard', dur: 300, taken: 0.10, price: 8, col: '#8a8a9a', d: 'Урон по вам на 10% меньше. 5 минут.' },
  swift:    { name: 'Зелье скорости', req: 50, mats: { wormwood: 2 }, kind: 'guard', dur: 180, speed: 0.25, price: 10, col: '#4ac8e8', d: 'Бег на четверть быстрее. 3 минуты.' },
  hunter:   { name: 'Зелье охотника', req: 75, mats: { wormwood: 2, silverleaf: 1 }, kind: 'battle', dur: 300, crit: 5, price: 12, col: '#e8b030', d: 'Крит +5%. 5 минут.' },
  wisdom:   { name: 'Зелье мудрости', req: 100, mats: { glowcap: 2 }, kind: 'guard', dur: 600, xp: 0.10, price: 14, col: '#a070ff', d: 'Опыта за врагов на 10% больше. 10 минут.' },
  bogskin:  { name: 'Зелье болотной кожи', req: 135, mats: { bogweed: 2, glowcap: 1 }, kind: 'guard', dur: 300, taken: 0.18, price: 24, col: '#5a8a4a', d: 'Урон по вам на 18% меньше. 5 минут.' },   // v136
  fire:     { name: 'Эликсир огнецвета', req: 125, mats: { fireflower: 1, glowcap: 2 }, kind: 'battle', dur: 180, dmg: 0.20, crit: 10, price: 40, col: '#ff7a20', d: 'Удары на 20% сильнее и крит +10%. 3 минуты.' },
};
export const KIND_NAME = { battle: 'боевое', guard: 'защитное' };
export const ALCH = {
  cap: 150,
  flaskPrice: 5,              // пустая склянка у любого торговца, медь
  flaskSell: 2,
  colors: [[25, 'orange', 1], [50, 'yellow', 0.6], [75, 'green', 0.25], [Infinity, 'gray', 0]],
};
