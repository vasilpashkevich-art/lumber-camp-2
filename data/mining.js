// Горное дело (v61): руды, навык по цветам как в WoW, жилы, плавка, кирка.
export const ORES = {
  copper: { ore: 'Медная руда', bar: 'Медный слиток', vein: 'Медная жила', req: 1, oreP: 3, barP: 8 },
  tin:    { ore: 'Оловянная руда', bar: 'Оловянный слиток', vein: 'Оловянная жила', where: 'Хуторские угодья, Грибной лес', req: 50, oreP: 5, barP: 13, gems: [['tigerseye', 0.08], ['amethyst', 0.02]] },
  // v65: железо в Грибном лесу — с навыка 100; изумруд падает только с железа
  iron:   { ore: 'Железная руда', bar: 'Железный слиток', vein: 'Железная жила', where: 'Грибной лес', req: 100, oreP: 8, barP: 21, gems: [['tigerseye', 0.06], ['amethyst', 0.03], ['emerald', 0.03]] },
};
// самоцветы (v62): с жил посильнее меди, вместе 10%; пока только на продажу, позже — огранка и гнёзда в вещах
export const GEMS = {
  tigerseye: { name: 'Тигровый глаз', price: 40, col: '#d8a040' },
  amethyst:  { name: 'Аметист', price: 100, col: '#a86ad8' },
  emerald:   { name: 'Изумруд', price: 250, col: '#3ac878' },
};
export const MINE = {
  cap: 150,                   // потолок навыка (v65: железо поднимает до 150)
  time: 3,                    // секунд копать одну жилу
  ore: [2, 3],                // руды с жилы (горное дело — приработок: 50–65% денег от охоты за то же время)
  respawn: [300, 600],        // через сколько жила появится снова (в другом месте области), с
  reach: 64,                  // с какого расстояния можно копать
  smelt: 2,                   // руды на слиток
  pickPrice: 50,              // кирка у Гильдии рудокопов, медь
  // цвет жилы по навыку: насколько навык выше нужного → шанс +1 к навыку
  colors: [[25, 'orange', 1], [50, 'yellow', 0.6], [75, 'green', 0.25], [Infinity, 'gray', 0]],
  colorHex: { red: '#ff4a3a', orange: '#ff8a2a', yellow: '#ffd34d', green: '#5fd35f', gray: '#9a9a9a' },
};
/** Цвет жилы для навыка: red — рано, orange/yellow/green — растёт, gray — уже не растёт. */
export function veinColor(skill, req) {
  if (skill < req) return { c: 'red', chance: 0 };
  const d = skill - req; for (const [lim, c, chance] of MINE.colors) if (d < lim) return { c, chance };
  return { c: 'gray', chance: 0 };
}
