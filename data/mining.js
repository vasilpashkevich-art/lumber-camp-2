// Горное дело (v61): руды, навык по цветам как в WoW, жилы, плавка, кирка.
export const ORES = {
  copper: { ore: 'Медная руда', bar: 'Медный слиток', vein: 'Медная жила', req: 1, oreP: 3, barP: 8 },
  tin:    { ore: 'Оловянная руда', bar: 'Оловянный слиток', vein: 'Оловянная жила', req: 50, oreP: 5, barP: 13 },
};
export const MINE = {
  cap: 100,                   // потолок навыка (позже поднимут учителя)
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
