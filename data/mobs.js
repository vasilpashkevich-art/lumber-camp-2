// Виды мобов. Числа — множители к базе уровня из balance.js (MOBL).
// trait — особенность поведения, её обрабатывает systems/ai.js:
//   pack    — зовёт своих из лагеря, когда его бьют
//   charge  — с разбега бросается на героя, удар сильнее
//   poison  — укус травит и замедляет
//   ranged  — стреляет издалека и держит дистанцию
//   flee    — при малом здоровье пытается убежать
//   smash   — элитный: раз в несколько секунд мощный удар по площади (видно, куда ударит)

export const MOBS = {
  fox: {
    name: 'Голодная лиса', art: 'fox', r: 13,
    hp: 0.75, dmg: 0.75, speed: 158, reach: 30, cd: 1.4,
    trait: 'flee', gold: 0.7,
  },
  wolf: {
    name: 'Серый волк', art: 'wolf', r: 15,
    hp: 0.9, dmg: 1.0, speed: 166, reach: 32, cd: 1.5,
    trait: 'pack', gold: 0.8,
  },
  boar: {
    name: 'Лесной кабан', art: 'boar', r: 17,
    hp: 1.25, dmg: 1.05, speed: 135, reach: 34, cd: 1.7,
    trait: 'charge', gold: 0.9,
  },
  spider: {
    name: 'Лесной паук', art: 'spider', r: 15,
    hp: 0.85, dmg: 0.8, speed: 148, reach: 30, cd: 1.3,
    trait: 'poison', gold: 0.9,
  },
  bandit: {
    name: 'Молодой разбойник', art: 'bandit', r: 14,
    hp: 1.05, dmg: 1.1, speed: 153, reach: 36, cd: 1.6,
    trait: 'pack', gold: 1.6, humanoid: true,
  },
  bandit_archer: {
    name: 'Разбойник-стрелок', art: 'bandit_archer', r: 14,
    hp: 0.8, dmg: 0.95, speed: 148, reach: 300, cd: 2.0,
    trait: 'ranged', gold: 1.6, humanoid: true,
  },
  ataman: {
    name: 'Атаман Рваное Ухо', art: 'ataman', r: 20, rare: true,
    hp: 4.5, dmg: 1.5, speed: 158, reach: 44, cd: 1.6,
    trait: 'smash', gold: 6, humanoid: true,
    smash: { every: 6, wind: 1.1, r: 110, mul: 2.4 },
  },
  // ---- Хуторские угодья
  dog: {
    name: 'Дикий пёс', art: 'dog', r: 14,
    hp: 0.85, dmg: 1.0, speed: 168, reach: 30, cd: 1.3,
    trait: 'pack', gold: 1.0,
  },
  crow: {
    name: 'Чёрная ворона', art: 'crow', r: 11, flying: true,
    hp: 0.55, dmg: 0.7, speed: 175, reach: 34, cd: 1.1,
    trait: 'pack', gold: 0.5,
  },
  scarecrow: {
    name: 'Ожившее пугало', art: 'scarecrow', r: 15,
    hp: 1.5, dmg: 1.35, speed: 95, reach: 40, cd: 1.9,
    trait: 'dormant', wake: 95, gold: 1.1,
  },
  bull: {
    name: 'Бешеный бык', art: 'bull', r: 22,
    hp: 1.7, dmg: 1.25, speed: 135, reach: 40, cd: 1.9,
    trait: 'charge', gold: 1.2,
  },
  robber: {
    name: 'Грабитель', art: 'robber', r: 15,
    hp: 1.15, dmg: 1.15, speed: 155, reach: 36, cd: 1.5,
    trait: 'pack', gold: 1.8, humanoid: true,
  },
  firestarter: {
    name: 'Поджигатель', art: 'firestarter', r: 14,
    hp: 0.9, dmg: 0.9, speed: 150, reach: 260, cd: 2.2,
    trait: 'ranged', shot: 'fire', burn: 0.35, gold: 1.8, humanoid: true,
  },
  miller: {
    name: 'Мельник-колдун', art: 'miller', r: 19, rare: true,
    hp: 5, dmg: 1.4, speed: 115, reach: 300, cd: 2.0,
    trait: 'caster', summon: { kind: 'crow', n: 2, every: 11 }, gold: 7, humanoid: true,
  },
};
